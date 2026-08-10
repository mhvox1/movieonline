import React, { useEffect } from 'react';
import { PlayerData, ProjectPhase, ProjectData, Message } from '../types';
import { calculateFinalQuality } from '../components/qualityCalculator';
import { generateNewTalentsForCastingPool } from '../components/talentGenerator';
import { CASTING_OPTIONS } from '../components/constants';
import { PRODUCTION_MARKETING_CAMPAIGNS } from '../components/marketingData';
import { useTranslation } from './useTranslation';

interface UseProjectLoopProps {
    playerData: PlayerData;
    setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
    systemPause: () => void;
}

export const useProjectLoop = ({
    playerData,
    setPlayerData,
    systemPause,
}: UseProjectLoopProps) => {
    const gameDate = playerData.gameDate;
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    useEffect(() => {
        setPlayerData(currentData => {
            if (!currentData) return currentData;
    
            const newDate = new Date(currentData.gameDate);
            let newState = { ...currentData };
            let dataChanged = false;
    
            // CRITICAL FIX: Create a shallow copy of the array to ensure React detects the change
            newState.pendingNotifications = [...(currentData.pendingNotifications || [])];

            // 1. Handle Active Planning
            if (newState.activePlanning) {
                if (newState.activePlanning.contract && newState.activePlanning.contractDeadline && newDate > new Date(newState.activePlanning.contractDeadline)) {
                     const penalty = newState.activePlanning.contract.penalty;
                     const upfront = newState.activePlanning.contract.upfrontPayment || 0;
                     const totalDeduction = penalty + upfront;
                     const formattedPenalty = formatCurrency(penalty);
                     const formattedUpfront = formatCurrency(upfront);

                     const subject = language === 'de'
                         ? `Fristüberschreitung: ${newState.activePlanning.contract.title}`
                         : `Deadline Missed: ${newState.activePlanning.contract.title}`;
                     const body = language === 'de'
                         ? `Sehr geehrte Damen und Herren,\n\nleider müssen wir feststellen, dass Sie die vereinbarte Frist für die Fertigstellung von "${newState.activePlanning.contract.title}" überschritten haben.\n\nDamit gilt der Auftrag als gescheitert. Die Vertragsstrafe von ${formattedPenalty} sowie der Vorschuss von ${formattedUpfront} werden fällig und Ihrem Konto belastet.\n\nMit freundlichen Grüßen,\n${newState.activePlanning.contract.stationName}`
                         : `Dear Sir or Madam,\n\nWe regret to note that you have exceeded the agreed deadline for "${newState.activePlanning.contract.title}".\n\nThe contract is considered failed. The penalty of ${formattedPenalty} and the advance of ${formattedUpfront} are due and charged to your account.\n\nSincerely,\n${newState.activePlanning.contract.stationName}`;

                     const failMessage: Message = {
                        id: `msg_contract_fail_time_${Date.now()}`,
                        date: new Date(newState.gameDate),
                        sender: newState.activePlanning.contract.stationName,
                        subject: subject,
                        body: body,
                        read: false
                     };

                     newState.capital -= totalDeduction;
                     newState.messages = [...newState.messages, failMessage];
                     newState.transactionLog = [...newState.transactionLog, {
                         date: new Date(newState.gameDate),
                         type: 'Ausgabe',
                         category: 'Filmproduktion',
                         description: language === 'de'
                             ? `Vertragsstrafe (Frist): "${newState.activePlanning.contract.title}"`
                             : `Contract penalty (deadline): "${newState.activePlanning.contract.title}"`,
                         amount: totalDeduction
                     }];
                     newState.activePlanning = null;
                     dataChanged = true;
                } else if (newState.activePlanning.projectPotential !== undefined && newDate >= new Date(newState.activePlanning.scriptEndDate)) {
                    // IMPROVEMENT: Planner gains skill
                    if (newState.activePlanning.plannerId) {
                        newState.employees = newState.employees.map(e => 
                            e.id === newState.activePlanning!.plannerId ? { ...e, talent: Math.min(100, e.talent + 1) } : e
                        );
                    }

                    const finishedPlanning = {
                        ...newState.activePlanning,
                        phase: newState.activePlanning.projectType === 'series' ? ProjectPhase.CastingSetup : ProjectPhase.ScriptFinished
                    };
                    const newTemplate = { ...finishedPlanning, templateTitle: finishedPlanning.workingTitle };
                    newState.savedProjectTemplates = [...(newState.savedProjectTemplates || []), newTemplate];
                    newState.pendingNotifications.push({ type: 'planningFinished', title: newTemplate.workingTitle });
                    newState.activePlanning = null;
                    dataChanged = true;
                }
            }
    
            // 2. Handle Active Production Projects
            if (newState.activeProjects && newState.activeProjects.length > 0) {
                let updatedProjects = [...newState.activeProjects];
                let projectsModifiedInLoop = false;
                
                for (let i = updatedProjects.length - 1; i >= 0; i--) {
                    let project = { ...updatedProjects[i] };
                    let projectUpdated = false;

                    // CONTRACT DEADLINE CHECK
                    if (project.contract && project.contractDeadline && newDate > new Date(project.contractDeadline)) {
                        updatedProjects.splice(i, 1);
                        projectsModifiedInLoop = true;
                        dataChanged = true;
                        continue; 
                    }
        
                    // Check Phases
                    if (project.phase === ProjectPhase.Scriptwriting && newDate >= new Date(project.scriptEndDate)) {
                        project.phase = ProjectPhase.CastingSetup;
                        projectUpdated = true;
                    } else if (project.phase === ProjectPhase.Casting && project.castingEndDate && newDate >= new Date(project.castingEndDate)) {
                        project.phase = ProjectPhase.CastingFinished;
                        
                        const invitedIds = project.castingInvitedActors || [];
                        if (invitedIds.length > 0) {
                            newState.directors = newState.directors.map(d => invitedIds.includes(d.id) ? { ...d, bekanntheit: Math.min(5, d.bekanntheit + 1) } : d);
                            newState.actors = newState.actors.map(a => invitedIds.includes(a.id) ? { ...a, bekanntheit: Math.min(5, a.bekanntheit + 1) } : a);
                        }

                        const castingOption = CASTING_OPTIONS.find(c => c.level === project.castingLevel);
                        if (castingOption) {
                            const { newActors, newDirectors } = generateNewTalentsForCastingPool(castingOption, project, newState);
                            project.castingActorPool = newActors;
                            project.castingDirectorPool = newDirectors;

                            // PERSIST DISCOVERED TALENTS GLOBALLY
                            // 1. Update existing talents that were found in the DB (isDiscovered=true)
                            const discoveredActorIds = new Set(newActors.map(a => a.id));
                            const discoveredDirectorIds = new Set(newDirectors.map(d => d.id));
                            
                            newState.actors = newState.actors.map(a => 
                                discoveredActorIds.has(a.id) 
                                ? { ...a, isDiscovered: true, bekanntheit: Math.max(1, a.bekanntheit) } 
                                : a
                            );
                            
                            newState.directors = newState.directors.map(d => 
                                discoveredDirectorIds.has(d.id) 
                                ? { ...d, isDiscovered: true, bekanntheit: Math.max(1, d.bekanntheit) } 
                                : d
                            );

                            // 2. Add NEWLY GENERATED talents (random fallbacks) that are not yet in the main list
                            newActors.forEach(a => {
                                if (!newState.actors.some(existing => existing.id === a.id)) {
                                    newState.actors.push(a);
                                }
                            });
                            newDirectors.forEach(d => {
                                if (!newState.directors.some(existing => existing.id === d.id)) {
                                    newState.directors.push(d);
                                }
                            });
                        }
                        
                        newState.pendingNotifications.push({ type: 'castingFinished', title: project.workingTitle, justifications: null });
                        projectUpdated = true;

                    } else if (project.phase === ProjectPhase.Production && project.productionEndDate && newDate >= new Date(project.productionEndDate)) {
                        project.phase = ProjectPhase.PostProductionSetup;
                        newState.pendingNotifications.push({ type: 'productionFinished', title: project.workingTitle });
                        projectUpdated = true;
                    } else if (project.phase === ProjectPhase.PostProduction && project.postProductionEndDate && newDate >= new Date(project.postProductionEndDate)) {
                        const { finalQuality, breakdown } = calculateFinalQuality(project, newState);

                        const weeklyCostsTransactions = newState.transactionLog.filter(t =>
                            t.category === 'Filmproduktion' &&
                            ((t.descriptionKey === 'weeklyProductionCosts' && t.descriptionVars?.filmTitle === project.workingTitle) || t.description.includes(`"${project.workingTitle}"`))
                        );
                        const totalWeeklyCosts = weeklyCostsTransactions.reduce((sum, t) => sum + t.amount, 0);

                        const productionEventTransactions = newState.transactionLog.filter(t =>
                            project.productionStartDate &&
                            t.category === 'Filmproduktion' &&
                            t.type === 'Ausgabe' &&
                            (t.description.startsWith('Produktions-Event:') || t.description.startsWith('Production Event:')) &&
                            new Date(t.date) >= new Date(project.productionStartDate)
                        );
                        const totalProductionEventCosts = productionEventTransactions.reduce((sum, t) => sum + t.amount, 0);

                        const marketingCampaignTransactions = newState.transactionLog.filter(t =>
                            t.category === 'Marketing' &&
                            t.type === 'Ausgabe' &&
                            t.descriptionKey === 'marketingCampaign' &&
                            t.descriptionVars?.filmTitle === project.workingTitle
                        );
                        const totalMarketingCampaignCosts = marketingCampaignTransactions.reduce((sum, t) => sum + t.amount, 0);

                        const totalCost = (project.scriptBudget || 0) +
                            (project.movieSizeBudget || 0) +
                            (project.seriesPlanningCost || 0) +
                            (project.castingCost || 0) +
                            (project.directorGage || 0) +
                            (project.mainActorGage || 0) +
                            (project.supportingActorGage || 0) +
                            (project.productionCost || 0) +
                            (project.postProductionCost || 0) +
                            totalWeeklyCosts +
                            totalProductionEventCosts +
                            totalMarketingCampaignCosts;
                        
                        // Apply Active Marketing Campaign Hype (per-project campaign)
                        let currentHype = project.hype || 0;
                        const activeCampaigns = (newState.activeProductionCampaigns && newState.activeProductionCampaigns.length > 0)
                            ? [...newState.activeProductionCampaigns]
                            : (newState.activeProductionCampaign ? [newState.activeProductionCampaign] : []);
                        const normalizedProjectTitle = project.workingTitle.trim().toLocaleLowerCase();
                        let campaignIndex = activeCampaigns.findIndex(c => {
                            const target = c.projectTitle?.trim().toLocaleLowerCase();
                            return target === normalizedProjectTitle;
                        });

                        if (campaignIndex === -1) {
                            campaignIndex = activeCampaigns.findIndex(c => !c.projectTitle);
                        }

                        if (campaignIndex > -1) {
                            const activeCampaignInfo = activeCampaigns[campaignIndex];
                            const campaign = PRODUCTION_MARKETING_CAMPAIGNS.find(c => c.id === activeCampaignInfo.campaignId);
                            if (campaign) {
                                const hypeGain = campaign.hypeGain;
                                currentHype = Math.min(100, currentHype + hypeGain);
                                
                                // Add log entry for transparency
                                const translatedCampaignName = t.marketing.campaignData[campaign.id as keyof typeof t.marketing.campaignData]?.name || campaign.name;
                                newState.transactionLog.push({
                                    date: new Date(newState.gameDate),
                                    type: 'Einnahme', // Green entry to indicate success
                                    category: 'Marketing',
                                    description: `Kampagnen-Erfolg: ${translatedCampaignName} (+${hypeGain} Hype)`,
                                    amount: 0 // No money involved here, just info
                                });
                            }

                            activeCampaigns.splice(campaignIndex, 1);
                            newState.activeProductionCampaigns = activeCampaigns;
                            newState.activeProductionCampaign = null;
                        }

                        const completedProject = { ...project, phase: ProjectPhase.Completed, finalQuality, qualityBreakdown: breakdown, hype: currentHype, totalCost };
                        
                        newState.completedFilms = [...newState.completedFilms, completedProject];
                        updatedProjects.splice(i, 1);
                        
                        if (completedProject.templateTitle) {
                            newState.savedProjectTemplates = (newState.savedProjectTemplates || []).filter(t => t.workingTitle !== completedProject.templateTitle);
                        }
                        
                        newState.pendingNotifications.push({ type: 'completed', title: completedProject.workingTitle, quality: finalQuality });
                        
                        // Set as current project for the result screen to pick up
                        newState.currentProject = completedProject; 

                        projectsModifiedInLoop = true;
                        continue; // Go to next project in loop
                    }
        
                    if (projectUpdated) {
                        updatedProjects[i] = project;
                        projectsModifiedInLoop = true;
                    }
                }
                
                if (projectsModifiedInLoop) {
                    newState.activeProjects = updatedProjects;
                    dataChanged = true;
                }
            }
            
            const notificationCountChanged = newState.pendingNotifications.length !== (currentData.pendingNotifications || []).length;

            if (dataChanged || notificationCountChanged) {
                return newState;
            }

            return currentData;
        });
    }, [gameDate, setPlayerData]);
};