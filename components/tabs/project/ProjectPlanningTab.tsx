
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GameState, GameSpeed, MovieSize, ProjectData, ProjectPhase, ProjectType, BuildingType, ActorAge, EmployeeType, Employee, AgeRating, ContractOffer, Message, Genre, Era } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import { MOVIE_SIZE_CONFIG } from '../../constants';
import { RESEARCH_TECHS } from '../../research';
import { getCoverPath } from '../../coverConfig';
import StarRating from '../../StarRating';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import { getTranslatedScriptTitle } from '../../scriptGenerator';
import { TranslationType } from '../../../translations/types';
import { CurrentViewType } from '../NewProjectScreen_Phase1';
import { PlanningMode } from './ProjectModeSelector';

// FIX: Define a specific type for the movie size configuration object to resolve type errors.
type MovieSizeConfigValue = {
    name: string;
    budgetSteps: [number, number, number];
    description: string;
    requiredTech?: string;
    qualityCap: number;
    budgetQualityPenalties: [number, number, number];
    budgetQualityBonuses: [number, number, number];
    focusPoints: [number, number, number];
};

// Updated Font List (Web Safe + Cinzel/Lato) to ensure compatibility
const FONT_FAMILIES = [
    'Cinzel', 'Lato', 'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 
    'Courier New', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 
    'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact', 'Tahoma', 'Geneva'
];

const TITLE_POSITIONS = ['top', 'top-center', 'center', 'bottom-center', 'bottom'] as const;

// Expanded Color Palette
const FONT_COLORS = [
    '#FFFFFF', '#000000', // B&W
    '#9CA3AF', '#4B5563', // Grays
    '#FCA5A5', '#EF4444', '#991B1B', // Reds
    '#FDBA74', '#F97316', '#9A3412', // Oranges
    '#FDE047', '#EAB308', '#854D0E', // Yellows/Golds
    '#BEF264', '#84CC16', '#3F6212', // Limes
    '#86EFAC', '#22C55E', '#14532D', // Greens
    '#67E8F9', '#06B6D4', '#164E63', // Cyans
    '#93C5FD', '#3B82F6', '#1E3A8A', // Blues
    '#C4B5FD', '#8B5CF6', '#5B21B6', // Violets
    '#F0ABFC', '#D946EF', '#86198F', // Fuchsias
    '#FDA4AF', '#F43F5E', '#881337'  // Roses
];

const SERIES_FORMAT_RUNTIMES = {
    short: 25,
    standard: 45,
    prestige: 60,
} as const;

const SERIES_ENSEMBLE_CONFIG = {
    intimate: { cost: 0 },
    small: { cost: 150000 },
    medium: { cost: 400000 },
    large: { cost: 850000 },
    epic: { cost: 1500000 },
} as const;

const SERIES_PRODUCTION_PROFILE_CONFIG = {
    lean: { cost: 0 },
    efficient: { cost: 250000 },
    balanced: { cost: 550000 },
    ambitious: { cost: 1000000 },
    prestige: { cost: 1800000 },
} as const;

const SERIES_RUNTIME_COST_PER_MINUTE = 2500;

const SERIES_ENSEMBLE_QUALITY_CONFIG = {
    intimate: 32,
    small: 42,
    medium: 52,
    large: 63,
    epic: 74,
} as const;

const SERIES_PRODUCTION_PROFILE_QUALITY_CONFIG = {
    lean: 0,
    efficient: 6,
    balanced: 12,
    ambitious: 18,
    prestige: 24,
} as const;

type TitlePosition = typeof TITLE_POSITIONS[number];
type SeriesPlanningType = 'new' | 'continuation';
type SeriesEnsembleSize = keyof typeof SERIES_ENSEMBLE_CONFIG;
type SeriesProductionProfile = keyof typeof SERIES_PRODUCTION_PROFILE_CONFIG;

const SERIES_ENSEMBLE_REQUIRED_TECH: Record<SeriesEnsembleSize, string | null> = {
    intimate: null,
    small: 'unlock_series_ensemble_small',
    medium: 'unlock_series_ensemble_medium',
    large: 'unlock_series_ensemble_large',
    epic: 'unlock_series_ensemble_epic',
};

const SERIES_PRODUCTION_PROFILE_REQUIRED_TECH: Record<SeriesProductionProfile, string | null> = {
    lean: null,
    efficient: 'unlock_series_profile_efficient',
    balanced: 'unlock_series_profile_balanced',
    ambitious: 'unlock_series_profile_ambitious',
    prestige: 'unlock_series_profile_prestige',
};

interface ProjectPlanningTabProps {
    setGameState: (state: GameState) => void;
    setCurrentView: (view: CurrentViewType) => void;
    planningMode: PlanningMode;
    onBackToSelection: () => void;
    initialContract: ContractOffer | null;
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

const getSeriesAgeRatingGenreBonus = (genre: Genre, ageRating: AgeRating): number => {
    switch (genre) {
        case Genre.Horror:
        case Genre.Thriller:
        case Genre.Crime:
        case Genre.War:
            switch (ageRating) {
                case AgeRating.FSK18: return 10;
                case AgeRating.FSK16: return 7;
                case AgeRating.FSK12: return 2;
                default: return -6;
            }
        case Genre.Action:
        case Genre.Adventure:
        case Genre.Fantasy:
        case Genre.SciFi:
        case Genre.Western:
            switch (ageRating) {
                case AgeRating.FSK16: return 9;
                case AgeRating.FSK12: return 7;
                case AgeRating.FSK6: return 2;
                case AgeRating.FSK18: return 1;
                default: return -4;
            }
        case Genre.Comedy:
        case Genre.Romance:
        case Genre.Musical:
        case Genre.Dokumentation:
            switch (ageRating) {
                case AgeRating.FSK6: return 9;
                case AgeRating.FSK0: return 7;
                case AgeRating.FSK12: return 3;
                default: return -5;
            }
        case Genre.Drama:
            switch (ageRating) {
                case AgeRating.FSK12: return 8;
                case AgeRating.FSK16: return 5;
                case AgeRating.FSK6: return 2;
                default: return 0;
            }
        default:
            return 0;
    }
};

const normalizeProjectTitle = (title: string) => title.trim().toLocaleLowerCase();

const ProjectPlanningTab: React.FC<ProjectPlanningTabProps> = ({ setGameState, setCurrentView, planningMode, onBackToSelection, initialContract }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const isSeriesMode = planningMode === 'series';
    
    // Local State for the form
    const [selectedScriptId, setSelectedScriptId] = useState<string | undefined>(isSeriesMode ? undefined : (playerData?.currentProject?.scriptId || playerData?.availableScripts[0]?.id));
    const [selectedSeriesGenre, setSelectedSeriesGenre] = useState<Genre | ''>(playerData?.currentProject?.genre || initialContract?.genre || '');
    const [selectedMovieSize, setSelectedMovieSize] = useState<MovieSize>(playerData?.currentProject?.movieSize || MovieSize.B);
    const [workingTitle, setWorkingTitle] = useState(playerData?.currentProject?.workingTitle || '');
    const [selectedCoverId, setSelectedCoverId] = useState(playerData?.currentProject?.coverImageId || 1);
    const [customCover, setCustomCover] = useState<string | undefined>(playerData?.currentProject?.customCover);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [titlePosition, setTitlePosition] = useState<TitlePosition>(playerData?.currentProject?.coverTitlePosition || 'bottom');
    const [titleFontSize, setTitleFontSize] = useState(playerData?.currentProject?.coverTitleFontSize || 30);
    const [titleFontFamily, setTitleFontFamily] = useState(playerData?.currentProject?.coverTitleFontFamily || 'Cinzel');
    const [titleColor, setTitleColor] = useState(playerData?.currentProject?.coverTitleColor || '#FFFFFF');
    const [error, setError] = useState('');
    const [posterCounts, setPosterCounts] = useState<Record<string, number>>({});
    const [isCountingPosters, setIsCountingPosters] = useState(false);
    const [budgetStep, setBudgetStep] = useState(1); // 0=low, 1=mid, 2=high
    const [selectedPlannerId, setSelectedPlannerId] = useState(playerData?.currentProject?.plannerId);
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    
    // Initialize ageRating with empty string to force selection
    const [ageRating, setAgeRating] = useState<AgeRating | ''>('');
    const [seriesName, setSeriesName] = useState(playerData?.currentProject?.seriesName || '');
    const [seasonNumber, setSeasonNumber] = useState(playerData?.currentProject?.seasonNumber || 1);
    const [episodeCount, setEpisodeCount] = useState(playerData?.currentProject?.episodeCount || 8);
    const [episodeRuntime, setEpisodeRuntime] = useState(playerData?.currentProject?.episodeRuntime || SERIES_FORMAT_RUNTIMES.standard);
    const [seriesFormat, setSeriesFormat] = useState<'short' | 'standard' | 'prestige'>(playerData?.currentProject?.seriesFormat || 'standard');
    const [releaseModel, setReleaseModel] = useState<'weekly' | 'binge'>(playerData?.currentProject?.releaseModel || 'weekly');
    const [narrativeFormat, setNarrativeFormat] = useState<'episodic' | 'serial'>(playerData?.currentProject?.narrativeFormat || 'serial');
    const [ensembleSize, setEnsembleSize] = useState<SeriesEnsembleSize>(playerData?.currentProject?.ensembleSize || 'intimate');
    const [productionProfile, setProductionProfile] = useState<SeriesProductionProfile>(playerData?.currentProject?.productionProfile || 'lean');
    const [seriesPlanningType, setSeriesPlanningType] = useState<SeriesPlanningType>((playerData?.currentProject?.sequelTo || playerData?.activePlanning?.sequelTo) ? 'continuation' : 'new');
    const [selectedProducedSeriesTitle, setSelectedProducedSeriesTitle] = useState<string>(playerData?.currentProject?.sequelTo || playerData?.activePlanning?.sequelTo || '');

    const [sequelParentTitle, setSequelParentTitle] = useState<string>(playerData?.currentProject?.sequelTo || '');

    const normalizedWorkingTitle = useMemo(() => normalizeProjectTitle(workingTitle), [workingTitle]);

    const hasTitleConflict = useMemo(() => {
        if (!playerData || !normalizedWorkingTitle) return false;

        const activePlanningTitle = playerData.activePlanning?.workingTitle
            ? normalizeProjectTitle(playerData.activePlanning.workingTitle)
            : '';
        const matchesActivePlanning = activePlanningTitle === normalizedWorkingTitle;

        const isPendingCurrentContractPlanning = matchesActivePlanning
            && !!initialContract
            && !!playerData.activePlanning?.contract
            && !playerData.activePlanning?.scriptId;

        const planningConflict = matchesActivePlanning && !isPendingCurrentContractPlanning;
        const activeProjectConflict = playerData.activeProjects.some(
            project => normalizeProjectTitle(project.workingTitle) === normalizedWorkingTitle
        );
        const completedFilmConflict = playerData.completedFilms.some(
            film => normalizeProjectTitle(film.workingTitle) === normalizedWorkingTitle
        );
        const savedTemplateConflict = playerData.savedProjectTemplates.some(
            template => normalizeProjectTitle(template.workingTitle) === normalizedWorkingTitle
        );

        return planningConflict || activeProjectConflict || completedFilmConflict || savedTemplateConflict;
    }, [playerData, normalizedWorkingTitle, initialContract]);

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    
    const selectedScript = useMemo(() => playerData?.availableScripts.find(s => s.id === selectedScriptId), [playerData?.availableScripts, selectedScriptId]);
    const availableSeriesGenres = useMemo(() => initialContract ? [initialContract.genre] : Object.values(Genre), [initialContract]);
    const selectedPosterGenre = isSeriesMode ? selectedSeriesGenre : selectedScript?.genre;
    
     const projectPlanners = useMemo(() => {
        if (!playerData) return [];
        const employeePlanners = playerData.employees.filter(e => e.type === EmployeeType.ProjektPlaner);

        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.ProjektPlaner) {
            const partnerPlanner: Employee = {
                id: 99901,
                name: `${playerData.partnerName} (Partner)`,
                type: EmployeeType.ProjektPlaner,
                talent: playerData.partnerSkills?.planning || 0,
                salary: 0,
                experience: 0,
                satisfaction: 100,
                portraitUrl: playerData.partnerPortraitId ? `./portrait/${playerData.partnerPortraitId}.png` : undefined
            };
            employeePlanners.push(partnerPlanner);
        }

        playerData.children.forEach((child, index) => {
             if (child.isEmployed && child.employedAs === EmployeeType.ProjektPlaner) {
                 employeePlanners.push({
                    id: 99910 + index,
                    name: `${child.name} (Kind)`,
                    type: EmployeeType.ProjektPlaner,
                    talent: child.skills?.planning || 0,
                    salary: 0,
                    experience: 0,
                    satisfaction: 100,
                    portraitUrl: child.portraitId ? `./kinder/${child.portraitId}.png` : undefined 
                 });
             }
        });

        return employeePlanners;
    }, [playerData]);

    useEffect(() => {
        if (projectPlanners.length > 0 && !selectedPlannerId) {
            setSelectedPlannerId(projectPlanners[0].id);
        }
    }, [projectPlanners, selectedPlannerId]);


    const availableMovieSizes = useMemo(() => {
        if (!playerData) return [];
        return (Object.entries(MOVIE_SIZE_CONFIG) as [MovieSize, MovieSizeConfigValue][]).filter(([, config]) => {
            if (!config.requiredTech) {
                return true; 
            }
            return playerData.unlockedTechnologies.includes(config.requiredTech);
        }).map(([size, config]) => ({ size, config }));
    }, [playerData]);

    const availableSeriesEnsembleOptions = useMemo(() => {
        if (!playerData) return [];
        return (Object.keys(SERIES_ENSEMBLE_CONFIG) as SeriesEnsembleSize[]).map((key) => {
            const requiredTech = SERIES_ENSEMBLE_REQUIRED_TECH[key];
            return {
                key,
                requiredTech,
                isUnlocked: !requiredTech || playerData.unlockedTechnologies.includes(requiredTech),
            };
        });
    }, [playerData]);

    const availableSeriesProductionProfiles = useMemo(() => {
        if (!playerData) return [];
        return (Object.keys(SERIES_PRODUCTION_PROFILE_CONFIG) as SeriesProductionProfile[]).map((key) => {
            const requiredTech = SERIES_PRODUCTION_PROFILE_REQUIRED_TECH[key];
            return {
                key,
                requiredTech,
                isUnlocked: !requiredTech || playerData.unlockedTechnologies.includes(requiredTech),
            };
        });
    }, [playerData]);
    
    const sequelParent = useMemo(() => {
        if (!sequelParentTitle) return null;
        return playerData.completedFilms.find(f => f.workingTitle === sequelParentTitle);
    }, [sequelParentTitle, playerData.completedFilms]);

    const showSequelSelect = planningMode === 'sequel' || planningMode === 'prequel';
    const producedSeriesOptions = useMemo(() => {
        const uniqueSeries = new Map<string, string>();

        (playerData?.completedFilms || []).forEach(project => {
            const isCompletedSeries = project.projectType === ProjectType.Series || (!!project.seriesName && !!project.episodeCount);
            if (!isCompletedSeries) return;

            const seriesTitle = (project.seriesName || project.workingTitle || '').trim();
            if (!seriesTitle) return;

            const normalizedTitle = normalizeProjectTitle(seriesTitle);
            if (!uniqueSeries.has(normalizedTitle)) {
                uniqueSeries.set(normalizedTitle, seriesTitle);
            }
        });

        return Array.from(uniqueSeries.values()).sort((left, right) => left.localeCompare(right, locale));
    }, [locale, playerData?.completedFilms]);
    const showSeriesContinuationSelect = isSeriesMode && seriesPlanningType === 'continuation';
    const hasValidSeriesContinuationSelection = !showSeriesContinuationSelect || !!selectedProducedSeriesTitle;

    // FILTER AVAILABLE SCRIPTS
    const filteredScripts = useMemo(() => {
        if (!playerData) return [];
        let scripts = playerData.availableScripts;

        // If in sequel/prequel mode and a parent is selected, filter by genre
        if (showSequelSelect && sequelParent) {
            scripts = scripts.filter(s => s.genre === sequelParent.genre);
        }
        // NEW: Filter by Contract Genre if contract is active
        if (initialContract) {
            scripts = scripts.filter(s => s.genre === initialContract.genre);
        }
        return scripts;
    }, [playerData?.availableScripts, showSequelSelect, sequelParent, initialContract]);

    const selectedMovieSizeConfig = MOVIE_SIZE_CONFIG[selectedMovieSize];
    const movieSizeBudget = selectedMovieSizeConfig.budgetSteps[budgetStep];

    const totalSeriesRuntime = useMemo(() => episodeCount * episodeRuntime, [episodeCount, episodeRuntime]);

    const seriesEnsembleCost = useMemo(() => SERIES_ENSEMBLE_CONFIG[ensembleSize].cost, [ensembleSize]);
    const seriesProductionProfileCost = useMemo(() => SERIES_PRODUCTION_PROFILE_CONFIG[productionProfile].cost, [productionProfile]);
    const seriesRuntimePlanningCost = useMemo(
        () => Math.round(totalSeriesRuntime * SERIES_RUNTIME_COST_PER_MINUTE),
        [totalSeriesRuntime]
    );
    const seriesPlanningQuality = useMemo(() => {
        if (!isSeriesMode || !selectedSeriesGenre || ageRating === '') return 0;

        const ensembleQuality = SERIES_ENSEMBLE_QUALITY_CONFIG[ensembleSize];
        const productionProfileQuality = SERIES_PRODUCTION_PROFILE_QUALITY_CONFIG[productionProfile];
        const ageRatingBonus = getSeriesAgeRatingGenreBonus(selectedSeriesGenre, ageRating as AgeRating);
        const rawSeriesQuality = ensembleQuality + productionProfileQuality + ageRatingBonus;

        return Math.max(1, Math.min(100, Math.round(rawSeriesQuality * 0.75)));
    }, [ageRating, ensembleSize, isSeriesMode, productionProfile, selectedSeriesGenre]);

    const totalPlanningCost = useMemo(() => {
        if (isSeriesMode) {
            return seriesEnsembleCost + seriesProductionProfileCost + seriesRuntimePlanningCost;
        }

        // Script is already owned (bought previously) or provided, so we only pay for the size budget now
        return movieSizeBudget;
    }, [isSeriesMode, movieSizeBudget, seriesEnsembleCost, seriesProductionProfileCost, seriesRuntimePlanningCost]);

    const nextSeriesEnsembleResearch = useMemo(
        () => availableSeriesEnsembleOptions.find(option => !option.isUnlocked)?.requiredTech || null,
        [availableSeriesEnsembleOptions]
    );

    const nextSeriesProfileResearch = useMemo(
        () => availableSeriesProductionProfiles.find(option => !option.isUnlocked)?.requiredTech || null,
        [availableSeriesProductionProfiles]
    );

    useEffect(() => {
        if (!selectedPosterGenre) return;
        const genre = selectedPosterGenre;

        if (posterCounts[genre] !== undefined) {
            return; 
        }

        const getPosterCount = async () => {
            setIsCountingPosters(true);
            let count = 0;
            const MAX_PROBE = 100; 
            for (let i = 1; i <= MAX_PROBE; i++) {
                try {
                    const response = await fetch(getCoverPath(genre, i), { method: 'HEAD' });
                    if (response.ok) {
                        count = i;
                    } else {
                        break; 
                    }
                } catch (e) {
                    break; 
                }
            }
            setPosterCounts(prev => ({ ...prev, [genre]: count }));

            if (selectedCoverId > count && count > 0) {
                setSelectedCoverId(1);
            } else if (count === 0) {
                setSelectedCoverId(0);
            }

            setIsCountingPosters(false);
        };

        getPosterCount();
    }, [selectedPosterGenre, posterCounts, selectedCoverId]);

    useEffect(() => {
        const project = playerData?.currentProject;
        // Check for active PLANNING state (Contract work that was already initialized)
        const planning = playerData?.activePlanning;

        if (planning && planning.contract && !planning.scriptId) {
            // Restore state from pending contract planning
             setWorkingTitle(planning.workingTitle);
             // We don't have other data yet
        } else if (project && project.phase === ProjectPhase.CastingSetup) {
            setSelectedScriptId(project.scriptId);
            setSelectedMovieSize(project.movieSize || MovieSize.B);
            setWorkingTitle(project.workingTitle || '');
            setSelectedCoverId(project.coverImageId || 1);
            setTitlePosition(project.coverTitlePosition || 'bottom');
            setTitleFontSize(project.coverTitleFontSize || 30);
            setTitleFontFamily(project.coverTitleFontFamily || 'Cinzel');
            setTitleColor(project.coverTitleColor || '#FFFFFF');
            setSelectedPlannerId(project.plannerId);
            setSequelParentTitle(project.sequelTo || '');
            setAgeRating(project.ageRating || AgeRating.FSK12); // Fallback to 12 if missing (older saves)
            setSeriesName(project.seriesName || '');
            setSeasonNumber(project.seasonNumber || 1);
            setEpisodeCount(project.episodeCount || 8);
            setEpisodeRuntime(project.episodeRuntime || SERIES_FORMAT_RUNTIMES.standard);
            setSeriesFormat(project.seriesFormat || 'standard');
            setReleaseModel(project.releaseModel || 'weekly');
            setNarrativeFormat(project.narrativeFormat || 'serial');
            setEnsembleSize(project.ensembleSize || 'intimate');
            setProductionProfile(project.productionProfile || 'lean');
            setSeriesPlanningType(project.sequelTo ? 'continuation' : 'new');
            setSelectedProducedSeriesTitle(project.sequelTo || '');

            const config = MOVIE_SIZE_CONFIG[project.movieSize || MovieSize.B];
            const step = config.budgetSteps.indexOf(project.movieSizeBudget || config.budgetSteps[1]);
            setBudgetStep(step !== -1 ? step : 1);
           } else if (!selectedScriptId && !isSeriesMode) {
             const firstAvailableScript = filteredScripts[0];
             setSelectedScriptId(firstAvailableScript?.id);
             if (firstAvailableScript && !showSequelSelect && !initialContract && !isSeriesMode) setWorkingTitle(getTranslatedScriptTitle(firstAvailableScript, t));
        }
        
        // NEW: If Contract is present, force title with suffix if not already set via activePlanning
        if (initialContract && !playerData?.activePlanning) {
            setWorkingTitle(`${initialContract.title} (${t.project.modeSelector.contract})`);
        }
    }, [initialContract, isSeriesMode, t, playerData?.activePlanning]);

    useEffect(() => {
        if (availableMovieSizes.length > 0 && !availableMovieSizes.some(item => item.size === selectedMovieSize)) {
            setSelectedMovieSize(availableMovieSizes[0].size);
            setBudgetStep(1);
        }
    }, [availableMovieSizes, selectedMovieSize]);

    useEffect(() => {
        const selectedEnsembleOption = availableSeriesEnsembleOptions.find(option => option.key === ensembleSize);
        if (!selectedEnsembleOption?.isUnlocked) {
            const fallbackOption = availableSeriesEnsembleOptions.find(option => option.isUnlocked);
            if (fallbackOption && fallbackOption.key !== ensembleSize) {
                setEnsembleSize(fallbackOption.key);
            }
        }
    }, [availableSeriesEnsembleOptions, ensembleSize]);

    useEffect(() => {
        const selectedProfileOption = availableSeriesProductionProfiles.find(option => option.key === productionProfile);
        if (!selectedProfileOption?.isUnlocked) {
            const fallbackOption = availableSeriesProductionProfiles.find(option => option.isUnlocked);
            if (fallbackOption && fallbackOption.key !== productionProfile) {
                setProductionProfile(fallbackOption.key);
            }
        }
    }, [availableSeriesProductionProfiles, productionProfile]);

    // Handle Script Selection Logic based on Filtering
        useEffect(() => {
            if (isSeriesMode) return;
         // Check if current selection is valid within filtered list
         const isValid = filteredScripts.some(s => s.id === selectedScriptId);
         
         if (!isValid) {
             if (filteredScripts.length > 0) {
                 // Auto-select first matching script
                 const first = filteredScripts[0];
                 setSelectedScriptId(first.id);
                 // Only auto-update title if not in sequel/contract mode
                 if (!showSequelSelect && !initialContract) {
                    setWorkingTitle(getTranslatedScriptTitle(first, t));
                 }
                 setSelectedCoverId(1); 
             } else {
                 // No scripts available for criteria
                 setSelectedScriptId(undefined);
                 // Only clear title if not in sequel/contract mode
                 if (!showSequelSelect && !initialContract) setWorkingTitle('');
             }
         }
    }, [filteredScripts, isSeriesMode, selectedScriptId, t, showSequelSelect, initialContract]);

    useEffect(() => {
        if (!isSeriesMode) return;
        if (initialContract && !selectedSeriesGenre) {
            setSelectedSeriesGenre(initialContract.genre);
            return;
        }
        if (selectedSeriesGenre && !availableSeriesGenres.includes(selectedSeriesGenre)) {
            setSelectedSeriesGenre(initialContract?.genre || '');
        }
    }, [availableSeriesGenres, initialContract, isSeriesMode, selectedSeriesGenre]);

    useEffect(() => {
        if (!isSeriesMode) return;

        if (seriesPlanningType === 'new') {
            if (selectedProducedSeriesTitle) {
                setSelectedProducedSeriesTitle('');
            }
            return;
        }

        const isValidSelection = !!selectedProducedSeriesTitle && producedSeriesOptions.includes(selectedProducedSeriesTitle);
        if (!isValidSelection) {
            setSelectedProducedSeriesTitle('');
        }
    }, [isSeriesMode, producedSeriesOptions, selectedProducedSeriesTitle, seriesPlanningType]);
  
    useEffect(() => {
        if(selectedScript && !playerData?.currentProject) {
            if (!sequelParentTitle && !initialContract && !playerData?.activePlanning && !isSeriesMode) {
                setWorkingTitle(getTranslatedScriptTitle(selectedScript, t));
            }
            setSelectedCoverId(1);
        }
    }, [selectedScript, playerData?.currentProject, t, sequelParentTitle, initialContract, isSeriesMode]);

    useEffect(() => {
        setEpisodeRuntime(SERIES_FORMAT_RUNTIMES[seriesFormat]);
    }, [seriesFormat]);

    // Helper: Generate Sequel Title
    const generateTitleFromParent = (parentTitle: string) => {
        if (!parentTitle) return "";
        const match = parentTitle.match(/^(.*?)(\d+)$/);
        let newTitle = "";
        if (match) {
            const baseName = match[1];
            const num = parseInt(match[2], 10);
            newTitle = `${baseName}${num + 1}`;
        } else {
            newTitle = `${parentTitle} 2`;
        }
        if (planningMode === 'prequel') {
                newTitle = `${parentTitle}: The Beginning`;
        }
        return newTitle;
    };

    // Auto-select first film if in sequel mode and nothing selected
    useEffect(() => {
        if (showSequelSelect && playerData?.completedFilms && playerData.completedFilms.length > 0) {
            // Check if current selection is valid, if not select first
            const isValidSelection = sequelParentTitle && playerData.completedFilms.some(f => f.workingTitle === sequelParentTitle);
            
            if (!isValidSelection) {
                const defaultFilm = playerData.completedFilms[0];
                setSequelParentTitle(defaultFilm.workingTitle);
                setWorkingTitle(generateTitleFromParent(defaultFilm.workingTitle));
            }
        }
    }, [showSequelSelect, playerData?.completedFilms, planningMode]); // Removed sequelParentTitle to avoid loop, managed logic inside

    const maxCoverId = (selectedPosterGenre && posterCounts[selectedPosterGenre]) || 0;

    // Handle custom cover upload
    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setCustomCover(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveCustomCover = () => {
        setCustomCover(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const handlePrevCover = () => { if (maxCoverId <= 1) return; setSelectedCoverId(prev => (prev === 1 ? maxCoverId : prev - 1)); };
    const handleNextCover = () => { if (maxCoverId <= 1) return; setSelectedCoverId(prev => (prev === maxCoverId ? 1 : prev + 1)); };
    
    const handlePrevPosition = () => {
        const currentIndex = TITLE_POSITIONS.indexOf(titlePosition);
        const prevIndex = (currentIndex - 1 + TITLE_POSITIONS.length) % TITLE_POSITIONS.length;
        setTitlePosition(TITLE_POSITIONS[prevIndex]);
    };
    const handleNextPosition = () => {
        const currentIndex = TITLE_POSITIONS.indexOf(titlePosition);
        const nextIndex = (currentIndex + 1) % TITLE_POSITIONS.length;
        setTitlePosition(TITLE_POSITIONS[nextIndex]);
    };
    const handleDecreaseFontSize = () => setTitleFontSize(prev => Math.max(12, prev - 2));
    const handleIncreaseFontSize = () => setTitleFontSize(prev => Math.min(60, prev + 2));
    
    const handlePrevFont = () => {
        const currentIndex = FONT_FAMILIES.indexOf(titleFontFamily);
        const prevIndex = (currentIndex - 1 + FONT_FAMILIES.length) % FONT_FAMILIES.length;
        setTitleFontFamily(FONT_FAMILIES[prevIndex]);
    };
    const handleNextFont = () => {
        const currentIndex = FONT_FAMILIES.indexOf(titleFontFamily);
        const nextIndex = (currentIndex + 1) % FONT_FAMILIES.length;
        setTitleFontFamily(FONT_FAMILIES[nextIndex]);
    };
    const handlePrevColor = () => {
        const currentIndex = FONT_COLORS.indexOf(titleColor);
        const prevIndex = (currentIndex - 1 + FONT_COLORS.length) % FONT_COLORS.length;
        setTitleColor(FONT_COLORS[prevIndex]);
    };
    const handleNextColor = () => {
        const currentIndex = FONT_COLORS.indexOf(titleColor);
        const nextIndex = (currentIndex + 1) % FONT_COLORS.length;
        setTitleColor(FONT_COLORS[nextIndex]);
    };

    const getPositionClass = (pos: string = titlePosition) => {
        switch (pos) {
            case 'top': return 'justify-start pt-2';
            case 'top-center': return 'justify-start pt-[25%]';
            case 'center': return 'justify-center';
            case 'bottom-center': return 'justify-end pb-[25%]';
            case 'bottom': return 'justify-end pb-2';
            default: return 'justify-end pb-2';
        }
    };
    
    const sequelLabel = planningMode === 'prequel' ? t.project.planning.prequelTo : t.project.planning.sequelTo;

    // --- Dynamic Title Logic ---
    const getPageTitle = () => {
        switch (planningMode) {
            case 'series': return t.project.planning.titleSeries;
            case 'sequel': return t.project.planning.titleSequel;
            case 'prequel': return t.project.planning.titlePrequel;
            case 'contract': return t.project.planning.planningContractTitle;
            default: return t.project.planning.titleNew; // Default (formerly title)
        }
    };

    // --- DISPLAY TITLE FOR COVER ---
    // If contract, force original title without suffix on cover
    const displayTitleOnCover = useMemo(() => {
        if (initialContract) {
            return initialContract.title;
        }
        return workingTitle;
    }, [workingTitle, initialContract]);

    const handleStartProject = () => {
        if (!workingTitle.trim()) {
            setError(t.project.planning.errorTitle);
            return;
        }
        if (hasTitleConflict) {
            setError(t.project.planning.errorDuplicateTitle);
            return;
        }
        if (!isSeriesMode && (!selectedScriptId || !selectedScript)) {
            setError(t.project.planning.errorScript);
            return;
        }
        if (isSeriesMode && !selectedSeriesGenre) {
            setError(t.project.planning.errorScript);
            return;
        }
        if (showSeriesContinuationSelect && !selectedProducedSeriesTitle) {
            setError(t.project.planning.errorSeriesContinuation);
            return;
        }
        
        // Allow if it is THE active planning
        if (playerData.activePlanning && !initialContract) {
             setError(t.project.planning.errorRunning);
             return;
        }

        if (playerData.capital < totalPlanningCost && !initialContract) {
            setError(t.project.planning.errorCapital);
            return;
        }
        setError('');

        setShowStartConfirm(true);
    };

    const confirmStartProject = () => {
        if (!isSeriesMode && !selectedScript) return;
        if (isSeriesMode && !selectedSeriesGenre) return;

        const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

        const planningOffice = playerData.buildings.find(b => b.type === BuildingType.Planungsbuero);
        
        const planner = projectPlanners.find(p => p.id === selectedPlannerId);
        
        // CONCEPT IMPLEMENTATION: PLANNER SPEED BONUS
        // Base Speed Modifier from Building (100% to 50%)
        let buildingDurationModifier = 1.0;
        if (planningOffice && planningOffice.level > 0) {
             buildingDurationModifier = 1.0 - (planningOffice.level * 0.1);
        }
        
        // Employee Speed Modifier (Effective Talent / 500) -> Max 20%
        let employeeDurationModifier = 0;
        if (planner) {
            const effTalent = planner.talent * (planner.satisfaction / 100);
            employeeDurationModifier = effTalent / 500;
        }

        const movieBaseDuration = 15;
        const seriesBaseDuration = 30 + Math.round(seriesPlanningQuality / 5);

        // Apply both modifiers: building reduces time, employee reduces time further
        const durationModifier = Math.max(0.5, buildingDurationModifier - employeeDurationModifier); 
        const moviePlanningDuration = Math.max(5, Math.round(movieBaseDuration * durationModifier));

        let duration = isSeriesMode
            ? Math.max(moviePlanningDuration * 2, Math.round(seriesBaseDuration * durationModifier))
            : moviePlanningDuration;

        if (isTestMode) {
            duration = 5;
        }

        // CONTRACT WORK SPEED BONUS: 2/3 of normal time
        if (initialContract && !isTestMode) {
            duration = Math.max(3, Math.round(duration * 0.66));
        }

        const startDate = new Date(playerData.gameDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration);

        const movieSizeConfig = isSeriesMode ? null : MOVIE_SIZE_CONFIG[selectedMovieSize];
        // Calculate Hard Quality Cap from Movie Size
        const hardCap = movieSizeConfig ? movieSizeConfig.qualityCap : 100;
        
        // --- NEW LOGIC: RANDOM & BUDGET IMPACT ---
        
        // 1. Base Potential
        const baseScriptQuality = isSeriesMode ? seriesPlanningQuality : selectedScript!.quality;
        let potential = Math.min(baseScriptQuality, hardCap);

        // 2. Budget Impact (Percentual)
        // budgetStep: 0 = Low, 1 = Standard, 2 = High
        if (!isSeriesMode && budgetStep === 0) {
            // Low Budget: Reduce potential by 10% - 20%
            const reduction = 0.10 + (Math.random() * 0.10); // 0.10 to 0.20
            potential = potential * (1 - reduction);
        } else if (!isSeriesMode && budgetStep === 2) {
            // High Budget: Increase potential by 10% - 20%
            const increase = 0.10 + (Math.random() * 0.10); // 0.10 to 0.20
            potential = potential * (1 + increase);
        }
        // Standard Budget (1): No change to potential

        // 3. Final Clamp
        const projectPotential = Math.max(1, Math.min(100, Math.round(potential)));
        
        // --- HYPE INHERITANCE LOGIC ---
        let initialHype = 0;
        if (showSequelSelect && sequelParentTitle) {
            const parentFilm = playerData.completedFilms.find(f => f.workingTitle === sequelParentTitle);
            if (parentFilm) {
                const parentHype = parentFilm.hype !== undefined 
                    ? parentFilm.hype 
                    : (parentFilm.finalQuality ? Math.round(parentFilm.finalQuality * 0.8) : 0);
                
                const variance = 0.9 + (Math.random() * 0.2);
                initialHype = Math.round(parentHype * variance);
            }
        }
        if (playerData.gameDifficulty === 'leicht') {
            initialHype += 10;
        }
        initialHype = Math.max(0, Math.min(100, initialHype));
        // ------------------------------

        setPlayerData(prev => {
            if (!prev) return null;
            const projectGenre = isSeriesMode ? selectedSeriesGenre : selectedScript!.genre;
            const projectEra = isSeriesMode ? Era.Present : selectedScript!.era;
            const newProjectData: ProjectData = {
                phase: ProjectPhase.Planning,
                workingTitle,
                projectType: isSeriesMode ? ProjectType.Series : ProjectType.Movie,
                genre: projectGenre,
                era: projectEra,
                scriptId: isSeriesMode ? undefined : selectedScript!.id,
                scriptQuality: baseScriptQuality,
                movieSize: isSeriesMode ? undefined : selectedMovieSize,
                movieSizeBudget: isSeriesMode ? undefined : movieSizeBudget,
                scriptBudget: isSeriesMode ? 0 : (selectedScript!.price || 0),
                scriptStartDate: startDate,
                scriptEndDate: endDate,
                scriptTitle: isSeriesMode ? undefined : selectedScript!.title,
                scriptDescription: isSeriesMode ? undefined : selectedScript!.description,
                coverImageId: selectedCoverId,
                coverTitlePosition: titlePosition,
                coverTitleFontSize: titleFontSize,
                coverTitleFontFamily: titleFontFamily,
                coverTitleColor: titleColor,
                isArchived: false,
                mainRole: isSeriesMode ? undefined : selectedScript!.mainRole,
                supportingRole: isSeriesMode ? undefined : selectedScript!.supportingRole,
                sourcePlotIndex: isSeriesMode ? undefined : selectedScript!.sourcePlotIndex,
                titleStructure: isSeriesMode ? undefined : selectedScript!.titleStructure,
                plannerId: selectedPlannerId,
                projectPotential: projectPotential, // SAVED HERE PERMANENTLY
                sequelTo: showSequelSelect
                    ? sequelParentTitle || undefined
                    : (showSeriesContinuationSelect ? selectedProducedSeriesTitle || undefined : undefined),
                ageRating: ageRating as AgeRating,
                hype: initialHype,
                contract: initialContract || undefined,
                customCover: customCover,
                seriesName: isSeriesMode ? workingTitle.trim() : undefined,
                seriesSeasonTitle: isSeriesMode ? undefined : undefined,
                seasonNumber: isSeriesMode ? 1 : undefined,
                episodeCount: isSeriesMode ? episodeCount : undefined,
                episodeRuntime: isSeriesMode ? episodeRuntime : undefined,
                seriesFormat: isSeriesMode ? seriesFormat : undefined,
                releaseModel: isSeriesMode ? releaseModel : undefined,
                narrativeFormat: isSeriesMode ? narrativeFormat : undefined,
                ensembleSize: isSeriesMode ? ensembleSize : undefined,
                productionProfile: isSeriesMode ? productionProfile : undefined,
                seriesEnsembleCost: isSeriesMode ? seriesEnsembleCost : undefined,
                seriesProductionProfileCost: isSeriesMode ? seriesProductionProfileCost : undefined,
                seriesPlanningCost: isSeriesMode ? totalPlanningCost : undefined,
            };
            const newAvailableScripts = isSeriesMode ? prev.availableScripts : prev.availableScripts.filter(s => s.id !== selectedScriptId);
            const capitalDeduction = totalPlanningCost;
            return {
                ...prev,
                capital: prev.capital - capitalDeduction,
                availableScripts: newAvailableScripts,
                activePlanning: newProjectData,
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Filmproduktion',
                        description: `Projektplanung gestartet: "${workingTitle}"`,
                        descriptionKey: 'projectPlanningStart',
                        descriptionVars: { title: workingTitle },
                        amount: capitalDeduction
                    }
                ]
            };
        });
        setShowStartConfirm(false);
        setCurrentView('project');
    };

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = () => {
        if (initialContract && playerData) {
            const penalty = initialContract.penalty;
            const upfront = initialContract.upfrontPayment || 0;
            const formattedPenalty = formatCurrency(penalty);
            const formattedUpfront = formatCurrency(upfront);
            
            // Calculate total to pay
            const totalDeduction = penalty + upfront;
            
            // Construct email for breach of contract
            const subject = language === 'de' ? `Vertragsbruch: ${initialContract.title}` : `Breach of Contract: ${initialContract.title}`;
            // Use translation or hardcoded German for now as translation structure for this specific dynamic mail is complex to inject
            // But we use the locale formatted currency
            const body = language === 'de' 
                ? `Sehr geehrte Damen und Herren,\n\nmit Bedauern nehmen wir zur Kenntnis, dass Sie die Planung für die Auftragsproduktion "${initialContract.title}" abgebrochen haben.\n\nDies stellt einen Bruch unserer Vereinbarung dar. Gemäß Vertrag wird die vereinbarte Vertragsstrafe in Höhe von ${formattedPenalty} hiermit fällig.\n\nZusätzlich fordern wir den geleisteten Vorschuss in Höhe von ${formattedUpfront} zurück.\n\nDie Gesamtsumme wird Ihrem Konto belastet.\n\nMit freundlichen Grüßen,\n${initialContract.stationName}`
                : `Dear Sir or Madam,\n\nWe regret to note that you have cancelled the planning for the commissioned production "${initialContract.title}".\n\nThis constitutes a breach of our agreement. According to the contract, the agreed penalty of ${formattedPenalty} is hereby due.\n\nAdditionally, we demand the repayment of the advance of ${formattedUpfront}.\n\nThe total amount will be charged to your account.\n\nSincerely,\n${initialContract.stationName}`;

            setPlayerData(prev => {
                if (!prev) return null;
                const newMessage: Message = {
                    id: `msg_contract_break_${Date.now()}`,
                    date: new Date(prev.gameDate),
                    sender: initialContract.stationName,
                    subject: subject,
                    body: body,
                    read: false
                };

                return {
                    ...prev,
                    activePlanning: null, // Clear the persistent pending state
                    capital: prev.capital - totalDeduction,
                    messages: [...prev.messages, newMessage],
                    transactionLog: [...prev.transactionLog, {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Filmproduktion',
                        description: language === 'de'
                            ? `Vertragsstrafe + Rückzahlung Vorschuss: "${initialContract.title}"`
                            : `Contract penalty + advance repayment: "${initialContract.title}"`,
                        amount: totalDeduction
                    }]
                };
            });
        }
        setShowCancelConfirm(false);
        onBackToSelection();
    };

    if (!playerData) return null;

    // Check prerequisites for start button state
    // If contract, allow even if capital low (assuming funding, but based on "costs not reimbursed if failed", player needs to front it)
    const liveTitleConflict = !!workingTitle.trim() && hasTitleConflict;
    const hasRequiredPlanningSelection = isSeriesMode ? !!selectedSeriesGenre : !!selectedScriptId;
    const canStart = hasRequiredPlanningSelection && hasValidSeriesContinuationSelection && workingTitle.trim() && !hasTitleConflict && (playerData.capital >= totalPlanningCost) && (!playerData.activePlanning || (initialContract && playerData.activePlanning.contract)) && ageRating !== '';

    return (
        <div className="relative w-[1000px] mx-auto">
            {/* Back Button */}
            <button 
                onClick={handleCancelClick}
                className="absolute -top-12 left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="text-sm font-bold uppercase">{t.project.modeSelector.back}</span>
            </button>

            {/* Main Grid - Fixed Size Wrapper ensures consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start w-full">
                <div className="w-full bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-700">
                    <h2 className="text-4xl font-bold text-center mb-2 font-cinzel text-amber-400">{getPageTitle()}</h2>
                    {!isSeriesMode ? <p className="text-center text-gray-300 mb-8">{t.project.planning.subtitle}</p> : null}
                    
                    <div className="space-y-6">
                        {isSeriesMode && (
                            <div className={`grid gap-4 ${showSeriesContinuationSelect ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <div>
                                    <label htmlFor="series-planning-type" className="block text-sm font-medium text-gray-300 mb-1 text-center">{t.project.planning.seriesPlanningType}</label>
                                    <select
                                        id="series-planning-type"
                                        value={seriesPlanningType}
                                        onChange={(e) => setSeriesPlanningType(e.target.value as SeriesPlanningType)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-center font-bold"
                                    >
                                        <option value="new">{t.project.planning.seriesPlanningTypes.new}</option>
                                        <option value="continuation">{t.project.planning.seriesPlanningTypes.continuation}</option>
                                    </select>
                                </div>

                                {showSeriesContinuationSelect && (
                                    <div>
                                        <label htmlFor="series-continuation-select" className="block text-sm font-medium text-gray-300 mb-1 text-center">{t.project.planning.existingSeries}</label>
                                        <select
                                            id="series-continuation-select"
                                            value={selectedProducedSeriesTitle}
                                            onChange={(e) => setSelectedProducedSeriesTitle(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-center font-bold"
                                            disabled={producedSeriesOptions.length === 0}
                                        >
                                            <option value="" disabled>{producedSeriesOptions.length === 0 ? t.project.planning.noProducedSeries : t.project.planning.existingSeriesSelect}</option>
                                            {producedSeriesOptions.map(seriesTitle => (
                                                <option key={seriesTitle} value={seriesTitle}>{seriesTitle}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Title Input - Full Width */}
                        <div>
                            <label htmlFor="workingTitle" className="block text-sm font-medium text-gray-300 mb-1 text-center">{isSeriesMode ? t.project.planning.seriesName : t.project.planning.workingTitle}</label>
                            <input 
                                type="text" 
                                id="workingTitle" 
                                value={workingTitle} 
                                onChange={(e) => {
                                    const nextTitle = e.target.value;
                                    setWorkingTitle(nextTitle);
                                    if (isSeriesMode) {
                                        setSeriesName(nextTitle);
                                    }
                                }} 
                                className={`w-full bg-gray-900 border rounded-md py-2 px-3 text-white text-center font-bold ${liveTitleConflict ? 'border-red-500' : 'border-gray-600'}`}
                                disabled={!!initialContract} // Disable title edit for contracts
                            />
                            {liveTitleConflict && (
                                <p className="text-red-400 text-center text-sm mt-2">{t.project.planning.errorDuplicateTitle}</p>
                            )}
                        </div>

                        {isSeriesMode && (
                            <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 space-y-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-bold font-cinzel text-amber-300">{t.project.planning.seriesSectionTitle}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{t.project.planning.seriesSectionSubtitle}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="episode-count" className="block text-sm font-medium text-gray-300 mb-1">{t.project.planning.episodeCount}</label>
                                        <input
                                            id="episode-count"
                                            type="number"
                                            min="1"
                                            max="24"
                                            value={episodeCount}
                                            onChange={(e) => setEpisodeCount(Math.max(1, Number(e.target.value) || 1))}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="series-format" className="block text-sm font-medium text-gray-300 mb-1">{t.project.planning.seriesFormat}</label>
                                        <select id="series-format" value={seriesFormat} onChange={(e) => setSeriesFormat(e.target.value as 'short' | 'standard' | 'prestige')} className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm">
                                            <option value="short">{t.project.planning.seriesFormats.short}</option>
                                            <option value="standard">{t.project.planning.seriesFormats.standard}</option>
                                            <option value="prestige">{t.project.planning.seriesFormats.prestige}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="narrative-format" className="block text-sm font-medium text-gray-300 mb-1">{t.project.planning.narrativeFormat}</label>
                                        <select id="narrative-format" value={narrativeFormat} onChange={(e) => setNarrativeFormat(e.target.value as 'episodic' | 'serial')} className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm">
                                            <option value="episodic">{t.project.planning.narrativeFormats.episodic}</option>
                                            <option value="serial">{t.project.planning.narrativeFormats.serial}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="ensemble-size" className="block text-sm font-medium text-gray-300 mb-1">{t.project.planning.ensembleSize}</label>
                                        <select id="ensemble-size" value={ensembleSize} onChange={(e) => setEnsembleSize(e.target.value as SeriesEnsembleSize)} className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm">
                                            {availableSeriesEnsembleOptions.map(({ key, isUnlocked }) => (
                                                <option key={key} value={key} disabled={!isUnlocked}>
                                                    {t.project.planning.ensembleSizes[key]}{!isUnlocked ? ' (Forschung)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {nextSeriesEnsembleResearch && (
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {t.project.planning.requiredResearch}: {t.research.techs[nextSeriesEnsembleResearch as keyof typeof t.research.techs]?.name || RESEARCH_TECHS.find(tech => tech.id === nextSeriesEnsembleResearch)?.name || nextSeriesEnsembleResearch}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="production-profile" className="block text-sm font-medium text-gray-300 mb-1">{t.project.planning.productionProfile}</label>
                                        <select id="production-profile" value={productionProfile} onChange={(e) => setProductionProfile(e.target.value as SeriesProductionProfile)} className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm">
                                            {availableSeriesProductionProfiles.map(({ key, isUnlocked }) => (
                                                <option key={key} value={key} disabled={!isUnlocked}>
                                                    {t.project.planning.productionProfiles[key]}{!isUnlocked ? ' (Forschung)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {nextSeriesProfileResearch && (
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {t.project.planning.requiredResearch}: {t.research.techs[nextSeriesProfileResearch as keyof typeof t.research.techs]?.name || RESEARCH_TECHS.find(tech => tech.id === nextSeriesProfileResearch)?.name || nextSeriesProfileResearch}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sequel Selection Dropdown - MOVED HERE - Full Width now */}
                        {showSequelSelect && (
                            <div>
                                <label htmlFor="sequel-select" className="block text-sm font-medium text-gray-300 mb-1 text-center">{sequelLabel}</label>
                                <select 
                                    id="sequel-select" 
                                    value={sequelParentTitle} 
                                    onChange={(e) => {
                                        const selectedTitle = e.target.value;
                                        setSequelParentTitle(selectedTitle);
                                        setWorkingTitle(generateTitleFromParent(selectedTitle));
                                    }} 
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-center font-bold"
                                >
                                    {/* Empty Option Removed to ensure selection */}
                                    {playerData.completedFilms.map(film => (
                                        <option key={film.workingTitle} value={film.workingTitle}>
                                            {film.workingTitle} ({t.genres[film.genre]})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Grid for Script/Genre & Planner */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="script-select" className="block text-sm font-medium text-gray-300 mb-1">{isSeriesMode ? t.project.planning.genre : t.project.planning.script}</label>
                                <div className="relative group">
                                    <select id="script-select" value={isSeriesMode ? selectedSeriesGenre : selectedScriptId} onChange={(e) => isSeriesMode ? setSelectedSeriesGenre(e.target.value as Genre | '') : setSelectedScriptId(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm" disabled={isSeriesMode ? !!initialContract : filteredScripts.length === 0}>
                                        {isSeriesMode ? (
                                            <>
                                                {!initialContract ? <option value="" disabled>{t.project.planning.genreSelect}</option> : null}
                                                {availableSeriesGenres.map(genre => <option key={genre} value={genre}>{t.genres[genre]}</option>)}
                                            </>
                                        ) : filteredScripts.length > 0 ? (
                                            filteredScripts.map(script => <option key={script.id} value={script.id}>{getTranslatedScriptTitle(script, t)} ({t.genres[script.genre]})</option>)
                                        ) : (
                                            <option>{showSequelSelect || initialContract ? 'Keine passenden Drehbücher' : t.project.planning.noScripts}</option>
                                        )}
                                    </select>
                                    {!isSeriesMode && filteredScripts.length === 0 && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10">
                                            {showSequelSelect 
                                                ? `Benötigt Genre: ${sequelParent ? t.genres[sequelParent.genre] : ''}` 
                                                : initialContract 
                                                    ? `Benötigt Genre: ${t.genres[initialContract.genre]}`
                                                    : t.project.planning.noScriptsHint
                                            }
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                                        </div>
                                    )}
                                </div>
                                {!isSeriesMode && selectedScript && (
                                    <div className="mt-2 text-xs text-gray-400">
                                        <div className="flex justify-between mb-1"><span>{t.project.planning.quality}:</span> <StarRating rating={selectedScript.quality} size="sm" /></div>
                                        
                                        {(selectedScript.mainRole || selectedScript.supportingRole) && (
                                            <div className="bg-gray-900/50 p-2 rounded border border-gray-600/50 mt-1">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">{t.project.planning.castingSuggestions}</p>
                                                <div className="space-y-0.5">
                                                    {selectedScript.mainRole && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">{t.project.planning.mainRole}:</span>
                                                            <span className="text-gray-300">{selectedScript.mainRole.gender === 'männlich' ? t.newGame.male : t.newGame.female}, {getAgeLabel(selectedScript.mainRole.age, t)}</span>
                                                        </div>
                                                    )}
                                                    {selectedScript.supportingRole && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">{t.project.planning.supportingRole}:</span>
                                                            <span className="text-gray-300">{selectedScript.supportingRole.gender === 'männlich' ? t.newGame.male : t.newGame.female}, {getAgeLabel(selectedScript.supportingRole.age, t)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="planner-select" className="block text-sm font-medium text-gray-300 mb-1">{t.project.saved.planner}</label>
                                    <select
                                        id="planner-select"
                                        value={selectedPlannerId || ''}
                                        onChange={(e) => setSelectedPlannerId(Number(e.target.value) || undefined)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm"
                                        disabled={projectPlanners.length === 0}
                                    >
                                        {projectPlanners.length > 0 ? (
                                            projectPlanners.map(p => <option key={p.id} value={p.id}>{p.name} (Talent: {p.talent})</option>)
                                        ) : (
                                            <option value="">{t.project.saved.noPlanner}</option>
                                        )}
                                    </select>
                                </div>
                                {/* Age Rating Selection - Moved here under Planner */}
                                <div>
                                    <label htmlFor="age-rating" className="block text-sm font-medium text-gray-300 mb-1">{t.project.planning.ageRating}</label>
                                    <select
                                        id="age-rating"
                                        value={ageRating}
                                        onChange={(e) => setAgeRating(e.target.value as AgeRating)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm"
                                    >
                                        <option value="" disabled>{t.project.planning.selectRating}</option>
                                        <option value={AgeRating.FSK0}>{t.project.planning.ratings[0]}</option>
                                        <option value={AgeRating.FSK6}>{t.project.planning.ratings[6]}</option>
                                        <option value={AgeRating.FSK12}>{t.project.planning.ratings[12]}</option>
                                        <option value={AgeRating.FSK16}>{t.project.planning.ratings[16]}</option>
                                        <option value={AgeRating.FSK18}>{t.project.planning.ratings[18]}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {!isSeriesMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{isSeriesMode ? t.project.planning.sizeSeries : t.project.planning.size}</label>
                            <div className="grid grid-cols-5 gap-2">
                                {(Object.entries(MOVIE_SIZE_CONFIG) as [MovieSize, MovieSizeConfigValue][]).map(([size, config]) => {
                                    const isUnlocked = !config.requiredTech || playerData.unlockedTechnologies.includes(config.requiredTech);
                                    const isSelected = selectedMovieSize === size;
                                    return (
                                        <div key={size} className="relative group">
                                            <button
                                                onClick={() => {
                                                    setSelectedMovieSize(size);
                                                    setBudgetStep(1);
                                                }}
                                                disabled={!isUnlocked}
                                                className={`w-full h-full p-3 rounded-md text-center transition-all duration-200 border-2
                                                    ${isSelected ? 'border-amber-500 ring-2 ring-amber-500 bg-amber-500/10' : 'border-gray-600 bg-gray-900'}
                                                    ${isUnlocked ? 'hover:border-amber-500' : 'opacity-40 cursor-not-allowed'}
                                                `}
                                            >
                                                <span className="block font-bold text-sm">{config.name}</span>
                                            </button>
                                            {!isUnlocked && config.requiredTech && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10">
                                                    {t.project.planning.requiredResearch}: {RESEARCH_TECHS.find(t => t.id === config.requiredTech)?.name || config.requiredTech}
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {!isSeriesMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{isSeriesMode ? t.project.planning.sizeBudgetSeries : t.project.planning.sizeBudget}</label>
                            <div className="bg-gray-900/50 p-3 rounded-md">
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="1"
                                        value={budgetStep}
                                        onChange={(e) => setBudgetStep(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                                        <span>{formatCurrency(selectedMovieSizeConfig.budgetSteps[0])}</span>
                                        <span>{formatCurrency(selectedMovieSizeConfig.budgetSteps[1])}</span>
                                        <span>{formatCurrency(selectedMovieSizeConfig.budgetSteps[2])}</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-xl font-bold text-amber-400">{formatCurrency(movieSizeBudget)}</p>
                                    <p className="text-xs text-gray-400 h-4">
                                        {t.project.planning.budgetLevels[budgetStep]}
                                    </p>
                                </div>
                            </div>
                        </div>
                        )}

                        {isSeriesMode && (
                            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-cyan-500/30 rounded-lg p-4 text-center">
                                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">{t.project.planning.seriesSelectionCosts}</p>
                                <p className="text-3xl font-bold text-cyan-200">{formatCurrency(totalPlanningCost)}</p>
                            </div>
                        )}
                    </div>
            
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            
                    <div className="mt-8 flex justify-between items-center">
                         <button
                            onClick={handleCancelClick}
                            className="bg-gray-600 text-white font-bold py-3 px-8 rounded-sm text-lg uppercase tracking-wider transform hover:bg-gray-500 transition-all duration-300 ease-in-out shadow-lg"
                        >
                            {t.common.cancel}
                        </button>
                        <button
                            onClick={handleStartProject}
                            disabled={!canStart}
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-sm text-lg uppercase tracking-wider transform hover:bg-green-500 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {t.project.planning.startPlanning}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-gray-700 p-2 rounded-lg shadow-lg w-[316px]">
                        <div className="relative w-[300px] h-[450px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700 mx-auto">
                            {initialContract ? (
                                <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                                         <div className="bg-amber-500 w-[200%] py-4 text-center shadow-lg">
                                            <span className="text-black font-black text-2xl uppercase tracking-widest font-cinzel">
                                                {t.project.modeSelector.contract}
                                            </span>
                                         </div>
                                    </div>
                                </div>
                            ) : customCover ? (
                                <img src={customCover} alt={language === 'de' ? 'Eigenes Cover' : 'Custom Cover'} className="w-full h-full object-cover" />
                            ) : selectedPosterGenre && maxCoverId > 0 ? (
                                <img
                                    key={`${selectedPosterGenre}-${selectedCoverId}`}
                                    src={getCoverPath(selectedPosterGenre, selectedCoverId)}
                                    alt={`Cover für ${workingTitle}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    {isCountingPosters
                                        ? (language === 'de' ? 'Lade...' : 'Loading...')
                                        : selectedPosterGenre
                                            ? (language === 'de' ? 'Keine Poster gefunden' : 'No posters found')
                                            : (isSeriesMode
                                                ? (language === 'de' ? 'Kein Genre ausgewählt' : 'No genre selected')
                                                : (language === 'de' ? 'Kein Drehbuch ausgewählt' : 'No script selected'))}
                                </div>
                            )}
                            {!initialContract && (
                                <div className={`absolute inset-0 flex flex-col pointer-events-none p-4 ${getPositionClass()}`}> 
                                    <h3 className="text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                                        style={{ fontFamily: titleFontFamily, fontSize: `${titleFontSize}px`, lineHeight: 1.2, color: titleColor }}>
                                        {displayTitleOnCover}
                                    </h3>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 space-y-2 w-[316px]">
                        <div className="flex flex-col items-center gap-2">
                            <label className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded cursor-pointer text-xs mb-1">
                                {language === 'de' ? 'Eigenes Cover hochladen' : 'Upload Custom Cover'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverUpload}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                            </label>
                            {customCover && (
                                <button className="text-xs text-red-400 underline" onClick={handleRemoveCustomCover}>
                                    {language === 'de' ? 'Eigenes Cover entfernen' : 'Remove Custom Cover'}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-2">
                            <button onClick={handlePrevCover} disabled={isCountingPosters || maxCoverId <= 1 || !!customCover} className="p-1 rounded-full text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><ArrowLeftIcon className="h-5 w-5"/></button>
                            <span className="text-xs uppercase w-32 text-center truncate">
                                {customCover
                                    ? (language === 'de' ? 'Eigenes Cover' : 'Custom Cover')
                                    : isCountingPosters
                                        ? (language === 'de' ? 'Zähle...' : 'Counting...')
                                        : `${language === 'de' ? 'Poster' : 'Poster'} ${maxCoverId > 0 ? selectedCoverId : 0} / ${maxCoverId}`}
                            </span>
                            <button onClick={handleNextCover} disabled={isCountingPosters || maxCoverId <= 1 || !!customCover} className="p-1 rounded-full text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><ArrowRightIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handlePrevPosition} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowLeftIcon className="h-5 w-5"/></button>
                            <span className="text-xs uppercase w-32 text-center truncate" title="Titelposition">
                                {titlePosition}
                            </span>
                            <button onClick={handleNextPosition} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowRightIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handleDecreaseFontSize} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowLeftIcon className="h-5 w-5"/></button>
                            <span className="text-xs uppercase w-32 text-center truncate">{t.project.planning.coverSize}: {titleFontSize}</span>
                            <button onClick={handleIncreaseFontSize} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowRightIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handlePrevFont} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowLeftIcon className="h-5 w-5"/></button>
                            <span 
                                className="text-sm w-32 text-center truncate"
                                style={{ fontFamily: titleFontFamily }}
                                title={titleFontFamily}
                            >
                                {titleFontFamily}
                            </span>
                            <button onClick={handleNextFont} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowRightIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handlePrevColor} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowLeftIcon className="h-5 w-5"/></button>
                            <div className="text-xs uppercase w-32 text-center flex items-center justify-center gap-2">
                                <span>{t.project.planning.coverColor}</span>
                                <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: titleColor }}></div>
                            </div>
                            <button onClick={handleNextColor} className="p-1 rounded-full text-white hover:bg-gray-700"><ArrowRightIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                </div>
            </div>
            {showStartConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.planning.confirmStartTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">
                            {t.project.planning.confirmStartText
                                .replace('{title}', workingTitle)
                                .replace('{cost}', formatCurrency(totalPlanningCost))}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowStartConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">
                                {t.common.cancel}
                            </button>
                            <button onClick={confirmStartProject} className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all">
                                {t.common.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
             {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={`bg-gray-800 border ${initialContract ? 'border-red-500' : 'border-amber-500'} rounded-lg shadow-2xl w-full max-w-lg p-8 text-center`}>
                        <h2 className={`text-3xl font-bold font-cinzel ${initialContract ? 'text-red-400' : 'text-amber-400'} mb-4`}>
                             {initialContract ? t.project.planning.cancelContractTitle : t.project.planning.cancelConfirmTitle}
                        </h2>
                        <p className="text-gray-300 text-lg mb-6">
                            {initialContract 
                                ? t.project.planning.cancelContractText.replace('{amount}', formatCurrency(initialContract.penalty))
                                : t.project.planning.cancelConfirmText
                            }
                             {initialContract && (
                                <span className="block mt-4 text-red-300 font-bold">
                                    Zusätzlich wird der bereits erhaltene Vorschuss von {formatCurrency(initialContract.upfrontPayment || 0)} zurückgefordert!
                                </span>
                            )}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowCancelConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">
                                {t.common.no}
                            </button>
                            <button onClick={initialContract ? handleConfirmCancel : onBackToSelection} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">
                                {initialContract ? t.project.planning.cancelContractYes : t.common.yes}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectPlanningTab;
