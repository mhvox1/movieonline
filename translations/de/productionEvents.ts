

export const productionEvents = {
    // --- EXISTING HYPE EVENTS ---
    'hype_01_set_leak': {
        title: 'Set-Fotos leaken!',
        text: 'Ein "versehentlich" an die Presse weitergegebenes Set-Foto sorgt für erste Spekulationen. Das Bild zeigt den Hauptdarsteller in einer Schlüsselszene, was die Fantasie der Fans anregt. In Leserbriefen und Fanzines werden bereits wildeste Theorien über die Handlung diskutiert. Das Marketing-Team ist begeistert von dieser kostenlosen Werbung, da der Hype-Index messbar ansteigt. Wir sollten diese Welle der Aufmerksamkeit nutzen, um das Interesse weiter anzuheizen. Das öffentliche Interesse an Ihrem Film ist spürbar gestiegen.',
        actions: { 'accept': 'Interessant!' }
    },
    'hype_02_actor_post': {
        title: 'TV-Auftritt!',
        text: 'Ihr Star {talentName} hat in einer beliebten Vorabend-Show ein lustiges Video hinter den Kulissen gezeigt. Es zeigt die Crew in einem ausgelassenen Moment und verleiht der Produktion eine sympathische, menschliche Note. Am nächsten Tag sprachen die Leute im Büro und auf der Straße nur noch darüber. Der Film ist plötzlich in aller Munde und erreicht Zielgruppen, die wir mit klassischer Werbung nie erreicht hätten. Das ist Gold wert für unsere Kampagne!',
        actions: { 'accept': 'Großartige PR!' }
    },
    'hype_03_critic_praise': {
        title: 'Kritiker lobt Dailies',
        text: 'Ein einflussreicher Journalist durfte exklusiv einen Blick auf das erste Rohmaterial werfen. Er schreibt nun begeistert in seiner Kolumne über die "atemberaubende Cinematographie" und die Intensität der schauspielerischen Leistung. Solch ein frühes Lob von einer respektierten Quelle ist selten und extrem wertvoll. Die Erwartungen in der Branche steigen rasant an. Investoren und Verleiher werden langsam nervös vor Vorfreude.',
        actions: { 'accept': 'Ausgezeichnet!' }
    },
    'hype_04_fan_encounter': {
        title: 'Fans am Drehort',
        text: 'Eine kleine Gruppe begeisterter Fans hat den geheimen Drehort ausfindig gemacht. Statt sie zu verjagen, haben sich die Darsteller kurz Zeit für Autogramme genommen. Die Stimmung war fantastisch und Fotos davon kursieren in Fan-Kreisen. Die Lokalpresse berichtet sehr positiv über die Fannähe unserer Produktion. Das stärkt die Bindung zur Community enorm.',
        actions: { 'accept': 'Sympathisch!' }
    },

    // --- EXISTING PRODUCTION DELAYS ---
    'prod_delay_drug_rehab': {
        title: 'Schattenseiten des Ruhms',
        text: 'Wir haben ein ernstes Problem: Ihr Hauptdarsteller {talentName} ist den Versuchungen des Ruhms erlegen. Sein Verhalten am Set war heute untragbar und gefährdete die Sicherheit der Crew. Er hat eingesehen, dass er professionelle Hilfe benötigt und muss sofort in eine Entzugsklinik. Der Drehplan gerät dadurch massiv ins Wanken. Wir stehen vor einer schwierigen Entscheidung: Warten wir auf ihn oder versuchen wir, mit Tricks zu arbeiten?',
        actions: { 'pause': 'Produktion pausieren', 'double': 'Double einsetzen' }
    },
    'prod_delay_creative_diff': {
        title: 'Kreative Differenzen',
        text: 'Die Stimmung am Set ist zum Zerreißen gespannt. Zwischen dem Regisseur {talentName} und dem Hauptdarsteller ist ein heftiger Streit über die Interpretation einer Schlüsselszene entbrannt. Beide beharren stur auf ihrer künstlerischen Vision und weigern sich, Kompromisse einzugehen. Die Crew steht tatenlos herum, während die beiden sich lautstark anschreien. Wenn wir nicht bald eingreifen, droht der Drehtag komplett zu platzen.',
        actions: { 'discuss': 'Diskussion zulassen', 'force': 'Machtwort sprechen' }
    },
    'prod_delay_tech_failure': {
        title: 'Technisches Versagen',
        text: 'Mitten in der aufwendigsten Einstellung des Tages gab es einen lauten Knall. Unsere Hauptkamera hat den Geist aufgegeben und Rauch stieg aus dem Gehäuse auf. Die Techniker vermuten einen irreparablen Platinenschaden durch Überhitzung. Wir haben keine gleichwertige Ersatzkamera vor Ort. Ohne dieses Equipment können wir die geplante Sequenz nicht in der benötigten Qualität drehen.',
        actions: { 'express': 'Ersatzteil einfliegen', 'wait': 'Auf Standard-Versand warten' }
    },

    // --- EXISTING COST EVENTS ---
    'cost_01_equipment_failure': {
        title: 'Defektes Equipment',
        text: 'Ein wichtiges Spezialobjektiv ist während eines Stunts beschädigt worden. Es ist für den visuellen Look des Films essenziell, aber extrem teuer in der Wiederbeschaffung. Der Kameramann weigert sich, mit minderwertigem Ersatz weiterzudrehen. Wir müssen schnell entscheiden, ob wir das Budget belasten oder improvisieren. Eine Verzögerung wäre ebenfalls kostspielig.',
        actions: { 'repair': 'Sofort ersetzen', 'improvise': 'Improvisieren' }
    },
    'cost_03_permit_issues': {
        title: 'Probleme mit Drehgenehmigung',
        text: 'Die Stadtverwaltung macht plötzlich Probleme wegen einer bereits erteilten Drehgenehmigung für die Innenstadt. Ein Bürokrat hat wohl einen Formfehler gefunden und droht, das Set räumen zu lassen. Das würde uns Tage kosten und den Zeitplan sprengen. Es gibt Andeutungen, dass eine "beschleunigte Bearbeitungsgebühr" das Problem lösen könnte. Alternativ müssten wir den Drehort kurzfristig verlegen.',
        actions: { 'bribe': 'Bearbeitungsgebühr zahlen', 'move': 'Ort verlegen' }
    },
    'cost_11_overtime': {
        title: 'Überstunden angeordnet',
        text: 'Um den straffen Zeitplan einzuhalten, hat der Regisseur {talentName} mehrere Nachtdrehs angeordnet. Die Crew ist bereits erschöpft, und die Gewerkschaftsregeln verlangen hohe Zuschläge für diese Zeiten. Wenn wir das nicht genehmigen, werden wir den Film nicht rechtzeitig fertigstellen. Die Kosten für die Überstunden sprengen jedoch das kalkulierte Tagesbudget deutlich.',
        actions: { 'pay_overtime': 'Überstunden genehmigen', 'cancel_night': 'Nachtdreh streichen' }
    },

    // --- NEW HYPE EVENTS (25) ---
    'hype_new_1': { 
        title: 'Talkshow-Auftritt', 
        text: 'Ihr Hauptdarsteller wurde in die populärste Late-Night-Show des Landes eingeladen. Der Moderator ist bekannt für seine provokanten Fragen. Unser Star hat einen riskanten Witz auf den Lippen, der entweder das Publikum begeistern oder einen Skandal auslösen könnte. Die Live-Übertragung läuft gleich. Sollen wir ihn ermutigen, frech zu sein, oder auf Nummer sicher gehen?', 
        actions: { 'risk': 'Riskanter Witz', 'safe': 'Braves Interview' } 
    },
    'hype_new_2': { 
        title: 'Poster-Enthüllung', 
        text: 'Das erste Teaser-Poster ist fertig und es sieht absolut fantastisch aus. Die Grafikabteilung hat sich selbst übertroffen. Wir könnten es sofort an Kinos schicken, um die Vorfreude zu steigern. Die ersten Reaktionen interner Testgruppen waren euphorisch. Das könnte der Startschuss für einen riesigen Hype sein.', 
        actions: { 'accept': 'Veröffentlichen!' } 
    },
    'hype_new_3': { 
        title: 'Gerüchteküche', 
        text: 'Die Klatschblätter spekulieren wild über eine angebliche Affäre zwischen den beiden Hauptdarstellern am Set. Das ist zwar absolut nicht wahr, bringt uns aber täglich auf die Titelseiten. Die Paparazzi belagern das Studio. Wir könnten die Gerüchte dementieren oder das Feuer weiter schüren, um im Gespräch zu bleiben.', 
        actions: { 'risk': 'Gerüchte befeuern', 'safe': 'Dementieren' } 
    },
    'hype_new_4': { 
        title: 'Charity-Event', 
        text: 'Das gesamte Team hat einen drehfreien Tag geopfert, um in einer lokalen Suppenküche zu helfen. Die Presse war anwesend und hat herzerwärmende Bilder gemacht. Das poliert unser Image enorm auf und zeigt die Stars von ihrer menschlichen Seite. Solche Aktionen sind unbezahlbar für die öffentliche Wahrnehmung.', 
        actions: { 'accept': 'Gutes Karma!' } 
    },
    'hype_new_5': { 
        title: 'Merchandise-Leak', 
        text: 'Ein unscharfes Foto einer Actionfigur zum Film ist viel zu früh in einem Fan-Magazin aufgetaucht. Die Qualität der Figur wird in Leserbriefen heiß diskutiert und teilweise kritisiert. Wir könnten behaupten, es sei ein früher Prototyp, um die Wogen zu glätten, oder versuchen, die Verbreitung zu stoppen.', 
        actions: { 'risk': 'Als Prototyp bezeichnen', 'safe': 'Verbreitung stoppen' } 
    },
    'hype_new_6': { 
        title: 'MTV-Reporter', 
        text: 'Ein bekannter MTV-Reporter hat sich auf das Set geschlichen und das Catering in einem Segment gelobt. Millionen Teenager kennen jetzt unseren Filmtitel. Es ist zwar ein Sicherheitsrisiko, aber die kostenlose Werbung bei der jungen Zielgruppe ist gigantisch. Wir sollten das positiv framen.', 
        actions: { 'accept': 'Cool!' } 
    },
    'hype_new_7': { 
        title: 'Kontroverse Szene', 
        text: 'Eine Statistenrolle hat sich öffentlich über eine angeblich "zu gewagte" Szene beschwert. Ein kleiner Skandal braut sich zusammen, konservative Gruppen rufen zum Boykott auf. Gleichzeitig steigt das Interesse an dem "Verbotsfilm" massiv an. Sollen wir die künstlerische Freiheit verteidigen oder die Szene schneiden?', 
        actions: { 'risk': 'Szene verteidigen', 'safe': 'Szene schneiden' } 
    },
    'hype_new_8': { 
        title: 'Trailer-Musik', 
        text: 'Ein bekannter Musiker hat das Rohmaterial gesehen und angeboten, einen exklusiven Song für den Trailer zu produzieren. Das würde uns Zugang zu Radiostationen verschaffen. Es ist eine einmalige Gelegenheit, den Film auch auditiv zu einem Erlebnis zu machen.', 
        actions: { 'accept': 'Annehmen!' } 
    },
    'hype_new_9': { 
        title: 'Fan-Art Wettbewerb', 
        text: 'Fans haben von sich aus begonnen, beeindruckende Poster und Zeichnungen zu den Charakteren an das Studio zu schicken. Die Qualität ist teilweise besser als unsere offiziellen Entwürfe. Wir könnten das offiziell unterstützen und einen Wettbewerb in einer Zeitschrift daraus machen. Oder wir ignorieren es.', 
        actions: { 'risk': 'Wettbewerb starten', 'safe': 'Ignorieren' } 
    },
    'hype_new_10': { 
        title: 'Set-Besuch', 
        text: 'Eine Schulklasse durfte heute beim Dreh zusehen. Die Kinder waren begeistert und die Lehrer haben tolle Fotos gemacht. Die Lokalpresse fand das sehr sympathisch und bringt morgen einen großen Artikel. Das stärkt unsere Verankerung in der lokalen Community.', 
        actions: { 'accept': 'Niedlich!' } 
    },
    'hype_new_11': { 
        title: 'Zeitungs-Krieg', 
        text: 'Unser Regisseur liefert sich gerade öffentlich in Zeitungsinterviews einen Streit mit einem bekannten Kritiker. Der Tonfall ist scharf, aber sehr unterhaltsam. Die Auflage steigt. Es ist unprofessionell, aber es bringt Aufmerksamkeit. Sollen wir ihn stoppen?', 
        actions: { 'risk': 'Laufen lassen', 'safe': 'Stoppen' } 
    },
    'hype_new_12': { 
        title: 'Cameo-Gerücht', 
        text: 'Es wird hartnäckig gemunkelt, ein alter Hollywood-Star hätte einen geheimen Gastauftritt im Film. Die Fans drehen durch vor Neugier. Wir könnten das Gerücht dementieren oder einfach schweigen und die Spannung aufrechterhalten. Das Geheimnis ist Gold wert.', 
        actions: { 'accept': 'Geheim halten!' } 
    },
    'hype_new_13': { 
        title: 'Interview-Marathon', 
        text: 'Die Hauptdarstellerin ist nach einem 14-Stunden-Tag völlig erschöpft, aber ein großes Magazin will noch ein exklusives Spontan-Interview. Sie ist gereizt und könnte etwas Falsches sagen. Andererseits ist das Cover dieses Magazins unbezahlbar. Riskieren wir den Burnout?', 
        actions: { 'risk': 'Interview erzwingen', 'safe': 'Absagen' } 
    },
    'hype_new_14': { 
        title: 'Making-Of Clip', 
        text: 'Der Cutter hat einen kurzen Clip zusammengestellt, der zeigt, wie viel Spaß das Team am Set hat. Es gibt Patzer und Lachanfälle zu sehen. Das Video vermittelt eine tolle Atmosphäre und macht die Stars nahbar. Das kommt sicher gut im Fernsehen an.', 
        actions: { 'accept': 'Senden!' } 
    },
    'hype_new_15': { 
        title: 'Titel-Änderung?', 
        text: 'Eine Fokusgruppe findet den aktuellen Arbeitstitel verwirrend und wenig einprägsam. Das Marketing schlägt eine Änderung vor. Das bringt neue Presse, verwirrt aber die bestehenden Fans, die den alten Titel schon kennen. Eine schwierige Entscheidung in dieser Phase.', 
        actions: { 'risk': 'Titel ändern', 'safe': 'Titel behalten' } 
    },
    'hype_new_16': { 
        title: 'Radio-Interview', 
        text: 'Wir haben spontan ein Live-Interview vom Set für einen großen Radiosender gegeben. Die Hörer waren begeistert und haben angerufen. Die Interaktion war authentisch und hat die Bindung zur Community enorm gestärkt.', 
        actions: { 'accept': 'Wow!' } 
    },
    'hype_new_17': { 
        title: 'Geleaktes Script', 
        text: 'Eine Seite des Drehbuchs wurde im Müll gefunden und an die Presse verkauft. Sie enthält massive Spoiler zum Ende des Films. Wir könnten behaupten, es sei eine gefälschte Version, um die Überraschung zu retten, oder versuchen, die Veröffentlichung zu verhindern.', 
        actions: { 'risk': 'Als Fake abtun', 'safe': 'Veröffentlichung stoppen' } 
    },
    'hype_new_18': { 
        title: 'Preis-Nominierung', 
        text: 'Das Projekt wurde schon vor der Fertigstellung für einen "Most Anticipated Movie" Preis nominiert. Das ist eine große Ehre und zeigt, wie hoch die Erwartungen sind. Das Team ist motiviert bis in die Haarspitzen.', 
        actions: { 'accept': 'Feiern!' } 
    },
    'hype_new_19': { 
        title: 'Mode-Statement', 
        text: 'Das ikonische Kostüm des Helden ist überraschend auf der Fashion Week aufgetaucht, getragen von einem Model. Ist das der Start eines neuen Trends? Wir könnten sofort eine Modelinie lizensieren oder es nur als gute PR betrachten.', 
        actions: { 'risk': 'Kollektion starten', 'safe': 'Nur PR nutzen' } 
    },
    'hype_new_20': { 
        title: 'Musikvideo-Tanz', 
        text: 'Der Cast hat in einer Pause aus Langeweile einen Tanz aus einem aktuellen Musikvideo einstudiert, der auf MTV rauf und runter läuft. Das kommt sicher gut in den "Behind the Scenes". Das ist die beste Art von sympathischer Werbung.', 
        actions: { 'accept': 'Mitanzen!' } 
    },
    'hype_new_21': { 
        title: 'Versteckte Hinweise', 
        text: 'Fans suchen in den veröffentlichten Pressefotos wie besessen nach versteckten Hinweisen auf die Handlung. Wir könnten absichtlich falsche Fährten legen, um die Diskussion in Magazinen anzuheizen, oder uns einfach über das Interesse freuen.', 
        actions: { 'risk': 'Hinweise streuen', 'safe': 'Lachen' } 
    },
    'hype_new_22': { 
        title: 'Dokumentation', 
        text: 'Ein renommierter TV-Sender hat angefragt und will eine begleitende Doku über die Dreharbeiten machen. Das würde uns zusätzliche Sendezeit und Aufmerksamkeit bescheren, bedeutet aber auch Kameras überall am Set.', 
        actions: { 'accept': 'Zusagen!' } 
    },
    'hype_new_23': { 
        title: 'Plakat-Vandalismus', 
        text: 'Jemand hat unsere Plakate in der Stadt lustig überklebt und ihnen Schnurrbärte gemalt. Die Leute lachen darüber. Wir könnten Humor zeigen und mitlachen, oder die Sache ernst nehmen und Anzeige erstatten.', 
        actions: { 'risk': 'Mitlachen', 'safe': 'Anzeige erstatten' } 
    },
    'hype_new_24': { 
        title: 'Radio-Countdown', 
        text: 'Ein Radiosender hat einen Countdown bis zum Filmstart gestartet. Jeden Tag gibt es neue Infos. Die Hörer sind gespannt und die Anrufe beim Sender explodieren. Spannung pur!', 
        actions: { 'accept': 'Spannung!' } 
    },
    'hype_new_25': { 
        title: 'Legendärer Slogan', 
        text: 'Ein Satz aus dem Film ist schon jetzt, nur durch den Trailer, zum geflügelten Wort geworden. Wir könnten den Satz offiziell als Slogan nutzen, auch wenn er etwas albern ist, oder es ignorieren.', 
        actions: { 'risk': 'Slogan nutzen', 'safe': 'Ignorieren' } 
    },

    // --- NEW PRODUCTION EVENTS (25) ---
    'prod_new_1': { 
        title: 'Wetterchaos', 
        text: 'Ein unerwarteter Sturm ist über Nacht aufgezogen und hat das aufwendige Außenset teilweise verwüstet. Wir können warten, bis der Regen aufhört, was Tage dauern könnte, oder das Drehbuch umschreiben und drinnen drehen. Das würde aber den Look des Films verändern.', 
        actions: { 'delay': 'Warten (Dauer+)', 'rush': 'Drinnen drehen (Qualität-)' } 
    },
    'prod_new_2': { 
        title: 'Neue Technologie', 
        text: 'Ein Techniker schlägt vor, eine experimentelle neue Kamera zu nutzen, die gerade erst auf den Markt gekommen ist. Sie verspricht fantastische Bilder, ist aber noch ungetestet und teuer in der Miete. Sollen wir das Risiko eingehen?', 
        actions: { 'invest': 'Ausprobieren (Kosten+)', 'ignore': 'Standard bleiben' } 
    },
    'prod_new_3': { 
        title: 'Krankheitswelle', 
        text: 'Die halbe Crew liegt mit einer schweren Grippe flach. Wichtige Positionen sind unbesetzt. Der Drehplan wackelt bedenklich. Wir müssen improvisieren und Doppelschichten schieben, um nicht völlig in Verzug zu geraten.', 
        actions: { 'ok': 'Zähne zusammenbeißen' } 
    },
    'prod_new_4': { 
        title: 'Perfektes Licht', 
        text: 'Die "Golden Hour" dauert heute aufgrund besonderer Wetterbedingungen ungewöhnlich lange an. Das Licht ist magisch! Der Kameramann fleht uns an, den Drehplan zu überziehen, um diese einmaligen Bilder einzufangen. Das kostet Überstunden, aber die Qualität wäre einzigartig.', 
        actions: { 'delay': 'Länger drehen (Qualität+)', 'rush': 'Zeitplan halten' } 
    },
    'prod_new_5': { 
        title: 'Requisitenfehler', 
        text: 'Ein wichtiges Requisit wurde in der falschen Farbe geliefert. Es passt überhaupt nicht zum Set-Design. Wir könnten per Express ein neues bestellen, was teuer ist, oder das falsche benutzen und hoffen, dass es niemandem auffällt.', 
        actions: { 'invest': 'Neu bestellen (Kosten+)', 'ignore': 'Benutzen (Qualität-)' } 
    },
    'prod_new_6': { 
        title: 'Teamgeist', 
        text: 'Ein gemeinsames Abendessen gestern hat Wunder für die Moral bewirkt. Die Stimmung am Set ist heute fantastisch. Alle arbeiten Hand in Hand, Probleme werden sofort gelöst. Wir kommen viel schneller voran als geplant.', 
        actions: { 'ok': 'Weiter so!' } 
    },
    'prod_new_7': { 
        title: 'Text-Unsicherheit', 
        text: 'Der Hauptdarsteller stolpert immer wieder über einen langen Monolog. Er findet die Worte unnatürlich. Wir könnten die Szene umschreiben und proben, was Zeit kostet, oder ihn zwingen, den Text so zu sprechen, wie er im Skript steht.', 
        actions: { 'delay': 'Umschreiben (Zeit+)', 'rush': 'So lassen (Qualität-)' } 
    },
    'prod_new_8': { 
        title: 'Lokale Unterstützung', 
        text: 'Die Anwohner sind begeistert von den Dreharbeiten und helfen uns freiwillig beim Absperren der Straße. Das spart uns externe Security-Kosten. Wir sollten uns erkenntlich zeigen und ein großzügiges Trinkgeld für die Gemeinschaftskasse geben.', 
        actions: { 'invest': 'Trinkgeld geben (Ruf+)', 'ignore': 'Danke sagen' } 
    },
    'prod_new_9': { 
        title: 'Stromausfall', 
        text: 'Der Hauptgenerator ist ausgefallen. Wir sitzen im Dunkeln. Bis Ersatz da ist, dauert es Stunden. Wir können die Zeit nur nutzen, um Texte zu lernen oder eine Zwangspause einzulegen. Ein verlorener Vormittag.', 
        actions: { 'ok': 'Pause machen' } 
    },
    'prod_new_10': { 
        title: 'Improvisation', 
        text: 'Ein Schauspieler hat in einer emotionalen Szene improvisiert und sie völlig anders gespielt als geplant. Der Regisseur ist begeistert, es ist viel intensiver! Wir müssten die Folgeszenen anpassen. Sollen wir diese Version nehmen?', 
        actions: { 'delay': 'Szene ausbauen', 'rush': 'Zurück zum Skript' } 
    },
    'prod_new_11': { 
        title: 'Zusatzdreh', 
        text: 'Der Regisseur hat eine Vision für eine ungeplante, aber spektakuläre Szene, die den Film enorm aufwerten würde. Dafür müssten wir aber extra Budget freigeben und das Set umbauen. Ist es das wert?', 
        actions: { 'invest': 'Genehmigen (Kosten+)', 'ignore': 'Ablehnen' } 
    },
    'prod_new_12': { 
        title: 'Logistikwunder', 
        text: 'Der Transport aller Fahrzeuge und Ausrüstung zum nächsten Drehort hat heute perfekt geklappt, ohne den üblichen Stau. Wir sind Stunden vor dem Zeitplan und können früher anfangen. Ein seltener Glücksfall.', 
        actions: { 'ok': 'Perfekt!' } 
    },
    'prod_new_13': { 
        title: 'Lärmbelästigung', 
        text: 'Flugzeuge stören heute im Minutentakt die Tonaufnahme. Wir können entweder nach jedem Flugzeug warten, was ewig dauert, oder den Ton später im Studio nachsynchronisieren, was nie so authentisch klingt.', 
        actions: { 'delay': 'Warten (Zeit+)', 'rush': 'Nachvertonen (Qualität-)' } 
    },
    'prod_new_14': { 
        title: 'Expertenrat', 
        text: 'Ein renommierter Historiker ist am Set und bietet an, die Kostüme auf historische Korrektheit zu prüfen. Er würde Fehler finden, aber seine Beratung kostet ein Honorar. Für die Glaubwürkeit wäre es gut.', 
        actions: { 'invest': 'Engagieren (Qualität+)', 'ignore': 'Brauchen wir nicht' } 
    },
    'prod_new_15': { 
        title: 'Verletzung am Set', 
        text: 'Ein Stuntman hat sich bei einer Probe leicht verletzt. Es ist nichts Ernstes, aber es hat allen einen Schrecken eingejagt. Wir müssen die Sicherheitsvorkehrungen noch einmal überprüfen und vorsichtiger sein.', 
        actions: { 'ok': 'Sicherheit erhöhen' } 
    },
    'prod_new_16': { 
        title: 'Magischer Moment', 
        text: 'Die Chemie zwischen den Hauptdarstellern ist heute elektrisierend. Es knistert förmlich in der Luft. Wir sollten mehr Takes machen, um jede Nuance dieses Moments einzufangen, auch wenn wir dafür länger brauchen.', 
        actions: { 'delay': 'Mehr Takes (Qualität+)', 'rush': 'Im Kasten' } 
    },
    'prod_new_17': { 
        title: 'Catering-Panne', 
        text: 'Der Catering-Wagen hatte eine Panne und das Essen ist nicht gekommen. Das Team ist hungrig und sauer. Wir müssen sofort Pizza für alle bestellen, sonst haben wir eine Meuterei am Hals. Das geht aufs Budget.', 
        actions: { 'invest': 'Pizza bestellen (Kosten+)', 'ignore': 'Fastenzeit' } 
    },
    'prod_new_18': { 
        title: 'Effizienter Tag', 
        text: 'Die Crew arbeitet heute wie ein Uhrwerk. Jeder Handgriff sitzt. Wir schaffen das Doppelte des geplanten Pensums. Solche Tage sind Gold wert und sparen uns hinten raus viel Stress.', 
        actions: { 'ok': 'Juhu!' } 
    },
    'prod_new_19': { 
        title: 'Künstlerkrise', 
        text: 'Der Regisseur hat eine plötzliche Sinnkrise, schließt sich in seinen Wohnwagen ein und will das ganze Konzept ändern. Wir müssen ihn therapieren und beruhigen, das kostet Zeit. Oder wir ignorieren ihn und drehen nach Plan weiter.', 
        actions: { 'delay': 'Therapieren (Zeit+)', 'rush': 'Ignorieren (Qualität-)' } 
    },
    'prod_new_20': { 
        title: 'Spezialeffekt', 
        text: 'Ein praktischer Effekt (eine Explosion) sieht vor der Kamera viel besser aus als erwartet. Wir könnten mehr davon in den Film einbauen, das kostet Material, sieht aber fantastisch aus.', 
        actions: { 'invest': 'Mehr davon (Qualität+)', 'ignore': 'Reicht so' } 
    },
    'prod_new_21': { 
        title: 'Datenverlust', 
        text: 'Eine Speicherkarte ist korrupt. Ein halber Tag Arbeit ist weg. Wir müssen die Szenen morgen noch einmal drehen. Die Stimmung ist am Boden, aber wir haben keine Wahl.', 
        actions: { 'ok': 'Verdammt!' } 
    },
    'prod_new_22': { 
        title: 'Tierdarsteller', 
        text: 'Der Hund am Set hört heute überhaupt nicht auf Kommandos. Er läuft ständig aus dem Bild. Wir können Geduld haben und warten, bis er es richtig macht, oder ihn aus der Szene schneiden.', 
        actions: { 'delay': 'Geduld haben', 'rush': 'Hund rausschneiden' } 
    },
    'prod_new_23': { 
        title: 'Luftaufnahme', 
        text: 'Das Wetter ist perfekt für eine spektakuläre Luftaufnahme der Landschaft. Wir müssten spontan einen Helikopter mieten. Das war nicht geplant, würde den Film aber optisch aufwerten.', 
        actions: { 'invest': 'Helikopter mieten', 'ignore': 'Zu teuer' } 
    },
    'prod_new_24': { 
        title: 'Gute Vorbereitung', 
        text: 'Dank des exzellenten Storyboards wissen alle genau, was zu tun ist. Es gibt keine Missverständnisse und keine Wartezeiten. Gute Planung zahlt sich eben aus.', 
        actions: { 'ok': 'Weiter so' } 
    },
    'prod_new_25': { 
        title: 'Nachtdreh', 
        text: 'Die geplante Szene wirkt bei Nacht viel atmosphärischer als am Tag. Wir könnten spontan länger bleiben und in die Dunkelheit hinein drehen. Das bedeutet Überstunden, aber der Look wäre genial.', 
        actions: { 'delay': 'Länger bleiben', 'rush': 'Abbrechen' } 
    },

    // --- NEW COST EVENTS (25) ---
    'cost_new_1': { 
        title: 'Lizenzgebühren', 
        text: 'Wir haben einen Song für eine Szene verwendet, dessen Rechte viel teurer sind als gedacht. Der Rechteinhaber verlangt eine saftige Nachzahlung. Wir können zahlen oder den Song austauschen und die Szene neu schneiden.', 
        actions: { 'pay': 'Zahlen', 'cheap': 'Anderen Song nehmen' } 
    },
    'cost_new_2': { 
        title: 'Parkknöllchen', 
        text: 'Die Produktionsfahrzeuge standen im absoluten Halteverbot. Die Stadtverwaltung kennt kein Erbarmen und kassiert ab. Dutzende Strafzettel kleben an den Scheiben. Das müssen wir wohl oder übel zahlen.', 
        actions: { 'pay_forced': 'Zähneknirschend zahlen' } 
    },
    'cost_new_3': { 
        title: 'Versicherung', 
        text: 'Die Versicherung verlangt kurzfristig einen Risikozuschlag, weil wir mehr Stunts machen als ursprünglich angegeben. Wir können zahlen und sicher sein, oder das Risiko eingehen und unversichert drehen (schlecht für den Ruf).', 
        actions: { 'pay': 'Versichern', 'cheap': 'Risiko eingehen (Ruf-)' } 
    },
    'cost_new_4': { 
        title: 'Kaputter Generator', 
        text: 'Unser Hauptstromgenerator hat den Geist aufgegeben. Ohne Strom kein Dreh. Wir müssen sofort ein Ersatzgerät mieten und liefern lassen. Das ist teuer, aber ohne geht es nicht weiter.', 
        actions: { 'pay_forced': 'Ersetzen' } 
    },
    'cost_new_5': { 
        title: 'Überstunden Catering', 
        text: 'Der Dreh dauerte heute drei Stunden länger als geplant. Das Catering-Team verlangt einen vertraglich festgelegten Zuschlag. Wir können zahlen oder uns weigern, was die Moral der Truppe senken würde.', 
        actions: { 'pay': 'Bezahlen', 'cheap': 'Verweigern (Moral-)' } 
    },
    'cost_new_6': { 
        title: 'Mietwagen-Schaden', 
        text: 'Ein Produktionswagen hat beim Einparken einen dicken Kratzer abbekommen. Der Verleiher stellt uns die Reparatur und den Wertverlust in Rechnung. Ärgerlich, aber wir sind versichert (mit Selbstbeteiligung).', 
        actions: { 'pay_forced': 'Reparatur zahlen' } 
    },
    'cost_new_7': { 
        title: 'Location-Miete', 
        text: 'Der Besitzer der Villa, in der wir drehen, will plötzlich mehr Geld, weil wir den Rasen "strapaziert" haben. Wir können zahlen, um Ärger zu vermeiden, oder mit Anwälten drohen (schlecht für den Ruf).', 
        actions: { 'pay': 'Zahlen', 'cheap': 'Drohen (Ruf-)' } 
    },
    'cost_new_8': { 
        title: 'Software-Update', 
        text: 'Wir brauchen dringend ein Update für die Schnittsoftware, um die neuen Dateiformate der Kamera lesen zu können. Die Lizenz ist teuer, aber ohne können wir das Material nicht bearbeiten.', 
        actions: { 'pay_forced': 'Kaufen' } 
    },
    'cost_new_9': { 
        title: 'Reisekosten', 
        text: 'Die Flüge zum nächsten Drehort sind kurzfristig teurer geworden. Wir können Business Class buchen, damit die Stars entspannt ankommen, oder alle in die Economy stecken (schlecht für die Moral).', 
        actions: { 'pay': 'Business Class', 'cheap': 'Economy (Moral-)' } 
    },
    'cost_new_10': { 
        title: 'Reinigungsgebühr', 
        text: 'Wir haben das Set gestern ziemlich schmutzig hinterlassen. Der Vermieter verlangt eine professionelle Sonderreinigung. Das steht so im Vertrag, wir kommen da nicht raus.', 
        actions: { 'pay_forced': 'Reinigung zahlen' } 
    },
    'cost_new_11': { 
        title: 'Make-Up Nachschub', 
        text: 'Das teure Spezial-Make-Up für die Aliens ist ausgegangen. Wir brauchen Nachschub per Express-Lieferung. Oder wir improvisieren mit billiger Farbe, was man auf der Leinwand sehen könnte.', 
        actions: { 'pay': 'Express-Lieferung', 'cheap': 'Improvisieren (Qualität-)' } 
    },
    'cost_new_12': { 
        title: 'Anwaltskosten', 
        text: 'Ein Passant behauptet, er sei im Bild gewesen und will Geld. Wir müssen einen Vertrag rechtlich prüfen lassen, um sicherzugehen. Die Anwälte kosten pro Stunde.', 
        actions: { 'pay_forced': 'Anwalt zahlen' } 
    },
    'cost_new_13': { 
        title: 'Hotel-Upgrade', 
        text: 'Das gebuchte Hotel hat die Zimmer überbucht. Unsere Stars stehen ohne Suite da. Wir können ein Upgrade in ein 5-Sterne-Haus zahlen oder sie in Standardzimmer stecken (schlecht für die Moral).', 
        actions: { 'pay': 'Upgrade zahlen', 'cheap': 'Standardzimmer (Moral-)' } 
    },
    'cost_new_14': { 
        title: 'Zollgebühren', 
        text: 'Unser Equipment hängt am Zoll fest, weil Formulare fehlten. Um es freizubekommen, müssen wir Gebühren und eine Strafe zahlen. Sonst können wir morgen nicht drehen.', 
        actions: { 'pay_forced': 'Gebühren zahlen' } 
    },
    'cost_new_15': { 
        title: 'Sicherheitsdienst', 
        text: 'Fans belagern das Set und stören die Aufnahmen. Wir brauchen dringend mehr Security, um den Bereich abzusperren. Oder wir ignorieren es und riskieren Störungen im Bild.', 
        actions: { 'pay': 'Security holen', 'cheap': 'Ignorieren (Risiko)' } 
    },
    'cost_new_16': { 
        title: 'Druckkosten', 
        text: 'Das Drehbuch wurde in letzter Minute geändert. Wir mussten über Nacht 100 neue Exemplare drucken und binden lassen. Der Express-Service lässt sich das gut bezahlen.', 
        actions: { 'pay_forced': 'Druckerei bezahlen' } 
    },
    'cost_new_17': { 
        title: 'Tierarzt', 
        text: 'Der Filmhund hat am Set etwas Falsches gefressen und muss zum Tierarzt. Die Behandlungskosten übernehmen wir natürlich. Wir könnten auch warten, aber das ist riskant.', 
        actions: { 'pay': 'Zum Tierarzt', 'cheap': 'Abwarten' } 
    },
    'cost_new_18': { 
        title: 'Heizkosten', 
        text: 'Es ist unerwartet kalt geworden am Set. Die Crew friert. Wir müssen Heizpilze und Gasflaschen mieten, um die Arbeitsbedingungen erträglich zu halten.', 
        actions: { 'pay_forced': 'Heizung mieten' } 
    },
    'cost_new_19': { 
        title: 'Architekt', 
        text: 'Ein selbstgebautes Set wirkt instabil. Wir sollten einen Statiker kommen lassen, um die Sicherheit zu prüfen. Das kostet, ist aber sicherer als einfach zu hoffen, dass es hält.', 
        actions: { 'pay': 'Prüfer holen', 'cheap': 'Hoffen es hält' } 
    },
    'cost_new_20': { 
        title: 'Datenrettung', 
        text: 'Ein Magnetband mit den Aufnahmen von gestern macht komische Geräusche. Wir brauchen einen Spezialisten für Datenrettung, um das Material zu sichern. Das ist sehr teuer, aber billiger als neu drehen.', 
        actions: { 'pay_forced': 'Daten retten' } 
    },
    'cost_new_21': { 
        title: 'Express-Kurier', 
        text: 'Ein wichtiges Kostüm wurde in der Schneiderei vergessen. Es muss über Nacht per Kurier hierher gebracht werden, sonst können wir die Szene morgen nicht drehen. Warten kostet Zeit.', 
        actions: { 'pay': 'Express zahlen', 'cheap': 'Warten (Zeit-)' } 
    },
    'cost_new_22': { 
        title: 'Lackschaden', 
        text: 'Beim Aufbau wurde eine Wand am Set beschädigt. Wir müssen einen Maler kommen lassen, der das über Nacht repariert, damit es im Film nicht auffällt.', 
        actions: { 'pay_forced': 'Maler rufen' } 
    },
    'cost_new_23': { 
        title: 'Kaffee-Notstand', 
        text: 'Der gute Kaffee ist alle, nur noch die billige Plörre da. Die Crew wird unruhig. Wir können teuren Premium-Kaffee nachbestellen oder sie zwingen, das billige Zeug zu trinken (Moral-).', 
        actions: { 'pay': 'Premium-Kaffee', 'cheap': 'Billig-Kaffee (Moral-)' } 
    },
    'cost_new_24': { 
        title: 'Entsorgung', 
        text: 'Das SFX-Department hat Sondermüll produziert, der fachgerecht entsorgt werden muss. Wir können eine Spezialfirma beauftragen.', 
        actions: { 'pay_forced': 'Fachgerecht entsorgen' } 
    },
    'cost_new_25': { 
        title: 'Bestechung?', 
        text: 'Ein lokaler Beamter deutet an, dass er bei einer fehlenden Genehmigung ein Auge zudrücken könnte, wenn wir ihm "helfen". Wir können zahlen (schnell) oder den offiziellen Weg gehen (langsam).', 
        actions: { 'pay': 'Schmieren', 'cheap': 'Ehrlich bleiben (Zeit-)' } 
    },

    effects: {
        quality: 'Qualität',
        hype: 'Hype',
        reputation: 'Ruf',
        duration: 'Dauer',
        cost: 'Kosten',
        days: 'Tage'
    }
};
