
import { PlayerData, Transaction } from '../../types';

export const newspaperImage = 'https://imgur.com/gdeu59D.png';
export const personalNoteImage = 'https://i.imgur.com/6DM4A4x.png';

export const applyTransaction = (
    data: PlayerData, 
    type: 'Einnahme' | 'Ausgabe', 
    category: Transaction['category'], 
    description: string, 
    amount: number,
    descriptionKey?: string,
    descriptionVars?: Record<string, string | number>
): PlayerData => {
    const newData = { ...data };
    if (type === 'Einnahme') {
        newData.capital += amount;
    } else {
        newData.capital -= amount;
    }
    newData.transactionLog = [...newData.transactionLog, { 
        date: new Date(data.gameDate), 
        type, 
        category, 
        description, 
        amount,
        descriptionKey,
        descriptionVars
    }];
    return newData;
};

/**
 * Berechnet die Kosten für ein Event basierend auf den Balancing-Regeln.
 * 1. Obergrenze: 5% des Kapitals (Hard Cap).
 * 2. Absolute Deckelung (Reichen-Bremse): Wenn Kosten > 80.000, dann variiere zwischen 70k und 90k.
 * 3. Untergrenze (Mindestbetrag): Wenn Kosten < 500, dann variiere zwischen 400 und 600.
 */
export const calculateEventCost = (capital: number, targetPercent: number): number => {
    // Regel 1: Basis-Berechnung
    const safePercent = Math.min(0.05, targetPercent); // Hard Cap bei 5%
    const rawAmount = Math.floor(capital * safePercent);

    // Regel 2: Deckelung bei 80.000 mit Varianz (Reichen-Bremse)
    if (rawAmount > 80000) {
        // Zufallswert zwischen 70.000 und 90.000
        return 70000 + Math.floor(Math.random() * 20001);
    }

    // Regel 3: Untergrenze bei 500 mit Varianz
    if (rawAmount < 500) {
        return 400 + Math.floor(Math.random() * 201);
    }

    return rawAmount;
};
