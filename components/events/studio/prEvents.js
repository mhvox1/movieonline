import { applyTransaction, newspaperImage, calculateEventCost } from '../eventHelpers';
export const prEvents = [
    {
        id: 'studio_06', category: 'Studio', title: "Lokaler Kulturpreis",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Büro des Bürgermeisters',
        // Positiv: +1 Ruf
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: Math.min(100, data.reputation + 1) } }),
    },
    {
        id: 'studio_15', category: 'Studio', title: "Preis für Nachhaltigkeit",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Branchenverband',
        // Positiv: +1 Ruf
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: Math.min(100, data.reputation + 1) } }),
    },
    {
        id: 'studio_17', category: 'Studio', title: "Branchenevent ausgerichtet",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Event-Komitee',
        effect: (data) => {
            const amount = calculateEventCost(data.capital, 0.025);
            // Neutral: Nur Geld (Ruf-Bonus entfernt für Balance)
            return { updatedPlayerData: applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Austragungsgebühr', amount, 'eventHostingFee') };
        },
    },
    {
        id: 'studio_40', category: 'Studio', title: "Viraler Marketing-Hit",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Marketingabteilung',
        // Positiv: +1 Ruf
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: Math.min(100, data.reputation + 1) } }),
    },
    {
        id: 'studio_42', category: 'Studio', title: "Influencer-Besuch",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        // Neutral (Ruf entfernt für Balance)
        effect: (data) => ({ updatedPlayerData: data }),
    },
    {
        id: 'studio_67', category: 'Studio', title: "Filmfestival-Feature",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Marketingabteilung',
        // Neutral (Ruf entfernt für Balance)
        effect: (data) => ({ updatedPlayerData: data }),
    },
    {
        id: 'studio_80', category: 'Studio', title: "Positives Branchen-Gerücht",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        effect: (data) => ({ updatedPlayerData: data }),
    },
    {
        id: 'studio_84', category: 'Studio', title: "Krisen-PR nach Interview",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        effect: (data) => {
            const amount = calculateEventCost(data.capital, 0.006);
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Krisen-PR', amount, 'Krisen-PR');
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_92', category: 'Studio', title: "Design-Preis gewonnen",
        text: "",
        imageUrl: newspaperImage,
        sender: 'Marketingabteilung',
        effect: (data) => {
            const amount = calculateEventCost(data.capital, 0.02);
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Einnahme', 'Zufallsereignis', 'Preisgeld Design-Award', amount);
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_99', category: 'Studio', title: "Lob vom Bürgermeister",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        // Neutral (Ruf entfernt für Balance)
        effect: (data) => ({ updatedPlayerData: data }),
    },
    {
        id: 'studio_126', category: 'Studio', title: "Top-Arbeitgeber Auszeichnung",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        // Positiv: +1 Ruf
        effect: (data) => ({ updatedPlayerData: { ...data, reputation: Math.min(100, data.reputation + 1) } }),
    },
    {
        id: 'studio_137', category: 'Studio', title: "Social Media Krisenmanagement",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        effect: (data) => {
            const amount = calculateEventCost(data.capital, 0.004);
            // Negativ: -1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'PR-Maßnahme', amount);
            updatedData.reputation = Math.max(0, updatedData.reputation - 1);
            return { updatedPlayerData: updatedData };
        },
    },
    {
        id: 'studio_new_pr_01', category: 'Studio', title: "Promi am Set",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        effect: (data) => ({ updatedPlayerData: data }),
    },
    {
        id: 'studio_new_pr_02', category: 'Studio', title: "Charity-Gala",
        text: "",
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        effect: (data) => {
            const amount = calculateEventCost(data.capital, 0.015);
            // Positiv: +1 Ruf
            let updatedData = applyTransaction(data, 'Ausgabe', 'Zufallsereignis', 'Spende Charity', amount);
            updatedData.reputation = Math.min(100, updatedData.reputation + 1);
            return { updatedPlayerData: updatedData };
        },
    },
];
