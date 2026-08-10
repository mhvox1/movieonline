
import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGame } from '../../../contexts/GameContext';
import NeuesProjektIcon from '../../icons/NeuesProjektIcon';
import ContractIcon from '../../icons/ContractIcon';
import FilmReelIcon from '../../icons/FilmReelIcon';
import { ContractOffer, ProjectData, ProjectPhase } from '../../../types';
import { generateContractOffers } from '../../contractData';
import TvIcon from '../../icons/TvIcon';
import StarRating from '../../StarRating';
import { Message } from '../../../types'; // Explicit import needed

export type PlanningMode = 'new' | 'series' | 'sequel' | 'prequel' | 'contract';

interface ProjectModeSelectorProps {
    onSelectMode: (mode: PlanningMode) => void;
    onSelectContract?: (contract: ContractOffer) => void;
    hasCompletedFilms: boolean;
}

const ModeButton: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    onClick: () => void;
    disabled?: boolean;
    color?: string; // Kept for API compatibility, but will override with amber for all
}> = ({ title, icon, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`w-full bg-gray-800 border rounded-lg p-4 flex items-center gap-4 transition-all shadow-lg group ${disabled ? 'border-gray-700 opacity-50 cursor-not-allowed' : 'border-gray-600 hover:bg-gray-700 hover:scale-[1.02] cursor-pointer'}`}
    >
        <div className={`p-3 bg-gray-900 rounded-full border border-gray-700 group-hover:border-amber-500/50 transition-colors ${disabled ? 'text-gray-600' : 'text-amber-400'}`}>
            {icon}
        </div>
        <div className="text-left">
            <h3 className={`text-xl font-bold font-cinzel ${disabled ? 'text-gray-500' : 'text-amber-400 group-hover:text-amber-300'} transition-colors`}>{title}</h3>
        </div>
    </button>
);

const ProjectModeSelector: React.FC<ProjectModeSelectorProps> = ({ onSelectMode, onSelectContract, hasCompletedFilms }) => {
    const { t, language } = useTranslation();
    const { playerData, setPlayerData } = useGame();
    const [pendingMode, setPendingMode] = useState<PlanningMode | null>(null);
    const [selectedContract, setSelectedContract] = useState<ContractOffer | null>(null);
    const [showContractWarning, setShowContractWarning] = useState(false);

    if (!playerData) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const hasSequelTech = playerData.unlockedTechnologies.includes('unlock_sequel');
    const hasPrequelTech = playerData.unlockedTechnologies.includes('unlock_prequel');
    
    // Check if ANY contract work is currently active (either planning or running project)
    const hasActiveContract = (playerData.currentProject?.contract !== undefined) || (playerData.activePlanning?.contract !== undefined);

    const handleModeClick = (mode: PlanningMode) => {
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
                if (!prev) return null;
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

                const contractMessage: Message = {
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

    const getModeTitle = (mode: PlanningMode | null) => {
        if (!mode) return '';
        switch(mode) {
            case 'new': return t.project.modeSelector.new;
            case 'series': return t.project.modeSelector.series;
            case 'sequel': return t.project.modeSelector.sequel;
            case 'prequel': return t.project.modeSelector.prequel;
            case 'contract': return t.project.modeSelector.contract;
            default: return '';
        }
    };

    // Helper to generate dynamic contract description
    const getContractDescription = (contract: ContractOffer) => {
        const template = t.project.modeSelector.contractDescription;
        return template
            .replace('{station}', contract.stationName)
            .replace('{genre}', t.genres[contract.genre]);
    };

    return (
        <>
            <div className="w-full max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-8 font-cinzel text-amber-400 border-b border-gray-700 pb-4">
                    {t.project.modeSelector.title}
                </h2>
                
                <div className="space-y-4">
                    <ModeButton 
                        title={t.project.modeSelector.new} 
                        icon={<NeuesProjektIcon className="w-6 h-6" />}
                        onClick={() => handleModeClick('new')}
                    />

                    <ModeButton 
                        title={t.project.modeSelector.series} 
                        icon={<TvIcon className="w-6 h-6" />}
                        onClick={() => handleModeClick('series')}
                    />
                    
                    <div className="relative group">
                        <ModeButton 
                            title={t.project.modeSelector.sequel} 
                            icon={<FilmReelIcon className="w-6 h-6" />}
                            onClick={() => handleModeClick('sequel')}
                            disabled={!hasCompletedFilms || !hasSequelTech}
                        />
                        {(!hasCompletedFilms || !hasSequelTech) && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {!hasSequelTech 
                                    ? (language === 'de' ? 'Benötigt Forschung: Fortsetzungen' : 'Requires Research: Sequels')
                                    : t.project.modeSelector.locked
                                }
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <ModeButton 
                            title={t.project.modeSelector.prequel} 
                            icon={<FilmReelIcon className="w-6 h-6" />}
                            onClick={() => handleModeClick('prequel')}
                            disabled={!hasCompletedFilms || !hasPrequelTech}
                        />
                         {(!hasCompletedFilms || !hasPrequelTech) && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {!hasPrequelTech
                                    ? `Benötigt Forschung: Prequels`
                                    : t.project.modeSelector.locked
                                }
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <ModeButton 
                            title={t.project.modeSelector.contract} 
                            icon={<ContractIcon className="w-6 h-6" />}
                            onClick={() => handleModeClick('contract')}
                            disabled={hasActiveContract}
                        />
                         {hasActiveContract && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Laufende Auftragsarbeit muss erst beendet werden.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation / Info Modal */}
            {pendingMode && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setPendingMode(null)}>
                    {pendingMode === 'contract' ? (
                        /* Contract List View */
                        <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-700 bg-gray-900/50">
                                <h3 className="text-2xl font-bold font-cinzel text-amber-400 mb-1">{t.project.modeSelector.contractListTitle || "Verfügbare TV-Aufträge"}</h3>
                                <p className="text-gray-400 text-sm">{t.project.modeSelector.contractListSubtitle || "Wählen Sie einen Auftrag aus, um die Produktion zu starten."}</p>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {playerData.contractOffers.map(contract => (
                                    <div key={contract.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 hover:border-amber-500/50 transition-colors">
                                        {/* Station Icon/Logo Placeholder */}
                                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600 flex-shrink-0">
                                            <TvIcon className="w-8 h-8 text-gray-400" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow text-center md:text-left">
                                            <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
                                                <h4 className="text-lg font-bold text-white">{contract.stationName}</h4>
                                                <span className="text-sm font-bold text-amber-400 italic">"{contract.title}"</span>
                                            </div>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-300">
                                                <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-600 text-xs uppercase font-bold text-gray-400">{t.genres[contract.genre]}</span>
                                                <div className="flex items-center gap-1">
                                                    <span>{t.project.modeSelector.minQuality || "Min. Qualität"}:</span>
                                                    <StarRating rating={contract.minQuality} size="sm" />
                                                </div>
                                                <div className="text-xs text-blue-300 font-bold flex items-center">
                                                    <span>Zeitlimit: {contract.maxDurationMonths} Monate</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[140px]">
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-500 uppercase">{t.project.modeSelector.payout || "Provision"}</span>
                                                <span className="text-xl font-bold text-green-400 font-mono">{formatCurrency(contract.payout)}</span>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedContract(contract)} 
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="p-4 border-t border-gray-700 bg-gray-900/50 text-right">
                                <button onClick={() => setPendingMode(null)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded text-sm">
                                    {t.common.close}
                                </button>
                            </div>

                             {/* Contract Detail Modal Overlay */}
                            {selectedContract && (
                                <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
                                    {!showContractWarning ? (
                                    <div className="bg-gray-800 border-2 border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 relative flex flex-col animate-fade-in">
                                        <div className="text-center mb-6">
                                            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-600 mx-auto mb-4">
                                                <TvIcon className="w-12 h-12 text-amber-400" />
                                            </div>
                                            <h2 className="text-3xl font-bold font-cinzel text-white mb-1">{selectedContract.stationName}</h2>
                                            <h3 className="text-xl text-amber-400 font-bold italic">"{selectedContract.title}"</h3>
                                        </div>
                                        
                                        <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-6">
                                            <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                                                <span className="text-gray-400 font-bold">Genre</span>
                                                <span className="text-white">{t.genres[selectedContract.genre]}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                                                 <span className="text-gray-400 font-bold">{t.project.modeSelector.minQuality}</span>
                                                 <div className="flex items-center gap-2">
                                                     <StarRating rating={selectedContract.minQuality} size="md" />
                                                     <span className="text-xs text-gray-500">({selectedContract.minQuality})</span>
                                                 </div>
                                            </div>
                                            
                                            {/* Financials Block */}
                                            <div className="flex flex-col border-t border-gray-600 pt-2 mt-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-gray-400 font-bold uppercase text-sm">Sofort-Vorschuss</span>
                                                    <span className="text-lg text-blue-400 font-mono font-bold">{formatCurrency(selectedContract.upfrontPayment || 0)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 font-bold uppercase">{t.project.modeSelector.payout} (Rest)</span>
                                                    <span className="text-2xl text-green-400 font-mono font-bold">{formatCurrency(selectedContract.payout)}</span>
                                                </div>
                                                <span className="text-xs text-green-300 italic text-right mt-1">{t.project.modeSelector.costsCovered}</span>
                                            </div>
                                            
                                            {/* Penalty Row */}
                                            {selectedContract.penalty && (
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-600/50 mt-1">
                                                    <span className="text-red-400 text-sm font-bold uppercase">{t.project.modeSelector.penalty}</span>
                                                    <span className="text-lg text-red-400 font-mono font-bold">-{formatCurrency(selectedContract.penalty)}</span>
                                                </div>
                                            )}

                                            {/* Deadline Row */}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-600/50 mt-1">
                                                <span className="text-blue-300 text-sm font-bold uppercase">Zeitlimit</span>
                                                <span className="text-lg text-blue-300 font-bold">{selectedContract.maxDurationMonths} Monate</span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-400 text-sm text-center mb-6 italic">
                                            "{getContractDescription(selectedContract)}"
                                        </p>

                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setSelectedContract(null)}
                                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded uppercase tracking-wider"
                                            >
                                                {t.common.cancel}
                                            </button>
                                            <button 
                                                onClick={handleAcceptContractClick}
                                                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded uppercase tracking-wider shadow-lg shadow-amber-900/20"
                                            >
                                                {t.project.modeSelector.acceptContract || "Annehmen"}
                                            </button>
                                        </div>
                                    </div>
                                    ) : (
                                        <div className="bg-gray-800 border-2 border-red-500 rounded-lg shadow-2xl w-full max-w-lg p-8 relative flex flex-col text-center animate-fade-in">
                                            <h2 className="text-3xl font-bold font-cinzel text-red-400 mb-6">{t.project.modeSelector.contractWarningTitle}</h2>
                                            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                                {t.project.modeSelector.contractWarningText
                                                    .replace('{penalty}', formatCurrency(selectedContract.penalty))
                                                    .replace('{quality}', selectedContract.minQuality.toString())}
                                                <br/><br/>
                                                <span className="text-amber-400 font-bold">Zusätzlich muss der erhaltene Vorschuss von {formatCurrency(selectedContract.upfrontPayment || 0)} zurückgezahlt werden!</span>
                                                <br/>
                                                <span className="text-blue-300 font-bold text-sm block mt-2">Das Projekt muss innerhalb von {selectedContract.maxDurationMonths} Monaten abgeschlossen sein.</span>
                                            </p>
                                            <div className="flex gap-4 justify-center">
                                                <button 
                                                    onClick={() => setShowContractWarning(false)}
                                                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded uppercase tracking-wider"
                                                >
                                                    {t.common.cancel}
                                                </button>
                                                <button 
                                                    onClick={confirmContract}
                                                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded uppercase tracking-wider shadow-lg shadow-red-900/20"
                                                >
                                                    {t.common.confirm}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    ) : (
                        /* Standard Confirmation View for other modes */
                        <div className="bg-gray-800 border border-amber-500 rounded-lg p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                            <h3 className="text-2xl font-bold font-cinzel text-amber-400 mb-4">
                                {t.project.modeSelector.confirmTitle}
                            </h3>
                            <p className="text-gray-300 text-lg mb-6">
                                {t.project.modeSelector.confirmText.replace('{mode}', getModeTitle(pendingMode))}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={() => setPendingMode(null)} 
                                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
                                >
                                    {t.common.cancel}
                                </button>
                                <button 
                                    onClick={confirmMode} 
                                    className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-6 rounded"
                                >
                                    {t.common.confirm}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ProjectModeSelector;
