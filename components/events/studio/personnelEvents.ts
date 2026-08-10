
import { RandomEvent, Director, Actor, PlayerData } from '../../../types';
import { applyTransaction, newspaperImage, personalNoteImage, calculateEventCost } from '../eventHelpers';
import { generateNewTalent } from '../../talentGenerator';
import { getTalentPortraitUrl } from '../../TalentDossierModal';

// Helper: Versucht ein existierendes, verstecktes Talent zu finden.
// Falls keines da ist (oder keines, das zum Ruf passt), wird ein neues generiert.
const discoverOrGenerateTalent = (
    data: PlayerData, 
    forcedRole?: 'director' | 'actor'
): { updatedPlayerData: PlayerData, customVariables: { talentName: string, birthDate: string, portraitUrl: string } } => {
    
    // Rolle bestimmen (wenn nicht erzwungen, 50/50 Chance)
    const isDirector = forcedRole ? forcedRole === 'director' : Math.random() < 0.5;
    
    // Die entsprechende Liste aus den PlayerData holen
    const pool = isDirector ? data.directors : data.actors;

    // Balancing-Bereich definieren: Ruf -10 bis Ruf +20
    const minSkill = Math.max(1, data.reputation - 10);
    const maxSkill = Math.min(100, data.reputation + 20);

    // Filtern nach: 
    // 1. Nicht entdeckt
    // 2. Kein Familienmitglied / Platzhalter
    // 3. Skill liegt im akzeptablen Bereich (Balancing)
    const fittingTalents = pool.filter(t => 
        !t.isDiscovered && 
        t.id !== -1 && 
        !(t as any).isFamily &&
        t.skill >= minSkill &&
        t.skill <= maxSkill
    );

    let updatedList: (Director | Actor)[] = [...pool];
    let selectedTalent: Director | Actor;

    if (fittingTalents.length > 0) {
        // --- SZENARIO A: Passendes Talent aus der DB nutzen ---
        const randomIndex = Math.floor(Math.random() * fittingTalents.length);
        const talentToDiscover = fittingTalents[randomIndex];
        
        // Wir erstellen eine Kopie des Talents mit aktualisierten Werten
        selectedTalent = {
            ...talentToDiscover,
            isDiscovered: true,
            bekanntheit: 1 // Startet mit 1 Stern durch die Entdeckung
        };

        // Liste aktualisieren: Das alte (versteckte) Talent durch das neue (entdeckte) ersetzen
        updatedList = updatedList.map(t => t.id === selectedTalent.id ? selectedTalent : t);
    } else {
        // --- SZENARIO B: Neues Talent generieren ---
        // Dies passiert, wenn kein Talent in der DB ist, das dem aktuellen Ruf entspricht.
        // Wir generieren eines, das genau in den gewünschten Bereich fällt.
        
        // Zufallswert zwischen -10 und +20
        const variance = Math.floor(Math.random() * 31) - 10; 
        const targetSkill = Math.min(100, Math.max(1, data.reputation + variance));
        
        selectedTalent = generateNewTalent(
            data.directors, 
            data.actors, 
            undefined, 
            undefined, 
            isDirector ? 'director' : 'actor', 
            true, 
            targetSkill, // Erzwungener Skill-Wert
            data.gameDate
        );
        selectedTalent.isDiscovered = true;
        selectedTalent.bekanntheit = 1;

        // Neues Talent der Liste hinzufügen
        updatedList = [...updatedList, selectedTalent];
    }

    // PlayerData aktualisieren
    const newData = { ...data };
    if (isDirector) {
        newData.directors = updatedList as Director[];
    } else {
        newData.actors = updatedList as Actor[];
    }

    const birthDateStr = new Date(selectedTalent.birthDate).toLocaleDateString('de-DE');
    
    // Portrait URL generieren
    const portraitUrl = getTalentPortraitUrl(selectedTalent, data.gameDate);

    return {
        updatedPlayerData: newData,
        customVariables: {
            talentName: selectedTalent.name,
            birthDate: birthDateStr,
            portraitUrl: portraitUrl
        }
    };
};

export const personnelEvents: RandomEvent[] = [
    {
        id: 'studio_04', category: 'Studio', title: "Mitarbeiter gewinnen im Lotto",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        // Neutral (Ruf entfernt für Balance)
        effect: (data) => ({ updatedPlayerData: data }),
    },
    {
        id: 'studio_07', category: 'Studio', title: "Klage beigelegt",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Rechtsabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.008 + Math.random() * 0.004); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Vergleich & Reform', amount, 'legalFees');
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_28', category: 'Studio', title: "Komponisten-Workshop",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + (100 + Math.floor(Math.random() * 51)) } }),
    },
    {
        id: 'studio_30', category: 'Studio', title: "Hohe Mitarbeiterzufriedenheit",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        // Positiv: +1 Ruf
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: Math.min(100, data.reputation + 1) } }),
    },
    {
        id: 'studio_39', category: 'Studio', title: "Neue Kaffeemaschine",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.002); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Kaffeemaschine', amount) }; },
    },
    {
        id: 'studio_45', category: 'Studio', title: "Grippewelle & Aushilfen",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.004); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Aushilfen', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_57', category: 'Studio', title: "Stipendium für Mitarbeiter",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { 
            // Positiv: +1 Ruf
            let updatedData = { ...data, researchPoints: data.researchPoints + 200 };
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_65', category: 'Studio', title: "Spontane Teamparty",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.001); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Teamparty', amount) }; },
    },
    {
        id: 'studio_75', category: 'Studio', title: "Headhunter-Attacke abgewehrt",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.008); 
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Gehaltsanpassungen', amount);
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_87', category: 'Studio', title: "Mitarbeiter des Monats",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        // Neutral (Ruf entfernt für Balance)
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.003); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Boni', amount) }; },
    },
    {
        id: 'studio_96', category: 'Studio', title: "Neuer Koch in der Kantine",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.005); 
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Bio-Kantine', amount);
            updatedData.reputation = Math.min(100, updatedData.reputation + 1); 
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_103', category: 'Studio', title: "Team-Ausflug",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.003); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Teamevent', amount) }; },
    },
    {
        id: 'studio_119', category: 'Studio', title: "Mediator engagiert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.004); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Mediator', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_130', category: 'Studio', title: "Erfolgsbonus für Alle",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Geschäftsleitung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.01); 
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Mitarbeiter-Boni', amount);
            updatedData.reputation = Math.min(100, updatedData.reputation + 1); 
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_new_hr_01', category: 'Studio', title: "Motivierter Praktikant",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 50 } }),
    },
    {
        id: 'studio_new_hr_02', category: 'Studio', title: "Kreativer Workshop",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Personalabteilung',
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 80 } }),
    },
    {
        id: 'studio_34', category: 'Studio', title: 'Zufallsbegegnung im Café',
        text: '',
        imageUrl: personalNoteImage,
        sender: 'Privat',
        effect: (data) => discoverOrGenerateTalent(data)
    },
    {
        id: 'studio_35', category: 'Studio', title: 'Ein Abend im kleinen Theater',
        text: '',
        imageUrl: personalNoteImage, sender: 'Privat',
        effect: (data) => discoverOrGenerateTalent(data, 'actor')
    },
    {
        id: 'studio_36', category: 'Studio', title: 'Inspirierende Diskussion',
        text: '',
        imageUrl: personalNoteImage, sender: 'Privat',
        effect: (data) => discoverOrGenerateTalent(data, 'director')
    },
    {
        id: 'studio_37', category: 'Studio', title: 'Talent auf der Straße',
        text: '',
        imageUrl: personalNoteImage, sender: 'Privat',
        effect: (data) => discoverOrGenerateTalent(data, 'actor')
    },
    {
        id: 'studio_38', category: 'Studio', title: 'Auffälliger Statist',
        text: '',
        imageUrl: personalNoteImage, sender: 'Privat',
        effect: (data) => discoverOrGenerateTalent(data, 'actor')
    },
];
