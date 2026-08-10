
import { Genre } from '../types';

export const getCoverPath = (genre: Genre, id: number): string => {
  return `./poster/${genre}/${id}.png`;
};

// Assuming there are at least 30 posters per genre available
export const MAX_POSTER_ID_POOL = 30;
export const WEEKLY_SELECTION_SIZE = 10;

const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const getRandomCoverIds = (amount: number = WEEKLY_SELECTION_SIZE): number[] => {
    const allIds = Array.from({ length: MAX_POSTER_ID_POOL }, (_, i) => i + 1);
    return shuffleArray(allIds).slice(0, amount);
};

export const generateWeeklyPosters = (): Record<Genre, number[]> => {
    const result: Partial<Record<Genre, number[]>> = {};
    
    Object.values(Genre).forEach(genre => {
        result[genre] = getRandomCoverIds(WEEKLY_SELECTION_SIZE);
    });

    return result as Record<Genre, number[]>;
};
