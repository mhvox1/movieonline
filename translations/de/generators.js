import { ActorAge } from '../../types';
export const generators = {
    scriptGen: {
        adjectives: [
            'Silent', 'Quantum', 'Galactic', 'Last', 'Ashen', 'Neon', 'Fractured', 'Solaris', 'Steelheart', 'Diamond', 'Winter\'s', 'Cybernetic', 'Gilded', 'Crimson', 'Forgotten', 'Eternal', 'Hollow', 'Obsidian', 'Sunken', 'Whispering',
            'Scarlet', 'Ivory', 'Jade', 'Azure', 'Midnight', 'Electric', 'Zero', 'Final', 'Broken', 'Lost', 'Seventh', 'Ebon', 'Hunted', 'Shattered', 'Frozen', 'Burning', 'Secret', 'Perfect', 'Human', 'Dark', 'Blind', 'Glass',
            'Chrome', 'Deadly', 'Invisible', 'Unspoken', 'Fallen', 'Golden', 'Iron', 'Crystal', 'Shadow', 'Twisted', 'Scarred', 'Distant', 'Ancient', 'First', 'Second', 'Third', 'Bleeding', 'Empty', 'Cold', 'Red', 'White',
            'Black', 'Blue', 'Green', 'Gray', 'Furious', 'Unforgiven', 'Unbound', 'Terminal', 'Omega', 'Alpha', 'Deep', 'Rogue', 'Primal', 'Savage', 'Digital', 'Virtual'
        ],
        nouns: [
            'Echo', 'Signal', 'Horizon', 'Renegade', 'Serenade', 'Drift', 'Empire', 'Cipher', 'Ghost', 'Rebellion', 'Protocol', 'Abyss', 'Dragon', 'Paradox', 'Serpent', 'Solstice', 'Gate', 'Dawn', 'Behemoth', 'Void', 'Titan',
            'Samurai', 'Pact', 'Mandate', 'Legacy', 'Prophecy', 'Labyrinth', 'Neptune', 'Cage', 'Skies', 'Witness', 'Sanctum', 'Nemesis', 'Vanguard', 'Exodus', 'Requiem', 'Gambit', 'Covenant', 'Paradigm', 'Nexus', 'Harbinger',
            'Oracle', 'Zenith', 'Vertex', 'Odyssey', 'Mirage', 'Sentinel', 'Machine', 'Child', 'Man', 'Woman', 'Heir', 'Throne', 'Key', 'Star', 'Sun', 'Moon', 'Planet', 'Comet', 'Nebula', 'Galaxy', 'Universe', 'Heart', 'Soul',
            'Mind', 'Memory', 'Dream', 'Nightmare', 'War', 'Peace', 'Love', 'Hate', 'Fear', 'Hope', 'Destiny', 'Fate', 'Curse', 'Blessing', 'Game', 'Player', 'Pawn', 'King', 'Queen', 'Soldier', 'Thief', 'Hunter', 'Angel', 'Demon'
        ],
        concepts: [
            'Rising', 'Gambit', 'Anomaly', 'Initiative', 'Requiem', 'Legacy', 'Curse', 'Awakening', 'Ascension', 'Descent', 'Redemption', 'Vendetta', 'Retribution', 'Illusion', 'Directive', 'Uprising', 'Extinction', 'Protocol',
            'Sanction', 'Variante', 'Agenda', 'Manifesto', 'Hypothesis', 'Theorem', 'Equation', 'Incident', 'Reckoning', 'Judgement', 'Fall', 'Dawn', 'Endgame', 'Beginning', 'Revolution', 'Evolution', 'Genesis', 'Exodus',
            'Conspiracy', 'Theory', 'Experiment', 'Variable', 'Constant', 'Paradox', 'Truth', 'Lie', 'Secret', 'Revelation'
        ],
        templates: [
            'The {a} {n}',
            '{n}\'s {c}',
            '{a} {c}',
            'Project: {n}',
            'The {n} Protocol',
            'Chronicles of the {a} {n}',
        ],
        plots: {
            "Action": [
                {
                    text: "Ein Ex-Agent muss aus dem Ruhestand zurückkehren, um eine globale Verschwörung aufzudecken. Seine Jagd führt ihn quer durch Europa und zwingt ihn zur Konfrontation mit seiner eigenen Vergangenheit.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Eine Gruppe von Elitesoldaten wird auf eine unmögliche Mission hinter feindlichen Linien geschickt. Als die Mission fehlschlägt, müssen sie nicht nur ums Überleben, sondern auch gegeneinander kämpfen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Ein Cop wird fälschlicherweise eines Verbrechens beschuldigt und muss fliehen. Um seine Unschuld zu beweisen, muss er den wahren Täter finden, während er von der Polizei und der Mafia gejagt wird.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Als Terroristen ein Hochhaus besetzen, wird eine zufällig anwesende Lieferbotin zur einzigen Hoffnung für die Geiseln. Sie muss all ihren Mut zusammennehmen, um die Pläne der Verbrecher zu durchkreuzen.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Ein Meisterdieb plant einen letzten, spektakulären Raubüberfall. Doch ein unberechenbarer Rivale und eine hartnäckige Interpol-Agentin machen ihm das Leben schwer.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Attentäter im Ruhestand wird reaktiviert, als seine Familie bedroht wird. Er hinterlässt eine Schneise der Verwüstung auf der Suche nach den Verantwortlichen.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Child }
                },
            ],
            "Abenteuer": [
                {
                    text: "Eine junge Archäologin entdeckt eine antike Karte, die sie auf die Jagd nach einem legendären verlorenen Schatz führt. Ein rivalisierender Sammler ist ihr jedoch dicht auf den Fersen.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Ein Kartograph strandet auf einer mysteriösen, unerforschten Insel voller prähistorischer Kreaturen. Er muss mit den anderen Überlebenden einen Weg finden, von der Insel zu entkommen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Waisenjunge entdeckt, dass er der Nachfahre eines berühmten Piraten ist. Zusammen mit einem alten Seemann macht er sich auf die Suche nach dem verfluchten Schatz seines Vorfahren.",
                    mainRole: { gender: 'männlich', age: ActorAge.Child },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Eine Historikerin reist versehentlich durch die Zeit ins alte Ägypten. Sie muss einen Weg zurück in ihre Zeit finden, ohne die Geschichte zu verändern.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Pilot stürzt im Amazonas-Dschungel ab und muss sich allein durch die Wildnis schlagen. Er kämpft gegen wilde Tiere und die Elemente, um zurück in die Zivilisation zu finden.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Zwei rivalisierende Entdecker liefern sich ein Wettrennen zum Nordpol. Es ist ein Kampf gegen die Zeit und die erbarmungslose Natur, um als Erster einen legendären Ort zu erreichen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
            ],
            "Komödie": [
                {
                    text: "Zwei ungleiche Chaoten müssen sich als Babysitter für ein hyperaktives Kind ausgeben. Es ist ein Wochenende voller Katastrophen, das ihre Freundschaft auf die Probe stellt.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Ein gestresster Familienvater beschließt, mit seiner dysfunktionalen Familie einen Roadtrip zu machen. Was als Erholungsurlaub geplant war, endet im totalen Chaos.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein schüchterner Büroangestellter wird versehentlich mit einem Superspion verwechselt. Er muss nun die Welt retten, ohne die geringste Ahnung zu haben, was er tut.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Eine Gruppe von Freunden wacht nach einer Partynacht ohne Erinnerung auf. Sie müssen die Ereignisse rekonstruieren, um einen vermissten Freund und einen Tiger im Badezimmer zu erklären.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Eine ehrgeizige Journalistin muss undercover zurück an ihre alte High School. Sie stellt fest, dass sich nichts geändert hat und sie immer noch eine Außenseiterin ist.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein verfluchter Anwalt kann einen Tag lang nicht lügen. Dies bringt seine Karriere und seine Beziehungen in Gefahr, führt aber auch zu urkomischen Wahrheiten.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
            ],
            "Krimi": [
                {
                    text: "Ein brillanter, aber geplagter Detektiv jagt einen gerissenen Serienmörder, der kryptische Hinweise hinterlässt. Während er tiefer in den Fall eintaucht, beginnt der Mörder ein persönliches Spiel mit ihm.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Eine Gruppe von Meisterdieben plant den Einbruch in den bestgesicherten Tresor der Welt. Doch Verrat in den eigenen Reihen droht, den perfekten Plan zu zerstören.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Eine junge Anwältin verteidigt einen Mann, der des Mordes beschuldigt wird. Bald zweifelt sie an seiner Unschuld und deckt eine Verschwörung auf, die sie selbst in Gefahr bringt.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Undercover-Cop infiltriert eine mächtige Mafia-Familie. Er gerät in einen tiefen Konflikt zwischen seiner Pflicht und seiner neuen Loyalität zur Familie des Paten.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Eine Privatdetektivin in den 1940ern wird von einer mysteriösen Femme Fatale angeheuert. Sie wird in ein Netz aus Lügen, Korruption und Mord in der High Society verstrickt.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein pensionierter Ermittler wird von einem ungelösten Fall eingeholt, als ein Nachahmungstäter auftaucht. Er muss sich seinen alten Dämonen stellen, um den neuen Mörder zu fassen.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
            ],
            "Dokumentation": [
                {
                    text: "Eine tiefgehende Untersuchung über das Leben eines zurückgezogenen Milliardärs. Interviews mit ehemaligen Mitarbeitern zeichnen das Bild eines Genies am Rande des Wahnsinns.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                },
                {
                    text: "Die wahre Geschichte einer Gruppe von Bergsteigern, die eine unmögliche Erstbesteigung wagten. Mit Originalaufnahmen und emotionalen Interviews der Überlebenden.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                },
                {
                    text: "Ein Blick hinter die Kulissen der Entwicklung eines revolutionären Videospiels. Der Film zeigt den Druck und die Leidenschaft des kleinen Entwicklerteams.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                },
                {
                    text: "Die Chronik des Aufstiegs und Falls einer antiken Zivilisation. Modernste CGI-Rekonstruktionen erwecken eine verlorene Welt wieder zum Leben.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                },
            ],
            "Drama": [
                {
                    text: "Eine Familie wird durch ein tragisches Geheimnis auseinandergerissen. Jahre später müssen sich die entfremdeten Geschwister wieder zusammenraufen, um die Wahrheit zu finden.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein engagierter Lehrer kämpft gegen das System, um eine Gruppe von benachteiligten Schülern zu inspirieren. Er setzt seine Karriere aufs Spiel, um ihnen eine Zukunft zu ermöglichen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Die wahre Geschichte eines Mannes, der zu Unrecht verurteilt wurde und Jahrzehnte im Gefängnis verbringt. Sein unerschütterlicher Kampf um Freiheit wird zur Inspiration für eine ganze Nation.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein alternder Musiker bekommt eine letzte Chance auf Ruhm. Er entdeckt eine junge, talentierte Sängerin und muss sich entscheiden, ob er sie fördert oder ihre Ideen für sich nutzt.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Wall-Street-Broker wird von seiner Gier zerfressen und riskiert alles für einen Deal. Er verliert nicht nur sein Geld, sondern auch seine Familie und muss von vorne anfangen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Eine junge Frau im 19. Jahrhundert kämpft gegen die gesellschaftlichen Konventionen. Sie will Ärztin werden und muss sich gegen ihre Familie und die männlich dominierte Universität durchsetzen.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
            ],
            "Fantasy": [
                {
                    text: "Ein einfacher Bauernjunge entdeckt, dass er der Auserwählte ist, um ein dunkles Reich zu besiegen. Ein alter Zauberer wird zu seinem Mentor auf dieser gefährlichen Reise.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Eine junge Zauberin muss eine Reise antreten, um eine seltene Zutat für einen Trank zu finden. Sie wird von einem charmanten, aber unzuverlässigen Dieb begleitet.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Ein alternder Drachenjäger wird für eine letzte Mission rekrutiert. Er muss eine Bestie töten, die ein Königreich terrorisiert, und wird dabei von der jungen Königin unterstützt.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Mädchen fällt durch ein Portal in eine Parallelwelt, in der Magie real ist. Um nach Hause zu kommen, muss sie einem gestürzten Prinzen helfen, seinen Thron zurückzuerobern.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Child },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Eine Gruppe von ungleichen Helden - ein Elf, ein Zwerg und ein Mensch - muss sich zusammenschließen. Sie müssen ein mächtiges, dunkles Artefakt zerstören, bevor es die Welt vernichtet.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Eine Fee wird aus ihrem Reich verbannt und muss in der Welt der Menschen überleben. Sie freundet sich mit einem zynischen Journalisten an, der ihr hilft, den Weg zurückzufinden.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
            ],
            "Horror": [
                {
                    text: "Eine Gruppe von Freunden entfesselt versehentlich einen alten Dämon in einer abgelegenen Hütte. Die Nacht wird zu einem blutigen Kampf ums Überleben gegen eine übermächtige Kraft.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Eine Familie zieht in ein altes Haus und stellt bald fest, dass es von einem rachsüchtigen Geist heimgesucht wird. Der Geist hat es auf ihr jüngstes Kind abgesehen und terrorisiert die Familie.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Child }
                },
                {
                    text: "Ein Team von paranormalen Ermittlern lässt sich in einer verlassenen Anstalt einschließen. Was als Routineuntersuchung beginnt, wird zu einem Albtraum, als die Geschichte des Ortes zum Leben erwacht.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Mann findet eine alte Videokassette, die einen Fluch auslöst. Er hat nur sieben Tage Zeit, um das Geheimnis zu lüften, bevor ihn ein geisterhaftes Mädchen heimsucht.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Serienmörder mit übernatürlichen Kräften terrorisiert eine Kleinstadt an Halloween. Eine junge Babysitterin muss sich ihm stellen, um die Kinder und sich selbst zu schützen.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Nach einem Autounfall erwacht eine Frau im Keller eines Mannes, der behauptet, die Welt draußen sei unbewohnbar. Sie muss herausfinden, ob er die Wahrheit sagt oder ein Psychopath ist.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
            ],
            "Musical": [
                {
                    text: "Eine aufstrebende Sängerin und ein desillusionierter Jazzpianist verlieben sich in L.A. Ihre Karrieren entwickeln sich in unterschiedliche Richtungen und stellen ihre Liebe auf die Probe.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Ein armer Dichter im Paris des 19. Jahrhunderts verliebt sich in den Star eines Nachtclubs. Ihre Liebe wird von einem eifersüchtigen Herzog bedroht, der alles daransetzt, sie zu trennen.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Eine junge Frau lädt drei Männer aus der Vergangenheit ihrer Mutter auf eine griechische Insel ein. Sie will herausfinden, wer ihr Vater ist, bevor sie heiratet.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein ehrgeiziger Zirkusdirektor stellt die größte Show der Welt zusammen. Er kämpft gegen Vorurteile und finanzielle Probleme, um seinen Traum zu verwirklichen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
            ],
            "Romanze": [
                {
                    text: "Zwei Menschen aus unterschiedlichen sozialen Schichten treffen sich zufällig und verlieben sich. Sie müssen gegen die Vorurteile ihrer Familien und Freunde ankämpfen, um zusammen zu sein.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Ein Mann und eine Frau, die sich seit ihrer Kindheit kennen, merken erst nach Jahren, dass sie füreinander bestimmt sind. Doch das Leben und andere Partner haben sie immer wieder getrennt.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Eine zynische Grußkartenautorin, die nicht an die Liebe glaubt, verliebt sich in einen Mann. Er ist das genaue Gegenteil von ihr und zeigt ihr, was es bedeutet, wirklich zu lieben.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Zwei erbitterte berufliche Rivalen sind gezwungen, an einem Projekt zusammenzuarbeiten. Aus anfänglicher Abneigung entwickelt sich langsam eine unerwartete Anziehung.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Eine Frau reist nach dem Ende einer langen Beziehung nach Italien, um sich selbst zu finden. Dort verliebt sie sich in einen charmanten Einheimischen und lernt, das Leben wieder zu genießen.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Mann mit der Fähigkeit zur Zeitreise versucht immer wieder, den perfekten Moment zu schaffen. Er will die Frau seiner Träume erobern, doch das Schicksal ist kompliziert.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
            ],
            "Sci-Fi": [
                {
                    text: "Die Besatzung eines Raumschiffs entdeckt eine außerirdische Lebensform. Sie erweist sich als weitaus intelligenter und gefährlicher, als sie dachten, und beginnt, die Crew zu dezimieren.",
                    mainRole: { gender: 'weiblich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "In einer dystopischen Zukunft, in der Gefühle unterdrückt werden, beginnt ein Mann, verbotene Emotionen zu empfinden. Er schließt sich einer Rebellion an, um das System zu stürzen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Wissenschaftler erfindet eine Zeitmaschine, um eine persönliche Tragödie zu verhindern. Doch seine Handlungen haben katastrophale Auswirkungen auf die Zukunft der gesamten Menschheit.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Replikant, ein künstlicher Mensch, wird gejagt, während er versucht, seinen Schöpfer zu finden. Ein desillusionierter Blade Runner ist ihm auf den Fersen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Hacker entdeckt, dass die Welt eine Computersimulation ist. Er schließt sich einer Gruppe von Rebellen an, um die Menschheit aus der digitalen Sklaverei zu befreien.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Ein Astronaut strandet allein auf dem Mars. Er muss seinen Verstand und seine Ingenieurskunst einsetzen, um zu überleben, bis eine Rettungsmission eintreffen kann.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
            ],
            "Thriller": [
                {
                    text: "Eine Frau erwacht mit Amnesie und muss herausfinden, wer sie ist. Sie wird von skrupellosen Killern gejagt und deckt eine Verschwörung auf, die ihr Leben bedroht.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein FBI-Agent jagt einen Serienmörder, der seine Opfer nach den sieben Todsünden tötet. Er muss mit einem älteren, erfahrenen Kollegen zusammenarbeiten, um den Mörder zu stoppen.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Ein Anwalt entdeckt, dass seine Kanzlei tief in die Geschäfte der Mafia verstrickt ist. Er gerät in tödliche Gefahr, als er versucht, auszusteigen und die Wahrheit ans Licht zu bringen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Eine junge FBI-Auszubildende muss die Hilfe eines inhaftierten, kannibalistischen Serienmörders in Anspruch nehmen. Nur er kann ihr helfen, einen anderen Mörder zu fassen.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Ein Mann, der nach dem mysteriösen Verschwinden seiner Frau zum Hauptverdächtigen wird, deckt eine Reihe schockierender Lügen und Geheimnisse auf. Die Wahrheit ist schlimmer als jeder Verdacht.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Mann, der an anterograder Amnesie leidet, versucht, den Mörder seiner Frau zu finden. Er benutzt Tattoos und Notizen, um sein Gedächtnis zu ersetzen und seine Rache zu planen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
            ],
            "Kriegsfilm": [
                {
                    text: "Die Geschichte einer Gruppe von Soldaten, die während des Zweiten Weltkriegs hinter feindlichen Linien gefangen sind. Ihr Anführer muss sie sicher nach Hause bringen.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Ein junger deutscher Soldat erlebt an der Westfront im Ersten Weltkrieg die grauenvollen Schrecken des Grabenkrieges. Seine anfängliche Begeisterung weicht schnell purem Entsetzen.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein US-Captain erhält den Befehl, während des Vietnamkriegs einen abtrünnigen Colonel zu liquidieren. Die Reise den Fluss hinauf wird zu einer Reise in die Finsternis.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Die Geschichte eines Sanitäters im Zweiten Weltkrieg, der sich weigerte, eine Waffe zu tragen. Er rettete Dutzende von Leben in der Schlacht von Okinawa und wurde zum Helden.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Unternehmer in Nazi-Deutschland versucht, so viele jüdische Arbeiter wie möglich zu beschäftigen. Er riskiert sein Leben, um sie vor dem Konzentrationslager zu retten.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein Bombenentschärfungsteam im Irakkrieg lebt in ständiger Anspannung. Jeder Einsatz könnte ihr letzter sein, während sie versuchen, mit dem Druck umzugehen.",
                    mainRole: { gender: 'männlich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.MiddleAged }
                },
            ],
            "Western": [
                {
                    text: "Ein alternder Revolverheld nimmt einen letzten Auftrag an. Er muss eine kleine Stadt vor einer rücksichtslosen Bande von Gesetzlosen schützen und stellt sich seinem Schicksal.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                    supportingRole: { gender: 'weiblich', age: ActorAge.MiddleAged }
                },
                {
                    text: "Ein mysteriöser Fremder schließt sich mit einem berüchtigten Banditen zusammen. Gemeinsam wollen sie sich an einem skrupellosen Eisenbahnbaron rächen, der ihr Leben zerstört hat.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Ein Bürgerkriegsveteran macht sich auf die jahrelange Suche nach seiner Nichte. Sie wurde von einem indigenen Stamm entführt, und seine Suche wird zur Obsession.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Young }
                },
                {
                    text: "Ein Farmer, der Rache für den Mord an seiner Familie schwört, wird zum gefürchteten Gesetzlosen. Er wird von seinen ehemaligen Freunden und dem Gesetz gejagt.",
                    mainRole: { gender: 'männlich', age: ActorAge.MiddleAged },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
                {
                    text: "Ein Sheriff muss seine Stadt allein gegen eine Bande von Verbrechern verteidigen. Die Stadtbewohner weigern sich aus Angst, ihm zu helfen, und er steht vor einer unmöglichen Aufgabe.",
                    mainRole: { gender: 'männlich', age: ActorAge.Old },
                    supportingRole: { gender: 'weiblich', age: ActorAge.Young }
                },
                {
                    text: "Eine Frau heuert einen einäugigen, trunksüchtigen Marshal an, um den Mörder ihres Vaters zu jagen. Gemeinsam begeben sie sich auf eine gefährliche Reise durch das Indianerterritorium.",
                    mainRole: { gender: 'weiblich', age: ActorAge.Young },
                    supportingRole: { gender: 'männlich', age: ActorAge.Old }
                },
            ],
        }
    }
};
