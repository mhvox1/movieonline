import { applyTransaction, newspaperImage } from './eventHelpers';
export const WORLD_EVENTS = [
    // --- Original World Events (25) ---
    {
        id: 'world_01',
        category: 'World',
        title: "Wirtschaftsboom!",
        text: "Die Weltwirtschaft erlebt einen beispiellosen Aufschwung, der Analysten und Experten gleichermaßen staunen lässt. Das verfügbare Einkommen der privaten Haushalte erreicht neue Rekordniveaus, und die Arbeitslosenquote ist auf einem historischen Tiefstand. Die Menschen sind in Feierlaune und suchen nach Möglichkeiten, ihr Geld auszugeben. Kinos, Theater und Freizeiteinrichtungen melden Besucherrekorde. Es ist die perfekte Zeit, um Filme zu veröffentlichen, da das Publikum bereitwillig Geld für Unterhaltung ausgibt.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: data.reputation + 1 } }),
    },
    // Erläuterung: Positives Event. Der Ruf des Studios steigt um 1 Punkt, da die Stimmung allgemein gut ist.
    {
        id: 'world_02',
        category: 'World',
        title: "Wirtschaftsrezession",
        text: "Dunkle Wolken ziehen am globalen Wirtschaftshimmel auf. Eine schwere Rezession hat die Märkte erfasst, Firmenpleiten häufen sich, und die Unsicherheit in der Bevölkerung wächst täglich. Die Menschen müssen den Gürtel enger schnallen und sparen zuerst bei Luxusgütern und Freizeitaktivitäten. Der Kinobesuch, einst ein selbstverständliches Wochenendvergnügen, wird für viele Familien unerschwinglich, was zu einem spürbaren Rückgang der Ticketverkäufe in allen Genres führt.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: Math.max(0, data.reputation - 1) } }),
    },
    // Erläuterung: Negatives Event. Der Ruf des Studios sinkt um 1 Punkt (symbolisiert schlechtere Marktstimmung).
    {
        id: 'world_03',
        category: 'World',
        title: "Ölkrise",
        text: "Die politischen Spannungen in den ölfördernden Regionen haben zu einer massiven Versorgungskrise geführt. Die Preise an den Zapfsäulen explodieren und lösen eine Kettenreaktion in der gesamten Wirtschaft aus. Für die Filmindustrie bedeutet dies drastisch gestiegene Kosten für die Logistik: Der Transport von Equipment und Crew zu Drehorten wird zum Luxus, und auch die Herstellung von auf Erdöl basierenden Materialien wie Filmrollen und Plastikrequisiten verteuert sich signifikant.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Dient der Atmosphäre, aktuell keine direkte Änderung von Werten.
    {
        id: 'world_04',
        category: 'World',
        title: "Kalter Krieg Eskaliert",
        text: "Der Eiserne Vorhang scheint undurchdringlicher denn je. Die diplomatischen Beziehungen zwischen den Supermächten sind auf einem Tiefpunkt angelangt, und die Angst vor einem nuklearen Konflikt ist in den Nachrichten allgegenwärtig. In dieser Zeit der globalen Unsicherheit sucht das Publikum im Kino nach starken Heldenfiguren und moralischer Klarheit. Patriotische Actionfilme und Kriegsfilme, die den Sieg des Guten über das Böse zelebrieren, sind derzeit extrem gefragt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Gibt Hinweise auf gefragte Genres (Action/Krieg), ändert aber keine Werte direkt.
    {
        id: 'world_05',
        category: 'World',
        title: "Politische Entspannung",
        text: "Ein Wind des Wandels weht durch die internationale Politik. Erfolgreiche Abrüstungsgespräche und historische Handschläge zwischen Staatschefs signalisieren eine neue Ära der Entspannung und Diplomatie. Die akute Angst vor einem Krieg weicht einer Welle der Hoffnung. Das Publikum hat das Interesse an düsteren Konfliktszenarien und militärischer Propaganda verloren und wendet sich offeneren, menschlicheren Themen zu.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_06',
        category: 'World',
        title: "Technologie-Hype",
        text: "Wir leben in der Zukunft! Der Siegeszug der Heimcomputer und Videospielekonsolen ist nicht mehr aufzuhalten. Eine ganze Generation wächst mit digitalen Welten auf und ist fasziniert von den unbegrenzten Möglichkeiten der Technologie. Science-Fiction-Filme, die futuristische Visionen, künstliche Intelligenz oder Cyberspace-Themen behandeln, treffen genau den Nerv der Zeit und füllen die Kinosäle bis auf den letzten Platz.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf Sci-Fi Genre.
    {
        id: 'world_07',
        category: 'World',
        title: "Oscar-Verleihung",
        text: "Glamour, Glanz und Gloria! Die diesjährige Oscar-Verleihung war ein TV-Ereignis der Superlative und hat weltweit Millionen von Zuschauern vor die Bildschirme gelockt. Die strahlenden Sieger, die emotionalen Dankesreden und die spektakuläre Show haben die Liebe zum Kino in der breiten Bevölkerung neu entfacht. Das allgemeine Interesse an qualitativ hochwertigen Filmproduktionen ist spürbar gestiegen, was sich positiv auf das Ansehen der gesamten Branche auswirkt.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: data.reputation + 1 } }),
    },
    // Erläuterung: Positives Event. Erhöht den Ruf um 1 Punkt.
    {
        id: 'world_08',
        category: 'World',
        title: "Kino-Branche in der Defensive",
        text: "Hollywood kapituliert vor dem Sport. Angesichts des laufenden Mega-Events haben mehrere große Verleiher ihre Blockbuster-Starts kurzfristig verschoben, um einer direkten Konfrontation aus dem Weg zu gehen. Analysten sprechen von einem 'historischen Sommerloch', verursacht durch die Dominanz der Sportberichterstattung. Wer jetzt einen Film startet, kämpft gegen Windmühlen. Die Devise der Studios lautet: Füße stillhalten, bis der Pokal vergeben und die Schlussfeier beendet ist.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Simuliert Zuschauerschwund.
    {
        id: 'world_09',
        category: 'World',
        title: "Politischer Skandal",
        text: "Ein gewaltiger Korruptionsskandal in den höchsten Regierungskreisen wurde von investigativen Journalisten aufgedeckt. Das Vertrauen der Bevölkerung in die Politik ist erschüttert, und Zynismus macht sich breit. Das Publikum ist fasziniert von den dunklen Machenschaften der Macht und strömt in Scharen in düstere Krimis, Polit-Thriller und Verschwörungsfilme, die genau diese Themen aufgreifen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf Krimi/Thriller.
    {
        id: 'world_10',
        category: 'World',
        title: "Königliche Hochzeit",
        text: "Ein royales Märchen wird wahr und verzaubert die ganze Welt. Die prunkvolle Hochzeit im Königshaus wird live in alle Länder übertragen und sorgt für eine Welle der Romantik. Die Menschen sehnen sich nach Happy Ends und großen Gefühlen. Romantische Komödien und Liebesdramen erleben einen Boom, da das Publikum die magische Stimmung auch auf der großen Leinwand nachempfinden möchte.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf Romanze.
    {
        id: 'world_11',
        category: 'World',
        title: "Börsencrash",
        text: "Schwarzer Tag an der Börse! Panikverkäufe haben Milliarden an Werten in wenigen Stunden vernichtet. Fast alle Aktienkurse sind dramatisch eingebrochen (25-67%). Investoren ziehen ihr Kapital fluchtartig ab. Die Finanzierung neuer Projekte wird extrem schwierig, da Banken kaum noch Kredite vergeben. Ihr Kapital und Ihr Portfolio sind plötzlich deutlich weniger wert.",
        imageUrl: newspaperImage,
        effect: (data) => {
            // Aktienkurse crashen lassen
            const newStocks = data.stocks.map(stock => {
                const drop = 0.25 + Math.random() * 0.42; // 25% bis 67% Verlust
                const newPrice = Math.max(0.01, stock.price * (1 - drop));
                return { ...stock, price: newPrice, history: [...stock.history, newPrice] };
            });
            // Kapital wird um 5% reduziert
            return { updatedPlayerData: { ...data, stocks: newStocks, capital: data.capital * 0.95 } };
        },
    },
    // Erläuterung: Massives negatives Event. Alle Aktien verlieren stark an Wert und das Barkapital des Spielers sinkt um 5%.
    {
        id: 'world_12',
        category: 'World',
        title: "Neue Musikrichtung",
        text: "Eine neue, aufregende Musikrichtung erobert die Charts und die Herzen der Jugend im Sturm. Ob Grunge, Techno oder ein neuer Pop-Trend – der Sound dominiert das Radio und das Lebensgefühl einer ganzen Generation. Musicals, Tanzfilme und Produktionen mit starken Soundtracks sind plötzlich wieder extrem angesagt, da die Fans ihre neue Lieblingsmusik auch visuell erleben wollen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf Musical.
    {
        id: 'world_13',
        category: 'World',
        title: "Steuererleichterungen",
        text: "Gute Nachrichten aus der Hauptstadt! Um den Kulturstandort zu stärken und Arbeitsplätze in der Kreativwirtschaft zu sichern, hat die Regierung ein umfassendes Paket an Steuererleichterungen für die heimische Filmindustrie verabschiedet. Diese unerwartete Finanzspritze entlastet die Budgets erheblich und ermöglicht Investitionen, die zuvor undenkbar waren. Ihr Studio profitiert direkt von dieser Rückerstattung.",
        imageUrl: newspaperImage,
        effect: (data) => {
            // 50k bis 100k oder 10% des Kapitals (was kleiner ist)
            const amount = Math.min(50000 + Math.floor(Math.random() * 100000), Math.floor(data.capital * 0.1));
            return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Steuererleichterung', amount, 'taxBreak') };
        },
    },
    // Erläuterung: Positives Event. Der Spieler erhält eine Geldsumme (Steuerrückzahlung).
    {
        id: 'world_14',
        category: 'World',
        title: "Strengere Zensur",
        text: "Eine Welle des Konservatismus rollt durch das Land. Moralwächter und besorgte Politiker haben erfolgreich strengere Zensurgesetze durchgesetzt, um die Jugend vor vermeintlich schädlichen Einflüssen zu schützen. Die Prüfstellen bewerten Filme nun deutlich härter. Besonders gewalttätige Actionfilme oder freizügige Dramen haben es schwer, eine Freigabe zu erhalten, was ihre Marktchancen einschränkt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Narrativer Kontext.
    {
        id: 'world_15',
        category: 'World',
        title: "Videotheken boomen",
        text: "Das Heimkino erobert die Wohnzimmer! Videorekorder werden immer erschwinglicher, und an jeder Ecke eröffnet eine neue Videothek. Der Verleih von Filmen für zu Hause boomt wie nie zuvor und schafft einen riesigen neuen Zweitmarkt für die Filmindustrie. Filme, die im Kino nur mäßig liefen, bekommen hier eine zweite Chance, Kultstatus zu erreichen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Narrativer Kontext für Home-Entertainment.
    {
        id: 'world_16',
        category: 'World',
        title: "Generationenwechsel",
        text: "Demografische Studien zeigen einen deutlichen Wandel: Eine neue Generation von Teenagern und jungen Erwachsenen drängt in die Kinos. Sie haben ihre eigenen Idole, ihren eigenen Slang und ihre eigenen Themen. Die alten Stars und Erzählmuster ziehen nicht mehr so wie früher. Der Markt verlangt nach frischen Gesichtern und modernen Geschichten.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_17',
        category: 'World',
        title: "Inflation Galoppiert",
        text: "Die Geldentwertung galoppiert und frisst die Ersparnisse auf. Die Preise für Waren und Dienstleistungen steigen fast täglich an. Das trifft auch die Filmproduktion mit voller Härte: Gagenforderungen der Crew steigen, Baumaterialien für Sets werden unbezahlbar. Zudem reagieren Banken mit Zinserhöhungen. Ihr vorhandenes Kapital verliert rapide an Kaufkraft und Kredite werden teurer.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const increase = 0.75 + Math.random() * 0.75; // Zinserhöhung
            return {
                updatedPlayerData: {
                    ...data,
                    capital: data.capital * 0.9, // 10% Kapitalverlust durch Inflation
                    interestRateModifier: (data.interestRateModifier || 0) - increase // Negativer Modifier erhöht Zinsen in der Formel
                }
            };
        },
    },
    // Erläuterung: Negatives Event. Verringert das Kapital um 10% und erhöht die Kreditzinsen dauerhaft.
    {
        id: 'world_18',
        category: 'World',
        title: "Nostalgie-Welle",
        text: "Vielleicht ist es die Unsicherheit der Gegenwart, die die Menschen in die Vergangenheit blicken lässt. Eine starke Welle der Nostalgie erfasst die Popkultur. Die Menschen schwelgen in Erinnerungen an 'die gute alte Zeit', sei es die Mode der 50er oder die Musik der 70er. Filme, die in vergangenen Epochen spielen oder klassische Stilelemente nutzen, treffen den Nerv der Zeit perfekt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_19',
        category: 'World',
        title: "Internationale Krisen",
        text: "Unruhen, Handelskriege und politische Instabilität in mehreren Schlüsselregionen der Welt dämpfen die internationalen Einspielergebnisse. Wichtige Exportmärkte brechen weg oder sind nur noch schwer zugänglich. Der globale Filmmarkt ist unberechenbar geworden, und Studios müssen sich wieder stärker auf den heimischen Markt konzentrieren, um ihre Kosten zu decken.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_20',
        category: 'World',
        title: "Archäologischer Fund",
        text: "Eine sensationelle Entdeckung im Dschungel oder in der Wüste fesselt die Weltöffentlichkeit. Archäologen haben ein unberührtes Grab oder eine versunkene Stadt gefunden. Die Bilder gehen um die Welt und entfachen die Abenteuerlust der Menschen. Das Publikum ist hungrig nach großen Abenteuerfilmen, Schatzsuchen und exotischen Schauplätzen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf Abenteuer-Genre.
    {
        id: 'world_21',
        category: 'World',
        title: "Literaturnobelpreis",
        text: "Ein berühmter und gesellschaftskritischer Autor gewinnt den Literaturnobelpreis. Seine Werke stehen plötzlich wieder auf den Bestsellerlisten, und das intellektuelle Klima im Land ändert sich. Das Interesse an anspruchsvollen Literaturverfilmungen, tiefgründigen Dramen und komplexen Charakterstudien steigt spürbar an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Hinweis auf Drama.
    {
        id: 'world_22',
        category: 'World',
        title: "Streik der Fluglotsen",
        text: "Nichts geht mehr am Himmel! Ein landesweiter, unbefristeter Streik der Fluglotsen hat den Flugverkehr fast vollständig lahmgelegt. Reisen zu internationalen oder weit entfernten Drehorten werden zu einem logistischen Albtraum. Produktionen müssen verschoben werden, Schauspieler sitzen fest, und die Transportkosten für Equipment explodieren.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_23',
        category: 'World',
        title: "Mode-Revolution",
        text: "Ein neuer, gewagter und extravaganter Modestil erobert die Laufstege von Paris bis New York und dominiert bald das Straßenbild. Ästhetik wird wieder wichtig. Filme mit einem starken Fokus auf Kostümdesign, Ausstattung und visuellem Stil profitieren von diesem Trend und ziehen ein modebewusstes Publikum an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_24',
        category: 'World',
        title: "Bankenkrise",
        text: "Das Finanzsystem wankt. Mehrere große Banken sind durch Fehlspekulationen in Schieflage geraten. Als Folge haben die Finanzinstitute die Kreditvergabe drastisch eingeschränkt und die Risikoprämien erhöht. Neue Kredite sind nur noch zu deutlich schlechteren Konditionen und höheren Zinsen erhältlich.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const increase = 0.75 + Math.random() * 0.75;
            return {
                updatedPlayerData: {
                    ...data,
                    interestRateModifier: (data.interestRateModifier || 0) - increase
                }
            };
        },
    },
    // Erläuterung: Negatives Event. Erhöht die Kreditzinsen dauerhaft.
    {
        id: 'world_25',
        category: 'World',
        title: "Durchbruch in der Medizin",
        text: "Wissenschaftler verkünden einen sensationellen Durchbruch im Kampf gegen eine bisher unheilbare Krankheit. Diese Nachricht gibt den Menschen weltweit Hoffnung und stärkt den Glauben an Wissenschaft und Fortschritt. Das Interesse an Science-Fiction, Ärztedramen und Geschichten über menschlichen Erfindergeist steigt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    // --- New World Events (50) ---
    {
        id: 'world_26',
        category: 'World',
        title: "Internet wird kommerziell",
        text: "Das Informationszeitalter hat begonnen. Das sogenannte 'World Wide Web' wird nun auch für die breite Öffentlichkeit und kommerzielle Nutzung zugänglich gemacht. Während einige Experten es als kurzfristige Spielerei abtun, erkennen Visionäre das Potenzial für eine globale Vernetzung. Der Zugang zu Informationen wird revolutioniert, was der Forschung und Entwicklung einen massiven Schub verleiht.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 500 } }),
    },
    // Erläuterung: Bonus-Event. Bringt 500 Forschungspunkte.
    {
        id: 'world_27',
        category: 'World',
        title: "Fall der Berliner Mauer",
        text: "Ein historischer Moment: Die Mauer ist gefallen! Das Ende des Kalten Krieges zeichnet sich ab, und die geopolitische Landkarte wird neu gezeichnet. Spionage-Thriller, die auf dem Ost-West-Konflikt basieren, wirken plötzlich veraltet. Dafür steigt das Interesse an historischen Dramen und Geschichten über Freiheit und Wiedervereinigung.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event. Historischer Kontext.
    {
        id: 'world_28',
        category: 'World',
        title: "Naturkatastrophe",
        text: "Ein schweres Erdbeben in Kalifornien hat Teile der Infrastruktur beschädigt und beeinträchtigt die gesamte Filmindustrie. Viele Produktionen müssen gestoppt oder verzögert werden, da Studios beschädigt sind oder der Strom ausgefallen ist. Die Solidarität in der Branche ist groß, aber der wirtschaftliche Schaden ist immens.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_29',
        category: 'World',
        title: "Neue Handelsrouten",
        text: "Neue internationale Handelsabkommen öffnen bisher verschlossene Märkte in Asien für westliche Kulturprodukte. Dies ist eine Goldgräber-Chance für die Filmindustrie. Filme, die auch in diesen Kulturkreisen Anklang finden, könnten enorme zusätzliche Gewinne an den internationalen Kinokassen erzielen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_30',
        category: 'World',
        title: "Popkultur-Phänomen",
        text: "Eine neue TV-Serie hat sich über Nacht zum weltweiten Phänomen entwickelt. Sie dominiert die Pausenhofgespräche und Büroflure, beeinflusst die Modetrends und prägt den Sprachgebrauch der Jugend. Kinos haben es schwer, gegen dieses massive kulturelle Ereignis im Fernsehen anzukommen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_31',
        category: 'World',
        title: "Wissenschaftlicher Preis",
        text: "Ein bahnbrechender wissenschaftlicher Preis wurde für eine Entdeckung verliehen, die unser Verständnis des Universums verändert. Das Interesse der breiten Öffentlichkeit an Wissenschaft ist geweckt. Dokumentationen und Biopics über berühmte Wissenschaftler und Entdecker erleben einen unerwarteten Popularitätsschub.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_32',
        category: 'World',
        title: "Unerwarteter Bestseller",
        text: "Ein völlig unbekannter Autor hat mit seinem Debütroman einen Überraschungserfolg gelandet, der die Bestsellerlisten seit Wochen anführt. Die Geschichte hat Millionen berührt. Die Filmrechte an diesem Stoff sind heiß begehrt, und jedes Studio versucht, sich dieses Stück vom Kuchen zu sichern.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_33',
        category: 'World',
        title: "Regierungswechsel",
        text: "Eine neue Regierung mit einer radikal anderen kulturpolitischen Agenda ist an die Macht gekommen. Die bisherigen Systeme der Filmförderung werden auf den Prüfstand gestellt und neu bewertet. Während einige Subventionen gestrichen werden könnten, entstehen vielleicht neue Fördertöpfe für andere Arten von Projekten.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_34',
        category: 'World',
        title: "Extremwetter",
        text: "Ein Jahrhundertwinter mit massiven Schneefällen legt das öffentliche Leben in weiten Teilen des Landes lahm. Straßen sind unpassierbar, und der Nahverkehr bricht zusammen. Die Menschen bleiben zu Hause vor ihren warmen Kaminen, und die Kinoeinnahmen brechen landesweit dramatisch ein.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_35',
        category: 'World',
        title: "Kulturelle Aneignungs-Debatte",
        text: "Eine hitzige öffentliche Debatte über kulturelle Aneignung in Kunst und Medien hat begonnen. Kritiker und Aktivisten fordern mehr Sensibilität und Respekt im Umgang mit fremden Kulturen. Filmprojekte mit exotischen Schauplätzen oder Stereotypen werden nun viel kritischer beäugt und riskierten einen Shitstorm.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_36',
        category: 'World',
        title: "Goldrausch-Mentalität",
        text: "Der Aktienmarkt boomt und erreicht täglich neue Höchststände. Eine optimistische 'Goldrausch'-Stimmung hat das Land erfasst. Die Kurse werden für die nächsten 4 Wochen kontinuierlich steigen. Die Menschen glauben an eine rosige Zukunft und wollen unterhalten werden. Leichte Komödien und Feel-Good-Filme sind gefragt.",
        imageUrl: newspaperImage,
        effect: (data) => ({
            updatedPlayerData: {
                ...data,
                marketTrend: {
                    type: 'bull',
                    duration: 28,
                    minFactor: 0.0025,
                    maxFactor: 0.0075
                }
            }
        }),
    },
    // Erläuterung: Positives Event. Setzt einen "Bull Market" Trend für 28 Tage, in denen Aktienkurse tendenziell steigen.
    {
        id: 'world_37',
        category: 'World',
        title: "Internationale Friedensverhandlungen",
        text: "Nach jahrelangen Konflikten haben erfolgreiche Friedensverhandlungen einen langen Krieg beendet. Die Bilder von verfeindeten Soldaten, die sich die Hände reichen, gehen um die Welt. Die Welt atmet auf, und das Publikum sehnt sich nach hoffnungsvollen, verbindenden Geschichten und Dramen mit Happy End.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_38',
        category: 'World',
        title: "Archivmaterial entdeckt",
        text: "Bisher unbekanntes, farbiges Archivmaterial aus dem Zweiten Weltkrieg wurde in einem Keller entdeckt und veröffentlicht. Die beeindruckenden Aufnahmen dominieren die Nachrichten und entfachen das historische Interesse neu. Kriegsfilme und historische Dokumentationen rücken wieder in den Fokus der Öffentlichkeit.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_39',
        category: 'World',
        title: "Zinssenkung der Zentralbank",
        text: "Um die Wirtschaft anzukurbeln und Investitionen zu fördern, hat die Zentralbank die Leitzinsen überraschend gesenkt. Kredite für große Projekte werden deutlich günstiger, was es für Studios attraktiver macht, sich Geld für teure Blockbuster-Produktionen oder Studioerweiterungen zu leihen.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const reduction = 0.75 + Math.random() * 0.75;
            return {
                updatedPlayerData: {
                    ...data,
                    interestRateModifier: (data.interestRateModifier || 0) + reduction // Positiver Modifier senkt Zinsen
                }
            };
        },
    },
    // Erläuterung: Positives Event. Senkt die Kreditzinsen dauerhaft.
    {
        id: 'world_40',
        category: 'World',
        title: "Skepsis gegenüber Autoritäten",
        text: "Nach einer Reihe von aufgedeckten Regierungsskandalen und Vertuschungsaktionen ist das Vertrauen der Öffentlichkeit in Institutionen tief erschüttert. Eine Welle des Misstrauens geht durchs Land. Paranoia-Thriller, Verschwörungsfilme und Geschichten über den Kampf des Einzelnen gegen das System sind hoch im Kurs.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_41',
        category: 'World',
        title: "Retro-Gaming-Welle",
        text: "Alte 8-Bit-Videospielklassiker erleben eine unerwartete Renaissance. Pixel-Art ist wieder in, und Chiptune-Musik läuft im Radio. Das Publikum ist in einer nostalgischen Stimmung für die 80er Jahre und sehr offen für Filme, die Gaming-Thematik oder diese Ästhetik aufgreifen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_42',
        category: 'World',
        title: "Umweltschutzbewegung wächst",
        text: "Das Bewusstsein für den Klimawandel und Umweltschutz wächst rasant in der Bevölkerung, besonders bei jungen Menschen. Großdemonstrationen bestimmen das Straßenbild. Naturdokumentationen und Spielfilme mit einer starken ökologischen Botschaft finden ein großes und dankbares Publikum.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_43',
        category: 'World',
        title: "Internationale Raumfahrtmission",
        text: "Eine ambitionierte bemannte Mission zum Mars fesselt die Weltöffentlichkeit. Die Live-Übertragungen der Starts und Landungen erreichen Milliarden. Das Interesse an realistischen Science-Fiction-Filmen und Weltraum-Abenteuern ist auf einem absoluten Allzeithoch.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_44',
        category: 'World',
        title: "Globaler Logistik-Engpass",
        text: "Ein blockierter Kanal oder ein Streik in einem großen Hafen hat zu massiven Problemen in den globalen Lieferketten geführt. Container stauen sich, und Waren kommen nicht an. Dies verteuert den Transport von technischem Equipment und Filmkopien erheblich und führt zu Verzögerungen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_45',
        category: 'World',
        title: "Urbanisierungstrend",
        text: "Der Trend ist eindeutig: Immer mehr Menschen verlassen das Land und ziehen in die großen Metropolen. Das städtische Lebensgefühl prägt die Kultur. Filme, die das urbane Leben, seine Hektik, seine Chancen und seine Abgründe thematisieren, sei es in Krimis oder modernen Romanzen, sind sehr populär.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_46',
        category: 'World',
        title: "Neuer Tanzstil wird populär",
        text: "Ein neuer, energiegeladener Tanzstil aus dem Untergrund erobert die Clubs und die Herzen der Jugend weltweit. Tanzschulen sind ausgebucht, und Tanzvideos gehen viral. Das ist eine große Chance für Tanzfilme und Musicals, die diesen Trend aufgreifen und auf die Leinwand bringen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_47',
        category: 'World',
        title: "Historisches Jubiläum",
        text: "Ein wichtiges historisches Jubiläum, sei es die Gründung der Nation oder das Ende eines großen Krieges, wird landesweit mit Paraden und Feierlichkeiten begangen. Das Interesse an Filmen, die diese spezifische Epoche behandeln und die Geschichte lebendig machen, steigt für kurze Zeit enorm an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_48',
        category: 'World',
        title: "Angst vor Automatisierung",
        text: "Die rasanten Fortschritte in der Robotik schüren Ängste vor dem Verlust von Arbeitsplätzen durch Automatisierung. Die Debatte über die Rolle des Menschen in einer technisierten Welt wird hitzig geführt. Dystopische Science-Fiction-Filme, die eine von Maschinen dominierte Zukunft zeigen, treffen den Nerv der Zeit.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_49',
        category: 'World',
        title: "Baby-Boom",
        text: "Die Geburtenraten steigen sprunghaft an, Kinderwagen dominieren das Stadtbild. Ein neuer Baby-Boom ist da! Familienfreundliche Filme, Animationsfilme und harmlose Komödien, die für Eltern und Kinder gleichermaßen geeignet sind, sind an den Kinokassen gefragter denn je.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_50',
        category: 'World',
        title: "Durchbruch in der KI-Forschung",
        text: "Forscher einer Top-Universität melden einen sensationellen Durchbruch bei der Entwicklung künstlicher Intelligenz. Computer können nun Aufgaben lösen, die vor kurzem noch als unmöglich galten. Das beflügelt nicht nur die Fantasie von Sci-Fi-Autoren, sondern gibt auch Ihrer eigenen Forschungsabteilung neue Impulse.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 300 } }),
    },
    // Erläuterung: Bonus-Event. Bringt 300 Forschungspunkte.
    {
        id: 'world_51',
        category: 'World',
        title: "Comic-Hefte werden Mainstream",
        text: "Superhelden-Comics, einst als Nischenhobby für Nerds belächelt, finden plötzlich ein riesiges neues Publikum und werden als moderne Mythologie anerkannt. Die Verkaufszahlen der Hefte steigen. Die Zeit scheint reif für große, budgetstarke Comic-Verfilmungen, die das Genre ernst nehmen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_52',
        category: 'World',
        title: "Lockerung der Einwanderungsgesetze",
        text: "Neue, liberalere Einwanderungsgesetze führen zu einer kulturellen Durchmischung in den Städten. Neue Restaurants eröffnen, neue Sprachen sind zu hören. Geschichten über Migration, Integration und das Aufeinandertreffen verschiedener Kulturen finden großen Anklang und fördern das Verständnis.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_53',
        category: 'World',
        title: "Steigende Kriminalitätsrate",
        text: "Eine besorgniserregend steigende Kriminalitätsrate in den Großstädten verunsichert die Bevölkerung. Ruf nach 'Law and Order' werden laut. Das Publikum verlangt nach harten Krimis und Actionfilmen, in denen starke Gesetzeshüter aufräumen und die Ordnung wiederherstellen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_54',
        category: 'World',
        title: "Satellitenfernsehen expandiert",
        text: "Der massive Ausbau des Satellitenfernsehens schafft unzählige neue Kanäle und erreicht auch entlegene Gebiete. Der Hunger nach Inhalten ist riesig. TV-Sender suchen händeringend nach Filmen, um ihre 24-Stunden-Programme zu füllen, was die Preise für TV-Rechte in die Höhe treibt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_55',
        category: 'World',
        title: "Verschärfung der Waffengesetze",
        text: "Nach einer öffentlichen Debatte und tragischen Vorfällen werden die Waffengesetze verschärft. Der Besitz von Schusswaffen wird stärker reguliert. Die Darstellung von Waffengewalt in Filmen wird nun kontroverser diskutiert, und einige Zuschauer reagieren sensibler auf exzessive Action.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_56',
        category: 'World',
        title: "Unabhängigkeitsbewegung",
        text: "Eine leidenschaftliche Unabhängigkeitsbewegung in einer fremden Region erregt weltweite Aufmerksamkeit und Sympathie. Das Thema Selbstbestimmung ist in aller Munde. Das Interesse an politischen Dramen und historischen Filmen über Freiheitskämpfe steigt signifikant an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_57',
        category: 'World',
        title: "Aufstieg des Extrem-Sports",
        text: "Skateboarding, Surfen, Bungee-Jumping und andere Extremsportarten werden immer populärer und ziehen Sponsoren an. Der Adrenalinkick ist das neue Lebensgefühl. Schnelle Actionfilme mit spektakulären Stunts und einer 'X-Games'-Ästhetik sind bei der jungen Zielgruppe sehr gefragt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_58',
        category: 'World',
        title: "Digitalisierung der Archive",
        text: "Große Bibliotheken und nationale Archive beginnen damit, ihre riesigen Bestände zu digitalisieren und online verfügbar zu machen. Das erleichtert die Recherche für historische Filme und Dokumentationen enorm und senkt die Kosten für die Vorproduktion erheblich.",
        imageUrl: newspaperImage,
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 200 } }),
    },
    // Erläuterung: Bonus-Event. Bringt 200 Forschungspunkte.
    {
        id: 'world_59',
        category: 'World',
        title: "UFO-Sichtung sorgt für Aufsehen",
        text: "Eine angebliche UFO-Sichtung über einer Großstadt wird zur Top-Nachricht. Amateurvideos zeigen seltsame Lichter am Himmel, und die Regierung dementiert nur halbherzig. Die Faszination für Außerirdische, Verschwörungstheorien und Science-Fiction ist auf dem absoluten Höhepunkt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_60',
        category: 'World',
        title: "Neues Tierschutzgesetz",
        text: "Ein neues, strenges Tierschutzgesetz macht den Einsatz von echten Tieren bei Dreharbeiten deutlich komplizierter und teurer. Es gelten nun höhere Auflagen für Haltung und Ruhezeiten am Set. Produktionen müssen entweder mehr Budget einplanen oder auf Alternativen wie CGI ausweichen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_61',
        category: 'World',
        title: "Minimalismus-Trend",
        text: "Als Gegenbewegung zum Konsumwahn wenden sich viele Menschen einem einfacheren Lebensstil zu. 'Weniger ist mehr' lautet das Motto. Leise, anspruchsvolle und charaktergetriebene Dramen sind plötzlich gefragter als laute, überladene Materialschlachten im Kino.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_62',
        category: 'World',
        title: "Boom der Vorstädte",
        text: "Immer mehr junge Familien ziehen aus den teuren und engen Städten in die neu entstehenden Vorortsiedlungen. Der Traum vom Eigenheim mit Garten prägt das Lebensgefühl. Geschichten über das Vorstadtleben, ob als idyllische Komödie oder als Abgrund hinter der Fassade (thriller), treffen den Zeitgeist.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_63',
        category: 'World',
        title: "Internationale Kunstausstellung",
        text: "Eine große, kontroverse internationale Kunstausstellung tourt durchs Land und zieht Millionen Besucher an. Sie inspiriert eine neue Welle von visuell experimentellen Filmen und öffnet das Publikum für avantgardistische Ästhetik und ungewöhnliche Erzählformen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_64',
        category: 'World',
        title: "Hitzewelle",
        text: "Eine Rekord-Hitzewelle hat das Land fest im Griff. Die Temperaturen klettern auf unerträgliche Höhen. Dies sorgt für volle Kinosäle, da die Menschen in den klimatisierten Räumen Zuflucht vor der Hitze suchen. Eine außerordentlich gute Zeit für einen Blockbuster-Start!",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_65',
        category: 'World',
        title: "Bankenregulierung",
        text: "Nach einer kleineren Finanzkrise werden die Banken vom Staat stärker reguliert. Die Vergaberichtlinien für Kredite werden verschärft und Risikozuschläge erhöht. Die Finanzierung von Filmen über Bankdarlehen wird deutlich teurer.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const increase = 0.75 + Math.random() * 0.75; // Zinserhöhung
            return {
                updatedPlayerData: {
                    ...data,
                    interestRateModifier: (data.interestRateModifier || 0) - increase
                }
            };
        },
    },
    // Erläuterung: Negatives Event. Erhöht die Kreditzinsen dauerhaft.
    {
        id: 'world_66',
        category: 'World',
        title: "Entdeckung neuer Spezies",
        text: "Forscher haben im tiefsten Dschungel eine neue, faszinierende Tierart entdeckt, die bisher als Mythos galt. Das weltweite Interesse an Natur und Biologie ist riesig. Naturdokumentationen und Abenteuerfilme, die die Wunder der Erde zeigen, profitieren enorm davon.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_67',
        category: 'World',
        title: "Niedrige Zinsen",
        text: "Die Zentralbank hält die Zinsen auf einem historischen Tiefstand, um Investitionen anzuregen. Geld ist billig wie nie. Es war noch nie günstiger, sich Geld für große Produktionen oder den Ausbau des Studios zu leihen. Eine Zeit der Expansion!",
        imageUrl: newspaperImage,
        effect: (data) => {
            const reduction = 0.75 + Math.random() * 0.75;
            return {
                updatedPlayerData: {
                    ...data,
                    interestRateModifier: (data.interestRateModifier || 0) + reduction
                }
            };
        },
    },
    // Erläuterung: Positives Event. Senkt die Zinsen für neue Kredite.
    {
        id: 'world_68',
        category: 'World',
        title: "True-Crime-Welle",
        text: "Eine Reihe von extrem erfolgreichen Büchern und Dokumentationen über wahre Kriminalfälle löst eine Welle der Faszination für das 'True Crime'-Genre aus. Das Publikum giert nach Krimis und Thrillern, die auf wahren Begebenheiten beruhen oder eine realistische Ermittlungsarbeit zeigen.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_69',
        category: 'World',
        title: "Staatliche Bildungsinitiative",
        text: "Eine große staatliche Bildungsinitiative fördert das Interesse an Geschichte, Wissenschaft und Kultur an Schulen und Universitäten. Historische Dramen und wissenschaftliche Dokumentationen finden plötzlich ein breiteres und jüngeres Publikum, das mehr lernen möchte.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_70',
        category: 'World',
        title: "Rückkehr zum Landleben",
        text: "Ein neuer gesellschaftlicher Trend führt dazu, dass viele Menschen der Hektik der Großstädte entfliehen und aufs Land ziehen, um sich selbst zu versorgen. Filme, die ländliche Idylle romantisieren oder ländlichen Horror thematisieren, sind gleichermaßen beliebt.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_71',
        category: 'World',
        title: "Olympische Spiele",
        text: "Die Welt ist im olympischen Fieber. Die Augen der Nation sind auf die Athleten und die Medaillenspiegel gerichtet. Während der zwei Wochen der Olympischen Spiele gehen deutlich weniger Menschen ins Kino, da die Live-Übertragungen im Fernsehen Vorrang haben.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_72',
        category: 'World',
        title: "Generationenkonflikt",
        text: "Ein scharfer Konflikt zwischen der jüngeren und der älteren Generation über Werte, Umwelt und Wirtschaft prägt die gesellschaftliche Debatte. Filme, die diesen Konflikt thematisieren, sei es als Drama oder Satire, sind äußerst erfolgreich und regen Diskussionen an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_73',
        category: 'World',
        title: "Durchbruch bei erneuerbaren Energien",
        text: "Ein technologischer Durchbruch bei der Speicherung erneuerbarer Energien weckt weltweiten Optimismus für eine grüne Zukunft. Zukunftsweisende Science-Fiction, die eine positive Vision ('Solarpunk') zeigt, und optimistische Dramen finden ein dankbares Publikum.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_74',
        category: 'World',
        title: "Weltreise-Boom",
        text: "Günstige Flugpreise und offene Grenzen lösen einen Boom bei Weltreisen aus. Jeder will die Welt sehen. Das Interesse an Filmen, die an exotischen Orten spielen oder das Thema Reisen und Selbstfindung behandeln, steigt spürbar an.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_75',
        category: 'World',
        title: "Hacker-Kultur",
        text: "Die aufkommende Hacker-Kultur, halb im Schatten, halb im Rampenlicht, fasziniert die Öffentlichkeit. Sind sie Helden oder Kriminelle? Cyber-Thriller und Filme, die Computer, Telefon-Phreaking und digitale Überwachung thematisieren, werden extrem populär.",
        imageUrl: newspaperImage,
    },
    // Erläuterung: Flavour-Event.
    {
        id: 'world_76',
        category: 'World',
        title: "Leitzinserhöhung der Zentralbank",
        text: "Die Zentralbank hat die Leitzinsen angehoben, um der steigenden Inflation entgegenzuwirken. Die Ära des billigen Geldes ist vorerst vorbei. Kredite für Filmproduktionen und Studioerweiterungen werden spürbar teurer, was die Finanzplanung erschwert.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const increase = 0.75 + Math.random() * 0.75; // Zinserhöhung
            return {
                updatedPlayerData: {
                    ...data,
                    interestRateModifier: (data.interestRateModifier || 0) - increase
                }
            };
        },
    },
    // Erläuterung: Negatives Event. Erhöht die Kreditzinsen dauerhaft.
    {
        id: 'world_77',
        category: 'World',
        title: "Straffung der Geldpolitik",
        text: "Um die Währung zu stabilisieren und die Märkte zu beruhigen, wird die Geldpolitik gestrafft. Die Zinsen steigen auf breiter Front. Für Unternehmen bedeutet dies höhere Kosten bei der Kapitalbeschaffung. Investitionen müssen nun noch genauer kalkuliert werden.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const increase = 0.75 + Math.random() * 0.75;
            return {
                updatedPlayerData: {
                    ...data,
                    interestRateModifier: (data.interestRateModifier || 0) - increase
                }
            };
        },
    },
    // Erläuterung: Negatives Event. Erhöht die Kreditzinsen dauerhaft.
    // NEW STOCK EVENTS
    {
        id: 'world_78',
        category: 'World',
        title: "Bilanzskandal erschüttert Vertrauen",
        text: "Ein großer Bilanzskandal bei einem bekannten Unternehmen wurde aufgedeckt. Jahrelang wurden Zahlen geschönt und Gewinne erfunden. Die Anleger reagieren panisch und verkaufen ihre Anteile. Der Aktienkurs des betroffenen Unternehmens stürzt dramatisch ab.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const stocks = [...data.stocks];
            const randomIndex = Math.floor(Math.random() * stocks.length);
            const targetStock = stocks[randomIndex];
            const drop = 0.3 + Math.random() * 0.2; // 30% bis 50% Crash
            const newPrice = Math.max(0.01, targetStock.price * (1 - drop));
            stocks[randomIndex] = {
                ...targetStock,
                price: newPrice,
                history: [...targetStock.history, newPrice]
            };
            const logEntry = {
                date: new Date(data.gameDate),
                title: 'Börsen-Ticker: Kurssturz!',
                text: `Ein Bilanzskandal erschüttert ${targetStock.name}. Der Aktienkurs ist massiv eingebrochen.`,
                category: 'World'
            };
            return {
                updatedPlayerData: {
                    ...data,
                    stocks: stocks,
                    eventLog: [...data.eventLog, logEntry]
                }
            };
        }
    },
    // Erläuterung: Börsen-Event. Eine zufällige Aktie stürzt um 30-50% ab.
    {
        id: 'world_79',
        category: 'World',
        title: "Technologischer Durchbruch",
        text: "Ein Unternehmen hat einen sensationellen technologischen Durchbruch verkündet, der die gesamte Branche revolutionieren könnte. Experten sind begeistert, und die Aktie schießt an der Börse durch die Decke. Investoren sehen rosige Zeiten voraus.",
        imageUrl: newspaperImage,
        effect: (data) => {
            const stocks = [...data.stocks];
            const randomIndex = Math.floor(Math.random() * stocks.length);
            const targetStock = stocks[randomIndex];
            const surge = 0.2 + Math.random() * 0.2; // 20% bis 40% Anstieg
            const newPrice = targetStock.price * (1 + surge);
            stocks[randomIndex] = {
                ...targetStock,
                price: newPrice,
                history: [...targetStock.history, newPrice]
            };
            const logEntry = {
                date: new Date(data.gameDate),
                title: 'Börsen-Ticker: Kursfeuerwerk!',
                text: `${targetStock.name} verkündet einen technologischen Durchbruch. Die Anleger sind begeistert und der Kurs schießt nach oben.`,
                category: 'World'
            };
            return {
                updatedPlayerData: {
                    ...data,
                    stocks: stocks,
                    eventLog: [...data.eventLog, logEntry]
                }
            };
        }
    },
    // Erläuterung: Börsen-Event. Eine zufällige Aktie steigt um 20-40%.
];
