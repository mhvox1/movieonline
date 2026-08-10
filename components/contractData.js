import { Genre } from '../types';
import { generateCompetitorFilmTitle } from './competitorData';
export const TV_STATIONS = [
    "Prime Global Network", "Channel One US", "Galaxy Broadcasting", "Starstream TV", "United Media",
    "Atlantic News", "Pacific Entertainment", "Global Vision", "Network 24", "Crime & Investigation Network",
    "Romance Channel", "SciFi Central", "Kids United", "DocuWorld", "Music Box International",
    "Sports Unlimited", "Retro Classics", "Cinema Max", "Gold Series Network", "Heartland TV",
    "News Plus", "Culture Arts Channel", "Night Owl TV", "Sunny Side Up", "Prime Time Entertainment"
];
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Fisher-Yates Shuffle für Arrays
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
export const generateContractOffers = (count, currentReputation = 0) => {
    const offers = [];
    const usedStationNames = new Set();
    const usedTitles = new Set(); // Keep local uniqueness for this batch
    // Random count between 3 and 10 if not specified
    const numOffers = count !== undefined ? count : randomBetween(3, 10);
    // Erstelle ein "Deck" aus Genres, um Wiederholungen innerhalb einer Generierung zu vermeiden
    let genreDeck = shuffleArray(Object.values(Genre));
    for (let i = 0; i < numOffers; i++) {
        let stationName;
        let stationAttempts = 0;
        do {
            stationName = pickRandom(TV_STATIONS);
            stationAttempts++;
        } while (usedStationNames.has(stationName) && stationAttempts < 50);
        usedStationNames.add(stationName);
        let title;
        let titleAttempts = 0;
        do {
            // Übergebe das lokale Set, um Duplikate im selben Batch zu verhindern
            title = generateCompetitorFilmTitle(usedTitles);
            titleAttempts++;
        } while (usedTitles.has(title) && titleAttempts < 50);
        usedTitles.add(title);
        // Genre aus dem Deck ziehen
        if (genreDeck.length === 0) {
            // Wenn leer, neu mischen (falls wir mehr Aufträge als Genres haben)
            genreDeck = shuffleArray(Object.values(Genre));
        }
        const genre = genreDeck.pop();
        let minQuality;
        // GARANTIE: Der erste Auftrag ist immer "sicher" (mindestens 5 unter Ruf)
        if (i === 0) {
            // Ziel: Zwischen 5 und 15 Punkte unter dem Ruf
            const safeUpper = Math.max(1, currentReputation - 5);
            const safeLower = Math.max(1, currentReputation - 15);
            minQuality = randomBetween(safeLower, safeUpper);
        }
        else {
            // Standard Logik für restliche Aufträge (+- 25)
            const lowerBound = Math.max(1, currentReputation - 25);
            const upperBound = Math.min(100, currentReputation + 25);
            minQuality = randomBetween(lowerBound, upperBound);
        }
        // Calculate Upfront Payment based on Tier (1-10, 11-20, etc.)
        // Logic: 250,000 per started 10 quality points
        // 1-10: 1 * 250k
        // 11-20: 2 * 250k
        const tier = Math.ceil(minQuality / 10);
        const upfrontPayment = tier * 250000;
        // Calculate Payout based on Logic:
        // Base 50k. +5k for every point minQuality is ABOVE currentReputation.
        // Bei sicheren Aufträgen (unter Ruf) gibt es keinen Bonus, nur Base.
        const basePayout = 50000;
        const qualityDiff = Math.max(0, minQuality - currentReputation);
        const qualityBonus = qualityDiff * 5000;
        let rawPayout = basePayout + qualityBonus;
        // Add randomness (+/- 10%)
        const variance = 0.90 + (Math.random() * 0.20);
        const payout = Math.round((rawPayout * variance) / 100) * 100; // Round to hundreds
        // Calculate Penalty (50% - 93% of Payout)
        const penaltyFactor = 0.50 + Math.random() * 0.43; // 0.50 to 0.93
        const penalty = Math.round((payout * penaltyFactor) / 100) * 100;
        // Generate Duration (9 to 12 months)
        const maxDurationMonths = randomBetween(9, 12);
        offers.push({
            id: `contract_${Date.now()}_${i}`,
            stationName,
            title,
            genre,
            minQuality,
            payout,
            penalty,
            upfrontPayment,
            maxDurationMonths,
            // description is handled dynamically in the UI component for translation
        });
    }
    return offers;
};
