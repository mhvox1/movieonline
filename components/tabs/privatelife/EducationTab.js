import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ALL_COURSES, WEEKEND_SEMINARS, LEISURE_ACTIVITIES } from '../../privateLifeData';
import { useTranslation } from '../../../hooks/useTranslation';
import StarIcon from '../../icons/StarIcon';
import HeartIcon from '../../icons/HeartIcon';
const ProgressBar = ({ progress, color, label }) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("span", { className: "text-xs text-gray-300 font-semibold uppercase tracking-wider", children: label }), _jsxs("span", { className: "text-xs font-mono text-white", children: [Math.round(progress), "/100"] })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-600", children: _jsx("div", { className: `${color} h-full rounded-full transition-all duration-500 ease-out`, style: { width: `${progress}%` } }) })] }));
const TabButton = ({ title, isActive, onClick }) => (_jsx("button", { onClick: onClick, className: `py-2 px-4 font-bold text-sm transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 relative top-px whitespace-nowrap
            ${isActive
        ? 'bg-gray-800/80 text-amber-400 border-gray-700 border-t border-x rounded-t-lg'
        : 'bg-gray-900/50 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 border-b border-gray-700'}`, children: title }));
const StarEffect = ({ amount }) => {
    // 1-3 = 1 Star, 4-7 = 2 Stars, 8+ = 3 Stars
    let stars = 1;
    if (amount >= 8)
        stars = 3;
    else if (amount >= 4)
        stars = 2;
    return (_jsx("div", { className: "flex items-center gap-0.5", children: Array.from({ length: 3 }).map((_, i) => (_jsx(StarIcon, { className: `w-3 h-3 ${i < stars ? 'text-amber-400' : 'text-gray-700'}` }, i))) }));
};
const ActivityDetailsModal = ({ item, type, onClose, onConfirm, canAfford, isBusy, isCompleted, hasEnergy, cooldownActive, frequencyLimitReached, formatCurrency, t, skillNameMap }) => {
    const isGerman = t.common?.locale === 'de-DE';
    // Determine Name and Description (Translation Support)
    let title = item.name;
    let description = item.description;
    if (type === 'course' && t.privatelife.education.courses?.[item.id]) {
        title = t.privatelife.education.courses[item.id].name;
        description = t.privatelife.education.courses[item.id].description;
    }
    else if (type === 'seminar' && t.privatelife.education.seminars?.[item.id]) {
        title = t.privatelife.education.seminars[item.id].name;
        description = t.privatelife.education.seminars[item.id].description;
    }
    else if (type === 'leisure' && t.privatelife.education.activities?.[item.id]) {
        title = t.privatelife.education.activities[item.id].name;
        description = t.privatelife.education.activities[item.id].description;
    }
    else if (type === 'vacation') {
        title = t.privatelife.education.luxuryVacation;
        description = t.privatelife.education.luxuryVacationDesc;
    }
    let warning = '';
    if (!canAfford)
        warning = t.employeeDossier.notEnoughCapital;
    else if (!hasEnergy)
        warning = isGerman ? 'Nicht genügend Energie.' : 'Not enough energy.';
    else if (isBusy && type !== 'vacation')
        warning = isGerman ? 'Sie sind bereits beschäftigt.' : 'You are already busy.';
    else if (isCompleted)
        warning = t.privatelife.education.alreadyFinished;
    else if (cooldownActive)
        warning = isGerman ? 'Wartezeit nach Studium aktiv (60 Stunden).' : 'Study cooldown active (60 hours).';
    else if (frequencyLimitReached)
        warning = isGerman ? 'Maximal 1 Aktivität pro Monat.' : 'Maximum 1 activity per month.';
    return (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: onClose, children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-6 relative", onClick: e => e.stopPropagation(), children: [_jsx("h3", { className: "text-2xl font-bold font-cinzel text-amber-400 mb-4 text-center", children: title }), _jsxs("div", { className: "space-y-4 mb-6", children: [_jsx("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700", children: _jsxs("p", { className: "text-gray-300 italic text-sm leading-relaxed", children: ["\"", description, "\""] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-gray-900/50 p-3 rounded-lg border border-gray-700", children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider mb-1", children: isGerman ? 'Dauer' : 'Duration' }), _jsxs("p", { className: "text-white font-bold", children: [type === 'vacation' ? '14' : item.duration, " ", t.privatelife.education.days] })] }), _jsxs("div", { className: "bg-gray-900/50 p-3 rounded-lg border border-gray-700", children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider mb-1", children: isGerman ? 'Kosten' : 'Cost' }), _jsx("p", { className: `font-bold font-mono ${canAfford ? 'text-white' : 'text-red-400'}`, children: formatCurrency(type === 'vacation' ? 50000 : item.cost) })] })] }), (item.energyCost || item.weeklyEnergyCost || item.energyBonus) && (_jsxs("div", { className: "bg-gray-900/30 p-3 rounded-lg border border-gray-600/30 text-center", children: [_jsx("p", { className: "text-xs text-gray-300 uppercase tracking-wider font-bold mb-2", children: isGerman ? 'Energie' : 'Energy' }), item.energyBonus ? (_jsxs("p", { className: "text-lg font-bold text-green-400", children: ["+", item.energyBonus, " Vitalit\u00E4t"] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex justify-center gap-1", children: (() => {
                                                const cost = item.energyCost || item.weeklyEnergyCost;
                                                let heartCount = 1;
                                                if (cost >= 15)
                                                    heartCount = 3;
                                                else if (cost >= 8)
                                                    heartCount = 2;
                                                return Array.from({ length: heartCount }).map((_, i) => (_jsx(HeartIcon, { className: "w-5 h-5 text-red-500", filled: true }, i)));
                                            })() }), item.weeklyEnergyCost && _jsx("p", { className: "text-[10px] text-red-400 mt-1", children: "pro Stunde" })] }))] })), _jsxs("div", { className: "bg-blue-900/20 p-4 rounded-lg border border-blue-500/30", children: [_jsx("p", { className: "text-xs text-blue-300 uppercase tracking-wider mb-2 font-bold", children: "Effekt bei Abschluss" }), _jsxs("div", { className: "space-y-1", children: [type === 'vacation' && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg font-bold text-white", children: "100%" }), _jsx("span", { className: "text-sm text-gray-300", children: t.privatelife.education.energy })] })), item.skillBonus && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StarEffect, { amount: item.skillBonus.amount }), _jsx("span", { className: "text-sm text-gray-300", children: skillNameMap[item.skillBonus.skill] })] })), item.statBonus && item.statBonus.stat === 'personalReputation' && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StarEffect, { amount: item.statBonus.amount }), _jsx("span", { className: "text-sm text-gray-300", children: t.privatelife.overview.reputation })] })), item.energyBonus && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-lg font-bold text-white", children: ["+", item.energyBonus] }), _jsx("span", { className: "text-sm text-gray-300", children: t.privatelife.education.energy })] })), !item.skillBonus && !item.statBonus && !item.energyBonus && type !== 'vacation' && (_jsx("p", { className: "text-sm text-gray-400", children: "Kein direkter Bonus" }))] })] })] }), warning && _jsx("p", { className: "text-red-400 text-sm text-center mb-4 font-bold", children: warning }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: onClose, className: "flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-sm uppercase tracking-wider transition-colors", children: t.common.cancel }), _jsx("button", { onClick: () => { onConfirm(); onClose(); }, disabled: !canAfford || (isBusy && type !== 'vacation') || isCompleted || !hasEnergy || cooldownActive || frequencyLimitReached, className: "flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-sm uppercase tracking-wider transition-colors", children: isCompleted ? t.privatelife.education.alreadyFinished : t.common.confirm })] })] }) }));
};
export const EducationTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState('seminars');
    const [selectedItem, setSelectedItem] = useState(null);
    if (!playerData)
        return null;
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const skillNameMap = {
        negotiationSkill: t.newGame.skillNegotiation,
        charisma: t.newGame.skillCharisma,
        financialSense: t.newGame.skillFinance,
        filmSense: t.newGame.skillFilmSense,
        organizationTalent: t.newGame.skillOrganization
    };
    // Helpers for constraints
    const currentMonthKey = `${playerData.gameDate.getFullYear()}-${playerData.gameDate.getMonth()}`;
    const hasAttendedSeminarThisMonth = () => {
        if (!playerData.lastSeminarDate)
            return false;
        const last = new Date(playerData.lastSeminarDate);
        return `${last.getFullYear()}-${last.getMonth()}` === currentMonthKey;
    };
    const hasAttendedLeisureThisMonth = () => {
        if (!playerData.lastLeisureDate)
            return false;
        const last = new Date(playerData.lastLeisureDate);
        return `${last.getFullYear()}-${last.getMonth()}` === currentMonthKey;
    };
    const isCourseCooldownActive = () => {
        if (!playerData.lastCourseFinishDate)
            return false;
        const finishDate = new Date(playerData.lastCourseFinishDate);
        // Add 2 months (approx 60 days) to finish date
        const cooldownEnd = new Date(finishDate);
        cooldownEnd.setHours(cooldownEnd.getHours() + 60);
        return playerData.gameDate < cooldownEnd;
    };
    // --- REFACTORED HANDLERS: NO MORE TIME JUMPS ---
    const handleAttendSeminar = (seminar) => {
        if (playerData.privateCapital < seminar.cost)
            return;
        if (hasAttendedSeminarThisMonth())
            return;
        const energyCost = seminar.energyCost || 0;
        if ((playerData.energy || 100) < energyCost)
            return;
        const endDate = new Date(playerData.gameDate);
        endDate.setHours(endDate.getHours() + seminar.duration);
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                privateCapital: prev.privateCapital - seminar.cost,
                // Time jump removed here. We set activeSeminar instead.
                activeSeminar: {
                    id: seminar.id,
                    name: seminar.name,
                    startDate: new Date(prev.gameDate),
                    endDate: endDate,
                    type: 'seminar',
                    skillBonus: seminar.skillBonus,
                    // No stat bonus on seminars usually, but supported
                    energyChange: -energyCost
                },
                transactionLog: [...prev.transactionLog, {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Privatleben',
                        description: `Seminar: ${seminar.name}`,
                        amount: seminar.cost
                    }]
            };
        });
    };
    const confirmEnrollCourse = (course) => {
        if (playerData.privateCapital < course.cost)
            return;
        if (playerData.activeCourse)
            return;
        if (isCourseCooldownActive())
            return;
        const endDate = new Date(playerData.gameDate);
        endDate.setHours(endDate.getHours() + course.duration);
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                privateCapital: prev.privateCapital - course.cost,
                activeCourse: {
                    courseId: course.id,
                    endDate: endDate,
                    weeklyEnergyCost: course.weeklyEnergyCost
                },
                transactionLog: [...prev.transactionLog, {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Privatleben',
                        description: `Studium: ${course.name}`,
                        amount: course.cost
                    }]
            };
        });
    };
    const handleLeisureActivity = (activity) => {
        if (playerData.privateCapital < activity.cost)
            return;
        if (hasAttendedLeisureThisMonth())
            return;
        const energyCost = activity.energyCost || 0;
        if (energyCost > 0 && (playerData.energy || 100) < energyCost)
            return;
        const endDate = new Date(playerData.gameDate);
        endDate.setHours(endDate.getHours() + activity.duration);
        const energyBonus = activity.energyBonus || 0;
        const netEnergyChange = energyBonus - energyCost;
        // Get Translated Name for Log
        const translatedName = t.privatelife.education.activities?.[activity.id]?.name || activity.name;
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                privateCapital: prev.privateCapital - activity.cost,
                // Time jump removed. Set activeSeminar (used for both seminars and leisure tracking)
                activeSeminar: {
                    id: activity.id,
                    name: translatedName,
                    startDate: new Date(prev.gameDate),
                    endDate: endDate,
                    type: 'leisure',
                    skillBonus: activity.skillBonus,
                    statBonus: activity.statBonus,
                    energyChange: netEnergyChange
                },
                transactionLog: [...prev.transactionLog, {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Privatleben',
                        description: `Freizeit: ${translatedName}`,
                        amount: activity.cost
                    }]
            };
        });
    };
    const handleVacation = () => {
        // Vacation still jumps time as it is a long "skip" feature, typically requested to skip time.
        // If user wants that non-blocking too, it would need a 2-week blocking state. 
        // For now, keeping vacation as a "Wait" mechanic seems appropriate for "2 weeks off".
        const vacationCost = 50000;
        if (playerData.privateCapital < vacationCost)
            return;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const newDate = new Date(prev.gameDate);
            newDate.setHours(newDate.getHours() + 14);
            return {
                ...prev,
                privateCapital: prev.privateCapital - vacationCost,
                gameDate: newDate,
                energy: 100, // Full restore
                transactionLog: [...prev.transactionLog, {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Privatleben',
                        description: `Luxusurlaub`,
                        amount: vacationCost
                    }]
            };
        });
    };
    const handleConfirmSelection = () => {
        if (!selectedItem)
            return;
        switch (selectedItem.type) {
            case 'seminar':
                handleAttendSeminar(selectedItem.data);
                break;
            case 'leisure':
                handleLeisureActivity(selectedItem.data);
                break;
            case 'course':
                confirmEnrollCourse(selectedItem.data);
                break;
            case 'vacation':
                handleVacation();
                break;
        }
        setSelectedItem(null);
    };
    const isBusyWithSeminar = !!playerData.activeSeminar;
    return (_jsxs("div", { className: "w-full h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold font-cinzel text-amber-400", children: t.privatelife.screen.nav.education }), _jsxs("div", { className: "text-sm text-gray-400", children: [t.privatelife.status.privateCapital, ": ", _jsx("span", { className: "font-bold text-white ml-2", children: formatCurrency(playerData.privateCapital) })] })] }), _jsx("div", { className: "flex-grow p-6 overflow-y-auto", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 h-full", children: [_jsxs("div", { className: "bg-gray-800/60 p-6 rounded-lg border border-gray-700 h-fit", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2", children: t.privatelife.education.attributesTitle }), _jsxs("div", { className: "space-y-6", children: [_jsx(ProgressBar, { progress: playerData.negotiationSkill, color: "bg-amber-500", label: t.newGame.skillNegotiation }), _jsx(ProgressBar, { progress: playerData.charisma, color: "bg-amber-500", label: t.newGame.skillCharisma }), _jsx(ProgressBar, { progress: playerData.financialSense, color: "bg-amber-500", label: t.newGame.skillFinance }), _jsx(ProgressBar, { progress: playerData.filmSense, color: "bg-amber-500", label: t.newGame.skillFilmSense }), _jsx(ProgressBar, { progress: playerData.organizationTalent, color: "bg-amber-500", label: t.newGame.skillOrganization })] }), playerData.activeCourse && (_jsxs("div", { className: "mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-center animate-pulse", children: [_jsx("p", { className: "text-blue-300 font-bold text-sm uppercase tracking-wider mb-1", children: t.privatelife.education.currentStudy }), _jsxs("p", { className: "text-white font-bold text-lg", children: ["\"", t.privatelife.education.courses?.[playerData.activeCourse.courseId]?.name || ALL_COURSES.find(c => c.id === playerData.activeCourse.courseId)?.name, "\""] }), _jsx("p", { className: "text-gray-400 text-xs mt-1", children: t.privatelife.education.finishedAt.replace('{date}', new Date(playerData.activeCourse.endDate).toLocaleDateString(locale)) })] })), playerData.activeSeminar && (_jsxs("div", { className: "mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center", children: [_jsx("p", { className: "text-yellow-300 font-bold text-sm uppercase tracking-wider mb-1", children: language === 'de' ? 'Aktive Teilnahme' : 'Active Participation' }), _jsxs("p", { className: "text-white font-bold text-lg", children: ["\"", playerData.activeSeminar.name, "\""] }), _jsxs("p", { className: "text-gray-400 text-xs mt-1", children: [language === 'de' ? 'Läuft noch bis' : 'Runs until', " ", new Date(playerData.activeSeminar.endDate).toLocaleDateString(locale)] })] })), isCourseCooldownActive() && !playerData.activeCourse && (_jsx("div", { className: "mt-8 p-4 bg-gray-900/50 border border-gray-600 rounded-lg text-center", children: _jsx("p", { className: "text-gray-400 text-sm", children: language === 'de' ? 'Wartezeit nach Studium aktiv (60 Stunden).' : 'Study cooldown active. Recovery required.' }) }))] }), _jsxs("div", { className: "bg-gray-800/60 rounded-lg border border-gray-700 overflow-hidden flex flex-col h-full", children: [_jsxs("div", { className: "px-4 pt-3 border-b border-gray-700 bg-gray-800/30 flex overflow-x-auto", children: [_jsx(TabButton, { title: t.privatelife.education.tabs.seminars, isActive: activeTab === 'seminars', onClick: () => setActiveTab('seminars') }), _jsx(TabButton, { title: t.privatelife.education.tabs.studies, isActive: activeTab === 'studies', onClick: () => setActiveTab('studies') }), _jsx(TabButton, { title: t.privatelife.education.tabs.leisure, isActive: activeTab === 'leisure', onClick: () => setActiveTab('leisure') })] }), _jsxs("div", { className: "p-6 overflow-y-auto custom-scrollbar flex-grow", children: [activeTab === 'seminars' && (_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold text-amber-400 mb-4 flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: "\u26A1" }), " ", t.privatelife.education.seminarsTitle] }), hasAttendedSeminarThisMonth() && _jsx("p", { className: "text-xs text-red-400 mb-2", children: language === 'de' ? 'Monatslimit erreicht.' : 'Monthly limit reached.' }), _jsx("div", { className: "space-y-3", children: WEEKEND_SEMINARS.map(sem => {
                                                        const transName = t.privatelife.education.seminars?.[sem.id]?.name || sem.name;
                                                        const transDesc = t.privatelife.education.seminars?.[sem.id]?.description || sem.description;
                                                        return (_jsxs("button", { onClick: () => setSelectedItem({ type: 'seminar', data: sem }), disabled: hasAttendedSeminarThisMonth() || isBusyWithSeminar, className: `w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors ${(hasAttendedSeminarThisMonth() || isBusyWithSeminar) ? 'opacity-50 cursor-not-allowed' : ''}`, children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-white group-hover:text-amber-200 transition-colors", children: transName }), _jsx("p", { className: "text-xs text-gray-400", children: transDesc }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx(StarEffect, { amount: sem.skillBonus.amount }), _jsx("span", { className: "text-xs text-green-400 font-bold", children: skillNameMap[sem.skillBonus.skill] })] })] }), _jsx("div", { className: "text-right", children: _jsx("span", { className: `text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= sem.cost ? 'bg-blue-900/40 text-blue-300' : 'bg-red-900/40 text-red-300'}`, children: formatCurrency(sem.cost) }) })] }, sem.id));
                                                    }) })] })), activeTab === 'leisure' && (_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold text-amber-400 mb-4 flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: "\uD83C\uDF34" }), " ", t.privatelife.education.leisureTitle] }), hasAttendedLeisureThisMonth() && _jsx("p", { className: "text-xs text-red-400 mb-2", children: language === 'de' ? 'Monatslimit erreicht.' : 'Monthly limit reached.' }), _jsxs("div", { className: "space-y-3", children: [LEISURE_ACTIVITIES.map(activity => {
                                                            const translatedName = t.privatelife.education.activities?.[activity.id]?.name || activity.name;
                                                            const translatedDesc = t.privatelife.education.activities?.[activity.id]?.description || activity.description;
                                                            return (_jsxs("button", { onClick: () => setSelectedItem({ type: 'leisure', data: activity }), disabled: hasAttendedLeisureThisMonth() || isBusyWithSeminar, className: `w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors ${(hasAttendedLeisureThisMonth() || isBusyWithSeminar) ? 'opacity-50 cursor-not-allowed' : ''}`, children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-white group-hover:text-amber-200 transition-colors", children: translatedName }), _jsx("p", { className: "text-xs text-gray-400", children: translatedDesc }), _jsxs("div", { className: "flex gap-2 mt-1 items-center", children: [activity.statBonus && activity.statBonus.stat === 'personalReputation' && (_jsxs(_Fragment, { children: [_jsx(StarEffect, { amount: activity.statBonus.amount }), _jsx("span", { className: "text-xs text-green-400 font-bold", children: t.privatelife.overview.reputation })] })), activity.skillBonus && (_jsxs(_Fragment, { children: [_jsx(StarEffect, { amount: activity.skillBonus.amount }), _jsx("span", { className: "text-xs text-cyan-400 font-bold", children: skillNameMap[activity.skillBonus.skill] })] })), activity.energyBonus && (_jsx(_Fragment, { children: _jsxs("span", { className: "text-xs text-green-400 font-bold", children: ["+", activity.energyBonus, " ", t.privatelife.education.energy] }) }))] })] }), _jsx("div", { className: "text-right", children: _jsx("span", { className: `text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= activity.cost ? 'bg-blue-900/40 text-blue-300' : 'bg-red-900/40 text-red-300'}`, children: activity.cost > 0 ? formatCurrency(activity.cost) : _jsx("span", { className: "text-green-400", children: language === 'de' ? 'Gratis' : 'Free' }) }) })] }, activity.id));
                                                        }), _jsxs("button", { onClick: () => setSelectedItem({ type: 'vacation', data: {} }), className: "w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors", children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-white group-hover:text-amber-200 transition-colors", children: t.privatelife.education.luxuryVacation }), _jsx("p", { className: "text-xs text-gray-400", children: t.privatelife.education.luxuryVacationDesc })] }), _jsx("div", { className: "text-right", children: _jsx("span", { className: `text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= 50000 ? 'bg-purple-900/40 text-purple-300' : 'bg-red-900/40 text-red-300'}`, children: formatCurrency(50000) }) })] })] })] })), activeTab === 'studies' && (_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold text-amber-400 mb-4 flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: "\uD83C\uDF93" }), " ", t.privatelife.education.studiesTitle] }), isCourseCooldownActive() && !playerData.activeCourse && _jsx("p", { className: "text-xs text-red-400 mb-2", children: "Wartezeit aktiv." }), _jsx("div", { className: "space-y-3", children: ALL_COURSES.map(course => {
                                                        const transName = t.privatelife.education.courses?.[course.id]?.name || course.name;
                                                        const transDesc = t.privatelife.education.courses?.[course.id]?.description || course.description;
                                                        return (_jsxs("button", { onClick: () => setSelectedItem({ type: 'course', data: course }), disabled: (isCourseCooldownActive() && !playerData.activeCourse) || isBusyWithSeminar, className: `w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors ${((isCourseCooldownActive() && !playerData.activeCourse) || isBusyWithSeminar) ? 'opacity-50 cursor-not-allowed' : ''}`, children: [_jsxs("div", { className: "max-w-[70%]", children: [_jsx("p", { className: "font-bold text-white group-hover:text-amber-200 transition-colors", children: transName }), _jsx("p", { className: "text-xs text-gray-400 line-clamp-1", children: transDesc }), _jsxs("div", { className: "flex gap-2 mt-1 items-center", children: [_jsx(StarEffect, { amount: course.skillBonus?.amount || 0 }), _jsx("span", { className: "text-xs text-blue-400 font-bold", children: course.skillBonus ? skillNameMap[course.skillBonus.skill] : '' })] }), playerData.completedCourses.includes(course.id) && _jsx("span", { className: "text-[10px] text-green-500 font-bold uppercase mt-1 block", children: t.privatelife.education.alreadyFinished })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-xs text-gray-400 mb-1", children: [course.duration, " ", t.privatelife.education.days] }), _jsx("span", { className: `text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= course.cost ? 'bg-amber-900/40 text-amber-300' : 'bg-red-900/40 text-red-300'}`, children: formatCurrency(course.cost) })] })] }, course.id));
                                                    }) })] }))] })] })] }) }), selectedItem && (_jsx(ActivityDetailsModal, { item: selectedItem.data, type: selectedItem.type, onClose: () => setSelectedItem(null), onConfirm: handleConfirmSelection, canAfford: playerData.privateCapital >= (selectedItem.type === 'vacation' ? 50000 : selectedItem.data.cost), isBusy: !!playerData.activeCourse || isBusyWithSeminar, isCompleted: selectedItem.type === 'course' && playerData.completedCourses.includes(selectedItem.data.id), hasEnergy: selectedItem.type !== 'leisure' ? (playerData.energy || 0) >= (selectedItem.data.energyCost || 0) : true, cooldownActive: selectedItem.type === 'course' && isCourseCooldownActive(), frequencyLimitReached: (selectedItem.type === 'seminar' && hasAttendedSeminarThisMonth()) || (selectedItem.type === 'leisure' && hasAttendedLeisureThisMonth()), formatCurrency: formatCurrency, t: t, skillNameMap: skillNameMap }))] }));
};

