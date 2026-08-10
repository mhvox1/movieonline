
import { MaritalStatus, EmployeeType, RelationshipInteraction } from "../types";

export interface Course {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration: number; // days
    skillBonus?: {
        skill: 'negotiationSkill' | 'charisma' | 'financialSense' | 'filmSense' | 'organizationTalent';
        amount: number;
    };
    weeklyEnergyCost: number; // New: Weekly energy drain
}

export interface Property {
    id: string;
    name: string;
    description: string;
    cost: number;
    monthlyCost: number;
    rentalIncome: number; // Monthly income if rented out
    reputationBonus: number;
    recoveryBonus?: number;
    maxGuests?: number;
    actionUnlock?: string;
}

export type LuxuryCategory = 'fashion' | 'vehicle' | 'art' | 'transport';

export interface LuxuryGood {
    id: string;
    name: string;
    description: string;
    cost: number;
    reputationBonus: number;
    category: LuxuryCategory;
    skillBonus?: {
        skill: 'negotiationSkill' | 'charisma' | 'financialSense' | 'filmSense' | 'organizationTalent';
        amount: number;
    };
}

export interface ChildInteractionDef {
    id: string;
    label: string;
    minAge: number;
    maxAge: number;
    cost: number;
    energyCost: number;
    relationshipGain: number;
    description: string;
}

export const CHILD_INTERACTIONS: ChildInteractionDef[] = [
    // Baby (0-2)
    { id: 'baby_cuddle', label: 'Kuscheln', minAge: 0, maxAge: 2, cost: 0, energyCost: 0, relationshipGain: 6, description: 'Einfach mal in den Arm nehmen und Nähe zeigen.' },
    { id: 'baby_feed', label: 'Füttern', minAge: 0, maxAge: 2, cost: 10, energyCost: 0, relationshipGain: 4, description: 'Ein Fläschchen oder Brei geben.' },
    { id: 'baby_lullaby', label: 'Schlaflied singen', minAge: 0, maxAge: 2, cost: 0, energyCost: 0, relationshipGain: 5, description: 'Sanft in den Schlaf wiegen.' },
    { id: 'baby_walk', label: 'Spaziergang mit Kinderwagen', minAge: 0, maxAge: 2, cost: 0, energyCost: 0, relationshipGain: 3, description: 'Frische Luft schnappen.' },
    { id: 'baby_toy', label: 'Neues Spielzeug kaufen', minAge: 0, maxAge: 2, cost: 50, energyCost: 0, relationshipGain: 7, description: 'Eine Rassel oder ein Kuscheltier.' },

    // Kleinkind (3-5)
    { id: 'toddler_play', label: 'Verstecken spielen', minAge: 3, maxAge: 5, cost: 0, energyCost: 0, relationshipGain: 6, description: 'Gemeinsam durch die Wohnung toben.' },
    { id: 'toddler_read', label: 'Bilderbuch vorlesen', minAge: 3, maxAge: 5, cost: 0, energyCost: 0, relationshipGain: 5, description: 'Eine spannende Gutenachtgeschichte.' },
    { id: 'toddler_paint', label: 'Zusammen malen', minAge: 3, maxAge: 5, cost: 20, energyCost: 0, relationshipGain: 6, description: 'Kreativ sein mit Fingerfarben.' },
    { id: 'toddler_playground', label: 'Spielplatz besuchen', minAge: 3, maxAge: 5, cost: 0, energyCost: 0, relationshipGain: 7, description: 'Schaukeln, rutschen und sandeln.' },
    { id: 'toddler_icecream', label: 'Eis essen gehen', minAge: 3, maxAge: 5, cost: 30, energyCost: 0, relationshipGain: 8, description: 'Eine süße Belohnung.' },

    // Schulkind (6-12)
    { id: 'kid_homework', label: 'Bei Hausaufgaben helfen', minAge: 6, maxAge: 12, cost: 0, energyCost: 0, relationshipGain: 5, description: 'Unterstützung für die Schule.' },
    { id: 'kid_boardgame', label: 'Brettspielabend', minAge: 6, maxAge: 12, cost: 0, energyCost: 0, relationshipGain: 7, description: 'Mensch ärgere dich nicht & Co.' },
    { id: 'kid_sports', label: 'Ball spielen im Park', minAge: 6, maxAge: 12, cost: 0, energyCost: 0, relationshipGain: 6, description: 'Fußball oder Fangen an der frischen Luft.' },
    { id: 'kid_cinema', label: 'Ins Kino gehen', minAge: 6, maxAge: 12, cost: 60, energyCost: 0, relationshipGain: 8, description: 'Den neuesten Animationsfilm ansehen.' },
    { id: 'kid_zoo', label: 'Tagesausflug in den Zoo', minAge: 6, maxAge: 12, cost: 150, energyCost: 0, relationshipGain: 12, description: 'Tiere beobachten und Spaß haben.' },

    // Teenager (13-17)
    { id: 'teen_listen', label: 'Ernsthaftes Gespräch', minAge: 13, maxAge: 17, cost: 0, energyCost: 0, relationshipGain: 6, description: 'Über Probleme, Träume und die Zukunft reden.' },
    { id: 'teen_movie', label: 'Filmabend zu Hause', minAge: 13, maxAge: 17, cost: 20, energyCost: 0, relationshipGain: 5, description: 'Pizza bestellen und Filme streamen.' },
    { id: 'teen_help', label: 'Bei Projekt helfen', minAge: 13, maxAge: 17, cost: 0, energyCost: 0, relationshipGain: 7, description: 'Unterstützung bei einem Hobby oder Schulprojekt.' },
    { id: 'teen_shopping', label: 'Shopping-Trip', minAge: 13, maxAge: 17, cost: 300, energyCost: 0, relationshipGain: 10, description: 'Neue Klamotten kaufen.' },
    { id: 'teen_concert', label: 'Konzertkarten schenken', minAge: 13, maxAge: 17, cost: 200, energyCost: 0, relationshipGain: 15, description: 'Tickets für die Lieblingsband.' },

    // Erwachsen (18+)
    { id: 'adult_call', label: 'Telefonieren / Chatten', minAge: 18, maxAge: 999, cost: 0, energyCost: 0, relationshipGain: 3, description: 'Kontakt halten und Neuigkeiten austauschen.' },
    { id: 'adult_coffee', label: 'Auf einen Kaffee treffen', minAge: 18, maxAge: 999, cost: 20, energyCost: 0, relationshipGain: 5, description: 'Ein kurzes Treffen im Café.' },
    { id: 'adult_visit', label: 'Zu Besuch kommen', minAge: 18, maxAge: 999, cost: 0, energyCost: 0, relationshipGain: 8, description: 'Ein entspannter Nachmittag zu Hause.' },
    { id: 'adult_dinner', label: 'Essen gehen', minAge: 18, maxAge: 999, cost: 150, energyCost: 0, relationshipGain: 10, description: 'Ein netter Abend im Restaurant.' },
    { id: 'adult_gift', label: 'Finanzielle Unterstützung', minAge: 18, maxAge: 999, cost: 500, energyCost: 0, relationshipGain: 15, description: 'Hilfe bei Miete oder Anschaffungen.' },
];

export interface WeddingPackage {
    id: string;
    name: string;
    description: string;
    cost: number;
    reputationBonus: number;
}

export interface EngagementRing {
    id: string;
    name: string;
    cost: number;
    successBonus: number;
}

export interface SearchOption {
    id: string;
    name: string;
    description: string;
    cost: number;
    successChance: number;
}

export interface SeminarOrActivity {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration: number;
    skillBonus?: {
        skill: 'negotiationSkill' | 'charisma' | 'financialSense' | 'filmSense' | 'organizationTalent';
        amount: number;
    };
    statBonus?: {
        stat: string;
        amount: number;
    };
    energyBonus?: number;
    energyCost?: number; // New field for energy consumption
}

export interface PartnerJobDef {
    name: string;
    minIncome: number;
    maxIncome: number;
    minReputation: number; // Erforderlicher Ruf des Spielers (0-100)
    minHouseLevel: number; // Index der Immobilie (0 = Miete, 1 = Condo...)
}

export interface SchoolType {
    id: string;
    name: string;
    description: string;
    monthlyCost: number;
    skillGrowthModifier: number; // Multiplier for skill gains (e.g. 1.0 to 2.5)
    stars: number; // 1 to 3 (0.5 steps)
    baseSkillRange?: { min: number, max: number }; // For University: Base skill given
    bonusSkillRange?: { min: number, max: number }; // For Schools: Bonus added
}

export const ENGAGEMENT_RINGS: EngagementRing[] = [
    { id: 'ring_simple', name: 'Schlichter Goldring', cost: 2000, successBonus: 0 },
    { id: 'ring_diamond', name: 'Diamantring', cost: 10000, successBonus: 0.1 },
    { id: 'ring_designer', name: 'Designer-Stück', cost: 50000, successBonus: 0.25 },
    { id: 'ring_vintage', name: 'Antikes Erbstück', cost: 150000, successBonus: 0.4 },
];

export const SCHOOL_TYPES: SchoolType[] = [
    {
        id: 'school_public',
        name: 'Städtische Grundschule',
        description: 'Eine solide, staatliche Schule. Kostenlos, aber mit großen Klassen.',
        monthlyCost: 0,
        skillGrowthModifier: 1.0,
        stars: 1.0,
        bonusSkillRange: { min: 0, max: 1 }
    },
    {
        id: 'school_comprehensive',
        name: 'Gesamtschule "Zukunft"',
        description: 'Moderne Ausstattung und engagierte Lehrer. Bessere Förderung als der Standard.',
        monthlyCost: 500,
        skillGrowthModifier: 1.2,
        stars: 1.5,
        bonusSkillRange: { min: 1, max: 2 }
    },
    {
        id: 'school_private',
        name: 'Privatschule "Athena"',
        description: 'Kleine Klassen und individuelle Betreuung. Hier wird Leistung gefordert.',
        monthlyCost: 2500,
        skillGrowthModifier: 1.5,
        stars: 2.0,
        bonusSkillRange: { min: 2, max: 3 }
    },
    {
        id: 'school_international',
        name: 'International School',
        description: 'Mehrsprachiger Unterricht und ein globales Netzwerk. Exzellente Bildung.',
        monthlyCost: 6000,
        skillGrowthModifier: 2.0,
        stars: 2.5,
        bonusSkillRange: { min: 3, max: 4 }
    },
    {
        id: 'school_elite',
        name: 'Elite-Internat "Rosenberg"',
        description: 'Die Schmiede der zukünftigen Weltführer. Maximale Förderung, astronomische Kosten.',
        monthlyCost: 15000,
        skillGrowthModifier: 3.0,
        stars: 3.0,
        bonusSkillRange: { min: 4, max: 5 }
    }
];

export const SECONDARY_SCHOOL_TYPES: SchoolType[] = [
    {
        id: 'sec_school_public',
        name: 'Städtische Realschule',
        description: 'Solide Bildung ohne Schnickschnack. Fokus auf praktische Fähigkeiten.',
        monthlyCost: 0,
        skillGrowthModifier: 1.0,
        stars: 1.0,
        bonusSkillRange: { min: 0, max: 2 }
    },
    {
        id: 'sec_school_gymnasium',
        name: 'Städtisches Gymnasium',
        description: 'Der klassische Weg zum Abitur. Gute Bildung, aber wenig individuelle Förderung.',
        monthlyCost: 200,
        skillGrowthModifier: 1.3,
        stars: 1.5,
        bonusSkillRange: { min: 2, max: 4 }
    },
    {
        id: 'sec_school_private_gym',
        name: 'Privatgymnasium "Humboldt"',
        description: 'Kleine Klassen, Laptop-Klassen und Sprachreisen. Gehobener Standard.',
        monthlyCost: 3500,
        skillGrowthModifier: 1.8,
        stars: 2.0,
        bonusSkillRange: { min: 4, max: 6 }
    },
    {
        id: 'sec_school_art',
        name: 'Kunst- & Medien-Kolleg',
        description: 'Spezialisiert auf kreative Talente. Perfekt für angehende Filmemacher.',
        monthlyCost: 7500,
        skillGrowthModifier: 2.5,
        stars: 2.5,
        bonusSkillRange: { min: 6, max: 8 }
    },
    {
        id: 'sec_school_elite',
        name: 'Elite-Institut "Schloss Salem"',
        description: 'Das renommierteste Internat des Landes. Hier werden die CEOs von morgen geformt.',
        monthlyCost: 20000,
        skillGrowthModifier: 4.0,
        stars: 3.0,
        bonusSkillRange: { min: 8, max: 10 }
    }
];

export const UNIVERSITY_TYPES: SchoolType[] = [
    {
        id: 'uni_state',
        name: 'Staatliche Universität',
        description: 'Solide akademische Ausbildung. Standard.',
        monthlyCost: 0, 
        skillGrowthModifier: 1.0,
        stars: 1.0,
        baseSkillRange: { min: 15, max: 25 }
    },
    {
        id: 'uni_film',
        name: 'Filmhochschule "Lumière"',
        description: 'Spezialisiert auf Medienberufe. Gute Kontakte zur Branche.',
        monthlyCost: 1500,
        skillGrowthModifier: 1.5,
        stars: 1.5,
        baseSkillRange: { min: 25, max: 32 }
    },
    {
        id: 'uni_business',
        name: 'Business School',
        description: 'Fokus auf Management und Marketing. Praxisnahe Ausbildung.',
        monthlyCost: 2500,
        skillGrowthModifier: 2.0,
        stars: 2.0,
        baseSkillRange: { min: 32, max: 38 }
    },
    {
        id: 'uni_arts',
        name: 'Akademie der Künste',
        description: 'Für kreative Geister. Fördert Schauspiel und Regie besonders intensiv.',
        monthlyCost: 3000,
        skillGrowthModifier: 2.5,
        stars: 2.5,
        baseSkillRange: { min: 38, max: 45 }
    },
    {
        id: 'uni_ivy',
        name: 'Elite-Universität "Harvard"',
        description: 'Das Beste vom Besten. Öffnet alle Türen und bietet maximale Förderung.',
        monthlyCost: 10000,
        skillGrowthModifier: 4.0,
        stars: 3.0,
        baseSkillRange: { min: 45, max: 55 }
    }
];

export const UNIVERSITY_MAJORS: Record<string, string> = {
    'Actor': 'Darstellende Künste',
    'Director': 'Filmregie & Visuelle Sprache',
    [EmployeeType.Autor]: 'Kreatives Schreiben & Dramaturgie',
    [EmployeeType.CastingMitarbeiter]: 'Talentmanagement & HR',
    [EmployeeType.Forscher]: 'Medienwissenschaften & Technologie',
    [EmployeeType.Marketingmanager]: 'Marketing & Kommunikation',
    [EmployeeType.ProjektPlaner]: 'Projektmanagement & Logistik'
};

export const PARTNER_JOB_DEFINITIONS: PartnerJobDef[] = [
    // Low Income / Entry Level (Keine Voraussetzungen)
    { name: "Kellner/in", minIncome: 900, maxIncome: 1300, minReputation: 0, minHouseLevel: 0 },
    { name: "Verkäufer/in", minIncome: 1000, maxIncome: 1500, minReputation: 0, minHouseLevel: 0 },
    { name: "Reinigungskraft", minIncome: 800, maxIncome: 1200, minReputation: 0, minHouseLevel: 0 },
    { name: "Kurierfahrer/in", minIncome: 1100, maxIncome: 1600, minReputation: 0, minHouseLevel: 0 },
    { name: "Küchenhilfe", minIncome: 850, maxIncome: 1250, minReputation: 0, minHouseLevel: 0 },
    { name: "Call-Center Agent", minIncome: 1000, maxIncome: 1400, minReputation: 0, minHouseLevel: 0 },
    { name: "Lagerist/in", minIncome: 1200, maxIncome: 1700, minReputation: 0, minHouseLevel: 0 },
    
    // Lower Middle Class (Geringer Ruf nötig)
    { name: "Friseur/in", minIncome: 1400, maxIncome: 2000, minReputation: 10, minHouseLevel: 0 },
    { name: "Bürokaufmann/-frau", minIncome: 1800, maxIncome: 2400, minReputation: 15, minHouseLevel: 1 },
    { name: "Handwerker/in", minIncome: 2000, maxIncome: 2800, minReputation: 15, minHouseLevel: 1 },
    { name: "Gärtner/in", minIncome: 1600, maxIncome: 2300, minReputation: 10, minHouseLevel: 0 },
    { name: "Sicherheitskraft", minIncome: 1700, maxIncome: 2400, minReputation: 10, minHouseLevel: 0 },
    { name: "Fitnesstrainer/in", minIncome: 1800, maxIncome: 2600, minReputation: 20, minHouseLevel: 1 },
    { name: "Rezeptionist/in", minIncome: 1500, maxIncome: 2100, minReputation: 15, minHouseLevel: 0 },

    // Middle Class (Mittlerer Ruf & besseres Haus)
    { name: "Lehrer/in", minIncome: 2800, maxIncome: 3500, minReputation: 30, minHouseLevel: 2 },
    { name: "Krankenpfleger/in", minIncome: 2600, maxIncome: 3400, minReputation: 30, minHouseLevel: 2 },
    { name: "Buchhalter/in", minIncome: 3000, maxIncome: 4000, minReputation: 35, minHouseLevel: 2 },
    { name: "Grafikdesigner/in", minIncome: 2700, maxIncome: 3800, minReputation: 30, minHouseLevel: 2 },
    { name: "Polizist/in", minIncome: 2900, maxIncome: 3700, minReputation: 35, minHouseLevel: 2 },
    { name: "Journalist/in", minIncome: 2800, maxIncome: 4200, minReputation: 40, minHouseLevel: 2 },
    { name: "Bankkaufmann/-frau", minIncome: 3000, maxIncome: 4000, minReputation: 40, minHouseLevel: 2 },
    { name: "Immobilienmakler/in", minIncome: 2500, maxIncome: 6000, minReputation: 45, minHouseLevel: 2 },

    // Upper Middle Class (Hoher Ruf)
    { name: "Architekt/in", minIncome: 4000, maxIncome: 6500, minReputation: 55, minHouseLevel: 3 },
    { name: "Ingenieur/in", minIncome: 4500, maxIncome: 7000, minReputation: 55, minHouseLevel: 3 },
    { name: "Software-Entwickler/in", minIncome: 4800, maxIncome: 7500, minReputation: 50, minHouseLevel: 3 },
    { name: "Apotheker/in", minIncome: 4500, maxIncome: 6000, minReputation: 50, minHouseLevel: 3 },
    { name: "Marketing-Manager/in", minIncome: 4200, maxIncome: 6800, minReputation: 55, minHouseLevel: 3 },

    // High Income / Elite (Sehr hoher Ruf & Luxus-Haus)
    { name: "Arzt/Ärztin", minIncome: 7000, maxIncome: 14000, minReputation: 70, minHouseLevel: 4 },
    { name: "Anwalt/Anwältin", minIncome: 7500, maxIncome: 16000, minReputation: 75, minHouseLevel: 4 },
    { name: "Unternehmensberater/in", minIncome: 8000, maxIncome: 15000, minReputation: 75, minHouseLevel: 5 },
    { name: "Pilot/in", minIncome: 9000, maxIncome: 14000, minReputation: 70, minHouseLevel: 4 },
    { name: "Investmentbanker/in", minIncome: 10000, maxIncome: 25000, minReputation: 85, minHouseLevel: 6 },
    { name: "CEO", minIncome: 15000, maxIncome: 50000, minReputation: 90, minHouseLevel: 7 },
    { name: "Chefarzt/Chefärztin", minIncome: 12000, maxIncome: 22000, minReputation: 85, minHouseLevel: 6 },
];

export const PARTNER_JOBS = PARTNER_JOB_DEFINITIONS.map(j => j.name); // Legacy support

export const PARTNER_TRAITS = [
    { id: 'luxus', name: 'Mag Luxus', desc: 'Freut sich über teure Geschenke.' },
    { id: 'bodenstaendig', name: 'Bodenständig', desc: 'Mag einfache Dinge.' },
    { id: 'romantisch', name: 'Romantisch', desc: 'Liebt große Gesten.' },
    { id: 'karriere', name: 'Karrierebewusst', desc: 'Versteht lange Arbeitszeiten.' },
    { id: 'kultur', name: 'Kulturliebhaber', desc: 'Mag Theater und Oper.' }
];

export const WEDDING_PACKAGES: WeddingPackage[] = [
    {
        id: 'courthouse',
        name: 'Rathaus-Zeremonie',
        description: 'Eine schnelle, unkomplizierte und günstige Trauung im kleinen Kreis.',
        cost: 10000,
        reputationBonus: 5,
    },
    {
        id: 'garden_party',
        name: 'Gartenparty',
        description: 'Eine charmante Feier im Freien mit Freunden und Familie.',
        cost: 50000,
        reputationBonus: 15,
    },
    {
        id: 'ballroom',
        name: 'Ballsaal-Hochzeit',
        description: 'Eine klassische und elegante Feier in einem großen Ballsaal.',
        cost: 250000,
        reputationBonus: 30,
    },
    {
        id: 'luxury_event',
        name: 'Luxus-Event',
        description: 'Die Hochzeit des Jahres! Eine extravagante Feier, über die die ganze Welt sprechen wird.',
        cost: 1000000,
        reputationBonus: 60,
    }
];

export const ALL_COURSES: Course[] = [
    {
        id: 'course_acting',
        name: 'Schauspielschule (Abendstudium)',
        description: 'Verbessern Sie Ihre Präsenz und Ausstrahlung langfristig. Hilfreich für Verhandlungen und öffentliche Auftritte.',
        cost: 75000,
        duration: 90,
        skillBonus: { skill: 'charisma', amount: 8 },
        weeklyEnergyCost: 6,
    },
    {
        id: 'course_directing',
        name: 'Regie-Meisterklasse',
        description: 'Erlernen Sie die Feinheiten der Filmregie. Verbessert Ihr Gespür für gute Filme massiv.',
        cost: 85000,
        duration: 90,
        skillBonus: { skill: 'filmSense', amount: 8 },
        weeklyEnergyCost: 7,
    },
    {
        id: 'course_writing',
        name: 'Dramaturgie-Studium',
        description: 'Verfeinern Sie Ihr Handwerk im Geschichtenerzählen. Hilft bei der Auswahl und Entwicklung guter Drehbücher.',
        cost: 60000,
        duration: 60,
        skillBonus: { skill: 'filmSense', amount: 5 },
        weeklyEnergyCost: 5,
    },
    {
        id: 'course_marketing',
        name: 'MBA Marketing',
        description: 'Ein intensives Studium über Marktpsychologie und Finanzen.',
        cost: 90000,
        duration: 120,
        skillBonus: { skill: 'financialSense', amount: 10 }, 
        weeklyEnergyCost: 8,
    },
    {
        id: 'course_management',
        name: 'Advanced Management',
        description: 'Effiziente Strukturen und Abläufe für Ihr Studio auf höchstem Niveau.',
        cost: 100000,
        duration: 90,
        skillBonus: { skill: 'organizationTalent', amount: 8 },
        weeklyEnergyCost: 9,
    },
];

export const WEEKEND_SEMINARS: SeminarOrActivity[] = [
    {
        id: 'sem_neg',
        name: 'Verhandlungs-Crashkurs',
        description: 'Ein intensives Wochenend-Seminar. Lernen Sie die Grundlagen des Deal-Making.',
        cost: 2500,
        duration: 2,
        skillBonus: { skill: 'negotiationSkill', amount: 2 },
        energyCost: 15,
    },
    {
        id: 'sem_char',
        name: 'Rhetorik-Training',
        description: 'Verbessern Sie Ihr freies Sprechen und Ihre Überzeugungskraft.',
        cost: 3000,
        duration: 2,
        skillBonus: { skill: 'charisma', amount: 2 },
        energyCost: 12,
    },
    {
        id: 'sem_fin',
        name: 'Buchhaltung für CEOs',
        description: 'Lernen Sie, Bilanzen richtig zu lesen.',
        cost: 2000,
        duration: 2,
        skillBonus: { skill: 'financialSense', amount: 2 },
        energyCost: 18,
    },
    {
        id: 'sem_org',
        name: 'Zeitmanagement',
        description: 'Optimieren Sie Ihren Arbeitsalltag.',
        cost: 1500,
        duration: 1,
        skillBonus: { skill: 'organizationTalent', amount: 1 },
        energyCost: 10,
    }
];

export const LEISURE_ACTIVITIES: SeminarOrActivity[] = [
    {
        id: 'leisure_golf',
        name: 'Golfkurs im Country Club',
        description: 'Networking auf dem Grün. Gut für den Ruf und das Charisma, aber auch anstrengend.',
        cost: 5000,
        duration: 1,
        statBonus: { stat: 'personalReputation', amount: 1 },
        skillBonus: { skill: 'charisma', amount: 1 },
        energyCost: 15,
    },
    {
        id: 'leisure_trainer',
        name: 'Personal Trainer',
        description: 'Ein hartes Workout für Disziplin und Auftreten.',
        cost: 1000,
        duration: 1,
        skillBonus: { skill: 'charisma', amount: 1 },
        energyCost: 20,
    },
    {
        id: 'leisure_walk',
        name: 'Spaziergang im Park',
        description: 'Ein entspannter Spaziergang, um den Kopf frei zu bekommen. Kostenlos und erfrischend.',
        cost: 0,
        duration: 1,
        energyBonus: 10,
        energyCost: 0
    },
    {
        id: 'leisure_yoga',
        name: 'Yoga & Meditation',
        description: 'Finden Sie Ihre innere Mitte. Baut Stress ab und schärft den Fokus.',
        cost: 150,
        duration: 1,
        energyBonus: 20,
        skillBonus: { skill: 'organizationTalent', amount: 1 },
        energyCost: 0
    }
];

export const ALL_PROPERTIES: Property[] = [
    {
        id: 'prop_rental',
        name: 'Mietwohnung im Hinterhaus',
        description: 'Ein bescheidener Start. Hier ist es laut und eng, aber es ist ein Dach über dem Kopf. Keine Erholung möglich.',
        cost: 0,
        monthlyCost: 500,
        rentalIncome: 0, // N/A
        reputationBonus: 0,
        recoveryBonus: 1,
    },
    {
        id: 'prop_condo',
        name: 'Kleine Eigentumswohnung',
        description: 'Ihr erstes Eigentum. Solide, sauber und ein guter Schritt in die Unabhängigkeit.',
        cost: 250000,
        monthlyCost: 200,
        rentalIncome: 2000,
        reputationBonus: 0,
        recoveryBonus: 2, 
        maxGuests: 4,
    },
    {
        id: 'prop_townhouse',
        name: 'Reihenhaus am Stadtrand',
        description: 'Ruhige Lage mit kleinem Garten. Ideal, um dem Trubel des Studios zu entkommen.',
        cost: 600000,
        monthlyCost: 400,
        rentalIncome: 4500,
        reputationBonus: 1,
        recoveryBonus: 3,
        maxGuests: 8,
    },
    {
        id: 'prop_loft',
        name: 'Loft im Künstlerviertel',
        description: 'Offener Wohnraum in einer alten Fabrik. Sehr angesagt bei der kreativen Szene.',
        cost: 1200000,
        monthlyCost: 600,
        rentalIncome: 9000,
        reputationBonus: 1,
        recoveryBonus: 4,
        maxGuests: 15,
        actionUnlock: 'small_party',
    },
    {
        id: 'prop_penthouse',
        name: 'Penthouse in der Stadt',
        description: 'Luxuriöses Apartment im Herzen der Metropole mit atemberaubendem Blick über die Skyline.',
        cost: 3500000,
        monthlyCost: 800,
        rentalIncome: 22000,
        reputationBonus: 2,
        recoveryBonus: 5,
        maxGuests: 25,
        actionUnlock: 'cocktail_party',
    },
    {
        id: 'prop_countryside',
        name: 'Historisches Landgut',
        description: 'Ein weitläufiges Anwesen auf dem Land. Perfekte Ruhe und Abgeschiedenheit.',
        cost: 5000000,
        monthlyCost: 900,
        rentalIncome: 30000,
        reputationBonus: 1,
        recoveryBonus: 8, // Hohe Erholung
        maxGuests: 20,
    },
    {
        id: 'prop_beach',
        name: 'Strandvilla in Malibu',
        description: 'Direkter Meerblick und Meeresrauschen. Ein Symbol für Erfolg und Freiheit.',
        cost: 8500000,
        monthlyCost: 1100,
        rentalIncome: 65000,
        reputationBonus: 4,
        recoveryBonus: 9,
        maxGuests: 40,
        actionUnlock: 'beach_party',
    },
    {
        id: 'prop_villa',
        name: 'Villa in den Hollywood Hills',
        description: 'Ein architektonisches Meisterwerk mit Infinity-Pool. Hier wohnt die Elite der Filmbranche.',
        cost: 15000000,
        monthlyCost: 2000,
        rentalIncome: 95000,
        reputationBonus: 6,
        recoveryBonus: 7,
        maxGuests: 80,
        actionUnlock: 'pool_party',
    },
    {
        id: 'prop_castle',
        name: 'Schloss in Frankreich',
        description: 'Ein jahrhundertealtes Schloss mit eigenen Weinbergen. Der ultimative Ausdruck von Reichtum und Kultur.',
        cost: 30000000,
        monthlyCost: 2500,
        rentalIncome: 180000,
        reputationBonus: 10,
        recoveryBonus: 10,
        maxGuests: 150,
        actionUnlock: 'royal_ball',
    },
    {
        id: 'prop_island',
        name: 'Privatinsel',
        description: 'Der ultimative Luxus. Maximale Privatsphäre und Erholung. Nur für die absolute Elite.',
        cost: 75000000,
        monthlyCost: 3500,
        rentalIncome: 450000,
        reputationBonus: 15,
        recoveryBonus: 15, // Maximale Erholung
        maxGuests: 50,
        actionUnlock: 'exclusive_gala',
    },
];

export const ALL_LUXURY_GOODS: LuxuryGood[] = [
    // Mode & Accessoires
    {
        id: 'lux_suit',
        name: 'Maßanzug vom Star-Schneider',
        description: 'Der erste Eindruck zählt. Ein perfekt sitzender Anzug strahlt Kompetenz aus.',
        cost: 5000,
        reputationBonus: 1,
        category: 'fashion',
        skillBonus: { skill: 'charisma', amount: 1 }
    },
    {
        id: 'lux_watch',
        name: 'Designer-Uhr',
        description: 'Ein zeitloses Symbol für Eleganz und Präzision.',
        cost: 30000,
        reputationBonus: 2,
        category: 'fashion',
        skillBonus: { skill: 'negotiationSkill', amount: 1 }
    },
    {
        id: 'lux_jewelry',
        name: 'Exklusives Schmuckstück',
        description: 'Ein funkelndes Statement bei jeder Gala.',
        cost: 150000,
        reputationBonus: 5,
        category: 'fashion',
        skillBonus: { skill: 'charisma', amount: 2 }
    },

    // Fahrzeuge
    {
        id: 'lux_car_sports',
        name: 'Italienischer Sportwagen',
        description: 'Ein schnelles und auffälliges Auto, das Köpfe verdreht.',
        cost: 250000,
        reputationBonus: 8,
        category: 'vehicle'
    },
    {
        id: 'lux_car_vintage',
        name: 'Seltener Oldtimer',
        description: 'Klasse und Stil. Zeigt, dass Sie wahren Wert schätzen.',
        cost: 500000,
        reputationBonus: 15,
        category: 'vehicle',
        skillBonus: { skill: 'filmSense', amount: 2 } // Appreciation of classics
    },
    {
        id: 'lux_car_limo',
        name: 'Gepanzerte Limousine',
        description: 'Sicher und repräsentativ. Für den ganz großen Auftritt.',
        cost: 800000,
        reputationBonus: 12,
        category: 'vehicle',
        skillBonus: { skill: 'negotiationSkill', amount: 2 } // Intimidation factor?
    },

    // Kunst
    {
        id: 'lux_art_modern',
        name: 'Modernes Gemälde',
        description: 'Ein abstraktes Werk eines aufstrebenden Künstlers. Zeugt von Geschmack.',
        cost: 200000,
        reputationBonus: 10,
        category: 'art',
        skillBonus: { skill: 'filmSense', amount: 1 }
    },
    {
        id: 'lux_art_sculpture',
        name: 'Antike Skulptur',
        description: 'Ein Stück Geschichte für Ihr Wohnzimmer. Beeindruckt jeden Besucher.',
        cost: 1200000,
        reputationBonus: 25,
        category: 'art'
    },
    {
        id: 'lux_art_memorabilia',
        name: 'Original Film-Requisite',
        description: 'Ein ikonischer Gegenstand aus einem Filmklassiker. Das ultimative Sammlerstück.',
        cost: 500000,
        reputationBonus: 20,
        category: 'art',
        skillBonus: { skill: 'filmSense', amount: 3 }
    },

    // Transport
    {
        id: 'lux_yacht',
        name: 'Super-Yacht',
        description: 'Feiern Sie Ihre Erfolge auf den Wellen. Der Inbegriff von Reichtum.',
        cost: 3500000,
        reputationBonus: 40,
        category: 'transport',
        skillBonus: { skill: 'charisma', amount: 3 }
    },
    {
        id: 'lux_jet',
        name: 'Privatjet',
        description: 'Reisen Sie stilvoll und unabhängig um die Welt. Zeit ist Geld.',
        cost: 12000000,
        reputationBonus: 80,
        category: 'transport',
        skillBonus: { skill: 'organizationTalent', amount: 5 } // Saves time
    },
];

export const PARTNER_SEARCH_OPTIONS: SearchOption[] = [
    {
        id: 'friends',
        name: 'Freunde fragen',
        description: 'Bitten Sie Freunde, Sie mit jemandem zu verkuppeln. Günstig, aber der Erfolg ist ungewiss.',
        cost: 0,
        successChance: 0.3,
    },
    {
        id: 'app',
        name: 'Dating App',
        description: 'Nutzen Sie die Technologie. Großes Angebot, aber die Suche nach Qualität dauert.',
        cost: 500,
        successChance: 0.4,
    },
    {
        id: 'speed_dating',
        name: 'Speed Dating',
        description: 'Lernen Sie viele Leute in kurzer Zeit kennen. Effizient.',
        cost: 200,
        successChance: 0.5,
    },
    {
        id: 'hobby',
        name: 'Hobby-Gruppe',
        description: 'Treten Sie einem Kochkurs oder Buchclub bei. Gute Chance auf gemeinsame Interessen.',
        cost: 1000,
        successChance: 0.6,
    },
    {
        id: 'matchmaking',
        name: 'VIP-Partnervermittlung',
        description: 'Eine diskrete Agentur sucht professionell nach dem perfekten Match für Sie.',
        cost: 2500,
        successChance: 0.65,
    },
    {
        id: 'gala',
        name: 'Exklusive Gala',
        description: 'Mischen Sie sich unter die High Society. Teuer, aber hohe Chance auf einflussreiche Partner.',
        cost: 5000,
        successChance: 0.7,
    },
];

export const maleFirstNames = [
    "Ben", "Paul", "Jonas", "Finn", "Leon", "Elias", "Felix", "Maximilian", "Noah", "Lukas"
];

export const femaleFirstNames = [
    "Anna", "Maria", "Sophia", "Laura", "Lena", "Julia", "Hannah", "Mia", "Emma", "Lea"
];

export const femaleLastNames = [
    "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann"
];

export const partnerProfiles = [
    "Sie ist eine ehrgeizige Anwältin mit einem scharfen Verstand und einem trockenen Humor.",
    "Sie ist eine freigeistige Künstlerin, die das Leben in vollen Zügen genießt und die Welt bereist.",
    "Sie ist eine engagierte Ärztin, die ihr ganze Energie darauf verwendet, anderen zu helfen.",
    "Sie ist eine erfolgreiche Unternehmerin, die ihr eigenes Mode-Label aufgebaut hat.",
    "Sie ist eine talentierte Musikerin, die davon träumt, eines Tages in großen Konzerthallen zu spielen.",
];

export const malePartnerProfiles = [
    "Er ist ein charmanter Architekt mit einer Leidenschaft für klassische Filme und gutem Wein.",
    "Er ist ein abenteuerlustiger Journalist, der immer auf der Suche nach der nächsten großen Geschichte ist.",
    "Er ist ein bodenständiger Handwerker, der seine eigene Werkstatt betreibt und am liebsten mit seinen Händen arbeitet.",
    "Er ist ein ehrgeiziger Investmentbanker, der die Nächte durcharbeitet, aber am Wochenende völlig abschalten kann.",
    "Er ist ein sensibler Schriftsteller, der an seinem ersten großen Roman arbeitet und von der Natur inspiriert wird.",
];

export const RELATIONSHIP_INTERACTIONS: RelationshipInteraction[] = [
    // Kostenlos / Positiv (Erholung)
    { id: 'time', name: 'Zeit verbringen', cost: 0, statusGain: 2, description: 'Ein ruhiger Abend zu Hause auf der Couch.', energyModifier: 5 },
    { id: 'walk', name: 'Spazieren gehen', cost: 0, statusGain: 3, description: 'Frische Luft und gute Gespräche im Park.', energyModifier: 10 },
    { id: 'talk', name: 'Tiefgründiges Gespräch', cost: 0, statusGain: 5, description: 'Über Wünsche und Ängste reden.', energyModifier: -2 }, // Mentally taxing but free
    { id: 'massage', name: 'Massage geben', cost: 0, statusGain: 8, description: 'Verwöhne deinen Partner.', energyModifier: -5 },
    { id: 'receive_massage', name: 'Massage bekommen', cost: 0, statusGain: 2, description: 'Lass dich verwöhnen.', energyModifier: 15 },
    
    // Kostenpflichtig / Positiv (Erholung)
    { id: 'dinner', name: 'Essen gehen', cost: 80, statusGain: 6, description: 'Ein nettes Abendessen beim Italiener.', energyModifier: 5 },
    { id: 'cinema', name: 'Kinoabend', cost: 40, statusGain: 4, description: 'Popcorn und ein guter Film.', energyModifier: 5 },
    { id: 'picnic', name: 'Picknick im Grünen', cost: 20, statusGain: 5, description: 'Selbstgemachte Snacks und Natur.', energyModifier: 8 },
    { id: 'wellness', name: 'Wellness-Tag', cost: 300, statusGain: 10, description: 'Sauna und Entspannung pur.', energyModifier: 25 },
    { id: 'weekend_trip', name: 'Wochenendtrip', cost: 500, statusGain: 15, description: 'Ein Kurzurlaub am Meer oder in den Bergen.', energyModifier: 20 },

    // Kostenlos / Negativ (Anstrengung)
    { id: 'jogging', name: 'Joggen gehen', cost: 0, statusGain: 4, description: 'Gemeinsam fit bleiben.', energyModifier: -10 },
    { id: 'hiking', name: 'Wandern', cost: 0, statusGain: 8, description: 'Eine anspruchsvolle Bergtour.', energyModifier: -15 },
    { id: 'cleaning', name: 'Hausputz', cost: 0, statusGain: 5, description: 'Gemeinsam die Wohnung aufräumen.', energyModifier: -10 },
    { id: 'cook', name: 'Zusammen kochen', cost: 20, statusGain: 4, description: 'Ein 3-Gänge Menü zaubern.', energyModifier: 5 }, // Slight positive
    
    // Kostenpflichtig / Negativ (Anstrengung)
    { id: 'dancing', name: 'Clubbing', cost: 100, statusGain: 8, description: 'Die Nacht durchtanzen.', energyModifier: -15 },
    { id: 'concert', name: 'Konzertbesuch', cost: 200, statusGain: 12, description: 'Laut, voll und aufregend.', energyModifier: -5 },
    { id: 'museum', name: 'Museumsbesuch', cost: 30, statusGain: 4, description: 'Kultur tanken (kann ermüdend sein).', energyModifier: -5 },

    // Geschenke (Neutral energy)
    { id: 'gift_small', name: 'Blumen', cost: 30, statusGain: 5, description: 'Eine kleine Aufmerksamkeit.', energyModifier: 0 },
    { id: 'gift_medium', name: 'Parfum', cost: 150, statusGain: 10, description: 'Ein klassisches Geschenk.', energyModifier: 0 },
    { id: 'gift_large', name: 'Schmuck', cost: 500, statusGain: 20, description: 'Etwas ganz Besonderes.', energyModifier: 0 },
];

export const ACQUAINTANCE_INTERACTIONS: RelationshipInteraction[] = [
    // Free / Energy Gain (Casual)
    { id: 'acq_texting', name: 'Nachrichten schreiben', cost: 0, statusGain: 2, description: 'Ein bisschen hin und her schreiben.', energyModifier: 2 },
    { id: 'acq_walk', name: 'Spaziergang', cost: 0, statusGain: 3, description: 'Ein lockerer Spaziergang im Park.', energyModifier: 5 },
    { id: 'acq_coffee', name: 'Kaffee trinken', cost: 15, statusGain: 4, description: 'Sich in einem Café treffen.', energyModifier: 5 },
    { id: 'acq_icecream', name: 'Eis essen', cost: 10, statusGain: 3, description: 'Eine süße Erfrischung.', energyModifier: 5 },
    
    // Free / Neutral or Costly Energy (Effort)
    { id: 'acq_call', name: 'Telefonieren', cost: 0, statusGain: 2, description: 'Ein kurzes Telefonat.', energyModifier: -2 },
    { id: 'acq_help', name: 'Beim Umzug helfen', cost: 0, statusGain: 10, description: 'Körperlich anstrengend, aber beeindruckend.', energyModifier: -20 },
    { id: 'acq_listen', name: 'Probleme anhören', cost: 0, statusGain: 5, description: 'Ein offenes Ohr schenken.', energyModifier: -5 },
    { id: 'acq_lend', name: 'Buch ausleihen', cost: 0, statusGain: 2, description: 'Ein gutes Buch empfehlen.', energyModifier: 0 },
    
    // Paid / Energy Gain (Fun)
    { id: 'acq_cinema', name: 'Kino', cost: 30, statusGain: 4, description: 'Zusammen einen Film sehen.', energyModifier: 5 },
    { id: 'acq_lunch', name: 'Mittagessen', cost: 40, statusGain: 5, description: 'Ein entspanntes Mittagessen.', energyModifier: 5 },
    { id: 'acq_picnic', name: 'Picknick', cost: 25, statusGain: 6, description: 'Snacks im Grünen.', energyModifier: 8 },
    { id: 'acq_museum', name: 'Museum', cost: 20, statusGain: 4, description: 'Kultur und Gespräche.', energyModifier: -2 },
    
    // Paid / Neutral or Costly Energy
    { id: 'acq_bar', name: 'In eine Bar gehen', cost: 50, statusGain: 5, description: 'Drinks am Abend.', energyModifier: -5 },
    { id: 'acq_flowers', name: 'Blumen schenken', cost: 25, statusGain: 5, description: 'Eine nette Geste.', energyModifier: 0 },
    { id: 'acq_concert', name: 'Konzert', cost: 150, statusGain: 8, description: 'Ein gemeinsames Erlebnis.', energyModifier: -10 },
    { id: 'acq_gift_small', name: 'Kleines Geschenk', cost: 40, statusGain: 6, description: 'Eine kleine Aufmerksamkeit.', energyModifier: 0 },
    { id: 'acq_dinner', name: 'Abendessen', cost: 80, statusGain: 7, description: 'Ein schickes Date.', energyModifier: 5 },
    { id: 'acq_cook', name: 'Bekochen', cost: 30, statusGain: 8, description: 'Zu Hause etwas Leckeres kochen.', energyModifier: -5 },
    { id: 'acq_flea', name: 'Flohmarkt', cost: 10, statusGain: 3, description: 'Zusammen stöbern.', energyModifier: -5 },
    { id: 'acq_jogging', name: 'Joggen', cost: 0, statusGain: 4, description: 'Sportliches Date.', energyModifier: -10 }
];
