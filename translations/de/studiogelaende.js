const studiogelaende = {
  screen: {
    title: "Studiogel\xE4nde",
    build: "Bauen",
    upgrade: "Ausbauen",
    cost: "Kosten:",
    duration: "Dauer:",
    daysRemaining: "{days} Tage verbleibend",
    monthlyCost: "Unterhalt: {cost}/Monat",
    level: "Stufe {level}",
    bonus: "Bonus:",
    underConstruction: "Im Bau...",
    fullyUpgraded: "Maximal ausgebaut",
    selectBuilding: "W\xE4hlen Sie ein Geb\xE4ude",
    selectBuildingHint: "Klicken Sie auf ein Geb\xE4ude in der Liste f\xFCr Details.",
    backToMain: "Zur\xFCck zum Hauptmen\xFC",
    currentBonus: "Aktueller Bonus",
    nextLevel: "N\xE4chste Stufe ({level})",
    departmentSlots: "Abteilungs-Slots",
    slotsUsed: "Belegt",
    upgrading: "Wird ausgebaut",
    tooltip: {
      noCapital: "Nicht gen\xFCgend Kapital.",
      constructionActive: "Alle Bauslots belegt.",
      researchRequired: "Ben\xF6tigt Forschung: {techName}",
      officeUpgrade: "B\xFCrogeb\xE4ude muss ausgebaut werden.",
      dependencyMissing: "Voraussetzung: {requirement}"
    }
  },
  buildings: {
    Burogebaude: {
      name: "B\xFCrogeb\xE4ude",
      description: "Das Verwaltungszentrum. Hier sitzen Ihre Mitarbeiter.",
      levels: {
        level1: { desc: "Kleines B\xFCro (3 Mitarbeiter)", bonus: "Max. 3 Mitarbeiter" },
        level2: { desc: "Mittleres B\xFCro (6 Mitarbeiter)", bonus: "Max. 6 Mitarbeiter" },
        level3: { desc: "Gro\xDFraumb\xFCro (12 Mitarbeiter)", bonus: "Max. 12 Mitarbeiter" },
        level4: { desc: "Firmenzentrale (25 Mitarbeiter)", bonus: "Max. 25 Mitarbeiter" }
      }
    },
    Autorenbuero: {
      name: "Autorenb\xFCro",
      description: "Der kreative Hub f\xFCr Ihre Drehbuchautoren.",
      levels: {
        level1: { desc: "Grundlegende Ausstattung", bonus: "Erm\xF6glicht Drehbuch-Entwicklung" },
        level2: { desc: "Inspirierende Umgebung", bonus: "Schreibgeschwindigkeit +10%" }
      }
    },
    CastingOffice: {
      name: "Casting-B\xFCro",
      description: "Hier werden die Stars von morgen entdeckt.",
      levels: {
        level1: { desc: "Casting-B\xFCro", bonus: "Erm\xF6glicht Casting & Scouting" },
        level2: { desc: "Erweitertes Netzwerk", bonus: "Bessere Casting-Ergebnisse" }
      }
    },
    MarketingDepartment: {
      name: "Marketing-Abteilung",
      description: "Die Schaltzentrale f\xFCr Werbung und PR.",
      levels: {
        level1: { desc: "Marketing-B\xFCro", bonus: "Erm\xF6glicht Kampagnen" },
        level2: { desc: "PR-Agentur", bonus: "Effektivere Kampagnen" }
      }
    },
    ResearchLab: {
      name: "Forschungslabor",
      description: "Hier entsteht die Zukunft des Films.",
      levels: {
        level1: { desc: "Forschungslabor", bonus: "Erm\xF6glicht Forschung" },
        level2: { desc: "High-Tech Labor", bonus: "Forschungspunkte +5/Tag" }
      }
    },
    Planungsbuero: {
      name: "Planungsb\xFCro",
      description: "Optimiert Produktionsabl\xE4ufe.",
      levels: {
        level1: { desc: "Planungsb\xFCro", bonus: "Erm\xF6glicht Projektplanung" },
        level2: { desc: "Projektmanagement-Center", bonus: "Planungsdauer -10%" }
      }
    },
    Studio: {
      name: "Studio-Hallen",
      description: "Der zentrale Ort f\xFCr Ihre Dreharbeiten. Bauen Sie Studios aus, um mehrere oder gr\xF6\xDFere Produktionen gleichzeitig zu erm\xF6glichen.",
      levels: {
        level1: { desc: "Zentrale Verwaltung der Drehhallen", bonus: "Basis-Infrastruktur" },
        level2: { desc: "Erweiterte Logistik f\xFCr gr\xF6\xDFere Sets", bonus: "Erm\xF6glicht Studio 2" },
        level3: { desc: "High-Tech Campus f\xFCr Gro\xDFproduktionen", bonus: "Erm\xF6glicht Studio 3" }
      }
    },
    Studio1: {
      name: "Studio 1",
      description: "Das erste Filmstudio f\xFCr kleinere bis mittlere Produktionen.",
      levels: {
        level1: { desc: "Standard-Ausstattung", bonus: "Erm\xF6glicht Dreharbeiten" },
        level2: { desc: "Modernisierte Technik & Schalld\xE4mmung", bonus: "Verbesserte Qualit\xE4t" },
        level3: { desc: "Volldigitales Smart-Studio", bonus: "Maximale Effizienz" }
      }
    },
    Studio2: {
      name: "Studio 2",
      description: "Ein gr\xF6\xDFeres Studio f\xFCr ambitionierte Projekte.",
      levels: {
        level1: { desc: "Gro\xDFraumhalle", bonus: "H\xF6here Kapazit\xE4t" },
        level2: { desc: "Erweiterung mit Wassertank", bonus: "Spezialeffekte m\xF6glich" },
        level3: { desc: "Monumentale Produktionshalle", bonus: "F\xFCr Mega-Blockbuster" }
      }
    },
    Studio3: {
      name: "Studio 3",
      description: "High-End Studio mit Green-Screen und modernster Technik.",
      levels: {
        level1: { desc: "Green-Screen Basis", bonus: "VFX-Produktion" },
        level2: { desc: "LED-Volume Technologie", bonus: "Reduzierte Post-Produktion" },
        level3: { desc: "Holo-Deck Studio", bonus: "Maximale VFX-Qualit\xE4t" }
      }
    },
    Bauhof: {
      name: "Bauhof",
      description: "Zentrale f\xFCr alle Bauvorhaben. Erm\xF6glicht das parallele Durchf\xFChren von mehreren Bauprojekten.",
      levels: {
        level1: { desc: "Kleiner Bauhof", bonus: "2 Bauauftr\xE4ge gleichzeitig" },
        level2: { desc: "Gro\xDFer Bauhof", bonus: "3 Bauauftr\xE4ge gleichzeitig" }
      }
    },
    Kino: {
      name: "Kino",
      description: "Ein eigenes Kino auf dem Studiogel\xE4nde.",
      levels: {
        level1: { desc: "Kleines Programmkino", bonus: "Kleine monatliche Einnahmen" },
        level2: { desc: "Multiplex-Saal", bonus: "Mittlere Einnahmen" }
      }
    },
    Restaurant: {
      name: "Restaurant",
      description: "Sorgt f\xFCr das leibliche Wohl.",
      levels: {
        level1: { desc: "Cafeteria", bonus: "Moral +1" },
        level2: { desc: "Gourmet-Restaurant", bonus: "Moral +3" }
      }
    },
    Filmmuseum: {
      name: "Filmmuseum",
      description: "Ein Ort der Filmgeschichte.",
      levels: {
        level1: { desc: "Museum", bonus: "Ruf +1 (Chance)" }
      }
    },
    Backlot: {
      name: "Backlot",
      description: "Modulare Au\xDFensets f\xFCr schnellere und st\xE4rkere Au\xDFendrehs.",
      levels: {
        level1: { desc: "Kompakter Au\xDFenset-Park", bonus: "Produktion -5%, Action/Abenteuer/Western +2 Qualit\xE4t" },
        level2: { desc: "Gro\xDFer Set-Park mit Stra\xDFen- und Naturkulissen", bonus: "Produktion -12%, Action/Abenteuer/Western/Sci-Fi +4 Qualit\xE4t" },
        level3: { desc: "Premium-Backlot mit variablen Mega-Sets", bonus: "Produktion -15%, Action/Abenteuer/Western/Sci-Fi/Kriegsfilm +6 Qualit\xE4t" }
      }
    },
    Postproduktionshaus: {
      name: "Postproduktionshaus",
      description: "Schnitt, Grading und Mastering inhouse.",
      levels: {
        level1: { desc: "Kompakte Inhouse-Postproduktion", bonus: "Postproduktion -10%, Endqualit\xE4t +1" },
        level2: { desc: "Professionelles Finish-Center", bonus: "Postproduktion -20%, Endqualit\xE4t +2" },
        level3: { desc: "Premium-Suite f\xFCr internationale Master", bonus: "Postproduktion -30%, Endqualit\xE4t +3" }
      }
    },
    Sicherheitszentrale: {
      name: "Sicherheitszentrale",
      description: "Sch\xFCtzt Studio, Daten und Talente vor Leaks und Sabotage.",
      levels: {
        level1: { desc: "Werkschutz mit Zugangskontrolle", bonus: "35% weniger Sicherheits- und Leak-Events" },
        level2: { desc: "Leitstelle mit Cyber-Security", bonus: "60% weniger Sicherheits- und Leak-Events" }
      }
    },
    KostuemUndMaskenatelier: {
      name: "Kost\xFCm- & Maskenatelier",
      description: "Spezialisiert auf Garderobe, Prothesen und charakterstarke Looks.",
      levels: {
        level1: { desc: "Solides Kost\xFCm- und Maskenteam", bonus: "Fantasy/Horror/Musical +2 Qualit\xE4t" },
        level2: { desc: "Erweitertes Atelier mit Spezialmasken", bonus: "Fantasy/Horror/Musical/Romanze +4 Qualit\xE4t" },
        level3: { desc: "Preisgekr\xF6ntes Atelier f\xFCr Prestigeproduktionen", bonus: "Fantasy/Horror/Musical/Romanze/Kriegsfilm +6 Qualit\xE4t" }
      }
    },
    Betriebskita: {
      name: "Betriebskita",
      description: "Entlastet Familien im Team und bindet Mitarbeiter ans Studio.",
      levels: {
        level1: { desc: "Kleine Kita mit flexiblen Betreuungszeiten", bonus: "Mitarbeiterzufriedenheit +4/Monat" },
        level2: { desc: "Gro\xDFe Kita mit Ferienprogramm", bonus: "Mitarbeiterzufriedenheit +8/Monat" }
      }
    },
    Studiohotel: {
      name: "Studiohotel",
      description: "Beherbergt G\xE4ste, Stars und Touristen direkt auf dem Gel\xE4nde.",
      levels: {
        level1: { desc: "Business-Hotel mit Studioblick", bonus: "Hohe monatliche Einnahmen" },
        level2: { desc: "Luxus-Resort f\xFCr Stars und Branchenbesucher", bonus: "Sehr hohe monatliche Einnahmen" }
      }
    },
    Eventhalle: {
      name: "Eventhalle",
      description: "F\xFCr Premieren, Galas, Messen und Fan-Events.",
      levels: {
        level1: { desc: "Flexible Halle f\xFCr Premieren und Firmenfeiern", bonus: "Solide Event-Einnahmen" },
        level2: { desc: "Prestige-Location f\xFCr Award-N\xE4chte und Gro\xDFevents", bonus: "Starke Event-Einnahmen" }
      }
    },
    Fanshop: {
      name: "Fanshop",
      description: "Verkauft Merch, Sammlerst\xFCcke und exklusive Studio-Souvenirs.",
      levels: {
        level1: { desc: "Kleiner Merch-Shop am Besuchereingang", bonus: "Kleine monatliche Einnahmen" },
        level2: { desc: "Gro\xDFer Flagship-Store mit Sondereditionen", bonus: "Gute monatliche Einnahmen" }
      }
    }
  }
};
export {
  studiogelaende
};
