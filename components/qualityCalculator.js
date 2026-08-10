import { MovieSize, EmployeeType, ActorAge } from "../types";
import { GENRE_IDEAL_PROFILES, GENRE_WEIGHTS } from "./genreProfiles";
import { MOVIE_SIZE_CONFIG, GENRE_IDEAL_AGE_RATING } from "./constants";
import { getStudioQualityBonuses } from "./studioBuildingEffects";
const getActorAgeCategory = (birthDate, gameDate) => {
  const birth = new Date(birthDate);
  const game = new Date(gameDate);
  let age = game.getFullYear() - birth.getFullYear();
  const m = game.getMonth() - birth.getMonth();
  if (m < 0 || m === 0 && game.getDate() < birth.getDate()) {
    age--;
  }
  if (age <= 16) return ActorAge.Child;
  if (age <= 30) return ActorAge.Young;
  if (age <= 55) return ActorAge.MiddleAged;
  return ActorAge.Old;
};
function calculateFinalQuality(project, playerData) {
  const log = [];
  log.push("=== CONTAINER + RESCUE MODEL CALCULATION ===");
  let projectPotential = project.projectPotential;
  if (projectPotential === void 0) {
    log.push("WARNUNG: Projektpotenzial fehlte, wird nachberechnet.");
    const baseQuality = project.scriptQuality;
    const movieSizeConfig2 = project.movieSize ? MOVIE_SIZE_CONFIG[project.movieSize] : null;
    const qualityCap = movieSizeConfig2 ? movieSizeConfig2.qualityCap : 100;
    const planner = playerData.employees.find((e) => e.id === project.plannerId && e.type === EmployeeType.ProjektPlaner);
    const plannerBonus = planner ? planner.talent / 10 : 0;
    const budgetStepIndex = movieSizeConfig2 ? movieSizeConfig2.budgetSteps.indexOf(project.movieSizeBudget || 0) : -1;
    let budgetBonus = 0;
    if (movieSizeConfig2 && budgetStepIndex !== -1 && movieSizeConfig2.budgetQualityBonuses) {
      budgetBonus = movieSizeConfig2.budgetQualityBonuses[budgetStepIndex] || 0;
    }
    const zufallsBonus = 1 + Math.random() * 4;
    const baseContainer = Math.min(baseQuality, qualityCap);
    projectPotential = baseContainer + plannerBonus + budgetBonus + zufallsBonus;
    if (project.ageRating && GENRE_IDEAL_AGE_RATING[project.genre] === project.ageRating) {
      const potBonus = 2 + Math.floor(Math.random() * 3);
      projectPotential += potBonus;
      log.push(`Zielgruppen-Bonus (Potenzial): +${potBonus}`);
    }
  }
  projectPotential = Math.max(1, Math.min(100, projectPotential));
  log.push(`Fixiertes Projekt-Potenzial: ${projectPotential.toFixed(2)}`);
  const breakdownPart1 = { base: project.scriptQuality, plannerBonus: 0, budgetBonus: 0, zufallsBonus: 0, total: projectPotential };
  const genre = project.genre;
  const weights = GENRE_WEIGHTS[genre] || { tech: 0.5, art: 0.5 };
  log.push(`Genre: ${genre} (Tech: ${weights.tech * 100}%, Art: ${weights.art * 100}%)`);
  const director = project.directorId === -1 ? { id: -1, name: playerData.playerName, skill: playerData.filmSense, moral: 100, favoriteGenres: [], hatedGenre: "", traits: [], birthDate: /* @__PURE__ */ new Date(), gender: playerData.gender } : playerData.directors.find((d) => d.id === project.directorId);
  const mainActor = project.mainActorId === -1 ? { id: -1, name: playerData.playerName, skill: playerData.charisma, moral: 100, favoriteGenres: [], hatedGenre: "", traits: [], birthDate: /* @__PURE__ */ new Date(), gender: playerData.gender } : playerData.actors.find((a) => a.id === project.mainActorId);
  const supportingActor = project.supportingActorId === -1 ? { id: -1, name: playerData.playerName, skill: playerData.charisma, moral: 100, favoriteGenres: [], hatedGenre: "", traits: [], birthDate: /* @__PURE__ */ new Date(), gender: playerData.gender } : playerData.actors.find((a) => a.id === project.supportingActorId);
  let artScoreTotal = 0;
  let artContributors = 0;
  const calcTalentPerformance = (talent, type) => {
    if (!talent) return 0;
    let score = talent.skill;
    const moralFactor = 0.8 + talent.moral / 100 * 0.4;
    score *= moralFactor;
    if (talent.favoriteGenres?.includes(genre)) score *= 1.1;
    if (talent.hatedGenre === genre) score *= 0.8;
    if (type !== "director" && talent.id !== -1) {
      const roleReq = type === "main" ? project.mainRole : project.supportingRole;
      if (roleReq) {
        const actorAgeCat = getActorAgeCategory(talent.birthDate, playerData.gameDate);
        if (talent.gender !== roleReq.gender || actorAgeCat !== roleReq.age) {
          score *= 0.8;
          log.push(`Mismatch bei ${type}: -20% Performance`);
        }
      }
    }
    return Math.min(100, score);
  };
  if (director) {
    artScoreTotal += calcTalentPerformance(director, "director");
    artContributors++;
  }
  if (mainActor) {
    artScoreTotal += calcTalentPerformance(mainActor, "main");
    artContributors++;
  }
  if (supportingActor) {
    artScoreTotal += calcTalentPerformance(supportingActor, "support");
    artContributors++;
  }
  let chemieBonus = 0;
  if (director && mainActor && director.id !== -1 && mainActor.id !== -1) {
    const ids = [director.id, mainActor.id].sort((a, b) => a - b);
    const chemie = playerData.talentChemie.find((c) => c.talentA_id === ids[0] && c.talentB_id === ids[1]);
    if (chemie) chemieBonus += chemie.level;
  }
  if (mainActor && supportingActor && mainActor.id !== -1 && supportingActor.id !== -1) {
    const ids = [mainActor.id, supportingActor.id].sort((a, b) => a - b);
    const chemie = playerData.talentChemie.find((c) => c.talentA_id === ids[0] && c.talentB_id === ids[1]);
    if (chemie) chemieBonus += chemie.level;
  }
  const artBaseScore = artContributors > 0 ? artScoreTotal / artContributors : 0;
  const finalArtScore = Math.min(100, artBaseScore + chemieBonus);
  log.push(`Artistic Score: ${finalArtScore.toFixed(2)} (aus ${artContributors} Personen + ${chemieBonus} Chemie)`);
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
    project.extrasLevel || 1
    // Catering is purely moral/event prevention, excluded from tech score
  ];
  const avgTechLevel = techLevels.reduce((a, b) => a + b, 0) / techLevels.length;
  let techScore = 0;
  const delta = avgTechLevel - expectedTechLevel;
  if (delta >= 0) {
    techScore = 90 + delta * 5;
  } else {
    techScore = 90 + delta * 20;
  }
  techScore = Math.max(10, Math.min(100, techScore));
  log.push(`Technical Score: ${techScore.toFixed(2)} (Avg Level: ${avgTechLevel.toFixed(1)} vs Expected: ${expectedTechLevel.toFixed(1)})`);
  const idealProfile = GENRE_IDEAL_PROFILES[genre];
  let totalDeviation = 0;
  if (idealProfile) {
    Object.keys(idealProfile).forEach((key) => {
      const k = key;
      const projectKey = `focus${k.charAt(0).toUpperCase() + k.slice(1)}`;
      const pValue = project[projectKey] || 5;
      const iValue = idealProfile[k];
      totalDeviation += Math.abs(pValue - iValue);
    });
  }
  let focusFactor = 1;
  if (totalDeviation > 5) focusFactor -= 0.05;
  if (totalDeviation > 15) focusFactor -= 0.05;
  if (totalDeviation > 30) focusFactor -= 0.1;
  log.push(`Focus Factor: ${focusFactor.toFixed(2)} (Deviation: ${totalDeviation})`);
  const realizationScore = finalArtScore * weights.art + techScore * weights.tech;
  const effectiveRealization = realizationScore * focusFactor;
  log.push(`Realization Score: ${realizationScore.toFixed(2)} * ${focusFactor.toFixed(2)} = ${effectiveRealization.toFixed(2)}`);
  let currentQuality = projectPotential * (effectiveRealization / 100);
  log.push(`Qualit\xE4t nach Dreh: ${currentQuality.toFixed(2)}`);
  log.push("\n--- Post-Production ---");
  const postLevels = [project.editingLevel || 1, project.musicLevel || 1, project.soundLevel || 1];
  const avgPostLevel = postLevels.reduce((a, b) => a + b, 0) / postLevels.length;
  const maxRescue = (avgPostLevel - 1) * 2.5;
  const potentialLost = projectPotential - currentQuality;
  let rescuedPoints = 0;
  if (potentialLost > 0) {
    rescuedPoints = Math.min(potentialLost, maxRescue);
    log.push(`Verlorenes Potenzial: ${potentialLost.toFixed(2)}. Gerettet durch Post-Prod: +${rescuedPoints.toFixed(2)}`);
  } else {
    rescuedPoints = (avgPostLevel - 1) * 0.5;
    log.push(`Polish Bonus: +${rescuedPoints.toFixed(2)}`);
  }
  currentQuality += rescuedPoints;
  if (currentQuality > projectPotential + 2) {
    currentQuality = projectPotential + 2;
    log.push("Qualit\xE4t auf Potenzial-Limit gekappt.");
  }
  log.push("\n--- Events & Boni ---");
  const eventModifier = project.productionQualityModifier || 0;
  log.push(`Produktions-Events: ${eventModifier > 0 ? "+" : ""}${eventModifier}`);
  let finalQuality = currentQuality + eventModifier;
  const studioBuildingBonuses = getStudioQualityBonuses(project, playerData);
  if (studioBuildingBonuses.totalBonus > 0) {
    finalQuality += studioBuildingBonuses.totalBonus;
    studioBuildingBonuses.logLines.forEach((line) => log.push(line));
  }
  if (project.ageRating && GENRE_IDEAL_AGE_RATING[project.genre] === project.ageRating) {
    const qualityBonus = 1 + Math.floor(Math.random() * 3);
    finalQuality += qualityBonus;
    log.push(`Zielgruppen-Bonus (Perfekte FSK): +${qualityBonus}`);
  }
  let difficultyQualityModifier = 0;
  if (playerData.gameDifficulty === "leicht") {
    difficultyQualityModifier = 5;
  } else if (playerData.gameDifficulty === "schwer") {
    difficultyQualityModifier = -5;
  }
  if (difficultyQualityModifier !== 0) {
    finalQuality += difficultyQualityModifier;
    log.push(`Schwierigkeits-Modifikator: ${difficultyQualityModifier > 0 ? "+" : ""}${difficultyQualityModifier}`);
  }
  finalQuality = Math.max(0, Math.min(100, finalQuality));
  log.push(`=== ENDERGEBNIS: ${Math.round(finalQuality)} ===`);
  const breakdown = {
    projektPotenzial: breakdownPart1,
    talent: { director: 0, mainActor: 0, supportingActor: 0, chemie: 0, total: finalArtScore },
    // Simplified for UI compatibility
    handwerk: techScore,
    visionMultiplier: focusFactor,
    events: eventModifier + difficultyQualityModifier + studioBuildingBonuses.totalBonus,
    finalRandom: 0,
    finalScore: Math.round(finalQuality),
    log
  };
  return { finalQuality: Math.round(finalQuality), breakdown };
}
export {
  calculateFinalQuality
};
