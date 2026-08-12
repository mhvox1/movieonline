
export const studiogelaende = {
    screen: {
        title: 'Studiogelände',
        build: 'Bauen',
        upgrade: 'Ausbauen',
        cost: 'Kosten:',
        duration: 'Dauer:',
        daysRemaining: '{days} Stunden verbleibend',
        monthlyCost: 'Unterhalt: {cost}/Monat',
        level: 'Stufe {level}',
        bonus: 'Bonus:',
        underConstruction: 'Im Bau...',
        fullyUpgraded: 'Maximal ausgebaut',
        selectBuilding: 'Wählen Sie ein Gebäude',
        selectBuildingHint: 'Klicken Sie auf ein Gebäude in der Liste für Details.',
        backToMain: 'Zurück zum Hauptmenü',
        currentBonus: 'Aktueller Bonus',
        nextLevel: 'Nächste Stufe ({level})',
        departmentSlots: 'Abteilungs-Slots',
        slotsUsed: 'Belegt',
        upgrading: 'Wird ausgebaut',
        tooltip: {
            noCapital: 'Nicht genügend Kapital.',
            constructionActive: 'Alle Bauslots belegt.',
            researchRequired: 'Benötigt Forschung: {techName}',
            officeUpgrade: 'Bürogebäude muss ausgebaut werden.',
            dependencyMissing: 'Voraussetzung: {requirement}'
        }
    },
    buildings: {
        Burogebaude: {
            name: 'Bürogebäude',
            description: 'Das Verwaltungszentrum. Hier sitzen Ihre Mitarbeiter.',
            levels: {
                level1: { desc: 'Kleines Büro (3 Mitarbeiter)', bonus: 'Max. 3 Mitarbeiter' },
                level2: { desc: 'Mittleres Büro (6 Mitarbeiter)', bonus: 'Max. 6 Mitarbeiter' },
                level3: { desc: 'Großraumbüro (12 Mitarbeiter)', bonus: 'Max. 12 Mitarbeiter' },
                level4: { desc: 'Firmenzentrale (25 Mitarbeiter)', bonus: 'Max. 25 Mitarbeiter' }
            }
        },
        Autorenbuero: {
            name: 'Autorenbüro',
            description: 'Der kreative Hub für Ihre Drehbuchautoren.',
            levels: {
                level1: { desc: 'Grundlegende Ausstattung', bonus: 'Ermöglicht Drehbuch-Entwicklung' },
                level2: { desc: 'Inspirierende Umgebung', bonus: 'Schreibgeschwindigkeit +10%' }
            }
        },
        CastingOffice: {
            name: 'Casting-Büro',
            description: 'Hier werden die Stars von morgen entdeckt.',
            levels: {
                level1: { desc: 'Casting-Büro', bonus: 'Ermöglicht Casting & Scouting' },
                level2: { desc: 'Erweitertes Netzwerk', bonus: 'Bessere Casting-Ergebnisse' }
            }
        },
        MarketingDepartment: {
            name: 'Marketing-Abteilung',
            description: 'Die Schaltzentrale für Werbung und PR.',
            levels: {
                level1: { desc: 'Marketing-Büro', bonus: 'Ermöglicht Kampagnen' },
                level2: { desc: 'PR-Agentur', bonus: 'Effektivere Kampagnen' }
            }
        },
        ResearchLab: {
            name: 'Forschungslabor',
            description: 'Hier entsteht die Zukunft des Films.',
            levels: {
                level1: { desc: 'Forschungslabor', bonus: 'Ermöglicht Forschung' },
                level2: { desc: 'High-Tech Labor', bonus: 'Forschungspunkte +5/Tag' }
            }
        },
        Planungsbuero: {
            name: 'Planungsbüro',
            description: 'Optimiert Produktionsabläufe.',
            levels: {
                level1: { desc: 'Planungsbüro', bonus: 'Ermöglicht Projektplanung' },
                level2: { desc: 'Projektmanagement-Center', bonus: 'Planungsdauer -10%' }
            }
        },
        Studio: {
            name: 'Studio-Hallen',
            description: 'Der zentrale Ort für Ihre Dreharbeiten. Bauen Sie Studios aus, um mehrere oder größere Produktionen gleichzeitig zu ermöglichen.',
            levels: {
                level1: { desc: 'Zentrale Verwaltung der Drehhallen', bonus: 'Basis-Infrastruktur' },
                level2: { desc: 'Erweiterte Logistik für größere Sets', bonus: 'Ermöglicht Studio 2' },
                level3: { desc: 'High-Tech Campus für Großproduktionen', bonus: 'Ermöglicht Studio 3' }
            }
        },
        Studio1: {
            name: 'Studio 1',
            description: 'Das erste Filmstudio für kleinere bis mittlere Produktionen.',
            levels: { 
                level1: { desc: 'Standard-Ausstattung', bonus: 'Ermöglicht Dreharbeiten' },
                level2: { desc: 'Modernisierte Technik & Schalldämmung', bonus: 'Verbesserte Qualität' },
                level3: { desc: 'Volldigitales Smart-Studio', bonus: 'Maximale Effizienz' }
            }
        },
        Studio2: {
            name: 'Studio 2',
            description: 'Ein größeres Studio für ambitionierte Projekte.',
            levels: { 
                level1: { desc: 'Großraumhalle', bonus: 'Höhere Kapazität' },
                level2: { desc: 'Erweiterung mit Wassertank', bonus: 'Spezialeffekte möglich' },
                level3: { desc: 'Monumentale Produktionshalle', bonus: 'Für Mega-Blockbuster' }
            }
        },
        Studio3: {
            name: 'Studio 3',
            description: 'High-End Studio mit Green-Screen und modernster Technik.',
            levels: { 
                level1: { desc: 'Green-Screen Basis', bonus: 'VFX-Produktion' },
                level2: { desc: 'LED-Volume Technologie', bonus: 'Reduzierte Post-Produktion' },
                level3: { desc: 'Holo-Deck Studio', bonus: 'Maximale VFX-Qualität' }
            }
        },
        Bauhof: {
            name: 'Bauhof',
            description: 'Zentrale für alle Bauvorhaben. Ermöglicht das parallele Durchführen von mehreren Bauprojekten.',
            levels: {
                level1: { desc: 'Kleiner Bauhof', bonus: '2 Bauaufträge gleichzeitig' },
                level2: { desc: 'Großer Bauhof', bonus: '3 Bauaufträge gleichzeitig' }
            }
        },
        Kino: {
            name: 'Kino',
            description: 'Ein eigenes Kino auf dem Studiogelände.',
            levels: {
                level1: { desc: 'Kleines Programmkino', bonus: 'Kleine monatliche Einnahmen' },
                level2: { desc: 'Multiplex-Saal', bonus: 'Mittlere Einnahmen' }
            }
        },
        Restaurant: {
            name: 'Restaurant',
            description: 'Sorgt für das leibliche Wohl.',
            levels: {
                level1: { desc: 'Cafeteria', bonus: 'Moral +1' },
                level2: { desc: 'Gourmet-Restaurant', bonus: 'Moral +3' }
            }
        },
        Filmmuseum: {
            name: 'Filmmuseum',
            description: 'Ein Ort der Filmgeschichte.',
            levels: {
                level1: { desc: 'Museum', bonus: 'Ruf +1 (Chance)' }
            }
        },
        Backlot: {
            name: 'Backlot',
            description: 'Modulare Außensets für schnellere und stärkere Außendrehs.',
            levels: {
                level1: { desc: 'Kompakter Außenset-Park', bonus: 'Produktion -5%, Action/Abenteuer/Western +2 Qualität' },
                level2: { desc: 'Großer Set-Park mit Straßen- und Naturkulissen', bonus: 'Produktion -12%, Action/Abenteuer/Western/Sci-Fi +4 Qualität' },
                level3: { desc: 'Premium-Backlot mit variablen Mega-Sets', bonus: 'Produktion -15%, Action/Abenteuer/Western/Sci-Fi/Kriegsfilm +6 Qualität' }
            }
        },
        Postproduktionshaus: {
            name: 'Postproduktionshaus',
            description: 'Schnitt, Grading und Mastering inhouse.',
            levels: {
                level1: { desc: 'Kompakte Inhouse-Postproduktion', bonus: 'Postproduktion -10%, Endqualität +1' },
                level2: { desc: 'Professionelles Finish-Center', bonus: 'Postproduktion -20%, Endqualität +2' },
                level3: { desc: 'Premium-Suite für internationale Master', bonus: 'Postproduktion -30%, Endqualität +3' }
            }
        },
        Sicherheitszentrale: {
            name: 'Sicherheitszentrale',
            description: 'Schützt Studio, Daten und Talente vor Leaks und Sabotage.',
            levels: {
                level1: { desc: 'Werkschutz mit Zugangskontrolle', bonus: '35% weniger Sicherheits- und Leak-Events' },
                level2: { desc: 'Leitstelle mit Cyber-Security', bonus: '60% weniger Sicherheits- und Leak-Events' }
            }
        },
        KostuemUndMaskenatelier: {
            name: 'Kostüm- & Maskenatelier',
            description: 'Spezialisiert auf Garderobe, Prothesen und charakterstarke Looks.',
            levels: {
                level1: { desc: 'Solides Kostüm- und Maskenteam', bonus: 'Fantasy/Horror/Musical +2 Qualität' },
                level2: { desc: 'Erweitertes Atelier mit Spezialmasken', bonus: 'Fantasy/Horror/Musical/Romanze +4 Qualität' },
                level3: { desc: 'Preisgekröntes Atelier für Prestigeproduktionen', bonus: 'Fantasy/Horror/Musical/Romanze/Kriegsfilm +6 Qualität' }
            }
        },
        Betriebskita: {
            name: 'Betriebskita',
            description: 'Entlastet Familien im Team und bindet Mitarbeiter ans Studio.',
            levels: {
                level1: { desc: 'Kleine Kita mit flexiblen Betreuungszeiten', bonus: 'Mitarbeiterzufriedenheit +4/Monat' },
                level2: { desc: 'Große Kita mit Ferienprogramm', bonus: 'Mitarbeiterzufriedenheit +8/Monat' }
            }
        },
        Studiohotel: {
            name: 'Studiohotel',
            description: 'Beherbergt Gäste, Stars und Touristen direkt auf dem Gelände.',
            levels: {
                level1: { desc: 'Business-Hotel mit Studioblick', bonus: 'Hohe monatliche Einnahmen' },
                level2: { desc: 'Luxus-Resort für Stars und Branchenbesucher', bonus: 'Sehr hohe monatliche Einnahmen' }
            }
        },
        Eventhalle: {
            name: 'Eventhalle',
            description: 'Für Premieren, Galas, Messen und Fan-Events.',
            levels: {
                level1: { desc: 'Flexible Halle für Premieren und Firmenfeiern', bonus: 'Solide Event-Einnahmen' },
                level2: { desc: 'Prestige-Location für Award-Nächte und Großevents', bonus: 'Starke Event-Einnahmen' }
            }
        },
        Fanshop: {
            name: 'Fanshop',
            description: 'Verkauft Merch, Sammlerstücke und exklusive Studio-Souvenirs.',
            levels: {
                level1: { desc: 'Kleiner Merch-Shop am Besuchereingang', bonus: 'Kleine monatliche Einnahmen' },
                level2: { desc: 'Großer Flagship-Store mit Sondereditionen', bonus: 'Gute monatliche Einnahmen' }
            }
        }
    }
};