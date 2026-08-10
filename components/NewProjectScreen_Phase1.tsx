
import React, { useState, useEffect, useMemo } from 'react';
import { GameState, GameSpeed, ContractOffer, ProjectData, Message } from '../types';
import { newProjectBackgroundImage } from './backgrounds/NewProjectBackgroundImage';
import DrehbuchIcon from './icons/DrehbuchIcon';
import GameHeader from './GameHeader';
import { useGame } from '../contexts/GameContext';
import NeuesProjektIcon from './icons/NeuesProjektIcon';
import ArchiveIcon from './icons/ArchiveIcon';
import ScriptsTab from './tabs/office/ScriptsTab';
import ProjectPlanningTab from './tabs/project/ProjectPlanningTab';
import SavedProjectsTab from './tabs/project/SavedProjectsTab';
import MyFilmsTab from './tabs/marketing/MyFilmsTab';
import ProduktionIcon from './icons/ProduktionIcon';
import ProjectProgressScreen from './ProjectProgressScreen';
import NewProjectScreen_Phase2 from './NewProjectScreen_Phase2';
import NewProjectScreen_Phase3 from './NewProjectScreen_Phase3';
import NewProjectScreen_Phase4 from './NewProjectScreen_Phase4';
import { ProjectPhase } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import TestModeWidget from './widgets/TestModeWidget';
import PieChartIcon from './icons/PieChartIcon';
import TrendTab from './tabs/marketing/TrendTab';
import ProjectModeSelector, { PlanningMode } from './tabs/project/ProjectModeSelector';


export type CurrentViewType = 'project' | 'scripts' | 'saved_projects' | 'my_films' | 'current_project' | 'test_generator' | 'analysis';

interface NewProjectScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  setGameState: (state: GameState) => void;
  initialView?: CurrentViewType;
  initialFilmTitle?: string;
}

const PhaseButton: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ title, description, icon, isActive, disabled, onClick }) => {
  const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
  const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';
  const disabledClasses = 'opacity-50 cursor-not-allowed hover:-translate-y-0';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${
        isActive ? activeClasses : defaultClasses
      } ${disabled ? disabledClasses : ''}`}
    >
      <div className="flex items-start">
        <div className={`bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && 'bg-amber-500'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-md font-bold font-cinzel ${isActive ? 'text-amber-300' : 'text-amber-400'} group-hover:text-amber-300 transition-colors`}>
            {title}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

const NewProjectScreen_Phase1: React.FC<NewProjectScreenProps> = ({ onBack, gameSpeed, setGameSpeed, setGameState, initialView, initialFilmTitle }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  
  // Default logic: Check if any project is active for initial view
  const defaultView = playerData?.activeProjects && playerData.activeProjects.length > 0 ? 'current_project' : 'project';
  const [currentView, setCurrentView] = useState<CurrentViewType>(initialView || defaultView);
  
  const [dynamicInitialFilm, setDynamicInitialFilm] = useState(initialFilmTitle);
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  
  // Project Planning Sub-State
  const [planningSubState, setPlanningSubState] = useState<'selection' | 'form'>('selection');
  const [selectedPlanningMode, setSelectedPlanningMode] = useState<PlanningMode>('new');
    
  // --- STUDIO TAB STATE ---
  const [activeStudioTab, setActiveStudioTab] = useState<'studio1' | 'studio2' | 'studio3'>(() => {
    if (initialView === 'current_project' && initialFilmTitle && playerData) {
        // Find in active projects first (most likely case for notifications)
        let project = playerData.activeProjects.find(p => p.workingTitle === initialFilmTitle);
        
        // Fallback to completed films if needed
        if (!project) {
             project = playerData.completedFilms.find(p => p.workingTitle === initialFilmTitle);
        }
        
        if (project && project.studioId) {
            return project.studioId as 'studio1' | 'studio2' | 'studio3';
        }
    }
    // Default if no specific project is targeted
    return 'studio1';
  });

    useEffect(() => {
        if (initialFilmTitle) {
            setDynamicInitialFilm(initialFilmTitle);
        }
    }, [initialFilmTitle]);

    const handleFilmCreated = (newTitle: string) => {
        setDynamicInitialFilm(newTitle);
        setCurrentView('my_films');
    };

    const handleSelectPlanningMode = (mode: PlanningMode) => {
        setSelectedPlanningMode(mode);
        setPlanningSubState('form');
    };
    
    const handleSelectContract = (contract: ContractOffer) => {
        // --- 1. Persist Contract as activePlanning immediately ---
        // This ensures if the user leaves and comes back, they are still "in" the contract planning.
        // NOTE: The money transaction and email is handled in ProjectModeSelector. Here we just set the planning state.
        
        // Calculate Deadline
        const deadline = new Date(playerData!.gameDate);
        deadline.setMonth(deadline.getMonth() + contract.maxDurationMonths);

        const partialProjectData: ProjectData = {
            workingTitle: `${contract.title} (${t.project.modeSelector.contract})`,
            genre: contract.genre,
            phase: ProjectPhase.Planning,
            contract: contract,
            contractDeadline: deadline, // Set Deadline
            // Placeholder values required by type, will be overwritten in PlanningTab
            scriptQuality: 0,
            era: undefined as any,
            scriptStartDate: new Date(playerData!.gameDate),
            scriptEndDate: new Date(playerData!.gameDate),
            isArchived: false,
        };

        setPlayerData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                activePlanning: partialProjectData
            };
        });

        setSelectedPlanningMode('contract');
        setPlanningSubState('form');
    };

    const handleBackToSelection = () => {
        setPlanningSubState('selection');
    };
    
    const handleProjectLoaded = (studioId: string) => {
        setActiveStudioTab(studioId as 'studio1' | 'studio2' | 'studio3');
    };
  
  if (!playerData) return null;

  const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
  const hasCompletedFilms = playerData.completedFilms.length > 0;

  const handleBackAndCleanUp = () => {
    onBack();
  };

  // Helper to find the project for the current studio tab
  const getCurrentProjectForTab = () => {
      const projects = playerData.activeProjects || [];
      return projects.find(p => p.studioId === activeStudioTab);
  };

  // Renders the specific content based on project phase - extracted from renderCurrentProjectView
  // to avoid re-mounting when parent state changes.
  const renderProjectContent = (project: ProjectData | undefined) => {
      if (project) {
          switch(project.phase) {
              case ProjectPhase.Planning:
                  return <ProjectProgressScreen project={project} onBack={onBack} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} />;
              case ProjectPhase.ScriptFinished:
              case ProjectPhase.CastingSetup:
              case ProjectPhase.CastingFinished:
                  return <NewProjectScreen_Phase2 onBack={onBack} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} setGameState={setGameState} project={project} />;
              case ProjectPhase.ProductionSetup:
                  return <NewProjectScreen_Phase3 onBack={onBack} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} setGameState={setGameState} project={project} />;
              case ProjectPhase.PostProductionSetup:
                  return <NewProjectScreen_Phase4 onBack={onBack} setGameState={setGameState} project={project} />;
              case ProjectPhase.Casting:
              case ProjectPhase.Production:
              case ProjectPhase.PostProduction:
                   return <ProjectProgressScreen project={project} onBack={onBack} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} />;
              default:
                  return null;
          }
      } else {
           // Show empty state
           return (
              <div className="w-full max-w-lg bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-700 text-center mt-8">
                  <p className="text-gray-300 text-lg">Kein Projekt in {activeStudioTab === 'studio1' ? 'Studio 1' : activeStudioTab === 'studio2' ? 'Studio 2' : 'Studio 3'} aktiv.</p>
              </div>
          );
      }
  };

  const renderCurrentProjectView = () => {
    const project = getCurrentProjectForTab();

    return (
        <div className="flex flex-col w-full h-full items-center">
            {/* Studio Tabs */}
            <div className="flex space-x-2 mb-4 bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                <button 
                    onClick={() => setActiveStudioTab('studio1')}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${activeStudioTab === 'studio1' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Studio 1
                </button>
                <button 
                    onClick={() => setActiveStudioTab('studio2')}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${activeStudioTab === 'studio2' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Studio 2
                </button>
                <button 
                    onClick={() => setActiveStudioTab('studio3')}
                    className={`px-4 py-2 rounded-md font-bold transition-colors ${activeStudioTab === 'studio3' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Studio 3
                </button>
            </div>
            
            {renderProjectContent(project)}
        </div>
    );
  };

  const renderMainContent = () => {
    switch (currentView) {
        case 'scripts':
            return <ScriptsTab />;
        case 'analysis':
            return <TrendTab />;
        case 'saved_projects':
            return <SavedProjectsTab setGameState={setGameState} setCurrentView={setCurrentView} onProjectLoaded={handleProjectLoaded} />;
        case 'current_project':
            return renderCurrentProjectView();
        case 'my_films':
            return <MyFilmsTab initialFilmTitle={dynamicInitialFilm} />;
        case 'test_generator':
            return <div className="w-full max-w-lg"><TestModeWidget isTestMode={isTestMode} onFilmCreated={handleFilmCreated} /></div>;
        case 'project':
        default:
            // Check if there is an active planning
            if (playerData.activePlanning) {
                // SPECIAL CHECK: If it has a contract but no scriptId, it means we are in the PLANNING FORM phase of a contract
                if (playerData.activePlanning.contract && !playerData.activePlanning.scriptId && playerData.activePlanning.phase === ProjectPhase.Planning && playerData.activePlanning.projectPotential === undefined) {
                     return (
                        <ProjectPlanningTab 
                            setGameState={setGameState} 
                            setCurrentView={setCurrentView} 
                            planningMode='contract'
                            onBackToSelection={handleBackToSelection}
                            initialContract={playerData.activePlanning.contract}
                        />
                    );
                }

                switch (playerData.activePlanning.phase) {
                    case ProjectPhase.ScriptFinished:
                    case ProjectPhase.CastingSetup:
                    case ProjectPhase.CastingFinished:
                        return <NewProjectScreen_Phase2 onBack={onBack} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} setGameState={setGameState} project={playerData.activePlanning} />;
                    case ProjectPhase.ProductionSetup:
                        return <NewProjectScreen_Phase3 onBack={onBack} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} setGameState={setGameState} project={playerData.activePlanning} />;
                    case ProjectPhase.PostProductionSetup:
                        return <NewProjectScreen_Phase4 onBack={onBack} setGameState={setGameState} project={playerData.activePlanning} />;
                    default:
                        return <ProjectProgressScreen project={playerData.activePlanning} onBack={onBack} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} />;
                }
            }
            
            // Show Selector or Form based on sub-state
            if (planningSubState === 'selection') {
                return (
                    <ProjectModeSelector 
                        onSelectMode={handleSelectPlanningMode} 
                        onSelectContract={handleSelectContract}
                        hasCompletedFilms={hasCompletedFilms} 
                    />
                );
            } else {
                return (
                    <ProjectPlanningTab 
                        setGameState={setGameState} 
                        setCurrentView={setCurrentView} 
                        planningMode={selectedPlanningMode}
                        onBackToSelection={handleBackToSelection}
                        initialContract={null} // Contract is handled via activePlanning state if present
                    />
                );
            }
    }
  };

  // Determine container styling based on view
  const isProjectPlanning = currentView === 'project' && !playerData.activePlanning;
  const isScrollable = !isProjectPlanning && currentView !== 'scripts' && currentView !== 'my_films' && currentView !== 'test_generator' && currentView !== 'analysis';
  
  // Only center if NOT scripts, NOT my_films AND (NOT test OR NOT analysis) - Wait, analysis and test are centered too usually.
  // Original logic was: const containerItemsAlign = (currentView === 'scripts' || currentView === 'my_films' || (currentView !== 'test_generator' && currentView !== 'analysis')) ? 'items-start' : 'items-center';
  // This logic says: If (scripts OR my_films OR (NOT test AND NOT analysis)) -> items-start.
  // So 'project' falls into (NOT test AND NOT analysis), so it is items-start.
  // 'current_project' falls into (NOT test AND NOT analysis), so items-start.
  // We want to center planning and production screens if possible, but they can be tall.
  // Let's stick to safe logic: only center test generator if needed, others top aligned to allow scrolling.
  
  const containerItemsAlign = (currentView === 'test_generator') ? 'items-center' : 'items-start';

  return (
    <div
      className="w-full h-full bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${newProjectBackgroundImage})` }}
    >
      <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
      <div className="flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden">
        <aside className="w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col">
            <header className="p-6 text-center border-b border-gray-700">
                <h1 className="text-3xl font-bold font-cinzel text-amber-400">{t.project.phase1.title}</h1>
            </header>
            <nav className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
                <PhaseButton 
                    title={t.project.phase1.navPlanning} 
                    description={t.project.phase1.navPlanningDesc} 
                    icon={<NeuesProjektIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />} 
                    isActive={currentView === 'project'} 
                    onClick={() => setCurrentView('project')}
                />
                <PhaseButton 
                    title={t.project.phase1.navCurrent} 
                    description={t.project.phase1.navCurrentDesc} 
                    icon={<ProduktionIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />} 
                    isActive={currentView === 'current_project'} 
                    onClick={() => setCurrentView('current_project')}
                />
                <PhaseButton 
                    title={t.project.phase1.navSaved} 
                    description={t.project.phase1.navSavedDesc} 
                    icon={<ArchiveIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />} 
                    isActive={currentView === 'saved_projects'} 
                    onClick={() => setCurrentView('saved_projects')} 
                />
                <PhaseButton 
                    title={t.project.phase1.navScripts} 
                    description={t.project.phase1.navScriptsDesc} 
                    icon={<DrehbuchIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />} 
                    isActive={currentView === 'scripts'} 
                    onClick={() => setCurrentView('scripts')} 
                />
                <PhaseButton 
                    title={t.project.phase1.navAnalysis} 
                    description={t.project.phase1.navAnalysisDesc} 
                    icon={<PieChartIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />} 
                    isActive={currentView === 'analysis'} 
                    onClick={() => setCurrentView('analysis')} 
                />
                <PhaseButton 
                    title={t.project.phase1.navMyFilms} 
                    description={t.project.phase1.navMyFilmsDesc} 
                    icon={<ArchiveIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />} 
                    isActive={currentView === 'my_films'}
                    onClick={() => setCurrentView('my_films')} 
                />
            </nav>
            {isTestMode && (
                 <div className="p-4 border-t border-gray-700/50">
                    <PhaseButton 
                        title="Film Generator" 
                        description="Schnell Filme zum Testen erstellen." 
                        icon={<ProduktionIcon className="h-5 w-5 bg-red-400 group-hover:bg-black transition-colors" />} 
                        isActive={currentView === 'test_generator'} 
                        onClick={() => setCurrentView('test_generator')}
                    />
                </div>
            )}
            <footer className="p-4 border-t border-gray-700">
                <button onClick={handleBackAndCleanUp} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase">
                    {t.project.phase1.backToMenu}
                </button>
            </footer>
        </aside>

        <main className={`flex-grow p-8 flex justify-center ${isScrollable ? 'overflow-hidden' : 'overflow-y-auto'} ${containerItemsAlign}`}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default NewProjectScreen_Phase1;
