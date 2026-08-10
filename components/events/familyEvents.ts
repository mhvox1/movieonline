
import { PlayerData, RandomEvent, MaritalStatus } from '../../types';
import { personalNoteImage } from './eventHelpers';

// Helper to calculate portrait URL based on age for private contacts
const getPrivatePortraitUrl = (baseId: string | undefined | null, birthDate: Date | undefined, gameDate: Date): string => {
    if (!baseId) return '';
    
    // Support for custom uploaded images (Base64 Data URLs)
    if (baseId.startsWith('data:image')) {
        return baseId;
    }

    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    // Special logic for baby/toddler IDs
    if (baseId.startsWith('b') && !baseId.startsWith('baby_')) { 
        return `./kinder/babys/${baseId}.png`;
    }
    if (baseId.startsWith('1j')) {
        return `./kinder/1jahr/${baseId}.png`;
    }

    let ageSuffix: 'k' | 'j' | 'm' | 'a';
    if (age <= 15) {
        ageSuffix = 'k';
    } else if (age >= 16 && age <= 34) {
        ageSuffix = 'j';
    } else if (age >= 35 && age <= 59) {
        ageSuffix = 'm';
    } else { // age >= 60
        ageSuffix = 'a';
    }
    
    return `./portrait/${baseId}${ageSuffix}.png`;
};

// Helper to apply private transactions and stat changes
const applyPrivateEffect = (
    data: PlayerData, 
    capitalChange: number, 
    energyChange: number, 
    relationshipChange: number,
    targetType: 'partner' | 'child' | 'none'
): { updatedPlayerData: PlayerData, customVariables: Record<string, any> } => {
    const newData = { ...data };
    
    // Capital Logic: Allow negative private capital
    // We apply the full change regardless of current balance.
    newData.privateCapital += capitalChange;
    
    // Energy
    newData.energy = Math.max(0, Math.min(100, (newData.energy || 100) + energyChange));
    
    let portraitUrl = '';

    // Relationship & Portrait Logic
    if (targetType === 'partner' && newData.maritalStatus !== MaritalStatus.Single) {
        if (newData.maritalStatus === MaritalStatus.Acquaintance) {
            newData.datingProgress = Math.max(0, Math.min(100, (newData.datingProgress || 0) + relationshipChange));
        } else {
            newData.relationshipStatus = Math.max(0, Math.min(100, newData.relationshipStatus + relationshipChange));
        }
        
        // Get Partner Portrait
        if (newData.partnerPortraitId && newData.partnerBirthDate) {
            portraitUrl = getPrivatePortraitUrl(newData.partnerPortraitId, newData.partnerBirthDate, newData.gameDate);
        }
    } else if (targetType === 'child' && newData.children.length > 0) {
        // Pick a random child to represent this event
        const randomChild = newData.children[Math.floor(Math.random() * newData.children.length)];
        if (randomChild.portraitId && randomChild.birthDate) {
            portraitUrl = getPrivatePortraitUrl(randomChild.portraitId, randomChild.birthDate, newData.gameDate);
        }
    }
    
    return { 
        updatedPlayerData: newData,
        customVariables: {
            privateCapitalChange: capitalChange,
            energyChange: energyChange,
            relationshipChange: targetType === 'partner' ? relationshipChange : 0,
            portraitUrl: portraitUrl // Pass the portrait URL to the event system
        }
    };
};

export const FAMILY_EVENTS: RandomEvent[] = [
    // --- SINGLE EVENTS (1-10) ---
    {
        id: 'fam_s_01', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -150, 10, 0, 'none'), // Treat yourself
    },
    {
        id: 'fam_s_02', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -5, 0, 'none'), // Lonely
    },
    {
        id: 'fam_s_03', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -500, 15, 0, 'none'), // Hobby
    },
    {
        id: 'fam_s_04', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -100, 10, 0, 'none'), // Friends
    },
    {
        id: 'fam_s_05', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 200, -10, 0, 'none'), // Overtime
    },
    {
        id: 'fam_s_06', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -1000, 15, 0, 'none'), // Renovation
    },
    {
        id: 'fam_s_07', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -20, 0, 'none'), // Flu
    },
    {
        id: 'fam_s_08', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -100, -5, 0, 'none'), // Bad Date
    },
    {
        id: 'fam_s_09', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -800, 25, 0, 'none'), // Wellness Trip
    },
    {
        id: 'fam_s_10', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -20, 5, 0, 'none'), // Good Book
    },

    // --- ACQUAINTANCE EVENTS (1-10) ---
    {
        id: 'fam_a_01', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 0, -5, 'partner'), // SMS Misunderstanding
    },
    {
        id: 'fam_a_02', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 5, 5, 'partner'), // Good Call
    },
    {
        id: 'fam_a_03', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -50, 0, 8, 'partner'), // Gift
    },
    {
        id: 'fam_a_04', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -5, -3, 'partner'), // Cancelled Date
    },
    {
        id: 'fam_a_05', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -20, 5, 4, 'partner'), // Coffee
    },
    {
        id: 'fam_a_06', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -50, 5, 5, 'partner'), // Cinema
    },
    {
        id: 'fam_a_07', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -5, -5, 'partner'), // Ghosting Scare
    },
    {
        id: 'fam_a_08', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 0, 10, 'partner'), // Deep Talk
    },
    {
        id: 'fam_a_09', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 0, -5, 'partner'), // Awkward
    },
    {
        id: 'fam_a_10', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -100, 0, 10, 'partner'), // Bought Gift
    },

    // --- RELATIONSHIP EVENTS (Dating/Engaged) (1-10) ---
    {
        id: 'fam_r_01', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -150, 5, 8, 'partner'), // Dinner
    },
    {
        id: 'fam_r_02', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -10, -5, 'partner'), // Argument
    },
    {
        id: 'fam_r_03', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 10, 2, 'partner'), // Support
    },
    {
        id: 'fam_r_04', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -400, 20, 10, 'partner'), // Trip
    },
    {
        id: 'fam_r_05', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -10, -15, 'partner'), // Forgotten Anniversary
    },
    {
        id: 'fam_r_06', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -50, -10, 10, 'partner'), // Meet Parents
    },
    {
        id: 'fam_r_07', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -100, 0, 5, 'partner'), // Moving In Talk
    },
    {
        id: 'fam_r_08', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -10, -10, 'partner'), // Jealousy
    },
    {
        id: 'fam_r_09', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -300, 5, 15, 'partner'), // Concert
    },
    {
        id: 'fam_r_10', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -60, 0, 5, 'partner'), // Cooking Fail
    },

    // --- MARRIED EVENTS (1-10) ---
    {
        id: 'fam_m_01', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -500, 10, 20, 'partner'), // Wedding Anniversary
    },
    {
        id: 'fam_m_02', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 0, -2, 'partner'), // Routine
    },
    {
        id: 'fam_m_03', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 10, 5, 'partner'), // Favorite Meal
    },
    {
        id: 'fam_m_04', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -300, -5, 0, 'partner'), // Repairs
    },
    {
        id: 'fam_m_05', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -15, 0, 'partner'), // In-laws
    },
    {
        id: 'fam_m_06', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -2000, 20, 25, 'partner'), // 2nd Honeymoon
    },
    {
        id: 'fam_m_07', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -5, -10, 'partner'), // Finance Fight
    },
    {
        id: 'fam_m_08', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -150, 0, 10, 'partner'), // Partner Promotion
    },
    {
        id: 'fam_m_09', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -1500, 0, 5, 'partner'), // New Furniture
    },
    {
        id: 'fam_m_10', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -30, 5, 0, 'partner'), // Wine Evening
    },

    // --- CHILD EVENTS (1-10) ---
    {
        id: 'fam_c_01', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -100, 0, 0, 'child'), // School Trip
    },
    {
        id: 'fam_c_02', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -50, -10, 0, 'child'), // Sick Child
    },
    {
        id: 'fam_c_03', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 10, 0, 'child'), // Proud Moment
    },
    {
        id: 'fam_c_04', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -15, 0, 'child'), // Tantrum
    },
    {
        id: 'fam_c_05', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 5, 0, 'child'), // Drawing
    },
    {
        id: 'fam_c_06', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -250, -5, 0, 'child'), // Broken Window
    },
    {
        id: 'fam_c_07', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -5, 0, 'child'), // School Play
    },
    {
        id: 'fam_c_08', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, -400, -15, 0, 'child'), // Birthday Party
    },
    {
        id: 'fam_c_09', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, -15, 0, 'child'), // Nightmare
    },
    {
        id: 'fam_c_10', category: 'Family', 
        title: 'Family Event', text: '...',
        imageUrl: personalNoteImage,
        effect: (data) => applyPrivateEffect(data, 0, 5, 0, 'child'), // Helping Hand
    },
];
