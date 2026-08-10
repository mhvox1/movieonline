import { PORTRAIT_DATA } from './portraitData';
// Sortierfunktion (m1, m2, m10 statt m1, m10, m2)
const sortById = (a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
};
const allData = Object.values(PORTRAIT_DATA);
// Spieler & Partner Portraits (Erweitert auf 1-150)
export const PLAYER_MALE_PORTRAITS = Array.from({ length: 150 }, (_, i) => `m${i + 1}`);
export const PLAYER_FEMALE_PORTRAITS = Array.from({ length: 150 }, (_, i) => `w${i + 1}`);
// WICHTIG: Auch für NPCs/Bekanntschaften nutzen wir jetzt NUR noch diese Listen.
export const ALL_MALE_PORTRAITS = [...PLAYER_MALE_PORTRAITS];
export const ALL_FEMALE_PORTRAITS = [...PLAYER_FEMALE_PORTRAITS];
// Kinder Portraits
export const BABY_PORTRAITS = allData
    .filter(p => p.id.startsWith('b') && !p.id.startsWith('baby_'))
    .map(p => p.id)
    .sort(sortById);
export const TODDLER_PORTRAITS = allData
    .filter(p => p.id.startsWith('1j'))
    .map(p => p.id)
    .sort(sortById);
// --- MITARBEITER PORTRAITS (MIM/MIW 1-100) ---
// Diese werden dynamisch generiert, da wir nicht alle einzeln in PORTRAIT_DATA definieren müssen,
// solange sie nur als Dateinamen existieren.
export const EMPLOYEE_MALE_PORTRAITS = Array.from({ length: 100 }, (_, i) => `mim${i + 1}`);
export const EMPLOYEE_FEMALE_PORTRAITS = Array.from({ length: 100 }, (_, i) => `miw${i + 1}`);
// --- HELPER: SHUFFLE ---
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
// --- NEU: EINFACHER ZUFALLS-GENERATOR FÜR NEUES SPIEL ---
export const generateRandomPortraitSet = (gender, count = 25) => {
    const sourceList = gender === 'male' ? PLAYER_MALE_PORTRAITS : PLAYER_FEMALE_PORTRAITS;
    // Einfach mischen und die ersten X nehmen
    return shuffleArray([...sourceList]).slice(0, count);
};
// --- ALT: BALANCIERTER PORTRAIT GENERATOR ---
export const generateBalancedPortraitSet = (gender, count = 10) => {
    const sourceList = gender === 'male' ? PLAYER_MALE_PORTRAITS : PLAYER_FEMALE_PORTRAITS;
    // Gruppieren nach Hautfarbe (falls Daten vorhanden sind, sonst Fallback)
    const light = sourceList.filter(id => PORTRAIT_DATA[id]?.skin === 'light');
    const medium = sourceList.filter(id => PORTRAIT_DATA[id]?.skin === 'medium');
    const dark = sourceList.filter(id => PORTRAIT_DATA[id]?.skin === 'dark');
    // IDs ohne Metadaten (für die neuen 26-100, falls noch nicht in portraitData.ts)
    const unknown = sourceList.filter(id => !PORTRAIT_DATA[id]);
    const selectedIds = new Set();
    const finalIds = [];
    // Helper um zufällige items zu picken ohne Duplikate
    const pickUnique = (pool, amount) => {
        const shuffled = shuffleArray(pool);
        let picked = 0;
        for (const id of shuffled) {
            if (picked >= amount)
                break;
            if (!selectedIds.has(id)) {
                selectedIds.add(id);
                finalIds.push(id);
                picked++;
            }
        }
    };
    // Versuche Vielfalt zu garantieren (wenn Daten vorhanden)
    if (light.length > 0)
        pickUnique(light, 2);
    if (medium.length > 0)
        pickUnique(medium, 2);
    if (dark.length > 0)
        pickUnique(dark, 2);
    // Den Rest (bis count erreicht ist) zufällig aus dem verbleibenden Gesamtpool (inkl. unbekannte) auffüllen
    const remainingNeeded = count - finalIds.length;
    if (remainingNeeded > 0) {
        const remainingPool = sourceList.filter(id => !selectedIds.has(id));
        pickUnique(remainingPool, remainingNeeded);
    }
    // Das finale Ergebnis nochmal mischen
    return shuffleArray(finalIds);
};
// --- DNA / VERERBUNGS-SYSTEM ---
export const getGeneticChildPortrait = (parent1Id, parent2Id) => {
    // Hole Metadaten der Eltern
    const p1Meta = parent1Id ? PORTRAIT_DATA[parent1Id] : null;
    const p2Meta = parent2Id ? PORTRAIT_DATA[parent2Id] : null;
    // Wenn Eltern unbekannt (Adoption) oder keine Daten vorhanden, komplett zufällig
    if (!p1Meta && !p2Meta) {
        return BABY_PORTRAITS[Math.floor(Math.random() * BABY_PORTRAITS.length)];
    }
    // Fallback auf 'medium', falls ein Elternteil keine Daten hat
    const p1Skin = p1Meta?.skin || 'medium';
    const p2Skin = p2Meta?.skin || 'medium';
    // Logik für Hautfarben-Pool
    let allowedSkins = [];
    if (p1Skin === 'light' && p2Skin === 'light') {
        allowedSkins = ['light']; // Sehr hohe Wahrscheinlichkeit hell
    }
    else if (p1Skin === 'dark' && p2Skin === 'dark') {
        allowedSkins = ['dark']; // Sehr hohe Wahrscheinlichkeit dunkel
    }
    else if (p1Skin === 'medium' && p2Skin === 'medium') {
        allowedSkins = ['light', 'medium', 'dark']; // Alles möglich
    }
    else if ((p1Skin === 'light' && p2Skin === 'dark') || (p1Skin === 'dark' && p2Skin === 'light')) {
        allowedSkins = ['medium', 'light', 'dark']; // Mischung
    }
    else if ((p1Skin === 'light' && p2Skin === 'medium') || (p1Skin === 'medium' && p2Skin === 'light')) {
        allowedSkins = ['light', 'medium'];
    }
    else if ((p1Skin === 'dark' && p2Skin === 'medium') || (p1Skin === 'medium' && p2Skin === 'dark')) {
        allowedSkins = ['dark', 'medium'];
    }
    else {
        allowedSkins = ['medium'];
    }
    // Filtere Babys basierend auf erlaubten Hauttypen
    const validBabies = BABY_PORTRAITS.filter(id => {
        const meta = PORTRAIT_DATA[id];
        return meta && allowedSkins.includes(meta.skin);
    });
    // Fallback, falls Liste leer (sollte nicht passieren, wenn DB gepflegt)
    const pool = validBabies.length > 0 ? validBabies : BABY_PORTRAITS;
    return pool[Math.floor(Math.random() * pool.length)];
};
export const getNextStagePortrait = (currentPortraitId, targetStage) => {
    const currentMeta = PORTRAIT_DATA[currentPortraitId];
    if (!currentMeta) {
        // Fallback: Zufällig, wenn aktuelles Kind nicht in DB
        if (targetStage === 'toddler')
            return TODDLER_PORTRAITS[Math.floor(Math.random() * TODDLER_PORTRAITS.length)];
        return '';
    }
    const targetSkin = currentMeta.skin;
    let pool = [];
    if (targetStage === 'toddler') {
        pool = TODDLER_PORTRAITS.filter(id => {
            const meta = PORTRAIT_DATA[id];
            return meta && meta.skin === targetSkin;
        });
        // Fallback, wenn keine passenden Bilder für diesen Hauttyp gefunden
        if (pool.length === 0)
            pool = TODDLER_PORTRAITS;
    }
    return pool[Math.floor(Math.random() * pool.length)];
};
// NEU: Übergang von Kleinkind zu Kind (6 Jahre) -> Wählt m1-m150 / w1-w150
export const getChildToAdultPortrait = (currentPortraitId, gender) => {
    const currentMeta = PORTRAIT_DATA[currentPortraitId];
    const targetPool = gender === 'Junge' ? PLAYER_MALE_PORTRAITS : PLAYER_FEMALE_PORTRAITS;
    if (!currentMeta) {
        return targetPool[Math.floor(Math.random() * targetPool.length)];
    }
    const targetSkin = currentMeta.skin;
    // Suche nach Erwachsenen-Portraits mit dem gleichen Hautton
    // Hinweis: Funktioniert nur gut für die IDs, die in PORTRAIT_DATA definiert sind (1-25).
    // Für 26-150 (ohne Metadaten) wird hier nichts gefunden, daher der Fallback unten wichtig.
    const compatible = targetPool.filter(id => {
        const meta = PORTRAIT_DATA[id];
        return meta && meta.skin === targetSkin;
    });
    // Fallback auf den gesamten Pool
    const pool = compatible.length > 0 ? compatible : targetPool;
    return pool[Math.floor(Math.random() * pool.length)];
};
// Legacy Portraits für feste Mitarbeiter (bleiben unverändert)
export const talentPortraits = {
// Legacy Mapping not needed for new generator, kept empty to avoid type errors if referenced elsewhere
};
