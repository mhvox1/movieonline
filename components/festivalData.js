import { MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES } from './nameData';
export const MOVIE_AWARD_NAME = "Movie Award";
/**
 * Calculates the date of the Movie Award (2nd Saturday in January) for a given year.
 */
export const getMovieAwardDate = (year) => {
    const d = new Date(year, 0, 1); // Jan 1st
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Calculate offset to first Saturday
    // If Jan 1 is Saturday (6), offset is 0. 
    // If Jan 1 is Friday (5), offset is 1.
    // If Jan 1 is Sunday (0), offset is 6.
    const offsetToFirstSaturday = (6 - day + 7) % 7;
    // 2nd Saturday is 7 days after the first Saturday
    const dayOfMonth = 1 + offsetToFirstSaturday + 7;
    return new Date(year, 0, dayOfMonth);
};
export const ALL_FESTIVALS = [
// Static festivals can be defined here if needed for blocking dates
];
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomName = () => {
    const isMale = Math.random() < 0.5;
    const firstName = isMale ? pickRandom(MALE_FIRST_NAMES) : pickRandom(FEMALE_FIRST_NAMES);
    const lastName = pickRandom(LAST_NAMES);
    return `${firstName} ${lastName}`;
};
// Fest definierte Historie für die letzten 10 Jahre vor Spielstart (1990)
const FIXED_AWARDS_HISTORY = [
    { title: "Echoes of Silence", director: "Adrian Chase", actor: "Julian Thorne" }, // 1989
    { title: "The Crimson Pact", director: "Marco Rossini", actor: "Victor Krum" }, // 1988
    { title: "Neon Tokyo", director: "Kenji Sato", actor: "Ryu Hayabusa" }, // 1987
    { title: "Desert Storm", director: "Jack Hammer", actor: "Bruce Steel" }, // 1986
    { title: "Parisian Nights", director: "Jean-Luc Pierre", actor: "Alain Dubois" }, // 1985
    { title: "The Haunted Manor", director: "Alfred King", actor: "Vincent Shade" }, // 1984
    { title: "Space Odyssey: Zero", director: "Stanley K.", actor: "Dave Bowman" }, // 1983
    { title: "Jungle Fever", director: "Henry Jones", actor: "Harrison Field" }, // 1982
    { title: "The Godfather's Legacy", director: "Francis C.", actor: "Al Pacino" }, // 1981
    { title: "Apocalypse Dawn", director: "Oliver Stone", actor: "Marlon Brand" } // 1980
];
export const generateInitialMovieHistory = (startYear) => {
    const history = [];
    for (let i = 0; i < FIXED_AWARDS_HISTORY.length; i++) {
        const year = startYear - (i + 1);
        const data = FIXED_AWARDS_HISTORY[i];
        history.push({
            year: year,
            bestFilm: data.title,
            bestDirector: data.director,
            bestActor: data.actor
        });
    }
    return history;
};
