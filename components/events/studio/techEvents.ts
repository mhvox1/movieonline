
import { RandomEvent } from '../../../types';
import { applyTransaction, newspaperImage, calculateEventCost } from '../eventHelpers';

export const techEvents: RandomEvent[] = [
    {
        id: 'studio_05', category: 'Studio', title: "Server-Crash & Datenrettung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.006); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Datenwiederherstellung', amount, 'dataRecovery');
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_08', category: 'Studio', title: "Forschungsdurchbruch",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Forschungsleitung',
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + (100 + Math.floor(Math.random() * 101)) } }),
    },
    {
        id: 'studio_11', category: 'Studio', title: "Reparatur im Schneideraum",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Produktionsleitung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.005); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Reparatur Schneideraum', amount, 'editingRoomRepair');
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_13', category: 'Studio', title: "Ersatzbeschaffung Ton-Gerät",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Technische Abteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.008); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Neues Ton-Equipment', amount, 'newSoundEquipment') }; },
    },
    {
        id: 'studio_19', category: 'Studio', title: "Patent erteilt",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Forschungsleitung',
        // Positiv: +1 Ruf
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: Math.min(100, data.reputation + 1), researchPoints: data.researchPoints + 100 } }),
    },
    {
        id: 'studio_20', category: 'Studio', title: "IT-Sicherheitstest bestanden",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Sicherheit',
        // Neutral (Ruf entfernt für Balance)
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.006); 
            return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Sicherheits-Audit', amount, 'securityUpgrade') };
        },
    },
    {
        id: 'studio_25', category: 'Studio', title: "Software-Wartung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.008); 
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Software-Wartung', amount, 'softwareMaintenance');
            updatedData.researchPoints += 30; 
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_43', category: 'Studio', title: "Software nachlizenziert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.004); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Lizenzen', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_49', category: 'Studio', title: "Datenbank optimiert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 100 } }),
    },
    {
        id: 'studio_51', category: 'Studio', title: "Sicherheitslücke geschlossen",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Sicherheit',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.0005); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Prämie', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_59', category: 'Studio', title: "Internet-Upgrade",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.002); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Anschlussgebühr', amount) }; },
    },
    {
        id: 'studio_62', category: 'Studio', title: "Hardware ersetzt",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Einkauf',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.006); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Hardware', amount) }; },
    },
    {
        id: 'studio_76', category: 'Studio', title: "Neue Kameratechnik entwickelt",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Forschungsleitung',
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 200 } }),
    },
    {
        id: 'studio_90', category: 'Studio', title: "Drucker-Wartung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Support',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.001); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Reparatur', amount) }; },
    },
    {
        id: 'studio_98', category: 'Studio', title: "Neuer Referenzmonitor",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Technik-Einkauf',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.008); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Monitor', amount) }; },
    },
    {
        id: 'studio_118', category: 'Studio', title: "Kostenloses Software-Upgrade",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        effect: (data) => ({ updatedPlayerData: { ...data, researchPoints: data.researchPoints + 150 } }),
    },
    {
        id: 'studio_136', category: 'Studio', title: "Speicher-Upgrade (Günstig)",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Einkauf',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.002); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Speicher', amount) }; },
    },
    {
        id: 'studio_new_tech_01', category: 'Studio', title: "Beta-Tester Programm",
        text: "",
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        effect: (data) => {
            // Positiv: +1 Ruf
            let updatedData = { ...data, researchPoints: data.researchPoints + 75 };
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData };
        },
    },
];
