import { Genre, MovieSize, AgeRating } from '../types';
export const MOVIE_SIZE_CONFIG = {
    [MovieSize.B]: {
        name: "B-Movie",
        budgetSteps: [0, 50000, 100000],
        description: "Eine kleine Independent-Produktion. Geringes Einspielpotenzial, wird in Arthouse-Kinos gezeigt.",
        qualityCap: 30,
        budgetQualityPenalties: [50, 25, 0],
        budgetQualityBonuses: [0, 1, 2],
        focusPoints: [999, 999, 999]
    },
    [MovieSize.BPlus]: {
        name: "B+ Movie",
        budgetSteps: [200000, 350000, 500000],
        description: "Eine ambitionierte Independent-Produktion. Erhöht die potenzielle Zuschauerzahl um 20%.",
        requiredTech: 'unlock_b_plus_movie',
        qualityCap: 40,
        budgetQualityPenalties: [50, 25, 0],
        budgetQualityBonuses: [3, 4, 5],
        focusPoints: [999, 999, 999]
    },
    [MovieSize.A]: {
        name: "A-Movie",
        budgetSteps: [1500000, 3000000, 5000000],
        description: "Ein professioneller Studiofilm. Standard-Reichweite für nationale Kinostarts.",
        requiredTech: 'unlock_a_movie',
        qualityCap: 60,
        budgetQualityPenalties: [20, 10, 0],
        budgetQualityBonuses: [6, 7, 8],
        focusPoints: [999, 999, 999]
    },
    [MovieSize.AA]: {
        name: "AA-Movie",
        budgetSteps: [7500000, 10000000, 12500000],
        description: "Ein großer Blockbuster für den internationalen Markt. Erhöht die Zuschauerzahlen um 60% gegenüber A-Movies.",
        requiredTech: 'unlock_aa_movie',
        qualityCap: 80,
        budgetQualityPenalties: [20, 10, 0],
        budgetQualityBonuses: [9, 10, 11],
        focusPoints: [999, 999, 999]
    },
    [MovieSize.AAA]: {
        name: "AAA-Movie",
        budgetSteps: [17500000, 22500000, 25000000],
        description: "Ein Mega-Blockbuster. Maximale globale Reichweite und Zuschauerzahlen (2.5x Multiplikator).",
        requiredTech: 'unlock_aaa_movie',
        qualityCap: 100,
        budgetQualityPenalties: [20, 10, 0],
        budgetQualityBonuses: [12, 13, 14],
        focusPoints: [999, 999, 999]
    },
};
export const GENRE_IDEAL_AGE_RATING = {
    [Genre.Dokumentation]: AgeRating.FSK0,
    [Genre.Musical]: AgeRating.FSK0,
    [Genre.Comedy]: AgeRating.FSK6,
    [Genre.Adventure]: AgeRating.FSK12,
    [Genre.Fantasy]: AgeRating.FSK12,
    [Genre.SciFi]: AgeRating.FSK12,
    [Genre.Romance]: AgeRating.FSK12,
    [Genre.Drama]: AgeRating.FSK12,
    [Genre.Action]: AgeRating.FSK16,
    [Genre.Crime]: AgeRating.FSK16,
    [Genre.Thriller]: AgeRating.FSK16,
    [Genre.War]: AgeRating.FSK16,
    [Genre.Western]: AgeRating.FSK16,
    [Genre.Horror]: AgeRating.FSK18,
};
export const CASTING_OPTIONS = [
    { level: 1, name: 'Günstiges Casting', description: 'Entdeckt 2-3 Regisseure und 3-4 Schauspieler.', cost: 50000, duration: 20, actorsMin: 2, actorsMax: 3, directorsMin: 1, directorsMax: 2, bekanntheitBoost: 1 },
    { level: 2, name: 'Erweitertes Casting', description: 'Entdeckt 3-5 Regisseure und 5-7 Schauspieler.', cost: 150000, duration: 35, actorsMin: 3, actorsMax: 5, directorsMin: 2, directorsMax: 4, bekanntheitBoost: 1 },
    { level: 3, name: 'Nationales Casting', description: 'Entdeckt 6-8 Regisseure und 8-10 Schauspieler.', cost: 400000, duration: 50, actorsMin: 4, actorsMax: 7, directorsMin: 3, directorsMax: 6, bekanntheitBoost: 1 },
];
export const KAMERA_OPTIONS = [
    { level: 1, name: 'Dokumentar-Stil', description: 'Günstig, schnell. Reduziert Qualität bei schnellen Bewegungen, erhöht Realismus bei Dramen.', cost: 10000, qualityBonus: 2, durationModifier: 0.95 },
    { level: 2, name: 'Studio-Standard', description: 'Solide Allrounder-Crew mit professionellem Equipment. Guter Kompromiss.', cost: 50000, qualityBonus: 5, durationModifier: 1.0 },
    { level: 3, name: 'Hollywood-Koryphäe', description: 'Erfahrener Kameramann (DoP). Erhöht Qualität signifikant, besonders bei Action/Sci-Fi.', cost: 150000, qualityBonus: 10, durationModifier: 1.05 },
    { level: 4, name: 'Arri/Panavision-Spezialisten', description: 'Exklusives Equipment. Schaltet spezielle "Signature Shots" frei.', cost: 300000, qualityBonus: 15, durationModifier: 1.1, requiredTechs: ['unlock_crew_4'] },
    { level: 5, name: 'Movie Award-Preisträger DoP', description: 'Ein Meister seines Fachs, der visuelle Meisterwerke schafft. Astronomische Kosten.', cost: 600000, qualityBonus: 20, durationModifier: 1.15, requiredTechs: ['unlock_crew_5'] },
];
export const LICHT_OPTIONS = [
    { level: 1, name: 'Grundbeleuchtung', description: 'Minimalistisch. Lässt Thriller/Horror flach aussehen (Qualitäts-Malus).', cost: 5000, qualityBonus: 1, durationModifier: 1.0 },
    { level: 2, name: 'Professionelles Set', description: 'Industriestandard. Gutes Licht für alle Szenarien.', cost: 25000, qualityBonus: 4, durationModifier: 1.0 },
    { level: 3, name: 'Licht-Maestro', description: 'Ein Meister der Lichtsetzung, der Atmosphäre erzeugt. Massiver Bonus für Horror/Thriller.', cost: 80000, qualityBonus: 8, durationModifier: 1.05 },
    { level: 4, name: 'Experimentelles Lichtdesign', description: 'Nutzt modernste Techniken für einzigartige visuelle Stimmungen.', cost: 180000, qualityBonus: 12, durationModifier: 1.1, requiredTechs: ['unlock_crew_4'] },
    { level: 5, name: 'Licht-Virtuose', description: 'Ein weltbekannter Lichtdesigner, der jede Szene in ein Kunstwerk verwandelt.', cost: 400000, qualityBonus: 16, durationModifier: 1.1, requiredTechs: ['unlock_crew_5'] },
];
export const TON_OPTIONS = [
    { level: 1, name: 'On-Board Mikrofone', description: 'Sehr billig. Dialoge sind oft schlecht verständlich (Qualitäts-Malus).', cost: 2000, qualityBonus: 1, durationModifier: 1.0 },
    { level: 2, name: 'Standard-Tonangler', description: 'Solide Aufnahmequalität per le mostre scene.', cost: 20000, qualityBonus: 4, durationModifier: 1.0 },
    { level: 3, name: 'High-End Sound-Design', description: 'Perfekter, kristallklarer Ton. Bonus für Musicals und Actionfilme.', cost: 60000, qualityBonus: 8, durationModifier: 1.0 },
    { level: 4, name: 'Surround-Sound-Spezialist', description: 'Nimmt den Ton direkt für mehrkanalige Systeme auf. Enormer Immersions-Bonus.', cost: 150000, qualityBonus: 12, durationModifier: 1.05, requiredTechs: ['unlock_sound_4'] },
    { level: 5, name: 'Akustik-Genie', description: 'Ein preisgekrönter Tonmeister, der eine perfekte Klanglandschaft erschafft.', cost: 350000, qualityBonus: 16, durationModifier: 1.05, requiredTechs: ['unlock_sound_5'] },
];
export const AUSSTATTUNG_OPTIONS = [
    { level: 1, name: 'Minimalistisch', description: 'Verlässt sich auf vorhandene Locations. Welt fühlt sich leer an (Malus für Fantasy/Sci-Fi).', cost: 0, qualityBonus: 0, durationModifier: 1.0 },
    { level: 2, name: 'Detailverliebt', description: 'Baut glaubwürdige und detaillierte Sets. Guter Standard.', cost: 80000, qualityBonus: 5, durationModifier: 1.05 },
    { level: 3, name: 'Opulent & Preisgekrönt', description: 'Erschafft atemberaubende Welten. Enormer Bonus für Kostüm-fokussierte Filme.', cost: 250000, qualityBonus: 10, durationModifier: 1.1 },
    { level: 4, name: 'Historisch Akkurat', description: 'Ein Team von Historikern sorgt für perfekte Authentizität. Immens teuer.', cost: 500000, qualityBonus: 15, durationModifier: 1.15, requiredTechs: ['unlock_crew_4'] },
    { level: 5, name: 'Visionärer Set-Designer', description: 'Engagieren Sie einen weltberühmten Designer, dessen Sets selbst zu Kunstwerken werden.', cost: 900000, qualityBonus: 20, durationModifier: 1.2, requiredTechs: ['unlock_crew_5'] },
];
export const SFX_OPTIONS = [
    { level: 1, name: 'Handgemacht & Praktisch', description: 'Günstige, kreative Lösungen (Kunstblut, Seilzüge). Kann bei B-Movies charmant wirken.', cost: 10000, qualityBonus: 2, durationModifier: 1.0 },
    { level: 2, name: 'Pyrotechnik-Profi', description: 'Lizenziert für Explosionen und Feuer. Wichtig für Action- und Kriegsfilme.', cost: 75000, qualityBonus: 6, durationModifier: 1.05 },
    { level: 3, name: 'Hollywood-Action-Unit', description: 'Experten für komplexe Stunts, Verfolgungsjagden und große Explosionen.', cost: 200000, qualityBonus: 11, durationModifier: 1.1 },
    { level: 4, name: 'Animatronics-Spezialisten', description: 'Bauen komplexe mechanische Kreaturen und Roboter für realistische Effekte ohne CGI.', cost: 450000, qualityBonus: 16, durationModifier: 1.15, requiredTechs: ['unlock_crew_4'] },
    { level: 5, name: 'State-of-the-Art SFX', description: 'Ein Team, das die Grenzen des praktisch Möglichen neu definiert. Revolutionäre Effekte.', cost: 850000, qualityBonus: 22, durationModifier: 1.2, requiredTechs: ['unlock_crew_5'] },
];
export const CATERING_OPTIONS = [
    { level: 1, name: 'Kaffee & Donuts', description: 'Keine Extrakosten. Die Moral der Crew und Talente sinkt langsam.', cost: 0, qualityBonus: 0, durationModifier: 1.0, moralModifier: -5 },
    { level: 2, name: 'Solide Kantine', description: 'Moderate Kosten. Die Moral bleibt stabil.', cost: 25000, qualityBonus: 0, durationModifier: 1.0, moralModifier: 0 },
    { level: 3, name: 'Gourmet-Catering', description: 'Teuer. Die Moral steigt. Verringert die Wahrscheinlichkeit für negative Events.', cost: 70000, qualityBonus: 0, durationModifier: 0.98, moralModifier: 10 },
    { level: 4, name: 'Persönlicher Starkoch', description: 'Ein renommierter Koch kümmert sich um das leibliche Wohl. Die Moral steigt deutlich.', cost: 150000, qualityBonus: 0, durationModifier: 0.96, moralModifier: 15 },
    { level: 5, name: 'Michelin-Stern-Verpflegung', description: 'Jeder Tag am Set ist ein kulinarisches Erlebnis. Die Crew ist begeistert und extrem produktiv.', cost: 300000, qualityBonus: 0, durationModifier: 0.94, moralModifier: 20 },
];
export const LOCATION_OPTIONS = [
    { level: 1, name: 'Studiogelände', description: 'Günstig und kontrollierbar, kann aber künstlich wirken.', cost: 10000, qualityBonus: 2, durationModifier: 1.0 },
    { level: 2, name: 'Lokale Drehorte', description: 'Verleiht dem Film Authentizität in der nahen Umgebung.', cost: 75000, qualityBonus: 5, durationModifier: 1.05, requiredTechs: ['unlock_location_2'] },
    { level: 3, name: 'Großstadt-Kulisse', description: 'Dreharbeiten in bekannten Metropolen wie New York oder L.A.', cost: 250000, qualityBonus: 10, durationModifier: 1.1, requiredTechs: ['unlock_location_3'] },
    { level: 4, name: 'Internationale Drehorte', description: 'Steigert den Schauwert, ist aber logistisch aufwändig.', cost: 500000, qualityBonus: 15, durationModifier: 1.2, requiredTechs: ['unlock_location_4'] },
    { level: 5, name: 'Exotische Schauplätze', description: 'Atemberaubende und einzigartige Orte, die das Publikum fesseln.', cost: 1000000, qualityBonus: 20, durationModifier: 1.3, requiredTechs: ['unlock_location_5'] },
];
export const EXTRAS_OPTIONS = [
    { level: 1, name: 'Keine Statisten', description: 'Spart Geld, aber Szenen wirken leer.', cost: 0, qualityBonus: 0 },
    { level: 2, name: 'Ein paar Dutzend', description: 'Für kleinere Hintergrundszenen.', cost: 15000, qualityBonus: 2 },
    { level: 3, name: 'Hunderte', description: 'Füllt eine belebte Straße oder einen Saal.', cost: 75000, qualityBonus: 5 },
    { level: 4, name: 'Tausende & Stunt-Statisten', description: 'Für beeindruckende Massenszenen mit trainierten Komparsen.', cost: 250000, qualityBonus: 8 },
    { level: 5, name: 'Epische Heerscharen', description: 'Zehntausende digital vervielfachte Statisten für monumentale Schlachten.', cost: 600000, qualityBonus: 12 },
];
export const EDITING_OPTIONS = [
    { level: 1, name: 'Junior Editor', description: 'Ein junger, motivierter Cutter. Schnell und günstig, aber ohne Finesse.', cost: 5000, duration: 10, qualityBonus: 2, requiredTechs: [] },
    { level: 2, name: 'Erfahrenes Schnitt-Team', description: 'Ein professionelles Team sorgt für einen sauberen, industrietauglichen Schnitt.', cost: 30000, duration: 15, qualityBonus: 5, requiredTechs: [] },
    { level: 3, name: 'Spezialisiertes Studio', description: 'Ein externes Studio, das auf das Genre Ihres Films spezialisiert ist (z.B. schnelle Schnitte für Action).', cost: 120000, duration: 25, qualityBonus: 10, requiredTechs: ['unlock_editing_3'] },
    { level: 4, name: 'Renommierte VFX-Agentur', description: 'Eine berühmte Agentur, die nicht nur den Schnitt veredelt, sondern auch hochwertige visuelle Effekte einfügt.', cost: 400000, duration: 40, qualityBonus: 15, requiredTechs: ['unlock_editing_4'] },
    { level: 5, name: 'Preisgekrönter Editor', description: 'Ein legendärer Cutter, bekannt für seinen einzigartigen Stil. Sorgt für maximalen narrativen Fluss und Prestige.', cost: 800000, duration: 50, qualityBonus: 20, requiredTechs: ['unlock_editing_5'] },
];
export const MUSIC_OPTIONS = [
    { level: 1, name: 'Archivmusik (Lizenzfrei)', description: 'Günstige, generische Musik aus einem Archiv. Funktional, aber ohne Wiedererkennungswert.', cost: 2000, duration: 0, qualityBonus: 1, requiredTechs: [] },
    { level: 2, name: 'Lokaler Komponist', description: 'Ein lokaler Künstler erstellt einen einfachen, aber individuellen Score für den Film.', cost: 20000, duration: 15, qualityBonus: 4, requiredTechs: [] },
    { level: 3, name: 'Engagierter Filmkomponist', description: 'Ein professioneller Komponist schreibt einen maßgeschneiderten Soundtrack, der die Szenen perfekt untermalt.', cost: 100000, duration: 25, qualityBonus: 8, requiredTechs: ['unlock_music_3'] },
    { level: 4, name: 'Orchester-Aufnahme', description: 'Der Soundtrack wird von einem vollen Symphonieorchester eingespielt. Episch und hochwertig.', cost: 350000, duration: 35, qualityBonus: 14, requiredTechs: ['unlock_music_4'] },
    { level: 5, name: 'Star-Komponist', description: 'Ein weltberühmter Komponist liefert einen ikonischen Soundtrack, der selbst zum Marketing-Argument wird.', cost: 950000, duration: 50, qualityBonus: 20, requiredTechs: ['unlock_music_5'] },
];
export const SOUND_OPTIONS = [
    { level: 1, name: 'Standard-Stereo-Mix', description: 'Eine einfache Abmischung. Dialoge sind verständlich, Effekte klingen aber flach.', cost: 10000, duration: 10, qualityBonus: 1, requiredTechs: [] },
    { level: 2, name: 'Professionelles Sounddesign', description: 'Ein Sounddesigner erstellt eine detaillierte Klanglandschaft mit Umgebungsgeräuschen und Effekten.', cost: 50000, duration: 15, qualityBonus: 4, requiredTechs: [] },
    { level: 3, name: 'Surround-Sound-Mix', description: 'Eine 5.1-Surround-Abmischung für ein immersives Klangerlebnis im Kino.', cost: 180000, duration: 20, qualityBonus: 8, requiredTechs: ['unlock_sound_3'] },
    { level: 4, name: 'Dolby-Zertifizierung', description: 'Eine offizielle Dolby-Zertifizierung, die den höchsten Industriestandards entspricht. Ein Qualitätsmerkmal.', cost: 450000, duration: 30, qualityBonus: 14, requiredTechs: ['unlock_sound_4'] },
    { level: 5, name: 'Movie Award-prämierter Tonmeister', description: 'Ein Meister seines Fachs, der eine atemberaubende und preisverdächtige Klangkulisse erschafft.', cost: 750000, duration: 40, qualityBonus: 18, requiredTechs: ['unlock_sound_5'] },
];
export const GENRE_UNLOCKS = {
    'genre_action': Genre.Action,
    'genre_drama': Genre.Drama,
    'genre_comedy': Genre.Comedy,
    'genre_horror': Genre.Horror,
    'genre_scifi': Genre.SciFi,
    'genre_thriller': Genre.Thriller,
    'genre_adventure': Genre.Adventure,
    'genre_romance': Genre.Romance,
    'genre_fantasy': Genre.Fantasy,
    'genre_crime': Genre.Crime,
    'genre_musical': Genre.Musical,
    'genre_war': Genre.War,
    'genre_western': Genre.Western,
    'genre_documentary': Genre.Dokumentation,
};
export const FONT_FAMILIES = ['Cinzel', 'Lato', 'Roboto', 'Montserrat', 'Oswald', 'Playfair Display', 'Georgia', 'Verdana', 'Impact', 'Courier New', 'Comic Sans MS', 'Arial', 'Times New Roman'];
export const TITLE_POSITIONS = ['top', 'top-center', 'center', 'bottom-center', 'bottom'];
export const FONT_COLORS = ['#FFFFFF', '#000000', '#FBBF24', '#F59E0B', '#D97706', '#F87171', '#EF4444', '#B91C1C', '#67E8F9', '#06B6D4', '#0E7490', '#F472B6', '#EC4899', '#BE185D', '#1D4ED8', '#1E40AF', '#166534', '#14532D', '#1F2937', '#E5E7EB'];
