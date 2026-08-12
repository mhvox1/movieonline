import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { RESEARCH_TECHS } from './research';
import { getMovieAwardDate, MOVIE_AWARD_NAME } from './festivalData';
import StarRating from './StarRating';
import { useTranslation } from '../hooks/useTranslation';
import NoteIcon from './icons/NoteIcon';
const getEventStyle = (type) => {
    switch (type) {
        case 'Drehbuch fertig':
        case 'Casting fertig':
        case 'Produktion fertig':
        case 'Postproduktion fertig':
            return 'bg-purple-600 text-white';
        case 'Veröffentlichung':
            return 'bg-amber-500 text-black';
        case 'Forschung fertig':
            return 'bg-sky-500 text-white';
        case 'Bau fertig':
            return 'bg-orange-500 text-white';
        case 'Hochzeit':
            return 'bg-pink-500 text-white';
        case 'Geburtstermin':
            return 'bg-rose-500 text-white';
        case 'Festival':
        case MOVIE_AWARD_NAME:
            return 'bg-yellow-500 text-black';
        case 'Agentursuche fertig':
            return 'bg-purple-500 text-white';
        case 'Talentsuche fertig':
            return 'bg-indigo-500 text-white';
        case 'Casting Ende':
            return 'bg-cyan-500 text-black';
        case 'Casting-Kampagne Ende':
            return 'bg-purple-500 text-white';
        default:
            return 'bg-gray-600 text-white';
    }
};
const GameHeader = ({ gameSpeed, setGameSpeed, disabled, onNavigateToOfficeTab, hasPendingDecision }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const isTestMode = playerData && playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const currentGameDate = playerData ? new Date(playerData.gameDate) : null;
    const currentGameTimeLabel = currentGameDate
        ? currentGameDate.toLocaleString(locale, {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3,
            hour12: false,
        })
        : '';
    const weeklyCalendarData = useMemo(() => {
        if (!playerData)
            return [];
        const calendarBaseDate = isTestMode ? new Date(playerData.gameDate) : new Date();
        const today = new Date(calendarBaseDate);
        today.setHours(0, 0, 0, 0);
        const scopeTranslations = {
            small: language === 'de' ? 'klein' : 'small',
            medium: language === 'de' ? 'mittel' : 'medium',
            large: language === 'de' ? 'groß' : 'large',
        };
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            weekDates.push(date);
        }
        const allEvents = [];
        const currentYear = today.getFullYear();
        allEvents.push({ date: getMovieAwardDate(currentYear), type: MOVIE_AWARD_NAME, title: t.marketing.festivals.title });
        allEvents.push({ date: getMovieAwardDate(currentYear + 1), type: MOVIE_AWARD_NAME, title: t.marketing.festivals.title });
        if (playerData.currentProject) {
            const proj = playerData.currentProject;
            if (proj.scriptEndDate)
                allEvents.push({ date: new Date(proj.scriptEndDate), type: 'Drehbuch fertig', title: `"${proj.workingTitle}" ${t.header.events.scriptFinished}` });
            if (proj.castingEndDate)
                allEvents.push({ date: new Date(proj.castingEndDate), type: 'Casting fertig', title: `"${proj.workingTitle}" ${t.header.events.castingFinished}` });
            if (proj.productionEndDate)
                allEvents.push({ date: new Date(proj.productionEndDate), type: 'Produktion fertig', title: `"${proj.workingTitle}" ${t.header.events.productionFinished}` });
        }
        playerData.completedFilms.forEach(film => {
            if (film.cinemaRelease?.releaseDate) {
                allEvents.push({ date: new Date(film.cinemaRelease.releaseDate), type: 'Veröffentlichung', title: `${t.header.events.release}: ${film.workingTitle}` });
            }
        });
        if (playerData.activeResearch) {
            const tech = RESEARCH_TECHS.find(researchTech => researchTech.id === playerData.activeResearch.techId);
            allEvents.push({ date: new Date(playerData.activeResearch.endDate), type: 'Forschung fertig', title: `${t.header.events.researchFinished}: ${tech ? tech.name : '?'}` });
        }
        if (playerData.activeConstruction) {
            allEvents.push({ date: new Date(playerData.activeConstruction.endDate), type: 'Bau fertig', title: `${t.header.events.constructionFinished}: ${playerData.activeConstruction.buildingType}` });
        }
        if (playerData.activeMarketScout) {
            allEvents.push({ date: new Date(playerData.activeMarketScout.endDate), type: 'Agentursuche fertig', title: t.header.events.marketScoutFinished });
        }
        if (playerData.activeTalentScouting) {
            const scout = playerData.employees.find(employee => employee.id === playerData.activeTalentScouting.scoutId);
            allEvents.push({ date: new Date(playerData.activeTalentScouting.endDate), type: 'Talentsuche fertig', title: `${t.header.events.talentScoutFinished}: ${scout ? scout.name.substring(0, 10) : '?'}` });
        }
        if (playerData.activeCasting) {
            allEvents.push({ date: new Date(playerData.activeCasting.endDate), type: 'Casting Ende', title: `${t.header.events.castingEnded}: ${playerData.activeCasting.talentName}` });
        }
        if (playerData.activeCastingCampaign) {
            const scopeText = scopeTranslations[playerData.activeCastingCampaign.scope] || playerData.activeCastingCampaign.scope;
            allEvents.push({ date: new Date(playerData.activeCastingCampaign.endDate), type: 'Casting-Kampagne Ende', title: `${t.header.events.campaignEnded} (${scopeText})` });
        }
        if (playerData.weddingDetails) {
            allEvents.push({ date: new Date(playerData.weddingDetails.date), type: 'Hochzeit', title: t.header.events.wedding });
        }
        if (playerData.partnerPregnancy) {
            allEvents.push({ date: new Date(playerData.partnerPregnancy.dueDate), type: 'Geburtstermin', title: t.header.events.birth });
        }
        return weekDates.map(date => ({
            date,
            events: allEvents.filter(event => isSameDay(date, event.date))
        }));
    }, [playerData, t, language, isTestMode]);
    const daysOfWeek = useMemo(() => weeklyCalendarData.map(dayData => dayData.date.toLocaleDateString(locale, { weekday: 'short' })), [weeklyCalendarData, locale]);
    const handleCheatCapital = () => {
        if (isTestMode && setPlayerData) {
            setPlayerData(prev => prev ? { ...prev, capital: prev.capital + 1000000 } : null);
        }
    };
    const handleCheatReputation = () => {
        if (isTestMode && setPlayerData) {
            setPlayerData(prev => prev ? { ...prev, reputation: Math.min(100, prev.reputation + 10) } : null);
        }
    };
    const toggleScratchpad = () => {
        if (setPlayerData) {
            setPlayerData(prev => prev ? { ...prev, isScratchpadOpen: !prev.isScratchpadOpen } : null);
        }
    };
    if (!playerData)
        return null;
    return (_jsxs("header", { className: "bg-black bg-opacity-50 backdrop-blur-sm p-3 flex items-stretch text-white shadow-lg flex-shrink-0 gap-4", children: [_jsxs("div", { className: "flex-shrink-0 w-auto flex flex-col justify-center items-start ml-[30px] min-w-[250px]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xl font-bold font-cinzel text-amber-400 truncate", children: playerData.studioName }), _jsx("div", { onClick: handleCheatReputation, className: `inline-block ${isTestMode ? 'cursor-pointer hover:opacity-80' : ''}`, title: isTestMode ? 'Testmodus: Klicke für +10 Ruf' : undefined, children: _jsx(StarRating, { rating: playerData.reputation }) })] }), _jsxs("p", { onClick: handleCheatCapital, className: `text-lg font-semibold text-amber-400 mt-1 ${isTestMode ? 'cursor-pointer hover:text-amber-200' : ''}`, title: isTestMode ? 'Testmodus: Klicke für +1.000.000$' : undefined, children: [t.header.capital, ": ", new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(playerData.capital)] })] }), _jsx("div", { className: "flex items-center", children: _jsx("button", { onClick: toggleScratchpad, className: `p-2 rounded-full transition-all border-2 flex items-center justify-center ${playerData.isScratchpadOpen
                        ? 'bg-amber-400 text-black border-amber-500 shadow-lg scale-110'
                        : 'bg-gray-800 text-amber-400 border-gray-600 hover:bg-gray-700 hover:border-amber-300'}`, title: "Notizen", children: _jsx(NoteIcon, { className: "w-10 h-10" }) }) }), _jsx("div", { className: "flex-grow flex items-center justify-center", children: _jsxs("div", { className: "w-full max-w-6xl grid grid-cols-7 gap-2", children: weeklyCalendarData.map((dayData, index) => {
                        const isToday = index === 0;
                        return (_jsxs("div", { className: `flex flex-col rounded-md p-1.5 h-[75px] transition-colors duration-300 ${isToday ? 'bg-gray-700/80 border border-amber-500' : 'bg-gray-800/60'}`, children: [_jsxs("div", { className: "flex justify-between items-baseline text-xs", children: [_jsx("span", { className: `font-bold ${isToday ? 'text-amber-300' : 'text-gray-400'}`, children: daysOfWeek[index] }), _jsx("span", { className: `font-semibold ${isToday ? 'text-white' : 'text-gray-300'}`, children: dayData.date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }) })] }), _jsx("div", { className: "flex-grow mt-1 space-y-1 overflow-y-auto text-[10px] pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent", children: dayData.events.map((event, eventIndex) => (_jsx("div", { className: `px-1 py-0.5 rounded-sm truncate font-semibold ${getEventStyle(event.type)}`, title: event.title, children: event.title }, eventIndex))) })] }, index));
                        }) }) }), _jsxs("div", { className: "flex-shrink-0 w-auto flex flex-col justify-between items-end mr-[30px]", children: [_jsx("div", { className: "w-full flex justify-end mb-1", children: _jsxs("div", { className: "rounded-md border border-gray-600 bg-gray-900/70 px-3 py-1.5 text-right shadow-md backdrop-blur-sm", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.2em] text-gray-400", children: language === 'de' ? 'Uhrzeit' : 'Time' }), _jsx("p", { className: "text-sm font-semibold text-amber-300 leading-tight", children: currentGameTimeLabel })] }) }), hasPendingDecision && (_jsx("div", { className: "mb-1 text-right", children: _jsx("span", { className: "text-red-300 text-xs font-bold uppercase tracking-widest", children: t.header.decisionRequired }) }))] })] }));
};
const isSameDay = (d1, d2) => {
    if (!d2)
        return false;
    const d1Norm = new Date(d1);
    const d2Norm = new Date(d2);
    d1Norm.setHours(0, 0, 0, 0);
    d2Norm.setHours(0, 0, 0, 0);
    return d1Norm.getTime() === d2Norm.getTime();
};
export default GameHeader;
