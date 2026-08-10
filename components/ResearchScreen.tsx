
import React, { useState, useMemo, useRef } from 'react';
import { Technology, ResearchTree, ActiveResearch, BuildingType, GameSpeed, EmployeeType } from '../types';
import { RESEARCH_TECHS } from './research';
import { BUILDING_DATA } from './buildings';
import GameHeader from './GameHeader';
import { useGame } from '../contexts/GameContext';
import { researchBackgroundImage } from './backgrounds/ResearchBackgroundImage';
import ResearchNode, { NODE_WIDTH, NODE_HEIGHT, GRID_GAP_X, GRID_GAP_Y, PADDING } from './ResearchNode';

// Icons for Sidebar
import DrehbuchIcon from './icons/DrehbuchIcon';
import ProduktionIcon from './icons/ProduktionIcon';
import OfficeIcon from './icons/OfficeIcon';
import NeuesProjektIcon from './icons/NeuesProjektIcon';
import MarketingIcon from './icons/MarketingIcon';
import { useTranslation } from '../hooks/useTranslation';

interface ResearchScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
}

// Helper for Connection Lines (Needs access to layout constants)
const ConnectionLine: React.FC<{ start: {x: number, y: number}, end: {x: number, y: number}, active: boolean }> = ({ start, end, active }) => {
    // Calculate SVG coordinates based on grid logic
    const startX = start.x * (NODE_WIDTH + GRID_GAP_X) + PADDING + NODE_WIDTH;
    const startY = start.y * (NODE_HEIGHT + GRID_GAP_Y) + PADDING + (NODE_HEIGHT / 2);
    const endX = end.x * (NODE_WIDTH + GRID_GAP_X) + PADDING;
    const endY = end.y * (NODE_HEIGHT + GRID_GAP_Y) + PADDING + (NODE_HEIGHT / 2);

    // Bezier Curve
    const controlPoint1X = startX + (GRID_GAP_X / 2);
    const controlPoint1Y = startY;
    const controlPoint2X = endX - (GRID_GAP_X / 2);
    const controlPoint2Y = endY;

    const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

    return (
        <path 
            d={pathData} 
            stroke={active ? "#10b981" : "#9ca3af"} 
            strokeWidth="2" 
            fill="none" 
            className="transition-colors duration-500 drop-shadow-md"
        />
    );
};

const SidebarButton: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ title, description, icon, isActive, onClick }) => {
    const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
    const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';

    return (
        <button
            onClick={onClick}
            className={`bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses}`}
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

// --- Main Component ---

const ResearchScreen: React.FC<ResearchScreenProps> = ({ onBack, gameSpeed, setGameSpeed }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<ResearchTree>(ResearchTree.Vorproduktion);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  
  // Refs for scroll container
  const containerRef = useRef<HTMLDivElement>(null);

  if (!playerData || !setPlayerData) return null;

  const researchLab = playerData.buildings.find(b => b.type === BuildingType.ResearchLab && b.level > 0);
  
  const canResearch = !!researchLab;
  const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
  
  const formatCurrency = (value: number) => new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  // Calculate points per day for display
  const researchPointsPerDay = useMemo(() => {
    let points = 0;
    if (researchLab) {
        points = 1;
        const labData = BUILDING_DATA[BuildingType.ResearchLab].levels[researchLab.level - 1];
        if (labData?.bonusEffect?.researchPointsPerDay) {
            points = labData.bonusEffect.researchPointsPerDay;
        }
        
        // Sum talent from all researchers (employees + family)
        let totalResearcherTalent = 0;
        
        // Employees
        playerData.employees.filter(e => e.type === EmployeeType.Forscher).forEach(e => totalResearcherTalent += e.talent);
        
        // Partner
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Forscher && playerData.partnerSkills) {
            totalResearcherTalent += playerData.partnerSkills.research;
        }
        
        // Children
        playerData.children.forEach(c => {
            if (c.isEmployed && c.employedAs === EmployeeType.Forscher && c.skills) {
                totalResearcherTalent += c.skills.research;
            }
        });

        points += Math.floor(totalResearcherTalent / 25);
    }
    return points;
    }, [playerData, researchLab]);

  // Filter techs for current tab
  const currentTreeTechs = useMemo(() => {
      return RESEARCH_TECHS.filter(t => t.tree === activeTab);
  }, [activeTab]);

  // Determine status for each tech
  const getTechStatus = (tech: Technology): 'locked' | 'available' | 'researched' | 'researching' => {
      if (playerData.unlockedTechnologies.includes(tech.id)) return 'researched';
      if (playerData.activeResearch?.techId === tech.id) return 'researching';
      
      // Check dependencies
      const dependenciesMet = tech.dependencies.every(depId => playerData.unlockedTechnologies.includes(depId));
      if (!dependenciesMet) return 'locked';
      
      return 'available';
  };

  const getRemainingResearchPoints = (tech: Technology) => {
      if (playerData.activeResearch?.techId === tech.id) {
          return Math.max(0, playerData.activeResearch.requiredPoints - playerData.activeResearch.progressPoints);
      }

      return tech.cost;
  };

  // Calculate Container Size
  const containerSize = useMemo(() => {
      let maxX = 0;
      let maxY = 0;
      currentTreeTechs.forEach(t => {
          if (t.position) {
              if (t.position.x > maxX) maxX = t.position.x;
              if (t.position.y > maxY) maxY = t.position.y;
          }
      });
      return {
          width: (maxX + 1) * (NODE_WIDTH + GRID_GAP_X) + PADDING * 2,
          height: (maxY + 1) * (NODE_HEIGHT + GRID_GAP_Y) + PADDING * 2
      };
  }, [currentTreeTechs]);

  const handleStartResearch = (tech: Technology) => {
    const cost = tech.monetaryCost || 0;
    if (playerData.capital < cost && !isTestMode) {
        alert(t.research.screen.modal.errorCapital);
        return;
    }
    if (playerData.activeResearch) {
        alert(t.research.screen.modal.errorActive);
        return;
    }
    
    const effectivePointsPerDay = isTestMode ? Math.max(tech.cost, 1) : Math.max(researchPointsPerDay, 1);
    const duration = isTestMode ? 1 : Math.max(1, Math.ceil(tech.cost / effectivePointsPerDay));
    const startDate = new Date(playerData.gameDate);
    const endDate = new Date(playerData.gameDate);
    endDate.setDate(endDate.getDate() + duration);

    const newActiveResearch: ActiveResearch = {
        techId: tech.id,
        startDate,
        endDate,
        requiredPoints: tech.cost,
        progressPoints: 0,
    };

    setPlayerData(prev => {
        if (!prev) return null;
        
        const newTransactions = [...prev.transactionLog];
        const techName = t.research.techs[tech.id]?.name || tech.name;
        if (cost > 0) {
            newTransactions.push({
                date: new Date(prev.gameDate),
                type: 'Ausgabe',
                category: 'Forschung',
                description: `${t.research.screen.title}: ${techName}`,
                amount: cost
            });
        }

        return {
            ...prev,
            capital: prev.capital - cost,
            activeResearch: newActiveResearch,
            transactionLog: newTransactions,
        };
    });
    
    setSelectedTech(null); // Close modal
  };

  const tabs = [
      { id: ResearchTree.Vorproduktion, label: t.research.screen.tabs.preproduction, icon: <NeuesProjektIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors"/>, description: t.research.screen.tabs.preproductionDesc },
      { id: ResearchTree.Genres, label: t.research.screen.tabs.genres, icon: <DrehbuchIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors"/>, description: t.research.screen.tabs.genresDesc },
      { id: ResearchTree.Production, label: t.research.screen.tabs.production, icon: <ProduktionIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors"/>, description: t.research.screen.tabs.productionDesc },
      { id: ResearchTree.Marketing, label: t.research.screen.tabs.marketing, icon: <MarketingIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors"/>, description: t.research.screen.tabs.marketingDesc },
      { id: ResearchTree.Management, label: t.research.screen.tabs.management, icon: <OfficeIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors"/>, description: t.research.screen.tabs.managementDesc },
  ];

  return (
    <div className="w-full h-full bg-cover bg-center flex flex-col" style={{ backgroundImage: `url(${researchBackgroundImage})` }}>
      <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
      
      <div className="flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-black bg-opacity-60 backdrop-blur-md border-r border-gray-700 flex flex-col">
            <header className="p-6 border-b border-gray-700">
                <h1 className="text-2xl font-bold font-cinzel text-amber-400">{t.research.screen.title}</h1>
                      <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-amber-500/30 text-center">
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{t.research.screen.researchPoints}</p>
                          <p className="text-3xl font-bold text-amber-400">{researchPointsPerDay}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.research.screen.pointsPerDay.replace('{points}', researchPointsPerDay.toString())}</p>
                 </div>
            </header>
            <nav className="flex-grow p-4 space-y-4 overflow-y-auto">
                {tabs.map(tab => (
                    <SidebarButton
                        key={tab.id}
                        title={tab.label}
                        description={tab.description}
                        icon={tab.icon}
                        isActive={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </nav>
             <footer className="p-4 border-t border-gray-700">
                <button onClick={onBack} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase">
                    {t.research.screen.backToMain}
                </button>
            </footer>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-grow relative bg-black/30 backdrop-blur-sm overflow-hidden" ref={containerRef}>
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-30" 
                 style={{ 
                     backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)',
                     backgroundSize: '40px 40px'
                 }} 
            />

            {canResearch ? (
                <div className="w-full h-full overflow-auto custom-scrollbar">
                    <div 
                        className="relative"
                        style={{ width: Math.max(containerSize.width, 1200), height: Math.max(containerSize.height, 800) }}
                    >
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                             {/* Draw connections */}
                            {currentTreeTechs.map(tech => (
                                tech.dependencies.map(depId => {
                                    const parent = currentTreeTechs.find(p => p.id === depId);
                                    if (parent && parent.position && tech.position) {
                                        // Line is active if parent is researched
                                        const isActive = playerData.unlockedTechnologies.includes(parent.id);
                                        return (
                                            <ConnectionLine 
                                                key={`${parent.id}-${tech.id}`} 
                                                start={parent.position} 
                                                end={tech.position} 
                                                active={isActive}
                                            />
                                        );
                                    }
                                    return null;
                                })
                            ))}
                        </svg>

                        {/* Draw Nodes */}
                        {currentTreeTechs.map(tech => (
                            <ResearchNode 
                                key={tech.id} 
                                tech={tech} 
                                status={getTechStatus(tech)} 
                                onClick={() => setSelectedTech(tech)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                 <div className="w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.research.screen.lockedTitle}</h2>
                        <p className="text-gray-300 mb-6">
                            {t.research.screen.lockedDesc}
                        </p>
                         <div className="text-left max-w-sm mx-auto space-y-2">
                            <p className={`flex items-center gap-2 ${researchLab ? 'text-green-400' : 'text-red-400'}`}>
                                <span className="font-bold">{researchLab ? '✓' : '✗'}</span>
                                <span>{t.research.screen.reqLab}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>

       {/* Confirmation Modal */}
       {selectedTech && (
             <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedTech(null)}>
                <div className="bg-gray-800 border border-amber-500/50 rounded-lg shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-start gap-4 mb-4">
                        {/* Using only name here since we don't easily have the icon logic without importing ResearchNode's helper again, but title is enough context */}
                        <div>
                             <h2 className="text-2xl font-bold font-cinzel text-amber-400 leading-none">{t.research.techs[selectedTech.id]?.name || selectedTech.name}</h2>
                             <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{activeTab}</p>
                        </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6 text-sm leading-relaxed">{t.research.techs[selectedTech.id]?.description || selectedTech.description}</p>
                    
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">{t.research.screen.modal.costPoints}</span>
                            <span className="font-bold text-white">{selectedTech.cost} FP</span>
                        </div>
                        {selectedTech.monetaryCost && (
                             <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">{t.research.screen.modal.costCapital}</span>
                                <span className={`font-bold ${playerData.capital >= (selectedTech.monetaryCost || 0) ? 'text-white' : 'text-red-400'}`}>{formatCurrency(selectedTech.monetaryCost)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t.research.screen.modal.remainingPoints}</span>
                            <span className="font-bold text-white">{getRemainingResearchPoints(selectedTech)} FP</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setSelectedTech(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider transition-all text-xs">
                            {t.research.screen.modal.cancel}
                        </button>
                        
                        {(() => {
                            const status = getTechStatus(selectedTech);
                            const isLocked = status === 'locked';
                            const isDone = status === 'researched';
                            const isInProgress = status === 'researching';
                            
                            // Condition for being technically able to start
                            const hasResources = playerData.capital >= (selectedTech.monetaryCost || 0) || isTestMode;
                            const isBusy = !!playerData.activeResearch;
                            
                            // Should be disabled if locked, done, in progress, broke or busy
                            const isDisabled = isLocked || isDone || isInProgress || !hasResources || isBusy;
                            
                            let buttonLabel = t.research.screen.modal.start;
                            if (isDone) buttonLabel = t.research.screen.modal.researched;
                            else if (isInProgress) buttonLabel = t.research.screen.modal.researching;

                            return (
                                <button 
                                    onClick={() => handleStartResearch(selectedTech)} 
                                    disabled={isDisabled}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider transition-all text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                    {buttonLabel}
                                </button>
                            );
                        })()}
                    </div>
                    {!!playerData.activeResearch && !['researched', 'researching'].includes(getTechStatus(selectedTech)) && <p className="text-center text-red-400 text-xs mt-3">{t.research.screen.modal.errorActive}</p>}
                </div>
            </div>
        )}
    </div>
  );
};

export default ResearchScreen;
