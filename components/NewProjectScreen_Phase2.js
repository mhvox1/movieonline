import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { ProjectPhase, ActorAge, EmployeeType } from "../types";
import StarRating from "./StarRating";
import { useGame } from "../contexts/GameContext";
import TalentDossierModal, { getTalentPortraitUrl } from "./TalentDossierModal";
import StarIcon from "./icons/StarIcon";
import CircularStatusIndicator from "./CircularStatusIndicator";
import { CASTING_OPTIONS } from "./constants";
import { useTranslation } from "../hooks/useTranslation";
const PLAYER_TALENT_ID = -1;
const formatCurrency = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
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
const DEFAULT_CASTING_PREFERENCE = {
  gender: "any",
  age: "any",
  quality: "any"
};
const createPreferenceFromRole = (role) => ({
  gender: role?.gender ?? "any",
  age: role?.age ?? "any",
  quality: "any"
});
const createCastingPreferences = (project, script) => ({
  director: {
    ...DEFAULT_CASTING_PREFERENCE,
    ...project.castingPreferences?.director
  },
  mainActor: {
    ...createPreferenceFromRole(project.mainRole || script?.mainRole),
    ...project.castingPreferences?.mainActor
  },
  supportingActor: {
    ...createPreferenceFromRole(project.supportingRole || script?.supportingRole),
    ...project.castingPreferences?.supportingActor
  }
});
const getGenderPreferenceLabel = (gender, t) => {
  if (gender === "any") return t.project.casting.any;
  return gender === "m\xE4nnlich" ? t.newGame.male : t.newGame.female;
};
const getAgePreferenceLabel = (age, t) => {
  if (age === "any") return t.project.casting.any;
  return getAgeLabel(age, t);
};
const getQualityPreferenceLabel = (quality, t) => {
  switch (quality) {
    case "low":
      return t.project.casting.qualityLow;
    case "medium":
      return t.project.casting.qualityMedium;
    case "high":
      return t.project.casting.qualityHigh;
    case "top":
      return t.project.casting.qualityTop;
    default:
      return t.project.casting.any;
  }
};
const getAllowedQualityPreferences = (castingLevel) => {
  switch (castingLevel) {
    case 1:
      return ["low"];
    case 2:
      return ["low", "medium"];
    case 3:
    default:
      return ["low", "medium", "high", "top"];
  }
};
const normalizeQualityPreference = (quality, allowedQualities) => {
  if (quality === "any") return allowedQualities[allowedQualities.length - 1] || "low";
  if (allowedQualities.includes(quality)) return quality;
  return allowedQualities[allowedQualities.length - 1] || "low";
};
const RoleDisplay = ({ role, title, translation }) => /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-2 rounded-md text-center", children: [
  /* @__PURE__ */ jsx("h4", { className: "font-bold text-amber-300 text-sm", children: title }),
  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300", children: role.gender === "m\xE4nnlich" ? translation.newGame.male : translation.newGame.female }),
  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-400", children: getAgeLabel(role.age, translation) })
] });
const CastingPreferenceCard = ({ title, preference, recommendation, allowChildAge = true, allowedQualities, onChange }) => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold text-amber-300 text-sm", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500", children: recommendation ? `${t.project.casting.scriptSuggestion}: ${getGenderPreferenceLabel(recommendation.gender, t)}, ${getAgePreferenceLabel(recommendation.age, t)}` : t.project.casting.noScriptSuggestion })
      ] }),
      recommendation && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange({ ...preference, gender: recommendation.gender, age: recommendation.age }),
          className: "text-[10px] font-bold uppercase tracking-wide text-amber-300 hover:text-amber-200",
          children: t.project.casting.applySuggestion
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-[10px] text-gray-400", children: [
        /* @__PURE__ */ jsx("span", { className: "block mb-1", children: t.project.casting.gender }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: preference.gender,
            onChange: (e) => onChange({ ...preference, gender: e.target.value }),
            className: "w-full bg-gray-950 border border-gray-600 rounded-md p-1.5 text-white text-xs",
            children: [
              /* @__PURE__ */ jsx("option", { value: "any", children: t.project.casting.any }),
              /* @__PURE__ */ jsx("option", { value: "m\xE4nnlich", children: t.newGame.male }),
              /* @__PURE__ */ jsx("option", { value: "weiblich", children: t.newGame.female })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-[10px] text-gray-400", children: [
        /* @__PURE__ */ jsx("span", { className: "block mb-1", children: t.project.casting.age }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: preference.age,
            onChange: (e) => onChange({ ...preference, age: e.target.value }),
            className: "w-full bg-gray-950 border border-gray-600 rounded-md p-1.5 text-white text-xs",
            children: [
              /* @__PURE__ */ jsx("option", { value: "any", children: t.project.casting.any }),
              allowChildAge && /* @__PURE__ */ jsx("option", { value: ActorAge.Child, children: getAgeLabel(ActorAge.Child, t) }),
              /* @__PURE__ */ jsx("option", { value: ActorAge.Young, children: getAgeLabel(ActorAge.Young, t) }),
              /* @__PURE__ */ jsx("option", { value: ActorAge.MiddleAged, children: getAgeLabel(ActorAge.MiddleAged, t) }),
              /* @__PURE__ */ jsx("option", { value: ActorAge.Old, children: getAgeLabel(ActorAge.Old, t) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-[10px] text-gray-400", children: [
        /* @__PURE__ */ jsx("span", { className: "block mb-1", children: t.project.casting.quality }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: preference.quality,
            onChange: (e) => onChange({ ...preference, quality: e.target.value }),
            className: "w-full bg-gray-950 border border-gray-600 rounded-md p-1.5 text-white text-xs",
            children: allowedQualities.map((quality) => /* @__PURE__ */ jsx("option", { value: quality, children: getQualityPreferenceLabel(quality, t) }, quality))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-500", children: [
      t.project.casting.currentPreference,
      ": ",
      getGenderPreferenceLabel(preference.gender, t),
      ", ",
      getAgePreferenceLabel(preference.age, t),
      ", ",
      getQualityPreferenceLabel(preference.quality, t)
    ] })
  ] });
};
const CastingSetupView = ({ onStartCasting, onBack, project, setSelectedTalentInfo, onCancel }) => {
  const { playerData, setPlayerData } = useGame();
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedKnownDirectors, setSelectedKnownDirectors] = useState([]);
  const [selectedKnownActors, setSelectedKnownActors] = useState([]);
  const [knownTalentFilter, setKnownTalentFilter] = useState("all");
  const [knownTalentType, setKnownTalentType] = useState("directors");
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [selectedCasterId, setSelectedCasterId] = useState();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const castingMitarbeiter = useMemo(() => {
    if (!playerData) return [];
    return playerData.employees.filter((e) => e.type === EmployeeType.CastingMitarbeiter);
  }, [playerData]);
  const selectedOption = CASTING_OPTIONS.find((opt) => opt.level === selectedLevel);
  const script = useMemo(() => {
    if (!playerData || !project.scriptId) return null;
    return playerData.availableScripts.find((s) => s.id === project.scriptId);
  }, [playerData, project.scriptId]);
  const [castingPreferences, setCastingPreferences] = useState(() => createCastingPreferences(project, script));
  const mainRole = project.mainRole || script?.mainRole;
  const supportingRole = project.supportingRole || script?.supportingRole;
  if (!playerData) return null;
  const isTestMode = playerData.playerName === "Max Mustermann" && playerData.studioName === "Teststudio";
  const canAfford = playerData.capital >= selectedOption.cost;
  const allowedQualityPreferences = useMemo(() => getAllowedQualityPreferences(selectedLevel), [selectedLevel]);
  const talentSelectionLimit = useMemo(() => {
    if (selectedLevel === 1) return 4;
    if (selectedLevel === 2) return 7;
    if (selectedLevel === 3) return 10;
    return 0;
  }, [selectedLevel]);
  const handleToggleKnownDirector = (directorId) => {
    setSelectedKnownDirectors((prev) => {
      if (prev.includes(directorId)) {
        return prev.filter((id) => id !== directorId);
      }
      if (prev.length + selectedKnownActors.length < talentSelectionLimit) {
        return [...prev, directorId];
      }
      return prev;
    });
  };
  const handleToggleKnownActor = (actorId) => {
    setSelectedKnownActors((prev) => {
      if (prev.includes(actorId)) {
        return prev.filter((id) => id !== actorId);
      }
      if (prev.length + selectedKnownDirectors.length < talentSelectionLimit) {
        return [...prev, actorId];
      }
      return prev;
    });
  };
  const hasMinimumSkipSelection = selectedKnownDirectors.length > 0 && selectedKnownActors.length > 0;
  const handleSkipButtonClick = () => {
    if (!hasMinimumSkipSelection) return;
    setShowSkipConfirm(true);
  };
  const handleSkipCasting = () => {
    setPlayerData((prev) => {
      if (!prev) return null;
      const updatedProjects = prev.activeProjects.map(
        (p) => p.workingTitle === project.workingTitle ? {
          ...p,
          phase: ProjectPhase.CastingFinished,
          castingCost: 0,
          castingStartDate: new Date(prev.gameDate),
          castingEndDate: new Date(prev.gameDate),
          castingInvitedActors: [...selectedKnownDirectors, ...selectedKnownActors],
          castingDirectorPool: [],
          castingActorPool: []
        } : p
      );
      return {
        ...prev,
        activeProjects: updatedProjects
      };
    });
    setShowSkipConfirm(false);
  };
  useEffect(() => {
    const totalSelected2 = selectedKnownDirectors.length + selectedKnownActors.length;
    if (totalSelected2 > talentSelectionLimit) {
      let excess = totalSelected2 - talentSelectionLimit;
      if (selectedKnownActors.length > 0) {
        const actorTrim = Math.min(excess, selectedKnownActors.length);
        excess -= actorTrim;
        setSelectedKnownActors((prev) => prev.slice(0, prev.length - actorTrim));
      }
      if (excess > 0 && selectedKnownDirectors.length > 0) {
        setSelectedKnownDirectors((prev) => prev.slice(0, prev.length - excess));
      }
    }
  }, [talentSelectionLimit, selectedKnownDirectors.length, selectedKnownActors.length]);
  useEffect(() => {
    setCastingPreferences((prev) => ({
      director: {
        ...prev.director,
        quality: normalizeQualityPreference(prev.director.quality, allowedQualityPreferences)
      },
      mainActor: {
        ...prev.mainActor,
        quality: normalizeQualityPreference(prev.mainActor.quality, allowedQualityPreferences)
      },
      supportingActor: {
        ...prev.supportingActor,
        quality: normalizeQualityPreference(prev.supportingActor.quality, allowedQualityPreferences)
      }
    }));
  }, [allowedQualityPreferences]);
  const familyDirectors = useMemo(() => {
    const directors = [];
    if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === "Director") {
      const skill = playerData.partnerSkills.directing;
      directors.push({
        id: 99901,
        // Special ID range for family
        name: `${playerData.partnerName} (Partner)`,
        gender: playerData.partnerGender || "weiblich",
        birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
        skill,
        cost: 0,
        bekanntheit: 5,
        speedModifier: 1,
        favoriteGenres: [],
        hatedGenre: "",
        traits: [],
        experience: 0,
        potential: Math.min(100, skill + 20),
        loyalty: 100,
        moral: 100,
        isDiscovered: true,
        portraitUrl: playerData.partnerPortraitId,
        isFamily: true
      });
    }
    playerData.children.forEach((child, index) => {
      const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1e3 * 3600 * 24 * 365.25));
      if (age >= 18 && child.isEmployed && child.employedAs === "Director" && child.skills) {
        directors.push({
          id: 99910 + index,
          name: `${child.name} (Kind)`,
          gender: child.gender === "M\xE4dchen" ? "weiblich" : "m\xE4nnlich",
          birthDate: child.birthDate,
          skill: child.skills.directing,
          cost: 0,
          bekanntheit: 5,
          speedModifier: 1,
          favoriteGenres: [],
          hatedGenre: "",
          traits: [],
          experience: 0,
          potential: Math.min(100, child.skills.directing + 30),
          loyalty: 100,
          moral: 100,
          isDiscovered: true,
          portraitUrl: child.portraitId,
          isFamily: true
        });
      }
    });
    return directors;
  }, [playerData]);
  const familyActors = useMemo(() => {
    const actors = [];
    if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === "Actor") {
      const skill = playerData.partnerSkills.acting;
      actors.push({
        id: 99901,
        name: `${playerData.partnerName} (Partner)`,
        gender: playerData.partnerGender || "weiblich",
        birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
        skill,
        cost: 0,
        bekanntheit: 5,
        favoriteGenres: [],
        hatedGenre: "",
        traits: [],
        experience: 0,
        potential: Math.min(100, skill + 20),
        loyalty: 100,
        moral: 100,
        isDiscovered: true,
        portraitUrl: playerData.partnerPortraitId,
        isFamily: true
      });
    }
    playerData.children.forEach((child, index) => {
      const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1e3 * 3600 * 24 * 365.25));
      const isChildActor = age >= 12 && age < 18;
      const isAdultEmployedActor = age >= 18 && child.isEmployed && child.employedAs === "Actor";
      if ((isChildActor || isAdultEmployedActor) && child.skills) {
        actors.push({
          id: 99910 + index,
          name: `${child.name} (Kind)`,
          gender: child.gender === "M\xE4dchen" ? "weiblich" : "m\xE4nnlich",
          birthDate: child.birthDate,
          skill: child.skills.acting,
          cost: 0,
          bekanntheit: 5,
          favoriteGenres: [],
          hatedGenre: "",
          traits: [],
          experience: 0,
          potential: Math.min(100, child.skills.acting + 30),
          loyalty: 100,
          moral: 100,
          isDiscovered: true,
          portraitUrl: child.portraitId,
          isFamily: true
        });
      }
    });
    return actors;
  }, [playerData]);
  const availableDirectors = useMemo(() => {
    const regularDirectors = playerData.directors.filter(
      (d) => d.isDiscovered && (knownTalentFilter === "all" || d.isFavorite || d.contract?.type === "exclusive")
    );
    const combined = [...familyDirectors, ...regularDirectors];
    return combined.filter((d) => {
      const isUnavailable = d.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(d.unavailableForProjectsUntil);
      const isInTraining = !!d.activeTraining;
      const isBusyInOtherProject = playerData.activeProjects.some((p) => {
        if (p.workingTitle === project.workingTitle) return false;
        if (p.phase === ProjectPhase.Casting || p.phase === ProjectPhase.CastingFinished) {
          return p.castingInvitedActors?.includes(d.id);
        }
        if (p.phase === ProjectPhase.ProductionSetup || p.phase === ProjectPhase.Production) {
          return p.directorId === d.id;
        }
        return false;
      });
      return !isUnavailable && !isInTraining && !isBusyInOtherProject;
    }).sort((a, b) => b.skill - a.skill);
  }, [playerData.directors, knownTalentFilter, familyDirectors, playerData.gameDate, playerData.activeProjects, project.workingTitle]);
  const availableActors = useMemo(() => {
    const regularActors = playerData.actors.filter(
      (a) => a.isDiscovered && (knownTalentFilter === "all" || a.isFavorite || a.contract?.type === "exclusive")
    );
    const combined = [...familyActors, ...regularActors];
    return combined.filter((a) => {
      const isUnavailable = a.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(a.unavailableForProjectsUntil);
      const isInTraining = !!a.activeTraining;
      const isBusyInOtherProject = playerData.activeProjects.some((p) => {
        if (p.workingTitle === project.workingTitle) return false;
        if (p.phase === ProjectPhase.Casting || p.phase === ProjectPhase.CastingFinished) {
          return p.castingInvitedActors?.includes(a.id);
        }
        if (p.phase === ProjectPhase.ProductionSetup || p.phase === ProjectPhase.Production) {
          return p.mainActorId === a.id || p.supportingActorId === a.id;
        }
        return false;
      });
      return !isUnavailable && !isInTraining && !isBusyInOtherProject;
    }).sort((a, b) => b.skill - a.skill);
  }, [playerData.actors, knownTalentFilter, familyActors, playerData.gameDate, playerData.activeProjects, project.workingTitle]);
  const availableTalents = useMemo(() => {
    if (knownTalentType === "directors") {
      return availableDirectors.map((director) => ({ talent: director, type: "director" }));
    }
    return availableActors.map((actor) => ({ talent: actor, type: "actor" }));
  }, [availableActors, availableDirectors, knownTalentType]);
  const selectedCastingOption = CASTING_OPTIONS.find((option) => option.level === selectedLevel);
  const translatedSelectedOption = t.productionOptions.casting[`level${selectedCastingOption.level}`];
  const totalSelected = selectedKnownDirectors.length + selectedKnownActors.length;
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-2xl w-full max-w-6xl border border-gray-700 flex flex-col min-h-[640px]", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold font-cinzel text-amber-400 text-center mb-3", children: t.project.casting.setupTitle }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 flex-grow", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex flex-col h-[480px]", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-cinzel text-amber-400 mb-2", children: t.project.casting.inviteTalent }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [
          /* @__PURE__ */ jsxs("select", { value: knownTalentType, onChange: (e) => setKnownTalentType(e.target.value), className: "bg-gray-900 border border-gray-600 rounded-md p-1 text-white text-xs", children: [
            /* @__PURE__ */ jsx("option", { value: "directors", children: t.project.casting.directors }),
            /* @__PURE__ */ jsx("option", { value: "actors", children: t.project.casting.actors })
          ] }),
          /* @__PURE__ */ jsxs("select", { value: knownTalentFilter, onChange: (e) => setKnownTalentFilter(e.target.value), className: "bg-gray-900 border border-gray-600 rounded-md p-1 text-white text-xs", children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: t.project.casting.filterAll }),
            /* @__PURE__ */ jsx("option", { value: "favorites", children: t.project.casting.filterFavorites })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1 overflow-y-auto pr-1 flex-grow", children: availableTalents.map(({ talent, type }) => {
          const isDirector = type === "director";
          const isSelected = isDirector ? selectedKnownDirectors.includes(talent.id) : selectedKnownActors.includes(talent.id);
          const isDisabled = !isSelected && totalSelected >= talentSelectionLimit;
          const age = Math.max(0, Math.floor((new Date(playerData.gameDate).getTime() - new Date(talent.birthDate).getTime()) / (1e3 * 60 * 60 * 24 * 365.25)));
          const isFamily = !!talent.isFamily;
          const isExclusive = talent.contract?.type === "exclusive";
          let containerClass = "border-gray-700";
          if (isSelected) containerClass = "border-amber-500/50 bg-amber-900/30";
          else if (isFamily) containerClass = "border-purple-500/30 bg-purple-900/10";
          else if (isExclusive) containerClass = "border-green-500/50 bg-green-900/10";
          return /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${containerClass} ${isDisabled ? "opacity-50" : ""}`, children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => !isFamily && setSelectedTalentInfo(talent),
                className: `flex-grow flex items-center gap-2 text-left group disabled:cursor-not-allowed ${isFamily ? "cursor-default" : "cursor-pointer"}`,
                disabled: isDisabled,
                children: [
                  /* @__PURE__ */ jsx(CircularStatusIndicator, { portraitUrl: getTalentPortraitUrl(talent, playerData.gameDate), loyalty: talent.loyalty, moral: talent.moral, size: 36, isDirector }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-grow min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
                      /* @__PURE__ */ jsxs("p", { className: `font-bold truncate text-sm ${isFamily ? "text-purple-300" : isExclusive ? "text-green-300" : "text-white group-hover:text-amber-300"}`, title: `${talent.name}, ${age} ${t.talentDossier.years}`, children: [
                        talent.name,
                        ", ",
                        age
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 text-[10px] text-amber-400", children: [
                        /* @__PURE__ */ jsx(StarIcon, { className: "w-2.5 h-2.5" }),
                        /* @__PURE__ */ jsx("span", { className: "font-bold", children: talent.bekanntheit })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                      /* @__PURE__ */ jsx(StarRating, { rating: talent.skill, isRevealed: talent.bekanntheit >= 1, size: "sm" }),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-500 uppercase", children: isDirector ? t.project.casting.director : t.project.casting.actor })
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: isSelected, disabled: isDisabled, onChange: () => isDirector ? handleToggleKnownDirector(talent.id) : handleToggleKnownActor(talent.id), className: "h-4 w-4 rounded bg-gray-600 border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed" })
          ] }, `${type}-${talent.id}`);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 p-3 rounded-lg border border-gray-600", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-cinzel text-center text-amber-400 mb-2", children: t.project.casting.suggestions }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            mainRole ? /* @__PURE__ */ jsx(RoleDisplay, { role: mainRole, title: t.project.casting.mainActor, translation: t }) : /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-xs text-center col-span-2 bg-gray-800/50 p-1.5 rounded", children: t.project.casting.noSuggestions }),
            supportingRole && /* @__PURE__ */ jsx(RoleDisplay, { role: supportingRole, title: t.project.casting.supportingActor, translation: t })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "my-2 bg-gray-900 p-3 rounded-lg border border-gray-600", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-cinzel text-center text-amber-400 mb-1", children: t.project.casting.preferencesTitle }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-center text-gray-500 mb-3", children: t.project.casting.preferencesSubtitle }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(
              CastingPreferenceCard,
              {
                title: t.project.casting.director,
                preference: castingPreferences.director,
                allowChildAge: false,
                allowedQualities: allowedQualityPreferences,
                onChange: (preference) => setCastingPreferences((prev) => ({ ...prev, director: preference }))
              }
            ),
            /* @__PURE__ */ jsx(
              CastingPreferenceCard,
              {
                title: t.project.casting.mainActor,
                preference: castingPreferences.mainActor,
                recommendation: mainRole,
                allowedQualities: allowedQualityPreferences,
                onChange: (preference) => setCastingPreferences((prev) => ({ ...prev, mainActor: preference }))
              }
            ),
            /* @__PURE__ */ jsx(
              CastingPreferenceCard,
              {
                title: t.project.casting.supportingActor,
                preference: castingPreferences.supportingActor,
                recommendation: supportingRole,
                allowedQualities: allowedQualityPreferences,
                onChange: (preference) => setCastingPreferences((prev) => ({ ...prev, supportingActor: preference }))
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex flex-col min-h-[480px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 p-3 rounded-lg border border-gray-600", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "caster-select", className: "block text-xs font-medium text-gray-300 mb-1", children: t.project.casting.assignCaster }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "caster-select",
              value: selectedCasterId ?? "",
              onChange: (e) => setSelectedCasterId(e.target.value ? Number(e.target.value) : void 0),
              className: "w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-white text-sm",
              disabled: castingMitarbeiter.length === 0,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: t.project.casting.noStaff }),
                castingMitarbeiter.map((caster) => /* @__PURE__ */ jsxs("option", { value: caster.id, children: [
                  caster.name,
                  " (",
                  t.talentDossier.skill,
                  ": ",
                  caster.talent,
                  ")"
                ] }, caster.id))
              ]
            }
          ),
          castingMitarbeiter.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500 mt-1", children: t.project.casting.noStaffAvailable })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 p-3 rounded-lg border border-gray-600", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "casting-level-select", className: "block text-xs font-medium text-gray-300 mb-1", children: t.project.casting.castingMethod }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "casting-level-select",
              value: selectedLevel,
              onChange: (e) => setSelectedLevel(Number(e.target.value)),
              className: "w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-white text-sm",
              children: CASTING_OPTIONS.map((option) => {
                const translatedOption = t.productionOptions.casting[`level${option.level}`];
                return /* @__PURE__ */ jsx("option", { value: option.level, children: translatedOption?.name || option.name }, option.level);
              })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-white", children: translatedSelectedOption?.name || selectedCastingOption.name }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-400 leading-tight mt-1", children: translatedSelectedOption?.desc || selectedCastingOption.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] mt-2", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                t.project.casting.cost,
                " ",
                formatCurrency(selectedCastingOption.cost)
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                t.project.casting.duration,
                " ",
                isTestMode ? 5 : selectedCastingOption.duration,
                " ",
                t.project.casting.days
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-center mt-2", children: [
          t.project.casting.totalInvites,
          ": ",
          /* @__PURE__ */ jsxs("span", { className: totalSelected >= talentSelectionLimit ? "text-red-400" : "text-green-400", children: [
            totalSelected,
            " / ",
            talentSelectionLimit
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 pt-3 border-t border-gray-600 flex justify-end", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md mr-[50px] space-y-2", children: [
      !hasMinimumSkipSelection && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-[10px] text-right", children: t.project.casting.skipErrorNotEnough }),
      !canAfford && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-[10px] text-right", children: t.project.casting.insufficientFunds }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowDiscardConfirm(true),
            className: "min-w-[150px] bg-red-800/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-sm uppercase tracking-wider text-[10px] whitespace-nowrap transition-colors",
            children: t.project.progress.discard
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSkipButtonClick,
              disabled: !hasMinimumSkipSelection,
              className: "min-w-[150px] bg-amber-700/80 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-sm uppercase tracking-wider text-[10px] whitespace-nowrap border border-amber-600 disabled:bg-gray-700 disabled:text-gray-400 disabled:border-gray-600 disabled:cursor-not-allowed",
              children: t.project.casting.skipCasting
            }
          ),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowStartConfirm(true), disabled: !canAfford, className: "min-w-[150px] bg-green-600 text-white font-bold py-2 px-4 rounded-sm uppercase tracking-wider text-xs whitespace-nowrap hover:bg-green-500 disabled:bg-gray-600", children: t.project.casting.startCasting })
        ] })
      ] })
    ] }) }),
    showStartConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.casting.confirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.casting.confirmText }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowStartConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              onStartCasting(selectedLevel, [...selectedKnownDirectors, ...selectedKnownActors], castingPreferences, selectedCasterId);
              setShowStartConfirm(false);
            },
            className: "bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all",
            children: t.project.casting.startCasting
          }
        )
      ] })
    ] }) }),
    showSkipConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-600 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center border-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-500 mb-4", children: t.project.casting.skipConfirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.casting.skipConfirmText }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowSkipConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSkipCasting,
            className: "bg-amber-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-500 transition-all",
            children: t.common.yes
          }
        )
      ] })
    ] }) }),
    showDiscardConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.progress.discardConfirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.progress.discardConfirmText }),
      project.contract && /* @__PURE__ */ jsxs("div", { className: "bg-red-900/30 p-3 rounded border border-red-500/50 mb-6 text-left", children: [
        /* @__PURE__ */ jsx("p", { className: "text-red-400 font-bold text-sm mb-1 uppercase", children: language === "de" ? "Achtung: Vertragsstrafe & R\xFCckzahlung" : "Warning: Penalty & Repayment" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-300 text-xs", children: [
          language === "de" ? "Bei Abbruch wird die Vertragsstrafe von " : "If cancelled, the contractual penalty of ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(project.contract.penalty) }),
          language === "de" ? " sowie die R\xFCckzahlung des Vorschusses von " : " and the repayment of the advance of ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(project.contract.upfrontPayment || 0) }),
          language === "de" ? " sofort f\xE4llig." : " become due immediately."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowDiscardConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx("button", { onClick: onCancel, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.project.progress.discardConfirmYes })
      ] })
    ] }) })
  ] });
};
const TalentListItem = ({ talent, isSelected, onSelect, onShowInfo, isDisabled, disabledTooltip, type, gameDate, isNew, costModifier = 1 }) => {
  const hasExclusiveContract = talent.contract?.type === "exclusive";
  const isPlayer = talent.id === PLAYER_TALENT_ID;
  const isFamily = !!talent.isFamily;
  const { t } = useTranslation();
  let containerClasses = "flex items-center gap-2 p-1.5 rounded-md transition-colors";
  if (isDisabled) {
    containerClasses += " bg-red-900/50 ring-1 ring-red-700 opacity-70 cursor-not-allowed";
  } else if (isSelected) {
    containerClasses += " bg-amber-800/30 ring-1 ring-amber-600";
  } else if (hasExclusiveContract) {
    containerClasses += " bg-green-900/50 ring-1 ring-green-700";
  } else if (isFamily) {
    containerClasses += " bg-purple-900/50 ring-1 ring-purple-700";
  } else {
    containerClasses += " bg-gray-900/50";
  }
  const displayCost = talent.cost * costModifier;
  const costDisplay = isPlayer || hasExclusiveContract || isFamily ? /* @__PURE__ */ jsx("span", { className: "font-bold text-green-400", children: "Kostenlos" }) : /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-400", children: formatCurrency(displayCost) });
  const portraitUrl = getTalentPortraitUrl(talent, gameDate);
  const age = Math.max(0, Math.floor((new Date(gameDate).getTime() - new Date(talent.birthDate).getTime()) / (1e3 * 3600 * 24 * 365.25)));
  return /* @__PURE__ */ jsxs("div", { className: containerClasses, title: isDisabled ? disabledTooltip : "", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => !isFamily && onShowInfo(),
        disabled: isDisabled,
        className: `flex-grow bg-transparent p-0 text-left flex items-center gap-2 w-full disabled:cursor-not-allowed group ${isFamily ? "cursor-default" : "cursor-pointer"}`,
        children: [
          /* @__PURE__ */ jsx(
            CircularStatusIndicator,
            {
              portraitUrl,
              loyalty: talent.loyalty,
              moral: talent.moral,
              size: 36,
              isDirector: "speedModifier" in talent,
              isBusy: isDisabled
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-grow min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
              /* @__PURE__ */ jsxs("p", { className: `font-bold truncate text-sm ${isFamily ? "text-purple-300" : hasExclusiveContract ? "text-green-300" : "text-white group-hover:text-amber-300 transition-colors"}`, title: `${talent.name}, ${age} ${t.talentDossier.years}`, children: [
                talent.name,
                ", ",
                age
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 text-[10px] text-amber-400", title: `Bekanntheit: ${talent.bekanntheit}`, children: [
                /* @__PURE__ */ jsx(StarIcon, { className: "w-2.5 h-2.5" }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", children: talent.bekanntheit }),
                isNew && /* @__PURE__ */ jsx("span", { className: "ml-1 text-green-400 font-bold text-[9px]", children: t.common.new })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-0.5", children: [
              /* @__PURE__ */ jsx(StarRating, { rating: talent.skill, isRevealed: talent.bekanntheit >= 1, size: "sm" }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px]", children: costDisplay })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 pr-1", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "radio",
        name: `talent-select-${type}`,
        checked: isSelected,
        onChange: onSelect,
        disabled: isDisabled,
        className: "h-4 w-4 rounded-full bg-gray-600 border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed"
      }
    ) })
  ] });
};
const NewProjectScreen_Phase2 = ({ setGameState, onBack, gameSpeed, setGameSpeed, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language: language2 } = useTranslation();
  const locale = language2 === "de" ? "de-DE" : "en-US";
  if (!playerData) return null;
  const [selectedDirectorId, setSelectedDirectorId] = useState(project.directorId);
  const [selectedMainActorId, setSelectedMainActorId] = useState(project.mainActorId);
  const [selectedSupportingActorId, setSelectedSupportingActorId] = useState(project.supportingActorId);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [selectedTalentInfo, setSelectedTalentInfo] = useState(null);
  const [error, setError] = useState("");
  const [talentFilter, setTalentFilter] = useState("all");
  const newActorIds = useMemo(() => new Set((project.castingActorPool || []).map((a) => a.id)), [project.castingActorPool]);
  const newDirectorIds = useMemo(() => new Set((project.castingDirectorPool || []).map((d) => d.id)), [project.castingDirectorPool]);
  const invitedActorIds = useMemo(() => new Set(project.castingInvitedActors || []), [project.castingInvitedActors]);
  const familyDirectors = useMemo(() => {
    const directors = [];
    if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === "Director") {
      directors.push({
        id: 99901,
        name: `${playerData.partnerName} (Partner)`,
        gender: playerData.partnerGender || "weiblich",
        birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
        skill: playerData.partnerSkills.directing,
        cost: 0,
        bekanntheit: 5,
        speedModifier: 1,
        favoriteGenres: [],
        hatedGenre: "",
        traits: [],
        experience: 0,
        potential: Math.min(100, playerData.partnerSkills.directing + 20),
        loyalty: 100,
        moral: 100,
        isDiscovered: true,
        portraitUrl: playerData.partnerPortraitId,
        isFamily: true
      });
    }
    playerData.children.forEach((child, index) => {
      const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1e3 * 3600 * 24 * 365.25));
      if (age >= 18 && child.isEmployed && child.employedAs === "Director" && child.skills) {
        directors.push({
          id: 99910 + index,
          name: `${child.name} (Kind)`,
          gender: child.gender === "M\xE4dchen" ? "weiblich" : "m\xE4nnlich",
          birthDate: child.birthDate,
          skill: child.skills.directing,
          cost: 0,
          bekanntheit: 5,
          speedModifier: 1,
          favoriteGenres: [],
          hatedGenre: "",
          traits: [],
          experience: 0,
          potential: Math.min(100, child.skills.directing + 30),
          loyalty: 100,
          moral: 100,
          isDiscovered: true,
          portraitUrl: child.portraitId,
          isFamily: true
        });
      }
    });
    return directors;
  }, [playerData]);
  const familyActors = useMemo(() => {
    const actors = [];
    if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === "Actor") {
      actors.push({
        id: 99901,
        name: `${playerData.partnerName} (Partner)`,
        gender: playerData.partnerGender || "weiblich",
        birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
        skill: playerData.partnerSkills.acting,
        cost: 0,
        bekanntheit: 5,
        favoriteGenres: [],
        hatedGenre: "",
        traits: [],
        experience: 0,
        potential: Math.min(100, playerData.partnerSkills.acting + 20),
        loyalty: 100,
        moral: 100,
        isDiscovered: true,
        portraitUrl: playerData.partnerPortraitId,
        isFamily: true
      });
    }
    playerData.children.forEach((child, index) => {
      const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1e3 * 3600 * 24 * 365.25));
      const isChildActor = age >= 12 && age < 18;
      const isAdultEmployedActor = age >= 18 && child.isEmployed && child.employedAs === "Actor";
      if ((isChildActor || isAdultEmployedActor) && child.skills) {
        actors.push({
          id: 99910 + index,
          name: `${child.name} (Kind)`,
          gender: child.gender === "M\xE4dchen" ? "weiblich" : "m\xE4nnlich",
          birthDate: child.birthDate,
          skill: child.skills.acting,
          cost: 0,
          bekanntheit: 5,
          favoriteGenres: [],
          hatedGenre: "",
          traits: [],
          experience: 0,
          potential: Math.min(100, child.skills.acting + 30),
          loyalty: 100,
          moral: 100,
          isDiscovered: true,
          portraitUrl: child.portraitId,
          isFamily: true
        });
      }
    });
    return actors;
  }, [playerData]);
  const availableDirectorsForSelection = useMemo(() => {
    const uniqueDirectorsMap = /* @__PURE__ */ new Map();
    familyDirectors.forEach((d) => uniqueDirectorsMap.set(d.id, d));
    playerData.directors.forEach((d) => {
      if (invitedActorIds.has(d.id)) {
        uniqueDirectorsMap.set(d.id, d);
      }
    });
    if (project.castingDirectorPool) {
      project.castingDirectorPool.forEach((d) => uniqueDirectorsMap.set(d.id, d));
    }
    const allCandidates = Array.from(uniqueDirectorsMap.values());
    return allCandidates.filter((t2) => {
      if (t2.isFamily) return true;
      const isFilmingElsewhere = playerData.activeProjects.some(
        (p) => p.workingTitle !== project.workingTitle && (p.phase === ProjectPhase.Production || p.phase === ProjectPhase.PostProduction) && p.directorId === t2.id
      );
      if (isFilmingElsewhere) return false;
      if (t2.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(t2.unavailableForProjectsUntil)) return false;
      if (talentFilter === "favorites") {
        if (!t2.isFavorite) return false;
      }
      if (talentFilter === "exclusive") {
        if (t2.contract?.type !== "exclusive") return false;
      }
      return true;
    }).sort((a, b) => b.skill - a.skill);
  }, [playerData, project, talentFilter, familyDirectors, invitedActorIds]);
  const availableActorsForSelection = useMemo(() => {
    const uniqueActorsMap = /* @__PURE__ */ new Map();
    familyActors.forEach((a) => uniqueActorsMap.set(a.id, a));
    playerData.actors.forEach((a) => {
      if (invitedActorIds.has(a.id)) {
        uniqueActorsMap.set(a.id, a);
      }
    });
    if (project.castingActorPool) {
      project.castingActorPool.forEach((a) => uniqueActorsMap.set(a.id, a));
    }
    const allCandidates = Array.from(uniqueActorsMap.values());
    return allCandidates.filter((t2) => {
      if (t2.isFamily) return true;
      const isFilmingElsewhere = playerData.activeProjects.some(
        (p) => p.workingTitle !== project.workingTitle && (p.phase === ProjectPhase.Production || p.phase === ProjectPhase.PostProduction) && (p.mainActorId === t2.id || p.supportingActorId === t2.id)
      );
      if (isFilmingElsewhere) return false;
      if (t2.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(t2.unavailableForProjectsUntil)) return false;
      if (talentFilter === "favorites") {
        if (!t2.isFavorite) return false;
      }
      if (talentFilter === "exclusive") {
        if (t2.contract?.type !== "exclusive") return false;
      }
      return true;
    }).sort((a, b) => b.skill - a.skill);
  }, [playerData, project, talentFilter, familyActors, invitedActorIds]);
  const handleDiscardProject = () => {
    setPlayerData((prev) => {
      if (!prev) return null;
      const updatedActiveProjects = prev.activeProjects.filter((p) => p.workingTitle !== project.workingTitle);
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
      if (project.contract) {
        const penalty = project.contract.penalty;
        const upfront = project.contract.upfrontPayment || 0;
        const totalDeduction = penalty + upfront;
        newCapital -= totalDeduction;
        newTransactions.push({
          date: new Date(prev.gameDate),
          type: "Ausgabe",
          category: "Filmproduktion",
          description: language2 === "de" ? `Vertragsstrafe + R\xFCckzahlung Vorschuss: "${project.workingTitle}"` : `Contract penalty + advance repayment: "${project.workingTitle}"`,
          amount: totalDeduction
        });
        const formattedPenalty = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(penalty);
        const formattedUpfront = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(upfront);
        let subject = language2 === "de" ? `Vertragsbruch: ${project.workingTitle}` : `Breach of Contract: ${project.workingTitle}`;
        let body = `Sehr geehrte Damen und Herren,

wir mussten feststellen, dass die Produktion von "${project.workingTitle}" abgebrochen wurde.

Dies stellt einen Bruch unseres Produktionsvertrages dar. Gem\xE4\xDF der Vereinbarung wird die Vertragsstrafe in H\xF6he von ${formattedPenalty} sofort f\xE4llig.

Zus\xE4tzlich fordern wir den geleisteten Vorschuss in H\xF6he von ${formattedUpfront} zur\xFCck.

Der Gesamtbetrag wird Ihrem Konto belastet.

Mit freundlichen Gr\xFC\xDFen,
${project.contract.stationName}`;
        if (language2 !== "de") {
          subject = `Breach of Contract: ${project.workingTitle}`;
          body = `Dear Sir or Madam,

We have noted that the production of "${project.workingTitle}" has been cancelled.

This constitutes a breach of our agreement. The penalty fee of ${formattedPenalty} is now due.

Additionally, we demand the repayment of the advance of ${formattedUpfront}.

The total amount will be deducted from your account immediately.

Sincerely,
${project.contract.stationName}`;
        }
        newMessages.push({
          id: `msg_contract_fail_${Date.now()}`,
          date: new Date(prev.gameDate),
          sender: project.contract.stationName,
          subject,
          body,
          read: false
        });
      } else {
        const scriptExists = prev.availableScripts.some((s) => s.id === project.scriptId);
        if (project.scriptId && !scriptExists) {
          const restoredScript = {
            id: project.scriptId,
            title: project.scriptTitle || project.workingTitle,
            genre: project.genre,
            quality: project.scriptQuality,
            description: project.scriptDescription || (language2 === "de" ? "Beschreibung nicht verf\xFCgbar." : "Description not available."),
            price: project.scriptBudget,
            mainRole: project.mainRole,
            supportingRole: project.supportingRole,
            era: project.era,
            sourcePlotIndex: project.sourcePlotIndex,
            titleStructure: project.titleStructure
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
        pendingNotifications: prev.pendingNotifications?.filter((n) => n.title !== project.workingTitle)
      };
    });
    onBack();
  };
  const handleStartProduction = () => {
    if (!selectedDirectorId || !selectedMainActorId) {
      setError(t.project.casting.errorSelection);
      return;
    }
    setError("");
    const director = availableDirectorsForSelection.find((d) => d.id === selectedDirectorId);
    const mainActor = availableActorsForSelection.find((a) => a.id === selectedMainActorId);
    const supportingActor = availableActorsForSelection.find((a) => a.id === selectedSupportingActorId);
    const getGage = (t2, isSupporting = false) => {
      if (!t2 || t2.id === -1 || t2.contract || t2.isFamily) return 0;
      let cost = t2.cost;
      if (isSupporting) cost = Math.floor(cost * 0.5);
      return cost;
    };
    const directorGage = getGage(director);
    const mainActorGage = getGage(mainActor);
    const supportingActorGage = getGage(supportingActor, true);
    const totalTalentCost = directorGage + mainActorGage + supportingActorGage;
    if (playerData.capital < totalTalentCost) {
      setError(t.project.casting.errorFunds);
      return;
    }
    setPlayerData((prev) => {
      if (!prev) return null;
      let newLog = [...prev.transactionLog];
      if (directorGage > 0) newLog.push({ date: new Date(prev.gameDate), type: "Ausgabe", category: "Filmproduktion", description: `Gage: ${director.name}`, amount: directorGage });
      if (mainActorGage > 0) newLog.push({ date: new Date(prev.gameDate), type: "Ausgabe", category: "Filmproduktion", description: `Gage: ${mainActor.name}`, amount: mainActorGage });
      if (supportingActorGage > 0) newLog.push({ date: new Date(prev.gameDate), type: "Ausgabe", category: "Filmproduktion", description: `Gage: ${supportingActor.name}`, amount: supportingActorGage });
      let finalDirectors = [...prev.directors];
      let finalActors = [...prev.actors];
      [director, mainActor, supportingActor].filter(Boolean).forEach((talent) => {
        if (!talent || talent.id === -1 || talent.isFamily) return;
        const isDir = "speedModifier" in talent;
        if (isDir) {
          if (!finalDirectors.some((d) => d.id === talent.id)) finalDirectors.push(talent);
        } else {
          if (!finalActors.some((a) => a.id === talent.id)) finalActors.push(talent);
        }
      });
      const updatedProjects = prev.activeProjects.map((p) => {
        if (p.workingTitle === project.workingTitle) {
          return {
            ...p,
            phase: ProjectPhase.ProductionSetup,
            directorId: selectedDirectorId,
            directorGage,
            mainActorId: selectedMainActorId,
            mainActorGage,
            supportingActorId: selectedSupportingActorId,
            supportingActorGage,
            castingDirectorPool: void 0,
            castingActorPool: void 0
          };
        }
        return p;
      });
      return {
        ...prev,
        capital: prev.capital - totalTalentCost,
        transactionLog: newLog,
        directors: finalDirectors,
        actors: finalActors,
        activeProjects: updatedProjects
      };
    });
  };
  const handleStartCasting = (level, knownTalentIds, preferences, casterId) => {
    const option = CASTING_OPTIONS.find((opt) => opt.level === level);
    const cost = option.cost;
    const isTestMode = playerData.playerName === "Max Mustermann" && playerData.studioName === "Teststudio";
    setPlayerData((prev) => {
      if (!prev) return null;
      if (prev.capital < cost && !isTestMode) return prev;
      let duration = isTestMode ? 5 : option.duration;
      if (project.contract) {
        duration = Math.max(1, Math.round(duration * 0.66));
      }
      const endDate = new Date(prev.gameDate);
      endDate.setDate(endDate.getDate() + duration);
      const updatedProjects = prev.activeProjects.map((p) => {
        if (p.workingTitle === project.workingTitle) {
          return {
            ...p,
            phase: ProjectPhase.Casting,
            castingLevel: level,
            castingCost: cost,
            castingStartDate: new Date(prev.gameDate),
            castingEndDate: endDate,
            castingInvitedActors: knownTalentIds,
            castingPreferences: preferences
          };
        }
        return p;
      });
      const optionName = t.productionOptions.casting[`level${level}`]?.name || option.name;
      return {
        ...prev,
        capital: prev.capital - cost,
        activeProjects: updatedProjects,
        transactionLog: [...prev.transactionLog, { date: new Date(prev.gameDate), type: "Ausgabe", category: "Filmproduktion", description: `Casting: ${optionName}`, amount: cost }]
      };
    });
  };
  if (project.phase === ProjectPhase.CastingSetup || project.phase === ProjectPhase.ScriptFinished) {
    return /* @__PURE__ */ jsxs("div", { className: "h-full flex items-center justify-center", children: [
      selectedTalentInfo && /* @__PURE__ */ jsx(
        TalentDossierModal,
        {
          talent: selectedTalentInfo,
          onClose: () => setSelectedTalentInfo(null),
          talentList: [],
          onTalentChange: () => {
          }
        }
      ),
      /* @__PURE__ */ jsx(
        CastingSetupView,
        {
          project,
          onStartCasting: handleStartCasting,
          onBack,
          setSelectedTalentInfo,
          onCancel: handleDiscardProject
        }
      )
    ] });
  }
  if (project.phase === ProjectPhase.CastingFinished) {
    const selectedDirector = availableDirectorsForSelection.find((d) => d.id === selectedDirectorId);
    const selectedMainActor = availableActorsForSelection.find((a) => a.id === selectedMainActorId);
    const selectedSupportingActor = availableActorsForSelection.find((a) => a.id === selectedSupportingActorId);
    const getTalentCost = (talent, isSupporting = false) => {
      if (!talent || talent.id === PLAYER_TALENT_ID || talent.contract?.type === "exclusive" || talent.isFamily) return 0;
      return isSupporting ? Math.floor(talent.cost * 0.5) : talent.cost;
    };
    const talentCost = getTalentCost(selectedDirector) + getTalentCost(selectedMainActor) + getTalentCost(selectedSupportingActor, true);
    const bisherigeKosten = (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0);
    const neueGesamtkosten = bisherigeKosten + talentCost;
    return /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-80 backdrop-blur-sm p-6 rounded-lg shadow-2xl w-full max-w-7xl border border-gray-700 flex flex-col h-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center flex-shrink-0 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-48" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center flex-grow", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold font-cinzel text-amber-400", children: "Talentauswahl" }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-300", children: [
            project.workingTitle,
            " \u2022 ",
            t.genres[project.genre]
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-48 text-right", children: /* @__PURE__ */ jsxs("select", { value: talentFilter, onChange: (e) => setTalentFilter(e.target.value), className: "bg-gray-900 border border-gray-600 rounded-md p-1 text-white", children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: t.project.casting.filterAll }),
          /* @__PURE__ */ jsx("option", { value: "favorites", children: t.project.casting.filterFavorites }),
          /* @__PURE__ */ jsx("option", { value: "exclusive", children: t.project.casting.filterExclusive })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 overflow-hidden h-[480px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center border-b-2 border-amber-500/50 pb-2 mb-3 min-h-[72px]", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl xl:text-2xl font-bold font-cinzel text-amber-300 whitespace-nowrap", children: t.project.casting.director }),
            /* @__PURE__ */ jsx("div", { className: "h-5 mt-1 text-sm text-gray-400", "aria-hidden": "true" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 overflow-y-auto pr-2 flex-grow", children: availableDirectorsForSelection.map((dir) => /* @__PURE__ */ jsx(TalentListItem, { talent: dir, isSelected: selectedDirectorId === dir.id, onSelect: () => setSelectedDirectorId(dir.id), onShowInfo: () => setSelectedTalentInfo(dir), type: "director", gameDate: playerData.gameDate, isNew: newDirectorIds.has(dir.id) }, dir.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center border-b-2 border-amber-500/50 pb-2 mb-3 min-h-[72px]", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl xl:text-2xl font-bold font-cinzel text-amber-300 whitespace-nowrap", children: t.project.casting.mainActor }),
            /* @__PURE__ */ jsx("div", { className: "h-5 mt-1 text-sm text-gray-400", children: project.mainRole ? `(${project.mainRole.gender === "m\xE4nnlich" ? t.newGame.male : t.newGame.female}, ${getAgeLabel(project.mainRole.age, t)})` : "" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 overflow-y-auto pr-2 flex-grow", children: availableActorsForSelection.map((act) => /* @__PURE__ */ jsx(TalentListItem, { talent: act, isSelected: selectedMainActorId === act.id, onSelect: () => setSelectedMainActorId(act.id), onShowInfo: () => setSelectedTalentInfo(act), isDisabled: selectedSupportingActorId === act.id, disabledTooltip: `${act.name} ist bereits als Nebendarsteller ausgew\xE4hlt.`, type: "main_actor", gameDate: playerData.gameDate, isNew: newActorIds.has(act.id) }, act.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center border-b-2 border-amber-500/50 pb-2 mb-3 min-h-[72px]", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl xl:text-2xl font-bold font-cinzel text-amber-300 whitespace-nowrap", children: t.project.casting.supportingActor }),
            /* @__PURE__ */ jsx("div", { className: "h-5 mt-1 text-sm text-gray-400", children: project.supportingRole ? `(${project.supportingRole.gender === "m\xE4nnlich" ? t.newGame.male : t.newGame.female}, ${getAgeLabel(project.supportingRole.age, t)})` : "" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 overflow-y-auto pr-2 flex-grow", children: [
            /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 p-2 rounded-md transition-colors ${!selectedSupportingActorId ? "bg-amber-800/30 ring-1 ring-amber-600" : "bg-gray-900/50"}`, children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "no-support", className: "flex-grow font-bold text-white cursor-pointer px-3 py-4", children: t.project.casting.noSupport }),
              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 pr-2", children: /* @__PURE__ */ jsx("input", { id: "no-support", type: "radio", name: "talent-select-supporting_actor", checked: !selectedSupportingActorId, onChange: () => setSelectedSupportingActorId(void 0), className: "h-5 w-5 rounded-full bg-gray-600 border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer" }) })
            ] }),
            availableActorsForSelection.map((act) => /* @__PURE__ */ jsx(TalentListItem, { talent: act, isSelected: selectedSupportingActorId === act.id, onSelect: () => setSelectedSupportingActorId(act.id), onShowInfo: () => setSelectedTalentInfo(act), isDisabled: selectedMainActorId === act.id, disabledTooltip: `${act.name} ist bereits als Hauptdarsteller ausgew\xE4hlt.`, type: "supporting_actor", gameDate: playerData.gameDate, isNew: newActorIds.has(act.id), costModifier: 0.5 }, act.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-4 border-t border-gray-700 flex-shrink-0", children: [
        error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm text-center mb-2", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between w-64", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                t.project.casting.costs,
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: formatCurrency(bisherigeKosten) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between w-64", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                t.project.casting.gages,
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: formatCurrency(talentCost) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between w-64 border-t mt-1 pt-1 border-gray-600", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-base", children: [
                t.project.casting.total,
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-400 text-base", children: formatCurrency(neueGesamtkosten) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setShowDiscardConfirm(true), className: "bg-red-800 text-white font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider hover:bg-red-700", children: t.project.progress.discard }),
            /* @__PURE__ */ jsx("button", { onClick: handleStartProduction, className: "bg-amber-500 text-gray-900 font-bold py-3 px-8 rounded-sm text-lg uppercase tracking-wider hover:bg-amber-400", children: t.project.casting.toProduction })
          ] })
        ] })
      ] }),
      selectedTalentInfo && /* @__PURE__ */ jsx(
        TalentDossierModal,
        {
          talent: selectedTalentInfo,
          onClose: () => setSelectedTalentInfo(null),
          talentList: [...availableDirectorsForSelection, ...availableActorsForSelection],
          onTalentChange: (newTalent) => setSelectedTalentInfo(newTalent)
        }
      ),
      showDiscardConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.progress.discardConfirmTitle }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.progress.discardConfirmText }),
        project.contract && /* @__PURE__ */ jsxs("div", { className: "bg-red-900/30 p-3 rounded border border-red-500/50 mb-6 text-left", children: [
          /* @__PURE__ */ jsx("p", { className: "text-red-400 font-bold text-sm mb-1 uppercase", children: language2 === "de" ? "Achtung: Vertragsstrafe & R\xFCckzahlung" : "Warning: Penalty & Repayment" }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-300 text-xs", children: [
            language2 === "de" ? "Bei Abbruch wird die Vertragsstrafe von " : "If cancelled, the contractual penalty of ",
            /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(project.contract.penalty) }),
            language2 === "de" ? " sowie die R\xFCckzahlung des Vorschusses von " : " and the repayment of the advance of ",
            /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(project.contract.upfrontPayment || 0) }),
            language2 === "de" ? " sofort f\xE4llig." : " become due immediately."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setShowDiscardConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
          /* @__PURE__ */ jsx("button", { onClick: handleDiscardProject, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.project.progress.discardConfirmYes })
        ] })
      ] }) })
    ] });
  }
  if (showDiscardConfirm) {
    return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.progress.discardConfirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.progress.discardConfirmText }),
      project.contract && /* @__PURE__ */ jsxs("div", { className: "bg-red-900/30 p-3 rounded border border-red-500/50 mb-6 text-left", children: [
        /* @__PURE__ */ jsx("p", { className: "text-red-400 font-bold text-sm mb-1 uppercase", children: language2 === "de" ? "Achtung: Vertragsstrafe & R\xFCckzahlung" : "Warning: Penalty & Repayment" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-300 text-xs", children: [
          language2 === "de" ? "Bei Abbruch wird die Vertragsstrafe von " : "If cancelled, the contractual penalty of ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(project.contract.penalty) }),
          language2 === "de" ? " sowie die R\xFCckzahlung des Vorschusses von " : " and the repayment of the advance of ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(project.contract.upfrontPayment || 0) }),
          language2 === "de" ? " sofort f\xE4llig." : " become due immediately."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowDiscardConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx("button", { onClick: handleDiscardProject, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.project.progress.discardConfirmYes })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "text-white", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold mb-4", children: [
      'Lade Besetzung f\xFCr "',
      project.workingTitle,
      '"...'
    ] }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Ung\xFCltiger Projektstatus: ",
      project.phase
    ] })
  ] });
};
var NewProjectScreen_Phase2_default = NewProjectScreen_Phase2;
export {
  NewProjectScreen_Phase2_default as default
};
