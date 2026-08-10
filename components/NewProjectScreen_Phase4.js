import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useGame } from "../contexts/GameContext";
import { ProjectPhase } from "../types";
import { EDITING_OPTIONS, MUSIC_OPTIONS, SOUND_OPTIONS } from "./constants";
import { RESEARCH_TECHS } from "./research";
import SchnittIcon from "./icons/SchnittIcon";
import MusikIcon from "./icons/MusikIcon";
import SoundIcon from "./icons/SoundIcon";
import { useTranslation } from "../hooks/useTranslation";
import { getPostProductionDurationMultiplier } from "./studioBuildingEffects";
const DepartmentSummaryCard = ({ department, onClick, translation, formatCurrency }) => {
  const selectedOption = department.options.find((o) => o.level === department.level);
  const optionTranslation = translation.productionOptions[department.translationKey][`level${department.level}`];
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: "w-full bg-gray-900/50 p-3 h-24 rounded-lg border border-gray-700 hover:border-amber-500/50 transition-all duration-300 flex items-start",
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 w-full", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gray-800 p-2 rounded-md mt-1 flex-shrink-0", children: department.icon }),
        /* @__PURE__ */ jsxs("div", { className: "text-left flex-grow min-w-0", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-cinzel text-amber-300 text-base truncate", children: department.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 whitespace-normal truncate", children: optionTranslation?.name || selectedOption.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right text-xs flex-shrink-0 space-y-1 w-32", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
            translation.project.postProduction.cost,
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-mono text-white", children: formatCurrency(selectedOption.cost) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
            translation.project.postProduction.duration,
            " ",
            /* @__PURE__ */ jsxs("span", { className: "font-mono text-white", children: [
              selectedOption.duration,
              " ",
              translation.project.postProduction.days
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
            translation.project.postProduction.quality,
            ": ",
            /* @__PURE__ */ jsxs("span", { className: "font-mono text-white", children: [
              "+",
              selectedOption.qualityBonus
            ] })
          ] })
        ] })
      ] })
    }
  );
};
const DepartmentCard = ({ option, isSelected, onSelect, unlocked, translatedName, translatedDesc, translation, formatCurrency }) => {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: onSelect,
      disabled: !unlocked,
      className: `p-3 rounded-lg border-2 text-left h-full flex flex-col transition-all duration-200 ${isSelected ? "border-amber-400 bg-amber-900/50" : "border-gray-600 hover:border-gray-500"} ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`,
      children: [
        /* @__PURE__ */ jsx("h5", { className: "font-bold text-white", children: translatedName || option.name }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1 flex-grow", children: translatedDesc || option.description }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs mt-2 pt-2 border-t border-gray-600/50 space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: translation.project.postProduction.cost }),
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatCurrency(option.cost) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: translation.project.postProduction.duration }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
              option.duration,
              " ",
              translation.project.postProduction.days
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: translation.project.postProduction.qualityBonus }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
              "+",
              option.qualityBonus
            ] })
          ] })
        ] }),
        !unlocked && option.requiredTechs && /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-400 mt-1", children: [
          translation.project.postProduction.requires,
          " ",
          RESEARCH_TECHS.find((t) => t.id === option.requiredTechs[0])?.name
        ] })
      ]
    }
  );
};
const NewProjectScreen_Phase4 = ({ setGameState, onBack, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  if (!playerData || !project) {
    return /* @__PURE__ */ jsx("div", { className: "text-white", children: "Fehler: Kein aktives Projekt gefunden." });
  }
  const [editingLevel, setEditingLevel] = useState(project.editingLevel || 1);
  const [musicLevel, setMusicLevel] = useState(project.musicLevel || 1);
  const [soundLevel, setSoundLevel] = useState(project.soundLevel || 1);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const postProductionDepartments = [
    { name: t.project.postProduction.departments.editing, icon: /* @__PURE__ */ jsx(SchnittIcon, { className: "h-6 w-6" }), level: editingLevel, setLevel: setEditingLevel, options: EDITING_OPTIONS, translationKey: "editing" },
    { name: t.project.postProduction.departments.music, icon: /* @__PURE__ */ jsx(MusikIcon, { className: "h-6 w-6" }), level: musicLevel, setLevel: setMusicLevel, options: MUSIC_OPTIONS, translationKey: "music" },
    { name: t.project.postProduction.departments.sound, icon: /* @__PURE__ */ jsx(SoundIcon, { className: "h-6 w-6" }), level: soundLevel, setLevel: setSoundLevel, options: SOUND_OPTIONS, translationKey: "postSound" }
  ];
  const { totalCost: additionalCosts, totalDuration } = useMemo(() => {
    const editing = EDITING_OPTIONS.find((o) => o.level === editingLevel);
    const music = MUSIC_OPTIONS.find((o) => o.level === musicLevel);
    const sound = SOUND_OPTIONS.find((o) => o.level === soundLevel);
    const cost = editing.cost + music.cost + sound.cost;
    let duration = editing.duration + music.duration + sound.duration;
    if (project.contract) {
      duration = Math.max(5, Math.round(duration * 0.66));
    }
    return { totalCost: cost, totalDuration: duration };
  }, [editingLevel, musicLevel, soundLevel, project.contract]);
  const bisherigeKosten = useMemo(() => {
    if (!project) return 0;
    const fixedCosts = (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0) + (project.directorGage || 0) + (project.mainActorGage || 0) + (project.supportingActorGage || 0) + (project.productionCost || 0);
    const weeklyCostsTransactions = playerData.transactionLog.filter(
      (t2) => t2.category === "Filmproduktion" && (t2.descriptionKey === "weeklyProductionCosts" && t2.descriptionVars?.filmTitle === project.workingTitle || (t2.description.startsWith("W\xF6chentliche Fixkosten") || t2.description.startsWith("Weekly fixed costs")) && t2.description.includes(`"${project.workingTitle}"`))
    );
    const totalWeeklyCosts = weeklyCostsTransactions.reduce((sum, t2) => sum + t2.amount, 0);
    const productionEventTransactions = playerData.transactionLog.filter(
      (t2) => project.productionStartDate && t2.category === "Filmproduktion" && t2.type === "Ausgabe" && (t2.description.startsWith("Produktions-Event:") || t2.description.startsWith("Production Event:")) && new Date(t2.date) >= new Date(project.productionStartDate)
    );
    const totalProductionEventCosts = productionEventTransactions.reduce((sum, t2) => sum + t2.amount, 0);
    return fixedCosts + totalWeeklyCosts + totalProductionEventCosts;
  }, [project, playerData.transactionLog]);
  const totalFinalCost = bisherigeKosten + additionalCosts;
  const isTestMode = playerData.playerName === "Max Mustermann" && playerData.studioName === "Teststudio";
  const canAfford = playerData.capital >= additionalCosts || isTestMode;
  const handleStartPostProduction = () => {
    if (!canAfford) return;
    const startDate = new Date(playerData.gameDate);
    const endDate = new Date(playerData.gameDate);
    const finalDuration = isTestMode ? 5 : Math.max(3, Math.round(totalDuration * getPostProductionDurationMultiplier(playerData)));
    endDate.setDate(endDate.getDate() + finalDuration);
    setPlayerData((prev) => {
      if (!prev) return null;
      const updatedProjects = prev.activeProjects.map((p) => {
        if (p.workingTitle === project.workingTitle) {
          return {
            ...p,
            phase: ProjectPhase.PostProduction,
            editingLevel,
            musicLevel,
            soundLevel,
            postProductionCost: additionalCosts,
            postProductionStartDate: startDate,
            postProductionEndDate: endDate
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
        capital: prev.capital - additionalCosts,
        activeProjects: updatedProjects,
        currentProject: newCurrentProject,
        transactionLog: [
          ...prev.transactionLog,
          {
            date: new Date(prev.gameDate),
            type: "Ausgabe",
            category: "Filmproduktion",
            description: `Postproduktion: "${project.workingTitle}"`,
            descriptionKey: "postProductionStart",
            descriptionVars: { title: project.workingTitle },
            amount: additionalCosts
          }
        ]
      };
    });
    setShowStartConfirm(false);
    onBack();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-2xl w-full max-w-7xl h-auto border border-gray-700 flex flex-col", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-bold text-center mb-6 font-cinzel text-amber-400", children: [
        t.project.postProduction.suiteTitle,
        ': "',
        project.workingTitle,
        '"'
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-grow grid grid-cols-1 gap-6 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-3 gap-2", children: postProductionDepartments.map((dept) => /* @__PURE__ */ jsx(
        DepartmentSummaryCard,
        {
          department: dept,
          onClick: () => setEditingDepartment(dept),
          translation: t,
          formatCurrency
        },
        dept.name
      )) }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-6 pt-4 border-t-2 border-amber-500/50", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("div", {}),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-8 text-lg", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
              t.project.postProduction.additionalDuration,
              ":"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
              isTestMode ? 5 : totalDuration,
              " ",
              t.project.postProduction.days
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
              t.project.postProduction.previousCosts,
              ":"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: formatCurrency(bisherigeKosten) }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
              t.project.postProduction.additionalCosts,
              ":"
            ] }),
            /* @__PURE__ */ jsx("span", { className: `font-bold ${canAfford ? "text-white" : "text-red-500"}`, children: formatCurrency(additionalCosts) }),
            /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-cinzel text-xl mt-2 border-t border-gray-600 pt-2", children: [
              t.project.postProduction.totalCosts,
              ":"
            ] }),
            /* @__PURE__ */ jsx("span", { className: `font-bold text-2xl mt-2 border-t border-gray-600 pt-2 ${canAfford ? "text-amber-400" : "text-red-500"}`, children: formatCurrency(totalFinalCost) })
          ] }),
          !canAfford && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm text-right mt-1", children: t.project.casting.insufficientFunds })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowStartConfirm(true), disabled: !canAfford, className: "w-96 bg-green-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed", children: t.project.postProduction.startPost })
      ] }) })
    ] }),
    editingDepartment && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: () => setEditingDepartment(null), children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-5xl p-6", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-cinzel text-amber-400 text-center mb-4 flex items-center justify-center gap-3", children: [
        editingDepartment.icon,
        " ",
        editingDepartment.name
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3", children: editingDepartment.options.map((option) => {
        const unlocked = !option.requiredTechs || option.requiredTechs.every((techId) => playerData.unlockedTechnologies.includes(techId));
        const optionTranslation = t.productionOptions[editingDepartment.translationKey][`level${option.level}`];
        return /* @__PURE__ */ jsx(
          DepartmentCard,
          {
            option,
            isSelected: editingDepartment.level === option.level,
            unlocked,
            translatedName: optionTranslation?.name,
            translatedDesc: optionTranslation?.desc,
            onSelect: () => {
              if (unlocked) {
                editingDepartment.setLevel(option.level);
                setEditingDepartment(null);
              }
            },
            translation: t,
            formatCurrency
          },
          option.level
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-6", children: /* @__PURE__ */ jsx("button", { onClick: () => setEditingDepartment(null), className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-sm uppercase", children: t.common.cancel }) })
    ] }) }),
    showStartConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.postProduction.confirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.postProduction.confirmText.replace("{title}", project.workingTitle) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowStartConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx("button", { onClick: handleStartPostProduction, className: "bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all", children: t.common.yes })
      ] })
    ] }) })
  ] });
};
var NewProjectScreen_Phase4_default = NewProjectScreen_Phase4;
export {
  NewProjectScreen_Phase4_default as default
};
