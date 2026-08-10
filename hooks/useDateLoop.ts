
import React, { useEffect, useRef } from 'react';
import { PlayerData, BuildingType, EmployeeType, ProjectPhase, Message, SaveFile } from '../types';
import { BUILDING_DATA } from '../components/buildings';
import { ALL_PROPERTIES } from '../components/privateLifeData';
import { TODDLER_PORTRAITS, getNextStagePortrait, getChildToAdultPortrait } from '../components/portraits';
import { useTranslation } from './useTranslation';
import { persistSaveFiles } from './saveStorage';

interface UseDateLoopProps {
  setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
    enabled?: boolean;
}

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const useDateLoop = ({ setPlayerData, enabled = true }: UseDateLoopProps) => {
    const accumulatedRealtimeMsRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const { t, language } = useTranslation();
    const REALTIME_UPDATE_STEP_MS = 1000;

    const getDaysInMonth = (date: Date) =>
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();

    const getUtcDayNumber = (date: Date): number => {
        return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / (24 * 60 * 60 * 1000));
    };

    const calculateNextRealtimeGameDate = (currentGameDate: Date, elapsedRealMs: number): Date => {
        const clampedElapsedMs = Math.max(0, elapsedRealMs);
        if (clampedElapsedMs <= 0) {
            return new Date(currentGameDate);
        }

        // Real-time rule: 1 real day = 1 in-game month.
        const daysInCurrentIngameMonth = getDaysInMonth(currentGameDate);
        const ingameMsToAdvance = clampedElapsedMs * daysInCurrentIngameMonth;
        return new Date(currentGameDate.getTime() + ingameMsToAdvance);
    };

    useEffect(() => {
        if (!enabled) {
            return;
        }

    const gameTick = (timestamp: number) => {
      let deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

            accumulatedRealtimeMsRef.current += deltaTime;

            if (accumulatedRealtimeMsRef.current >= REALTIME_UPDATE_STEP_MS) {
                accumulatedRealtimeMsRef.current = 0;

                setPlayerData(currentData => {
                    if (!currentData) return currentData;

                    const previousDate = new Date(currentData.gameDate);
                    const newDate = calculateNextRealtimeGameDate(previousDate, REALTIME_UPDATE_STEP_MS);

                    const daysPassed = getUtcDayNumber(newDate) - getUtcDayNumber(previousDate);

                    if (daysPassed <= 0) {
                        return {
                            ...currentData,
                            gameDate: newDate,
                        };
                    }

                    const isTestMode = currentData.playerName === 'Max Mustermann' && currentData.studioName === 'Teststudio';

                    let newMessages = [...currentData.messages];

            // --- Daily Logic: Research Progress Calculation ---
            let addedResearchProgress = 0;
            let researchPointsPerDay = 0;
            const researchLab = currentData.buildings.find(b => b.type === BuildingType.ResearchLab && b.level > 0);
            
            // 1. Employees
            const researchers = currentData.employees.filter(e => e.type === EmployeeType.Forscher);
            // 2. Partner
            const isPartnerResearcher = currentData.partnerIsEmployed && currentData.partnerEmployedAs === EmployeeType.Forscher;
            // 3. Children
            const childResearchers = currentData.children.filter(c => c.isEmployed && c.employedAs === EmployeeType.Forscher);

            if (researchLab) {
                let pointsPerDay = 1; // Base value
                
                // Building Bonus
                const labData = BUILDING_DATA[BuildingType.ResearchLab].levels[researchLab.level - 1];
                if (labData?.bonusEffect?.researchPointsPerDay) {
                    pointsPerDay = labData.bonusEffect.researchPointsPerDay;
                }

                // Talent Bonus Calculation (USING EFFECTIVE TALENT NOW)
                let totalResearcherTalent = 0;
                
                // Add Employees
                totalResearcherTalent += researchers.reduce((sum, r) => sum + (r.talent * (r.satisfaction / 100)), 0);
                
                // Add Partner
                if (isPartnerResearcher && currentData.partnerSkills) {
                    // For family, assume 100% satisfaction for simplicity, or we could track relationship?
                    // Let's assume 100% for now.
                    totalResearcherTalent += currentData.partnerSkills.research;
                }
                
                // Add Children
                childResearchers.forEach(child => {
                    if (child.skills) {
                        totalResearcherTalent += child.skills.research;
                    }
                });

                pointsPerDay += Math.floor(totalResearcherTalent / 25);

                researchPointsPerDay = pointsPerDay;
                addedResearchProgress = pointsPerDay * daysPassed;
            }
            // -----------------------------------------------

            // --- Daily Logic: Energy/Stress Calculation ---
            let dailyEnergyChange = 0;
            const currentEnergy = currentData.energy || 100;

            // 1. Base Stress REMOVED

            // 2. Project Stress (Accumulated from all active projects)
            if (currentData.activeProjects && currentData.activeProjects.length > 0) {
                currentData.activeProjects.forEach(proj => {
                    const phase = proj.phase;
                    if (phase === ProjectPhase.Production) {
                        // High Stress during shooting (~ -5% / week)
                        dailyEnergyChange -= (0.71 * daysPassed); 
                    } else if (phase === ProjectPhase.Casting || phase === ProjectPhase.PostProduction) {
                         // Moderate Stress during Casting/Post (~ -3% / week)
                        dailyEnergyChange -= (0.43 * daysPassed); 
                    }
                });
            }

            // 3. Active Course Stress (5-10 energy per week)
            if (currentData.activeCourse && currentData.activeCourse.weeklyEnergyCost) {
                dailyEnergyChange -= (currentData.activeCourse.weeklyEnergyCost / 7) * daysPassed;
            }

            // 4. Recovery from Home
            const activeProperty = ALL_PROPERTIES.find(p => p.id === currentData.activePropertyId);
            const weeklyRecovery = activeProperty?.recoveryBonus || 2; // Default to rental (+2)
            dailyEnergyChange += (weeklyRecovery / 7) * daysPassed;
            
            let newEnergy = Math.max(0, Math.min(100, currentEnergy + dailyEnergyChange));
            let newEventLog = [...currentData.eventLog];

            // 5. Burnout Check
            if (newEnergy <= 0) {
                 newEnergy = 50; // Reset to 50%
                 newDate.setDate(newDate.getDate() + 28); // Force skip 4 weeks
                 
                 newEventLog.push({
                     date: new Date(currentData.gameDate), // Use original date for log
                     title: "BURNOUT!",
                     text: "Sie sind zusammengebrochen. Der Stress war zu viel. Sie mussten 4 Wochen Zwangspause einlegen, um sich zu erholen. Achten Sie auf Ihre Gesundheit!",
                     category: 'Personal'
                 });
            }

            // --- Birthday Check ---
            if (currentData.playerBirthDate) {
                const birthDate = new Date(currentData.playerBirthDate);
                if (newDate.getDate() === birthDate.getDate() && newDate.getMonth() === birthDate.getMonth()) {
                    const msgs = t.office.birthdayMessages || ["Happy Birthday!"];
                    const randomMsg = pickRandom(msgs);
                    
                    // Construct Salutation
                    const lastName = currentData.playerName.split(' ').pop() || '';
                    const salutationTemplate = currentData.gender === 'männlich'
                        ? t.office.messages.salutationMale
                        : t.office.messages.salutationFemale;
                    const salutation = salutationTemplate.replace('{lastName}', lastName);
                    
                    const fullBody = `${salutation},\n\n${randomMsg}`;
                    
                    const birthdayMessage: Message = {
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

            // --- Child Aging & Portrait Update ---
            let newChildren = currentData.children.map(child => {
                let updatedChild = { ...child };
                
                // Test Mode: Fast Aging
                if (isTestMode && newDate.getDay() === 1 && new Date(currentData.gameDate).getDay() !== 1) {
                     const newBirth = new Date(updatedChild.birthDate);
                     newBirth.setFullYear(newBirth.getFullYear() - 1); // Make them 1 year older
                     updatedChild.birthDate = newBirth;
                }

                const age = Math.floor((newDate.getTime() - new Date(updatedChild.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));

                // 1. Baby -> Toddler (3 Jahre)
                if (age >= 3 && updatedChild.portraitId && (updatedChild.portraitId.startsWith('b') || updatedChild.portraitId.startsWith('baby_'))) {
                    if (updatedChild.isAdopted) {
                        updatedChild.portraitId = pickRandom(TODDLER_PORTRAITS);
                    } else {
                        updatedChild.portraitId = getNextStagePortrait(updatedChild.portraitId, 'toddler');
                    }
                }

                // 2. Toddler -> Kind/Erwachsenen-Basis (6 Jahre)
                if (age >= 6 && updatedChild.portraitId && (updatedChild.portraitId.startsWith('1j') || updatedChild.portraitId.startsWith('toddler_'))) {
                     updatedChild.portraitId = getChildToAdultPortrait(updatedChild.portraitId, updatedChild.gender);
                }

                return updatedChild;
            });
            
            // --- BANKRUPTCY CHECK ---
            const bankruptcyLimit = isTestMode ? -1000 : -100000;
            let bankruptcyDeadline = currentData.bankruptcyDeadline;
            let isBankrupt = false;

            // 1. Trigger Warning
            if (currentData.capital < bankruptcyLimit && !bankruptcyDeadline) {
                const deadline = new Date(newDate);
                deadline.setDate(deadline.getDate() + 28); // 4 weeks
                bankruptcyDeadline = deadline;
                
                const locale = language === 'de' ? 'de-DE' : 'en-US';
                const deadlineStr = deadline.toLocaleDateString(locale);

                const warningMsg: Message = {
                    id: `msg_bank_warn_${Date.now()}`,
                    date: new Date(newDate),
                    sender: "Bank",
                    subjectTemplate: {
                        key: 'office.messages.bankruptcyWarningSubject',
                        variables: {}
                    },
                    bodyTemplate: {
                        key: 'office.messages.bankruptcyWarningBody',
                        variables: { date: deadlineStr }
                    },
                    read: false
                };
                newMessages.push(warningMsg);
            }
            
            // 2. Check Recovery
            if (bankruptcyDeadline && currentData.capital >= bankruptcyLimit) {
                bankruptcyDeadline = undefined;
            }
            
            // 3. Check Game Over
            if (bankruptcyDeadline && newDate >= new Date(bankruptcyDeadline)) {
                if (currentData.capital < bankruptcyLimit) {
                    isBankrupt = true;
                } else {
                    bankruptcyDeadline = undefined;
                }
            }

            // --- MESSAGE CLEANUP LOGIC ---
            const cleanedMessages = newMessages.filter(msg => {
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
            
            // === CONSTRUCT FINAL STATE ===
            const finalState: PlayerData = { 
                ...currentData, 
                gameDate: newDate,
                researchPoints: 0,
                activeResearch: currentData.activeResearch
                    ? (() => {
                        const progressPoints = Math.min(
                            currentData.activeResearch.requiredPoints,
                            currentData.activeResearch.progressPoints + addedResearchProgress
                        );
                        const remainingPoints = Math.max(0, currentData.activeResearch.requiredPoints - progressPoints);
                        const remainingDays = remainingPoints > 0
                            ? Math.ceil(remainingPoints / Math.max(researchPointsPerDay, 1))
                            : 0;
                        const endDate = new Date(newDate);
                        endDate.setDate(endDate.getDate() + remainingDays);

                        return {
                            ...currentData.activeResearch,
                            progressPoints,
                            endDate,
                        };
                    })()
                    : currentData.activeResearch,
                energy: newEnergy,
                eventLog: newEventLog,
                children: newChildren,
                bankruptcyDeadline: bankruptcyDeadline,
                isBankrupt: isBankrupt,
                messages: cleanedMessages
            };

            // --- AUTO-SAVE LOGIC (Monthly) ---
            if (newDate.getMonth() !== currentData.gameDate.getMonth()) {
                try {
                    const savedData = localStorage.getItem('film_tycoon_saves');
                    let saves: SaveFile[] = savedData ? JSON.parse(savedData) : [];
                    
                    const autoSave: SaveFile = {
                        slotId: 0,
                        timestamp: new Date().toISOString(),
                        data: finalState
                    };
                    
                    saves = saves.filter(s => s.slotId !== 0);
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
    }, [enabled, setPlayerData, t, language]);
};
