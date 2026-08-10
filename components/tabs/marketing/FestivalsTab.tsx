
import React from 'react';
import { useGame } from '../../../contexts/GameContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { MOVIE_AWARD_NAME } from '../../festivalData';

const FestivalsTab: React.FC = () => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();

    if (!playerData) return null;

    const history = playerData.movieAwardHistory || [];
    // Slice to get only the last 10 entries (assuming history is sorted new to old)
    const recentHistory = history.slice(0, 10);

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-gray-900/95 rounded-xl shadow-2xl border border-gray-600 flex flex-col max-h-[85vh] overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-600 text-center bg-gray-800/40 rounded-t-xl shrink-0">
                    <h2 className="text-3xl font-bold font-cinzel text-amber-400">Movie Award - Hall of Fame</h2>
                    <p className="text-gray-400 text-sm italic mt-1">{t.marketing.festivals.historySubtitle}</p>
                </div>
                
                {/* Table Content */}
                <div className="overflow-y-auto custom-scrollbar p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-950/80 text-gray-400 text-xs uppercase sticky top-0 z-10 font-bold tracking-wider backdrop-blur-sm shadow-sm">
                            <tr>
                                <th className="py-4 px-6 text-center w-28 border-b border-gray-700">{t.marketing.festivals.colYear}</th>
                                <th className="py-4 px-6 border-b border-gray-700 w-[30%]">{t.marketing.awardCategories.best_film}</th>
                                <th className="py-4 px-6 border-b border-gray-700 w-[30%]">{t.marketing.awardCategories.best_actor}</th>
                                <th className="py-4 px-6 border-b border-gray-700 w-[30%]">{t.marketing.awardCategories.best_director}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50 text-sm">
                            {recentHistory.length > 0 ? recentHistory.map((entry) => {
                                // Strict check: Only highlight if we actually own the film or the talent has the specific award in their history.
                                // This prevents random name collisions from initial dummy history turning green.
                                
                                const isPlayerFilm = playerData.completedFilms.some(f => f.workingTitle === entry.bestFilm);
                                
                                // Check if talent exists AND has the award logged
                                const isPlayerActor = entry.bestActor === playerData.playerName || playerData.actors.some(a => 
                                    a.name === entry.bestActor && a.awards?.some(aw => aw.includes(MOVIE_AWARD_NAME) && aw.includes(entry.year.toString()))
                                );
                                
                                const isPlayerDirector = entry.bestDirector === playerData.playerName || playerData.directors.some(d => 
                                    d.name === entry.bestDirector && d.awards?.some(aw => aw.includes(MOVIE_AWARD_NAME) && aw.includes(entry.year.toString()))
                                );

                                return (
                                    <tr key={entry.year} className="hover:bg-gray-800/40 transition-colors group">
                                        <td className="py-4 px-6 text-center font-cinzel font-bold text-amber-500 text-xl bg-gray-800/20 group-hover:bg-gray-800/30">
                                            {entry.year}
                                        </td>
                                        
                                        <td className="py-4 px-6">
                                            <span className={`block truncate ${isPlayerFilm ? 'text-green-400 font-bold' : 'text-gray-200'}`}>
                                                {entry.bestFilm}
                                            </span>
                                            {isPlayerFilm && <span className="text-[10px] text-green-600/70 uppercase font-bold tracking-widest">{language === 'de' ? 'Studio-Produktion' : 'Studio Production'}</span>}
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className={`block truncate ${isPlayerActor ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                                {entry.bestActor}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className={`block truncate ${isPlayerDirector ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                                {entry.bestDirector}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                 <tr>
                                    <td colSpan={4} className="text-center py-12 text-gray-500 italic text-lg">{language === 'de' ? 'Keine Historie verfügbar.' : 'No history available.'}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Gradient for nice cutoff look if scrolling */}
                <div className="h-4 bg-gradient-to-t from-gray-900 to-transparent shrink-0 pointer-events-none"></div>
            </div>
        </div>
    );
};

export default FestivalsTab;
