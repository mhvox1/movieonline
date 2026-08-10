
import { RandomEvent } from '../../../types';
import { applyTransaction, newspaperImage, calculateEventCost } from '../eventHelpers';

export const miscEvents: RandomEvent[] = [
    {
        id: 'studio_10', category: 'Studio', title: "Drehbuch verkauft",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Lizenzabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.035); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Skript-Verkauf', amount, 'scriptSale') }; },
    },
    {
        id: 'studio_78', category: 'Studio', title: "Altes Equipment verkauft",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Lagerverwaltung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.015); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Verkauf Altgeräte', amount) }; },
    },
    {
        id: 'studio_107', category: 'Studio', title: "Kaffee-Abo",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Einkaufsabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.001); return { updatedPlayerData: applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Kaffee-Deal', amount) }; },
    },
     {
        id: 'studio_124', category: 'Studio', title: "Spende für Kaffeekasse",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Projektleitung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.015); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Spende', amount) }; },
    },
    {
        id: 'studio_134', category: 'Studio', title: "Merchandising-Lizenz verkauft",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Lizenzabteilung',
        effect: (data) => { const amount = calculateEventCost(data.capital, 0.04); return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Lizenz-Verkauf', amount) }; },
    },
];
