
import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { MaritalStatus, EmployeeType, Employee, SkillSet, Director, Actor, FamilyTraining, RelationshipInteraction } from '../../../types';
import { RELATIONSHIP_INTERACTIONS, WEDDING_PACKAGES, ENGAGEMENT_RINGS, PARTNER_SEARCH_OPTIONS, PARTNER_JOB_DEFINITIONS, PARTNER_TRAITS, maleFirstNames, femaleFirstNames, femaleLastNames, ALL_PROPERTIES, CHILD_INTERACTIONS, ACQUAINTANCE_INTERACTIONS } from '../../privateLifeData';
import { generateSingleEmployee } from '../../employeeGenerator';
import { WEDDING_DAY_EVENT } from '../../events';
import { ALL_MALE_PORTRAITS, ALL_FEMALE_PORTRAITS, PLAYER_MALE_PORTRAITS, PLAYER_FEMALE_PORTRAITS } from '../../portraits';
import { useTranslation } from '../../../hooks/useTranslation';
import PartnerProfile from './PartnerProfile';
import ChildProfile from './ChildProfile';
import StarIcon from '../../icons/StarIcon';
import HeartIcon from '../../icons/HeartIcon';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';

// Helper to get random portrait
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate random skills based on job/background
const generateInitialSkills = (job: string): SkillSet => {
    // Base skills
    const skills: SkillSet = {
        acting: Math.floor(Math.random() * 20),
        directing: Math.floor(Math.random() * 20),
        writing: Math.floor(Math.random() * 20),
        scouting: Math.floor(Math.random() * 20),
        research: Math.floor(Math.random() * 20),
        marketing: Math.floor(Math.random() * 20),
        planning: Math.floor(Math.random() * 20),
    };

    // Bonus based on job (simple mapping)
    if (job.includes('Künstler') || job.includes('Musiker') || job.includes('Artist') || job.includes('Musician')) {
        skills.acting += 20;
        skills.writing += 15;
    } else if (job.includes('Unternehmer') || job.includes('Anwalt') || job.includes('CEO') || job.includes('Investment') || job.includes('Entrepreneur') || job.includes('Lawyer')) {
        skills.planning += 25;
        skills.marketing += 20;
    } else if (job.includes('Lehrer') || job.includes('Journalist') || job.includes('Teacher')) {
        skills.research += 25;
        skills.writing += 20;
    } else if (job.includes('Model') || job.includes('Schauspiel') || job.includes('Actor')) {
        skills.acting += 30;
        skills.marketing += 10;
    }

    // Clamp to 100
    Object.keys(skills).forEach(key => {
        skills[key as keyof SkillSet] = Math.min(100, skills[key as keyof SkillSet]);
    });

    return skills;
};

// Helper to calculate portrait URL based on age
const getPortraitUrl = (baseId: string | undefined | null, birthDate: Date | undefined, gameDate: Date): string | null => {
    if (!baseId) return null;
    
    // FIX: Support Custom Images (Base64)
    if (baseId.startsWith('data:')) {
        return baseId;
    }

    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    let ageSuffix: 'k' | 'j' | 'm' | 'a';
    if (age <= 15) {
        ageSuffix = 'k';
    } else if (age >= 16 && age <= 34) {
        ageSuffix = 'j';
    } else if (age >= 35 && age <= 59) {
        ageSuffix = 'm';
    } else { // age >= 60
        ageSuffix = 'a';
    }
    
    return `./portrait/${baseId}${ageSuffix}.png`;
};

// Helper for Child Portraits
const getChildPortraitUrl = (portraitId: string | undefined, birthDate: Date, gameDate: Date): string | null => {
    if (!portraitId) return null;
    
    // FIX: Support Custom Images (Base64)
    if (portraitId.startsWith('data:')) {
        return portraitId;
    }

    // Baby Stage (ID starts with 'b')
    if (portraitId.startsWith('b') && !portraitId.startsWith('baby_')) { 
        return `https://www.schnoxcore.com/media/kinder/babys/${portraitId}.png`;
    }
    // Toddler Stage (ID starts with '1j')
    if (portraitId.startsWith('1j')) {
        return `https://www.schnoxcore.com/media/kinder/1jahr/${portraitId}.png`;
    }

    // Dynamic stages
    return getPortraitUrl(portraitId, birthDate, gameDate);
};

// Pseudo-random number generator for deterministic shuffling based on seed
const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const shuffleArray = <T,>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const VitalityStars: React.FC<{ modifier: number; label: string }> = ({ modifier, label }) => {
    const absMod = Math.abs(modifier);
    let stars = 0.5; // Minimum 0.5 stars
    
    if (absMod >= 20) stars = 3;
    else if (absMod >= 15) stars = 2.5;
    else if (absMod >= 10) stars = 2;
    else if (absMod >= 5) stars = 1;
    else if (absMod > 0) stars = 0.5;
    else stars = 0; // No effect

    if (stars === 0) return <span className="text-[10px] text-gray-500">-</span>;

    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;
    const colorClass = modifier > 0 ? "text-green-400" : "text-red-400";
    const starColor = "text-yellow-400";

    return (
        <div className="flex items-center gap-0.5">
            <span className={`text-[9px] uppercase font-bold ${colorClass}`}>{label}</span>
            <div className="flex items-center">
                {Array.from({ length: fullStars }).map((_, i) => (
                    <StarIcon key={i} className={`w-2.5 h-2.5 ${starColor}`} />
                ))}
                {hasHalfStar && (
                    <div className="relative w-2.5 h-2.5">
                         <StarIcon className="w-2.5 h-2.5 text-gray-600 absolute top-0 left-0" />
                         <div className="w-1.25 h-2.5 overflow-hidden absolute top-0 left-0">
                            <StarIcon className="w-2.5 h-2.5 text-yellow-400" />
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export const RelationshipsTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    
    // View State
    const [activeProfileId, setActiveProfileId] = useState<string>('partner');

    // Dating States
    const [potentialPartner, setPotentialPartner] = useState<{name: string, gender: 'männlich' | 'weiblich', job: string, salary: number, traits: string[], portraitId: string} | null>(null);
    const [datingSearchError, setDatingSearchError] = useState<string | null>(null);
    const [relationshipFeedback, setRelationshipFeedback] = useState<string | null>(null);
    const [pendingSearchOption, setPendingSearchOption] = useState<typeof PARTNER_SEARCH_OPTIONS[0] | null>(null);

    // Modals & Partner Action States
    const [showBreakupConfirm, setShowBreakupConfirm] = useState(false);
    const [proposalResult, setProposalResult] = useState<'accepted' | 'rejected' | null>(null);
    const [isPlanningWedding, setIsPlanningWedding] = useState(false);
    const [isProposing, setIsProposing] = useState(false);
    const [selectedRingId, setSelectedRingId] = useState(ENGAGEMENT_RINGS[0].id);
    const [selectedPackageId, setSelectedPackageId] = useState(WEDDING_PACKAGES[0].id);
    const [prenupActive, setPrenupActive] = useState(false);
    const [selectedSurnameId, setSelectedSurnameId] = useState<'player' | 'partner' | 'hyphenated-player' | 'hyphenated-partner'>('player');
    const [selectedWeddingDateStr, setSelectedWeddingDateStr] = useState<string>(''); // ISO String of selected date

    if (!playerData) return null;

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    // Calculate Availability
    const lastSearch = playerData.lastPartnerSearchDate ? new Date(playerData.lastPartnerSearchDate) : null;
    const daysSinceSearch = lastSearch ? Math.floor((playerData.gameDate.getTime() - lastSearch.getTime()) / (1000 * 3600 * 24)) : 999;
    const searchAvailable = daysSinceSearch >= 7 || isTestMode;
    const daysUntilSearch = Math.max(0, 7 - daysSinceSearch);

    const lastInteraction = playerData.lastRelationshipInteractionDate ? new Date(playerData.lastRelationshipInteractionDate) : null;
    const daysSinceInteraction = lastInteraction ? Math.floor((new Date(playerData.gameDate).getTime() - lastInteraction.getTime()) / (1000 * 3600 * 24)) : 999;
    const interactionAvailable = daysSinceInteraction >= 7;
    const daysUntilInteraction = Math.max(0, 7 - daysSinceInteraction);

    const hasPartner = playerData.maritalStatus !== MaritalStatus.Single;
    const isAcquaintance = playerData.maritalStatus === MaritalStatus.Acquaintance;
    const isMarried = playerData.maritalStatus === MaritalStatus.Married;
    
    // Determine which profile is active
    const isPartnerActive = activeProfileId === 'partner';
    const activeChild = !isPartnerActive ? playerData.children.find(c => c.id === activeProfileId) : null;

    // Calculate Potential Divorce Cost
    const divorceCost = useMemo(() => {
        if (!isMarried) return 0;
        if (playerData.prenupSigned) return 0; // Or a very small fee
        return Math.floor(playerData.privateCapital * 0.5); // 50% without prenup
    }, [isMarried, playerData.prenupSigned, playerData.privateCapital]);


    // Generate Wedding Dates (5 Saturdays)
    const weddingDateOptions = useMemo(() => {
        if (!isPlanningWedding) return [];
        const options: Date[] = [];
        let date = new Date(playerData.gameDate);
        date.setDate(date.getDate() + 28); // Start 4 weeks ahead
        
        // Advance to next Saturday
        while (date.getDay() !== 6) {
            date.setDate(date.getDate() + 1);
        }

        for (let i = 0; i < 5; i++) {
            options.push(new Date(date));
            date.setDate(date.getDate() + 7); // Next week
        }
        return options;
    }, [isPlanningWedding, playerData.gameDate]);

    // Set default wedding date
    useEffect(() => {
        if (isPlanningWedding && weddingDateOptions.length > 0 && !selectedWeddingDateStr) {
            setSelectedWeddingDateStr(weddingDateOptions[0].toISOString());
        }
    }, [isPlanningWedding, weddingDateOptions]);


    // Reset selection if child gone or partner gone
    useEffect(() => {
        if (!hasPartner && activeProfileId === 'partner') {
            // Keep it partner to show search screen
        }
        if (!isPartnerActive && !activeChild) {
             setActiveProfileId('partner');
        }
    }, [hasPartner, isPartnerActive, activeChild]);

    // Ensure initial skills
    useEffect(() => {
        if (hasPartner && !playerData.partnerSkills) {
             setPlayerData(prev => prev ? {...prev, partnerSkills: generateInitialSkills(prev.partnerJob || '') } : null);
        }
    }, [hasPartner]);

    // Calculate Acquaintance Interactions (Weekly Refresh)
    const availableAcquaintanceInteractions = useMemo(() => {
        // Create a unique seed for the current week
        const year = playerData.gameDate.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const pastDays = Math.floor((playerData.gameDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
        const seed = year * 100 + weekNum;
        
        // Use custom shuffle and slice
        const shuffled = shuffleArray(ACQUAINTANCE_INTERACTIONS, seed);
        return shuffled.slice(0, 5);
    }, [playerData.gameDate]);


    // --- Handlers ---
    const handleHireFamilyMember = (role: EmployeeType | 'Actor' | 'Director' | 'None') => {
         const isPartner = activeProfileId === 'partner';
        const targetId = !isPartner ? activeProfileId : undefined;

        setPlayerData(prev => {
            if (!prev) return null;
            let name = "";
            const currentGameDate = new Date(prev.gameDate);
            
            // Name used for cleanup of old entries
            if (isPartner) {
                name = prev.partnerName || "Partner";
            } else if (targetId) {
                const child = prev.children.find(c => c.id === targetId);
                if (child) name = child.name;
            }

            let newState = { ...prev };
            
            // CLEANUP: Remove potentially existing entries in employee lists to avoid duplicates or outdated info
            newState.actors = newState.actors.filter(a => !(a.isFamily && a.name === name));
            newState.directors = newState.directors.filter(d => !(d.isFamily && d.name === name));
            newState.employees = newState.employees.filter(e => !(e.id >= 50000 && e.id < 70000 && e.name === name));

            if (isPartner) {
                if (role === 'None') {
                    newState.partnerIsEmployed = false;
                    newState.partnerEmployedAs = undefined;
                    newState.partnerJobAssignedDate = undefined;
                } else {
                    newState.partnerIsEmployed = true;
                    newState.partnerEmployedAs = role;
                    newState.partnerJobAssignedDate = currentGameDate;
                }
            } else if (targetId) {
                newState.children = newState.children.map(c => c.id === targetId ? { 
                    ...c, 
                    isEmployed: role !== 'None', 
                    employedAs: role === 'None' ? undefined : role,
                    jobAssignedDate: role === 'None' ? undefined : currentGameDate
                } : c);
            }
            return newState;
        });
    };
    
     const handleRequestEnrollment = (childId: string, type: 'primary' | 'secondary' | 'university') => {
        setPlayerData(prev => prev ? {
            ...prev,
            schoolEnrollmentRequest: { childId, type }
        } : null);
    };

    const handleTrainFamily = (skill: keyof SkillSet, duration: number) => {
        const isPartner = activeProfileId === 'partner';
        const targetId = !isPartner ? activeProfileId : undefined;
        const cost = isPartner ? 2500 : 1500;
        
        setPlayerData(prev => {
            if (!prev || prev.privateCapital < cost) return prev;
            let newState = { ...prev, privateCapital: prev.privateCapital - cost };
            const endDate = new Date(prev.gameDate);
            endDate.setDate(endDate.getDate() + duration);
            const trainingData: FamilyTraining = { skill, startDate: new Date(prev.gameDate), endDate: endDate, duration };
            if (isPartner) {
                newState.partnerActiveTraining = trainingData;
                newState.transactionLog = [...newState.transactionLog, { date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Privatleben', description: `Lehrgang Partner (${skill})`, amount: cost }];
            } else if (targetId) {
                newState.children = newState.children.map(c => {
                    if (c.id === targetId) return { ...c, activeTraining: trainingData };
                    return c;
                });
                newState.transactionLog = [...newState.transactionLog, { date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Privatleben', description: `Lehrgang Kind (${skill})`, amount: cost }];
            }
            return newState;
        });
    };

    const handleChildInteraction = (interactionId: string) => {
        if (!activeChild) return;
        const childId = activeChild.id;
        const interactionDef = CHILD_INTERACTIONS.find(i => i.id === interactionId);
        if (!interactionDef) return;
        setPlayerData(prev => {
            if (!prev) return prev;
            const child = prev.children.find(c => c.id === childId);
            if (!child) return prev;
            if (prev.energy < interactionDef.energyCost) return prev;
            if (prev.privateCapital < interactionDef.cost) return prev;
            let newState = { ...prev, energy: prev.energy - interactionDef.energyCost, privateCapital: prev.privateCapital - interactionDef.cost };
            newState.children = newState.children.map(c => {
                if (c.id === childId) {
                    return { ...c, relationship: Math.min(100, (c.relationship || 0) + interactionDef.relationshipGain), lastInteractionDate: new Date(prev.gameDate) };
                }
                return c;
            });
            return newState;
        });
    };
    
    const handleSearchOptionClick = (option: typeof PARTNER_SEARCH_OPTIONS[0]) => { setPendingSearchOption(option); };

    const handleFindPartner = (gender: 'männlich' | 'weiblich') => {
        const option = pendingSearchOption;
        setPendingSearchOption(null);
        if (!option) return;
        setDatingSearchError(null);
        if (!searchAvailable) return;
        if (playerData.privateCapital < option.cost) return;
        setPlayerData(prev => prev ? { ...prev, privateCapital: prev.privateCapital - option.cost, lastPartnerSearchDate: new Date(prev.gameDate) } : null);
        if (Math.random() > option.successChance && !isTestMode) { setDatingSearchError("Leider haben Sie niemanden kennengelernt, der Ihr Interesse geweckt hat."); return; }
        const targetGender = gender;
        const firstNameList = targetGender === 'weiblich' ? femaleFirstNames : maleFirstNames;
        const lastNameList = femaleLastNames; 
        const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
        const lastName = lastNameList[Math.floor(Math.random() * lastNameList.length)];
        const currentHouseIndex = ALL_PROPERTIES.findIndex(p => p.id === playerData.activePropertyId);
        const houseLevel = currentHouseIndex >= 0 ? currentHouseIndex : 0;
        const eligibleJobs = PARTNER_JOB_DEFINITIONS.filter(job => playerData.personalReputation >= job.minReputation && houseLevel >= job.minHouseLevel);
        const jobPool = eligibleJobs.length > 0 ? eligibleJobs : PARTNER_JOB_DEFINITIONS.slice(0, 5);
        const selectedJob = pickRandom(jobPool);
        const salary = Math.floor(selectedJob.minIncome + Math.random() * (selectedJob.maxIncome - selectedJob.minIncome));
        const traits = [];
        const numTraits = Math.random() < 0.3 ? 2 : 1;
        const availableTraits = [...PARTNER_TRAITS];
        for(let i=0; i<numTraits; i++) {
            const idx = Math.floor(Math.random() * availableTraits.length);
            traits.push(availableTraits[idx].id);
            availableTraits.splice(idx, 1);
        }
        let portraitPool: string[] = targetGender === 'weiblich' ? PLAYER_FEMALE_PORTRAITS : PLAYER_MALE_PORTRAITS;
        if (playerData.playerPortraitId) portraitPool = portraitPool.filter(id => id !== playerData.playerPortraitId);
        if (portraitPool.length === 0) portraitPool = targetGender === 'weiblich' ? ALL_FEMALE_PORTRAITS : ALL_MALE_PORTRAITS;
        const portraitId = pickRandom(portraitPool);
        setPotentialPartner({ name: `${firstName} ${lastName}`, gender: targetGender, job: selectedJob.name, salary, traits, portraitId });
    };

    const handleAcceptAcquaintance = () => {
         if (!potentialPartner) return;
        const initialProgress = 45 + Math.floor(Math.random() * 31);
        const playerBirthYear = playerData.playerBirthDate ? playerData.playerBirthDate.getFullYear() : 1960;
        const offset = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const partnerBirthYear = playerBirthYear + offset;
        const partnerBirthDate = new Date(partnerBirthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const initialSkills = generateInitialSkills(potentialPartner.job);
        setPlayerData(prev => prev ? {
            ...prev,
            maritalStatus: MaritalStatus.Acquaintance,
            partnerName: potentialPartner.name,
            partnerGender: potentialPartner.gender,
            partnerBirthDate: partnerBirthDate,
            partnerJob: potentialPartner.job,
            partnerSalary: potentialPartner.salary,
            partnerTraits: potentialPartner.traits,
            partnerPortraitId: potentialPartner.portraitId,
            partnerSkills: initialSkills, 
            relationshipStatus: 0, 
            datingProgress: initialProgress,
            relationshipStartDate: new Date(prev.gameDate),
            partnerChildrenAgreementCount: 0,
            partnerChildrenAgreementLimit: Math.floor(Math.random() * 3) + 2,
        } : null);
        setPotentialPartner(null);
    };

    const handleRelationshipInteraction = (interaction: RelationshipInteraction) => {
        if (!interactionAvailable) return;
        setPlayerData(prev => {
            if (!prev) return null;

            const testMode = prev.playerName === 'Max Mustermann' && prev.studioName === 'Teststudio';
            if (!testMode && prev.privateCapital < interaction.cost) return prev;

            // Check Energy
            const energyCost = -(interaction.energyModifier);
            if (!testMode && energyCost > 0 && (prev.energy || 0) < energyCost) return prev;

            let newState = { ...prev };
            if (!testMode) {
                newState.privateCapital -= interaction.cost;
            }
            newState.lastRelationshipInteractionDate = new Date(prev.gameDate);

            if (interaction.energyModifier !== 0) {
                newState.energy = Math.max(0, Math.min(100, (newState.energy || 0) + interaction.energyModifier));
            }

            if (newState.maritalStatus === MaritalStatus.Acquaintance) {
                newState.datingProgress = Math.min(100, (newState.datingProgress || 0) + interaction.statusGain * 2);
            } else {
                newState.relationshipStatus = Math.min(100, newState.relationshipStatus + interaction.statusGain);
            }

            return newState;
        });
    };
    
    const handleCommitRelationship = () => {
        if (playerData.maritalStatus !== MaritalStatus.Acquaintance) return;
        const currentInterest = playerData.datingProgress || 0;
        const startDate = playerData.relationshipStartDate ? new Date(playerData.relationshipStartDate) : new Date(playerData.gameDate);
        const timeDiff = new Date(playerData.gameDate).getTime() - startDate.getTime();
        const daysKnown = Math.floor(timeDiff / (1000 * 3600 * 24));
        let successChance = 0;
        let rejectionMessage = "";
        let interestDrop = 5;
        if (daysKnown < 10) {
            successChance = 0.01; 
            rejectionMessage = `${playerData.partnerName} denkt, dass es zu schnell geht.`; 
            interestDrop = 15; 
        } else if (daysKnown < 19) {
            successChance = (currentInterest / 100) * 0.2;
            rejectionMessage = `${playerData.partnerName} fühlt sich geschmeichelt, braucht aber noch etwas Zeit.`;
            interestDrop = 10;
        } else {
            successChance = currentInterest / 100;
            if (currentInterest < 50) {
                successChance *= 0.5; 
                rejectionMessage = language === 'de'
                    ? `${playerData.partnerName} ist sich noch nicht sicher.`
                    : `${playerData.partnerName} is not sure yet.`;
            } else {
                rejectionMessage = `${playerData.partnerName} zögert noch etwas.`;
            }
        }
        if (isTestMode) successChance = 1.0;
        if (Math.random() < successChance) {
            setPlayerData(prev => prev ? { ...prev, maritalStatus: MaritalStatus.Dating, relationshipStatus: 50, datingProgress: 0 } : null);
            setRelationshipFeedback(t.privatelife.family.dating.relationshipOfficial);
        } else {
            setPlayerData(prev => prev ? { ...prev, datingProgress: Math.max(0, (prev.datingProgress || 0) - interestDrop) } : null);
            setRelationshipFeedback(rejectionMessage);
        }
   };

   const handleBreakup = () => {
        // Calculate cost ONLY if married and NO prenup
        const cost = (playerData.maritalStatus === MaritalStatus.Married && !playerData.prenupSigned) 
            ? Math.floor(playerData.privateCapital * 0.5) 
            : 0;

        setPlayerData(prev => {
            if (!prev) return null;
            let newState = { ...prev };
            const formerPartnerName = prev.partnerName || "Partner";
            const partnerNameVariants = new Set([formerPartnerName, `${formerPartnerName} (Partner)`]);

            newState.actors = newState.actors.filter(actor => !(actor.isFamily && (actor.id === 99901 || partnerNameVariants.has(actor.name))));
            newState.directors = newState.directors.filter(director => !(director.isFamily && (director.id === 99901 || partnerNameVariants.has(director.name))));
            newState.employees = newState.employees.filter(employee => !((employee.id === 99901 || (employee.id >= 50000 && employee.id < 70000)) && partnerNameVariants.has(employee.name)));
            
            // Deduct cost
            newState.privateCapital = Math.max(0, prev.privateCapital - cost);
            
            if (cost > 0) {
                newState.transactionLog = [...newState.transactionLog, {
                    date: new Date(prev.gameDate),
                    type: 'Ausgabe',
                    category: 'Privatleben',
                    description: `Scheidungskosten (${prev.partnerName})`,
                    amount: cost
                }];
            }

            // Reset Partner Data
            newState.maritalStatus = MaritalStatus.Single;
            newState.partnerName = null;
            newState.partnerGender = undefined;
            newState.partnerBirthDate = undefined;
            newState.partnerJob = undefined;
            newState.partnerSalary = undefined;
            newState.partnerTraits = undefined;
            newState.relationshipStatus = 0;
            newState.datingProgress = 0;
            newState.relationshipStartDate = null;
            newState.engagementDate = null;
            newState.weddingDetails = null;
            newState.prenupSigned = false;
            newState.partnerPregnancy = null;
            newState.partnerSkills = undefined; 
            newState.partnerIsEmployed = undefined;
            newState.partnerEmployedAs = undefined;
            newState.partnerPortraitId = undefined;
            newState.partnerActiveTraining = undefined;
            newState.partnerLastCourseDate = undefined;
            newState.partnerChildrenAgreementCount = 0;
            newState.partnerJobAssignedDate = undefined;
            
            return newState;
        });
        setShowBreakupConfirm(false);
    };
    
    const handlePropose = () => {
        const ring = ENGAGEMENT_RINGS.find(r => r.id === selectedRingId);
        if (!ring) return;
        if (playerData.privateCapital < ring.cost) return;
        setPlayerData(prev => prev ? { ...prev, privateCapital: prev.privateCapital - ring.cost } : null);
        let chance = 0.3;
        if (playerData.relationshipStatus > 80) chance += 0.4;
        else if (playerData.relationshipStatus > 60) chance += 0.2;
        chance += ring.successBonus;
        if (isTestMode) chance = 1.0;
        if (Math.random() < chance) {
             setPlayerData(prev => prev ? { ...prev, maritalStatus: MaritalStatus.Engaged, engagementDate: new Date(prev.gameDate) } : null);
            setProposalResult('accepted');
        } else {
             setPlayerData(prev => prev ? { ...prev, relationshipStatus: Math.max(0, prev.relationshipStatus - 20) } : null);
            setProposalResult('rejected');
        }
        setIsProposing(false);
    };

    const handleConfirmWedding = () => {
        const pkg = WEDDING_PACKAGES.find(p => p.id === selectedPackageId);
        if (!pkg) return;
        if (playerData.privateCapital < pkg.cost) return;
        const weddingDate = new Date(selectedWeddingDateStr);
        setPlayerData(prev => prev ? {
            ...prev,
            privateCapital: prev.privateCapital - pkg.cost,
            weddingDetails: { packageId: pkg.id, date: weddingDate, cost: pkg.cost, reputationBonus: pkg.reputationBonus, surnameId: selectedSurnameId },
            prenupSigned: prenupActive
        } : null);
        setIsPlanningWedding(false);
    };

    const handleKinderwunsch = () => {
        if (playerData.maritalStatus !== MaritalStatus.Married) return;
        const isSameSex = playerData.gender === playerData.partnerGender;
        const adoptedChildren = playerData.children.filter(c => c.isAdopted).length;
        if (isSameSex && adoptedChildren >= 3) { setRelationshipFeedback("Max. Kinder erreicht."); return; }
        if (playerData.partnerChildrenAgreementCount >= playerData.partnerChildrenAgreementLimit) { setRelationshipFeedback(`${playerData.partnerName} möchte keine weiteren Kinder mehr.`); return; }
        
        setPlayerData(prev => {
             if (!prev) return null;
             const conceptionDate = new Date(prev.gameDate);
             conceptionDate.setDate(conceptionDate.getDate() + 14); 
             return { ...prev, pendingConception: { conceptionDate } };
        });
        
        const partnerName = playerData.partnerName || 'Partner';
        const partnerFirstName = partnerName.split(' ')[0];

        if (isSameSex) {
            setRelationshipFeedback(t.privatelife.family.adoptionPending.replace('{name}', partnerFirstName));
        } else {
            setRelationshipFeedback(t.privatelife.family.expecting.replace('{name}', partnerFirstName));
        }
    };
    
    const partnerLastName = playerData.partnerName ? playerData.partnerName.split(' ').pop() : '';
    const playerLastName = playerData.playerName.split(' ').pop();

    return (
        <div className="w-full h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden relative">
             <div className="p-3 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between">
               <h2 className="text-xl font-bold font-cinzel text-amber-400">{t.privatelife.screen.nav.family}</h2>
               <div className="text-xs text-gray-400">{t.privatelife.status.privateCapital}: <span className="font-bold text-white ml-2">{formatCurrency(playerData.privateCapital)}</span></div>
           </div>
           <div className="flex-grow p-4 overflow-y-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                
                {/* Left Column: Dynamic Content based on Selection */}
                <div className="flex flex-col h-full bg-gray-800/60 p-3 rounded-lg border border-gray-700">
                    
                    {/* CASE 1: PARTNER SEARCH (SINGLE & PARTNER SELECTED) */}
                    {playerData.maritalStatus === MaritalStatus.Single && isPartnerActive && !potentialPartner && (
                         <>
                            <h3 className="text-lg font-bold text-white mb-2">{t.privatelife.family.dating.searchTitle}</h3>
                            <p className="text-gray-400 text-[10px] mb-4 italic">{t.privatelife.family.dating.searchDesc}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {PARTNER_SEARCH_OPTIONS.map(option => {
                                    const transName = t.privatelife.searchOptions?.[option.id]?.name || option.name;
                                    const transDesc = t.privatelife.searchOptions?.[option.id]?.description || option.description;
                                    return (
                                    <button key={option.id} onClick={() => handleSearchOptionClick(option)} disabled={playerData.privateCapital < option.cost || !searchAvailable} className="p-2 bg-gray-800 rounded-lg border border-gray-600 hover:bg-gray-700 hover:border-amber-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed text-left relative overflow-hidden h-full">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-xs text-white group-hover:text-amber-300">{transName}</p>
                                                <p className={`font-mono font-bold text-[10px] ${option.cost === 0 ? 'text-green-400' : 'text-amber-400'}`}>{option.cost === 0 ? (language === 'de' ? 'Gratis' : 'Free') : formatCurrency(option.cost)}</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mb-1 leading-tight">{transDesc}</p>
                                            <p className="text-[9px] text-gray-500">Chance: {Math.round(option.successChance * 100)}%</p>
                                        </div>
                                        {!searchAvailable && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white z-20">{language === 'de' ? `Warten (${daysUntilSearch} Tage)` : `Wait (${daysUntilSearch} days)`}</div>}
                                    </button>
                                )})}
                            </div>
                            {datingSearchError && <p className="text-red-400 mt-4 text-sm font-bold animate-pulse bg-red-900/20 px-3 py-1.5 rounded text-center">{datingSearchError}</p>}
                        </>
                    )}

                    {/* CASE 2: POTENTIAL PARTNER FOUND */}
                    {potentialPartner && isPartnerActive && (
                        <div className="bg-gray-800 border border-amber-500 p-4 rounded-lg w-full animate-fade-in flex flex-col items-center">
                            <h3 className="text-xl font-cinzel text-amber-400 mb-3">{t.privatelife.family.dating.encounterTitle}</h3>
                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-3 overflow-hidden border-2 border-gray-500">
                                {potentialPartner.portraitId ? (
                                    <img src={`./portrait/${potentialPartner.portraitId}j.png`} alt={language === 'de' ? 'Potenzieller Partner' : 'Potential Partner'} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl">{potentialPartner.gender === 'weiblich' ? '♀' : '♂'}</span>
                                )}
                            </div>
                            <p className="text-base text-white font-bold">{potentialPartner.name}</p>
                            <p className="text-xs text-gray-400 mb-1">{potentialPartner.job}</p>
                            <p className="text-xs text-green-400 font-mono mb-3">{formatCurrency(potentialPartner.salary)} {t.talentDossier.perMonth}</p>
                            <div className="flex justify-center gap-1.5 mb-4">
                                {potentialPartner.traits.map(tid => {
                                    const trait = PARTNER_TRAITS.find(t => t.id === tid);
                                    return trait ? <span key={tid} className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">{trait.name}</span> : null;
                                })}
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setPotentialPartner(null)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 rounded text-sm">{t.privatelife.family.dating.notInterested}</button>
                                <button onClick={handleAcceptAcquaintance} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 rounded text-sm">{t.privatelife.family.dating.meet}</button>
                            </div>
                        </div>
                    )}
                    
                    {/* CASE 3: ACQUAINTANCE VIEW (Partner Only) */}
                    {isAcquaintance && !potentialPartner && isPartnerActive && (
                         <div className="flex flex-col h-full">
                             <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50 mb-4 flex items-center gap-4">
                                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-3xl border-2 border-blue-400 overflow-hidden">
                                     {playerData.partnerPortraitId ? (
                                        <img src={getPortraitUrl(playerData.partnerPortraitId, playerData.partnerBirthDate, playerData.gameDate) || ""} alt="Partner" className="w-full h-full object-cover" />
                                    ) : (
                                        playerData.partnerGender === 'weiblich' ? '♀' : '♂'
                                    )}
                                </div>
                                <div>
                                    <p className="text-blue-300 font-bold text-[10px] uppercase tracking-wider mb-0.5">{t.privatelife.family.dating.acquaintance}</p>
                                    <h3 className="text-xl font-bold text-white">{playerData.partnerName}</h3>
                                    <p className="text-xs text-gray-400">{playerData.partnerJob}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-[10px] text-blue-300 mb-0.5">{t.privatelife.family.labels.progress}</p>
                                    <div className="w-32 bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
                                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${playerData.datingProgress}%` }}></div>
                                    </div>
                                    <p className="text-xs font-bold text-white mt-1">{Math.round(playerData.datingProgress || 0)}%</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {availableAcquaintanceInteractions.map(interaction => {
                                    const canAfford = playerData.privateCapital >= interaction.cost;
                                    const hasEnergy = (playerData.energy || 0) >= -(interaction.energyModifier); 
                                    const isDisabled = !canAfford || !interactionAvailable || !hasEnergy;
                                    const transLabel = t.privatelife.interactions?.[interaction.id]?.label || interaction.name;
                                    const transDesc = t.privatelife.interactions?.[interaction.id]?.description || interaction.description;

                                    return (
                                        <button key={interaction.id} onClick={() => handleRelationshipInteraction(interaction)} disabled={isDisabled} className="p-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed relative group">
                                            <div className="flex justify-between mb-0.5">
                                                <span className="font-bold text-white text-xs">{transLabel}</span>
                                                <span className={`font-mono text-[10px] font-bold ${interaction.cost === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                                                    {interaction.cost === 0 ? '0' : formatCurrency(interaction.cost)}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-gray-400 line-clamp-1">{transDesc}</p>
                                            
                                            <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 rounded text-[9px]">
                                                <VitalityStars modifier={interaction.energyModifier} label="V" />
                                            </div>

                                            {!interactionAvailable && <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center text-[10px] font-bold text-white z-20">{language === 'de' ? `Warten (${daysUntilInteraction}d)` : `Wait (${daysUntilInteraction}d)`}</div>}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-auto flex flex-col gap-2">
                                <button onClick={handleCommitRelationship} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 rounded-full shadow-lg transition-all text-base">
                                    {t.privatelife.family.actions.makeOfficial} ❤️
                                </button>
                                <button onClick={() => setShowBreakupConfirm(true)} className="w-full text-red-400 hover:text-red-300 text-[10px] underline py-1">
                                    {t.privatelife.family.actions.breakContact}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CASE 4: PARTNER VIEW (Detailed) */}
                    {hasPartner && !isAcquaintance && isPartnerActive && (
                        <PartnerProfile 
                            playerData={playerData}
                            onHire={handleHireFamilyMember}
                            onTrain={handleTrainFamily}
                            onInteract={(i) => handleRelationshipInteraction(i)}
                            interactionAvailable={interactionAvailable}
                            daysUntilInteraction={daysUntilInteraction}
                            onPropose={() => setIsProposing(true)}
                            onPlanWedding={() => setIsPlanningWedding(true)}
                            onKinderwunsch={handleKinderwunsch}
                            onBreakup={() => setShowBreakupConfirm(true)}
                            getPortraitUrl={getPortraitUrl}
                        />
                    )}
                    
                    {/* CASE 5: CHILD VIEW (Detailed) */}
                    {!isPartnerActive && activeChild && (
                        <ChildProfile 
                            child={activeChild}
                            playerData={playerData}
                            onInteract={handleChildInteraction}
                            onHire={handleHireFamilyMember}
                            onTrain={handleTrainFamily}
                            onRequestEnrollment={handleRequestEnrollment}
                            getPortraitUrl={getChildPortraitUrl}
                        />
                    )}

                </div>
                    
                {/* Right Column: Dynasty (Persistent List) */}
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2 uppercase tracking-wide">{t.privatelife.family.labels.dynasty}</h3>
                    
                    {/* Partner in Right List */}
                    {hasPartner && (
                         <div 
                            className={`p-2 rounded-lg flex items-center gap-3 mb-3 cursor-pointer hover:bg-pink-900/30 transition-colors border ${activeProfileId === 'partner' ? 'bg-pink-900/40 border-pink-500 shadow-sm' : 'bg-gray-900/30 border-gray-600'}`}
                            onClick={() => setActiveProfileId('partner')}
                        >
                            <div className="w-10 h-10 bg-pink-900/30 rounded-full flex items-center justify-center border border-pink-500/50 overflow-hidden flex-shrink-0">
                                {playerData.partnerPortraitId ? (
                                    <img src={getPortraitUrl(playerData.partnerPortraitId, playerData.partnerBirthDate, playerData.gameDate) || ""} alt={playerData.partnerName || 'Partner'} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl">{playerData.partnerGender === 'weiblich' ? '♀' : '♂'}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-white text-xs truncate">{playerData.partnerName}</p>
                                <p className="text-[10px] text-pink-300">{t.privatelife.family.partner}</p>
                            </div>
                        </div>
                    )}
                    
                    <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{t.privatelife.family.childrenTitle}</h4>
                    {playerData.children.length > 0 ? (
                        <ul className="space-y-2 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                            {playerData.children.map(child => {
                                const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
                                const portraitUrl = getChildPortraitUrl(child.portraitId, child.birthDate, playerData.gameDate);
                                const isActive = activeProfileId === child.id;
                                
                                let childLabel: string = child.gender;
                                if (t.privatelife.family && t.privatelife.family.son && t.privatelife.family.daughter) {
                                     childLabel = child.gender === 'Junge' ? t.privatelife.family.son : t.privatelife.family.daughter;
                                }

                                return (
                                    <li 
                                        key={child.id}
                                        className={`p-2 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-blue-900/30 transition-colors border ${isActive ? 'bg-blue-900/40 border-blue-500 shadow-sm' : 'bg-gray-900/30 border-gray-600'}`}
                                        onClick={() => setActiveProfileId(child.id)}
                                    >
                                        <div className="w-9 h-9 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/50 overflow-hidden flex-shrink-0">
                                            {portraitUrl ? (
                                                <img src={portraitUrl} alt={child.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-base">👶</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-xs truncate">{child.name}</p>
                                            <p className="text-[10px] text-blue-300">{childLabel} ({age})</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic text-[10px] text-center py-4">{t.privatelife.family.noChildren}</p>
                    )}
                </div>
             </div>
           </div>

            {/* MODALS */}
            {proposalResult && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70]">
                     <div className="bg-gray-800 border border-amber-500 rounded-lg p-6 max-w-md text-center">
                        <h3 className={`text-2xl font-cinzel mb-3 ${proposalResult === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                            {proposalResult === 'accepted' 
                                ? (playerData.partnerGender === 'weiblich' ? t.privatelife.family.proposalAcceptedFemale : t.privatelife.family.proposalAcceptedMale)
                                : t.privatelife.family.proposalRejected}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                             {proposalResult === 'accepted' 
                                ? t.privatelife.family.proposalAcceptedText
                                : t.privatelife.family.proposalRejectedText
                             }
                        </p>
                        <button onClick={() => setProposalResult(null)} className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-1.5 px-6 rounded text-sm">OK</button>
                    </div>
                </div>
            )}
            
            {isProposing && (
                 <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[70]">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg p-4 max-w-lg w-full">
                        <h3 className="text-xl font-cinzel text-amber-400 mb-4 text-center">{t.privatelife.family.actions.propose}</h3>
                        <div className="space-y-2 mb-4">
                            {ENGAGEMENT_RINGS.map(ring => {
                                const transName = t.privatelife.wedding?.rings?.[ring.id]?.name || ring.name;
                                return (
                                    <button 
                                        key={ring.id}
                                        onClick={() => setSelectedRingId(ring.id)}
                                        className={`w-full p-2 rounded border flex justify-between items-center ${selectedRingId === ring.id ? 'bg-amber-900/40 border-amber-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                    >
                                        <span className="font-bold text-white text-xs">{transName}</span>
                                        <div className="text-right">
                                            <span className="text-[9px] text-green-300 block">+{Math.round(ring.successBonus * 100)}% Chance</span>
                                            <span className="text-amber-400 font-mono text-xs">{formatCurrency(ring.cost)}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsProposing(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 rounded text-sm">{t.common.cancel}</button>
                            <button onClick={handlePropose} disabled={playerData.privateCapital < (ENGAGEMENT_RINGS.find(r => r.id === selectedRingId)?.cost || 0)} className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold py-1.5 rounded text-sm">
                                {language === 'de' ? 'Fragen' : 'Ask'}
                            </button>
                        </div>
                    </div>
                 </div>
            )}

            {isPlanningWedding && (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[70] p-4">
                    <div className="bg-gray-800 border border-purple-500 rounded-lg p-5 max-w-2xl w-full">
                        <h3 className="text-2xl font-cinzel text-purple-400 mb-4 text-center">{t.privatelife.family.actions.planWedding}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">{language === 'de' ? 'Art der Feier' : 'Type of Celebration'}</label>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                    {WEDDING_PACKAGES.map(pkg => {
                                        const transName = t.privatelife.wedding?.packages?.[pkg.id]?.name || pkg.name;
                                        return (
                                        <button 
                                            key={pkg.id}
                                            onClick={() => setSelectedPackageId(pkg.id)}
                                            className={`w-full p-2 rounded border text-left ${selectedPackageId === pkg.id ? 'bg-purple-900/40 border-purple-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                        >
                                            <div className="flex justify-between mb-0.5">
                                                <span className="font-bold text-white text-xs">{transName}</span>
                                                <span className="text-amber-400 font-mono text-[10px]">{formatCurrency(pkg.cost)}</span>
                                            </div>
                                        </button>
                                    )})}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">{language === 'de' ? 'Termin (Sa.)' : 'Date (Sat.)'}</label>
                                    <select 
                                        value={selectedWeddingDateStr} 
                                        onChange={(e) => setSelectedWeddingDateStr(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-white text-xs"
                                    >
                                        {weddingDateOptions.map(date => (
                                            <option key={date.toISOString()} value={date.toISOString()}>
                                                {date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">{language === 'de' ? 'Nachname' : 'Last Name'}</label>
                                    <select 
                                        value={selectedSurnameId} 
                                        onChange={(e) => setSelectedSurnameId(e.target.value as any)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-white text-xs"
                                    >
                                        <option value="player">{playerLastName} ({language === 'de' ? 'Ich' : 'Me'})</option>
                                        <option value="partner">{partnerLastName} ({language === 'de' ? 'Partner' : 'Partner'})</option>
                                        <option value="hyphenated-player">{playerLastName}-{partnerLastName}</option>
                                        <option value="hyphenated-partner">{partnerLastName}-{playerLastName}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsPlanningWedding(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded text-sm">{t.common.cancel}</button>
                            <button 
                                onClick={handleConfirmWedding} 
                                disabled={playerData.privateCapital < (WEDDING_PACKAGES.find(p => p.id === selectedPackageId)?.cost || 0)}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-sm disabled:opacity-50"
                            >
                                {language === 'de' ? 'Buchen' : 'Book'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {pendingSearchOption && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70] p-4">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg p-5 max-w-sm w-full text-center">
                        <h3 className="text-lg font-bold text-white mb-3">{t.privatelife.searchOptions?.[pendingSearchOption.id]?.name || pendingSearchOption.name}</h3>
                        <p className="text-gray-300 text-xs mb-5">{language === 'de' ? 'Wen möchten Sie suchen?' : 'Who would you like to search for?'}</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleFindPartner('weiblich')} className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded">{language === 'de' ? '♀ Frau' : '♀ Woman'}</button>
                            <button onClick={() => handleFindPartner('männlich')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">{language === 'de' ? '♂ Mann' : '♂ Man'}</button>
                        </div>
                        <button onClick={() => setPendingSearchOption(null)} className="mt-4 text-gray-500 hover:text-white underline text-[10px]">{t.common.cancel}</button>
                    </div>
                </div>
            )}
            {relationshipFeedback && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[80] p-4">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg p-5 max-w-xs w-full text-center">
                        <h3 className="text-lg font-cinzel text-amber-400 mb-3">{t.privatelife.family.labels.reaction}</h3>
                        <p className="text-gray-300 text-sm mb-5">{relationshipFeedback}</p>
                        <button 
                            onClick={() => setRelationshipFeedback(null)} 
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 px-6 rounded text-sm"
                        >
                            {t.common.ok}
                        </button>
                    </div>
                </div>
            )}

            {showBreakupConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[80] p-4">
                    <div className="bg-gray-800 border border-red-500 rounded-lg p-5 max-w-md w-full text-center">
                        <h3 className="text-xl font-cinzel text-red-400 mb-3">
                            {isMarried ? t.privatelife.family.divorceConfirmTitle : t.privatelife.family.breakupConfirmTitle}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                            {(isMarried ? t.privatelife.family.divorceConfirmText : t.privatelife.family.breakupConfirmText).replace('{name}', playerData.partnerName || (language === 'de' ? 'Partner' : 'Partner'))}
                        </p>

                        {isMarried && !playerData.prenupSigned && (
                            <div className="bg-red-900/20 border border-red-600/40 rounded-md p-3 mb-4">
                                <p className="text-red-300 text-xs mb-2">{t.privatelife.family.divorceNoPrenupWarning}</p>
                                <p className="text-red-200 text-sm font-bold">
                                    {t.privatelife.family.divorceCost.replace('{amount}', formatCurrency(divorceCost))}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowBreakupConfirm(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded text-sm"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={handleBreakup}
                                className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded text-sm"
                            >
                                {isMarried ? t.privatelife.family.confirmDivorce : t.privatelife.family.confirmBreakup}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
