import { jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from "react";
import { BuildingType } from "../types";
import { studiogelaendeBackgroundImage } from "./backgrounds/StudiogelaendeBackgroundImage";
import { BUILDING_DATA } from "./buildings";
import GameHeader from "./GameHeader";
import DrehbuchIcon from "./icons/DrehbuchIcon";
import MarketingIcon from "./icons/MarketingIcon";
import ForschungIcon from "./icons/ForschungIcon";
import CastingIcon from "./icons/CastingIcon";
import KinoIcon from "./icons/KinoIcon";
import RestaurantIcon from "./icons/RestaurantIcon";
import FilmmuseumIcon from "./icons/FilmmuseumIcon";
import { useGame } from "../contexts/GameContext";
import { RESEARCH_TECHS } from "./research";
import PlanungsbueroIcon from "./icons/PlanungsbueroIcon";
import BurogebaudeIcon from "./icons/BurogebaudeIcon";
import ProduktionIcon from "./icons/ProduktionIcon";
import BauhofIcon from "./icons/BauhofIcon";
import LocationIcon from "./icons/LocationIcon";
import SchnittIcon from "./icons/SchnittIcon";
import BugIcon from "./icons/BugIcon";
import WardrobeIcon from "./icons/WardrobeIcon";
import KindergartenIcon from "./icons/KindergartenIcon";
import BriefcaseIcon from "./icons/BriefcaseIcon";
import TrophyIcon from "./icons/TrophyIcon";
import MoneyBagIcon from "./icons/MoneyBagIcon";
import { useTranslation } from "../hooks/useTranslation";
const BuildingButton = ({ title, description, icon, isActive, isUnderConstruction, onClick, hasChildren, isExpanded }) => {
  const activeClasses = "border-amber-500 ring-2 ring-amber-500 bg-gray-700/50";
  const defaultClasses = "border-gray-700 hover:border-amber-500/50 hover:-translate-y-1";
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: `bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses} ${isUnderConstruction ? "animate-pulse" : ""}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
        /* @__PURE__ */ jsx("div", { className: `bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && "bg-amber-500"} ${isUnderConstruction && "border border-blue-400"}`, children: icon }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("h3", { className: `text-md font-bold font-cinzel ${isActive ? "text-amber-300" : "text-amber-400"} group-hover:text-amber-300 transition-colors truncate`, children: title }),
            hasChildren && /* @__PURE__ */ jsx("span", { className: `text-xs ml-2 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`, children: "\u25BC" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300 mt-1 truncate", children: description })
        ] })
      ] })
    }
  );
};
const iconMap = {
  [BuildingType.Burogebaude]: /* @__PURE__ */ jsx(BurogebaudeIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Autorenbuero]: /* @__PURE__ */ jsx(DrehbuchIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.CastingOffice]: /* @__PURE__ */ jsx(CastingIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.MarketingDepartment]: /* @__PURE__ */ jsx(MarketingIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.ResearchLab]: /* @__PURE__ */ jsx(ForschungIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Planungsbuero]: /* @__PURE__ */ jsx(PlanungsbueroIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Studio]: /* @__PURE__ */ jsx(ProduktionIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Studio1]: /* @__PURE__ */ jsx(ProduktionIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Studio2]: /* @__PURE__ */ jsx(ProduktionIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Studio3]: /* @__PURE__ */ jsx(ProduktionIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Bauhof]: /* @__PURE__ */ jsx(BauhofIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Kino]: /* @__PURE__ */ jsx(KinoIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Restaurant]: /* @__PURE__ */ jsx(RestaurantIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Filmmuseum]: /* @__PURE__ */ jsx(FilmmuseumIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Backlot]: /* @__PURE__ */ jsx(LocationIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Postproduktionshaus]: /* @__PURE__ */ jsx(SchnittIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Sicherheitszentrale]: /* @__PURE__ */ jsx(BugIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.KostuemUndMaskenatelier]: /* @__PURE__ */ jsx(WardrobeIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Betriebskita]: /* @__PURE__ */ jsx(KindergartenIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Studiohotel]: /* @__PURE__ */ jsx(BriefcaseIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Eventhalle]: /* @__PURE__ */ jsx(TrophyIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
  [BuildingType.Fanshop]: /* @__PURE__ */ jsx(MoneyBagIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" })
};
const StudiogelaendeScreen = ({ onBack, gameSpeed, setGameSpeed, initialBuilding }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const [selectedBuildingType, setSelectedBuildingType] = useState(initialBuilding || BuildingType.Burogebaude);
  const subsidiaryBuildingTypes = useMemo(() => [
    BuildingType.Autorenbuero,
    BuildingType.CastingOffice,
    BuildingType.MarketingDepartment,
    BuildingType.ResearchLab,
    BuildingType.Planungsbuero
  ], []);
  const [expandedParent, setExpandedParent] = useState(null);
  if (!playerData) return null;
  const isTestMode = playerData.playerName === "Max Mustermann" && playerData.studioName === "Teststudio";
  const selectedBuilding = useMemo(() => {
    if (!selectedBuildingType) return null;
    return playerData.buildings.find((b) => b.type === selectedBuildingType) || { type: selectedBuildingType, level: 0 };
  }, [selectedBuildingType, playerData.buildings]);
  const revenueGroupTitle = language === "de" ? "Besucher & Einnahmen" : "Visitors & Revenue";
  const revenueGroupDescription = language === "de" ? "Tourismus, Events und Zusatzgesch\xE4ft auf dem Studiogel\xE4nde." : "Tourism, events and extra business on the studio lot.";
  const buildingHierarchy = [
    {
      id: "office",
      type: BuildingType.Burogebaude,
      children: subsidiaryBuildingTypes
    },
    {
      id: "studio",
      type: BuildingType.Studio,
      children: [
        BuildingType.Studio1,
        BuildingType.Studio2,
        BuildingType.Studio3,
        BuildingType.Backlot,
        BuildingType.Postproduktionshaus,
        BuildingType.KostuemUndMaskenatelier
      ]
    },
    { id: BuildingType.Bauhof, type: BuildingType.Bauhof, children: [] },
    { id: BuildingType.Sicherheitszentrale, type: BuildingType.Sicherheitszentrale, children: [] },
    { id: BuildingType.Betriebskita, type: BuildingType.Betriebskita, children: [] },
    {
      id: "revenue",
      title: revenueGroupTitle,
      description: revenueGroupDescription,
      icon: /* @__PURE__ */ jsx(MoneyBagIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }),
      children: [
        BuildingType.Kino,
        BuildingType.Restaurant,
        BuildingType.Filmmuseum,
        BuildingType.Studiohotel,
        BuildingType.Eventhalle,
        BuildingType.Fanshop
      ]
    }
  ];
  const { totalSlots, usedSlots } = useMemo(() => {
    const buroBuilding = playerData.buildings.find((b) => b.type === BuildingType.Burogebaude);
    const total = (buroBuilding?.level || 0) * 3;
    const used = playerData.buildings.filter((b) => subsidiaryBuildingTypes.includes(b.type)).reduce((sum, b) => sum + b.level, 0);
    return { totalSlots: total, usedSlots: used };
  }, [playerData.buildings, subsidiaryBuildingTypes]);
  const handleUpgrade = () => {
    if (!selectedBuilding) return;
    const buildingData = BUILDING_DATA[selectedBuilding.type];
    const currentLevel = selectedBuilding.level;
    const nextLevelData = buildingData.levels[currentLevel];
    const activeConstructions = playerData.activeConstructions || (playerData.activeConstruction ? [playerData.activeConstruction] : []);
    const bauhof = playerData.buildings.find((b) => b.type === BuildingType.Bauhof);
    const maxConstructions = 1 + (bauhof && bauhof.level >= 1 ? 1 : 0) + (bauhof && bauhof.level >= 2 ? 1 : 0);
    if (!nextLevelData || playerData.capital < nextLevelData.cost && !isTestMode || activeConstructions.length >= maxConstructions) {
      return;
    }
    if (activeConstructions.some((c) => c.buildingType === selectedBuilding.type)) {
      return;
    }
    const duration = isTestMode ? 1 : nextLevelData.duration;
    const endDate = new Date(playerData.gameDate);
    endDate.setDate(endDate.getDate() + duration);
    const newActiveConstruction = {
      buildingType: selectedBuilding.type,
      endDate
    };
    setPlayerData((prev) => {
      if (!prev) return null;
      const buildingKey = getBuildingKey(selectedBuilding.type);
      const buildingName = t.studiogelaende.buildings[buildingKey]?.name || selectedBuilding.type;
      return {
        ...prev,
        capital: prev.capital - nextLevelData.cost,
        activeConstructions: [...prev.activeConstructions || [], newActiveConstruction],
        activeConstruction: newActiveConstruction,
        // Legacy compatibility, points to latest
        transactionLog: [
          ...prev.transactionLog,
          {
            date: new Date(prev.gameDate),
            type: "Ausgabe",
            category: "Studiogel\xE4nde",
            description: `${currentLevel === 0 ? t.studiogelaende.screen.build : t.studiogelaende.screen.upgrade}: ${buildingName}`,
            descriptionKey: currentLevel === 0 ? "constructionBuild" : "constructionUpgrade",
            descriptionVars: { building: buildingName },
            amount: nextLevelData.cost
          }
        ]
      };
    });
  };
  const getHoursRemaining = (endDate) => {
    return Math.max(0, Math.ceil((endDate.getTime() - playerData.gameDate.getTime()) / (1e3 * 3600)));
  };
  const getBuildingKey = (type) => {
    return Object.keys(BuildingType).find((key) => BuildingType[key] === type) || "Burogebaude";
  };
  const formatCurrency = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  const getConstructionEntry = (type) => {
    return (playerData.activeConstructions || []).find((c) => c.buildingType === type) || (playerData.activeConstruction?.buildingType === type ? playerData.activeConstruction : void 0);
  };
  const getConstructionSlotsInfo = () => {
    const activeConstructions = playerData.activeConstructions || (playerData.activeConstruction ? [playerData.activeConstruction] : []);
    const bauhof = playerData.buildings.find((b) => b.type === BuildingType.Bauhof);
    const maxConstructions = 1 + (bauhof && bauhof.level >= 1 ? 1 : 0) + (bauhof && bauhof.level >= 2 ? 1 : 0);
    return { current: activeConstructions.length, max: maxConstructions };
  };
  const constructionSlots = getConstructionSlotsInfo();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "w-full h-full bg-cover bg-center flex flex-col",
      style: { backgroundImage: `url(${studiogelaendeBackgroundImage})` },
      children: [
        /* @__PURE__ */ jsx(GameHeader, { gameSpeed, setGameSpeed, disabled: true }),
        /* @__PURE__ */ jsxs("div", { className: "flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden", children: [
          /* @__PURE__ */ jsxs("aside", { className: "w-96 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col", children: [
            /* @__PURE__ */ jsxs("header", { className: "p-6 text-center border-b border-gray-700", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold font-cinzel text-amber-400", children: t.studiogelaende.screen.title }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 bg-gray-800/60 rounded px-2 py-1 text-xs text-gray-300 border border-gray-600 inline-block", children: /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-bold", children: [
                language === "de" ? "Bau-Slots" : "Construction Slots",
                ": ",
                constructionSlots.current,
                " / ",
                constructionSlots.max
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("nav", { className: "flex-grow p-4 flex flex-col gap-4 overflow-y-auto", children: buildingHierarchy.map((item) => {
              const parentBuilding = item.type ? playerData.buildings.find((b) => b.type === item.type) || { type: item.type, level: 0 } : null;
              const isParentUnderConstruction = parentBuilding ? !!getConstructionEntry(parentBuilding.type) : false;
              const buildingKey = parentBuilding ? getBuildingKey(parentBuilding.type) : null;
              const isExpanded = expandedParent === item.id;
              const buttonTitle = parentBuilding ? t.studiogelaende.buildings[buildingKey]?.name || parentBuilding.type : item.title || "";
              const buttonDescription = parentBuilding ? isParentUnderConstruction ? t.studiogelaende.screen.underConstruction : t.studiogelaende.screen.level.replace("{level}", parentBuilding.level.toString()) : item.description || "";
              const buttonIcon = parentBuilding ? iconMap[parentBuilding.type] : item.icon;
              return /* @__PURE__ */ jsxs(React.Fragment, { children: [
                /* @__PURE__ */ jsx(
                  BuildingButton,
                  {
                    title: buttonTitle,
                    description: buttonDescription,
                    icon: buttonIcon,
                    isActive: !!parentBuilding && selectedBuildingType === parentBuilding.type,
                    isUnderConstruction: isParentUnderConstruction,
                    onClick: () => {
                      if (parentBuilding) {
                        setSelectedBuildingType(parentBuilding.type);
                      }
                      if (item.children.length > 0) {
                        setExpandedParent((prev) => prev === item.id ? null : item.id);
                      } else {
                        setExpandedParent(null);
                      }
                    },
                    hasChildren: item.children.length > 0,
                    isExpanded
                  }
                ),
                item.children.length > 0 && isExpanded && /* @__PURE__ */ jsx("div", { className: "pl-5 ml-4 border-l-2 border-gray-600/50 space-y-4 animate-fade-in", children: item.children.map((childType) => {
                  const childBuilding = playerData.buildings.find((b) => b.type === childType) || { type: childType, level: 0 };
                  const isChildUnderConstruction = !!getConstructionEntry(childBuilding.type);
                  const childBuildingKey = getBuildingKey(childBuilding.type);
                  return /* @__PURE__ */ jsx(
                    BuildingButton,
                    {
                      title: t.studiogelaende.buildings[childBuildingKey]?.name || childBuilding.type,
                      description: isChildUnderConstruction ? t.studiogelaende.screen.underConstruction : t.studiogelaende.screen.level.replace("{level}", childBuilding.level.toString()),
                      icon: iconMap[childBuilding.type],
                      isActive: selectedBuildingType === childBuilding.type,
                      isUnderConstruction: isChildUnderConstruction,
                      onClick: () => setSelectedBuildingType(childBuilding.type)
                    },
                    childBuilding.type
                  );
                }) })
              ] }, item.id);
            }) }),
            /* @__PURE__ */ jsx("footer", { className: "p-4 border-t border-gray-700", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onBack,
                className: "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase",
                children: t.studiogelaende.screen.backToMain
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("main", { className: "flex-grow p-8 overflow-y-auto flex items-center justify-center", children: selectedBuilding ? (() => {
            const buildingKey = getBuildingKey(selectedBuilding.type);
            const buildingTranslations = t.studiogelaende.buildings[buildingKey];
            const data = BUILDING_DATA[selectedBuilding.type];
            if (!buildingTranslations || !data) {
              return /* @__PURE__ */ jsx("div", { className: "text-center text-red-500", children: language === "de" ? `Daten fehlen f\xFCr ${selectedBuilding.type}` : `Missing data for ${selectedBuilding.type}` });
            }
            const currentLevel = selectedBuilding.level;
            const currentLevelData = currentLevel > 0 ? data.levels[currentLevel - 1] : null;
            const nextLevelData = data.levels[currentLevel];
            const constructionEntry = getConstructionEntry(selectedBuilding.type);
            const isUnderConstruction = !!constructionEntry;
            const isLockedByResearch = currentLevel === 0 && data.requiredTech && !playerData.unlockedTechnologies.includes(data.requiredTech);
            const isSubsidiary = subsidiaryBuildingTypes.includes(selectedBuilding.type);
            const hasReachedSlotLimit = isSubsidiary && usedSlots >= totalSlots;
            const slotsFull = constructionSlots.current >= constructionSlots.max;
            let dependencyMissing = "";
            const studioHallenLevel = playerData.buildings.find((b) => b.type === BuildingType.Studio)?.level || 0;
            const studio1Level = playerData.buildings.find((b) => b.type === BuildingType.Studio1)?.level || 0;
            const studio2Level = playerData.buildings.find((b) => b.type === BuildingType.Studio2)?.level || 0;
            if (selectedBuilding.type === BuildingType.Studio2 && currentLevel === 0) {
              if (studioHallenLevel < 2) dependencyMissing = `${t.studiogelaende.buildings["Studio"]?.name || "Studio"} Level 2`;
              else if (studio1Level < 3) dependencyMissing = `${t.studiogelaende.buildings["Studio1"]?.name || "Studio 1"} Level 3`;
            }
            if (selectedBuilding.type === BuildingType.Studio3 && currentLevel === 0) {
              if (studioHallenLevel < 3) dependencyMissing = `${t.studiogelaende.buildings["Studio"]?.name || "Studio"} Level 3`;
              else if (studio2Level < 3) dependencyMissing = `${t.studiogelaende.buildings["Studio2"]?.name || "Studio 2"} Level 3`;
            }
            let disabledTooltip = "";
            if (playerData.capital < (nextLevelData?.cost || 0) && !isTestMode) disabledTooltip = t.studiogelaende.screen.tooltip.noCapital;
            else if (!!constructionEntry) disabledTooltip = t.studiogelaende.screen.tooltip.constructionActive;
            else if (slotsFull) disabledTooltip = t.studiogelaende.screen.tooltip.constructionActive;
            else if (isLockedByResearch) {
              const techId = data.requiredTech;
              const techName = techId ? t.research.techs[techId]?.name || RESEARCH_TECHS.find((tech) => tech.id === techId)?.name || "" : "";
              disabledTooltip = t.studiogelaende.screen.tooltip.researchRequired.replace("{techName}", techName);
            } else if (hasReachedSlotLimit) disabledTooltip = t.studiogelaende.screen.tooltip.officeUpgrade;
            else if (dependencyMissing) disabledTooltip = t.studiogelaende.screen.tooltip.dependencyMissing.replace("{requirement}", dependencyMissing);
            return /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-center mb-2 font-cinzel text-amber-400", children: buildingTranslations.name }),
              /* @__PURE__ */ jsx("p", { className: "text-center text-gray-400 mb-2", children: t.studiogelaende.screen.level.replace("{level}", currentLevel.toString()) }),
              currentLevelData && /* @__PURE__ */ jsx("p", { className: "text-center text-gray-500 text-sm mb-4", children: t.studiogelaende.screen.monthlyCost.replace("{cost}", formatCurrency(currentLevelData.monthlyCost)) }),
              /* @__PURE__ */ jsx("p", { className: "text-center text-gray-300 mb-6", children: buildingTranslations.description }),
              selectedBuilding.type === BuildingType.Burogebaude && /* @__PURE__ */ jsxs("div", { className: "my-4 p-3 bg-gray-900 rounded-md border border-gray-700", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-bold text-white text-center", children: t.studiogelaende.screen.departmentSlots }),
                /* @__PURE__ */ jsxs("div", { className: "text-center mt-1", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-amber-400", children: [
                    usedSlots,
                    " / ",
                    totalSlots
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: t.studiogelaende.screen.slotsUsed })
                ] })
              ] }),
              currentLevel > 0 && (() => {
                const levelData = data.levels[currentLevel - 1];
                const levelTranslations = buildingTranslations.levels[`level${currentLevel}`];
                return /* @__PURE__ */ jsxs("div", { className: "my-4 p-3 bg-gray-900 rounded-md border border-gray-700", children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-bold text-white text-center", children: t.studiogelaende.screen.currentBonus }),
                  /* @__PURE__ */ jsx("div", { className: "text-center mt-1", children: levelData.structuredBonus ? levelData.structuredBonus.map((bonus, index) => /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("span", { className: "font-semibold text-white", children: [
                      bonus.label,
                      " "
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "font-bold tracking-wider text-yellow-400", children: bonus.stars })
                  ] }, index)) : /* @__PURE__ */ jsx("p", { className: "text-center text-green-400", children: levelTranslations?.bonus || levelData.bonusDescription }) })
                ] });
              })(),
              /* @__PURE__ */ jsx("hr", { className: "border-gray-600 my-6" }),
              isUnderConstruction && constructionEntry ? /* @__PURE__ */ jsxs("div", { className: "text-center p-4 bg-blue-900 rounded-md border border-blue-600", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white", children: t.studiogelaende.screen.upgrading }),
                /* @__PURE__ */ jsx("p", { className: "text-blue-300 text-lg", children: t.studiogelaende.screen.daysRemaining.replace("{days}", getHoursRemaining(constructionEntry.endDate).toString()) })
              ] }) : nextLevelData ? (() => {
                const nextLevelTranslations = buildingTranslations.levels[`level${nextLevelData.level}`];
                return /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-amber-400 text-center", children: t.studiogelaende.screen.nextLevel.replace("{level}", nextLevelData.level.toString()) }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-1 text-center", children: nextLevelTranslations?.desc || nextLevelData.description }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 text-lg", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { children: t.studiogelaende.screen.cost }),
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatCurrency(nextLevelData.cost) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { children: t.studiogelaende.screen.duration }),
                      " ",
                      /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
                        (isTestMode ? 1 : nextLevelData.duration) * 24,
                        " ",
                        language === "de" ? "Stunden" : "hours"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { children: t.studiogelaende.screen.monthlyCost.replace(": {cost}", ":") }),
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatCurrency(nextLevelData.monthlyCost) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mt-2", children: [
                      /* @__PURE__ */ jsx("span", { children: t.studiogelaende.screen.bonus }),
                      /* @__PURE__ */ jsx("div", { className: "text-right", children: nextLevelData.structuredBonus ? nextLevelData.structuredBonus.map((bonus, index) => /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsxs("span", { className: "font-semibold text-white", children: [
                          bonus.label,
                          " "
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: "font-bold tracking-wider text-yellow-400", children: bonus.stars })
                      ] }, index)) : /* @__PURE__ */ jsx("span", { className: "font-bold text-green-400", children: nextLevelTranslations?.bonus || nextLevelData.bonusDescription }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleUpgrade,
                      disabled: playerData.capital < nextLevelData.cost && !isTestMode || !!constructionEntry || slotsFull || isLockedByResearch || hasReachedSlotLimit || !!dependencyMissing,
                      title: disabledTooltip,
                      className: "mt-6 w-full bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none",
                      children: currentLevel === 0 ? t.studiogelaende.screen.build : t.studiogelaende.screen.upgrade
                    }
                  ),
                  disabledTooltip && /* @__PURE__ */ jsx("p", { className: "text-center text-red-400 text-sm mt-2", children: disabledTooltip })
                ] });
              })() : /* @__PURE__ */ jsx("p", { className: "text-center text-green-400 font-bold text-xl", children: t.studiogelaende.screen.fullyUpgraded })
            ] });
          })() : /* @__PURE__ */ jsxs("div", { className: "m-auto text-center text-gray-500", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl", children: t.studiogelaende.screen.selectBuilding }),
            /* @__PURE__ */ jsx("p", { className: "text-lg", children: t.studiogelaende.screen.selectBuildingHint })
          ] }) })
        ] })
      ]
    }
  );
};
var StudiogelaendeScreen_default = StudiogelaendeScreen;
export {
  StudiogelaendeScreen_default as default
};
