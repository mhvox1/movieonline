import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGame } from '../contexts/GameContext';
import StarRating from './StarRating';
import { useTranslation } from '../hooks/useTranslation';
import NoteIcon from './icons/NoteIcon';
const GameHeader = ({ gameSpeed, setGameSpeed, disabled, onNavigateToOfficeTab, hasPendingDecision }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const isTestMode = playerData &&
        playerData.playerName === 'Max Mustermann' &&
        playerData.studioName === 'Teststudio';
    const handleCheatCapital = () => {
        if (isTestMode && setPlayerData) {
            setPlayerData(prev => prev ? { ...prev, capital: prev.capital + 1000000 } : null);
        }
    };
    const handleCheatReputation = () => {
        if (isTestMode && setPlayerData) {
            setPlayerData(prev => prev ? { ...prev, reputation: Math.min(100, prev.reputation + 10) } : null);
        }
    };
    const toggleScratchpad = () => {
        if (setPlayerData) {
            setPlayerData(prev => prev ? { ...prev, isScratchpadOpen: !prev.isScratchpadOpen } : null);
        }
    };
    if (!playerData)
        return null;
    return (_jsxs("header", { className: "bg-black bg-opacity-50 backdrop-blur-sm p-3 flex items-stretch text-white shadow-lg flex-shrink-0 gap-4", children: [_jsxs("div", { className: "flex-shrink-0 w-auto flex flex-col justify-center items-start ml-[30px] min-w-[250px]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xl font-bold font-cinzel text-amber-400 truncate", children: playerData.studioName }), _jsx("div", { onClick: handleCheatReputation, className: `inline-block ${isTestMode ? "cursor-pointer hover:opacity-80" : ""}`, title: isTestMode ? "Testmodus: Klicke für +10 Ruf" : undefined, children: _jsx(StarRating, { rating: playerData.reputation }) })] }), _jsxs("p", { onClick: handleCheatCapital, className: `text-lg font-semibold text-amber-400 mt-1 ${isTestMode ? "cursor-pointer hover:text-amber-200" : ""}`, title: isTestMode ? "Testmodus: Klicke für +1.000.000$" : undefined, children: [t.header.capital, ": ", new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(playerData.capital)] })] }), _jsx("div", { className: "flex items-center", children: _jsx("button", { onClick: toggleScratchpad, className: `p-2 rounded-full transition-all border-2 flex items-center justify-center ${playerData.isScratchpadOpen
                        ? 'bg-amber-400 text-black border-amber-500 shadow-lg scale-110'
                        : 'bg-gray-800 text-amber-400 border-gray-600 hover:bg-gray-700 hover:border-amber-300'}`, title: "Notizen", children: _jsx(NoteIcon, { className: "w-10 h-10" }) }) }), _jsx("div", { className: "flex-grow flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.35em] text-gray-400", children: "Berliner Echtzeit aktiv" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-amber-300", children: "Zeitangaben laufen in Stunden." })] }) }), _jsxs("div", { className: "flex-shrink-0 w-auto flex flex-col justify-between items-end mr-[30px]", children: [_jsxs("div", { className: "w-full", children: [hasPendingDecision && (_jsx("div", { className: "mb-1 text-right", children: _jsx("span", { className: "text-red-300 text-xs font-bold uppercase tracking-widest", children: t.header.decisionRequired }) })), _jsx("p", { className: "mt-1 text-sm font-semibold text-right text-amber-300", children: "Echtzeit" })] })] })] }));
};
export default GameHeader;
