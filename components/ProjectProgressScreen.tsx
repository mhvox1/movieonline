
import React, { useState } from 'react';
import { ProjectPhase, GameState, GameSpeed, ProjectData, ProjectType, Script, ActorAge, Message } from '../types';
import { useGame } from '../contexts/GameContext';
import { getCoverPath } from './coverConfig';
import { MOVIE_SIZE_CONFIG } from './constants';
import StarRating from './StarRating';
import { useTranslation } from '../hooks/useTranslation';
import { getTranslatedScriptDescription, getTranslatedScriptTitle } from './scriptGenerator';
import { TranslationType } from '../translations/types';

interface ProjectProgressScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  project: ProjectData | null;
}

const getAgeLabel = (age: ActorAge, t: TranslationType) => {
    switch (age) {
        case ActorAge.Child: return t.actorAge.child;
        case ActorAge.Young: return t.actorAge.young;
        case ActorAge.MiddleAged: return t.actorAge.middleAged;
        case ActorAge.Old: return t.actorAge.old;
        default: return age;
    }
};

const FocusBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex items-center justify-between text-[10px] py-0.5">
        <span className="text-gray-400 w-24">{label}</span>
        <div className="flex-grow bg-gray-700 rounded-full h-1.5 mx-2">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${value * 10}%` }}></div>
        </div>
        <span className="font-mono text-white w-4 text-right">{value}</span>
    </div>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode; isSub?: boolean }> = ({ label, value, isSub }) => (
    <div className={`flex justify-between items-center text-[11px] py-0.5 ${isSub ? 'pl-3' : ''}`}>
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold text-white text-right truncate pl-2">{value}</span>
    </div>
);

const EpisodeStep: React.FC<{ label: string; state: 'todo' | 'active' | 'done' }> = ({ label, state }) => {
    const classes = state === 'done'
        ? 'bg-emerald-500 border-emerald-400 text-black'
        : state === 'active'
            ? 'bg-amber-400/20 border-amber-400 text-amber-200'
            : 'bg-gray-900 border-gray-700 text-gray-500';

    return <div className={`rounded border px-1 py-0.5 text-[9px] text-center font-bold uppercase ${classes}`}>{label}</div>;
};

const SERIES_ENSEMBLE_COST_CONFIG = {
    intimate: { cost: 0 },
    small: { cost: 150000 },
    medium: { cost: 400000 },
    large: { cost: 850000 },
    epic: { cost: 1500000 },
} as const;

const SERIES_PRODUCTION_PROFILE_COST_CONFIG = {
    lean: { cost: 0 },
    efficient: { cost: 250000 },
    balanced: { cost: 550000 },
    ambitious: { cost: 1000000 },
    prestige: { cost: 1800000 },
} as const;

const SERIES_RUNTIME_COST_PER_MINUTE = 2500;

const ProjectProgressScreen: React.FC<ProjectProgressScreenProps> = ({ onBack, gameSpeed, setGameSpeed, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  if (!playerData || !setPlayerData) return null;
  
  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
            <p className="text-white text-lg mb-4">{t.project.progress.noActive}</p>
            <button onClick={onBack} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-sm hover:bg-gray-500 transition-colors">
              {t.common.back}
            </button>
        </div>
      </div>
    );
  }

  const locale = language === 'de' ? 'de-DE' : 'en-US';
  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  const handleDiscardProject = () => {
    setPlayerData(prev => {
        if (!prev) return null;

        // 1. Identify which project is being cancelled and filter it out of activeProjects
        const updatedActiveProjects = prev.activeProjects.filter(p => p.workingTitle !== project.workingTitle);

        // 2. Handle Legacy Pointers (if the cancelled project was one of these)
        let newActivePlanning = prev.activePlanning;
        if (prev.activePlanning && prev.activePlanning.workingTitle === project.workingTitle) {
            newActivePlanning = null;
        }
        
        let newCurrentProject = prev.currentProject;
        if (prev.currentProject && prev.currentProject.workingTitle === project.workingTitle) {
            newCurrentProject = null;
        }

        let updatedAvailableScripts = [...prev.availableScripts];
        let newCapital = prev.capital;
        const newTransactions = [...prev.transactionLog];
        const newMessages = [...prev.messages];

        // 3. Handle Penalties or Script Restoration
        if (project.contract) {
            // --- CONTRACT PENALTY LOGIC ---
            const penalty = project.contract.penalty;
            const upfront = project.contract.upfrontPayment || 0;
            
            // Total loss: Penalty + Refund of Advance
            const totalDeduction = penalty + upfront;
            
            newCapital -= totalDeduction;

            // 1. Transaction Log
            newTransactions.push({
                date: new Date(prev.gameDate),
                type: 'Ausgabe',
                category: 'Filmproduktion',
                description: language === 'de'
                    ? `Vertragsstrafe + Rückzahlung Vorschuss: "${project.workingTitle}"`
                    : `Contract penalty + advance repayment: "${project.workingTitle}"`,
                amount: totalDeduction
            });

            // 2. Email Notification
            const formattedPenalty = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(penalty);
            const formattedUpfront = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(upfront);
            
            let subject = language === 'de' ? `Vertragsbruch: ${project.workingTitle}` : `Breach of Contract: ${project.workingTitle}`;
            let body = `Sehr geehrte Damen und Herren,\n\nwir mussten feststellen, dass die Produktion von "${project.workingTitle}" abgebrochen wurde.\n\nDies stellt einen Bruch unseres Produktionsvertrages dar. Gemäß der Vereinbarung wird die Vertragsstrafe in Höhe von ${formattedPenalty} sofort fällig.\n\nZusätzlich fordern wir den geleisteten Vorschuss in Höhe von ${formattedUpfront} zurück.\n\nDer Gesamtbetrag wird Ihrem Konto belastet.\n\nMit freundlichen Grüßen,\n${project.contract.stationName}`;

            if (language !== 'de') {
                    subject = `Breach of Contract: ${project.workingTitle}`;
                    body = `Dear Sir or Madam,\n\nWe have noted that the production of "${project.workingTitle}" has been cancelled.\n\nThis constitutes a breach of our agreement. The penalty fee of ${formattedPenalty} is now due.\n\nAdditionally, we demand the repayment of the advance of ${formattedUpfront}.\n\nThe total amount will be deducted from your account immediately.\n\nSincerely,\n${project.contract.stationName}`;
            }

            newMessages.push({
                id: `msg_contract_fail_${Date.now()}`,
                date: new Date(prev.gameDate),
                sender: project.contract.stationName,
                subject: subject,
                body: body,
                read: false
            });

        } else {
            // --- REGULAR PROJECT: RESTORE SCRIPT ---
            const scriptExists = prev.availableScripts.some(s => s.id === project.scriptId);
            
            if (project.scriptId && !scriptExists) {
                const restoredScript: Script = {
                    id: project.scriptId,
                    title: project.scriptTitle || project.workingTitle,
                    genre: project.genre,
                    quality: project.scriptQuality,
                    description: project.scriptDescription || (language === 'de' ? 'Beschreibung nicht verfügbar.' : 'Description not available.'),
                    price: project.scriptBudget,
                    mainRole: project.mainRole,
                    supportingRole: project.supportingRole,
                    era: project.era,
                    sourcePlotIndex: project.sourcePlotIndex,
                    titleStructure: project.titleStructure,
                };
                updatedAvailableScripts.push(restoredScript);
            }
        }

        return {
            ...prev,
            capital: newCapital,
            activeProjects: updatedActiveProjects,
            activePlanning: newActivePlanning,
            currentProject: newCurrentProject,
            availableScripts: updatedAvailableScripts,
            transactionLog: newTransactions,
            messages: newMessages,
            // Clear notifications related to this project
            pendingNotifications: prev.pendingNotifications?.filter(n => n.title !== project.workingTitle)
        }
    });
    onBack();
  }
  
  const translatedPlot = getTranslatedScriptDescription(project, t);
  const translatedTitle = getTranslatedScriptTitle(project, t);
    const isSeriesProject = project.projectType === ProjectType.Series || (!!project.seriesName && !!project.episodeCount);
    const seriesEnsembleCost = project.ensembleSize
        ? SERIES_ENSEMBLE_COST_CONFIG[project.ensembleSize].cost
        : (project.seriesEnsembleCost || 0);
    const seriesProductionProfileCost = project.productionProfile
        ? SERIES_PRODUCTION_PROFILE_COST_CONFIG[project.productionProfile].cost
        : (project.seriesProductionProfileCost || 0);
    const seriesRuntimeBreakdown = `${project.episodeCount || 0} ${t.project.planning.episodesShort} ${t.project.planning.runtimeShort} ${project.episodeRuntime || 0} ${t.project.planning.runtimeMinutes}`;
    const planningOverviewTotalCost = (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0);
    const productionOverviewTotalCost = planningOverviewTotalCost + (project.directorGage || 0) + (project.mainActorGage || 0) + (project.supportingActorGage || 0) + (project.productionCost || 0) + (project.postProductionCost || 0);
    const planningSeriesLengthCost = isSeriesProject
        ? Math.max(0, planningOverviewTotalCost - seriesEnsembleCost - seriesProductionProfileCost)
        : 0;
    const productionSeriesLengthCost = isSeriesProject
        ? Math.max(0, productionOverviewTotalCost - seriesEnsembleCost - seriesProductionProfileCost)
        : 0;
    const seriesRuntimeCost = isSeriesProject
        ? Math.round((project.episodeCount || 0) * (project.episodeRuntime || 0) * SERIES_RUNTIME_COST_PER_MINUTE)
        : 0;
  
  // Helper to resolve name including family
  const resolveName = (id: number | undefined) => {
    if (id === undefined) return '-';
    if (id === -1) return playerData.playerName;
    if (id === 99901) return playerData.partnerName || 'Partner';
    if (id >= 99910) return playerData.children[id - 99910]?.name || 'Kind';
    
    const director = playerData.directors.find(d => d.id === id);
    if (director) return director.name;
    
    const actor = playerData.actors.find(a => a.id === id);
    if (actor) return actor.name;
    
    return '-';
  };

  const renderProjectProgress = () => {
    let currentPhaseLabel = '';
    let currentProgress = 0;
    let daysRemaining = 0;
    let progressColor = 'bg-gray-500';

    if (project.phase === ProjectPhase.Planning) {
        currentPhaseLabel = t.project.progress.phase.planning;
        const total = (new Date(project.scriptEndDate).getTime() - new Date(project.scriptStartDate).getTime());
        const elapsed = (playerData.gameDate.getTime() - new Date(project.scriptStartDate).getTime());
        currentProgress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
        daysRemaining = Math.max(0, Math.ceil((new Date(project.scriptEndDate).getTime() - playerData.gameDate.getTime()) / (1000 * 3600 * 24)));
        progressColor = 'bg-cyan-500';
    } else if (project.phase === ProjectPhase.Casting && project.castingStartDate && project.castingEndDate) {
        currentPhaseLabel = t.project.progress.phase.casting;
        const total = (new Date(project.castingEndDate).getTime() - new Date(project.castingStartDate).getTime());
        const elapsed = (playerData.gameDate.getTime() - new Date(project.castingStartDate).getTime());
        currentProgress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
        daysRemaining = Math.max(0, Math.ceil((new Date(project.castingEndDate).getTime() - playerData.gameDate.getTime()) / (1000 * 3600 * 24)));
        progressColor = 'bg-green-500';
    } else if (project.phase === ProjectPhase.Production && project.productionStartDate && project.productionEndDate) {
        currentPhaseLabel = t.project.progress.phase.production;
        const total = (new Date(project.productionEndDate).getTime() - new Date(project.productionStartDate).getTime());
        const elapsed = (playerData.gameDate.getTime() - new Date(project.productionStartDate).getTime());
        currentProgress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
        daysRemaining = Math.max(0, Math.ceil((new Date(project.productionEndDate).getTime() - playerData.gameDate.getTime()) / (1000 * 3600 * 24)));
        progressColor = 'bg-blue-500';
    } else if (project.phase === ProjectPhase.PostProduction && project.postProductionStartDate && project.postProductionEndDate) {
        currentPhaseLabel = t.project.progress.phase.postProduction;
        const total = (new Date(project.postProductionEndDate).getTime() - new Date(project.postProductionStartDate).getTime());
        const elapsed = (playerData.gameDate.getTime() - new Date(project.postProductionStartDate).getTime());
        currentProgress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
        daysRemaining = Math.max(0, Math.ceil((new Date(project.postProductionEndDate).getTime() - playerData.gameDate.getTime()) / (1000 * 3600 * 24)));
        progressColor = 'bg-violet-500';
    }

    const director = resolveName(project.directorId);
    const mainActor = resolveName(project.mainActorId);
    const supportingActor = resolveName(project.supportingActorId);

    const movieSizeName = project.movieSize ? MOVIE_SIZE_CONFIG[project.movieSize].name : '-';

    const getOptionName = (type: keyof typeof t.productionOptions, level: number | undefined) => {
        if (!level) return '-';
        return t.productionOptions[type]?.[`level${level}` as any]?.name || '-';
    };

    const kameraName = getOptionName('camera', project.kameraLevel);
    const lichtName = getOptionName('lighting', project.lichtLevel);
    const tonName = getOptionName('sound', project.tonLevel);
    const ausstattungName = getOptionName('set', project.ausstattungLevel);
    const sfxName = getOptionName('sfx', project.sfxLevel);
    const cateringName = getOptionName('catering', project.cateringLevel);
    const locationName = getOptionName('location', project.locationLevel);
    const extrasName = getOptionName('extras', project.extrasLevel);
    const editingName = getOptionName('editing', project.editingLevel);
    const musicName = getOptionName('music', project.musicLevel);
    const soundName = getOptionName('postSound', project.soundLevel);

    const { coverImageId = 1, coverTitlePosition = 'bottom', coverTitleFontSize = 30, coverTitleFontFamily = 'Cinzel', coverTitleColor = '#FFFFFF' } = project;
    const episodeCards = Array.from({ length: project.episodeCount || 0 }, (_, index) => {
        let prepState: 'todo' | 'active' | 'done' = 'todo';
        let shootState: 'todo' | 'active' | 'done' = 'todo';
        let editState: 'todo' | 'active' | 'done' = 'todo';

        if (project.phase === ProjectPhase.Planning) {
            prepState = index === 0 ? 'active' : 'todo';
        } else if (project.phase === ProjectPhase.Casting || project.phase === ProjectPhase.CastingFinished) {
            prepState = 'done';
        } else if (project.phase === ProjectPhase.Production) {
            const completedProductionEpisodes = Math.floor((currentProgress / 100) * (project.episodeCount || 1));
            prepState = 'done';
            if (index < completedProductionEpisodes) {
                shootState = 'done';
            } else if (index === completedProductionEpisodes) {
                shootState = 'active';
            }
        } else if (project.phase === ProjectPhase.PostProduction) {
            const completedPostEpisodes = Math.floor((currentProgress / 100) * (project.episodeCount || 1));
            prepState = 'done';
            shootState = 'done';
            if (index < completedPostEpisodes) {
                editState = 'done';
            } else if (index === completedPostEpisodes) {
                editState = 'active';
            }
        }

        return { prepState, shootState, editState, label: `${t.project.planning.episodeLabel} ${index + 1}` };
    });

    const getPositionClass = () => {
        switch (coverTitlePosition) {
            case 'top': return 'justify-start pt-2';
            case 'top-center': return 'justify-start pt-[25%]';
            case 'center': return 'justify-center';
            case 'bottom-center': return 'justify-end pb-[25%]';
            case 'bottom': return 'justify-end pb-2';
            default: return 'justify-end pb-2';
        }
    };
    
    // Determine if names should be shown (Production started)
    const showNamesOnCover = [ProjectPhase.Production, ProjectPhase.PostProduction, ProjectPhase.Completed].includes(project.phase);

    return (
      <div className="w-full max-w-6xl bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-1 font-cinzel text-amber-400">{t.project.progress.title}</h2>
        <p className="text-center text-gray-300 mb-4 text-base">"{project.workingTitle}"</p>

        <div className="mb-4 p-3 bg-black/20 rounded-lg">
            <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base text-white">{currentPhaseLabel}</h3>
                <span className="text-xs text-gray-300">{daysRemaining > 0 ? t.widgets.currentProject.daysRemaining.replace('{days}', daysRemaining.toString()) : 'Fast fertig...'}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
                <div className={`${progressColor} h-full rounded-full flex items-center justify-center text-xs font-bold text-black`} style={{ width: `${currentProgress}%` }}>
                    {Math.round(currentProgress)}%
                </div>
            </div>
        </div>

        {isSeriesProject && project.episodeCount ? (
            <div className="mb-4 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3 className="font-bold text-base text-cyan-200">{project.seriesName || project.workingTitle} <span className="text-cyan-300/80">Serie</span></h3>
                        <p className="text-xs text-gray-300">
                            {t.project.planning.seasonShort} {project.seasonNumber || 1} • {project.episodeCount} {t.project.planning.episodesShort} • {project.episodeRuntime || 45} {t.project.planning.runtimeMinutes}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase">
                        <span className="px-2 py-1 rounded border border-gray-600 bg-gray-900/60 text-gray-200">{project.narrativeFormat === 'episodic' ? t.project.planning.narrativeFormats.episodic : t.project.planning.narrativeFormats.serial}</span>
                    </div>
                </div>
            </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 flex flex-col items-center gap-3">
                <div className="relative w-[180px] h-[270px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700">
                     {project.contract ? (
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
                                src={project.customCover || getCoverPath(project.genre, coverImageId)}
                                alt={`Cover für ${project.workingTitle}`}
                                className="w-full h-full object-cover"
                            />
                            <div className={`absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass()}`}>
                                <h3 className="text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                                    style={{ fontFamily: coverTitleFontFamily, fontSize: `${(coverTitleFontSize || 30) * 0.6}px`, lineHeight: 1.2, color: coverTitleColor }}>
                                    {project.workingTitle}
                                </h3>
                            </div>
                             {showNamesOnCover && (
                                 (() => {
                                    const titlePos = project.coverTitlePosition || 'bottom';
                                    const namesPositionClass = (titlePos === 'top' || titlePos === 'top-center' || titlePos === 'center') ? 'bottom-2' : 'top-2';
                                    const directorNameUpper = director.toUpperCase();
                                    const actorNameUpper = mainActor.toUpperCase();
                                    
                                    const combinedLength = directorNameUpper.length + actorNameUpper.length;
                                    let nameFontSize = 8; 
                                    if (combinedLength > 30) nameFontSize = 6;
                                    else if (combinedLength > 20) nameFontSize = 7;
                    
                                    return (
                                        <div 
                                            className={`absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-1`}
                                            style={{
                                                color: project.coverTitleColor || '#FFFFFF',
                                                fontSize: `${nameFontSize}px`,
                                                lineHeight: '1.2'
                                            }}
                                        >
                                            <p>{directorNameUpper} <span className="mx-0.5">•</span> {actorNameUpper}</p>
                                        </div>
                                    );
                                })()
                            )}
                        </>
                    )}
                </div>
                <button onClick={() => setShowDiscardConfirm(true)} className="w-full bg-red-800/80 text-white font-bold py-1.5 px-4 rounded-sm hover:bg-red-700 transition-colors uppercase text-[10px]">
                    {t.project.progress.discard}
                </button>
            </div>
            
            {project.phase === ProjectPhase.Planning || project.phase === ProjectPhase.Casting || project.phase === ProjectPhase.CastingFinished ? (
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-gray-900/50 p-2 rounded-md"><p className="text-gray-400 text-[10px] uppercase">{t.widgets.currentProject.genre}</p><p className="font-semibold text-white">{t.genres[project.genre]}</p></div>
                            {!isSeriesProject ? <div className="bg-gray-900/50 p-2 rounded-md"><p className="text-gray-400 text-[10px] uppercase">{t.widgets.currentProject.size}</p><p className="font-semibold text-white">{movieSizeName}</p></div> : null}
                            <div className="bg-gray-900/50 p-2 rounded-md"><p className="text-gray-400 text-[10px] uppercase">{t.project.planning.ageRating}</p><p className="font-semibold text-white truncate" title={project.ageRating ? t.project.planning.ratings[project.ageRating] : '-'}>{project.ageRating ? t.project.planning.ratings[project.ageRating] : '-'}</p></div>
                        </div>
                        {isSeriesProject && (
                            <div className="bg-gray-900/50 p-2 rounded-md text-[10px] text-gray-300 space-y-0.5">
                                <div className="flex justify-between"><span>{t.project.modeSelector.series}:</span><span className="font-semibold text-white">{project.seriesName}</span></div>
                                <div className="flex justify-between"><span>{t.project.planning.seasonNumber}:</span><span className="font-semibold text-white">{project.seasonNumber || 1}</span></div>
                                <div className="flex justify-between"><span>{t.project.planning.episodeCount}:</span><span className="font-semibold text-white">{project.episodeCount || 0}</span></div>
                                <div className="flex justify-between"><span>{t.project.planning.episodeRuntime}:</span><span className="font-semibold text-white">{project.episodeRuntime || 0} {t.project.planning.runtimeMinutes}</span></div>
                            </div>
                        )}
                        <div className="bg-gray-900/50 p-2 rounded-md">
                            <p className="text-gray-400 text-[10px] uppercase mb-1">{t.project.progress.costOverview}</p>
                            <div className="text-[10px] space-y-0.5 text-gray-300">
                                {!isSeriesProject ? <div className="flex justify-between"><span>{t.project.progress.costs.script}:</span> <span className="font-semibold text-white">{formatCurrency(project.scriptBudget || 0)}</span></div> : null}
                                {!isSeriesProject ? <div className="flex justify-between"><span>{t.project.progress.costs.budget}:</span> <span className="font-semibold text-white">{formatCurrency(project.movieSizeBudget || 0)}</span></div> : null}
                                {isSeriesProject ? <div className="flex justify-between"><span>{t.project.planning.ensembleSize}:</span> <span className="font-semibold text-white">{formatCurrency(seriesEnsembleCost)}</span></div> : null}
                                {isSeriesProject ? <div className="flex justify-between"><span>{t.project.planning.productionProfile}:</span> <span className="font-semibold text-white">{formatCurrency(seriesProductionProfileCost)}</span></div> : null}
                                {isSeriesProject && (project.seriesPlanningCost || 0) > 0 ? <div className="flex justify-between gap-2"><span>{t.project.progress.costs.seriesSetup}:</span> <span className="font-semibold text-white text-right">{seriesRuntimeBreakdown} ({formatCurrency(planningSeriesLengthCost)})</span></div> : null}
                                {project.castingCost && project.castingCost > 0 ? (
                                     <div className="flex justify-between"><span>{t.project.progress.costs.casting}:</span> <span className="font-semibold text-white">{formatCurrency(project.castingCost)}</span></div>
                                ) : null}
                                <div className="flex justify-between border-t border-gray-600 mt-1 pt-1">
                                    <span className="font-bold">
                                        {project.castingCost && project.castingCost > 0 ? t.project.progress.costs.totalSoFar : t.project.progress.costs.planningTotal}:
                                    </span>
                                    <span className="font-bold text-amber-400">{formatCurrency(planningOverviewTotalCost)}</span>
                                </div>
                            </div>
                        </div>
                        {!isSeriesProject ? (
                            <div className="bg-gray-900/50 p-2 rounded-md">
                                <p className="text-gray-400 text-[10px] uppercase mb-1">
                                    {project.phase === ProjectPhase.Planning ? `${t.project.progress.costs.script} ${t.project.planning.quality}` : t.project.progress.potential}
                                </p>
                                <StarRating 
                                    rating={project.phase === ProjectPhase.Planning ? project.scriptQuality : (project.projectPotential || project.scriptQuality)} 
                                    size="sm" 
                                />
                            </div>
                        ) : null}
                        <div className="bg-gray-900/50 p-2 rounded-md">
                            <p className="text-gray-400 text-[10px] uppercase mb-1">{isSeriesProject ? t.project.modeSelector.series : t.project.planning.castingSuggestions}</p>
                            {isSeriesProject ? (
                                <div className="text-[10px] space-y-0.5 text-gray-300">
                                    <p className="flex justify-between gap-2"><span>{t.project.planning.ensembleSize}:</span><span className="font-semibold text-white">{project.ensembleSize ? t.project.planning.ensembleSizes[project.ensembleSize] : '-'}</span></p>
                                    <p className="flex justify-between gap-2"><span>{t.project.planning.productionProfile}:</span><span className="font-semibold text-white">{project.productionProfile ? t.project.planning.productionProfiles[project.productionProfile] : '-'}</span></p>
                                </div>
                            ) : (
                                <div className="text-[10px] space-y-0.5 text-gray-300">
                                    {project.mainRole && <p><span className="font-semibold text-white">{t.project.planning.mainRole}:</span> {project.mainRole.gender === 'männlich' ? t.newGame.male : t.newGame.female}, {getAgeLabel(project.mainRole.age, t)}</p>}
                                    {project.supportingRole && <p><span className="font-semibold text-white">{t.project.planning.supportingRole}:</span> {project.supportingRole.gender === 'männlich' ? t.newGame.male : t.newGame.female}, {getAgeLabel(project.supportingRole.age, t)}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                    {!isSeriesProject ? <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700"><h4 className="font-cinzel text-amber-300 border-b border-gray-600 pb-1 mb-1 text-sm">{t.project.saved.plot}</h4><p className="text-[10px] text-gray-300 h-52 overflow-y-auto pr-2 italic">"{translatedPlot}"</p></div> : null}
                </div>
            ) : (project.phase === ProjectPhase.Production || project.phase === ProjectPhase.PostProduction) ? (
                 <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-1">
                           <h4 className="font-cinzel text-amber-300 border-b border-gray-600 pb-1 mb-1 text-sm">{t.project.progress.projectData}</h4>
                            <DetailRow label={t.widgets.currentProject.genre} value={t.genres[project.genre]} />
                            {!isSeriesProject ? <DetailRow label={t.widgets.currentProject.size} value={movieSizeName} /> : null}
                            <DetailRow label={t.project.planning.ageRating} value={project.ageRating ? t.project.planning.ratings[project.ageRating] : '-'} />
                            {isSeriesProject && project.seriesName ? <DetailRow label={t.project.modeSelector.series} value={project.seriesName} /> : null}
                            {isSeriesProject ? <DetailRow label={t.project.planning.episodeCount} value={project.episodeCount || '-'} /> : null}
                            {isSeriesProject ? <DetailRow label={t.project.planning.episodeRuntime} value={`${project.episodeRuntime || '-'} ${t.project.planning.runtimeMinutes}`} /> : null}
                            <DetailRow label={t.widgets.currentProject.potential} value={<StarRating rating={project.projectPotential || project.scriptQuality} size="sm" />} />
                            <h4 className="font-cinzel text-amber-300 border-b border-gray-600 pb-1 my-1 pt-1 text-sm">{t.project.progress.cast}</h4>
                            <DetailRow label={t.widgets.currentProject.director} value={director} />
                            <DetailRow label={t.widgets.currentProject.mainActor} value={mainActor} />
                            <DetailRow label={t.widgets.currentProject.supportingActor} value={supportingActor} />
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-1">
                            <h4 className="font-cinzel text-amber-300 border-b border-gray-600 pb-1 mb-1 text-sm">{t.project.progress.costOverview}</h4>
                            {!isSeriesProject ? <DetailRow label={t.project.progress.costs.script} value={formatCurrency(project.scriptBudget || 0)} /> : null}
                            {!isSeriesProject ? <DetailRow label={t.project.progress.costs.budget} value={formatCurrency(project.movieSizeBudget || 0)} /> : null}
                            {isSeriesProject ? <DetailRow label={t.project.planning.ensembleSize} value={formatCurrency(seriesEnsembleCost)} /> : null}
                            {isSeriesProject ? <DetailRow label={t.project.planning.productionProfile} value={formatCurrency(seriesProductionProfileCost)} /> : null}
                            {isSeriesProject && (project.seriesPlanningCost || 0) > 0 ? <DetailRow label={t.project.progress.costs.seriesSetup} value={`${seriesRuntimeBreakdown} (${formatCurrency(productionSeriesLengthCost)})`} /> : null}
                            <DetailRow label={t.project.progress.costs.casting} value={formatCurrency(project.castingCost || 0)} />
                            <DetailRow label={t.project.casting.gages} value={formatCurrency((project.directorGage || 0) + (project.mainActorGage || 0) + (project.supportingActorGage || 0))} isSub={true} />
                            <DetailRow label={t.project.progress.production} value={formatCurrency(project.productionCost || 0)} />
                            <DetailRow label={t.project.progress.postProduction} value={formatCurrency(project.postProductionCost || 0)} />
                            <div className="flex justify-between text-[10px] pt-1 border-t border-gray-600">
                                <span className="font-bold text-gray-300">{t.project.casting.costs}:</span>
                                <span className="font-bold text-amber-400">{formatCurrency(productionOverviewTotalCost)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-1">
                            <h4 className="font-cinzel text-amber-300 border-b border-gray-600 pb-1 mb-1 text-sm">{project.phase === ProjectPhase.PostProduction ? t.project.progress.postProduction : t.project.progress.production}</h4>
                            {project.phase === ProjectPhase.Production ? (
                                <>
                                    <DetailRow label={t.project.production.departments.camera} value={kameraName} />
                                    <DetailRow label={t.project.production.departments.lighting} value={lichtName} />
                                    <DetailRow label={t.project.production.departments.sound} value={tonName} />
                                    <DetailRow label={t.project.production.departments.set} value={ausstattungName} />
                                    <DetailRow label={t.project.production.departments.sfx} value={sfxName} />
                                    <DetailRow label={t.project.production.departments.catering} value={cateringName} />
                                    <DetailRow label={t.project.production.departments.location} value={locationName} />
                                    <DetailRow label={t.project.production.departments.extras} value={extrasName} />
                                </>
                            ) : (
                                <>
                                    <DetailRow label={t.project.postProduction.departments.editing} value={editingName} />
                                    <DetailRow label={t.project.postProduction.departments.music} value={musicName} />
                                    <DetailRow label={t.project.postProduction.departments.sound} value={soundName} />
                                </>
                            )}
                        </div>
                        {project.phase === ProjectPhase.Production && (
                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                <h4 className="font-cinzel text-amber-300 border-b border-gray-600 pb-1 mb-1 text-sm">{t.project.progress.creativeFocus}</h4>
                                <div className="space-y-0.5">
                                    <FocusBar label={t.creativeFocus.action} value={project.focusAction || 0} />
                                    <FocusBar label={t.creativeFocus.humor} value={project.focusHumor || 0} />
                                    <FocusBar label={t.creativeFocus.romance} value={project.focusRomance || 0} />
                                    <FocusBar label={t.creativeFocus.dialogues} value={project.focusDialogues || 0} />
                                    <FocusBar label={t.creativeFocus.violence} value={project.focusViolence || 0} />
                                    <FocusBar label={t.creativeFocus.costumes} value={project.focusCostumes || 0} />
                                    <FocusBar label={t.creativeFocus.makeup} value={project.focusMakeup || 0} />
                                    <FocusBar label={t.creativeFocus.stunts} value={project.focusStunts || 0} />
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
            ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderProjectProgress()}
      {showDiscardConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.progress.discardConfirmTitle}</h2>
                <p className="text-gray-300 text-lg mb-6">{t.project.progress.discardConfirmText}</p>
                {project.contract && (
                     <div className="bg-red-900/30 p-3 rounded border border-red-500/50 mb-6 text-left">
                        <p className="text-red-400 font-bold text-sm mb-1 uppercase">{language === 'de' ? 'Achtung: Vertragsstrafe & Rückzahlung' : 'Warning: Penalty & Repayment'}</p>
                        <p className="text-gray-300 text-xs">
                            {language === 'de' ? 'Bei Abbruch wird die Vertragsstrafe von ' : 'If cancelled, the contractual penalty of '}<span className="font-mono font-bold text-white">{formatCurrency(project.contract.penalty)}</span>{language === 'de' ? ' sowie die Rückzahlung des Vorschusses von ' : ' and the repayment of the advance of '}<span className="font-mono font-bold text-white">{formatCurrency(project.contract.upfrontPayment || 0)}</span>{language === 'de' ? ' sofort fällig.' : ' become due immediately.'}
                        </p>
                     </div>
                )}
                <div className="flex justify-center gap-4">
                    <button onClick={() => setShowDiscardConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                    <button onClick={handleDiscardProject} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.project.progress.discardConfirmYes}</button>
                </div>
            </div>
        </div>
        )}
    </>
  );
};

export default ProjectProgressScreen;
