import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { ProjectPhase, EmployeeType, ProjectType } from "../types";
import {
  LOCATION_OPTIONS,
  EXTRAS_OPTIONS,
  KAMERA_OPTIONS,
  LICHT_OPTIONS,
  TON_OPTIONS,
  AUSSTATTUNG_OPTIONS,
  SFX_OPTIONS,
  CATERING_OPTIONS,
  MOVIE_SIZE_CONFIG
} from "./constants";
import { useGame } from "../contexts/GameContext";
import KameraIcon from "./icons/KameraIcon";
import LightIcon from "./icons/LightIcon";
import SoundIcon from "./icons/SoundIcon";
import AusstattungIcon from "./icons/AusstattungIcon";
import LocationIcon from "./icons/LocationIcon";
import ExtrasIcon from "./icons/ExtrasIcon";
import SFXIcon from "./icons/SFXIcon";
import CateringIcon from "./icons/CateringIcon";
import StarIcon from "./icons/StarIcon";
import { useTranslation } from "../hooks/useTranslation";
import { getProductionDurationMultiplier } from "./studioBuildingEffects";
const formatCurrency = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
const FocusSlider = ({ label, value, onChange }) => /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-0.5", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-300", children: label }),
    /* @__PURE__ */ jsx("span", { className: "font-bold text-white text-xs", children: value })
  ] }),
  /* @__PURE__ */ jsx(
    "input",
    {
      type: "range",
      min: "0",
      max: "10",
      step: "1",
      value,
      onChange,
      className: "w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 block"
    }
  )
] });
const DepartmentCard = ({ option, isSelected, onSelect, unlocked, translatedName, translatedDesc, translation, departmentKey, discountFactor }) => {
  const starCount = option.level - 1;
  const isCatering = departmentKey === "catering";
  const finalCost = Math.round(option.cost * (1 - discountFactor));
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: onSelect,
      disabled: !unlocked,
      className: `p-3 rounded-lg border-2 text-left h-full flex flex-col transition-all duration-200 ${isSelected ? "border-amber-400 bg-amber-900/50" : "border-gray-600 hover:border-gray-500"} ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("h5", { className: "font-bold text-white", children: [
          option.level,
          ". ",
          translatedName || option.name
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1 flex-grow", children: translatedDesc || option.description }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs mt-2 pt-2 border-t border-gray-600/50 space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: translation.project.production.cardCost }),
            /* @__PURE__ */ jsxs("div", { children: [
              discountFactor > 0 && /* @__PURE__ */ jsx("span", { className: "line-through text-gray-500 mr-1", children: formatCurrency(option.cost) }),
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatCurrency(finalCost) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { children: isCatering ? translation.project.production.cardMoral : translation.project.production.cardQuality }),
            /* @__PURE__ */ jsxs("div", { className: "flex h-3 items-center", children: [
              Array.from({ length: starCount }).map((_, i) => /* @__PURE__ */ jsx(StarIcon, { className: "h-3 w-3 text-yellow-400" }, `filled-${i}`)),
              Array.from({ length: 4 - starCount }).map((_, i) => /* @__PURE__ */ jsx(StarIcon, { className: "h-3 w-3 text-gray-600" }, `empty-${i}`))
            ] })
          ] }),
          option.durationModifier !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: translation.project.production.cardDurationMod }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
              option.durationModifier,
              "x"
            ] })
          ] })
        ] })
      ]
    }
  );
};
const DepartmentSummaryCard = ({ department, onClick, translation, discountFactor }) => {
  const selectedOption = department.options.find((o) => o.level === department.level);
  const starCount = selectedOption.level - 1;
  const isCatering = department.translationKey === "catering";
  const finalCost = Math.round(selectedOption.cost * (1 - discountFactor));
  const deptKey = department.translationKey;
  const levelKey = `level${department.level}`;
  const optionTranslation = translation.productionOptions[deptKey]?.[levelKey];
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: "w-full bg-gray-900/50 p-2 h-24 rounded-lg border border-gray-700 hover:border-amber-500/50 transition-all duration-300 flex items-start",
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 w-full", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gray-800 p-1 rounded-md mt-1 flex-shrink-0", children: department.icon }),
        /* @__PURE__ */ jsxs("div", { className: "text-left flex-grow min-w-0", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-cinzel text-amber-300 text-base truncate", children: department.name }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300 whitespace-normal truncate", children: optionTranslation?.name || selectedOption.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right text-xs flex-shrink-0 space-y-1 w-28", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
            translation.project.production.cardCost,
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: formatCurrency(finalCost) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: isCatering ? translation.project.production.cardMoral : translation.project.production.cardQuality }),
            /* @__PURE__ */ jsxs("div", { className: "flex h-3 items-center", children: [
              Array.from({ length: starCount }).map((_, i) => /* @__PURE__ */ jsx(StarIcon, { className: "h-3 w-3 text-yellow-400" }, `filled-${i}`)),
              Array.from({ length: 4 - starCount }).map((_, i) => /* @__PURE__ */ jsx(StarIcon, { className: "h-3 w-3 text-gray-600" }, `empty-${i}`))
            ] })
          ] })
        ] })
      ] })
    }
  );
};
const NewProjectScreen_Phase3 = ({ setGameState, onBack, gameSpeed, setGameSpeed, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  if (!playerData || !setPlayerData || !project) return null;
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [kameraLevel, setKameraLevel] = useState(project.kameraLevel || 1);
  const [lichtLevel, setLichtLevel] = useState(project.lichtLevel || 1);
  const [tonLevel, setTonLevel] = useState(project.tonLevel || 1);
  const [ausstattungLevel, setAusstattungLevel] = useState(project.ausstattungLevel || 1);
  const [sfxLevel, setSfxLevel] = useState(project.sfxLevel || 1);
  const [cateringLevel, setCateringLevel] = useState(project.cateringLevel || 1);
  const [locationLevel, setLocationLevel] = useState(project.locationLevel || 1);
  const [extrasLevel, setExtrasLevel] = useState(project.extrasLevel || 1);
  const [focusAction, setFocusAction] = useState(project.focusAction || 0);
  const [focusHumor, setFocusHumor] = useState(project.focusHumor || 0);
  const [focusRomance, setFocusRomance] = useState(project.focusRomance || 0);
  const [focusDialogues, setFocusDialogues] = useState(project.focusDialogues || 0);
  const [focusViolence, setFocusViolence] = useState(project.focusViolence || 0);
  const [focusCostumes, setFocusCostumes] = useState(project.focusCostumes || 0);
  const [focusMakeup, setFocusMakeup] = useState(project.focusMakeup || 0);
  const [focusStunts, setFocusStunts] = useState(project.focusStunts || 0);
  const [error, setError] = useState("");
  const [showStartProductionConfirm, setShowStartProductionConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [weeklyProductionCost, setWeeklyProductionCost] = useState(0);
  const isTestMode = playerData.playerName === "Max Mustermann" && playerData.studioName === "Teststudio";
  const selectedDirector = useMemo(() => project.directorId === -1 ? { id: -1, name: playerData.playerName, cost: 0, speedModifier: 1, contract: void 0 } : playerData.directors.find((d) => d.id === project.directorId), [project.directorId, playerData.directors, playerData.playerName]);
  const plannerDiscount = useMemo(() => {
    if (!project.plannerId) return 0;
    let planner = playerData.employees.find((e) => e.id === project.plannerId);
    if (!planner) {
      if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.ProjektPlaner && project.plannerId === 99901) {
        planner = { talent: playerData.partnerSkills?.planning || 0, satisfaction: 100 };
      } else {
        const child = playerData.children.find((c) => {
          const index = project.plannerId - 99910;
          return playerData.children[index] === c;
        });
        if (child && child.isEmployed && child.employedAs === EmployeeType.ProjektPlaner && child.skills) {
          planner = { talent: child.skills.planning, satisfaction: 100 };
        }
      }
    }
    if (planner) {
      const effTalent = planner.talent * (planner.satisfaction / 100);
      return Math.min(0.2, effTalent / 500);
    }
    return 0;
  }, [project.plannerId, playerData]);
  const totalPoints = useMemo(() => {
    if (project.projectType === ProjectType.Series) {
      switch (project.seriesFormat) {
        case "short":
          return 8;
        case "prestige":
          return 12;
        case "standard":
        default:
          return 10;
      }
    }
    if (!project.movieSize || project.movieSizeBudget === void 0) return 0;
    const config = MOVIE_SIZE_CONFIG[project.movieSize];
    const budgetStep = config.budgetSteps.indexOf(project.movieSizeBudget);
    if (budgetStep !== -1 && config.focusPoints) {
      return config.focusPoints[budgetStep];
    }
    return 10;
  }, [project.movieSize, project.movieSizeBudget, project.projectType, project.seriesFormat]);
  const usedPoints = useMemo(() => {
    return focusAction + focusHumor + focusRomance + focusDialogues + focusViolence + focusCostumes + focusMakeup + focusStunts;
  }, [focusAction, focusHumor, focusRomance, focusDialogues, focusViolence, focusCostumes, focusMakeup, focusStunts]);
  const handleFocusChange = (setter, currentValue, newValue) => {
    const delta = newValue - currentValue;
    if (usedPoints + delta <= totalPoints) {
      setter(newValue);
    }
  };
  const { productionDepartmentCost, totalDuration, totalQualityBonus } = useMemo(() => {
    const departments2 = [
      { options: KAMERA_OPTIONS, level: kameraLevel },
      { options: LICHT_OPTIONS, level: lichtLevel },
      { options: TON_OPTIONS, level: tonLevel },
      { options: AUSSTATTUNG_OPTIONS, level: ausstattungLevel },
      { options: SFX_OPTIONS, level: sfxLevel },
      { options: CATERING_OPTIONS, level: cateringLevel },
      { options: LOCATION_OPTIONS, level: locationLevel },
      { options: EXTRAS_OPTIONS, level: extrasLevel }
    ];
    let cost = 0;
    let durationModifier = 1;
    let qualityBonus = 0;
    for (const dept of departments2) {
      const selectedOption = dept.options.find((o) => o.level === dept.level);
      if (selectedOption) {
        const discountedDeptCost = Math.round(selectedOption.cost * (1 - plannerDiscount));
        cost += discountedDeptCost;
        if (typeof selectedOption.durationModifier === "number") {
          durationModifier *= selectedOption.durationModifier;
        }
        if (typeof selectedOption.qualityBonus === "number") {
          qualityBonus += selectedOption.qualityBonus;
        }
      }
    }
    const estimatedQuality = project.projectPotential || project.scriptQuality || 50;
    let baseDuration = 40;
    if (estimatedQuality > 40) {
      baseDuration += (estimatedQuality - 40) * 1;
    }
    let finalProductionDuration = isTestMode ? 10 : Math.round(baseDuration * (selectedDirector?.speedModifier || 1) * durationModifier);
    if (project.contract) {
      finalProductionDuration = Math.max(5, Math.round(finalProductionDuration * 0.66));
    }
    return { productionDepartmentCost: cost, totalDuration: finalProductionDuration, totalQualityBonus: qualityBonus };
  }, [
    kameraLevel,
    lichtLevel,
    tonLevel,
    ausstattungLevel,
    sfxLevel,
    cateringLevel,
    locationLevel,
    extrasLevel,
    isTestMode,
    selectedDirector,
    project.projectPotential,
    project.scriptQuality,
    plannerDiscount,
    project.contract
  ]);
  const bisherigeKosten = useMemo(() => {
    return (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0) + (project.directorGage || 0) + (project.mainActorGage || 0) + (project.supportingActorGage || 0);
  }, [project]);
  const neueGesamtkosten = bisherigeKosten + productionDepartmentCost;
  useEffect(() => {
    if (neueGesamtkosten > 0) {
      const cost = Math.round(neueGesamtkosten * (4e-3 + Math.random() * 3e-3));
      setWeeklyProductionCost(cost);
    }
  }, [neueGesamtkosten]);
  const handleStartProduction = () => {
    if (playerData.capital < productionDepartmentCost && !isTestMode) {
      setError(t.project.casting.insufficientFunds);
      setShowStartProductionConfirm(false);
      return;
    }
    setError("");
    const startDate = new Date(playerData.gameDate);
    const endDate = new Date(playerData.gameDate);
    const adjustedDuration = Math.max(3, Math.round(totalDuration * getProductionDurationMultiplier(playerData)));
    endDate.setDate(endDate.getDate() + adjustedDuration);
    const totalProductionEvents = isTestMode ? 1 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3);
    let firstEventDate;
    if (adjustedDuration > 3) {
      const eventDay = isTestMode ? 2 : 3 + Math.floor(Math.random() * Math.max(1, adjustedDuration - 4));
      firstEventDate = new Date(startDate);
      firstEventDate.setDate(firstEventDate.getDate() + eventDay);
    }
    setPlayerData((prev) => {
      if (!prev) return null;
      const existingHype = project.hype || 0;
      let finalHype = existingHype;
      if (finalHype === 0) {
        const currentReputation = prev.reputation;
        const hypeVariance = Math.floor(Math.random() * 11) - 5;
        finalHype = Math.max(0, Math.min(100, currentReputation + hypeVariance));
      }
      const updatedProjects = prev.activeProjects.map((p) => {
        if (p.workingTitle === project.workingTitle) {
          return {
            ...p,
            phase: ProjectPhase.Production,
            kameraLevel,
            lichtLevel,
            tonLevel,
            ausstattungLevel,
            sfxLevel,
            cateringLevel,
            locationLevel,
            extrasLevel,
            focusAction,
            focusHumor,
            focusRomance,
            focusDialogues,
            focusViolence,
            focusCostumes,
            focusMakeup,
            focusStunts,
            productionCost: productionDepartmentCost,
            productionStartDate: startDate,
            productionEndDate: endDate,
            nextProductionEventDate: firstEventDate,
            totalProductionEvents,
            weeklyProductionCost,
            hype: finalHype,
            castingDirectorPool: void 0,
            castingActorPool: void 0,
            castingInvitedActors: void 0
          };
        }
        return p;
      });
      let newCurrentProject = prev.currentProject;
      if (prev.currentProject?.workingTitle === project.workingTitle) {
        newCurrentProject = updatedProjects.find((p) => p.workingTitle === project.workingTitle) || null;
      }
      return {
        ...prev,
        capital: prev.capital - productionDepartmentCost,
        activeProjects: updatedProjects,
        currentProject: newCurrentProject,
        transactionLog: [
          ...prev.transactionLog,
          {
            date: new Date(prev.gameDate),
            type: "Ausgabe",
            category: "Filmproduktion",
            description: `Produktionsstart: "${project.workingTitle}"`,
            descriptionKey: "productionStart",
            descriptionVars: { title: project.workingTitle },
            amount: productionDepartmentCost
          }
        ]
      };
    });
    setShowStartProductionConfirm(false);
    onBack();
  };
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
          description: language === "de" ? `Vertragsstrafe + R\xFCckzahlung Vorschuss: "${project.workingTitle}"` : `Contract penalty + advance repayment: "${project.workingTitle}"`,
          amount: totalDeduction
        });
        const formattedPenalty = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(penalty);
        const formattedUpfront = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(upfront);
        let subject = `Vertragsbruch: ${project.workingTitle}`;
        let body = `Sehr geehrte Damen und Herren,

wir mussten feststellen, dass die Produktion von "${project.workingTitle}" abgebrochen wurde.

Dies stellt einen Bruch unseres Produktionsvertrages dar. Gem\xE4\xDF der Vereinbarung wird die Vertragsstrafe in H\xF6he von ${formattedPenalty} sofort f\xE4llig.

Zus\xE4tzlich fordern wir den geleisteten Vorschuss in H\xF6he von ${formattedUpfront} zur\xFCck.

Der Gesamtbetrag wird Ihrem Konto belastet.

Mit freundlichen Gr\xFC\xDFen,
${project.contract.stationName}`;
        if (language !== "de") {
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
            description: project.scriptDescription || (language === "de" ? "Beschreibung nicht verf\xFCgbar." : "Description not available."),
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
  const departments = [
    { name: t.project.production.departments.camera, icon: /* @__PURE__ */ jsx(KameraIcon, { className: "h-6 w-6" }), level: kameraLevel, setLevel: setKameraLevel, options: KAMERA_OPTIONS, translationKey: "camera" },
    { name: t.project.production.departments.lighting, icon: /* @__PURE__ */ jsx(LightIcon, { className: "h-6 w-6" }), level: lichtLevel, setLevel: setLichtLevel, options: LICHT_OPTIONS, translationKey: "lighting" },
    { name: t.project.production.departments.sound, icon: /* @__PURE__ */ jsx(SoundIcon, { className: "h-6 w-6" }), level: tonLevel, setLevel: setTonLevel, options: TON_OPTIONS, translationKey: "sound" },
    { name: t.project.production.departments.set, icon: /* @__PURE__ */ jsx(AusstattungIcon, { className: "h-6 w-6" }), level: ausstattungLevel, setLevel: setAusstattungLevel, options: AUSSTATTUNG_OPTIONS, translationKey: "set" },
    { name: t.project.production.departments.sfx, icon: /* @__PURE__ */ jsx(SFXIcon, { className: "h-6 w-6" }), level: sfxLevel, setLevel: setSfxLevel, options: SFX_OPTIONS, translationKey: "sfx" },
    { name: t.project.production.departments.location, icon: /* @__PURE__ */ jsx(LocationIcon, { className: "h-6 w-6" }), level: locationLevel, setLevel: setLocationLevel, options: LOCATION_OPTIONS, translationKey: "location" },
    { name: t.project.production.departments.catering, icon: /* @__PURE__ */ jsx(CateringIcon, { className: "h-6 w-6" }), level: cateringLevel, setLevel: setCateringLevel, options: CATERING_OPTIONS, translationKey: "catering" },
    { name: t.project.production.departments.extras, icon: /* @__PURE__ */ jsx(ExtrasIcon, { className: "h-6 w-6" }), level: extrasLevel, setLevel: setExtrasLevel, options: EXTRAS_OPTIONS, translationKey: "extras" }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-2xl w-full max-w-7xl h-auto border border-gray-700 flex flex-col", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-bold text-center mb-6 font-cinzel text-amber-400", children: [
        t.project.production.boardTitle,
        ': "',
        project.workingTitle,
        '"'
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-6 overflow-hidden h-[480px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-span-4 bg-gray-900/50 p-4 rounded-lg border border-gray-600 overflow-hidden flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 flex justify-between items-center mb-4 border-b border-gray-700 pb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-amber-300", children: t.project.production.creativeFocus }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-white text-lg", children: t.genres[project.genre] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-grow flex flex-col justify-between py-1 min-h-0", children: [
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.action, value: focusAction, onChange: (e) => handleFocusChange(setFocusAction, focusAction, Number(e.target.value)) }),
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.humor, value: focusHumor, onChange: (e) => handleFocusChange(setFocusHumor, focusHumor, Number(e.target.value)) }),
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.romance, value: focusRomance, onChange: (e) => handleFocusChange(setFocusRomance, focusRomance, Number(e.target.value)) }),
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.dialogues, value: focusDialogues, onChange: (e) => handleFocusChange(setFocusDialogues, focusDialogues, Number(e.target.value)) }),
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.violence, value: focusViolence, onChange: (e) => handleFocusChange(setFocusViolence, focusViolence, Number(e.target.value)) }),
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.costumes, value: focusCostumes, onChange: (e) => handleFocusChange(setFocusCostumes, focusCostumes, Number(e.target.value)) }),
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.makeup, value: focusMakeup, onChange: (e) => handleFocusChange(setFocusMakeup, focusMakeup, Number(e.target.value)) }),
            /* @__PURE__ */ jsx(FocusSlider, { label: t.creativeFocus.stunts, value: focusStunts, onChange: (e) => handleFocusChange(setFocusStunts, focusStunts, Number(e.target.value)) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-4", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 text-center", children: language === "de" ? "Verteilen Sie Punkte basierend auf der Projektgr\xF6\xDFe." : "Distribute points based on project size." }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-span-8 overflow-y-auto pr-4", children: [
          plannerDiscount > 0 && /* @__PURE__ */ jsx("div", { className: "mb-4 bg-green-900/30 border border-green-500/50 p-2 rounded-lg text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-green-300 text-sm font-bold", children: [
            language === "de" ? "Projektplaner Bonus" : "Project Planner Bonus",
            ": ",
            Math.round(plannerDiscount * 100),
            "% ",
            language === "de" ? "Rabatt auf Produktionskosten" : "discount on production costs"
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: departments.map((dept) => /* @__PURE__ */ jsx(
            DepartmentSummaryCard,
            {
              department: dept,
              onClick: () => setEditingDepartment(dept),
              translation: t,
              discountFactor: plannerDiscount
            },
            dept.name
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 mt-6 pt-4 border-t-2 border-amber-500/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("div", {}),
          /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-8 text-lg", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
              t.project.production.estimatedDuration,
              ":"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
              totalDuration,
              " ",
              t.project.production.days
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
              t.project.production.prevCosts,
              ":"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: formatCurrency(bisherigeKosten) }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
              t.widgets.currentProject.totalCosts,
              ":"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-400", children: formatCurrency(productionDepartmentCost) }),
            /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-cinzel text-xl mt-2 border-t border-gray-600 pt-2", children: [
              t.project.production.newTotal,
              ":"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl mt-2 border-t border-gray-600 pt-2 text-white", children: formatCurrency(neueGesamtkosten) }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400 italic mt-1 col-span-2 text-right", children: [
              "(",
              t.project.production.weekly,
              ": ~",
              formatCurrency(weeklyProductionCost),
              ")"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setShowStartProductionConfirm(true), className: "w-96 bg-green-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider hover:bg-green-500", children: t.project.production.startFilming }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowDiscardConfirm(true),
                className: "w-96 bg-red-800/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-sm uppercase text-xs transition-colors",
                children: t.project.progress.discard
              }
            )
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm text-right mt-2 font-bold", children: error })
      ] })
    ] }),
    editingDepartment && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: () => setEditingDepartment(null), children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-5xl p-6", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-cinzel text-amber-400 text-center mb-4 flex items-center justify-center gap-3", children: [
        editingDepartment.icon,
        " ",
        editingDepartment.name
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3", children: editingDepartment.options.map((option) => {
        const unlocked = !option.requiredTechs || option.requiredTechs.every((t2) => playerData.unlockedTechnologies.includes(t2));
        const optionTranslation = t.productionOptions[editingDepartment.translationKey][`level${option.level}`];
        return /* @__PURE__ */ jsx(
          DepartmentCard,
          {
            option,
            isSelected: editingDepartment.level === option.level,
            unlocked,
            onSelect: () => {
              if (unlocked) {
                editingDepartment.setLevel(option.level);
                setEditingDepartment(null);
              }
            },
            translation: t,
            translatedName: optionTranslation?.name,
            translatedDesc: optionTranslation?.desc,
            departmentKey: editingDepartment.translationKey,
            discountFactor: plannerDiscount
          },
          option.level
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-6", children: /* @__PURE__ */ jsx("button", { onClick: () => setEditingDepartment(null), className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-sm uppercase", children: t.common.cancel }) })
    ] }) }),
    showStartProductionConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.production.confirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.production.confirmText.replace("{title}", project.workingTitle) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowStartProductionConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx("button", { onClick: handleStartProduction, className: "bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all", children: t.common.yes })
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
        /* @__PURE__ */ jsx("button", { onClick: handleDiscardProject, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.project.progress.discardConfirmYes })
      ] })
    ] }) })
  ] });
};
var NewProjectScreen_Phase3_default = NewProjectScreen_Phase3;
export {
  NewProjectScreen_Phase3_default as default
};
