import { useEffect, useRef } from "react";
import { BuildingType, EmployeeType, ProjectPhase } from "../types";
import { BUILDING_DATA } from "../components/buildings";
import { ALL_PROPERTIES } from "../components/privateLifeData";
import { TODDLER_PORTRAITS, getNextStagePortrait, getChildToAdultPortrait } from "../components/portraits";
import { useTranslation } from "./useTranslation";
import { persistSaveFiles } from "./saveStorage";
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const useDateLoop = ({ setPlayerData }) => {
  const accumulatedRealtimeMsRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const animationFrameIdRef = useRef(void 0);
  const { t, language } = useTranslation();
  const REALTIME_UPDATE_STEP_MS = 1e3;
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getUtcDayNumber = (date) => {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (24 * 60 * 60 * 1e3));
  };
  useEffect(() => {
    const gameTick = (timestamp) => {
      let deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;
      accumulatedRealtimeMsRef.current += deltaTime;
      if (accumulatedRealtimeMsRef.current >= REALTIME_UPDATE_STEP_MS) {
        const elapsedRealMs = accumulatedRealtimeMsRef.current;
        accumulatedRealtimeMsRef.current = 0;
        setPlayerData((currentData) => {
          if (!currentData) return currentData;

          const previousDate = new Date(currentData.gameDate);
          const ingameMsPerRealMs = getDaysInMonth(previousDate);
          const newDate = new Date(previousDate.getTime() + elapsedRealMs * ingameMsPerRealMs);

          const daysPassed = getUtcDayNumber(newDate) - getUtcDayNumber(previousDate);

          if (daysPassed <= 0) {
            return {
              ...currentData,
              gameDate: newDate
            };
          }

          const isTestMode = currentData.playerName === "Max Mustermann" && currentData.studioName === "Teststudio";
          let newMessages = [...currentData.messages];
            let addedResearchProgress = 0;
            let researchPointsPerDay = 0;
            const researchLab = currentData.buildings.find((b) => b.type === BuildingType.ResearchLab && b.level > 0);
            const researchers = currentData.employees.filter((e) => e.type === EmployeeType.Forscher);
            const isPartnerResearcher = currentData.partnerIsEmployed && currentData.partnerEmployedAs === EmployeeType.Forscher;
            const childResearchers = currentData.children.filter((c) => c.isEmployed && c.employedAs === EmployeeType.Forscher);
            if (researchLab) {
              let pointsPerDay = 1;
              const labData = BUILDING_DATA[BuildingType.ResearchLab].levels[researchLab.level - 1];
              if (labData?.bonusEffect?.researchPointsPerDay) {
                pointsPerDay = labData.bonusEffect.researchPointsPerDay;
              }
              let totalResearcherTalent = 0;
              totalResearcherTalent += researchers.reduce((sum, r) => sum + r.talent * (r.satisfaction / 100), 0);
              if (isPartnerResearcher && currentData.partnerSkills) {
                totalResearcherTalent += currentData.partnerSkills.research;
              }
              childResearchers.forEach((child) => {
                if (child.skills) {
                  totalResearcherTalent += child.skills.research;
                }
              });
              pointsPerDay += Math.floor(totalResearcherTalent / 25);
              researchPointsPerDay = pointsPerDay;
              addedResearchProgress = pointsPerDay * daysPassed;
            }
            let dailyEnergyChange = 0;
            const currentEnergy = currentData.energy || 100;
            if (currentData.activeProjects && currentData.activeProjects.length > 0) {
              currentData.activeProjects.forEach((proj) => {
                const phase = proj.phase;
                if (phase === ProjectPhase.Production) {
                  dailyEnergyChange -= 0.71 * daysPassed;
                } else if (phase === ProjectPhase.Casting || phase === ProjectPhase.PostProduction) {
                  dailyEnergyChange -= 0.43 * daysPassed;
                }
              });
            }
            if (currentData.activeCourse && currentData.activeCourse.weeklyEnergyCost) {
              dailyEnergyChange -= currentData.activeCourse.weeklyEnergyCost / 7 * daysPassed;
            }
            const activeProperty = ALL_PROPERTIES.find((p) => p.id === currentData.activePropertyId);
            const weeklyRecovery = activeProperty?.recoveryBonus || 2;
            dailyEnergyChange += weeklyRecovery / 7 * daysPassed;
            let newEnergy = Math.max(0, Math.min(100, currentEnergy + dailyEnergyChange));
            let newEventLog = [...currentData.eventLog];
            if (newEnergy <= 0) {
              newEnergy = 50;
              newDate.setDate(newDate.getDate() + 28);
              newEventLog.push({
                date: new Date(currentData.gameDate),
                // Use original date for log
                title: "BURNOUT!",
                text: "Sie sind zusammengebrochen. Der Stress war zu viel. Sie mussten 4 Wochen Zwangspause einlegen, um sich zu erholen. Achten Sie auf Ihre Gesundheit!",
                category: "Personal"
              });
            }
            if (currentData.playerBirthDate) {
              const birthDate = new Date(currentData.playerBirthDate);
              if (newDate.getDate() === birthDate.getDate() && newDate.getMonth() === birthDate.getMonth()) {
                const msgs = t.office.birthdayMessages || ["Happy Birthday!"];
                const randomMsg = pickRandom(msgs);
                const lastName = currentData.playerName.split(" ").pop() || "";
                const salutationTemplate = currentData.gender === "m\xE4nnlich" ? t.office.messages.salutationMale : t.office.messages.salutationFemale;
                const salutation = salutationTemplate.replace("{lastName}", lastName);
                const fullBody = `${salutation},

${randomMsg}`;
                const birthdayMessage = {
                  id: `msg_bday_${newDate.getFullYear()}`,
                  date: new Date(newDate),
                  sender: t.office.messages.ceoBoardSender,
                  subject: t.office.birthdaySubject || "Happy Birthday",
                  body: fullBody,
                  read: false
                };
                newMessages.push(birthdayMessage);
              }
            }
            let newChildren = currentData.children.map((child) => {
              let updatedChild = { ...child };
              if (isTestMode && newDate.getDay() === 1 && new Date(currentData.gameDate).getDay() !== 1) {
                const newBirth = new Date(updatedChild.birthDate);
                newBirth.setFullYear(newBirth.getFullYear() - 1);
                updatedChild.birthDate = newBirth;
              }
              const age = Math.floor((newDate.getTime() - new Date(updatedChild.birthDate).getTime()) / (1e3 * 3600 * 24 * 365.25));
              if (age >= 3 && updatedChild.portraitId && (updatedChild.portraitId.startsWith("b") || updatedChild.portraitId.startsWith("baby_"))) {
                if (updatedChild.isAdopted) {
                  updatedChild.portraitId = pickRandom(TODDLER_PORTRAITS);
                } else {
                  updatedChild.portraitId = getNextStagePortrait(updatedChild.portraitId, "toddler");
                }
              }
              if (age >= 6 && updatedChild.portraitId && (updatedChild.portraitId.startsWith("1j") || updatedChild.portraitId.startsWith("toddler_"))) {
                updatedChild.portraitId = getChildToAdultPortrait(updatedChild.portraitId, updatedChild.gender);
              }
              return updatedChild;
            });
            const bankruptcyLimit = isTestMode ? -1e3 : -1e5;
            let bankruptcyDeadline = currentData.bankruptcyDeadline;
            let isBankrupt = false;
            if (currentData.capital < bankruptcyLimit && !bankruptcyDeadline) {
              const deadline = new Date(newDate);
              deadline.setDate(deadline.getDate() + 28);
              bankruptcyDeadline = deadline;
              const locale = language === "de" ? "de-DE" : "en-US";
              const deadlineStr = deadline.toLocaleDateString(locale);
              const warningMsg = {
                id: `msg_bank_warn_${Date.now()}`,
                date: new Date(newDate),
                sender: "Bank",
                subjectTemplate: {
                  key: "office.messages.bankruptcyWarningSubject",
                  variables: {}
                },
                bodyTemplate: {
                  key: "office.messages.bankruptcyWarningBody",
                  variables: { date: deadlineStr }
                },
                read: false
              };
              newMessages.push(warningMsg);
            }
            if (bankruptcyDeadline && currentData.capital >= bankruptcyLimit) {
              bankruptcyDeadline = void 0;
            }
            if (bankruptcyDeadline && newDate >= new Date(bankruptcyDeadline)) {
              if (currentData.capital < bankruptcyLimit) {
                isBankrupt = true;
              } else {
                bankruptcyDeadline = void 0;
              }
            }
            const cleanedMessages = newMessages.filter((msg) => {
              if (msg.isArchived) return true;
              if (!msg.read) return true;
              if (msg.offerContext) {
                const oc = msg.offerContext;
                const isResolved = oc.isAccepted || oc.isRejected || oc.isNegotiationFailed || oc.isWithdrawn || oc.isSuperseded;
                if (!isResolved) return true;
              }
              if (msg.productionEventContext) {
                if (!msg.productionEventContext.isResolved) return true;
              }
              const readDate = msg.readDate ? new Date(msg.readDate) : new Date(msg.date);
              const deletionDate = new Date(readDate.getFullYear(), readDate.getMonth() + 2, 1);
              if (newDate >= deletionDate) {
                return false;
              }
              return true;
            });
            const finalState = {
              ...currentData,
              gameDate: newDate,
              researchPoints: 0,
              activeResearch: currentData.activeResearch ? (() => {
                const progressPoints = Math.min(
                  currentData.activeResearch.requiredPoints,
                  currentData.activeResearch.progressPoints + addedResearchProgress
                );
                const remainingPoints = Math.max(0, currentData.activeResearch.requiredPoints - progressPoints);
                const remainingDays = remainingPoints > 0 ? Math.ceil(remainingPoints / Math.max(researchPointsPerDay, 1)) : 0;
                const endDate = new Date(newDate);
                endDate.setDate(endDate.getDate() + remainingDays);
                return {
                  ...currentData.activeResearch,
                  progressPoints,
                  endDate
                };
              })() : currentData.activeResearch,
              energy: newEnergy,
              eventLog: newEventLog,
              children: newChildren,
              bankruptcyDeadline,
              isBankrupt,
              messages: cleanedMessages
            };
            if (newDate.getMonth() !== currentData.gameDate.getMonth()) {
              try {
                const savedData = localStorage.getItem("film_tycoon_saves");
                let saves = savedData ? JSON.parse(savedData) : [];
                const autoSave = {
                  slotId: 0,
                  timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                  data: finalState
                };
                saves = saves.filter((s) => s.slotId !== 0);
                saves.push(autoSave);
                void persistSaveFiles(saves);
              } catch (err) {
                console.error("Auto-Save failed:", err);
              }
            }
          return finalState;
        });
      }
      animationFrameIdRef.current = requestAnimationFrame(gameTick);
    };
    lastTimestampRef.current = window.performance.now();
    animationFrameIdRef.current = requestAnimationFrame(gameTick);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [setPlayerData, t, language]);
};
export {
  useDateLoop
};
