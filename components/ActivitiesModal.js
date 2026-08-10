import { jsx, jsxs } from "react/jsx-runtime";
import { GameState } from "../types";
import { useTranslation } from "../hooks/useTranslation";
import { BUILDING_DATA } from "./buildings";
import { RESEARCH_TECHS } from "./research";
const calculateProgress = (start, end, current) => {
  const totalDuration = new Date(end).getTime() - new Date(start).getTime();
  if (totalDuration <= 0) return 100;
  const elapsed = new Date(current).getTime() - new Date(start).getTime();
  return Math.min(100, Math.max(0, elapsed / totalDuration * 100));
};
const getDaysRemaining = (endDate, gameDate) => Math.max(0, Math.ceil((new Date(endDate).getTime() - gameDate.getTime()) / 864e5));
const calculateResearchProgress = (progressPoints, requiredPoints) => {
  if (requiredPoints <= 0) return 100;
  return Math.min(100, Math.max(0, progressPoints / requiredPoints * 100));
};
const ActivityRow = ({ title, subtitle, progress, detailLabel, color, onGo, t }) => /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex flex-col gap-2", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "font-bold text-white text-sm", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onGo,
        className: "bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded transition-colors",
        children: [
          t.common.ok,
          " \u2192"
        ]
      }
    )
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `${color} h-full rounded-full transition-all duration-500 ease-out`,
        style: { width: `${progress}%` }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm", children: [
      Math.round(progress),
      "% (",
      detailLabel,
      ")"
    ] })
  ] })
] });
const ActivitiesModal = ({ onClose, onNavigate, playerData }) => {
  const { t, language } = useTranslation();
  const gameDate = playerData.gameDate;
  const constructions = playerData.activeConstructions || (playerData.activeConstruction ? [playerData.activeConstruction] : []);
  const activeCastings = playerData.activeCastings || [];
  const activeCastingCampaigns = playerData.activeCastingCampaigns || [];
  const activeTalentScoutings = playerData.activeTalentScoutings || [];
  const resolveName = (id) => {
    if (id === 99901) return `${playerData.partnerName} (Partner)`;
    if (id >= 99910) {
      const child = playerData.children.find((c) => parseInt(c.id.split("_")[1]) === id || 99910 + playerData.children.indexOf(c) === id);
      return child ? `${child.name} (Kind)` : "Kind";
    }
    const emp = playerData.employees.find((e) => e.id === id);
    return emp ? emp.name : "Mitarbeiter";
  };
  const scopeTranslations = {
    small: language === "de" ? "klein" : "small",
    medium: language === "de" ? "mittel" : "medium",
    large: language === "de" ? "gro\xDF" : "large"
  };
  return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[60] p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/80 rounded-t-lg", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold font-cinzel text-amber-400", children: t.widgets.activities.title }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-white transition-colors", children: "\u2715" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 overflow-y-auto space-y-3 custom-scrollbar", children: [
      playerData.activePlanning && /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: t.widgets.activities.planning,
          subtitle: `"${playerData.activePlanning.workingTitle}"`,
          progress: calculateProgress(playerData.activePlanning.scriptStartDate, playerData.activePlanning.scriptEndDate, gameDate),
          detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(playerData.activePlanning.scriptEndDate, gameDate).toString()),
          color: "bg-cyan-500",
          onGo: () => {
            onNavigate(GameState.Projects);
            onClose();
          },
          t
        }
      ),
      playerData.activeWriting && /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: t.widgets.activities.writing,
          subtitle: `"${playerData.activeWriting.script.title}"`,
          progress: calculateProgress(playerData.activeWriting.startDate, playerData.activeWriting.endDate, gameDate),
          detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(playerData.activeWriting.endDate, gameDate).toString()),
          color: "bg-purple-500",
          onGo: () => {
            onNavigate(GameState.Projects, "scripts");
            onClose();
          },
          t
        }
      ),
      playerData.activeResearch && /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: t.widgets.activities.research,
          subtitle: RESEARCH_TECHS.find((tech) => tech.id === playerData.activeResearch.techId)?.name || "...",
          progress: calculateResearchProgress(playerData.activeResearch.progressPoints, playerData.activeResearch.requiredPoints),
          detailLabel: t.widgets.activities.remainingPoints.replace("{points}", Math.max(0, playerData.activeResearch.requiredPoints - playerData.activeResearch.progressPoints).toString()),
          color: "bg-sky-500",
          onGo: () => {
            onNavigate(GameState.Research);
            onClose();
          },
          t
        }
      ),
      constructions.map((construction, idx) => /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: t.widgets.activities.construction,
          subtitle: construction.buildingType,
          progress: calculateProgress(
            new Date(construction.endDate.getTime() - (BUILDING_DATA[construction.buildingType].levels[playerData.buildings.find((b) => b.type === construction.buildingType)?.level || 0]?.duration || 10) * 864e5),
            construction.endDate,
            gameDate
          ),
          detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(construction.endDate, gameDate).toString()),
          color: "bg-orange-500",
          onGo: () => {
            onNavigate(GameState.Studiogelaende);
            onClose();
          },
          t
        },
        `construction_${idx}_${construction.buildingType}`
      )),
      activeCastings.map((casting, idx) => /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: t.widgets.activities.castingScouting,
          subtitle: `${casting.talentName} (${resolveName(casting.casterId)})`,
          progress: calculateProgress(casting.startDate, casting.endDate, gameDate),
          detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(casting.endDate, gameDate).toString()),
          color: "bg-cyan-400",
          onGo: () => {
            onNavigate(GameState.Office, "talent_management");
            onClose();
          },
          t
        },
        `casting_${idx}_${casting.talentId}`
      )),
      activeCastingCampaigns.map((campaign, idx) => {
        const scopeText = scopeTranslations[campaign.scope] || campaign.scope;
        return /* @__PURE__ */ jsx(
          ActivityRow,
          {
            title: t.widgets.activities.campaign,
            subtitle: `${scopeText} (${resolveName(campaign.casterId)})`,
            progress: calculateProgress(campaign.startDate, campaign.endDate, gameDate),
            detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(campaign.endDate, gameDate).toString()),
            color: "bg-purple-400",
            onGo: () => {
              onNavigate(GameState.Office, "talent_management");
              onClose();
            },
            t
          },
          `campaign_${idx}_${campaign.casterId}`
        );
      }),
      activeTalentScoutings.map((scouting, idx) => /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: t.widgets.activities.scouting,
          subtitle: `${scouting.searchParams.qualityTier} (${resolveName(scouting.scoutId)})`,
          progress: 100,
          detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(scouting.endDate, gameDate).toString()),
          color: "bg-indigo-400",
          onGo: () => {
            onNavigate(GameState.Office, "talent_management");
            onClose();
          },
          t
        },
        `scouting_${idx}_${scouting.scoutId}`
      )),
      playerData.employees.map((emp) => {
        if (!emp.activeTraining) return null;
        return /* @__PURE__ */ jsx(
          ActivityRow,
          {
            title: t.widgets.activities.inTraining,
            subtitle: emp.name,
            progress: calculateProgress(emp.activeTraining.startDate, emp.activeTraining.endDate, gameDate),
            detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(emp.activeTraining.endDate, gameDate).toString()),
            color: "bg-yellow-500",
            onGo: () => {
              onNavigate(GameState.Office, "employees");
              onClose();
            },
            t
          },
          `emp_train_${emp.id}`
        );
      }),
      playerData.partnerActiveTraining && /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: t.widgets.activities.inTraining,
          subtitle: `${playerData.partnerName || "Partner"} (${playerData.partnerActiveTraining.skill})`,
          progress: calculateProgress(playerData.partnerActiveTraining.startDate, playerData.partnerActiveTraining.endDate, gameDate),
          detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(playerData.partnerActiveTraining.endDate, gameDate).toString()),
          color: "bg-pink-500",
          onGo: () => {
            onNavigate(GameState.Privatleben);
            onClose();
          },
          t
        }
      ),
      playerData.children.map((child) => {
        if (!child.activeTraining) return null;
        return /* @__PURE__ */ jsx(
          ActivityRow,
          {
            title: t.widgets.activities.inTraining,
            subtitle: `${child.name} (${child.activeTraining.skill})`,
            progress: calculateProgress(child.activeTraining.startDate, child.activeTraining.endDate, gameDate),
            detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(child.activeTraining.endDate, gameDate).toString()),
            color: "bg-blue-400",
            onGo: () => {
              onNavigate(GameState.Privatleben);
              onClose();
            },
            t
          },
          `child_train_${child.id}`
        );
      }),
      playerData.activeSeminar && /* @__PURE__ */ jsx(
        ActivityRow,
        {
          title: playerData.activeSeminar.type === "seminar" ? t.privatelife.education.seminarsTitle : t.privatelife.education.leisureTitle,
          subtitle: `"${playerData.activeSeminar.name}"`,
          progress: calculateProgress(
            new Date(playerData.activeSeminar.endDate.getTime() - (playerData.activeSeminar.type === "seminar" ? 2 : 1) * 864e5),
            playerData.activeSeminar.endDate,
            gameDate
          ),
          detailLabel: t.widgets.activities.days.replace("{days}", getDaysRemaining(playerData.activeSeminar.endDate, gameDate).toString()),
          color: playerData.activeSeminar.type === "seminar" ? "bg-amber-500" : "bg-green-400",
          onGo: () => {
            onNavigate(GameState.Privatleben);
            onClose();
          },
          t
        }
      ),
      !playerData.activePlanning && !playerData.activeWriting && !playerData.activeResearch && constructions.length === 0 && activeCastings.length === 0 && activeCastingCampaigns.length === 0 && activeTalentScoutings.length === 0 && !playerData.employees.some((e) => e.activeTraining) && !playerData.partnerActiveTraining && !playerData.children.some((c) => c.activeTraining) && !playerData.activeSeminar && /* @__PURE__ */ jsx("div", { className: "text-center py-10 text-gray-500 italic", children: t.widgets.activities.noActivities })
    ] })
  ] }) });
};
var ActivitiesModal_default = ActivitiesModal;
export {
  ActivitiesModal_default as default
};
