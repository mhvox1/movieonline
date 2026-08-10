
import React, { useEffect } from 'react';
import { PlayerData, MaritalStatus, WriterEvent, ProductionEvent, Message, RandomEvent, EmployeeType } from '../types';
import { isSameDay, dateReached } from './helpers';
import { ALL_EVENTS, generatePartnerEvent } from '../components/events';
import { PRODUCTION_EVENTS } from '../components/productionEvents';
import { ALL_FESTIVALS } from '../components/festivalData';
import { useTranslation } from './useTranslation';
import { applyTransaction, newspaperImage } from '../components/events/eventHelpers';
import { DECISION_EVENTS, resolveDecisionEvent } from '../components/events/studio/decisionEvents';
import { getSecurityEventProtection, SECURITY_EVENT_IDS } from '../components/studioBuildingEffects';

interface ActiveEventState {
    event: RandomEvent;
    deltas: {
        capitalChange: number;
        reputationChange: number;
        researchPointsChange: number;
    };
    resultingState: PlayerData;
}

interface UseEventLoopProps {
    playerData: PlayerData;
    setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
    systemPause: () => void;
    setActiveEvent: React.Dispatch<React.SetStateAction<ActiveEventState | null>>;
    setActiveWritingEvent: React.Dispatch<React.SetStateAction<WriterEvent | null>>;
    pauseOnMessage: boolean;
}

const normalizeResearchDelta = (previousState: PlayerData, nextState: PlayerData) => {
    const researchPointsChange = (nextState.researchPoints || 0) - (previousState.researchPoints || 0);
    let normalizedState = nextState;

    if (researchPointsChange !== 0 && nextState.activeResearch) {
        const requiredPoints = nextState.activeResearch.requiredPoints ?? previousState.activeResearch?.requiredPoints ?? 0;
        const currentProgress = nextState.activeResearch.progressPoints ?? previousState.activeResearch?.progressPoints ?? 0;

        normalizedState = {
            ...nextState,
            activeResearch: {
                ...nextState.activeResearch,
                requiredPoints,
                progressPoints: Math.max(0, Math.min(requiredPoints, currentProgress + researchPointsChange)),
            },
        };
    }

    if (normalizedState.researchPoints !== 0) {
        normalizedState = {
            ...normalizedState,
            researchPoints: 0,
        };
    }

    return {
        updatedPlayerData: normalizedState,
        researchPointsChange,
    };
};

export const useEventLoop = ({
    playerData,
    setPlayerData,
    systemPause,
    setActiveEvent,
    setActiveWritingEvent,
    pauseOnMessage,
}: UseEventLoopProps) => {
    const gameDate = playerData.gameDate;
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    useEffect(() => {
        setPlayerData(currentData => {
            if (!currentData) return null;

            const newDate = new Date(currentData.gameDate);
            const isTestMode = currentData.playerName === 'Max Mustermann' && currentData.studioName === 'Teststudio';
            
            // --- EVENT PRIORITY LOGIC ---

            // 1. Production Events (Highest Priority)
            const isFestivalDay = ALL_FESTIVALS.some(f => f.month === newDate.getMonth() && f.day === newDate.getDate());
            
            // Find ALL projects that have an event today
            const projectsWithEvents = (currentData.activeProjects || []).filter(p => 
                p.nextProductionEventDate &&
                dateReached(newDate, p.nextProductionEventDate) &&
                newDate.getDate() !== 1 &&
                !isFestivalDay &&
                p.productionEndDate && newDate < new Date(p.productionEndDate)
            );

            // We only trigger ONE production event per tick to avoid spamming. 
            // Pick one randomly if multiple coincide.
            if (projectsWithEvents.length > 0) {
                const project = projectsWithEvents[Math.floor(Math.random() * projectsWithEvents.length)];

                const eligibleEvents = PRODUCTION_EVENTS.filter(event => {
                    if (!event.isTalentSpecific) return true;
                        const directorId = project.directorId;
                    const actorIds = [project.mainActorId, project.supportingActorId]
                        .filter(id => id !== undefined && id !== -1) as number[];
                    const directorIdArray = (directorId !== undefined && directorId !== -1) ? [directorId] : [];
                    switch (event.talentRole) {
                        case 'actor': return actorIds.length > 0;
                        case 'director': return directorIdArray.length > 0;
                        case 'any': return actorIds.length > 0 || directorIdArray.length > 0;
                        default: return false;
                    }
                });
                
                if (eligibleEvents.length > 0) {
                    let eventToTriggerRaw = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
                    let eventToTrigger = { ...eventToTriggerRaw };
                    
                    // Resolve specific talent for placeholder replacement
                    let talentPool: number[] = [];
                    if (eventToTrigger.isTalentSpecific) {
                        const directorId = project.directorId;
                        const actorIds = [project.mainActorId, project.supportingActorId]
                            .filter(id => id !== undefined && id !== -1) as number[];
                        const directorIdArray = (directorId !== undefined && directorId !== -1) ? [directorId] : [];

                        switch (eventToTrigger.talentRole) {
                            case 'actor': talentPool = actorIds; break;
                            case 'director': talentPool = directorIdArray; break;
                            case 'any': default: talentPool = [...directorIdArray, ...actorIds]; break;
                        }
                        if (talentPool.length > 0) {
                            const talentId = talentPool[Math.floor(Math.random() * talentPool.length)];
                            eventToTrigger.talentId = talentId;
                        }
                    }
                    
                    const translatedEvent = t.productionEvents[eventToTrigger.id];
                    const displayTitle = translatedEvent?.title || (language === 'de' ? eventToTrigger.title : 'Production Event');
                    const displayTextRaw = translatedEvent?.text || (language === 'de' ? eventToTrigger.text : '');

                    const talent = eventToTrigger.talentId ? [...currentData.directors, ...currentData.actors].find(t => t.id === eventToTrigger.talentId) : null;
                    const talentName = talent ? talent.name : 'Crew';
                    const displayText = displayTextRaw.replace(/{talentName}/g, talentName);
                    const filmTitle = project.workingTitle;

                    let newState = { ...currentData };
                    
                    const updateActiveProject = (updatedProj: any) => {
                         newState.activeProjects = newState.activeProjects.map(p => 
                             p.workingTitle === project.workingTitle ? { ...p, ...updatedProj } : p
                         );
                    };

                    if (eventToTrigger.actions.length > 1) {
                         // Interactive Event Logic
                        const resolvedEffects: Record<string, any> = {};
                        const totalProjectCost = (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0) + (project.productionCost || 0);

                        eventToTrigger.actions.forEach(action => {
                            const eff = action.effect;
                            const res: any = {};
                            if (eff.dynamicCostRange) {
                                    const [minP, maxP] = eff.dynamicCostRange;
                                    const pct = minP + Math.random() * (maxP - minP);
                                    res.cost = Math.round(totalProjectCost * (pct / 100));
                            } else if (eff.costModifier) {
                                    res.cost = eff.costModifier;
                            }
                            if (eff.durationModifier) res.duration = eff.durationModifier;
                            if (eff.qualityModifier) res.quality = eff.qualityModifier;
                            if (eff.hypeModifier) res.hype = eff.hypeModifier;
                            if (eff.reputationModifier) res.reputation = eff.reputationModifier;
                            resolvedEffects[action.value] = res;
                        });

                        const newMessage: Message = {
                            id: `msg_prod_event_${Date.now()}_${Math.random()}`,
                            date: newDate,
                            sender: t.office.messages.productionReport,
                            subjectTemplate: {
                                key: 'office.messages.setDecisionRequired',
                                variables: {}
                            },
                            body: displayText,
                            read: false,
                            productionEventContext: {
                                eventId: eventToTrigger.id,
                                talentId: eventToTrigger.talentId,
                                filmTitle: filmTitle,
                                isResolved: false,
                                resolvedEffects: resolvedEffects
                            },
                            linkedProject: project, // ADDED FOR COVER DISPLAY
                        };
                        newState.messages = [...newState.messages, newMessage];
                    } 
                    else {
                        // Passive Event Logic
                        const action = eventToTrigger.actions[0];
                        const eff = action.effect;
                        
                        let cost = 0;
                        if (eff.costModifier) cost = eff.costModifier;
                        if (eff.dynamicCostRange) {
                            const totalProjectCost = (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0) + (project.productionCost || 0);
                            const [minP, maxP] = eff.dynamicCostRange;
                            const pct = minP + Math.random() * (maxP - minP);
                            cost = Math.round(totalProjectCost * (pct / 100));
                        }

                        const updates: any = {};
                        if (eff.qualityModifier) {
                            updates.productionQualityModifier = (project.productionQualityModifier || 0) + eff.qualityModifier;
                        }
                        if (eff.hypeModifier) {
                            const oldHype = project.hype || 0;
                            updates.hype = Math.max(0, Math.min(100, oldHype + eff.hypeModifier));
                        }
                        if (eff.durationModifier && project.productionEndDate) {
                            const newEndDate = new Date(project.productionEndDate);
                            newEndDate.setDate(newEndDate.getDate() + eff.durationModifier);
                            updates.productionEndDate = newEndDate;
                        }
                        updateActiveProject(updates);

                        if (eff.reputationModifier) {
                            newState.reputation = Math.max(0, Math.min(100, newState.reputation + eff.reputationModifier));
                        }
                        if (cost !== 0) {
                            newState.capital -= cost;
                            newState.transactionLog = [...newState.transactionLog, {
                                date: new Date(newDate),
                                type: cost > 0 ? 'Ausgabe' : 'Einnahme',
                                category: 'Filmproduktion',
                                description: `Produktions-Event: ${displayTitle} (${filmTitle})`,
                                amount: Math.abs(cost)
                            }];
                        }

                        const effectsTextParts: string[] = [];
                        const txt = t.productionEvents.effects; 

                        if (eff.qualityModifier) effectsTextParts.push(`${txt.quality}: ${eff.qualityModifier > 0 ? '+' : ''}${eff.qualityModifier}`);
                        if (eff.hypeModifier) effectsTextParts.push(`${txt.hype}: ${eff.hypeModifier > 0 ? '+' : ''}${eff.hypeModifier}`);
                        if (eff.reputationModifier) effectsTextParts.push(`${txt.reputation}: ${eff.reputationModifier > 0 ? '+' : ''}${eff.reputationModifier}`);
                        if (eff.durationModifier) effectsTextParts.push(`${txt.duration}: ${eff.durationModifier > 0 ? '+' : ''}${eff.durationModifier} ${txt.days}`);
                        if (cost) {
                            const formattedCost = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Math.abs(cost));
                            effectsTextParts.push(`${txt.cost}: ${cost > 0 ? '-' : '+'}${formattedCost}`);
                        }

                        const resultString = effectsTextParts.length > 0 ? `\n\n${t.office.messages.studioEventEffectsHeader}\n` + effectsTextParts.join('\n') : '';

                        const newMessage: Message = {
                            id: `msg_prod_info_${Date.now()}_${Math.random()}`,
                            date: newDate,
                            sender: t.office.messages.productionReport,
                            subject: `Update: ${filmTitle} - ${displayTitle}`,
                            body: `${displayText}${resultString}`,
                            read: false,
                            linkedProject: project, // ADDED FOR COVER DISPLAY
                        };
                        newState.messages = [...newState.messages, newMessage];
                    }
                    
                    const nextEventInDays = 10 + Math.floor(Math.random() * 11);
                    const newNextEventDate = new Date(newDate);
                    newNextEventDate.setDate(newNextEventDate.getDate() + nextEventInDays);
                    
                    const refreshedProject = newState.activeProjects.find(p => p.workingTitle === project.workingTitle) || project;
                    
                    if (refreshedProject.productionEndDate && newNextEventDate < new Date(refreshedProject.productionEndDate)) {
                         updateActiveProject({ nextProductionEventDate: newNextEventDate });
                    } else {
                         updateActiveProject({ nextProductionEventDate: undefined });
                    }

                    if (pauseOnMessage) {
                        systemPause();
                    }
                    return newState;
                }
            }
            
            // 2. General Random Events (Includes CUSTOM EVENTS & DECISION EVENTS)
            if (currentData.nextEventDate && newDate.getTime() >= new Date(currentData.nextEventDate).getTime()) {
                const isToday = dateReached(newDate, currentData.nextEventDate);
                
                if (!isToday && newDate.getTime() > new Date(currentData.nextEventDate).getTime()) {
                    const daysUntilNext = 5 + Math.floor(Math.random() * 10);
                    const nextDate = new Date(newDate);
                    nextDate.setDate(nextDate.getDate() + daysUntilNext);
                    return { ...currentData, nextEventDate: nextDate };
                }

                // Event Generation
                let eventToTrigger: RandomEvent | null = null;
                
                const gameStartLimit = new Date(1990, 0, 15);
                if (isTestMode && newDate < gameStartLimit) {
                     const talentEventIds = ['studio_34', 'studio_35', 'studio_36', 'studio_37', 'studio_38'];
                     const targetId = talentEventIds[Math.floor(Math.random() * talentEventIds.length)];
                     eventToTrigger = ALL_EVENTS.find(e => e.id === targetId) || null;
                }

                if (!eventToTrigger) {
                    if (currentData.maritalStatus === MaritalStatus.Single && Math.random() < 0.3) {
                        eventToTrigger = generatePartnerEvent(currentData);
                    } else {
                        // FORCE DECISION EVENT IN TEST MODE (50% Chance if not partner search)
                        if (isTestMode && Math.random() < 0.5) {
                            if (DECISION_EVENTS.length > 0) {
                                eventToTrigger = DECISION_EVENTS[Math.floor(Math.random() * DECISION_EVENTS.length)];
                            }
                        }

                        // If not forced or test mode didn't trigger, pick normally
                        if (!eventToTrigger) {
                            // MERGED POOL
                            const studioEvents = ALL_EVENTS.filter(event => event.category === 'Studio');
                            const familyEvents = ALL_EVENTS.filter(event => {
                                if (event.category !== 'Family') return false;
                                if (event.id.startsWith('fam_s_') && currentData.maritalStatus !== MaritalStatus.Single) return false;
                                if (event.id.startsWith('fam_a_') && currentData.maritalStatus !== MaritalStatus.Acquaintance) return false;
                                if (event.id.startsWith('fam_r_') && (currentData.maritalStatus !== MaritalStatus.Dating && currentData.maritalStatus !== MaritalStatus.Engaged)) return false;
                                if (event.id.startsWith('fam_m_') && currentData.maritalStatus !== MaritalStatus.Married) return false;
                                if (event.id.startsWith('fam_c_') && currentData.children.length === 0) return false;
                                return true;
                            });

                            // MAP Custom Events
                            const customEvents = (currentData.customEvents || []).map((c: any) => ({
                                id: c.id,
                                title: c.title,
                                text: c.text,
                                category: c.category,
                                imageUrl: newspaperImage,
                                sender: 'Editor',
                                effect: (data: PlayerData) => {
                                    const e = c.effects || {};
                                    const capChange = e.capitalChange || 0;
                                    const repChange = e.reputationChange || 0;
                                    const resChange = e.researchPointsChange || 0;

                                    let updatedData = { ...data };
                                    if (capChange !== 0) {
                                        updatedData = applyTransaction(updatedData, capChange > 0 ? 'Einnahme' : 'Ausgabe', 'Zufallsereignis', c.title, Math.abs(capChange));
                                    }
                                    if (repChange !== 0) updatedData.reputation = Math.max(0, Math.min(100, updatedData.reputation + repChange));
                                    if (resChange !== 0) updatedData.researchPoints += resChange;

                                    return { updatedPlayerData: updatedData };
                                }
                            } as RandomEvent));

                            // CONCEPT IMPLEMENTATION: RESEARCHER SECURITY BONUS
                            // Calculate total effective researcher talent
                            let totalResearchSkill = 0;
                            currentData.employees.filter(e => e.type === EmployeeType.Forscher).forEach(e => {
                                totalResearchSkill += e.talent * (e.satisfaction / 100);
                            });
                            
                            // Define Bad Tech Events to filter
                            const badTechEvents = ['studio_05', 'studio_51', 'dec_11_ransomware', 'dec_03_security'];
                            
                            // Reduction logic: > 100 effective talent = 50% reduced chance, > 200 = 80% reduced chance
                            let skipBadTech = false;
                            if (totalResearchSkill > 200 && Math.random() < 0.8) skipBadTech = true;
                            else if (totalResearchSkill > 100 && Math.random() < 0.5) skipBadTech = true;

                            // Combine ALL valid events
                            // Filter out tech events if protected
                            let combinedPool = [...studioEvents, ...familyEvents, ...customEvents, ...DECISION_EVENTS];
                            
                            if (skipBadTech) {
                                combinedPool = combinedPool.filter(e => !badTechEvents.includes(e.id));
                            }

                            const securityProtection = getSecurityEventProtection(currentData);
                            if (securityProtection > 0 && Math.random() < securityProtection) {
                                combinedPool = combinedPool.filter(e => !SECURITY_EVENT_IDS.includes(e.id));
                            }
                            
                            if (combinedPool.length > 0) {
                                eventToTrigger = combinedPool[Math.floor(Math.random() * combinedPool.length)];
                            }
                        }
                    }
                }

                if (eventToTrigger) {
                    // --- NEW DECISION EVENT LOGIC ---
                    if (eventToTrigger.id.startsWith('dec_')) {
                        // Create interactive message
                        const translatedTitle = t.studioEvents[eventToTrigger.id]?.title || (language === 'de' ? eventToTrigger.title : 'Decision Required');
                        const translatedText = t.studioEvents[eventToTrigger.id]?.text || (language === 'de' ? eventToTrigger.text : '');
                        const translatedSender = t.studioEvents[eventToTrigger.id]?.sender || (language === 'de' ? eventToTrigger.sender : 'Office');

                        const newMessage: Message = {
                            id: `msg_dec_${Date.now()}_${eventToTrigger.id}`,
                            date: newDate,
                            sender: translatedSender,
                            subject: translatedTitle,
                            body: translatedText, // We use body directly or template if needed.
                            read: false,
                            decisionEventContext: {
                                eventId: eventToTrigger.id,
                                isResolved: false
                            }
                        };
                        
                        const daysUntilNext = 10 + Math.floor(Math.random() * 21);
                        const nextDate = new Date(newDate);
                        nextDate.setDate(nextDate.getDate() + daysUntilNext);

                        if (pauseOnMessage) systemPause();
                        
                        return {
                            ...currentData,
                            messages: [...currentData.messages, newMessage],
                            nextEventDate: nextDate
                        };
                    }
                    
                    // --- STANDARD EVENT LOGIC ---
                    if (['Studio', 'Family', 'World', 'Industry'].includes(eventToTrigger.category)) {
                        if (eventToTrigger.category === 'World' || eventToTrigger.category === 'Industry') {
                             const preEffectState = { ...currentData };
                             // Fix: Provide default customVariables in fallback object
                             const effectResult = eventToTrigger.effect 
                                ? eventToTrigger.effect(preEffectState) 
                                : { updatedPlayerData: preEffectState, customVariables: undefined };
                             
                                      const normalizedEffect = normalizeResearchDelta(preEffectState, effectResult.updatedPlayerData);
                                      effectResult.updatedPlayerData = normalizedEffect.updatedPlayerData;

                                      const deltas = {
                                          capitalChange: (effectResult.updatedPlayerData.capital || 0) - (preEffectState.capital || 0),
                                          reputationChange: (effectResult.updatedPlayerData.reputation || 0) - (preEffectState.reputation || 0),
                                          researchPointsChange: normalizedEffect.researchPointsChange,
                                      };
                             
                             // --- START: Variable Replacement Logic ---
                             // Step 1: Initialize with defaults from object
                             let displayTitle = eventToTrigger.title;
                             let displayText = eventToTrigger.text;
                            
                             // Step 2: Try to fetch translation from t.industryEvents or t.worldEvents
                             // This is where we get the localized string with placeholders like "{genre}"
                             let eventTrans = null;
                             if (eventToTrigger.category === 'Industry') eventTrans = t.industryEvents[eventToTrigger.id];
                             else if (eventToTrigger.category === 'World') eventTrans = t.worldEvents[eventToTrigger.id];
                             
                             if (eventTrans) {
                                 displayTitle = eventTrans.title;
                                 displayText = eventTrans.text;
                             }
                             
                             // Step 3: Replace variables from effectResult.customVariables
                             // Use global regex replacement to handle all occurrences
                             if (effectResult.customVariables) {
                                 Object.entries(effectResult.customVariables).forEach(([key, value]) => {
                                     // Fix for Genre translation:
                                     // If the variable key is 'genre' (from industry_02/03), translate it using t.genres
                                     let stringValue = String(value);
                                     if (key === 'genre' && typeof value === 'string') {
                                         // The value is the raw enum string (e.g., 'Abenteuer'), we need 'Adventure' if EN is active.
                                         // t.genres maps the enum string to the localized string.
                                         stringValue = t.genres[value] || stringValue;
                                     }

                                     // Create a regex for {key}
                                     const regex = new RegExp(`{${key}}`, 'g');
                                     
                                     displayText = displayText.replace(regex, stringValue);
                                     displayTitle = displayTitle.replace(regex, stringValue);
                                 });
                             }
                             // --- END: Variable Replacement Logic ---

                             setActiveEvent({ 
                                 event: { ...eventToTrigger, title: displayTitle, text: displayText }, 
                                 deltas, 
                                 resultingState: effectResult.updatedPlayerData 
                             });
                             systemPause();
                             const newState = { ...currentData };
                             newState.nextEventDate = undefined; 
                             return newState;

                        } else {
                            // Notification only (Studio / Family events)
                            const preEffectState = { ...currentData };
                            const effectResult = eventToTrigger.effect 
                                ? eventToTrigger.effect(preEffectState) 
                                : { updatedPlayerData: preEffectState, customVariables: undefined };

                            effectResult.updatedPlayerData.reputation = Math.min(100, Math.max(0, effectResult.updatedPlayerData.reputation));

                            const normalizedEffect = normalizeResearchDelta(preEffectState, effectResult.updatedPlayerData);
                            effectResult.updatedPlayerData = normalizedEffect.updatedPlayerData;

                            const deltas = {
                                capitalChange: (effectResult.updatedPlayerData.capital || 0) - (preEffectState.capital || 0),
                                reputationChange: (effectResult.updatedPlayerData.reputation || 0) - (preEffectState.reputation || 0),
                                researchPointsChange: normalizedEffect.researchPointsChange,
                            };

                            const customVars = effectResult.customVariables || {};

                            let translatedEvent = t.studioEvents[eventToTrigger.id];
                            if (eventToTrigger.category === 'Family') {
                                translatedEvent = t.familyEvents[eventToTrigger.id];
                            }
                            
                            if (!translatedEvent) {
                                translatedEvent = { title: eventToTrigger.title || 'Event', text: eventToTrigger.text || '...', sender: eventToTrigger.sender || 'System' };
                            }

                            const newMessage: Message = {
                                id: `msg_event_${Date.now()}_${Math.random()}`,
                                date: newDate,
                                sender: translatedEvent.sender || eventToTrigger.sender,
                                subjectTemplate: {
                                    key: eventToTrigger.category === 'Family' ? `familyEvents.${eventToTrigger.id}.title` : (eventToTrigger.id.startsWith('pkg_') ? 'Custom Event' : `studioEvents.${eventToTrigger.id}.title`),
                                    variables: {}
                                },
                                bodyTemplate: {
                                    key: 'studioEvent',
                                    variables: {
                                        textKey: eventToTrigger.id.startsWith('pkg_') ? eventToTrigger.text : (eventToTrigger.category === 'Family' ? `familyEvents.${eventToTrigger.id}.text` : `studioEvents.${eventToTrigger.id}.text`),
                                        capitalChange: deltas.capitalChange,
                                        reputationChange: deltas.reputationChange,
                                        researchPointsChange: deltas.researchPointsChange,
                                        ...customVars
                                    }
                                },
                                read: false,
                                imageUrl: (customVars as any).portraitUrl || undefined // Include portrait if available
                            };
                            
                            if (eventToTrigger.id.startsWith('pkg_') || eventToTrigger.id.startsWith('custom_')) {
                                newMessage.subject = eventToTrigger.title;
                                newMessage.body = eventToTrigger.text + (deltas.capitalChange ? `\nKapital: ${deltas.capitalChange}` : '');
                                newMessage.subjectTemplate = undefined; 
                                newMessage.bodyTemplate = undefined;
                            }

                            const updatedMessages = [...effectResult.updatedPlayerData.messages, newMessage];
                            const updatedEventLog = [...(effectResult.updatedPlayerData.eventLog || []), { date: newDate, title: translatedEvent.title, text: translatedEvent.text, category: eventToTrigger.category }];
                            
                            const daysUntilNext = 10 + Math.floor(Math.random() * 21);
                            const nextDate = new Date(newDate);
                            nextDate.setDate(nextDate.getDate() + daysUntilNext);

                            if (pauseOnMessage) {
                                systemPause();
                            }

                            return {
                                ...effectResult.updatedPlayerData,
                                messages: updatedMessages,
                                eventLog: updatedEventLog,
                                nextEventDate: nextDate,
                            };
                        }
                    }
                }
            }
            return currentData;
        });
    }, [gameDate, setPlayerData, systemPause, setActiveEvent, setActiveWritingEvent, pauseOnMessage, t]);
};
