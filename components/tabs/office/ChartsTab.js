import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useWorldCharts } from '../../../hooks/useWorldCharts.ts';
const ChartsTab = () => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const { entries: globalCharts } = useWorldCharts();
    const isOnlineSession = typeof window !== 'undefined' && Boolean((sessionStorage.getItem('mb_auth_token') || localStorage.getItem('mb_auth_token') || '').trim());
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    if (!playerData)
        return null;
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const localKinoChartsTop20 = useMemo(() => {
        const competitorFilms = playerData.competitors.flatMap(c => c.completedFilms);
        const playerFilmsInCharts = playerData.completedFilms
            .filter(f => {
            // 1. Check basic status
            const isCinemaActive = (f.activeDeal?.currentPhase === 'cinema') || (f.cinemaRelease?.status === 'active');
            // 2. Check if release date exists
            if (!f.cinemaRelease?.releaseDate)
                return false;
            // 3. Date Check: Film must be released for at least 7 days
            const releaseDate = new Date(f.cinemaRelease.releaseDate);
            const chartAppearanceDate = new Date(releaseDate);
            chartAppearanceDate.setDate(chartAppearanceDate.getDate() + 7);
            // Normalize comparison
            const currentGameDate = new Date(playerData.gameDate);
            currentGameDate.setHours(0, 0, 0, 0);
            chartAppearanceDate.setHours(0, 0, 0, 0);
            const isOldEnough = currentGameDate >= chartAppearanceDate;
            // 4. Ensure viewers are present
            return isCinemaActive && f.cinemaRelease && f.cinemaRelease.viewers !== undefined && isOldEnough;
        })
            .map(f => {
            const cinema = f.cinemaRelease;
            return {
                title: f.workingTitle,
                studioName: playerData.studioName,
                quality: f.finalQuality || 0,
                chartQuality: cinema.chartQuality || 0,
                viewers: cinema.viewers || 0,
                totalViewers: cinema.totalViewers || 0,
                releaseDate: cinema.releaseDate, // Checked in filter
                weeksInCharts: cinema.weeksInCharts || 0,
                genre: f.genre,
            };
        });
        const allFilmsInCharts = [...competitorFilms, ...playerFilmsInCharts];
        return allFilmsInCharts.sort((a, b) => b.viewers - a.viewers).slice(0, 20);
    }, [playerData.competitors, playerData.completedFilms, playerData.studioName, playerData.gameDate]);
    const kinoChartsTop20 = useMemo(() => {
        if (isOnlineSession) {
            return globalCharts.slice(0, 20);
        }
        if (globalCharts.length > 0) {
            return globalCharts.slice(0, 20);
        }
        return localKinoChartsTop20;
    }, [globalCharts, isOnlineSession, localKinoChartsTop20]);
    return (_jsx("div", { className: "w-full h-full flex flex-col", children: _jsxs("div", { className: "flex-grow bg-gray-800/80 p-6 rounded-lg shadow-2xl border border-gray-700 overflow-y-auto", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-8 font-cinzel text-amber-400", children: t.widgets.charts.title }), _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "border-b-2 border-gray-600 text-sm text-gray-400 uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "py-1 px-2 w-12 text-center", children: "#" }), _jsx("th", { className: "py-1 px-2", children: t.widgets.charts.filmTitle }), _jsx("th", { className: "py-1 px-2", children: t.widgets.charts.studio }), _jsx("th", { className: "py-1 px-2 text-center", children: t.widgets.charts.week }), _jsx("th", { className: "py-1 px-2 text-center", children: t.widgets.charts.genre }), _jsx("th", { className: "py-1 px-2 text-right", children: t.widgets.charts.viewersWeek }), _jsx("th", { className: "py-1 px-2 text-right", children: t.widgets.charts.viewersTotal }), isTestMode && _jsx("th", { className: "py-1 px-2 text-right", children: "Chart-Q." })] }) }), _jsx("tbody", { children: kinoChartsTop20.map((film, index) => (_jsxs("tr", { className: `border-b border-gray-800 hover:bg-gray-700/30 transition-colors ${film.studioName === playerData.studioName ? 'bg-amber-900/30' : ''}`, children: [_jsx("td", { className: "py-1 px-2 w-12 text-center font-bold text-lg", children: index + 1 }), _jsx("td", { className: "py-1 px-2 font-bold text-white", children: film.title }), _jsx("td", { className: "py-1 px-2 text-gray-300", children: film.studioName }), _jsx("td", { className: `py-1 px-2 text-center ${film.weeksInCharts === 1 ? 'font-bold text-green-400' : ''}`, children: film.weeksInCharts === 1 ? t.widgets.charts.new : film.weeksInCharts }), _jsx("td", { className: "py-1 px-2 text-center text-gray-300", children: t.genres[film.genre] }), _jsx("td", { className: "py-1 px-2 text-right font-mono", children: new Intl.NumberFormat(locale).format(film.viewers) }), _jsx("td", { className: "py-1 px-2 text-right font-mono text-gray-400", children: new Intl.NumberFormat(locale).format(film.totalViewers) }), isTestMode && _jsx("td", { className: "py-1 px-2 text-right font-mono text-cyan-400", children: film.chartQuality.toFixed(1) })] }, index))) })] }), kinoChartsTop20.length === 0 && _jsx("p", { className: "text-center text-gray-500 italic mt-10", children: t.widgets.charts.noData })] }) }));
};
export default ChartsTab;
