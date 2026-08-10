
import { Director, Genre, TalentTrait } from '../types';

// Hilfsfunktion zur Bestimmung der Ethnie basierend auf Hautfarbe und Haarfarbe
const determineEthnicity = (skin: 'light' | 'medium' | 'dark', hair: 'blonde' | 'brown' | 'black' | 'red' | 'grey' | 'white' | 'bald' | 'other'): string => {
    if (hair === 'blonde' && skin === 'light') return 'Northern European';
    if (skin === 'light' && ['brown', 'black'].includes(hair)) return 'European';
    if (skin === 'light' && hair === 'red') return 'Celtic';
    if (skin === 'medium' && ['black', 'brown'].includes(hair)) return 'Mediterranean / Latino';
    if (skin === 'dark' && hair === 'black') return 'African / Caribbean';
    if (skin === 'medium' && hair === 'blonde') return 'Mixed / Northern European';
    return 'Mixed';
};

// Portrait-Daten Mapping für Regisseure (Hautfarbe, Haarfarbe)
const portraitDataMap: Record<string, { skin: 'light' | 'medium' | 'dark', hair: 'blonde' | 'brown' | 'black' | 'red' | 'grey' | 'white' | 'bald' | 'other' }> = {
    'm101': { skin: 'dark', hair: 'black' }, 'm102': { skin: 'light', hair: 'grey' }, 'm103': { skin: 'medium', hair: 'black' },
    'm104': { skin: 'light', hair: 'brown' }, 'm105': { skin: 'dark', hair: 'black' }, 'm106': { skin: 'light', hair: 'blonde' },
    'm107': { skin: 'medium', hair: 'brown' }, 'm108': { skin: 'light', hair: 'black' }, 'm109': { skin: 'dark', hair: 'black' },
    'm110': { skin: 'light', hair: 'red' }, 'm111': { skin: 'medium', hair: 'blonde' }, 'm112': { skin: 'light', hair: 'brown' },
    'm113': { skin: 'light', hair: 'black' }, 'm114': { skin: 'dark', hair: 'black' }, 'm115': { skin: 'light', hair: 'red' },
    'm116': { skin: 'medium', hair: 'black' }, 'm117': { skin: 'light', hair: 'grey' }, 'm118': { skin: 'light', hair: 'brown' },
    'm119': { skin: 'dark', hair: 'grey' }, 'm120': { skin: 'medium', hair: 'white' }, 'm121': { skin: 'light', hair: 'blonde' },
    'm122': { skin: 'medium', hair: 'brown' }, 'm123': { skin: 'light', hair: 'black' }, 'm124': { skin: 'dark', hair: 'black' },
    'm125': { skin: 'light', hair: 'brown' }, 'm126': { skin: 'light', hair: 'red' }, 'm127': { skin: 'medium', hair: 'black' },
    'm128': { skin: 'light', hair: 'blonde' }, 'm129': { skin: 'dark', hair: 'black' }, 'm130': { skin: 'light', hair: 'brown' },
    'm131': { skin: 'light', hair: 'black' }, 'm132': { skin: 'medium', hair: 'brown' }, 'm133': { skin: 'light', hair: 'red' },
    'm134': { skin: 'dark', hair: 'black' }, 'm135': { skin: 'light', hair: 'blonde' }, 'm136': { skin: 'medium', hair: 'grey' },
    'm137': { skin: 'light', hair: 'white' }, 'm138': { skin: 'light', hair: 'brown' }, 'm139': { skin: 'medium', hair: 'black' },
    'm140': { skin: 'dark', hair: 'black' }, 'm141': { skin: 'light', hair: 'grey' }, 'm142': { skin: 'light', hair: 'red' },
    'm143': { skin: 'medium', hair: 'brown' }, 'm144': { skin: 'light', hair: 'blonde' }, 'm145': { skin: 'light', hair: 'black' },
    'm146': { skin: 'dark', hair: 'black' }, 'm147': { skin: 'light', hair: 'brown' }, 'm148': { skin: 'medium', hair: 'red' },
    'm149': { skin: 'light', hair: 'black' }, 'm150': { skin: 'light', hair: 'brown' },
    'w101': { skin: 'light', hair: 'black' }, 'w102': { skin: 'medium', hair: 'brown' }, 'w103': { skin: 'light', hair: 'red' },
    'w104': { skin: 'dark', hair: 'black' }, 'w105': { skin: 'light', hair: 'blonde' }, 'w106': { skin: 'light', hair: 'black' },
    'w107': { skin: 'light', hair: 'brown' }, 'w108': { skin: 'medium', hair: 'grey' }, 'w109': { skin: 'light', hair: 'red' },
    'w110': { skin: 'dark', hair: 'black' }, 'w111': { skin: 'light', hair: 'blonde' }, 'w112': { skin: 'medium', hair: 'brown' },
    'w113': { skin: 'light', hair: 'black' }, 'w114': { skin: 'light', hair: 'red' }, 'w115': { skin: 'dark', hair: 'black' },
    'w116': { skin: 'light', hair: 'blonde' }, 'w117': { skin: 'medium', hair: 'brown' }, 'w118': { skin: 'light', hair: 'black' },
    'w119': { skin: 'light', hair: 'red' }, 'w120': { skin: 'light', hair: 'brown' }, 'w121': { skin: 'medium', hair: 'blonde' },
    'w122': { skin: 'light', hair: 'black' }, 'w123': { skin: 'dark', hair: 'black' }, 'w124': { skin: 'light', hair: 'brown' },
    'w125': { skin: 'light', hair: 'red' }, 'w126': { skin: 'medium', hair: 'black' }, 'w127': { skin: 'light', hair: 'blonde' },
    'w128': { skin: 'light', hair: 'grey' }, 'w129': { skin: 'dark', hair: 'black' }, 'w130': { skin: 'light', hair: 'brown' },
    'w131': { skin: 'light', hair: 'black' }, 'w132': { skin: 'medium', hair: 'red' }, 'w133': { skin: 'light', hair: 'blonde' },
    'w134': { skin: 'dark', hair: 'black' }, 'w135': { skin: 'light', hair: 'brown' }, 'w136': { skin: 'light', hair: 'red' },
    'w137': { skin: 'medium', hair: 'black' }, 'w138': { skin: 'light', hair: 'blonde' }, 'w139': { skin: 'light', hair: 'grey' },
    'w140': { skin: 'dark', hair: 'black' }, 'w141': { skin: 'light', hair: 'white' }, 'w142': { skin: 'light', hair: 'brown' },
    'w143': { skin: 'medium', hair: 'black' }, 'w144': { skin: 'light', hair: 'red' }, 'w145': { skin: 'light', hair: 'blonde' },
    'w146': { skin: 'dark', hair: 'black' }, 'w147': { skin: 'light', hair: 'brown' }, 'w148': { skin: 'light', hair: 'black' },
    'w149': { skin: 'medium', hair: 'red' }, 'w150': { skin: 'light', hair: 'blonde' },
};

// Definition der festen Start-Regisseure
// birthMonth: 1 = Januar, 12 = Dezember
const DIRECTOR_DEFINITIONS = [
    // =================================================================
    // 1. HIGH TIER (Skill 75-100) - 10 Total (5 Male, 5 Female)
    // =================================================================
    
    // Male (5) - Portraits m101-m105
    { name: "Archer Caldwell", gender: 'männlich', age: 44, birthDay: 18, birthMonth: 12, skill: 98, potential: 100, bekanntheit: 0, speed: 0.9, fav: [Genre.Adventure, Genre.SciFi], hate: Genre.Romance, trait: TalentTrait.Publikumsliebling, portrait: "m101" },
    { name: "Beckett Roth", gender: 'männlich', age: 58, birthDay: 17, birthMonth: 11, skill: 96, potential: 96, bekanntheit: 0, speed: 1.0, fav: [Genre.Crime, Genre.Drama], hate: Genre.Fantasy, trait: TalentTrait.Perfektionist, portrait: "m102" },
    { name: "Callahan Doyle", gender: 'männlich', age: 46, birthDay: 16, birthMonth: 8, skill: 95, potential: 100, bekanntheit: 0, speed: 0.8, fav: [Genre.SciFi, Genre.Action], hate: Genre.Comedy, trait: TalentTrait.Diva, portrait: "m103" },
    { name: "Donovan Steele", gender: 'männlich', age: 37, birthDay: 27, birthMonth: 3, skill: 92, potential: 98, bekanntheit: 0, speed: 0.9, fav: [Genre.Crime, Genre.Action], hate: Genre.Musical, trait: TalentTrait.Perfektionist, portrait: "m104" },
    { name: "Everett Chambers", gender: 'männlich', age: 63, birthDay: 30, birthMonth: 11, skill: 91, potential: 91, bekanntheit: 0, speed: 1.1, fav: [Genre.SciFi, Genre.Thriller], hate: Genre.Musical, trait: TalentTrait.Arbeitstier, portrait: "m105" },

    // Female (5) - Portraits w101-w105
    { name: "Arabella Shore", gender: 'weiblich', age: 49, birthDay: 27, birthMonth: 11, skill: 93, potential: 95, bekanntheit: 0, speed: 1.0, fav: [Genre.Action, Genre.Thriller], hate: Genre.Comedy, trait: TalentTrait.Arbeitstier, portrait: "w101" },
    { name: "Blythe Dalloway", gender: 'weiblich', age: 46, birthDay: 30, birthMonth: 4, skill: 88, potential: 90, bekanntheit: 0, speed: 1.2, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: TalentTrait.Diva, portrait: "w102" },
    { name: "Cordelia Vern", gender: 'weiblich', age: 39, birthDay: 24, birthMonth: 7, skill: 85, potential: 90, bekanntheit: 0, speed: 0.95, fav: [Genre.Crime, Genre.Drama], hate: Genre.Musical, trait: TalentTrait.Perfektionist, portrait: "w103" },
    { name: "Delaney Potts", gender: 'weiblich', age: 29, birthDay: 14, birthMonth: 5, skill: 82, potential: 92, bekanntheit: 0, speed: 1.1, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: TalentTrait.UnentdecktesJuwel, portrait: "w104" },
    { name: "Emmeline Joyce", gender: 'weiblich', age: 59, birthDay: 19, birthMonth: 5, skill: 81, potential: 81, bekanntheit: 0, speed: 1.0, fav: [Genre.Romance, Genre.Comedy], hate: Genre.Action, trait: TalentTrait.Publikumsliebling, portrait: "w105" },


    // =================================================================
    // 2. MID TIER (Skill 41-74) - 30 Total (15 Male, 15 Female)
    // =================================================================

    // Male (15) - Portraits m106-m120
    { name: "Finnegan Howe", gender: 'männlich', age: 56, birthDay: 14, birthMonth: 5, skill: 74, potential: 90, bekanntheit: 0, speed: 1.0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Drama, trait: TalentTrait.Sparfuchs, portrait: "m106" },
    { name: "Griffin Yeager", gender: 'männlich', age: 30, birthDay: 30, birthMonth: 7, skill: 72, potential: 99, bekanntheit: 0, speed: 1.0, fav: [Genre.Thriller, Genre.SciFi], hate: Genre.Comedy, trait: TalentTrait.Arbeitstier, portrait: "m107" },
    { name: "Hayes Warner", gender: 'männlich', age: 39, birthDay: 31, birthMonth: 10, skill: 70, potential: 95, bekanntheit: 0, speed: 1.0, fav: [Genre.Fantasy, Genre.Horror], hate: Genre.Romance, trait: null, portrait: "m108" },
    { name: "Irving Bishop", gender: 'männlich', age: 42, birthDay: 25, birthMonth: 8, skill: 68, potential: 88, bekanntheit: 0, speed: 1.0, fav: [Genre.Fantasy, Genre.Horror], hate: Genre.War, trait: null, portrait: "m109" },
    { name: "Jameson Stack", gender: 'männlich', age: 35, birthDay: 17, birthMonth: 2, skill: 66, potential: 85, bekanntheit: 0, speed: 0.8, fav: [Genre.Action, Genre.SciFi], hate: Genre.Drama, trait: TalentTrait.Publikumsliebling, portrait: "m110" },
    { name: "Knox Waverly", gender: 'männlich', age: 45, birthDay: 10, birthMonth: 11, skill: 64, potential: 80, bekanntheit: 0, speed: 0.85, fav: [Genre.SciFi, Genre.Action], hate: Genre.Dokumentation, trait: null, portrait: "m111" },
    { name: "Langston Hyde", gender: 'männlich', age: 30, birthDay: 6, birthMonth: 8, skill: 62, potential: 90, bekanntheit: 0, speed: 1.1, fav: [Genre.Thriller, Genre.Horror], hate: Genre.Musical, trait: TalentTrait.Unzuverlässig, portrait: "m112" },
    { name: "Maddox Cain", gender: 'männlich', age: 31, birthDay: 1, birthMonth: 5, skill: 60, potential: 88, bekanntheit: 0, speed: 1.3, fav: [Genre.Fantasy, Genre.Comedy], hate: Genre.Action, trait: TalentTrait.Perfektionist, portrait: "m113" },
    { name: "Nash Bridger", gender: 'männlich', age: 32, birthDay: 10, birthMonth: 9, skill: 58, potential: 85, bekanntheit: 0, speed: 0.9, fav: [Genre.Crime, Genre.Action], hate: Genre.Romance, trait: null, portrait: "m114" },
    { name: "Orion Slade", gender: 'männlich', age: 52, birthDay: 16, birthMonth: 1, skill: 56, potential: 75, bekanntheit: 0, speed: 1.0, fav: [Genre.Horror, Genre.SciFi], hate: Genre.Musical, trait: null, portrait: "m115" },
    { name: "Paxton Reeves", gender: 'männlich', age: 57, birthDay: 15, birthMonth: 3, skill: 54, potential: 78, bekanntheit: 0, speed: 1.1, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "m116" },
    { name: "Remington Clay", gender: 'männlich', age: 60, birthDay: 22, birthMonth: 11, skill: 52, potential: 76, bekanntheit: 0, speed: 1.4, fav: [Genre.Fantasy, Genre.Comedy], hate: Genre.War, trait: TalentTrait.Unzuverlässig, portrait: "m117" },
    { name: "Sullivan Pierce", gender: 'männlich', age: 43, birthDay: 20, birthMonth: 3, skill: 50, potential: 85, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Crime], hate: Genre.Fantasy, trait: TalentTrait.Perfektionist, portrait: "m118" },
    { name: "Thatcher Ellis", gender: 'männlich', age: 65, birthDay: 1, birthMonth: 12, skill: 48, potential: 85, bekanntheit: 0, speed: 0.9, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Action, trait: TalentTrait.Diva, portrait: "m119" },
    { name: "Vaughn Gentry", gender: 'männlich', age: 70, birthDay: 31, birthMonth: 5, skill: 45, potential: 88, bekanntheit: 0, speed: 0.8, fav: [Genre.Western, Genre.Drama], hate: Genre.SciFi, trait: TalentTrait.Arbeitstier, portrait: "m120" },

    // Female (15) - Portraits w106-w120
    { name: "Francesca Voss", gender: 'weiblich', age: 38, birthDay: 24, birthMonth: 8, skill: 74, potential: 88, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Dokumentation], hate: Genre.SciFi, trait: null, portrait: "w106" },
    { name: "Giselle Baines", gender: 'weiblich', age: 51, birthDay: 8, birthMonth: 12, skill: 72, potential: 80, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: TalentTrait.Publikumsliebling, portrait: "w107" },
    { name: "Hadley Spence", gender: 'weiblich', age: 57, birthDay: 15, birthMonth: 10, skill: 70, potential: 78, bekanntheit: 0, speed: 0.9, fav: [Genre.Comedy, Genre.Drama], hate: Genre.SciFi, trait: TalentTrait.Teamplayer, portrait: "w108" },
    { name: "India Summer", gender: 'weiblich', age: 28, birthDay: 31, birthMonth: 3, skill: 68, potential: 92, bekanntheit: 0, speed: 1.1, fav: [Genre.Drama, Genre.Western], hate: Genre.SciFi, trait: TalentTrait.UnentdecktesJuwel, portrait: "w109" },
    { name: "Juniper Styles", gender: 'weiblich', age: 43, birthDay: 15, birthMonth: 10, skill: 65, potential: 80, bekanntheit: 0, speed: 1.1, fav: [Genre.Drama, Genre.Dokumentation], hate: Genre.Horror, trait: null, portrait: "w110" },
    { name: "Kennedy Rice", gender: 'weiblich', age: 72, birthDay: 14, birthMonth: 8, skill: 62, potential: 77, bekanntheit: 0, speed: 1.2, fav: [Genre.Drama, Genre.Comedy], hate: Genre.Action, trait: TalentTrait.Diva, portrait: "w111" },
    { name: "Leona Larks", gender: 'weiblich', age: 72, birthDay: 30, birthMonth: 5, skill: 60, potential: 81, bekanntheit: 0, speed: 1.3, fav: [Genre.Drama, Genre.Dokumentation], hate: Genre.SciFi, trait: null, portrait: "w112" },
    { name: "Magnolia Prentiss", gender: 'weiblich', age: 54, birthDay: 21, birthMonth: 4, skill: 58, potential: 78, bekanntheit: 0, speed: 1.1, fav: [Genre.Drama, Genre.Thriller], hate: Genre.Comedy, trait: TalentTrait.Perfektionist, portrait: "w113" },
    { name: "Naomi Wells", gender: 'weiblich', age: 27, birthDay: 4, birthMonth: 8, skill: 55, potential: 90, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Comedy], hate: Genre.Horror, trait: TalentTrait.Teamplayer, portrait: "w114" },
    { name: "Octavia Blaine", gender: 'weiblich', age: 36, birthDay: 5, birthMonth: 6, skill: 52, potential: 75, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "w115" },
    { name: "Pippa Mallow", gender: 'weiblich', age: 32, birthDay: 21, birthMonth: 3, skill: 50, potential: 80, bekanntheit: 0, speed: 1.0, fav: [Genre.Thriller, Genre.Horror], hate: Genre.Musical, trait: null, portrait: "w116" },
    { name: "Ramona Falls", gender: 'weiblich', age: 33, birthDay: 8, birthMonth: 9, skill: 48, potential: 78, bekanntheit: 0, speed: 1.1, fav: [Genre.Drama, Genre.Crime], hate: Genre.Comedy, trait: null, portrait: "w117" },
    { name: "Serenity Holmes", gender: 'weiblich', age: 35, birthDay: 21, birthMonth: 10, skill: 46, potential: 75, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Fantasy], hate: Genre.War, trait: null, portrait: "w118" },
    { name: "Tallulah Brand", gender: 'weiblich', age: 46, birthDay: 7, birthMonth: 5, skill: 44, potential: 70, bekanntheit: 0, speed: 0.9, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Thriller, trait: TalentTrait.Teamplayer, portrait: "w119" },
    { name: "Ursula Key", gender: 'weiblich', age: 21, birthDay: 8, birthMonth: 1, skill: 42, potential: 85, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: TalentTrait.UnentdecktesJuwel, portrait: "w120" },

    // =================================================================
    // 3. LOW TIER (Skill 8-40) - 60 Total (30 Male, 30 Female)
    // =================================================================

    // Male (30) - Portraits m121-m150
    { name: "Wilder Penn", gender: 'männlich', age: 22, birthDay: 1, birthMonth: 1, skill: 40, potential: 60, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Drama, trait: null, portrait: "m121" },
    { name: "Aaron Mills", gender: 'männlich', age: 24, birthDay: 5, birthMonth: 3, skill: 38, potential: 55, bekanntheit: 0, speed: 0.9, fav: [Genre.Action, Genre.War], hate: Genre.Romance, trait: null, portrait: "m122" },
    { name: "Brandon Kerr", gender: 'männlich', age: 26, birthDay: 12, birthMonth: 6, skill: 36, potential: 50, bekanntheit: 0, speed: 1.0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Musical, trait: null, portrait: "m123" },
    { name: "Caleb Joyner", gender: 'männlich', age: 28, birthDay: 20, birthMonth: 9, skill: 35, potential: 55, bekanntheit: 0, speed: 1.1, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "m124" },
    { name: "David Skinner", gender: 'männlich', age: 30, birthDay: 15, birthMonth: 11, skill: 33, potential: 45, bekanntheit: 0, speed: 1.0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Comedy, trait: TalentTrait.Unzuverlässig, portrait: "m125" },
    { name: "Elijah Watts", gender: 'männlich', age: 32, birthDay: 8, birthMonth: 2, skill: 32, potential: 40, bekanntheit: 0, speed: 1.0, fav: [Genre.Western, Genre.Adventure], hate: Genre.SciFi, trait: null, portrait: "m126" },
    { name: "Axl Roane", gender: 'männlich', age: 35, birthDay: 30, birthMonth: 4, skill: 30, potential: 40, bekanntheit: 0, speed: 0.9, fav: [Genre.Romance, Genre.Musical], hate: Genre.Action, trait: null, portrait: "m127" },
    { name: "Blaze Winters", gender: 'männlich', age: 40, birthDay: 14, birthMonth: 7, skill: 29, potential: 35, bekanntheit: 0, speed: 1.0, fav: [Genre.Dokumentation, Genre.Drama], hate: Genre.Fantasy, trait: null, portrait: "m128" },
    { name: "Cruz Maddox", gender: 'männlich', age: 25, birthDay: 22, birthMonth: 12, skill: 28, potential: 45, bekanntheit: 0, speed: 1.2, fav: [Genre.Drama, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "m129" },
    { name: "Draven Knight", gender: 'männlich', age: 29, birthDay: 3, birthMonth: 8, skill: 27, potential: 35, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.Musical], hate: Genre.Thriller, trait: null, portrait: "m130" },
    { name: "Jett Palmer", gender: 'männlich', age: 33, birthDay: 19, birthMonth: 5, skill: 26, potential: 30, bekanntheit: 0, speed: 1.0, fav: [Genre.Action, Genre.Adventure], hate: Genre.Drama, trait: TalentTrait.Kassengift, portrait: "m131" },
    { name: "Arlo Skinner", gender: 'männlich', age: 27, birthDay: 25, birthMonth: 10, skill: 25, potential: 40, bekanntheit: 0, speed: 0.8, fav: [Genre.Fantasy, Genre.SciFi], hate: Genre.War, trait: TalentTrait.Unzuverlässig, portrait: "m132" },
    { name: "Basil York", gender: 'männlich', age: 31, birthDay: 7, birthMonth: 1, skill: 24, potential: 30, bekanntheit: 0, speed: 1.0, fav: [Genre.Crime, Genre.Thriller], hate: Genre.Musical, trait: null, portrait: "m133" },
    { name: "Cecil Power", gender: 'männlich', age: 36, birthDay: 16, birthMonth: 3, skill: 23, potential: 28, bekanntheit: 0, speed: 1.0, fav: [Genre.War, Genre.Action], hate: Genre.Romance, trait: null, portrait: "m134" },
    { name: "Edwin Shore", gender: 'männlich', age: 24, birthDay: 11, birthMonth: 11, skill: 22, potential: 35, bekanntheit: 0, speed: 0.9, fav: [Genre.Musical, Genre.Comedy], hate: Genre.Action, trait: null, portrait: "m135" },
    { name: "Franklin Dove", gender: 'männlich', age: 38, birthDay: 2, birthMonth: 6, skill: 21, potential: 25, bekanntheit: 0, speed: 1.0, fav: [Genre.Thriller, Genre.Horror], hate: Genre.Comedy, trait: null, portrait: "m136" },
    { name: "Garrett Niles", gender: 'männlich', age: 45, birthDay: 29, birthMonth: 9, skill: 20, potential: 22, bekanntheit: 0, speed: 1.0, fav: [Genre.Romance, Genre.Drama], hate: Genre.Horror, trait: null, portrait: "m137" },
    { name: "Harvey Lent", gender: 'männlich', age: 23, birthDay: 13, birthMonth: 2, skill: 19, potential: 30, bekanntheit: 0, speed: 1.1, fav: [Genre.SciFi, Genre.Action], hate: Genre.Western, trait: null, portrait: "m138" },
    { name: "Isaiah Crooks", gender: 'männlich', age: 28, birthDay: 27, birthMonth: 4, skill: 18, potential: 25, bekanntheit: 0, speed: 1.0, fav: [Genre.Horror, Genre.Fantasy], hate: Genre.Drama, trait: null, portrait: "m139" },
    { name: "Jonah Pears", gender: 'männlich', age: 34, birthDay: 9, birthMonth: 8, skill: 17, potential: 20, bekanntheit: 0, speed: 1.0, fav: [Genre.Western, Genre.Drama], hate: Genre.SciFi, trait: null, portrait: "m140" },
    { name: "Kevin O’Shea", gender: 'männlich', age: 42, birthDay: 18, birthMonth: 12, skill: 16, potential: 18, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Comedy], hate: Genre.Action, trait: null, portrait: "m141" },
    { name: "Leland Parr", gender: 'männlich', age: 26, birthDay: 5, birthMonth: 5, skill: 15, potential: 25, bekanntheit: 0, speed: 0.8, fav: [Genre.Comedy, Genre.SciFi], hate: Genre.Thriller, trait: null, portrait: "m142" },
    { name: "Marcus Vine", gender: 'männlich', age: 39, birthDay: 14, birthMonth: 1, skill: 14, potential: 16, bekanntheit: 0, speed: 1.0, fav: [Genre.Action, Genre.Crime], hate: Genre.Romance, trait: null, portrait: "m143" },
    { name: "Nigel Bloom", gender: 'männlich', age: 22, birthDay: 21, birthMonth: 10, skill: 13, potential: 20, bekanntheit: 0, speed: 1.0, fav: [Genre.Fantasy, Genre.Adventure], hate: Genre.Crime, trait: null, portrait: "m144" },
    { name: "Otis Reddy", gender: 'männlich', age: 30, birthDay: 6, birthMonth: 3, skill: 12, potential: 15, bekanntheit: 0, speed: 1.0, fav: [Genre.Crime, Genre.Drama], hate: Genre.Fantasy, trait: null, portrait: "m145" },
    { name: "Preston Vike", gender: 'männlich', age: 37, birthDay: 12, birthMonth: 7, skill: 11, potential: 14, bekanntheit: 0, speed: 1.0, fav: [Genre.Dokumentation, Genre.War], hate: Genre.Action, trait: null, portrait: "m146" },
    { name: "Quincy Teague", gender: 'männlich', age: 25, birthDay: 31, birthMonth: 8, skill: 10, potential: 20, bekanntheit: 0, speed: 1.0, fav: [Genre.War, Genre.Drama], hate: Genre.Musical, trait: null, portrait: "m147" },
    { name: "Rory McCloud", gender: 'männlich', age: 33, birthDay: 24, birthMonth: 11, skill: 9, potential: 12, bekanntheit: 0, speed: 1.0, fav: [Genre.Romance, Genre.Musical], hate: Genre.Horror, trait: null, portrait: "m148" },
    { name: "Samson Park", gender: 'männlich', age: 21, birthDay: 2, birthMonth: 2, skill: 8, potential: 15, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.Adventure], hate: Genre.Thriller, trait: null, portrait: "m149" },
    { name: "Tobias Funk", gender: 'männlich', age: 20, birthDay: 15, birthMonth: 6, skill: 8, potential: 30, bekanntheit: 0, speed: 1.1, fav: [Genre.Action, Genre.Western], hate: Genre.Drama, trait: TalentTrait.UnentdecktesJuwel, portrait: "m150" },

    // Female (30) - Portraits w121-w150
    { name: "Ava Bond", gender: 'weiblich', age: 23, birthDay: 10, birthMonth: 2, skill: 40, potential: 60, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: null, portrait: "w121" },
    { name: "Beth Marks", gender: 'weiblich', age: 25, birthDay: 18, birthMonth: 4, skill: 38, potential: 55, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.Musical], hate: Genre.Horror, trait: null, portrait: "w122" },
    { name: "Cara Dent", gender: 'weiblich', age: 27, birthDay: 25, birthMonth: 6, skill: 36, potential: 50, bekanntheit: 0, speed: 1.0, fav: [Genre.Romance, Genre.Drama], hate: Genre.SciFi, trait: null, portrait: "w123" },
    { name: "Dawn Farrow", gender: 'weiblich', age: 29, birthDay: 5, birthMonth: 9, skill: 35, potential: 55, bekanntheit: 0, speed: 1.1, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Western, trait: null, portrait: "w124" },
    { name: "Eve Parris", gender: 'weiblich', age: 31, birthDay: 12, birthMonth: 11, skill: 33, potential: 45, bekanntheit: 0, speed: 1.0, fav: [Genre.Fantasy, Genre.SciFi], hate: Genre.Crime, trait: null, portrait: "w125" },
    { name: "Heather Meadows", gender: 'weiblich', age: 33, birthDay: 20, birthMonth: 1, skill: 32, potential: 40, bekanntheit: 0, speed: 0.9, fav: [Genre.Action, Genre.Adventure], hate: Genre.Drama, trait: null, portrait: "w126" },
    { name: "Holly Brook", gender: 'weiblich', age: 36, birthDay: 3, birthMonth: 3, skill: 30, potential: 38, bekanntheit: 0, speed: 1.0, fav: [Genre.SciFi, Genre.Thriller], hate: Genre.Romance, trait: null, portrait: "w127" },
    { name: "Laurel Green", gender: 'weiblich', age: 22, birthDay: 15, birthMonth: 5, skill: 29, potential: 45, bekanntheit: 0, speed: 1.2, fav: [Genre.Musical, Genre.Romance], hate: Genre.War, trait: null, portrait: "w128" },
    { name: "Rosemary Sage", gender: 'weiblich', age: 40, birthDay: 30, birthMonth: 7, skill: 28, potential: 32, bekanntheit: 0, speed: 0.8, fav: [Genre.Crime, Genre.Action], hate: Genre.Fantasy, trait: TalentTrait.Unzuverlässig, portrait: "w129" },
    { name: "Violet Hill", gender: 'weiblich', age: 26, birthDay: 8, birthMonth: 10, skill: 27, potential: 35, bekanntheit: 0, speed: 1.0, fav: [Genre.Western, Genre.Action], hate: Genre.Comedy, trait: null, portrait: "w130" },
    { name: "Abigail Ames", gender: 'weiblich', age: 30, birthDay: 22, birthMonth: 12, skill: 26, potential: 30, bekanntheit: 0, speed: 1.0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Dokumentation, trait: null, portrait: "w131" },
    { name: "Catherine Tulls", gender: 'weiblich', age: 24, birthDay: 1, birthMonth: 2, skill: 25, potential: 40, bekanntheit: 0, speed: 1.0, fav: [Genre.War, Genre.Drama], hate: Genre.Musical, trait: null, portrait: "w132" },
    { name: "Elizabeth Bray", gender: 'weiblich', age: 34, birthDay: 14, birthMonth: 4, skill: 24, potential: 28, bekanntheit: 0, speed: 1.0, fav: [Genre.Dokumentation, Genre.Drama], hate: Genre.Thriller, trait: null, portrait: "w133" },
    { name: "Margaret Thayer", gender: 'weiblich', age: 28, birthDay: 27, birthMonth: 6, skill: 23, potential: 35, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Action, trait: null, portrait: "w134" },
    { name: "Sarah Caine", gender: 'weiblich', age: 38, birthDay: 9, birthMonth: 8, skill: 22, potential: 25, bekanntheit: 0, speed: 1.0, fav: [Genre.Romance, Genre.Musical], hate: Genre.SciFi, trait: null, portrait: "w135" },
    { name: "Jocelyn Frey", gender: 'weiblich', age: 25, birthDay: 19, birthMonth: 10, skill: 21, potential: 30, bekanntheit: 0, speed: 1.1, fav: [Genre.Action, Genre.War], hate: Genre.Drama, trait: null, portrait: "w136" },
    { name: "Kiera Knight", gender: 'weiblich', age: 32, birthDay: 4, birthMonth: 1, skill: 20, potential: 24, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "w137" },
    { name: "Lydia Dane", gender: 'weiblich', age: 29, birthDay: 16, birthMonth: 3, skill: 19, potential: 25, bekanntheit: 0, speed: 1.0, fav: [Genre.Thriller, Genre.Horror], hate: Genre.Romance, trait: null, portrait: "w138" },
    { name: "Madeline Urich", gender: 'weiblich', age: 37, birthDay: 28, birthMonth: 5, skill: 18, potential: 20, bekanntheit: 0, speed: 1.0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "w139" },
    { name: "Nina Sikes", gender: 'weiblich', age: 21, birthDay: 11, birthMonth: 7, skill: 17, potential: 35, bekanntheit: 0, speed: 1.0, fav: [Genre.Fantasy, Genre.Adventure], hate: Genre.Crime, trait: null, portrait: "w140" },
    { name: "Odette Sayer", gender: 'weiblich', age: 35, birthDay: 23, birthMonth: 9, skill: 16, potential: 18, bekanntheit: 0, speed: 1.0, fav: [Genre.Musical, Genre.Comedy], hate: Genre.War, trait: null, portrait: "w141" },
    { name: "Prudence Haugh", gender: 'weiblich', age: 41, birthDay: 6, birthMonth: 11, skill: 15, potential: 16, bekanntheit: 0, speed: 0.9, fav: [Genre.Crime, Genre.Thriller], hate: Genre.Fantasy, trait: null, portrait: "w142" },
    { name: "Queenie Galt", gender: 'weiblich', age: 23, birthDay: 17, birthMonth: 1, skill: 14, potential: 25, bekanntheit: 0, speed: 1.0, fav: [Genre.Western, Genre.Drama], hate: Genre.SciFi, trait: null, portrait: "w143" },
    { name: "Rowan Black", gender: 'weiblich', age: 30, birthDay: 2, birthMonth: 4, skill: 13, potential: 18, bekanntheit: 0, speed: 1.0, fav: [Genre.Horror, Genre.SciFi], hate: Genre.Romance, trait: null, portrait: "w144" },
    { name: "Sabrina Sands", gender: 'weiblich', age: 26, birthDay: 13, birthMonth: 6, skill: 12, potential: 20, bekanntheit: 0, speed: 1.0, fav: [Genre.Action, Genre.Crime], hate: Genre.Drama, trait: null, portrait: "w145" },
    { name: "Talia Shea", gender: 'weiblich', age: 33, birthDay: 25, birthMonth: 8, skill: 11, potential: 15, bekanntheit: 0, speed: 1.0, fav: [Genre.Romance, Genre.Drama], hate: Genre.Action, trait: null, portrait: "w146" },
    { name: "Una Thorp", gender: 'weiblich', age: 24, birthDay: 8, birthMonth: 11, skill: 10, potential: 22, bekanntheit: 0, speed: 1.0, fav: [Genre.Comedy, Genre.SciFi], hate: Genre.Thriller, trait: null, portrait: "w147" },
    { name: "Vanessa Ivers", gender: 'weiblich', age: 39, birthDay: 20, birthMonth: 2, skill: 9, potential: 12, bekanntheit: 0, speed: 1.0, fav: [Genre.Drama, Genre.War], hate: Genre.Comedy, trait: null, portrait: "w148" },
    { name: "Wendy Darts", gender: 'weiblich', age: 22, birthDay: 30, birthMonth: 4, skill: 8, potential: 25, bekanntheit: 0, speed: 1.0, fav: [Genre.SciFi, Genre.Action], hate: Genre.Western, trait: null, portrait: "w149" },
    { name: "Zelda Fane", gender: 'weiblich', age: 20, birthDay: 10, birthMonth: 7, skill: 8, potential: 35, bekanntheit: 0, speed: 1.1, fav: [Genre.Fantasy, Genre.Musical], hate: Genre.Horror, trait: TalentTrait.UnentdecktesJuwel, portrait: "w150" },
   // Eigene Charaktere
    { name: "Mike Stringer", gender: 'männlich', age: 25, birthDay: 25, birthMonth: 2, skill: 14, potential: 75, bekanntheit: 0, speed: 1.0, fav: [Genre.Horror, Genre.Action], hate: Genre.Western, trait: TalentTrait.Publikumsliebling, portrait: "e2" },
     { name: "Harry Biostock", gender: 'männlich', age: 36, birthDay: 11, birthMonth: 9, skill: 14, potential: 75, bekanntheit: 0, speed: 1.0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: TalentTrait.Publikumsliebling, portrait: "e1" },

];

export const generateInitialDirectors = (): Director[] => {
    const directors: Director[] = [];
    const gameStartDate = new Date(1990, 0, 1);
    
    // Wir beginnen bei ID 2000 für Regisseure
    let startId = 2000;

    DIRECTOR_DEFINITIONS.forEach((def, index) => {
        const birthYear = gameStartDate.getFullYear() - def.age;
        // Erstelle Geburtsdatum: Monat ist 0-basiert in JS (birthMonth - 1)
        const birthDate = new Date(birthYear, def.birthMonth - 1, def.birthDay);

        // Kostenberechnung
        let multiplier = 8;
        if (def.skill <= 20) multiplier = 1;
        else if (def.skill <= 50) multiplier = 3;
        else if (def.skill <= 80) multiplier = 5;

        const baseCost = 15000 + multiplier * Math.pow(def.skill, 3.1);
        const cost = Math.round(baseCost / 100) * 100;

        // Portrait-Daten abrufen
        const portraitData = portraitDataMap[def.portrait] || { skin: 'light' as const, hair: 'brown' as const };

        const director: Director = {
            id: startId + index,
            name: def.name,
            gender: def.gender as 'männlich' | 'weiblich',
            birthDate: birthDate,
            skill: def.skill,
            cost: cost,
            bekanntheit: def.bekanntheit,
            speedModifier: def.speed,
            favoriteGenres: def.fav,
            hatedGenre: def.hate,
            traits: def.trait ? [def.trait] : [],
            experience: def.skill > 70 ? Math.floor(Math.random() * 10) + 5 : 0,
            potential: def.potential,
            loyalty: 40,
            moral: 70,
            isDiscovered: def.bekanntheit > 0, // Only discovered if fame > 0
            portraitUrl: def.portrait,
            // Neue Felder für Portraitinformation
            skin: portraitData.skin,
            hair: portraitData.hair,
            ethnicity: determineEthnicity(portraitData.skin, portraitData.hair)
        };

        directors.push(director);
    });

    return directors.sort((a, b) => b.skill - a.skill);
};
