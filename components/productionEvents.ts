
import { ProductionEvent } from '../types';

export const PRODUCTION_EVENTS: ProductionEvent[] = [
  // --- EXISTING HYPE EVENTS ---
  {
    id: 'hype_01_set_leak',
    title: 'Set-Fotos leaken!',
    text: 'Ein "versehentlich" an die Presse weitergegebenes Set-Foto sorgt für erste Spekulationen und erhöht das öffentliche Interesse an Ihrem Film.',
    actions: [
      {
        text: 'Interessant!',
        value: 'accept',
        className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500",
        effect: {
          hypeModifier: Math.floor(Math.random() * 4) + 2, // 2-5
        },
      },
    ],
  },
  // Erläuterung: Reines Hype-Event. Erhöht den Hype des Films um 2-5 Punkte.

  {
    id: 'hype_02_actor_post',
    title: 'Virales Posting!',
    text: 'Ihr Star {talentName} hat ein lustiges Video hinter den Kulissen gepostet, das in den sozialen Medien viral geht. Der Film ist plötzlich in aller Munde!',
    isTalentSpecific: true,
    talentRole: 'actor',
    actions: [
      {
        text: 'Großartige PR!',
        value: 'accept',
        className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500",
        effect: {
          hypeModifier: Math.floor(Math.random() * 4) + 1, // 1-4
        },
      },
    ],
  },
  // Erläuterung: Talent-spezifisches Hype-Event. Erhöht den Hype um 1-4 Punkte.

  {
    id: 'hype_03_critic_praise',
    title: 'Kritiker lobt Dailies',
    text: 'Ein einflussreicher Journalist konnte einen Blick auf das erste Rohmaterial werfen und twittert begeistert über die "atemberaubende Cinematographie". Die Erwartungen steigen!',
    actions: [
      {
        text: 'Ausgezeichnet!',
        value: 'accept',
        className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500",
        effect: {
          hypeModifier: Math.floor(Math.random() * 3) + 3, // 3-5
        },
      },
    ],
  },
  // Erläuterung: Starkes Hype-Event. Erhöht den Hype um 3-5 Punkte.

  {
    id: 'hype_04_fan_encounter',
    title: 'Fans am Drehort',
    text: 'Eine kleine Gruppe begeisterter Fans hat den Drehort ausfindig gemacht und sorgt für positive Stimmung. Lokale Nachrichten berichten darüber.',
    actions: [
      {
        text: 'Sympathisch!',
        value: 'accept',
        className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500",
        effect: {
          hypeModifier: Math.floor(Math.random() * 3) + 1, // 1-3
        },
      },
    ],
  },
  // Erläuterung: Kleines Hype-Event. Erhöht den Hype um 1-3 Punkte.

  // --- NEW HYPE EVENTS (25) ---
  ...Array.from({ length: 25 }, (_, i) => ({
      id: `hype_new_${i + 1}`,
      title: 'Hype Event', // Placeholder, text comes from translation
      text: 'Placeholder text',
      actions: i % 2 === 0 ? [ // Even numbers: Single Action (Bonus)
          {
              text: 'Super!',
              value: 'accept',
              effect: { hypeModifier: Math.floor(Math.random() * 3) + 2 }
          }
      ] : [ // Odd numbers: Decision (Risk/Reward)
          {
              text: 'Risiko eingehen',
              value: 'risk',
              effect: { hypeModifier: 5, reputationModifier: -1 }
          },
          {
              text: 'Sicher spielen',
              value: 'safe',
              effect: { hypeModifier: 1 }
          }
      ]
  })),
  // Erläuterung: 25 neue Hype-Events.
  // Gerade IDs: Einfacher Hype-Boost (+2 bis +4).
  // Ungerade IDs: Entscheidung zwischen aggressivem Hype (+5 Hype, -1 Ruf) und sicherem Hype (+1 Hype).

  // --- EXISTING PRODUCTION EVENTS ---
  {
    id: 'prod_delay_drug_rehab',
    title: 'Schattenseiten des Ruhms',
    text: 'Ihr Hauptdarsteller {talentName} ist den Versuchungen des Ruhms erlegen. Er benötigt dringend eine Auszeit für einen Entzug.',
    isTalentSpecific: true,
    talentRole: 'actor',
    actions: [
      {
        text: 'Produktion pausieren',
        value: 'pause',
        className: "bg-red-800 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700",
        effect: {
          durationModifier: 30 + Math.floor(Math.random() * 16),
          hypeModifier: 2,
        },
      },
      {
        text: 'Double einsetzen',
        value: 'double',
        className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500",
        effect: {
            qualityModifier: -15,
            hypeModifier: -5,
        }
      }
    ],
  },
  // Erläuterung: Option 1: Massive Verzögerung. Option 2: Massiver Qualitätsverlust.

  {
    id: 'prod_delay_creative_diff',
    title: 'Kreative Differenzen',
    text: 'Am Set herrscht dicke Luft. Ihr Regisseur {talentName} und der Hauptdarsteller haben völlig unterschiedliche Visionen für eine Schlüsselszene.',
    isTalentSpecific: true,
    talentRole: 'director',
    actions: [
      {
        text: 'Diskussion zulassen',
        value: 'discuss',
        className: "bg-yellow-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-yellow-500",
        effect: {
          durationModifier: 10 + Math.floor(Math.random() * 6),
          qualityModifier: 2
        },
      },
      {
        text: 'Machtwort sprechen',
        value: 'force',
        className: "bg-red-800 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700",
        effect: {
          qualityModifier: -2,
          reputationModifier: -1
        },
      },
    ],
  },
  // Erläuterung: Option 1: Zeit kostet Qualität. Option 2: Spart Zeit, kostet Qualität.

  {
    id: 'prod_delay_tech_failure',
    title: 'Technisches Versagen',
    text: 'Mitten in einer wichtigen Szene gibt die Hauptkamera den Geist auf.',
    actions: [
      {
        text: 'Ersatzteil einfliegen',
        value: 'express',
        className: "bg-red-800 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700",
        effect: {
          durationModifier: 2,
          dynamicCostRange: [2, 3] as [number, number],
        },
      },
      {
        text: 'Auf Standard-Versand warten',
        value: 'wait',
        className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500",
        effect: {
            durationModifier: 8,
            dynamicCostRange: [0, 0.5] as [number, number]
        }
      }
    ],
  },
  // Erläuterung: Geld vs. Zeit.

  // --- NEW PRODUCTION EVENTS (25) ---
  ...Array.from({ length: 25 }, (_, i) => ({
      id: `prod_new_${i + 1}`,
      title: 'Production Event',
      text: 'Placeholder text',
      actions: i % 3 === 0 ? [ // Type A: Disaster (Bad vs Bad)
           {
              text: 'Zeit opfern',
              value: 'delay',
              effect: { durationModifier: 5, qualityModifier: 1 }
           },
           {
              text: 'Qualität opfern',
              value: 'rush',
              effect: { durationModifier: 0, qualityModifier: -2 }
           }
      ] : i % 3 === 1 ? [ // Type B: Opportunity (Good vs Cost)
           {
              text: 'Investieren',
              value: 'invest',
              effect: { qualityModifier: 2, dynamicCostRange: [1, 2] as [number, number] }
           },
           {
              text: 'Ignorieren',
              value: 'ignore',
              effect: { qualityModifier: 0 }
           }
      ] : [ // Type C: Flavour / Small Impact (Static)
           {
              text: 'Okay',
              value: 'ok',
              effect: { durationModifier: Math.random() > 0.5 ? 2 : -1 } // Small delay or speedup
           }
      ]
  })),
  // Erläuterung: 25 neue Produktionsevents.
  // Typ A: Zeitverzögerung vs. Qualitätsverlust.
  // Typ B: Qualität kaufen vs. Status Quo.
  // Typ C: Zufällige kleine Zeitänderung (+2 oder -1 Tag).

  // --- EXISTING COST EVENTS ---
  {
    id: 'cost_01_equipment_failure',
    title: 'Defektes Equipment',
    text: 'Ein wichtiges Kamerateil ist ausgefallen.',
    actions: [
      {
        text: 'Sofort ersetzen',
        value: 'repair',
        className: "bg-red-800 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700",
        effect: {
          dynamicCostRange: [1.5, 3] as [number, number],
        },
      },
       {
        text: 'Improvisieren',
        value: 'improvise',
        className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500",
        effect: {
          qualityModifier: -3
        },
      },
    ],
  },
  // Erläuterung: Geld vs. Qualität.

   {
    id: 'cost_03_permit_issues',
    title: 'Problem mit Drehgenehmigung',
    text: 'Die Stadtverwaltung macht plötzlich Probleme wegen einer Drehgenehmigung.',
    actions: [
      {
        text: 'Bearbeitungsgebühr zahlen',
        value: 'bribe',
        className: "bg-yellow-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-yellow-500",
        effect: {
          dynamicCostRange: [0.5, 2] as [number, number],
        },
      },
      {
        text: 'Ort verlegen',
        value: 'move',
        className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500",
        effect: {
          durationModifier: 5
        },
      },
    ],
  },
  // Erläuterung: Geld vs. Zeit.

  {
    id: 'cost_11_overtime',
    title: 'Überstunden angeordnet',
    text: 'Um den Zeitplan einzuhalten, hat der Regisseur {talentName} mehrere Nachtdrehs angeordnet.',
    isTalentSpecific: true,
    talentRole: 'director',
    actions: [
      {
        text: 'Überstunden genehmigen',
        value: 'pay_overtime',
        className: "bg-red-800 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700",
        effect: {
          dynamicCostRange: [2, 3.5] as [number, number],
          qualityModifier: 1
        },
      },
       {
        text: 'Nachtdreh streichen',
        value: 'cancel_night',
        className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500",
        effect: {
          qualityModifier: -2,
          durationModifier: 1
        },
      },
    ],
  },
  // Erläuterung: Geld für Qualität vs. Qualitätsverlust.

  // --- NEW COST EVENTS (25) ---
  ...Array.from({ length: 25 }, (_, i) => ({
      id: `cost_new_${i + 1}`,
      title: 'Cost Event',
      text: 'Placeholder',
      actions: i % 2 === 0 ? [ // Choice: Pay or Suffer
          {
              text: 'Zahlen',
              value: 'pay',
              effect: { dynamicCostRange: [1, 2] as [number, number] }
          },
          {
              text: 'Sparsam sein',
              value: 'cheap',
              effect: { qualityModifier: -1, reputationModifier: -1 }
          }
      ] : [ // Static: Unavoidable Cost
          {
              text: 'Zähneknirschend zahlen',
              value: 'pay_forced',
              effect: { dynamicCostRange: [0.5, 1.5] as [number, number] }
          }
      ]
  })),
  // Erläuterung: 25 neue Kostenevents.
  // Gerade IDs: Wahl zwischen Kosten und Qualitäts-/Rufverlust.
  // Ungerade IDs: Unvermeidbare Kosten (0.5% - 1.5% des Budgets).
];
