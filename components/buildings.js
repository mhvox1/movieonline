import { BuildingType, Genre } from "../types";
const BUILDING_DATA = {
  [BuildingType.Burogebaude]: {
    type: BuildingType.Burogebaude,
    description: "Das Herzst\xFCck Ihres Studios. Ein Ausbau erh\xF6ht die maximale Anzahl an Mitarbeitern.",
    levels: [
      { level: 1, cost: 0, duration: 0, monthlyCost: 500, description: "Kleines B\xFCro (3 Mitarbeiter)", bonusDescription: "Max. 3 Mitarbeiter" },
      { level: 2, cost: 5e4, duration: 30, monthlyCost: 1500, description: "Mittleres B\xFCro (6 Mitarbeiter)", bonusDescription: "Max. 6 Mitarbeiter" },
      { level: 3, cost: 25e4, duration: 60, monthlyCost: 4e3, description: "Gro\xDFraumb\xFCro (12 Mitarbeiter)", bonusDescription: "Max. 12 Mitarbeiter" },
      { level: 4, cost: 1e6, duration: 120, monthlyCost: 1e4, description: "Firmenzentrale (25 Mitarbeiter)", bonusDescription: "Max. 25 Mitarbeiter" }
    ]
  },
  [BuildingType.Autorenbuero]: {
    type: BuildingType.Autorenbuero,
    description: "Hier arbeiten Ihre Drehbuchautoren an neuen Stoffen.",
    levels: [
      { level: 1, cost: 25e3, duration: 14, monthlyCost: 800, description: "Grundlegende Ausstattung f\xFCr Autoren.", bonusDescription: "Erm\xF6glicht Drehbuch-Entwicklung" },
      { level: 2, cost: 1e5, duration: 45, monthlyCost: 2e3, description: "Inspirierende Umgebung.", bonusDescription: "Schreibgeschwindigkeit +10%" }
    ]
  },
  [BuildingType.CastingOffice]: {
    type: BuildingType.CastingOffice,
    description: "Verwaltung von Casting-Prozessen und Talent-Scouting.",
    levels: [
      { level: 1, cost: 3e4, duration: 14, monthlyCost: 1e3, description: "Casting-B\xFCro.", bonusDescription: "Erm\xF6glicht Casting & Scouting" },
      { level: 2, cost: 12e4, duration: 45, monthlyCost: 2500, description: "Erweitertes Netzwerk.", bonusDescription: "Bessere Casting-Ergebnisse" }
    ]
  },
  [BuildingType.MarketingDepartment]: {
    type: BuildingType.MarketingDepartment,
    description: "Planung von Werbekampagnen und Marktanalyse.",
    levels: [
      { level: 1, cost: 4e4, duration: 21, monthlyCost: 1200, description: "Marketing-Abteilung.", bonusDescription: "Erm\xF6glicht Kampagnen" },
      { level: 2, cost: 15e4, duration: 60, monthlyCost: 3e3, description: "PR-Agentur.", bonusDescription: "Effektivere Kampagnen" }
    ]
  },
  [BuildingType.ResearchLab]: {
    type: BuildingType.ResearchLab,
    description: "Entwicklung neuer Technologien und Erforschung von Genres.",
    levels: [
      { level: 1, cost: 1e5, duration: 30, monthlyCost: 2e3, description: "Forschungslabor.", bonusDescription: "Erm\xF6glicht Forschung", bonusEffect: { researchPointsPerDay: 2 } },
      { level: 2, cost: 5e5, duration: 90, monthlyCost: 5e3, description: "High-Tech Labor.", bonusDescription: "Forschungspunkte +5/Tag", bonusEffect: { researchPointsPerDay: 5 } }
    ]
  },
  [BuildingType.Planungsbuero]: {
    type: BuildingType.Planungsbuero,
    description: "Optimierung von Produktionsabl\xE4ufen.",
    levels: [
      { level: 1, cost: 35e3, duration: 21, monthlyCost: 1100, description: "Planungsb\xFCro.", bonusDescription: "Erm\xF6glicht Projektplanung" },
      { level: 2, cost: 14e4, duration: 60, monthlyCost: 2800, description: "Projektmanagement-Center.", bonusDescription: "Planungsdauer -10%" }
    ]
  },
  [BuildingType.Studio]: {
    type: BuildingType.Studio,
    description: "Das Hauptstudio-Gel\xE4nde. Verwaltung der Drehhallen.",
    levels: [
      { level: 1, cost: 1e5, duration: 0, monthlyCost: 1e3, description: "Grundlegende Infrastruktur.", bonusDescription: "Verwaltung von Studio 1." },
      { level: 2, cost: 5e5, duration: 60, monthlyCost: 2500, description: "Erweiterte Infrastruktur.", bonusDescription: "Erm\xF6glicht Bau von Studio 2." },
      { level: 3, cost: 2e6, duration: 120, monthlyCost: 5e3, description: "High-Tech Campus.", bonusDescription: "Erm\xF6glicht Bau von Studio 3." }
    ]
  },
  [BuildingType.Studio1]: {
    type: BuildingType.Studio1,
    description: "Hier k\xF6nnen Filmprojekte verwirklicht werden..",
    levels: [
      { level: 1, cost: 5e5, duration: 60, monthlyCost: 2e3, description: "Basis-Studio.", bonusDescription: "Verf\xFCgbar f\xFCr Dreharbeiten" },
      { level: 2, cost: 15e5, duration: 90, monthlyCost: 4500, description: "Modernisiertes Studio.", bonusDescription: "Verbesserte Qualit\xE4t" },
      { level: 3, cost: 4e6, duration: 150, monthlyCost: 9e3, description: "Smart-Studio.", bonusDescription: "Maximale Effizienz" }
    ]
  },
  [BuildingType.Studio2]: {
    type: BuildingType.Studio2,
    description: "Gro\xDFes Studio f\xFCr ambitionierte Projekte.",
    levels: [
      { level: 1, cost: 1e6, duration: 90, monthlyCost: 4e3, description: "Gro\xDFraumhalle.", bonusDescription: "Verf\xFCgbar f\xFCr Dreharbeiten" },
      { level: 2, cost: 3e6, duration: 120, monthlyCost: 8500, description: "Erweiterte Fl\xE4che.", bonusDescription: "Spezialeffekte m\xF6glich" },
      { level: 3, cost: 8e6, duration: 200, monthlyCost: 18e3, description: "Monumentale Halle.", bonusDescription: "F\xFCr Mega-Blockbuster" }
    ]
  },
  [BuildingType.Studio3]: {
    type: BuildingType.Studio3,
    description: "High-Tech Studio spezialisiert auf VFX.",
    levels: [
      { level: 1, cost: 2e6, duration: 120, monthlyCost: 8e3, description: "Green-Screen Studio.", bonusDescription: "Verf\xFCgbar f\xFCr Dreharbeiten" },
      { level: 2, cost: 5e6, duration: 180, monthlyCost: 15e3, description: "Volumen-Studio.", bonusDescription: "VFX-Kosten reduziert" },
      { level: 3, cost: 12e6, duration: 300, monthlyCost: 35e3, description: "Holo-Deck.", bonusDescription: "Maximale VFX-Qualit\xE4t" }
    ]
  },
  [BuildingType.Bauhof]: {
    type: BuildingType.Bauhof,
    description: "Zentrale f\xFCr alle Bauvorhaben. Erm\xF6glicht paralleles Bauen.",
    levels: [
      { level: 1, cost: 2e5, duration: 45, monthlyCost: 1500, description: "Kleiner Bauhof", bonusDescription: "2 Bauauftr\xE4ge gleichzeitig" },
      { level: 2, cost: 75e4, duration: 90, monthlyCost: 4e3, description: "Gro\xDFer Bauhof", bonusDescription: "3 Bauauftr\xE4ge gleichzeitig" }
    ]
  },
  [BuildingType.Kino]: {
    type: BuildingType.Kino,
    description: "Ein eigenes Kino f\xFCr Einnahmen.",
    levels: [
      { level: 1, cost: 25e4, duration: 45, monthlyCost: 1500, monthlyIncome: { min: 2e3, max: 5e3 }, description: "Kleines Programmkino.", bonusDescription: "Kleine monatliche Einnahmen" },
      { level: 2, cost: 75e4, duration: 90, monthlyCost: 4e3, monthlyIncome: { min: 6e3, max: 12e3 }, description: "Multiplex-Saal.", bonusDescription: "Mittlere Einnahmen" }
    ]
  },
  [BuildingType.Restaurant]: {
    type: BuildingType.Restaurant,
    description: "Verbessert die Moral der Mitarbeiter.",
    levels: [
      { level: 1, cost: 15e4, duration: 30, monthlyCost: 2e3, monthlyIncome: { min: 1e3, max: 3e3 }, description: "Cafeteria.", bonusDescription: "Moral +1" },
      { level: 2, cost: 4e5, duration: 60, monthlyCost: 5e3, monthlyIncome: { min: 4e3, max: 8e3 }, description: "Gourmet-Restaurant.", bonusDescription: "Moral +3" }
    ]
  },
  [BuildingType.Filmmuseum]: {
    type: BuildingType.Filmmuseum,
    description: "Zieht Touristen an und steigert den Ruf.",
    levels: [
      { level: 1, cost: 1e6, duration: 120, monthlyCost: 5e3, monthlyIncome: { min: 3e3, max: 6e3 }, description: "Museum.", bonusDescription: "Ruf +1 (Chance)", bonusEffect: { prestigeChance: 0.05 } }
    ]
  },
  [BuildingType.Backlot]: {
    type: BuildingType.Backlot,
    description: "Modulare Au\xDFensets f\xFCr schnellere und glaubw\xFCrdigere Au\xDFendrehs.",
    levels: [
      {
        level: 1,
        cost: 35e4,
        duration: 45,
        monthlyCost: 2500,
        description: "Kompakter Au\xDFenset-Park.",
        bonusDescription: "Produktion -5%, Action/Abenteuer/Western +2 Qualit\xE4t",
        bonusEffect: {
          productionDurationMultiplier: 0.95,
          genreQualityBonuses: {
            [Genre.Action]: 2,
            [Genre.Adventure]: 2,
            [Genre.Western]: 2
          }
        }
      },
      {
        level: 2,
        cost: 9e5,
        duration: 75,
        monthlyCost: 5e3,
        description: "Gro\xDFer Set-Park mit Stra\xDFen- und Naturkulissen.",
        bonusDescription: "Produktion -12%, Action/Abenteuer/Western/Sci-Fi +4 Qualit\xE4t",
        bonusEffect: {
          productionDurationMultiplier: 0.88,
          genreQualityBonuses: {
            [Genre.Action]: 4,
            [Genre.Adventure]: 4,
            [Genre.Western]: 4,
            [Genre.SciFi]: 4
          }
        }
      },
      {
        level: 3,
        cost: 22e5,
        duration: 120,
        monthlyCost: 9500,
        description: "Premium-Backlot mit variablen Mega-Sets.",
        bonusDescription: "Produktion -15%, Action/Abenteuer/Western/Sci-Fi/Kriegsfilm +6 Qualit\xE4t",
        bonusEffect: {
          productionDurationMultiplier: 0.85,
          genreQualityBonuses: {
            [Genre.Action]: 6,
            [Genre.Adventure]: 6,
            [Genre.Western]: 6,
            [Genre.SciFi]: 6,
            [Genre.War]: 6
          }
        }
      }
    ]
  },
  [BuildingType.Postproduktionshaus]: {
    type: BuildingType.Postproduktionshaus,
    description: "Schnitt, Grading und Mastering unter einem Dach.",
    levels: [
      {
        level: 1,
        cost: 45e4,
        duration: 60,
        monthlyCost: 3e3,
        description: "Kompakte Inhouse-Postproduktion.",
        bonusDescription: "Postproduktion -10%, Endqualit\xE4t +1",
        bonusEffect: {
          postProductionDurationMultiplier: 0.9,
          qualityBonus: 1
        }
      },
      {
        level: 2,
        cost: 12e5,
        duration: 90,
        monthlyCost: 7e3,
        description: "Professionelles Finish-Center.",
        bonusDescription: "Postproduktion -20%, Endqualit\xE4t +2",
        bonusEffect: {
          postProductionDurationMultiplier: 0.8,
          qualityBonus: 2
        }
      },
      {
        level: 3,
        cost: 3e6,
        duration: 150,
        monthlyCost: 15e3,
        description: "Premium-Suite f\xFCr internationale Master.",
        bonusDescription: "Postproduktion -30%, Endqualit\xE4t +3",
        bonusEffect: {
          postProductionDurationMultiplier: 0.7,
          qualityBonus: 3
        }
      }
    ]
  },
  [BuildingType.Sicherheitszentrale]: {
    type: BuildingType.Sicherheitszentrale,
    description: "Sch\xFCtzt Studio, Daten und Talente vor Leaks, Paparazzi und Sabotage.",
    levels: [
      {
        level: 1,
        cost: 25e4,
        duration: 30,
        monthlyCost: 2500,
        description: "Werkschutz mit Zugangskontrolle.",
        bonusDescription: "35% weniger Sicherheits- und Leak-Events",
        bonusEffect: {
          eventProtection: 0.35
        }
      },
      {
        level: 2,
        cost: 75e4,
        duration: 60,
        monthlyCost: 6e3,
        description: "Integrierte Leitstelle mit Cyber-Security.",
        bonusDescription: "60% weniger Sicherheits- und Leak-Events",
        bonusEffect: {
          eventProtection: 0.6
        }
      }
    ]
  },
  [BuildingType.KostuemUndMaskenatelier]: {
    type: BuildingType.KostuemUndMaskenatelier,
    description: "Spezialisiert auf Garderobe, Prothesen und charakterstarke Looks.",
    levels: [
      {
        level: 1,
        cost: 2e5,
        duration: 30,
        monthlyCost: 1800,
        description: "Solides Kost\xFCm- und Maskenteam.",
        bonusDescription: "Fantasy/Horror/Musical +2 Qualit\xE4t",
        bonusEffect: {
          genreQualityBonuses: {
            [Genre.Fantasy]: 2,
            [Genre.Horror]: 2,
            [Genre.Musical]: 2
          }
        }
      },
      {
        level: 2,
        cost: 65e4,
        duration: 75,
        monthlyCost: 4500,
        description: "Erweitertes Atelier mit Spezialmasken.",
        bonusDescription: "Fantasy/Horror/Musical/Romanze +4 Qualit\xE4t",
        bonusEffect: {
          genreQualityBonuses: {
            [Genre.Fantasy]: 4,
            [Genre.Horror]: 4,
            [Genre.Musical]: 4,
            [Genre.Romance]: 4
          }
        }
      },
      {
        level: 3,
        cost: 16e5,
        duration: 120,
        monthlyCost: 9e3,
        description: "Preisgekr\xF6ntes Atelier f\xFCr Prestigeproduktionen.",
        bonusDescription: "Fantasy/Horror/Musical/Romanze/Kriegsfilm +6 Qualit\xE4t",
        bonusEffect: {
          genreQualityBonuses: {
            [Genre.Fantasy]: 6,
            [Genre.Horror]: 6,
            [Genre.Musical]: 6,
            [Genre.Romance]: 6,
            [Genre.War]: 6
          }
        }
      }
    ]
  },
  [BuildingType.Betriebskita]: {
    type: BuildingType.Betriebskita,
    description: "Entlastet Familien im Team und verbessert die Bindung ans Studio.",
    levels: [
      {
        level: 1,
        cost: 18e4,
        duration: 30,
        monthlyCost: 2200,
        description: "Kleine Kita mit flexiblen Betreuungszeiten.",
        bonusDescription: "Mitarbeiterzufriedenheit +4/Monat",
        bonusEffect: {
          monthlySatisfactionBonus: 4
        }
      },
      {
        level: 2,
        cost: 45e4,
        duration: 60,
        monthlyCost: 5e3,
        description: "Gro\xDFe Kita mit Ferienprogramm.",
        bonusDescription: "Mitarbeiterzufriedenheit +8/Monat",
        bonusEffect: {
          monthlySatisfactionBonus: 8
        }
      }
    ]
  },
  [BuildingType.Studiohotel]: {
    type: BuildingType.Studiohotel,
    description: "Beherbergt G\xE4ste, Stars und Touristen direkt auf dem Gel\xE4nde.",
    levels: [
      {
        level: 1,
        cost: 6e5,
        duration: 75,
        monthlyCost: 4500,
        monthlyIncome: { min: 7e3, max: 14e3 },
        description: "Business-Hotel mit Studioblick.",
        bonusDescription: "Hohe monatliche Einnahmen"
      },
      {
        level: 2,
        cost: 16e5,
        duration: 120,
        monthlyCost: 11e3,
        monthlyIncome: { min: 18e3, max: 32e3 },
        description: "Luxus-Resort f\xFCr Stars und Branchenbesucher.",
        bonusDescription: "Sehr hohe monatliche Einnahmen"
      }
    ]
  },
  [BuildingType.Eventhalle]: {
    type: BuildingType.Eventhalle,
    description: "Vermietbar f\xFCr Premieren, Galas, Messen und Fan-Events.",
    levels: [
      {
        level: 1,
        cost: 5e5,
        duration: 60,
        monthlyCost: 3500,
        monthlyIncome: { min: 6e3, max: 13e3 },
        description: "Flexible Halle f\xFCr Premieren und Firmenfeiern.",
        bonusDescription: "Solide Event-Einnahmen"
      },
      {
        level: 2,
        cost: 14e5,
        duration: 105,
        monthlyCost: 9e3,
        monthlyIncome: { min: 16e3, max: 28e3 },
        description: "Prestige-Location f\xFCr Award-N\xE4chte und Gro\xDFevents.",
        bonusDescription: "Starke Event-Einnahmen"
      }
    ]
  },
  [BuildingType.Fanshop]: {
    type: BuildingType.Fanshop,
    description: "Verkauft Merch, Sammlerst\xFCcke und exklusive Studio-Souvenirs.",
    levels: [
      {
        level: 1,
        cost: 12e4,
        duration: 21,
        monthlyCost: 900,
        monthlyIncome: { min: 2500, max: 5500 },
        description: "Kleiner Merch-Shop am Besuchereingang.",
        bonusDescription: "Kleine monatliche Einnahmen"
      },
      {
        level: 2,
        cost: 35e4,
        duration: 45,
        monthlyCost: 2200,
        monthlyIncome: { min: 7e3, max: 12e3 },
        description: "Gro\xDFer Flagship-Store mit Sondereditionen.",
        bonusDescription: "Gute monatliche Einnahmen"
      }
    ]
  }
};
export {
  BUILDING_DATA
};
