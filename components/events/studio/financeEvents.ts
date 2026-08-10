
import { RandomEvent } from '../../../types';
import { applyTransaction, newspaperImage, calculateEventCost } from '../eventHelpers';

export const financeEvents: RandomEvent[] = [
    {
        id: 'studio_02', category: 'Studio', title: "Anonyme Spende", 
        text: "", 
        imageUrl: newspaperImage,
        sender: 'Buchhaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.025 + Math.random() * 0.02); 
            // Neutral: Nur Geld (Ruf-Bonus entfernt für Balance)
            return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Anonyme Spende', amount, 'anonymousDonation') }; 
        },
    },
    {
        id: 'studio_03', category: 'Studio', title: "Steuerprüfung", 
        text: "", 
        imageUrl: newspaperImage,
        sender: 'Finanzabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.012); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Steuernachzahlung', amount, 'taxPenalty');
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_12', category: 'Studio', title: "Versicherungs-Rückerstattung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Buchhaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.015); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Versicherungs-Rückerstattung', amount, 'insuranceRefund') }; },
    },
    {
        id: 'studio_23', category: 'Studio', title: "Lokale Fördergelder bewilligt",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Kulturamt',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.04); 
            return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Lokale Fördergelder', amount, 'localFunding') }; 
        },
    },
    {
        id: 'studio_47', category: 'Studio', title: "Sponsorvertrag unterzeichnet",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Finanzabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.035); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Sponsoring-Einnahmen', amount) }; },
    },
    {
        id: 'studio_74', category: 'Studio', title: "Steuerrückzahlung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Finanzabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.045); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Steuerrückerstattung', amount) }; },
    },
    {
        id: 'studio_138', category: 'Studio', title: "Fördermittel für Digitalisierung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Finanzabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.05); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Digitalisierungs-Förderung', amount) }; },
    },
    {
        id: 'studio_new_fin_01', category: 'Studio', title: "Buchhaltungsfehler zu unseren Gunsten",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Buchhaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.01); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Rückerstattung', amount) }; },
    },
    {
        id: 'studio_new_fin_02', category: 'Studio', title: "Günstiger Wechselkurs",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Finanzabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.008); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Währungsgewinn', amount) }; },
    },
    {
        id: 'studio_91', category: 'Studio', title: "Investoren-Rückzug kompensiert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Finanzabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.012); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Finanzierungslücke', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
];
