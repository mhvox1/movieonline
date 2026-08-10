import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ALL_PROPERTIES } from '../../privateLifeData';
import { PROPERTY_IMAGES } from '../../images/propertyImages';
import { useTranslation } from '../../../hooks/useTranslation';
import { MaritalStatus } from '../../../types';
const ProgressBar = ({ progress, color, label }) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("span", { className: "text-xs text-gray-300 font-semibold uppercase tracking-wider", children: label }), _jsxs("span", { className: "text-xs font-mono text-white", children: [Math.round(progress), "/100"] })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-2 overflow-hidden border border-gray-600", children: _jsx("div", { className: `${color} h-full rounded-full transition-all duration-500 ease-out`, style: { width: `${progress}%` } }) })] }));
// Helper to calculate portrait URL based on age
const getPlayerPortraitUrl = (baseId, birthDate, gameDate) => {
    if (!baseId)
        return null;
    // Support for custom uploaded images (Base64 Data URLs)
    if (baseId.startsWith('data:image')) {
        return baseId;
    }
    const birth = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    let ageSuffix;
    if (age <= 15) {
        ageSuffix = 'k';
    }
    else if (age >= 16 && age <= 34) {
        ageSuffix = 'j';
    }
    else if (age >= 35 && age <= 59) {
        ageSuffix = 'm';
    }
    else { // age >= 60
        ageSuffix = 'a';
    }
    return `./portrait/${baseId}${ageSuffix}.png`;
};
export const OverviewTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    if (!playerData)
        return null;
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const currentResidence = useMemo(() => {
        return ALL_PROPERTIES.find(p => p.id === playerData.activePropertyId) || ALL_PROPERTIES[0];
    }, [playerData.activePropertyId]);
    // Localized Property Name & Description
    const residenceName = t.privatelife.properties[currentResidence.id]?.name || currentResidence.name;
    const residenceDesc = t.privatelife.properties[currentResidence.id]?.description || currentResidence.description;
    const backgroundUrl = useMemo(() => {
        return PROPERTY_IMAGES[playerData.activePropertyId] || PROPERTY_IMAGES['prop_rental'];
    }, [playerData.activePropertyId]);
    const energy = playerData.energy !== undefined ? playerData.energy : 100;
    // Determine energy color/state text
    let energyColor = "text-yellow-400";
    let energyBarColor = "bg-yellow-500";
    if (energy >= 80) {
        energyColor = "text-green-400";
        energyBarColor = "bg-green-500";
    }
    else if (energy < 30) {
        energyColor = "text-red-400";
        energyBarColor = "bg-red-500";
    }
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const recoveryAmount = Math.round((currentResidence.recoveryBonus || 2) * 10) / 10;
    const handlePrivateCapitalClick = () => {
        if (isTestMode) {
            setPlayerData(prev => prev ? { ...prev, privateCapital: prev.privateCapital + 10000 } : null);
        }
    };
    // Calculate Age dynamically
    const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(playerData.playerBirthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
    const birthDateString = new Date(playerData.playerBirthDate).toLocaleDateString(locale);
    const playerPortraitUrl = getPlayerPortraitUrl(playerData.playerPortraitId, playerData.playerBirthDate, playerData.gameDate);
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
    // Calculate Household Income
    let partnerContribution = 0;
    const isSharedIncome = [MaritalStatus.Dating, MaritalStatus.Engaged, MaritalStatus.Married].includes(playerData.maritalStatus);
    if (isSharedIncome) {
        if (playerData.partnerIsEmployed) {
            if (playerData.partnerEmployedAs === 'Actor' || playerData.partnerEmployedAs === 'Director') {
                // Talents get gage per movie, usually no monthly salary unless configured. Assuming 0 fix for now or minimal.
                partnerContribution = 0;
            }
            else {
                // Staff Employee
                const employee = playerData.employees.find(e => e.name === playerData.partnerName);
                if (employee) {
                    partnerContribution = employee.salary;
                }
            }
        }
        else if (playerData.partnerSalary) {
            partnerContribution = playerData.partnerSalary;
        }
    }
    const householdIncome = playerData.ceoSalary + partnerContribution;
    const incomeLabel = partnerContribution > 0 ? t.privatelife.status.householdIncome : t.privatelife.status.salary;
    return (_jsx("div", { className: "w-full h-full flex flex-col gap-6 p-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl overflow-hidden flex flex-col h-full", children: [_jsx("div", { className: "p-4 border-b border-gray-600 bg-black/20", children: _jsx("h3", { className: "text-xl font-bold font-cinzel text-amber-400", children: t.privatelife.overview.housing }) }), _jsxs("div", { className: "flex-grow relative group", children: [_jsx("img", { src: backgroundUrl, alt: residenceName, className: "w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6", children: [_jsx("h3", { className: "text-3xl font-bold text-white mb-2 drop-shadow-md", children: residenceName }), _jsx("p", { className: "text-gray-300 text-sm mb-4 drop-shadow-md leading-relaxed", children: residenceDesc }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm mt-4 border-t border-gray-600 pt-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-xs uppercase tracking-wider", children: t.privatelife.status.recovery }), _jsxs("p", { className: "font-bold text-blue-400", children: ["+", recoveryAmount, " / ", t.widgets.charts.week] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase tracking-wider", children: t.privatelife.overview.reputation }), _jsxs("p", { className: "font-bold text-green-400", children: ["+", currentResidence.reputationBonus] })] })] })] })] })] }), _jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl p-6 flex flex-col justify-center flex-shrink-0", children: [_jsx("h3", { className: "text-xl font-bold font-cinzel text-amber-400 mb-6 border-b border-gray-600 pb-2", children: t.privatelife.overview.personal }), _jsxs("div", { className: "flex items-center gap-6 mb-6", children: [_jsx("div", { className: "w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-500 shadow-inner overflow-hidden flex-shrink-0", children: playerPortraitUrl ? (_jsx("img", { src: playerPortraitUrl, alt: "Spieler", className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-6xl", children: playerData.gender === 'weiblich' ? '♀' : '♂' })) }), _jsxs("div", { children: [_jsx("p", { className: "text-3xl font-bold text-white", children: playerData.playerName }), _jsxs("p", { className: "text-gray-400 text-sm mt-1", children: [t.privatelife.overview.status, ": ", _jsx("span", { className: "text-amber-300 font-semibold", children: maritalStatusLabel })] }), _jsxs("p", { className: "text-gray-400 text-sm", children: [t.privatelife.overview.reputation, ": ", _jsx("span", { className: "text-purple-300 font-semibold", children: playerData.personalReputation })] }), _jsxs("p", { className: "text-gray-400 text-sm mt-1", children: [t.newGame.birthDate, ": ", _jsxs("span", { className: "text-white font-semibold", children: [birthDateString, " (", age, " ", t.talentDossier.years, ")"] })] })] })] }), _jsxs("div", { className: "bg-gray-800/50 p-4 rounded-lg border border-gray-700", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-2", children: [_jsx("p", { className: "text-sm font-bold uppercase tracking-wider text-gray-300", children: t.privatelife.overview.vitality }), _jsxs("span", { className: `text-lg font-bold ${energyColor}`, children: [Math.round(energy), "%"] })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative shadow-inner", children: _jsx("div", { className: `${energyBarColor} h-full rounded-full transition-all duration-500 ease-out`, style: { width: `${energy}%` } }) }), _jsx("p", { className: "text-xs text-gray-500 mt-2 text-right italic", children: t.privatelife.overview.vitalityDesc.replace('{amount}', recoveryAmount.toString()) })] })] }), _jsxs("div", { className: "bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl p-6 flex-shrink-0", children: [_jsx("h3", { className: "text-xl font-bold font-cinzel text-amber-400 mb-4 border-b border-gray-600 pb-2", children: t.privatelife.overview.finances }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: `bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center ${isTestMode ? 'cursor-pointer hover:bg-gray-800' : ''}`, onClick: handlePrivateCapitalClick, title: isTestMode ? "Click +10.000" : "", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase tracking-wider mb-1", children: t.privatelife.status.privateCapital }), _jsx("p", { className: "text-xl font-bold text-white font-mono", children: formatCurrency(playerData.privateCapital) })] }), _jsxs("div", { className: "bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase tracking-wider mb-1", children: incomeLabel }), _jsx("p", { className: "text-xl font-bold text-green-400 font-mono", children: formatCurrency(householdIncome) })] })] })] }), _jsxs("div", { className: "bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl p-6 flex flex-col", children: [_jsx("h3", { className: "text-xl font-bold font-cinzel text-amber-400 mb-4 border-b border-gray-600 pb-2", children: t.privatelife.overview.attributes }), _jsxs("div", { className: "space-y-4", children: [_jsx(ProgressBar, { progress: playerData.negotiationSkill, color: "bg-amber-500", label: t.newGame.skillNegotiation }), _jsx(ProgressBar, { progress: playerData.charisma, color: "bg-amber-500", label: t.newGame.skillCharisma }), _jsx(ProgressBar, { progress: playerData.financialSense, color: "bg-amber-500", label: t.newGame.skillFinance }), _jsx(ProgressBar, { progress: playerData.filmSense, color: "bg-amber-500", label: t.newGame.skillFilmSense }), _jsx(ProgressBar, { progress: playerData.organizationTalent, color: "bg-amber-500", label: t.newGame.skillOrganization })] })] })] })] }) }));
};
