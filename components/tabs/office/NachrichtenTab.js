import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useMemo, useEffect } from "react";
import { useGame } from "../../../contexts/GameContext";
import NegotiationModal from "../../NegotiationModal";
import ArchiveIcon from "../../icons/ArchiveIcon";
import TrashIcon from "../../icons/TrashIcon";
import { ALL_DISTRIBUTORS } from "../../distributors";
import { PRODUCTION_EVENTS } from "../../productionEvents";
import ProductionEventModal from "../../ProductionEventModal";
import ProduktionIcon from "../../icons/ProduktionIcon";
import { useTranslation } from "../../../hooks/useTranslation";
import RandomEventModal from "../../RandomEventModal";
import { DECISION_EVENTS, resolveDecisionEvent } from "../../events/studio/decisionEvents";
import BriefcaseIcon from "../../icons/BriefcaseIcon";
import { getCoverPath } from "../../coverConfig";
const NachrichtenTab = () => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [negotiationContext, setNegotiationContext] = useState(null);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCannotDeleteInfo, setShowCannotDeleteInfo] = useState(false);
  const [activeProductionEvent, setActiveProductionEvent] = useState(null);
  const [activeProductionMessageId, setActiveProductionMessageId] = useState(null);
  const [activeResolvedEffects, setActiveResolvedEffects] = useState(null);
  const [activeDecisionEvent, setActiveDecisionEvent] = useState(null);
  const [activeDecisionMessageId, setActiveDecisionMessageId] = useState(null);
  if (!playerData) return null;
  const setPlayerDataAndPersist = (updater) => {
    setPlayerData((prev) => {
      return updater(prev);
    });
  };
  const getTranslationValue = (key) => {
    return key.split(".").reduce((obj, part) => obj && obj[part], t);
  };
  const getDeterministicString = (options, seed) => {
    if (!options || options.length === 0) return "";
    if (options.length === 1) return options[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % options.length;
    return options[index];
  };
  const resolveName = (id) => {
    if (id === void 0) return language === "de" ? "Unbekannt" : "Unknown";
    if (id === -1) return playerData.playerName;
    if (id === 99901) return playerData.partnerName || (language === "de" ? "Partner" : "Partner");
    if (id >= 99910) {
      const child = playerData.children.find((c) => c.id.includes(String(id)) || 99910 + playerData.children.indexOf(c) === id);
      return child ? `${child.name} (${language === "de" ? "Kind" : "Child"})` : language === "de" ? "Kind" : "Child";
    }
    const director = playerData.directors.find((d) => d.id === id);
    if (director) return director.name;
    const actor = playerData.actors.find((a) => a.id === id);
    if (actor) return actor.name;
    return language === "de" ? "Unbekannt" : "Unknown";
  };
  const renderTemplate = (template, fallback, messageId) => {
    if (!template) {
      return fallback || "";
    }
    const { key, variables } = template;
    const rawValue = getTranslationValue(key);
    let templateString = "";
    if (Array.isArray(rawValue)) {
      templateString = getDeterministicString(rawValue, messageId || key);
    } else if (typeof rawValue === "string") {
      templateString = rawValue;
    } else {
      return fallback || key;
    }
    Object.entries(variables || {}).forEach(([varName, value]) => {
      const placeholder = new RegExp(`{${varName}}`, "g");
      templateString = templateString.replace(placeholder, String(value));
    });
    return templateString;
  };
  const getMessageTimestamp = (message) => {
    const rawDate = message?.date;
    const parsed = rawDate instanceof Date ? rawDate.getTime() : new Date(rawDate).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const getMessageIdTimestamp = (message) => {
    const id = String(message?.id || "");
    const epochMatch = id.match(/(\d{10,})/);
    if (!epochMatch) return 0;
    const epoch = Number(epochMatch[1]);
    return Number.isFinite(epoch) ? epoch : 0;
  };
  const compareMessagesNewestFirst = (a, b) => {
    const dateDiff = getMessageTimestamp(b) - getMessageTimestamp(a);
    if (dateDiff !== 0) return dateDiff;
    return getMessageIdTimestamp(b) - getMessageIdTimestamp(a);
  };
  const formatMessageDateTime = (message) => {
    const timestamp = getMessageTimestamp(message);
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const receivedLabel = language === "de" ? "Eingang" : "Received";
  const messagesToShow = useMemo(() => {
    if (!playerData.messages) return [];
    return [...playerData.messages].filter((m) => activeFolder === "inbox" ? !m.isArchived : m.isArchived).sort(compareMessagesNewestFirst);
  }, [playerData.messages, activeFolder]);
  const selectedMessage = useMemo(() => {
    return messagesToShow.find((m) => m.id === selectedMessageId) || null;
  }, [selectedMessageId, messagesToShow]);
  useEffect(() => {
    if (!selectedMessage && messagesToShow.length > 0 || selectedMessageId && !messagesToShow.some((m) => m.id === selectedMessageId)) {
      const firstMessageId = messagesToShow[0]?.id;
      if (firstMessageId) {
        setSelectedMessageId(firstMessageId);
      } else {
        setSelectedMessageId(null);
      }
    }
  }, [messagesToShow, selectedMessageId, selectedMessage]);
  const markAsRead = (messageId) => {
    setPlayerDataAndPersist((prev) => {
      if (!prev) return null;
      if (prev.messages.find((m) => m.id === messageId)?.read) return prev;
      return {
        ...prev,
        messages: prev.messages.map(
          (m) => m.id === messageId ? { ...m, read: true, readDate: new Date(prev.gameDate) } : m
        )
      };
    });
  };
  const handleSelectMessage = (messageId) => {
    setSelectedMessageId(messageId);
    if (!playerData.messages.find((m) => m.id === messageId)?.read) {
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
    setPlayerDataAndPersist((prev) => {
      if (!prev) return null;
      const updatedFilms = prev.completedFilms.map((film) => {
        if (film.workingTitle === filmTitle && film.offers) {
          const updatedOffers = film.offers.map(
            (o) => o.distributor.id === distributorId ? { ...o, status: "rejected" } : o
          );
          return { ...film, offers: updatedOffers };
        }
        return film;
      });
      const updatedMessages = prev.messages.map(
        (m) => m.id === showRejectConfirm.id ? { ...m, offerContext: { ...m.offerContext, isRejected: true } } : m
      );
      return { ...prev, completedFilms: updatedFilms, messages: updatedMessages };
    });
    setShowRejectConfirm(null);
  };
  const handleArchiveMessage = () => {
    if (!selectedMessage) return;
    setPlayerDataAndPersist((prev) => {
      if (!prev) return null;
      const updatedMessages = prev.messages.map(
        (m) => m.id === selectedMessage.id ? { ...m, isArchived: true } : m
      );
      return { ...prev, messages: updatedMessages };
    });
    setShowArchiveConfirm(false);
  };
  const handleDeleteClick = () => {
    if (!selectedMessage) return;
    if (selectedMessage.offerContext && !selectedMessage.offerContext.isAccepted && !selectedMessage.offerContext.isRejected && !selectedMessage.offerContext.isNegotiationFailed && !selectedMessage.offerContext.isWithdrawn && !selectedMessage.offerContext.isSuperseded) {
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
    setPlayerDataAndPersist((prev) => {
      if (!prev) return null;
      const currentList = [...prev.messages].filter((m) => activeFolder === "inbox" ? !m.isArchived : m.isArchived).sort(compareMessagesNewestFirst);
      const deletedMessageIndex = currentList.findIndex((m) => m.id === showDeleteConfirm.id);
      const updatedMessages = prev.messages.filter((m) => m.id !== showDeleteConfirm.id);
      let nextSelectedId = null;
      const newList = currentList.filter((m) => m.id !== showDeleteConfirm.id);
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
  const getSenderName = (message) => {
    if (message.sender) return message.sender;
    if (message.offerContext) {
      const distributor = ALL_DISTRIBUTORS.find((d) => d.id === message.offerContext.distributorId);
      return distributor ? distributor.name : t.office.messages.distributor;
    }
    return t.office.messages.system;
  };
  const getLiveProductionEventText = (message) => {
    if (!message.productionEventContext || message.productionEventContext.isResolved) return null;
    const eventDef = PRODUCTION_EVENTS.find((e) => e.id === message.productionEventContext.eventId);
    const translated = t.productionEvents[message.productionEventContext.eventId];
    const title = translated?.title || (language === "de" ? eventDef?.title || message.subject || t.office.messages.system : "Production Event");
    const rawText = translated?.text || (language === "de" ? eventDef?.text || message.body || "" : "");
    const talentId = message.productionEventContext.talentId;
    const talentName = talentId !== void 0 ? resolveName(talentId) : language === "de" ? "Crew" : "Crew";
    return {
      title,
      body: rawText.replace(/{talentName}/g, talentName)
    };
  };
  const getLiveDecisionEventText = (message) => {
    if (!message.decisionEventContext || message.decisionEventContext.isResolved) return null;
    const eventDef = DECISION_EVENTS.find((e) => e.id === message.decisionEventContext.eventId);
    const translated = t.studioEvents[message.decisionEventContext.eventId];
    return {
      title: translated?.title || (language === "de" ? eventDef?.title || message.subject || t.office.messages.system : "Decision Required"),
      body: translated?.text || (language === "de" ? eventDef?.text || message.body || "" : "")
    };
  };
  const getDisplaySubject = (message) => {
    const liveProd = getLiveProductionEventText(message);
    if (liveProd) return liveProd.title;
    const liveDecision = getLiveDecisionEventText(message);
    if (liveDecision) return liveDecision.title;
    return renderTemplate(message.subjectTemplate, message.subject, message.id);
  };
  const MessageMoviePoster = ({ film }) => {
    const {
      coverImageId = 1,
      coverTitlePosition = "bottom",
      coverTitleFontSize = 30,
      coverTitleFontFamily = "Cinzel",
      coverTitleColor = "#FFFFFF",
      directorId,
      mainActorId
    } = film;
    const directorName = resolveName(directorId);
    const mainActorName = resolveName(mainActorId);
    const getPositionClass = (pos) => {
      switch (pos) {
        case "top":
          return "justify-start pt-2";
        case "top-center":
          return "justify-start pt-[25%]";
        case "center":
          return "justify-center";
        case "bottom-center":
          return "justify-end pb-[25%]";
        case "bottom":
          return "justify-end pb-2";
        default:
          return "justify-end pb-2";
      }
    };
    const namesPositionClass = coverTitlePosition === "top" || coverTitlePosition === "top-center" || coverTitlePosition === "center" ? "bottom-2" : "top-2";
    const directorNameUpper = directorName.toUpperCase();
    const mainActorNameUpper = mainActorName.toUpperCase();
    const combinedLength = directorNameUpper.length + mainActorNameUpper.length;
    let nameFontSize = 7;
    if (combinedLength > 40) nameFontSize = 4;
    else if (combinedLength > 30) nameFontSize = 5;
    else if (combinedLength > 20) nameFontSize = 6;
    return /* @__PURE__ */ jsx("div", { className: "relative w-32 h-48 flex-shrink-0 border-2 border-gray-600 rounded-sm overflow-hidden shadow-xl bg-gray-900 group", children: film.contract ? /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-black flex items-center justify-center relative overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center transform -rotate-45", children: /* @__PURE__ */ jsx("div", { className: "bg-amber-500 w-[200%] py-1 text-center shadow-lg", children: /* @__PURE__ */ jsx("span", { className: "text-black font-black text-xs uppercase tracking-widest font-cinzel", children: t.project.modeSelector.contract }) }) }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: film.customCover || getCoverPath(film.genre, coverImageId),
          alt: `Cover f\xFCr ${film.workingTitle}`,
          className: "w-full h-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: `absolute inset-0 flex flex-col pointer-events-none p-1 ${getPositionClass(coverTitlePosition)}`, children: /* @__PURE__ */ jsx(
        "h3",
        {
          className: "text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] leading-tight",
          style: { fontFamily: coverTitleFontFamily, fontSize: `${(coverTitleFontSize || 30) * 0.427}px`, color: coverTitleColor },
          children: film.workingTitle
        }
      ) }),
      directorId !== void 0 && mainActorId !== void 0 && /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-1`,
          style: {
            color: coverTitleColor,
            fontSize: `${nameFontSize}px`,
            lineHeight: "1.1",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          },
          children: /* @__PURE__ */ jsxs("p", { children: [
            directorNameUpper,
            " ",
            /* @__PURE__ */ jsx("span", { className: "mx-0.5", children: "\u2022" }),
            " ",
            mainActorNameUpper
          ] })
        }
      )
    ] }) });
  };
  const handleMakeDecision = () => {
    if (!selectedMessage || !selectedMessage.decisionEventContext) return;
    markAsRead(selectedMessage.id);
    const eventId = selectedMessage.decisionEventContext.eventId;
    const eventDef = DECISION_EVENTS.find((e) => e.id === eventId);
    if (eventDef) {
      const translatedActions = eventDef.actions?.map((action) => {
        const actionTrans = t.studioEvents[eventId]?.actions?.[action.value];
        return {
          ...action,
          text: actionTrans?.text || (language === "de" ? action.text : action.value),
          tooltip: actionTrans?.tooltip || (language === "de" ? action.tooltip : "")
        };
      });
      const hydratedEvent = {
        ...eventDef,
        title: t.studioEvents[eventId]?.title || (language === "de" ? eventDef.title : "Decision Required"),
        text: t.studioEvents[eventId]?.text || (language === "de" ? eventDef.text : ""),
        actions: translatedActions
      };
      setActiveDecisionEvent(hydratedEvent);
      setActiveDecisionMessageId(selectedMessage.id);
    }
  };
  const handleDecisionChoice = (choiceValue) => {
    if (!activeDecisionEvent || !activeDecisionMessageId || !choiceValue) {
      setActiveDecisionEvent(null);
      setActiveDecisionMessageId(null);
      return;
    }
    setPlayerDataAndPersist((currentData) => {
      if (!currentData) return null;
      const result = resolveDecisionEvent(activeDecisionEvent.id, choiceValue, currentData);
      const updatedData = result.updatedData;
      const translatedEvent = t.studioEvents[activeDecisionEvent.id];
      const buttonLabel = translatedEvent?.actions?.[choiceValue]?.text || activeDecisionEvent.actions?.find((a) => a.value === choiceValue)?.text || choiceValue;
      const translatedOutcome = translatedEvent?.actions?.[choiceValue]?.tooltip;
      const outcomeText = translatedOutcome || (language === "de" ? result.logEntry : result.logEntry ? "Effects applied." : "");
      const updatedMessages = updatedData.messages.map((m) => {
        if (m.id === activeDecisionMessageId) {
          const logSuffix = outcomeText ? `

${language === "de" ? "Resultat" : "Result"}: ${outcomeText}` : "";
          const newBody = `${m.body || ""}

[${t.office.messages.decisionMade.toUpperCase()}: ${buttonLabel}]${logSuffix}`;
          return { ...m, body: newBody, decisionEventContext: { ...m.decisionEventContext, isResolved: true, resolvedChoice: choiceValue } };
        }
        return m;
      });
      const eventLogText = `${language === "de" ? "Entscheidung" : "Decision"}: ${buttonLabel}. ${outcomeText || ""}`.trim();
      const eventLog = [...updatedData.eventLog || [], { date: new Date(updatedData.gameDate), title: activeDecisionEvent.title, text: eventLogText, category: "Studio" }];
      return { ...updatedData, messages: updatedMessages, eventLog };
    });
    setActiveDecisionEvent(null);
    setActiveDecisionMessageId(null);
  };
  const handleGoToSet = () => {
    if (!selectedMessage || !selectedMessage.productionEventContext) return;
    markAsRead(selectedMessage.id);
    const { eventId, talentId, resolvedEffects } = selectedMessage.productionEventContext;
    const event = PRODUCTION_EVENTS.find((e) => e.id === eventId);
    if (event) {
      setActiveProductionEvent({ ...event, talentId });
      setActiveProductionMessageId(selectedMessage.id);
      setActiveResolvedEffects(resolvedEffects);
    }
  };
  const generateTooltipText = (choiceValue, effect, resolvedEffects) => {
    const resolved = resolvedEffects ? resolvedEffects[choiceValue] : null;
    const parts = [];
    const txt = t.productionEvents.effects || { quality: "Quality", hype: "Hype", reputation: "Reputation", duration: "Duration", cost: "Cost", days: "days" };
    const quality = resolved?.quality ?? effect.qualityModifier;
    const hype = resolved?.hype ?? effect.hypeModifier;
    const reputation = resolved?.reputation ?? effect.reputationModifier;
    const duration = resolved?.duration ?? effect.durationModifier;
    const cost = resolved?.cost ?? effect.costModifier;
    if (quality) parts.push(quality > 0 ? `${txt.quality} +${quality}` : `${txt.quality} ${quality}`);
    if (hype) parts.push(`${txt.hype}: ${hype > 0 ? "+" : ""}${hype}`);
    if (reputation) parts.push(reputation > 0 ? `${txt.reputation} +${reputation}` : `${txt.reputation} ${reputation}`);
    if (duration) parts.push(`${txt.duration}: ${duration > 0 ? "+" : ""}${duration} ${txt.days}`);
    if (cost) {
      const formattedCost = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Math.abs(cost));
      parts.push(`${txt.cost}: ${cost > 0 ? "-" : "+"}${formattedCost}`);
    }
    if (parts.length === 0) return "";
    return parts.join(" | ");
  };
  const handleProductionEventChoice = (choice) => {
    if (!activeProductionEvent || !activeProductionMessageId) return;
    setPlayerDataAndPersist((currentData) => {
      if (!currentData) return null;
      const projTitle = currentData.messages.find((m) => m.id === activeProductionMessageId)?.productionEventContext?.filmTitle;
      const targetProject = currentData.activeProjects.find((p) => p.workingTitle === projTitle);
      if (!targetProject) {
        const updatedMessages2 = currentData.messages.map((m) => m.id === activeProductionMessageId ? { ...m, productionEventContext: { ...m.productionEventContext, isResolved: true } } : m);
        return { ...currentData, messages: updatedMessages2 };
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
      newProject.productionEventLog = [...newProject.productionEventLog || [], { eventId, choice: choice.value, date: new Date(currentData.gameDate) }];
      let newCapital = currentData.capital;
      let newTransactionLog = [...currentData.transactionLog];
      if (costMod !== 0) {
        newCapital -= costMod;
        newTransactionLog.push({ date: new Date(currentData.gameDate), type: "Ausgabe", category: "Filmproduktion", description: `${t.office.messages.productionInfo}: ${activeProductionEvent.title}`, amount: Math.abs(costMod) });
      }
      if (durationMod && newProject.productionEndDate) {
        const newEndDate = new Date(newProject.productionEndDate);
        newEndDate.setDate(newEndDate.getDate() + durationMod);
        newProject.productionEndDate = newEndDate;
      }
      const effectsSummary = generateTooltipText(choice.value, choice.effect, activeResolvedEffects);
      const resultString = effectsSummary ? `

${t.office.messages.studioEventEffectsHeader}
- ${effectsSummary}` : "";
      const updatedMessages = currentData.messages.map((m) => {
        if (m.id === activeProductionMessageId) {
          const translatedEvent = t.productionEvents[activeProductionEvent.id];
          const buttonLabel = translatedEvent?.actions?.[choice.value] || (language === "de" ? choice.text : choice.value);
          const newBody = `${m.body || ""}

[${t.office.messages.decisionMade.toUpperCase()}: ${buttonLabel}]${resultString}`;
          return { ...m, body: newBody, productionEventContext: { ...m.productionEventContext, isResolved: true } };
        }
        return m;
      });
      const updatedProjects = currentData.activeProjects.map((p) => p.workingTitle === projTitle ? newProject : p);
      return { ...currentData, activeProjects: updatedProjects, capital: newCapital, reputation: Math.max(0, Math.min(100, currentData.reputation + repMod)), transactionLog: newTransactionLog, messages: updatedMessages };
    });
    setActiveProductionEvent(null);
    setActiveProductionMessageId(null);
    setActiveResolvedEffects(null);
  };
  const renderMessageBody = (message) => {
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    if (message.bodyTemplate) {
      const { key, variables } = message.bodyTemplate;
      let body = "";
      switch (key) {
        case "offer":
        case "reminder":
        case "withdraw": {
          const salutationKey = variables.salutationKey || "marketing.offerMessage.followUpSalutation";
          let salutationTemplate = getTranslationValue(salutationKey);
          const salutation = typeof salutationTemplate === "string" ? salutationTemplate.replace("{lastName}", variables.lastName) : "Hallo";
          const bodyTextKey = variables.bodyTextKey;
          let bodyText = "";
          if (bodyTextKey) {
            const templateOptions = getTranslationValue(bodyTextKey);
            let rawTemplate = Array.isArray(templateOptions) ? getDeterministicString(templateOptions, message.id) : templateOptions;
            if (rawTemplate) {
              bodyText = rawTemplate.replace(/{filmTitle}/g, variables.filmTitle);
              if (variables.totalValue) bodyText = bodyText.replace(/{totalValue}/g, formatCurrency(variables.totalValue));
            } else bodyText = "Nachricht konnte nicht geladen werden.";
          } else if (key === "reminder") {
            const remTemplate = t.marketing.offerMessage.reminderBody;
            if (remTemplate) {
              let remText = remTemplate.replace("{filmTitle}", variables.filmTitle);
              if (variables.totalValue) remText = remText.replace("{totalValue}", formatCurrency(variables.totalValue));
              bodyText = remText;
            } else bodyText = `Erinnerung: Angebot f\xFCr ${variables.filmTitle}`;
          } else if (key === "withdraw") {
            const wdTemplate = t.marketing.offerMessage.withdrawBody;
            if (wdTemplate) bodyText = wdTemplate.replace("{filmTitle}", variables.filmTitle);
            else bodyText = `Angebot zur\xFCckgezogen: ${variables.filmTitle}`;
          }
          body = `${salutation},

${bodyText}

${t.marketing.offerMessage.closing}

${t.marketing.offerMessage.regards}
${variables.distributorName}`;
          break;
        }
        case "studioEvent": {
          let text2 = getTranslationValue(variables.textKey);
          if (text2 && typeof text2 === "string") {
            Object.entries(variables || {}).forEach(([k, v]) => {
              if (!["textKey", "capitalChange", "reputationChange", "researchPointsChange", "privateCapitalChange", "energyChange", "relationshipChange"].includes(k)) {
                text2 = text2.replace(new RegExp(`{${k}}`, "g"), String(v));
              }
            });
          }
          let effects = "";
          const capital = variables.capitalChange || 0;
          const rep = variables.reputationChange || 0;
          const research = variables.researchPointsChange || 0;
          const privateCapital = variables.privateCapitalChange || 0;
          const energy = variables.energyChange || 0;
          const relationship = variables.relationshipChange || 0;
          if (capital || rep || research || privateCapital || energy || relationship) {
            effects = `

${t.office.messages.studioEventEffectsHeader}
`;
            if (capital) effects += `- ${t.office.messages.studioEventCapital}: ${capital > 0 ? "+" : ""}${formatCurrency(capital)}
`;
            if (rep) effects += `- ${t.office.messages.studioEventReputation}: ${rep > 0 ? "+" : ""}${rep}
`;
            if (research) effects += `- ${t.office.messages.studioEventResearch}: ${research > 0 ? "+" : ""}${research}
`;
            if (privateCapital) effects += `- ${t.privatelife.status.privateCapital}: ${privateCapital > 0 ? "+" : ""}${formatCurrency(privateCapital)}
`;
            if (energy) effects += `- ${t.privatelife.overview.vitality}: ${energy > 0 ? "+" : ""}${energy}%
`;
            if (relationship) effects += `- ${t.privatelife.overview.status}: ${relationship > 0 ? "+" : ""}${relationship}
`;
          }
          body = `${text2}${effects}`;
          break;
        }
        default:
          let textRaw = getTranslationValue(key);
          let text = Array.isArray(textRaw) ? getDeterministicString(textRaw, message.id) : typeof textRaw === "string" ? textRaw : message.body || t.office.messages.noMessages;
          if (text) {
            Object.entries(variables || {}).forEach(([k, v]) => text = text.replace(new RegExp(`{${k}}`, "g"), String(v)));
            body = text;
          }
      }
      return /* @__PURE__ */ jsxs("div", { className: "flex gap-6 items-start", children: [
        message.imageUrl && /* @__PURE__ */ jsxs("div", { className: "relative w-40 h-56 flex-shrink-0 border-2 border-gray-600 rounded-sm overflow-hidden shadow-xl bg-gray-900", children: [
          /* @__PURE__ */ jsx("img", { src: message.imageUrl, alt: "Portrait", className: "w-full h-full object-cover" }),
          message.id.startsWith("msg_death_") && /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-[150%] h-8 bg-black transform -rotate-45 -translate-x-16 -translate-y-4 opacity-90 shadow-lg" }) })
        ] }),
        message.linkedProject && /* @__PURE__ */ jsx(MessageMoviePoster, { film: message.linkedProject }),
        /* @__PURE__ */ jsx("div", { className: "flex-grow", children: renderMessageBodyWithKeywords(body) })
      ] });
    }
    if (message.body) {
      const liveProduction = getLiveProductionEventText(message);
      const liveDecision = getLiveDecisionEventText(message);
      const displayBody = liveProduction?.body || liveDecision?.body || message.body;
      return /* @__PURE__ */ jsxs("div", { className: "flex gap-6 items-start", children: [
        message.imageUrl && /* @__PURE__ */ jsxs("div", { className: "relative w-40 h-56 flex-shrink-0 border-2 border-gray-600 rounded-sm overflow-hidden shadow-xl bg-gray-900", children: [
          /* @__PURE__ */ jsx("img", { src: message.imageUrl, alt: "Portrait", className: "w-full h-full object-cover" }),
          message.id.startsWith("msg_death_") && /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-[150%] h-8 bg-black transform -rotate-45 -translate-x-16 -translate-y-4 opacity-90 shadow-lg" }) })
        ] }),
        message.linkedProject && /* @__PURE__ */ jsx(MessageMoviePoster, { film: message.linkedProject }),
        /* @__PURE__ */ jsx("div", { className: "flex-grow", children: renderMessageBodyWithKeywords(displayBody) })
      ] });
    }
    return t.office.messages.noMessages;
  };
  const renderMessageBodyWithKeywords = (body) => {
    const colorRegex = /{([a-z]+):([^}]+)}/g;
    const keywords = [
      t.marketing.offerMessage.lumpSum,
      t.marketing.offerMessage.installments,
      t.marketing.offerMessage.revenueShare,
      t.marketing.offerMessage.embargo,
      t.marketing.offerMessage.totalValue,
      t.office.messages.studioEventEffectsHeader,
      t.office.messages.studioEventCapital,
      t.office.messages.studioEventReputation,
      t.office.messages.studioEventResearch
    ];
    const parseLineWithColors = (text) => {
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = colorRegex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
        const color = match[1];
        const content = match[2];
        let colorClass = "text-white";
        if (color === "red") colorClass = "text-red-400 font-bold";
        else if (color === "green") colorClass = "text-green-400 font-bold";
        else if (color === "yellow") colorClass = "text-amber-400 font-bold";
        parts.push(/* @__PURE__ */ jsx("span", { className: colorClass, children: content }, match.index));
        lastIndex = colorRegex.lastIndex;
      }
      if (lastIndex < text.length) parts.push(text.substring(lastIndex));
      return parts.length > 0 ? parts : text;
    };
    return body.split("\n").map((line, index) => {
      const keywordMatch = keywords.find((kw) => line.trim().startsWith(kw));
      if (keywordMatch) {
        const splitIndex = line.indexOf(keywordMatch) + keywordMatch.length;
        const prefix = line.substring(0, splitIndex);
        const remainder = line.substring(splitIndex);
        const separatorMatch = remainder.match(/^(\s*:\s*)(.*)/);
        let content = remainder;
        if (separatorMatch) content = separatorMatch[2];
        const hasTags = /{[a-z]+:[^}]+}/.test(content);
        return /* @__PURE__ */ jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-300", children: prefix }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: separatorMatch?.[1] || "" }),
          hasTags ? parseLineWithColors(content) : /* @__PURE__ */ jsx("span", { className: "text-amber-400 font-semibold", children: content }),
          /* @__PURE__ */ jsx("br", {})
        ] }, index);
      }
      return /* @__PURE__ */ jsxs(React.Fragment, { children: [
        parseLineWithColors(line),
        /* @__PURE__ */ jsx("br", {})
      ] }, index);
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/80 p-6 rounded-lg border border-gray-700 h-full flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex border-b border-gray-700", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveFolder("inbox"), className: `py-2 px-6 font-bold text-lg transition-colors ${activeFolder === "inbox" ? "text-amber-400 border-b-2 border-amber-400" : "text-gray-400 hover:text-white"}`, children: t.office.messages.inbox }),
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveFolder("archive"), className: `py-2 px-6 font-bold text-lg transition-colors ${activeFolder === "archive" ? "text-amber-400 border-b-2 border-amber-400" : "text-gray-400 hover:text-white"}`, children: t.office.messages.archive })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold font-cinzel text-amber-400", children: t.office.screen.nav.messages }),
        /* @__PURE__ */ jsx("div", { className: "w-48" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-grow flex gap-6 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-1/3 flex-shrink-0 flex flex-col bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-y-auto flex-grow", children: messagesToShow.length > 0 ? messagesToShow.map((message) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleSelectMessage(message.id),
              className: `w-full text-left p-3 border-b border-gray-700 transition-colors ${selectedMessage?.id === message.id ? "bg-amber-900/50" : "hover:bg-gray-700/50"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 truncate", children: [
                    t.office.messages.from,
                    " ",
                    getSenderName(message)
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 flex-shrink-0 ml-2", children: formatMessageDateTime(message) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: `truncate ${!message.read ? "font-bold text-white" : "font-normal text-gray-400"}`, children: getDisplaySubject(message) })
              ]
            },
            message.id
          )) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 italic p-4 text-center", children: t.office.messages.noMessages }) }),
          activeFolder === "inbox" && /* @__PURE__ */ jsx("div", { className: "p-2 border-t border-gray-700 bg-gray-900/30 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500 italic", children: t.office.messages.autoDeleteHint }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-2/3 bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex flex-col", children: selectedMessage ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "border-b border-gray-700 pb-2 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400", children: [
                t.office.messages.from,
                " ",
                getSenderName(selectedMessage)
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                receivedLabel,
                ": ",
                formatMessageDateTime(selectedMessage)
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white mt-1", children: getDisplaySubject(selectedMessage) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              activeFolder === "inbox" && /* @__PURE__ */ jsx("button", { onClick: () => setShowArchiveConfirm(true), title: t.office.messages.archiveMessage, className: "p-1 rounded-full hover:bg-gray-700", children: /* @__PURE__ */ jsx(ArchiveIcon, { className: "h-6 w-6 text-gray-400" }) }),
              /* @__PURE__ */ jsx("button", { onClick: handleDeleteClick, title: t.office.messages.deleteMessage, className: "p-1 rounded-full hover:bg-gray-700", children: /* @__PURE__ */ jsx(TrashIcon, { className: "h-6 w-6 text-gray-400" }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-300 flex-grow overflow-y-auto pr-2 whitespace-pre-wrap", children: renderMessageBody(selectedMessage) }),
          selectedMessage.productionEventContext && !selectedMessage.productionEventContext.isResolved && /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-auto pt-4 border-t border-gray-600", children: /* @__PURE__ */ jsxs("button", { onClick: handleGoToSet, className: "flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider transition-colors shadow-lg shadow-amber-600/20", children: [
            /* @__PURE__ */ jsx(ProduktionIcon, { className: "h-6 w-6" }),
            /* @__PURE__ */ jsx("span", { children: t.office.messages.goToSet })
          ] }) }),
          selectedMessage.decisionEventContext && !selectedMessage.decisionEventContext.isResolved && /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-auto pt-4 border-t border-gray-600", children: /* @__PURE__ */ jsxs("button", { onClick: handleMakeDecision, className: "flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider transition-colors shadow-lg shadow-blue-600/20", children: [
            /* @__PURE__ */ jsx(BriefcaseIcon, { className: "h-6 w-6" }),
            /* @__PURE__ */ jsx("span", { children: t.office.messages.makeDecision })
          ] }) }),
          selectedMessage.offerContext && /* @__PURE__ */ jsx(Fragment, { children: selectedMessage.offerContext.isNegotiationFailed ? /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded text-center", children: /* @__PURE__ */ jsx("p", { className: "text-red-400 font-bold italic", children: t.marketing.negotiation.feedbackBroke }) }) : /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-600 flex justify-end gap-4", children: [
            /* @__PURE__ */ jsx("button", { onClick: handleRejectOffer, disabled: selectedMessage.offerContext.isAccepted || selectedMessage.offerContext.isRejected || selectedMessage.offerContext.isSuperseded || selectedMessage.offerContext.isWithdrawn, className: "bg-red-800 hover:bg-red-700 font-bold py-2 px-6 rounded-sm uppercase text-sm disabled:bg-gray-600 disabled:cursor-not-allowed", children: t.office.messages.rejectOffer }),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              markAsRead(selectedMessage.id);
              setNegotiationContext(selectedMessage.offerContext);
            }, disabled: selectedMessage.offerContext.isAccepted || selectedMessage.offerContext.isRejected || selectedMessage.offerContext.isSuperseded || selectedMessage.offerContext.isWithdrawn, className: "bg-blue-600 hover:bg-blue-500 font-bold py-2 px-6 rounded-sm uppercase text-sm disabled:bg-gray-600 disabled:cursor-not-allowed", children: t.office.messages.negotiate })
          ] }) })
        ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: t.office.messages.selectMessage }) }) })
      ] })
    ] }),
    negotiationContext && /* @__PURE__ */ jsx(
      NegotiationModal,
      {
        offerContext: { filmTitle: negotiationContext.filmTitle, distributorId: negotiationContext.distributorId, phase: negotiationContext.phase || "kino" },
        onClose: () => setNegotiationContext(null)
      }
    ),
    activeProductionEvent && /* @__PURE__ */ jsx(ProductionEventModal, { event: activeProductionEvent, onClose: handleProductionEventChoice, resolvedEffects: activeResolvedEffects }),
    activeDecisionEvent && /* @__PURE__ */ jsx(RandomEventModal, { event: activeDecisionEvent, onClose: handleDecisionChoice }),
    showArchiveConfirm && selectedMessage && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.office.messages.archiveConfirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.office.messages.archiveConfirmText.replace("{subject}", renderTemplate(selectedMessage.subjectTemplate, selectedMessage.subject)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowArchiveConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx("button", { onClick: handleArchiveMessage, className: "bg-blue-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-blue-500 transition-all", children: t.office.messages.archiveConfirmButton })
      ] })
    ] }) }),
    showRejectConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.office.messages.rejectConfirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.office.messages.rejectConfirmText }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowRejectConfirm(null), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsx("button", { onClick: confirmRejectOffer, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.office.messages.rejectConfirmButton })
      ] })
    ] }) }),
    showDeleteConfirm && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.office.messages.deleteConfirmTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.office.messages.deleteConfirmText.replace("{subject}", renderTemplate(showDeleteConfirm.subjectTemplate, showDeleteConfirm.subject)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowDeleteConfirm(null), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }),
        /* @__PURE__ */ jsxs("button", { onClick: confirmDeleteMessage, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: [
          t.common.yes,
          ", ",
          t.common.delete
        ] })
      ] })
    ] }) }),
    showCannotDeleteInfo && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.office.messages.cannotDeleteTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.office.messages.cannotDeleteText }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("button", { onClick: () => setShowCannotDeleteInfo(false), className: "bg-amber-500 text-gray-900 font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all", children: t.common.ok }) })
    ] }) })
  ] });
};
var NachrichtenTab_default = NachrichtenTab;
export {
  NachrichtenTab_default as default
};
