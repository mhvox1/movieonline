
import React, { useMemo } from 'react';
import { CompetitorFilm } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import { useTranslation } from '../../../hooks/useTranslation';

const ChartsTab: React.FC = () => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    if (!playerData) return null;

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

    const kinoChartsTop20 = useMemo(() => {
        const competitorFilms: CompetitorFilm[] = playerData.competitors.flatMap(c => c.completedFilms);
        
        const playerFilmsInCharts: CompetitorFilm[] = playerData.completedFilms
            .filter(f => {
                 // 1. Check basic status
                 const isCinemaActive = (f.activeDeal?.currentPhase === 'cinema') || (f.cinemaRelease?.status === 'active');
                 
                 // 2. Check if release date exists
                 if (!f.cinemaRelease?.releaseDate) return false;

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

        const allFilmsInCharts = [...competitorFilms, ...playerFilmsInCharts];

        return allFilmsInCharts.sort((a, b) => b.viewers - a.viewers).slice(0, 20);
    }, [playerData.competitors, playerData.completedFilms, playerData.studioName, playerData.gameDate]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow bg-gray-800/80 p-6 rounded-lg shadow-2xl border border-gray-700 overflow-y-auto">
                <h2 className="text-4xl font-bold text-center mb-8 font-cinzel text-amber-400">{t.widgets.charts.title}</h2>
                <table className="w-full text-left">
                    <thead className="border-b-2 border-gray-600 text-sm text-gray-400 uppercase">
                        <tr>
                            <th className="py-1 px-2 w-12 text-center">#</th>
                            <th className="py-1 px-2">{t.widgets.charts.filmTitle}</th>
                            <th className="py-1 px-2">{t.widgets.charts.studio}</th>
                            <th className="py-1 px-2 text-center">{t.widgets.charts.week}</th>
                            <th className="py-1 px-2 text-center">{t.widgets.charts.genre}</th>
                            <th className="py-1 px-2 text-right">{t.widgets.charts.viewersWeek}</th>
                            <th className="py-1 px-2 text-right">{t.widgets.charts.viewersTotal}</th>
                            {isTestMode && <th className="py-1 px-2 text-right">Chart-Q.</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {kinoChartsTop20.map((film, index) => (
                            <tr key={index} className={`border-b border-gray-800 hover:bg-gray-700/30 transition-colors ${film.studioName === playerData.studioName ? 'bg-amber-900/30' : ''}`}>
                                <td className="py-1 px-2 w-12 text-center font-bold text-lg">{index + 1}</td>
                                <td className="py-1 px-2 font-bold text-white">{film.title}</td>
                                <td className="py-1 px-2 text-gray-300">{film.studioName}</td>
                                <td className={`py-1 px-2 text-center ${film.weeksInCharts === 1 ? 'font-bold text-green-400' : ''}`}>{film.weeksInCharts === 1 ? t.widgets.charts.new : film.weeksInCharts}</td>
                                <td className="py-1 px-2 text-center text-gray-300">{t.genres[film.genre]}</td>
                                <td className="py-1 px-2 text-right font-mono">{new Intl.NumberFormat(locale).format(film.viewers)}</td>
                                <td className="py-1 px-2 text-right font-mono text-gray-400">{new Intl.NumberFormat(locale).format(film.totalViewers)}</td>
                                {isTestMode && <td className="py-1 px-2 text-right font-mono text-cyan-400">{film.chartQuality.toFixed(1)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {kinoChartsTop20.length === 0 && <p className="text-center text-gray-500 italic mt-10">{t.widgets.charts.noData}</p>}
            </div>
        </div>
    );
};

export default ChartsTab;
