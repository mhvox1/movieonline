
import { ProjectData, PlayerData, Genre, QualityBreakdown, Director, Actor, MovieSize, EmployeeType, ActorAge } from '../types';
import { GENRE_IDEAL_PROFILES, GENRE_WEIGHTS } from './genreProfiles';
import { MOVIE_SIZE_CONFIG, GENRE_IDEAL_AGE_RATING } from './constants';
import { getStudioQualityBonuses } from './studioBuildingEffects';

const getActorAgeCategory = (birthDate: Date, gameDate: Date): ActorAge => {
    const birth = new Date(birthDate);
    const game = new Date(gameDate);
    let age = game.getFullYear() - birth.getFullYear();
    const m = game.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && game.getDate() < birth.getDate())) {
        age--;
    }

    if (age <= 16) return ActorAge.Child;
    if (age <= 30) return ActorAge.Young;
    if (age <= 55) return ActorAge.MiddleAged;
    return ActorAge.Old;
};


export function calculateFinalQuality(project: ProjectData, playerData: PlayerData): { finalQuality: number; breakdown: QualityBreakdown } {
    const log: string[] = [];
    log.push("=== CONTAINER + RESCUE MODEL CALCULATION ===");

    // 1. DAS POTENZIAL (Der fixe Rahmen)
    // Wenn projectPotential nicht gesetzt ist (Legacy), berechnen wir es hier nach
    let projectPotential = project.projectPotential;
    
    if (projectPotential === undefined) {
        log.push("WARNUNG: Projektpotenzial fehlte, wird nachberechnet.");
        // Fallback-Berechnung: Min(Script, Cap) + Boni
        const baseQuality = project.scriptQuality;
        const movieSizeConfig = project.movieSize ? MOVIE_SIZE_CONFIG[project.movieSize] : null;
        const qualityCap = movieSizeConfig ? movieSizeConfig.qualityCap : 100;
        
        // Planning Bonus
        const planner = playerData.employees.find(e => e.id === project.plannerId && e.type === EmployeeType.ProjektPlaner);
        const plannerBonus = planner ? planner.talent / 10 : 0;
        
        // Budget Bonus
        const budgetStepIndex = movieSizeConfig ? movieSizeConfig.budgetSteps.indexOf(project.movieSizeBudget || 0) : -1;
        let budgetBonus = 0;
        if (movieSizeConfig && budgetStepIndex !== -1 && movieSizeConfig.budgetQualityBonuses) {
             budgetBonus = movieSizeConfig.budgetQualityBonuses[budgetStepIndex] || 0;
        }

        const zufallsBonus = 1 + Math.random() * 4;

        // Container Logic: Base is capped by Movie Size
        const baseContainer = Math.min(baseQuality, qualityCap);
        
        projectPotential = baseContainer + plannerBonus + budgetBonus + zufallsBonus;

        // AGE RATING BONUS (Potential Boost)
        if (project.ageRating && GENRE_IDEAL_AGE_RATING[project.genre] === project.ageRating) {
            const potBonus = 2 + Math.floor(Math.random() * 3); // 2-4 points
            projectPotential += potBonus;
            log.push(`Zielgruppen-Bonus (Potenzial): +${potBonus}`);
        }
    }
    
    // Safety clamp (0-100)
    projectPotential = Math.max(1, Math.min(100, projectPotential));

    log.push(`Fixiertes Projekt-Potenzial: ${projectPotential.toFixed(2)}`);
    const breakdownPart1 = { base: project.scriptQuality, plannerBonus: 0, budgetBonus: 0, zufallsBonus: 0, total: projectPotential };


    // 2. DIE UMSETZUNG (Realization Score)
    // Wir starten theoretisch bei 100% des Potenzials und ziehen für Fehler ab.
    // Oder wir berechnen einen "Performance Score" (0-100) und mappen ihn auf das Potenzial.
    
    // A. Genre Gewichtung
    const genre = project.genre;
    const weights = GENRE_WEIGHTS[genre] || { tech: 0.5, art: 0.5 };
    log.push(`Genre: ${genre} (Tech: ${weights.tech * 100}%, Art: ${weights.art * 100}%)`);

    // B. Artistic Score (Regie & Cast)
    const director = project.directorId === -1 ? { id: -1, name: playerData.playerName, skill: playerData.filmSense, moral: 100, favoriteGenres: [], hatedGenre: '' as Genre, traits: [], birthDate: new Date(), gender: playerData.gender } as any : playerData.directors.find(d => d.id === project.directorId);
    const mainActor = project.mainActorId === -1 ? { id: -1, name: playerData.playerName, skill: playerData.charisma, moral: 100, favoriteGenres: [], hatedGenre: '' as Genre, traits: [], birthDate: new Date(), gender: playerData.gender } as any : playerData.actors.find(a => a.id === project.mainActorId);
    const supportingActor = project.supportingActorId === -1 ? { id: -1, name: playerData.playerName, skill: playerData.charisma, moral: 100, favoriteGenres: [], hatedGenre: '' as Genre, traits: [], birthDate: new Date(), gender: playerData.gender } as any : playerData.actors.find(a => a.id === project.supportingActorId);

    let artScoreTotal = 0;
    let artContributors = 0;

    // Helper for Art Calculation
    const calcTalentPerformance = (talent: Director | Actor | any, type: string) => {
        if (!talent) return 0;
        let score = talent.skill;
        
        // Moral influence (low moral reduces effective skill)
        const moralFactor = 0.8 + (talent.moral / 100) * 0.4; // 0.8 to 1.2
        score *= moralFactor;

        // Genre Match
        if (talent.favoriteGenres?.includes(genre)) score *= 1.1; // +10%
        if (talent.hatedGenre === genre) score *= 0.8; // -20%

        // Casting Fit (Only Actors)
        if (type !== 'director' && talent.id !== -1) {
             const roleReq = type === 'main' ? project.mainRole : project.supportingRole;
             if (roleReq) {
                const actorAgeCat = getActorAgeCategory(talent.birthDate, playerData.gameDate);
                if (talent.gender !== roleReq.gender || actorAgeCat !== roleReq.age) {
                    score *= 0.8; // -20% Mismatch Penalty
                    log.push(`Mismatch bei ${type}: -20% Performance`);
                }
             }
        }
        
        return Math.min(100, score);
    };

    if (director) { artScoreTotal += calcTalentPerformance(director, 'director'); artContributors++; }
    if (mainActor) { artScoreTotal += calcTalentPerformance(mainActor, 'main'); artContributors++; }
    if (supportingActor) { artScoreTotal += calcTalentPerformance(supportingActor, 'support'); artContributors++; }

    // Chemie Bonus (on top of Avg)
    let chemieBonus = 0;
    if (director && mainActor && director.id !== -1 && mainActor.id !== -1) {
        const ids = [director.id, mainActor.id].sort((a,b) => a-b);
        const chemie = playerData.talentChemie.find(c => c.talentA_id === ids[0] && c.talentB_id === ids[1]);
        if (chemie) chemieBonus += chemie.level;
    }
    // Main-Supporting Chemistry
    if (mainActor && supportingActor && mainActor.id !== -1 && supportingActor.id !== -1) {
        const ids = [mainActor.id, supportingActor.id].sort((a,b) => a-b);
        const chemie = playerData.talentChemie.find(c => c.talentA_id === ids[0] && c.talentB_id === ids[1]);
        if (chemie) chemieBonus += chemie.level;
    }

    const artBaseScore = artContributors > 0 ? (artScoreTotal / artContributors) : 0;
    const finalArtScore = Math.min(100, artBaseScore + chemieBonus);
    
    log.push(`Artistic Score: ${finalArtScore.toFixed(2)} (aus ${artContributors} Personen + ${chemieBonus} Chemie)`);


    // C. Technical Score (Equipment vs Expectation)
    // Expectation depends on Movie Size Cap.
    // B-Movie (Cap 30) -> Expects Level 1-2
    // AAA (Cap 100) -> Expects Level 5
    
    // Map Cap to Expected Level (1-5)
    // 30->1.5, 40->2.0, 60->3.0, 80->4.0, 100->5.0
    const movieSizeConfig = project.movieSize ? MOVIE_SIZE_CONFIG[project.movieSize] : MOVIE_SIZE_CONFIG[MovieSize.B];
    const cap = movieSizeConfig.qualityCap;
    const expectedTechLevel = cap / 20; 

    const techLevels = [
        project.kameraLevel || 1, 
        project.lichtLevel || 1, 
        project.tonLevel || 1, 
        project.ausstattungLevel || 1,
        project.sfxLevel || 1, 
        project.locationLevel || 1, 
        project.extrasLevel || 1 // Catering is purely moral/event prevention, excluded from tech score
    ];
    
    const avgTechLevel = techLevels.reduce((a,b) => a+b, 0) / techLevels.length;
    
    // Calculate Tech Score (0-100)
    // If Avg == Expected -> 90% (Good standard)
    // If Avg < Expected -> Penalty
    // If Avg > Expected -> Bonus (diminishing returns)
    
    let techScore = 0;
    const delta = avgTechLevel - expectedTechLevel;
    
    if (delta >= 0) {
        // Bonus: up to 100%
        techScore = 90 + (delta * 5); // Max +10 points for over-engineering
    } else {
        // Penalty: huge drop
        techScore = 90 + (delta * 20); // -1 level = -20 points -> 70
    }
    techScore = Math.max(10, Math.min(100, techScore));
    
    log.push(`Technical Score: ${techScore.toFixed(2)} (Avg Level: ${avgTechLevel.toFixed(1)} vs Expected: ${expectedTechLevel.toFixed(1)})`);


    // D. Vision (Creative Focus)
    const idealProfile = GENRE_IDEAL_PROFILES[genre];
    let totalDeviation = 0;
    if (idealProfile) {
        Object.keys(idealProfile).forEach(key => {
            const k = key as keyof typeof idealProfile;
            const projectKey = `focus${k.charAt(0).toUpperCase() + k.slice(1)}` as keyof ProjectData;
            const pValue = (project[projectKey] as number) || 5;
            const iValue = idealProfile[k];
            totalDeviation += Math.abs(pValue - iValue);
        });
    }
    
    // Focus Multiplier (0.8 to 1.0)
    // Perfect focus preserves potential. Bad focus wastes it.
    let focusFactor = 1.0;
    if (totalDeviation > 5) focusFactor -= 0.05;
    if (totalDeviation > 15) focusFactor -= 0.05;
    if (totalDeviation > 30) focusFactor -= 0.10;
    
    log.push(`Focus Factor: ${focusFactor.toFixed(2)} (Deviation: ${totalDeviation})`);


    // 3. ZWISCHENERGEBNIS (Raw Realization)
    // Weighted Average of Art and Tech
    const realizationScore = (finalArtScore * weights.art) + (techScore * weights.tech);
    
    // Apply Focus Factor
    const effectiveRealization = realizationScore * focusFactor;
    
    log.push(`Realization Score: ${realizationScore.toFixed(2)} * ${focusFactor.toFixed(2)} = ${effectiveRealization.toFixed(2)}`);
    
    // Current Quality (Before Post-Prod)
    // Logic: Potential * (Realization / 100)
    let currentQuality = projectPotential * (effectiveRealization / 100);
    log.push(`Qualität nach Dreh: ${currentQuality.toFixed(2)}`);


    // 4. POST-PRODUKTION (Rescue & Polish)
    log.push('\n--- Post-Production ---');
    const postLevels = [project.editingLevel || 1, project.musicLevel || 1, project.soundLevel || 1];
    const avgPostLevel = postLevels.reduce((a,b) => a+b, 0) / postLevels.length;
    
    // Rescue Value: How many points can we recover if Execution was bad?
    // Max Rescue depends on Post Level.
    // Level 1: +1 point rescue max
    // Level 5: +10 points rescue max
    const maxRescue = (avgPostLevel - 1) * 2.5; 
    
    const potentialLost = projectPotential - currentQuality;
    let rescuedPoints = 0;
    
    if (potentialLost > 0) {
        // We can recover some lost potential
        rescuedPoints = Math.min(potentialLost, maxRescue);
        log.push(`Verlorenes Potenzial: ${potentialLost.toFixed(2)}. Gerettet durch Post-Prod: +${rescuedPoints.toFixed(2)}`);
    } else {
        // Polish Bonus: If we are already at/above potential (rare), add tiny bonus
        rescuedPoints = (avgPostLevel - 1) * 0.5; // Small polish
        log.push(`Polish Bonus: +${rescuedPoints.toFixed(2)}`);
    }
    
    currentQuality += rescuedPoints;
    
    // Ensure we stick to the cap logic (Hard Cap of Movie Size applies to the calculated quality BEFORE events)
    // Actually, ProjectPotential already respected the cap.
    // But perfect execution could theoretically slightly exceed it if we allowed > 100% realization.
    // We clamp it here to the Potential (plus maybe 1-2 points variance allowed).
    // The "Container" concept means: The script/budget set the ceiling.
    
    if (currentQuality > projectPotential + 2) {
        currentQuality = projectPotential + 2; // Small tolerance
        log.push("Qualität auf Potenzial-Limit gekappt.");
    }


    // 5. EVENTS & EXTRAS (Das Zünglein an der Waage)
    // Events addieren sich NACH dem Cap.
    log.push('\n--- Events & Boni ---');
    const eventModifier = project.productionQualityModifier || 0;
    log.push(`Produktions-Events: ${eventModifier > 0 ? '+' : ''}${eventModifier}`);
    
    let finalQuality = currentQuality + eventModifier;

    const studioBuildingBonuses = getStudioQualityBonuses(project, playerData);
    if (studioBuildingBonuses.totalBonus > 0) {
        finalQuality += studioBuildingBonuses.totalBonus;
        studioBuildingBonuses.logLines.forEach(line => log.push(line));
    }

    // AGE RATING FINAL BONUS
    // If age rating matches genre perfectly, add a small final boost (1-3)
    if (project.ageRating && GENRE_IDEAL_AGE_RATING[project.genre] === project.ageRating) {
        const qualityBonus = 1 + Math.floor(Math.random() * 3); // 1-3 points
        finalQuality += qualityBonus;
        log.push(`Zielgruppen-Bonus (Perfekte FSK): +${qualityBonus}`);
    }

    let difficultyQualityModifier = 0;
    if (playerData.gameDifficulty === 'leicht') {
        difficultyQualityModifier = 5;
    } else if (playerData.gameDifficulty === 'schwer') {
        difficultyQualityModifier = -5;
    }
    if (difficultyQualityModifier !== 0) {
        finalQuality += difficultyQualityModifier;
        log.push(`Schwierigkeits-Modifikator: ${difficultyQualityModifier > 0 ? '+' : ''}${difficultyQualityModifier}`);
    }
    
    // Final hard clamp 0-100 (Absolute game limits)
    finalQuality = Math.max(0, Math.min(100, finalQuality));
    
    log.push(`=== ENDERGEBNIS: ${Math.round(finalQuality)} ===`);

    const breakdown: QualityBreakdown = {
        projektPotenzial: breakdownPart1,
        talent: { director: 0, mainActor: 0, supportingActor: 0, chemie: 0, total: finalArtScore }, // Simplified for UI compatibility
        handwerk: techScore,
        visionMultiplier: focusFactor,
        events: eventModifier + difficultyQualityModifier + studioBuildingBonuses.totalBonus,
        finalRandom: 0,
        finalScore: Math.round(finalQuality),
        log: log
    };
    
    return { finalQuality: Math.round(finalQuality), breakdown };
}
