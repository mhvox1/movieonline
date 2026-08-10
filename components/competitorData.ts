export const COMPETITOR_STUDIO_NAMES: string[] = [
    "Starlight Pictures",
    "Quantum Films",
    "Ironclad Studios",
    "Crimson Peak Productions",
    "Meridian Motion Pictures",
    "Blue Sky Dynamics",
    "Obsidian Entertainment",
    "Golden Gate Films",
    "Silver Screen Legends",
    "Phoenix Fire Productions",
    "Titanium Studios",
    "Vanguard Pictures",
    "Eclipse Entertainment",
    "Avalon Dreams",
    "Dynamo Pictures",
    "Zenith Productions",
    "Catalyst Films",
    "Infinity Wardrobe",
    "Spectre Vision",
    "Nomad Entertainment",
    "Orion Pictures",
    "Celestial Studios",
    "Red Giant Films",
    "Labyrinthine Media",
    "Paradigm Shift Cinema"
];

// Massiv erweiterte Wortlisten
const PREFIXES = ["Echoes of", "Legacy of the", "Shadow of the", "The", "Project", "Chronicles of the", "Beyond the", "Under the", "Before the", "Return of the"];
const ADJECTIVES = [
    "Crimson", "Velvet", "Silent", "Quantum", "Galactic", "Last", "Ashen", "Neon", "Fractured", "Solaris", "Steelheart", "Diamond", "Winter's", "Cybernetic", "Gilded", "Forgotten", "Eternal", "Hollow",
    "Obsidian", "Sunken", "Whispering", "Iron", "Crystal", "Fallen", "Golden", "Shadow", "Broken", "Final", "Lost", "Seventh", "Ebon", "Ivory", "Azure", "Scarlet", "Jade", "Midnight", "Electric", "Zero",
    "Ethereal", "Unseen", "Hunted", "Shattered", "Frozen", "Burning", "Secret", "Perfect", "Human", "Dark", "Blind", "Glass", "Chrome", "Deadly"
];
const NOUNS = [
    "Neptune", "Cage", "Signal", "Horizon", "Renegade", "Serenade", "Skies", "Drift", "Empire", "Cipher", "Ghost", "Rebellion", "Protocol", "Abyss", "Dragon", "Paradox", "Serpent", "Solstice", "Gate",
    "Dawn", "Behemoth", "Static", "Void", "Titan", "Samurai", "Pact", "Code", "Mandate", "Legacy", "Prophecy", "Labyrinth", "Echo", "Witness", "Sanctum", "Nemesis", "Vanguard", "Exodus", "Requiem",
    "Gambit", "Covenant", "Paradigm", "Nexus", "Harbinger", "Oracle", "Zenith", "Vertex", "Odyssey", "Mirage", "Sentinel", "Machine", "Child", "Man", "Woman", "Heir", "Throne", "Key", "Star", "Sun", "Moon"
];
const CONCEPTS = [
    "Rising", "Incident", "Gambit", "Anomaly", "Initiative", "Requiem", "Protocol", "Rebellion", "Legacy", "Curse", "Awakening", "Ascension", "Descent", "Redemption", "Vendetta", "Retribution", "Illusion",
    "Directive", "Uprising", "Extinction", "Protocol", "Sanction", "Variante", "Agenda", "Manifesto", "Hypothesis", "Theorem", "Equation"
];
const ONE_WORD_NOUNS = [
    "Solitude", "Vertex", "Cipher", "Nexus", "Oblivion", "Serenity", "Genesis", "Exodus", "Havoc", "Ascension", "Elysium", "Apex", "Ronin", "Cypher", "Spectre", "Hyperion", "Zero", "Omega", "Unity", "Static"
];
const LOCATIONS = ["Mountain", "River", "City", "Station", "Point", "Zone", "Sector", "Nebula", "Island", "Fortress", "Sanctuary", "Wasteland", "District", "Colony", "Spire"];
const PEOPLE = ["Soldier", "King", "Witness", "Courier", "Thief", "Heir", "Nomad", "Hunter", "Prophet", "Guardian", "Agent", "Outlaw", "Engineer", "Architect", "Wanderer"];
const VERBS_ING = ["Falling", "Rising", "Burning", "Whispering", "Fading", "Hunting", "Remembering", "Forgetting", "Breaking", "Running", "Becoming", "Erasing"];

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Erheblich erweiterte Vorlagen
const templates = [
    () => pickRandom(ONE_WORD_NOUNS),
    () => `${pickRandom(ADJECTIVES)} ${pickRandom(NOUNS)}`,
    () => `The ${pickRandom(ADJECTIVES)} ${pickRandom(NOUNS)}`,
    () => `The ${pickRandom(NOUNS)}`,
    () => `${pickRandom(NOUNS)}'s ${pickRandom(CONCEPTS)}`,
    () => `The ${pickRandom(NOUNS)}'s ${pickRandom(CONCEPTS)}`,
    () => `${pickRandom(NOUNS)} of ${pickRandom(LOCATIONS)}`,
    () => `${pickRandom(PEOPLE)} of ${pickRandom(LOCATIONS)}`,
    () => `${pickRandom(PREFIXES)} ${pickRandom(NOUNS)}`,
    () => `${pickRandom(NOUNS)}: ${pickRandom(CONCEPTS)}`,
    () => `${pickRandom(VERBS_ING)} ${pickRandom(NOUNS)}`,
    () => `The ${pickRandom(VERBS_ING)}`,
    () => `${pickRandom(ADJECTIVES)} ${pickRandom(LOCATIONS)}`,
    () => `The Last ${pickRandom(PEOPLE)}`,
    () => `The ${pickRandom(NOUNS)} Protocol`,
    () => `Project ${pickRandom(NOUNS)}`,
    () => `${pickRandom(LOCATIONS)} ${pickRandom(CONCEPTS)}`,
    () => `${pickRandom(ADJECTIVES)} ${pickRandom(PEOPLE)}`,
    () => `The ${pickRandom(NOUNS)} and the ${pickRandom(PEOPLE)}`,
];

export const generateCompetitorFilmTitle = (usedTitles: Set<string>): string => {
    let title = '';
    let attempts = 0;
    
    do {
        const template = pickRandom(templates);
        title = template();
        attempts++;
    } while (usedTitles.has(title) && attempts < 100); // Avoid infinite loops if all titles are used
    
    return title;
};