


export const office = {
  office: {
    screen: {
      title: 'Office',
      backToMain: 'Zurück',
      nav: {
        messages: 'Nachrichten',
        messagesDesc: 'E-Mails, Events & Angebote.',
        contacts: 'Kontakte',
        contactsDesc: 'Schauspieler & Regisseure.',
        casting: 'Casting',
        castingDesc: 'Rollen besetzen & Talente suchen.',
        employees: 'Mitarbeiter',
        employeesDesc: 'Team verwalten & einstellen.',
        charts: 'Charts',
        chartsDesc: 'Marktanteile & Konkurrenz.',
        calendar: 'Kalender',
        calendarDesc: 'Termine & Deadlines.'
      }
    },
    contacts: {
      actors: 'Schauspieler',
      directors: 'Regisseure',
      showAll: 'Alle anzeigen',
      showFavorites: 'Favoriten',
      sortBy: 'Sortieren:',
      sortSkill: 'Talent',
      sortAge: 'Alter',
      sortLoyalty: 'Loyalität',
      noActors: 'Keine Talente gefunden.'
    },
    employees: {
      myEmployees: 'Meine Mitarbeiter',
      market: 'Arbeitsmarkt',
      filterType: 'Abteilung:',
      allTypes: 'Alle Abteilungen',
      employeeTypes: {
        autor: 'Drehbuchautor',
        castingMitarbeiter: 'Casting-Agent',
        forscher: 'Forscher',
        marketingmanager: 'Marketing-Manager',
        projektPlaner: 'Projektplaner'
      },
      noHired: 'Sie haben keine Mitarbeiter eingestellt.',
      noMarket: 'Der Arbeitsmarkt ist leer.',
      busyTraining: 'In Weiterbildung',
      busyWriting: 'Schreibt Drehbuch',
      busyPlanning: 'Plant Projekt',
      busyCasting: 'Führt Casting durch',
      busyResearch: 'Forscht',
      fireBlockedText: 'Achtung: Dies beendet das Arbeitsverhältnis sofort.'
    },
    casting: {
      title: 'Casting-Abteilung',
      cancelJob: 'Abbrechen',
      assignJob: 'Zuweisen',
      noStaffHint: 'Stellen Sie Casting-Mitarbeiter ein, um Aufgaben zu verteilen.',
      noAssignment: 'Keine Aufgabe',
      modal: {
        talent: 'Talent',
        satisfaction: 'Zufriedenheit',
        salary: 'Gehalt',
        close: 'Schließen',
        title: 'Aufgabe wählen',
        specificCasting: 'Gezieltes Casting',
        specificCastingDesc: 'Ein bestimmtes Talent für eine Rolle verbessern.',
        generalCasting: 'Allgemeines Casting',
        generalCastingDesc: 'Automatisch verfügbare Talente verbessern.',
        startCampaign: 'Scouting-Kampagne',
        startCampaignDesc: 'Neue Talente entdecken.'
      },
      cancel: {
        confirmTitle: 'Aufgabe abbrechen?',
        confirmText: 'Möchten Sie die aktuelle Aufgabe dieses Mitarbeiters wirklich abbrechen?'
      },
      general: {
        confirmTitle: 'Allgemeines Casting starten?',
        confirmText: '{name} wird automatisch verfügbare Talente casten, um deren Bekanntheit zu steigern.'
      },
      campaign: {
        title: 'Scouting-Kampagne',
        scope: 'Umfang',
        scopes: {
          personal: 'Persönlich',
          small: 'Klein',
          medium: 'Mittel',
          large: 'Groß'
        },
        targetSkill: 'Ziel-Talent',
        skillLevels: {
          1: 'Anfänger (0-1 Sterne)',
          2: 'Fortgeschritten (2-3 Sterne)',
          3: 'Profi (4-5 Sterne)',
          4: 'Experte (6-7 Sterne)',
          5: 'Weltklasse (8-10 Sterne)'
        },
        targetAge: 'Altersgruppe',
        ageGroups: {
          child: 'Kind (6-15)',
          young: 'Jung (16-34)',
          middleAged: 'Mittelalt (35-59)',
          old: 'Alt (60+)'
        },
        details: {
          cost: 'Kosten',
          duration: 'Dauer',
          talents: 'Talente'
        },
        start: 'Kampagne starten',
        alreadyActive: 'Es läuft bereits eine Kampagne.'
      },
      setup: {
        title: 'Casting einrichten',
        role: 'Rolle',
        roleActor: 'Schauspieler',
        roleDirector: 'Regisseur',
        roleBoth: 'Beides',
        filter: 'Filter',
        all: 'Alle',
        favorites: 'Favoriten',
        selectTalent: 'Talent wählen',
        noTalent: 'Kein Talent verfügbar',
        typeLevel: 'Stufe steigern',
        typePermanent: 'Dauerhaft',
        cost: 'Kosten:',
        free: 'Kostenlos',
        duration: 'Dauer:',
        start: 'Starten',
        alreadyActive: 'Mitarbeiter ist bereits beschäftigt.'
      }
    },
    news: {
      title: 'Neuigkeiten',
      noEvents: 'Keine Ereignisse verzeichnet.'
    },
    calendar: {
        // Calendar content mostly generated dynamically via header.events
    },
    messages: {
      inbox: 'Posteingang',
      archive: 'Archiv',
      from: 'Von:',
      selectMessage: 'Wählen Sie eine Nachricht.',
      noMessages: 'Keine Nachrichten.',
      archiveMessage: 'Archivieren',
      deleteMessage: 'Löschen',
      rejectOffer: 'Ablehnen',
      negotiate: 'Verhandeln',
      archiveConfirmTitle: 'Archivieren?',
      archiveConfirmText: 'Nachricht "{subject}" archivieren?',
      archiveConfirmButton: 'Archivieren',
      rejectConfirmTitle: 'Ablehnen?',
      rejectConfirmText: 'Angebot wirklich ablehnen?',
      rejectConfirmButton: 'Ablehnen',
      deleteConfirmTitle: 'Löschen?',
      deleteConfirmText: 'Nachricht "{subject}" löschen?',
      cannotDeleteTitle: 'Nicht möglich',
      cannotDeleteText: 'Diese Nachricht kann aktuell nicht gelöscht werden.',
      goToSet: 'Zum Set',
      makeDecision: 'Entscheidung treffen',
      decisionMade: 'Entscheidung getroffen.',
      setDecisionRequired: 'Aktion am Set erforderlich',
      productionReport: 'Nachricht vom Set',
      studioEventEffectsHeader: 'Auswirkungen:',
      studioEventCapital: 'Kapital',
      studioEventReputation: 'Ruf',
      studioEventResearch: 'Forschung',
      productionEventBody: 'Ereignis bei "{filmTitle}".',
      castingCampaignSubject: 'Kampagne beendet',
      castingCampaignBody: '{count} Talente gefunden:\n{list}',
      castingSpecificSubject: 'Casting-Erfolg: {talentName}',
      castingSpecificBody: 'Das gezielte Casting für {talentName} war erfolgreich. Die Bekanntheit wurde gesteigert und das Talent steht für neue Projekte zur Verfügung.',
      castingGeneralSubject: 'Bericht: Allgemeines Casting',
      castingGeneralBody: 'Unser Team hat das Profil von {talentName} erfolgreich bearbeitet und die Bekanntheit in der Branche gesteigert. Das Casting wird mit dem nächsten freien Talent fortgesetzt.',
      castingGeneralStepSubject: 'Fortschritt: Allgemeines Casting',
      castingGeneralStepBody: 'Die Bekanntheit von {talentName} wurde erfolgreich gesteigert. Der Mitarbeiter setzt die Arbeit mit diesem Talent fort, um das Maximum an Bekanntheit zu erreichen.',
      castingGeneralCompleteSubject: 'Abschlussbericht: Casting-Mission',
      castingGeneralCompleteBody: 'Gute Nachrichten! Alle uns bekannten Talente haben die maximale Bekanntheitsstufe erreicht oder wurden erfolgreich bearbeitet. Die Mission des Casting-Mitarbeiters ist hibermit beendet.',
      researchFinishedSubject: 'Forschung: {techName}',
      researchFinishedBody: '{techName} erforscht von {researcherName}.',
      constructionFinishedSubject: 'Bau: {building}',
      constructionFinishedBody: '{building} (Stufe {level}) fertiggestellt.',
      trainingFinishedSubject: 'Weiterbildung: {name}',
      // NEW ARRAY FOR TRAINING MESSAGES
      trainingFinishedBodies: [
        "Sehr geehrte Studioleitung,\n\nwir freuen uns, Ihnen mitteilen zu können, dass {name} den intensiven Weiterbildungslehrgang für {role} erfolgreich abgeschlossen hat. Die investierte Zeit hat sich sichtlich ausgezahlt: Durch das neue Fachwissen konnte das Talent um beachtliche {yellow:{gain}} Punkte gesteigert werden. {name} ist nun hochmotiviert und brennt darauf, die neuen Fähigkeiten in das nächste große Projekt einzubringen. Wir sind überzeugt, dass diese Steigerung die Qualität unserer zukünftigen Produktionen spürbar beeinflussen wird. Der aktuelle Talentwert liegt nun bei {yellow:{total}}.\n\nMit freundlichen Grüßen,\nPersonalentwicklung",
        "Hallo,\n\ngute Neuigkeiten aus der Schulungsabteilung: {name} ist zurück! Die Fortbildung im Bereich {role} war ein voller Erfolg. Das Talent konnte sich um {yellow:{gain}} Punkte verbessern und erreicht damit einen neuen Bestwert von {yellow:{total}}. Während der Zeit am Institut hat {name} nicht nur theoretisches Wissen vertieft, sondern auch neue praktische Kniffe gelernt, die uns am Set oder im Büro enorm weiterhelfen werden. Wir haben das Profil in unserer Datenbank bereits aktualisiert. Willkommen zurück im Team!\n\nBeste Grüße,\nPersonalabteilung",
        "Werte Geschäftsführung,\n\nhiermit bestätigen wir den erfolgreichen Abschluss der Maßnahme für {name}. Der Lehrgang für {role} wurde mit Bravour absolviert. Wir verzeichnen einen Zuwachs von {yellow:{gain}} Talentpunkten, was den neuen Gesamtwert auf {yellow:{total}} hebt. Es ist schön zu sehen, mit wie viel Eifer unsere Mitarbeiter an ihrer professionellen Entwicklung arbeiten. Solche Investitionen sichern langfristig den Erfolg unseres Studios am umkämpften Markt. {name} steht ab sofort wieder voll für Aufgaben zur Verfügung.\n\nHerzliche Grüße,\nHausverwaltung",
        "Guten Tag,\n\nder Abschlussbericht für die Weiterbildung von {name} liegt nun vor. Das Training in der Kategorie {role} war äußerst effektiv. Wir konnten eine Steigerung des Talents um {yellow:{gain}} Punkte feststellen, was zu einem neuen Wert von {yellow:{total}}. {name} hat während der Kurse besonders durch kreative Lösungsansätze überzeugt und ist bereit, mehr Verantwortung im Studio zu übernehmen. Wir empfehlen, dieses neue Potenzial zeitnah in einem anspruchsvollen Projekt zu nutzen. Ein hervorragendes Ergebnis für unser Fortbildungsbudget.\n\nMit freundlichen Grüßen,\nFortbildungsmanagement",
        "Sehr geehrte Damen und Herren,\n\nwir können heute den erfolgreichen Abschluss der Fortbildung von {name} vermelden. Die intensive Auseinandersetzung mit den Inhalten von {role} hat gefruchtet. Mit einem Plus von {yellow:{gain}} Punkten steht das Talent nun bei starken {yellow:{total}}. Diese Entwicklung bestätigt unsere Strategie, gezielt in die Fähigkeiten unserer Schlüsselkräfte zu investieren. {name} fühlt sich durch die Wertschätzung des Studios bestärkt und ist voller Tatendrang für kommende Aufgaben. Wir freuen uns auf die zukünftige Zusammenarbeit.\n\nBeste Grüße,\nPersonalabteilung"
      ],
      bankruptcyWarningSubject: 'WARNUNG: Bankrott droht',
      bankruptcyWarningBody: 'Ihr Konto ist im Minus. Bitte gleichen Sie es bis zum {date} aus.',
      campaignFinishedSubject: 'Kampagne: {campaignName}',
      campaignFinishedBody: [
        "Unsere Marketingoffensive '{campaignName}' für das Projekt '{filmTitle}' ist nun planmäßig abgeschlossen. Wir konnten eine enorme Resonanz in den Medien und bei den Fans feststellen. Durch die gezielten Maßnahmen hat der Film einen signifikanten Hype-Zuwachs von {yellow:{hypeGain}} Punkten erfahren. Das Team ist mit diesem Ergebnis mehr als zufrieden. Wir sind bestens für den weiteren Verlauf der Produktion aufgestellt.",
        "Gute Nachrichten von der Vermarktungsfront: Die Kampagne '{campaignName}' wurde erfolgreich beendet. Für '{filmTitle}' konnten wir das öffentliche Interesse massiv steigern, was sich in allen Metriken widerspiegelt. Das Projekt hat durch unsere Bemühungen zusätzliche {yellow:{hypeGain}} Hype-Punkte generiert. Die Fachpresse zeigt sich bereits jetzt äußerst neugierig auf das Endergebnis. Ein hervorragendes Ergebnis für unser aktuelles Budget.",
        "Mit dem Abschluss der Kampagne '{campaignName}' haben wir einen wichtigen Meilenstein für '{filmTitle}' erreicht. Die strategische Ausrichtung hat sich als absolut richtig erwiesen und die gewünschte Aufmerksamkeit erzeugt. Wir verzeichnen einen Zuwachs von {yellow:{hypeGain}} Hype-Punkten, was unsere Erwartungen leicht übertrifft. Die Vorfreude beim Publikum wächst spürbar mit jedem Tag. Wir beobachten die Marktreaktionen weiterhin sehr genau.",
        "Die Auswertung der Werbemaßnahmen für '{filmTitle}' liegt nun vor, nachdem '{campaignName}' beendet wurde. Unsere Analysten bestätigen einen durchschlagenden Erfolg bei der anvisierten Zielgruppe. Der Hype-Index ist um beachtliche {yellow:{hypeGain}} Punkte gestiegen, was uns eine starke Ausgangslage verschafft. Das Feedback aus den sozialen Kanalen ist überwiegend positiv und voller Vorfreude. Wir blicken nun gespannt auf die kommenden Produktionsphasen.",
        "Wir freuen uns, den erfolgreichen Abschluss der Kampagne '{campaignName}' für unseren Film '{filmTitle}' vermelden zu können. Die koordinierte Aktion hat für ordentlich Gesprächsstoff in der Branche gesorgt. Insgesamt konnte die Produktion dadurch ein Plus von {yellow:{hypeGain}} Hype-Punkten verbuchen. Damit liegen wir voll im Soll unserer Marketingstrategie für dieses Jahr. Die Grundlagen für einen erfolgreichen Release sind damit gelegt."
      ],
      scriptFinishedSubject: 'Drehbuch: {title}',
      scriptFinishedBody: 'Drehbuch "{title}" fertig (Qualität: {quality}). Autor: {writer}.',
      system: 'System',
      distributor: 'Verleih',
      productionInfo: 'Produktions-Info',
      marketingDepartment: 'Marketing-Abteilung',
      scriptDepartment: 'Drehbuch-Abteilung',
      researchDepartment: 'Forschungs-Abteilung',
      buildingManagement: 'Hausverwaltung',
      hrDepartment: 'Personalabteilung',
      ceoWelcomeSubject: 'Herzlich Willkommen bei {studioName}!',
      ceoWelcomeBody: '{salutation},\n\nwir freuen uns sehr, Sie als neuen CEO von {studioName} begrüßen zu dürfen.\n\nDer Aufsichtsrat hat Ihnen ein monatliches Gehalt von {salary} bewilligt, das jeweils zum Monatsende ausgezahlt wird.\n\nWir haben großes Vertrauen in Ihre Vision und freuen uns auf eine erfolgreiche Zusammenarbeit.\n\nMit freundlichen Grüßen,\nDer Aufsichtsrat',
      
      cinemaReleaseBody: [
        "Sehr geehrte Damen und Herren,\n\nder große Moment ist endlich gekommen: Heute fällt der Startschuss für die Kino-Premiere von '{title}'! Unser gesamtes Team bei {distributor} hat in den letzten Wochen unermüdlich an der Marketingkampagne gearbeitet, um diesen Start so glanzvoll wie möglich zu gestalten. Die Resonanz der Presse ist überwältigend und die Vorverkäufe deuten auf volle Kinosäle hin. Wir sind überzeugt, dass wir mit dieser Produktion einen echten Publikumsliebling auf die Leinwand bringen. In hunderten Kinosälen gehen heute die Lichter aus und Ihr Werk beginnt seine Reise vor großem Publikum. Wir halten Sie über die ersten Einspielergebnisse natürlich auf dem Laufenden.\n\nMit freundlichen Grüßen,\nIhr Team von {distributor}",
        "Hallo zusammen,\n\nes ist soweit! Mit großer Freude verkünden wir den heutigen Kinostart von '{title}'. Die gestrige Vorpremiere war ein voller Erfolg und hat bereits für ordentlich Wirbel in der Fachpresse gesorgt. Wir haben die Anzahl der Kopien aufgrund der hohen Nachfrage in letzter Sekunde sogar noch einmal erhöht. Es ist ein Privileg, diesen außergewöhnlichen Film landesweit in die Lichtspielhäuser bringen zu dürfen. Wir blicken voller Optimismus auf das kommende Eröffnungswochenende. Genießen Sie diesen bedeutsamen Meilenstein für Ihr Studio!\n\nHerzliche Grüße,\n{distributor}",
        "Werte Partner,\n\nheute ist ein bedeutender Tag für unsere Zusammenarbeit, denn '{title}' feiert seine offizielle Kinopremiere. Die strategische Platzierung in der aktuellen Spielwoche verspricht eine enorme Sichtbarkeit. Unsere Marktanalysen prognostizieren eine herausragende Performance bei der anvisierten Zielgruppe. Wir haben keine Kosten und Mühen gescheut, um den Film landesweit prominent auf den Plakatwänden zu bewerben. Das Publikum freut sich sichtlich auf frischen Stoff dieser Qualität. Wir freuen uns darauf, Ihnen bald die ersten Besucherzahlen präsentieren zu können.\n\nAuf eine erfolgreiche Spielzeit,\n{distributor}",
        "Sehr geehrte Studioleitung,\n\nwir freuen uns, Ihnen mitteilen zu können, dass '{title}' ab heute offiziell in den Kinos anläuft. Nach intensiver Vorbereitung ist das Projekt nun dort, wo Filme ihre größte Wirkung entfalten: auf der riesigen Leinwand. Die ersten Kritiken loben bereits die visuelle Kraft und die darstellerische Dichte Ihrer Produktion. Wir beobachten die Stimmung in den Foyers sehr genau und erhalten bisher ausschließlich begeisterte Rückmeldungen. Dies ist der Beginn einer hoffentlich langen und erfolgreichen Zeit in den Kinosälen. Wir sind stolz, Ihr Partner bei diesem Release zu sein.\n\nMit besten Empfehlungen,\n{distributor}",
        "Guten Tag,\n\nheute ist der Tag der Entscheidung! '{title}' startet in den Kinos und wir sind bereit, das Publikum zu begeistern. Die Werbetrommel wurde in den letzten Tagen kräftig gerührt und die Sichtbarkeit des Films ist auf einem Rekordniveau. Von den großen Metropolen bis in die kleineren Städte ist das Interesse der Kinofans deutlich spürbar. Wir sind sehr gespannt, wie die Zuschauer auf die mutige Inszenierung dieses Werks reagieren werden. Für uns steht fest: Dieser Film hat das Potenzial, nachhaltig Eindruck zu hinterlassen. Wir wünschen uns allen volle Säle und begeisterte Gesichter!\n\nBeste Grüße,\n{distributor}"
      ],
      homeReleaseBody: [
        "Sehr geehrte Damen und Herren,\n\ndas Heimkino-Erlebnis für '{title}' beginnt heute mit dem offiziellen Start der digitalen und physischen Auswertung. Der Film ist ab sofort sowohl in den großen Mediatheken als auch im Fachhandel verfügbar. Wir haben eine exklusive Kampagne für Filmliebhaber gestartet, um den Verkauf der Sondereditionen gezielt anzukurbeln. Die Nachfrage auf den Verkaufsplattformen ist bereits in der ersten Stunde nach Freischaltung bemerkenswert hoch. Nun kann Ihr Werk endlich jederzeit und überall genossen werden, was die Popularität des Titels sicher weiter steigern wird. Wir erwarten eine sehr stabile Performance in diesem Marktsegment.\n\nMit freundlichen Grüßen,\nIhr Team von {distributor}",
        "Hallo,\n\nwir bringen '{title}' heute direkt in die Wohnzimmer der Zuschauer! Die Veröffentlichung für das Heimkino ist offiziell gestartet und wir sind live. Wir haben den Film prominent auf den Startseiten der wichtigsten Streaming-Portale platziert, um maximale Aufmerksamkeit zu generieren. Das Bonusmaterial, das wir gemeinsam erstellt haben, wird von den ersten Käufern bereits in höchsten Tönen gelobt. Dies ist eine hervorragende Gelegenheit, die Sichtbarkeit des Films dauerhaft zu festigen. Die digitale Distribution läuft weltweit reibungslos an. Viel Erfolg für diesen wichtigen Schritt!\n\nBeste Grüße,\n{distributor}",
        "Werte Geschäftspartner,\n\nmit Stolz verkünden wir den heutigen Verkaufsstart von '{title}' im Home-Entertainment-Bereich. Wir haben eine umfangreiche Social-Media-Kampagne ausgerollt, die gezielt Heimkino-Enthusiasten und Sammler anspricht. Die Bild- und Tonqualität der digitalen Master wird in ersten Tests als referenzwürdig eingestuft, was für uns ein wichtiges Verkaufsargument ist. Wir sind zuversichtlich, dass der Film in den relevanten Charts schnell eine Spitzenposition einnehmen wird. Es ist schön zu sehen, wie die Geschichte von '{title}' nun in privater Atmosphäre ihre Fortsetzung findet. Wir halten Sie über die Verkaufszahlen auf dem Laufenden.\n\nHerzlichst,\n{distributor}",
        "Sehr geehrte Studioleitung,\n\n'{title}' ist ab heute im Handel und online für das Publikum freigegeben. Dieser Release markiert einen entscheidenden finanziellen Meilenstein für die langfristige Profitabilität des Projekts. Wir haben Partnerschaften mit großen Ketten geschlossen, um die Präsenz in den Regalen zu maximieren. Parallel dazu läuft die digitale Vermarktung auf allen Kanälen auf Hochtouren. Die Fans haben diesen Moment der Verfügbarkeit sehnsüchtig erwartet, was die zahlreichen Vorbestellungen eindrucksvoll belegen. Wir freuen uns auf ein starkes Ergebnis in den kommenden Wochen.\n\nMit freundlichen Grüßen,\n{distributor}",
        "Guten Tag,\n\nheute öffnen wir die Pforten zum Heimkino-Markt für '{title}'. Die Resonanz auf die offizielle Ankündigung war bereits gewaltig und die Erwartungen sind hoch. Wir setzen auf eine hybride Strategie aus Kauf- und Leihoptionen, um die größtmögliche Reichweite in den Wohnzimmern zu erzielen. Ihr Film hat das Potenzial, ein echter Dauerbrenner in den digitalen Bibliotheken zu werden. Die Werbeanzeigen in den einschlägigen Fachmedien sind bereits geschaltet und zeigen Wirkung. Lassen Sie uns die Daumen drücken, dass '{title}' nun in ganz neuer Umgebung für Begeisterung sorgt!\n\nViele Grüße,\n{distributor}"
      ],
      payTvReleaseBody: [
        "Sehr geehrte Damen und Herren,\n\nheute feiern wir die exklusive Pay-TV-Premiere von '{title}' auf unseren Premium-Kanälen. Der Film wird heute Abend zur besten Sendezeit ausgestrahlt und durch eine massive On-Air-Promotion begleitet. Wir haben '{title}' als das filmische Highlight des Monats positioniert, um unsere anspruchsvollen Abonnenten zu begeistern. Solche exklusiven Ausstrahlungen ohne Werbeunterbrechung unterstreichen die hohe Qualität Ihrer Produktion. Das Feedback der Programmredaktion war durchweg positiv und wir erwarten eine hohe Einschaltquote innerhalb unseres zahlenden Kundenstamms. Ein glanzvoller Start in dieses exklusive Fenster!\n\nMit freundlichen Grüßen,\nIhr Team von {distributor}",
        "Hallo zusammen,\n\nes ist Zeit für erstklassiges Fernsehen: '{title}' startet heute im Pay-TV-Programm! Wir haben den Film als 'Movie of the Week' großflächig angekündigt und beworben. Die Exklusivität dieses Fensters sorgt für eine besondere Wertschätzung des Titels bei den Zuschauern, die Wert auf erstklassige Unterhaltung legen. Wir sind gespannt, wie sich die Abrufzahlen auf unseren On-Demand-Plattformen parallel zur Ausstrahlung entwickeln werden. Die ersten Teaser im laufenden Programm haben bereits für viel Aufmerksamkeit gesorgt. Dies ist ein wichtiger Schritt, um die Marke '{title}' weiter im Bewusstsein zu verankern. Wir freuen uns auf eine erfolgreiche Premiere.\n\nBeste Grüße,\n{distributor}",
        "Werte Partner,\n\nwir freuen uns sehr, '{title}' ab heute in unserem exklusiven Programm zeigen zu können. Der Film passt perfekt in unser Portfolio für Cineasten und wird sicherlich für Gesprächsstoff unter unseren Zuschauern sorgen. Wir haben im Vorfeld gezielte Interviews mit dem Cast im Rahmen unserer Magazinsendungen ausgestrahlt, um die Neugier zu wecken. Diese zusätzliche Sichtbarkeit in einem werbefreien Umfeld wird sich positiv auf das Ansehen des Films auswirken. Wir schätzen die künstlerische Arbeit hinter diesem Projekt sehr und sind stolz, diesen Titel präsentieren zu dürfen. Auf eine gute Performance im Premium-TV!\n\nMit besten Grüßen,\n{distributor}",
        "Sehr geehrte Studioleitung,\n\nheute Abend um 20:15 Uhr ist es soweit: Die Pay-TV-Premiere von '{title}' findet statt. Wir haben den Film in eine attraktive Event-Programmierung eingebettet, um die Reichweite innerhalb der Zielgruppe zu maximieren. Die Werbetrommel in unseren eigenen Medien wurde in den letzten Tagen noch einmal kräftig gerührt. Wir sehen in '{title}' ein großes Potenzial, in diesem Umfeld nachhaltig Eindruck bei den Kritikern und Zuschauern zu machen. Die Verträge mit den Kabelnetzbetreibern garantieren eine flächendeckende Verfügbarkeit für alle unsere Kunden. Wir halten Sie über die Reichweiten informiert.\n\nMit freundlichen Grüßen,\n{distributor}",
        "Guten Tag,\n\nmit der heutigen Premiere tritt '{title}' in eine neue, exklusive Phase der Präsentation ein. Wir haben den Film als Top-Empfehlung in unserem aktuellen Programmguide markiert. Das hochwertige und professionelle Umfeld unserer Sendergruppe unterstreicht den besonderen Charakter Ihrer Produktion. Viele Abonnenten haben auf die Möglichkeit gewartet, diesen Film in brillanter Qualität und ohne Unterbrechungen genießen zu können. Wir blicken voller Erwartung auf die kommenden Ausstrahlungstermine und die Resonanz. Es ist uns eine Freude, diesen Film als exklusives Highlight präsentieren zu dürfen.\n\nHerzliche Grüße,\n{distributor}"
      ],
      freeTvReleaseBody: [
        "Sehr geehrte Damen und Herren,\n\nheute ist ein großer Tag für die breite Öffentlichkeit, denn '{title}' feiert seine Free-TV-Premiere! Wir haben den Film für den Hauptabend zur besten Sendezeit programmiert, um ein Millionenpublikum zu erreichen. Die Werbeplätze in den Pausen waren aufgrund des großen Interesses an dieser Ausstrahlung in kürzester Zeit ausverkauft. Dies ist ein gewaltiger Moment für die Sichtbarkeit Ihrer Produktion im ganzen Land. Mit dieser Ausstrahlung erreicht Ihr Film eine Reichweite, die neue Maßstäbe für Ihr Studio setzen könnte. Wir sind überzeugt, dass wir heute Abend einen Sieg bei den Marktanteilen einfahren werden. Vielen Dank für die Zusammenarbeit bei diesem Projekt!\n\nMit freundlichen Grüßen,\nIhr Team von {distributor}",
        "Hallo,\n\nbereiten Sie sich auf einen Quoten-Hit vor: '{title}' läuft heute zum ersten Mal im freien Fernsehen! Wir haben den ganzen Tag über Teaser geschaltet, um die Spannung bei den Zuschauern kontinuierlich zu erhöhen. Der Film hat in allen Vorab-Markttests hervorragende Werte erzielt und verspricht beste Unterhaltung für alle. Es ist faszinierend zu sehen, wie ein Projekt nun diese enorme mediale Präsenz im gesamten Bundesgebiet erzielt. Wir erwarten eine lebhafte Diskussion in den sozialen Medien während der gesamten Sendezeit. Dies ist ein Meilenstein für die Bekanntheit Ihres Studios. Wir wünschen uns allen eine rekordverdächtige Quote!\n\nBeste Grüße,\n{distributor}",
        "Werte Geschäftspartner,\n\nheute bringen wir '{title}' in jedes Wohnzimmer des Landes. Die Free-TV-Auswertung startet heute Abend mit einer großen Event-Programmierung, die wir seit Wochen vorbereiten. Wir haben keine Kosten gescheut, um den Film als das TV-Ereignis des Wochenendes zu inszenieren. Die Resonanz der Programmzeitschriften ist durchweg positiv und die Redakteure sind voll des Lobes. Dies ist eine wunderbare Gelegenheit, die Popularität der Marke '{title}' noch einmal massiv zu steigern. Wir freuen uns, diesen Weg mit Ihnen gemeinsam zu gehen und morgen die ersten Quoten zu präsentieren.\n\nHerzlichst,\n{distributor}",
        "Sehr geehrte Studioleitung,\n\nder Tag der Free-TV-Premiere von '{title}' ist endlich gekommen. Wir haben den Film strategisch günstig platziert, um von einem starken Vorprogramm zu profitieren und die Zuschauer zu binden. Unser Marketing hat in den letzten 48 Stunden eine intensive Offensive gestartet, um sicherzustellen, dass kein Haushalt diesen Termin verpasst. Es ist beeindruckend zu sehen, wie zeitlos und ansprechend Ihr Film auf die breite Masse der Fernsehzuschauer wirkt. Wir sind sehr zuversichtlich, dass wir heute Abend die Marktführerschaft in der werberelevanten Zielgruppe übernehmen werden. Auf ein fantastisches Ergebnis!\n\nMit freundlichen Grüßen,\n{distributor}",
        "Guten Tag,\n\nheute Abend heißt es: Bühne frei für '{title}' im Free-TV! Wir freuen uns riesig, dieses Werk endlich einem so breiten und vielfältigen Publikum präsentieren zu können. Die Vorfreude bei den Zuschauern ist riesig, wie wir aus den Reaktionen in unseren Online-Foren entnehmen konnten. Wir haben den Film zur Primetime angesetzt und erwarten ein emotionales TV-Erlebnis für die gesamte Familie. Dies ist ein würdevoller Startpunkt für die mediale Präsenz dieses Projekts im freien Fernsehen. Wir danken Ihnen für das Vertrauen in unseren Sender und die gute Kooperation.\n\nViele Grüße,\n{distributor}"
      ],
      
      ceoReviewSubjectLevel0: 'Jahresbericht {year}: Krisensitzung erforderlich',
      ceoReviewBodyLevel0: '{salutation},\n\ndas abgelaufene Geschäftsjahr {year} war, offen gesagt, eine Katastrophe. Ein Verlust von {profit} bedroht die Existenz unseres Studios massiv.\n\nDer Aufsichtsrat erwartet umgehende Maßnahmen zur Konsolidierung. Trotz des Ergebnisses bleibt Ihr Gehalt bei {newSalary} stabil, da wir an einen Turnaround glauben. Ein Bonus entfällt dieses Jahr.\n\nWir erwarten im nächsten Jahr schwarze Zahlen.\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel1: 'Jahresbericht {year}: Enttäuschendes Ergebnis',
      ceoReviewBodyLevel1: '{salutation},\n\nwir haben die Zahlen für {year} geprüft. Ein Verlust von {profit} entspricht nicht unseren Erwartungen und Zielen.\n\nWir müssen Sie bitten, Ihre Strategie zu überdenken. Ihr Gehalt bleibt bei {newSalary} unverändert. Boni wurden für dieses Jahr gestrichen.\n\nWir hoffen auf Besserung.\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel2: 'Jahresbericht {year}: Knappes Ergebnis',
      ceoReviewBodyLevel2: '{salutation},\n\ndas Jahr {year} schließen wir mit einem Verlust von {profit} ab. Es war ein schwieriges Jahr, aber wir sehen Potenzial in Ihren Projekten.\n\nAls Zeichen des Vertrauens passen wir Ihr Gehalt leicht auf {newSalary} an. Lassen Sie uns im nächsten Jahr gemeinsam den Gewinn anpeilen.\n\nMit freundlichen Grüßen,\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel3: 'Jahresbericht {year}: Solider Start',
      ceoReviewBodyLevel3: '{salutation},\n\nwir gratulieren zu einem positiven Jahresabschluss {year}. Ein Gewinn von {profit} ist ein guter Anfang.\n\nDer Aufsichtsrat hat einen Bonus von {bonus} ({bonusPercent}%) genehmigt. Ihr Gehalt steigt auf {newSalary}.\n\nWeiter so!\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel4: 'Jahresbericht {year}: Zufriedenstellend',
      ceoReviewBodyLevel4: '{salutation},\n\ndas Geschäftsjahr {year} war erfolgreich. Wir verzeichnen einen Gewinn von {profit}. Das Studio entwickelt sich gut.\n\nWir freuen uns, Ihnen einen Bonus von {bonus} ({bonusPercent}%) auszuzahlen. Ihr neues Gehalt beträgt {newSalary}.\n\nWir blicken optimistisch in die Zukunft.\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel5: 'Jahresbericht {year}: Guter Erfolg',
      ceoReviewBodyLevel5: '{salutation},\n\nSie haben das Studio im Jahr {year} mit sicherer Hand geführt. Ein Gewinn von {profit} ist ein sehr respektables Ergebnis.\n\nAls Anerkennung erhalten Sie einen Bonus von {bonus} ({bonusPercent}%) und eine Gehaltserhöhung auf {newSalary}.\n\nVielen Dank für Ihre Arbeit.\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel6: 'Jahresbericht {year}: Hervorragend',
      ceoReviewBodyLevel6: '{salutation},\n\ndas Jahr {year} war für uns alle ein Grund zur Freude. Mit einem Gewinn von {profit} haben wir unsere Ziele deutlich übertroffen.\n\nDer Aufsichtsrat hat einstimmig einen Bonus von {bonus} ({bonusPercent}%) beschlossen. Ihr Gehalt wird auf {newSalary} angehoben.\n\nWir sind stolz auf diese Entwicklung.\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel7: 'Jahresbericht {year}: Exzellente Leistung',
      ceoReviewBodyLevel7: '{salutation},\n\nunter Ihrer Führung hat das Studio im Jahr {year} beeindruckende Zahlen vorgelegt. Ein Gewinn von {profit} spricht für sich.\n\nSie haben sich einen Bonus von {bonus} ({bonusPercent}%) verdient. Ihr Gehalt steigt deutlich auf {newSalary}.\n\nMachen Sie weiter so!\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel8: 'Jahresbericht {year}: Überragend',
      ceoReviewBodyLevel8: '{salutation},\n\nwir sind begeistert! Das Jahr {year} war eines der besten in der Firmengeschichte. Ein Gewinn von {profit} ist eine herausragende Leistung.\n\nWir schütten gerne einen Bonus von {bonus} ({bonusPercent}%) aus. Ihr Gehalt beträgt nun {newSalary}.\n\nSie sind ein Gewinn für dieses Unternehmen.\n\nDer Aufsichtsrat',
      
      ceoReviewSubjectLevel9: 'Jahresbericht {year}: Legendäres Jahr',
      ceoReviewBodyLevel9: '{salutation},\n\nUNGLAUBLICH! Das Jahr {year} geht in die Geschichte ein. Ein Rekordgewinn von {profit}!\n\nSie haben das Studio in den Olymp geführt. Genießen Sie Ihren Bonus von {bonus} ({bonusPercent}%) und Ihr neues Gehalt von {newSalary}. Es wurde hiermit verdoppelt!\n\nWir verneigen uns vor dieser Leistung.\n\nDer Aufsichtsrat',
      
      anniversarySubject: 'Jubiläum',
      anniversaryBody1: 'Alles Liebe zum Hochzeitstag! Ein weiteres Jahr mit dir ist das größte Geschenk. Danke, dass du immer an meiner Seite bist.',
      anniversaryBody2: 'Herzlichen Glückwunsch zu unserem Tag! Die Zeit vergeht so schnell, wenn man glücklich ist. Ich freue mich auf viele weitere gemeinsame Jahre.',
      anniversaryBody3: 'Für meine bessere Hälfte: Auch wenn das Studio viel Zeit fordert, bist du immer meine Nummer Eins. Alles Gute zum Hochzeitstag!',
      anniversaryBody4: 'Hochzeitstag! Ich habe einen Tisch in unserem Lieblingsrestaurant reserviert. Lass uns heute Abend nur uns beide feiern.',
      anniversaryBody5: 'Schatz... hast du heute gar nicht auf den Kalender geschaut? Es ist unser Hochzeitstag. Ich hatte gehofft, wir würden etwas unternehmen. Ich bin ehrlich gesagt etwas enttäuscht.',
      
      salutationMale: 'Sehr geehrter Herr {lastName}',
      salutationFemale: 'Sehr geehrte Frau {lastName}',
      employeeQuitSubject: 'Kündigung',
      employeeQuitBody: 'Sehr geehrte Geschäftsleitung,\n\nhiermit reiche ich meine fristlose Kündigung ein. Die Arbeitsbedingungen sind für mich nicht mehr tragbar.\n\n{noWorkspaceText}\n\nMit freundlichen Grüßen,\n{name}',
      employeeQuitNoWorkspace: 'Besonders das Fehlen eines professionellen Arbeitsplatzes ({requiredBuildingType}) macht ein effektives Arbeiten unmöglich.',
      employeeComplaintSubject: 'Unzufriedenheit',
      employeeComplaintReasonDefault: 'Ich fühle mich in meiner Arbeit nicht wertgeschätzt.',
      employeeComplaintReasonNoWorkspace: 'Mir fehlt ein adäquater Arbeitsplatz ({requiredBuildingType}). So kann ich nicht arbeiten!',
      employeeComplaintBody: 'Chef,\n\nich muss Ihnen mitteilen, dass ich mit der aktuellen Situation sehr unzufrieden bin.\n\n{reason}\n\nWenn sich nichts ändert, muss ich meine Zukunft hier überdenken.',
      ceoBoardSender: 'Aufsichtsrat'
    },
    birthdaySubject: 'Herzlichen Glückwunsch zum Geburtstag!',
    birthdayMessages: [
        "Alles Gute zum Geburtstag! Wir wünschen Ihnen für das neue Lebensjahr viel Glück, Gesundheit und weiterhin so viel Erfolg bei Ihren Projekten.",
        "Herzlichen Glückwunsch! Mögen all Ihre privaten und beruflichen Wünsche im kommenden Jahr in Erfüllung gehen. Genießen Sie Ihren Ehrentag!",
        "Zum Geburtstag die besten Wünsche! Wir danken Ihnen für Ihren unermüdlichen Einsatz und freuen uns auf ein weiteres spannendes Jahr mit Ihnen.",
        "Alles Liebe zum Geburtstag! Bleiben Sie gesund und behalten Sie Ihre Visionen bei. Wir hoffen, Sie können heute im Kreis Ihrer Liebsten feiern.",
        "Happy Birthday! Auf dass das neue Lebensjahr genauso blockbuster-verdächtig wird wie Ihre Filme. Lassen Sie sich feiern!"
    ]
  }
};
