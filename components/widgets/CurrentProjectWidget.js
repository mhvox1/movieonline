import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { GameState, ProjectPhase, BuildingType } from '../../types';
import DashboardWidget from '../DashboardWidget';
import { useGame } from '../../contexts/GameContext';
import { MOVIE_SIZE_CONFIG, EXTRAS_OPTIONS } from '../constants';
import StarRating from '../StarRating';
import HeartRating from '../HeartRating';
import { getCoverPath } from '../coverConfig';
import NeuesProjektIcon from '../icons/NeuesProjektIcon';
import { useTranslation } from '../../hooks/useTranslation';
const DetailRow = ({ label, value }) => (_jsxs("div", { className: "flex justify-between items-center text-xs py-1 border-b border-gray-700/50 last:border-b-0", children: [_jsx("span", { className: "text-gray-400", children: label }), _jsx("div", { className: "font-semibold text-white text-right truncate pl-2", children: value })] }));
const ProgressBar = ({ progress, text, color = 'bg-green-500' }) => (_jsx("div", { className: "w-full bg-gray-700 rounded-full h-5 overflow-hidden border border-gray-600", children: _jsx("div", { className: `${color} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-sm font-bold text-black`, style: { width: `${progress}%` }, children: text || `${Math.round(progress)}%` }) }));
const getDaysRemaining = (endDate, gameDate) => Math.max(0, Math.ceil((new Date(endDate).getTime() - gameDate.getTime()) / 86400000));
const TabButton = ({ title, isActive, onClick, disabled }) => (_jsx("button", { onClick: onClick, disabled: disabled, className: `flex-1 px-2 py-2 text-sm font-bold rounded-t-md transition-colors ${isActive
        ? 'bg-gray-800/50 text-amber-400 border-b-2 border-amber-400'
        : 'text-gray-500 hover:text-white'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`, children: title }));
const CurrentProjectWidget = ({ onNavigate, onNavigateToProjectsView }) => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    // State for Active Tab
    const [activeTab, setActiveTab] = useState('studio1');
    // Initial Tab Selection Logic (Run once on mount or if current tab becomes empty)
    useEffect(() => {
        if (!playerData)
            return;
        // Check if current tab has a project
        const hasProjectInCurrentTab = playerData.activeProjects.some(p => p.studioId === activeTab);
        // If current tab is empty, but we have projects elsewhere, switch to the first one found
        if (!hasProjectInCurrentTab && playerData.activeProjects.length > 0) {
            const firstProject = playerData.activeProjects[0];
            if (firstProject.studioId && (firstProject.studioId === 'studio1' || firstProject.studioId === 'studio2' || firstProject.studioId === 'studio3')) {
                setActiveTab(firstProject.studioId);
            }
        }
    }, [playerData?.activeProjects?.length]); // Only re-run if number of projects changes
    if (!playerData)
        return null;
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    // Check which studios are built
    const studio2Built = playerData.buildings.some(b => b.type === BuildingType.Studio2 && b.level > 0);
    const studio3Built = playerData.buildings.some(b => b.type === BuildingType.Studio3 && b.level > 0);
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    // --- DATA CALCULATION (DIRECT - NO MEMO) ---
    // We calculate this directly in render to ensure we always have the freshest state (Hype, Cost, etc.)
    // React's VDOM diffing handles the performance efficiently for this size of widget.
    const projectToDisplay = playerData.activeProjects.find(p => p.studioId === activeTab);
    let projectData = null;
    if (projectToDisplay) {
        const { gameDate, directors, actors } = playerData;
        const title = projectToDisplay.workingTitle;
        const genre = t.genres[projectToDisplay.genre];
        const movieSizeName = projectToDisplay.movieSize ? MOVIE_SIZE_CONFIG[projectToDisplay.movieSize].name : '-';
        const ageRatingLabel = projectToDisplay.ageRating ? t.project.planning.ratings[projectToDisplay.ageRating] : '-';
        // Direct access to volatile values
        const rawPotential = projectToDisplay.projectPotential || projectToDisplay.scriptQuality || 0;
        const rawHype = projectToDisplay.hype || 0;
        const resolveName = (id) => {
            if (id === undefined)
                return '-';
            if (id === -1)
                return playerData.playerName;
            if (id === 99901)
                return playerData.partnerName || 'Partner';
            if (id >= 99910)
                return playerData.children[id - 99910]?.name || 'Kind';
            const director = directors.find(d => d.id === id);
            if (director)
                return director.name;
            const actor = actors.find(a => a.id === id);
            if (actor)
                return actor.name;
            return '-';
        };
        const directorName = resolveName(projectToDisplay.directorId);
        const mainActorName = resolveName(projectToDisplay.mainActorId);
        const supportingActorName = resolveName(projectToDisplay.supportingActorId);
        const extrasName = projectToDisplay.extrasLevel ? (t.productionOptions.extras[`level${projectToDisplay.extrasLevel}`]?.name || EXTRAS_OPTIONS.find(e => e.level === projectToDisplay.extrasLevel)?.name) : "-";
        const totalWeeklyCosts = projectToDisplay.accumulatedWeeklyCosts || 0;
        const totalProductionEventCosts = playerData.transactionLog.filter(tr => projectToDisplay.productionStartDate &&
            tr.category === 'Filmproduktion' &&
            tr.type === 'Ausgabe' &&
            (tr.description.includes(`"${projectToDisplay.workingTitle}"`) || tr.description.includes(projectToDisplay.workingTitle)) &&
            new Date(tr.date) >= new Date(projectToDisplay.productionStartDate) &&
            new Date(tr.date) <= new Date(playerData.gameDate) &&
            !tr.descriptionKey?.includes('productionStart') &&
            !tr.descriptionKey?.includes('postProductionStart') &&
            !tr.descriptionKey?.includes('weeklyProductionCosts')).reduce((sum, tr) => sum + tr.amount, 0);
        const totalMarketingCampaignCosts = playerData.transactionLog.filter(tr => tr.category === 'Marketing' &&
            tr.type === 'Ausgabe' &&
            tr.descriptionKey === 'marketingCampaign' &&
            tr.descriptionVars?.filmTitle === projectToDisplay.workingTitle).reduce((sum, tr) => sum + tr.amount, 0);
        const laufendeProduktionskostenValue = totalWeeklyCosts + totalProductionEventCosts + totalMarketingCampaignCosts;
        const baseTotalCost = (projectToDisplay.scriptBudget || 0) +
            (projectToDisplay.movieSizeBudget || 0) +
            (projectToDisplay.seriesPlanningCost || 0) +
            (projectToDisplay.castingCost || 0) +
            (projectToDisplay.directorGage || 0) +
            (projectToDisplay.mainActorGage || 0) +
            (projectToDisplay.supportingActorGage || 0) +
            (projectToDisplay.productionCost || 0) +
            (projectToDisplay.postProductionCost || 0);
        const currentTotalCost = baseTotalCost + laufendeProduktionskostenValue;
        const laufendeProduktionskosten = formatCurrency(laufendeProduktionskostenValue);
        const gesamtkosten = formatCurrency(currentTotalCost);
        let showProgressBar = false;
        let phaseText = "";
        let progress = 0;
        let color = "";
        let daysRemainingText = "";
        const calculateProgress = (start, end) => {
            const totalDuration = new Date(end).getTime() - new Date(start).getTime();
            if (totalDuration <= 0)
                return 100;
            const elapsed = gameDate.getTime() - new Date(start).getTime();
            return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        };
        const activePhases = [ProjectPhase.Casting, ProjectPhase.Production, ProjectPhase.PostProduction, ProjectPhase.Completed];
        if (activePhases.includes(projectToDisplay.phase)) {
            showProgressBar = true;
        }
        switch (projectToDisplay.phase) {
            case ProjectPhase.Casting:
                phaseText = t.widgets.currentProject.phase.casting;
                if (projectToDisplay.castingStartDate && projectToDisplay.castingEndDate) {
                    progress = calculateProgress(projectToDisplay.castingStartDate, projectToDisplay.castingEndDate);
                    daysRemainingText = t.widgets.currentProject.daysRemaining.replace('{days}', getDaysRemaining(projectToDisplay.castingEndDate, gameDate).toString());
                }
                color = 'bg-green-500';
                break;
            case ProjectPhase.Production:
                phaseText = t.widgets.currentProject.phase.production;
                if (projectToDisplay.productionStartDate && projectToDisplay.productionEndDate) {
                    progress = calculateProgress(projectToDisplay.productionStartDate, projectToDisplay.productionEndDate);
                    daysRemainingText = t.widgets.currentProject.daysRemaining.replace('{days}', getDaysRemaining(projectToDisplay.productionEndDate, gameDate).toString());
                }
                color = 'bg-blue-500';
                break;
            case ProjectPhase.PostProduction:
                phaseText = t.widgets.currentProject.phase.postProduction;
                if (projectToDisplay.postProductionStartDate && projectToDisplay.postProductionEndDate) {
                    progress = calculateProgress(projectToDisplay.postProductionStartDate, projectToDisplay.postProductionEndDate);
                    daysRemainingText = t.widgets.currentProject.daysRemaining.replace('{days}', getDaysRemaining(projectToDisplay.postProductionEndDate, gameDate).toString());
                }
                color = 'bg-violet-500';
                break;
            case ProjectPhase.Completed:
                phaseText = t.widgets.currentProject.phase.completed;
                progress = 100;
                daysRemainingText = t.widgets.currentProject.readyForRelease;
                color = 'bg-teal-500';
                break;
        }
        let contractDeadlineText = null;
        if (projectToDisplay.contract && projectToDisplay.contractDeadline) {
            const deadline = new Date(projectToDisplay.contractDeadline);
            const today = new Date(gameDate);
            const diffTime = deadline.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isUrgent = diffDays < 30;
            contractDeadlineText = (_jsxs("div", { className: `mt-2 text-xs font-bold text-center border-t border-gray-600 pt-1 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-blue-300'}`, children: ["Frist: ", deadline.toLocaleDateString(locale), " (", diffDays, " Tage)"] }));
        }
        projectData = {
            title,
            genre,
            movieSizeName,
            ageRatingLabel,
            rawPotential,
            rawHype,
            directorName,
            mainActorName,
            supportingActorName,
            extrasName,
            laufendeProduktionskosten,
            gesamtkosten,
            showProgressBar,
            phaseText,
            progress,
            color,
            daysRemainingText,
            rawProject: projectToDisplay,
            contractDeadlineText
        };
    }
    const getPositionClass = (position) => {
        switch (position) {
            case 'top': return 'justify-start pt-2';
            case 'top-center': return 'justify-start pt-[25%]';
            case 'center': return 'justify-center';
            case 'bottom-center': return 'justify-end pb-[25%]';
            case 'bottom': return 'justify-end pb-2';
            default: return 'justify-end pb-2';
        }
    };
    return (_jsxs(DashboardWidget, { title: t.widgets.currentProject.title, children: [_jsxs("div", { className: "flex mb-4 border-b border-gray-700/50 -mt-2 -mx-4 px-2", children: [_jsx(TabButton, { title: "Studio 1", isActive: activeTab === 'studio1', onClick: () => setActiveTab('studio1') }), _jsx(TabButton, { title: "Studio 2", isActive: activeTab === 'studio2', onClick: () => setActiveTab('studio2'), disabled: !studio2Built }), _jsx(TabButton, { title: "Studio 3", isActive: activeTab === 'studio3', onClick: () => setActiveTab('studio3'), disabled: !studio3Built })] }), projectData ? (_jsxs("div", { onClick: () => onNavigateToProjectsView('current_project', projectData.rawProject.workingTitle), className: "cursor-pointer space-y-3", children: [_jsxs("h4", { className: "text-xl font-bold text-white truncate text-center mb-3", children: ["\"", projectData.title, "\""] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx("div", { className: "col-span-1 flex items-center justify-center", children: _jsxs("div", { className: "relative w-[180px] h-[270px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700 mx-auto", children: [projectData.rawProject.contract ? (_jsx("div", { className: "w-full h-full bg-black flex items-center justify-center relative overflow-hidden", children: _jsx("div", { className: "absolute inset-0 flex items-center justify-center transform -rotate-45", children: _jsx("div", { className: "bg-amber-500 w-[200%] py-2 text-center shadow-lg", children: _jsx("span", { className: "text-black font-black text-sm uppercase tracking-widest font-cinzel", children: t.project.modeSelector.contract }) }) }) })) : (_jsxs(_Fragment, { children: [_jsx("img", { src: projectData.rawProject.customCover || getCoverPath(projectData.rawProject.genre, projectData.rawProject.coverImageId || 1), alt: `Cover for ${projectData.rawProject.workingTitle}`, className: "w-full h-full object-cover" }), _jsx("div", { className: `absolute inset-0 flex flex-col pointer-events-none p-0.5 ${getPositionClass(projectData.rawProject.coverTitlePosition)}`, children: _jsx("h3", { className: "text-white text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]", style: { fontFamily: projectData.rawProject.coverTitleFontFamily || 'Cinzel', fontSize: `${(projectData.rawProject.coverTitleFontSize || 30) * 0.6}px`, lineHeight: 1.1, color: projectData.rawProject.coverTitleColor || '#FFFFFF' }, children: projectData.rawProject.workingTitle }) })] })), (!projectData.rawProject.contract && projectData.rawProject.directorId !== undefined && projectData.rawProject.mainActorId !== undefined) &&
                                            (() => {
                                                const titlePos = projectData.rawProject.coverTitlePosition || 'bottom';
                                                const namesPositionClass = (titlePos === 'top' || titlePos === 'top-center' || titlePos === 'center') ? 'bottom-0.5' : 'top-0.5';
                                                // Correctly using data from useMemo
                                                const directorNameUpper = projectData.directorName.toUpperCase();
                                                const actorNameUpper = projectData.mainActorName.toUpperCase();
                                                const combinedLength = directorNameUpper.length + actorNameUpper.length;
                                                // SCALED FONT SIZE FOR 180px CONTAINER
                                                let nameFontSize = 9;
                                                if (combinedLength > 40)
                                                    nameFontSize = 7;
                                                else if (combinedLength > 30)
                                                    nameFontSize = 8;
                                                return (_jsx("div", { className: `absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-0.5 pointer-events-none`, style: {
                                                        color: projectData.rawProject.coverTitleColor || '#FFFFFF',
                                                        fontSize: `${nameFontSize}px`,
                                                        lineHeight: '1.1'
                                                    }, children: _jsxs("p", { children: [directorNameUpper, " ", _jsx("span", { className: "mx-0.5", children: "\u2022" }), " ", actorNameUpper] }) }));
                                            })()] }) }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "grid grid-cols-1 gap-x-4", children: [_jsx(DetailRow, { label: t.widgets.currentProject.genre, value: projectData.genre }), _jsx(DetailRow, { label: t.widgets.currentProject.size, value: projectData.movieSizeName }), _jsx(DetailRow, { label: t.project.planning.ageRating, value: projectData.ageRatingLabel }), _jsx(DetailRow, { label: t.widgets.currentProject.director, value: projectData.directorName }), _jsx(DetailRow, { label: t.widgets.currentProject.mainActor, value: projectData.mainActorName }), _jsx(DetailRow, { label: t.widgets.currentProject.supportingActor, value: projectData.supportingActorName }), _jsx(DetailRow, { label: t.widgets.currentProject.potential, value: projectData.rawPotential ? _jsx(StarRating, { rating: projectData.rawPotential, size: "sm" }) : '-' }), !projectData.rawProject.contract && (_jsx(DetailRow, { label: t.widgets.currentProject.hype, value: _jsx(HeartRating, { rating: projectData.rawHype, size: "sm" }) })), _jsx(DetailRow, { label: t.widgets.currentProject.runningCosts, value: projectData.laufendeProduktionskosten }), _jsx(DetailRow, { label: t.widgets.currentProject.totalCosts, value: projectData.gesamtkosten }), projectData.contractDeadlineText] }) })] }), projectData.showProgressBar && (_jsxs("div", { className: "mt-4 pt-3 border-t border-gray-700/50 space-y-2", children: [_jsxs("div", { className: "flex justify-between items-baseline text-sm", children: [_jsxs("p", { children: ["Phase: ", _jsx("span", { className: "font-semibold text-amber-300", children: projectData.phaseText })] }), _jsx("p", { className: "text-gray-300", children: projectData.daysRemainingText })] }), _jsx(ProgressBar, { progress: projectData.progress, color: projectData.color })] }))] })) : (_jsxs("div", { onClick: () => onNavigate(GameState.Projects), className: "cursor-pointer space-y-3", children: [_jsx("h4", { className: "text-xl font-bold text-white truncate text-center mb-3", children: t.widgets.currentProject.startNew }), _jsxs("div", { className: "w-full h-[270px] flex flex-col items-center justify-center text-gray-500 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 hover:border-amber-500 transition-colors", children: [_jsx(NeuesProjektIcon, { className: "h-16 w-16 bg-gray-600" }), _jsx("p", { className: "text-xs mt-2", children: `Studio ${activeTab.slice(-1)} ist frei` })] })] }))] }));
};
export default CurrentProjectWidget;
