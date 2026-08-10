
import React, { useState } from 'react';
import { GameState, ProjectData, ProjectPhase, Script, BuildingType } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import TrashIcon from '../../icons/TrashIcon';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import { getCoverPath } from '../../coverConfig';
import StarRating from '../../StarRating';
import { EmployeeType } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import { getTranslatedScriptDescription } from '../../scriptGenerator';
import ProduktionIcon from '../../icons/ProduktionIcon';

interface SavedProjectsTabProps {
    setGameState: (state: GameState) => void;
    setCurrentView: (view: 'project' | 'scripts' | 'saved_projects' | 'my_films' | 'current_project') => void;
    onProjectLoaded?: (studioId: string) => void;
}

const SavedProjectsTab: React.FC<SavedProjectsTabProps> = ({ setGameState, setCurrentView, onProjectLoaded }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
    const [showStudioSelect, setShowStudioSelect] = useState<ProjectData | null>(null);

    if (!playerData) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    // Get active projects
    const activeProjects = playerData.activeProjects || [];

    // Check which studios are occupied
    const isStudio1Occupied = activeProjects.some(p => p.studioId === 'studio1');
    const isStudio2Occupied = activeProjects.some(p => p.studioId === 'studio2');
    const isStudio3Occupied = activeProjects.some(p => p.studioId === 'studio3');
    
    // Check which studios are built
    const studio2Built = playerData.buildings.some(b => b.type === BuildingType.Studio2 && b.level > 0);
    const studio3Built = playerData.buildings.some(b => b.type === BuildingType.Studio3 && b.level > 0);

    const handleLoadProject = (template: ProjectData, studioId: string) => {
        setPlayerData(prev => {
            if (!prev) return null;
            const newProject: ProjectData = {
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
        if (!projectToDelete) return;
        setPlayerData(prev => {
            if (!prev) return null;
            const updatedTemplates = (prev.savedProjectTemplates || []).filter(
                t => t.workingTitle !== projectToDelete.workingTitle
            );

            let updatedAvailableScripts = [...prev.availableScripts];
            const scriptExists = prev.availableScripts.some(s => s.id === projectToDelete.scriptId);

            if (projectToDelete.scriptId && !scriptExists) {
                const restoredScript: Script = {
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
        if (selectedTemplateIndex > 0) setSelectedTemplateIndex(0);
    };

    const getPositionClass = (position: 'top' | 'top-center' | 'center' | 'bottom-center' | 'bottom' | undefined) => {
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
        return (
             <div className="w-full max-w-2xl bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-700 mx-auto">
                <h2 className="text-4xl font-bold text-center mb-2 font-cinzel text-amber-400">{t.project.saved.title}</h2>
                <p className="text-center text-gray-500 italic py-8">{t.project.saved.noTemplates}</p>
            </div>
        );
    }
    
    if (!template) return null;

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

    return (
        <>
            <div className="w-full max-w-4xl bg-gray-800 bg-opacity-80 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-gray-700 mx-auto">
                <h2 className="text-3xl font-bold text-center mb-1 font-cinzel text-amber-400">{t.project.saved.title}</h2>
                <p className="text-center text-gray-300 mb-6 text-lg">"{template.workingTitle}"</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex items-start justify-center">
                        <div className="relative w-[200px] h-[300px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700">
                            {template.contract ? (
                                <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                                         <div className="bg-amber-500 w-[200%] py-2 text-center shadow-lg">
                                            <span className="text-black font-black text-xl uppercase tracking-widest font-cinzel">
                                                {t.project.modeSelector.contract}
                                            </span>
                                         </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={template.customCover || getCoverPath(template.genre, template.coverImageId || 1)}
                                        alt={`Cover für ${template.workingTitle}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass(template.coverTitlePosition)}`}>
                                        <h3 className="text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                                            style={{ fontFamily: template.coverTitleFontFamily || 'Cinzel', fontSize: `${(template.coverTitleFontSize || 30) / 1.5}px`, lineHeight: 1.2, color: template.coverTitleColor || '#FFFFFF' }}>
                                            {template.workingTitle}
                                        </h3>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="bg-gray-900/50 p-3 rounded-md">
                                <p className="text-gray-400 text-xs uppercase">{t.widgets.currentProject.genre}</p>
                                <p className="font-semibold text-white">{t.genres[template.genre]}</p>
                            </div>
                            <div className="bg-gray-900/50 p-3 rounded-md">
                                <p className="text-gray-400 text-xs uppercase">{t.widgets.currentProject.size}</p>
                                <p className="font-semibold text-white">{template.movieSize}</p>
                            </div>
                             <div className="bg-gray-900/50 p-3 rounded-md">
                                <p className="text-gray-400 text-xs uppercase">{t.project.planning.ageRating}</p>
                                <p className="font-semibold text-white truncate" title={template.ageRating ? t.project.planning.ratings[template.ageRating] : '-'}>
                                    {template.ageRating ? t.project.planning.ratings[template.ageRating] : '-'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-md">
                            <p className="text-gray-400 text-xs uppercase">{t.project.saved.planner}</p>
                            <p className="font-semibold text-white">{plannerName}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-md">
                            <p className="text-gray-400 text-xs uppercase">{t.project.saved.cost}</p>
                            <p className="font-semibold text-white">{formatCurrency(planningCost)}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-md">
                            <p className="text-gray-400 text-xs uppercase mb-1">{t.widgets.currentProject.potential}</p>
                            <StarRating rating={template.projectPotential || template.scriptQuality} size="sm" />
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-md">
                            <p className="text-gray-400 text-xs uppercase mb-1">{t.project.saved.plot}</p>
                            <p className="text-xs text-gray-300 h-16 overflow-y-auto pr-2 italic">"{translatedPlot}"</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-8">
                    <button onClick={handlePrev} disabled={templates.length <= 1} className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50"><ArrowLeftIcon className="h-6 w-6" /></button>
                    <span className="font-semibold text-gray-300">{selectedTemplateIndex + 1} / {templates.length}</span>
                    <button onClick={handleNext} disabled={templates.length <= 1} className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50"><ArrowRightIcon className="h-6 w-6" /></button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-600 flex justify-center gap-4">
                    <button
                        onClick={() => setProjectToDelete(template)}
                        className="bg-red-800 text-white font-bold py-3 px-8 rounded-sm text-base uppercase tracking-wider transform hover:bg-red-700 transition-all"
                    >
                        {t.project.saved.deleteTemplate}
                    </button>
                    <button
                        onClick={() => setShowStudioSelect(template)}
                        disabled={isThisProjectActive}
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-sm text-base uppercase tracking-wider transform hover:bg-green-500 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {t.project.saved.startProduction}
                    </button>
                </div>
                {isThisProjectActive && <p className="text-center text-amber-300 mt-2 font-bold text-sm">{t.project.saved.activeWarning}</p>}
            </div>

            {projectToDelete && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.saved.deleteConfirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">{t.project.saved.deleteConfirmText.replace('{title}', projectToDelete.workingTitle)}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setProjectToDelete(null)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button onClick={handleDeleteTemplate} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.common.yes}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showStudioSelect && (
                <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-6 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-6">{language === 'de' ? 'Studio wählen' : 'Choose Studio'}</h2>
                        <p className="text-gray-300 mb-6">{language === 'de' ? 'In welchem Studio soll die Produktion stattfinden?' : 'Which studio should host the production?'}</p>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => handleLoadProject(showStudioSelect, 'studio1')}
                                disabled={isStudio1Occupied}
                                className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-amber-500 transition-all disabled:opacity-50 disabled:hover:border-gray-600 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-full text-amber-400">
                                        <ProduktionIcon className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">Studio 1</h4>
                                        <p className="text-xs text-gray-400">{isStudio1Occupied ? (language === 'de' ? 'Belegt' : 'Occupied') : (language === 'de' ? 'Verfügbar' : 'Available')}</p>
                                    </div>
                                </div>
                                {isStudio1Occupied && <span className="text-red-400 font-bold text-sm">{language === 'de' ? 'Belegt' : 'Occupied'}</span>}
                            </button>

                            <button 
                                onClick={() => handleLoadProject(showStudioSelect, 'studio2')}
                                disabled={!studio2Built || isStudio2Occupied}
                                className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-amber-500 transition-all disabled:opacity-50 disabled:hover:border-gray-600 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${studio2Built ? 'bg-gray-800 text-amber-400' : 'bg-gray-900 text-gray-600'}`}>
                                        <ProduktionIcon className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">Studio 2</h4>
                                        <p className="text-xs text-gray-400">{!studio2Built ? (language === 'de' ? 'Nicht gebaut' : 'Not built') : isStudio2Occupied ? (language === 'de' ? 'Belegt' : 'Occupied') : (language === 'de' ? 'Verfügbar' : 'Available')}</p>
                                    </div>
                                </div>
                                {!studio2Built ? <span className="text-gray-500 font-bold text-sm">{language === 'de' ? 'Gesperrt' : 'Locked'}</span> : isStudio2Occupied && <span className="text-red-400 font-bold text-sm">{language === 'de' ? 'Belegt' : 'Occupied'}</span>}
                            </button>

                            <button 
                                onClick={() => handleLoadProject(showStudioSelect, 'studio3')}
                                disabled={!studio3Built || isStudio3Occupied}
                                className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-amber-500 transition-all disabled:opacity-50 disabled:hover:border-gray-600 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${studio3Built ? 'bg-gray-800 text-amber-400' : 'bg-gray-900 text-gray-600'}`}>
                                        <ProduktionIcon className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">Studio 3</h4>
                                        <p className="text-xs text-gray-400">{!studio3Built ? (language === 'de' ? 'Nicht gebaut' : 'Not built') : isStudio3Occupied ? (language === 'de' ? 'Belegt' : 'Occupied') : (language === 'de' ? 'Verfügbar' : 'Available')}</p>
                                    </div>
                                </div>
                                {!studio3Built ? <span className="text-gray-500 font-bold text-sm">{language === 'de' ? 'Gesperrt' : 'Locked'}</span> : isStudio3Occupied && <span className="text-red-400 font-bold text-sm">{language === 'de' ? 'Belegt' : 'Occupied'}</span>}
                            </button>
                        </div>

                        <button onClick={() => setShowStudioSelect(null)} className="mt-6 text-gray-400 hover:text-white underline text-sm">{t.common.cancel}</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SavedProjectsTab;
