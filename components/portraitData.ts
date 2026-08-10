
export type SkinTone = 'light' | 'medium' | 'dark';
export type HairColor = 'blonde' | 'brown' | 'black' | 'red' | 'grey' | 'white' | 'bald' | 'other';

export interface PortraitDefinition {
    id: string;
    gender: 'male' | 'female';
    skin: SkinTone;
    hair: HairColor;
    isChild?: boolean;
}

// --- MASTER PORTRAIT DATABASE ---
// ANLEITUNG FÜR DICH:
// Gehe diese Liste durch und passe 'skin' (Hautfarbe) und 'hair' (Haarfarbe) 
// an das tatsächliche Aussehen der PNG-Datei an.
// skin: 'light' (hell), 'medium' (mittel/asiatisch/latino), 'dark' (dunkel)
// hair: 'blonde', 'brown', 'black', 'red', 'grey', 'white', 'bald' (glatze)

export const PORTRAIT_DATA: Record<string, PortraitDefinition> = {
    // --- MÄNNLICHE SPIELER-PORTRAITS (Fixiert: m1 bis m25) ---
    'm1':  { id: 'm1',  gender: 'male', skin: 'dark', hair: 'black' },
    'm2':  { id: 'm2',  gender: 'male', skin: 'medium', hair: 'blonde' },
    'm3':  { id: 'm3',  gender: 'male', skin: 'light', hair: 'brown' },
    'm4':  { id: 'm4',  gender: 'male', skin: 'dark', hair: 'black' },
    'm5':  { id: 'm5',  gender: 'male', skin: 'light', hair: 'blonde' },
    'm6':  { id: 'm6',  gender: 'male', skin: 'medium', hair: 'black' },
    'm7':  { id: 'm7',  gender: 'male', skin: 'light', hair: 'blonde' },
    'm8':  { id: 'm8',  gender: 'male', skin: 'dark', hair: 'black' },
    'm9':  { id: 'm9',  gender: 'male', skin: 'medium', hair: 'black' },
    'm10': { id: 'm10', gender: 'male', skin: 'light', hair: 'blonde' },
    'm11': { id: 'm11', gender: 'male', skin: 'light', hair: 'black' },
    'm12': { id: 'm12', gender: 'male', skin: 'light', hair: 'black' },
    'm13': { id: 'm13', gender: 'male', skin: 'light', hair: 'brown' },
    'm14': { id: 'm14', gender: 'male', skin: 'light', hair: 'red' },
    'm15': { id: 'm15', gender: 'male', skin: 'medium', hair: 'black' },
    'm16': { id: 'm16', gender: 'male', skin: 'light', hair: 'black' },
    'm17': { id: 'm17', gender: 'male', skin: 'light', hair: 'brown' },
    'm18': { id: 'm18', gender: 'male', skin: 'medium', hair: 'black' },
    'm19': { id: 'm19', gender: 'male', skin: 'dark', hair: 'black' },
    'm20': { id: 'm20', gender: 'male', skin: 'light', hair: 'brown' },
    'm21': { id: 'm21', gender: 'male', skin: 'light', hair: 'black' },
    'm22': { id: 'm22', gender: 'male', skin: 'medium', hair: 'black' },
    'm23': { id: 'm23', gender: 'male', skin: 'medium', hair: 'black' },
    'm24': { id: 'm24', gender: 'male', skin: 'medium', hair: 'black' },
    'm25': { id: 'm25', gender: 'male', skin: 'dark', hair: 'black' },

    // --- WEIBLICHE SPIELER-PORTRAITS (Fixiert: w1 bis w25) ---
    'w1':  { id: 'w1',  gender: 'female', skin: 'light', hair: 'black' },
    'w2':  { id: 'w2',  gender: 'female', skin: 'light', hair: 'red' },
    'w3':  { id: 'w3',  gender: 'female', skin: 'light', hair: 'black' },
    'w4':  { id: 'w4',  gender: 'female', skin: 'light', hair: 'black' },
    'w5':  { id: 'w5',  gender: 'female', skin: 'light', hair: 'brown' },
    'w6':  { id: 'w6',  gender: 'female', skin: 'light', hair: 'red' },
    'w7':  { id: 'w7',  gender: 'female', skin: 'light', hair: 'blonde' },
    'w8':  { id: 'w8',  gender: 'female', skin: 'light', hair: 'red' },
    'w9':  { id: 'w9',  gender: 'female', skin: 'light', hair: 'brown' },
    'w10': { id: 'w10', gender: 'female', skin: 'light', hair: 'brown' },
    'w11': { id: 'w11', gender: 'female', skin: 'dark', hair: 'black' },
    'w12': { id: 'w12', gender: 'female', skin: 'dark', hair: 'black' },
    'w13': { id: 'w13', gender: 'female', skin: 'light', hair: 'blonde' },
    'w14': { id: 'w14', gender: 'female', skin: 'medium', hair: 'black' },
    'w15': { id: 'w15', gender: 'female', skin: 'dark', hair: 'black' },
    'w16': { id: 'w16', gender: 'female', skin: 'medium', hair: 'black' },
    'w17': { id: 'w17', gender: 'female', skin: 'light', hair: 'brown' },
    'w18': { id: 'w18', gender: 'female', skin: 'light', hair: 'brown' },
    'w19': { id: 'w19', gender: 'female', skin: 'light', hair: 'black' },
    'w20': { id: 'w20', gender: 'female', skin: 'medium', hair: 'brown' },
    'w21': { id: 'w21', gender: 'female', skin: 'light', hair: 'blonde' },
    'w22': { id: 'w22', gender: 'female', skin: 'light', hair: 'blonde' },
    'w23': { id: 'w23', gender: 'female', skin: 'dark', hair: 'black' },
    'w24': { id: 'w24', gender: 'female', skin: 'light', hair: 'brown' },
    'w25': { id: 'w25', gender: 'female', skin: 'light', hair: 'red' },

    // --- BABYS (b1 - b20) ---
    // Dateinamen: b1.png, b2.png, ...
    'b1':  { id: 'b1',  gender: 'male', skin: 'light',  hair: 'brown', isChild: true },
    'b2':  { id: 'b2',  gender: 'male', skin: 'light',  hair: 'brown',  isChild: true },
    'b3':  { id: 'b3',  gender: 'male', skin: 'medium',  hair: 'brown',    isChild: true },
    'b4':  { id: 'b4',  gender: 'male', skin: 'light', hair: 'brown',  isChild: true },
    'b5':  { id: 'b5',  gender: 'male', skin: 'dark', hair: 'black',  isChild: true },
    'b6':  { id: 'b6',  gender: 'male', skin: 'dark', hair: 'black',  isChild: true },
    'b7':  { id: 'b7',  gender: 'male', skin: 'dark', hair: 'black',  isChild: true },
    'b8':  { id: 'b8',  gender: 'male', skin: 'dark',   hair: 'black',  isChild: true },
    'b9':  { id: 'b9',  gender: 'male', skin: 'medium',   hair: 'black',  isChild: true },
    'b10': { id: 'b10', gender: 'male', skin: 'medium',   hair: 'black',  isChild: true },
    'b11': { id: 'b11', gender: 'male', skin: 'light',   hair: 'blonde',  isChild: true },
    'b12': { id: 'b12', gender: 'male', skin: 'light',   hair: 'blonde',  isChild: true },
    'b13': { id: 'b13', gender: 'male', skin: 'light',   hair: 'blonde',  isChild: true },
    'b14': { id: 'b14', gender: 'female', skin: 'light',  hair: 'brown', isChild: true },
    'b15': { id: 'b15', gender: 'female', skin: 'light',  hair: 'brown',  isChild: true },
    'b16': { id: 'b16', gender: 'female', skin: 'medium',  hair: 'brown',    isChild: true },
    'b17': { id: 'b17', gender: 'female', skin: 'light', hair: 'brown',  isChild: true },
    'b18': { id: 'b18', gender: 'female', skin: 'dark', hair: 'black',  isChild: true },
    'b19': { id: 'b19', gender: 'female', skin: 'dark', hair: 'black',  isChild: true },
    'b20': { id: 'b20', gender: 'female', skin: 'dark', hair: 'black',  isChild: true },
    'b21': { id: 'b21', gender: 'female', skin: 'dark',   hair: 'black',  isChild: true },
    'b22': { id: 'b22', gender: 'female', skin: 'medium',   hair: 'black',  isChild: true },
    'b23': { id: 'b23', gender: 'female', skin: 'medium',   hair: 'black',  isChild: true },
    'b24': { id: 'b24', gender: 'female', skin: 'light',   hair: 'blonde',  isChild: true },
    'b25': { id: 'b25', gender: 'female', skin: 'light',   hair: 'blonde',  isChild: true },
    'b26': { id: 'b26', gender: 'female', skin: 'light',   hair: 'blonde',  isChild: true },  


    // --- KLEINKINDER / 1 JAHR (1j1 - 1j20) ---
    // Dateinamen: 1j1.png, 1j2.png, ...
    '1j1':  { id: '1j1',  gender: 'male', skin: 'light',  hair: 'blonde', isChild: true },
    '1j2':  { id: '1j2',  gender: 'female', skin: 'light',  hair: 'blonde',  isChild: true },
    '1j3':  { id: '1j3',  gender: 'male', skin: 'light',  hair: 'blonde',    isChild: true },
    '1j4':  { id: '1j4',  gender: 'female', skin: 'light', hair: 'blonde',  isChild: true },
    '1j5':  { id: '1j5',  gender: 'male', skin: 'dark', hair: 'black',  isChild: true },
    '1j6':  { id: '1j6',  gender: 'female', skin: 'dark', hair: 'black',  isChild: true },
    '1j7':  { id: '1j7',  gender: 'male', skin: 'dark', hair: 'black',  isChild: true },
    '1j8':  { id: '1j8',  gender: 'male', skin: 'medium',   hair: 'black',  isChild: true },
    '1j9':  { id: '1j9',  gender: 'male', skin: 'medium',   hair: 'black',  isChild: true },
    '1j10': { id: '1j10', gender: 'female', skin: 'medium',   hair: 'black',  isChild: true },
    '1j11': { id: '1j11',  gender: 'female', skin: 'light',   hair: 'brown',  isChild: true },
    '1j12': { id: '1j12',  gender: 'female', skin: 'light',   hair: 'brown',  isChild: true },
    '1j13': { id: '1j13', gender: 'female', skin: 'light',   hair: 'black',  isChild: true },
 
};
