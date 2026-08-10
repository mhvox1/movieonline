import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef } from "react";
import { MovieSize, ProjectPhase, ProjectType, BuildingType, ActorAge, EmployeeType, AgeRating, Genre, Era } from "../../../types";
import { useGame } from "../../../contexts/GameContext";
import { MOVIE_SIZE_CONFIG } from "../../constants";
import { RESEARCH_TECHS } from "../../research";
import { getCoverPath } from "../../coverConfig";
import StarRating from "../../StarRating";
import ArrowLeftIcon from "../../icons/ArrowLeftIcon";
import ArrowRightIcon from "../../icons/ArrowRightIcon";
import { useTranslation } from "../../../hooks/useTranslation";
import { getTranslatedScriptTitle } from "../../scriptGenerator";
const FONT_FAMILIES = [
  "Cinzel",
  "Lato",
  "Arial",
  "Verdana",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Impact",
  "Tahoma",
  "Geneva"
];
const TITLE_POSITIONS = ["top", "top-center", "center", "bottom-center", "bottom"];
const FONT_COLORS = [
  "#FFFFFF",
  "#000000",
  // B&W
  "#9CA3AF",
  "#4B5563",
  // Grays
  "#FCA5A5",
  "#EF4444",
  "#991B1B",
  // Reds
  "#FDBA74",
  "#F97316",
  "#9A3412",
  // Oranges
  "#FDE047",
  "#EAB308",
  "#854D0E",
  // Yellows/Golds
  "#BEF264",
  "#84CC16",
  "#3F6212",
  // Limes
  "#86EFAC",
  "#22C55E",
  "#14532D",
  // Greens
  "#67E8F9",
  "#06B6D4",
  "#164E63",
  // Cyans
  "#93C5FD",
  "#3B82F6",
  "#1E3A8A",
  // Blues
  "#C4B5FD",
  "#8B5CF6",
  "#5B21B6",
  // Violets
  "#F0ABFC",
  "#D946EF",
  "#86198F",
  // Fuchsias
  "#FDA4AF",
  "#F43F5E",
  "#881337"
  // Roses
];
const SERIES_FORMAT_RUNTIMES = {
  short: 25,
  standard: 45,
  prestige: 60
};
const SERIES_ENSEMBLE_CONFIG = {
  intimate: { cost: 0 },
  small: { cost: 15e4 },
  medium: { cost: 4e5 },
  large: { cost: 85e4 },
  epic: { cost: 15e5 }
};
const SERIES_PRODUCTION_PROFILE_CONFIG = {
  lean: { cost: 0 },
  efficient: { cost: 25e4 },
  balanced: { cost: 55e4 },
  ambitious: { cost: 1e6 },
  prestige: { cost: 18e5 }
};
const SERIES_RUNTIME_COST_PER_MINUTE = 2500;
const SERIES_ENSEMBLE_QUALITY_CONFIG = {
  intimate: 32,
  small: 42,
  medium: 52,
  large: 63,
  epic: 74
};
const SERIES_PRODUCTION_PROFILE_QUALITY_CONFIG = {
  lean: 0,
  efficient: 6,
  balanced: 12,
  ambitious: 18,
  prestige: 24
};
const SERIES_ENSEMBLE_REQUIRED_TECH = {
  intimate: null,
  small: "unlock_series_ensemble_small",
  medium: "unlock_series_ensemble_medium",
  large: "unlock_series_ensemble_large",
  epic: "unlock_series_ensemble_epic"
};
const SERIES_PRODUCTION_PROFILE_REQUIRED_TECH = {
  lean: null,
  efficient: "unlock_series_profile_efficient",
  balanced: "unlock_series_profile_balanced",
  ambitious: "unlock_series_profile_ambitious",
  prestige: "unlock_series_profile_prestige"
};
const getAgeLabel = (age, t) => {
  switch (age) {
    case ActorAge.Child:
      return t.actorAge.child;
    case ActorAge.Young:
      return t.actorAge.young;
    case ActorAge.MiddleAged:
      return t.actorAge.middleAged;
    case ActorAge.Old:
      return t.actorAge.old;
    default:
      return age;
  }
};
const getSeriesAgeRatingGenreBonus = (genre, ageRating) => {
  switch (genre) {
    case Genre.Horror:
    case Genre.Thriller:
    case Genre.Crime:
    case Genre.War:
      switch (ageRating) {
        case AgeRating.FSK18:
          return 10;
        case AgeRating.FSK16:
          return 7;
        case AgeRating.FSK12:
          return 2;
        default:
          return -6;
      }
    case Genre.Action:
    case Genre.Adventure:
    case Genre.Fantasy:
    case Genre.SciFi:
    case Genre.Western:
      switch (ageRating) {
        case AgeRating.FSK16:
          return 9;
        case AgeRating.FSK12:
          return 7;
        case AgeRating.FSK6:
          return 2;
        case AgeRating.FSK18:
          return 1;
        default:
          return -4;
      }
    case Genre.Comedy:
    case Genre.Romance:
    case Genre.Musical:
    case Genre.Dokumentation:
      switch (ageRating) {
        case AgeRating.FSK6:
          return 9;
        case AgeRating.FSK0:
          return 7;
        case AgeRating.FSK12:
          return 3;
        default:
          return -5;
      }
    case Genre.Drama:
      switch (ageRating) {
        case AgeRating.FSK12:
          return 8;
        case AgeRating.FSK16:
          return 5;
        case AgeRating.FSK6:
          return 2;
        default:
          return 0;
      }
    default:
      return 0;
  }
};
const normalizeProjectTitle = (title) => title.trim().toLocaleLowerCase();
const ProjectPlanningTab = ({ setGameState, setCurrentView, planningMode, onBackToSelection, initialContract }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const isSeriesMode = planningMode === "series";
  const [selectedScriptId, setSelectedScriptId] = useState(isSeriesMode ? void 0 : playerData?.currentProject?.scriptId || playerData?.availableScripts[0]?.id);
  const [selectedSeriesGenre, setSelectedSeriesGenre] = useState(playerData?.currentProject?.genre || initialContract?.genre || "");
  const [selectedMovieSize, setSelectedMovieSize] = useState(playerData?.currentProject?.movieSize || MovieSize.B);
  const [workingTitle, setWorkingTitle] = useState(playerData?.currentProject?.workingTitle || "");
  const [selectedCoverId, setSelectedCoverId] = useState(playerData?.currentProject?.coverImageId || 1);
  const [customCover, setCustomCover] = useState(playerData?.currentProject?.customCover);
  const fileInputRef = useRef(null);
  const [titlePosition, setTitlePosition] = useState(playerData?.currentProject?.coverTitlePosition || "bottom");
  const [titleFontSize, setTitleFontSize] = useState(playerData?.currentProject?.coverTitleFontSize || 30);
  const [titleFontFamily, setTitleFontFamily] = useState(playerData?.currentProject?.coverTitleFontFamily || "Cinzel");
  const [titleColor, setTitleColor] = useState(playerData?.currentProject?.coverTitleColor || "#FFFFFF");
  const [error, setError] = useState("");
  const [posterCounts, setPosterCounts] = useState({});
  const [isCountingPosters, setIsCountingPosters] = useState(false);
  const [budgetStep, setBudgetStep] = useState(1);
  const [selectedPlannerId, setSelectedPlannerId] = useState(playerData?.currentProject?.plannerId);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [ageRating, setAgeRating] = useState("");
  const [seriesName, setSeriesName] = useState(playerData?.currentProject?.seriesName || "");
  const [seasonNumber, setSeasonNumber] = useState(playerData?.currentProject?.seasonNumber || 1);
  const [episodeCount, setEpisodeCount] = useState(playerData?.currentProject?.episodeCount || 8);
  const [episodeRuntime, setEpisodeRuntime] = useState(playerData?.currentProject?.episodeRuntime || SERIES_FORMAT_RUNTIMES.standard);
  const [seriesFormat, setSeriesFormat] = useState(playerData?.currentProject?.seriesFormat || "standard");
  const [releaseModel, setReleaseModel] = useState(playerData?.currentProject?.releaseModel || "weekly");
  const [narrativeFormat, setNarrativeFormat] = useState(playerData?.currentProject?.narrativeFormat || "serial");
  const [ensembleSize, setEnsembleSize] = useState(playerData?.currentProject?.ensembleSize || "intimate");
  const [productionProfile, setProductionProfile] = useState(playerData?.currentProject?.productionProfile || "lean");
  const [seriesPlanningType, setSeriesPlanningType] = useState(playerData?.currentProject?.sequelTo || playerData?.activePlanning?.sequelTo ? "continuation" : "new");
  const [selectedProducedSeriesTitle, setSelectedProducedSeriesTitle] = useState(playerData?.currentProject?.sequelTo || playerData?.activePlanning?.sequelTo || "");
  const [sequelParentTitle, setSequelParentTitle] = useState(playerData?.currentProject?.sequelTo || "");
  const normalizedWorkingTitle = useMemo(() => normalizeProjectTitle(workingTitle), [workingTitle]);
  const hasTitleConflict = useMemo(() => {
    if (!playerData || !normalizedWorkingTitle) return false;
    const activePlanningTitle = playerData.activePlanning?.workingTitle ? normalizeProjectTitle(playerData.activePlanning.workingTitle) : "";
    const matchesActivePlanning = activePlanningTitle === normalizedWorkingTitle;
    const isPendingCurrentContractPlanning = matchesActivePlanning && !!initialContract && !!playerData.activePlanning?.contract && !playerData.activePlanning?.scriptId;
    const planningConflict = matchesActivePlanning && !isPendingCurrentContractPlanning;
    const activeProjectConflict = playerData.activeProjects.some(
      (project) => normalizeProjectTitle(project.workingTitle) === normalizedWorkingTitle
    );
    const completedFilmConflict = playerData.completedFilms.some(
      (film) => normalizeProjectTitle(film.workingTitle) === normalizedWorkingTitle
    );
    const savedTemplateConflict = playerData.savedProjectTemplates.some(
      (template) => normalizeProjectTitle(template.workingTitle) === normalizedWorkingTitle
    );
    return planningConflict || activeProjectConflict || completedFilmConflict || savedTemplateConflict;
  }, [playerData, normalizedWorkingTitle, initialContract]);
  const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const selectedScript = useMemo(() => playerData?.availableScripts.find((s) => s.id === selectedScriptId), [playerData?.availableScripts, selectedScriptId]);
  const availableSeriesGenres = useMemo(() => initialContract ? [initialContract.genre] : Object.values(Genre), [initialContract]);
  const selectedPosterGenre = isSeriesMode ? selectedSeriesGenre : selectedScript?.genre;
  const projectPlanners = useMemo(() => {
    if (!playerData) return [];
    const employeePlanners = playerData.employees.filter((e) => e.type === EmployeeType.ProjektPlaner);
    if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.ProjektPlaner) {
      const partnerPlanner = {
        id: 99901,
        name: `${playerData.partnerName} (Partner)`,
        type: EmployeeType.ProjektPlaner,
        talent: playerData.partnerSkills?.planning || 0,
        salary: 0,
        experience: 0,
        satisfaction: 100,
        portraitUrl: playerData.partnerPortraitId ? `https://www.schnoxcore.com/media/portraits/${playerData.partnerPortraitId}.png` : void 0
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
          portraitUrl: child.portraitId ? `https://www.schnoxcore.com/media/kinder/${child.portraitId}.png` : void 0
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
    return Object.entries(MOVIE_SIZE_CONFIG).filter(([, config]) => {
      if (!config.requiredTech) {
        return true;
      }
      return playerData.unlockedTechnologies.includes(config.requiredTech);
    }).map(([size, config]) => ({ size, config }));
  }, [playerData]);
  const availableSeriesEnsembleOptions = useMemo(() => {
    if (!playerData) return [];
    return Object.keys(SERIES_ENSEMBLE_CONFIG).map((key) => {
      const requiredTech = SERIES_ENSEMBLE_REQUIRED_TECH[key];
      return {
        key,
        requiredTech,
        isUnlocked: !requiredTech || playerData.unlockedTechnologies.includes(requiredTech)
      };
    });
  }, [playerData]);
  const availableSeriesProductionProfiles = useMemo(() => {
    if (!playerData) return [];
    return Object.keys(SERIES_PRODUCTION_PROFILE_CONFIG).map((key) => {
      const requiredTech = SERIES_PRODUCTION_PROFILE_REQUIRED_TECH[key];
      return {
        key,
        requiredTech,
        isUnlocked: !requiredTech || playerData.unlockedTechnologies.includes(requiredTech)
      };
    });
  }, [playerData]);
  const sequelParent = useMemo(() => {
    if (!sequelParentTitle) return null;
    return playerData.completedFilms.find((f) => f.workingTitle === sequelParentTitle);
  }, [sequelParentTitle, playerData.completedFilms]);
  const showSequelSelect = planningMode === "sequel" || planningMode === "prequel";
  const producedSeriesOptions = useMemo(() => {
    const uniqueSeries = /* @__PURE__ */ new Map();
    (playerData?.completedFilms || []).forEach((project) => {
      const isCompletedSeries = project.projectType === ProjectType.Series || !!project.seriesName && !!project.episodeCount;
      if (!isCompletedSeries) return;
      const seriesTitle = (project.seriesName || project.workingTitle || "").trim();
      if (!seriesTitle) return;
      const normalizedTitle = normalizeProjectTitle(seriesTitle);
      if (!uniqueSeries.has(normalizedTitle)) {
        uniqueSeries.set(normalizedTitle, seriesTitle);
      }
    });
    return Array.from(uniqueSeries.values()).sort((left, right) => left.localeCompare(right, locale));
  }, [locale, playerData?.completedFilms]);
  const showSeriesContinuationSelect = isSeriesMode && seriesPlanningType === "continuation";
  const hasValidSeriesContinuationSelection = !showSeriesContinuationSelect || !!selectedProducedSeriesTitle;
  const filteredScripts = useMemo(() => {
    if (!playerData) return [];
    let scripts = playerData.availableScripts;
    if (showSequelSelect && sequelParent) {
      scripts = scripts.filter((s) => s.genre === sequelParent.genre);
    }
    if (initialContract) {
      scripts = scripts.filter((s) => s.genre === initialContract.genre);
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
    if (!isSeriesMode || !selectedSeriesGenre || ageRating === "") return 0;
    const ensembleQuality = SERIES_ENSEMBLE_QUALITY_CONFIG[ensembleSize];
    const productionProfileQuality = SERIES_PRODUCTION_PROFILE_QUALITY_CONFIG[productionProfile];
    const ageRatingBonus = getSeriesAgeRatingGenreBonus(selectedSeriesGenre, ageRating);
    const rawSeriesQuality = ensembleQuality + productionProfileQuality + ageRatingBonus;
    return Math.max(1, Math.min(100, Math.round(rawSeriesQuality * 0.75)));
  }, [ageRating, ensembleSize, isSeriesMode, productionProfile, selectedSeriesGenre]);
  const totalPlanningCost = useMemo(() => {
    if (isSeriesMode) {
      return seriesEnsembleCost + seriesProductionProfileCost + seriesRuntimePlanningCost;
    }
    return movieSizeBudget;
  }, [isSeriesMode, movieSizeBudget, seriesEnsembleCost, seriesProductionProfileCost, seriesRuntimePlanningCost]);
  const nextSeriesEnsembleResearch = useMemo(
    () => availableSeriesEnsembleOptions.find((option) => !option.isUnlocked)?.requiredTech || null,
    [availableSeriesEnsembleOptions]
  );
  const nextSeriesProfileResearch = useMemo(
    () => availableSeriesProductionProfiles.find((option) => !option.isUnlocked)?.requiredTech || null,
    [availableSeriesProductionProfiles]
  );
  useEffect(() => {
    if (!selectedPosterGenre) return;
    const genre = selectedPosterGenre;
    if (posterCounts[genre] !== void 0) {
      return;
    }
    const getPosterCount = async () => {
      setIsCountingPosters(true);
      let count = 0;
      const MAX_PROBE = 100;
      for (let i = 1; i <= MAX_PROBE; i++) {
        try {
          const response = await fetch(getCoverPath(genre, i), { method: "HEAD" });
          if (response.ok) {
            count = i;
          } else {
            break;
          }
        } catch (e) {
          break;
        }
      }
      setPosterCounts((prev) => ({ ...prev, [genre]: count }));
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
    const planning = playerData?.activePlanning;
    if (planning && planning.contract && !planning.scriptId) {
      setWorkingTitle(planning.workingTitle);
    } else if (project && project.phase === ProjectPhase.CastingSetup) {
      setSelectedScriptId(project.scriptId);
      setSelectedMovieSize(project.movieSize || MovieSize.B);
      setWorkingTitle(project.workingTitle || "");
      setSelectedCoverId(project.coverImageId || 1);
      setTitlePosition(project.coverTitlePosition || "bottom");
      setTitleFontSize(project.coverTitleFontSize || 30);
      setTitleFontFamily(project.coverTitleFontFamily || "Cinzel");
      setTitleColor(project.coverTitleColor || "#FFFFFF");
      setSelectedPlannerId(project.plannerId);
      setSequelParentTitle(project.sequelTo || "");
      setAgeRating(project.ageRating || AgeRating.FSK12);
      setSeriesName(project.seriesName || "");
      setSeasonNumber(project.seasonNumber || 1);
      setEpisodeCount(project.episodeCount || 8);
      setEpisodeRuntime(project.episodeRuntime || SERIES_FORMAT_RUNTIMES.standard);
      setSeriesFormat(project.seriesFormat || "standard");
      setReleaseModel(project.releaseModel || "weekly");
      setNarrativeFormat(project.narrativeFormat || "serial");
      setEnsembleSize(project.ensembleSize || "intimate");
      setProductionProfile(project.productionProfile || "lean");
      setSeriesPlanningType(project.sequelTo ? "continuation" : "new");
      setSelectedProducedSeriesTitle(project.sequelTo || "");
      const config = MOVIE_SIZE_CONFIG[project.movieSize || MovieSize.B];
      const step = config.budgetSteps.indexOf(project.movieSizeBudget || config.budgetSteps[1]);
      setBudgetStep(step !== -1 ? step : 1);
    } else if (!selectedScriptId && !isSeriesMode) {
      const firstAvailableScript = filteredScripts[0];
      setSelectedScriptId(firstAvailableScript?.id);
      if (firstAvailableScript && !showSequelSelect && !initialContract && !isSeriesMode) setWorkingTitle(getTranslatedScriptTitle(firstAvailableScript, t));
    }
    if (initialContract && !playerData?.activePlanning) {
      setWorkingTitle(`${initialContract.title} (${t.project.modeSelector.contract})`);
    }
  }, [initialContract, isSeriesMode, t, playerData?.activePlanning]);
  useEffect(() => {
    if (availableMovieSizes.length > 0 && !availableMovieSizes.some((item) => item.size === selectedMovieSize)) {
      setSelectedMovieSize(availableMovieSizes[0].size);
      setBudgetStep(1);
    }
  }, [availableMovieSizes, selectedMovieSize]);
  useEffect(() => {
    const selectedEnsembleOption = availableSeriesEnsembleOptions.find((option) => option.key === ensembleSize);
    if (!selectedEnsembleOption?.isUnlocked) {
      const fallbackOption = availableSeriesEnsembleOptions.find((option) => option.isUnlocked);
      if (fallbackOption && fallbackOption.key !== ensembleSize) {
        setEnsembleSize(fallbackOption.key);
      }
    }
  }, [availableSeriesEnsembleOptions, ensembleSize]);
  useEffect(() => {
    const selectedProfileOption = availableSeriesProductionProfiles.find((option) => option.key === productionProfile);
    if (!selectedProfileOption?.isUnlocked) {
      const fallbackOption = availableSeriesProductionProfiles.find((option) => option.isUnlocked);
      if (fallbackOption && fallbackOption.key !== productionProfile) {
        setProductionProfile(fallbackOption.key);
      }
    }
  }, [availableSeriesProductionProfiles, productionProfile]);
  useEffect(() => {
    if (isSeriesMode) return;
    const isValid = filteredScripts.some((s) => s.id === selectedScriptId);
    if (!isValid) {
      if (filteredScripts.length > 0) {
        const first = filteredScripts[0];
        setSelectedScriptId(first.id);
        if (!showSequelSelect && !initialContract) {
          setWorkingTitle(getTranslatedScriptTitle(first, t));
        }
        setSelectedCoverId(1);
      } else {
        setSelectedScriptId(void 0);
        if (!showSequelSelect && !initialContract) setWorkingTitle("");
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
      setSelectedSeriesGenre(initialContract?.genre || "");
    }
  }, [availableSeriesGenres, initialContract, isSeriesMode, selectedSeriesGenre]);
  useEffect(() => {
    if (!isSeriesMode) return;
    if (seriesPlanningType === "new") {
      if (selectedProducedSeriesTitle) {
        setSelectedProducedSeriesTitle("");
      }
      return;
    }
    const isValidSelection = !!selectedProducedSeriesTitle && producedSeriesOptions.includes(selectedProducedSeriesTitle);
    if (!isValidSelection) {
      setSelectedProducedSeriesTitle("");
    }
  }, [isSeriesMode, producedSeriesOptions, selectedProducedSeriesTitle, seriesPlanningType]);
  useEffect(() => {
    if (selectedScript && !playerData?.currentProject) {
      if (!sequelParentTitle && !initialContract && !playerData?.activePlanning && !isSeriesMode) {
        setWorkingTitle(getTranslatedScriptTitle(selectedScript, t));
      }
      setSelectedCoverId(1);
    }
  }, [selectedScript, playerData?.currentProject, t, sequelParentTitle, initialContract, isSeriesMode]);
  useEffect(() => {
    setEpisodeRuntime(SERIES_FORMAT_RUNTIMES[seriesFormat]);
  }, [seriesFormat]);
  const generateTitleFromParent = (parentTitle) => {
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
    if (planningMode === "prequel") {
      newTitle = `${parentTitle}: The Beginning`;
    }
    return newTitle;
  };
  useEffect(() => {
    if (showSequelSelect && playerData?.completedFilms && playerData.completedFilms.length > 0) {
      const isValidSelection = sequelParentTitle && playerData.completedFilms.some((f) => f.workingTitle === sequelParentTitle);
      if (!isValidSelection) {
        const defaultFilm = playerData.completedFilms[0];
        setSequelParentTitle(defaultFilm.workingTitle);
        setWorkingTitle(generateTitleFromParent(defaultFilm.workingTitle));
      }
    }
  }, [showSequelSelect, playerData?.completedFilms, planningMode]);
  const maxCoverId = selectedPosterGenre && posterCounts[selectedPosterGenre] || 0;
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomCover(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const handleRemoveCustomCover = () => {
    setCustomCover(void 0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handlePrevCover = () => {
    if (maxCoverId <= 1) return;
    setSelectedCoverId((prev) => prev === 1 ? maxCoverId : prev - 1);
  };
  const handleNextCover = () => {
    if (maxCoverId <= 1) return;
    setSelectedCoverId((prev) => prev === maxCoverId ? 1 : prev + 1);
  };
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
  const handleDecreaseFontSize = () => setTitleFontSize((prev) => Math.max(12, prev - 2));
  const handleIncreaseFontSize = () => setTitleFontSize((prev) => Math.min(60, prev + 2));
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
  const getPositionClass = (pos = titlePosition) => {
    switch (pos) {
      case "top":
        return "justify-start pt-2";
      case "top-center":
        return "justify-start pt-[25%]";
      case "center":
        return "justify-center";
      case "bottom-center":
        return "justify-end pb-[25%]";
      case "bottom":
        return "justify-end pb-2";
      default:
        return "justify-end pb-2";
    }
  };
  const sequelLabel = planningMode === "prequel" ? t.project.planning.prequelTo : t.project.planning.sequelTo;
  const getPageTitle = () => {
    switch (planningMode) {
      case "series":
        return t.project.planning.titleSeries;
      case "sequel":
        return t.project.planning.titleSequel;
      case "prequel":
        return t.project.planning.titlePrequel;
      case "contract":
        return t.project.planning.planningContractTitle;
      default:
        return t.project.planning.titleNew;
    }
  };
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
    if (playerData.activePlanning && !initialContract) {
      setError(t.project.planning.errorRunning);
      return;
    }
    if (playerData.capital < totalPlanningCost && !initialContract) {
      setError(t.project.planning.errorCapital);
      return;
    }
    setError("");
    setShowStartConfirm(true);
  };
  const confirmStartProject = () => {
    if (!isSeriesMode && !selectedScript) return;
    if (isSeriesMode && !selectedSeriesGenre) return;
    const isTestMode = playerData.playerName === "Max Mustermann" && playerData.studioName === "Teststudio";
    const planningOffice = playerData.buildings.find((b) => b.type === BuildingType.Planungsbuero);
    const planner = projectPlanners.find((p) => p.id === selectedPlannerId);
    let buildingDurationModifier = 1;
    if (planningOffice && planningOffice.level > 0) {
      buildingDurationModifier = 1 - planningOffice.level * 0.1;
    }
    let employeeDurationModifier = 0;
    if (planner) {
      const effTalent = planner.talent * (planner.satisfaction / 100);
      employeeDurationModifier = effTalent / 500;
    }
    const movieBaseDuration = 15;
    const seriesBaseDuration = 30 + Math.round(seriesPlanningQuality / 5);
    const durationModifier = Math.max(0.5, buildingDurationModifier - employeeDurationModifier);
    const moviePlanningDuration = Math.max(5, Math.round(movieBaseDuration * durationModifier));
    let duration = isSeriesMode ? Math.max(moviePlanningDuration * 2, Math.round(seriesBaseDuration * durationModifier)) : moviePlanningDuration;
    if (isTestMode) {
      duration = 5;
    }
    if (initialContract && !isTestMode) {
      duration = Math.max(3, Math.round(duration * 0.66));
    }
    const startDate = new Date(playerData.gameDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);
    const movieSizeConfig = isSeriesMode ? null : MOVIE_SIZE_CONFIG[selectedMovieSize];
    const hardCap = movieSizeConfig ? movieSizeConfig.qualityCap : 100;
    const baseScriptQuality = isSeriesMode ? seriesPlanningQuality : selectedScript.quality;
    let potential = Math.min(baseScriptQuality, hardCap);
    if (!isSeriesMode && budgetStep === 0) {
      const reduction = 0.1 + Math.random() * 0.1;
      potential = potential * (1 - reduction);
    } else if (!isSeriesMode && budgetStep === 2) {
      const increase = 0.1 + Math.random() * 0.1;
      potential = potential * (1 + increase);
    }
    const projectPotential = Math.max(1, Math.min(100, Math.round(potential)));
    let initialHype = 0;
    if (showSequelSelect && sequelParentTitle) {
      const parentFilm = playerData.completedFilms.find((f) => f.workingTitle === sequelParentTitle);
      if (parentFilm) {
        const parentHype = parentFilm.hype !== void 0 ? parentFilm.hype : parentFilm.finalQuality ? Math.round(parentFilm.finalQuality * 0.8) : 0;
        const variance = 0.9 + Math.random() * 0.2;
        initialHype = Math.round(parentHype * variance);
      }
    }
    if (playerData.gameDifficulty === "leicht") {
      initialHype += 10;
    }
    initialHype = Math.max(0, Math.min(100, initialHype));
    setPlayerData((prev) => {
      if (!prev) return null;
      const projectGenre = isSeriesMode ? selectedSeriesGenre : selectedScript.genre;
      const projectEra = isSeriesMode ? Era.Present : selectedScript.era;
      const newProjectData = {
        phase: ProjectPhase.Planning,
        workingTitle,
        projectType: isSeriesMode ? ProjectType.Series : ProjectType.Movie,
        genre: projectGenre,
        era: projectEra,
        scriptId: isSeriesMode ? void 0 : selectedScript.id,
        scriptQuality: baseScriptQuality,
        movieSize: isSeriesMode ? void 0 : selectedMovieSize,
        movieSizeBudget: isSeriesMode ? void 0 : movieSizeBudget,
        scriptBudget: isSeriesMode ? 0 : selectedScript.price || 0,
        scriptStartDate: startDate,
        scriptEndDate: endDate,
        scriptTitle: isSeriesMode ? void 0 : selectedScript.title,
        scriptDescription: isSeriesMode ? void 0 : selectedScript.description,
        coverImageId: selectedCoverId,
        coverTitlePosition: titlePosition,
        coverTitleFontSize: titleFontSize,
        coverTitleFontFamily: titleFontFamily,
        coverTitleColor: titleColor,
        isArchived: false,
        mainRole: isSeriesMode ? void 0 : selectedScript.mainRole,
        supportingRole: isSeriesMode ? void 0 : selectedScript.supportingRole,
        sourcePlotIndex: isSeriesMode ? void 0 : selectedScript.sourcePlotIndex,
        titleStructure: isSeriesMode ? void 0 : selectedScript.titleStructure,
        plannerId: selectedPlannerId,
        projectPotential,
        // SAVED HERE PERMANENTLY
        sequelTo: showSequelSelect ? sequelParentTitle || void 0 : showSeriesContinuationSelect ? selectedProducedSeriesTitle || void 0 : void 0,
        ageRating,
        hype: initialHype,
        contract: initialContract || void 0,
        customCover,
        seriesName: isSeriesMode ? workingTitle.trim() : void 0,
        seriesSeasonTitle: isSeriesMode ? void 0 : void 0,
        seasonNumber: isSeriesMode ? 1 : void 0,
        episodeCount: isSeriesMode ? episodeCount : void 0,
        episodeRuntime: isSeriesMode ? episodeRuntime : void 0,
        seriesFormat: isSeriesMode ? seriesFormat : void 0,
        releaseModel: isSeriesMode ? releaseModel : void 0,
        narrativeFormat: isSeriesMode ? narrativeFormat : void 0,
        ensembleSize: isSeriesMode ? ensembleSize : void 0,
        productionProfile: isSeriesMode ? productionProfile : void 0,
        seriesEnsembleCost: isSeriesMode ? seriesEnsembleCost : void 0,
        seriesProductionProfileCost: isSeriesMode ? seriesProductionProfileCost : void 0,
        seriesPlanningCost: isSeriesMode ? totalPlanningCost : void 0
      };
      const newAvailableScripts = isSeriesMode ? prev.availableScripts : prev.availableScripts.filter((s) => s.id !== selectedScriptId);
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
            type: "Ausgabe",
            category: "Filmproduktion",
            description: `Projektplanung gestartet: "${workingTitle}"`,
            descriptionKey: "projectPlanningStart",
            descriptionVars: { title: workingTitle },
            amount: capitalDeduction
          }
        ]
      };
    });
    setShowStartConfirm(false);
    setCurrentView("project");
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
      const totalDeduction = penalty + upfront;
      const subject = language === "de" ? `Vertragsbruch: ${initialContract.title}` : `Breach of Contract: ${initialContract.title}`;
      const body = language === "de" ? `Sehr geehrte Damen und Herren,

mit Bedauern nehmen wir zur Kenntnis, dass Sie die Planung f\xFCr die Auftragsproduktion "${initialContract.title}" abgebrochen haben.

Dies stellt einen Bruch unserer Vereinbarung dar. Gem\xE4\xDF Vertrag wird die vereinbarte Vertragsstrafe in H\xF6he von ${formattedPenalty} hiermit f\xE4llig.

Zus\xE4tzlich fordern wir den geleisteten Vorschuss in H\xF6he von ${formattedUpfront} zur\xFCck.

Die Gesamtsumme wird Ihrem Konto belastet.

Mit freundlichen Gr\xFC\xDFen,
${initialContract.stationName}` : `Dear Sir or Madam,

We regret to note that you have cancelled the planning for the commissioned production "${initialContract.title}".

This constitutes a breach of our agreement. According to the contract, the agreed penalty of ${formattedPenalty} is hereby due.

Additionally, we demand the repayment of the advance of ${formattedUpfront}.

The total amount will be charged to your account.

Sincerely,
${initialContract.stationName}`;
      setPlayerData((prev) => {
        if (!prev) return null;
        const newMessage = {
          id: `msg_contract_break_${Date.now()}`,
          date: new Date(prev.gameDate),
          sender: initialContract.stationName,
          subject,
          body,
          read: false
        };
        return {
          ...prev,
          activePlanning: null,
          // Clear the persistent pending state
          capital: prev.capital - totalDeduction,
          messages: [...prev.messages, newMessage],
          transactionLog: [...prev.transactionLog, {
            date: new Date(prev.gameDate),
            type: "Ausgabe",
            category: "Filmproduktion",
            description: language === "de" ? `Vertragsstrafe + R\xFCckzahlung Vorschuss: "${initialContract.title}"` : `Contract penalty + advance repayment: "${initialContract.title}"`,
            amount: totalDeduction
          }]
        };
      });
    }
    setShowCancelConfirm(false);
    onBackToSelection();
  };
  if (!playerData) return null;
  const liveTitleConflict = !!workingTitle.trim() && hasTitleConflict;
  const hasRequiredPlanningSelection = isSeriesMode ? !!selectedSeriesGenre : !!selectedScriptId;
  const canStart = hasRequiredPlanningSelection && hasValidSeriesContinuationSelection && workingTitle.trim() && !hasTitleConflict && playerData.capital >= totalPlanningCost && (!playerData.activePlanning || initialContract && playerData.activePlanning.contract) && ageRating !== "";
  return /* @__PURE__ */ jsxs("div", { className: "relative w-[1000px] mx-auto", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleCancelClick,
        className: "absolute -top-12 left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors",
        children: [
          /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold uppercase", children: t.project.modeSelector.back })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-full bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-700", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-center mb-2 font-cinzel text-amber-400", children: getPageTitle() }),
        !isSeriesMode ? /* @__PURE__ */ jsx("p", { className: "text-center text-gray-300 mb-8", children: t.project.planning.subtitle }) : null,
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          isSeriesMode && /* @__PURE__ */ jsxs("div", { className: `grid gap-4 ${showSeriesContinuationSelect ? "grid-cols-2" : "grid-cols-1"}`, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "series-planning-type", className: "block text-sm font-medium text-gray-300 mb-1 text-center", children: t.project.planning.seriesPlanningType }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "series-planning-type",
                  value: seriesPlanningType,
                  onChange: (e) => setSeriesPlanningType(e.target.value),
                  className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-center font-bold",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "new", children: t.project.planning.seriesPlanningTypes.new }),
                    /* @__PURE__ */ jsx("option", { value: "continuation", children: t.project.planning.seriesPlanningTypes.continuation })
                  ]
                }
              )
            ] }),
            showSeriesContinuationSelect && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "series-continuation-select", className: "block text-sm font-medium text-gray-300 mb-1 text-center", children: t.project.planning.existingSeries }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "series-continuation-select",
                  value: selectedProducedSeriesTitle,
                  onChange: (e) => setSelectedProducedSeriesTitle(e.target.value),
                  className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-center font-bold",
                  disabled: producedSeriesOptions.length === 0,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: producedSeriesOptions.length === 0 ? t.project.planning.noProducedSeries : t.project.planning.existingSeriesSelect }),
                    producedSeriesOptions.map((seriesTitle) => /* @__PURE__ */ jsx("option", { value: seriesTitle, children: seriesTitle }, seriesTitle))
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "workingTitle", className: "block text-sm font-medium text-gray-300 mb-1 text-center", children: isSeriesMode ? t.project.planning.seriesName : t.project.planning.workingTitle }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "workingTitle",
                value: workingTitle,
                onChange: (e) => {
                  const nextTitle = e.target.value;
                  setWorkingTitle(nextTitle);
                  if (isSeriesMode) {
                    setSeriesName(nextTitle);
                  }
                },
                className: `w-full bg-gray-900 border rounded-md py-2 px-3 text-white text-center font-bold ${liveTitleConflict ? "border-red-500" : "border-gray-600"}`,
                disabled: !!initialContract
              }
            ),
            liveTitleConflict && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-center text-sm mt-2", children: t.project.planning.errorDuplicateTitle })
          ] }),
          isSeriesMode && /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/40 border border-gray-700 rounded-lg p-4 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold font-cinzel text-amber-300", children: t.project.planning.seriesSectionTitle }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: t.project.planning.seriesSectionSubtitle })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "episode-count", className: "block text-sm font-medium text-gray-300 mb-1", children: t.project.planning.episodeCount }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "episode-count",
                    type: "number",
                    min: "1",
                    max: "24",
                    value: episodeCount,
                    onChange: (e) => setEpisodeCount(Math.max(1, Number(e.target.value) || 1)),
                    className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "series-format", className: "block text-sm font-medium text-gray-300 mb-1", children: t.project.planning.seriesFormat }),
                /* @__PURE__ */ jsxs("select", { id: "series-format", value: seriesFormat, onChange: (e) => setSeriesFormat(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm", children: [
                  /* @__PURE__ */ jsx("option", { value: "short", children: t.project.planning.seriesFormats.short }),
                  /* @__PURE__ */ jsx("option", { value: "standard", children: t.project.planning.seriesFormats.standard }),
                  /* @__PURE__ */ jsx("option", { value: "prestige", children: t.project.planning.seriesFormats.prestige })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "narrative-format", className: "block text-sm font-medium text-gray-300 mb-1", children: t.project.planning.narrativeFormat }),
                /* @__PURE__ */ jsxs("select", { id: "narrative-format", value: narrativeFormat, onChange: (e) => setNarrativeFormat(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm", children: [
                  /* @__PURE__ */ jsx("option", { value: "episodic", children: t.project.planning.narrativeFormats.episodic }),
                  /* @__PURE__ */ jsx("option", { value: "serial", children: t.project.planning.narrativeFormats.serial })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "ensemble-size", className: "block text-sm font-medium text-gray-300 mb-1", children: t.project.planning.ensembleSize }),
                /* @__PURE__ */ jsx("select", { id: "ensemble-size", value: ensembleSize, onChange: (e) => setEnsembleSize(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm", children: availableSeriesEnsembleOptions.map(({ key, isUnlocked }) => /* @__PURE__ */ jsxs("option", { value: key, disabled: !isUnlocked, children: [
                  t.project.planning.ensembleSizes[key],
                  !isUnlocked ? " (Forschung)" : ""
                ] }, key)) }),
                nextSeriesEnsembleResearch && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-500 mt-1", children: [
                  t.project.planning.requiredResearch,
                  ": ",
                  t.research.techs[nextSeriesEnsembleResearch]?.name || RESEARCH_TECHS.find((tech) => tech.id === nextSeriesEnsembleResearch)?.name || nextSeriesEnsembleResearch
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "production-profile", className: "block text-sm font-medium text-gray-300 mb-1", children: t.project.planning.productionProfile }),
                /* @__PURE__ */ jsx("select", { id: "production-profile", value: productionProfile, onChange: (e) => setProductionProfile(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm", children: availableSeriesProductionProfiles.map(({ key, isUnlocked }) => /* @__PURE__ */ jsxs("option", { value: key, disabled: !isUnlocked, children: [
                  t.project.planning.productionProfiles[key],
                  !isUnlocked ? " (Forschung)" : ""
                ] }, key)) }),
                nextSeriesProfileResearch && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-500 mt-1", children: [
                  t.project.planning.requiredResearch,
                  ": ",
                  t.research.techs[nextSeriesProfileResearch]?.name || RESEARCH_TECHS.find((tech) => tech.id === nextSeriesProfileResearch)?.name || nextSeriesProfileResearch
                ] })
              ] })
            ] })
          ] }),
          showSequelSelect && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "sequel-select", className: "block text-sm font-medium text-gray-300 mb-1 text-center", children: sequelLabel }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "sequel-select",
                value: sequelParentTitle,
                onChange: (e) => {
                  const selectedTitle = e.target.value;
                  setSequelParentTitle(selectedTitle);
                  setWorkingTitle(generateTitleFromParent(selectedTitle));
                },
                className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-center font-bold",
                children: playerData.completedFilms.map((film) => /* @__PURE__ */ jsxs("option", { value: film.workingTitle, children: [
                  film.workingTitle,
                  " (",
                  t.genres[film.genre],
                  ")"
                ] }, film.workingTitle))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "script-select", className: "block text-sm font-medium text-gray-300 mb-1", children: isSeriesMode ? t.project.planning.genre : t.project.planning.script }),
              /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                /* @__PURE__ */ jsx("select", { id: "script-select", value: isSeriesMode ? selectedSeriesGenre : selectedScriptId, onChange: (e) => isSeriesMode ? setSelectedSeriesGenre(e.target.value) : setSelectedScriptId(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm", disabled: isSeriesMode ? !!initialContract : filteredScripts.length === 0, children: isSeriesMode ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  !initialContract ? /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: t.project.planning.genreSelect }) : null,
                  availableSeriesGenres.map((genre) => /* @__PURE__ */ jsx("option", { value: genre, children: t.genres[genre] }, genre))
                ] }) : filteredScripts.length > 0 ? filteredScripts.map((script) => /* @__PURE__ */ jsxs("option", { value: script.id, children: [
                  getTranslatedScriptTitle(script, t),
                  " (",
                  t.genres[script.genre],
                  ")"
                ] }, script.id)) : /* @__PURE__ */ jsx("option", { children: showSequelSelect || initialContract ? "Keine passenden Drehb\xFCcher" : t.project.planning.noScripts }) }),
                !isSeriesMode && filteredScripts.length === 0 && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10", children: [
                  showSequelSelect ? `Ben\xF6tigt Genre: ${sequelParent ? t.genres[sequelParent.genre] : ""}` : initialContract ? `Ben\xF6tigt Genre: ${t.genres[initialContract.genre]}` : t.project.planning.noScriptsHint,
                  /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" })
                ] })
              ] }),
              !isSeriesMode && selectedScript && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-gray-400", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-1", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    t.project.planning.quality,
                    ":"
                  ] }),
                  " ",
                  /* @__PURE__ */ jsx(StarRating, { rating: selectedScript.quality, size: "sm" })
                ] }),
                (selectedScript.mainRole || selectedScript.supportingRole) && /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-2 rounded border border-gray-600/50 mt-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500 uppercase font-bold mb-0.5", children: t.project.planning.castingSuggestions }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                    selectedScript.mainRole && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
                        t.project.planning.mainRole,
                        ":"
                      ] }),
                      /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
                        selectedScript.mainRole.gender === "m\xE4nnlich" ? t.newGame.male : t.newGame.female,
                        ", ",
                        getAgeLabel(selectedScript.mainRole.age, t)
                      ] })
                    ] }),
                    selectedScript.supportingRole && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
                        t.project.planning.supportingRole,
                        ":"
                      ] }),
                      /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
                        selectedScript.supportingRole.gender === "m\xE4nnlich" ? t.newGame.male : t.newGame.female,
                        ", ",
                        getAgeLabel(selectedScript.supportingRole.age, t)
                      ] })
                    ] })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "planner-select", className: "block text-sm font-medium text-gray-300 mb-1", children: t.project.saved.planner }),
                /* @__PURE__ */ jsx(
                  "select",
                  {
                    id: "planner-select",
                    value: selectedPlannerId || "",
                    onChange: (e) => setSelectedPlannerId(Number(e.target.value) || void 0),
                    className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm",
                    disabled: projectPlanners.length === 0,
                    children: projectPlanners.length > 0 ? projectPlanners.map((p) => /* @__PURE__ */ jsxs("option", { value: p.id, children: [
                      p.name,
                      " (Talent: ",
                      p.talent,
                      ")"
                    ] }, p.id)) : /* @__PURE__ */ jsx("option", { value: "", children: t.project.saved.noPlanner })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "age-rating", className: "block text-sm font-medium text-gray-300 mb-1", children: t.project.planning.ageRating }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "age-rating",
                    value: ageRating,
                    onChange: (e) => setAgeRating(e.target.value),
                    className: "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white text-sm",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: t.project.planning.selectRating }),
                      /* @__PURE__ */ jsx("option", { value: AgeRating.FSK0, children: t.project.planning.ratings[0] }),
                      /* @__PURE__ */ jsx("option", { value: AgeRating.FSK6, children: t.project.planning.ratings[6] }),
                      /* @__PURE__ */ jsx("option", { value: AgeRating.FSK12, children: t.project.planning.ratings[12] }),
                      /* @__PURE__ */ jsx("option", { value: AgeRating.FSK16, children: t.project.planning.ratings[16] }),
                      /* @__PURE__ */ jsx("option", { value: AgeRating.FSK18, children: t.project.planning.ratings[18] })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          !isSeriesMode && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: isSeriesMode ? t.project.planning.sizeSeries : t.project.planning.size }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: Object.entries(MOVIE_SIZE_CONFIG).map(([size, config]) => {
              const isUnlocked = !config.requiredTech || playerData.unlockedTechnologies.includes(config.requiredTech);
              const isSelected = selectedMovieSize === size;
              return /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      setSelectedMovieSize(size);
                      setBudgetStep(1);
                    },
                    disabled: !isUnlocked,
                    className: `w-full h-full p-3 rounded-md text-center transition-all duration-200 border-2
                                                    ${isSelected ? "border-amber-500 ring-2 ring-amber-500 bg-amber-500/10" : "border-gray-600 bg-gray-900"}
                                                    ${isUnlocked ? "hover:border-amber-500" : "opacity-40 cursor-not-allowed"}
                                                `,
                    children: /* @__PURE__ */ jsx("span", { className: "block font-bold text-sm", children: config.name })
                  }
                ),
                !isUnlocked && config.requiredTech && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10", children: [
                  t.project.planning.requiredResearch,
                  ": ",
                  RESEARCH_TECHS.find((t2) => t2.id === config.requiredTech)?.name || config.requiredTech,
                  /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" })
                ] })
              ] }, size);
            }) })
          ] }),
          !isSeriesMode && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: isSeriesMode ? t.project.planning.sizeBudgetSeries : t.project.planning.sizeBudget }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-3 rounded-md", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "range",
                    min: "0",
                    max: "2",
                    step: "1",
                    value: budgetStep,
                    onChange: (e) => setBudgetStep(Number(e.target.value)),
                    className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1 px-1", children: [
                  /* @__PURE__ */ jsx("span", { children: formatCurrency(selectedMovieSizeConfig.budgetSteps[0]) }),
                  /* @__PURE__ */ jsx("span", { children: formatCurrency(selectedMovieSizeConfig.budgetSteps[1]) }),
                  /* @__PURE__ */ jsx("span", { children: formatCurrency(selectedMovieSizeConfig.budgetSteps[2]) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 text-center", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-amber-400", children: formatCurrency(movieSizeBudget) }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 h-4", children: t.project.planning.budgetLevels[budgetStep] })
              ] })
            ] })
          ] }),
          isSeriesMode && /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-cyan-500/30 rounded-lg p-4 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-400 uppercase tracking-wide mb-2", children: t.project.planning.seriesSelectionCosts }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-cyan-200", children: formatCurrency(totalPlanningCost) })
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-center mt-4", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex justify-between items-center", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleCancelClick,
              className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm text-lg uppercase tracking-wider transform hover:bg-gray-500 transition-all duration-300 ease-in-out shadow-lg",
              children: t.common.cancel
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleStartProject,
              disabled: !canStart,
              className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm text-lg uppercase tracking-wider transform hover:bg-green-500 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed",
              children: t.project.planning.startPlanning
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gray-700 p-2 rounded-lg shadow-lg w-[316px]", children: /* @__PURE__ */ jsxs("div", { className: "relative w-[300px] h-[450px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700 mx-auto", children: [
          initialContract ? /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-black flex items-center justify-center relative overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center transform -rotate-45", children: /* @__PURE__ */ jsx("div", { className: "bg-amber-500 w-[200%] py-4 text-center shadow-lg", children: /* @__PURE__ */ jsx("span", { className: "text-black font-black text-2xl uppercase tracking-widest font-cinzel", children: t.project.modeSelector.contract }) }) }) }) : customCover ? /* @__PURE__ */ jsx("img", { src: customCover, alt: language === "de" ? "Eigenes Cover" : "Custom Cover", className: "w-full h-full object-cover" }) : selectedPosterGenre && maxCoverId > 0 ? /* @__PURE__ */ jsx(
            "img",
            {
              src: getCoverPath(selectedPosterGenre, selectedCoverId),
              alt: `Cover f\xFCr ${workingTitle}`,
              className: "w-full h-full object-cover",
              onError: (e) => {
                e.target.style.visibility = "hidden";
              }
            },
            `${selectedPosterGenre}-${selectedCoverId}`
          ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center text-gray-500", children: isCountingPosters ? language === "de" ? "Lade..." : "Loading..." : selectedPosterGenre ? language === "de" ? "Keine Poster gefunden" : "No posters found" : isSeriesMode ? language === "de" ? "Kein Genre ausgew\xE4hlt" : "No genre selected" : language === "de" ? "Kein Drehbuch ausgew\xE4hlt" : "No script selected" }),
          !initialContract && /* @__PURE__ */ jsx("div", { className: `absolute inset-0 flex flex-col pointer-events-none p-4 ${getPositionClass()}`, children: /* @__PURE__ */ jsx(
            "h3",
            {
              className: "text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]",
              style: { fontFamily: titleFontFamily, fontSize: `${titleFontSize}px`, lineHeight: 1.2, color: titleColor },
              children: displayTitleOnCover
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 p-3 rounded-lg border border-gray-600 space-y-2 w-[316px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded cursor-pointer text-xs mb-1", children: [
              language === "de" ? "Eigenes Cover hochladen" : "Upload Custom Cover",
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  onChange: handleCoverUpload,
                  className: "hidden",
                  ref: fileInputRef
                }
              )
            ] }),
            customCover && /* @__PURE__ */ jsx("button", { className: "text-xs text-red-400 underline", onClick: handleRemoveCustomCover, children: language === "de" ? "Eigenes Cover entfernen" : "Remove Custom Cover" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 mt-2", children: [
            /* @__PURE__ */ jsx("button", { onClick: handlePrevCover, disabled: isCountingPosters || maxCoverId <= 1 || !!customCover, className: "p-1 rounded-full text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase w-32 text-center truncate", children: customCover ? language === "de" ? "Eigenes Cover" : "Custom Cover" : isCountingPosters ? language === "de" ? "Z\xE4hle..." : "Counting..." : `${language === "de" ? "Poster" : "Poster"} ${maxCoverId > 0 ? selectedCoverId : 0} / ${maxCoverId}` }),
            /* @__PURE__ */ jsx("button", { onClick: handleNextCover, disabled: isCountingPosters || maxCoverId <= 1 || !!customCover, className: "p-1 rounded-full text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx("button", { onClick: handlePrevPosition, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase w-32 text-center truncate", title: "Titelposition", children: titlePosition }),
            /* @__PURE__ */ jsx("button", { onClick: handleNextPosition, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx("button", { onClick: handleDecreaseFontSize, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs uppercase w-32 text-center truncate", children: [
              t.project.planning.coverSize,
              ": ",
              titleFontSize
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: handleIncreaseFontSize, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx("button", { onClick: handlePrevFont, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-sm w-32 text-center truncate",
                style: { fontFamily: titleFontFamily },
                title: titleFontFamily,
                children: titleFontFamily
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: handleNextFont, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx("button", { onClick: handlePrevColor, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs uppercase w-32 text-center flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { children: t.project.planning.coverColor }),
              /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded-full border border-gray-400", style: { backgroundColor: titleColor } })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: handleNextColor, className: "p-1 rounded-full text-white hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-5 w-5" }) })
          ] })
        ] })
      ] })
    ] }),
    showStartConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.planning.confirmStartTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.planning.confirmStartText.replace("{title}", workingTitle).replace("{cost}", formatCurrency(totalPlanningCost)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowStartConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx("button", { onClick: confirmStartProject, className: "bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all", children: t.common.confirm })
      ] })
    ] }) }),
    showCancelConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: `bg-gray-800 border ${initialContract ? "border-red-500" : "border-amber-500"} rounded-lg shadow-2xl w-full max-w-lg p-8 text-center`, children: [
      /* @__PURE__ */ jsx("h2", { className: `text-3xl font-bold font-cinzel ${initialContract ? "text-red-400" : "text-amber-400"} mb-4`, children: initialContract ? t.project.planning.cancelContractTitle : t.project.planning.cancelConfirmTitle }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300 text-lg mb-6", children: [
        initialContract ? t.project.planning.cancelContractText.replace("{amount}", formatCurrency(initialContract.penalty)) : t.project.planning.cancelConfirmText,
        initialContract && /* @__PURE__ */ jsxs("span", { className: "block mt-4 text-red-300 font-bold", children: [
          "Zus\xE4tzlich wird der bereits erhaltene Vorschuss von ",
          formatCurrency(initialContract.upfrontPayment || 0),
          " zur\xFCckgefordert!"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowCancelConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.no }),
        /* @__PURE__ */ jsx("button", { onClick: initialContract ? handleConfirmCancel : onBackToSelection, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: initialContract ? t.project.planning.cancelContractYes : t.common.yes })
      ] })
    ] }) })
  ] });
};
var ProjectPlanningTab_default = ProjectPlanningTab;
export {
  ProjectPlanningTab_default as default
};
