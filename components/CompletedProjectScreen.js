import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { GameState, ProjectType } from "../types";
import { newProjectBackgroundImage } from "./backgrounds/NewProjectBackgroundImage";
import StarRating from "./StarRating";
import { useGame } from "../contexts/GameContext";
import { GENRE_IDEAL_PROFILES } from "./genreProfiles";
import ChatBubbleIcon from "./icons/ChatBubbleIcon";
import { getCoverPath } from "./coverConfig";
import { MOVIE_SIZE_CONFIG, EXTRAS_OPTIONS, GENRE_IDEAL_AGE_RATING } from "./constants";
import { useTranslation } from "../hooks/useTranslation";
const getQualityPrestigeBonus = (quality) => {
  if (quality >= 40 && quality <= 59) return 1;
  if (quality >= 60 && quality <= 74) return 3;
  if (quality >= 75 && quality <= 89) return 6;
  if (quality >= 90 && quality <= 97) return 11;
  if (quality >= 98) return 19;
  return 0;
};
const CompletedProjectScreen = ({ onBack, setGameState, onNavigateToMarketingTab, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const isSeries = project.projectType === ProjectType.Series;
  const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  useEffect(() => {
    if (project && !project.testAudienceFeedback && playerData) {
      setPlayerData((prev) => {
        if (!prev) return prev;
        const feedback = [];
        const idealProfile2 = GENRE_IDEAL_PROFILES[project.genre];
        if (idealProfile2) {
          const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
          const viewers = [
            "Michael",
            "Jennifer",
            "David",
            "Jessica",
            "James",
            "Sarah",
            "John",
            "Linda",
            "Robert",
            "Patricia",
            "Chris",
            "Elizabeth",
            "Daniel",
            "Susan",
            "Paul",
            "Karen",
            "Mark",
            "Nancy",
            "Brian",
            "Lisa",
            "Kevin",
            "Betty",
            "George",
            "Dorothy",
            "Steven",
            "Mary",
            "Ryan",
            "Sandra",
            "Jacob",
            "Ashley"
          ];
          const usedViewerNames = /* @__PURE__ */ new Set();
          const pickUniqueRandomViewer = () => {
            if (usedViewerNames.size >= viewers.length) return "Viewer";
            let viewerName;
            do {
              viewerName = pickRandom(viewers);
            } while (usedViewerNames.has(viewerName));
            usedViewerNames.add(viewerName);
            return viewerName;
          };
          const focusCategories = [
            { key: "action", label: t.creativeFocus.action, value: project.focusAction },
            { key: "humor", label: t.creativeFocus.humor, value: project.focusHumor },
            { key: "romance", label: t.creativeFocus.romance, value: project.focusRomance },
            { key: "dialogues", label: t.creativeFocus.dialogues, value: project.focusDialogues },
            { key: "violence", label: t.creativeFocus.violence, value: project.focusViolence },
            { key: "costumes", label: t.creativeFocus.costumes, value: project.focusCostumes },
            { key: "makeup", label: t.creativeFocus.makeup, value: project.focusMakeup },
            { key: "stunts", label: t.creativeFocus.stunts, value: project.focusStunts }
          ];
          const categoriesWithDeviation = focusCategories.map((category) => {
            const playerValue = category.value === 0 ? 0 : category.value ?? 5;
            const idealValue = idealProfile2[category.key];
            const deviation = idealValue !== void 0 ? Math.abs(playerValue - idealValue) : 0;
            return { ...category, deviation, idealValue };
          });
          const imperfectMatches = categoriesWithDeviation.filter((c) => c.deviation > 0).sort((a, b) => b.deviation - a.deviation);
          const perfectMatches = categoriesWithDeviation.filter((c) => c.deviation === 0).sort(() => 0.5 - Math.random());
          let selectedCategories = [...imperfectMatches, ...perfectMatches].slice(0, 4);
          selectedCategories.forEach((category) => {
            if (category.idealValue === void 0) return;
            const playerValue = category.value === 0 ? 0 : category.value ?? 5;
            const idealValue = category.idealValue;
            const difference = playerValue - idealValue;
            let comment = "";
            const feedbackTemplates = {
              tooLow: [
                `I expected much more ${category.label}. It was almost missing.`,
                `${category.label} was neglected in this film.`
              ],
              low: [
                `A bit more ${category.label} wouldn't have hurt.`,
                `I think they could have emphasized ${category.label} more.`
              ],
              tooHigh: [
                `They really overdid it with ${category.label}. Less would have been more.`,
                `Why so much ${category.label}? It was too much.`
              ],
              high: [
                `At times, the ${category.label} was a bit overwhelming.`,
                `I think the film would have worked with slightly less ${category.label}.`
              ],
              perfect: [
                `The balance of ${category.label} was perfect. Great job!`,
                `Just the right amount of ${category.label}. That made the film for me.`
              ]
            };
            if (language === "de") {
              feedbackTemplates.tooLow = [
                `Von ${category.label} h\xE4tte ich mir deutlich mehr erwartet. Das fehlte fast komplett.`,
                `Ich fand, dass ${category.label} in dem Film str\xE4flich vernachl\xE4ssigt wurde.`
              ];
              feedbackTemplates.low = [
                `Eine Prise mehr ${category.label} h\xE4tte dem Film nicht geschadet.`,
                `Ich fand, man h\xE4tte ${category.label} noch etwas st\xE4rker betonen k\xF6nnen.`
              ];
              feedbackTemplates.tooHigh = [
                `Mit ${category.label} hat man es wirklich \xFCbertrieben. Weniger w\xE4re hier definitiv mehr gewesen.`,
                `Warum so viel ${category.label}? Das war wirklich too much.`
              ];
              feedbackTemplates.high = [
                `Stellenweise war mir das ein bisschen zu viel ${category.label}.`,
                `Ich glaube, der Film h\xE4tte auch mit etwas weniger ${category.label} funktioniert.`
              ];
              feedbackTemplates.perfect = [
                `Die Balance beim Thema ${category.label} war perfekt getroffen. Gro\xDFartig!`,
                `Genau die richtige Dosis ${category.label}. Das hat f\xFCr mich den Film ausgemacht.`
              ];
            }
            if (difference <= -3) comment = pickRandom(feedbackTemplates.tooLow);
            else if (difference < 0) comment = pickRandom(feedbackTemplates.low);
            else if (difference >= 3) comment = pickRandom(feedbackTemplates.tooHigh);
            else if (difference > 0) comment = pickRandom(feedbackTemplates.high);
            else comment = pickRandom(feedbackTemplates.perfect);
            feedback.push({ viewer: pickUniqueRandomViewer(), text: comment });
          });
        }
        const updatedCompletedFilms = prev.completedFilms.map((f) => {
          if (f.workingTitle === project.workingTitle) {
            return { ...f, testAudienceFeedback: feedback };
          }
          return f;
        });
        let updatedCurrentProject = prev.currentProject;
        if (prev.currentProject && prev.currentProject.workingTitle === project.workingTitle) {
          updatedCurrentProject = { ...prev.currentProject, testAudienceFeedback: feedback };
        }
        return {
          ...prev,
          completedFilms: updatedCompletedFilms,
          currentProject: updatedCurrentProject
        };
      });
    }
    if (project && project.totalCost === void 0 && playerData) {
      const weeklyCostsTransactions = playerData.transactionLog.filter(
        (t2) => t2.category === "Filmproduktion" && (t2.descriptionKey === "weeklyProductionCosts" && t2.descriptionVars?.filmTitle === project.workingTitle || t2.description.startsWith("W\xF6chentliche Fixkosten") || t2.description.startsWith("Weekly fixed costs")) && t2.description.includes(`"${project.workingTitle}"`)
      );
      const totalWeeklyCosts = weeklyCostsTransactions.reduce((sum, t2) => sum + t2.amount, 0);
      const productionEventTransactions = playerData.transactionLog.filter(
        (t2) => project.productionStartDate && t2.category === "Filmproduktion" && t2.type === "Ausgabe" && (t2.description.startsWith("Produktions-Event:") || t2.description.startsWith("Production Event:")) && new Date(t2.date) >= new Date(project.productionStartDate)
      );
      const totalProductionEventCosts = productionEventTransactions.reduce((sum, t2) => sum + t2.amount, 0);
      const marketingCampaignTransactions = playerData.transactionLog.filter(
        (t2) => t2.category === "Marketing" && t2.type === "Ausgabe" && t2.descriptionKey === "marketingCampaign" && t2.descriptionVars?.filmTitle === project.workingTitle
      );
      const totalMarketingCampaignCosts = marketingCampaignTransactions.reduce((sum, t2) => sum + t2.amount, 0);
      const totalCost = (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0) + (project.directorGage || 0) + (project.mainActorGage || 0) + (project.supportingActorGage || 0) + (project.productionCost || 0) + (project.postProductionCost || 0) + totalWeeklyCosts + totalProductionEventCosts + totalMarketingCampaignCosts;
      setPlayerData((prev) => {
        if (!prev) return prev;
        const updatedCompletedFilms = prev.completedFilms.map((f) => {
          if (f.workingTitle === project.workingTitle) {
            return { ...f, totalCost };
          }
          return f;
        });
        let updatedCurrentProject = prev.currentProject;
        if (prev.currentProject && prev.currentProject.workingTitle === project.workingTitle) {
          updatedCurrentProject = { ...prev.currentProject, totalCost };
        }
        return {
          ...prev,
          completedFilms: updatedCompletedFilms,
          currentProject: updatedCurrentProject
        };
      });
    }
  }, [project, playerData, setPlayerData, t, language]);
  if (!playerData || !project) {
    return /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex items-center justify-center", children: [
      /* @__PURE__ */ jsx("p", { children: t.project.progress.noActive }),
      /* @__PURE__ */ jsx("button", { onClick: onBack, children: t.common.back })
    ] });
  }
  const archiveProject = (startMarketing) => {
    setPlayerData((prev) => {
      if (!prev) return prev;
      const film = { ...project };
      const filmQuality = film.finalQuality || 0;
      let newMessages = [...prev.messages];
      if (film.contract) {
        const isSuccess = filmQuality >= film.contract.minQuality;
        const productionCost = film.totalCost || 0;
        const upfront = film.contract.upfrontPayment || 0;
        let capitalChange = 0;
        let transactionDescription = "";
        let transactionType = "Einnahme";
        const refund = productionCost;
        if (isSuccess) {
          const remainingPayout = film.contract.payout - upfront;
          capitalChange = refund + remainingPayout;
          transactionDescription = language === "de" ? `Auftrag erf\xFCllt: "${film.workingTitle}" (Erstattung + Restprovision)` : `Contract fulfilled: "${film.workingTitle}" (reimbursement + remaining commission)`;
          transactionType = "Einnahme";
          prev.reputation = Math.min(100, prev.reputation + 1);
        } else {
          const deduction = film.contract.penalty + upfront;
          capitalChange = refund - deduction;
          if (capitalChange >= 0) {
            transactionDescription = language === "de" ? `Auftrag beendet: "${film.workingTitle}" (Erstattung abz\xFCgl. Strafe/Vorschuss)` : `Contract closed: "${film.workingTitle}" (reimbursement minus penalty/advance)`;
            transactionType = "Einnahme";
          } else {
            transactionDescription = language === "de" ? `Auftragsstrafe + R\xFCckzahlung: "${film.workingTitle}"` : `Contract penalty + repayment: "${film.workingTitle}"`;
            transactionType = "Ausgabe";
            capitalChange = Math.abs(capitalChange);
          }
          prev.reputation = Math.max(0, prev.reputation - 2);
        }
        if (transactionType === "Einnahme") {
          prev.capital += capitalChange;
        } else {
          prev.capital -= capitalChange;
        }
        prev.transactionLog.push({
          date: new Date(prev.gameDate),
          type: transactionType,
          category: "Filmproduktion",
          description: transactionDescription,
          amount: capitalChange
        });
        const emailSubject = language === "de" ? `Projektabschluss: ${film.contract.title}` : `Project Completion: ${film.contract.title}`;
        let emailBody = "";
        const formattedUpfront = formatCurrency(upfront);
        if (isSuccess) {
          emailBody = language === "de" ? `Sehr geehrte Damen und Herren,

vielen Dank f\xFCr die Fertigstellung von "${film.contract.title}".

Das Ergebnis hat uns \xFCberzeugt. Die Qualit\xE4t von ${Math.round(filmQuality)} liegt \xFCber unserer Anforderung von ${film.contract.minQuality}.

Wie vereinbart erstatten wir die Produktionskosten in H\xF6he von ${formatCurrency(productionCost)} und \xFCberweisen die Restprovision (abz\xFCgl. Vorschuss von ${formattedUpfront}).

Wir freuen uns auf weitere Zusammenarbeit.

Mit freundlichen Gr\xFC\xDFen,
${film.contract.stationName}` : `Dear Sir or Madam,

thank you for completing "${film.contract.title}".

The result convinced us. The quality of ${Math.round(filmQuality)} exceeds our requirement of ${film.contract.minQuality}.

As agreed, we reimburse production costs of ${formatCurrency(productionCost)} and transfer the remaining commission (minus the advance of ${formattedUpfront}).

We look forward to working together again.

Sincerely,
${film.contract.stationName}`;
        } else {
          emailBody = language === "de" ? `Sehr geehrte Damen und Herren,

wir haben die Endfassung von "${film.contract.title}" gepr\xFCft.

Leider entspricht die Qualit\xE4t von ${Math.round(filmQuality)} nicht unseren Anforderungen (Ziel: ${film.contract.minQuality}).

Wir erstatten vertragsgem\xE4\xDF die Produktionskosten von ${formatCurrency(productionCost)}, m\xFCssen jedoch die vereinbarte Vertragsstrafe in H\xF6he von ${formatCurrency(film.contract.penalty)} sowie den geleisteten Vorschuss von ${formattedUpfront} verrechnen.

Mit freundlichen Gr\xFC\xDFen,
${film.contract.stationName}` : `Dear Sir or Madam,

we have reviewed the final cut of "${film.contract.title}".

Unfortunately, the quality of ${Math.round(filmQuality)} does not meet our requirement (target: ${film.contract.minQuality}).

As per contract, we reimburse production costs of ${formatCurrency(productionCost)}, but must offset the agreed contractual penalty of ${formatCurrency(film.contract.penalty)} and the advance of ${formattedUpfront}.

Sincerely,
${film.contract.stationName}`;
        }
        const contractEndMessage = {
          id: `msg_contract_end_${Date.now()}`,
          date: new Date(prev.gameDate),
          sender: film.contract.stationName,
          subject: emailSubject,
          body: emailBody,
          read: false
        };
        newMessages.push(contractEndMessage);
      }
      let prestigeChange = 0;
      let newReputation = prev.reputation;
      if (!film.prestigeAwarded && !film.contract) {
        prestigeChange = 1;
        prestigeChange += getQualityPrestigeBonus(filmQuality);
        newReputation = Math.min(100, Math.max(0, prev.reputation + prestigeChange));
        film.prestigeAwarded = true;
      }
      if (startMarketing && !film.contract) {
        const firstOfferInDays = 3 + Math.floor(Math.random() * 5);
        const nextOfferDate = new Date(prev.gameDate);
        nextOfferDate.setDate(nextOfferDate.getDate() + firstOfferInDays);
        film.nextOfferDate = nextOfferDate;
      }
      const updateTalentStats = (talent) => {
        const newTalent = { ...talent };
        const skillGain = 1 + Math.floor(Math.random() * 3);
        newTalent.potential = Math.min(100, newTalent.potential);
        newTalent.skill = Math.min(100, Math.min(newTalent.potential, newTalent.skill + skillGain));
        newTalent.loyalty = Math.min(100, (newTalent.loyalty || 0) + 5 + Math.floor(Math.random() * 6));
        const moralDecrease = 20 + Math.floor(Math.random() * 21);
        newTalent.moral = Math.max(0, newTalent.moral - moralDecrease);
        const isDirector = "speedModifier" in newTalent;
        const skill = newTalent.skill;
        let multiplier = isDirector ? 8 : 10;
        if (skill <= 20) multiplier = isDirector ? 2 : 4;
        else if (skill <= 50) multiplier = isDirector ? 4 : 6;
        else if (skill <= 80) multiplier = isDirector ? 6 : 8;
        const baseCost = 15e3 + multiplier * Math.pow(skill, 3.1);
        newTalent.cost = Math.round(baseCost / 100) * 100;
        return newTalent;
      };
      const hiredDirectorId = film.directorId;
      const hiredActorIds = [film.mainActorId, film.supportingActorId].filter((id) => id !== void 0 && id !== -1);
      let updatedDirectors = prev.directors.map((d) => d.id === hiredDirectorId ? updateTalentStats(d) : d);
      let updatedActors = prev.actors.map((a) => hiredActorIds.includes(a.id) ? updateTalentStats(a) : a);
      let finalSpezialisierungen = [...prev.genreSpezialisierungen];
      if (filmQuality >= 70) {
        const involvedTalentIds = [film.directorId, ...hiredActorIds].filter((id) => id !== void 0 && id !== -1);
        involvedTalentIds.forEach((talentId) => {
          const spezIndex = finalSpezialisierungen.findIndex((s) => s.talentId === talentId && s.genre === film.genre);
          if (spezIndex > -1) {
            finalSpezialisierungen[spezIndex].level = Math.min(5, finalSpezialisierungen[spezIndex].level + 1);
          } else {
            finalSpezialisierungen.push({ talentId, genre: film.genre, level: 1 });
          }
        });
      }
      let finalChemie = [...prev.talentChemie];
      const updateChemie = (id1, id2) => {
        if (id1 === -1 || id2 === -1) return;
        const ids = [id1, id2].sort((a, b) => a - b);
        const chemieIndex = finalChemie.findIndex((c) => c.talentA_id === ids[0] && c.talentB_id === ids[1]);
        if (chemieIndex > -1) {
          finalChemie[chemieIndex].level = Math.min(5, finalChemie[chemieIndex].level + 1);
        } else {
          finalChemie.push({ talentA_id: ids[0], talentB_id: ids[1], level: 1 });
        }
      };
      if (filmQuality >= 80 && film.directorId !== void 0 && film.mainActorId !== void 0) {
        updateChemie(film.directorId, film.mainActorId);
      }
      if (filmQuality >= 75 && film.mainActorId !== void 0 && film.supportingActorId !== void 0) {
        updateChemie(film.mainActorId, film.supportingActorId);
      }
      const updatedCompletedFilms = prev.completedFilms.map((f) => {
        if (f.workingTitle === film.workingTitle) {
          return film;
        }
        return f;
      });
      const finalCompletedFilms = film.contract ? updatedCompletedFilms.filter((f) => f.workingTitle !== film.workingTitle) : updatedCompletedFilms;
      let newCurrentProject = prev.currentProject;
      if (prev.currentProject && prev.currentProject.workingTitle === film.workingTitle) {
        newCurrentProject = null;
      }
      return {
        ...prev,
        reputation: newReputation,
        completedFilms: finalCompletedFilms,
        directors: updatedDirectors,
        actors: updatedActors,
        talentChemie: finalChemie,
        genreSpezialisierungen: finalSpezialisierungen,
        currentProject: newCurrentProject,
        // Clears it only if it matches
        messages: newMessages,
        lastNotifiedScriptTitle: void 0,
        lastNotifiedCastingTitle: void 0,
        lastNotifiedProductionFinishedTitle: void 0,
        lastNotifiedCompletedTitle: void 0
      };
    });
  };
  const handleArchive = () => {
    archiveProject(true);
    setGameState(GameState.MainScreen);
  };
  const {
    coverImageId = 1,
    coverTitlePosition = "bottom",
    coverTitleFontSize = 30,
    coverTitleFontFamily = "Cinzel",
    coverTitleColor = "#FFFFFF"
  } = project;
  const getPositionClass = () => {
    switch (coverTitlePosition) {
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
  const resolveName = (id) => {
    if (id === void 0) return language === "de" ? "Unbekannt" : "Unknown";
    if (id === -1) return playerData.playerName;
    if (id === 99901) return playerData.partnerName || (language === "de" ? "Partner" : "Partner");
    if (id >= 99910) return playerData.children[id - 99910]?.name || (language === "de" ? "Kind" : "Child");
    const director2 = playerData.directors.find((d) => d.id === id);
    if (director2) return director2.name;
    const actor = playerData.actors.find((a) => a.id === id);
    if (actor) return actor.name;
    return language === "de" ? "Unbekannt" : "Unknown";
  };
  const director = resolveName(project.directorId);
  const mainActor = resolveName(project.mainActorId);
  const supportingActor = resolveName(project.supportingActorId);
  const movieSizeName = project.movieSize ? MOVIE_SIZE_CONFIG[project.movieSize].name : "N/A";
  const extrasName = project.extrasLevel ? t.productionOptions.extras[`level${project.extrasLevel}`]?.name || EXTRAS_OPTIONS.find((e) => e.level === project.extrasLevel)?.name : "-";
  const FocusBar = ({ label, value, color }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs py-1", children: [
    /* @__PURE__ */ jsx("span", { className: "text-gray-400 w-24", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex-grow bg-gray-700 rounded-full h-2.5 mx-2", children: /* @__PURE__ */ jsx("div", { className: `${color} h-2.5 rounded-full`, style: { width: `${value * 10}%` } }) }),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-white w-4 text-right", children: value })
  ] });
  const idealProfile = GENRE_IDEAL_PROFILES[project.genre];
  const getFocusColor = (playerValue, idealValue) => {
    const value = playerValue === 0 ? 0 : playerValue ?? 5;
    const diff = Math.abs(value - idealValue);
    if (diff === 0) return "bg-green-500";
    if (diff === 1) return "bg-yellow-500";
    return "bg-red-500";
  };
  const InfoRow = ({ label, value, isSub = false }) => /* @__PURE__ */ jsxs("div", { className: `flex justify-between items-center py-1.5 ${isSub ? "pl-4" : ""} border-b border-gray-800`, children: [
    /* @__PURE__ */ jsx("span", { className: isSub ? "text-gray-400" : "text-gray-300", children: label }),
    /* @__PURE__ */ jsx("span", { className: "font-semibold text-white text-right", children: value })
  ] });
  if (project.contract) {
    const isSuccess = (project.finalQuality || 0) >= project.contract.minQuality;
    const totalCost = project.totalCost || 0;
    const upfront = project.contract.upfrontPayment || 0;
    const penalty = project.contract.penalty;
    const netTransaction = isSuccess ? totalCost + (project.contract.payout - upfront) : totalCost - penalty - upfront;
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-full h-full bg-cover bg-center",
        style: { backgroundImage: `url(${newProjectBackgroundImage})` },
        children: /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-black bg-opacity-80 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 border-2 border-amber-500 rounded-lg shadow-2xl w-full max-w-3xl p-8 relative flex flex-col animate-fade-in", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-center mb-8 font-cinzel text-amber-400 border-b border-gray-700 pb-4", children: language === "de" ? "Zusammenfassung-Auftragsarbeit" : "Contract Work Summary" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white mb-4", children: language === "de" ? "Vertragsbedingungen" : "Contract Terms" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Sender:" : "Station:", value: project.contract.stationName }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Genre:" : "Genre:", value: t.genres[project.contract.genre] }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Titel:" : "Title:", value: project.workingTitle }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Geforderte Qualit\xE4t:" : "Required Quality:", value: `${project.contract.minQuality}` }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Erhaltener Vorschuss:" : "Advance Received:", value: formatCurrency(upfront) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white mb-4", children: language === "de" ? "Ergebnis" : "Result" }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4 text-lg", children: [
                /* @__PURE__ */ jsx("span", { children: language === "de" ? "Erreichte Qualit\xE4t:" : "Achieved Quality:" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(StarRating, { rating: project.finalQuality || 0, size: "md" }),
                  /* @__PURE__ */ jsxs("span", { className: `font-bold ${isSuccess ? "text-green-400" : "text-red-400"}`, children: [
                    "(",
                    Math.round(project.finalQuality || 0),
                    ")"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: `p-4 rounded border-l-4 ${isSuccess ? "bg-green-900/20 border-green-500" : "bg-red-900/20 border-red-500"}`, children: isSuccess ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-green-400 font-bold mb-2", children: language === "de" ? "Auftrag erfolgreich!" : "Contract Successful!" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm", children: language === "de" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Sie haben den Auftrag zu unserer Zufriedenheit erledigt. Sie erhalten die Produktionskosten von ",
                  /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: formatCurrency(totalCost) }),
                  " erstattet. Zus\xE4tzlich wird die vereinbarte Provision von ",
                  /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: formatCurrency(project.contract.payout) }),
                  " f\xE4llig (abz\xFCglich des bereits erhaltenen Vorschusses von ",
                  formatCurrency(upfront),
                  ")."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  "You fulfilled the contract to our satisfaction. You are reimbursed production costs of ",
                  /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: formatCurrency(totalCost) }),
                  ". In addition, the agreed commission of ",
                  /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: formatCurrency(project.contract.payout) }),
                  " becomes due (minus the advance already received of ",
                  formatCurrency(upfront),
                  ")."
                ] }) })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-red-400 font-bold mb-2", children: language === "de" ? "Auftrag gescheitert" : "Contract Failed" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm", children: language === "de" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  "Sie haben die geforderte Qualit\xE4t nicht erreicht. Die Produktionskosten von ",
                  /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: formatCurrency(totalCost) }),
                  " werden erstattet, aber die Vertragsstrafe von ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold", children: formatCurrency(penalty) }),
                  " sowie der erhaltene Vorschuss von ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold", children: formatCurrency(upfront) }),
                  " werden abgezogen."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  "You did not reach the required quality. Production costs of ",
                  /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: formatCurrency(totalCost) }),
                  " are reimbursed, but the contractual penalty of ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold", children: formatCurrency(penalty) }),
                  " and the advance received of ",
                  /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold", children: formatCurrency(upfront) }),
                  " are deducted."
                ] }) })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white mb-2", children: language === "de" ? "Abrechnung (Jetzt)" : "Settlement (Now)" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-1", children: isSuccess ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Erstattung Produktionskosten:" : "Production Cost Reimbursement:", value: `+${formatCurrency(totalCost)}` }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Vereinbarte Provision:" : "Agreed Commission:", value: `+${formatCurrency(project.contract.payout)}` }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Abz\xFCglich Vorschuss:" : "Less Advance:", value: `-${formatCurrency(upfront)}` }),
                /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-lg", children: [
                  /* @__PURE__ */ jsx("span", { children: language === "de" ? "Gutschrift:" : "Credit:" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-green-400", children: [
                    "+",
                    formatCurrency(netTransaction)
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Erstattung Produktionskosten:" : "Production Cost Reimbursement:", value: `+${formatCurrency(totalCost)}` }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "Vertragsstrafe:" : "Contract Penalty:", value: `-${formatCurrency(penalty)}` }),
                /* @__PURE__ */ jsx(InfoRow, { label: language === "de" ? "R\xFCckzahlung Vorschuss:" : "Advance Repayment:", value: `-${formatCurrency(upfront)}` }),
                /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-lg", children: [
                  /* @__PURE__ */ jsx("span", { children: language === "de" ? "Gesamtbilanz (Gutschrift/Lastschrift):" : "Net Balance (Credit/Debit):" }),
                  /* @__PURE__ */ jsxs("span", { className: netTransaction >= 0 ? "text-green-400" : "text-red-400", children: [
                    netTransaction >= 0 ? "+" : "",
                    formatCurrency(netTransaction)
                  ] })
                ] })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleArchive,
              className: "bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20",
              children: t.common.close
            }
          ) })
        ] }) })
      }
    );
  }
  const idealRating = GENRE_IDEAL_AGE_RATING[project.genre];
  const isRatingCorrect = project.ageRating === idealRating;
  const ratingLabel = project.ageRating ? t.project.planning.ratings[project.ageRating] : "-";
  const summaryTitle = isSeries ? language === "de" ? "Serienzusammenfassung" : "Series Summary" : t.completedProject.title;
  const sizeOrSeasonLabel = isSeries ? language === "de" ? "Staffel" : "Season" : t.completedProject.size;
  const sizeOrSeasonValue = isSeries ? `${project.seasonNumber || 1}` : movieSizeName;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "w-full h-full bg-cover bg-center",
      style: { backgroundImage: `url(${newProjectBackgroundImage})` },
      children: /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-black bg-opacity-0 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-7xl border border-gray-700", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-center mb-2 font-cinzel text-amber-400", children: summaryTitle }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
          /* @__PURE__ */ jsx("div", { className: "md:col-span-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-[300px] h-[450px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: project.customCover || getCoverPath(project.genre, coverImageId),
                alt: `Cover f\xFCr ${project.workingTitle}`,
                className: "w-full h-full object-cover",
                onError: (e) => {
                  e.target.style.visibility = "hidden";
                }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: `absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass()}`, children: /* @__PURE__ */ jsx(
              "h3",
              {
                className: "text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]",
                style: { fontFamily: coverTitleFontFamily, fontSize: `${coverTitleFontSize || 30}px`, lineHeight: 1.2, color: coverTitleColor },
                children: project.workingTitle
              }
            ) }),
            project.directorId !== void 0 && project.mainActorId !== void 0 && (() => {
              const titlePos = coverTitlePosition || "bottom";
              const namesPositionClass = titlePos === "top" || titlePos === "top-center" || titlePos === "center" ? "bottom-2" : "top-2";
              const directorNameUpper = director.toUpperCase();
              const mainActorNameUpper = mainActor.toUpperCase();
              const combinedLength = directorNameUpper.length + mainActorNameUpper.length;
              let nameFontSize = 14;
              if (combinedLength > 35) nameFontSize = 10;
              else if (combinedLength > 25) nameFontSize = 11;
              else if (combinedLength > 18) nameFontSize = 12;
              return /* @__PURE__ */ jsx(
                "div",
                {
                  className: `absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-1`,
                  style: {
                    color: coverTitleColor || "#FFFFFF",
                    fontSize: `${nameFontSize}px`,
                    lineHeight: "1.2"
                  },
                  children: /* @__PURE__ */ jsxs("p", { children: [
                    directorNameUpper,
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "mx-1", children: "\u2022" }),
                    " ",
                    mainActorNameUpper
                  ] })
                }
              );
            })()
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-1 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-amber-300 border-b border-gray-600 pb-2 mb-2", children: t.completedProject.overview }),
              /* @__PURE__ */ jsx(InfoRow, { label: t.completedProject.filmTitle, value: project.workingTitle }),
              /* @__PURE__ */ jsx(InfoRow, { label: t.completedProject.genre, value: t.genres[project.genre] }),
              /* @__PURE__ */ jsx(InfoRow, { label: sizeOrSeasonLabel, value: sizeOrSeasonValue }),
              /* @__PURE__ */ jsx(
                InfoRow,
                {
                  label: t.project.planning.ageRating,
                  value: /* @__PURE__ */ jsx("span", { className: isRatingCorrect ? "text-green-400" : "text-red-400", children: ratingLabel })
                }
              ),
              /* @__PURE__ */ jsx(InfoRow, { label: t.completedProject.director, value: director }),
              /* @__PURE__ */ jsx(InfoRow, { label: t.completedProject.mainActor, value: mainActor }),
              /* @__PURE__ */ jsx(InfoRow, { label: t.completedProject.supportingActor, value: supportingActor }),
              /* @__PURE__ */ jsx(InfoRow, { label: t.completedProject.extras, value: extrasName })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: t.completedProject.finalQuality }),
                /* @__PURE__ */ jsx(StarRating, { rating: project.finalQuality || 0, size: "md" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between items-center border-t border-gray-600 pt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: t.completedProject.totalCost }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-400", children: formatCurrency(project.totalCost || 0) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-1 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 h-1/2 overflow-y-auto", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-amber-300 border-b border-gray-600 pb-2 mb-2", children: t.completedProject.feedback }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: (project.testAudienceFeedback || []).map((fb, i) => /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/50 p-2 rounded-md", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsx(ChatBubbleIcon, { className: "h-4 w-4 text-gray-400" }),
                  /* @__PURE__ */ jsxs("p", { className: "font-bold text-white text-xs", children: [
                    fb.viewer,
                    " sagt:"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-300 italic", children: [
                  '"',
                  fb.text,
                  '"'
                ] })
              ] }, i)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 h-1/2", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-amber-300 border-b border-gray-600 pb-2 mb-2", children: t.completedProject.creativeFocus }),
              idealProfile ? /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.action, value: project.focusAction || 0, color: getFocusColor(project.focusAction, idealProfile.action) }),
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.humor, value: project.focusHumor || 0, color: getFocusColor(project.focusHumor, idealProfile.humor) }),
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.romance, value: project.focusRomance || 0, color: getFocusColor(project.focusRomance, idealProfile.romance) }),
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.dialogues, value: project.focusDialogues || 0, color: getFocusColor(project.focusDialogues, idealProfile.dialogues) }),
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.violence, value: project.focusViolence || 0, color: getFocusColor(project.focusViolence, idealProfile.violence) }),
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.costumes, value: project.focusCostumes || 0, color: getFocusColor(project.focusCostumes, idealProfile.costumes) }),
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.makeup, value: project.focusMakeup || 0, color: getFocusColor(project.focusMakeup, idealProfile.makeup) }),
                /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.stunts, value: project.focusStunts || 0, color: getFocusColor(project.focusStunts, idealProfile.stunts) })
              ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-center", children: "Kein Idealprofil verf\xFCgbar" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleArchive,
            className: "bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20",
            children: t.completedProject.returnToMenu
          }
        ) })
      ] }) })
    }
  );
};
var CompletedProjectScreen_default = CompletedProjectScreen;
export {
  CompletedProjectScreen_default as default
};
