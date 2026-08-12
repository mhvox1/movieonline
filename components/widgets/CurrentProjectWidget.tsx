
import React, { useState, useEffect } from 'react';
import { GameState, ProjectPhase, BuildingType, ProjectData } from '../../types';
import DashboardWidget from '../DashboardWidget';
import { useGame } from '../../contexts/GameContext';
import { MOVIE_SIZE_CONFIG, EXTRAS_OPTIONS } from '../constants';
import StarRating from '../StarRating';
import HeartRating from '../HeartRating';
import { getCoverPath } from '../coverConfig';
import NeuesProjektIcon from '../icons/NeuesProjektIcon';
import { useTranslation } from '../../hooks/useTranslation';
import { CurrentViewType } from '../NewProjectScreen_Phase1';
import { daysToHours, formatHoursAndMinutes } from '../../hooks/timeUtils';

interface CurrentProjectWidgetProps {
    onNavigate: (state: GameState) => void;
    onNavigateToProjectsView: (view: CurrentViewType, filmTitle?: string) => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-xs py-1 border-b border-gray-700/50 last:border-b-0">
    <span className="text-gray-400">{label}</span>
    <div className="font-semibold text-white text-right truncate pl-2">{value}</div>
  </div>
);

const ProgressBar: React.FC<{ progress: number, text?: string, color?: string }> = ({ progress, text, color = 'bg-green-500' }) => (
    <div className="w-full bg-gray-700 rounded-full h-5 overflow-hidden border border-gray-600">
        <div
            className={`${color} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-sm font-bold text-black`}
            style={{ width: `${progress}%` }}>
              {text || `${Math.round(progress)}%`}
        </div>
    </div>
);

const getHoursRemaining = (endDate: Date, gameDate: Date) => Math.max(0, daysToHours((new Date(endDate).getTime() - gameDate.getTime()) / 86400000));

const TabButton: React.FC<{ title: string, isActive: boolean, onClick: () => void, disabled?: boolean }> = ({ title, isActive, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 px-2 py-2 text-sm font-bold rounded-t-md transition-colors ${
            isActive 
            ? 'bg-gray-800/50 text-amber-400 border-b-2 border-amber-400' 
            : 'text-gray-500 hover:text-white'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
        {title}
    </button>
);

const CurrentProjectWidget: React.FC<CurrentProjectWidgetProps> = ({ onNavigate, onNavigateToProjectsView }) => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    
    // State for Active Tab
    const [activeTab, setActiveTab] = useState<'studio1' | 'studio2' | 'studio3'>('studio1');

    // Initial Tab Selection Logic (Run once on mount or if current tab becomes empty)
    useEffect(() => {
        if (!playerData) return;

        // Check if current tab has a project
        const hasProjectInCurrentTab = playerData.activeProjects.some(p => p.studioId === activeTab);
        
        // If current tab is empty, but we have projects elsewhere, switch to the first one found
        if (!hasProjectInCurrentTab && playerData.activeProjects.length > 0) {
            const firstProject = playerData.activeProjects[0];
            if (firstProject.studioId && (firstProject.studioId === 'studio1' || firstProject.studioId === 'studio2' || firstProject.studioId === 'studio3')) {
                setActiveTab(firstProject.studioId as 'studio1' | 'studio2' | 'studio3');
            }
        }
    }, [playerData?.activeProjects?.length]); // Only re-run if number of projects changes

    if (!playerData) return null;
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    // Check which studios are built
    const studio2Built = playerData.buildings.some(b => b.type === BuildingType.Studio2 && b.level > 0);
    const studio3Built = playerData.buildings.some(b => b.type === BuildingType.Studio3 && b.level > 0);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

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
        
        const resolveName = (id: number | undefined) => {
            if (id === undefined) return '-';
            if (id === -1) return playerData.playerName;
            if (id === 99901) return playerData.partnerName || 'Partner';
            if (id >= 99910) return playerData.children[id - 99910]?.name || 'Kind';
            const director = directors.find(d => d.id === id);
            if (director) return director.name;
            const actor = actors.find(a => a.id === id);
            if (actor) return actor.name;
            return '-';
        };

        const directorName = resolveName(projectToDisplay.directorId);
        const mainActorName = resolveName(projectToDisplay.mainActorId);
        const supportingActorName = resolveName(projectToDisplay.supportingActorId);
        
        const extrasName = projectToDisplay.extrasLevel ? (t.productionOptions.extras[`level${projectToDisplay.extrasLevel}` as keyof typeof t.productionOptions.extras]?.name || EXTRAS_OPTIONS.find(e => e.level === projectToDisplay.extrasLevel)?.name) : "-";
        
        const totalWeeklyCosts = projectToDisplay.accumulatedWeeklyCosts || 0;
        const totalProductionEventCosts = playerData.transactionLog.filter(tr => 
            projectToDisplay.productionStartDate &&
            tr.category === 'Filmproduktion' && 
            tr.type === 'Ausgabe' &&
            (tr.description.includes(`"${projectToDisplay.workingTitle}"`) || tr.description.includes(projectToDisplay.workingTitle)) && 
            new Date(tr.date) >= new Date(projectToDisplay.productionStartDate) &&
            new Date(tr.date) <= new Date(playerData.gameDate) &&
            !tr.descriptionKey?.includes('productionStart') && 
            !tr.descriptionKey?.includes('postProductionStart') &&
            !tr.descriptionKey?.includes('weeklyProductionCosts')
        ).reduce((sum, tr) => sum + tr.amount, 0);

        const totalMarketingCampaignCosts = playerData.transactionLog.filter(tr =>
            tr.category === 'Marketing' &&
            tr.type === 'Ausgabe' &&
            tr.descriptionKey === 'marketingCampaign' &&
            tr.descriptionVars?.filmTitle === projectToDisplay.workingTitle
        ).reduce((sum, tr) => sum + tr.amount, 0);
        
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

        const calculateProgress = (start: Date, end: Date) => {
            const totalDuration = new Date(end).getTime() - new Date(start).getTime();
            if (totalDuration <= 0) return 100;
            const elapsed = gameDate.getTime() - new Date(start).getTime();
            return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        };

        const activePhases = [ProjectPhase.Casting, ProjectPhase.Production, ProjectPhase.PostProduction, ProjectPhase.Completed];
        if (activePhases.includes(projectToDisplay.phase)) {
            showProgressBar = true;
        }

        switch(projectToDisplay.phase) {
            case ProjectPhase.Casting:
                phaseText = t.widgets.currentProject.phase.casting;
                if (projectToDisplay.castingStartDate && projectToDisplay.castingEndDate) {
                    progress = calculateProgress(projectToDisplay.castingStartDate, projectToDisplay.castingEndDate);
                    daysRemainingText = t.widgets.currentProject.daysRemaining.replace('{days}', formatHoursAndMinutes(getHoursRemaining(projectToDisplay.castingEndDate, gameDate)));
                }
                color = 'bg-green-500';
                break;
            case ProjectPhase.Production:
                phaseText = t.widgets.currentProject.phase.production;
                if (projectToDisplay.productionStartDate && projectToDisplay.productionEndDate) {
                    progress = calculateProgress(projectToDisplay.productionStartDate, projectToDisplay.productionEndDate);
                    daysRemainingText = t.widgets.currentProject.daysRemaining.replace('{days}', formatHoursAndMinutes(getHoursRemaining(projectToDisplay.productionEndDate, gameDate)));
                }
                color = 'bg-blue-500';
                break;
            case ProjectPhase.PostProduction:
                phaseText = t.widgets.currentProject.phase.postProduction;
                if (projectToDisplay.postProductionStartDate && projectToDisplay.postProductionEndDate) {
                    progress = calculateProgress(projectToDisplay.postProductionStartDate, projectToDisplay.postProductionEndDate);
                    daysRemainingText = t.widgets.currentProject.daysRemaining.replace('{days}', formatHoursAndMinutes(getHoursRemaining(projectToDisplay.postProductionEndDate, gameDate)));
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
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            const isUrgent = diffHours < 720;
            contractDeadlineText = (
                <div className={`mt-2 text-xs font-bold text-center border-t border-gray-600 pt-1 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-blue-300'}`}>
                    Frist: {deadline.toLocaleDateString(locale)} ({formatHoursAndMinutes(diffHours)})
                </div>
            );
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

    const getPositionClass = (position: 'top' | 'top-center' | 'center' | 'bottom-center' | 'bottom' | undefined) => {
        switch (position) {
            case 'top': return 'justify-start pt-2';
            case 'top-center': return 'justify-start pt-[25%]';
            case 'center': return 'justify-center';
            case 'bottom-center': return 'justify-end pb-[25%]';
            case 'bottom': return 'justify-end pb-2';
            default: return 'justify-end pb-2';
        }
    };

    return (
        <DashboardWidget title={t.widgets.currentProject.title}>
            <div className="flex mb-4 border-b border-gray-700/50 -mt-2 -mx-4 px-2">
                <TabButton title="Studio 1" isActive={activeTab === 'studio1'} onClick={() => setActiveTab('studio1')} />
                <TabButton title="Studio 2" isActive={activeTab === 'studio2'} onClick={() => setActiveTab('studio2')} disabled={!studio2Built} />
                <TabButton title="Studio 3" isActive={activeTab === 'studio3'} onClick={() => setActiveTab('studio3')} disabled={!studio3Built} />
            </div>

            {projectData ? (
                <div onClick={() => onNavigateToProjectsView('current_project', projectData.rawProject.workingTitle)} className="cursor-pointer space-y-3">
                    <h4 className="text-xl font-bold text-white truncate text-center mb-3">"{projectData.title}"</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 flex items-center justify-center">
                            <div className="relative w-[180px] h-[270px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700 mx-auto">
                               {projectData.rawProject.contract ? (
                                    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                                            <div className="bg-amber-500 w-[200%] py-2 text-center shadow-lg">
                                                <span className="text-black font-black text-sm uppercase tracking-widest font-cinzel">
                                                    {t.project.modeSelector.contract}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <img src={projectData.rawProject.customCover || getCoverPath(projectData.rawProject.genre, projectData.rawProject.coverImageId || 1)} alt={`Cover for ${projectData.rawProject.workingTitle}`} className="w-full h-full object-cover" />
                                        <div className={`absolute inset-0 flex flex-col pointer-events-none p-0.5 ${getPositionClass(projectData.rawProject.coverTitlePosition)}`}>
                                            <h3 className="text-white text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" style={{ fontFamily: projectData.rawProject.coverTitleFontFamily || 'Cinzel', fontSize: `${(projectData.rawProject.coverTitleFontSize || 30) * 0.6}px`, lineHeight: 1.1, color: projectData.rawProject.coverTitleColor || '#FFFFFF' }}>{projectData.rawProject.workingTitle}</h3>
                                        </div>
                                    </>
                                )}
                                {/* Names Overlay */}
                                { (!projectData.rawProject.contract && projectData.rawProject.directorId !== undefined && projectData.rawProject.mainActorId !== undefined) &&
                                        (() => {
                                            const titlePos = projectData.rawProject.coverTitlePosition || 'bottom';
                                            const namesPositionClass = (titlePos === 'top' || titlePos === 'top-center' || titlePos === 'center') ? 'bottom-0.5' : 'top-0.5';
                                            // Correctly using data from useMemo
                                            const directorNameUpper = projectData.directorName.toUpperCase();
                                            const actorNameUpper = projectData.mainActorName.toUpperCase();
                                            
                                            const combinedLength = directorNameUpper.length + actorNameUpper.length;
                                            
                                            // SCALED FONT SIZE FOR 180px CONTAINER
                                            let nameFontSize = 9; 
                                            if (combinedLength > 40) nameFontSize = 7;
                                            else if (combinedLength > 30) nameFontSize = 8;
                            
                                            return (
                                                <div 
                                                    className={`absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-0.5 pointer-events-none`}
                                                    style={{
                                                        color: projectData.rawProject.coverTitleColor || '#FFFFFF',
                                                        fontSize: `${nameFontSize}px`,
                                                        lineHeight: '1.1'
                                                    }}
                                                >
                                                    <p>{directorNameUpper} <span className="mx-0.5">•</span> {actorNameUpper}</p>
                                                </div>
                                            );
                                        })()
                                    }
                            </div>
                        </div>
                        <div className="col-span-2">
                             <div className="grid grid-cols-1 gap-x-4">
                                <DetailRow label={t.widgets.currentProject.genre} value={projectData.genre} />
                                <DetailRow label={t.widgets.currentProject.size} value={projectData.movieSizeName} />
                                <DetailRow label={t.project.planning.ageRating} value={projectData.ageRatingLabel} />
                                <DetailRow label={t.widgets.currentProject.director} value={projectData.directorName} />
                                <DetailRow label={t.widgets.currentProject.mainActor} value={projectData.mainActorName} />
                                <DetailRow label={t.widgets.currentProject.supportingActor} value={projectData.supportingActorName} />
                                <DetailRow 
                                    label={t.widgets.currentProject.potential} 
                                    value={projectData.rawPotential ? <StarRating rating={projectData.rawPotential} size="sm" /> : '-'} 
                                />
                                {!projectData.rawProject.contract && (
                                    <DetailRow 
                                        label={t.widgets.currentProject.hype} 
                                        value={<HeartRating rating={projectData.rawHype} size="sm" />} 
                                    />
                                )}
                                <DetailRow label={t.widgets.currentProject.runningCosts} value={projectData.laufendeProduktionskosten} />
                                <DetailRow label={t.widgets.currentProject.totalCosts} value={projectData.gesamtkosten} />
                                {projectData.contractDeadlineText}
                            </div>
                        </div>
                    </div>
                     {projectData.showProgressBar && (
                        <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-2">
                            <div className="flex justify-between items-baseline text-sm">
                                <p>Phase: <span className="font-semibold text-amber-300">{projectData.phaseText}</span></p>
                                <p className="text-gray-300">{projectData.daysRemainingText}</p>
                            </div>
                            <ProgressBar progress={projectData.progress} color={projectData.color}/>
                        </div>
                    )}
                </div>
            ) : (
                <div onClick={() => onNavigate(GameState.Projects)} className="cursor-pointer space-y-3">
                     <h4 className="text-xl font-bold text-white truncate text-center mb-3">{t.widgets.currentProject.startNew}</h4>
                     <div className="w-full h-[270px] flex flex-col items-center justify-center text-gray-500 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 hover:border-amber-500 transition-colors">
                        <NeuesProjektIcon className="h-16 w-16 bg-gray-600"/>
                        <p className="text-xs mt-2">{`Studio ${activeTab.slice(-1)} ist frei`}</p>
                    </div>
                </div>
            )}
        </DashboardWidget>
    );
};

export default CurrentProjectWidget;
