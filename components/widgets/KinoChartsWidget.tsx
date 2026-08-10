
import React, { useMemo } from 'react';
import { CompetitorFilm, Genre, OfficeTabType } from '../../types';
import DashboardWidget from '../DashboardWidget';
import { useGame } from '../../contexts/GameContext';
import { useTranslation } from '../../hooks/useTranslation';


interface KinoChartsWidgetProps {
    onNavigateToOfficeTab: (tab: OfficeTabType) => void;
}

const KinoChartsWidget: React.FC<KinoChartsWidgetProps> = ({ onNavigateToOfficeTab }) => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    
    if (!playerData) return null;
    
    const kinoCharts = useMemo(() => {
        const competitorFilms: CompetitorFilm[] = playerData.competitors.flatMap(c => c.completedFilms);
        
        const playerFilmsInCharts: CompetitorFilm[] = playerData.completedFilms
            .filter(f => {
                // 1. Check basic status (Active Cinema Release)
                // Check new system (Active Deal in Cinema Phase) OR Legacy System
                const isCinemaActive = (f.activeDeal?.currentPhase === 'cinema') || (f.cinemaRelease?.status === 'active');
                
                // 2. Check if release date exists
                if (!f.cinemaRelease?.releaseDate) return false;

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
                const cinema = f.cinemaRelease!;
                return {
                    title: f.workingTitle,
                    studioName: playerData.studioName,
                    quality: f.finalQuality || 0,
                    chartQuality: cinema.chartQuality || 0,
                    viewers: cinema.viewers || 0,
                    totalViewers: cinema.totalViewers || 0,
                    releaseDate: cinema.releaseDate!, // Checked in filter
                    weeksInCharts: cinema.weeksInCharts || 0,
                    genre: f.genre,
                };
            });

        const allFilms = [...competitorFilms, ...playerFilmsInCharts];
        return allFilms.sort((a, b) => b.viewers - a.viewers).slice(0, 10);
    }, [playerData.competitors, playerData.completedFilms, playerData.studioName, playerData.gameDate]);

    return (
        <div onClick={() => onNavigateToOfficeTab('charts')} className="cursor-pointer">
            <DashboardWidget title={t.widgets.charts.title}>
                {kinoCharts.length > 0 ? (
                    <div>
                        <div className="flex items-baseline text-xs text-gray-500 uppercase font-bold pb-2 border-b border-gray-700/50 mb-2">
                            <span className="w-6 text-right mr-2">{t.widgets.charts.pos}</span>
                            <div className="flex-1 flex justify-between items-baseline gap-4">
                                <p className="truncate">{t.widgets.charts.filmTitle}</p>
                                <div className="flex items-baseline gap-2 flex-shrink-0">
                                    <p className="whitespace-nowrap w-12 text-center">{t.widgets.charts.week}</p>
                                    <p className="whitespace-nowrap text-right w-24">{t.widgets.charts.viewersWeek}</p>
                                </div>
                            </div>
                        </div>
                        
                        <ol className="space-y-2">
                            {kinoCharts.map((film, i) => ( 
                                <li key={i} className={`flex items-baseline ${film.studioName === playerData.studioName ? 'bg-amber-800/20 rounded-md p-1 -m-1' : ''}`}>
                                    <span className="font-bold text-amber-300 w-6 text-right mr-2">{i + 1}.</span>
                                    <div className="flex-1 flex justify-between items-baseline gap-4">
                                        <p className="truncate text-white" title={film.title}>{film.title}</p>
                                        <div className="flex items-baseline gap-2 flex-shrink-0">
                                            <p className={`text-xs whitespace-nowrap w-12 text-center ${film.weeksInCharts === 1 ? 'font-bold text-green-400' : 'text-gray-400'}`}>
                                                {film.weeksInCharts === 1 ? t.widgets.charts.new : `${film.weeksInCharts} Wo.`}
                                            </p>
                                            <p className="text-xs text-gray-400 whitespace-nowrap text-right w-24">{new Intl.NumberFormat('de-DE').format(film.viewers)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                ) : <p className="text-gray-400">{t.widgets.charts.noData}</p>}
            </DashboardWidget>
        </div>
    );
};

export default KinoChartsWidget;
