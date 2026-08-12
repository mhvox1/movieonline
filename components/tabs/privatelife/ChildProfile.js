import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo, useRef } from 'react';
import { EmployeeType } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { msToHours } from '../../../hooks/timeUtils';
import { SCHOOL_TYPES, SECONDARY_SCHOOL_TYPES, UNIVERSITY_TYPES, CHILD_INTERACTIONS, UNIVERSITY_MAJORS } from '../../privateLifeData';
import HeartIcon from '../../icons/HeartIcon';
import StarIcon from '../../icons/StarIcon';
import FolderIcon from '../../icons/FolderIcon'; // Import FolderIcon
// Custom Star Rating for Schools (supports halves)
const SchoolStarRating = ({ stars }) => {
    return (_jsx("div", { className: "flex items-center gap-0.5", children: [1, 2, 3].map((index) => {
            let fill = 'text-gray-600'; // Empty
            if (stars >= index) {
                fill = 'text-yellow-400'; // Full
            }
            else if (stars >= index - 0.5) {
                return (_jsxs("div", { className: "relative w-3 h-3", children: [_jsx(StarIcon, { className: "w-3 h-3 text-gray-600 absolute top-0 left-0" }), _jsx("div", { className: "w-1.5 h-3 overflow-hidden absolute top-0 left-0", children: _jsx(StarIcon, { className: "w-3 h-3 text-yellow-400" }) })] }, index));
            }
            return _jsx(StarIcon, { className: `w-3 h-3 ${fill}` }, index);
        }) }));
};
const ChildProfile = ({ child, playerData, onInteract, onHire, onTrain, onRequestEnrollment, getPortraitUrl }) => {
    const { t, language } = useTranslation();
    const { setPlayerData } = useGame();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [activeTab, setActiveTab] = useState('development');
    const [showHireConfirm, setShowHireConfirm] = useState(false);
    const [showTrainingConfirm, setShowTrainingConfirm] = useState(null);
    const [selectedRole, setSelectedRole] = useState(EmployeeType.Autor);
    // File Input Ref
    const fileInputRef = useRef(null);
    React.useEffect(() => {
        if (child.isEmployed && child.employedAs) {
            setSelectedRole(child.employedAs);
        }
        else {
            setSelectedRole('None');
        }
    }, [child.isEmployed, child.employedAs]);
    const activePortraitUrl = getPortraitUrl(child.portraitId, child.birthDate, playerData.gameDate);
    const childAge = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
    const activeBirthDate = child.birthDate;
    const isSchoolAge = childAge >= 6;
    const isFemale = child.gender === 'Mädchen';
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const skillList = ['acting', 'directing', 'writing', 'scouting', 'research', 'marketing', 'planning'];
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
    let activeJob = t.privatelife.family.lifeStages.toddler || (language === 'de' ? 'Kleinkind' : 'Toddler');
    const getGenderedJob = (base) => {
        if (language !== 'de')
            return base;
        return isFemale ? `${base}in` : base;
    };
    const professionMap = {
        'Actor': isFemale ? (t.newspaper.roles.actress || 'Schauspielerin') : (t.newspaper.roles.actor || 'Schauspieler'),
        'Director': isFemale ? (t.newspaper.roles.directress || 'Regisseurin') : (t.newspaper.roles.director || 'Regisseur'),
        [EmployeeType.Autor]: t.office.employees.employeeTypes.autor,
        [EmployeeType.CastingMitarbeiter]: t.office.employees.employeeTypes.castingMitarbeiter,
        [EmployeeType.Forscher]: t.office.employees.employeeTypes.forscher,
        [EmployeeType.Marketingmanager]: t.office.employees.employeeTypes.marketingmanager,
        [EmployeeType.ProjektPlaner]: t.office.employees.employeeTypes.projektPlaner,
    };
    if (child.isEmployed && child.employedAs) {
        if (child.employedAs === 'Actor' || child.employedAs === 'Director') {
            activeJob = professionMap[child.employedAs];
        }
        else {
            const baseTitle = professionMap[child.employedAs] || child.employedAs;
            activeJob = getGenderedJob(baseTitle);
        }
    }
    else if (child.isGraduated) {
        const studiedProfessionKey = child.universityMajor;
        let professionName = studiedProfessionKey ? (professionMap[studiedProfessionKey] || studiedProfessionKey) : '';
        if (language === 'de' && studiedProfessionKey && studiedProfessionKey !== 'Actor' && studiedProfessionKey !== 'Director') {
            professionName = getGenderedJob(professionName);
        }
        activeJob = professionName || t.privatelife.family.lifeStages.graduate;
    }
    else if (childAge >= 18) {
        activeJob = t.privatelife.family.lifeStages.student;
    }
    else if (childAge >= 6) {
        activeJob = t.privatelife.family.lifeStages.pupil;
    }
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    let currentSchool = null;
    if (child.schoolId) {
        currentSchool = SCHOOL_TYPES.find(s => s.id === child.schoolId) ||
            SECONDARY_SCHOOL_TYPES.find(s => s.id === child.schoolId) ||
            UNIVERSITY_TYPES.find(s => s.id === child.schoolId);
    }
    const availableInteractions = useMemo(() => {
        return CHILD_INTERACTIONS.filter(i => childAge >= i.minAge && childAge <= i.maxAge);
    }, [childAge]);
    const lastInteraction = child.lastInteractionDate ? new Date(child.lastInteractionDate) : null;
    const hoursSinceInteraction = lastInteraction ? msToHours(new Date(playerData.gameDate).getTime() - lastInteraction.getTime()) : 999;
    const interactionAvailable = hoursSinceInteraction >= 76 || isTestMode;
    const hoursUntilInteraction = Math.max(0, 76 - hoursSinceInteraction);
    const trainingCost = 1500;
    const isTrainingCooldown = React.useMemo(() => {
        if (child.activeTraining)
            return true;
        if (!child.lastCourseDate)
            return false;
        const cooldownEnd = new Date(child.lastCourseDate);
        cooldownEnd.setMonth(cooldownEnd.getMonth() + 6);
        return playerData.gameDate < cooldownEnd;
    }, [child.lastCourseDate, playerData.gameDate, child.activeTraining]);
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
    const isAdult = childAge >= 18;
    const isEmployed = child.isEmployed;
    const isGraduated = child.isGraduated;
    const isJobLocked = useMemo(() => {
        if (!child.jobAssignedDate)
            return false;
        const assignedDate = new Date(child.jobAssignedDate);
        const unlockDate = new Date(assignedDate);
        unlockDate.setMonth(unlockDate.getMonth() + 6);
        return playerData.gameDate < unlockDate;
    }, [child.jobAssignedDate, playerData.gameDate]);
    const unlockDateStr = useMemo(() => {
        if (!child.jobAssignedDate)
            return "";
        const assignedDate = new Date(child.jobAssignedDate);
        const unlockDate = new Date(assignedDate);
        unlockDate.setMonth(unlockDate.getMonth() + 6);
        return unlockDate.toLocaleDateString(locale);
    }, [child.jobAssignedDate, locale]);
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
                setPlayerData(prev => {
                    if (!prev)
                        return null;
                    return {
                        ...prev,
                        children: prev.children.map(c => c.id === child.id ? { ...c, portraitId: base64String } : c)
                    };
                });
            };
            reader.readAsDataURL(file);
        }
    };
    return (_jsxs("div", { className: "flex flex-col h-full overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4 border-b border-gray-600 pb-3", children: [_jsxs("div", { className: "relative group", children: [_jsx("div", { className: "w-32 h-32 bg-pink-900/30 rounded-full flex items-center justify-center border-2 border-pink-500/50 overflow-hidden flex-shrink-0", children: activePortraitUrl ? (_jsx("img", { src: activePortraitUrl, alt: child.name, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-2xl", children: "?" })) }), _jsx("div", { className: "absolute bottom-0 right-0 p-1.5 bg-gray-800 hover:bg-amber-600 rounded-full cursor-pointer transition-colors border border-gray-500 shadow-md flex items-center justify-center z-10", onClick: handleUploadClick, title: language === 'de' ? 'Bild ändern' : 'Change Image', children: _jsx(FolderIcon, { className: "w-3 h-3 text-white" }) }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileUpload, accept: "image/*", className: "hidden" })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-white leading-tight", children: child.name }), _jsx("p", { className: "text-gray-400 text-xs", children: activeJob }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsxs("p", { className: "text-[10px] text-gray-500", children: [childAge, " ", t.talentDossier.years] }), activeBirthDate && _jsxs("p", { className: "text-[10px] text-gray-500", children: ["(", new Date(activeBirthDate).toLocaleDateString(locale), ")"] })] })] })] }), _jsxs("div", { className: "mb-3 space-y-2", children: [_jsxs("div", { className: "p-2 bg-gray-700/30 rounded border border-gray-600", children: [_jsxs("div", { className: "flex justify-between items-center mb-0.5", children: [_jsxs("h4", { className: "text-pink-400 font-bold uppercase text-[10px] flex items-center gap-1", children: [_jsx(HeartIcon, { className: "w-2.5 h-2.5", filled: true }), " ", t.talentDossier.loyalty] }), _jsxs("span", { className: "text-[10px] font-mono text-white", children: [Math.round(child.relationship || 0), "/100"] })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-1.5 overflow-hidden border border-gray-600", children: _jsx("div", { className: "bg-pink-500 h-1.5 rounded-full transition-all duration-500 ease-out", style: { width: `${child.relationship || 0}%` } }) })] }), isSchoolAge && !isGraduated ? (_jsxs("div", { className: "p-2 bg-gray-700/30 rounded border border-gray-600", children: [_jsx("div", { className: "flex justify-between items-center mb-0.5", children: _jsx("h4", { className: "text-blue-400 font-bold uppercase text-[10px]", children: childAge >= 18 ? t.privatelife.education.universityEnrollmentTitle : (language === 'de' ? 'Schule' : 'School') }) }), currentSchool ? (_jsxs("div", { children: [_jsx("p", { className: "text-white text-xs font-bold leading-tight truncate", children: currentSchool.name }), child.universityMajor && (_jsxs("p", { className: "text-[9px] text-amber-300", children: [language === 'de' ? 'Studium' : 'Major', ": ", UNIVERSITY_MAJORS[child.universityMajor] || child.universityMajor] })), _jsxs("div", { className: "flex justify-between mt-1 text-[10px]", children: [_jsx("span", { className: "text-gray-500", children: currentSchool.monthlyCost > 0 ? formatCurrency(currentSchool.monthlyCost) : (language === 'de' ? 'Gratis' : 'Free') }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsxs("span", { className: "text-gray-500", children: [language === 'de' ? 'Qualität' : 'Quality', ":"] }), _jsx(SchoolStarRating, { stars: currentSchool.stars })] })] })] })) : (_jsx("div", { className: "text-center py-1", children: _jsx("p", { className: "text-red-400 text-xs font-bold", children: language === 'de' ? 'Schulpflicht!' : 'School enrollment required!' }) }))] })) : null] }), _jsxs("div", { className: "flex border-b border-gray-600 mb-3 text-xs", children: [_jsx("button", { onClick: () => setActiveTab('development'), className: `flex-1 py-1.5 font-bold transition-colors ${activeTab === 'development' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-white'}`, children: t.privatelife.family.tabs.development }), _jsx("button", { onClick: () => setActiveTab('talents'), className: `flex-1 py-1.5 font-bold transition-colors ${activeTab === 'talents' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-white'}`, children: t.privatelife.family.tabs.talents })] }), _jsxs("div", { className: "flex-grow overflow-y-auto pr-2 custom-scrollbar", children: [activeTab === 'development' && (_jsx("div", { className: "space-y-2", children: availableInteractions.length > 0 ? (_jsx("div", { className: "space-y-2", children: availableInteractions.map(interaction => {
                                const canAfford = playerData.privateCapital >= interaction.cost;
                                const hasEnergy = (playerData.energy || 0) >= interaction.energyCost;
                                const disabled = !canAfford || !hasEnergy || !interactionAvailable;
                                const transLabel = t.privatelife.interactions?.[interaction.id]?.label || interaction.label;
                                const transDesc = t.privatelife.interactions?.[interaction.id]?.description || interaction.description;
                                return (_jsxs("button", { onClick: () => onInteract(interaction.id), disabled: disabled, className: "w-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 border border-gray-600 p-1.5 rounded text-left flex justify-between items-center group transition-colors relative", children: [_jsxs("div", { className: "min-w-0 pr-2", children: [_jsx("span", { className: "font-semibold text-white block text-xs truncate", children: transLabel }), _jsx("span", { className: "text-[9px] text-gray-400 line-clamp-1", children: transDesc })] }), _jsx("div", { className: "text-right flex flex-col items-end flex-shrink-0", children: _jsx("div", { className: "text-[10px] font-bold", children: interaction.cost > 0 ? (_jsx("span", { className: canAfford ? 'text-amber-400' : 'text-red-400', children: formatCurrency(interaction.cost) })) : (_jsx("span", { className: "text-green-400", children: language === 'de' ? 'Gratis' : 'Free' })) }) }), !interactionAvailable && _jsx("div", { className: "absolute inset-0 bg-black/60 rounded flex items-center justify-center text-[10px] font-bold text-white z-20", children: language === 'de' ? `Warten (${hoursUntilInteraction} Stunden)` : `Wait (${hoursUntilInteraction} hours)` })] }, interaction.id));
                            }) })) : (_jsx("p", { className: "text-gray-500 italic text-center text-[10px]", children: language === 'de' ? 'Keine Interaktionen verfügbar.' : 'No interactions available.' })) })), activeTab === 'talents' && isGraduated && (_jsxs("div", { className: "space-y-4", children: [child.skills ? (_jsxs("div", { className: "bg-gray-700/30 p-2 rounded border border-gray-600", children: [_jsx("h4", { className: "text-pink-400 font-bold mb-2 uppercase text-[10px]", children: t.privatelife.family.tabs.talents }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: skillList.map(skill => (_jsxs("div", { className: "bg-gray-700/30 px-2 py-1 rounded border border-gray-600 relative group flex flex-col justify-center h-9", children: [_jsxs("div", { className: "flex justify-between items-end mb-0.5", children: [_jsx("span", { className: "text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[65%]", children: getSkillLabel(skill) }), _jsx("span", { className: "text-[9px] font-mono text-white", children: Math.round(child.skills[skill]) })] }), _jsx("div", { className: "w-full bg-gray-800 rounded-full h-1 overflow-hidden border border-gray-600/50", children: _jsx("div", { className: "bg-blue-500 h-1 rounded-full transition-all duration-500 ease-out", style: { width: `${Math.min(100, Math.max(0, child.skills[skill]))}%` } }) }), _jsx("button", { onClick: () => handleTrainClick(skill), disabled: playerData.privateCapital < trainingCost || isTrainingCooldown, className: "absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-gray-600 shadow-lg z-10", children: "TRAIN" })] }, skill))) })] })) : null, child.isEmployed ? (_jsxs("div", { className: "p-2 bg-green-900/20 border border-green-500/50 rounded text-center", children: [_jsx("p", { className: "text-green-400 font-bold text-xs", children: language === 'de' ? 'Angestellt' : 'Employed' }), _jsxs("p", { className: "text-[10px] text-gray-400", children: [language === 'de' ? 'Rolle' : 'Role', ": ", activeJob] })] })) : (_jsxs("div", { className: "pt-2 border-t border-gray-700", children: [_jsxs("div", { className: "flex gap-2 items-end", children: [_jsxs("div", { className: "flex-grow", children: [_jsx("label", { className: "block text-[10px] text-gray-400 mb-0.5", children: language === 'de' ? 'Rolle wählen' : 'Choose Role' }), _jsxs("select", { value: selectedRole, onChange: (e) => setSelectedRole(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-[10px]", disabled: isJobLocked, children: [_jsx("option", { value: "None", children: t.privatelife.family.actions.noJob }), _jsx("option", { value: "Actor", children: t.office.contacts.actors }), _jsx("option", { value: "Director", children: t.office.contacts.directors }), Object.values(EmployeeType).map(type => (_jsx("option", { value: type, children: t.office.employees.employeeTypes[Object.keys(t.office.employees.employeeTypes).find(k => t.office.employees.employeeTypes[k] === type)] || type }, type)))] })] }), _jsx("button", { onClick: () => setShowHireConfirm(true), className: "bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded uppercase text-[10px] h-7 disabled:bg-gray-600", disabled: isJobLocked, children: "OK" })] }), isJobLocked && _jsxs("p", { className: "text-[9px] text-red-400 mt-1 text-center", children: [t.privatelife.family.actions.positionLocked, " ", unlockDateStr] })] })), child.skills && (_jsx("div", { className: "pt-2 border-t border-gray-700", children: child.activeTraining ? (_jsxs("div", { className: "bg-blue-900/30 border border-blue-600/50 p-2 rounded text-center text-[10px] text-blue-200", children: [t.widgets.activities.inTraining, ": ", _jsx("strong", { children: getSkillLabel(child.activeTraining.skill) }), ". ", _jsx("br", {}), "Ende: ", new Date(child.activeTraining.endDate).toLocaleDateString(locale)] })) : (_jsx("p", { className: "text-[9px] text-gray-500 italic text-center", children: language === 'de' ? 'Skill für Training wählen.' : 'Choose a skill for training.' })) }))] }))] }), showHireConfirm && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4", onClick: () => setShowHireConfirm(false), children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg p-5 max-w-sm w-full text-center", onClick: e => e.stopPropagation(), children: [_jsx("h3", { className: "text-lg font-bold text-amber-400 mb-3", children: t.privatelife.family.actions.securityQuestion }), _jsx("p", { className: "text-white text-xs mb-1 font-bold", children: selectedRole === 'None'
                                ? t.privatelife.family.actions.reallyFire
                                : t.privatelife.family.actions.reallyHire.replace('{role}', selectedRole) }), _jsx("p", { className: "text-[10px] text-gray-300 mb-4", children: language === 'de' ? 'Dies beendet das aktuelle Arbeitsverhältnis sofort.' : 'This will end the current employment immediately.' }), _jsxs("div", { className: "flex justify-center gap-3", children: [_jsx("button", { onClick: () => setShowHireConfirm(false), className: "bg-gray-600 px-4 py-1.5 rounded text-white text-xs font-bold", children: t.common.cancel }), _jsx("button", { onClick: () => { onHire(selectedRole); setShowHireConfirm(false); }, className: "bg-green-600 px-4 py-1.5 rounded text-white text-xs font-bold", children: t.common.confirm })] })] }) })), showTrainingConfirm && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4", onClick: e => e.stopPropagation(), children: _jsxs("div", { className: "bg-gray-800 border border-blue-500 rounded-lg p-5 max-w-sm text-center shadow-2xl", children: [_jsx("h3", { className: "text-lg font-bold text-blue-400 mb-3", children: language === 'de' ? 'Lehrgang bestätigen' : 'Confirm Training' }), _jsx("p", { className: "text-gray-300 text-sm mb-1", children: language === 'de'
                                ? _jsxs(_Fragment, { children: [child.name, " auf Lehrgang f\u00FCr ", _jsx("strong", { children: getSkillLabel(showTrainingConfirm.skill) }), " schicken?"] })
                                : _jsxs(_Fragment, { children: ["Send ", child.name, " to training for ", _jsx("strong", { children: getSkillLabel(showTrainingConfirm.skill) }), "?"] }) }), _jsxs("p", { className: "text-gray-400 text-[10px] mb-3", children: [language === 'de' ? 'Dauer' : 'Duration', ": ", showTrainingConfirm.duration, " ", t.privatelife.education.days, " | ", language === 'de' ? 'Kosten' : 'Cost', ": ", trainingCost, "$"] }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setShowTrainingConfirm(null), className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 px-6 rounded text-xs uppercase", children: t.common.cancel }), _jsx("button", { onClick: confirmTraining, className: "bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-6 rounded text-xs uppercase", children: language === 'de' ? 'Starten' : 'Start' })] })] }) }))] }));
};
export default ChildProfile;

