import { CompetitorStudio, CompetitorFilm, Director, Actor, Genre } from '../types';
import { COMPETITOR_STUDIO_NAMES, generateCompetitorFilmTitle } from './competitorData';

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateInitialCompetitors = (gameStartDate: Date, allDirectors: Director[], allActors: Actor[]): CompetitorStudio[] => {
    const usedFilmTitles = new Set<string>();
    
    const getRandomTitle = (): string => {
        let title;
        do {
            title = generateCompetitorFilmTitle(usedFilmTitles);
        } while (usedFilmTitles.has(title));
        usedFilmTitles.add(title);
        return title;
    };

    const competitors: CompetitorStudio[] = [];
    const availableDirectors = [...allDirectors];
    const availableActors = [...allActors];

    for (let i = 0; i < COMPETITOR_STUDIO_NAMES.length; i++) {
        const studioName = COMPETITOR_STUDIO_NAMES[i];
        const completedFilms: CompetitorFilm[] = [];

        // Generate 2 initial films for each studio
        for (let j = 0; j < 2; j++) {
            const quality = 40 + Math.floor(Math.random() * 41);
            const weeksInCharts = 4 + Math.floor(Math.random() * 8);
            const releaseDate = new Date(gameStartDate);
            releaseDate.setDate(gameStartDate.getDate() - (weeksInCharts * 7));

            let totalViewers = 0;
            let currentChartQuality = quality;
            let finalWeekViewers = 0;

            for (let k = 0; k < weeksInCharts; k++) {
                const baseViewers = Math.pow(Math.max(0, currentChartQuality - 10) / 20, 1.1) * 250000;
                const randomizer = 0.925 + Math.random() * 0.15; // +-7.5%
                const viewersThisWeek = Math.floor(Math.max(0, baseViewers) * randomizer);
                
                totalViewers += viewersThisWeek;
                finalWeekViewers = viewersThisWeek;

                const decay = 1 - (0.05 + Math.random() * 0.07);
                currentChartQuality *= decay;
            }

            completedFilms.push({
                title: getRandomTitle(),
                studioName: studioName,
                quality: quality,
                chartQuality: currentChartQuality,
                viewers: finalWeekViewers,
                totalViewers: totalViewers,
                releaseDate: releaseDate,
                weeksInCharts: weeksInCharts,
                directorId: availableDirectors[Math.floor(Math.random() * availableDirectors.length)].id,
                actorId: availableActors[Math.floor(Math.random() * availableActors.length)].id,
                genre: pickRandom(Object.values(Genre)),
            });
        }
        
        const firstProductionEndDate = new Date(gameStartDate);
        firstProductionEndDate.setDate(firstProductionEndDate.getDate() + (15 + Math.floor(Math.random() * 30)));

        const hiredDirectorIndex = availableDirectors.findIndex(d => !d.unavailableForProjectsUntil);
        const hiredActorIndex = availableActors.findIndex(a => !a.unavailableForProjectsUntil);

        let directorId: number | undefined;
        let actorId: number | undefined;

        if (hiredDirectorIndex !== -1) {
            directorId = availableDirectors[hiredDirectorIndex].id;
            availableDirectors[hiredDirectorIndex].unavailableForProjectsUntil = firstProductionEndDate;
        }
        if (hiredActorIndex !== -1) {
            actorId = availableActors[hiredActorIndex].id;
            availableActors[hiredActorIndex].unavailableForProjectsUntil = firstProductionEndDate;
        }

        competitors.push({
            id: i + 1,
            name: studioName,
            completedFilms: completedFilms,
            currentActivity: {
                type: 'producing',
                filmTitle: getRandomTitle(),
                endDate: firstProductionEndDate,
                directorId: directorId,
                actorId: actorId,
                genre: pickRandom(Object.values(Genre)),
            },
        });
    }

    return competitors;
};