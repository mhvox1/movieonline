import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { useTranslation } from '../../../hooks/useTranslation';
const NewsTab = () => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    if (!playerData)
        return null;
    const sortedEvents = useMemo(() => {
        if (!playerData.eventLog)
            return [];
        // Filter out 'Studio' events and sort by date, newest first
        return [...playerData.eventLog]
            .filter(event => event.category !== 'Studio')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [playerData.eventLog]);
    return (_jsxs("div", { className: "bg-gray-900/80 p-6 rounded-lg border border-gray-700 h-full flex flex-col", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-8 font-cinzel text-amber-400", children: t.office.news.title }), _jsx("div", { className: "flex-grow overflow-y-auto pr-4 space-y-4", children: sortedEvents.length > 0 ? (sortedEvents.map((event, index) => (_jsxs("div", { className: "bg-gray-800/80 p-4 rounded-lg border border-gray-700", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-2", children: [_jsx("h3", { className: "font-bold text-lg text-amber-400", children: event.title }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "text-sm text-gray-400 font-mono", children: new Date(event.date).toLocaleDateString(locale) }) })] }), _jsx("p", { className: "text-gray-300 text-sm whitespace-pre-wrap", children: event.text })] }, index)))) : (_jsx("p", { className: "text-center text-gray-500 italic py-16", children: t.office.news.noEvents })) })] }));
};
export default NewsTab;
