import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ProjectPhase, EmployeeType } from '../../../types';
import { PRODUCTION_MARKETING_CAMPAIGNS } from '../../marketingData';
import { getCoverPath } from '../../coverConfig';
import HeartRating from '../../HeartRating';
import StarIcon from '../../icons/StarIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import ProduktionIcon from '../../icons/ProduktionIcon';
const formatCurrency = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
const CampaignSelectionModal = ({ onSelect, onClose, currentCampaignId, playerData }) => {
    const { t } = useTranslation();
    // CONCEPT IMPLEMENTATION: Calculate Discount based on Marketing Manager Effective Talent
    const discountFactor = useMemo(() => {
        let bestEffectiveTalent = 0;
        // 1. Employees
        playerData.employees.filter((e) => e.type === EmployeeType.Marketingmanager).forEach((e) => {
            const eff = e.talent * (e.satisfaction / 100);
            if (eff > bestEffectiveTalent)
                bestEffectiveTalent = eff;
        });
        // 2. Partner/Family checks (simplified access as we just need max talent)
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Marketingmanager && playerData.partnerSkills) {
            const eff = playerData.partnerSkills.marketing; // Satisfaction simplified to 100% for family
            if (eff > bestEffectiveTalent)
                bestEffectiveTalent = eff;
        }
        playerData.children.forEach((c) => {
            if (c.isEmployed && c.employedAs === EmployeeType.Marketingmanager && c.skills) {
                const eff = c.skills.marketing;
                if (eff > bestEffectiveTalent)
                    bestEffectiveTalent = eff;
            }
        });
        // Max 20% discount at 100 Effective Talent
        // Formula: Discount = EffTalent / 500
        return Math.min(0.20, bestEffectiveTalent / 500);
    }, [playerData]);
    return (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: onClose, children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-5xl p-6", onClick: e => e.stopPropagation(), children: [_jsx("h2", { className: "text-3xl font-cinzel text-amber-400 text-center mb-4", children: t.marketing.campaigns.modalSelectTitle }), discountFactor > 0 && _jsx("p", { className: "text-green-400 text-xs text-center mb-2", children: t.marketing.campaigns.marketingManagerBonus.replace('{percent}', String(Math.round(discountFactor * 100))) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar", children: PRODUCTION_MARKETING_CAMPAIGNS.map(campaign => {
                        const translatedCampaign = t.marketing.campaignData[campaign.id] || campaign;
                        const isSelected = campaign.id === currentCampaignId;
                        const discountedCost = Math.round(campaign.cost * (1 - discountFactor));
                        return (_jsxs("button", { onClick: () => onSelect(campaign.id), className: `p-4 rounded-lg border-2 text-left h-full flex flex-col transition-all duration-200 ${isSelected ? 'border-amber-400 bg-amber-900/50' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'}`, children: [_jsx("h5", { className: "font-bold text-white text-lg", children: translatedCampaign.name }), _jsx("p", { className: "text-sm text-gray-400 my-2 flex-grow", children: translatedCampaign.description }), _jsxs("div", { className: "text-xs space-y-1 mt-2 pt-2 border-t border-gray-700/50", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t.marketing.campaigns.cost }), _jsxs("div", { children: [discountFactor > 0 && _jsx("span", { className: "line-through text-gray-500 mr-2", children: formatCurrency(campaign.cost) }), _jsx("span", { className: "font-bold text-amber-400", children: formatCurrency(discountedCost) })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: t.marketing.campaigns.hypeBonus }), _jsx("div", { className: "flex", children: Array.from({ length: 10 }).map((_, i) => (_jsx(StarIcon, { className: `w-4 h-4 ${i < campaign.hypeStars ? 'text-yellow-400' : 'text-gray-600'}` }, i))) })] })] })] }, campaign.id));
                    }) }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx("button", { onClick: onClose, className: "bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded", children: t.common.cancel }) })] }) }));
};
const CurrentFilmCampaignsTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [selectedCampaignId, setSelectedCampaignId] = useState(PRODUCTION_MARKETING_CAMPAIGNS[0].id);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [confirmModalCampaign, setConfirmModalCampaign] = useState(null);
    const [selectedProjectTitle, setSelectedProjectTitle] = useState(null);
    // Identify all projects currently in production or post-production
    const activeProjects = useMemo(() => {
        if (!playerData?.activeProjects)
            return [];
        return playerData.activeProjects.filter(p => p.phase === ProjectPhase.Production || p.phase === ProjectPhase.PostProduction);
    }, [playerData?.activeProjects]);
    // Auto-select a project if none is selected or selection is invalid
    useEffect(() => {
        if (activeProjects.length > 0) {
            if (!selectedProjectTitle || !activeProjects.find(p => p.workingTitle === selectedProjectTitle)) {
                setSelectedProjectTitle(activeProjects[0].workingTitle);
            }
        }
        else {
            setSelectedProjectTitle(null);
        }
    }, [activeProjects, selectedProjectTitle]);
    // Calculate Discount Factor once (Shared logic)
    const discountFactor = useMemo(() => {
        if (!playerData)
            return 0;
        let bestEffectiveTalent = 0;
        playerData.employees.filter(e => e.type === EmployeeType.Marketingmanager).forEach(e => {
            const eff = e.talent * (e.satisfaction / 100);
            if (eff > bestEffectiveTalent)
                bestEffectiveTalent = eff;
        });
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Marketingmanager && playerData.partnerSkills) {
            const eff = playerData.partnerSkills.marketing;
            if (eff > bestEffectiveTalent)
                bestEffectiveTalent = eff;
        }
        playerData.children.forEach(c => {
            if (c.isEmployed && c.employedAs === EmployeeType.Marketingmanager && c.skills) {
                const eff = c.skills.marketing;
                if (eff > bestEffectiveTalent)
                    bestEffectiveTalent = eff;
            }
        });
        return Math.min(0.20, bestEffectiveTalent / 500);
    }, [playerData]);
    const targetProject = activeProjects.find(p => p.workingTitle === selectedProjectTitle);
    const activeCampaigns = useMemo(() => {
        if (!playerData)
            return [];
        if (playerData.activeProductionCampaigns?.length)
            return playerData.activeProductionCampaigns;
        return playerData.activeProductionCampaign ? [playerData.activeProductionCampaign] : [];
    }, [playerData]);
    const activeCampaign = useMemo(() => {
        if (!targetProject)
            return null;
        const targetTitle = targetProject.workingTitle.trim().toLocaleLowerCase();
        return activeCampaigns.find(c => c.projectTitle?.trim().toLocaleLowerCase() === targetTitle) || null;
    }, [activeCampaigns, targetProject]);
    // Show empty state if no projects and no active campaign
    if (!targetProject && activeCampaigns.length === 0) {
        return (_jsxs("div", { className: "text-center p-8 bg-gray-900/80 border border-gray-700 rounded-lg max-w-2xl mx-auto shadow-xl", children: [_jsx("h3", { className: "text-xl text-amber-300 font-bold mb-4", children: t.marketing.campaigns.noProduction }), _jsx("p", { className: "text-gray-400 mb-4", dangerouslySetInnerHTML: { __html: t.marketing.campaigns.description } }), _jsx("p", { className: "text-gray-500 italic text-sm", children: t.marketing.campaigns.startProjectHint })] }));
    }
    // Default to the first campaign or the selected one
    const selectedCampaign = PRODUCTION_MARKETING_CAMPAIGNS.find(c => c.id === selectedCampaignId) || PRODUCTION_MARKETING_CAMPAIGNS[0];
    const translatedSelectedCampaign = t.marketing.campaignData[selectedCampaign.id] || selectedCampaign;
    // Calculate Discounted Cost
    const discountedCost = Math.round(selectedCampaign.cost * (1 - discountFactor));
    // Active campaign display info
    const activeCampaignDef = activeCampaign ? PRODUCTION_MARKETING_CAMPAIGNS.find(c => c.id === activeCampaign.campaignId) : null;
    const translatedActiveCampaignName = activeCampaignDef ? (t.marketing.campaignData[activeCampaignDef.id]?.name || activeCampaignDef.name) : '';
    const getCampaignDisabledReason = (campaign) => {
        if (activeCampaign)
            return t.marketing.campaigns.disabledReason.active;
        if (targetProject?.usedProductionCampaigns?.includes(campaign.id))
            return t.marketing.campaigns.disabledReason.used;
        if (targetProject && campaign.phase && targetProject.phase < campaign.phase)
            return t.marketing.campaigns.disabledReason.wrongPhase.replace('{phase}', campaign.phase === ProjectPhase.PostProduction ? t.marketing.campaigns.disabledReason.phasePostProduction : t.marketing.campaigns.disabledReason.phaseProduction);
        // Use discounted cost for check
        const costCheck = Math.round(campaign.cost * (1 - discountFactor));
        if (playerData.capital < costCheck)
            return t.marketing.campaigns.disabledReason.noCapital;
        return null;
    };
    const disabledReason = getCampaignDisabledReason(selectedCampaign);
    const handleStartCampaign = () => {
        setConfirmModalCampaign(selectedCampaign);
    };
    const confirmStartCampaign = () => {
        if (!confirmModalCampaign || !playerData || !targetProject)
            return;
        const finalCost = Math.round(confirmModalCampaign.cost * (1 - discountFactor));
        setPlayerData(prev => {
            if (!prev)
                return null;
            const startDate = new Date(prev.gameDate);
            const endDate = new Date(prev.gameDate);
            // Setze eine sehr lange Dauer als Fallback. 
            // Die eigentliche Beendigung wird durch den Projektstatus "PostProduction" im useActivityLoop getriggert.
            endDate.setDate(endDate.getDate() + 180);
            const newActiveCampaign = {
                campaignId: confirmModalCampaign.id,
                projectTitle: targetProject.workingTitle,
                startDate: startDate,
                endDate: endDate
            };
            // Mark campaign as used for THIS specific project immediately
            const updatedProjects = prev.activeProjects.map(p => {
                if (p.workingTitle === targetProject.workingTitle) {
                    return {
                        ...p,
                        usedProductionCampaigns: [...(p.usedProductionCampaigns || []), confirmModalCampaign.id]
                    };
                }
                return p;
            });
            return {
                ...prev,
                capital: prev.capital - finalCost,
                activeProductionCampaigns: [...(prev.activeProductionCampaigns || []), newActiveCampaign],
                activeProductionCampaign: null,
                activeProjects: updatedProjects,
                transactionLog: [...prev.transactionLog, {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Marketing',
                        description: t.transactionDescriptions.marketingCampaign.replace('{name}', translatedSelectedCampaign.name),
                        amount: finalCost,
                        descriptionKey: 'marketingCampaign',
                        descriptionVars: {
                            name: translatedSelectedCampaign.name,
                            filmTitle: targetProject.workingTitle
                        }
                    }]
            };
        });
        setConfirmModalCampaign(null);
    };
    return (_jsxs("div", { className: "w-full h-full flex flex-col", children: [_jsxs("div", { className: "flex-grow bg-gray-800/80 p-6 rounded-lg shadow-2xl border border-gray-700 overflow-y-auto custom-scrollbar", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-6 font-cinzel text-amber-400", children: activeCampaign ? t.marketing.campaigns.activeCampaign : t.marketing.campaigns.title }), activeProjects.length > 1 && (_jsx("p", { className: "text-center text-xs text-gray-400 mb-6", children: t.marketing.campaigns.singleActiveHint })), activeProjects.length > 1 && (_jsx("div", { className: "flex gap-2 justify-center mb-6", children: activeProjects.map(p => (_jsx("button", { onClick: () => setSelectedProjectTitle(p.workingTitle), className: `px-4 py-2 rounded-md border text-sm font-bold transition-all ${selectedProjectTitle === p.workingTitle
                                ? 'bg-amber-600 text-white border-amber-500'
                                : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700'}`, children: p.workingTitle }, p.workingTitle))) })), targetProject && (_jsxs("div", { className: "flex items-center gap-6 mb-8 bg-gray-900/50 p-4 rounded-lg border border-gray-600 max-w-4xl mx-auto", children: [_jsxs("div", { className: "w-24 h-36 bg-black rounded overflow-hidden border border-gray-700 flex-shrink-0 relative", children: [_jsx("img", { src: targetProject.customCover || getCoverPath(targetProject.genre, targetProject.coverImageId || 1), alt: targetProject.workingTitle, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1", children: targetProject.studioId ? targetProject.studioId.replace('studio', 'Studio ') : 'Main' })] }), _jsxs("div", { className: "flex-grow", children: [_jsx("h3", { className: "text-2xl font-bold text-white", children: targetProject.workingTitle }), _jsx("p", { className: "text-amber-300", children: t.genres[targetProject.genre] }), _jsxs("div", { className: "flex items-center gap-6 mt-3 text-sm text-gray-300", children: [_jsxs("div", { className: "flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full", children: [_jsxs("span", { children: [t.marketing.campaigns.hypeBonus, ":"] }), _jsx(HeartRating, { rating: targetProject.hype || 0, size: "sm" })] }), _jsxs("div", { className: "px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full border border-blue-500/30 font-bold flex items-center gap-2", children: [_jsx(ProduktionIcon, { className: "w-4 h-4" }), targetProject.phase === ProjectPhase.Production ? t.marketing.campaigns.filming : t.marketing.campaigns.postProduction] })] })] })] })), activeCampaign ? (_jsx("div", { className: "text-center py-8", children: _jsxs("div", { className: "inline-block p-8 bg-green-900/20 border border-green-500/50 rounded-xl shadow-lg max-w-lg w-full", children: [_jsx("h4", { className: "text-2xl font-bold text-green-400 mb-2 font-cinzel", children: t.marketing.campaigns.activeCampaign }), _jsx("p", { className: "text-white text-lg font-bold mb-6", children: translatedActiveCampaignName }), _jsxs("div", { className: "relative pt-1", children: [_jsxs("div", { className: "flex mb-2 items-center justify-between", children: [_jsx("div", { children: _jsx("span", { className: "text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-200 bg-green-900", children: t.marketing.campaigns.statusLabel }) }), _jsx("div", { className: "text-right", children: _jsx("span", { className: "text-xs font-semibold inline-block text-green-200", children: t.marketing.campaigns.statusRunning }) })] }), _jsx("div", { className: "overflow-hidden h-3 mb-4 text-xs flex rounded bg-green-900/50 border border-green-700", children: _jsx("div", { className: "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 animate-pulse w-full" }) })] }), _jsx("p", { className: "text-sm text-gray-400 italic", children: t.marketing.campaigns.campaignEnds }), _jsx("p", { className: "text-xs text-gray-500 mt-4 border-t border-gray-700 pt-2", children: t.marketing.campaigns.campaignEndsPostProductionNote })] }) })) : targetProject ? (_jsx("div", { className: "max-w-3xl mx-auto", children: _jsxs("div", { className: "bg-gray-900/50 p-6 rounded-lg border border-gray-600 text-center", children: [_jsx("h4", { className: "text-lg font-bold text-gray-400 mb-4 uppercase tracking-widest border-b border-gray-700 pb-2", children: t.marketing.campaigns.selectedCampaign }), _jsxs("button", { onClick: () => setIsSelectionModalOpen(true), className: "w-full bg-gray-800 hover:bg-gray-750 border-2 border-amber-500/50 rounded-xl p-6 transition-all group mb-6 relative overflow-hidden text-left", children: [_jsxs("div", { className: "relative z-10 flex flex-col items-center", children: [_jsx("h3", { className: "text-3xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors", children: translatedSelectedCampaign.name }), _jsx("p", { className: "text-gray-400 mb-6 max-w-xl text-center", children: translatedSelectedCampaign.description }), _jsxs("div", { className: "grid grid-cols-2 gap-8 w-full max-w-md bg-black/20 p-3 rounded-lg", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-500 text-xs uppercase mb-1", children: t.marketing.campaigns.cost }), _jsxs("div", { className: "flex flex-col", children: [discountFactor > 0 && _jsx("span", { className: "line-through text-gray-500 text-xs", children: formatCurrency(selectedCampaign.cost) }), _jsx("p", { className: "font-bold text-white font-mono text-lg", children: formatCurrency(discountedCost) })] })] }), _jsxs("div", { className: "text-center border-l border-gray-700", children: [_jsx("p", { className: "text-gray-500 text-xs uppercase mb-1", children: t.marketing.campaigns.hypeBonus }), _jsx("div", { className: "flex justify-center mt-1", children: Array.from({ length: 5 }).map((_, i) => (_jsx(StarIcon, { className: `w-4 h-4 ${i < Math.ceil(selectedCampaign.hypeStars / 2) ? 'text-yellow-400' : 'text-gray-800'}` }, i))) })] })] })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20", children: _jsx("span", { className: "text-xl font-bold text-amber-400 border-b-2 border-amber-400 pb-1", children: t.marketing.campaigns.clickToChange }) })] }), _jsx("button", { onClick: handleStartCampaign, disabled: !!disabledReason, className: "bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-16 rounded-sm uppercase tracking-wider text-xl shadow-lg shadow-green-900/30 transition-all transform hover:scale-105 disabled:transform-none disabled:shadow-none", children: t.marketing.campaigns.startCampaign }), disabledReason && (_jsxs("div", { className: "mt-4 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm font-bold inline-block", children: ["\u26A0\uFE0F ", disabledReason] }))] }) })) : null] }), isSelectionModalOpen && (_jsx(CampaignSelectionModal, { onSelect: (id) => { setSelectedCampaignId(id); setIsSelectionModalOpen(false); }, onClose: () => setIsSelectionModalOpen(false), currentCampaignId: selectedCampaignId, playerData: playerData })), confirmModalCampaign && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center animate-fade-in", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-6", children: t.marketing.campaigns.modalConfirmTitle }), _jsxs("p", { className: "text-gray-300 text-lg mb-8 leading-relaxed", children: [t.marketing.campaigns.modalConfirmText.replace('{campaignName}', translatedSelectedCampaign.name).replace('{cost}', formatCurrency(Math.round(confirmModalCampaign.cost * (1 - discountFactor)))), _jsx("br", {}), _jsx("br", {}), _jsxs("span", { className: "text-sm text-gray-500", children: [t.marketing.campaigns.forProjectLabel, ": ", _jsx("span", { className: "text-white font-bold", children: targetProject?.workingTitle })] })] }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setConfirmModalCampaign(null), className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }), _jsx("button", { onClick: confirmStartCampaign, className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all", children: t.common.yes })] })] }) }))] }));
};
export default CurrentFilmCampaignsTab;
