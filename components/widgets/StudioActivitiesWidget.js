import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { RESEARCH_TECHS } from "../research";
import { BUILDING_DATA } from "../buildings";
import DashboardWidget from "../DashboardWidget";
import { useGame } from "../../contexts/GameContext";
import { EmployeeType } from "../../types";
import { useTranslation } from "../../hooks/useTranslation";
const ProgressBar = ({ progress, text, color = "bg-green-500" }) => /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 mt-1", children: /* @__PURE__ */ jsx(
  "div",
  {
    className: `${color} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-bold text-black`,
    style: { width: `${progress}%` },
    children: text || `${Math.round(progress)}%`
  }
) });
const getDaysRemaining = (endDate, gameDate) => Math.max(0, Math.ceil((new Date(endDate).getTime() - gameDate.getTime()) / 864e5));
const calculateResearchProgress = (progressPoints, requiredPoints) => {
  if (requiredPoints <= 0) return 100;
  return Math.min(100, Math.max(0, progressPoints / requiredPoints * 100));
};
const calculateProgress = (start, end, current) => {
  const totalDuration = new Date(end).getTime() - new Date(start).getTime();
  if (totalDuration <= 0) return 100;
  const elapsed = new Date(current).getTime() - new Date(start).getTime();
  return Math.min(100, Math.max(0, elapsed / totalDuration * 100));
};
const StudioActivitiesWidget = ({ onNavigate, onNavigateToOfficeTab, onNavigateToStudiogelaendeBuilding, onNavigateToProjectsView, onOpenModal }) => {
  const { playerData } = useGame();
  const { t, language } = useTranslation();
  if (!playerData) return null;
  const { activeResearch, activeConstructions, activeConstruction, gameDate, buildings, activePlanning, employees, activeCastings, activeTalentScoutings, activeCastingCampaigns, activeWriting } = playerData;
  const castingAgents = useMemo(() => {
    const agents = employees.filter((e) => e.type === EmployeeType.CastingMitarbeiter);
    if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.CastingMitarbeiter) {
      agents.push({
        id: 99901,
        // Standard Family Partner ID
        name: `${playerData.partnerName} (Partner)`,
        type: EmployeeType.CastingMitarbeiter,
        talent: 0,
        salary: 0,
        experience: 0,
        satisfaction: 100
        // Dummy values needed for type
      });
    }
    playerData.children.forEach((child, index) => {
      if (child.isEmployed && child.employedAs === EmployeeType.CastingMitarbeiter) {
        agents.push({
          id: 99910 + index,
          // Standard Family Child ID offset
          name: `${child.name} (Kind)`,
          type: EmployeeType.CastingMitarbeiter,
          talent: 0,
          salary: 0,
          experience: 0,
          satisfaction: 100
        });
      }
    });
    return agents;
  }, [employees, playerData.partnerIsEmployed, playerData.partnerEmployedAs, playerData.children, playerData.partnerName]);
  const scopeTranslations = {
    small: language === "de" ? "klein" : "small",
    medium: language === "de" ? "mittel" : "medium",
    large: language === "de" ? "gro\xDF" : "large"
  };
  const allActivities = [];
  if (activePlanning) {
    allActivities.push({
      id: "planning",
      endDate: new Date(activePlanning.scriptEndDate),
      render: () => {
        const startDate = new Date(activePlanning.scriptStartDate);
        const endDate = new Date(activePlanning.scriptEndDate);
        const progress = calculateProgress(startDate, endDate, gameDate);
        const daysRemaining = getDaysRemaining(endDate, gameDate);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-cyan-400", children: t.widgets.activities.planning }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.days.replace("{days}", daysRemaining.toString()) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white truncate mb-1", children: [
            '"',
            activePlanning.workingTitle,
            '"'
          ] }),
          /* @__PURE__ */ jsx(ProgressBar, { progress, text: `${Math.round(progress)}%`, color: "bg-cyan-500" })
        ] });
      }
    });
  }
  if (activeWriting) {
    allActivities.push({
      id: "writing",
      endDate: new Date(activeWriting.endDate),
      render: () => {
        const startDate = new Date(activeWriting.startDate);
        const endDate = new Date(activeWriting.endDate);
        const progress = calculateProgress(startDate, endDate, gameDate);
        const daysRemaining = getDaysRemaining(endDate, gameDate);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-400", children: t.widgets.activities.writing }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.days.replace("{days}", daysRemaining.toString()) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-white truncate mb-1", children: [
            '"',
            activeWriting.script.title,
            '"'
          ] }),
          /* @__PURE__ */ jsx(ProgressBar, { progress, text: `${Math.round(progress)}%`, color: "bg-purple-500" })
        ] });
      }
    });
  }
  if (activeResearch) {
    allActivities.push({
      id: "research",
      endDate: new Date(activeResearch.endDate),
      render: () => {
        const progress = calculateResearchProgress(activeResearch.progressPoints, activeResearch.requiredPoints);
        const remainingPoints = Math.max(0, activeResearch.requiredPoints - activeResearch.progressPoints);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-sky-400", children: t.widgets.activities.research }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.remainingPoints.replace("{points}", remainingPoints.toString()) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white truncate mb-1", children: RESEARCH_TECHS.find((t2) => t2.id === activeResearch.techId)?.name || "..." }),
          /* @__PURE__ */ jsx(ProgressBar, { progress, text: `${Math.round(progress)}%`, color: "bg-sky-500" })
        ] });
      }
    });
  }
  const constructions = activeConstructions || (activeConstruction ? [activeConstruction] : []);
  constructions.forEach((construction, index) => {
    const building = buildings.find((b) => b.type === construction.buildingType);
    const currentLevel = building?.level || 0;
    const nextLevelData = BUILDING_DATA[construction.buildingType].levels[currentLevel];
    if (nextLevelData) {
      allActivities.push({
        id: `construction_${index}_${construction.buildingType}`,
        endDate: new Date(construction.endDate),
        render: () => {
          const durationInDays = nextLevelData.duration;
          const endDate = new Date(construction.endDate);
          const startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - durationInDays);
          const progress = calculateProgress(startDate, endDate, gameDate);
          const daysRemaining = getDaysRemaining(endDate, gameDate);
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-orange-400", children: t.widgets.activities.construction }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.days.replace("{days}", daysRemaining.toString()) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white truncate mb-1", children: [
              construction.buildingType,
              " (",
              t.widgets.activities.level.replace("{level}", (currentLevel + 1).toString()),
              ")"
            ] }),
            /* @__PURE__ */ jsx(ProgressBar, { progress, text: `${Math.round(progress)}%`, color: "bg-orange-500" })
          ] });
        }
      });
    }
  });
  castingAgents.forEach((agent) => {
    const agentCasting = activeCastings?.find((c) => c.casterId === agent.id);
    const agentCampaign = activeCastingCampaigns?.find((c) => c.casterId === agent.id);
    const agentScouting = activeTalentScoutings?.find((s) => s.scoutId === agent.id);
    if (agentCasting && agentCasting.startDate) {
      allActivities.push({
        id: `casting_${agent.id}`,
        endDate: new Date(agentCasting.endDate),
        render: () => {
          const progress = calculateProgress(agentCasting.startDate, agentCasting.endDate, gameDate);
          const daysRemaining = getDaysRemaining(agentCasting.endDate, gameDate);
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-cyan-400", children: t.widgets.activities.castingScouting }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.days.replace("{days}", daysRemaining.toString()) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white truncate mb-1", children: [
              agentCasting.talentName,
              " (",
              agent.name,
              ")"
            ] }),
            /* @__PURE__ */ jsx(ProgressBar, { progress, color: "bg-cyan-400" })
          ] });
        }
      });
    } else if (agentCampaign) {
      allActivities.push({
        id: `campaign_${agent.id}`,
        endDate: new Date(agentCampaign.endDate),
        render: () => {
          const progress = calculateProgress(agentCampaign.startDate, agentCampaign.endDate, gameDate);
          const scopeText = scopeTranslations[agentCampaign.scope] || agentCampaign.scope;
          const daysRemaining = getDaysRemaining(agentCampaign.endDate, gameDate);
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-400", children: t.widgets.activities.campaign }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.days.replace("{days}", daysRemaining.toString()) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white truncate mb-1", children: [
              scopeText,
              " (",
              agent.name,
              ")"
            ] }),
            /* @__PURE__ */ jsx(ProgressBar, { progress, color: "bg-purple-400" })
          ] });
        }
      });
    } else if (agentScouting) {
      allActivities.push({
        id: `scouting_${agent.id}`,
        endDate: new Date(agentScouting.endDate),
        render: () => {
          const params = agentScouting.searchParams;
          const daysRemaining = getDaysRemaining(agentScouting.endDate, gameDate);
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-indigo-400", children: t.widgets.activities.scouting }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.days.replace("{days}", daysRemaining.toString()) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white truncate mb-1", children: [
              params.qualityTier,
              " (",
              agent.name,
              ")"
            ] }),
            /* @__PURE__ */ jsx(ProgressBar, { progress: 100, text: "...", color: "bg-indigo-400" })
          ] });
        }
      });
    } else if (agent.activeTraining) {
      allActivities.push({
        id: `training_${agent.id}`,
        endDate: new Date(agent.activeTraining.endDate),
        render: () => {
          const endDate = new Date(agent.activeTraining.endDate);
          const daysRemaining = getDaysRemaining(endDate, gameDate);
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline text-sm mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-yellow-400", children: t.widgets.activities.inTraining }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: t.widgets.activities.days.replace("{days}", daysRemaining.toString()) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white truncate mb-1", children: agent.name }),
            /* @__PURE__ */ jsx(ProgressBar, { progress: 100, text: "...", color: "bg-yellow-500" })
          ] });
        }
      });
    }
  });
  allActivities.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const mostUrgentActivity = allActivities.length > 0 ? allActivities[0] : null;
  return /* @__PURE__ */ jsx("div", { onClick: onOpenModal, className: "cursor-pointer hover:scale-[1.01] transition-transform duration-200", children: /* @__PURE__ */ jsxs(DashboardWidget, { title: t.widgets.activities.title, children: [
    mostUrgentActivity ? mostUrgentActivity.render() : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-center italic py-2", children: t.widgets.activities.noActivities }),
    allActivities.length > 1 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-500 text-center mt-2 border-t border-gray-700/50 pt-1 font-bold", children: [
      "+",
      allActivities.length - 1,
      " weitere Auftr\xE4ge (Klicken)"
    ] })
  ] }) });
};
var StudioActivitiesWidget_default = StudioActivitiesWidget;
export {
  StudioActivitiesWidget_default as default
};
