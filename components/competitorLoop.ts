
import React, { useEffect } from 'react';
import { PlayerData, CompetitorFilm, Genre, Director, Actor } from '../types';
import { generateCompetitorFilmTitle } from '../components/competitorData';

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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
            
            let updatedDirectors = [...newState.directors];
            let updatedActors = [...newState.actors];
            let usedTitles: Set<string> = new Set(newState.competitors.flatMap(c => c.completedFilms.map(f => f.title)));

            newState.competitors = newState.competitors.map(studio => {
                if (newDate < new Date(studio.currentActivity.endDate)) {
                    return studio;
                }

                if (studio.currentActivity.type === 'producing') {
                    const moralDecrease = 20 + Math.floor(Math.random() * 21);
                    const { directorId, actorId } = studio.currentActivity;
            
                    const skillGain = 1 + Math.floor(Math.random() * 3);

                    if (directorId) {
                        const directorIndex = updatedDirectors.findIndex(d => d.id === directorId);
                        if (directorIndex > -1) {
                            const director = { ...updatedDirectors[directorIndex] };
                            director.moral = Math.max(0, director.moral - moralDecrease);
                            director.skill = Math.min(100, Math.min(director.potential, director.skill + skillGain));
                            director.unavailableForProjectsUntil = undefined;
                            updatedDirectors[directorIndex] = director;
                        }
                    }
                    if (actorId) {
                        const actorIndex = updatedActors.findIndex(a => a.id === actorId);
                        if (actorIndex > -1) {
                            const actor = { ...updatedActors[actorIndex] };
                            actor.moral = Math.max(0, actor.moral - moralDecrease);
                            actor.skill = Math.min(100, Math.min(actor.potential, actor.skill + skillGain));
                            actor.unavailableForProjectsUntil = undefined;
                            updatedActors[actorIndex] = actor;
                        }
                    }

                    const randomFactor = Math.min(Math.random(), Math.random());
                    const quality = 50 + Math.floor(randomFactor * 51);

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

                    const availableDirectors = updatedDirectors.filter(d => !d.unavailableForProjectsUntil || newDate > new Date(d.unavailableForProjectsUntil));
                    if (availableDirectors.length > 0) {
                        const randomDirector = pickRandom(availableDirectors);
                        directorId = randomDirector.id;
                        
                        const directorIndexToUpdate = updatedDirectors.findIndex(d => d.id === directorId);
                        if (directorIndexToUpdate !== -1) {
                            updatedDirectors[directorIndexToUpdate].unavailableForProjectsUntil = prodEndDate;
                        }
                    }

                    const availableActors = updatedActors.filter(a => !a.unavailableForProjectsUntil || newDate > new Date(a.unavailableForProjectsUntil));
                    if (availableActors.length > 0) {
                        const randomActor = pickRandom(availableActors);
                        actorId = randomActor.id;

                        const actorIndexToUpdate = updatedActors.findIndex(a => a.id === actorId);
                        if (actorIndexToUpdate !== -1) {
                            updatedActors[actorIndexToUpdate].unavailableForProjectsUntil = prodEndDate;
                        }
                    }
                    
                    // Competitors favor trending genres slightly more
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
            
            if (newDate.getDay() === 4) { 
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
