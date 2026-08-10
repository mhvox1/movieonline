
import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ProjectData, Genre, ProjectType } from '../../../types';
import StarRating from '../../StarRating';
import HeartRating from '../../HeartRating';
import TrophyIcon from '../../icons/TrophyIcon';
import {
    EXTRAS_OPTIONS,
    GENRE_IDEAL_AGE_RATING
} from '../../constants';
import { GENRE_IDEAL_PROFILES } from '../../genreProfiles';
import ChatBubbleIcon from '../../icons/ChatBubbleIcon';
import { getCoverPath } from '../../coverConfig';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import { useTranslation } from '../../../hooks/useTranslation';

const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

const DetailRow: React.FC<{ label: string; value: string | number | React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between text-sm py-1 border-b border-gray-700/50 last:border-b-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-white text-right">{value}</span>
    </div>
);

interface MyFilmsTabProps {
  initialFilmTitle?: string;
}

const MyFilmsTab: React.FC<MyFilmsTabProps> = ({ initialFilmTitle }) => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const [selectedFilmTitle, setSelectedFilmTitle] = useState<string>('');
    const [activeView, setActiveView] = useState<'movies' | 'series'>('movies');
    
    // State for Feedback Carousel
    const [feedbackStartIndex, setFeedbackStartIndex] = useState(0);

    if (!playerData) return null;

    const FocusBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
        <div className="flex items-center justify-between text-xs py-1">
            <span className="text-gray-400 w-24">{label}</span>
            <div className="flex-grow bg-gray-700 rounded-full h-2.5 mx-2">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value * 10}%` }}></div>
            </div>
            <span className="font-mono text-white w-4 text-right">{value}</span>
        </div>
    );
    
    const getFocusColor = (playerValue: number | undefined, idealValue: number): string => {
        const value = playerValue || 5;
        const diff = Math.abs(value - idealValue);
    
        if (diff === 0) {
            return 'bg-green-500';
        }
        if (diff === 1) {
            return 'bg-yellow-500';
        }
        return 'bg-red-500';
    };

        const myFilms = useMemo(() => {
                const filteredProjects = playerData.completedFilms.filter(project => {
                        const isSeries = project.projectType === ProjectType.Series;
                        return activeView === 'series' ? isSeries : !isSeries;
                });

                return [...filteredProjects].sort((a, b) => {
          const getFilmDate = (film: ProjectData) => 
            film.cinemaRelease?.releaseDate 
              ? new Date(film.cinemaRelease.releaseDate) 
              : new Date(film.scriptEndDate);
          return getFilmDate(b).getTime() - getFilmDate(a).getTime();
        });
        }, [playerData.completedFilms, activeView]);

    useEffect(() => {
        const filmExistsInList = (title: string) => myFilms.some(f => f.workingTitle === title);

        // Priority 1: Explicit Initial Selection via Props
        if (initialFilmTitle && filmExistsInList(initialFilmTitle)) {
            setSelectedFilmTitle(initialFilmTitle);
            return;
        }

        // Priority 2: Validate current selection or default to first
        setSelectedFilmTitle(prev => {
            // If we already have a valid selection, keep it (prevents snapping back)
            if (prev && filmExistsInList(prev)) {
                return prev;
            }
            // Otherwise default to the first available film
            if (myFilms.length > 0) {
                return myFilms[0].workingTitle;
            }
            return '';
        });
    }, [myFilms, initialFilmTitle]); 
    
    // Reset feedback index when film changes
    useEffect(() => {
        setFeedbackStartIndex(0);
    }, [selectedFilmTitle]);

    const selectedFilm = useMemo(() => {
        return myFilms.find(f => f.workingTitle === selectedFilmTitle) || null;
    }, [myFilms, selectedFilmTitle]);

    const currentIndex = useMemo(() => {
        return myFilms.findIndex(f => f.workingTitle === selectedFilmTitle);
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
    
    const calculateTotalFilmRevenue = (film: ProjectData) => {
        if (film.activeDeal) {
             const deal = film.activeDeal;
             // Berechne den garantierten Gesamtwert (Fixsumme + ALLE Raten über die gesamte Laufzeit)
             const guaranteedAmount = deal.upfrontPayment + (deal.monthlyPayment * deal.durationMonths);
             
             // Berechne die bisher *tatsächlich* verdiente Gewinnbeteiligung
             // totalEarnings beinhaltet: Upfront + (Monthly * MonthsPassed) + RevShare
             // Wir isolieren den RevShare-Teil:
             const paidFixedPortion = deal.upfrontPayment + (deal.monthlyPayment * deal.monthsPassed);
             const earnedRevShare = Math.max(0, deal.totalEarnings - paidFixedPortion);

             return guaranteedAmount + earnedRevShare;
        }
        // Legacy calculation
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
    
    // NEW: Get Dynamic Status Text based on Lifecycle
    const getFilmStatusText = (film: ProjectData) => {
        if (!film.activeDeal) return { text: t.marketing.myFilms.status.notMarketed, color: 'text-red-400' };

        const deal = film.activeDeal;
        const locale = language === 'de' ? 'de-DE' : 'en-US';

        // Status checks based on phases
        if (deal.currentPhase === 'waiting_for_release') {
             // Show start date if waiting
             const dateStr = deal.nextPhaseStartDate ? new Date(deal.nextPhaseStartDate).toLocaleDateString(locale) : '?';
             return { text: `Start: ${dateStr}`, color: 'text-indigo-400' };
        } else if (deal.currentPhase === 'cinema') {
             return { text: "Phase: Kino", color: 'text-amber-400' };
        } else if (deal.currentPhase === 'transition_to_home') {
             return { text: "Kino beendet - Warte auf Home Ent.", color: 'text-gray-400' };
        } else if (deal.currentPhase === 'home') {
             return { text: "Phase: Home Entertainment", color: 'text-blue-400' };
        } else if (deal.currentPhase === 'payTv') {
             return { text: "Phase: Pay-TV", color: 'text-cyan-400' };
        } else if (deal.currentPhase === 'freeTv') {
             // Remain in Free-TV phase text until officially ended
             return { text: "Phase: Free-TV", color: 'text-gray-400' };
        } else {
             return { text: t.marketing.myFilms.status.complete, color: 'text-green-400' };
        }
    };

    // Helper to resolve name including family (Shared Logic)
    const resolveName = (id: number | undefined) => {
        if (id === undefined) return '-';
        if (id === -1) return playerData.playerName;
        if (id === 99901) return playerData.partnerName || 'Partner';
        if (id >= 99910) return playerData.children[id - 99910]?.name || 'Kind';
        
        const director = playerData.directors.find(d => d.id === id);
        if (director) return director.name;
        
        const actor = playerData.actors.find(a => a.id === id);
        if (actor) return actor.name;
        
        return '-';
    };

    return (
        <div>
            <h2 className="text-4xl font-bold text-center font-cinzel text-amber-400 mb-6">{t.marketing.myFilms.title}</h2>
            {myFilms.length > 0 ? (
                <>
                    {selectedFilm && (() => {
                        const isSeries = selectedFilm.projectType === ProjectType.Series;
                        const totalCost = selectedFilm.totalCost || 0;
                        const totalRevenue = calculateTotalFilmRevenue(selectedFilm);
                        const netProfit = totalRevenue - totalCost;
                        
                        // Use resolveName instead of manual lookup
                        const directorName = resolveName(selectedFilm.directorId);
                        const mainActorName = resolveName(selectedFilm.mainActorId);
                        const supportingActorName = resolveName(selectedFilm.supportingActorId);
                        
                        const idealProfile = GENRE_IDEAL_PROFILES[selectedFilm.genre];
                        const status = getFilmStatusText(selectedFilm);

                        const {
                            coverImageId = 1,
                            coverTitlePosition = 'bottom',
                            coverTitleFontSize = 30,
                            coverTitleFontFamily = 'Cinzel',
                            coverTitleColor = '#FFFFFF'
                        } = selectedFilm;
                    
                        const getPositionClass = () => {
                            switch (coverTitlePosition) {
                                case 'top': return 'justify-start pt-2';
                                case 'top-center': return 'justify-start pt-[25%]';
                                case 'center': return 'justify-center';
                                case 'bottom-center': return 'justify-end pb-[25%]';
                                case 'bottom': return 'justify-end pb-2';
                                default: return 'justify-end pb-2';
                            }
                        };
                        
                        const contractDate = selectedFilm.activeDeal 
                             ? (selectedFilm.activeDeal.signedDate ? new Date(selectedFilm.activeDeal.signedDate) : new Date(selectedFilm.activeDeal.startDate))
                             : null;
                        
                        const locale = language === 'de' ? 'de-DE' : 'en-US';
                        
                        // Feedback Navigation Logic
                        const feedbacks = selectedFilm.testAudienceFeedback || [];
                        const maxFeedbackStart = Math.max(0, feedbacks.length - 3);
                        
                        const handlePrevFeedback = () => {
                             setFeedbackStartIndex(prev => Math.max(0, prev - 1));
                        };
                        
                        const handleNextFeedback = () => {
                             setFeedbackStartIndex(prev => Math.min(maxFeedbackStart, prev + 1));
                        };
                        
                        const displayedFeedbacks = feedbacks.slice(feedbackStartIndex, feedbackStartIndex + 3);

                        // Age Rating Logic
                        const idealRating = GENRE_IDEAL_AGE_RATING[selectedFilm.genre];
                        const isRatingCorrect = selectedFilm.ageRating === idealRating;
                        const ratingLabel = selectedFilm.ageRating ? t.project.planning.ratings[selectedFilm.ageRating] : '-';
                        const awardList = selectedFilm.awards || [];

                        return (
                        <div className="bg-gray-800/90 p-2 rounded-lg border border-gray-700 space-y-1.5 max-w-7xl mx-auto">
                            <div className="flex justify-start gap-3 px-1 pt-1">
                                <button
                                    onClick={() => setActiveView('movies')}
                                    className={`px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === 'movies' ? 'bg-amber-500 text-gray-900 border-amber-400' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500'}`}
                                >
                                    {t.marketing.myFilms.filterMovies}
                                </button>
                                <button
                                    onClick={() => setActiveView('series')}
                                    className={`px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === 'series' ? 'bg-amber-500 text-gray-900 border-amber-400' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500'}`}
                                >
                                    {t.marketing.myFilms.filterSeries}
                                </button>
                            </div>
                            <div className="text-center border-b border-gray-700 pb-1.5 mb-1.5">
                                <h3 className="text-xl font-cinzel text-amber-300">{selectedFilm.workingTitle}</h3>
                                <p className="text-sm text-gray-400">{t.genres[selectedFilm.genre]}</p>
                                <div className="flex flex-col items-center justify-center gap-1 mt-1">
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={selectedFilm.finalQuality || 0} />
                                        {!isSeries && selectedFilm.awards && selectedFilm.awards.length > 0 && (
                                            <div className="flex items-center gap-1 text-yellow-400" title={selectedFilm.awards.join(', ')}>
                                                <TrophyIcon className="h-4 w-4" />
                                                <span className="text-xs font-semibold">{selectedFilm.awards.length}</span>
                                            </div>
                                        )}
                                    </div>
                                    <HeartRating rating={selectedFilm.hype || 0} size="sm" />
                                </div>
                                <p className={`text-xs font-bold mt-1 ${status.color}`}>{status.text}</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                                <div className="lg:col-span-3 flex flex-col items-center justify-start pt-4 space-y-4">
                                    <div className="relative w-[200px] h-[300px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700 mx-auto">
                                        <img
                                            src={selectedFilm.customCover || getCoverPath(selectedFilm.genre, coverImageId)}
                                            alt={`Cover für ${selectedFilm.workingTitle}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className={`absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass()}`}>
                                            <h3 className="text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                                                style={{ fontFamily: coverTitleFontFamily || 'Cinzel', fontSize: `${(coverTitleFontSize || 30) / 1.5}px`, lineHeight: 1.2, color: coverTitleColor || '#FFFFFF' }}>
                                                {selectedFilm.workingTitle}
                                            </h3>
                                        </div>
                                        { (selectedFilm.directorId !== undefined && selectedFilm.mainActorId !== undefined) &&
                                            (() => {
                                                const namesPositionClass = (coverTitlePosition === 'top' || coverTitlePosition === 'top-center' || coverTitlePosition === 'center') ? 'bottom-2' : 'top-2';
                                                const directorNameUpper = directorName.toUpperCase();
                                                const mainActorNameUpper = mainActorName.toUpperCase();
                                                const combinedLength = directorNameUpper.length + mainActorNameUpper.length;
                                        
                                                let nameFontSize = 9; // Base size for 200px width
                                                if (combinedLength > 40) {
                                                    nameFontSize = 7;
                                                } else if (combinedLength > 30) {
                                                    nameFontSize = 8;
                                                }

                                                return (
                                                    <div 
                                                        className={`absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-1`}
                                                        style={{ 
                                                            color: coverTitleColor || '#FFFFFF',
                                                            fontSize: `${nameFontSize}px`,
                                                            lineHeight: '1.2'
                                                        }}
                                                    >
                                                        <p>{directorNameUpper} <span className="mx-1">•</span> {mainActorNameUpper}</p>
                                                    </div>
                                                );
                                            })()
                                        }
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <button
                                            onClick={handlePrevFilm}
                                            disabled={myFilms.length <= 1}
                                            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Vorheriger Film"
                                        >
                                            <ArrowLeftIcon className="h-6 w-6 text-white" />
                                        </button>
                                        <span className="text-sm text-gray-400 font-semibold">{currentIndex + 1} / {myFilms.length}</span>
                                        <button
                                            onClick={handleNextFilm}
                                            disabled={myFilms.length <= 1}
                                            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Nächster Film"
                                        >
                                            <ArrowRightIcon className="h-6 w-6 text-white" />
                                        </button>
                                    </div>
                                    <div className="bg-black/50 p-2 rounded-md text-sm w-full">
                                        <h4 className="text-base font-cinzel text-amber-400 text-center mb-1">{t.marketing.myFilms.financeOverview}</h4>
                                        <div className="max-w-md mx-auto space-y-0.5">
                                            <DetailRow label={t.marketing.myFilms.totalCost} value={formatCurrency(totalCost)} />
                                            <DetailRow label={t.marketing.myFilms.totalRevenue} value={formatCurrency(totalRevenue)} />
                                            <div className={`flex justify-between font-bold py-1 border-t-2 border-amber-500/50 mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                <span>{t.marketing.myFilms.netProfit}</span>
                                                <span>{formatCurrency(netProfit)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-9 space-y-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="bg-gray-900/50 p-2 rounded-md space-y-1">
                                            <div>
                                                <h4 className="text-base font-cinzel text-amber-400 border-b border-gray-700 pb-1 mb-1">{t.marketing.myFilms.productionDetails}</h4>
                                                <DetailRow label={t.marketing.myFilms.director} value={directorName} />
                                                <DetailRow label={t.marketing.myFilms.mainActor} value={mainActorName} />
                                                <DetailRow label={t.marketing.myFilms.supportingActor} value={supportingActorName} />
                                                <DetailRow 
                                                    label={t.project.planning.ageRating} 
                                                    value={
                                                        <span className={isRatingCorrect ? 'text-green-400' : 'text-red-400'}>
                                                            {ratingLabel}
                                                        </span>
                                                    }
                                                />
                                                <DetailRow label={t.marketing.myFilms.extras} value={(t.productionOptions.extras[`level${selectedFilm.extrasLevel}` as keyof typeof t.productionOptions.extras] || EXTRAS_OPTIONS.find(e => e.level === selectedFilm.extrasLevel))?.name || '-'} />
                                                {!isSeries && (
                                                    <DetailRow
                                                        label={t.marketing.myFilms.awards}
                                                        value={awardList.length > 0 ? (
                                                            <div className="flex flex-col items-end text-right">
                                                                {awardList.map((award, index) => (
                                                                    <span key={`${award}-${index}`}>{award}</span>
                                                                ))}
                                                            </div>
                                                        ) : '-'}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/50 p-2 rounded-md">
                                            <h4 className="text-base font-cinzel text-amber-400 border-b border-gray-700 pb-1 mb-1">{t.marketing.myFilms.creativeFocus}</h4>
                                            {idealProfile ? (
                                                <div className="space-y-0.5">
                                                    <FocusBar label={t.creativeFocus.action} value={selectedFilm.focusAction || 0} color={getFocusColor(selectedFilm.focusAction, idealProfile.action)} />
                                                    <FocusBar label={t.creativeFocus.humor} value={selectedFilm.focusHumor || 0} color={getFocusColor(selectedFilm.focusHumor, idealProfile.humor)} />
                                                    <FocusBar label={t.creativeFocus.romance} value={selectedFilm.focusRomance || 0} color={getFocusColor(selectedFilm.focusRomance, idealProfile.romance)} />
                                                    <FocusBar label={t.creativeFocus.dialogues} value={selectedFilm.focusDialogues || 0} color={getFocusColor(selectedFilm.focusDialogues, idealProfile.dialogues)} />
                                                    <FocusBar label={t.creativeFocus.violence} value={selectedFilm.focusViolence || 0} color={getFocusColor(selectedFilm.focusViolence, idealProfile.violence)} />
                                                    <FocusBar label={t.creativeFocus.costumes} value={selectedFilm.focusCostumes || 0} color={getFocusColor(selectedFilm.focusCostumes, idealProfile.costumes)} />
                                                    <FocusBar label={t.creativeFocus.makeup} value={selectedFilm.focusMakeup || 0} color={getFocusColor(selectedFilm.focusMakeup, idealProfile.makeup)} />
                                                    <FocusBar label={t.creativeFocus.stunts} value={selectedFilm.focusStunts || 0} color={getFocusColor(selectedFilm.focusStunts, idealProfile.stunts)} />
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-center text-xs py-2">Kein Idealprofil für dieses Genre gefunden.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gray-900/50 p-2 rounded-md">
                                        <h4 className="text-base font-cinzel text-amber-400 text-center mb-1">{t.marketing.myFilms.audienceFeedback}</h4>
                                        
                                        <div className="flex items-center gap-2">
                                            {/* Left Arrow */}
                                            <button 
                                                onClick={handlePrevFeedback}
                                                disabled={feedbackStartIndex <= 0}
                                                className="p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ArrowLeftIcon className="h-5 w-5 text-white" />
                                            </button>

                                            {/* Feedback Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow">
                                                {displayedFeedbacks.map((fb, index) => (
                                                    <div key={index} className="bg-gray-800/50 p-2 rounded-md border border-gray-700/50">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <ChatBubbleIcon className="h-4 w-4 text-gray-400" />
                                                            <p className="font-bold text-white text-xs">{fb.viewer} sagt:</p>
                                                        </div>
                                                        <p className="text-xs text-gray-300 italic line-clamp-3" title={fb.text}>"{fb.text}"</p>
                                                    </div>
                                                ))}
                                                {feedbacks.length === 0 && (
                                                    <div className="col-span-3 text-center text-gray-500 text-xs italic py-2">Kein Feedback verfügbar.</div>
                                                )}
                                            </div>

                                            {/* Right Arrow */}
                                            <button 
                                                onClick={handleNextFeedback}
                                                disabled={feedbackStartIndex >= maxFeedbackStart}
                                                className="p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ArrowRightIcon className="h-5 w-5 text-white" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/50 p-2 rounded-md">
                                        <h4 className="text-base font-cinzel text-amber-400 border-b border-gray-700 pb-1 mb-2">{t.marketing.myFilms.distribution}</h4>
                                        
                                        <div className="bg-black/20 p-2 rounded-md min-h-[160px]">
                                            {selectedFilm.activeDeal ? (
                                                <div className="space-y-0.5 animate-fade-in">
                                                    <DetailRow label={t.marketing.myFilms.distributor} value={selectedFilm.activeDeal.distributorName} />
                                                    <DetailRow label={t.marketing.myFilms.contractDate} value={contractDate ? contractDate.toLocaleDateString(locale) : '-'} />
                                                    
                                                    <DetailRow label={t.marketing.myFilms.lumpSum} value={formatCurrency(selectedFilm.activeDeal.upfrontPayment)} />
                                                    
                                                    {selectedFilm.activeDeal.monthlyPayment > 0 && (
                                                         <DetailRow 
                                                            label="Ratenzahlung (Laufzeit)" 
                                                            value={`${formatCurrency(selectedFilm.activeDeal.monthlyPayment)} / Monat (Rest: ${Math.max(0, selectedFilm.activeDeal.durationMonths - selectedFilm.activeDeal.monthsPassed)}/${selectedFilm.activeDeal.durationMonths} Raten)`} 
                                                         />
                                                    )}

                                                    <DetailRow label={t.marketing.myFilms.revenueShare} value={`${(selectedFilm.activeDeal.revenueShare * 100).toFixed(1)}%`} />
                                                    <DetailRow label={t.marketing.myFilms.viewersTotal} value={new Intl.NumberFormat(locale).format(selectedFilm.cinemaRelease?.totalViewers || 0)} />
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic text-center text-xs py-10">{isSeries ? t.marketing.myFilms.noSeriesDeal : t.marketing.myFilms.noCinemaDeal}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })()}
                </>
            ) : (
                 <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                    <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg">
                        <div className="flex justify-start gap-3 mb-6">
                            <button
                                onClick={() => setActiveView('movies')}
                                className={`px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === 'movies' ? 'bg-amber-500 text-gray-900 border-amber-400' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500'}`}
                            >
                                {t.marketing.myFilms.filterMovies}
                            </button>
                            <button
                                onClick={() => setActiveView('series')}
                                className={`px-5 py-2 rounded-sm border font-bold uppercase tracking-wider text-sm transition-colors ${activeView === 'series' ? 'bg-amber-500 text-gray-900 border-amber-400' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-amber-500'}`}
                            >
                                {t.marketing.myFilms.filterSeries}
                            </button>
                        </div>
                        <h2 className="text-2xl text-gray-400">{activeView === 'series' ? t.marketing.myFilms.noSeriesProduced : t.marketing.myFilms.noFilmsProduced}</h2>
                        <p className="text-gray-500 mt-2">{activeView === 'series' ? t.marketing.myFilms.produceFirstSeries : t.marketing.myFilms.produceFirstFilm}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyFilmsTab;
