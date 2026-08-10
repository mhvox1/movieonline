import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ProjectPhase, BuildingType } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import { getCoverPath } from '../../coverConfig';
import StarRating from '../../StarRating';
import { useTranslation } from '../../../hooks/useTranslation';
import { getTranslatedScriptDescription } from '../../scriptGenerator';
import ProduktionIcon from '../../icons/ProduktionIcon';
const SavedProjectsTab = ({ setGameState, setCurrentView, onProjectLoaded }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
    const [showStudioSelect, setShowStudioSelect] = useState(null);
    if (!playerData)
        return null;
    const formatCurrency = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    // Get active projects
    const activeProjects = playerData.activeProjects || [];
    // Check which studios are occupied
    const isStudio1Occupied = activeProjects.some(p => p.studioId === 'studio1');
    const isStudio2Occupied = activeProjects.some(p => p.studioId === 'studio2');
    const isStudio3Occupied = activeProjects.some(p => p.studioId === 'studio3');
    // Check which studios are built
    const studio2Built = playerData.buildings.some(b => b.type === BuildingType.Studio2 && b.level > 0);
    const studio3Built = playerData.buildings.some(b => b.type === BuildingType.Studio3 && b.level > 0);
    const handleLoadProject = (template, studioId) => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            const newProject = {
                ...template,
                phase: ProjectPhase.CastingSetup,
                templateTitle: template.workingTitle,
                scriptStartDate: new Date(prev.gameDate),
                scriptEndDate: new Date(prev.gameDate),
                productionStartDate: undefined,
                productionEndDate: undefined,
                coverImageId: template.coverImageId || 1,
                coverTitlePosition: template.coverTitlePosition || 'bottom',
                coverTitleFontSize: template.coverTitleFontSize || 30,
                coverTitleFontFamily: template.coverTitleFontFamily || 'Cinzel',
                coverTitleColor: template.coverTitleColor || '#FFFFFF',
                studioId: studioId,
            };
            return {
                ...prev,
                // Add to active projects
                activeProjects: [...prev.activeProjects, newProject]
            };
        });
        // Trigger parent callback to switch studio tab
        if (onProjectLoaded) {
            onProjectLoaded(studioId);
        }
        setShowStudioSelect(null);
        setCurrentView('current_project');
    };
    const handleDeleteTemplate = () => {
        if (!projectToDelete)
            return;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const updatedTemplates = (prev.savedProjectTemplates || []).filter(t => t.workingTitle !== projectToDelete.workingTitle);
            let updatedAvailableScripts = [...prev.availableScripts];
            const scriptExists = prev.availableScripts.some(s => s.id === projectToDelete.scriptId);
            if (projectToDelete.scriptId && !scriptExists) {
                const restoredScript = {
                    id: projectToDelete.scriptId,
                    title: projectToDelete.scriptTitle || (language === 'de' ? 'Wiederhergestelltes Drehbuch' : 'Restored Script'),
                    genre: projectToDelete.genre,
                    era: projectToDelete.era,
                    quality: projectToDelete.scriptQuality,
                    description: projectToDelete.scriptDescription || (language === 'de' ? 'Beschreibung nicht verfügbar.' : 'Description not available.'),
                    price: projectToDelete.scriptBudget,
                    sourcePlotIndex: projectToDelete.sourcePlotIndex,
                    titleStructure: projectToDelete.titleStructure,
                };
                updatedAvailableScripts.push(restoredScript);
            }
            return {
                ...prev,
                savedProjectTemplates: updatedTemplates,
                availableScripts: updatedAvailableScripts,
            };
        });
        setProjectToDelete(null);
        if (selectedTemplateIndex > 0)
            setSelectedTemplateIndex(0);
    };
    const getPositionClass = (position) => {
        switch (position) {
            case 'top': return 'justify-start pt-4';
            case 'top-center': return 'justify-start pt-[25%]';
            case 'center': return 'justify-center';
            case 'bottom-center': return 'justify-end pb-[25%]';
            case 'bottom': return 'justify-end pb-4';
            default: return 'justify-end pb-4';
        }
    };
    const templates = playerData.savedProjectTemplates || [];
    const template = templates[selectedTemplateIndex];
    if (templates.length === 0) {
        return (_jsxs("div", { className: "w-full max-w-2xl bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-700 mx-auto", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-2 font-cinzel text-amber-400", children: t.project.saved.title }), _jsx("p", { className: "text-center text-gray-500 italic py-8", children: t.project.saved.noTemplates })] }));
    }
    if (!template)
        return null;
    const handlePrev = () => {
        setSelectedTemplateIndex(prev => (prev === 0 ? templates.length - 1 : prev - 1));
    };
    const handleNext = () => {
        setSelectedTemplateIndex(prev => (prev === templates.length - 1 ? 0 : prev + 1));
    };
    const isThisProjectActive = activeProjects.some(p => p.workingTitle === template.workingTitle);
    const planner = template.plannerId ? playerData.employees.find(e => e.id === template.plannerId) : null;
    const plannerName = planner ? `${planner.name} (Talent: ${planner.talent})` : t.project.saved.noPlanner;
    const planningCost = (template.scriptBudget || 0) + (template.movieSizeBudget || 0) + (template.seriesPlanningCost || 0);
    const translatedPlot = getTranslatedScriptDescription(template, t);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full max-w-4xl bg-gray-800 bg-opacity-80 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-gray-700 mx-auto", children: [_jsx("h2", { className: "text-3xl font-bold text-center mb-1 font-cinzel text-amber-400", children: t.project.saved.title }), _jsxs("p", { className: "text-center text-gray-300 mb-6 text-lg", children: ["\"", template.workingTitle, "\""] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "md:col-span-1 flex items-start justify-center", children: _jsx("div", { className: "relative w-[200px] h-[300px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700", children: template.contract ? (_jsx("div", { className: "w-full h-full bg-black flex items-center justify-center relative overflow-hidden", children: _jsx("div", { className: "absolute inset-0 flex items-center justify-center transform -rotate-45", children: _jsx("div", { className: "bg-amber-500 w-[200%] py-2 text-center shadow-lg", children: _jsx("span", { className: "text-black font-black text-xl uppercase tracking-widest font-cinzel", children: t.project.modeSelector.contract }) }) }) })) : (_jsxs(_Fragment, { children: [_jsx("img", { src: template.customCover || getCoverPath(template.genre, template.coverImageId || 1), alt: `Cover für ${template.workingTitle}`, className: "w-full h-full object-cover" }), _jsx("div", { className: `absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass(template.coverTitlePosition)}`, children: _jsx("h3", { className: "text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]", style: { fontFamily: template.coverTitleFontFamily || 'Cinzel', fontSize: `${(template.coverTitleFontSize || 30) / 1.5}px`, lineHeight: 1.2, color: template.coverTitleColor || '#FFFFFF' }, children: template.workingTitle }) })] })) }) }), _jsxs("div", { className: "md:col-span-2 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-3 gap-3 text-sm", children: [_jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase", children: t.widgets.currentProject.genre }), _jsx("p", { className: "font-semibold text-white", children: t.genres[template.genre] })] }), _jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase", children: t.widgets.currentProject.size }), _jsx("p", { className: "font-semibold text-white", children: template.movieSize })] }), _jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase", children: t.project.planning.ageRating }), _jsx("p", { className: "font-semibold text-white truncate", title: template.ageRating ? t.project.planning.ratings[template.ageRating] : '-', children: template.ageRating ? t.project.planning.ratings[template.ageRating] : '-' })] })] }), _jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase", children: t.project.saved.planner }), _jsx("p", { className: "font-semibold text-white", children: plannerName })] }), _jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase", children: t.project.saved.cost }), _jsx("p", { className: "font-semibold text-white", children: formatCurrency(planningCost) })] }), _jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase mb-1", children: t.widgets.currentProject.potential }), _jsx(StarRating, { rating: template.projectPotential || template.scriptQuality, size: "sm" })] }), _jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [_jsx("p", { className: "text-gray-400 text-xs uppercase mb-1", children: t.project.saved.plot }), _jsxs("p", { className: "text-xs text-gray-300 h-16 overflow-y-auto pr-2 italic", children: ["\"", translatedPlot, "\""] })] })] })] }), _jsxs("div", { className: "mt-6 flex items-center justify-center gap-8", children: [_jsx("button", { onClick: handlePrev, disabled: templates.length <= 1, className: "p-2 rounded-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50", children: _jsx(ArrowLeftIcon, { className: "h-6 w-6" }) }), _jsxs("span", { className: "font-semibold text-gray-300", children: [selectedTemplateIndex + 1, " / ", templates.length] }), _jsx("button", { onClick: handleNext, disabled: templates.length <= 1, className: "p-2 rounded-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50", children: _jsx(ArrowRightIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "mt-4 pt-4 border-t border-gray-600 flex justify-center gap-4", children: [_jsx("button", { onClick: () => setProjectToDelete(template), className: "bg-red-800 text-white font-bold py-3 px-8 rounded-sm text-base uppercase tracking-wider transform hover:bg-red-700 transition-all", children: t.project.saved.deleteTemplate }), _jsx("button", { onClick: () => setShowStudioSelect(template), disabled: isThisProjectActive, className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm text-base uppercase tracking-wider transform hover:bg-green-500 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed", children: t.project.saved.startProduction })] }), isThisProjectActive && _jsx("p", { className: "text-center text-amber-300 mt-2 font-bold text-sm", children: t.project.saved.activeWarning })] }), projectToDelete && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.saved.deleteConfirmTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.saved.deleteConfirmText.replace('{title}', projectToDelete.workingTitle) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setProjectToDelete(null), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }), _jsx("button", { onClick: handleDeleteTemplate, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.common.yes })] })] }) })), showStudioSelect && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-6 text-center", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-6", children: language === 'de' ? 'Studio wählen' : 'Choose Studio' }), _jsx("p", { className: "text-gray-300 mb-6", children: language === 'de' ? 'In welchem Studio soll die Produktion stattfinden?' : 'Which studio should host the production?' }), _jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("button", { onClick: () => handleLoadProject(showStudioSelect, 'studio1'), disabled: isStudio1Occupied, className: "bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-amber-500 transition-all disabled:opacity-50 disabled:hover:border-gray-600 flex items-center justify-between group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-gray-800 rounded-full text-amber-400", children: _jsx(ProduktionIcon, { className: "h-6 w-6" }) }), _jsxs("div", { className: "text-left", children: [_jsx("h4", { className: "font-bold text-white group-hover:text-amber-300 transition-colors", children: "Studio 1" }), _jsx("p", { className: "text-xs text-gray-400", children: isStudio1Occupied ? (language === 'de' ? 'Belegt' : 'Occupied') : (language === 'de' ? 'Verfügbar' : 'Available') })] })] }), isStudio1Occupied && _jsx("span", { className: "text-red-400 font-bold text-sm", children: language === 'de' ? 'Belegt' : 'Occupied' })] }), _jsxs("button", { onClick: () => handleLoadProject(showStudioSelect, 'studio2'), disabled: !studio2Built || isStudio2Occupied, className: "bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-amber-500 transition-all disabled:opacity-50 disabled:hover:border-gray-600 flex items-center justify-between group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-full ${studio2Built ? 'bg-gray-800 text-amber-400' : 'bg-gray-900 text-gray-600'}`, children: _jsx(ProduktionIcon, { className: "h-6 w-6" }) }), _jsxs("div", { className: "text-left", children: [_jsx("h4", { className: "font-bold text-white group-hover:text-amber-300 transition-colors", children: "Studio 2" }), _jsx("p", { className: "text-xs text-gray-400", children: !studio2Built ? (language === 'de' ? 'Nicht gebaut' : 'Not built') : isStudio2Occupied ? (language === 'de' ? 'Belegt' : 'Occupied') : (language === 'de' ? 'Verfügbar' : 'Available') })] })] }), !studio2Built ? _jsx("span", { className: "text-gray-500 font-bold text-sm", children: language === 'de' ? 'Gesperrt' : 'Locked' }) : isStudio2Occupied && _jsx("span", { className: "text-red-400 font-bold text-sm", children: language === 'de' ? 'Belegt' : 'Occupied' })] }), _jsxs("button", { onClick: () => handleLoadProject(showStudioSelect, 'studio3'), disabled: !studio3Built || isStudio3Occupied, className: "bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-amber-500 transition-all disabled:opacity-50 disabled:hover:border-gray-600 flex items-center justify-between group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-full ${studio3Built ? 'bg-gray-800 text-amber-400' : 'bg-gray-900 text-gray-600'}`, children: _jsx(ProduktionIcon, { className: "h-6 w-6" }) }), _jsxs("div", { className: "text-left", children: [_jsx("h4", { className: "font-bold text-white group-hover:text-amber-300 transition-colors", children: "Studio 3" }), _jsx("p", { className: "text-xs text-gray-400", children: !studio3Built ? (language === 'de' ? 'Nicht gebaut' : 'Not built') : isStudio3Occupied ? (language === 'de' ? 'Belegt' : 'Occupied') : (language === 'de' ? 'Verfügbar' : 'Available') })] })] }), !studio3Built ? _jsx("span", { className: "text-gray-500 font-bold text-sm", children: language === 'de' ? 'Gesperrt' : 'Locked' }) : isStudio3Occupied && _jsx("span", { className: "text-red-400 font-bold text-sm", children: language === 'de' ? 'Belegt' : 'Occupied' })] })] }), _jsx("button", { onClick: () => setShowStudioSelect(null), className: "mt-6 text-gray-400 hover:text-white underline text-sm", children: t.common.cancel })] }) }))] }));
};
export default SavedProjectsTab;
