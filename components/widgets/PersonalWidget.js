import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DashboardWidget from '../DashboardWidget';
import { useGame } from '../../contexts/GameContext';
import { useTranslation } from '../../hooks/useTranslation';
import StarRating from '../StarRating';
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
    return `https://www.schnoxcore.com/media/portraits/${baseId}${ageSuffix}.png`;
};
const PersonalWidget = ({ onClick }) => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    if (!playerData)
        return null;
    const energy = playerData.energy !== undefined ? playerData.energy : 100;
    // Determine energy color
    let energyBarColor = "bg-yellow-500";
    if (energy >= 80) {
        energyBarColor = "bg-green-500";
    }
    else if (energy < 30) {
        energyBarColor = "bg-red-500";
    }
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
    // Circular progress bar constants
    const size = 96; // Corresponds to w-24, h-24
    const strokeWidth = 6;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const energyOffset = circumference - (energy / 100) * circumference;
    return (_jsx("div", { onClick: onClick, className: "cursor-pointer group", children: _jsx(DashboardWidget, { title: t.privatelife.overview.personal, children: _jsx("div", { className: "flex flex-col gap-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative w-24 h-24 flex-shrink-0", title: `${t.privatelife.overview.vitality}: ${Math.round(energy)}%`, children: [_jsxs("svg", { className: "absolute top-0 left-0 w-full h-full transform -rotate-90", viewBox: `0 0 ${size} ${size}`, children: [_jsx("circle", { className: "text-gray-700", stroke: "currentColor", strokeWidth: strokeWidth, fill: "transparent", r: radius, cx: center, cy: center }), _jsx("circle", { className: energyBarColor.replace('bg-', 'text-'), stroke: "currentColor", strokeWidth: strokeWidth, strokeDasharray: circumference, strokeDashoffset: energyOffset, strokeLinecap: "round", fill: "transparent", r: radius, cx: center, cy: center, style: { transition: 'stroke-dashoffset 0.5s ease-out' } })] }), _jsx("div", { className: "absolute inset-0 p-1.5 rounded-full", children: _jsx("div", { className: "w-full h-full bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-inner overflow-hidden", children: playerPortraitUrl ? (_jsx("img", { src: playerPortraitUrl, alt: t.privatelife.overview.personal, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-4xl", children: playerData.gender === 'weiblich' ? '♀' : '♂' })) }) })] }), _jsxs("div", { className: "min-w-0 flex-grow", children: [_jsx("p", { className: "text-xl font-bold text-white truncate group-hover:text-amber-300 transition-colors", children: playerData.playerName }), _jsxs("p", { className: "text-gray-400 text-sm truncate mt-1", children: [t.privatelife.overview.status, ": ", _jsx("span", { className: "text-amber-300", children: maritalStatusLabel })] }), _jsxs("div", { className: "flex justify-between items-center mt-3 text-sm", children: [_jsxs("span", { className: "text-gray-400", children: [t.privatelife.overview.reputation, ":"] }), _jsx(StarRating, { rating: playerData.personalReputation })] })] })] }) }) }) }));
};
export default PersonalWidget;
