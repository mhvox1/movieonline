import { MovieSize } from '../types';
// =================================================================================================
// ## KONFIGURATION & KONSTANTEN
// =================================================================================================
/**
 * Konfiguration der Obergrenzen (Caps) für Qualität und Hype je nach Filmgröße.
 *
 * Logik:
 * - Quality Cap: Der Qualitätswert, ab dem der maximale Qualitäts-Bonus (100%) erreicht ist.
 * - Hype Cap: Der Hype-Wert, ab dem der maximale Hype-Bonus (25%) erreicht ist.
 */
const OFFER_CAPS = {
    [MovieSize.B]: { qualityCap: 30, hypeCap: 30 },
    [MovieSize.BPlus]: { qualityCap: 40, hypeCap: 40 },
    [MovieSize.A]: { qualityCap: 60, hypeCap: 60 },
    [MovieSize.AA]: { qualityCap: 80, hypeCap: 80 },
    [MovieSize.AAA]: { qualityCap: 100, hypeCap: 100 },
};
// =================================================================================================
// ## HILFSFUNKTIONEN
// =================================================================================================
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
/**
 * Berechnet die gesamten Produktionskosten eines Films.
 */
const calculateTotalProductionCost = (film) => {
    if (film.totalCost && film.totalCost > 0)
        return film.totalCost;
    const script = film.scriptBudget || 0;
    const size = film.movieSizeBudget || 0;
    const seriesPlanning = film.seriesPlanningCost || 0;
    const casting = film.castingCost || 0;
    const gages = (film.directorGage || 0) + (film.mainActorGage || 0) + (film.supportingActorGage || 0);
    const prod = film.productionCost || 0;
    const post = film.postProductionCost || 0;
    const weekly = film.accumulatedWeeklyCosts || 0;
    return script + size + seriesPlanning + casting + gages + prod + post + weekly;
};
// =================================================================================================
// ## HAUPTFUNKTIONEN: ANGEBOTS-GENERATOR
// =================================================================================================
/**
 * Generiert realistische Angebote basierend auf Produktionskosten und Filmleistung.
 */
export const generateLifecycleOffers = (film, allDistributors, playerData, numberToGenerate) => {
    const offers = [];
    const shuffledDistributors = shuffleArray(allDistributors);
    const numOffers = numberToGenerate !== undefined ? numberToGenerate : 3 + Math.floor(Math.random() * 3);
    // ---------------------------------------------------------------------------------------------
    // SCHRITT 0: DATEN VORBEREITEN
    // ---------------------------------------------------------------------------------------------
    const productionCost = calculateTotalProductionCost(film);
    const quality = film.finalQuality || 0;
    const hype = film.hype || 0;
    const movieSize = film.movieSize || MovieSize.B;
    const isSeries = film.projectType === 'series' || (!!film.seriesName && !!film.episodeCount);
    // Safety check: Ensure caps exist for the movie size, otherwise fallback to B-Movie
    const caps = OFFER_CAPS[movieSize] || OFFER_CAPS[MovieSize.B];
    // ---------------------------------------------------------------------------------------------
    // SCHRITT 1: BASISWERT (DAS SICHERHEITSNETZ)
    // ---------------------------------------------------------------------------------------------
    const baseValue = productionCost * 0.75;
    // ---------------------------------------------------------------------------------------------
    // SCHRITT 2: QUALITÄTS-BONUS (DER FILMGRÖßEN-FAKTOR)
    // ---------------------------------------------------------------------------------------------
    // Für die Berechnung des Geldes nutzen wir weiterhin das Verhältnis zum Cap, 
    // damit auch B-Movies profitabel sein können, wenn sie "für ihre Klasse" gut sind.
    const qualityRatio = Math.min(1.0, quality / caps.qualityCap);
    const qualityFactor = 1.0 + qualityRatio;
    let valueAfterQuality = baseValue * qualityFactor;
    // ---------------------------------------------------------------------------------------------
    // SCHRITT 3: HYPE-BONUS (MARKETING & RUF)
    // ---------------------------------------------------------------------------------------------
    const hypeRatio = Math.min(1.0, hype / caps.hypeCap);
    const hypeFactor = 1.0 + (hypeRatio * 0.25);
    let valueAfterHype = valueAfterQuality * hypeFactor;
    // ---------------------------------------------------------------------------------------------
    // SCHRITT 4: GENRE-TREND (DER MARKT)
    // ---------------------------------------------------------------------------------------------
    let trendFactor = 1.0;
    if (playerData.genreTrends && playerData.genreTrends[film.genre]) {
        trendFactor = playerData.genreTrends[film.genre].popularity;
        trendFactor = Math.max(0.5, Math.min(1.5, trendFactor));
    }
    const calculatedTargetValue = valueAfterHype * trendFactor;
    // ---------------------------------------------------------------------------------------------
    // SCHRITT 5: STRATEGIE-AUSWAHL & DISTRIBUTOREN
    // ---------------------------------------------------------------------------------------------
    for (let i = 0; i < numOffers; i++) {
        const distributor = shuffledDistributors[i];
        if (!distributor)
            continue;
        const variance = 0.90 + (Math.random() * 0.20);
        let finalOfferValue = calculatedTargetValue * variance;
        finalOfferValue = Math.max(5000, finalOfferValue);
        let strategyType;
        // --- NEUE LOGIK: Absolute Qualitätsschwellen ---
        // 0-29: Free TV
        // 30-39: Pay TV
        // 40-59: Home Entertainment
        // 60+: Kino
        if (isSeries) {
            // TV series only receive TV offers. Their valuation still uses the same
            // quality-to-cost factor as movie home-entertainment offers.
            strategyType = quality >= 40 ? 'tv_premiere' : 'free_tv_dump';
        }
        else if (quality >= 60) {
            strategyType = 'cinema_release';
        }
        else if (quality >= 40) {
            strategyType = 'direct_to_video';
        }
        else if (quality >= 30) {
            strategyType = 'tv_premiere';
        }
        else {
            strategyType = 'free_tv_dump';
        }
        // --- Ratenzahlung & Laufzeit ---
        const installmentMonths = 3 + Math.floor(Math.random() * 4);
        let upfrontRatio = 0.5;
        if (distributor.tier >= 4)
            upfrontRatio = 0.6;
        if (distributor.tier <= 2)
            upfrontRatio = 0.4;
        const upfrontPayment = Math.round((finalOfferValue * upfrontRatio) / 100) * 100;
        const remainder = finalOfferValue - upfrontPayment;
        const monthlyPayment = Math.round((remainder / installmentMonths) / 10) * 10;
        const actualTotal = upfrontPayment + (monthlyPayment * installmentMonths);
        // --- Gewinnbeteiligung (Revenue Share) ---
        // VORGABE: Immer zwischen 15% und 25%, egal welche Strategie.
        let calculatedShare = 0.15; // Basis 15%
        // Qualitäts-Bonus: Bis zu +5% für gute Filme
        if (qualityRatio >= 0.8)
            calculatedShare += 0.02;
        if (qualityRatio >= 1.0)
            calculatedShare += 0.03;
        // Indie-Bonus: Kleine Verleiher geben +5%, um attraktiv zu sein
        if (distributor.tier <= 2)
            calculatedShare += 0.05;
        // Begrenzung auf exakt 15% bis 25%
        const revenueShare = Math.max(0.15, Math.min(0.25, calculatedShare));
        // Phasen-Dauern (Simulation)
        let cinemaMonths = 0, homeVideoMonths = 0, payTvMonths = 0, freeTvMonths = 0;
        const randomFreeTvMonths = 3 + Math.floor(Math.random() * 4);
        // UPDATED DURATION LOGIC: Shorter Phases for better Pacing
        if (strategyType === 'cinema_release') {
            cinemaMonths = 3 + Math.floor(Math.random() * 3);
            homeVideoMonths = 3; // Reduced from 6 to 3
            payTvMonths = 3; // Reduced from 6 to 3
            freeTvMonths = randomFreeTvMonths;
        }
        else if (strategyType === 'direct_to_video') {
            homeVideoMonths = 4; // Reduced from 6 to 4 (Start Phase)
            payTvMonths = 3;
            freeTvMonths = randomFreeTvMonths;
        }
        else if (strategyType === 'tv_premiere') {
            payTvMonths = 4; // Start Phase
            freeTvMonths = randomFreeTvMonths;
        }
        else {
            // Free TV Dump
            freeTvMonths = randomFreeTvMonths;
        }
        const nextInteraction = new Date(playerData.gameDate);
        nextInteraction.setDate(nextInteraction.getDate() + (10 + Math.floor(Math.random() * 6)));
        offers.push({
            distributor,
            durationMonths: installmentMonths,
            upfrontPayment,
            monthlyPayment,
            revenueShare,
            phases: { cinemaMonths, homeVideoMonths, payTvMonths, freeTvMonths },
            strategyType,
            totalValueEstimate: actualTotal,
            dateCreated: new Date(playerData.gameDate),
            lastInteractionDate: new Date(playerData.gameDate),
            followUpCount: 0,
            nextInteractionDate: nextInteraction,
            status: 'active'
        });
    }
    return offers.sort((a, b) => b.totalValueEstimate - a.totalValueEstimate);
};
// Legacy Exports
export const generateCinemaDistributionOffers = () => [];
export const generateHomeEntertainmentOffers = () => [];
export const generatePayTvOffers = () => [];
export const generateFreeTvOffers = () => [];
