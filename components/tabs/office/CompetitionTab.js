import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGame } from '../../../contexts/GameContext';
const CompetitionTab = () => {
    const { playerData } = useGame();
    if (!playerData)
        return null;
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-8 font-cinzel text-amber-400", children: "Konkurrenz-\u00DCbersicht" }), _jsx("div", { className: "space-y-4", children: playerData.competitors.map(studio => (_jsxs("div", { className: "bg-gray-800/80 p-4 rounded-lg border border-gray-700", children: [_jsx("h3", { className: "font-bold text-xl text-white", children: studio.name }), _jsxs("div", { className: "mt-2 text-sm", children: [_jsx("span", { className: "text-gray-400", children: "Aktuelle Aktivit\u00E4t: " }), studio.currentActivity.type === 'producing' && `Produziert "${studio.currentActivity.filmTitle}" (fertig am ${new Date(studio.currentActivity.endDate).toLocaleDateString('de-DE')})`, studio.currentActivity.type === 'break' && `Macht eine Pause (bis ${new Date(studio.currentActivity.endDate).toLocaleDateString('de-DE')})`, studio.currentActivity.type === 'pending_release' && `Film "${studio.currentActivity.filmTitle}" ist fertiggestellt`] })] }, studio.id))) })] }));
};
export default CompetitionTab;
