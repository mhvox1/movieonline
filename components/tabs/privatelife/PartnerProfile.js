import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo, useRef } from 'react';
import { EmployeeType, MaritalStatus } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGame } from '../../../contexts/GameContext';
import { RELATIONSHIP_INTERACTIONS } from '../../privateLifeData';
import StarIcon from '../../icons/StarIcon';
import HeartIcon from '../../icons/HeartIcon';
import FolderIcon from '../../icons/FolderIcon'; // Import FolderIcon
import PencilIcon from '../../icons/PencilIcon'; // Import PencilIcon
// Pseudo-random number generator for deterministic shuffling based on seed
const seededRandom = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};
const shuffleArray = (array, seed) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
const VitalityStars = ({ modifier, label }) => {
    const absMod = Math.abs(modifier);
    let stars = 0.5; // Minimum 0.5 stars
    if (absMod >= 20)
        stars = 3;
    else if (absMod >= 15)
        stars = 2.5;
    else if (absMod >= 10)
        stars = 2;
    else if (absMod >= 5)
        stars = 1;
    else if (absMod > 0)
        stars = 0.5;
    else
        stars = 0; // No effect
    if (stars === 0)
        return _jsx("span", { className: "text-[10px] text-gray-500", children: "-" });
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;
    const colorClass = modifier > 0 ? "text-green-400" : "text-red-400";
    const starColor = "text-yellow-400";
    return (_jsxs("div", { className: "flex items-center gap-0.5", children: [_jsx("span", { className: `text-[9px] uppercase font-bold ${colorClass}`, children: label }), _jsxs("div", { className: "flex items-center", children: [Array.from({ length: fullStars }).map((_, i) => (_jsx(StarIcon, { className: `w-2.5 h-2.5 ${starColor}` }, i))), hasHalfStar && (_jsxs("div", { className: "relative w-2.5 h-2.5", children: [_jsx(StarIcon, { className: "w-2.5 h-2.5 text-gray-600 absolute top-0 left-0" }), _jsx("div", { className: "w-1.25 h-2.5 overflow-hidden absolute top-0 left-0", children: _jsx(StarIcon, { className: "w-2.5 h-2.5 text-yellow-400" }) })] }))] })] }));
};
const PartnerProfile = ({ playerData, onHire, onTrain, onInteract, interactionAvailable, hoursUntilInteraction, onPropose, onPlanWedding, onKinderwunsch, onBreakup, getPortraitUrl }) => {
    const { t, language } = useTranslation();
    const { setPlayerData } = useGame(); // Need setPlayerData for name/image update
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [activeTab, setActiveTab] = useState('interaction');
    const [showHireConfirm, setShowHireConfirm] = useState(false);
    const [showTrainingConfirm, setShowTrainingConfirm] = useState(null);
    const [selectedRole, setSelectedRole] = useState(EmployeeType.Autor);
    // Edit Name State
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    // File Input Ref
    const fileInputRef = useRef(null);
    // Sync selected role with current employment
    React.useEffect(() => {
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs) {
            setSelectedRole(playerData.partnerEmployedAs);
        }
        else {
            setSelectedRole('None');
        }
    }, [playerData.partnerIsEmployed, playerData.partnerEmployedAs]);
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const partnerName = playerData.partnerName || 'Partner';
    const partnerFirstName = partnerName.split(' ')[0];
    const isFemale = playerData.partnerGender === 'weiblich';
    const activePortraitUrl = getPortraitUrl(playerData.partnerPortraitId, playerData.partnerBirthDate, playerData.gameDate);
    // Determine active job display
    let activeJobDisplay = "";
    if (playerData.partnerJob) {
        if (t.privatelife.family?.jobs && t.privatelife.family.jobs[playerData.partnerJob]) {
            activeJobDisplay = t.privatelife.family.jobs[playerData.partnerJob];
        }
        else {
            activeJobDisplay = playerData.partnerJob;
            if (language === 'de' && !playerData.partnerIsEmployed && activeJobDisplay.includes("/")) {
                const parts = activeJobDisplay.split("/");
                if (parts.length === 2) {
                    if (parts[1] === "in") {
                        activeJobDisplay = isFemale ? parts[0] + parts[1] : parts[0];
                    }
                    else {
                        activeJobDisplay = isFemale ? parts[1] : parts[0];
                    }
                }
            }
        }
    }
    if (playerData.partnerIsEmployed) {
        let internalRole = playerData.partnerEmployedAs;
        if (internalRole === 'Actor')
            internalRole = isFemale ? (t.newspaper.roles.actress || 'Schauspielerin') : (t.newspaper.roles.actor || 'Schauspieler');
        else if (internalRole === 'Director')
            internalRole = isFemale ? (t.newspaper.roles.directress || 'Regisseurin') : (t.newspaper.roles.director || 'Regisseur');
        else {
            const typeMap = {
                [EmployeeType.Autor]: t.office.employees.employeeTypes.autor,
                [EmployeeType.CastingMitarbeiter]: t.office.employees.employeeTypes.castingMitarbeiter,
                [EmployeeType.Forscher]: t.office.employees.employeeTypes.forscher,
                [EmployeeType.Marketingmanager]: t.office.employees.employeeTypes.marketingmanager,
                [EmployeeType.ProjektPlaner]: t.office.employees.employeeTypes.projektPlaner,
            };
            const baseTitle = typeMap[internalRole] || internalRole;
            if (language === 'de' && isFemale) {
                internalRole = baseTitle + "in";
            }
            else {
                internalRole = baseTitle;
            }
        }
        activeJobDisplay = internalRole;
    }
    const partnerAge = playerData.partnerBirthDate
        ? Math.floor((new Date(playerData.gameDate).getTime() - new Date(playerData.partnerBirthDate).getTime()) / (1000 * 3600 * 24 * 365.25))
        : 0;
    const skillList = ['acting', 'directing', 'writing', 'scouting', 'research', 'marketing', 'planning'];
    const skills = playerData.partnerSkills || { acting: 0, directing: 0, writing: 0, scouting: 0, research: 0, marketing: 0, planning: 0 };
    const getSkillLabel = (key) => {
        switch (key) {
            case 'acting': return t.office.contacts.actors;
            case 'directing': return t.office.contacts.directors;
            case 'writing': return t.office.employees.employeeTypes.autor;
            case 'scouting': return t.office.employees.employeeTypes.castingMitarbeiter;
            case 'research': return t.office.employees.employeeTypes.forscher;
            case 'marketing': return t.office.employees.employeeTypes.marketingmanager;
            case 'planning': return t.office.employees.employeeTypes.projektPlaner;
            default: return key;
        }
    };
    const partnerSalary = playerData.partnerSalary || 0;
    const isHouseholdMember = [MaritalStatus.Dating, MaritalStatus.Engaged, MaritalStatus.Married].includes(playerData.maritalStatus);
    const availableInteractions = useMemo(() => {
        const year = playerData.gameDate.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const pastDays = Math.floor((playerData.gameDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
        const seed = year * 100 + weekNum;
        const shuffled = shuffleArray(RELATIONSHIP_INTERACTIONS, seed);
        return shuffled.slice(0, 5);
    }, [playerData.gameDate]);
    const isJobLocked = useMemo(() => {
        if (!playerData.partnerJobAssignedDate)
            return false;
        const assignedDate = new Date(playerData.partnerJobAssignedDate);
        const unlockDate = new Date(assignedDate);
        unlockDate.setMonth(unlockDate.getMonth() + 6);
        return playerData.gameDate < unlockDate;
    }, [playerData.partnerJobAssignedDate, playerData.gameDate]);
    const unlockDateStr = useMemo(() => {
        if (!playerData.partnerJobAssignedDate)
            return "";
        const assignedDate = new Date(playerData.partnerJobAssignedDate);
        const unlockDate = new Date(assignedDate);
        unlockDate.setMonth(unlockDate.getMonth() + 6);
        return unlockDate.toLocaleDateString(locale);
    }, [playerData.partnerJobAssignedDate, locale]);
    const statusKeyMap = {
        'Single': 'Single',
        'Bekanntschaft': 'Acquaintance',
        'In einer Beziehung': 'Dating',
        'Verlobt': 'Engaged',
        'Verheiratet': 'Married',
        'Geschieden': 'Divorced',
        'Verwitwet': 'Widowed'
    };
    const maritalStatusKey = statusKeyMap[playerData.maritalStatus] || 'Single';
    const maritalStatusLabel = t.privatelife.family.status[maritalStatusKey] || playerData.maritalStatus;
    const trainingCost = 2500;
    const isTrainingCooldown = React.useMemo(() => {
        if (playerData.partnerActiveTraining)
            return true;
        if (!playerData.partnerLastCourseDate)
            return false;
        const cooldownEnd = new Date(playerData.partnerLastCourseDate);
        cooldownEnd.setMonth(cooldownEnd.getMonth() + 6);
        return playerData.gameDate < cooldownEnd;
    }, [playerData.partnerLastCourseDate, playerData.gameDate, playerData.partnerActiveTraining]);
    const handleTrainClick = (skill) => {
        if (playerData.privateCapital >= trainingCost && !isTrainingCooldown) {
            const duration = 65 + Math.floor(Math.random() * 56);
            setShowTrainingConfirm({ skill, duration });
        }
    };
    const confirmTraining = () => {
        if (showTrainingConfirm) {
            onTrain(showTrainingConfirm.skill, showTrainingConfirm.duration);
            setShowTrainingConfirm(null);
        }
    };
    const isEmployed = playerData.partnerIsEmployed;
    // --- PHOTO UPLOAD LOGIC ---
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setPlayerData(prev => prev ? { ...prev, partnerPortraitId: base64String } : null);
            };
            reader.readAsDataURL(file);
        }
    };
    // --- RENAME LOGIC ---
    const handleStartRename = () => {
        setTempName(partnerName);
        setIsEditingName(true);
    };
    const handleSaveName = () => {
        if (tempName.trim()) {
            setPlayerData(prev => {
                if (!prev)
                    return null;
                return { ...prev, partnerName: tempName.trim() };
            });
        }
        setIsEditingName(false);
    };
    return (_jsxs("div", { className: "flex flex-col h-full overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4 border-b border-gray-600 pb-3", children: [_jsxs("div", { className: "relative group", children: [_jsx("div", { className: "w-32 h-32 bg-pink-900/30 rounded-full flex items-center justify-center border-2 border-pink-500/50 overflow-hidden flex-shrink-0", children: activePortraitUrl ? (_jsx("img", { src: activePortraitUrl, alt: partnerName, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-2xl", children: "?" })) }), _jsx("div", { className: "absolute bottom-0 right-0 p-1.5 bg-gray-800 hover:bg-amber-600 rounded-full cursor-pointer transition-colors border border-gray-500 shadow-md flex items-center justify-center z-10", onClick: handleUploadClick, title: language === 'de' ? 'Bild ändern' : 'Change Image', children: _jsx(FolderIcon, { className: "w-3 h-3 text-white" }) }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileUpload, accept: "image/*", className: "hidden" })] }), _jsxs("div", { className: "flex-grow", children: [_jsx("div", { className: "flex items-center gap-2", children: isEditingName ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "text", value: tempName, onChange: (e) => setTempName(e.target.value), className: "bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white font-bold text-lg w-40", autoFocus: true }), _jsx("button", { onClick: handleSaveName, className: "text-green-400 hover:text-green-300 font-bold px-2", children: "\u2713" })] })) : (_jsxs("h3", { className: "text-xl font-bold text-white leading-tight flex items-center gap-2", children: [partnerName, _jsx("button", { onClick: handleStartRename, className: "text-gray-500 hover:text-white transition-colors", children: _jsx(PencilIcon, { className: "w-4 h-4" }) })] })) }), _jsx("p", { className: "text-gray-400 text-xs", children: activeJobDisplay }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsxs("p", { className: "text-[10px] text-gray-500", children: [partnerAge, " ", t.talentDossier.years] }), playerData.partnerBirthDate && _jsxs("p", { className: "text-[10px] text-gray-500", children: ["(", new Date(playerData.partnerBirthDate).toLocaleDateString(locale), ")"] })] }), _jsx("span", { className: "text-[10px] font-bold text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded mt-1 inline-block", children: maritalStatusLabel }), isHouseholdMember && !playerData.partnerIsEmployed && (_jsxs("p", { className: "text-green-400 text-[10px] mt-1 font-mono", children: [t.privatelife.status.householdIncome, ": ", formatCurrency(partnerSalary)] }))] })] }), _jsxs("div", { className: "mb-3 space-y-2", children: [_jsx("div", { className: "flex flex-wrap gap-1.5", children: playerData.partnerTraits?.map(trait => (_jsx("span", { className: "bg-gray-600 text-[10px] px-1.5 py-0.5 rounded text-white", children: trait }, trait))) }), _jsxs("div", { className: "mb-1", children: [_jsxs("div", { className: "flex justify-between items-end mb-0.5", children: [_jsx("span", { className: "text-[10px] text-pink-300 font-semibold uppercase", children: t.privatelife.family.labels.relationshipValue }), _jsxs("span", { className: "text-[10px] font-mono text-white", children: [Math.round(playerData.relationshipStatus), "/100"] })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-1.5 overflow-hidden border border-gray-600", children: _jsx("div", { className: "bg-pink-500 h-1.5 rounded-full transition-all duration-500 ease-out", style: { width: `${Math.min(100, Math.max(0, playerData.relationshipStatus))}%` } }) })] }), playerData.maritalStatus === MaritalStatus.Married && playerData.weddingDate ? (_jsxs("p", { className: "text-[10px] text-gray-400", children: [t.privatelife.family.labels.anniversary, ": ", new Date(playerData.weddingDate).toLocaleDateString(locale)] })) : playerData.relationshipStartDate && (_jsxs("p", { className: "text-[10px] text-gray-400", children: [t.privatelife.family.labels.togetherSince, ": ", new Date(playerData.relationshipStartDate).toLocaleDateString(locale)] })), playerData.weddingDetails && (_jsxs("div", { className: "p-2 bg-purple-900/20 border border-purple-500/30 rounded text-center", children: [_jsx("p", { className: "text-purple-300 font-bold text-xs", children: t.privatelife.family.weddingPlanned }), _jsx("p", { className: "text-[10px] text-gray-400", children: t.privatelife.family.weddingPlannedText.replace('{date}', new Date(playerData.weddingDetails.date).toLocaleDateString(locale)) })] })), playerData.partnerPregnancy && (_jsxs("div", { className: "p-2 bg-blue-900/20 border border-blue-500/30 rounded text-center animate-pulse", children: [_jsx("p", { className: "text-blue-300 font-bold text-xs", children: playerData.partnerPregnancy.isAdoption
                                    ? t.privatelife.family.adoptionPending.replace('{name}', partnerFirstName)
                                    : t.privatelife.family.expecting.replace('{name}', partnerFirstName) }), _jsxs("p", { className: "text-[10px] text-gray-400", children: [t.privatelife.family.labels.date, ": ", new Date(playerData.partnerPregnancy.dueDate).toLocaleDateString(locale)] })] }))] }), _jsxs("div", { className: "flex border-b border-gray-600 mb-3 text-xs", children: [_jsx("button", { onClick: () => setActiveTab('interaction'), className: `flex-1 py-1.5 font-bold transition-colors ${activeTab === 'interaction' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-white'}`, children: t.privatelife.family.tabs.interaction }), _jsx("button", { onClick: () => setActiveTab('career'), className: `flex-1 py-1.5 font-bold transition-colors ${activeTab === 'career' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-white'}`, children: t.privatelife.family.tabs.career })] }), _jsxs("div", { className: "flex-grow overflow-y-auto pr-2 custom-scrollbar", children: [activeTab === 'interaction' && (_jsxs("div", { className: "space-y-2", children: [availableInteractions.map(interaction => {
                                const canAfford = playerData.privateCapital >= interaction.cost;
                                const currentEnergy = playerData.energy || 100;
                                const hasEnergy = interaction.energyModifier >= 0 || (currentEnergy + interaction.energyModifier >= 0);
                                const isDisabled = !interactionAvailable || (!isTestMode && (!canAfford || !hasEnergy));
                                const transLabel = t.privatelife.interactions?.[interaction.id]?.label || interaction.name;
                                const transDesc = t.privatelife.interactions?.[interaction.id]?.description || interaction.description;
                                                return (_jsxs("button", { onClick: () => onInteract(interaction), disabled: isDisabled, className: "w-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 p-1.5 rounded text-left flex justify-between items-center group transition-colors relative", children: [_jsxs("div", { className: "min-w-0 pr-2", children: [_jsx("span", { className: "font-semibold text-white block text-xs truncate", children: transLabel }), _jsx("span", { className: "text-[9px] text-gray-400 line-clamp-1", children: transDesc })] }), _jsxs("div", { className: "text-right flex flex-col items-end flex-shrink-0", children: [_jsx("div", { className: "text-[10px] font-bold", children: interaction.cost > 0 ? (_jsx("span", { className: canAfford ? 'text-amber-400' : 'text-red-400', children: formatCurrency(interaction.cost) })) : (_jsx("span", { className: "text-green-400", children: t.office.casting.setup.free })) }), _jsx("div", { className: "mt-0.5", children: _jsx(VitalityStars, { modifier: interaction.energyModifier, label: "V" }) })] }), !interactionAvailable && _jsx("div", { className: "absolute inset-0 bg-black/60 rounded flex items-center justify-center text-[10px] font-bold text-white z-20", children: language === 'de' ? `Warten (${hoursUntilInteraction} Stunden)` : `Wait (${hoursUntilInteraction} hours)` })] }, interaction.id));
                            }), _jsxs("div", { className: "pt-3 border-t border-gray-600 space-y-2", children: [playerData.maritalStatus === MaritalStatus.Dating && (_jsxs("button", { onClick: onPropose, className: "w-full bg-pink-900/40 border border-pink-500 hover:bg-pink-800/60 text-white font-bold py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-2", children: [_jsx(HeartIcon, { className: "w-3 h-3", filled: true }), " ", t.privatelife.family.actions.propose] })), playerData.maritalStatus === MaritalStatus.Engaged && !playerData.weddingDetails && (_jsx("button", { onClick: onPlanWedding, className: "w-full bg-purple-900/40 border border-purple-500 hover:bg-purple-800/60 text-white font-bold py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-2", children: t.privatelife.family.actions.planWedding })), playerData.maritalStatus === MaritalStatus.Married && !playerData.partnerPregnancy && !playerData.pendingConception && (_jsx("button", { onClick: onKinderwunsch, className: "w-full bg-blue-900/40 border border-blue-500 hover:bg-blue-800/60 text-white font-bold py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-2", children: playerData.gender === playerData.partnerGender ? t.privatelife.family.actions.adopt : t.privatelife.family.actions.desireChild })), _jsx("button", { onClick: onBreakup, className: "w-full bg-red-900/40 border border-red-500 hover:bg-red-800/60 text-white font-bold py-1.5 rounded text-[10px] transition-colors", children: t.privatelife.family.actions.endRelationship })] })] })), activeTab === 'career' && (_jsxs("div", { className: "space-y-4", children: [playerData.partnerActiveTraining ? (_jsxs("div", { className: "bg-blue-900/30 border border-blue-600/50 p-2 rounded text-center text-xs text-blue-200", children: [language === 'de' ? 'Aktuell im Lehrgang für' : 'Currently in training for', " ", _jsx("strong", { children: getSkillLabel(playerData.partnerActiveTraining.skill) }), ". ", _jsx("br", {}), language === 'de' ? 'Ende' : 'Ends', ": ", new Date(playerData.partnerActiveTraining.endDate).toLocaleDateString()] })) : isTrainingCooldown && (_jsxs("div", { className: "bg-amber-900/30 border border-amber-600/50 p-2 rounded text-center text-[10px] text-amber-200", children: [language === 'de' ? 'Erschöpft. Nächste Fortbildung möglich ab' : 'Exhausted. Next training available from', ": ", new Date(new Date(playerData.partnerLastCourseDate).setMonth(new Date(playerData.partnerLastCourseDate).getMonth() + 6)).toLocaleDateString()] })), _jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.keys(skills).map(skill => (_jsxs("div", { className: "bg-gray-700/30 px-2 py-1 rounded border border-gray-600 relative group flex flex-col justify-center h-9", children: [_jsxs("div", { className: "flex justify-between items-end mb-0.5", children: [_jsx("span", { className: "text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[65%]", children: getSkillLabel(skill) }), _jsx("span", { className: "text-[9px] font-mono text-white", children: Math.round(skills[skill]) })] }), _jsx("div", { className: "w-full bg-gray-800 rounded-full h-1 overflow-hidden border border-gray-600/50", children: _jsx("div", { className: "bg-blue-500 h-1 rounded-full transition-all duration-500 ease-out", style: { width: `${Math.min(100, Math.max(0, skills[skill]))}%` } }) }), _jsx("button", { onClick: () => handleTrainClick(skill), disabled: playerData.privateCapital < trainingCost || isTrainingCooldown, className: "absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-gray-600 shadow-lg z-10", children: "TRAIN" })] }, skill))) }), _jsxs("div", { className: "mt-4 pt-4 border-t border-gray-600", children: [_jsx("h4", { className: "text-sm font-bold text-white mb-2", children: language === 'de' ? 'Studio-Anstellung' : 'Studio Employment' }), !showHireConfirm ? (_jsxs("div", { className: "flex gap-2 items-end", children: [_jsxs("div", { className: "flex-grow", children: [_jsx("label", { className: "block text-[9px] text-gray-400 mb-0.5", children: t.privatelife.family.labels.roleChoose }), _jsxs("select", { value: selectedRole, onChange: (e) => setSelectedRole(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-[10px]", disabled: isJobLocked, children: [_jsx("option", { value: "None", children: t.privatelife.family.actions.noJob }), _jsx("option", { value: "Actor", children: t.office.contacts.actors }), _jsx("option", { value: "Director", children: t.office.contacts.directors }), Object.values(EmployeeType).map(type => (_jsx("option", { value: type, children: t.office.employees.employeeTypes[Object.keys(t.office.employees.employeeTypes).find(k => t.office.employees.employeeTypes[k] === type)] || type }, type)))] })] }), _jsx("button", { onClick: () => setShowHireConfirm(true), className: "bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded uppercase text-[10px] h-7 disabled:bg-gray-600", disabled: isJobLocked, children: isEmployed ? (language === 'de' ? 'Wechsel' : 'Switch') : (language === 'de' ? 'Einstellen' : 'Hire') })] })) : (_jsxs("div", { className: "bg-gray-900 p-2 rounded border border-green-500 text-center", children: [_jsx("p", { className: "mb-2 text-white text-[10px]", children: selectedRole === 'None' ? t.privatelife.family.actions.reallyFire : t.privatelife.family.actions.reallyHire.replace('{role}', selectedRole) }), _jsxs("div", { className: "flex justify-center gap-2", children: [_jsx("button", { onClick: () => setShowHireConfirm(false), className: "bg-gray-600 px-2 py-1 rounded text-white text-[9px] font-bold", children: t.common.cancel }), _jsx("button", { onClick: () => { onHire(selectedRole); setShowHireConfirm(false); }, className: "bg-green-600 px-2 py-1 rounded text-white text-[9px] font-bold", children: t.common.confirm })] })] })), isJobLocked && _jsxs("p", { className: "text-[9px] text-red-400 mt-1.5 text-center", children: [t.privatelife.family.actions.positionLocked, " ", unlockDateStr] })] })] }))] }), showTrainingConfirm && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4", onClick: e => e.stopPropagation(), children: _jsxs("div", { className: "bg-gray-800 border border-blue-500 rounded-lg p-5 max-w-sm text-center shadow-2xl", children: [_jsx("h3", { className: "text-lg font-bold text-blue-400 mb-3", children: language === 'de' ? 'Lehrgang bestätigen' : 'Confirm Training' }), _jsx("p", { className: "text-gray-300 text-sm mb-1", children: language === 'de'
                                ? _jsxs(_Fragment, { children: [partnerName, " auf Lehrgang f\u00FCr ", _jsx("strong", { children: getSkillLabel(showTrainingConfirm.skill) }), " schicken?"] })
                                : _jsxs(_Fragment, { children: ["Send ", partnerName, " to training for ", _jsx("strong", { children: getSkillLabel(showTrainingConfirm.skill) }), "?"] }) }), _jsxs("p", { className: "text-gray-400 text-[10px] mb-3", children: [language === 'de' ? 'Dauer' : 'Duration', ": ", showTrainingConfirm.duration, " ", language === 'de' ? 'Stunden' : 'hours', " | ", language === 'de' ? 'Kosten' : 'Cost', ": ", trainingCost, "$"] }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setShowTrainingConfirm(null), className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 px-6 rounded text-xs uppercase", children: t.common.cancel }), _jsx("button", { onClick: confirmTraining, className: "bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-6 rounded text-xs uppercase", children: language === 'de' ? 'Starten' : 'Start' })] })] }) }))] }));
};
export default PartnerProfile;

