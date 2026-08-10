import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import DashboardWidget from '../DashboardWidget';
import { useGame } from '../../contexts/GameContext';
import { useTranslation } from '../../hooks/useTranslation';
const KinoChartsWidget = ({ onNavigateToOfficeTab }) => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    if (!playerData)
        return null;
    const kinoCharts = useMemo(() => {
        const competitorFilms = playerData.competitors.flatMap(c => c.completedFilms);
        const playerFilmsInCharts = playerData.completedFilms
            .filter(f => {
            // 1. Check basic status (Active Cinema Release)
            // Check new system (Active Deal in Cinema Phase) OR Legacy System
            const isCinemaActive = (f.activeDeal?.currentPhase === 'cinema') || (f.cinemaRelease?.status === 'active');
            // 2. Check if release date exists
            if (!f.cinemaRelease?.releaseDate)
                return false;
            // 3. Date Check: Film must be released for at least 7 days to appear in charts
            const releaseDate = new Date(f.cinemaRelease.releaseDate);
            const chartAppearanceDate = new Date(releaseDate);
            chartAppearanceDate.setDate(chartAppearanceDate.getDate() + 7);
            // Normalize comparison (ignore time)
            const currentGameDate = new Date(playerData.gameDate);
            currentGameDate.setHours(0, 0, 0, 0);
            chartAppearanceDate.setHours(0, 0, 0, 0);
            const isOldEnough = currentGameDate >= chartAppearanceDate;
            // 4. Ensure it has viewers (processed by finance loop)
            const hasViewers = f.cinemaRelease.viewers !== undefined;
            return isCinemaActive && hasViewers && isOldEnough;
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
        const allFilms = [...competitorFilms, ...playerFilmsInCharts];
        return allFilms.sort((a, b) => b.viewers - a.viewers).slice(0, 10);
    }, [playerData.competitors, playerData.completedFilms, playerData.studioName, playerData.gameDate]);
    return (_jsx("div", { onClick: () => onNavigateToOfficeTab('charts'), className: "cursor-pointer", children: _jsx(DashboardWidget, { title: t.widgets.charts.title, children: kinoCharts.length > 0 ? (_jsxs("div", { children: [_jsxs("div", { className: "flex items-baseline text-xs text-gray-500 uppercase font-bold pb-2 border-b border-gray-700/50 mb-2", children: [_jsx("span", { className: "w-6 text-right mr-2", children: t.widgets.charts.pos }), _jsxs("div", { className: "flex-1 flex justify-between items-baseline gap-4", children: [_jsx("p", { className: "truncate", children: t.widgets.charts.filmTitle }), _jsxs("div", { className: "flex items-baseline gap-2 flex-shrink-0", children: [_jsx("p", { className: "whitespace-nowrap w-12 text-center", children: t.widgets.charts.week }), _jsx("p", { className: "whitespace-nowrap text-right w-24", children: t.widgets.charts.viewersWeek })] })] })] }), _jsx("ol", { className: "space-y-2", children: kinoCharts.map((film, i) => (_jsxs("li", { className: `flex items-baseline ${film.studioName === playerData.studioName ? 'bg-amber-800/20 rounded-md p-1 -m-1' : ''}`, children: [_jsxs("span", { className: "font-bold text-amber-300 w-6 text-right mr-2", children: [i + 1, "."] }), _jsxs("div", { className: "flex-1 flex justify-between items-baseline gap-4", children: [_jsx("p", { className: "truncate text-white", title: film.title, children: film.title }), _jsxs("div", { className: "flex items-baseline gap-2 flex-shrink-0", children: [_jsx("p", { className: `text-xs whitespace-nowrap w-12 text-center ${film.weeksInCharts === 1 ? 'font-bold text-green-400' : 'text-gray-400'}`, children: film.weeksInCharts === 1 ? t.widgets.charts.new : `${film.weeksInCharts} Wo.` }), _jsx("p", { className: "text-xs text-gray-400 whitespace-nowrap text-right w-24", children: new Intl.NumberFormat('de-DE').format(film.viewers) })] })] })] }, i))) })] })) : _jsx("p", { className: "text-gray-400", children: t.widgets.charts.noData }) }) }));
};
export default KinoChartsWidget;
