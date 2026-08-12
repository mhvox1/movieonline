
import React, { useMemo } from 'react';
import { ProjectData } from '../../types';
import DashboardWidget from '../DashboardWidget';
import StarRating from '../StarRating';
import HeartRating from '../HeartRating';
import { MarketingTab } from '../../types';
import { useGame } from '../../contexts/GameContext';
import { getCoverPath } from '../coverConfig';
import { useTranslation } from '../../hooks/useTranslation';
import { daysToHours } from '../../hooks/timeUtils';

interface MyFilmsWidgetProps {
    onNavigateToMarketingTab: (tab: MarketingTab, filmTitle?: string) => void;
}

const MyFilmsWidget: React.FC<MyFilmsWidgetProps> = ({ onNavigateToMarketingTab }) => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    if (!playerData) return null;

    const calculateFilmProfit = (film: ProjectData) => {
        let totalRevenue = 0;

        if (film.activeDeal) {
             const deal = film.activeDeal;
             // Calculate guaranteed amount (Upfront + All future installments)
             const guaranteedAmount = deal.upfrontPayment + (deal.monthlyPayment * deal.durationMonths);
             
             // Calculate earned Revenue Share:
             // Total Earnings (now includes everything paid out) - Fixed Payments already made
             const paidFixedPortion = deal.upfrontPayment + (deal.monthlyPayment * deal.monthsPassed);
             const earnedRevShare = Math.max(0, deal.totalEarnings - paidFixedPortion);

             totalRevenue = guaranteedAmount + earnedRevShare;
        } else {
            // Legacy Fallback
            totalRevenue = (film.cinemaRelease?.lumpSum || 0) + (film.cinemaRelease?.totalPlayerRevenue || 0);

            if (film.homeEntertainment) {
                totalRevenue += film.homeEntertainment.lumpSum;
                if (film.homeEntertainment.installments) {
                    totalRevenue += (film.homeEntertainment.installments.monthlyAmount * film.homeEntertainment.installments.months);
                }
            }
            
            if (film.payTv) {
                totalRevenue += film.payTv.lumpSum;
                if (film.payTv.installments) {
                    totalRevenue += (film.payTv.installments.monthlyAmount * film.payTv.installments.months);
                }
            }
            
            if (film.freeTv) {
                totalRevenue += film.freeTv.lumpSum;
                if (film.freeTv.installments) {
                    totalRevenue += (film.freeTv.installments.monthlyAmount * film.freeTv.installments.months);
                }
            }
        }

        const totalCost = film.totalCost || 0;
        return totalRevenue - totalCost;
    };

    const getPositionClass = (position: 'top' | 'top-center' | 'center' | 'bottom-center' | 'bottom' | undefined) => {
        switch (position) {
            case 'top': return 'justify-start pt-0.5';
            case 'top-center': return 'justify-start pt-[25%]';
            case 'center': return 'justify-center';
            case 'bottom-center': return 'justify-end pb-[25%]';
            case 'bottom': return 'justify-end pb-0.5';
            default: return 'justify-end pb-0.5';
        }
    };

    const getHoursRemaining = (endDate: Date) => Math.max(0, daysToHours((new Date(endDate).getTime() - playerData.gameDate.getTime()) / 86400000));

    const getFilmStatus = (film: ProjectData) => {
        if (film.activeDeal) {
            const phase = film.activeDeal.currentPhase;
            const deal = film.activeDeal;
            
            if (phase === 'waiting_for_release' && deal.nextPhaseStartDate) {
                 const dateStr = new Date(deal.nextPhaseStartDate).toLocaleDateString(locale);
                 return { text: `Start: ${dateStr}`, color: 'text-indigo-400' };
            }

            // Check legacy planning status first (just in case)
            if (phase === 'cinema' && film.cinemaRelease?.status === 'planning') {
                 const dateStr = new Date(deal.startDate).toLocaleDateString(locale);
                 return { text: `${t.marketing.myFilms.releaseDate}: ${dateStr}`, color: 'text-indigo-400' };
            }

            if (phase === 'cinema') return { text: "Phase: Kino", color: 'text-amber-400' };
            if (phase === 'transition_to_home') return { text: "Kino beendet", color: 'text-gray-400' };
            if (phase === 'home') return { text: "Phase: Home Entertainment", color: 'text-blue-400' };
            if (phase === 'payTv') return { text: "Phase: Pay-TV", color: 'text-cyan-400' };
            
            if (phase === 'freeTv') {
                 // Remain in Free-TV phase text until officially ended
                 return { text: "Phase: Free-TV", color: 'text-gray-400' };
            }
            
            if (phase === 'ended') return { text: t.marketing.myFilms.status.complete, color: 'text-green-400' };
        }
        
        // Legacy Logic
        if (film.freeTv?.status === 'active' || film.freeTv?.status === 'finished') {
            return { text: t.marketing.myFilms.status.complete, color: 'text-green-400' };
        }
        if (film.payTv?.status === 'active') {
             const hours = getHoursRemaining(film.payTv.endDate);
             return { text: t.marketing.myFilms.status.payTv.replace('{days}', hours.toString()), color: 'text-cyan-400' };
        }
        if (film.homeEntertainment?.status === 'active') {
             const hours = getHoursRemaining(film.homeEntertainment.endDate);
             return { text: t.marketing.myFilms.status.homeEnt.replace('{days}', hours.toString()), color: 'text-blue-400' };
        }
        if (film.cinemaRelease?.status === 'active') {
            return { text: t.marketing.myFilms.status.inCinema, color: 'text-amber-400' };
        }
        if (film.cinemaRelease?.status === 'planning' && film.cinemaRelease.releaseDate) {
            const dateStr = new Date(film.cinemaRelease.releaseDate).toLocaleDateString(locale);
            return { text: `${t.marketing.myFilms.releaseDate}: ${dateStr}`, color: 'text-indigo-400' };
        }
        
        return { text: t.marketing.myFilms.status.notMarketed, color: 'text-red-400' };
    };
    
    // Helper to resolve name including family
    const resolveName = (id: number | undefined) => {
        if (id === undefined) return 'N/A';
        if (id === -1) return playerData.playerName;
        if (id === 99901) return playerData.partnerName || 'Partner';
        if (id >= 99910) return playerData.children[id - 99910]?.name || 'Kind';
        
        const director = playerData.directors.find(d => d.id === id);
        if (director) return director.name;
        
        const actor = playerData.actors.find(a => a.id === id);
        if (actor) return actor.name;
        
        return 'N/A';
    };

    const latestFilms = useMemo(() => {
        return [...playerData.completedFilms].sort((a,b) => new Date(b.scriptEndDate).getTime() - new Date(a.scriptEndDate).getTime()).slice(0, 3);
    }, [playerData.completedFilms]);

    return (
        <DashboardWidget title={t.widgets.myFilms.title}>
            {latestFilms.length > 0 ? (
                <ol className="space-y-2">
                    {latestFilms.map((film) => {
                        const directorName = resolveName(film.directorId);
                        const actorName = resolveName(film.mainActorId);
                        
                        const profit = calculateFilmProfit(film);
                        const status = getFilmStatus(film);

                        return (
                            <li key={film.workingTitle} onClick={() => onNavigateToMarketingTab('my_films', film.workingTitle)} className="flex items-start text-sm py-1.5 border-b border-gray-800/80 last:border-b-0 gap-3 cursor-pointer hover:bg-gray-800/50 rounded-md p-1 -m-1 transition-colors">
                                {/* Adjusted size: 58x86 (approx 80% of previous 72x108) */}
                                <div className="w-[58px] h-[86px] flex-shrink-0 relative bg-gray-900 rounded-sm overflow-hidden border border-gray-700">
                                    <img
                                        src={film.customCover || getCoverPath(film.genre, film.coverImageId || 1)}
                                        alt={`Cover für ${film.workingTitle}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 flex flex-col pointer-events-none p-0.5 ${getPositionClass(film.coverTitlePosition)}`}>
                                        <h3 className="text-white text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
                                            style={{ 
                                                fontFamily: film.coverTitleFontFamily || 'Cinzel', 
                                                fontSize: `${(film.coverTitleFontSize || 30) * 0.19}px`, 
                                                lineHeight: 1.1, 
                                                color: film.coverTitleColor || '#FFFFFF' 
                                            }}>
                                            {film.workingTitle}
                                        </h3>
                                    </div>
                                    { (film.directorId !== undefined && film.mainActorId !== undefined) &&
                                        (() => {
                                            const titlePos = film.coverTitlePosition || 'bottom';
                                            const namesPositionClass = (titlePos === 'top' || titlePos === 'top-center' || titlePos === 'center') ? 'bottom-0.5' : 'top-0.5';
                                            const directorNameUpper = directorName.toUpperCase();
                                            const actorNameUpper = actorName.toUpperCase();
                                            
                                            const combinedLength = directorNameUpper.length + actorNameUpper.length;
                                            let nameFontSize = 3.5; 
                                            if (combinedLength > 25) nameFontSize = 2.5;
                            
                                            return (
                                                <div 
                                                    className={`absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-0.5`}
                                                    style={{
                                                        color: film.coverTitleColor || '#FFFFFF',
                                                        fontSize: `${nameFontSize}px`,
                                                        lineHeight: '1.1'
                                                    }}
                                                >
                                                    <p>{directorNameUpper} <span className="mx-0.5">•</span> {actorNameUpper}</p>
                                                </div>
                                            );
                                        })()
                                    }
                                </div>
                                
                                <div className="flex-grow flex justify-between items-start">
                                    <div>
                                        <p className="truncate text-white font-bold" title={film.workingTitle}>
                                            {film.workingTitle}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate" style={{ maxWidth: '200px' }}>
                                            {t.widgets.currentProject.director}: {directorName}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate" style={{ maxWidth: '200px' }}>
                                            {t.widgets.currentProject.mainActor}: {actorName}
                                        </p>
                                        {/* Updated Status Text Container: Allow wrapping */}
                                        <p className={`text-[10px] mt-1 font-semibold ${status.color} whitespace-normal leading-tight max-w-[220px]`}>
                                            {status.text}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-1">
                                        <span className={`${profit >= 0 ? 'text-green-400' : 'text-red-400'} font-mono text-xs w-24 text-right`}>
                                            {new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(profit)}
                                        </span>
                                        <StarRating rating={film.finalQuality || 0} />
                                        <HeartRating rating={film.hype || 0} size="sm" />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            ) : <p onClick={() => onNavigateToMarketingTab('my_films')} className="text-gray-400 text-center cursor-pointer">{t.widgets.myFilms.noFilms}</p>}
        </DashboardWidget>
    );
};

export default MyFilmsWidget;
