import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGame } from '../../../contexts/GameContext';
import NeuesProjektIcon from '../../icons/NeuesProjektIcon';
import ContractIcon from '../../icons/ContractIcon';
import FilmReelIcon from '../../icons/FilmReelIcon';
import TvIcon from '../../icons/TvIcon';
import StarRating from '../../StarRating';
const ModeButton = ({ title, icon, onClick, disabled }) => (_jsxs("button", { onClick: onClick, disabled: disabled, className: `w-full bg-gray-800 border rounded-lg p-4 flex items-center gap-4 transition-all shadow-lg group ${disabled ? 'border-gray-700 opacity-50 cursor-not-allowed' : 'border-gray-600 hover:bg-gray-700 hover:scale-[1.02] cursor-pointer'}`, children: [_jsx("div", { className: `p-3 bg-gray-900 rounded-full border border-gray-700 group-hover:border-amber-500/50 transition-colors ${disabled ? 'text-gray-600' : 'text-amber-400'}`, children: icon }), _jsx("div", { className: "text-left", children: _jsx("h3", { className: `text-xl font-bold font-cinzel ${disabled ? 'text-gray-500' : 'text-amber-400 group-hover:text-amber-300'} transition-colors`, children: title }) })] }));
const ProjectModeSelector = ({ onSelectMode, onSelectContract, hasCompletedFilms }) => {
    const { t, language } = useTranslation();
    const { playerData, setPlayerData } = useGame();
    const [pendingMode, setPendingMode] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [showContractWarning, setShowContractWarning] = useState(false);
    if (!playerData)
        return null;
    const formatCurrency = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const hasSequelTech = playerData.unlockedTechnologies.includes('unlock_sequel');
    const hasPrequelTech = playerData.unlockedTechnologies.includes('unlock_prequel');
    // Check if ANY contract work is currently active (either planning or running project)
    const hasActiveContract = (playerData.currentProject?.contract !== undefined) || (playerData.activePlanning?.contract !== undefined);
    const handleModeClick = (mode) => {
        // Contracts are now managed via useFinanceLoop (monthly updates) and persisted in playerData.
        // We only switch the view here.
        setPendingMode(mode);
    };
    const confirmMode = () => {
        if (pendingMode) {
            onSelectMode(pendingMode);
            setPendingMode(null);
        }
    };
    const handleAcceptContractClick = () => {
        if (selectedContract) {
            setShowContractWarning(true);
        }
    };
    const confirmContract = () => {
        if (selectedContract && onSelectContract) {
            // --- NEW: Handle Upfront Payment on Accept & Deadline Calculation ---
            setPlayerData(prev => {
                if (!prev)
                    return null;
                const upfront = selectedContract.upfrontPayment || 0;
                // Calculate Deadline Date
                const deadline = new Date(prev.gameDate);
                deadline.setMonth(deadline.getMonth() + selectedContract.maxDurationMonths);
                // We add the deadline to the contract object locally before passing it upwards, 
                // OR rely on the hook to set it.
                // The hook in NewProjectScreen_Phase1 uses the contract object. 
                // We need to inject the deadline into the project structure LATER in useProjectLoop/ProjectPlanningTab.
                // However, we want to store it NOW in playerData to be safe.
                // But `activePlanning` is set in NewProjectScreen_Phase1 via callback `onSelectContract`.
                // So we assume onSelectContract handles the state update for `activePlanning`.
                // BUT we need to send the email with the date here.
                const deadlineString = deadline.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US');
                // Generate Email Body
                const body = language === 'de'
                    ? `Sehr geehrte Damen und Herren,\n\nwir bestätigen hiermit den Produktionsauftrag für "${selectedContract.title}".\n\nGenre: ${t.genres[selectedContract.genre]}\nMindestqualität: ${selectedContract.minQuality}\nProvision: ${formatCurrency(selectedContract.payout)}\nVertragsstrafe bei Nichterfüllung: ${formatCurrency(selectedContract.penalty)}\n\nDas Projekt muss bis zum ${deadlineString} abgeschlossen sein. Sollte der Film bis dahin nicht fertiggestellt sein, gilt der Vertrag als gescheitert.\n\nDie Produktionskosten werden von uns übernommen und nach Abschluss des Projekts erstattet.\n\nWir erwarten eine pünktliche Lieferung.\n\nMit freundlichen Grüßen,\n${selectedContract.stationName}`
                    : `Dear Sir or Madam,\n\nWe hereby confirm the production order for "${selectedContract.title}".\n\nGenre: ${t.genres[selectedContract.genre]}\nMin Quality: ${selectedContract.minQuality}\nPayout: ${formatCurrency(selectedContract.payout)}\nPenalty on failure: ${formatCurrency(selectedContract.penalty)}\n\nThe project must be completed by ${deadlineString}. If the movie is not finished by then, the contract is considered failed.\n\nProduction costs will be covered by us and reimbursed upon completion.\n\nWe expect timely delivery.\n\nSincerely,\n${selectedContract.stationName}`;
                const contractMessage = {
                    id: `msg_contract_start_${Date.now()}`,
                    date: new Date(prev.gameDate),
                    sender: selectedContract.stationName,
                    subject: language === 'de'
                        ? `Auftragsbestätigung: ${selectedContract.title}`
                        : `Contract Confirmation: ${selectedContract.title}`,
                    body: body,
                    read: false
                };
                // Update Project Data structure to include deadline immediately in activePlanning is handled in NewProjectScreen_Phase1
                // We just pass the updated contract object. 
                // Wait, ContractOffer type doesn't have a date field. We added `contractDeadline` to ProjectData.
                // So we need to ensure NewProjectScreen_Phase1 sets it.
                // Or we inject it here into a temporary field on the contract object if we modified the type?
                // No, we modify `ProjectData` in `NewProjectScreen_Phase1`.
                // Let's modify `onSelectContract` signature or just let the parent handle the date calc?
                // Better: We calculate it here for the email, and let the parent handle the state.
                // The parent (NewProjectScreen_Phase1) needs to know the deadline.
                // Hack: We attach it to the contract object temporarily or pass it as separate argument?
                // The `onSelectContract` only takes `ContractOffer`.
                // We should add `maxDurationMonths` to `ContractOffer` (done in types.ts).
                // Then NewProjectScreen_Phase1 can calculate the deadline based on that.
                return {
                    ...prev,
                    capital: prev.capital + upfront,
                    messages: [...prev.messages, contractMessage],
                    transactionLog: [
                        ...prev.transactionLog,
                        {
                            date: new Date(prev.gameDate),
                            type: 'Einnahme',
                            category: 'Filmproduktion',
                            description: language === 'de'
                                ? `Vorschuss Auftragsarbeit: "${selectedContract.title}"`
                                : `Contract work advance: "${selectedContract.title}"`,
                            amount: upfront
                        }
                    ]
                };
            });
            onSelectContract(selectedContract);
            setSelectedContract(null);
            setShowContractWarning(false);
            setPendingMode(null);
        }
    };
    const getModeTitle = (mode) => {
        if (!mode)
            return '';
        switch (mode) {
            case 'new': return t.project.modeSelector.new;
            case 'series': return t.project.modeSelector.series;
            case 'sequel': return t.project.modeSelector.sequel;
            case 'prequel': return t.project.modeSelector.prequel;
            case 'contract': return t.project.modeSelector.contract;
            default: return '';
        }
    };
    // Helper to generate dynamic contract description
    const getContractDescription = (contract) => {
        const template = t.project.modeSelector.contractDescription;
        return template
            .replace('{station}', contract.stationName)
            .replace('{genre}', t.genres[contract.genre]);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-2xl", children: [_jsx("h2", { className: "text-3xl font-bold text-center mb-8 font-cinzel text-amber-400 border-b border-gray-700 pb-4", children: t.project.modeSelector.title }), _jsxs("div", { className: "space-y-4", children: [_jsx(ModeButton, { title: t.project.modeSelector.new, icon: _jsx(NeuesProjektIcon, { className: "w-6 h-6" }), onClick: () => handleModeClick('new') }), _jsx(ModeButton, { title: t.project.modeSelector.series, icon: _jsx(TvIcon, { className: "w-6 h-6" }), onClick: () => handleModeClick('series') }), _jsxs("div", { className: "relative group", children: [_jsx(ModeButton, { title: t.project.modeSelector.sequel, icon: _jsx(FilmReelIcon, { className: "w-6 h-6" }), onClick: () => handleModeClick('sequel'), disabled: !hasCompletedFilms || !hasSequelTech }), (!hasCompletedFilms || !hasSequelTech) && (_jsx("div", { className: "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10", children: !hasSequelTech
                                            ? (language === 'de' ? 'Benötigt Forschung: Fortsetzungen' : 'Requires Research: Sequels')
                                            : t.project.modeSelector.locked }))] }), _jsxs("div", { className: "relative group", children: [_jsx(ModeButton, { title: t.project.modeSelector.prequel, icon: _jsx(FilmReelIcon, { className: "w-6 h-6" }), onClick: () => handleModeClick('prequel'), disabled: !hasCompletedFilms || !hasPrequelTech }), (!hasCompletedFilms || !hasPrequelTech) && (_jsx("div", { className: "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10", children: !hasPrequelTech
                                            ? `Benötigt Forschung: Prequels`
                                            : t.project.modeSelector.locked }))] }), _jsxs("div", { className: "relative group", children: [_jsx(ModeButton, { title: t.project.modeSelector.contract, icon: _jsx(ContractIcon, { className: "w-6 h-6" }), onClick: () => handleModeClick('contract'), disabled: hasActiveContract }), hasActiveContract && (_jsx("div", { className: "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10", children: "Laufende Auftragsarbeit muss erst beendet werden." }))] })] })] }), pendingMode && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4", onClick: () => setPendingMode(null), children: pendingMode === 'contract' ? (
                /* Contract List View */
                _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "p-6 border-b border-gray-700 bg-gray-900/50", children: [_jsx("h3", { className: "text-2xl font-bold font-cinzel text-amber-400 mb-1", children: t.project.modeSelector.contractListTitle || "Verfügbare TV-Aufträge" }), _jsx("p", { className: "text-gray-400 text-sm", children: t.project.modeSelector.contractListSubtitle || "Wählen Sie einen Auftrag aus, um die Produktion zu starten." })] }), _jsx("div", { className: "flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar", children: playerData.contractOffers.map(contract => (_jsxs("div", { className: "bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 hover:border-amber-500/50 transition-colors", children: [_jsx("div", { className: "w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600 flex-shrink-0", children: _jsx(TvIcon, { className: "w-8 h-8 text-gray-400" }) }), _jsxs("div", { className: "flex-grow text-center md:text-left", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-baseline gap-2 mb-1", children: [_jsx("h4", { className: "text-lg font-bold text-white", children: contract.stationName }), _jsxs("span", { className: "text-sm font-bold text-amber-400 italic", children: ["\"", contract.title, "\""] })] }), _jsxs("div", { className: "flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-300", children: [_jsx("span", { className: "bg-gray-800 px-2 py-0.5 rounded border border-gray-600 text-xs uppercase font-bold text-gray-400", children: t.genres[contract.genre] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("span", { children: [t.project.modeSelector.minQuality || "Min. Qualität", ":"] }), _jsx(StarRating, { rating: contract.minQuality, size: "sm" })] }), _jsx("div", { className: "text-xs text-blue-300 font-bold flex items-center", children: _jsxs("span", { children: ["Zeitlimit: ", contract.maxDurationMonths, " Monate"] }) })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2 flex-shrink-0 min-w-[140px]", children: [_jsxs("div", { className: "text-right", children: [_jsx("span", { className: "block text-xs text-gray-500 uppercase", children: t.project.modeSelector.payout || "Provision" }), _jsx("span", { className: "text-xl font-bold text-green-400 font-mono", children: formatCurrency(contract.payout) })] }), _jsx("button", { onClick: () => setSelectedContract(contract), className: "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors", children: "Details" })] })] }, contract.id))) }), _jsx("div", { className: "p-4 border-t border-gray-700 bg-gray-900/50 text-right", children: _jsx("button", { onClick: () => setPendingMode(null), className: "bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded text-sm", children: t.common.close }) }), selectedContract && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4", onClick: (e) => e.stopPropagation(), children: !showContractWarning ? (_jsxs("div", { className: "bg-gray-800 border-2 border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 relative flex flex-col animate-fade-in", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-600 mx-auto mb-4", children: _jsx(TvIcon, { className: "w-12 h-12 text-amber-400" }) }), _jsx("h2", { className: "text-3xl font-bold font-cinzel text-white mb-1", children: selectedContract.stationName }), _jsxs("h3", { className: "text-xl text-amber-400 font-bold italic", children: ["\"", selectedContract.title, "\""] })] }), _jsxs("div", { className: "space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-6", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-gray-600 pb-2", children: [_jsx("span", { className: "text-gray-400 font-bold", children: "Genre" }), _jsx("span", { className: "text-white", children: t.genres[selectedContract.genre] })] }), _jsxs("div", { className: "flex justify-between items-center border-b border-gray-600 pb-2", children: [_jsx("span", { className: "text-gray-400 font-bold", children: t.project.modeSelector.minQuality }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StarRating, { rating: selectedContract.minQuality, size: "md" }), _jsxs("span", { className: "text-xs text-gray-500", children: ["(", selectedContract.minQuality, ")"] })] })] }), _jsxs("div", { className: "flex flex-col border-t border-gray-600 pt-2 mt-2", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("span", { className: "text-gray-400 font-bold uppercase text-sm", children: "Sofort-Vorschuss" }), _jsx("span", { className: "text-lg text-blue-400 font-mono font-bold", children: formatCurrency(selectedContract.upfrontPayment || 0) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-400 font-bold uppercase", children: [t.project.modeSelector.payout, " (Rest)"] }), _jsx("span", { className: "text-2xl text-green-400 font-mono font-bold", children: formatCurrency(selectedContract.payout) })] }), _jsx("span", { className: "text-xs text-green-300 italic text-right mt-1", children: t.project.modeSelector.costsCovered })] }), selectedContract.penalty && (_jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-gray-600/50 mt-1", children: [_jsx("span", { className: "text-red-400 text-sm font-bold uppercase", children: t.project.modeSelector.penalty }), _jsxs("span", { className: "text-lg text-red-400 font-mono font-bold", children: ["-", formatCurrency(selectedContract.penalty)] })] })), _jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-gray-600/50 mt-1", children: [_jsx("span", { className: "text-blue-300 text-sm font-bold uppercase", children: "Zeitlimit" }), _jsxs("span", { className: "text-lg text-blue-300 font-bold", children: [selectedContract.maxDurationMonths, " Monate"] })] })] }), _jsxs("p", { className: "text-gray-400 text-sm text-center mb-6 italic", children: ["\"", getContractDescription(selectedContract), "\""] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => setSelectedContract(null), className: "flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded uppercase tracking-wider", children: t.common.cancel }), _jsx("button", { onClick: handleAcceptContractClick, className: "flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded uppercase tracking-wider shadow-lg shadow-amber-900/20", children: t.project.modeSelector.acceptContract || "Annehmen" })] })] })) : (_jsxs("div", { className: "bg-gray-800 border-2 border-red-500 rounded-lg shadow-2xl w-full max-w-lg p-8 relative flex flex-col text-center animate-fade-in", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-red-400 mb-6", children: t.project.modeSelector.contractWarningTitle }), _jsxs("p", { className: "text-gray-300 text-lg mb-8 leading-relaxed", children: [t.project.modeSelector.contractWarningText
                                                .replace('{penalty}', formatCurrency(selectedContract.penalty))
                                                .replace('{quality}', selectedContract.minQuality.toString()), _jsx("br", {}), _jsx("br", {}), _jsxs("span", { className: "text-amber-400 font-bold", children: ["Zus\u00E4tzlich muss der erhaltene Vorschuss von ", formatCurrency(selectedContract.upfrontPayment || 0), " zur\u00FCckgezahlt werden!"] }), _jsx("br", {}), _jsxs("span", { className: "text-blue-300 font-bold text-sm block mt-2", children: ["Das Projekt muss innerhalb von ", selectedContract.maxDurationMonths, " Monaten abgeschlossen sein."] })] }), _jsxs("div", { className: "flex gap-4 justify-center", children: [_jsx("button", { onClick: () => setShowContractWarning(false), className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded uppercase tracking-wider", children: t.common.cancel }), _jsx("button", { onClick: confirmContract, className: "bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded uppercase tracking-wider shadow-lg shadow-red-900/20", children: t.common.confirm })] })] })) }))] })) : (
                /* Standard Confirmation View for other modes */
                _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg p-6 max-w-sm w-full text-center", onClick: e => e.stopPropagation(), children: [_jsx("h3", { className: "text-2xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.modeSelector.confirmTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.modeSelector.confirmText.replace('{mode}', getModeTitle(pendingMode)) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setPendingMode(null), className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded", children: t.common.cancel }), _jsx("button", { onClick: confirmMode, className: "bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded", children: t.common.confirm })] })] })) }))] }));
};
export default ProjectModeSelector;
