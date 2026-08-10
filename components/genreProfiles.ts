
import { Genre } from '../types';

export interface GenreProfile {
    action: number;
    humor: number;
    romance: number;
    dialogues: number;
    violence: number;
    costumes: number;
    makeup: number;
    stunts: number;
}

// Gewichtung: Wie wichtig ist Technik (Kamera, SFX, Licht) vs. Kunst (Schauspiel, Regie)?
// Summe sollte idealerweise 1.0 ergeben, wird aber im Calculator normalisiert.
export const GENRE_WEIGHTS: Record<Genre, { tech: number, art: number }> = {
    [Genre.Action]:         { tech: 0.7, art: 0.3 }, // Effekte sind alles
    [Genre.Adventure]:      { tech: 0.6, art: 0.4 },
    [Genre.SciFi]:          { tech: 0.7, art: 0.3 }, // Visuals sind King
    [Genre.Fantasy]:        { tech: 0.6, art: 0.4 },
    [Genre.War]:            { tech: 0.6, art: 0.4 },
    [Genre.Horror]:         { tech: 0.5, art: 0.5 }, // Stimmung (Licht/Ton) vs Schauspiel
    [Genre.Thriller]:       { tech: 0.4, art: 0.6 },
    [Genre.Western]:        { tech: 0.5, art: 0.5 },
    [Genre.Crime]:          { tech: 0.3, art: 0.7 },
    [Genre.Comedy]:         { tech: 0.1, art: 0.9 }, // Timing ist alles, Kamera egal
    [Genre.Drama]:          { tech: 0.2, art: 0.8 }, // Schauspiel ist alles
    [Genre.Romance]:        { tech: 0.2, art: 0.8 },
    [Genre.Musical]:        { tech: 0.5, art: 0.5 }, // Ton ist Technik
    [Genre.Dokumentation]:  { tech: 0.2, art: 0.8 },
};

export const GENRE_IDEAL_PROFILES: Record<Genre, GenreProfile> = {
    [Genre.Action]:         { action: 10, humor: 3, romance: 2, dialogues: 4, violence: 8, costumes: 5, makeup: 4, stunts: 9 },
    [Genre.Adventure]:      { action: 7, humor: 5, romance: 4, dialogues: 5, violence: 4, costumes: 8, makeup: 6, stunts: 6 },
    [Genre.Comedy]:         { action: 2, humor: 9, romance: 5, dialogues: 8, violence: 1, costumes: 6, makeup: 5, stunts: 3 },
    [Genre.Crime]:          { action: 5, humor: 2, romance: 3, dialogues: 9, violence: 6, costumes: 6, makeup: 4, stunts: 4 },
    [Genre.Dokumentation]:  { action: 1, humor: 3, romance: 1, dialogues: 9, violence: 2, costumes: 4, makeup: 3, stunts: 1 },
    [Genre.Drama]:          { action: 2, humor: 3, romance: 6, dialogues: 9, violence: 3, costumes: 7, makeup: 6, stunts: 1 },
    [Genre.Fantasy]:        { action: 7, humor: 4, romance: 5, dialogues: 6, violence: 5, costumes: 9, makeup: 9, stunts: 5 },
    [Genre.Horror]:         { action: 3, humor: 1, romance: 1, dialogues: 5, violence: 8, costumes: 4, makeup: 9, stunts: 4 },
    [Genre.Musical]:        { action: 2, humor: 5, romance: 8, dialogues: 7, violence: 1, costumes: 9, makeup: 8, stunts: 3 },
    [Genre.Romance]:        { action: 1, humor: 5, romance: 10, dialogues: 8, violence: 1, costumes: 7, makeup: 7, stunts: 2 },
    [Genre.SciFi]:          { action: 7, humor: 3, romance: 3, dialogues: 7, violence: 5, costumes: 8, makeup: 8, stunts: 6 },
    [Genre.Thriller]:       { action: 6, humor: 1, romance: 2, dialogues: 8, violence: 7, costumes: 5, makeup: 5, stunts: 7 },
    [Genre.War]:            { action: 8, humor: 1, romance: 2, dialogues: 6, violence: 9, costumes: 8, makeup: 6, stunts: 7 },
    [Genre.Western]:        { action: 7, humor: 2, romance: 3, dialogues: 7, violence: 6, costumes: 8, makeup: 4, stunts: 8 },
};
