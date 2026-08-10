
import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { Message, ProductionEventChoice, ProductionEvent, RandomEvent, ProjectData } from '../../../types';
import NegotiationModal from '../../NegotiationModal';
import ArchiveIcon from '../../icons/ArchiveIcon';
import TrashIcon from '../../icons/TrashIcon';
import { ALL_DISTRIBUTORS } from '../../distributors';
import { PRODUCTION_EVENTS } from '../../productionEvents';
import ProductionEventModal from '../../ProductionEventModal';
import ProduktionIcon from '../../icons/ProduktionIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import { MessageTemplate } from '../../../translations/types';
import RandomEventModal from '../../RandomEventModal'; 
import { DECISION_EVENTS, resolveDecisionEvent } from '../../events/studio/decisionEvents';
import BriefcaseIcon from '../../icons/BriefcaseIcon';
import { getCoverPath } from '../../coverConfig';
import { loadSaveFiles, persistSaveFiles } from '../../../hooks/saveStorage';

const NachrichtenTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [negotiationContext, setNegotiationContext] = useState<Message['offerContext'] | null>(null);
    const [activeFolder, setActiveFolder] = useState<'inbox' | 'archive'>('inbox');
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState<Message | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Message | null>(null);
    const [showCannotDeleteInfo, setShowCannotDeleteInfo] = useState(false);
    
    // Production Event States
    const [activeProductionEvent, setActiveProductionEvent] = useState<ProductionEvent | null>(null);
    const [activeProductionMessageId, setActiveProductionMessageId] = useState<string | null>(null);
    const [activeResolvedEffects, setActiveResolvedEffects] = useState<any>(null);

    // Decision Event States
    const [activeDecisionEvent, setActiveDecisionEvent] = useState<RandomEvent | null>(null);
    const [activeDecisionMessageId, setActiveDecisionMessageId] = useState<string | null>(null);

    if (!playerData) return null;

    const persistAutosaveSnapshot = (snapshot: any) => {
        void (async () => {
            try {
                const saves = await loadSaveFiles();
                const withoutAuto = saves.filter(save => save.slotId !== 0);
                await persistSaveFiles([
                    {
                        slotId: 0,
                        timestamp: new Date().toISOString(),
                        data: snapshot,
                    },
                    ...withoutAuto,
                ]);
            } catch (error) {
                console.warn('Autosave after message read failed:', error);
            }
        })();
    };

    const setPlayerDataAndPersist = (updater: (prev: any) => any) => {
        setPlayerData(prev => {
            const nextState = updater(prev);
            if (nextState && nextState !== prev) {
                persistAutosaveSnapshot(nextState);
            }
            return nextState;
        });
    };

    const getTranslationValue = (key: string) => {
        return key.split('.').reduce((obj, part) => obj && obj[part], t as any);
    };

    const getDeterministicString = (options: string[], seed: string): string => {
        if (!options || options.length === 0) return "";
        if (options.length === 1) return options[0];
        
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        const index = Math.abs(hash) % options.length;
        return options[index];
    };
    
    // Helper to resolve name including family (Same logic as in other components)
    const resolveName = (id: number | undefined) => {
           if (id === undefined) return language === 'de' ? 'Unbekannt' : 'Unknown';
        if (id === -1) return playerData.playerName;
           if (id === 99901) return playerData.partnerName || (language === 'de' ? 'Partner' : 'Partner');
        if (id >= 99910) {
             const child = playerData.children.find(c => c.id.includes(String(id)) || 99910 + playerData.children.indexOf(c) === id);
               return child ? `${child.name} (${language === 'de' ? 'Kind' : 'Child'})` : (language === 'de' ? 'Kind' : 'Child');
        }
        
        const director = playerData.directors.find(d => d.id === id);
        if (director) return director.name;
        
        const actor = playerData.actors.find(a => a.id === id);
        if (actor) return actor.name;
        
        return language === 'de' ? 'Unbekannt' : 'Unknown';
    };

    const renderTemplate = (template?: MessageTemplate, fallback?: string, messageId?: string): string => {
        if (!template) {
            return fallback || '';
        }
        const { key, variables } = template;
        const rawValue = getTranslationValue(key);
        
        let templateString = "";
        
        if (Array.isArray(rawValue)) {
            templateString = getDeterministicString(rawValue, messageId || key);
        } else if (typeof rawValue === 'string') {
            templateString = rawValue;
        } else {
            return fallback || key;
        }

        Object.entries(variables || {}).forEach(([varName, value]) => {
            const placeholder = new RegExp(`{${varName}}`, 'g');
            templateString = templateString.replace(placeholder, String(value));
        });
        
        return templateString;
    };

    const getMessageTimestamp = (message: Message): number => {
        const rawDate = message?.date;
        const parsed = rawDate instanceof Date ? rawDate.getTime() : new Date(rawDate as any).getTime();
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const getMessageIdTimestamp = (message: Message): number => {
        const id = String(message?.id || '');
        const epochMatch = id.match(/(\d{10,})/);
        if (!epochMatch) return 0;
        const epoch = Number(epochMatch[1]);
        return Number.isFinite(epoch) ? epoch : 0;
    };

    const compareMessagesNewestFirst = (a: Message, b: Message): number => {
        const dateDiff = getMessageTimestamp(b) - getMessageTimestamp(a);
        if (dateDiff !== 0) return dateDiff;
        return getMessageIdTimestamp(b) - getMessageIdTimestamp(a);
    };

    const formatMessageDateTime = (message: Message): string => {
        const timestamp = getMessageTimestamp(message);
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const receivedLabel = language === 'de' ? 'Eingang' : 'Received';


    const messagesToShow = useMemo(() => {
        if (!playerData.messages) return [];
        return [...playerData.messages]
            .filter(m => activeFolder === 'inbox' ? !m.isArchived : m.isArchived)
            .sort(compareMessagesNewestFirst);
    }, [playerData.messages, activeFolder]);

    const selectedMessage = useMemo(() => {
        return messagesToShow.find(m => m.id === selectedMessageId) || null;
    }, [selectedMessageId, messagesToShow]);

     useEffect(() => {
        if ((!selectedMessage && messagesToShow.length > 0) || (selectedMessageId && !messagesToShow.some(m => m.id === selectedMessageId))) {
            const firstMessageId = messagesToShow[0]?.id;
            if (firstMessageId) {
                setSelectedMessageId(firstMessageId);
            } else {
                setSelectedMessageId(null);
            }
        }
    }, [messagesToShow, selectedMessageId, selectedMessage]);


    const markAsRead = (messageId: string) => {
        setPlayerDataAndPersist(prev => {
            if (!prev) return null;
            if (prev.messages.find(m => m.id === messageId)?.read) return prev;

            return {
                ...prev,
                messages: prev.messages.map(m => 
                    m.id === messageId 
                    ? { ...m, read: true, readDate: new Date(prev.gameDate) } 
                    : m
                )
            };
        });
    };

    const handleSelectMessage = (messageId: string) => {
        setSelectedMessageId(messageId);
        if (!playerData.messages.find(m => m.id === messageId)?.read) {
            markAsRead(messageId);
        }
    };
    
    const handleRejectOffer = () => {
        if (selectedMessage) {
            markAsRead(selectedMessage.id);
            setShowRejectConfirm(selectedMessage);
        }
    };

    const confirmRejectOffer = () => {
        if (!showRejectConfirm || !showRejectConfirm.offerContext) return;
        const { filmTitle, distributorId } = showRejectConfirm.offerContext;
    
        setPlayerDataAndPersist(prev => {
            if (!prev) return null;
            const updatedFilms = prev.completedFilms.map(film => {
                if (film.workingTitle === filmTitle && film.offers) {
                    const updatedOffers = film.offers.map(o => 
                        o.distributor.id === distributorId ? { ...o, status: 'rejected' as const } : o
                    );
                    return { ...film, offers: updatedOffers };
                }
                return film;
            });
    
            const updatedMessages = prev.messages.map(m => 
                m.id === showRejectConfirm.id 
                    ? { ...m, offerContext: { ...m.offerContext!, isRejected: true } }
                    : m
            );
    
            return { ...prev, completedFilms: updatedFilms, messages: updatedMessages };
        });
        setShowRejectConfirm(null);
    };

    const handleArchiveMessage = () => {
        if (!selectedMessage) return;
        setPlayerDataAndPersist(prev => {
            if (!prev) return null;
            const updatedMessages = prev.messages.map(m => 
                m.id === selectedMessage.id ? { ...m, isArchived: true } : m
            );
            return { ...prev, messages: updatedMessages };
        });
        setShowArchiveConfirm(false);
    };


    const handleDeleteClick = () => {
        if (!selectedMessage) return;
        if (selectedMessage.offerContext && 
            !selectedMessage.offerContext.isAccepted && 
            !selectedMessage.offerContext.isRejected && 
            !selectedMessage.offerContext.isNegotiationFailed && 
            !selectedMessage.offerContext.isWithdrawn && 
            !selectedMessage.offerContext.isSuperseded) {
            setShowCannotDeleteInfo(true);
        } else if (selectedMessage.productionEventContext && !selectedMessage.productionEventContext.isResolved) {
             setShowCannotDeleteInfo(true);
        } else if (selectedMessage.decisionEventContext && !selectedMessage.decisionEventContext.isResolved) {
             setShowCannotDeleteInfo(true);
        } else {
            setShowDeleteConfirm(selectedMessage);
        }
    };

     const confirmDeleteMessage = () => {
        if (!showDeleteConfirm) return;

        setPlayerDataAndPersist(prev => {
            if (!prev) return null;
            const currentList = [...prev.messages]
                .filter(m => activeFolder === 'inbox' ? !m.isArchived : m.isArchived)
                .sort(compareMessagesNewestFirst);
            
            const deletedMessageIndex = currentList.findIndex(m => m.id === showDeleteConfirm.id);
            const updatedMessages = prev.messages.filter(m => m.id !== showDeleteConfirm.id);
            let nextSelectedId: string | null = null;
            const newList = currentList.filter(m => m.id !== showDeleteConfirm.id);
            if (newList.length > 0) {
                if (deletedMessageIndex >= newList.length) {
                    nextSelectedId = newList[newList.length - 1].id;
                } else {
                    nextSelectedId = newList[deletedMessageIndex].id;
                }
            }
            setSelectedMessageId(nextSelectedId);
            return { ...prev, messages: updatedMessages };
        });
        setShowDeleteConfirm(null);
    };

    const getSenderName = (message: Message): string => {
        if (message.sender) return message.sender;
        if (message.offerContext) {
            const distributor = ALL_DISTRIBUTORS.find(d => d.id === message.offerContext.distributorId);
            return distributor ? distributor.name : t.office.messages.distributor;
        }
        return t.office.messages.system;
    };

    const getLiveProductionEventText = (message: Message): { title: string; body: string } | null => {
        if (!message.productionEventContext || message.productionEventContext.isResolved) return null;
        const eventDef = PRODUCTION_EVENTS.find(e => e.id === message.productionEventContext!.eventId);
        const translated = t.productionEvents[message.productionEventContext.eventId];
        const title = translated?.title || (language === 'de' ? (eventDef?.title || message.subject || t.office.messages.system) : 'Production Event');
        const rawText = translated?.text || (language === 'de' ? (eventDef?.text || message.body || '') : '');
        const talentId = message.productionEventContext.talentId;
        const talentName = talentId !== undefined ? resolveName(talentId) : (language === 'de' ? 'Crew' : 'Crew');
        return {
            title,
            body: rawText.replace(/{talentName}/g, talentName),
        };
    };

    const getLiveDecisionEventText = (message: Message): { title: string; body: string } | null => {
        if (!message.decisionEventContext || message.decisionEventContext.isResolved) return null;
        const eventDef = DECISION_EVENTS.find(e => e.id === message.decisionEventContext!.eventId);
        const translated = t.studioEvents[message.decisionEventContext.eventId];
        return {
            title: translated?.title || (language === 'de' ? (eventDef?.title || message.subject || t.office.messages.system) : 'Decision Required'),
            body: translated?.text || (language === 'de' ? (eventDef?.text || message.body || '') : ''),
        };
    };

    const getDisplaySubject = (message: Message): string => {
        const liveProd = getLiveProductionEventText(message);
        if (liveProd) return liveProd.title;
        const liveDecision = getLiveDecisionEventText(message);
        if (liveDecision) return liveDecision.title;
        return renderTemplate(message.subjectTemplate, message.subject, message.id);
    };
    
    // --- Message Poster Component ---
    const MessageMoviePoster: React.FC<{ film: ProjectData }> = ({ film }) => {
        const { 
            coverImageId = 1, 
            coverTitlePosition = 'bottom', 
            coverTitleFontSize = 30, 
            coverTitleFontFamily = 'Cinzel', 
            coverTitleColor = '#FFFFFF', 
            directorId, 
            mainActorId 
        } = film;

        const directorName = resolveName(directorId);
        const mainActorName = resolveName(mainActorId);
        
        const getPositionClass = (pos: string) => {
            switch (pos) {
                case 'top': return 'justify-start pt-2';
                case 'top-center': return 'justify-start pt-[25%]';
                case 'center': return 'justify-center';
                case 'bottom-center': return 'justify-end pb-[25%]';
                case 'bottom': return 'justify-end pb-2';
                default: return 'justify-end pb-2';
            }
        };

        const namesPositionClass = (coverTitlePosition === 'top' || coverTitlePosition === 'top-center' || coverTitlePosition === 'center') ? 'bottom-2' : 'top-2';
        const directorNameUpper = directorName.toUpperCase();
        const mainActorNameUpper = mainActorName.toUpperCase();
        
        const combinedLength = directorNameUpper.length + mainActorNameUpper.length;
        
        // Calculate font size to fit in one line
        let nameFontSize = 7;
        if (combinedLength > 40) nameFontSize = 4;
        else if (combinedLength > 30) nameFontSize = 5;
        else if (combinedLength > 20) nameFontSize = 6;
        
        return (
            <div className="relative w-32 h-48 flex-shrink-0 border-2 border-gray-600 rounded-sm overflow-hidden shadow-xl bg-gray-900 group">
                {film.contract ? (
                    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                            <div className="bg-amber-500 w-[200%] py-1 text-center shadow-lg">
                                <span className="text-black font-black text-xs uppercase tracking-widest font-cinzel">
                                    {t.project.modeSelector.contract}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <img
                            src={film.customCover || getCoverPath(film.genre, coverImageId)}
                            alt={`Cover für ${film.workingTitle}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Title Overlay */}
                        <div className={`absolute inset-0 flex flex-col pointer-events-none p-1 ${getPositionClass(coverTitlePosition)}`}>
                            <h3 className="text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] leading-tight"
                                style={{ fontFamily: coverTitleFontFamily, fontSize: `${(coverTitleFontSize || 30) * 0.427}px`, color: coverTitleColor }}>
                                {film.workingTitle}
                            </h3>
                        </div>
                        {/* Names Overlay */}
                        {(directorId !== undefined && mainActorId !== undefined) && (
                             <div 
                                className={`absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-1`}
                                style={{ 
                                    color: coverTitleColor, 
                                    fontSize: `${nameFontSize}px`, 
                                    lineHeight: '1.1',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                <p>{directorNameUpper} <span className="mx-0.5">•</span> {mainActorNameUpper}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // ... (Decision and Production Event logic remains unchanged) ...
    
     const handleMakeDecision = () => {
        if (!selectedMessage || !selectedMessage.decisionEventContext) return;
        markAsRead(selectedMessage.id);
        
        const eventId = selectedMessage.decisionEventContext.eventId;
        const eventDef = DECISION_EVENTS.find(e => e.id === eventId);
        
        if (eventDef) {
            const translatedActions = eventDef.actions?.map(action => {
                const actionTrans = t.studioEvents[eventId]?.actions?.[action.value];
                return {
                    ...action,
                    text: actionTrans?.text || (language === 'de' ? action.text : action.value),
                    tooltip: actionTrans?.tooltip || (language === 'de' ? action.tooltip : '')
                };
            });

            const hydratedEvent = {
                ...eventDef,
                title: t.studioEvents[eventId]?.title || (language === 'de' ? eventDef.title : 'Decision Required'),
                text: t.studioEvents[eventId]?.text || (language === 'de' ? eventDef.text : ''),
                actions: translatedActions
            };
            
            setActiveDecisionEvent(hydratedEvent);
            setActiveDecisionMessageId(selectedMessage.id);
        }
    };
    
    const handleDecisionChoice = (choiceValue?: string) => {
        if (!activeDecisionEvent || !activeDecisionMessageId || !choiceValue) {
             setActiveDecisionEvent(null);
             setActiveDecisionMessageId(null);
             return;
        }

        setPlayerDataAndPersist(currentData => {
            if (!currentData) return null;
            const result = resolveDecisionEvent(activeDecisionEvent.id, choiceValue, currentData);
            const updatedData = result.updatedData;
            
            const translatedEvent = t.studioEvents[activeDecisionEvent.id];
            const buttonLabel = translatedEvent?.actions?.[choiceValue]?.text || activeDecisionEvent.actions?.find(a => a.value === choiceValue)?.text || choiceValue;
            const translatedOutcome = translatedEvent?.actions?.[choiceValue]?.tooltip;
            const outcomeText = translatedOutcome || (language === 'de' ? result.logEntry : (result.logEntry ? 'Effects applied.' : ''));

            const updatedMessages = updatedData.messages.map(m => {
                if (m.id === activeDecisionMessageId) {
                    const logSuffix = outcomeText ? `\n\n${language === 'de' ? 'Resultat' : 'Result'}: ${outcomeText}` : '';
                    const newBody = `${m.body || ''}\n\n[${t.office.messages.decisionMade.toUpperCase()}: ${buttonLabel}]${logSuffix}`;
                    return { ...m, body: newBody, decisionEventContext: { ...m.decisionEventContext!, isResolved: true, resolvedChoice: choiceValue } };
                }
                return m;
            });
            const eventLogText = `${language === 'de' ? 'Entscheidung' : 'Decision'}: ${buttonLabel}. ${outcomeText || ''}`.trim();
            const eventLog = [...(updatedData.eventLog || []), { date: new Date(updatedData.gameDate), title: activeDecisionEvent.title, text: eventLogText, category: 'Studio' as const }];
            return { ...updatedData, messages: updatedMessages, eventLog: eventLog };
        });
        setActiveDecisionEvent(null);
        setActiveDecisionMessageId(null);
    };

    const handleGoToSet = () => {
        if (!selectedMessage || !selectedMessage.productionEventContext) return;
        markAsRead(selectedMessage.id);
        const { eventId, talentId, resolvedEffects } = selectedMessage.productionEventContext;
        const event = PRODUCTION_EVENTS.find(e => e.id === eventId);
        if (event) {
            setActiveProductionEvent({ ...event, talentId: talentId });
            setActiveProductionMessageId(selectedMessage.id);
            setActiveResolvedEffects(resolvedEffects);
        }
    };

     const generateTooltipText = (choiceValue: string, effect: ProductionEventChoice['effect'], resolvedEffects: any): string => {
        const resolved = resolvedEffects ? resolvedEffects[choiceValue] : null;
        const parts: string[] = [];
        
        const txt = t.productionEvents.effects || { quality: 'Quality', hype: 'Hype', reputation: 'Reputation', duration: 'Duration', cost: 'Cost', days: 'days' };
        
        const quality = resolved?.quality ?? effect.qualityModifier;
        const hype = resolved?.hype ?? effect.hypeModifier;
        const reputation = resolved?.reputation ?? effect.reputationModifier;
        const duration = resolved?.duration ?? effect.durationModifier;
        const cost = resolved?.cost ?? effect.costModifier;

        if (quality) parts.push(quality > 0 ? `${txt.quality} +${quality}` : `${txt.quality} ${quality}`);
        if (hype) parts.push(`${txt.hype}: ${hype > 0 ? '+' : ''}${hype}`);
        if (reputation) parts.push(reputation > 0 ? `${txt.reputation} +${reputation}` : `${txt.reputation} ${reputation}`);
        if (duration) parts.push(`${txt.duration}: ${duration > 0 ? '+' : ''}${duration} ${txt.days}`);
        if (cost) {
            const formattedCost = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Math.abs(cost));
            parts.push(`${txt.cost}: ${cost > 0 ? '-' : '+'}${formattedCost}`);
        }
        
        if (parts.length === 0) return "";
        return parts.join(' | ');
    };

    const handleProductionEventChoice = (choice: ProductionEventChoice) => {
         if (!activeProductionEvent || !activeProductionMessageId) return;

        setPlayerDataAndPersist(currentData => {
            if (!currentData) return null;
            const projTitle = currentData.messages.find(m => m.id === activeProductionMessageId)?.productionEventContext?.filmTitle;
            const targetProject = currentData.activeProjects.find(p => p.workingTitle === projTitle);
            
            if (!targetProject) {
                 const updatedMessages = currentData.messages.map(m => m.id === activeProductionMessageId ? { ...m, productionEventContext: { ...m.productionEventContext!, isResolved: true } } : m);
                return { ...currentData, messages: updatedMessages };
            }

            let newProject = { ...targetProject };
            const effect = choice.effect;
            const eventId = activeProductionEvent.id;
            const resolved = activeResolvedEffects ? activeResolvedEffects[choice.value] : null;

            const qualityMod = resolved?.quality ?? effect.qualityModifier ?? 0;
            const hypeMod = resolved?.hype ?? effect.hypeModifier ?? 0;
            const repMod = resolved?.reputation ?? effect.reputationModifier ?? 0;
            const durationMod = resolved?.duration ?? effect.durationModifier ?? 0;
            const costMod = resolved?.cost ?? 0;
            
            newProject.hype = Math.max(0, Math.min(100, (newProject.hype || 0) + hypeMod));
            newProject.productionQualityModifier = (newProject.productionQualityModifier || 0) + qualityMod;
            newProject.productionEventLog = [...(newProject.productionEventLog || []), { eventId: eventId, choice: choice.value, date: new Date(currentData.gameDate) }];
            
            let newCapital = currentData.capital;
            let newTransactionLog = [...currentData.transactionLog];
            
            if (costMod !== 0) {
                 newCapital -= costMod;
                 newTransactionLog.push({ date: new Date(currentData.gameDate), type: 'Ausgabe', category: 'Filmproduktion', description: `${t.office.messages.productionInfo}: ${activeProductionEvent.title}`, amount: Math.abs(costMod) });
            }
            
            if (durationMod && newProject.productionEndDate) {
              const newEndDate = new Date(newProject.productionEndDate);
              newEndDate.setDate(newEndDate.getDate() + durationMod);
              newProject.productionEndDate = newEndDate;
            }

            const effectsSummary = generateTooltipText(choice.value, choice.effect, activeResolvedEffects);
            const resultString = effectsSummary ? `\n\n${t.office.messages.studioEventEffectsHeader}\n- ${effectsSummary}` : '';

            const updatedMessages = currentData.messages.map(m => {
                if (m.id === activeProductionMessageId) {
                    const translatedEvent = t.productionEvents[activeProductionEvent.id];
                    const buttonLabel = translatedEvent?.actions?.[choice.value] || (language === 'de' ? choice.text : choice.value);
                    const newBody = `${m.body || ''}\n\n[${t.office.messages.decisionMade.toUpperCase()}: ${buttonLabel}]${resultString}`;
                    return { ...m, body: newBody, productionEventContext: { ...m.productionEventContext!, isResolved: true } };
                }
                return m;
            });

            const updatedProjects = currentData.activeProjects.map(p => p.workingTitle === projTitle ? newProject : p);

            return { ...currentData, activeProjects: updatedProjects, capital: newCapital, reputation: Math.max(0, Math.min(100, currentData.reputation + repMod)), transactionLog: newTransactionLog, messages: updatedMessages };
        });
        setActiveProductionEvent(null);
        setActiveProductionMessageId(null);
        setActiveResolvedEffects(null);
    };

    const renderMessageBody = (message: Message) => {
        const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

        if (message.bodyTemplate) {
             const { key, variables } = message.bodyTemplate;
             let body = '';
             switch (key) {
                    case 'offer':
                    case 'reminder':
                    case 'withdraw':
                    {
                        const salutationKey = (variables.salutationKey as string) || 'marketing.offerMessage.followUpSalutation';
                        let salutationTemplate = getTranslationValue(salutationKey);
                        const salutation = typeof salutationTemplate === 'string' ? salutationTemplate.replace('{lastName}', variables.lastName as string) : "Hallo";
                        const bodyTextKey = variables.bodyTextKey as string;
                        let bodyText = "";
                        if (bodyTextKey) {
                            const templateOptions = getTranslationValue(bodyTextKey);
                            let rawTemplate = Array.isArray(templateOptions) ? getDeterministicString(templateOptions, message.id) : templateOptions;
                            if (rawTemplate) {
                                bodyText = rawTemplate.replace(/{filmTitle}/g, variables.filmTitle as string);
                                if (variables.totalValue) bodyText = bodyText.replace(/{totalValue}/g, formatCurrency(variables.totalValue as number));
                            } else bodyText = "Nachricht konnte nicht geladen werden.";
                        } else if (key === 'reminder') {
                            const remTemplate = t.marketing.offerMessage.reminderBody;
                            if (remTemplate) {
                                let remText = remTemplate.replace('{filmTitle}', variables.filmTitle as string);
                                if (variables.totalValue) remText = remText.replace('{totalValue}', formatCurrency(variables.totalValue as number));
                                bodyText = remText;
                            } else bodyText = `Erinnerung: Angebot für ${variables.filmTitle}`; 
                        } else if (key === 'withdraw') {
                            const wdTemplate = t.marketing.offerMessage.withdrawBody;
                             if (wdTemplate) bodyText = wdTemplate.replace('{filmTitle}', variables.filmTitle as string);
                             else bodyText = `Angebot zurückgezogen: ${variables.filmTitle}`;
                        }
                        body = `${salutation},\n\n${bodyText}\n\n${t.marketing.offerMessage.closing}\n\n${t.marketing.offerMessage.regards}\n${variables.distributorName}`;
                        break;
                    }
                    case 'studioEvent': {
                        let text = getTranslationValue(variables.textKey as string);
                        if (text && typeof text === 'string') {
                            Object.entries(variables || {}).forEach(([k, v]) => {
                                if (!['textKey', 'capitalChange', 'reputationChange', 'researchPointsChange', 'privateCapitalChange', 'energyChange', 'relationshipChange'].includes(k)) {
                                    text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
                                }
                            });
                        }
                        let effects = '';
                        const capital = variables.capitalChange as number || 0;
                        const rep = variables.reputationChange as number || 0;
                        const research = variables.researchPointsChange as number || 0;
                        const privateCapital = variables.privateCapitalChange as number || 0;
                        const energy = variables.energyChange as number || 0;
                        const relationship = variables.relationshipChange as number || 0;
                        
                        if (capital || rep || research || privateCapital || energy || relationship) {
                            effects = `\n\n${t.office.messages.studioEventEffectsHeader}\n`;
                            if (capital) effects += `- ${t.office.messages.studioEventCapital}: ${capital > 0 ? '+' : ''}${formatCurrency(capital)}\n`;
                            if (rep) effects += `- ${t.office.messages.studioEventReputation}: ${rep > 0 ? '+' : ''}${rep}\n`;
                            if (research) effects += `- ${t.office.messages.studioEventResearch}: ${research > 0 ? '+' : ''}${research}\n`;
                            if (privateCapital) effects += `- ${t.privatelife.status.privateCapital}: ${privateCapital > 0 ? '+' : ''}${formatCurrency(privateCapital)}\n`;
                            if (energy) effects += `- ${t.privatelife.overview.vitality}: ${energy > 0 ? '+' : ''}${energy}%\n`;
                            if (relationship) effects += `- ${t.privatelife.overview.status}: ${relationship > 0 ? '+' : ''}${relationship}\n`;
                        }
                        body = `${text}${effects}`;
                        break;
                    }
                    default:
                        let textRaw = getTranslationValue(key);
                        let text = Array.isArray(textRaw) ? getDeterministicString(textRaw, message.id) : (typeof textRaw === 'string' ? textRaw : (message.body || t.office.messages.noMessages));
                        if (text) {
                            Object.entries(variables || {}).forEach(([k, v]) => text = text.replace(new RegExp(`{${k}}`, 'g'), String(v)));
                            body = text;
                        }
                 }
                 
             // Render Layout: With Portrait or Movie Poster
             return (
                <div className="flex gap-6 items-start">
                    {message.imageUrl && (
                        <div className="relative w-40 h-56 flex-shrink-0 border-2 border-gray-600 rounded-sm overflow-hidden shadow-xl bg-gray-900">
                             <img src={message.imageUrl} alt="Portrait" className="w-full h-full object-cover" />
                             {/* Optional ribbon for death messages, otherwise clean */}
                             {message.id.startsWith('msg_death_') && (
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                                    <div className="absolute top-0 left-0 w-[150%] h-8 bg-black transform -rotate-45 -translate-x-16 -translate-y-4 opacity-90 shadow-lg"></div>
                                </div>
                             )}
                        </div>
                    )}
                    {message.linkedProject && (
                         <MessageMoviePoster film={message.linkedProject} />
                    )}
                    <div className="flex-grow">{renderMessageBodyWithKeywords(body)}</div>
                </div>
             );
        }

        if (message.body) {
            const liveProduction = getLiveProductionEventText(message);
            const liveDecision = getLiveDecisionEventText(message);
            const displayBody = liveProduction?.body || liveDecision?.body || message.body;
            return (
                <div className="flex gap-6 items-start">
                    {message.imageUrl && (
                        <div className="relative w-40 h-56 flex-shrink-0 border-2 border-gray-600 rounded-sm overflow-hidden shadow-xl bg-gray-900">
                             <img src={message.imageUrl} alt="Portrait" className="w-full h-full object-cover" />
                             {message.id.startsWith('msg_death_') && (
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                                    <div className="absolute top-0 left-0 w-[150%] h-8 bg-black transform -rotate-45 -translate-x-16 -translate-y-4 opacity-90 shadow-lg"></div>
                                </div>
                             )}
                        </div>
                    )}
                    {message.linkedProject && (
                         <MessageMoviePoster film={message.linkedProject} />
                    )}
                    <div className="flex-grow">{renderMessageBodyWithKeywords(displayBody)}</div>
                </div>
            );
        }
        return t.office.messages.noMessages;
    };

    const renderMessageBodyWithKeywords = (body: string) => {
        const colorRegex = /{([a-z]+):([^}]+)}/g;
        const keywords = [
          t.marketing.offerMessage.lumpSum, t.marketing.offerMessage.installments, t.marketing.offerMessage.revenueShare,
          t.marketing.offerMessage.embargo, t.marketing.offerMessage.totalValue, t.office.messages.studioEventEffectsHeader,
          t.office.messages.studioEventCapital, t.office.messages.studioEventReputation, t.office.messages.studioEventResearch,
        ];
        
        const parseLineWithColors = (text: string) => {
             const parts = [];
             let lastIndex = 0;
             let match;
             while ((match = colorRegex.exec(text)) !== null) {
                if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
                const color = match[1];
                const content = match[2];
                let colorClass = "text-white";
                if (color === 'red') colorClass = "text-red-400 font-bold";
                else if (color === 'green') colorClass = "text-green-400 font-bold";
                else if (color === 'yellow') colorClass = "text-amber-400 font-bold";
                parts.push(<span key={match.index} className={colorClass}>{content}</span>);
                lastIndex = colorRegex.lastIndex;
            }
            if (lastIndex < text.length) parts.push(text.substring(lastIndex));
            return parts.length > 0 ? parts : text;
        };

        return body.split('\n').map((line, index) => {
            const keywordMatch = keywords.find(kw => line.trim().startsWith(kw));
            if (keywordMatch) {
                const splitIndex = line.indexOf(keywordMatch) + keywordMatch.length;
                const prefix = line.substring(0, splitIndex);
                const remainder = line.substring(splitIndex);
                const separatorMatch = remainder.match(/^(\s*:\s*)(.*)/);
                let content = remainder;
                if (separatorMatch) content = separatorMatch[2];
                const hasTags = /{[a-z]+:[^}]+}/.test(content);
                return (
                    <React.Fragment key={index}>
                        <span className="font-semibold text-gray-300">{prefix}</span>
                        <span className="text-gray-300">{separatorMatch?.[1] || ""}</span>
                        {hasTags ? parseLineWithColors(content) : <span className="text-amber-400 font-semibold">{content}</span>}
                        <br />
                    </React.Fragment>
                );
            }
            return <React.Fragment key={index}>{parseLineWithColors(line)}<br /></React.Fragment>;
        });
    };

    return (
        <>
            <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-700 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex border-b border-gray-700">
                        <button onClick={() => setActiveFolder('inbox')} className={`py-2 px-6 font-bold text-lg transition-colors ${activeFolder === 'inbox' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}>{t.office.messages.inbox}</button>
                        <button onClick={() => setActiveFolder('archive')} className={`py-2 px-6 font-bold text-lg transition-colors ${activeFolder === 'archive' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}>{t.office.messages.archive}</button>
                    </div>
                    <h2 className="text-4xl font-bold font-cinzel text-amber-400">{t.office.screen.nav.messages}</h2>
                    <div className="w-48"></div> 
                </div>

                <div className="flex-grow flex gap-6 overflow-hidden">
                    <div className="w-1/3 flex-shrink-0 flex flex-col bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                        <div className="overflow-y-auto flex-grow">
                            {messagesToShow.length > 0 ? (
                                messagesToShow.map(message => (
                                    <button
                                        key={message.id}
                                        onClick={() => handleSelectMessage(message.id)}
                                        className={`w-full text-left p-3 border-b border-gray-700 transition-colors ${selectedMessage?.id === message.id ? 'bg-amber-900/50' : 'hover:bg-gray-700/50'}`}
                                    >
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-xs text-gray-400 truncate">{t.office.messages.from} {getSenderName(message)}</p>
                                            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatMessageDateTime(message)}</p>
                                        </div>
                                        <p className={`truncate ${!message.read ? 'font-bold text-white' : 'font-normal text-gray-400'}`}>{getDisplaySubject(message)}</p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-500 italic p-4 text-center">{t.office.messages.noMessages}</p>
                            )}
                        </div>
                        {activeFolder === 'inbox' && (
                            <div className="p-2 border-t border-gray-700 bg-gray-900/30 text-center">
                                <p className="text-[10px] text-gray-500 italic">{t.office.messages.autoDeleteHint}</p>
                            </div>
                        )}
                    </div>

                    <div className="w-2/3 bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex flex-col">
                        {selectedMessage ? (
                            <>
                                <div className="border-b border-gray-700 pb-2 mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-gray-400">{t.office.messages.from} {getSenderName(selectedMessage)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{receivedLabel}: {formatMessageDateTime(selectedMessage)}</p>
                                            <h3 className="text-xl font-bold text-white mt-1">{getDisplaySubject(selectedMessage)}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {activeFolder === 'inbox' && (
                                                <button onClick={() => setShowArchiveConfirm(true)} title={t.office.messages.archiveMessage} className="p-1 rounded-full hover:bg-gray-700">
                                                    <ArchiveIcon className="h-6 w-6 text-gray-400" />
                                                </button>
                                            )}
                                            <button onClick={handleDeleteClick} title={t.office.messages.deleteMessage} className="p-1 rounded-full hover:bg-gray-700">
                                                <TrashIcon className="h-6 w-6 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-gray-300 flex-grow overflow-y-auto pr-2 whitespace-pre-wrap">
                                    {renderMessageBody(selectedMessage)}
                                </div>
                                
                                {selectedMessage.productionEventContext && !selectedMessage.productionEventContext.isResolved && (
                                    <div className="flex justify-center mt-auto pt-4 border-t border-gray-600">
                                        <button onClick={handleGoToSet} className="flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider transition-colors shadow-lg shadow-amber-600/20"><ProduktionIcon className="h-6 w-6" /><span>{t.office.messages.goToSet}</span></button>
                                    </div>
                                )}

                                {selectedMessage.decisionEventContext && !selectedMessage.decisionEventContext.isResolved && (
                                    <div className="flex justify-center mt-auto pt-4 border-t border-gray-600">
                                        <button onClick={handleMakeDecision} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider transition-colors shadow-lg shadow-blue-600/20"><BriefcaseIcon className="h-6 w-6" /><span>{t.office.messages.makeDecision}</span></button>
                                    </div>
                                )}

                                {selectedMessage.offerContext && (
                                    <>
                                        {selectedMessage.offerContext.isNegotiationFailed ? (
                                            <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded text-center"><p className="text-red-400 font-bold italic">{t.marketing.negotiation.feedbackBroke}</p></div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t border-gray-600 flex justify-end gap-4">
                                                <button onClick={handleRejectOffer} disabled={selectedMessage.offerContext.isAccepted || selectedMessage.offerContext.isRejected || selectedMessage.offerContext.isSuperseded || selectedMessage.offerContext.isWithdrawn} className="bg-red-800 hover:bg-red-700 font-bold py-2 px-6 rounded-sm uppercase text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">{t.office.messages.rejectOffer}</button>
                                                <button onClick={() => { markAsRead(selectedMessage.id); setNegotiationContext(selectedMessage.offerContext!); }} disabled={selectedMessage.offerContext.isAccepted || selectedMessage.offerContext.isRejected || selectedMessage.offerContext.isSuperseded || selectedMessage.offerContext.isWithdrawn} className="bg-blue-600 hover:bg-blue-500 font-bold py-2 px-6 rounded-sm uppercase text-sm disabled:bg-gray-600 disabled:cursor-not-allowed">{t.office.messages.negotiate}</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">{t.office.messages.selectMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {negotiationContext && (
                <NegotiationModal
                    offerContext={{ filmTitle: negotiationContext.filmTitle, distributorId: negotiationContext.distributorId, phase: (negotiationContext.phase as any) || 'kino' }}
                    onClose={() => setNegotiationContext(null)}
                />
            )}
            {activeProductionEvent && <ProductionEventModal event={activeProductionEvent} onClose={handleProductionEventChoice} resolvedEffects={activeResolvedEffects} />}
            {activeDecisionEvent && <RandomEventModal event={activeDecisionEvent} onClose={handleDecisionChoice} />}

            {showArchiveConfirm && selectedMessage && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.office.messages.archiveConfirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">{t.office.messages.archiveConfirmText.replace('{subject}', renderTemplate(selectedMessage.subjectTemplate, selectedMessage.subject))}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowArchiveConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button onClick={handleArchiveMessage} className="bg-blue-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-blue-500 transition-all">{t.office.messages.archiveConfirmButton}</button>
                        </div>
                    </div>
                </div>
            )}
             {showRejectConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.office.messages.rejectConfirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">{t.office.messages.rejectConfirmText}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowRejectConfirm(null)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button onClick={confirmRejectOffer} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.office.messages.rejectConfirmButton}</button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.office.messages.deleteConfirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">{t.office.messages.deleteConfirmText.replace('{subject}', renderTemplate(showDeleteConfirm.subjectTemplate, showDeleteConfirm.subject))}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowDeleteConfirm(null)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button onClick={confirmDeleteMessage} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.common.yes}, {t.common.delete}</button>
                        </div>
                    </div>
                </div>
            )}
            {showCannotDeleteInfo && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.office.messages.cannotDeleteTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">{t.office.messages.cannotDeleteText}</p>
                        <div className="flex justify-center">
                            <button onClick={() => setShowCannotDeleteInfo(false)} className="bg-amber-500 text-gray-900 font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all">{t.common.ok}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NachrichtenTab;
