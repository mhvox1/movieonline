import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { useGame } from "../../../contexts/GameContext";
import { ProjectType } from "../../../types";
import StarRating from "../../StarRating";
import HeartRating from "../../HeartRating";
import TrophyIcon from "../../icons/TrophyIcon";
import {
  EXTRAS_OPTIONS,
  GENRE_IDEAL_AGE_RATING
} from "../../constants";
import { GENRE_IDEAL_PROFILES } from "../../genreProfiles";
import ChatBubbleIcon from "../../icons/ChatBubbleIcon";
import { getCoverPath } from "../../coverConfig";
import ArrowLeftIcon from "../../icons/ArrowLeftIcon";
import ArrowRightIcon from "../../icons/ArrowRightIcon";
import { useTranslation } from "../../../hooks/useTranslation";
const formatCurrency = (val) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);
const DetailRow = ({ label, value }) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm py-1 border-b border-gray-700/50 last:border-b-0", children: [
  /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: label }),
  /* @__PURE__ */ jsx("span", { className: "font-semibold text-white text-right", children: value })
] });
const MyFilmsTab = ({ initialFilmTitle }) => {
  const { playerData } = useGame();
  const { t, language } = useTranslation();
  const [selectedFilmTitle, setSelectedFilmTitle] = useState("");
  const [activeView, setActiveView] = useState("movies");
  const [feedbackStartIndex, setFeedbackStartIndex] = useState(0);
  if (!playerData) return null;
  const FocusBar = ({ label, value, color }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs py-1", children: [
    /* @__PURE__ */ jsx("span", { className: "text-gray-400 w-24", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex-grow bg-gray-700 rounded-full h-2.5 mx-2", children: /* @__PURE__ */ jsx("div", { className: `${color} h-2.5 rounded-full`, style: { width: `${value * 10}%` } }) }),
    /* @__PURE__ */ jsx("span", { className: "font-mono text-white w-4 text-right", children: value })
  ] });
  const getFocusColor = (playerValue, idealValue) => {
    const value = playerValue || 5;
    const diff = Math.abs(value - idealValue);
    if (diff === 0) {
      return "bg-green-500";
    }
    if (diff === 1) {
      return "bg-yellow-500";
    }
    return "bg-red-500";
  };
  const myFilms = useMemo(() => {
    const filteredProjects = playerData.completedFilms.filter((project) => {
      const isSeries = project.projectType === ProjectType.Series;
      return activeView === "series" ? isSeries : !isSeries;
    });
    return [...filteredProjects].sort((a, b) => {
      const getFilmDate = (film) => film.cinemaRelease?.releaseDate ? new Date(film.cinemaRelease.releaseDate) : new Date(film.scriptEndDate);
      return getFilmDate(b).getTime() - getFilmDate(a).getTime();
    });
  }, [playerData.completedFilms, activeView]);
  useEffect(() => {
    const filmExistsInList = (title) => myFilms.some((f) => f.workingTitle === title);
    if (initialFilmTitle && filmExistsInList(initialFilmTitle)) {
      setSelectedFilmTitle(initialFilmTitle);
      return;
    }
    setSelectedFilmTitle((prev) => {
      if (prev && filmExistsInList(prev)) {
        return prev;
      }
      if (myFilms.length > 0) {
        return myFilms[0].workingTitle;
      }
      return "";
    });
  }, [myFilms, initialFilmTitle]);
  useEffect(() => {
    setFeedbackStartIndex(0);
  }, [selectedFilmTitle]);
  const selectedFilm = useMemo(() => {
    return myFilms.find((f) => f.workingTitle === selectedFilmTitle) || null;
  }, [myFilms, selectedFilmTitle]);
  const currentIndex = useMemo(() => {
    return myFilms.findIndex((f) => f.workingTitle === selectedFilmTitle);
  }, [myFilms, selectedFilmTitle]);
  const handlePrevFilm = () => {
    if (myFilms.length <= 1) return;
    const prevIndex = (currentIndex - 1 + myFilms.length) % myFilms.length;
    setSelectedFilmTitle(myFilms[prevIndex].workingTitle);
  };
  const handleNextFilm = () => {
    if (myFilms.length <= 1) return;
    const nextIndex = (currentIndex + 1) % myFilms.length;
    setSelectedFilmTitle(myFilms[nextIndex].workingTitle);
  };
  const calculateTotalFilmRevenue = (film) => {
    if (film.activeDeal) {
      const deal = film.activeDeal;
      const guaranteedAmount = deal.upfrontPayment + deal.monthlyPayment * deal.durationMonths;
      const paidFixedPortion = deal.upfrontPayment + deal.monthlyPayment * deal.monthsPassed;
      const earnedRevShare = Math.max(0, deal.totalEarnings - paidFixedPortion);
      return guaranteedAmount + earnedRevShare;
    }
    let totalRevenue = 0;
    if (film.cinemaRelease) {
      totalRevenue += film.cinemaRelease.lumpSum + (film.cinemaRelease.totalPlayerRevenue || 0);
    }
    if (film.homeEntertainment) {
      totalRevenue += film.homeEntertainment.lumpSum + (film.homeEntertainment.installments ? film.homeEntertainment.installments.monthlyAmount * film.homeEntertainment.installments.months : 0);
    }
    if (film.payTv) {
      totalRevenue += film.payTv.lumpSum + (film.payTv.installments ? film.payTv.installments.monthlyAmount * film.payTv.installments.months : 0);
    }
    if (film.freeTv) {
      totalRevenue += film.freeTv.lumpSum + (film.freeTv.installments ? film.freeTv.installments.monthlyAmount * film.freeTv.installments.months : 0);
    }
    return totalRevenue;
  };
  const getFilmStatusText = (film) => {
    if (!film.activeDeal) return { text: t.marketing.myFilms.status.notMarketed, color: "text-red-400" };
    const deal = film.activeDeal;
    const locale = language === "de" ? "de-DE" : "en-US";
    if (deal.currentPhase === "waiting_for_release") {
      const dateStr = deal.nextPhaseStartDate ? new Date(deal.nextPhaseStartDate).toLocaleDateString(locale) : "?";
      return { text: `Start: ${dateStr}`, color: "text-indigo-400" };
    } else if (deal.currentPhase === "cinema") {
      return { text: "Phase: Kino", color: "text-amber-400" };
    } else if (deal.currentPhase === "transition_to_home") {
      return { text: "Kino beendet - Warte auf Home Ent.", color: "text-gray-400" };
    } else if (deal.currentPhase === "home") {
      return { text: "Phase: Home Entertainment", color: "text-blue-400" };
    } else if (deal.currentPhase === "payTv") {
      return { text: "Phase: Pay-TV", color: "text-cyan-400" };
    } else if (deal.currentPhase === "freeTv") {
      return { text: "Phase: Free-TV", color: "text-gray-400" };
    } else {
      return { text: t.marketing.myFilms.status.complete, color: "text-green-400" };
    }
  };
  const resolveName = (id) => {
    if (id === void 0) return "-";
    if (id === -1) return playerData.playerName;
    if (id === 99901) return playerData.partnerName || "Partner";
    if (id >= 99910) return playerData.children[id - 99910]?.name || "Kind";
    const director = playerData.directors.find((d) => d.id === id);
    if (director) return director.name;
    const actor = playerData.actors.find((a) => a.id === id);
    if (actor) return actor.name;
    return "-";
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold text-center font-cinzel text-amber-400 mb-6", children: t.marketing.myFilms.title }),
    myFilms.length > 0 ? /* @__PURE__ */ jsx(Fragment, { children: selectedFilm && (() => {
      const isSeries = selectedFilm.projectType === ProjectType.Series;
      const totalCost = selectedFilm.totalCost || 0;
      const totalRevenue = calculateTotalFilmRevenue(selectedFilm);
      const netProfit = totalRevenue - totalCost;
      const directorName = resolveName(selectedFilm.directorId);
      const mainActorName = resolveName(selectedFilm.mainActorId);
      const supportingActorName = resolveName(selectedFilm.supportingActorId);
      const idealProfile = GENRE_IDEAL_PROFILES[selectedFilm.genre];
      const status = getFilmStatusText(selectedFilm);
      const {
        coverImageId = 1,
        coverTitlePosition = "bottom",
        coverTitleFontSize = 30,
        coverTitleFontFamily = "Cinzel",
        coverTitleColor = "#FFFFFF"
      } = selectedFilm;
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
      const contractDate = selectedFilm.activeDeal ? selectedFilm.activeDeal.signedDate ? new Date(selectedFilm.activeDeal.signedDate) : new Date(selectedFilm.activeDeal.startDate) : null;
      const locale = language === "de" ? "de-DE" : "en-US";
      const feedbacks = selectedFilm.testAudienceFeedback || [];
      const maxFeedbackStart = Math.max(0, feedbacks.length - 3);
      const handlePrevFeedback = () => {
        setFeedbackStartIndex((prev) => Math.max(0, prev - 1));
      };
      const handleNextFeedback = () => {
        setFeedbackStartIndex((prev) => Math.min(maxFeedbackStart, prev + 1));
      };
      const displayedFeedbacks = feedbacks.slice(feedbackStartIndex, feedbackStartIndex + 3);
      const idealRating = GENRE_IDEAL_AGE_RATING[selectedFilm.genre];
      const isRatingCorrect = selectedFilm.ageRating === idealRating;
      const ratingLabel = selectedFilm.ageRating ? t.project.planning.ratings[selectedFilm.ageRating] : "-";
      const awardList = selectedFilm.awards || [];
      return /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/90 p-2 rounded-lg border border-gray-700 space-y-1.5 max-w-7xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-start gap-3 px-1 pt-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setActiveView("movies"),
              className: `px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === "movies" ? "bg-amber-500 text-gray-900 border-amber-400" : "bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500"}`,
              children: t.marketing.myFilms.filterMovies
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setActiveView("series"),
              className: `px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === "series" ? "bg-amber-500 text-gray-900 border-amber-400" : "bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500"}`,
              children: t.marketing.myFilms.filterSeries
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center border-b border-gray-700 pb-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-cinzel text-amber-300", children: selectedFilm.workingTitle }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: t.genres[selectedFilm.genre] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-1 mt-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(StarRating, { rating: selectedFilm.finalQuality || 0 }),
              !isSeries && selectedFilm.awards && selectedFilm.awards.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-yellow-400", title: selectedFilm.awards.join(", "), children: [
                /* @__PURE__ */ jsx(TrophyIcon, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: selectedFilm.awards.length })
              ] })
            ] }),
            /* @__PURE__ */ jsx(HeartRating, { rating: selectedFilm.hype || 0, size: "sm" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: `text-xs font-bold mt-1 ${status.color}`, children: status.text })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 flex flex-col items-center justify-start pt-4 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative w-[200px] h-[300px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700 mx-auto", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: selectedFilm.customCover || getCoverPath(selectedFilm.genre, coverImageId),
                  alt: `Cover f\xFCr ${selectedFilm.workingTitle}`,
                  className: "w-full h-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: `absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass()}`, children: /* @__PURE__ */ jsx(
                "h3",
                {
                  className: "text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]",
                  style: { fontFamily: coverTitleFontFamily || "Cinzel", fontSize: `${(coverTitleFontSize || 30) / 1.5}px`, lineHeight: 1.2, color: coverTitleColor || "#FFFFFF" },
                  children: selectedFilm.workingTitle
                }
              ) }),
              selectedFilm.directorId !== void 0 && selectedFilm.mainActorId !== void 0 && (() => {
                const namesPositionClass = coverTitlePosition === "top" || coverTitlePosition === "top-center" || coverTitlePosition === "center" ? "bottom-2" : "top-2";
                const directorNameUpper = directorName.toUpperCase();
                const mainActorNameUpper = mainActorName.toUpperCase();
                const combinedLength = directorNameUpper.length + mainActorNameUpper.length;
                let nameFontSize = 9;
                if (combinedLength > 40) {
                  nameFontSize = 7;
                } else if (combinedLength > 30) {
                  nameFontSize = 8;
                }
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
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handlePrevFilm,
                  disabled: myFilms.length <= 1,
                  className: "p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
                  "aria-label": "Vorheriger Film",
                  children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-6 w-6 text-white" })
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-400 font-semibold", children: [
                currentIndex + 1,
                " / ",
                myFilms.length
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleNextFilm,
                  disabled: myFilms.length <= 1,
                  className: "p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
                  "aria-label": "N\xE4chster Film",
                  children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-6 w-6 text-white" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-black/50 p-2 rounded-md text-sm w-full", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-base font-cinzel text-amber-400 text-center mb-1", children: t.marketing.myFilms.financeOverview }),
              /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto space-y-0.5", children: [
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.totalCost, value: formatCurrency(totalCost) }),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.totalRevenue, value: formatCurrency(totalRevenue) }),
                /* @__PURE__ */ jsxs("div", { className: `flex justify-between font-bold py-1 border-t-2 border-amber-500/50 mt-1 ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`, children: [
                  /* @__PURE__ */ jsx("span", { children: t.marketing.myFilms.netProfit }),
                  /* @__PURE__ */ jsx("span", { children: formatCurrency(netProfit) })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-9 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-gray-900/50 p-2 rounded-md space-y-1", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-base font-cinzel text-amber-400 border-b border-gray-700 pb-1 mb-1", children: t.marketing.myFilms.productionDetails }),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.director, value: directorName }),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.mainActor, value: mainActorName }),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.supportingActor, value: supportingActorName }),
                /* @__PURE__ */ jsx(
                  DetailRow,
                  {
                    label: t.project.planning.ageRating,
                    value: /* @__PURE__ */ jsx("span", { className: isRatingCorrect ? "text-green-400" : "text-red-400", children: ratingLabel })
                  }
                ),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.extras, value: (t.productionOptions.extras[`level${selectedFilm.extrasLevel}`] || EXTRAS_OPTIONS.find((e) => e.level === selectedFilm.extrasLevel))?.name || "-" }),
                !isSeries && /* @__PURE__ */ jsx(
                  DetailRow,
                  {
                    label: t.marketing.myFilms.awards,
                    value: awardList.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end text-right", children: awardList.map((award, index) => /* @__PURE__ */ jsx("span", { children: award }, `${award}-${index}`)) }) : "-"
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-2 rounded-md", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-base font-cinzel text-amber-400 border-b border-gray-700 pb-1 mb-1", children: t.marketing.myFilms.creativeFocus }),
                idealProfile ? /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.action, value: selectedFilm.focusAction || 0, color: getFocusColor(selectedFilm.focusAction, idealProfile.action) }),
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.humor, value: selectedFilm.focusHumor || 0, color: getFocusColor(selectedFilm.focusHumor, idealProfile.humor) }),
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.romance, value: selectedFilm.focusRomance || 0, color: getFocusColor(selectedFilm.focusRomance, idealProfile.romance) }),
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.dialogues, value: selectedFilm.focusDialogues || 0, color: getFocusColor(selectedFilm.focusDialogues, idealProfile.dialogues) }),
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.violence, value: selectedFilm.focusViolence || 0, color: getFocusColor(selectedFilm.focusViolence, idealProfile.violence) }),
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.costumes, value: selectedFilm.focusCostumes || 0, color: getFocusColor(selectedFilm.focusCostumes, idealProfile.costumes) }),
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.makeup, value: selectedFilm.focusMakeup || 0, color: getFocusColor(selectedFilm.focusMakeup, idealProfile.makeup) }),
                  /* @__PURE__ */ jsx(FocusBar, { label: t.creativeFocus.stunts, value: selectedFilm.focusStunts || 0, color: getFocusColor(selectedFilm.focusStunts, idealProfile.stunts) })
                ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-center text-xs py-2", children: "Kein Idealprofil f\xFCr dieses Genre gefunden." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-2 rounded-md", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-base font-cinzel text-amber-400 text-center mb-1", children: t.marketing.myFilms.audienceFeedback }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handlePrevFeedback,
                    disabled: feedbackStartIndex <= 0,
                    className: "p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                    children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-5 w-5 text-white" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow", children: [
                  displayedFeedbacks.map((fb, index) => /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/50 p-2 rounded-md border border-gray-700/50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                      /* @__PURE__ */ jsx(ChatBubbleIcon, { className: "h-4 w-4 text-gray-400" }),
                      /* @__PURE__ */ jsxs("p", { className: "font-bold text-white text-xs", children: [
                        fb.viewer,
                        " sagt:"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-300 italic line-clamp-3", title: fb.text, children: [
                      '"',
                      fb.text,
                      '"'
                    ] })
                  ] }, index)),
                  feedbacks.length === 0 && /* @__PURE__ */ jsx("div", { className: "col-span-3 text-center text-gray-500 text-xs italic py-2", children: "Kein Feedback verf\xFCgbar." })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleNextFeedback,
                    disabled: feedbackStartIndex >= maxFeedbackStart,
                    className: "p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                    children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-5 w-5 text-white" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/50 p-2 rounded-md", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-base font-cinzel text-amber-400 border-b border-gray-700 pb-1 mb-2", children: t.marketing.myFilms.distribution }),
              /* @__PURE__ */ jsx("div", { className: "bg-black/20 p-2 rounded-md min-h-[160px]", children: selectedFilm.activeDeal ? /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 animate-fade-in", children: [
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.distributor, value: selectedFilm.activeDeal.distributorName }),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.contractDate, value: contractDate ? contractDate.toLocaleDateString(locale) : "-" }),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.lumpSum, value: formatCurrency(selectedFilm.activeDeal.upfrontPayment) }),
                selectedFilm.activeDeal.monthlyPayment > 0 && /* @__PURE__ */ jsx(
                  DetailRow,
                  {
                    label: "Ratenzahlung (Laufzeit)",
                    value: `${formatCurrency(selectedFilm.activeDeal.monthlyPayment)} / Monat (Rest: ${Math.max(0, selectedFilm.activeDeal.durationMonths - selectedFilm.activeDeal.monthsPassed)}/${selectedFilm.activeDeal.durationMonths} Raten)`
                  }
                ),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.revenueShare, value: `${(selectedFilm.activeDeal.revenueShare * 100).toFixed(1)}%` }),
                /* @__PURE__ */ jsx(DetailRow, { label: t.marketing.myFilms.viewersTotal, value: new Intl.NumberFormat(locale).format(selectedFilm.cinemaRelease?.totalViewers || 0) })
              ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 italic text-center text-xs py-10", children: isSeries ? t.marketing.myFilms.noSeriesDeal : t.marketing.myFilms.noCinemaDeal }) })
            ] })
          ] })
        ] })
      ] });
    })() }) : /* @__PURE__ */ jsx("div", { className: "text-center py-16 flex flex-col items-center justify-center h-full", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 bg-opacity-80 p-8 rounded-lg", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-start gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveView("movies"),
            className: `px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === "movies" ? "bg-amber-500 text-gray-900 border-amber-400" : "bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500"}`,
            children: t.marketing.myFilms.filterMovies
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveView("series"),
            className: `px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === "series" ? "bg-amber-500 text-gray-900 border-amber-400" : "bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500"}`,
            children: t.marketing.myFilms.filterSeries
          }
        )
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl text-gray-400", children: activeView === "series" ? t.marketing.myFilms.noSeriesProduced : t.marketing.myFilms.noFilmsProduced }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 mt-2", children: activeView === "series" ? t.marketing.myFilms.produceFirstSeries : t.marketing.myFilms.produceFirstFilm })
    ] }) })
  ] });
};
var MyFilmsTab_default = MyFilmsTab;
export {
  MyFilmsTab_default as default
};
