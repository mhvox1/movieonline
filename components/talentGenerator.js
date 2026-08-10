import { Genre, TalentTrait, ActorAge } from '../types';
import { MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES } from './nameData';
import { ALL_MALE_PORTRAITS, ALL_FEMALE_PORTRAITS } from './portraits';
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to shuffle array
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
// Helper to determine Age Category from Date
const getAgeCategory = (birthDate, gameDate) => {
    const birth = new Date(birthDate);
    const game = new Date(gameDate);
    let age = game.getFullYear() - birth.getFullYear();
    const m = game.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && game.getDate() < birth.getDate())) {
        age--;
    }
    if (age <= 15)
        return ActorAge.Child;
    if (age <= 34)
        return ActorAge.Young;
    if (age <= 59)
        return ActorAge.MiddleAged;
    return ActorAge.Old;
};
const getAdjacentAges = (age) => {
    switch (age) {
        case ActorAge.Child: return [ActorAge.Young];
        case ActorAge.Young: return [ActorAge.Child, ActorAge.MiddleAged];
        case ActorAge.MiddleAged: return [ActorAge.Young, ActorAge.Old];
        case ActorAge.Old: return [ActorAge.MiddleAged];
        default: return [];
    }
};
const DEFAULT_CASTING_PREFERENCE = {
    gender: 'any',
    age: 'any',
    quality: 'any',
};
const createPreferenceFromRole = (role) => ({
    gender: role?.gender ?? 'any',
    age: role?.age ?? 'any',
    quality: 'any',
});
const getProjectCastingPreferences = (project) => ({
    director: {
        ...DEFAULT_CASTING_PREFERENCE,
        ...project.castingPreferences?.director,
    },
    mainActor: {
        ...createPreferenceFromRole(project.mainRole),
        ...project.castingPreferences?.mainActor,
    },
    supportingActor: {
        ...createPreferenceFromRole(project.supportingRole),
        ...project.castingPreferences?.supportingActor,
    },
});
const getSkillRangeForPreference = (quality, fallbackMin, fallbackMax) => {
    switch (quality) {
        case 'low': return { min: 20, max: 45 };
        case 'medium': return { min: 40, max: 65 };
        case 'high': return { min: 60, max: 82 };
        case 'top': return { min: 78, max: 100 };
        default: return { min: fallbackMin, max: fallbackMax };
    }
};
const preferenceHasTargets = (preference) => {
    if (!preference)
        return false;
    return preference.gender !== 'any' || preference.age !== 'any' || preference.quality !== 'any';
};
const matchesGenderPreference = (gender, preference) => {
    return preference.gender === 'any' || gender === preference.gender;
};
const getAgeMatchCandidates = (pool, preference, gameDate) => {
    if (preference.age === 'any')
        return pool;
    let candidates = pool.filter(talent => getAgeCategory(talent.birthDate, gameDate) === preference.age);
    if (candidates.length > 0)
        return candidates;
    const adjacentAges = getAdjacentAges(preference.age);
    candidates = pool.filter(talent => adjacentAges.includes(getAgeCategory(talent.birthDate, gameDate)));
    if (candidates.length > 0)
        return candidates;
    return pool;
};
const generateCastingJustification = (talent, genre) => {
    const isDirector = 'speedModifier' in talent;
    const role = isDirector ? 'Regisseur' : 'Schauspieler';
    const pronounHeShe = 'Er/Sie'; // Vereinfachung
    const pronounHisHer = 'sein/ihr';
    let parts = [];
    let pros = [];
    let cons = [];
    // Genre-Präferenz
    if (talent.favoriteGenres.includes(genre)) {
        pros.push(`hat eine ausgewiesene Leidenschaft für ${genre}-Filme.`);
    }
    else if (talent.hatedGenre === genre) {
        cons.push(`verabscheut das ${genre}-Genre, was die Zusammenarbeit erschweren könnte.`);
    }
    // Skill-Level
    if (talent.skill > 80) {
        pros.push(`besitzt außergewöhnliches Talent und ein Auge für Details.`);
    }
    else if (talent.skill > 60) {
        pros.push(`garantiert mit ${pronounHisHer} hohen Fähigkeiten eine professionelle Leistung.`);
    }
    // Traits
    if (talent.traits.includes(TalentTrait.Publikumsliebling)) {
        pros.push(`ist ein ${TalentTrait.Publikumsliebling} und zieht Zuschauer an.`);
    }
    if (talent.traits.includes(TalentTrait.Arbeitstier)) {
        pros.push(`ist als ${TalentTrait.Arbeitstier} bekannt, was die Produktion beschleunigt.`);
    }
    if (talent.traits.includes(TalentTrait.Teamplayer)) {
        pros.push(`sorgt als ${TalentTrait.Teamplayer} für eine harmonische Atmosphäre am Set.`);
    }
    if (talent.traits.includes(TalentTrait.Diva)) {
        cons.push(`neigt zu Allüren als ${TalentTrait.Diva}, was zu Konflikten führen kann.`);
    }
    if (talent.traits.includes(TalentTrait.Unzuverlässig)) {
        cons.push(`gilt als ${TalentTrait.Unzuverlässig} und könnte zu Verzögerungen führen.`);
    }
    if (talent.traits.includes(TalentTrait.Kassengift)) {
        cons.push(`ist bekannt als ${TalentTrait.Kassengift}, ein Risiko für die Einspielergebnisse.`);
    }
    parts.push(`${talent.name} ist ein${talent.skill > 60 ? ' vielversprechender' : ' solider'} ${role}.`);
    if (pros.length > 0)
        parts.push(`Pro: ${pronounHeShe} ${pros.join(' Außerdem ')}.`);
    if (cons.length > 0)
        parts.push(`Contra: ${pronounHeShe} ${cons.join(' Zudem ')}.`);
    return parts.join(' ');
};
const calculateCastingFitScore = (talent, genre) => {
    let score = 5; // Base score out of 10
    // Genre preference (strong impact)
    if (talent.favoriteGenres.includes(genre)) {
        score += 2;
    }
    else if (talent.hatedGenre === genre) {
        score -= 3;
    }
    // Skill (moderate impact)
    if (talent.skill > 80)
        score += 1.5;
    else if (talent.skill > 60)
        score += 1;
    else if (talent.skill < 30)
        score -= 1;
    // Traits (situational impact)
    if (talent.traits.includes(TalentTrait.Publikumsliebling))
        score += 0.5;
    if (talent.traits.includes(TalentTrait.Teamplayer))
        score += 0.5;
    if (talent.traits.includes(TalentTrait.Arbeitstier))
        score += 0.5;
    if (talent.traits.includes(TalentTrait.Diva))
        score -= 1;
    if (talent.traits.includes(TalentTrait.Unzuverlässig))
        score -= 1.5;
    if (talent.traits.includes(TalentTrait.Kassengift))
        score -= 2;
    // Clamp score between 1 and 10
    return Math.max(1, Math.min(10, Math.round(score)));
};
export const evaluateCastingPool = (directorPoolIds, actorPoolIds, playerData, genre) => {
    const directorsInPool = playerData.directors.filter(d => directorPoolIds.includes(d.id));
    const actorsInPool = playerData.actors.filter(a => actorPoolIds.includes(a.id));
    const justifications = {
        directors: [],
        actors: []
    };
    directorsInPool.forEach(director => {
        justifications.directors.push({
            id: director.id,
            text: generateCastingJustification(director, genre),
            rating: calculateCastingFitScore(director, genre)
        });
    });
    actorsInPool.forEach(actor => {
        justifications.actors.push({
            id: actor.id,
            text: generateCastingJustification(actor, genre),
            rating: calculateCastingFitScore(actor, genre)
        });
    });
    return {
        availableDirectorIds: directorPoolIds,
        availableActorIds: actorPoolIds,
        justifications,
    };
};
// Generates a purely random new talent (Fallback)
const createRandomTalent = (type, playerData, project, talentPreference, forcedSkill) => {
    const isDirector = type === 'director';
    const isMale = Math.random() < 0.5;
    // Gender Logic for Random Generation
    let gender = isMale ? 'männlich' : 'weiblich';
    if (talentPreference?.gender && talentPreference.gender !== 'any') {
        gender = talentPreference.gender;
    }
    const firstNameList = gender === 'männlich' ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
    const firstName = pickRandom(firstNameList);
    const lastName = pickRandom(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const maxActorId = Math.max(0, ...playerData.actors.map(a => a.id));
    const maxDirectorId = Math.max(0, ...playerData.directors.map(d => d.id));
    const id = Math.max(maxActorId, maxDirectorId) + 1 + Math.floor(Math.random() * 1000); // Add jitter to avoid collision in same batch
    // Portraits
    const usedPortraits = new Set([
        ...playerData.directors.map(d => d.portraitUrl),
        ...playerData.actors.map(a => a.portraitUrl)
    ].filter(Boolean));
    let availablePortraits = (gender === 'männlich' ? ALL_MALE_PORTRAITS : ALL_FEMALE_PORTRAITS).filter(p => !usedPortraits.has(p));
    if (availablePortraits.length === 0)
        availablePortraits = gender === 'männlich' ? ALL_MALE_PORTRAITS : ALL_FEMALE_PORTRAITS;
    const portraitUrl = pickRandom(availablePortraits);
    // Age
    let ageInYears = randomBetween(20, 60);
    if (talentPreference?.age && talentPreference.age !== 'any') {
        switch (talentPreference.age) {
            case ActorAge.Child:
                ageInYears = randomBetween(8, 15);
                break;
            case ActorAge.Young:
                ageInYears = randomBetween(16, 34);
                break;
            case ActorAge.MiddleAged:
                ageInYears = randomBetween(35, 59);
                break;
            case ActorAge.Old:
                ageInYears = randomBetween(60, 80);
                break;
        }
    }
    const birthYear = playerData.gameDate.getFullYear() - ageInYears;
    const birthDate = new Date(birthYear, randomBetween(0, 11), randomBetween(1, 28));
    // Stats
    let skill = 40;
    // Priority 1: Forced Skill (from caller)
    if (forcedSkill !== undefined) {
        skill = forcedSkill;
    }
    else if (talentPreference?.quality && talentPreference.quality !== 'any') {
        const preferredRange = getSkillRangeForPreference(talentPreference.quality, 20, 80);
        skill = randomBetween(preferredRange.min, preferredRange.max);
    }
    // Priority 2: Project Potential
    else if (project && (project.projectPotential || project.scriptQuality)) {
        const potential = project.projectPotential || project.scriptQuality;
        // Generate within [Potential - 15, Potential + 10]
        const minS = Math.max(1, potential - 15);
        const maxS = Math.min(100, potential + 10);
        skill = randomBetween(minS, maxS);
    }
    // Fallback
    else {
        skill = randomBetween(20, 60);
    }
    const potential = Math.min(100, skill + randomBetween(10, 40));
    // Cost
    let multiplier = isDirector ? 8 : 10;
    if (skill <= 20)
        multiplier = isDirector ? 2 : 4;
    else if (skill <= 50)
        multiplier = isDirector ? 4 : 6;
    else if (skill <= 80)
        multiplier = isDirector ? 6 : 8;
    const baseCost = 15000 + multiplier * Math.pow(skill, 3.1);
    const cost = Math.round(baseCost / 100) * 100;
    // Genres & Traits
    const allGenres = Object.values(Genre);
    const shuffledGenres = [...allGenres].sort(() => 0.5 - Math.random());
    const favoriteGenres = shuffledGenres.slice(0, 2);
    const hatedGenre = shuffledGenres[2];
    const traits = [];
    if (Math.random() < 0.5) {
        const possibleTraits = Object.values(TalentTrait);
        traits.push(pickRandom(possibleTraits));
    }
    if (isDirector) {
        return {
            id, name, gender, birthDate, skill, cost, bekanntheit: 1,
            favoriteGenres, hatedGenre, traits, experience: 0, potential,
            loyalty: 50, moral: 75, isDiscovered: true, portraitUrl,
            speedModifier: parseFloat((0.8 + Math.random() * 0.4).toFixed(2))
        };
    }
    else {
        return {
            id, name, gender, birthDate, skill, cost, bekanntheit: 1,
            favoriteGenres, hatedGenre, traits, experience: 0, potential,
            loyalty: 50, moral: 75, isDiscovered: true, portraitUrl
        };
    }
};
export const generateNewTalentsForCastingPool = (option, project, playerData) => {
    const totalActorsToDiscover = randomBetween(option.actorsMin, option.actorsMax);
    const totalDirectorsToDiscover = randomBetween(option.directorsMin, option.directorsMax);
    const newActors = [];
    const newDirectors = [];
    const castingPreferences = getProjectCastingPreferences(project);
    const directorPreference = castingPreferences.director;
    const mainActorPreference = castingPreferences.mainActor;
    const supportingActorPreference = castingPreferences.supportingActor;
    const projectPotential = project.projectPotential || project.scriptQuality || 50;
    // Skill Range Criteria: [ProjectPotential - 20, ProjectPotential + 10]
    const minSkill = Math.max(1, projectPotential - 10);
    const maxSkill = Math.min(100, projectPotential + 10);
    // --- 1. DIRECTORS ---
    // Criteria: Not Discovered AND Skill in Range
    const directorSkillRange = getSkillRangeForPreference(directorPreference.quality, minSkill, maxSkill);
    const validDirectors = playerData.directors.filter(d => !d.isDiscovered &&
        d.skill >= directorSkillRange.min &&
        d.skill <= directorSkillRange.max &&
        matchesGenderPreference(d.gender, directorPreference));
    const ageMatchedDirectors = getAgeMatchCandidates(validDirectors, directorPreference, playerData.gameDate);
    const shuffledHiddenDirectors = shuffleArray(ageMatchedDirectors);
    // Take as many as available/needed
    const directorsFromPool = shuffledHiddenDirectors.slice(0, totalDirectorsToDiscover);
    // "Discover" them
    // CORRECTED: Start with 0 (undiscovered) + boost (usually 1) = 1 Star. 
    // Do NOT add +1 to boost, as that resulted in 2 Stars.
    directorsFromPool.forEach(d => {
        newDirectors.push({
            ...d,
            isDiscovered: true,
            bekanntheit: Math.max(1, (d.bekanntheit || 0) + (option.bekanntheitBoost || 0))
        });
    });
    // If not enough, generate random new ones fitting criteria
    const remainingDirectorsNeeded = totalDirectorsToDiscover - newDirectors.length;
    for (let i = 0; i < remainingDirectorsNeeded; i++) {
        newDirectors.push(createRandomTalent('director', playerData, project, directorPreference));
    }
    // --- 2. ACTORS ---
    // Criteria 1: Skill in Range
    const mainActorSkillRange = getSkillRangeForPreference(mainActorPreference.quality, minSkill, maxSkill);
    const supportingActorSkillRange = getSkillRangeForPreference(supportingActorPreference.quality, minSkill, maxSkill);
    const skillValidActors = playerData.actors.filter(a => !a.isDiscovered &&
        a.skill >= Math.min(mainActorSkillRange.min, supportingActorSkillRange.min) &&
        a.skill <= Math.max(mainActorSkillRange.max, supportingActorSkillRange.max));
    // Determine needs
    const numForMainRole = preferenceHasTargets(mainActorPreference) || project.mainRole ? Math.ceil(totalActorsToDiscover * 0.4) : 0;
    const numForSupportingRole = preferenceHasTargets(supportingActorPreference) || project.supportingRole ? Math.ceil(totalActorsToDiscover * 0.3) : 0;
    const numRandom = Math.max(0, totalActorsToDiscover - numForMainRole - numForSupportingRole);
    const usedHiddenActorIds = new Set();
    // Helper to find matching hidden actor with fallback logic
    const findBestMatchingActor = (preference) => {
        // 1. Base Filter (Skill, Hidden, Not Used)
        const skillRange = getSkillRangeForPreference(preference.quality, minSkill, maxSkill);
        let pool = skillValidActors.filter(a => !usedHiddenActorIds.has(a.id) && a.skill >= skillRange.min && a.skill <= skillRange.max);
        // 2. Gender Filter
        pool = pool.filter(a => matchesGenderPreference(a.gender, preference));
        // 3. Age Filter (Tiered)
        const candidates = getAgeMatchCandidates(pool, preference, playerData.gameDate);
        if (candidates.length > 0) {
            const selected = pickRandom(candidates);
            usedHiddenActorIds.add(selected.id);
            return selected;
        }
        return null;
    };
    // A. Main Role Candidates
    for (let i = 0; i < numForMainRole; i++) {
        if (preferenceHasTargets(mainActorPreference) || project.mainRole) {
            const found = findBestMatchingActor(mainActorPreference);
            if (found) {
                newActors.push({ ...found, isDiscovered: true, bekanntheit: Math.max(1, (found.bekanntheit || 0) + (option.bekanntheitBoost || 0)) });
            }
            else {
                newActors.push(createRandomTalent('actor', playerData, project, mainActorPreference));
            }
        }
    }
    // B. Supporting Role Candidates
    for (let i = 0; i < numForSupportingRole; i++) {
        if (preferenceHasTargets(supportingActorPreference) || project.supportingRole) {
            const found = findBestMatchingActor(supportingActorPreference);
            if (found) {
                newActors.push({ ...found, isDiscovered: true, bekanntheit: Math.max(1, (found.bekanntheit || 0) + (option.bekanntheitBoost || 0)) });
            }
            else {
                newActors.push(createRandomTalent('actor', playerData, project, supportingActorPreference));
            }
        }
    }
    // C. Random Fillers (Using remaining pool)
    for (let i = 0; i < numRandom; i++) {
        const remainingHidden = skillValidActors.filter(a => !usedHiddenActorIds.has(a.id));
        if (remainingHidden.length > 0) {
            const selected = pickRandom(remainingHidden);
            usedHiddenActorIds.add(selected.id);
            // CORRECTED: Calculate fame based on current (0) + boost (1) = 1
            newActors.push({ ...selected, isDiscovered: true, bekanntheit: Math.max(1, (selected.bekanntheit || 0) + (option.bekanntheitBoost || 0)) });
        }
        else {
            // No hidden left, generate random (totally random role reqs)
            newActors.push(createRandomTalent('actor', playerData, project));
        }
    }
    return { newActors, newDirectors };
};
export const generateNewTalent = (existingDirectors, existingActors, agencyId, scoutTalent, role, isEvent = false, forcedSkill, gameDate) => {
    // This function is still used by scouts/events, so we use the random generator logic here wrapped in a mock project/data
    // Mocking minimal needed data for createRandomTalent
    const mockProject = { projectPotential: forcedSkill || (scoutTalent ? scoutTalent * 1.5 : 40), scriptQuality: 40 };
    const mockData = { directors: existingDirectors, actors: existingActors, gameDate: gameDate ? new Date(gameDate) : new Date() };
    // Determine type
    let type;
    if (role)
        type = role;
    else
        type = Math.random() < 0.5 ? 'director' : 'actor';
    const talent = createRandomTalent(type, mockData, mockProject, undefined, forcedSkill);
    // Apply specific overrides for scouting/events
    talent.agencyId = agencyId;
    if (isEvent) {
        // Event discount handled inside createRandomTalent? No, applying here
        const discount = (0.3 + Math.random() * 0.2);
        talent.cost = Math.round(talent.cost * discount / 100) * 100;
        talent.isDiscovered = false; // Events usually discover them immediately but the caller handles it
    }
    return talent;
};
