
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Director, Actor, TalentTrait, ProjectPhase, BuildingType, EmployeeType, SkillSet, Employee } from '../../../types';
import StarRating from '../../StarRating';
import DirectorIcon from '../../icons/DirectorIcon';
import ActorIcon from '../../icons/ActorIcon';
import { useGame } from '../../../contexts/GameContext';
import ChatBubbleIcon from '../../icons/ChatBubbleIcon';
import ContractIcon from '../../icons/ContractIcon';
import TrainingIcon from '../../icons/TrainingIcon';
import BriefcaseIcon from '../../icons/BriefcaseIcon';
import HandshakeIcon from '../../icons/HandshakeIcon';
import FavoriteStarIcon from '../../icons/FavoriteStarIcon';
import ScoutingIcon from '../../icons/ScoutingIcon';
import TrashIcon from '../../icons/TrashIcon';
import BonusIcon from '../../icons/BonusIcon';
import StarIcon from '../../icons/StarIcon';
import FolderIcon from '../../icons/FolderIcon';
import PencilIcon from '../../icons/PencilIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import { getTalentPortraitUrl } from '../../TalentDossierModal';
import { generateNewTalent } from '../../talentGenerator';

interface TalentProfileProps {
    talent: Director | Actor;
    playerData: any;
    onTalentChange: (newTalent: Director | Actor) => void; // For updates
    onClose?: () => void; // Optional now
    allowIdentityEdit?: boolean;
}

// Deterministic shuffle to ensure the same properties are revealed for the same talent ID
const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const deterministicShuffle = (array: string[], seed: number) => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let randomIndex;
    let seedCounter = 0;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(seededRandom(seed + (seedCounter++)) * currentIndex);
        currentIndex--;
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
};

const ProgressBar: React.FC<{ progress: number, color: string, label: string }> = ({ progress, color, label }) => (
    <div className="w-full">
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
            <span className="text-xs font-mono text-white">{Math.round(progress)}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-600">
            <div className={`${color} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

const BONUS_AMOUNT = 5000;

const TalentProfile: React.FC<TalentProfileProps> = ({ talent, playerData, onTalentChange, allowIdentityEdit = false }) => {
    const { setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    // Tabs now include sub-views for complex actions
    // Default is now 'daten' as requested
    const [activeTab, setActiveTab] = useState<'daten' | 'interaktionen' | 'historie' | 'verhandeln' | 'training'>('daten');
    const [offer, setOffer] = useState(0);
    const [contractDuration, setContractDuration] = useState(1); // 1-5 Years
    const [feedback, setFeedback] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBonusConfirm, setShowBonusConfirm] = useState(false);
    const [showTerminateContractConfirm, setShowTerminateContractConfirm] = useState(false);
    const [terminationSeverance, setTerminationSeverance] = useState<number | null>(null);
    const [terminationRemainingMonths, setTerminationRemainingMonths] = useState(0);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    
    // Action States
    const [trainingDetails, setTrainingDetails] = useState<{ cost: number, duration: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

    // Ensure we are working with the latest data from playerData
    const currentTalent = useMemo(() => {
        if (!playerData) return talent;
        if ('speedModifier' in talent) {
            return playerData.directors.find((d: Director) => d.id === talent.id) || talent;
        } else {
            return playerData.actors.find((a: Actor) => a.id === talent.id) || talent;
        }
    }, [playerData, talent]);
    
    const isDirector = 'speedModifier' in currentTalent;

    // Calculate Age
    const age = useMemo(() => {
        const birth = new Date(currentTalent.birthDate);
        const now = new Date(playerData.gameDate);
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }, [currentTalent.birthDate, playerData.gameDate]);

    // Calculate Filmography (History)
    const filmography = useMemo(() => {
        const history: { title: string; year: number; quality: number; role: string; studio: string; isPlayer: boolean }[] = [];

        // 1. Player Films (Completed)
        playerData.completedFilms.forEach((film: any) => {
            let role = null;
            if (film.directorId === currentTalent.id) role = t.talentDossier.director;
            else if (film.mainActorId === currentTalent.id) role = t.project.planning.mainRole; // Use specific role name
            else if (film.supportingActorId === currentTalent.id) role = t.project.planning.supportingRole;

            if (role) {
                // Use release date or script end date as approximation for year
                const date = film.cinemaRelease?.releaseDate ? new Date(film.cinemaRelease.releaseDate) : new Date(film.scriptEndDate);
                history.push({
                    title: film.workingTitle,
                    year: date.getFullYear(),
                    quality: film.finalQuality || 0,
                    role: role,
                    studio: playerData.studioName,
                    isPlayer: true
                });
            }
        });

        // 2. Competitor Films
        playerData.competitors.forEach((comp: any) => {
            comp.completedFilms.forEach((film: any) => {
                let role = null;
                if (film.directorId === currentTalent.id) role = t.talentDossier.director;
                else if (film.actorId === currentTalent.id) role = t.talentDossier.actor; // Competitors track only one actor usually
                
                if (role) {
                    history.push({
                        title: film.title,
                        year: new Date(film.releaseDate).getFullYear(),
                        quality: film.quality,
                        role: role,
                        studio: comp.name,
                        isPlayer: false
                    });
                }
            });
        });

        // Sort by year descending
        return history.sort((a, b) => b.year - a.year);
    }, [playerData.completedFilms, playerData.competitors, currentTalent.id, playerData.studioName, t]);


    // Calculate Demanded Salary
    const demandedMonthlySalary = useMemo(() => {
        const baseMonthly = currentTalent.cost * 0.20;
        const loyaltyFactor = 1 + ((100 - currentTalent.loyalty) / 200); // 1.0 to 1.5
        const durationFactor = 1 + ((contractDuration - 1) * 0.1); // 1.0 to 1.4
        
        return Math.round((baseMonthly * loyaltyFactor * durationFactor) / 100) * 100;
    }, [currentTalent.cost, currentTalent.loyalty, contractDuration]);

    useEffect(() => {
        // Initialize offer with demand when tab or talent changes
        setOffer(demandedMonthlySalary);
        setFeedback('');
        setShowDeleteConfirm(false);
        setShowBonusConfirm(false);
        setShowTerminateContractConfirm(false);
        setTerminationSeverance(null);
        setTerminationRemainingMonths(0);
        setTrainingDetails(null);
    }, [currentTalent.id, activeTab === 'verhandeln', demandedMonthlySalary]); // Recalculate if demand changes

    // Reset view when switching talents
    useEffect(() => {
        setActiveTab('daten');
    }, [currentTalent.id]);


    // --- FOG OF WAR LOGIC ---
    const discoveryOrder = useMemo(() => {
        // Individual unlocking items
        const items: Array<'traits' | 'potential' | 'lieblingsgenre1' | 'lieblingsgenre2' | 'hatedGenre'> = ['traits', 'potential', 'lieblingsgenre1', 'lieblingsgenre2', 'hatedGenre'];
        return deterministicShuffle(items, currentTalent.id);
    }, [currentTalent.id]);

    const numRevealed = Math.max(0, currentTalent.bekanntheit - 1);
    // At Fame 5, everything is revealed regardless of the shuffle order length
    const revealedProperties = currentTalent.bekanntheit >= 5 
        ? ['traits', 'potential', 'lieblingsgenre1', 'lieblingsgenre2', 'hatedGenre'] 
        : discoveryOrder.slice(0, numRevealed);

    const isSkillVisible = currentTalent.bekanntheit >= 1;
    const areTraitsVisible = revealedProperties.includes('traits');
    const isPotentialVisible = revealedProperties.includes('potential');
    const isFavoriteGenre1Visible = revealedProperties.includes('lieblingsgenre1');
    const isFavoriteGenre2Visible = revealedProperties.includes('lieblingsgenre2');
    const isHatedGenreVisible = revealedProperties.includes('hatedGenre');

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    
    // Gender specific job titles
    let jobTitle = isDirector ? t.talentDossier.director : t.talentDossier.actor;
    if (language === 'de') {
        if (currentTalent.gender === 'weiblich') {
            jobTitle = isDirector ? "Regisseurin" : "Schauspielerin";
        } else {
            jobTitle = isDirector ? "Regisseur" : "Schauspieler";
        }
    }

    const finalPortraitUrl = getTalentPortraitUrl(currentTalent, playerData.gameDate);

    const isBusy = useMemo(() => {
        const gameDate = new Date(playerData.gameDate);
        
        // 1. Check External Competitors (Priority over internal flags for consistency)
        for (const competitor of playerData.competitors) {
             if (competitor.currentActivity.type === 'producing' && gameDate < new Date(competitor.currentActivity.endDate)) {
                 if (competitor.currentActivity.directorId === currentTalent.id || competitor.currentActivity.actorId === currentTalent.id) {
                     return true;
                 }
             }
        }

        if (currentTalent.unavailableForProjectsUntil && gameDate < new Date(currentTalent.unavailableForProjectsUntil)) return true;
        if (currentTalent.activeTraining) return true;
        if (playerData.activeCasting?.talentId === currentTalent.id) return true;
        
        // Check ALL active projects
        if (playerData.activeProjects) {
            for (const project of playerData.activeProjects) {
                 const busyPhases = [
                    ProjectPhase.ProductionSetup, 
                    ProjectPhase.Production, 
                    ProjectPhase.PostProductionSetup, 
                    ProjectPhase.PostProduction
                ];
                if (busyPhases.includes(project.phase)) {
                     if (project.directorId === currentTalent.id || project.mainActorId === currentTalent.id || project.supportingActorId === currentTalent.id) {
                         return true;
                     }
                }
            }
        }
        
        return false;
    }, [playerData, currentTalent]);

    const currentStatusText = useMemo(() => {
        const gameDate = new Date(playerData.gameDate);

        // 1. Check Competitors (Active Scan)
        for (const competitor of playerData.competitors) {
             if (competitor.currentActivity.type === 'producing' && gameDate < new Date(competitor.currentActivity.endDate)) {
                 if (competitor.currentActivity.directorId === currentTalent.id || competitor.currentActivity.actorId === currentTalent.id) {
                     return `${t.talentDossier.status.busy} "${competitor.currentActivity.filmTitle}" (${competitor.name})`;
                 }
             }
        }
        
        // 2. Check internal flag (Fallback)
        if (currentTalent.unavailableForProjectsUntil && gameDate < new Date(currentTalent.unavailableForProjectsUntil)) {
            return t.talentDossier.status.busy + " (Extern)";
        }

        if (currentTalent.activeTraining) {
            return `${t.talentDossier.status.inTraining} ${new Date(currentTalent.activeTraining.endDate).toLocaleDateString(locale)}`;
        }
        if (playerData.activeCasting?.talentId === currentTalent.id) return t.talentDossier.status.casting;
        
        // Check ALL active projects
        if (playerData.activeProjects) {
            for (const project of playerData.activeProjects) {
                 const busyPhases = [
                    ProjectPhase.ProductionSetup, 
                    ProjectPhase.Production, 
                    ProjectPhase.PostProductionSetup, 
                    ProjectPhase.PostProduction
                ];
                if (busyPhases.includes(project.phase)) {
                    if (project.directorId === currentTalent.id || project.mainActorId === currentTalent.id || project.supportingActorId === currentTalent.id) {
                         return `${t.talentDossier.status.busy} "${project.workingTitle}"`;
                    }
                }
            }
        }
        
        if (currentTalent.contract?.type === 'exclusive') return t.talentDossier.status.exclusive;
        return t.talentDossier.status.available;
    }, [isBusy, currentTalent, t, playerData, locale]);

    const updateTalent = (updateFn: (t: Director | Actor) => Director | Actor) => {
        setPlayerData(prev => {
            if (!prev) return null;
            
            // Safer update: Find the talent in the previous state to ensure we are updating the current version
            let targetInState: Director | Actor | undefined;
            if (isDirector) {
                targetInState = prev.directors.find(d => d.id === currentTalent.id);
            } else {
                targetInState = prev.actors.find(a => a.id === currentTalent.id);
            }

            if (!targetInState) return prev; // Safety check if talent disappeared

            const updated = updateFn(targetInState);
            
            if (isDirector) {
                return { ...prev, directors: prev.directors.map(d => d.id === currentTalent.id ? updated as Director : d) };
            } else {
                return { ...prev, actors: prev.actors.map(a => a.id === currentTalent.id ? updated as Actor : a) };
            }
        });
    };

    const handleUploadClick = () => {
        if (!allowIdentityEdit) return;
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!allowIdentityEdit) return;
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            updateTalent(t => ({ ...t, portraitUrl: base64String }));
        };
        reader.readAsDataURL(file);
    };

    const handleStartRename = () => {
        if (!allowIdentityEdit) return;
        setTempName(currentTalent.name);
        setIsEditingName(true);
    };

    const handleSaveName = () => {
        if (!allowIdentityEdit) return;
        const trimmedName = tempName.trim();
        if (trimmedName) {
            updateTalent(t => ({ ...t, name: trimmedName }));
        }
        setIsEditingName(false);
    };

    const handleToggleFavorite = () => updateTalent(t => ({ ...t, isFavorite: !t.isFavorite }));

    const handleFameClick = () => {
        if (isTestMode) {
            updateTalent(t => ({ ...t, bekanntheit: Math.min(5, t.bekanntheit + 1) }));
        }
    };

    // --- COOLDOWN LOGIC ---
    const getDaysUntilAvailable = (lastDate?: Date) => {
        if (!lastDate) return 0;
        const diffTime = new Date(playerData.gameDate).getTime() - new Date(lastDate).getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, 30 - diffDays);
    };

    const daysUntilPraise = getDaysUntilAvailable(currentTalent.lastPraised);
    const canPraise = daysUntilPraise === 0;

    const daysUntilBonus = getDaysUntilAvailable(currentTalent.lastBonusPaid);
    const canPayBonus = daysUntilBonus === 0;

    const handlePraise = () => {
        if (!canPraise) return;
        const moralGain = 2 + Math.floor(Math.random() * 4);
        const loyaltyGain = 2 + Math.floor(Math.random() * 4);
        
        updateTalent(t => ({ 
            ...t, 
            moral: Math.min(100, (t.moral || 0) + moralGain), 
            loyalty: Math.min(100, (t.loyalty || 0) + loyaltyGain), 
            lastPraised: new Date(playerData.gameDate) 
        }));
    };
    
    const handlePayBonus = () => {
        if (playerData.capital < BONUS_AMOUNT) return;

        // Deduct money & update log
        setPlayerData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                capital: prev.capital - BONUS_AMOUNT,
                transactionLog: [...prev.transactionLog, { 
                    date: new Date(prev.gameDate), 
                    type: 'Ausgabe', 
                    category: 'Talent-Management', 
                    description: `Bonus für ${currentTalent.name}`, 
                    amount: BONUS_AMOUNT 
                }]
            };
        });

        // Update Talent Stats
        updateTalent(t => ({ 
            ...t, 
            moral: Math.min(100, (t.moral || 0) + 15), 
            lastBonusPaid: new Date(playerData.gameDate) 
        }));
        
        setShowBonusConfirm(false);
    };

    const handleDeleteContact = () => {
        setPlayerData(prev => {
            if (!prev) return null;
            
            // 1. Generate Replacement (undiscovered)
            const role = isDirector ? 'director' : 'actor';
            const replacement = generateNewTalent(
                prev.directors,
                prev.actors,
                undefined, // agencyId
                undefined, // scoutTalent
                role,
                false, // isEvent
                undefined, // forcedSkill
                prev.gameDate
            );

            // 2. Set Constraints: Undiscovered, Same Portrait
            replacement.isDiscovered = false;
            replacement.bekanntheit = 0;
            // Inherit the portrait of the deleted talent to maintain visual variety pool
            replacement.portraitUrl = currentTalent.portraitUrl;

            // 3. Update State: Remove old, add new
            if (isDirector) {
                const newDirectors = prev.directors.filter(d => d.id !== currentTalent.id);
                // Cast replacement correctly
                newDirectors.push(replacement as Director);
                return { ...prev, directors: newDirectors };
            } else {
                const newActors = prev.actors.filter(a => a.id !== currentTalent.id);
                newActors.push(replacement as Actor);
                return { ...prev, actors: newActors };
            }
        });
    };

    const handleNegotiate = () => {
        let acceptanceChance = 0.5;
        const offerRatio = offer / demandedMonthlySalary;
        
        if (offerRatio >= 1) acceptanceChance += (offerRatio - 1) * 0.8;
        else acceptanceChance -= (1 - offerRatio) * 2.0;

        acceptanceChance += (playerData.negotiationSkill / 100) * 0.2;
        acceptanceChance += (currentTalent.loyalty / 100) * 0.2;

        if (Math.random() < acceptanceChance) {
             const expiryDate = new Date(playerData.gameDate);
             expiryDate.setFullYear(expiryDate.getFullYear() + contractDuration);
             
             updateTalent(t => ({
                ...t,
                contract: { type: 'exclusive', salary: offer, expiryDate },
                loyalty: Math.min(100, t.loyalty + 20),
                isFavorite: true
             }));
             setFeedback(t.talentDossier.contract.accepted);
             setActiveTab('interaktionen');
        } else {
            setFeedback(offerRatio < 0.85 ? t.talentDossier.negotiate.insult : t.talentDossier.negotiate.decline);
            updateTalent(t => ({ ...t, loyalty: Math.max(0, t.loyalty - 5) }));
        }
    };

    const prepareTerminateExclusiveContract = () => {
        if (!currentTalent.contract) return;

        const now = new Date(playerData.gameDate).getTime();
        const expiry = new Date(currentTalent.contract.expiryDate).getTime();
        const remainingMs = Math.max(0, expiry - now);
        const remainingMonths = Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60 * 24 * 30.4375)));
        const remainingContractValue = remainingMonths * currentTalent.contract.salary;
        const severanceFactor = 0.5 + (Math.random() * 0.2); // 50% - 70%
        const severance = Math.round((remainingContractValue * severanceFactor) / 100) * 100;

        setTerminationRemainingMonths(remainingMonths);
        setTerminationSeverance(Math.max(100, severance));
        setShowTerminateContractConfirm(true);
    };

    const handleTerminateExclusiveContract = () => {
        if (!currentTalent.contract || terminationSeverance === null) return;
        if (playerData.capital < terminationSeverance) return;

        setPlayerData(prev => {
            if (!prev) return null;

            const isDe = language === 'de';
            const transactionDescription = isDe
                ? `Abfindung Exklusivvertrag: ${currentTalent.name}`
                : `Exclusive contract severance: ${currentTalent.name}`;

            const applyTermination = <T extends Director | Actor>(talent: T): T => ({
                ...talent,
                contract: undefined,
                loyalty: Math.max(0, (talent.loyalty || 0) - 20),
                moral: Math.max(0, (talent.moral || 0) - 15),
            });

            const newDirectors = isDirector
                ? prev.directors.map(d => d.id === currentTalent.id ? applyTermination(d) : d)
                : prev.directors;

            const newActors = !isDirector
                ? prev.actors.map(a => a.id === currentTalent.id ? applyTermination(a) : a)
                : prev.actors;

            return {
                ...prev,
                capital: prev.capital - terminationSeverance,
                directors: newDirectors,
                actors: newActors,
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Exklusivverträge',
                        description: transactionDescription,
                        amount: terminationSeverance,
                    }
                ]
            };
        });

        setShowTerminateContractConfirm(false);
        setTerminationSeverance(null);
        setTerminationRemainingMonths(0);
    };

    const handlePrepareTraining = () => {
        const cost = 50000 + Math.floor(Math.random() * 50000); // 50k - 100k
        const duration = 90 + Math.floor(Math.random() * 30); // 90 - 120 days
        setTrainingDetails({ cost, duration });
        setActiveTab('training');
    };

    const handleStartTraining = () => {
        if (!trainingDetails || playerData.capital < trainingDetails.cost) return;

        const endDate = new Date(playerData.gameDate);
        endDate.setDate(endDate.getDate() + trainingDetails.duration);
        const type = isDirector ? 'weiterbildung_regie' : 'weiterbildung_schauspiel';

        setPlayerData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                capital: prev.capital - trainingDetails.cost,
                transactionLog: [...prev.transactionLog, { date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Talent-Management', description: `Weiterbildung für ${currentTalent.name}`, amount: trainingDetails.cost }]
            };
        });

        updateTalent(t => ({
            ...t,
            activeTraining: { type, endDate }
        }));
        
        setActiveTab('interaktionen');
    };

    // Label for "Daten" Tab based on language
    const dataLabel = {
        de: 'Daten',
        en: 'Data',
        fr: 'Données',
        es: 'Datos',
        it: 'Dati'
    }[language] || 'Data';

    // Helper to render Status Bars (Loyalty/Moral)
    const renderStatusBars = () => (
        <div className="space-y-2 mb-3">
             <ProgressBar progress={currentTalent.loyalty} color="bg-green-500" label={t.talentDossier.loyalty} />
             <ProgressBar progress={currentTalent.moral} color="bg-yellow-500" label={t.talentDossier.moral} />
        </div>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
             {/* Header / Portrait */}
             <div className="flex items-center gap-6 mb-4 border-b border-gray-700 pb-4 relative">
                <button 
                    onClick={handleToggleFavorite} 
                    className={`absolute top-0 right-0 p-1 rounded-full transition-colors z-20`}
                >
                    {/* Increased size of favorite icon */}
                    <FavoriteStarIcon isFavorite={!!currentTalent.isFavorite} className={`h-9 w-9 ${currentTalent.isFavorite ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300`} />
                </button>
                {/* Portrait - removed CircularStatusIndicator, simple image container */}
                <div className="relative group">
                    <div className="w-36 h-36 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-gray-600 overflow-hidden shadow-lg relative">
                        {finalPortraitUrl ? (
                            <img src={finalPortraitUrl} alt={currentTalent.name} className={`w-full h-full object-cover ${isBusy ? 'grayscale' : ''}`} draggable="false" />
                        ) : (
                            isDirector ? <DirectorIcon className="w-24 h-24 text-gray-400" /> : <ActorIcon className="w-24 h-24 text-gray-400" />
                        )}
                    </div>
                    {allowIdentityEdit && (
                        <>
                            <div
                                className="absolute bottom-0 right-0 p-1.5 bg-gray-800 hover:bg-amber-600 rounded-full cursor-pointer transition-colors border border-gray-500 shadow-md flex items-center justify-center z-10"
                                onClick={handleUploadClick}
                                title="Bild ändern"
                            >
                                <FolderIcon className="w-3 h-3 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </>
                    )}
                </div>
                <div>
                    {allowIdentityEdit && isEditingName ? (
                        <div className="flex items-center gap-2 mb-1">
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white font-bold text-lg w-56"
                                autoFocus
                            />
                            <button onClick={handleSaveName} className="text-green-400 hover:text-green-300 font-bold px-2">✓</button>
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold font-cinzel text-amber-400 flex items-center gap-2">
                            {currentTalent.name}
                            {allowIdentityEdit && (
                                <button onClick={handleStartRename} className="text-gray-500 hover:text-white transition-colors">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            )}
                            <span className="text-lg text-gray-300 ml-2 font-sans font-normal">
                                 , {age}
                            </span>
                            <span className="text-sm text-gray-500 ml-2 font-sans font-normal">
                                 (*{new Date(currentTalent.birthDate).toLocaleDateString(locale)})
                            </span>
                        </h2>
                    )}
                    <p className="text-gray-400 font-semibold">{jobTitle}</p>
                    <p className={`text-xs font-bold mt-1 ${isBusy ? 'text-yellow-500' : 'text-green-400'}`}>{currentStatusText}</p>
                    {/* Gage wurde hierhin verschoben und vergrößert */}
                    <p className="text-xl font-mono text-amber-400 mt-2 font-bold">{t.talentDossier.gage}: {formatCurrency(currentTalent.cost)}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-4">
                <button 
                    onClick={() => setActiveTab('daten')} 
                    className={`flex-1 py-2 text-sm font-bold ${activeTab === 'daten' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
                >
                    {dataLabel}
                </button>
                <button onClick={() => setActiveTab('interaktionen')} className={`flex-1 py-2 text-sm font-bold ${(activeTab === 'interaktionen' || activeTab === 'verhandeln' || activeTab === 'training') ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>{t.talentDossier.tabs.interactions}</button>
                <button onClick={() => setActiveTab('historie')} className={`flex-1 py-2 text-sm font-bold ${activeTab === 'historie' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}>{t.talentDossier.tabs.history}</button>
            </div>

            {/* Tab Content */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                
                {activeTab === 'daten' && (
                    <div className="space-y-4">
                         {renderStatusBars()}

                         <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-2">
                            {/* Fame (Bekanntheit) */}
                            <div 
                                className={`flex justify-between items-center ${isTestMode ? 'cursor-pointer hover:bg-white/5 rounded px-1 -mx-1' : ''}`}
                                onClick={handleFameClick}
                                title={isTestMode ? "Klicken (+1 Bekanntheit)" : undefined}
                            >
                                <span className="text-gray-400 font-bold text-sm uppercase">{t.talentDossier.fame}</span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <StarIcon 
                                            key={star} 
                                            className={`w-4 h-4 ${star <= currentTalent.bekanntheit ? 'text-yellow-400' : 'text-gray-700'}`} 
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Skill */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-sm uppercase">{t.talentDossier.skill}</span>
                                {isSkillVisible ? (
                                    <StarRating rating={currentTalent.skill} isRevealed={true} />
                                ) : (
                                    <span className="text-gray-500 font-bold text-lg">?</span>
                                )}
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-sm uppercase">{t.talentDossier.potential}</span>
                                {isPotentialVisible ? (
                                    <StarRating rating={currentTalent.potential} isRevealed={true} showValue={false} />
                                ) : (
                                    <span className="text-gray-500 font-bold text-lg">?</span>
                                )}
                            </div>

                            {/* Genres (Right Aligned, Split Unlock) */}
                            <div className="flex justify-between items-start border-t border-gray-600/50 pt-2 mt-2">
                                <span className="text-gray-400 font-bold text-sm uppercase mt-0.5">{t.talentDossier.genrePref}</span>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                                    {/* Fav 1 */}
                                    {currentTalent.favoriteGenres.length > 0 && (
                                        isFavoriteGenre1Visible ? (
                                            <span className="text-[10px] bg-green-900/40 text-green-300 px-1.5 py-0.5 rounded border border-green-700/50">{t.genres[currentTalent.favoriteGenres[0]]}</span>
                                        ) : (
                                            <span className="text-[10px] bg-gray-800/40 text-gray-500 px-2 py-0.5 rounded border border-gray-700/50 font-bold">?</span>
                                        )
                                    )}
                                    {/* Fav 2 */}
                                    {currentTalent.favoriteGenres.length > 1 && (
                                        isFavoriteGenre2Visible ? (
                                            <span className="text-[10px] bg-green-900/40 text-green-300 px-1.5 py-0.5 rounded border border-green-700/50">{t.genres[currentTalent.favoriteGenres[1]]}</span>
                                        ) : (
                                            <span className="text-[10px] bg-gray-800/40 text-gray-500 px-2 py-0.5 rounded border border-gray-700/50 font-bold">?</span>
                                        )
                                    )}
                                    {/* Hated */}
                                    {currentTalent.hatedGenre && (
                                        isHatedGenreVisible ? (
                                            <span className="text-[10px] bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded border border-red-700/50" title={t.talentDossier.hated}>
                                                🚫 {t.genres[currentTalent.hatedGenre]}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-gray-800/40 text-gray-500 px-2 py-0.5 rounded border border-gray-700/50 font-bold">?</span>
                                        )
                                    )}
                                    
                                    {currentTalent.favoriteGenres.length === 0 && !currentTalent.hatedGenre && (
                                        <span className="text-[10px] text-gray-500 italic">{t.talentDossier.unknown}</span>
                                    )}
                                </div>
                            </div>

                            {/* Traits (Right Aligned) */}
                            <div className="flex justify-between items-start">
                                <span className="text-gray-400 font-bold text-sm uppercase mt-0.5">{t.talentDossier.traits}</span>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                                    {areTraitsVisible ? (
                                        currentTalent.traits.length > 0 ? currentTalent.traits.map((tr: string) => {
                                            // @ts-ignore
                                            const traitInfo = t.traits[tr] || { name: tr, isPositive: true };
                                            return (
                                                <span key={tr} className={`text-[10px] px-1.5 py-0.5 rounded border ${traitInfo.isPositive ? 'bg-blue-900/30 border-blue-700/50 text-blue-300' : 'bg-orange-900/30 border-orange-700/50 text-orange-300'}`}>
                                                    {traitInfo.name}
                                                </span>
                                            )
                                        }) : (
                                            <span className="text-[10px] text-gray-500 italic">{t.talentDossier.noTraits}</span>
                                        )
                                    ) : (
                                        <span className="text-[10px] bg-gray-800/40 text-gray-500 px-2 py-0.5 rounded border border-gray-700/50 font-bold">?</span>
                                    )}
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            
                {(activeTab === 'interaktionen' || activeTab === 'verhandeln' || activeTab === 'training') && (
                    <div className="space-y-3">
                         {activeTab === 'verhandeln' ? ( 
                             <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <h4 className="font-bold text-white mb-4">{t.talentDossier.contract.negotiateTitle}</h4>
                                
                                <div className="mb-4">
                                    <ProgressBar progress={currentTalent.loyalty} color="bg-green-500" label={t.talentDossier.loyalty} />
                                </div>

                                <div className="space-y-4">
                                     <div className="flex justify-between text-sm">
                                         <span className="text-gray-400">{t.talentDossier.negotiate.demanded}:</span> 
                                         <span className="font-bold text-white">{formatCurrency(demandedMonthlySalary)} {t.talentDossier.perMonth}</span>
                                     </div>
                                     
                                     <div>
                                        <label className="block text-xs text-gray-400 mb-1">{t.talentDossier.negotiate.offer}</label>
                                        <input 
                                            type="range" 
                                            min={Math.round(demandedMonthlySalary * 0.5)} 
                                            max={Math.round(demandedMonthlySalary * 1.5)} 
                                            step={100} 
                                            value={offer} 
                                            onChange={(e) => setOffer(Number(e.target.value))} 
                                            className="w-full accent-amber-500" 
                                        />
                                        <div className="text-center font-bold text-amber-400 font-mono mt-1">{formatCurrency(offer)} {t.talentDossier.perMonth}</div>
                                     </div>

                                     <div>
                                        <label className="block text-xs text-gray-400 mb-1">{t.talentDossier.contract.durationLabel}</label>
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="5" 
                                            step="1" 
                                            value={contractDuration} 
                                            onChange={(e) => setContractDuration(Number(e.target.value))} 
                                            className="w-full accent-blue-500" 
                                        />
                                        <div className="text-center font-bold text-blue-300 font-mono mt-1">{contractDuration} {t.talentDossier.years}</div>
                                     </div>

                                     <div className="flex gap-2 mt-4">
                                         <button onClick={() => setActiveTab('interaktionen')} className="flex-1 bg-gray-700 text-white py-2 rounded text-xs font-bold uppercase">{t.common.cancel}</button>
                                         <button onClick={handleNegotiate} className="flex-1 bg-green-600 text-white py-2 rounded text-xs font-bold uppercase">{t.talentDossier.negotiate.submit}</button>
                                     </div>
                                     {feedback && <p className="text-center text-sm font-bold text-yellow-400 mt-2">{feedback}</p>}
                                </div>
                             </div>
                         ) : activeTab === 'training' && trainingDetails ? (
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                               <h4 className="font-bold text-white mb-4 text-center">{t.talentDossier.actions.actionTrain}</h4>
                               <p className="text-gray-300 text-sm mb-4 text-center">
                                   {t.talentDossier.actions.trainingDetails.replace('{name}', currentTalent.name).replace('{type}', 'Training').replace('{duration}', trainingDetails.duration.toString())}
                               </p>
                               <div className="bg-black/20 p-3 rounded mb-4 text-sm">
                                   <div className="flex justify-between"><span>{t.talentDossier.trainingCost}:</span> <span className="font-mono text-amber-400">{formatCurrency(trainingDetails.cost)}</span></div>
                                   <div className="flex justify-between"><span>{t.office.casting.setup.duration}</span> <span className="font-mono text-white">{trainingDetails.duration} {t.talentDossier.contract.days}</span></div>
                               </div>
                               <div className="flex gap-2">
                                    <button onClick={() => setActiveTab('interaktionen')} className="flex-1 bg-gray-700 text-white py-2 rounded text-xs font-bold uppercase">{t.common.cancel}</button>
                                    <button onClick={handleStartTraining} disabled={playerData.capital < trainingDetails.cost} className="flex-1 bg-purple-600 disabled:bg-gray-600 text-white py-2 rounded text-xs font-bold uppercase">{t.common.confirm}</button>
                               </div>
                               {playerData.capital < trainingDetails.cost && <p className="text-red-400 text-xs text-center mt-2">{t.project.casting.insufficientFunds}</p>}
                            </div>
                        ) : (
                             <>
                                {renderStatusBars()}

                                {currentTalent.contract ? (
                                    <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-center mb-2">
                                        <p className="text-green-400 font-bold text-sm">{t.talentDossier.status.exclusive}</p>
                                        <p className="text-xs text-gray-400">{t.talentDossier.status.available} {new Date(currentTalent.contract.expiryDate).toLocaleDateString(locale)}</p>
                                        <p className="text-xs text-gray-400 mt-1">{t.talentDossier.gage}: {formatCurrency(currentTalent.contract.salary)} {t.talentDossier.perMonth}</p>

                                        {showTerminateContractConfirm ? (
                                            <div className="mt-3 bg-red-900/30 border border-red-500/50 p-3 rounded-lg text-left animate-fade-in">
                                                <p className="text-white text-sm font-bold mb-2">{t.talentDossier.contract.terminateExclusiveConfirm || t.talentDossier.contract.terminateConfirm}</p>
                                                <p className="text-gray-300 text-xs mb-2">
                                                    {(t.talentDossier.contract.terminateExclusiveDetails || t.talentDossier.contract.terminateDetails)
                                                        .replace('{name}', currentTalent.name)
                                                        .replace('{fee}', formatCurrency(terminationSeverance || 0))
                                                        .replace('{remainingMonths}', String(terminationRemainingMonths))}
                                                </p>
                                                {terminationSeverance !== null && playerData.capital < terminationSeverance && (
                                                    <p className="text-red-400 text-xs mb-2">{t.project.casting.insufficientFunds}</p>
                                                )}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowTerminateContractConfirm(false);
                                                            setTerminationSeverance(null);
                                                            setTerminationRemainingMonths(0);
                                                        }}
                                                        className="flex-1 bg-gray-700 text-white py-1 rounded text-xs font-bold uppercase"
                                                    >
                                                        {t.common.cancel}
                                                    </button>
                                                    <button
                                                        onClick={handleTerminateExclusiveContract}
                                                        disabled={terminationSeverance !== null && playerData.capital < terminationSeverance}
                                                        className="flex-1 bg-red-600 text-white py-1 rounded text-xs font-bold uppercase disabled:bg-gray-600"
                                                    >
                                                        {t.talentDossier.contract.terminateExclusiveAction || t.talentDossier.contract.terminateConfirm}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={prepareTerminateExclusiveContract}
                                                className="mt-3 w-full bg-red-800/80 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-sm uppercase tracking-wider text-[10px] transition-colors"
                                            >
                                                {t.talentDossier.contract.terminateExclusiveButton || 'Exklusivvertrag kündigen'}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setActiveTab('verhandeln')} 
                                        disabled={isBusy}
                                        className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ContractIcon className="h-5 w-5 text-yellow-400"/>
                                            <span className="font-bold text-sm text-white">{t.talentDossier.actions.actionOffer}</span>
                                        </div>
                                    </button>
                                )}

                                <button 
                                    onClick={handlePraise} 
                                    disabled={isBusy || !canPraise} 
                                    className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <ChatBubbleIcon className="h-5 w-5 text-blue-400"/>
                                        <span className="font-bold text-sm text-white">{t.talentDossier.actions.actionPraise || "Loben"}</span>
                                    </div>
                                    {!canPraise && (
                                        <span className="text-[10px] text-gray-500 font-normal">
                                            {(t.talentDossier.praiseAvailable || t.employeeDossier.praiseAvailable || "Available: {date}").replace('{date}', daysUntilPraise.toString())} {t.project.production.days}
                                        </span>
                                    )}
                                </button>
                                
                                {showBonusConfirm ? (
                                    <div className="bg-gray-900/80 border border-amber-500/50 p-3 rounded-lg text-center animate-fade-in my-2">
                                        <p className="text-white text-sm mb-3 font-bold">{t.talentDossier.actions.actionBonus}?</p>
                                        <p className="text-gray-300 text-xs mb-3">
                                            {formatCurrency(BONUS_AMOUNT)}
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowBonusConfirm(false)} className="flex-1 bg-gray-700 text-white py-1 rounded text-xs font-bold uppercase">{t.common.cancel}</button>
                                            <button onClick={handlePayBonus} className="flex-1 bg-green-600 text-white py-1 rounded text-xs font-bold uppercase">{t.common.confirm}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowBonusConfirm(true)}
                                        disabled={isBusy || playerData.capital < BONUS_AMOUNT || !canPayBonus}
                                        className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <BonusIcon className="h-5 w-5 text-green-400"/>
                                            <span className="font-bold text-sm text-white">{t.talentDossier.actions.actionBonus}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 block">{formatCurrency(BONUS_AMOUNT)}</span>
                                            {!canPayBonus && (
                                                <span className="text-[10px] text-gray-500 font-normal block">
                                                    {daysUntilBonus} {t.project.production.days}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )}

                                <button 
                                    onClick={handlePrepareTraining} 
                                    disabled={isBusy}
                                    className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <TrainingIcon className="h-5 w-5 text-purple-400"/>
                                        <span className="font-bold text-sm text-white">{t.talentDossier.actions.actionTrain}</span>
                                    </div>
                                </button>

                                {showDeleteConfirm ? (
                                    <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg text-center animate-fade-in">
                                        <p className="text-white text-sm mb-3 font-bold">{t.talentDossier.actions.confirmDeleteContactTitle}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-700 text-white py-1 rounded text-xs font-bold uppercase">{t.common.cancel}</button>
                                            <button onClick={handleDeleteContact} className="flex-1 bg-red-600 text-white py-1 rounded text-xs font-bold uppercase">{t.common.delete}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)} 
                                        disabled={isBusy || !!currentTalent.contract}
                                        className="w-full flex items-center justify-between p-3 border border-red-900/50 hover:bg-red-900/20 rounded-lg transition-colors text-left mt-4 disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <TrashIcon className="h-5 w-5 text-red-500"/>
                                            <span className="font-bold text-sm text-red-400">{t.talentDossier.actions.terminateContact}</span>
                                        </div>
                                    </button>
                                )}
                             </>
                         )}
                    </div>
                )}
                {activeTab === 'historie' && (
                     <div className="space-y-2">
                        {filmography.length > 0 ? (
                             filmography.map((entry, index) => (
                                <div key={index} className={`p-2 rounded-md border ${entry.isPlayer ? 'bg-green-900/20 border-green-700/50' : 'bg-gray-800/40 border-gray-700'}`}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-white text-sm">{entry.title}</span>
                                        <span className="text-xs text-gray-400 font-mono">{entry.year}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                         <span className="text-xs text-gray-300">{entry.role}</span>
                                         <StarRating rating={entry.quality} size="sm" isRevealed={true} />
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5 text-right italic">
                                        {entry.studio}
                                    </div>
                                </div>
                             ))
                        ) : (
                            <p className="text-gray-500 italic text-center text-sm">{t.talentDossier.noHistory}</p>
                        )}
                     </div>
                )}
            </div>
        </div>
    );
};

export default TalentProfile;
