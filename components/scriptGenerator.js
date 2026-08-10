import { Genre, ActorAge } from '../types';
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickRandomIndex = (arr) => Math.floor(Math.random() * arr.length);
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const replacePlaceholders = (template, a, n, c) => {
    return template.replace('{a}', a).replace('{n}', n).replace('{c}', c);
};
// FIX: The function is updated to accept both Script and ProjectData types to resolve casting errors in other components.
export const getTranslatedScriptTitle = (source, t) => {
    if (source.titleStructure) {
        const { templateIndex, adjectiveIndex, nounIndex, conceptIndex } = source.titleStructure;
        const template = t.scriptGen.templates[templateIndex] || t.scriptGen.templates[0];
        const adjective = t.scriptGen.adjectives[adjectiveIndex] || t.scriptGen.adjectives[0];
        const noun = t.scriptGen.nouns[nounIndex] || t.scriptGen.nouns[0];
        const concept = t.scriptGen.concepts[conceptIndex] || t.scriptGen.concepts[0];
        return replacePlaceholders(template, adjective, noun, concept);
    }
    // Check for title properties in order of preference
    if ('workingTitle' in source && source.workingTitle) { // ProjectData
        return source.workingTitle;
    }
    if ('title' in source) { // Script
        return source.title;
    }
    if ('scriptTitle' in source && source.scriptTitle) { // ProjectData fallback
        return source.scriptTitle;
    }
    return "Unbenanntes Projekt"; // Final fallback
};
export const getTranslatedScriptDescription = (source, t) => {
    // Use unified property access or type guards.
    // Both Script and ProjectData now have sourcePlotIndex (added to ProjectData in update)
    const sourcePlotIndex = 'sourcePlotIndex' in source ? source.sourcePlotIndex : undefined;
    const genre = source.genre;
    const description = 'description' in source ? source.description : source.scriptDescription;
    if (sourcePlotIndex !== undefined && sourcePlotIndex > -1) {
        const genrePlots = t.scriptGen.plots[genre];
        if (genrePlots && genrePlots[sourcePlotIndex]) {
            return genrePlots[sourcePlotIndex].text;
        }
    }
    return description || "Keine Beschreibung verfügbar."; // Fallback
};
const generateScriptDetails = (genre, t) => {
    const genreData = t.scriptGen.plots[genre] || t.scriptGen.plots['Drama'];
    // Safety check if plot data exists for genre, otherwise fallback
    if (!genreData || genreData.length === 0) {
        return {
            text: "Ein interessantes Drehbuch über das Leben.",
            mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
            index: -1
        };
    }
    const index = Math.floor(Math.random() * genreData.length);
    const detail = genreData[index];
    return { ...detail, index };
};
// Used for initial generation AND weekly refresh
export const generateScriptMarket = (playerReputation, genreTrends, t) => {
    const scripts = [];
    const usedTitles = new Set();
    // Iterate through all genres to ensure variety
    const allGenres = Object.values(Genre);
    allGenres.forEach(genre => {
        // Generate 1 to 2 scripts per genre
        const count = randomBetween(1, 2);
        for (let i = 0; i < count; i++) {
            let title;
            let attempts = 0;
            let titleStructure;
            do {
                // Pick indices instead of strings directly
                const templateIndex = pickRandomIndex(t.scriptGen.templates);
                const adjectiveIndex = pickRandomIndex(t.scriptGen.adjectives);
                const nounIndex = pickRandomIndex(t.scriptGen.nouns);
                const conceptIndex = pickRandomIndex(t.scriptGen.concepts);
                titleStructure = { templateIndex, adjectiveIndex, nounIndex, conceptIndex };
                // Generate temporary title string to check uniqueness
                const template = t.scriptGen.templates[templateIndex];
                const adjective = t.scriptGen.adjectives[adjectiveIndex];
                const noun = t.scriptGen.nouns[nounIndex];
                const concept = t.scriptGen.concepts[conceptIndex];
                title = replacePlaceholders(template, adjective, noun, concept);
                attempts++;
            } while (usedTitles.has(title) && attempts < 20);
            usedTitles.add(title);
            // Quality based on player reputation
            // Range: [Reputation - 20] to [Reputation + 12]
            // Clamped between 1 and 100
            const minQuality = Math.max(1, playerReputation - 10);
            const maxQuality = Math.min(100, playerReputation + 12);
            const quality = randomBetween(minQuality, maxQuality);
            // Price based on quality, with some randomness
            let basePrice = 5000 + (quality * quality * 25) * (0.8 + Math.random() * 0.4);
            // --- TREND EINFLUSS ---
            if (genreTrends) {
                // Popularity: 0.5 to 1.5
                const trendFactor = genreTrends[genre]?.popularity || 1.0;
                basePrice *= trendFactor;
            }
            // ---------------------
            const { text, mainRole, supportingRole, index } = generateScriptDetails(genre, t);
            scripts.push({
                id: `market_${Date.now()}_${genre}_${i}`,
                title,
                genre,
                quality,
                description: text,
                price: Math.round(basePrice / 1000) * 1000, // Round to nearest 1000
                mainRole: mainRole,
                supportingRole: supportingRole,
                sourcePlotIndex: index,
                titleStructure,
            });
        }
    });
    // Shuffle the final list so genres are mixed in the UI
    return scripts.sort(() => Math.random() - 0.5);
};
