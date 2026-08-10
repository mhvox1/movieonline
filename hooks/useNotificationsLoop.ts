
import React, { useEffect } from 'react';
import { PlayerData, AwardCategory, Director, Actor, ProjectData, MovieSize, Era, ProjectPhase, Message, DistributionDeal, ProjectType } from '../types';
import { MOVIE_AWARD_NAME } from '../components/festivalData';
import { useTranslation } from './useTranslation';
import { getTalentPortraitUrl } from '../components/TalentDossierModal';
import { isSameDay } from './helpers';

interface UseNotificationsLoopProps {
    playerData: PlayerData;
    setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
    systemPause: () => void;
    setFestivalResultInfo: React.Dispatch<React.SetStateAction<any | null>>;
    setKinoStartInfo: React.Dispatch<React.SetStateAction<{ title: string } | null>>;
    setHomeEntertainmentStartInfo: React.Dispatch<React.SetStateAction<{ title: string } | null>>;
    setKinoEndInfo: React.Dispatch<React.SetStateAction<{ title: string } | null>>;
    setHomeEntertainmentEndInfo: React.Dispatch<React.SetStateAction<{ title: string } | null>>;
}

// Helper to calculate age suffix for player manually if needed
const getPlayerPortrait = (portraitId: string | undefined, birthDate: Date | undefined, gameDate: Date) => {
    if (!portraitId || !birthDate) return undefined;
    const age = gameDate.getFullYear() - new Date(birthDate).getFullYear();
    let suffix = 'k';
    if (age >= 16 && age <= 34) suffix = 'j';
    else if (age >= 35 && age <= 59) suffix = 'm';
    else if (age >= 60) suffix = 'a';
    return `./portrait/${portraitId}${suffix}.png`;
};

// HELPER: Date Calculation for Fallbacks
const calcDate = (base: Date | string, months: number) => {
    const d = new Date(base);
    d.setMonth(d.getMonth() + months);
    return d;
};

export const useNotificationsLoop = ({
    playerData,
    setPlayerData,
    systemPause,
    setFestivalResultInfo,
    setKinoStartInfo,
    setHomeEntertainmentStartInfo,
}: UseNotificationsLoopProps) => {
    const { t, language } = useTranslation();
    const gameDate = playerData.gameDate;
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    useEffect(() => {
        setPlayerData(currentData => {
            if (!currentData) return null;

            const newDate = new Date(currentData.gameDate);
            // Normalize current date for comparison (start of day)
            newDate.setHours(0, 0, 0, 0);
            
            const currentYear = newDate.getFullYear();
            let dataChanged = false;
            let newHistory = [...(currentData.movieAwardHistory || [])];
            let newMessages: Message[] = [];
            
            // Create a shallow copy of completed films to mutate specific entries if needed
            let updatedCompletedFilms = [...currentData.completedFilms];

            // --- 1. RELEASE NOTIFICATIONS (Cinema, Home, PayTV, FreeTV) ---
            updatedCompletedFilms = updatedCompletedFilms.map(film => {
                if (!film.activeDeal) return film;
                
                let updatedFilm = { ...film };
                let dealUpdated = false;
                let deal = { ...film.activeDeal } as DistributionDeal;
                
                // Initialize notifications object if missing
                if (!deal.notificationsSent) deal.notificationsSent = {};

                const filmTitle = film.workingTitle || 'Unbekannter Film';
                const safeTitleId = String(filmTitle).replace(/[^a-zA-Z0-9]/g, '');

                // Helper to compare dates safely
                const isReached = (targetDate: Date | string | undefined) => {
                    if (!targetDate) return false;
                    const tDate = new Date(targetDate);
                    tDate.setHours(0, 0, 0, 0);
                    return newDate.getTime() >= tDate.getTime();
                };
                
                // --- FALLBACK CALCULATION FOR MISSING DATES ---
                const startDate = deal.startDate;
                
                let effectiveHomeStart = deal.homeEntertainmentStartDate;
                if (!effectiveHomeStart && deal.phases.homeVideoMonths > 0) {
                     effectiveHomeStart = calcDate(startDate, deal.phases.cinemaMonths);
                }

                let effectivePayStart = deal.payTvStartDate;
                if (!effectivePayStart && deal.phases.payTvMonths > 0) {
                     const prevStart = effectiveHomeStart || calcDate(startDate, deal.phases.cinemaMonths);
                     const prevDuration = effectiveHomeStart ? deal.phases.homeVideoMonths : 0;
                     effectivePayStart = calcDate(prevStart, prevDuration);
                }

                let effectiveFreeStart = deal.freeTvStartDate;
                if (!effectiveFreeStart && deal.phases.freeTvMonths > 0) {
                     let prevStart = startDate;
                     let prevDuration = deal.phases.cinemaMonths;
                     
                     if (effectivePayStart) {
                         prevStart = effectivePayStart;
                         prevDuration = deal.phases.payTvMonths;
                     } else if (effectiveHomeStart) {
                         prevStart = effectiveHomeStart;
                         prevDuration = deal.phases.homeVideoMonths;
                     }
                     effectiveFreeStart = calcDate(prevStart, prevDuration);
                }
                
                let effectiveEndDate = deal.endDate;
                const totalMonths = deal.phases.cinemaMonths + deal.phases.homeVideoMonths + deal.phases.payTvMonths + deal.phases.freeTvMonths;
                const calcEnd = calcDate(startDate, totalMonths);
                
                if (!effectiveEndDate || (new Date(effectiveEndDate).getTime() < calcEnd.getTime() && deal.durationMonths < totalMonths)) {
                     effectiveEndDate = calcEnd;
                     deal.endDate = calcEnd; 
                     dealUpdated = true;
                }
                // --- END FALLBACKS ---


                // A) CINEMA START
                if (deal.phases.cinemaMonths > 0 && isReached(deal.startDate)) {
                    if (deal.currentPhase === 'waiting_for_release') {
                        deal.currentPhase = 'cinema';
                        dealUpdated = true;
                    }

                    if (!deal.notificationsSent.cinema) {
                        newMessages.push({
                            id: `msg_release_${safeTitleId}_cinema`,
                            date: newDate,
                            sender: deal.distributorName,
                            subjectTemplate: { key: 'marketing.offerMessage.cinemaReleaseSubject', variables: { title: filmTitle } },
                            bodyTemplate: { 
                                key: 'office.messages.cinemaReleaseBody', 
                                variables: { title: filmTitle, distributor: deal.distributorName } 
                            },
                            read: false,
                            linkedProject: film // Pass film for poster rendering
                        });
                        
                        if (setKinoStartInfo) setKinoStartInfo({ title: filmTitle });
                        
                        deal.notificationsSent.cinema = true;
                        dealUpdated = true;
                        dataChanged = true;
                    }
                }

                // B) HOME ENTERTAINMENT START
                if (deal.phases.homeVideoMonths > 0 && isReached(effectiveHomeStart)) {
                    if (deal.currentPhase === 'waiting_for_release' || deal.currentPhase === 'cinema' || deal.currentPhase === 'transition_to_home') {
                        deal.currentPhase = 'home';
                        dealUpdated = true;
                    }

                    if (!deal.notificationsSent.home) {
                        newMessages.push({
                            id: `msg_release_${safeTitleId}_home`,
                            date: newDate,
                            sender: deal.distributorName,
                            subjectTemplate: { key: 'marketing.offerMessage.homeStartSubject', variables: { title: filmTitle } },
                            bodyTemplate: { 
                                key: 'office.messages.homeReleaseBody', 
                                variables: { title: filmTitle, distributor: deal.distributorName } 
                            },
                            read: false,
                            linkedProject: film // Pass film for poster rendering
                        });
                        
                        if (setHomeEntertainmentStartInfo) setHomeEntertainmentStartInfo({ title: filmTitle });
                        
                        deal.notificationsSent.home = true;
                        dealUpdated = true;
                        dataChanged = true;
                    }
                }

                // C) PAY TV START
                if (deal.phases.payTvMonths > 0 && isReached(effectivePayStart)) {
                    if (['waiting_for_release', 'cinema', 'transition_to_home', 'home'].includes(deal.currentPhase)) {
                        deal.currentPhase = 'payTv';
                        dealUpdated = true;
                    }

                    if (!deal.notificationsSent.payTv) {
                        newMessages.push({
                            id: `msg_release_${safeTitleId}_paytv`,
                            date: newDate,
                            sender: deal.distributorName,
                            subjectTemplate: { key: 'marketing.offerMessage.payTvStartSubject', variables: { title: filmTitle } },
                            bodyTemplate: { 
                                key: 'office.messages.payTvReleaseBody', 
                                variables: { title: filmTitle, distributor: deal.distributorName } 
                            },
                            read: false,
                            linkedProject: film // Pass film for poster rendering
                        });
                        
                        deal.notificationsSent.payTv = true;
                        dealUpdated = true;
                        dataChanged = true;
                    }
                }

                // D) FREE TV START
                if (deal.phases.freeTvMonths > 0 && isReached(effectiveFreeStart)) {
                    if (['waiting_for_release', 'cinema', 'transition_to_home', 'home', 'payTv'].includes(deal.currentPhase)) {
                        deal.currentPhase = 'freeTv';
                        dealUpdated = true;
                    }

                    if (!deal.notificationsSent.freeTv) {
                        newMessages.push({
                            id: `msg_release_${safeTitleId}_freetv`,
                            date: newDate,
                            sender: deal.distributorName,
                            subjectTemplate: { key: 'marketing.offerMessage.freeTvStartSubject', variables: { title: filmTitle } },
                            bodyTemplate: { 
                                key: 'office.messages.freeTvReleaseBody', 
                                variables: { title: filmTitle, distributor: deal.distributorName } 
                            },
                            read: false,
                            linkedProject: film // Pass film for poster rendering
                        });
                        
                        deal.notificationsSent.freeTv = true;
                        dealUpdated = true;
                        dataChanged = true;
                    }
                }
                
                // E) END OF CYCLE
                if (isReached(effectiveEndDate)) {
                    if (deal.currentPhase !== 'ended') {
                        deal.currentPhase = 'ended';
                        dealUpdated = true;
                    }

                    if (!deal.notificationsSent.end) {
                         const finalTotalRevenueVal = deal.totalEarnings;
                         
                         const formattedTotalRevenue = new Intl.NumberFormat(locale, { 
                             style: 'currency', 
                             currency: 'USD', 
                             minimumFractionDigits: 0, 
                             maximumFractionDigits: 0 
                         }).format(finalTotalRevenueVal);

                         newMessages.push({
                            id: `msg_release_${safeTitleId}_end`,
                            date: newDate,
                            sender: 'Portfolio Management',
                            subjectTemplate: { key: 'marketing.offerMessage.cycleEndSubject', variables: { title: filmTitle } },
                            bodyTemplate: { 
                                key: 'marketing.offerGenerator.cycleEndBody', 
                                variables: { 
                                    title: filmTitle, 
                                    totalRevenue: formattedTotalRevenue
                                } 
                            },
                            read: false,
                            linkedProject: film // SHOW COVER IN END NOTIFICATION
                        });
                        
                        deal.notificationsSent.end = true;
                        dealUpdated = true;
                        dataChanged = true;
                    }
                }
                
                if (dealUpdated) {
                    updatedFilm.activeDeal = deal;
                    dataChanged = true;
                    return updatedFilm;
                }
                
                return film;
            });


            // --- 2. MOVIE AWARD LOGIC ---
            const month = newDate.getMonth();
            const day = newDate.getDate();
            const dayOfWeek = newDate.getDay(); 
            
            const isAwardDay = month === 0 && dayOfWeek === 6 && day >= 8 && day <= 14;
            const awardAlreadyProcessed = newHistory.some(h => h.year === currentYear);

            if (isAwardDay && !awardAlreadyProcessed) {
                const prevYear = currentYear - 1;
                
                const compFilms = currentData.competitors.flatMap(c => 
                    c.completedFilms
                        .filter(f => new Date(f.releaseDate).getFullYear() === prevYear)
                        .map(f => ({ 
                            ...f, 
                            isPlayer: false, 
                            studioName: c.name,
                        }))
                );

                const playerFilms = currentData.completedFilms
                    .filter(f => {
                         if (f.projectType === ProjectType.Series) {
                             return false;
                         }
                         const releaseDate = f.activeDeal ? f.activeDeal.startDate : f.cinemaRelease?.releaseDate;
                         return releaseDate && new Date(releaseDate).getFullYear() === prevYear;
                    })
                    .map(f => {
                        const releaseDate = f.activeDeal ? f.activeDeal.startDate : f.cinemaRelease!.releaseDate;
                        return { 
                            ...f, 
                            isPlayer: true, 
                            title: f.workingTitle, 
                            studioName: currentData.studioName,
                            releaseDate: releaseDate,
                            quality: f.finalQuality || 0,
                            actorId: f.mainActorId 
                        };
                    });

                const allCandidates = [...compFilms, ...playerFilms];

                if (allCandidates.length > 0) {
                    allCandidates.sort((a, b) => b.quality - a.quality);
                    
                    const livingDirectorIds = new Set(currentData.directors.map(d => d.id));
                    const livingActorIds = new Set(currentData.actors.map(a => a.id));

                    const isTalentAlive = (id: number | undefined, type: 'director' | 'actor') => {
                        if (id === undefined) return false;
                        if (id === -1 || id >= 99900) return true; 
                        
                        if (type === 'director') return livingDirectorIds.has(id);
                        return livingActorIds.has(id);
                    };

                    const awards: AwardCategory[] = [];
                    
                    const getName = (id: number | undefined, type: 'director' | 'actor') => {
                        if (!id) return "Unbekannt";
                        if (id === -1) return currentData.playerName;
                        if (id === 99901) return currentData.partnerName || "Partner";
                        if (id >= 99910) {
                             const child = currentData.children.find(c => c.id.includes(String(id)) || 99910 + currentData.children.indexOf(c) === id);
                             return child ? child.name : "Kind";
                        }
                        const list = type === 'director' ? currentData.directors : currentData.actors;
                        const t = list.find((x: Director | Actor) => x.id === id);
                        return t ? t.name : "Unbekannt";
                    };

                    const getPortrait = (id: number | undefined, type: 'director' | 'actor') => {
                        if (!id) return undefined;
                        if (id === -1) return getPlayerPortrait(currentData.playerPortraitId, currentData.playerBirthDate, newDate);
                        if (id === 99901) return getPlayerPortrait(currentData.partnerPortraitId, currentData.partnerBirthDate, newDate);
                        if (id >= 99910) return undefined; 

                        const list = type === 'director' ? currentData.directors : currentData.actors;
                        const t = list.find((x: Director | Actor) => x.id === id);
                        return t ? getTalentPortraitUrl(t, newDate) : undefined;
                    };

                    const filmNominees = allCandidates.slice(0, 4).map(f => {
                        let filmData: ProjectData | undefined;
                        if (f.isPlayer) {
                            filmData = currentData.completedFilms.find(p => p.workingTitle === f.title);
                        } else {
                            const mockCoverId = (f.title.length % 5) + 1; 
                            filmData = {
                                workingTitle: f.title,
                                genre: f.genre,
                                coverImageId: mockCoverId,
                                coverTitlePosition: 'bottom',
                                coverTitleFontSize: 30,
                                coverTitleFontFamily: 'Cinzel',
                                coverTitleColor: '#FFFFFF',
                                directorId: f.directorId,
                                mainActorId: f.actorId,
                                phase: ProjectPhase.Completed,
                                isArchived: false,
                                movieSize: MovieSize.A,
                                scriptQuality: f.quality,
                                scriptStartDate: new Date(newDate),
                                scriptEndDate: new Date(newDate),
                                era: Era.Present,
                            } as ProjectData;
                        }

                        return {
                            filmTitle: f.title,
                            studioName: f.studioName,
                            isPlayer: f.isPlayer,
                            film: filmData
                        };
                    });
                    
                    const top3Films = allCandidates.slice(0, 3);
                    const bestFilm = top3Films.length > 0 ? top3Films[Math.floor(Math.random() * top3Films.length)] : allCandidates[0];

                    awards.push({
                        category: 'best_film',
                        nominees: filmNominees,
                        winnerIdentifier: bestFilm.title
                    });

                    const usedDirectorIds = new Set<number>();
                    const dirCandidates = allCandidates.filter(f => {
                        if (!f.directorId) return false;
                        if (!isTalentAlive(f.directorId, 'director')) return false;
                        if (usedDirectorIds.has(f.directorId)) return false;
                        usedDirectorIds.add(f.directorId);
                        return true;
                    }).slice(0, 4);

                    const dirNominees = dirCandidates.map(f => ({
                        filmTitle: f.title,
                        studioName: f.studioName,
                        isPlayer: f.isPlayer,
                        talentName: getName(f.directorId, 'director'),
                        portraitUrl: getPortrait(f.directorId, 'director'),
                    }));
                    const bestDirectorFilm = dirCandidates.length > 0 ? dirCandidates[Math.floor(Math.random() * Math.min(3, dirCandidates.length))] : null;
                    
                    if (bestDirectorFilm) {
                        awards.push({
                            category: 'best_director',
                            nominees: dirNominees,
                            winnerIdentifier: getName(bestDirectorFilm.directorId, 'director')
                        });
                    }

                    const usedActorIds = new Set<number>();
                    const actCandidates = allCandidates.filter(f => {
                         if (!f.actorId) return false;
                         if (!isTalentAlive(f.actorId, 'actor')) return false;
                         if (usedActorIds.has(f.actorId)) return false;
                         usedActorIds.add(f.actorId);
                         return true;
                    }).slice(0, 4);

                    const actNominees = actCandidates.map(f => ({
                        filmTitle: f.title,
                        studioName: f.studioName,
                        isPlayer: f.isPlayer,
                        talentName: getName(f.actorId, 'actor'),
                        portraitUrl: getPortrait(f.actorId, 'actor'),
                    }));
                    const bestActorFilm = actCandidates.length > 0 ? actCandidates[Math.floor(Math.random() * Math.min(3, actCandidates.length))] : null;
                    
                    if (bestActorFilm) {
                        awards.push({
                            category: 'best_actor',
                            nominees: actNominees,
                            winnerIdentifier: getName(bestActorFilm.actorId, 'actor')
                        });
                    }

                    newHistory.unshift({
                        year: currentYear,
                        bestFilm: bestFilm.title,
                        bestDirector: bestDirectorFilm ? getName(bestDirectorFilm.directorId, 'director') : 'N/A',
                        bestActor: bestActorFilm ? getName(bestActorFilm.actorId, 'actor') : 'N/A'
                    });

                    setFestivalResultInfo({
                        festivalId: 'movie_award',
                        festivalName: MOVIE_AWARD_NAME,
                        awards: awards
                    });
                    
                    systemPause();
                    dataChanged = true;
                } else {
                     newHistory.unshift({
                        year: currentYear,
                        bestFilm: "-",
                        bestDirector: "-",
                        bestActor: "-"
                    });
                    dataChanged = true;
                }
            }

            if (dataChanged) {
                if (newMessages.length > 0) {
                     systemPause();
                }
                return { 
                    ...currentData, 
                    completedFilms: updatedCompletedFilms, 
                    movieAwardHistory: newHistory,
                    messages: [...currentData.messages, ...newMessages]
                };
            }
            return currentData;
        });
    }, [gameDate, setPlayerData, systemPause, setFestivalResultInfo, t, locale]);
};
