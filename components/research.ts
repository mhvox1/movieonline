


import { Technology, ResearchTree } from "../types";

export const RESEARCH_TECHS: Technology[] = [
    // ========================================================================
    // TREE: VORPRODUKTION (Drehbuch, Planung, Casting)
    // ========================================================================
    
    // --- Branch: Filmgrößen (Budget & Scope) ---
    // Y: 0
    {
        id: 'unlock_b_plus_movie',
        name: 'B+ Movie Produktion',
        description: 'Ermöglicht die Planung von B+ Filmen mit höherem Budget und besserem Marktpotenzial.',
        cost: 100, monetaryCost: 50000, duration: 20,
        tree: ResearchTree.Vorproduktion, dependencies: [],
        position: { x: 0, y: 0 }, category: 'film_reel'
    },
    {
        id: 'unlock_a_movie',
        name: 'A-Movie Produktion',
        description: 'Schaltet professionelle Studiofilme frei. Nationales Potenzial und Chart-Chancen.',
        cost: 300, monetaryCost: 250000, duration: 45,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_b_plus_movie'],
        position: { x: 1, y: 0 }, category: 'film_reel'
    },
    {
        id: 'unlock_aa_movie',
        name: 'AA-Movie Produktion',
        description: 'Ermöglicht große Blockbuster für den internationalen Markt.',
        cost: 800, monetaryCost: 1000000, duration: 90,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_a_movie'],
        position: { x: 2, y: 0 }, category: 'film_reel'
    },
    {
        id: 'unlock_aaa_movie',
        name: 'AAA-Movie Produktion',
        description: 'Die Königsdisziplin. Mega-Blockbuster mit Rekord-Budgets.',
        cost: 2000, monetaryCost: 5000000, duration: 150,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_aa_movie'],
        position: { x: 3, y: 0 }, category: 'film_reel'
    },

    // --- Branch: Drehbuch & Storytelling ---
    // Y: 1
    {
        id: 'res_script_1',
        name: 'Grundlagen der Dramaturgie',
        description: 'Verbessert die Basis-Qualität aller im Haus geschriebenen Drehbücher leicht.',
        cost: 50, monetaryCost: 10000, duration: 15,
        tree: ResearchTree.Vorproduktion, dependencies: [],
        position: { x: 0, y: 1 }, category: 'script'
    },
    {
        id: 'res_script_2',
        name: 'Drehbuch-Software 2.0',
        description: 'Effizientere Arbeitsabläufe erhöhen die Schreibgeschwindigkeit Ihrer Autoren.',
        cost: 150, monetaryCost: 50000, duration: 30,
        tree: ResearchTree.Vorproduktion, dependencies: ['res_script_1'],
        position: { x: 1, y: 1 }, category: 'script'
    },
    {
        id: 'res_script_3',
        name: 'Masterclass Storytelling',
        description: 'Fortgeschrittene Techniken für komplexe Handlungsstränge. Erhöht die Chance auf kritische Erfolge.',
        cost: 400, monetaryCost: 150000, duration: 60,
        tree: ResearchTree.Vorproduktion, dependencies: ['res_script_2'],
        position: { x: 2, y: 1 }, category: 'script'
    },

    // --- Branch: Casting & Scouting ---
    // Y: 2
    {
        id: 'res_casting_1',
        name: 'Lokales Scouting-Netzwerk',
        description: 'Erweitert den Radius Ihrer Talentsuche. Findet Talente mit etwas höheren Startwerten.',
        cost: 75, monetaryCost: 25000, duration: 20,
        tree: ResearchTree.Vorproduktion, dependencies: [],
        position: { x: 0, y: 2 }, category: 'casting'
    },
    {
        id: 'res_casting_2',
        name: 'Nationale Datenbank',
        description: 'Zugriff auf eine landesweite Kartei. Casting-Prozesse werden schneller.',
        cost: 200, monetaryCost: 100000, duration: 40,
        tree: ResearchTree.Vorproduktion, dependencies: ['res_casting_1'],
        position: { x: 1, y: 2 }, category: 'casting'
    },
    {
        id: 'res_casting_3',
        name: 'Globale Star-Kartei',
        description: 'Ermöglicht das gezielte Abwerben von Top-Talenten der Konkurrenz (höhere Erfolgschance).',
        cost: 500, monetaryCost: 300000, duration: 80,
        tree: ResearchTree.Vorproduktion, dependencies: ['res_casting_2'],
        position: { x: 2, y: 2 }, category: 'casting'
    },

    // --- Branch: Franchise & Formate ---
    // Y: 3
    {
        id: 'unlock_sequel',
        name: 'Fortsetzungen',
        description: 'Ermöglicht die Produktion von Fortsetzungen erfolgreicher Filme. Nutzt den Hype des Vorgängers.',
        cost: 150, monetaryCost: 50000, duration: 25,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_b_plus_movie'],
        position: { x: 0, y: 3 }, category: 'film_reel'
    },
    {
        id: 'unlock_prequel',
        name: 'Prequels',
        description: 'Ermöglicht das Erzählen der Vorgeschichte. Erweitert das Universum eines Films.',
        cost: 300, monetaryCost: 100000, duration: 40,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_sequel', 'unlock_a_movie'],
        position: { x: 1, y: 3 }, category: 'film_reel'
    },
    {
        id: 'unlock_series_ensemble_small',
        name: 'Serien-Ensemble: Klein',
        description: 'Schaltet kleine Serienensembles mit mehr Figurenvielfalt frei.',
        cost: 120, monetaryCost: 60000, duration: 20,
        tree: ResearchTree.Vorproduktion, dependencies: [],
        position: { x: 0, y: 4 }, category: 'casting'
    },
    {
        id: 'unlock_series_ensemble_medium',
        name: 'Serien-Ensemble: Mittel',
        description: 'Erlaubt mittelgrosse Ensembles fuer breiter angelegte Serienproduktionen.',
        cost: 240, monetaryCost: 140000, duration: 35,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_series_ensemble_small'],
        position: { x: 1, y: 4 }, category: 'casting'
    },
    {
        id: 'unlock_series_ensemble_large',
        name: 'Serien-Ensemble: Gross',
        description: 'Schaltet grosse Ensemble-Besetzungen fuer komplexe Serienwelten frei.',
        cost: 450, monetaryCost: 300000, duration: 55,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_series_ensemble_medium'],
        position: { x: 2, y: 4 }, category: 'casting'
    },
    {
        id: 'unlock_series_ensemble_epic',
        name: 'Serien-Ensemble: Episch',
        description: 'Ermoeglicht epische Ensemblegroessen fuer Prestige- und Grossformatserien.',
        cost: 800, monetaryCost: 700000, duration: 80,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_series_ensemble_large'],
        position: { x: 3, y: 4 }, category: 'casting'
    },
    {
        id: 'unlock_series_profile_efficient',
        name: 'Serien-Produktionsprofil: Effizient',
        description: 'Schaltet effizientere Produktionsansaetze fuer Serien frei.',
        cost: 120, monetaryCost: 60000, duration: 20,
        tree: ResearchTree.Vorproduktion, dependencies: [],
        position: { x: 0, y: 5 }, category: 'script'
    },
    {
        id: 'unlock_series_profile_balanced',
        name: 'Serien-Produktionsprofil: Ausgewogen',
        description: 'Erlaubt ausgewogene Produktionsprofile mit besserem Qualitaets-Kosten-Verhaeltnis.',
        cost: 240, monetaryCost: 140000, duration: 35,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_series_profile_efficient'],
        position: { x: 1, y: 5 }, category: 'script'
    },
    {
        id: 'unlock_series_profile_ambitious',
        name: 'Serien-Produktionsprofil: Anspruchsvoll',
        description: 'Schaltet aufwendige Serienproduktionen mit hoeherem Qualitaetsanspruch frei.',
        cost: 450, monetaryCost: 300000, duration: 55,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_series_profile_balanced'],
        position: { x: 2, y: 5 }, category: 'script'
    },
    {
        id: 'unlock_series_profile_prestige',
        name: 'Serien-Produktionsprofil: Prestige',
        description: 'Die Spitzenklasse der Serienentwicklung mit maximalem Produktionsanspruch.',
        cost: 800, monetaryCost: 700000, duration: 80,
        tree: ResearchTree.Vorproduktion, dependencies: ['unlock_series_profile_ambitious'],
        position: { x: 3, y: 5 }, category: 'script'
    },


    // ========================================================================
    // TREE: GENRES (Spezialisierung)
    // ========================================================================
    
    // Start Node
    {
        id: 'res_genre_theory',
        name: 'Filmtheorie Basis',
        description: 'Das Fundament für das Verständnis verschiedener Filmgenres.',
        cost: 25, monetaryCost: 5000, duration: 5,
        tree: ResearchTree.Genres, dependencies: [],
        position: { x: 0, y: 3 }, category: 'theory'
    },

    // --- Action ---
    {
        id: 'genre_action', name: 'Genre: Action', description: 'Schaltet Boni für Actionfilme frei.',
        cost: 50, monetaryCost: 25000, duration: 15,
        tree: ResearchTree.Genres, dependencies: ['res_genre_theory'],
        position: { x: 1, y: 0 }, category: 'genre_action'
    },
    {
        id: 'spec_action', name: 'Stunt-Koordination', description: 'Spezialisierung: Verringert Unfallrisiko und erhöht Action-Bewertung.',
        cost: 150, monetaryCost: 75000, duration: 30,
        tree: ResearchTree.Genres, dependencies: ['genre_action'],
        position: { x: 2, y: 0 }, category: 'genre_action'
    },

    // --- Adventure & Western ---
    {
        id: 'genre_adventure', name: 'Genre: Abenteuer', description: 'Schaltet Boni für Abenteuerfilme frei.',
        cost: 50, monetaryCost: 25000, duration: 15,
        tree: ResearchTree.Genres, dependencies: ['res_genre_theory'],
        position: { x: 1, y: 1 }, category: 'genre_adventure'
    },
    {
        id: 'spec_adventure', name: 'Set-Logistik', description: 'Spezialisierung: Bessere Effizienz bei Außendrehs.',
        cost: 150, monetaryCost: 75000, duration: 30,
        tree: ResearchTree.Genres, dependencies: ['genre_adventure'],
        position: { x: 2, y: 1 }, category: 'genre_adventure'
    },
    {
        id: 'genre_western', name: 'Genre: Western', description: 'Schaltet Boni für Western frei.',
        cost: 100, monetaryCost: 50000, duration: 20,
        tree: ResearchTree.Genres, dependencies: ['genre_adventure'],
        position: { x: 2, y: 2 }, category: 'genre_western' // Branching off Adventure visually
    },

    // --- SciFi & Fantasy ---
    {
        id: 'genre_scifi', name: 'Genre: Sci-Fi', description: 'Schaltet Boni für Science-Fiction frei.',
        cost: 100, monetaryCost: 50000, duration: 20,
        tree: ResearchTree.Genres, dependencies: ['res_genre_theory'],
        position: { x: 1, y: 2 }, category: 'genre_scifi'
    },
    {
        id: 'spec_scifi', name: 'World Building', description: 'Spezialisierung: Erhöht die Immersion und Bewertung von Sci-Fi Welten.',
        cost: 250, monetaryCost: 100000, duration: 40,
        tree: ResearchTree.Genres, dependencies: ['genre_scifi'],
        position: { x: 2, y: 3 }, category: 'genre_scifi'
    },
    {
        id: 'genre_fantasy', name: 'Genre: Fantasy', description: 'Schaltet Boni für Fantasyfilme frei.',
        cost: 100, monetaryCost: 50000, duration: 20,
        tree: ResearchTree.Genres, dependencies: ['genre_scifi'],
        position: { x: 2, y: 4 }, category: 'genre_fantasy' // Branching off SciFi visually
    },

    // --- Drama & Romance ---
    {
        id: 'genre_drama', name: 'Genre: Drama', description: 'Schaltet Boni für Dramen frei.',
        cost: 50, monetaryCost: 25000, duration: 15,
        tree: ResearchTree.Genres, dependencies: ['res_genre_theory'],
        position: { x: 1, y: 3 }, category: 'genre_drama'
    },
    {
        id: 'spec_drama', name: 'Method Acting Support', description: 'Spezialisierung: Erhöht die schauspielerische Leistung in Dramen.',
        cost: 150, monetaryCost: 75000, duration: 30,
        tree: ResearchTree.Genres, dependencies: ['genre_drama'],
        position: { x: 2, y: 5 }, category: 'genre_drama'
    },
    {
        id: 'genre_romance', name: 'Genre: Romanze', description: 'Schaltet Boni für Liebesfilme frei.',
        cost: 75, monetaryCost: 40000, duration: 20,
        tree: ResearchTree.Genres, dependencies: ['genre_drama'],
        position: { x: 2, y: 6 }, category: 'genre_romance'
    },

    // --- Comedy & Musical ---
    {
        id: 'genre_comedy', name: 'Genre: Komödie', description: 'Schaltet Boni für Komödien frei.',
        cost: 50, monetaryCost: 25000, duration: 15,
        tree: ResearchTree.Genres, dependencies: ['res_genre_theory'],
        position: { x: 1, y: 4 }, category: 'genre_comedy'
    },
    {
        id: 'spec_comedy', name: 'Comedy Timing', description: 'Spezialisierung: Verbessert das Pacing von Komödien.',
        cost: 150, monetaryCost: 75000, duration: 30,
        tree: ResearchTree.Genres, dependencies: ['genre_comedy'],
        position: { x: 2, y: 7 }, category: 'genre_comedy'
    },
    {
        id: 'genre_musical', name: 'Genre: Musical', description: 'Schaltet Boni für Musicals frei.',
        cost: 150, monetaryCost: 80000, duration: 35,
        tree: ResearchTree.Genres, dependencies: ['genre_comedy'],
        position: { x: 3, y: 7 }, category: 'genre_musical'
    },

    // --- Horror & Thriller & Crime ---
    {
        id: 'genre_horror', name: 'Genre: Horror', description: 'Schaltet Boni für Horrorfilme frei.',
        cost: 75, monetaryCost: 30000, duration: 20,
        tree: ResearchTree.Genres, dependencies: ['res_genre_theory'],
        position: { x: 1, y: 5 }, category: 'genre_horror'
    },
    {
        id: 'spec_horror', name: 'Psychologie der Angst', description: 'Spezialisierung: Erhöht den Gruselfaktor.',
        cost: 200, monetaryCost: 90000, duration: 35,
        tree: ResearchTree.Genres, dependencies: ['genre_horror'],
        position: { x: 2, y: 8 }, category: 'genre_horror'
    },
    {
        id: 'genre_thriller', name: 'Genre: Thriller', description: 'Schaltet Boni für Thriller frei.',
        cost: 75, monetaryCost: 30000, duration: 20,
        tree: ResearchTree.Genres, dependencies: ['genre_horror'],
        position: { x: 2, y: 9 }, category: 'genre_thriller'
    },
    {
        id: 'genre_crime', name: 'Genre: Krimi', description: 'Schaltet Boni für Krimis frei.',
        cost: 75, monetaryCost: 30000, duration: 20,
        tree: ResearchTree.Genres, dependencies: ['genre_thriller'],
        position: { x: 3, y: 9 }, category: 'genre_crime'
    },

    // --- Others ---
    {
        id: 'genre_documentary', name: 'Genre: Doku', description: 'Schaltet Boni für Dokumentationen frei.',
        cost: 100, monetaryCost: 40000, duration: 25,
        tree: ResearchTree.Genres, dependencies: ['res_genre_theory'],
        position: { x: 1, y: 6 }, category: 'genre_documentary'
    },
    {
        id: 'genre_war', name: 'Genre: Krieg', description: 'Schaltet Boni für Kriegsfilme frei.',
        cost: 150, monetaryCost: 80000, duration: 30,
        tree: ResearchTree.Genres, dependencies: ['genre_action', 'genre_drama'], // Hybrid dependency logic might need simple check
        position: { x: 2, y: 10 }, category: 'genre_war'
    },


    // ========================================================================
    // TREE: PRODUKTION (Technik & Set)
    // ========================================================================

    // --- Branch: Kamera & Bild ---
    // Y: 0
    {
        id: 'tech_camera_1', name: 'HD Digital Kameras', description: 'Standard-Digitalkameras. Solide Qualität für kleines Budget.',
        cost: 100, monetaryCost: 50000, duration: 20,
        tree: ResearchTree.Production, dependencies: [],
        position: { x: 0, y: 0 }, category: 'camera'
    },
    {
        id: 'tech_camera_2', name: '4K Cinema Kameras', description: 'Kinoqualität. Erhöht die Bildqualität signifikant.',
        cost: 300, monetaryCost: 150000, duration: 40,
        tree: ResearchTree.Production, dependencies: ['tech_camera_1'],
        position: { x: 1, y: 0 }, category: 'camera'
    },
    {
        id: 'tech_camera_3', name: 'IMAX & 8K Systeme', description: 'Ultimative Bildgewalt für die größte Leinwand.',
        cost: 800, monetaryCost: 500000, duration: 80,
        tree: ResearchTree.Production, dependencies: ['tech_camera_2'],
        position: { x: 2, y: 0 }, category: 'camera'
    },

    // --- Branch: Ton & Akustik ---
    // Y: 1
    {
        id: 'tech_sound_1', name: 'Mehrspur-Aufnahme', description: 'Bessere Trennung von Dialog und Hintergrundgeräuschen.',
        cost: 80, monetaryCost: 40000, duration: 15,
        tree: ResearchTree.Production, dependencies: [],
        position: { x: 0, y: 1 }, category: 'sound'
    },
    {
        id: 'tech_sound_2', name: 'Surround 5.1 Mix', description: 'Räumlicher Klang für ein immersives Erlebnis.',
        cost: 250, monetaryCost: 120000, duration: 35,
        tree: ResearchTree.Production, dependencies: ['tech_sound_1'],
        position: { x: 1, y: 1 }, category: 'sound'
    },
    {
        id: 'tech_sound_3', name: 'Dolby Atmos Mastering', description: '3D-Soundobjekte für das perfekte Hörerlebnis.',
        cost: 600, monetaryCost: 350000, duration: 70,
        tree: ResearchTree.Production, dependencies: ['tech_sound_2'],
        position: { x: 2, y: 1 }, category: 'sound'
    },

    // --- Branch: Spezialeffekte (SFX/VFX) ---
    // Y: 2
    {
        id: 'tech_sfx_1', name: 'Green Screen Technik', description: 'Grundlegendes Compositing für einfache Effekte.',
        cost: 120, monetaryCost: 60000, duration: 25,
        tree: ResearchTree.Production, dependencies: [],
        position: { x: 0, y: 2 }, category: 'sfx'
    },
    {
        id: 'tech_sfx_2', name: 'Motion Capture', description: 'Realistische Bewegungen für digitale Charaktere.',
        cost: 350, monetaryCost: 200000, duration: 50,
        tree: ResearchTree.Production, dependencies: ['tech_sfx_1'],
        position: { x: 1, y: 2 }, category: 'sfx'
    },
    {
        id: 'tech_sfx_3', name: 'KI-Rendering & CGI', description: 'Fotorealistische Welten aus dem Computer.',
        cost: 900, monetaryCost: 750000, duration: 100,
        tree: ResearchTree.Production, dependencies: ['tech_sfx_2'],
        position: { x: 2, y: 2 }, category: 'sfx'
    },

    // --- Branch: Crew & Ausstattung (Existing IDs mapped) ---
    // Y: 3
    {
        id: 'unlock_crew_2', name: 'Studio-Standard Crew', description: 'Solides Handwerk für professionelle Ergebnisse.',
        cost: 150, monetaryCost: 80000, duration: 30,
        tree: ResearchTree.Production, dependencies: [],
        position: { x: 0, y: 3 }, category: 'crew'
    },
    {
        id: 'unlock_crew_3', name: 'Blockbuster-Crew', description: 'Erfahrene Spezialisten für große Produktionen.',
        cost: 400, monetaryCost: 250000, duration: 60,
        tree: ResearchTree.Production, dependencies: ['unlock_crew_2'],
        position: { x: 1, y: 3 }, category: 'crew'
    },
    {
        id: 'unlock_crew_4', name: 'Prestige-Paket', description: 'Die besten Leute der Branche.',
        cost: 1000, monetaryCost: 800000, duration: 120,
        tree: ResearchTree.Production, dependencies: ['unlock_crew_3'],
        position: { x: 2, y: 3 }, category: 'crew'
    },
    {
        id: 'unlock_crew_5', name: 'Movie Award-Gewinner Crew', description: 'Legendäre Fachkräfte.',
        cost: 2500, monetaryCost: 2000000, duration: 200,
        tree: ResearchTree.Production, dependencies: ['unlock_crew_4'],
        position: { x: 3, y: 3 }, category: 'crew'
    },
    
    // --- Branch: Post-Production Upgrades (Using existing Logic IDs) ---
    // Y: 4 - Editing
    { id: 'unlock_editing_3', name: 'Adv. Editing', description: 'Spezialisiertes Schnittstudio.', cost: 200, monetaryCost: 120000, duration: 30, tree: ResearchTree.Production, dependencies: [], position: { x: 0, y: 4 }, category: 'postprod' },
    { id: 'unlock_editing_4', name: 'Pro VFX Editing', description: 'Renommierte VFX-Agentur.', cost: 500, monetaryCost: 380000, duration: 50, tree: ResearchTree.Production, dependencies: ['unlock_editing_3'], position: { x: 1, y: 4 }, category: 'postprod' },
    { id: 'unlock_editing_5', name: 'Legendary Cut', description: 'Movie Award-prämierter Schnitt.', cost: 1200, monetaryCost: 1000000, duration: 90, tree: ResearchTree.Production, dependencies: ['unlock_editing_4'], position: { x: 2, y: 4 }, category: 'postprod' },

    // Y: 5 - Music
    { id: 'unlock_music_3', name: 'Composers', description: 'Engagierte Filmkomponisten.', cost: 200, monetaryCost: 120000, duration: 30, tree: ResearchTree.Production, dependencies: [], position: { x: 0, y: 5 }, category: 'music' },
    { id: 'unlock_music_4', name: 'Orchestra', description: 'Orchester-Aufnahme.', cost: 500, monetaryCost: 380000, duration: 50, tree: ResearchTree.Production, dependencies: ['unlock_music_3'], position: { x: 1, y: 5 }, category: 'music' },
    { id: 'unlock_music_5', name: 'Hans Zimmer Tier', description: 'Star-Komponist.', cost: 1200, monetaryCost: 1000000, duration: 90, tree: ResearchTree.Production, dependencies: ['unlock_music_4'], position: { x: 2, y: 5 }, category: 'music' },

    // Y: 6 - Sound
    { id: 'unlock_sound_3', name: 'Surround Mix', description: 'Surround-Sound-Mix.', cost: 200, monetaryCost: 120000, duration: 30, tree: ResearchTree.Production, dependencies: ['tech_sound_2'], position: { x: 1, y: 6 }, category: 'sound' }, // Depends on tech sound 2
    { id: 'unlock_sound_4', name: 'Dolby Cert', description: 'Dolby-Zertifizierung.', cost: 500, monetaryCost: 380000, duration: 50, tree: ResearchTree.Production, dependencies: ['unlock_sound_3'], position: { x: 2, y: 6 }, category: 'sound' },
    { id: 'unlock_sound_5', name: 'Master Audio', description: 'Movie Award-prämierter Tonmeister.', cost: 1200, monetaryCost: 1000000, duration: 90, tree: ResearchTree.Production, dependencies: ['unlock_sound_4'], position: { x: 3, y: 6 }, category: 'sound' },

    // Y: 7 - Location
    { id: 'unlock_location_2', name: 'Lokale Sets', description: 'Lokale Drehorte.', cost: 200, monetaryCost: 100000, duration: 25, tree: ResearchTree.Production, dependencies: [], position: { x: 0, y: 7 }, category: 'location' },
    { id: 'unlock_location_3', name: 'City Sets', description: 'Großstadt-Kulisse.', cost: 450, monetaryCost: 350000, duration: 40, tree: ResearchTree.Production, dependencies: ['unlock_location_2'], position: { x: 1, y: 7 }, category: 'location' },
    { id: 'unlock_location_4', name: 'Global Sets', description: 'Internationale Drehorte.', cost: 900, monetaryCost: 900000, duration: 65, tree: ResearchTree.Production, dependencies: ['unlock_location_3'], position: { x: 2, y: 7 }, category: 'location' },
    { id: 'unlock_location_5', name: 'Exotic Sets', description: 'Exotische Schauplätze.', cost: 1800, monetaryCost: 2000000, duration: 110, tree: ResearchTree.Production, dependencies: ['unlock_location_4'], position: { x: 3, y: 7 }, category: 'location' },


    // ========================================================================
    // TREE: MARKETING & VERTRIEB
    // ========================================================================
    
    // --- Branch: Werbung (Ads) ---
    // Y: 0
    { id: 'unlock_marketing_1', name: 'Plakatwerbung', description: 'Grundlegende Printwerbung.', cost: 0, monetaryCost: 0, duration: 0, tree: ResearchTree.Marketing, dependencies: [], position: { x: 0, y: 0 }, category: 'ads' },
    { id: 'unlock_marketing_2', name: 'Zeitungsanzeigen', description: 'Nationale Printkampagnen.', cost: 200, monetaryCost: 75000, duration: 20, tree: ResearchTree.Marketing, dependencies: ['unlock_marketing_1'], position: { x: 1, y: 0 }, category: 'ads' },
    { id: 'unlock_marketing_3', name: 'PR-Events', description: 'Pressekonferenzen und Events.', cost: 350, monetaryCost: 125000, duration: 30, tree: ResearchTree.Marketing, dependencies: ['unlock_marketing_2'], position: { x: 2, y: 0 }, category: 'ads' },
    { id: 'unlock_marketing_4', name: 'Radiowerbung', description: 'Spots im Radio.', cost: 500, monetaryCost: 200000, duration: 40, tree: ResearchTree.Marketing, dependencies: ['unlock_marketing_3'], position: { x: 3, y: 0 }, category: 'ads' },
    { id: 'unlock_marketing_5', name: 'Internet-Präsenz', description: 'Websites und Social Media.', cost: 700, monetaryCost: 350000, duration: 50, tree: ResearchTree.Marketing, dependencies: ['unlock_marketing_4'], position: { x: 4, y: 0 }, category: 'ads' },
    { id: 'unlock_marketing_6', name: 'TV-Spots (Nacht)', description: 'Werbung im Nachtprogramm.', cost: 1200, monetaryCost: 500000, duration: 70, tree: ResearchTree.Marketing, dependencies: ['unlock_marketing_5'], position: { x: 5, y: 0 }, category: 'ads' },
    { id: 'unlock_marketing_7', name: 'TV-Spots (Prime)', description: 'Werbung zur besten Sendezeit.', cost: 1500, monetaryCost: 1000000, duration: 90, tree: ResearchTree.Marketing, dependencies: ['unlock_marketing_6'], position: { x: 6, y: 0 }, category: 'ads' },

    // --- Branch: Marktanalyse ---
    // Y: 1
    {
        id: 'res_market_analysis_1',
        name: 'Marktanalyse',
        description: 'Ermöglicht grundlegende Einblicke in aktuelle Genre-Trends.',
        cost: 150, monetaryCost: 50000, duration: 20,
        tree: ResearchTree.Marketing, dependencies: ['unlock_marketing_1'],
        position: { x: 0, y: 1 }, category: 'ads'
    },
    {
        id: 'res_market_analysis_2',
        name: 'Erweiterte Marktanalyse',
        description: 'Liefert detailliertere Daten über Zielgruppen und Konkurrenz.',
        cost: 400, monetaryCost: 150000, duration: 45,
        tree: ResearchTree.Marketing, dependencies: ['res_market_analysis_1'],
        position: { x: 1, y: 1 }, category: 'ads'
    },
    {
        id: 'res_market_analysis_3',
        name: 'Professionelle Marktanalyse',
        description: 'Hochpräzise Vorhersagen für maximale Marktbeherrschung.',
        cost: 1000, monetaryCost: 500000, duration: 90,
        tree: ResearchTree.Marketing, dependencies: ['res_market_analysis_2'],
        position: { x: 2, y: 1 }, category: 'ads'
    },

    // ========================================================================
    // TREE: STUDIOMANAGEMENT (Gebäude & Boni)
    // ========================================================================

    // --- Branch: Gebäude ---
    // Y: 0
    {
        id: 'unlock_restaurant', name: 'Studio-Restaurant', description: 'Bessere Moral und Zusatzeinnahmen.',
        cost: 200, monetaryCost: 100000, duration: 25,
        tree: ResearchTree.Management, dependencies: [],
        position: { x: 0, y: 0 }, category: 'building'
    },
    {
        id: 'unlock_kino', name: 'Eigenes Kino', description: 'Direkte Einnahmen durch Vorführungen.',
        cost: 500, monetaryCost: 500000, duration: 45,
        tree: ResearchTree.Management, dependencies: ['unlock_restaurant'],
        position: { x: 1, y: 0 }, category: 'building'
    },
    {
        id: 'unlock_museum', name: 'Filmmuseum', description: 'Massiver Ruf-Bonus und Touristen.',
        cost: 1000, monetaryCost: 1000000, duration: 70,
        tree: ResearchTree.Management, dependencies: ['unlock_kino'],
        position: { x: 2, y: 0 }, category: 'building'
    },

    // --- Branch: Effizienz ---
    // Y: 1
    {
        id: 'eff_workflows', name: 'Agile Methoden', description: 'Beschleunigt alle Produktionsprozesse um 5%.',
        cost: 300, monetaryCost: 50000, duration: 30,
        tree: ResearchTree.Management, dependencies: [],
        position: { x: 0, y: 1 }, category: 'efficiency'
    },
    {
        id: 'eff_automation', name: 'Büro-Automatisierung', description: 'Reduziert Verwaltungskosten um 10%.',
        cost: 600, monetaryCost: 150000, duration: 50,
        tree: ResearchTree.Management, dependencies: ['eff_workflows'],
        position: { x: 1, y: 1 }, category: 'efficiency'
    },

    // --- Branch: Finanzen ---
    // Y: 2
    {
        id: 'fin_accounting', name: 'Kreative Buchhaltung', description: 'Reduziert Steuerlast leicht (legal).',
        cost: 400, monetaryCost: 100000, duration: 40,
        tree: ResearchTree.Management, dependencies: [],
        position: { x: 0, y: 2 }, category: 'finance'
    },
    {
        id: 'fin_investing', name: 'Investment-Strategien', description: 'Passives Einkommen durch angelegtes Kapital.',
        cost: 800, monetaryCost: 300000, duration: 60,
        tree: ResearchTree.Management, dependencies: ['fin_accounting'],
        position: { x: 1, y: 2 }, category: 'finance'
    },
];
