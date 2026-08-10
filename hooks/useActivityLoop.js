import { useEffect } from "react";
import { BuildingType, EmployeeType, ProjectPhase, ActorAge } from "../types";
import { MARKETING_CAMPAIGNS, PRODUCTION_MARKETING_CAMPAIGNS } from "../components/marketingData";
import { ALL_COURSES } from "../components/privateLifeData";
import { generateNewTalent } from "../components/talentGenerator";
import { useTranslation } from "./useTranslation";
const dateReached = (current, target) => {
  if (!target) return false;
  return new Date(current) >= new Date(target);
};
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getAge = (birthDate, gameDate) => {
  const diff = new Date(gameDate).getTime() - new Date(birthDate).getTime();
  return Math.floor(diff / (1e3 * 60 * 60 * 24 * 365.25));
};
const getAgeCategory = (age) => {
  if (age <= 15) return ActorAge.Child;
  if (age <= 34) return ActorAge.Young;
  if (age <= 59) return ActorAge.MiddleAged;
  return ActorAge.Old;
};
const useActivityLoop = (props) => {
  const {
    playerData,
    setPlayerData,
    systemPause,
    setConstructionFinishedInfo,
    setCampaignResultInfo,
    setCourseFinishedInfo,
    setTalentScoutingResult,
    // Removed trainingFinishedInfo which was not defined in UseActivityLoopProps and not used.
    setTrainingFinishedInfo,
    setCastingFinishedNotification,
    setProductionCampaignResultInfo
  } = props;
  const { t, language } = useTranslation();
  useEffect(() => {
    const newDate = new Date(playerData.gameDate);
    let dataChanged = false;
    const newState = { ...playerData };
    let newMessages = [];
    if (newState.activeResearch && newState.activeResearch.progressPoints >= newState.activeResearch.requiredPoints) {
      const techId = newState.activeResearch.techId;
      const techName = t.research.techs[techId]?.name || "Unknown Technology";
      const researcher = newState.employees.find((e) => e.type === EmployeeType.Forscher);
      const researcherName = researcher ? researcher.name : t.office.messages.researchDepartment;
      if (researcher) {
        newState.employees = newState.employees.map(
          (e) => e.id === researcher.id ? { ...e, talent: Math.min(100, e.talent + 1) } : e
        );
      }
      newState.unlockedTechnologies = [...newState.unlockedTechnologies, techId];
      const newMessage = {
        id: `msg_res_${Date.now()}`,
        date: newDate,
        sender: t.office.messages.researchDepartment,
        subjectTemplate: {
          key: "office.messages.researchFinishedSubject",
          variables: { techName }
        },
        bodyTemplate: {
          key: "office.messages.researchFinishedBody",
          variables: { techName, researcherName }
        },
        read: false
      };
      newMessages.push(newMessage);
      newState.activeResearch = null;
      dataChanged = true;
      systemPause();
    }
    if (!newState.activeConstructions) {
      newState.activeConstructions = newState.activeConstruction ? [newState.activeConstruction] : [];
    }
    const finishedConstructions = [];
    const remainingConstructions = [];
    newState.activeConstructions.forEach((construction) => {
      if (dateReached(newDate, construction.endDate)) {
        finishedConstructions.push(construction);
      } else {
        remainingConstructions.push(construction);
      }
    });
    if (finishedConstructions.length > 0) {
      finishedConstructions.forEach((finishedConstruction) => {
        const finishedBuildingType = finishedConstruction.buildingType;
        let newLevel = 1;
        newState.buildings = newState.buildings.map((b) => {
          if (b.type === finishedBuildingType) {
            newLevel = b.level + 1;
            return { ...b, level: newLevel };
          }
          return b;
        });
        const getBuildingKey = (type) => {
          return Object.keys(BuildingType).find((key) => BuildingType[key] === type) || "Burogebaude";
        };
        const buildingKey = getBuildingKey(finishedBuildingType);
        const buildingName = t.studiogelaende?.buildings?.[buildingKey]?.name || finishedBuildingType;
        const newMessage = {
          id: `msg_const_${Date.now()}_${finishedBuildingType}`,
          date: newDate,
          sender: t.office.messages.buildingManagement,
          subjectTemplate: {
            key: "office.messages.constructionFinishedSubject",
            variables: { building: buildingName }
          },
          bodyTemplate: {
            key: "office.messages.constructionFinishedBody",
            variables: { building: buildingName, level: newLevel }
          },
          read: false
        };
        newMessages.push(newMessage);
      });
      newState.activeConstructions = remainingConstructions;
      newState.activeConstruction = remainingConstructions.length > 0 ? remainingConstructions[0] : null;
      dataChanged = true;
    }
    if (newState.activeMarketingCampaign && dateReached(newDate, newState.activeMarketingCampaign.endDate)) {
      const campaign = MARKETING_CAMPAIGNS.find((c) => c.id === newState.activeMarketingCampaign.campaignId);
      if (campaign) {
        const isSuccess = Math.random() < campaign.successChance;
        let repGained = 0;
        if (isSuccess) {
          const [min, max] = campaign.reputationRange;
          repGained = min + Math.floor(Math.random() * (max - min + 1));
          newState.reputation = Math.min(100, newState.reputation + repGained);
        }
        const marketer = newState.employees.find((e) => e.type === EmployeeType.Marketingmanager);
        if (marketer) {
          newState.employees = newState.employees.map(
            (e) => e.id === marketer.id ? { ...e, talent: Math.min(100, e.talent + 1) } : e
          );
        }
        setCampaignResultInfo({ name: campaign.name, success: isSuccess, reputationGained: repGained });
      }
      newState.activeMarketingCampaign = null;
      dataChanged = true;
      systemPause();
    }
    const activeProductionCampaigns = newState.activeProductionCampaigns && newState.activeProductionCampaigns.length > 0 ? newState.activeProductionCampaigns : newState.activeProductionCampaign ? [newState.activeProductionCampaign] : [];
    if (activeProductionCampaigns.length > 0) {
      const remainingCampaigns2 = [];
      activeProductionCampaigns.forEach((campaignInfo, campaignIndex) => {
        let shouldEnd = dateReached(newDate, campaignInfo.endDate);
        let targetProjectIndex = -1;
        const normalizedTargetTitle = campaignInfo.projectTitle?.trim().toLocaleLowerCase();
        if (newState.activeProjects) {
          if (normalizedTargetTitle) {
            targetProjectIndex = newState.activeProjects.findIndex(
              (p) => p.workingTitle.trim().toLocaleLowerCase() === normalizedTargetTitle
            );
          } else {
            targetProjectIndex = newState.activeProjects.findIndex(
              (p) => (p.phase === ProjectPhase.Production || p.phase === ProjectPhase.PostProduction) && p.usedProductionCampaigns?.includes(campaignInfo.campaignId)
            );
          }
        }
        if (targetProjectIndex > -1) {
          const project = newState.activeProjects[targetProjectIndex];
          if (project.phase === ProjectPhase.PostProduction && project.postProductionStartDate) {
            const ppStart = new Date(project.postProductionStartDate);
            const diffTime = newDate.getTime() - ppStart.getTime();
            const diffDays = Math.floor(diffTime / (1e3 * 3600 * 24));
            if (diffDays >= 5 || diffDays >= 0 && Math.random() < 0.25) {
              shouldEnd = true;
            }
          }
        }
        if (!shouldEnd) {
          remainingCampaigns2.push(campaignInfo);
          return;
        }
        const campaign = PRODUCTION_MARKETING_CAMPAIGNS.find((c) => c.id === campaignInfo.campaignId);
        if (!campaign) {
          dataChanged = true;
          return;
        }
        let bestEffectiveTalent = 0;
        let marketerId = -1;
        newState.employees.filter((e) => e.type === EmployeeType.Marketingmanager).forEach((e) => {
          const eff = e.talent * (e.satisfaction / 100);
          if (eff > bestEffectiveTalent) {
            bestEffectiveTalent = eff;
            marketerId = e.id;
          }
        });
        if (newState.partnerIsEmployed && newState.partnerEmployedAs === EmployeeType.Marketingmanager && newState.partnerSkills) {
          const eff = newState.partnerSkills.marketing;
          if (eff > bestEffectiveTalent) {
            bestEffectiveTalent = eff;
            marketerId = 99901;
          }
        }
        newState.children.forEach((c, idx) => {
          if (c.isEmployed && c.employedAs === EmployeeType.Marketingmanager && c.skills) {
            const eff = c.skills.marketing;
            if (eff > bestEffectiveTalent) {
              bestEffectiveTalent = eff;
              marketerId = 99910 + idx;
            }
          }
        });
        const hypeBonusMultiplier = 1 + bestEffectiveTalent / 200;
        if (marketerId !== -1 && marketerId < 9e4) {
          newState.employees = newState.employees.map(
            (e) => e.id === marketerId ? { ...e, talent: Math.min(100, e.talent + 1) } : e
          );
        }
        if (targetProjectIndex > -1 && newState.activeProjects) {
          const project = newState.activeProjects[targetProjectIndex];
          const hypeGained = Math.round(campaign.hypeGain * hypeBonusMultiplier);
          const newHype = Math.min(100, (project.hype || 0) + hypeGained);
          const updatedProject = {
            ...project,
            hype: newHype
          };
          newState.activeProjects[targetProjectIndex] = updatedProject;
          const translatedCampaignName = t.marketing.campaignData[campaign.id]?.name || campaign.name;
          const newMessage = {
            id: `msg_camp_${Date.now()}_${campaignInfo.campaignId}_${campaignIndex}`,
            date: newDate,
            sender: t.office.messages.marketingDepartment,
            subjectTemplate: {
              key: "office.messages.campaignFinishedSubject",
              variables: { campaignName: translatedCampaignName }
            },
            bodyTemplate: {
              key: "office.messages.campaignFinishedBody",
              variables: {
                campaignName: translatedCampaignName,
                filmTitle: project.workingTitle,
                hypeGain: hypeGained
              }
            },
            linkedProject: updatedProject,
            read: false
          };
          newMessages.push(newMessage);
        }
        dataChanged = true;
      });
      if (remainingCampaigns2.length !== activeProductionCampaigns.length) {
        newState.activeProductionCampaigns = remainingCampaigns2;
        newState.activeProductionCampaign = null;
      }
    }
    if (newState.activeCourse && dateReached(newDate, newState.activeCourse.endDate)) {
      const courseId = newState.activeCourse.courseId;
      const course = ALL_COURSES.find((c) => c.id === courseId);
      if (course) {
        if (course.skillBonus) {
          const { skill, amount } = course.skillBonus;
          if (typeof newState[skill] === "number") {
            newState[skill] = Math.min(100, newState[skill] + amount);
          }
        }
        newState.completedCourses = [...newState.completedCourses, courseId];
        setCourseFinishedInfo({ course });
      }
      newState.activeCourse = null;
      dataChanged = true;
      systemPause();
    }
    if (newState.activeSeminar && dateReached(newDate, newState.activeSeminar.endDate)) {
      const sem = newState.activeSeminar;
      if (sem.skillBonus) {
        const { skill, amount } = sem.skillBonus;
        if (typeof newState[skill] === "number") {
          newState[skill] = Math.min(100, newState[skill] + amount);
        }
      }
      if (sem.statBonus && sem.statBonus.stat === "personalReputation") {
        newState.personalReputation = Math.min(100, newState.personalReputation + sem.statBonus.amount);
      }
      if (sem.energyChange !== 0) {
        newState.energy = Math.max(0, Math.min(100, (newState.energy || 100) + sem.energyChange));
      }
      if (sem.type === "seminar") {
        newState.lastSeminarDate = new Date(newDate);
      } else {
        newState.lastLeisureDate = new Date(newDate);
      }
      newState.eventLog = [...newState.eventLog, {
        date: new Date(newDate),
        title: sem.type === "seminar" ? "Seminar beendet" : "Freizeit beendet",
        text: `${sem.name} erfolgreich abgeschlossen.`,
        category: "Personal"
      }];
      newState.activeSeminar = null;
      dataChanged = true;
    }
    if (!newState.activeCastings) {
      newState.activeCastings = newState.activeCasting ? [newState.activeCasting] : [];
    }
    const remainingCastings = [];
    let castingUpdated = false;
    newState.activeCastings.forEach((casting) => {
      if (dateReached(newDate, casting.endDate)) {
        const { talentId, isGeneralCasting, casterId, targetBekanntheit, talentName } = casting;
        if (casterId) {
          newState.employees = newState.employees.map(
            (e) => e.id === casterId ? { ...e, talent: Math.min(100, e.talent + 1) } : e
          );
        }
        let currentFame = 0;
        const updateFame = (t2) => {
          if (t2.id === talentId) {
            const newFame = Math.min(5, t2.bekanntheit + 1);
            currentFame = newFame;
            return { ...t2, bekanntheit: newFame };
          }
          return t2;
        };
        newState.directors = newState.directors.map((d) => updateFame(d));
        newState.actors = newState.actors.map((a) => updateFame(a));
        let isContinuing = false;
        let nextTargetId = talentId;
        let nextTargetName = talentName;
        if (isGeneralCasting) {
          if (currentFame < 5) {
            isContinuing = true;
          } else {
            const potentialTargets = [...newState.directors, ...newState.actors].filter((t2) => t2.isDiscovered && t2.bekanntheit < 5 && t2.id !== talentId).sort((a, b) => a.id - b.id);
            const nextTalent = potentialTargets.find((t2) => {
              if (t2.activeTraining) return false;
              if (t2.unavailableForProjectsUntil && newDate < new Date(t2.unavailableForProjectsUntil)) return false;
              if (newState.activeCastings.some((c) => c.talentId === t2.id && c.casterId !== casterId)) return false;
              return true;
            });
            if (nextTalent) {
              isContinuing = true;
              nextTargetId = nextTalent.id;
              nextTargetName = nextTalent.name;
            }
          }
        } else {
          if ((targetBekanntheit || 0) > 0 && currentFame < targetBekanntheit && currentFame < 5) {
            isContinuing = true;
          }
        }
        let subjectKey = "office.messages.castingSpecificSubject";
        let bodyKey = "office.messages.castingSpecificBody";
        if (isGeneralCasting) {
          if (isContinuing) {
            if (nextTargetId === talentId) {
              subjectKey = "office.messages.castingGeneralStepSubject";
              bodyKey = "office.messages.castingGeneralStepBody";
            } else {
              subjectKey = "office.messages.castingGeneralSubject";
              bodyKey = "office.messages.castingGeneralBody";
            }
          } else {
            subjectKey = "office.messages.castingGeneralCompleteSubject";
            bodyKey = "office.messages.castingGeneralCompleteBody";
          }
        }
        const newMessage = {
          id: `msg_cast_${Date.now()}_${casterId}`,
          date: newDate,
          sender: "Casting-Abteilung",
          subjectTemplate: {
            key: subjectKey,
            variables: { talentName }
          },
          bodyTemplate: {
            key: bodyKey,
            variables: { talentName }
          },
          read: false
        };
        newMessages.push(newMessage);
        if (isContinuing) {
          const caster = newState.employees.find((e) => e.id === casterId);
          const casterTalent = caster ? caster.talent : 50;
          const duration = Math.max(3, Math.round(50 - casterTalent * 0.4));
          const nextEndDate = new Date(newDate);
          nextEndDate.setDate(nextEndDate.getDate() + duration);
          remainingCastings.push({
            ...casting,
            talentId: nextTargetId,
            talentName: nextTargetName,
            startDate: new Date(newDate),
            endDate: nextEndDate
          });
        }
        if (!castingUpdated) {
          setCastingFinishedNotification({
            talentName,
            isContinuing,
            isGeneral: !!isGeneralCasting
          });
        }
        castingUpdated = true;
        dataChanged = true;
      } else {
        remainingCastings.push(casting);
      }
    });
    if (castingUpdated) {
      newState.activeCastings = remainingCastings;
      newState.activeCasting = null;
      systemPause();
    }
    if (!newState.activeCastingCampaigns) {
      newState.activeCastingCampaigns = newState.activeCastingCampaign ? [newState.activeCastingCampaign] : [];
    }
    const remainingCampaigns = [];
    let campaignUpdated = false;
    newState.activeCastingCampaigns.forEach((campaign) => {
      if (dateReached(newDate, campaign.endDate)) {
        const { scope, role, casterId, targetSkillLevel, targetAgeGroup } = campaign;
        if (casterId) {
          newState.employees = newState.employees.map(
            (e) => e.id === casterId ? { ...e, talent: Math.min(100, e.talent + 1) } : e
          );
        }
        let minTalents = 2;
        let maxTalents = 3;
        if (scope === "personal") {
          minTalents = 1;
          maxTalents = 2;
        }
        if (scope === "medium") {
          minTalents = 3;
          maxTalents = 6;
        }
        if (scope === "large") {
          minTalents = 8;
          maxTalents = 12;
        }
        const numTalents = Math.floor(Math.random() * (maxTalents - minTalents + 1)) + minTalents;
        const discovered = [];
        const caster = newState.employees.find((e) => e.id === casterId);
        let effectiveQuality = 10;
        if (caster) {
          const satisfactionFactor = (caster.satisfaction || 100) / 100;
          effectiveQuality = Math.round(caster.talent * satisfactionFactor);
        }
        let minSkill = 1;
        let maxSkill = 20;
        if (targetSkillLevel === 1) {
          minSkill = 1;
          maxSkill = 25;
        } else if (targetSkillLevel === 2) {
          minSkill = 20;
          maxSkill = 45;
        } else if (targetSkillLevel === 3) {
          minSkill = 40;
          maxSkill = 65;
        } else if (targetSkillLevel === 4) {
          minSkill = 60;
          maxSkill = 85;
        } else if (targetSkillLevel === 5) {
          minSkill = 80;
          maxSkill = 100;
        } else {
          minSkill = Math.max(1, effectiveQuality - 5);
          maxSkill = Math.min(100, effectiveQuality + 10);
        }
        const foundTalentIdsInBatch = /* @__PURE__ */ new Set();
        for (let i = 0; i < numTalents; i++) {
          const targetRole = role === "both" ? Math.random() < 0.5 ? "director" : "actor" : role;
          const isDirector = targetRole === "director";
          const pool = isDirector ? newState.directors : newState.actors;
          const candidates = pool.filter((t2) => {
            if (t2.isDiscovered) return false;
            if (t2.id === -1 || t2.isFamily) return false;
            if (foundTalentIdsInBatch.has(t2.id)) return false;
            if (t2.skill < minSkill || t2.skill > maxSkill) return false;
            if (!isDirector && targetAgeGroup) {
              const age = getAge(t2.birthDate, newState.gameDate);
              const category = getAgeCategory(age);
              if (category !== targetAgeGroup) return false;
            }
            return true;
          });
          let selectedTalent;
          if (candidates.length > 0) {
            selectedTalent = pickRandom(candidates);
            if (isDirector) {
              newState.directors = newState.directors.map((d) => d.id === selectedTalent.id ? { ...d, isDiscovered: true, bekanntheit: 1 } : d);
            } else {
              newState.actors = newState.actors.map((a) => a.id === selectedTalent.id ? { ...a, isDiscovered: true, bekanntheit: 1 } : a);
            }
            selectedTalent = { ...selectedTalent, isDiscovered: true, bekanntheit: 1 };
            foundTalentIdsInBatch.add(selectedTalent.id);
          } else {
            const newTalent = generateNewTalent(newState.directors, newState.actors, void 0, void 0, targetRole, false, void 0, newDate);
            newTalent.isDiscovered = true;
            newTalent.bekanntheit = 1;
            const specificSkill = Math.floor(Math.random() * (maxSkill - minSkill + 1)) + minSkill;
            newTalent.skill = specificSkill;
            newTalent.potential = Math.min(100, specificSkill + Math.floor(Math.random() * 30) + 5);
            let ageMin = 16, ageMax = 34;
            if (isDirector) {
              const forceOld = Math.random() < 0.4;
              if (forceOld) {
                ageMin = 60;
                ageMax = 80;
              } else {
                ageMin = 35;
                ageMax = 59;
              }
            } else {
              if (targetAgeGroup === ActorAge.Child) {
                ageMin = 6;
                ageMax = 15;
              } else if (targetAgeGroup === ActorAge.Young) {
                ageMin = 16;
                ageMax = 34;
              } else if (targetAgeGroup === ActorAge.MiddleAged) {
                ageMin = 35;
                ageMax = 59;
              } else if (targetAgeGroup === ActorAge.Old) {
                ageMin = 60;
                ageMax = 80;
              }
            }
            const age = Math.floor(Math.random() * (ageMax - ageMin + 1)) + ageMin;
            const birthYear = newDate.getFullYear() - age;
            const birthDate = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
            newTalent.birthDate = birthDate;
            const baseCost = isDirector ? 12e3 + 8 * Math.pow(specificSkill, 3.1) : 15e3 + 10 * Math.pow(specificSkill, 3.1);
            newTalent.cost = Math.round(baseCost / 100) * 100;
            if (isDirector) {
              newState.directors = [...newState.directors, newTalent];
            } else {
              newState.actors = [...newState.actors, newTalent];
            }
            selectedTalent = newTalent;
          }
          discovered.push(selectedTalent);
        }
        const listString = discovered.map((talent) => {
          const roleLabel = "speedModifier" in talent ? t.talentDossier.director : t.talentDossier.actor;
          const birthDate = new Date(talent.birthDate).toLocaleDateString(language === "de" ? "de-DE" : "en-US");
          return `- ${talent.name} (${roleLabel}, ${birthDate})`;
        }).join("\n");
        const newMessage = {
          id: `msg_scout_${Date.now()}_${casterId}`,
          date: newDate,
          sender: "Casting",
          subjectTemplate: {
            key: "office.messages.castingCampaignSubject",
            variables: {}
          },
          bodyTemplate: {
            key: "office.messages.castingCampaignBody",
            variables: {
              count: discovered.length,
              list: listString
            }
          },
          read: false
        };
        newMessages.push(newMessage);
        campaignUpdated = true;
        dataChanged = true;
      } else {
        remainingCampaigns.push(campaign);
      }
    });
    if (campaignUpdated) {
      newState.activeCastingCampaigns = remainingCampaigns;
      newState.activeCastingCampaign = null;
      systemPause();
    }
    if (!newState.activeTalentScoutings) {
      newState.activeTalentScoutings = newState.activeTalentScouting ? [newState.activeTalentScouting] : [];
    }
    const remainingScoutings = [];
    let scoutingUpdated = false;
    newState.activeTalentScoutings.forEach((scouting) => {
      if (dateReached(newDate, scouting.endDate)) {
        const { searchParams, scoutId } = scouting;
        const scout = newState.employees.find((e) => e.id === scoutId);
        const scoutTalent = scout ? scout.talent : 50;
        if (scout) {
          newState.employees = newState.employees.map(
            (e) => e.id === scout.id ? { ...e, talent: Math.min(100, e.talent + 1) } : e
          );
        }
        const newTalent = generateNewTalent(
          newState.directors,
          newState.actors,
          void 0,
          scoutTalent,
          searchParams.role,
          false,
          void 0,
          newDate
        );
        newTalent.isDiscovered = true;
        if (searchParams.qualityTier === "standard") newTalent.skill = Math.min(100, newTalent.skill + 5);
        if (searchParams.qualityTier === "umfangreich") newTalent.skill = Math.min(100, newTalent.skill + 10);
        if ("speedModifier" in newTalent) {
          newState.directors = [...newState.directors, newTalent];
        } else {
          newState.actors = [...newState.actors, newTalent];
        }
        setTalentScoutingResult({ talent: newTalent });
        scoutingUpdated = true;
        dataChanged = true;
      } else {
        remainingScoutings.push(scouting);
      }
    });
    if (scoutingUpdated) {
      newState.activeTalentScoutings = remainingScoutings;
      newState.activeTalentScouting = null;
      systemPause();
    }
    const allPersonnel = [...newState.directors, ...newState.actors, ...newState.employees];
    let trainingFinished = false;
    const updatedPersonnel = allPersonnel.map((person) => {
      if (person.activeTraining && dateReached(newDate, person.activeTraining.endDate)) {
        let message = "";
        const updatedPerson = { ...person, activeTraining: void 0 };
        const skillGain = 3 + Math.floor(Math.random() * 4);
        if ("skill" in updatedPerson) {
          const newSkill = Math.min(100, Math.min(updatedPerson.potential, updatedPerson.skill + skillGain));
          const actualGain = newSkill - updatedPerson.skill;
          updatedPerson.skill = newSkill;
          const trainingName = "speedModifier" in updatedPerson ? "Regie-Studium" : "Schauspielschule";
          message = `${person.name} hat das ${trainingName} abgeschlossen und ${actualGain} Talentpunkte gewonnen.`;
          setTrainingFinishedInfo({ talentName: person.name, message });
        } else {
          const newTalent = Math.min(100, updatedPerson.talent + skillGain);
          const actualGain = newTalent - updatedPerson.talent;
          updatedPerson.talent = newTalent;
          updatedPerson.lastTrainingDate = new Date(newDate);
          const typeMap = {
            [EmployeeType.Autor]: "autor",
            [EmployeeType.CastingMitarbeiter]: "castingMitarbeiter",
            [EmployeeType.Forscher]: "forscher",
            [EmployeeType.Marketingmanager]: "marketingmanager",
            [EmployeeType.ProjektPlaner]: "projektPlaner"
          };
          const roleKey = typeMap[updatedPerson.type];
          const roleName = t.office.employees.employeeTypes[roleKey] || updatedPerson.type;
          const newMessage = {
            id: `msg_train_${Date.now()}_${person.id}`,
            date: newDate,
            sender: t.office.messages.hrDepartment || "Personalabteilung",
            subjectTemplate: {
              key: "office.messages.trainingFinishedSubject",
              variables: { name: person.name }
            },
            bodyTemplate: {
              key: "office.messages.trainingFinishedBodies",
              // Points to the array
              variables: {
                name: person.name,
                role: roleName,
                gain: actualGain.toString(),
                total: newTalent.toString()
              }
            },
            read: false
          };
          newMessages.push(newMessage);
        }
        trainingFinished = true;
        return updatedPerson;
      }
      return person;
    });
    if (trainingFinished) {
      newState.directors = updatedPersonnel.filter((p) => "speedModifier" in p);
      newState.actors = updatedPersonnel.filter((p) => !("speedModifier" in p) && "isDiscovered" in p);
      newState.employees = updatedPersonnel.filter((p) => !("isDiscovered" in p));
      dataChanged = true;
    }
    if (newState.activeWriting && dateReached(newDate, newState.activeWriting.endDate)) {
      const { script, writerId } = newState.activeWriting;
      const writer = newState.employees.find((e) => e.id === writerId);
      const writerName = writer ? writer.name : writerId === -1 ? playerData.playerName : "Unbekannt";
      if (writer) {
        newState.employees = newState.employees.map(
          (e) => e.id === writer.id ? { ...e, talent: Math.min(100, e.talent + 1) } : e
        );
      }
      const baseQuality = 30;
      const talentBonus = writer ? writer.talent * 0.5 : 0;
      const randomFactor = Math.floor(Math.random() * 21) - 10;
      const eventMod = newState.activeWriting.qualityModifier || 0;
      let finalQuality = Math.max(1, Math.min(100, Math.round(baseQuality + talentBonus + randomFactor + eventMod)));
      const mainRoleGender = Math.random() > 0.5 ? "m\xE4nnlich" : "weiblich";
      const supportingRoleGender = Math.random() > 0.5 ? "m\xE4nnlich" : "weiblich";
      const ageOptions = Object.values(ActorAge);
      const mainRoleAge = pickRandom(ageOptions);
      const supportingRoleAge = pickRandom(ageOptions);
      const newScript = {
        ...script,
        id: `script_${Date.now()}`,
        quality: finalQuality,
        description: "Ein neu verfasstes Drehbuch voller Spannung.",
        price: Math.round((5e3 + finalQuality * finalQuality * 20) / 100) * 100,
        mainRole: { gender: mainRoleGender, age: mainRoleAge },
        supportingRole: { gender: supportingRoleGender, age: supportingRoleAge }
      };
      newState.availableScripts = [...newState.availableScripts, newScript];
      newState.activeWriting = null;
      const newMessage = {
        id: `msg_script_${Date.now()}`,
        date: newDate,
        sender: t.office.messages.scriptDepartment,
        subjectTemplate: {
          key: "office.messages.scriptFinishedSubject",
          variables: { title: script.title }
        },
        bodyTemplate: {
          key: "office.messages.scriptFinishedBody",
          variables: { title: script.title, quality: finalQuality, writer: writerName }
        },
        read: false
      };
      newMessages.push(newMessage);
      dataChanged = true;
    }
    if (dataChanged) {
      if (newMessages.length > 0) {
        newState.messages = [...newState.messages, ...newMessages];
      }
      setPlayerData({ ...newState });
    }
  }, [playerData, setPlayerData, systemPause, setConstructionFinishedInfo, setCampaignResultInfo, setCourseFinishedInfo, setTalentScoutingResult, setCastingFinishedNotification, setTrainingFinishedInfo, t, language]);
};
export {
  useActivityLoop
};
