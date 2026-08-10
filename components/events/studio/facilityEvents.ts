
import { RandomEvent } from '../../../types';
import { applyTransaction, newspaperImage, calculateEventCost } from '../eventHelpers';

export const facilityEvents: RandomEvent[] = [
    {
        id: 'studio_01', category: 'Studio', title: "Feuer im Requisitenlager!", 
        text: "", 
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.008 + Math.random() * 0.004); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Brandschaden & Schutz', amount, 'fireDamage'); 
            updatedData.reputation = Math.max(0, updatedData.reputation - 1); 
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_09', category: 'Studio', title: "Vandalismus & Sicherheitsupgrade",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Sicherheitsdienst',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.006);
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Sicherheits-Upgrade', amount, 'vandalismDamage');
            updatedData.reputation = Math.max(0, updatedData.reputation - 1); 
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_18', category: 'Studio', title: "Professionelle Requisiten-Einlagerung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.005); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Externe Requisitenlagerung', amount, 'propStorage') }; },
    },
    {
        id: 'studio_22', category: 'Studio', title: "Gebäudesanierung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.01); 
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Gebäudesanierung', amount, 'buildingMaintenance');
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_31', category: 'Studio', title: "Dachreparatur mit Solaranlage",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.012); 
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Dach & Solar', amount, 'roofRepair');
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData }; 
        },
    },
    {
        id: 'studio_41', category: 'Studio', title: "Archiv-Modernisierung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.008); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Sanierung Archiv', amount) }; },
    },
    {
        id: 'studio_54', category: 'Studio', title: "Klimaanlagen-Upgrade",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.006); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Neue Klimaanlage', amount) }; },
    },
    {
        id: 'studio_70', category: 'Studio', title: "Kantine renoviert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.004); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Renovierung Kantine', amount) }; },
    },
    {
        id: 'studio_81', category: 'Studio', title: "Kulissenlager saniert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Requisitenabteilung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.01); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Sanierung Kulissenlager', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_93', category: 'Studio', title: "Sanitäranlagen modernisiert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.005); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Sanitär-Modernisierung', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_106', category: 'Studio', title: "Glasbruch & Neues Design",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.007); 
            // Neutral (Ruf entfernt für Balance)
            return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Lobby-Renovierung', amount) }; 
        },
    },
    {
        id: 'studio_127', category: 'Studio', title: "Atrium Begrünung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.003); 
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Begrünung', amount); 
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_133', category: 'Studio', title: "Verkabelung erneuert",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Hausverwaltung',
        effect: (data) => { 
            const amount = calculateEventCost(data.capital, 0.008); 
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Neuverkabelung', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_new_fac_01', category: 'Studio', title: "Fund im Lager",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Lagerverwaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.015); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Verkauf Fundstücke', amount) }; },
    },
    {
        id: 'studio_new_fac_02', category: 'Studio', title: "Nachbarschaftshilfe",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Bauleitung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.005); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Geschenktes Material (Wert)', amount) }; },
    },
];
