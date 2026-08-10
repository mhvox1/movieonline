import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ActorAge } from '../types';
import StarRating from './StarRating';
import DrehbuchIcon from './icons/DrehbuchIcon';
import { useTranslation } from '../hooks/useTranslation';
import { getTranslatedScriptTitle, getTranslatedScriptDescription } from './scriptGenerator';
const getAgeString = (gender, age, t) => {
    const genderKey = gender === 'männlich' ? 'male' : 'female';
    let ageKey;
    switch (age) {
        case ActorAge.Child:
            ageKey = 'child';
            break;
        case ActorAge.Young:
            ageKey = 'young';
            break;
        case ActorAge.MiddleAged:
            ageKey = 'middleAged';
            break;
        case ActorAge.Old:
            ageKey = 'old';
            break;
        default: ageKey = 'middleAged';
    }
    return `${t.newGame[genderKey]}, ${t.actorAge[ageKey]}`;
};
const ScriptDossierModal = ({ script, onClose, onBuy, playerCapital, isTestMode }) => {
    const [showBuyConfirm, setShowBuyConfirm] = useState(false);
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const canAfford = playerCapital >= (script.price || 0) || isTestMode;
    const handleConfirmBuy = () => {
        onBuy(script);
        setShowBuyConfirm(false);
    };
    const displayTitle = getTranslatedScriptTitle(script, t);
    const displayDescription = getTranslatedScriptDescription(script, t);
    const genreLabel = t.genres[script.genre] || script.genre;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: onClose, children: _jsxs("div", { className: "relative bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl text-white animate-fade-in flex flex-col", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "bg-gray-900/50 p-6 border-b border-gray-700 text-center", children: [_jsx(DrehbuchIcon, { className: "h-16 w-16 text-amber-300 mx-auto mb-4 bg-gray-400" }), _jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400", children: displayTitle }), _jsx("p", { className: "text-lg text-gray-400", children: genreLabel })] }), _jsxs("div", { className: "p-6 space-y-4 flex-grow", children: [_jsxs("div", { className: "bg-gray-900/50 p-4 rounded-md border border-gray-700", children: [_jsx("h3", { className: "font-bold text-amber-300 mb-2", children: t.scriptDossier.plot }), _jsxs("p", { className: "text-sm text-gray-300 italic h-24 overflow-y-auto pr-2", children: ["\"", displayDescription, "\""] })] }), (script.mainRole || script.supportingRole) && (_jsxs("div", { className: "bg-gray-900/50 p-4 rounded-md border border-gray-700", children: [_jsx("h3", { className: "font-bold text-amber-300 mb-2", children: t.scriptDossier.castSuggestions }), _jsxs("div", { className: "text-sm space-y-1", children: [script.mainRole && (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-400", children: [t.scriptDossier.mainRole, ":"] }), _jsx("span", { className: "font-semibold text-white", children: getAgeString(script.mainRole.gender, script.mainRole.age, t) })] })), script.supportingRole && (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-400", children: [t.scriptDossier.supportingRole, ":"] }), _jsx("span", { className: "font-semibold text-white", children: getAgeString(script.supportingRole.gender, script.supportingRole.age, t) })] }))] })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-gray-900/50 p-4 rounded-md border border-gray-700 text-center", children: [_jsx("p", { className: "text-sm text-gray-400", children: t.scriptDossier.quality }), _jsx("div", { className: "flex justify-center mt-1", children: _jsx(StarRating, { rating: script.quality, size: "md", isTestMode: isTestMode }) })] }), _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-md border border-gray-700 text-center", children: [_jsx("p", { className: "text-sm text-gray-400", children: t.scriptDossier.price }), _jsx("p", { className: "text-2xl font-bold text-amber-400", children: formatCurrency(script.price || 0) })] })] })] }), _jsxs("div", { className: "p-6 border-t border-gray-700 flex justify-end gap-4", children: [_jsx("button", { onClick: onClose, className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider transition-colors", children: t.common.close }), _jsx("button", { onClick: () => setShowBuyConfirm(true), disabled: !canAfford, className: "bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed", children: t.scriptDossier.buy })] })] }) }), showBuyConfirm && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.scriptDossier.buyConfirmTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.scriptDossier.buyConfirmText.replace('{title}', displayTitle).replace('{price}', formatCurrency(script.price || 0)) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setShowBuyConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }), _jsx("button", { onClick: handleConfirmBuy, className: "bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all", children: t.common.confirm })] })] }) }))] }));
};
export default ScriptDossierModal;
