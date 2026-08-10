import { Genre } from '../types';
export const getCoverPath = (genre, id) => {
    return `./poster/${genre}/${id}.png`;
};
// Assuming there are at least 30 posters per genre available
export const MAX_POSTER_ID_POOL = 30;
export const WEEKLY_SELECTION_SIZE = 10;
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
export const getRandomCoverIds = (amount = WEEKLY_SELECTION_SIZE) => {
    const allIds = Array.from({ length: MAX_POSTER_ID_POOL }, (_, i) => i + 1);
    return shuffleArray(allIds).slice(0, amount);
};
export const generateWeeklyPosters = () => {
    const result = {};
    Object.values(Genre).forEach(genre => {
        result[genre] = getRandomCoverIds(WEEKLY_SELECTION_SIZE);
    });
    return result;
};
