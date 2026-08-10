
import React, { useEffect } from 'react';
import { PlayerData, CompetitorFilm, Genre, Director, Actor, ProjectPhase } from '../types';
import { generateCompetitorFilmTitle } from '../components/competitorData';

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const toWeeklyThursdayNoonKey = (date: Date): string => {
    const anchor = new Date(date);
    const day = anchor.getDay(); // 0=Sun ... 4=Thu
    const daysSinceThursday = (day - 4 + 7) % 7;
    anchor.setDate(anchor.getDate() - daysSinceThursday);
    anchor.setHours(12, 0, 0, 0);

    if (date.getTime() < anchor.getTime()) {
        anchor.setDate(anchor.getDate() - 7);
    }

    const y = anchor.getFullYear();
    const m = String(anchor.getMonth() + 1).padStart(2, '0');
    const d = String(anchor.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

interface UseCompetitorLoopProps {
    playerData: PlayerData;
    setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
}

export const useCompetitorLoop = ({ playerData, setPlayerData }: UseCompetitorLoopProps) => {
    const gameDate = playerData.gameDate;

    useEffect(() => {
        setPlayerData(currentData => {
            if (!currentData) return null;

            let dataChanged = false;
            const newState = { ...currentData };
            const newDate = new Date(currentData.gameDate);
            const currentChartWeekKey = toWeeklyThursdayNoonKey(newDate);
            const lastChartWeekKey = String(newState.lastKinoChartsUpdateWeekKey || '');
            
            let updatedDirectors = [...newState.directors];
            let updatedActors = [...newState.actors];
            let usedTitles: Set<string> = new Set(newState.competitors.flatMap(c => c.completedFilms.map(f => f.title)));

            // Helper to check if talent is busy in ANY active player project
            const isBusyInPlayerProject = (talentId: number): boolean => {
                if (!newState.activeProjects) return false;
                
                return newState.activeProjects.some(project => {
                    // Check phases where talent is strictly locked (Production/Post)
                    const productionPhases = [
                        ProjectPhase.ProductionSetup, 
                        ProjectPhase.Production, 
                        ProjectPhase.PostProductionSetup, 
                        ProjectPhase.PostProduction
                    ];
                    
                    if (productionPhases.includes(project.phase)) {
                        return project.directorId === talentId || 
                               project.mainActorId === talentId || 
                               project.supportingActorId === talentId;
                    }

                    // Check Casting Phases
                    // If a talent is invited to a casting, they are blocked for competitors until the player decides.
                    const castingPhases = [
                        ProjectPhase.Casting,
                        ProjectPhase.CastingFinished
                    ];

                    if (castingPhases.includes(project.phase)) {
                        return project.castingInvitedActors?.includes(talentId);
                    }

                    return false;
                });
            };

            newState.competitors = newState.competitors.map(studio => {
                if (newDate < new Date(studio.currentActivity.endDate)) {
                    return studio;
                }

                if (studio.currentActivity.type === 'producing') {
                    const moralDecrease = 20 + Math.floor(Math.random() * 21);
                    const { directorId, actorId } = studio.currentActivity;
                    
                    let directorSkill = 50; // Fallback
                    let actorSkill = 50; // Fallback

                    if (directorId) {
                        const directorIndex = updatedDirectors.findIndex(d => d.id === directorId);
                        if (directorIndex > -1) {
                            const director = { ...updatedDirectors[directorIndex] };
                            director.moral = Math.max(0, director.moral - moralDecrease);
                            director.unavailableForProjectsUntil = undefined;
                            updatedDirectors[directorIndex] = director;
                            directorSkill = director.skill;
                        }
                    }
                    if (actorId) {
                        const actorIndex = updatedActors.findIndex(a => a.id === actorId);
                        if (actorIndex > -1) {
                            const actor = { ...updatedActors[actorIndex] };
                            actor.moral = Math.max(0, actor.moral - moralDecrease);
                            actor.unavailableForProjectsUntil = undefined;
                            updatedActors[actorIndex] = actor;
                            actorSkill = actor.skill;
                        }
                    }

                    // NEW LOGIC: Quality depends on Talent Skills
                    // Base quality is average of Director and Actor skill
                    const baseQuality = (directorSkill + actorSkill) / 2;
                    
                    // Add some variance (-10 to +15)
                    // High skilled teams are slightly more consistent
                    const varianceRange = baseQuality > 80 ? 10 : 20; 
                    const variance = Math.floor(Math.random() * (varianceRange + 1)) - (varianceRange / 2) + 5;
                    
                    const quality = Math.max(1, Math.min(100, Math.round(baseQuality + variance)));

                    dataChanged = true;
                    return {
                        ...studio,
                        currentActivity: {
                            type: 'pending_release',
                            filmTitle: studio.currentActivity.filmTitle!,
                            quality: quality,
                            endDate: newDate,
                            directorId: studio.currentActivity.directorId,
                            actorId: studio.currentActivity.actorId,
                            genre: studio.currentActivity.genre,
                        },
                    };
                } else if (studio.currentActivity.type === 'break') {
                    const newTitle = generateCompetitorFilmTitle(usedTitles);
                    usedTitles.add(newTitle);

                    const productionDuration = 45 + Math.floor(Math.random() * 31);
                    const prodEndDate = new Date(newDate);
                    prodEndDate.setDate(prodEndDate.getDate() + productionDuration);

                    let directorId: number | undefined;
                    let actorId: number | undefined;

                    // NEW LOGIC: Competitor aims for a specific quality tier based on RNG
                    // This ensures they pick appropriate talents for their "vision"
                    // Ranges: 30-100. Some studios might aim higher than others randomly.
                    const targetSkillLevel = 30 + Math.floor(Math.random() * 71);

                    const availableDirectors = updatedDirectors.filter(d => 
                        (!d.unavailableForProjectsUntil || newDate > new Date(d.unavailableForProjectsUntil)) && 
                        !isBusyInPlayerProject(d.id)
                    );
                    
                    if (availableDirectors.length > 0) {
                        // Find director closest to target skill
                        // We add a bit of randomness so they don't always pick the absolute perfect match
                        availableDirectors.sort((a, b) => {
                            const diffA = Math.abs(a.skill - targetSkillLevel);
                            const diffB = Math.abs(b.skill - targetSkillLevel);
                            return diffA - diffB + (Math.random() * 10 - 5);
                        });
                        
                        // Pick one of the top 3 matches to vary it up
                        const topCandidates = availableDirectors.slice(0, 3);
                        const selectedDirector = pickRandom(topCandidates) || availableDirectors[0];
                        
                        directorId = selectedDirector.id;
                        
                        const directorIndexToUpdate = updatedDirectors.findIndex(d => d.id === directorId);
                        if (directorIndexToUpdate !== -1) {
                            updatedDirectors[directorIndexToUpdate].unavailableForProjectsUntil = prodEndDate;
                        }
                    }

                    const availableActors = updatedActors.filter(a => 
                        (!a.unavailableForProjectsUntil || newDate > new Date(a.unavailableForProjectsUntil)) && 
                        !isBusyInPlayerProject(a.id)
                    );

                    if (availableActors.length > 0) {
                        // Same logic for actors
                        availableActors.sort((a, b) => {
                            const diffA = Math.abs(a.skill - targetSkillLevel);
                            const diffB = Math.abs(b.skill - targetSkillLevel);
                            return diffA - diffB + (Math.random() * 10 - 5);
                        });

                        const topCandidates = availableActors.slice(0, 3);
                        const selectedActor = pickRandom(topCandidates) || availableActors[0];

                        actorId = selectedActor.id;

                        const actorIndexToUpdate = updatedActors.findIndex(a => a.id === actorId);
                        if (actorIndexToUpdate !== -1) {
                            updatedActors[actorIndexToUpdate].unavailableForProjectsUntil = prodEndDate;
                        }
                    }
                    
                    const genres = Object.values(Genre);
                    let selectedGenre = pickRandom(genres);
                    
                    // Try to pick a trending genre with 30% chance
                    if (Math.random() < 0.3) {
                        const trends = newState.genreTrends;
                        if (trends) {
                            const trendingGenres = genres.filter(g => trends[g].popularity > 1.1);
                            if (trendingGenres.length > 0) {
                                selectedGenre = pickRandom(trendingGenres);
                            }
                        }
                    }

                    dataChanged = true;
                    return {
                        ...studio,
                        currentActivity: { 
                            type: 'producing', filmTitle: newTitle, endDate: prodEndDate,
                            directorId, actorId, genre: selectedGenre,
                        },
                    };
                }
                return studio;
            });
            
            if (lastChartWeekKey && lastChartWeekKey !== currentChartWeekKey) {
                newState.competitors = newState.competitors.map(studio => {
                    let newActivity = { ...studio.currentActivity };
            
                    const decayedFilms = studio.completedFilms.map(film => {
                        const decay = 1 - (0.05 + Math.random() * 0.07);
                        const newChartQuality = film.chartQuality * decay;
                        
                        // Apply Genre Trend Factor
                        const trendFactor = newState.genreTrends[film.genre]?.popularity || 1.0;

                        const baseViewers = Math.pow(Math.max(0, newChartQuality - 10) / 20, 1.1) * 250000 * trendFactor;
                        const randomizer = 0.925 + Math.random() * 0.15;
                        const viewers = Math.floor(Math.max(0, baseViewers) * randomizer);
                        return {
                            ...film, chartQuality: newChartQuality, viewers: viewers,
                            totalViewers: (film.totalViewers || 0) + viewers, weeksInCharts: film.weeksInCharts + 1,
                        };
                    }).filter(film => film.chartQuality > 10);
            
                    if (studio.currentActivity.type === 'pending_release') {
                        const quality = studio.currentActivity.quality!;
                        const chartQuality = quality;
                        
                        // Apply Genre Trend Factor for opening week
                        const genre = studio.currentActivity.genre!;
                        const trendFactor = newState.genreTrends[genre]?.popularity || 1.0;

                        const baseViewers = Math.pow(Math.max(0, chartQuality - 10) / 20, 1.1) * 250000 * trendFactor;
                        const randomizer = 0.925 + Math.random() * 0.15;
                        const viewers = Math.floor(Math.max(0, baseViewers) * randomizer);
                        
                        const newFilm: CompetitorFilm = {
                            title: studio.currentActivity.filmTitle!, studioName: studio.name, quality: quality,
                            chartQuality: chartQuality, viewers: viewers, totalViewers: viewers, releaseDate: newDate,
                            weeksInCharts: 1, directorId: studio.currentActivity.directorId, actorId: studio.currentActivity.actorId,
                            genre: genre,
                        };
                        decayedFilms.push(newFilm);
            
                        const breakDuration = 5 + Math.floor(Math.random() * 11);
                        const breakEndDate = new Date(newDate);
                        breakEndDate.setDate(breakEndDate.getDate() + breakDuration);
                        newActivity = { type: 'break', endDate: breakEndDate };
                    }
            
                    return { ...studio, completedFilms: decayedFilms, currentActivity: newActivity };
                });
                newState.lastKinoChartsUpdateWeekKey = currentChartWeekKey;
                dataChanged = true;
            } else if (!lastChartWeekKey) {
                // Initialize marker for older saves to avoid multiple updates on same Thursday.
                newState.lastKinoChartsUpdateWeekKey = currentChartWeekKey;
                dataChanged = true;
            }

            newState.directors = updatedDirectors;
            newState.actors = updatedActors;

            if (dataChanged) {
                return newState;
            }
            return currentData;
        });
    }, [gameDate, setPlayerData]);
};
