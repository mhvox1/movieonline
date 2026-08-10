import { Genre } from '../../types';
import { newspaperImage } from './eventHelpers';
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const INDUSTRY_EVENTS = [
    // --- Original Industry Events (25) ---
    {
        id: 'industry_01',
        category: 'Industry',
        title: "Konkurrenz landet Hit",
        text: "Ein konkurrierendes Filmstudio hat völlig überraschend einen Mega-Blockbuster veröffentlicht, der sämtliche Kassenrekorde bricht. Die Zuschauer stehen Schlange, und dieser eine Film dominiert derzeit die Schlagzeilen und Leinwände so sehr, dass andere Produktionen kaum eine Chance haben, wahrgenommen zu werden.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Reines Flavour-Event. Dient der Atmosphäre, simuliert Konkurrenzdruck, hat aber aktuell keine direkten Auswirkungen auf die Werte.
    {
        id: 'industry_02',
        category: 'Industry',
        title: "Genre ist 'out'",
        text: "Marktanalysen zeigen eine deutliche Übersättigung des Publikums bei einem bestimmten Genre. Die Zuschauerzahlen sind eingebrochen, und Kritiker verdrehen bereits die Augen, wenn ein weiterer Film dieser Art angekündigt wird. Es scheint, als wäre die Zeit reif für etwas Neues, denn die Nachfrage sinkt rapide.",
        imageUrl: newspaperImage,
        effect: (data) => {
            // Wähle ein zufälliges Genre
            const genres = Object.values(Genre);
            const targetGenre = pickRandom(genres);
            // Kopiere und modifiziere Trends
            const newTrends = { ...data.genreTrends };
            if (newTrends[targetGenre]) {
                newTrends[targetGenre] = {
                    ...newTrends[targetGenre],
                    popularity: Math.max(0.5, newTrends[targetGenre].popularity - 0.25), // Sinkt stark
                    momentum: -0.04, // Trend geht nach unten
                    peakDuration: 0
                };
            }
            return {
                updatedPlayerData: { ...data, genreTrends: newTrends },
                notification: `Marktanalyse: Das Interesse an ${targetGenre} ist eingebrochen!`,
                customVariables: { genre: targetGenre }
            };
        },
    },
    // Erläuterung: Senkt die Popularität eines zufälligen Genres drastisch und setzt einen negativen Trend. Filme dieses Genres werden in nächster Zeit weniger einspielen.
    {
        id: 'industry_03',
        category: 'Industry',
        title: "Genre ist 'in'",
        text: "Ein Überraschungshit hat ein fast vergessenes Genre über Nacht wiederbelebt. Plötzlich wollen alle Studios ähnliche Filme produzieren, und das Publikum kann gar nicht genug davon bekommen. Analysten sagen eine goldene Ära für diese Art von Filmen voraus, und die Nachfrage explodiert geradezu.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const genres = Object.values(Genre);
            const targetGenre = pickRandom(genres);
            const newTrends = { ...data.genreTrends };
            if (newTrends[targetGenre]) {
                newTrends[targetGenre] = {
                    ...newTrends[targetGenre],
                    popularity: Math.min(1.5, newTrends[targetGenre].popularity + 0.25), // Steigt stark
                    momentum: 0.04, // Trend geht nach oben
                    peakDuration: 0
                };
            }
            return {
                updatedPlayerData: { ...data, genreTrends: newTrends },
                notification: `Marktanalyse: ${targetGenre} erlebt einen massiven Hype!`,
                customVariables: { genre: targetGenre }
            };
        },
    },
    // Erläuterung: Erhöht die Popularität eines zufälligen Genres drastisch und setzt einen positiven Trend. Filme dieses Genres werden in nächster Zeit deutlich mehr einspielen.
    {
        id: 'industry_04',
        category: 'Industry',
        title: "Neuer Regie-Star",
        text: "Die Filmwelt hat ein neues Wunderkind! Ein junger, visionärer Regisseur wird von Kritikern und Festivals gleichermaßen gefeiert. Sein innovativer Stil und seine frische Erzählweise setzen neue Maßstäbe und inspirieren eine ganze Generation von Filmemachern. Jeder Produzent in der Stadt versucht nun, ihn unter Vertrag zu nehmen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Simuliert eine lebendige Filmwelt, in der neue Talente auftauchen.
    {
        id: 'industry_05',
        category: 'Industry',
        title: "3D-Kino Hype",
        text: "Eine neue, bahnbrechende 3D-Technologie verspricht ein revolutionäres Kinoerlebnis, das die Zuschauer mitten ins Geschehen zieht. Kinos rüsten landesweit ihre Projektoren um, und das Publikum ist begeistert von der neuen Tiefe. Filme, die dieses Format nutzen, können mit einem deutlichen Zuschauerbonus rechnen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Weist den Spieler subtil darauf hin, in Technologien zu investieren (obwohl 3D als spezifische Tech hier abstrahiert ist).
    {
        id: 'industry_06',
        category: 'Industry',
        title: "Kritiker loben Anspruch",
        text: "Führende Filmkritiker haben eine Debatte angestoßen und beklagen die Flut an seichten, formelhaften Blockbustern. Sie loben anspruchsvolle Dramen und Autorenfilme mit tiefgründigen Charakteren in den Himmel. Das intellektuelle Publikum folgt diesem Ruf und meidet zunehmend reines Popcorn-Kino.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Könnte den Spieler dazu anregen, Filme mit höherem Anspruch (Dramen) zu produzieren.
    {
        id: 'industry_07',
        category: 'Industry',
        title: "CGI-Revolution",
        text: "Ein massiver Sprung in der Computertechnologie hat die Möglichkeiten von CGI revolutioniert. Was gestern noch unmöglich schien, ist heute auf der Leinwand realisierbar. Während diese neuen visuellen Effekte atemberaubend sind, treiben die benötigte Rechenleistung und Expertise die Kosten für Pionierprojekte in die Höhe.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Thematisiert den technologischen Fortschritt in der Branche.
    {
        id: 'industry_08',
        category: 'Industry',
        title: "Legendäres Studio pleite",
        text: "Ein Beben erschüttert Hollywood: Eines der ältesten und ehemals erfolgreichsten Filmstudios musste Insolvenz anmelden. Missmanagement und eine Reihe von Flops haben den Riesen zu Fall gebracht. Dies ist ein Schock für die ganze Branche und eine Warnung an alle, die glauben, ihr Erfolg sei garantiert.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Erzeugt das Gefühl einer dynamischen Wirtschaftswelt, in der auch Große scheitern können.
    {
        id: 'industry_09',
        category: 'Industry',
        title: "Piraterie-Welle",
        text: "Eine neue Welle von hochwertigen Raubkopien aktueller Kinofilme überschwemmt das Internet und die Schwarzmärkte. Dies schadet den Einspielergebnissen an den Kinokassen erheblich, da viele potenzielle Zuschauer es vorziehen, die Filme illegal zu Hause zu sehen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Thematisiert externe Risiken für das Filmgeschäft.
    {
        id: 'industry_10',
        category: 'Industry',
        title: "Multiplex-Kinos boomen",
        text: "Das Kinoerlebnis wird größer und komfortabler. Überall im Land eröffnen riesige Multiplex-Kinos mit modernster Technik, bequemen Sitzen und Dutzenden von Leinwänden. Dies erhöht die Gesamtkapazität des Marktes und bietet mehr Filmen die Chance, gleichzeitig gezeigt zu werden.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Signalisiert eine gesunde Marktlage für Kinostarts.
    {
        id: 'industry_11',
        category: 'Industry',
        title: "Drehbuchautoren-Streik",
        text: "Die Gewerkschaft der Drehbuchautoren hat die Arbeit niedergelegt und streikt für bessere Bezahlung und Tantiemen. Die Produktion neuer Drehbücher liegt auf Eis, Talkshows gehen Wiederholungen, und laufende Produktionen müssen ohne Änderungen am Skript auskommen. Die gesamte Branche ist gelähmt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Erklärt narrativ, warum Drehbücher teurer oder knapper sein könnten (simuliert).
    {
        id: 'industry_12',
        category: 'Industry',
        title: "Neuer Schauspiel-Star",
        text: "Ein charismatischer Newcomer hat mit einer einzigen Rolle die Herzen des Publikums im Sturm erobert. Über Nacht wurde er zum gefragtesten Star der Branche. Sein Gesicht ist auf jedem Magazincover, und seine Beteiligung an einem Projekt garantierte fast schon die Aufmerksamkeit der Medien.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf die Dynamik des Star-Systems.
    {
        id: 'industry_13',
        category: 'Industry',
        title: "Sound-Revolution",
        text: "Ein neues, immersives Surround-Sound-Format wird zum Standard in den Kinos weltweit. Das Publikum erwartet nun nicht nur brillante Bilder, sondern auch einen Klang, den man fühlen kann. Filme mit herausragendem Sounddesign profitieren enorm von dieser technischen Neuerung.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Ermutigt Investitionen in die Sound-Abteilung.
    {
        id: 'industry_14',
        category: 'Industry',
        title: "Indie-Film gewinnt Hauptpreis",
        text: "Sensation bei den Filmfestspielen! Ein kleiner, unabhängiger Film ohne große Stars und mit minimalem Budget hat überraschend den Hauptpreis gewonnen. Das Interesse an Arthouse-Kino und unkonventionellen Geschichten ist sprunghaft angestiegen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Zeigt, dass auch kleine Filme (B-Movies) erfolgreich sein können.
    {
        id: 'industry_15',
        category: 'Industry',
        title: "Schauspieler-Skandal",
        text: "Ein riesiger Skandal um einen der bekanntesten und beliebtesten Schauspieler erschüttert die Branche. Enthüllungen über sein Privatleben führen zu hitzigen Debatten über Moral in Hollywood. Studios distanzieren sich, und laufende Projekte mit ihm stehen vor dem Aus.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Thematisiert das Risiko von Stars.
    {
        id: 'industry_16',
        category: 'Industry',
        title: "Neue Kameratechnik",
        text: "Eine neue Generation von digitalen Kameras, die leichter, lichtempfindlicher und flexibler ist, kommt auf den Markt. Dies ermöglicht dynamischere Aufnahmen an Orten, die früher unzugänglich waren, und verändert die visuelle Sprache des modernen Films.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Technologischer Fortschritt in der Kameratechnik.
    {
        id: 'industry_17',
        category: 'Industry',
        title: "Filmförderungsprogramm",
        text: "Gute Nachrichten für Produzenten: Ein neues staatliches Filmförderungsprogramm wurde aufgelegt, um die heimische Kulturwirtschaft zu stärken. Studios können sich nun unbürokratisch um Zuschüsse für ihre nächsten Produktionen bewerben, was die Finanzierung erleichtert.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 250 } }),
    },
    // Erläuterung: Bonus-Event. Der Spieler erhält 250 Forschungspunkte geschenkt.
    {
        id: 'industry_18',
        category: 'Industry',
        title: "Berühmter Kritiker im Zorn",
        text: "Ein einflussreicher und gefürchteter Filmkritiker ist zutiefst unzufrieden mit der aktuellen Kinolandschaft. Er hat eine Reihe vernichtender Verrisse veröffentlicht, die selbst große Blockbuster nicht verschonen. Sein Urteil hat Gewicht und beeinflusst die Besucherzahlen spürbar.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Erklärt mögliche Schwankungen im Zuschauermarkt narrativ.
    {
        id: 'industry_19',
        category: 'Industry',
        title: "Marketing-Kosten explodieren",
        text: "Die großen Studios liefern sich eine erbitterte Werbeschlacht um die Aufmerksamkeit der Zuschauer. Die Preise für TV-Spots, Plakatwände und Online-Anzeigen steigen drastisch an. Es wird immer teurer, einen Film effektiv im Markt zu positionieren.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Bereitet den Spieler mental auf steigende Kosten vor.
    {
        id: 'industry_20',
        category: 'Industry',
        title: "Remake-Welle",
        text: "Hollywood ist im Nostalgie-Fieber. Alte Klassiker aus den 70ern und 80ern werden neu verfilmt und sind an den Kinokassen überraschend erfolgreich. Das Publikum scheint sich nach bekannten Geschichten in neuem Gewand zu sehnen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Trendbeobachtung.
    {
        id: 'industry_21',
        category: 'Industry',
        title: "Star-Komponist hört auf",
        text: "Einer der legendärsten Filmkomponisten, dessen Melodien Generationen geprägt haben, gibt seinen Rücktritt bekannt. Eine Ära geht zu Ende, und Regisseure suchen verzweifelt nach neuen Talenten, die diese große Lücke füllen können.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_22',
        category: 'Industry',
        title: "Merchandising wird zum Milliardengeschäft",
        text: "Der Verkauf von Spielzeug, T-Shirts und Sammlerstücken zu Filmen hat sich zu einer riesigen Einnahmequelle entwickelt, die oft die Kinoeinnahmen übertrifft. Besonders Studios mit starken Marken im Fantasy- und Sci-Fi-Bereich profitieren enorm davon.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf die Bedeutung von Merchandising-Rechten.
    {
        id: 'industry_23',
        category: 'Industry',
        title: "Film-Gewerkschaften fordern mehr",
        text: "Mehrere Gewerkschaften der Filmbranche, von den Beleuchtern bis zu den Kostümbildnern, fordern geschlossen höhere Löhne und bessere Arbeitsbedingungen. Die Verhandlungen sind zäh, was die Produktionskosten für alle kommenden Projekte in die Höhe treibt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Simuliert steigende Produktionskosten.
    {
        id: 'industry_24',
        category: 'Industry',
        title: "Ein Filmstudio wird verkauft",
        text: "Ein großes Konkurrenzstudio wurde von einem internationalen Technologie-Konzern aufgekauft. Die neuen Besitzer verfügen über gewaltige Ressourcen und wollen den Markt mit aggressiven Strategien und hohen Budgets aufmischen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Erhöht den narrativen Konkurrenzdruck.
    {
        id: 'industry_25',
        category: 'Industry',
        title: "Versicherungsprämien steigen",
        text: "Nach einer Reihe von spektakulären und teuren Unfällen an internationalen Filmsets haben die Versicherungsgesellschaften reagiert. Sie erhöhen ihre Prämien für Filmproduktionen drastisch, insbesondere für stuntschwere Actionfilme.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf finanzielle Risiken.
    // --- New Industry Events (50) ---
    {
        id: 'industry_26',
        category: 'Industry',
        title: "Konkurrenzstudio im Plagiatsskandal",
        text: "Ein handfester Skandal erschüttert die Branche: Einem Ihrer größten Konkurrenten wird vorgeworfen, das Drehbuch für seinen letzten Blockbuster dreist plagiiert zu haben. Während Anwälte sich in Stellung bringen und der Ruf des Konkurrenten leidet, wenden sich Investoren und Talente nun verstärkt vertrauenswürdigeren Studios – wie Ihrem – zu.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: data.reputation + 1 } }),
    },
    // Erläuterung: Positives Event. Der Ruf des Spielers steigt um 1 Punkt, da die Konkurrenz schwächelt.
    {
        id: 'industry_27',
        category: 'Industry',
        title: "DVD verdrängt VHS",
        text: "Die technologische Wachablösung ist da: Die DVD mit ihrer überlegenen Bildqualität, dem digitalen Ton und dem umfangreichen Bonusmaterial verdrängt die alte VHS-Kassette rasend schnell vom Markt. Der Heimkinomarkt steht vor einem gewaltigen Umbruch, der neue Einnahmequellen verspricht.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Historischer Kontext für den Home-Entertainment-Markt.
    {
        id: 'industry_28',
        category: 'Industry',
        title: "Schauspieler-Gewerkschaft droht mit Streik",
        text: "Die Fronten sind verhärtet: Die Schauspielergewerkschaft fordert vehement höhere Mindestgagen und eine Beteiligung an Streaming-Einnahmen. Sie drohen mit einem branchenweiten Streik, der Hollywood lahmlegen könnte. Um Sicherheit zu haben, steigen die Gagenforderungen bereits jetzt vorsorglich an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Simuliert steigende Personalkosten.
    {
        id: 'industry_29',
        category: 'Industry',
        title: "Method Acting ist der neue Trend",
        text: "Schauspieler, die auch abseits der Kamera vollkommen in ihren Rollen bleiben, faszinieren Kritiker und Publikum gleichermaßen. Dieser Trend zum extremen 'Method Acting' sorgt für intensive Performances, führt aber auch zu bizarren Situationen und schwierigen Arbeitsbedingungen an den Sets.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Thema Schauspieltechnik.
    {
        id: 'industry_30',
        category: 'Industry',
        title: "Kritikerpapst geht in Rente",
        text: "Der einflussreichste und gefürchtetste Filmkritiker des Landes, dessen Daumen über Erfolg oder Misserfolg entscheiden konnte, geht in den Ruhestand. Seine meinungsbildende Macht hinterlässt ein Vakuum, das nun von einer Vielzahl neuer, jüngerer Stimmen und Blogger gefüllt wird.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Veränderung in der Medienlandschaft.
    {
        id: 'industry_31',
        category: 'Industry',
        title: "Stuntmen-Verband fordert Anerkennung",
        text: "Der Verband der Stuntleute kämpft lautstark für eine eigene Oscar-Kategorie und mehr öffentliche Anerkennung ihrer gefährlichen Arbeit. Das Thema ist in aller Munde, und Actionfilme mit echten, spektakulären Stunts erhalten dadurch deutlich mehr mediale Aufmerksamkeit.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Fokus auf Action-Genre.
    {
        id: 'industry_32',
        category: 'Industry',
        title: "Streaming-Dienst gestartet",
        text: "Ein neuer Online-Streaming-Dienst wurde gestartet und verspricht, Filme direkt über das Internet zu den Zuschauern zu bringen. Viele in der Branche sind skeptisch, ob sich dieses Modell durchsetzen wird, aber Visionäre erkennen bereits eine völlig neue Vertriebsmöglichkeit für die Zukunft.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Historischer Kontext (Aufkommen von Streaming).
    {
        id: 'industry_33',
        category: 'Industry',
        title: "Franchise-Müdigkeit",
        text: "Das Publikum scheint müde von den endlosen Fortsetzungen, Reboots und filmischen Universen zu sein. Die Einspielergebnisse für den fünften Teil einer Reihe enttäuschen, während frische, originelle Stoffe es plötzlich wieder leichter haben, an den Kinokassen zu punkten.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Marktstimmung.
    {
        id: 'industry_34',
        category: 'Industry',
        title: "Zwei große Studios fusionieren",
        text: "Ein Erdbeben in der Unternehmenslandschaft: Zwei Ihrer größten Konkurrenten haben ihre Fusion zu einem Medien-Superkonzern bekannt gegeben. Ein neuer Gigant entsteht, der über gewaltige Ressourcen verfügt und den Wettbewerb um Talente und Kinostarts deutlich verschärfen wird.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Konkurrenzdruck.
    {
        id: 'industry_35',
        category: 'Industry',
        title: "Dokumentarfilm-Boom",
        text: "Einige überraschend erfolgreiche und kontroverse Dokumentarfilme haben einen wahren Boom in den Kinos ausgelöst. Das Publikum interessiert sich plötzlich brennend für wahre Geschichten, investigative Recherchen und reale Dramen auf der großen Leinwand.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Fokus auf Dokumentationen.
    {
        id: 'industry_36',
        category: 'Industry',
        title: "Talentagentur expandiert",
        text: "Eine der größten Talentagenturen des Landes expandiert aggressiv und eröffnet eine riesige neue Abteilung, die sich nur auf die Suche nach unentdeckten Talenten spezialisiert. Der Markt wird mit neuen, hoffnungsvollen Gesichtern überschwemmt, was die Auswahl vergrößert, aber auch unübersichtlicher macht.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf Casting-Markt.
    {
        id: 'industry_37',
        category: 'Industry',
        title: "Kino-Ketten im Preiskampf",
        text: "Um die Zuschauer zurückzugewinnen, liefern sich die großen Kinoketten einen erbitterten Preiskampf mit Rabattaktionen und Abomodellen. Die deutlich niedrigeren Ticketpreise locken wieder massenhaft Menschen in die Kinosäle, was die Besucherzahlen in die Höhe treibt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Positive Marktlage.
    {
        id: 'industry_38',
        category: 'Industry',
        title: "Berühmter Regisseur macht Comeback",
        text: "Ein legendärer Regisseur, der sich vor Jahren zurückgezogen hatte und von dem man lange nichts mehr hörte, kündigt überraschend einen neuen Film an. Die Vorfreude in der Branche ist riesig, und sein Projekt zieht sofort die besten Talente an wie ein Magnet.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_39',
        category: 'Industry',
        title: "Neuer Film-Look durch digitale Farbkorrektur",
        text: "Die digitale Farbkorrektur (Color Grading) wird zum neuen Standard in der Postproduktion und ermöglicht visuell beeindruckende, stilisierte Bilder, die mit chemischem Film nicht möglich waren. Filme, die diese Technik meisterhaft nutzen, werden für ihren Look gelobt.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 150 } }),
    },
    // Erläuterung: Bonus-Event. Bringt 150 Forschungspunkte für den technischen Fortschritt.
    {
        id: 'industry_40',
        category: 'Industry',
        title: "Produktionskosten sinken durch Digitaltechnik",
        text: "Der schleichende Übergang von analogem 35mm-Film zu digitaler Aufnahmetechnik beginnt sich finanziell auszuzahlen. Die Kosten für Filmmaterial, Entwicklung und Bearbeitung sinken für alle Studios spürbar, was Budgets für andere Bereiche freisetzt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Technologischer Wandel.
    {
        id: 'industry_41',
        category: 'Industry',
        title: "Ein Star wird zum Kassengift",
        text: "Ruhm ist vergänglich. Nach einer Reihe von teuren Flops und einem peinlichen öffentlichen Skandal gilt einer der ehemals größten Stars der Welt plötzlich als Kassengift. Studios meiden ihn, und Filme mit seiner Beteiligung werden nun als hohes finanzielles Risiko eingestuft.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Risiko bei Stars.
    {
        id: 'industry_42',
        category: 'Industry',
        title: "Ausländische Investoren",
        text: "Kapitalstarke Investoren aus Asien und dem Nahen Osten haben die Filmindustrie als Prestigeobjekt entdeckt und pumpen große Summen in den Markt. Dies führt zu einem allgemeinen Anstieg der Produktionsbudgets, erhöht aber auch den Konkurrenzdruck gewaltig.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Marktveränderung.
    {
        id: 'industry_43',
        category: 'Industry',
        title: "Viral-Marketing-Trend",
        text: "Eine clevere, extrem günstige Online-Marketingkampagne für einen kleinen Horrorfilm ist zum riesigen Erfolg geworden. Plötzlich will jedes Studio 'viral gehen'. Kreative Online-Strategien werden wichtiger als teure TV-Spots, was die Marketinglandschaft verändert.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Marketing-Fokus.
    {
        id: 'industry_44',
        category: 'Industry',
        title: "Debatte über Filmlänge",
        text: "Eine hitzige öffentliche Debatte über überlange Blockbuster ist entbrannt. Zuschauer beschweren sich über 3-Stunden-Epen. Kinobetreiber bevorzugen nun deutlich kürzere Filme, um mehr Vorstellungen pro Tag zeigen zu können und so den Umsatz zu steigern.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_45',
        category: 'Industry',
        title: "Ausländischer Film gewinnt Oscar",
        text: "Sensation in Hollywood: Zum ersten Mal in der Geschichte gewinnt ein nicht-englischsprachiger Film den Oscar für den besten Film. Das Interesse des US-Publikums an internationalen Produktionen und Untertiteln steigt schlagartig an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Internationalisierung.
    {
        id: 'industry_46',
        category: 'Industry',
        title: "Film-Merchandising boomt",
        text: "Der Verkauf von Spielzeug, Kleidung und Sammlerstücken zu Filmen erreicht neue Rekordhöhen. Für viele Blockbuster sind die Lizenzeinnahmen inzwischen wichtiger als das Einspielergebnis. Studios suchen gezielt nach Stoffen, die sich gut als Spielzeug verkaufen lassen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Merchandising-Potenzial.
    {
        id: 'industry_47',
        category: 'Industry',
        title: "Verleihfenster-Streit",
        text: "Ein erbitterter Streit zwischen großen Studios und Kinoketten über die Dauer des exklusiven Kinofensters eskaliert. Die Studios wollen Filme früher digital anbieten, die Kinos fürchten um ihre Existenz. Die Unsicherheit belastet die gesamte Verleihbranche.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Vertriebsproblematik.
    {
        id: 'industry_48',
        category: 'Industry',
        title: "Neues Filmfestival gegründet",
        text: "Ein neues, glamouröses Filmfestival wurde an einem exotischen Ort gegründet und zieht dank massiver Finanzierung sofort große Stars und viel Aufmerksamkeit auf sich. Es etabliert sich schnell als neue, wichtige Plattform für Premieren und Prestige.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_49',
        category: 'Industry',
        title: "Animationsfilm-Technik Sprung",
        text: "Ein bahnbrechender computeranimierter Film setzt völlig neue technische und erzählerische Maßstäbe. Er beweist, dass Animation nicht nur für Kinder ist, und macht das Genre für ein breites Erwachsenenpublikum attraktiv, was zu einem Boom bei Animationsprojekten führt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Animations-Genre.
    {
        id: 'industry_50',
        category: 'Industry',
        title: "Nostalgie für das alte Hollywood",
        text: "Eine Welle der Nostalgie für die goldene Ära Hollywoods der 40er und 50er Jahre erfasst die Branche. Stilvolle Schwarz-Weiß-Filme, klassische Dramen und Biopics über alte Stars erleben eine überraschende Renaissance bei Kritikern und Publikum.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Genre-Vorliebe.
    {
        id: 'industry_51',
        category: 'Industry',
        title: "Steadicam wird erschwinglich",
        text: "Die Patente für Steadicam-Technologie laufen aus und günstigere Nachbauten fluten den Markt. Die fließende, schwebende Kameraführung wird auch für kleinere Produktionen zugänglich und dynamisiert die Bildsprache vieler Indie-Filme.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 100 } }),
    },
    // Erläuterung: Bonus-Event. Bringt 100 Forschungspunkte.
    {
        id: 'industry_52',
        category: 'Industry',
        title: "Filmhochschulen produzieren Talente",
        text: "Eine neue Generation hochtalentierter Absolventen der renommiertesten Filmhochschulen drängt gleichzeitig in die Branche. Sie sind technisch versiert, voller frischer Ideen und bereit, für wenig Geld zu arbeiten, um sich einen Namen zu machen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Arbeitsmarkt.
    {
        id: 'industry_53',
        category: 'Industry',
        title: "Konkurrenzstudio begeht Steuerhinterziehung",
        text: "Ein großer Skandal erschüttert einen Ihrer Rivalen: Ein Konkurrenzstudio wurde der massiven Steuerhinterziehung überführt. Ihr Ruf ist ruiniert, Führungskräfte werden verhaftet. Das Chaos beim Gegner stärkt Ihre relative Position am Markt.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: data.reputation + 1 } }),
    },
    // Erläuterung: Positives Event. Der Ruf des Spielers steigt um 1 Punkt.
    {
        id: 'industry_54',
        category: 'Industry',
        title: "Soundeffekt-Bibliotheken werden digital",
        text: "Umfangreiche, hochwertige digitale Soundeffekt-Bibliotheken werden breit verfügbar und erschwinglich. Das beschleunigt die Postproduktion von Filmen enorm und ermöglicht auch kleineren Studios ein Sounddesign auf Blockbuster-Niveau.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_55',
        category: 'Industry',
        title: "Einflussreicher Agent wechselt die Seiten",
        text: "Ein absoluter Top-Agent, der viele der größten Stars der Welt vertritt, verlässt seine alte Agentur im Streit und gründet seine eigene Firma. Dies führt zu einem Erdbeben in der Machtstruktur Hollywoods und öffnet Türen für neue Verhandlungen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_56',
        category: 'Industry',
        title: "Sequel-Flut",
        text: "Die Kinos werden von einer Flut an Fortsetzungen überschwemmt. Fast jedes Studio setzt nur noch auf sichere Marken. Das Publikum wird langsam müde von den immer gleichen Geschichten und sehnt sich nach Originalität, was Chancen für neue Stoffe bietet.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Marktstimmung.
    {
        id: 'industry_57',
        category: 'Industry',
        title: "Heimkino-Systeme werden besser",
        text: "Die Qualität von großen Flachbildfernsehern und Surround-Systemen für zu Hause verbessert sich drastisch und wird bezahlbar. Das 'Heimkino' wird zur echten Konkurrenz, was den Druck auf die Kinos erhöht, ein besonderes Erlebnis zu bieten.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_58',
        category: 'Industry',
        title: "Erhöhung der Kopierkosten",
        text: "Aufgrund einer Verknappung von Rohstoffen und gestiegener Logistikkosten sind die Preise für die Herstellung und den Vertrieb von physischen Filmkopien für Kinos unerwartet stark angestiegen. Dies belastet die Budgets aller Verleiher.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Kostenfaktor.
    {
        id: 'industry_59',
        category: 'Industry',
        title: "Praktische Effekte feiern Comeback",
        text: "Nach einer jahrelangen Flut von klinischen, schlechten CGI-Effekten sehnt sich das Publikum wieder nach der Haptik handgemachter, praktischer Effekte. Studios, die Maskenbildner und Modellbauer beherrschen, sind plötzlich wieder im Vorteil.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_60',
        category: 'Industry',
        title: "Musical-Revival",
        text: "Ein unerwarteter Überraschungserfolg an den Kinokassen hat ein massives Revival des Musical-Genres ausgelöst. Plötzlich werden überall Drehbücher mit Gesangs- und Tanzeinlagen entstaubt und produziert. Das Publikum singt mit!",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Musical-Trend.
    {
        id: 'industry_61',
        category: 'Industry',
        title: "Kult-Regisseur verstorben",
        text: "Ein legendärer und von vielen verehrter Kult-Regisseur ist überraschend verstorben. Seine Filme werden weltweit posthum gefeiert, Retrospektiven laufen im Fernsehen, und sein visueller Stil inspiriert eine ganze Welle junger Filmemacher.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_62',
        category: 'Industry',
        title: "Neues Zensur-Rating",
        text: "Eine neue, differenziertere Altersfreigabe für Filme wird eingeführt. Sie zieht die Grenzen zwischen jugendfrei und erwachsen neu und erlaubt es Filmemachern, bestimmte Themen mutiger anzugehen, ohne sofort das gefürchtete 'Ab 18'-Siegel zu erhalten.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_63',
        category: 'Industry',
        title: "Konkurrenzstudio in finanziellen Schwierigkeiten",
        text: "Einer Ihrer Hauptkonkurrenten steckt nach einer Reihe von teuren Flops in ernsten finanziellen Schwierigkeiten. Sie müssen Projekte auf Eis legen und Personal entlassen, was Ihnen die Chance gibt, Talente abzuwerben.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_64',
        category: 'Industry',
        title: "Star-Paar trennt sich",
        text: "Das berühmteste Schauspieler-Paar der Welt gibt seine schmutzige Trennung bekannt. Die Boulevardpresse dreht durch. Filme, in denen sie noch gemeinsam als Liebespaar auftreten, haben plötzlich einen morbiden Reiz und ziehen neugierige Zuschauer an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_65',
        category: 'Industry',
        title: "Aufstieg des Product Placement",
        text: "Die gezielte und oft unverhohlene Platzierung von Markenprodukten in Filmen wird zu einer immer wichtigeren und lukrativeren Einnahmequelle. Marken stehen Schlange, um in Blockbustern aufzutauchen, was die Produktionsbudgets erheblich entlasten kann.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Finanzierung.
    {
        id: 'industry_66',
        category: 'Industry',
        title: "Talkshow-König lobt Film",
        text: "Der Moderator der einflussreichsten Late-Night-Talkshow des Landes hat einen kleinen Nischenfilm in seiner Sendung in den Himmel gelobt. Über Nacht wird der unbekannte Streifen zum Gesprächsthema Nummer eins und zum garantierten Hit.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_67',
        category: 'Industry',
        title: "Verleihfirma geht bankrott",
        text: "Eine wichtige mittelgroße Filmverleihfirma, die für den Vertrieb vieler Independent-Filme verantwortlich war, musste Insolvenz anmelden. Dies hinterlässt eine Lücke im Markt und schränkt die Optionen für den Vertrieb kleinerer Produktionen vorübergehend ein.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_68',
        category: 'Industry',
        title: "Drehbuch-Wettbewerb entdeckt Talent",
        text: "Ein renommierter nationaler Drehbuch-Wettbewerb hat ein außergewöhnliches neues Autorentalent mit einer einzigartigen Stimme hervorgebracht. Alle großen Studios reißen sich nun um die Rechte an seinem prämierten Debüt-Skript.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_69',
        category: 'Industry',
        title: "Modehaus wird Filmproduzent",
        text: "Ein weltberühmtes Luxus-Modehaus steigt überraschend in die Filmproduktion ein. Sie produzieren visuell opulente, extrem stilisierte Filme, die zwar inhaltlich oft schwach sind, aber ästhetisch neue Trends setzen und viel Aufmerksamkeit erregen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_70',
        category: 'Industry',
        title: "IMAX expandiert",
        text: "Die Anzahl der IMAX-Kinos wächst weltweit rasant an. Das Publikum ist bereit, höhere Preise für das gigantische Leinwanderlebnis zu zahlen. Filme, die speziell für dieses Format gedreht oder konvertiert werden, können mit deutlich höheren Einnahmen rechnen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_71',
        category: 'Industry',
        title: "Kritiker-Verriss eines Blockbusters",
        text: "Ein mit Spannung erwarteter, teurer Sommer-Blockbuster eines Konkurrenten wird von der Kritik einhellig zerrissen. Die negativen Rezensionen verbreiten sich viral, und der Film floppt spektakulär an den Kinokassen, was Marktanteile für andere freigibt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_72',
        category: 'Industry',
        title: "3D-Brillen werden besser",
        text: "Eine neue Generation von leichteren und komfortableren 3D-Brillen kommt in die Kinos. Das Seherlebnis wird deutlich angenehmer, Kopfschmerzen gehören der Vergangenheit an, und der abgeflaute 3D-Hype wird dadurch noch einmal neu befeuert.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_73',
        category: 'Industry',
        title: "Abhörskandal bei Agentur",
        text: "Eine große Talentagentur wird des systematischen Abhörens ihrer Klienten und Konkurrenten überführt. Ein riesiger Skandal erschüttert das Vertrauen in der Branche. Viele Stars kündigen ihre Verträge und suchen nach neuen Vertretungen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'industry_74',
        category: 'Industry',
        title: "Digitales Filmarchiv",
        text: "Die Gründung eines umfassenden digitalen Filmarchivs erleichtert den Zugang zu klassischem Filmmaterial enorm. Regisseure und Autoren können nun einfacher denn je für ihre Projekte recherchieren und sich von der Filmgeschichte inspirieren lassen.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 250 } }),
    },
    // Erläuterung: Bonus-Event. Bringt 250 Forschungspunkte für das Studio.
    {
        id: 'industry_75',
        category: 'Industry',
        title: "Western erleben ein Revival",
        text: "Totgesagte leben länger! Nach einer langen Durststrecke, in der niemand mehr an das Genre glaubte, feiert der Western ein fulminantes Comeback. Ob klassisch oder modern interpretiert – das Publikum giert plötzlich wieder nach Geschichten von Revolverhelden, weiten Prärien und moralischen Konflikten unter der sengenden Sonne.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const newTrends = { ...data.genreTrends };
            if (newTrends[Genre.Western]) {
                newTrends['Western'] = {
                    ...newTrends['Western'],
                    popularity: 1.3,
                    momentum: 0.05,
                    peakDuration: 0
                };
            }
            return {
                updatedPlayerData: { ...data, genreTrends: newTrends },
                notification: "Marktanalyse: Western-Filme sind plötzlich wieder extrem gefragt!"
            };
        },
    },
    // Erläuterung: Setzt die Popularität des Genres "Western" sofort auf einen hohen Wert (1.3) und gibt ihm ein positives Momentum.
];
