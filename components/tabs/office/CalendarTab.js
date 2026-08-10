import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { RESEARCH_TECHS } from '../../research';
import { getMovieAwardDate, MOVIE_AWARD_NAME } from '../../festivalData';
import { useGame } from '../../../contexts/GameContext';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import { useTranslation } from '../../../hooks/useTranslation';
const isSameDay = (d1, d2) => {
    if (!d2)
        return false;
    const d1Norm = new Date(d1);
    const d2Norm = new Date(d2);
    d1Norm.setHours(0, 0, 0, 0);
    d2Norm.setHours(0, 0, 0, 0);
    return d1Norm.getTime() === d2Norm.getTime();
};
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
const CalendarTab = () => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [currentMonth, setCurrentMonth] = useState(new Date(playerData.gameDate.getFullYear(), playerData.gameDate.getMonth(), 1));
    if (!playerData)
        return null;
    const allEvents = useMemo(() => {
        const events = [];
        const calendarYear = currentMonth.getFullYear();
        const scopeTranslations = {
            small: t.office.casting.campaign.scopes.small,
            medium: t.office.casting.campaign.scopes.medium,
            large: t.office.casting.campaign.scopes.large,
        };
        if (playerData.currentProject) {
            const proj = playerData.currentProject;
            if (proj.scriptEndDate)
                events.push({ date: new Date(proj.scriptEndDate), type: 'Drehbuch fertig', title: `"${proj.workingTitle}" ${t.header.events.scriptFinished}` });
            if (proj.castingEndDate)
                events.push({ date: new Date(proj.castingEndDate), type: 'Casting fertig', title: `"${proj.workingTitle}" ${t.header.events.castingFinished}` });
            if (proj.productionEndDate)
                events.push({ date: new Date(proj.productionEndDate), type: 'Produktion fertig', title: `"${proj.workingTitle}" ${t.header.events.productionFinished}` });
        }
        playerData.completedFilms.forEach(film => {
            if (film.cinemaRelease?.releaseDate) {
                events.push({
                    date: new Date(film.cinemaRelease.releaseDate),
                    type: 'Veröffentlichung',
                    title: `${t.header.events.release}: ${film.workingTitle}`
                });
            }
        });
        if (playerData.activeResearch) {
            const tech = RESEARCH_TECHS.find(t => t.id === playerData.activeResearch.techId);
            events.push({ date: new Date(playerData.activeResearch.endDate), type: 'Forschung fertig', title: `${t.header.events.researchFinished}: ${tech ? tech.name : '?'}` });
        }
        if (playerData.activeConstruction) {
            events.push({ date: new Date(playerData.activeConstruction.endDate), type: 'Bau fertig', title: `${t.header.events.constructionFinished}: ${playerData.activeConstruction.buildingType}` });
        }
        if (playerData.activeMarketScout) {
            events.push({
                date: new Date(playerData.activeMarketScout.endDate),
                type: 'Agentursuche fertig',
                title: t.header.events.marketScoutFinished
            });
        }
        if (playerData.activeTalentScouting) {
            const scout = playerData.employees.find(e => e.id === playerData.activeTalentScouting.scoutId);
            events.push({
                date: new Date(playerData.activeTalentScouting.endDate),
                type: 'Talentsuche fertig',
                title: `${t.header.events.talentScoutFinished}: ${scout ? scout.name : '?'}`
            });
        }
        if (playerData.activeCasting) {
            events.push({
                date: new Date(playerData.activeCasting.endDate),
                type: 'Casting Ende',
                title: `${t.header.events.castingEnded}: ${playerData.activeCasting.talentName}`
            });
        }
        if (playerData.activeCastingCampaign) {
            const scopeText = scopeTranslations[playerData.activeCastingCampaign.scope] || playerData.activeCastingCampaign.scope;
            events.push({
                date: new Date(playerData.activeCastingCampaign.endDate),
                type: 'Casting-Kampagne Ende',
                title: `${t.header.events.campaignEnded} (${scopeText})`
            });
        }
        if (playerData.weddingDetails) {
            events.push({ date: new Date(playerData.weddingDetails.date), type: 'Hochzeit', title: t.header.events.wedding });
        }
        if (playerData.partnerPregnancy) {
            events.push({ date: new Date(playerData.partnerPregnancy.dueDate), type: 'Geburtstermin', title: t.header.events.birth });
        }
        // Add Dynamic Movie Award Date for current visible year and adjacent years
        events.push({
            date: getMovieAwardDate(calendarYear),
            type: MOVIE_AWARD_NAME,
            title: t.marketing.festivals.title
        });
        return events;
    }, [playerData, currentMonth, t, locale]);
    const monthCalendarData = useMemo(() => {
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        const calendarDays = [];
        for (let i = 0; i < dayOffset; i++) {
            calendarDays.push({ date: null, events: [] });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = allEvents.filter(event => isSameDay(date, event.date));
            calendarDays.push({ date, events: dayEvents });
        }
        return calendarDays;
    }, [currentMonth, allEvents]);
    const handlePrevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    const weekdays = useMemo(() => {
        const days = [];
        // Monday start
        for (let i = 1; i <= 7; i++) {
            const day = new Date(Date.UTC(2024, 0, i)); // A week in January 2024 starting with Monday
            days.push(day.toLocaleDateString(locale, { weekday: 'short' }));
        }
        return days;
    }, [locale]);
    return (_jsxs("div", { className: "bg-gray-900/80 p-4 rounded-lg border border-gray-700", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("button", { onClick: handlePrevMonth, className: "p-2 rounded-full hover:bg-gray-700", children: _jsx(ArrowLeftIcon, { className: "h-6 w-6 text-white" }) }), _jsx("h2", { className: "text-2xl font-cinzel text-amber-400", children: currentMonth.toLocaleString(locale, { month: 'long', year: 'numeric' }) }), _jsx("button", { onClick: handleNextMonth, className: "p-2 rounded-full hover:bg-gray-700", children: _jsx(ArrowRightIcon, { className: "h-6 w-6 text-white" }) })] }), _jsx("div", { className: "grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 uppercase pb-2 border-b border-gray-600", children: weekdays.map(day => _jsx("div", { children: day }, day)) }), _jsx("div", { className: "grid grid-cols-7 gap-1 mt-1", children: monthCalendarData.map((day, index) => (_jsxs("div", { className: `h-28 rounded-md p-1.5 flex flex-col ${day.date ? 'bg-gray-800' : 'bg-gray-800/50'} ${isSameDay(playerData.gameDate, day.date) ? 'border-2 border-amber-400' : 'border border-gray-700'}`, children: [day.date && _jsx("div", { className: `font-bold ${isSameDay(playerData.gameDate, day.date) ? 'text-amber-300' : 'text-gray-300'}`, children: day.date.getDate() }), _jsx("div", { className: "flex-grow mt-1 space-y-1 overflow-y-auto text-[9px] pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent", children: day.events.map((event, eventIndex) => (_jsx("div", { className: `px-1 py-0.5 rounded-sm truncate font-semibold ${getEventStyle(event.type)}`, title: event.title, children: event.title }, eventIndex))) })] }, index))) })] }));
};
export default CalendarTab;
