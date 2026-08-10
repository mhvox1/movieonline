
import { BuildingType, Genre } from '../types';

export interface BuildingLevel {
    level: number;
    cost: number;
    duration: number;
    monthlyCost: number;
    description: string;
    bonusDescription: string;
    monthlyIncome?: number | { min: number; max: number };
    bonusEffect?: {
        researchPointsPerDay?: number;
        prestigeChance?: number;
        productionDurationMultiplier?: number;
        postProductionDurationMultiplier?: number;
        monthlySatisfactionBonus?: number;
        eventProtection?: number;
        qualityBonus?: number;
        genreQualityBonuses?: Partial<Record<Genre, number>>;
    };
    structuredBonus?: { label: string; stars: string }[];
}

export interface BuildingInfo {
    type: BuildingType;
    description: string;
    requiredTech?: string;
    levels: BuildingLevel[];
}

export const BUILDING_DATA: Record<BuildingType, BuildingInfo> = {
    [BuildingType.Burogebaude]: {
        type: BuildingType.Burogebaude,
        description: "Das Herzstück Ihres Studios. Ein Ausbau erhöht die maximale Anzahl an Mitarbeitern.",
        levels: [
            { level: 1, cost: 0, duration: 0, monthlyCost: 500, description: "Kleines Büro (3 Mitarbeiter)", bonusDescription: "Max. 3 Mitarbeiter" },
            { level: 2, cost: 50000, duration: 30, monthlyCost: 1500, description: "Mittleres Büro (6 Mitarbeiter)", bonusDescription: "Max. 6 Mitarbeiter" },
            { level: 3, cost: 250000, duration: 60, monthlyCost: 4000, description: "Großraumbüro (12 Mitarbeiter)", bonusDescription: "Max. 12 Mitarbeiter" },
             { level: 4, cost: 1000000, duration: 120, monthlyCost: 10000, description: "Firmenzentrale (25 Mitarbeiter)", bonusDescription: "Max. 25 Mitarbeiter" }
        ]
    },
    [BuildingType.Autorenbuero]: {
        type: BuildingType.Autorenbuero,
        description: "Hier arbeiten Ihre Drehbuchautoren an neuen Stoffen.",
        levels: [
            { level: 1, cost: 25000, duration: 14, monthlyCost: 800, description: "Grundlegende Ausstattung für Autoren.", bonusDescription: "Ermöglicht Drehbuch-Entwicklung" },
            { level: 2, cost: 100000, duration: 45, monthlyCost: 2000, description: "Inspirierende Umgebung.", bonusDescription: "Schreibgeschwindigkeit +10%" }
        ]
    },
    [BuildingType.CastingOffice]: {
        type: BuildingType.CastingOffice,
        description: "Verwaltung von Casting-Prozessen und Talent-Scouting.",
        levels: [
            { level: 1, cost: 30000, duration: 14, monthlyCost: 1000, description: "Casting-Büro.", bonusDescription: "Ermöglicht Casting & Scouting" },
            { level: 2, cost: 120000, duration: 45, monthlyCost: 2500, description: "Erweitertes Netzwerk.", bonusDescription: "Bessere Casting-Ergebnisse" }
        ]
    },
    [BuildingType.MarketingDepartment]: {
        type: BuildingType.MarketingDepartment,
        description: "Planung von Werbekampagnen und Marktanalyse.",
        levels: [
            { level: 1, cost: 40000, duration: 21, monthlyCost: 1200, description: "Marketing-Abteilung.", bonusDescription: "Ermöglicht Kampagnen" },
            { level: 2, cost: 150000, duration: 60, monthlyCost: 3000, description: "PR-Agentur.", bonusDescription: "Effektivere Kampagnen" }
        ]
    },
    [BuildingType.ResearchLab]: {
        type: BuildingType.ResearchLab,
        description: "Entwicklung neuer Technologien und Erforschung von Genres.",
        levels: [
            { level: 1, cost: 100000, duration: 30, monthlyCost: 2000, description: "Forschungslabor.", bonusDescription: "Ermöglicht Forschung", bonusEffect: { researchPointsPerDay: 2 } },
            { level: 2, cost: 500000, duration: 90, monthlyCost: 5000, description: "High-Tech Labor.", bonusDescription: "Forschungspunkte +5/Tag", bonusEffect: { researchPointsPerDay: 5 } }
        ]
    },
    [BuildingType.Planungsbuero]: {
        type: BuildingType.Planungsbuero,
        description: "Optimierung von Produktionsabläufen.",
        levels: [
            { level: 1, cost: 35000, duration: 21, monthlyCost: 1100, description: "Planungsbüro.", bonusDescription: "Ermöglicht Projektplanung" },
            { level: 2, cost: 140000, duration: 60, monthlyCost: 2800, description: "Projektmanagement-Center.", bonusDescription: "Planungsdauer -10%" }
        ]
    },
    [BuildingType.Studio]: {
        type: BuildingType.Studio,
        description: "Das Hauptstudio-Gelände. Verwaltung der Drehhallen.",
        levels: [
            { level: 1, cost: 100000, duration: 0, monthlyCost: 1000, description: "Grundlegende Infrastruktur.", bonusDescription: "Verwaltung von Studio 1." },
            { level: 2, cost: 500000, duration: 60, monthlyCost: 2500, description: "Erweiterte Infrastruktur.", bonusDescription: "Ermöglicht Bau von Studio 2." },
            { level: 3, cost: 2000000, duration: 120, monthlyCost: 5000, description: "High-Tech Campus.", bonusDescription: "Ermöglicht Bau von Studio 3." }
        ]
    },
    [BuildingType.Studio1]: {
        type: BuildingType.Studio1,
        description: "Hier können Filmprojekte verwirklicht werden..",
        levels: [
            { level: 1, cost: 500000, duration: 60, monthlyCost: 2000, description: "Basis-Studio.", bonusDescription: "Verfügbar für Dreharbeiten" },
            { level: 2, cost: 1500000, duration: 90, monthlyCost: 4500, description: "Modernisiertes Studio.", bonusDescription: "Verbesserte Qualität" },
            { level: 3, cost: 4000000, duration: 150, monthlyCost: 9000, description: "Smart-Studio.", bonusDescription: "Maximale Effizienz" }
        ]
    },
    [BuildingType.Studio2]: {
        type: BuildingType.Studio2,
        description: "Großes Studio für ambitionierte Projekte.",
        levels: [
            { level: 1, cost: 1000000, duration: 90, monthlyCost: 4000, description: "Großraumhalle.", bonusDescription: "Verfügbar für Dreharbeiten" },
            { level: 2, cost: 3000000, duration: 120, monthlyCost: 8500, description: "Erweiterte Fläche.", bonusDescription: "Spezialeffekte möglich" },
            { level: 3, cost: 8000000, duration: 200, monthlyCost: 18000, description: "Monumentale Halle.", bonusDescription: "Für Mega-Blockbuster" }
        ]
    },
    [BuildingType.Studio3]: {
        type: BuildingType.Studio3,
        description: "High-Tech Studio spezialisiert auf VFX.",
        levels: [
            { level: 1, cost: 2000000, duration: 120, monthlyCost: 8000, description: "Green-Screen Studio.", bonusDescription: "Verfügbar für Dreharbeiten" },
            { level: 2, cost: 5000000, duration: 180, monthlyCost: 15000, description: "Volumen-Studio.", bonusDescription: "VFX-Kosten reduziert" },
            { level: 3, cost: 12000000, duration: 300, monthlyCost: 35000, description: "Holo-Deck.", bonusDescription: "Maximale VFX-Qualität" }
        ]
    },
    [BuildingType.Bauhof]: {
        type: BuildingType.Bauhof,
        description: "Zentrale für alle Bauvorhaben. Ermöglicht paralleles Bauen.",
        levels: [
            { level: 1, cost: 200000, duration: 45, monthlyCost: 1500, description: "Kleiner Bauhof", bonusDescription: "2 Bauaufträge gleichzeitig" },
            { level: 2, cost: 750000, duration: 90, monthlyCost: 4000, description: "Großer Bauhof", bonusDescription: "3 Bauaufträge gleichzeitig" }
        ]
    },
    [BuildingType.Kino]: {
        type: BuildingType.Kino,
        description: "Ein eigenes Kino für Einnahmen.",
        levels: [
            { level: 1, cost: 250000, duration: 45, monthlyCost: 1500, monthlyIncome: { min: 2000, max: 5000 }, description: "Kleines Programmkino.", bonusDescription: "Kleine monatliche Einnahmen" },
            { level: 2, cost: 750000, duration: 90, monthlyCost: 4000, monthlyIncome: { min: 6000, max: 12000 }, description: "Multiplex-Saal.", bonusDescription: "Mittlere Einnahmen" }
        ]
    },
    [BuildingType.Restaurant]: {
        type: BuildingType.Restaurant,
        description: "Verbessert die Moral der Mitarbeiter.",
        levels: [
            { level: 1, cost: 150000, duration: 30, monthlyCost: 2000, monthlyIncome: { min: 1000, max: 3000 }, description: "Cafeteria.", bonusDescription: "Moral +1" },
            { level: 2, cost: 400000, duration: 60, monthlyCost: 5000, monthlyIncome: { min: 4000, max: 8000 }, description: "Gourmet-Restaurant.", bonusDescription: "Moral +3" }
        ]
    },
    [BuildingType.Filmmuseum]: {
        type: BuildingType.Filmmuseum,
        description: "Zieht Touristen an und steigert den Ruf.",
        levels: [
            { level: 1, cost: 1000000, duration: 120, monthlyCost: 5000, monthlyIncome: { min: 3000, max: 6000 }, description: "Museum.", bonusDescription: "Ruf +1 (Chance)", bonusEffect: { prestigeChance: 0.05 } }
        ]
    },
    [BuildingType.Backlot]: {
        type: BuildingType.Backlot,
        description: "Modulare Außensets für schnellere und glaubwürdigere Außendrehs.",
        levels: [
            {
                level: 1,
                cost: 350000,
                duration: 45,
                monthlyCost: 2500,
                description: "Kompakter Außenset-Park.",
                bonusDescription: "Produktion -5%, Action/Abenteuer/Western +2 Qualität",
                bonusEffect: {
                    productionDurationMultiplier: 0.95,
                    genreQualityBonuses: {
                        [Genre.Action]: 2,
                        [Genre.Adventure]: 2,
                        [Genre.Western]: 2,
                    },
                },
            },
            {
                level: 2,
                cost: 900000,
                duration: 75,
                monthlyCost: 5000,
                description: "Großer Set-Park mit Straßen- und Naturkulissen.",
                bonusDescription: "Produktion -12%, Action/Abenteuer/Western/Sci-Fi +4 Qualität",
                bonusEffect: {
                    productionDurationMultiplier: 0.88,
                    genreQualityBonuses: {
                        [Genre.Action]: 4,
                        [Genre.Adventure]: 4,
                        [Genre.Western]: 4,
                        [Genre.SciFi]: 4,
                    },
                },
            },
            {
                level: 3,
                cost: 2200000,
                duration: 120,
                monthlyCost: 9500,
                description: "Premium-Backlot mit variablen Mega-Sets.",
                bonusDescription: "Produktion -15%, Action/Abenteuer/Western/Sci-Fi/Kriegsfilm +6 Qualität",
                bonusEffect: {
                    productionDurationMultiplier: 0.85,
                    genreQualityBonuses: {
                        [Genre.Action]: 6,
                        [Genre.Adventure]: 6,
                        [Genre.Western]: 6,
                        [Genre.SciFi]: 6,
                        [Genre.War]: 6,
                    },
                },
            }
        ]
    },
    [BuildingType.Postproduktionshaus]: {
        type: BuildingType.Postproduktionshaus,
        description: "Schnitt, Grading und Mastering unter einem Dach.",
        levels: [
            {
                level: 1,
                cost: 450000,
                duration: 60,
                monthlyCost: 3000,
                description: "Kompakte Inhouse-Postproduktion.",
                bonusDescription: "Postproduktion -10%, Endqualität +1",
                bonusEffect: {
                    postProductionDurationMultiplier: 0.9,
                    qualityBonus: 1,
                },
            },
            {
                level: 2,
                cost: 1200000,
                duration: 90,
                monthlyCost: 7000,
                description: "Professionelles Finish-Center.",
                bonusDescription: "Postproduktion -20%, Endqualität +2",
                bonusEffect: {
                    postProductionDurationMultiplier: 0.8,
                    qualityBonus: 2,
                },
            },
            {
                level: 3,
                cost: 3000000,
                duration: 150,
                monthlyCost: 15000,
                description: "Premium-Suite für internationale Master.",
                bonusDescription: "Postproduktion -30%, Endqualität +3",
                bonusEffect: {
                    postProductionDurationMultiplier: 0.7,
                    qualityBonus: 3,
                },
            }
        ]
    },
    [BuildingType.Sicherheitszentrale]: {
        type: BuildingType.Sicherheitszentrale,
        description: "Schützt Studio, Daten und Talente vor Leaks, Paparazzi und Sabotage.",
        levels: [
            {
                level: 1,
                cost: 250000,
                duration: 30,
                monthlyCost: 2500,
                description: "Werkschutz mit Zugangskontrolle.",
                bonusDescription: "35% weniger Sicherheits- und Leak-Events",
                bonusEffect: {
                    eventProtection: 0.35,
                },
            },
            {
                level: 2,
                cost: 750000,
                duration: 60,
                monthlyCost: 6000,
                description: "Integrierte Leitstelle mit Cyber-Security.",
                bonusDescription: "60% weniger Sicherheits- und Leak-Events",
                bonusEffect: {
                    eventProtection: 0.6,
                },
            }
        ]
    },
    [BuildingType.KostuemUndMaskenatelier]: {
        type: BuildingType.KostuemUndMaskenatelier,
        description: "Spezialisiert auf Garderobe, Prothesen und charakterstarke Looks.",
        levels: [
            {
                level: 1,
                cost: 200000,
                duration: 30,
                monthlyCost: 1800,
                description: "Solides Kostüm- und Maskenteam.",
                bonusDescription: "Fantasy/Horror/Musical +2 Qualität",
                bonusEffect: {
                    genreQualityBonuses: {
                        [Genre.Fantasy]: 2,
                        [Genre.Horror]: 2,
                        [Genre.Musical]: 2,
                    },
                },
            },
            {
                level: 2,
                cost: 650000,
                duration: 75,
                monthlyCost: 4500,
                description: "Erweitertes Atelier mit Spezialmasken.",
                bonusDescription: "Fantasy/Horror/Musical/Romanze +4 Qualität",
                bonusEffect: {
                    genreQualityBonuses: {
                        [Genre.Fantasy]: 4,
                        [Genre.Horror]: 4,
                        [Genre.Musical]: 4,
                        [Genre.Romance]: 4,
                    },
                },
            },
            {
                level: 3,
                cost: 1600000,
                duration: 120,
                monthlyCost: 9000,
                description: "Preisgekröntes Atelier für Prestigeproduktionen.",
                bonusDescription: "Fantasy/Horror/Musical/Romanze/Kriegsfilm +6 Qualität",
                bonusEffect: {
                    genreQualityBonuses: {
                        [Genre.Fantasy]: 6,
                        [Genre.Horror]: 6,
                        [Genre.Musical]: 6,
                        [Genre.Romance]: 6,
                        [Genre.War]: 6,
                    },
                },
            }
        ]
    },
    [BuildingType.Betriebskita]: {
        type: BuildingType.Betriebskita,
        description: "Entlastet Familien im Team und verbessert die Bindung ans Studio.",
        levels: [
            {
                level: 1,
                cost: 180000,
                duration: 30,
                monthlyCost: 2200,
                description: "Kleine Kita mit flexiblen Betreuungszeiten.",
                bonusDescription: "Mitarbeiterzufriedenheit +4/Monat",
                bonusEffect: {
                    monthlySatisfactionBonus: 4,
                },
            },
            {
                level: 2,
                cost: 450000,
                duration: 60,
                monthlyCost: 5000,
                description: "Große Kita mit Ferienprogramm.",
                bonusDescription: "Mitarbeiterzufriedenheit +8/Monat",
                bonusEffect: {
                    monthlySatisfactionBonus: 8,
                },
            }
        ]
    },
    [BuildingType.Studiohotel]: {
        type: BuildingType.Studiohotel,
        description: "Beherbergt Gäste, Stars und Touristen direkt auf dem Gelände.",
        levels: [
            {
                level: 1,
                cost: 600000,
                duration: 75,
                monthlyCost: 4500,
                monthlyIncome: { min: 7000, max: 14000 },
                description: "Business-Hotel mit Studioblick.",
                bonusDescription: "Hohe monatliche Einnahmen",
            },
            {
                level: 2,
                cost: 1600000,
                duration: 120,
                monthlyCost: 11000,
                monthlyIncome: { min: 18000, max: 32000 },
                description: "Luxus-Resort für Stars und Branchenbesucher.",
                bonusDescription: "Sehr hohe monatliche Einnahmen",
            }
        ]
    },
    [BuildingType.Eventhalle]: {
        type: BuildingType.Eventhalle,
        description: "Vermietbar für Premieren, Galas, Messen und Fan-Events.",
        levels: [
            {
                level: 1,
                cost: 500000,
                duration: 60,
                monthlyCost: 3500,
                monthlyIncome: { min: 6000, max: 13000 },
                description: "Flexible Halle für Premieren und Firmenfeiern.",
                bonusDescription: "Solide Event-Einnahmen",
            },
            {
                level: 2,
                cost: 1400000,
                duration: 105,
                monthlyCost: 9000,
                monthlyIncome: { min: 16000, max: 28000 },
                description: "Prestige-Location für Award-Nächte und Großevents.",
                bonusDescription: "Starke Event-Einnahmen",
            }
        ]
    },
    [BuildingType.Fanshop]: {
        type: BuildingType.Fanshop,
        description: "Verkauft Merch, Sammlerstücke und exklusive Studio-Souvenirs.",
        levels: [
            {
                level: 1,
                cost: 120000,
                duration: 21,
                monthlyCost: 900,
                monthlyIncome: { min: 2500, max: 5500 },
                description: "Kleiner Merch-Shop am Besuchereingang.",
                bonusDescription: "Kleine monatliche Einnahmen",
            },
            {
                level: 2,
                cost: 350000,
                duration: 45,
                monthlyCost: 2200,
                monthlyIncome: { min: 7000, max: 12000 },
                description: "Großer Flagship-Store mit Sondereditionen.",
                bonusDescription: "Gute monatliche Einnahmen",
            }
        ]
    },
};