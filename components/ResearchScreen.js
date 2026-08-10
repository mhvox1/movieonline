import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useRef } from "react";
import { ResearchTree, BuildingType, EmployeeType } from "../types";
import { RESEARCH_TECHS } from "./research";
import { BUILDING_DATA } from "./buildings";
import GameHeader from "./GameHeader";
import { useGame } from "../contexts/GameContext";
import { researchBackgroundImage } from "./backgrounds/ResearchBackgroundImage";
import ResearchNode, { NODE_WIDTH, NODE_HEIGHT, GRID_GAP_X, GRID_GAP_Y, PADDING } from "./ResearchNode";
import DrehbuchIcon from "./icons/DrehbuchIcon";
import ProduktionIcon from "./icons/ProduktionIcon";
import OfficeIcon from "./icons/OfficeIcon";
import NeuesProjektIcon from "./icons/NeuesProjektIcon";
import MarketingIcon from "./icons/MarketingIcon";
import { useTranslation } from "../hooks/useTranslation";
const ConnectionLine = ({ start, end, active }) => {
  const startX = start.x * (NODE_WIDTH + GRID_GAP_X) + PADDING + NODE_WIDTH;
  const startY = start.y * (NODE_HEIGHT + GRID_GAP_Y) + PADDING + NODE_HEIGHT / 2;
  const endX = end.x * (NODE_WIDTH + GRID_GAP_X) + PADDING;
  const endY = end.y * (NODE_HEIGHT + GRID_GAP_Y) + PADDING + NODE_HEIGHT / 2;
  const controlPoint1X = startX + GRID_GAP_X / 2;
  const controlPoint1Y = startY;
  const controlPoint2X = endX - GRID_GAP_X / 2;
  const controlPoint2Y = endY;
  const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
  return /* @__PURE__ */ jsx(
    "path",
    {
      d: pathData,
      stroke: active ? "#10b981" : "#9ca3af",
      strokeWidth: "2",
      fill: "none",
      className: "transition-colors duration-500 drop-shadow-md"
    }
  );
};
const SidebarButton = ({ title, description, icon, isActive, onClick }) => {
  const activeClasses = "border-amber-500 ring-2 ring-amber-500 bg-gray-700/50";
  const defaultClasses = "border-gray-700 hover:border-amber-500/50 hover:-translate-y-1";
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: `bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
        /* @__PURE__ */ jsx("div", { className: `bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && "bg-amber-500"}`, children: icon }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: `text-md font-bold font-cinzel ${isActive ? "text-amber-300" : "text-amber-400"} group-hover:text-amber-300 transition-colors`, children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300 mt-1", children: description })
        ] })
      ] })
    }
  );
};
const ResearchScreen = ({ onBack, gameSpeed, setGameSpeed }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState(ResearchTree.Vorproduktion);
  const [selectedTech, setSelectedTech] = useState(null);
  const containerRef = useRef(null);
  if (!playerData || !setPlayerData) return null;
  const researchLab = playerData.buildings.find((b) => b.type === BuildingType.ResearchLab && b.level > 0);
  const canResearch = !!researchLab;
  const isTestMode = playerData.playerName === "Max Mustermann" && playerData.studioName === "Teststudio";
  const formatCurrency = (value) => new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  const researchPointsPerDay = useMemo(() => {
    let points = 0;
    if (researchLab) {
      points = 1;
      const labData = BUILDING_DATA[BuildingType.ResearchLab].levels[researchLab.level - 1];
      if (labData?.bonusEffect?.researchPointsPerDay) {
        points = labData.bonusEffect.researchPointsPerDay;
      }
      let totalResearcherTalent = 0;
      playerData.employees.filter((e) => e.type === EmployeeType.Forscher).forEach((e) => totalResearcherTalent += e.talent);
      if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Forscher && playerData.partnerSkills) {
        totalResearcherTalent += playerData.partnerSkills.research;
      }
      playerData.children.forEach((c) => {
        if (c.isEmployed && c.employedAs === EmployeeType.Forscher && c.skills) {
          totalResearcherTalent += c.skills.research;
        }
      });
      points += Math.floor(totalResearcherTalent / 25);
    }
    return points;
  }, [playerData, researchLab]);
  const currentTreeTechs = useMemo(() => {
    return RESEARCH_TECHS.filter((t2) => t2.tree === activeTab);
  }, [activeTab]);
  const getTechStatus = (tech) => {
    if (playerData.unlockedTechnologies.includes(tech.id)) return "researched";
    if (playerData.activeResearch?.techId === tech.id) return "researching";
    const dependenciesMet = tech.dependencies.every((depId) => playerData.unlockedTechnologies.includes(depId));
    if (!dependenciesMet) return "locked";
    return "available";
  };
  const getRemainingResearchPoints = (tech) => {
    if (playerData.activeResearch?.techId === tech.id) {
      return Math.max(0, playerData.activeResearch.requiredPoints - playerData.activeResearch.progressPoints);
    }
    return tech.cost;
  };
  const containerSize = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    currentTreeTechs.forEach((t2) => {
      if (t2.position) {
        if (t2.position.x > maxX) maxX = t2.position.x;
        if (t2.position.y > maxY) maxY = t2.position.y;
      }
    });
    return {
      width: (maxX + 1) * (NODE_WIDTH + GRID_GAP_X) + PADDING * 2,
      height: (maxY + 1) * (NODE_HEIGHT + GRID_GAP_Y) + PADDING * 2
    };
  }, [currentTreeTechs]);
  const handleStartResearch = (tech) => {
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
    const newActiveResearch = {
      techId: tech.id,
      startDate,
      endDate,
      requiredPoints: tech.cost,
      progressPoints: 0
    };
    setPlayerData((prev) => {
      if (!prev) return null;
      const newTransactions = [...prev.transactionLog];
      const techName = t.research.techs[tech.id]?.name || tech.name;
      if (cost > 0) {
        newTransactions.push({
          date: new Date(prev.gameDate),
          type: "Ausgabe",
          category: "Forschung",
          description: `${t.research.screen.title}: ${techName}`,
          amount: cost
        });
      }
      return {
        ...prev,
        capital: prev.capital - cost,
        activeResearch: newActiveResearch,
        transactionLog: newTransactions
      };
    });
    setSelectedTech(null);
  };
  const tabs = [
    { id: ResearchTree.Vorproduktion, label: t.research.screen.tabs.preproduction, icon: /* @__PURE__ */ jsx(NeuesProjektIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), description: t.research.screen.tabs.preproductionDesc },
    { id: ResearchTree.Genres, label: t.research.screen.tabs.genres, icon: /* @__PURE__ */ jsx(DrehbuchIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), description: t.research.screen.tabs.genresDesc },
    { id: ResearchTree.Production, label: t.research.screen.tabs.production, icon: /* @__PURE__ */ jsx(ProduktionIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), description: t.research.screen.tabs.productionDesc },
    { id: ResearchTree.Marketing, label: t.research.screen.tabs.marketing, icon: /* @__PURE__ */ jsx(MarketingIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), description: t.research.screen.tabs.marketingDesc },
    { id: ResearchTree.Management, label: t.research.screen.tabs.management, icon: /* @__PURE__ */ jsx(OfficeIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), description: t.research.screen.tabs.managementDesc }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-full bg-cover bg-center flex flex-col", style: { backgroundImage: `url(${researchBackgroundImage})` }, children: [
    /* @__PURE__ */ jsx(GameHeader, { gameSpeed, setGameSpeed, disabled: true }),
    /* @__PURE__ */ jsxs("div", { className: "flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("aside", { className: "w-80 flex-shrink-0 bg-black bg-opacity-60 backdrop-blur-md border-r border-gray-700 flex flex-col", children: [
        /* @__PURE__ */ jsxs("header", { className: "p-6 border-b border-gray-700", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold font-cinzel text-amber-400", children: t.research.screen.title }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 bg-gray-900/50 p-3 rounded-lg border border-amber-500/30 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider", children: t.research.screen.researchPoints }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-amber-400", children: researchPointsPerDay }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: t.research.screen.pointsPerDay.replace("{points}", researchPointsPerDay.toString()) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "flex-grow p-4 space-y-4 overflow-y-auto", children: tabs.map((tab) => /* @__PURE__ */ jsx(
          SidebarButton,
          {
            title: tab.label,
            description: tab.description,
            icon: tab.icon,
            isActive: activeTab === tab.id,
            onClick: () => setActiveTab(tab.id)
          },
          tab.id
        )) }),
        /* @__PURE__ */ jsx("footer", { className: "p-4 border-t border-gray-700", children: /* @__PURE__ */ jsx("button", { onClick: onBack, className: "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase", children: t.research.screen.backToMain }) })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-grow relative bg-black/30 backdrop-blur-sm overflow-hidden", ref: containerRef, children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 pointer-events-none opacity-30",
            style: {
              backgroundImage: "linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }
          }
        ),
        canResearch ? /* @__PURE__ */ jsx("div", { className: "w-full h-full overflow-auto custom-scrollbar", children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative",
            style: { width: Math.max(containerSize.width, 1200), height: Math.max(containerSize.height, 800) },
            children: [
              /* @__PURE__ */ jsx("svg", { className: "absolute inset-0 w-full h-full pointer-events-none", children: currentTreeTechs.map((tech) => tech.dependencies.map((depId) => {
                const parent = currentTreeTechs.find((p) => p.id === depId);
                if (parent && parent.position && tech.position) {
                  const isActive = playerData.unlockedTechnologies.includes(parent.id);
                  return /* @__PURE__ */ jsx(
                    ConnectionLine,
                    {
                      start: parent.position,
                      end: tech.position,
                      active: isActive
                    },
                    `${parent.id}-${tech.id}`
                  );
                }
                return null;
              })) }),
              currentTreeTechs.map((tech) => /* @__PURE__ */ jsx(
                ResearchNode,
                {
                  tech,
                  status: getTechStatus(tech),
                  onClick: () => setSelectedTech(tech)
                },
                tech.id
              ))
            ]
          }
        ) }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-20", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-90 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700 text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.research.screen.lockedTitle }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 mb-6", children: t.research.screen.lockedDesc }),
          /* @__PURE__ */ jsx("div", { className: "text-left max-w-sm mx-auto space-y-2", children: /* @__PURE__ */ jsxs("p", { className: `flex items-center gap-2 ${researchLab ? "text-green-400" : "text-red-400"}`, children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: researchLab ? "\u2713" : "\u2717" }),
            /* @__PURE__ */ jsx("span", { children: t.research.screen.reqLab })
          ] }) })
        ] }) })
      ] })
    ] }),
    selectedTech && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", onClick: () => setSelectedTech(null), children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500/50 rounded-lg shadow-2xl w-full max-w-md p-6", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-start gap-4 mb-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold font-cinzel text-amber-400 leading-none", children: t.research.techs[selectedTech.id]?.name || selectedTech.name }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1 uppercase tracking-wider", children: activeTab })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 mb-6 text-sm leading-relaxed", children: t.research.techs[selectedTech.id]?.description || selectedTech.description }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 rounded-lg p-4 mb-6 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-gray-700 pb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: t.research.screen.modal.costPoints }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
            selectedTech.cost,
            " FP"
          ] })
        ] }),
        selectedTech.monetaryCost && /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-gray-700 pb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: t.research.screen.modal.costCapital }),
          /* @__PURE__ */ jsx("span", { className: `font-bold ${playerData.capital >= (selectedTech.monetaryCost || 0) ? "text-white" : "text-red-400"}`, children: formatCurrency(selectedTech.monetaryCost) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: t.research.screen.modal.remainingPoints }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
            getRemainingResearchPoints(selectedTech),
            " FP"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setSelectedTech(null), className: "flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider transition-all text-xs", children: t.research.screen.modal.cancel }),
        (() => {
          const status = getTechStatus(selectedTech);
          const isLocked = status === "locked";
          const isDone = status === "researched";
          const isInProgress = status === "researching";
          const hasResources = playerData.capital >= (selectedTech.monetaryCost || 0) || isTestMode;
          const isBusy = !!playerData.activeResearch;
          const isDisabled = isLocked || isDone || isInProgress || !hasResources || isBusy;
          let buttonLabel = t.research.screen.modal.start;
          if (isDone) buttonLabel = t.research.screen.modal.researched;
          else if (isInProgress) buttonLabel = t.research.screen.modal.researching;
          return /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStartResearch(selectedTech),
              disabled: isDisabled,
              className: "flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider transition-all text-xs disabled:bg-gray-600 disabled:cursor-not-allowed",
              children: buttonLabel
            }
          );
        })()
      ] }),
      !!playerData.activeResearch && !["researched", "researching"].includes(getTechStatus(selectedTech)) && /* @__PURE__ */ jsx("p", { className: "text-center text-red-400 text-xs mt-3", children: t.research.screen.modal.errorActive })
    ] }) })
  ] });
};
var ResearchScreen_default = ResearchScreen;
export {
  ResearchScreen_default as default
};
