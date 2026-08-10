import { Genre, TalentTrait } from '../types';
// Hilfsfunktion zur Bestimmung der Ethnie basierend auf Hautfarbe und Haarfarbe
const determineEthnicity = (skin, hair) => {
    if (hair === 'blonde' && skin === 'light')
        return 'Northern European';
    if (skin === 'light' && ['brown', 'black'].includes(hair))
        return 'European';
    if (skin === 'light' && hair === 'red')
        return 'Celtic';
    if (skin === 'medium' && ['black', 'brown'].includes(hair))
        return 'Mediterranean / Latino';
    if (skin === 'dark' && hair === 'black')
        return 'African / Caribbean';
    if (skin === 'medium' && hair === 'blonde')
        return 'Mixed / Northern European';
    return 'Mixed';
};
// Portrait-Daten Mapping (Hautfarbe, Haarfarbe)
const portraitDataMap = {
    'm1': { skin: 'dark', hair: 'black' }, 'm2': { skin: 'medium', hair: 'blonde' }, 'm3': { skin: 'light', hair: 'brown' },
    'm4': { skin: 'dark', hair: 'black' }, 'm5': { skin: 'light', hair: 'blonde' }, 'm6': { skin: 'medium', hair: 'black' },
    'm7': { skin: 'light', hair: 'blonde' }, 'm8': { skin: 'dark', hair: 'black' }, 'm9': { skin: 'medium', hair: 'black' },
    'm10': { skin: 'light', hair: 'blonde' }, 'm11': { skin: 'light', hair: 'black' }, 'm12': { skin: 'light', hair: 'black' },
    'm13': { skin: 'light', hair: 'brown' }, 'm14': { skin: 'light', hair: 'red' }, 'm15': { skin: 'medium', hair: 'black' },
    'm16': { skin: 'light', hair: 'black' }, 'm17': { skin: 'light', hair: 'brown' }, 'm18': { skin: 'medium', hair: 'black' },
    'm19': { skin: 'dark', hair: 'black' }, 'm20': { skin: 'light', hair: 'brown' }, 'm21': { skin: 'light', hair: 'black' },
    'm22': { skin: 'medium', hair: 'black' }, 'm23': { skin: 'medium', hair: 'black' }, 'm24': { skin: 'medium', hair: 'black' },
    'm25': { skin: 'dark', hair: 'black' }, 'm26': { skin: 'light', hair: 'black' }, 'm29': { skin: 'light', hair: 'brown' },
    'm31': { skin: 'dark', hair: 'black' }, 'm32': { skin: 'light', hair: 'black' }, 'm34': { skin: 'medium', hair: 'black' },
    'm36': { skin: 'light', hair: 'brown' }, 'm39': { skin: 'light', hair: 'red' }, 'm40': { skin: 'medium', hair: 'black' },
    'm41': { skin: 'light', hair: 'black' }, 'm42': { skin: 'medium', hair: 'black' }, 'm43': { skin: 'light', hair: 'brown' },
    'm44': { skin: 'dark', hair: 'black' }, 'm45': { skin: 'medium', hair: 'black' }, 'm46': { skin: 'light', hair: 'blonde' },
    'm47': { skin: 'medium', hair: 'brown' }, 'm48': { skin: 'light', hair: 'red' }, 'm49': { skin: 'light', hair: 'brown' },
    'm50': { skin: 'dark', hair: 'black' }, 'm51': { skin: 'light', hair: 'blonde' }, 'm52': { skin: 'medium', hair: 'black' },
    'm53': { skin: 'light', hair: 'brown' }, 'm54': { skin: 'light', hair: 'red' }, 'm55': { skin: 'dark', hair: 'black' },
    'm56': { skin: 'medium', hair: 'brown' }, 'm57': { skin: 'light', hair: 'blonde' }, 'm58': { skin: 'light', hair: 'black' },
    'm59': { skin: 'medium', hair: 'black' }, 'm60': { skin: 'light', hair: 'brown' }, 'm61': { skin: 'light', hair: 'black' },
    'm62': { skin: 'medium', hair: 'brown' }, 'm63': { skin: 'dark', hair: 'black' }, 'm64': { skin: 'light', hair: 'red' },
    'm65': { skin: 'light', hair: 'brown' }, 'm66': { skin: 'medium', hair: 'black' }, 'm67': { skin: 'light', hair: 'blonde' },
    'm68': { skin: 'dark', hair: 'black' }, 'm69': { skin: 'light', hair: 'brown' }, 'm70': { skin: 'medium', hair: 'black' },
    'm71': { skin: 'light', hair: 'red' }, 'm73': { skin: 'light', hair: 'brown' }, 'm74': { skin: 'dark', hair: 'black' },
    'm75': { skin: 'medium', hair: 'brown' }, 'm76': { skin: 'light', hair: 'blonde' }, 'm77': { skin: 'dark', hair: 'black' },
    'm78': { skin: 'light', hair: 'red' }, 'm79': { skin: 'light', hair: 'brown' }, 'm80': { skin: 'medium', hair: 'black' },
    'm81': { skin: 'light', hair: 'blonde' }, 'm82': { skin: 'dark', hair: 'black' }, 'm83': { skin: 'light', hair: 'brown' },
    'm84': { skin: 'light', hair: 'red' }, 'm85': { skin: 'light', hair: 'blonde' }, 'm86': { skin: 'medium', hair: 'black' },
    'm87': { skin: 'dark', hair: 'black' }, 'm88': { skin: 'light', hair: 'brown' }, 'm89': { skin: 'medium', hair: 'blonde' },
    'm90': { skin: 'light', hair: 'black' }, 'm91': { skin: 'dark', hair: 'black' }, 'm92': { skin: 'light', hair: 'brown' },
    'm93': { skin: 'light', hair: 'red' }, 'm94': { skin: 'medium', hair: 'black' }, 'm95': { skin: 'light', hair: 'blonde' },
    'm96': { skin: 'dark', hair: 'black' }, 'm97': { skin: 'light', hair: 'brown' }, 'm98': { skin: 'light', hair: 'black' },
    'm99': { skin: 'medium', hair: 'red' }, 'm100': { skin: 'light', hair: 'brown' }, 'm150': { skin: 'medium', hair: 'black' },
    'w1': { skin: 'light', hair: 'black' }, 'w2': { skin: 'light', hair: 'red' }, 'w3': { skin: 'light', hair: 'black' },
    'w4': { skin: 'light', hair: 'black' }, 'w5': { skin: 'light', hair: 'brown' }, 'w6': { skin: 'light', hair: 'red' },
    'w7': { skin: 'light', hair: 'blonde' }, 'w8': { skin: 'light', hair: 'red' }, 'w9': { skin: 'light', hair: 'brown' },
    'w10': { skin: 'light', hair: 'brown' }, 'w11': { skin: 'dark', hair: 'black' }, 'w12': { skin: 'dark', hair: 'black' },
    'w13': { skin: 'light', hair: 'blonde' }, 'w14': { skin: 'medium', hair: 'black' }, 'w15': { skin: 'dark', hair: 'black' },
    'w16': { skin: 'medium', hair: 'black' }, 'w17': { skin: 'light', hair: 'brown' }, 'w18': { skin: 'light', hair: 'brown' },
    'w19': { skin: 'light', hair: 'black' }, 'w20': { skin: 'medium', hair: 'brown' }, 'w21': { skin: 'light', hair: 'blonde' },
    'w22': { skin: 'light', hair: 'blonde' }, 'w23': { skin: 'dark', hair: 'black' }, 'w24': { skin: 'light', hair: 'brown' },
    'w25': { skin: 'light', hair: 'red' }, 'w26': { skin: 'light', hair: 'brown' }, 'w27': { skin: 'dark', hair: 'black' },
    'w28': { skin: 'light', hair: 'blonde' }, 'w29': { skin: 'medium', hair: 'black' }, 'w30': { skin: 'light', hair: 'brown' },
    'w31': { skin: 'light', hair: 'red' }, 'w32': { skin: 'dark', hair: 'black' }, 'w33': { skin: 'light', hair: 'blonde' },
    'w34': { skin: 'medium', hair: 'brown' }, 'w35': { skin: 'light', hair: 'black' }, 'w36': { skin: 'light', hair: 'red' },
    'w37': { skin: 'dark', hair: 'black' }, 'w38': { skin: 'light', hair: 'brown' }, 'w39': { skin: 'light', hair: 'blonde' },
    'w40': { skin: 'medium', hair: 'black' }, 'w41': { skin: 'light', hair: 'brown' }, 'w42': { skin: 'light', hair: 'black' },
    'w43': { skin: 'medium', hair: 'brown' }, 'w44': { skin: 'light', hair: 'red' }, 'w45': { skin: 'dark', hair: 'black' },
    'w46': { skin: 'light', hair: 'blonde' }, 'w47': { skin: 'medium', hair: 'brown' }, 'w48': { skin: 'light', hair: 'black' },
    'w49': { skin: 'light', hair: 'red' }, 'w50': { skin: 'dark', hair: 'black' }, 'w51': { skin: 'light', hair: 'brown' },
    'w52': { skin: 'light', hair: 'blonde' }, 'w53': { skin: 'medium', hair: 'black' }, 'w54': { skin: 'light', hair: 'red' },
    'w55': { skin: 'light', hair: 'brown' }, 'w56': { skin: 'dark', hair: 'black' }, 'w57': { skin: 'light', hair: 'blonde' },
    'w58': { skin: 'medium', hair: 'brown' }, 'w59': { skin: 'light', hair: 'black' }, 'w60': { skin: 'light', hair: 'red' },
    'w61': { skin: 'dark', hair: 'black' }, 'w62': { skin: 'light', hair: 'brown' }, 'w63': { skin: 'light', hair: 'blonde' },
    'w64': { skin: 'medium', hair: 'black' }, 'w65': { skin: 'light', hair: 'red' }, 'w66': { skin: 'light', hair: 'brown' },
    'w67': { skin: 'dark', hair: 'black' }, 'w68': { skin: 'light', hair: 'blonde' }, 'w69': { skin: 'medium', hair: 'brown' },
    'w70': { skin: 'light', hair: 'black' }, 'w71': { skin: 'light', hair: 'red' }, 'w72': { skin: 'dark', hair: 'black' },
    'w73': { skin: 'light', hair: 'brown' }, 'w74': { skin: 'light', hair: 'blonde' }, 'w75': { skin: 'medium', hair: 'black' },
    'w76': { skin: 'light', hair: 'red' }, 'w77': { skin: 'light', hair: 'brown' }, 'w78': { skin: 'dark', hair: 'black' },
    'w79': { skin: 'light', hair: 'blonde' }, 'w80': { skin: 'medium', hair: 'brown' }, 'w81': { skin: 'light', hair: 'black' },
    'w82': { skin: 'light', hair: 'red' }, 'w83': { skin: 'dark', hair: 'black' }, 'w84': { skin: 'light', hair: 'brown' },
    'w85': { skin: 'light', hair: 'blonde' }, 'w86': { skin: 'medium', hair: 'black' }, 'w87': { skin: 'light', hair: 'red' },
    'w88': { skin: 'light', hair: 'brown' }, 'w89': { skin: 'dark', hair: 'black' }, 'w90': { skin: 'light', hair: 'blonde' },
    'w91': { skin: 'medium', hair: 'black' }, 'w92': { skin: 'light', hair: 'red' }, 'w93': { skin: 'light', hair: 'brown' },
    'w94': { skin: 'dark', hair: 'black' }, 'w95': { skin: 'light', hair: 'blonde' }, 'w96': { skin: 'medium', hair: 'brown' },
    'w97': { skin: 'light', hair: 'black' }, 'w98': { skin: 'light', hair: 'red' }, 'w99': { skin: 'dark', hair: 'black' },
    'w100': { skin: 'light', hair: 'brown' }, 'w150': { skin: 'light', hair: 'blonde' },
    'e1': { skin: 'light', hair: 'brown' }, 'e3': { skin: 'light', hair: 'black' },
    'e4': { skin: 'medium', hair: 'brown' }, 'e5': { skin: 'light', hair: 'red' },
};
// Definition der festen Start-Schauspieler
// 200 Total: 100 Männer (m1-m100), 100 Frauen (w1-w100)
// Verteilung:
// 11-17: 20 (10%)
// 18-35: 74 (37%)
// 36-55: 68 (34%)
// 56-75: 38 (19%)
const ACTOR_DEFINITIONS = [
    // =================================================================
    // GRUPPE 1: 11 - 17 JAHRE (20 TOTAL: 10M, 10F)
    // =================================================================
    // MÄNNER (10)
    { name: "Alden Brock", gender: 'männlich', age: 14, birthDay: 1, birthMonth: 6, skill: 76, potential: 100, bekanntheit: 0, fav: [Genre.Drama, Genre.Fantasy], hate: Genre.Horror, trait: TalentTrait.UnentdecktesJuwel, portrait: "m10" },
    { name: "Berrick Thorne", gender: 'männlich', age: 12, birthDay: 5, birthMonth: 5, skill: 58, potential: 85, bekanntheit: 0, fav: [Genre.Comedy, Genre.Adventure], hate: Genre.Horror, trait: TalentTrait.Publikumsliebling, portrait: "m21" },
    { name: "Caelan Vance", gender: 'männlich', age: 15, birthDay: 10, birthMonth: 2, skill: 55, potential: 80, bekanntheit: 0, fav: [Genre.Adventure, Genre.Fantasy], hate: Genre.Romance, trait: null, portrait: "m22" },
    { name: "Dorian Hayes", gender: 'männlich', age: 11, birthDay: 20, birthMonth: 8, skill: 50, potential: 90, bekanntheit: 0, fav: [Genre.Adventure, Genre.Comedy], hate: Genre.War, trait: TalentTrait.UnentdecktesJuwel, portrait: "m23" },
    { name: "Elian Frost", gender: 'männlich', age: 17, birthDay: 15, birthMonth: 11, skill: 48, potential: 75, bekanntheit: 0, fav: [Genre.Drama, Genre.Comedy], hate: Genre.Musical, trait: null, portrait: "m24" },
    { name: "Fintan Cross", gender: 'männlich', age: 11, birthDay: 1, birthMonth: 1, skill: 20, potential: 60, bekanntheit: 0, fav: [Genre.Comedy, Genre.SciFi], hate: Genre.Horror, trait: null, portrait: "m41" },
    { name: "Gareth Sterling", gender: 'männlich', age: 13, birthDay: 4, birthMonth: 3, skill: 18, potential: 55, bekanntheit: 0, fav: [Genre.Comedy, Genre.Adventure], hate: Genre.Thriller, trait: null, portrait: "m42" },
    { name: "Hollis Vane", gender: 'männlich', age: 14, birthDay: 12, birthMonth: 5, skill: 25, potential: 65, bekanntheit: 0, fav: [Genre.Adventure, Genre.Action], hate: Genre.Romance, trait: null, portrait: "m43" },
    { name: "Jareth Cole", gender: 'männlich', age: 16, birthDay: 22, birthMonth: 9, skill: 22, potential: 60, bekanntheit: 0, fav: [Genre.Comedy, Genre.Drama], hate: Genre.Drama, trait: null, portrait: "m44" },
    { name: "Kian Blackwood", gender: 'männlich', age: 17, birthDay: 30, birthMonth: 12, skill: 30, potential: 70, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Romance, trait: null, portrait: "m45" },
    // FRAUEN (10)
    { name: "Adaline Joy", gender: 'weiblich', age: 13, birthDay: 5, birthMonth: 5, skill: 75, potential: 100, bekanntheit: 0, fav: [Genre.Comedy, Genre.Adventure], hate: Genre.Thriller, trait: TalentTrait.Publikumsliebling, portrait: "w10" },
    { name: "Briony Lane", gender: 'weiblich', age: 12, birthDay: 12, birthMonth: 4, skill: 60, potential: 90, bekanntheit: 0, fav: [Genre.Adventure, Genre.Fantasy], hate: Genre.War, trait: TalentTrait.Publikumsliebling, portrait: "w20" },
    { name: "Calla Vance", gender: 'weiblich', age: 14, birthDay: 23, birthMonth: 9, skill: 58, potential: 85, bekanntheit: 0, fav: [Genre.Drama, Genre.Adventure], hate: Genre.Horror, trait: null, portrait: "w21" },
    { name: "Delia Rose", gender: 'weiblich', age: 11, birthDay: 1, birthMonth: 1, skill: 55, potential: 80, bekanntheit: 0, fav: [Genre.Fantasy, Genre.Comedy], hate: Genre.Thriller, trait: TalentTrait.UnentdecktesJuwel, portrait: "w22" },
    { name: "Elara Quinn", gender: 'weiblich', age: 16, birthDay: 14, birthMonth: 7, skill: 50, potential: 78, bekanntheit: 0, fav: [Genre.Drama, Genre.Musical], hate: Genre.Western, trait: null, portrait: "w23" },
    { name: "Faye Summers", gender: 'weiblich', age: 11, birthDay: 2, birthMonth: 2, skill: 20, potential: 65, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "w41" },
    { name: "Greta Swan", gender: 'weiblich', age: 13, birthDay: 15, birthMonth: 6, skill: 22, potential: 60, bekanntheit: 0, fav: [Genre.Comedy, Genre.Fantasy], hate: Genre.Thriller, trait: null, portrait: "w42" },
    { name: "Hazel Vane", gender: 'weiblich', age: 15, birthDay: 28, birthMonth: 8, skill: 25, potential: 70, bekanntheit: 0, fav: [Genre.Adventure, Genre.Musical], hate: Genre.Romance, trait: null, portrait: "w43" },
    { name: "Isla Hart", gender: 'weiblich', age: 17, birthDay: 10, birthMonth: 11, skill: 28, potential: 75, bekanntheit: 0, fav: [Genre.Drama, Genre.SciFi], hate: Genre.SciFi, trait: null, portrait: "w44" },
    { name: "Juna Blake", gender: 'weiblich', age: 17, birthDay: 5, birthMonth: 12, skill: 30, potential: 80, bekanntheit: 0, fav: [Genre.Fantasy, Genre.Adventure], hate: Genre.Western, trait: null, portrait: "w45" },
    // =================================================================
    // GRUPPE 2: 18 - 35 JAHRE (74 TOTAL: 37M, 37F)
    // =================================================================
    // MÄNNER (37)
    // High Skill (4)
    { name: "Lorcan Reed", gender: 'männlich', age: 35, birthDay: 12, birthMonth: 4, skill: 98, potential: 100, bekanntheit: 0, fav: [Genre.Action, Genre.Thriller], hate: Genre.Romance, trait: TalentTrait.Publikumsliebling, portrait: "m1" },
    { name: "Merrick Stone", gender: 'männlich', age: 28, birthDay: 11, birthMonth: 11, skill: 95, potential: 100, bekanntheit: 0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Horror, trait: TalentTrait.Perfektionist, portrait: "m2" },
    { name: "Nolan West", gender: 'männlich', age: 34, birthDay: 9, birthMonth: 6, skill: 80, potential: 90, bekanntheit: 0, fav: [Genre.Fantasy, Genre.Adventure], hate: Genre.War, trait: TalentTrait.Diva, portrait: "m8" },
    { name: "Orson Wilde", gender: 'männlich', age: 32, birthDay: 2, birthMonth: 9, skill: 85, potential: 95, bekanntheit: 0, fav: [Genre.SciFi, Genre.Action], hate: Genre.Comedy, trait: TalentTrait.Teamplayer, portrait: "m6" },
    // Mid Skill (15)
    { name: "Perrin Shaw", gender: 'männlich', age: 25, birthDay: 25, birthMonth: 9, skill: 74, potential: 85, bekanntheit: 0, fav: [Genre.Comedy, Genre.SciFi], hate: Genre.Western, trait: TalentTrait.Publikumsliebling, portrait: "m11" },
    { name: "Quinten Hart", gender: 'männlich', age: 29, birthDay: 14, birthMonth: 2, skill: 72, potential: 80, bekanntheit: 0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: null, portrait: "m12" },
    { name: "Ronan Field", gender: 'männlich', age: 22, birthDay: 30, birthMonth: 10, skill: 70, potential: 85, bekanntheit: 0, fav: [Genre.Fantasy, Genre.Adventure], hate: Genre.Crime, trait: TalentTrait.Sparfuchs, portrait: "m13" },
    { name: "Silas Drake", gender: 'männlich', age: 30, birthDay: 5, birthMonth: 5, skill: 68, potential: 75, bekanntheit: 0, fav: [Genre.Western, Genre.Action], hate: Genre.Musical, trait: null, portrait: "m14" },
    { name: "Taron Wolf", gender: 'männlich', age: 24, birthDay: 18, birthMonth: 1, skill: 66, potential: 80, bekanntheit: 0, fav: [Genre.Comedy, Genre.Drama], hate: Genre.Horror, trait: TalentTrait.UnentdecktesJuwel, portrait: "m15" },
    { name: "Vance Mercer", gender: 'männlich', age: 27, birthDay: 22, birthMonth: 4, skill: 64, potential: 78, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: TalentTrait.Teamplayer, portrait: "m17" },
    { name: "Alaric Flynn", gender: 'männlich', age: 31, birthDay: 4, birthMonth: 3, skill: 62, potential: 75, bekanntheit: 0, fav: [Genre.Action, Genre.War], hate: Genre.Romance, trait: null, portrait: "m19" },
    { name: "Baxter Hale", gender: 'männlich', age: 26, birthDay: 15, birthMonth: 7, skill: 60, potential: 72, bekanntheit: 0, fav: [Genre.Comedy, Genre.Adventure], hate: Genre.Horror, trait: TalentTrait.Kassengift, portrait: "m20" },
    { name: "Corbin Nash", gender: 'männlich', age: 28, birthDay: 8, birthMonth: 6, skill: 57, potential: 70, bekanntheit: 0, fav: [Genre.Adventure, Genre.Action], hate: Genre.Drama, trait: TalentTrait.Arbeitstier, portrait: "m26" },
    { name: "Declan Ford", gender: 'männlich', age: 23, birthDay: 2, birthMonth: 12, skill: 54, potential: 75, bekanntheit: 0, fav: [Genre.Musical, Genre.Romance], hate: Genre.Action, trait: TalentTrait.Unzuverlässig, portrait: "m29" },
    { name: "Eamon Clark", gender: 'männlich', age: 30, birthDay: 1, birthMonth: 1, skill: 52, potential: 65, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Musical, trait: null, portrait: "m31" },
    { name: "Finnian Bell", gender: 'männlich', age: 34, birthDay: 12, birthMonth: 4, skill: 51, potential: 60, bekanntheit: 0, fav: [Genre.Comedy, Genre.Horror], hate: Genre.Horror, trait: null, portrait: "m32" },
    { name: "Gideon Ross", gender: 'männlich', age: 26, birthDay: 14, birthMonth: 2, skill: 49, potential: 70, bekanntheit: 0, fav: [Genre.Drama, Genre.SciFi], hate: Genre.SciFi, trait: null, portrait: "m34" },
    { name: "Holden Price", gender: 'männlich', age: 29, birthDay: 5, birthMonth: 5, skill: 47, potential: 65, bekanntheit: 0, fav: [Genre.SciFi, Genre.Western], hate: Genre.Western, trait: null, portrait: "m36" },
    { name: "Ivor Kent", gender: 'männlich', age: 33, birthDay: 27, birthMonth: 6, skill: 44, potential: 55, bekanntheit: 0, fav: [Genre.Romance, Genre.Horror], hate: Genre.Horror, trait: null, portrait: "m39" },
    // Low Skill (18)
    { name: "Jace Lowe", gender: 'männlich', age: 18, birthDay: 1, birthMonth: 1, skill: 35, potential: 75, bekanntheit: 0, fav: [Genre.SciFi, Genre.Western], hate: Genre.Western, trait: null, portrait: "m46" },
    { name: "Kellan Moss", gender: 'männlich', age: 19, birthDay: 10, birthMonth: 2, skill: 32, potential: 70, bekanntheit: 0, fav: [Genre.Fantasy, Genre.Crime], hate: Genre.Crime, trait: null, portrait: "m47" },
    { name: "Lachlan Gray", gender: 'männlich', age: 20, birthDay: 15, birthMonth: 3, skill: 38, potential: 80, bekanntheit: 0, fav: [Genre.Drama, Genre.Musical], hate: Genre.Musical, trait: null, portrait: "m48" },
    { name: "Magnus Holt", gender: 'männlich', age: 24, birthDay: 5, birthMonth: 3, skill: 40, potential: 50, bekanntheit: 0, fav: [Genre.Action, Genre.Drama], hate: Genre.Drama, trait: TalentTrait.Unzuverlässig, portrait: "m51" },
    { name: "Neville Pine", gender: 'männlich', age: 29, birthDay: 12, birthMonth: 8, skill: 39, potential: 45, bekanntheit: 0, fav: [Genre.Comedy, Genre.Thriller], hate: Genre.Thriller, trait: null, portrait: "m52" },
    { name: "Owen Birch", gender: 'männlich', age: 33, birthDay: 22, birthMonth: 1, skill: 38, potential: 45, bekanntheit: 0, fav: [Genre.Drama, Genre.Action], hate: Genre.Action, trait: TalentTrait.Kassengift, portrait: "m53" },
    { name: "Phineas Day", gender: 'männlich', age: 21, birthDay: 14, birthMonth: 11, skill: 37, potential: 55, bekanntheit: 0, fav: [Genre.SciFi, Genre.Romance], hate: Genre.Romance, trait: null, portrait: "m54" },
    { name: "Quinn Adler", gender: 'männlich', age: 26, birthDay: 3, birthMonth: 4, skill: 35, potential: 50, bekanntheit: 0, fav: [Genre.Western, Genre.SciFi], hate: Genre.SciFi, trait: null, portrait: "m56" },
    { name: "Rhys Law", gender: 'männlich', age: 31, birthDay: 25, birthMonth: 12, skill: 33, potential: 45, bekanntheit: 0, fav: [Genre.Action, Genre.Dokumentation], hate: Genre.Dokumentation, trait: TalentTrait.Diva, portrait: "m58" },
    { name: "Stellan Ash", gender: 'männlich', age: 27, birthDay: 9, birthMonth: 2, skill: 32, potential: 40, bekanntheit: 0, fav: [Genre.Adventure, Genre.War], hate: Genre.War, trait: null, portrait: "m59" },
    { name: "Tobin Pike", gender: 'männlich', age: 23, birthDay: 11, birthMonth: 10, skill: 30, potential: 55, bekanntheit: 0, fav: [Genre.Crime, Genre.Fantasy], hate: Genre.Fantasy, trait: TalentTrait.Sparfuchs, portrait: "m61" },
    { name: "Arthur Pendelton", gender: 'männlich', age: 30, birthDay: 7, birthMonth: 7, skill: 29, potential: 35, bekanntheit: 0, fav: [Genre.SciFi, Genre.Western], hate: Genre.Western, trait: TalentTrait.Kassengift, portrait: "m62" },
    { name: "Barnaby Crouch", gender: 'männlich', age: 28, birthDay: 16, birthMonth: 3, skill: 28, potential: 40, bekanntheit: 0, fav: [Genre.Drama, Genre.Action], hate: Genre.Action, trait: null, portrait: "m63" },
    { name: "Cedric Digby", gender: 'männlich', age: 25, birthDay: 21, birthMonth: 12, skill: 26, potential: 45, bekanntheit: 0, fav: [Genre.Action, Genre.Romance], hate: Genre.Romance, trait: null, portrait: "m65" },
    { name: "Desmond Frye", gender: 'männlich', age: 22, birthDay: 28, birthMonth: 2, skill: 24, potential: 50, bekanntheit: 0, fav: [Genre.Horror, Genre.Drama], hate: Genre.Drama, trait: null, portrait: "m67" },
    { name: "Elias Moore", gender: 'männlich', age: 29, birthDay: 19, birthMonth: 9, skill: 21, potential: 30, bekanntheit: 0, fav: [Genre.Romance, Genre.Action], hate: Genre.Action, trait: TalentTrait.Unzuverlässig, portrait: "m70" },
    { name: "Felix Ward", gender: 'männlich', age: 31, birthDay: 6, birthMonth: 1, skill: 20, potential: 35, bekanntheit: 0, fav: [Genre.Crime, Genre.Fantasy], hate: Genre.Fantasy, trait: TalentTrait.Kassengift, portrait: "m71" },
    { name: "Graham Tate", gender: 'männlich', age: 20, birthDay: 15, birthMonth: 6, skill: 8, potential: 30, bekanntheit: 0, fav: [Genre.Action, Genre.Adventure], hate: Genre.Drama, trait: TalentTrait.UnentdecktesJuwel, portrait: "m150" },
    // FRAUEN (37)
    // High Skill (4)
    { name: "Keira Fox", gender: 'weiblich', age: 32, birthDay: 28, birthMonth: 10, skill: 99, potential: 100, bekanntheit: 0, fav: [Genre.Romance, Genre.Comedy], hate: Genre.Horror, trait: TalentTrait.Publikumsliebling, portrait: "w1" },
    { name: "Lyra Snow", gender: 'weiblich', age: 26, birthDay: 22, birthMonth: 11, skill: 94, potential: 99, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Western, trait: TalentTrait.Arbeitstier, portrait: "w3" },
    { name: "Mira Cole", gender: 'weiblich', age: 24, birthDay: 15, birthMonth: 8, skill: 91, potential: 98, bekanntheit: 0, fav: [Genre.Adventure, Genre.Drama], hate: Genre.Horror, trait: TalentTrait.Publikumsliebling, portrait: "w4" },
    { name: "Nova Reed", gender: 'weiblich', age: 22, birthDay: 6, birthMonth: 11, skill: 89, potential: 95, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.War, trait: TalentTrait.Teamplayer, portrait: "w5" },
    // Mid Skill (15)
    { name: "Opal Gray", gender: 'weiblich', age: 29, birthDay: 9, birthMonth: 6, skill: 83, potential: 90, bekanntheit: 0, fav: [Genre.Drama, Genre.SciFi], hate: Genre.Western, trait: null, portrait: "w7" },
    { name: "Piper Day", gender: 'weiblich', age: 34, birthDay: 26, birthMonth: 7, skill: 74, potential: 80, bekanntheit: 0, fav: [Genre.Comedy, Genre.Thriller], hate: Genre.Fantasy, trait: TalentTrait.Publikumsliebling, portrait: "w11" },
    { name: "Rhea Cross", gender: 'weiblich', age: 27, birthDay: 1, birthMonth: 2, skill: 72, potential: 85, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Drama, trait: null, portrait: "w12" },
    { name: "Sienna West", gender: 'weiblich', age: 23, birthDay: 19, birthMonth: 4, skill: 70, potential: 90, bekanntheit: 0, fav: [Genre.Musical, Genre.Romance], hate: Genre.Action, trait: TalentTrait.UnentdecktesJuwel, portrait: "w13" },
    { name: "Tessa Moon", gender: 'weiblich', age: 25, birthDay: 5, birthMonth: 9, skill: 66, potential: 80, bekanntheit: 0, fav: [Genre.Adventure, Genre.Action], hate: Genre.Dokumentation, trait: TalentTrait.Sparfuchs, portrait: "w15" },
    { name: "Una Frost", gender: 'weiblich', age: 34, birthDay: 23, birthMonth: 3, skill: 65, potential: 72, bekanntheit: 0, fav: [Genre.Drama, Genre.Crime], hate: Genre.SciFi, trait: null, portrait: "w16" },
    { name: "Verity Hale", gender: 'weiblich', age: 21, birthDay: 14, birthMonth: 1, skill: 64, potential: 85, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.War, trait: TalentTrait.Kassengift, portrait: "w17" },
    { name: "Willow Ash", gender: 'weiblich', age: 29, birthDay: 30, birthMonth: 8, skill: 62, potential: 75, bekanntheit: 0, fav: [Genre.Fantasy, Genre.SciFi], hate: Genre.Western, trait: null, portrait: "w19" },
    { name: "Xenia Bell", gender: 'weiblich', age: 33, birthDay: 18, birthMonth: 6, skill: 59, potential: 65, bekanntheit: 0, fav: [Genre.Action, Genre.Adventure], hate: Genre.Romance, trait: TalentTrait.Arbeitstier, portrait: "w24" },
    { name: "Yara Flynn", gender: 'weiblich', age: 26, birthDay: 2, birthMonth: 11, skill: 57, potential: 70, bekanntheit: 0, fav: [Genre.Romance, Genre.Drama], hate: Genre.Horror, trait: null, portrait: "w25" },
    { name: "Zara Wilde", gender: 'weiblich', age: 24, birthDay: 7, birthMonth: 7, skill: 56, potential: 75, bekanntheit: 0, fav: [Genre.SciFi, Genre.Action], hate: Genre.Musical, trait: TalentTrait.UnentdecktesJuwel, portrait: "w26" },
    { name: "Aveline Stone", gender: 'weiblich', age: 30, birthDay: 13, birthMonth: 9, skill: 54, potential: 60, bekanntheit: 0, fav: [Genre.Musical, Genre.Fantasy], hate: Genre.War, trait: TalentTrait.Teamplayer, portrait: "w28" },
    { name: "Briar Field", gender: 'weiblich', age: 28, birthDay: 1, birthMonth: 4, skill: 53, potential: 65, bekanntheit: 0, fav: [Genre.Horror, Genre.Drama], hate: Genre.SciFi, trait: TalentTrait.Unzuverlässig, portrait: "w29" },
    { name: "Cleo Marsh", gender: 'weiblich', age: 22, birthDay: 20, birthMonth: 2, skill: 52, potential: 70, bekanntheit: 0, fav: [Genre.Comedy, Genre.Adventure], hate: Genre.Thriller, trait: null, portrait: "w30" },
    { name: "Dahlia Swift", gender: 'weiblich', age: 31, birthDay: 15, birthMonth: 3, skill: 51, potential: 55, bekanntheit: 0, fav: [Genre.Romance, Genre.Action], hate: Genre.Action, trait: null, portrait: "w31" },
    // Low Skill (18)
    { name: "Elowen Sky", gender: 'weiblich', age: 18, birthDay: 1, birthMonth: 1, skill: 35, potential: 85, bekanntheit: 0, fav: [Genre.SciFi, Genre.Action], hate: Genre.Action, trait: null, portrait: "w46" },
    { name: "Fern Oakes", gender: 'weiblich', age: 19, birthDay: 10, birthMonth: 2, skill: 32, potential: 70, bekanntheit: 0, fav: [Genre.Romance, Genre.War], hate: Genre.War, trait: null, portrait: "w47" },
    { name: "Gemma Ross", gender: 'weiblich', age: 20, birthDay: 20, birthMonth: 3, skill: 38, potential: 85, bekanntheit: 0, fav: [Genre.Comedy, Genre.Crime], hate: Genre.Crime, trait: null, portrait: "w48" },
    { name: "Harlow Kent", gender: 'weiblich', age: 24, birthDay: 5, birthMonth: 3, skill: 40, potential: 50, bekanntheit: 0, fav: [Genre.Action, Genre.Drama], hate: Genre.Drama, trait: TalentTrait.Unzuverlässig, portrait: "w51" },
    { name: "Ivy North", gender: 'weiblich', age: 29, birthDay: 12, birthMonth: 8, skill: 39, potential: 45, bekanntheit: 0, fav: [Genre.Comedy, Genre.Thriller], hate: Genre.Thriller, trait: null, portrait: "w52" },
    { name: "Jasmine Lee", gender: 'weiblich', age: 33, birthDay: 22, birthMonth: 1, skill: 38, potential: 45, bekanntheit: 0, fav: [Genre.Drama, Genre.Action], hate: Genre.Action, trait: TalentTrait.Kassengift, portrait: "w53" },
    { name: "Kaia Wolf", gender: 'weiblich', age: 21, birthDay: 14, birthMonth: 11, skill: 37, potential: 55, bekanntheit: 0, fav: [Genre.SciFi, Genre.Romance], hate: Genre.Romance, trait: null, portrait: "w54" },
    { name: "Luna Dawn", gender: 'weiblich', age: 26, birthDay: 3, birthMonth: 4, skill: 35, potential: 50, bekanntheit: 0, fav: [Genre.Western, Genre.SciFi], hate: Genre.SciFi, trait: null, portrait: "w56" },
    { name: "Mabel Pine", gender: 'weiblich', age: 31, birthDay: 25, birthMonth: 12, skill: 33, potential: 45, bekanntheit: 0, fav: [Genre.Action, Genre.Dokumentation], hate: Genre.Dokumentation, trait: TalentTrait.Diva, portrait: "w58" },
    { name: "Nola Birch", gender: 'weiblich', age: 27, birthDay: 9, birthMonth: 2, skill: 32, potential: 40, bekanntheit: 0, fav: [Genre.Adventure, Genre.War], hate: Genre.War, trait: null, portrait: "w59" },
    { name: "Olive Ward", gender: 'weiblich', age: 23, birthDay: 11, birthMonth: 10, skill: 30, potential: 55, bekanntheit: 0, fav: [Genre.Crime, Genre.Fantasy], hate: Genre.Fantasy, trait: TalentTrait.Sparfuchs, portrait: "w61" },
    { name: "Poppy Tate", gender: 'weiblich', age: 30, birthDay: 7, birthMonth: 7, skill: 29, potential: 35, bekanntheit: 0, fav: [Genre.SciFi, Genre.Western], hate: Genre.Western, trait: TalentTrait.Kassengift, portrait: "w62" },
    { name: "Quinn Lara", gender: 'weiblich', age: 28, birthDay: 16, birthMonth: 3, skill: 28, potential: 40, bekanntheit: 0, fav: [Genre.Drama, Genre.Action], hate: Genre.Action, trait: null, portrait: "w63" },
    { name: "Ruby Holt", gender: 'weiblich', age: 25, birthDay: 21, birthMonth: 12, skill: 26, potential: 45, bekanntheit: 0, fav: [Genre.Action, Genre.Romance], hate: Genre.Romance, trait: null, portrait: "w65" },
    { name: "Sadie Nash", gender: 'weiblich', age: 22, birthDay: 28, birthMonth: 2, skill: 24, potential: 50, bekanntheit: 0, fav: [Genre.Horror], hate: Genre.Drama, trait: null, portrait: "w67" },
    { name: "Thea Moss", gender: 'weiblich', age: 34, birthDay: 3, birthMonth: 4, skill: 22, potential: 35, bekanntheit: 0, fav: [Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "w69" },
    { name: "Viola Graves", gender: 'weiblich', age: 29, birthDay: 19, birthMonth: 9, skill: 21, potential: 30, bekanntheit: 0, fav: [Genre.Romance], hate: Genre.Action, trait: TalentTrait.Unzuverlässig, portrait: "w70" },
    { name: "Wren Shaw", gender: 'weiblich', age: 20, birthDay: 10, birthMonth: 7, skill: 8, potential: 35, bekanntheit: 0, fav: [Genre.Fantasy, Genre.Horror], hate: Genre.Horror, trait: TalentTrait.UnentdecktesJuwel, portrait: "w150" },
    // =================================================================
    // GRUPPE 3: 36 - 55 JAHRE (68 TOTAL: 34M, 34F)
    // =================================================================
    // MÄNNER (34)
    // High Skill (3)
    { name: "Harrison Lee", gender: 'männlich', age: 42, birthDay: 19, birthMonth: 3, skill: 92, potential: 95, bekanntheit: 0, fav: [Genre.Action, Genre.Crime], hate: Genre.Musical, trait: TalentTrait.Arbeitstier, portrait: "m3" },
    { name: "Isaac Dawn", gender: 'männlich', age: 38, birthDay: 3, birthMonth: 7, skill: 88, potential: 92, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Dokumentation, trait: TalentTrait.Publikumsliebling, portrait: "m5" },
    { name: "Jasper Finch", gender: 'männlich', age: 48, birthDay: 7, birthMonth: 6, skill: 82, potential: 85, bekanntheit: 0, fav: [Genre.Thriller, Genre.Drama], hate: Genre.Comedy, trait: TalentTrait.Arbeitstier, portrait: "m7" },
    // Mid Skill (13)
    { name: "Kingsley North", gender: 'männlich', age: 36, birthDay: 31, birthMonth: 10, skill: 65, potential: 70, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "m16" },
    { name: "Leopold Graves", gender: 'männlich', age: 40, birthDay: 11, birthMonth: 9, skill: 63, potential: 65, bekanntheit: 0, fav: [Genre.Crime, Genre.Thriller], hate: Genre.Musical, trait: TalentTrait.Perfektionist, portrait: "m18" },
    { name: "Miles Porter", gender: 'männlich', age: 36, birthDay: 29, birthMonth: 11, skill: 59, potential: 65, bekanntheit: 0, fav: [Genre.Drama, Genre.War], hate: Genre.SciFi, trait: null, portrait: "m25" },
    { name: "Nathaniel Quinn", gender: 'männlich', age: 45, birthDay: 20, birthMonth: 5, skill: 56, potential: 58, bekanntheit: 0, fav: [Genre.Dokumentation, Genre.Drama], hate: Genre.Action, trait: TalentTrait.Sparfuchs, portrait: "m27" },
    { name: "Oscar Vale", gender: 'männlich', age: 39, birthDay: 13, birthMonth: 1, skill: 55, potential: 60, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Comedy, trait: null, portrait: "m28" },
    { name: "Preston Lloyd", gender: 'männlich', age: 50, birthDay: 16, birthMonth: 8, skill: 53, potential: 55, bekanntheit: 0, fav: [Genre.Western, Genre.Drama], hate: Genre.SciFi, trait: null, portrait: "m30" },
    { name: "Rupert Mann", gender: 'männlich', age: 38, birthDay: 23, birthMonth: 7, skill: 50, potential: 55, bekanntheit: 0, fav: [Genre.Action, Genre.Romance], hate: Genre.Comedy, trait: TalentTrait.Arbeitstier, portrait: "m33" },
    { name: "Sebastian Wright", gender: 'männlich', age: 41, birthDay: 9, birthMonth: 10, skill: 48, potential: 50, bekanntheit: 0, fav: [Genre.Thriller, Genre.Comedy], hate: Genre.Comedy, trait: null, portrait: "m35" },
    { name: "Theodore Banks", gender: 'männlich', age: 44, birthDay: 30, birthMonth: 11, skill: 46, potential: 48, bekanntheit: 0, fav: [Genre.Western, Genre.Fantasy], hate: Genre.Fantasy, trait: null, portrait: "m37" },
    { name: "Victor Lane", gender: 'männlich', age: 52, birthDay: 18, birthMonth: 3, skill: 45, potential: 45, bekanntheit: 0, fav: [Genre.Drama, Genre.Action], hate: Genre.Action, trait: null, portrait: "m38" },
    { name: "Xander Swift", gender: 'männlich', age: 37, birthDay: 8, birthMonth: 9, skill: 42, potential: 60, bekanntheit: 0, fav: [Genre.Horror, Genre.Musical], hate: Genre.Musical, trait: null, portrait: "m40" },
    { name: "Zachary Noon", gender: 'männlich', age: 46, birthDay: 17, birthMonth: 3, skill: 16, potential: 18, bekanntheit: 0, fav: [Genre.Drama, Genre.Comedy], hate: Genre.Comedy, trait: null, portrait: "m75" },
    { name: "Adrian Cook", gender: 'männlich', age: 37, birthDay: 20, birthMonth: 12, skill: 14, potential: 20, bekanntheit: 0, fav: [Genre.War, Genre.Action], hate: Genre.Musical, trait: null, portrait: "m77" },
    // Low Skill (18)
    { name: "Brody Hill", gender: 'männlich', age: 40, birthDay: 30, birthMonth: 6, skill: 36, potential: 40, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Musical, trait: null, portrait: "m55" },
    { name: "Carson Lake", gender: 'männlich', age: 45, birthDay: 18, birthMonth: 9, skill: 34, potential: 38, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Comedy, trait: TalentTrait.Unzuverlässig, portrait: "m57" },
    { name: "Dawson Brooks", gender: 'männlich', age: 38, birthDay: 1, birthMonth: 5, skill: 31, potential: 35, bekanntheit: 0, fav: [Genre.Romance, Genre.Drama], hate: Genre.Horror, trait: null, portrait: "m60" },
    { name: "Ethan Ray", gender: 'männlich', age: 36, birthDay: 4, birthMonth: 8, skill: 27, potential: 30, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Thriller, trait: TalentTrait.Sparfuchs, portrait: "m64" },
    { name: "Fletcher Wood", gender: 'männlich', age: 39, birthDay: 10, birthMonth: 6, skill: 25, potential: 28, bekanntheit: 0, fav: [Genre.War, Genre.Action], hate: Genre.Musical, trait: null, portrait: "m66" },
    { name: "Gavin Scott", gender: 'männlich', age: 42, birthDay: 14, birthMonth: 10, skill: 23, potential: 25, bekanntheit: 0, fav: [Genre.Western, Genre.Adventure], hate: Genre.SciFi, trait: null, portrait: "m68" },
    { name: "Hudson King", gender: 'männlich', age: 39, birthDay: 3, birthMonth: 4, skill: 22, potential: 35, bekanntheit: 0, fav: [Genre.Thriller, Genre.Horror], hate: Genre.Comedy, trait: null, portrait: "m69" },
    { name: "Ian Sparks", gender: 'männlich', age: 38, birthDay: 11, birthMonth: 11, skill: 18, potential: 22, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Drama, trait: TalentTrait.Unzuverlässig, portrait: "m73" },
    { name: "Julian Hunt", gender: 'männlich', age: 41, birthDay: 24, birthMonth: 9, skill: 12, potential: 15, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Fantasy, trait: null, portrait: "m79" },
    { name: "Kyle Fisher", gender: 'männlich', age: 36, birthDay: 22, birthMonth: 6, skill: 10, potential: 20, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "m81" },
    { name: "Liam Burns", gender: 'männlich', age: 43, birthDay: 29, birthMonth: 1, skill: 8, potential: 12, bekanntheit: 0, fav: [Genre.Drama, Genre.Thriller], hate: Genre.Action, trait: null, portrait: "m83" },
    { name: "Mason Hall", gender: 'männlich', age: 44, birthDay: 16, birthMonth: 6, skill: 12, potential: 15, bekanntheit: 0, fav: [Genre.Western, Genre.Adventure], hate: Genre.SciFi, trait: null, portrait: "m93" },
    { name: "Noah James", gender: 'männlich', age: 39, birthDay: 7, birthMonth: 4, skill: 20, potential: 25, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Romance, trait: null, portrait: "m90" },
    { name: "Parker May", gender: 'männlich', age: 40, birthDay: 2, birthMonth: 12, skill: 14, potential: 18, bekanntheit: 0, fav: [Genre.Crime, Genre.Thriller], hate: Genre.Fantasy, trait: null, portrait: "m98" },
    { name: "Riley Todd", gender: 'männlich', age: 40, birthDay: 1, birthMonth: 3, skill: 8, potential: 15, bekanntheit: 0, fav: [Genre.Horror, Genre.SciFi], hate: Genre.Comedy, trait: null, portrait: "m86" },
    { name: "Sawyer Dean", gender: 'männlich', age: 40, birthDay: 26, birthMonth: 12, skill: 22, potential: 30, bekanntheit: 0, fav: [Genre.Crime, Genre.Drama], hate: Genre.Fantasy, trait: null, portrait: "m89" },
    { name: "Tyler Rich", gender: 'männlich', age: 36, birthDay: 9, birthMonth: 1, skill: 18, potential: 22, bekanntheit: 0, fav: [Genre.Romance, Genre.Comedy], hate: Genre.Thriller, trait: null, portrait: "m95" },
    { name: "Wyatt Pool", gender: 'männlich', age: 45, birthDay: 29, birthMonth: 7, skill: 21, potential: 35, bekanntheit: 0, fav: [Genre.Drama, Genre.Western], hate: Genre.Action, trait: null, portrait: "m100" },
    // FRAUEN (34)
    // High Skill (3)
    { name: "Alice Moore", gender: 'weiblich', age: 52, birthDay: 22, birthMonth: 6, skill: 96, potential: 96, bekanntheit: 0, fav: [Genre.Drama, Genre.Dokumentation], hate: Genre.Action, trait: TalentTrait.Perfektionist, portrait: "w2" },
    { name: "Beatrice Hill", gender: 'weiblich', age: 37, birthDay: 4, birthMonth: 6, skill: 86, potential: 90, bekanntheit: 0, fav: [Genre.Action, Genre.Fantasy], hate: Genre.Comedy, trait: TalentTrait.Diva, portrait: "w6" },
    { name: "Charlotte Ray", gender: 'weiblich', age: 41, birthDay: 14, birthMonth: 5, skill: 80, potential: 85, bekanntheit: 0, fav: [Genre.Fantasy, Genre.Drama], hate: Genre.Action, trait: TalentTrait.Perfektionist, portrait: "w8" },
    // Mid Skill (13)
    { name: "Dorothy Cook", gender: 'weiblich', age: 49, birthDay: 8, birthMonth: 10, skill: 77, potential: 80, bekanntheit: 0, fav: [Genre.SciFi, Genre.Horror], hate: Genre.Romance, trait: TalentTrait.Arbeitstier, portrait: "w9" },
    { name: "Eleanor King", gender: 'weiblich', age: 37, birthDay: 12, birthMonth: 12, skill: 68, potential: 75, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "w14" },
    { name: "Florence May", gender: 'weiblich', age: 38, birthDay: 10, birthMonth: 5, skill: 63, potential: 68, bekanntheit: 0, fav: [Genre.Thriller, Genre.Drama], hate: Genre.Fantasy, trait: TalentTrait.Perfektionist, portrait: "w18" },
    { name: "Grace Ford", gender: 'weiblich', age: 45, birthDay: 25, birthMonth: 12, skill: 55, potential: 55, bekanntheit: 0, fav: [Genre.Crime, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "w27" },
    { name: "Harriet Wood", gender: 'weiblich', age: 37, birthDay: 8, birthMonth: 8, skill: 50, potential: 52, bekanntheit: 0, fav: [Genre.Drama, Genre.SciFi], hate: Genre.SciFi, trait: null, portrait: "w32" },
    { name: "Imogen Scott", gender: 'weiblich', age: 39, birthDay: 22, birthMonth: 10, skill: 49, potential: 65, bekanntheit: 0, fav: [Genre.Comedy, Genre.Western], hate: Genre.Western, trait: null, portrait: "w33" },
    { name: "Josephine Law", gender: 'weiblich', age: 42, birthDay: 4, birthMonth: 5, skill: 48, potential: 50, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Musical, trait: null, portrait: "w34" },
    { name: "Katherine Hunt", gender: 'weiblich', age: 36, birthDay: 17, birthMonth: 1, skill: 47, potential: 60, bekanntheit: 0, fav: [Genre.Action, Genre.Adventure], hate: Genre.Romance, trait: null, portrait: "w35" },
    { name: "Lillian Hall", gender: 'weiblich', age: 40, birthDay: 11, birthMonth: 6, skill: 46, potential: 50, bekanntheit: 0, fav: [Genre.Fantasy, Genre.SciFi], hate: Genre.Crime, trait: null, portrait: "w36" },
    { name: "Matilda Wright", gender: 'weiblich', age: 38, birthDay: 3, birthMonth: 12, skill: 45, potential: 70, bekanntheit: 0, fav: [Genre.SciFi, Genre.Thriller], hate: Genre.Drama, trait: null, portrait: "w37" },
    { name: "Nora Brooks", gender: 'weiblich', age: 48, birthDay: 28, birthMonth: 2, skill: 44, potential: 46, bekanntheit: 0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: null, portrait: "w38" },
    { name: "Penelope Dean", gender: 'weiblich', age: 42, birthDay: 9, birthMonth: 9, skill: 43, potential: 55, bekanntheit: 0, fav: [Genre.Romance, Genre.Comedy], hate: Genre.Horror, trait: null, portrait: "w39" },
    { name: "Rosalind Banks", gender: 'weiblich', age: 45, birthDay: 19, birthMonth: 11, skill: 42, potential: 45, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Thriller, trait: null, portrait: "w40" },
    // Low Skill (18)
    { name: "Sophia James", gender: 'weiblich', age: 40, birthDay: 30, birthMonth: 6, skill: 36, potential: 40, bekanntheit: 0, fav: [Genre.Horror, Genre.SciFi], hate: Genre.Musical, trait: null, portrait: "w55" },
    { name: "Tabitha Lowe", gender: 'weiblich', age: 45, birthDay: 18, birthMonth: 9, skill: 34, potential: 38, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Comedy, trait: TalentTrait.Unzuverlässig, portrait: "w57" },
    { name: "Victoria Rich", gender: 'weiblich', age: 36, birthDay: 1, birthMonth: 5, skill: 31, potential: 35, bekanntheit: 0, fav: [Genre.Romance, Genre.Drama], hate: Genre.Horror, trait: null, portrait: "w60" },
    { name: "Winifred Pool", gender: 'weiblich', age: 36, birthDay: 4, birthMonth: 8, skill: 27, potential: 30, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Thriller, trait: TalentTrait.Sparfuchs, portrait: "w64" },
    { name: "Audrey Clark", gender: 'weiblich', age: 39, birthDay: 10, birthMonth: 6, skill: 25, potential: 28, bekanntheit: 0, fav: [Genre.War, Genre.Drama], hate: Genre.Musical, trait: null, portrait: "w66" },
    { name: "Bella Lake", gender: 'weiblich', age: 42, birthDay: 14, birthMonth: 10, skill: 23, potential: 25, bekanntheit: 0, fav: [Genre.Western, Genre.Adventure], hate: Genre.SciFi, trait: null, portrait: "w68" },
    { name: "Chloe Burns", gender: 'weiblich', age: 38, birthDay: 25, birthMonth: 5, skill: 19, potential: 40, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Thriller, trait: null, portrait: "w72" },
    { name: "Daisy Fisher", gender: 'weiblich', age: 38, birthDay: 11, birthMonth: 11, skill: 18, potential: 22, bekanntheit: 0, fav: [Genre.Action, Genre.Adventure], hate: Genre.Drama, trait: TalentTrait.Unzuverlässig, portrait: "w73" },
    { name: "Emma Todd", gender: 'weiblich', age: 42, birthDay: 30, birthMonth: 7, skill: 17, potential: 30, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "w74" },
    { name: "Fiona Carr", gender: 'weiblich', age: 46, birthDay: 17, birthMonth: 3, skill: 16, potential: 18, bekanntheit: 0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Comedy, trait: null, portrait: "w75" },
    { name: "Georgia Guest", gender: 'weiblich', age: 37, birthDay: 20, birthMonth: 12, skill: 14, potential: 20, bekanntheit: 0, fav: [Genre.War, Genre.Action], hate: Genre.Musical, trait: null, portrait: "w77" },
    { name: "Hannah Lloyd", gender: 'weiblich', age: 39, birthDay: 9, birthMonth: 4, skill: 13, potential: 35, bekanntheit: 0, fav: [Genre.Western, Genre.Adventure], hate: Genre.SciFi, trait: null, portrait: "w78" },
    { name: "Isabel Price", gender: 'weiblich', age: 41, birthDay: 24, birthMonth: 9, skill: 12, potential: 15, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Fantasy, trait: null, portrait: "w79" },
    { name: "Julia Mann", gender: 'weiblich', age: 46, birthDay: 8, birthMonth: 2, skill: 11, potential: 25, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Drama, trait: null, portrait: "w80" },
    { name: "Kylie Sparks", gender: 'weiblich', age: 43, birthDay: 29, birthMonth: 1, skill: 8, potential: 12, bekanntheit: 0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: null, portrait: "w83" },
    { name: "Lily Porter", gender: 'weiblich', age: 44, birthDay: 16, birthMonth: 6, skill: 12, potential: 15, bekanntheit: 0, fav: [Genre.Western, Genre.Adventure], hate: Genre.SciFi, trait: null, portrait: "w93" },
    { name: "Mia Chase", gender: 'weiblich', age: 39, birthDay: 7, birthMonth: 4, skill: 20, potential: 25, bekanntheit: 0, fav: [Genre.Thriller, Genre.Crime], hate: Genre.Romance, trait: null, portrait: "w90" },
    { name: "Kia Barnes", gender: 'weiblich', age: 40, birthDay: 2, birthMonth: 12, skill: 14, potential: 18, bekanntheit: 0, fav: [Genre.Crime, Genre.Thriller], hate: Genre.Fantasy, trait: null, portrait: "w98" },
    // =================================================================
    // GRUPPE 4: 56 - 75 JAHRE (38 TOTAL: 19M, 19F)
    // =================================================================
    // MÄNNER (19)
    // High Skill (2)
    { name: "Zane Carr", gender: 'männlich', age: 60, birthDay: 17, birthMonth: 8, skill: 90, potential: 90, bekanntheit: 0, fav: [Genre.Crime, Genre.Drama], hate: Genre.SciFi, trait: TalentTrait.Diva, portrait: "m4" },
    { name: "Benedict Snow", gender: 'männlich', age: 65, birthDay: 21, birthMonth: 12, skill: 78, potential: 80, bekanntheit: 0, fav: [Genre.Action, Genre.Crime], hate: Genre.Romance, trait: TalentTrait.Teamplayer, portrait: "m9" },
    // Mid Skill (8)
    { name: "Caspian Fox", gender: 'männlich', age: 60, birthDay: 5, birthMonth: 3, skill: 45, potential: 50, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "m49" },
    { name: "Darius Law", gender: 'männlich', age: 62, birthDay: 15, birthMonth: 8, skill: 40, potential: 55, bekanntheit: 0, fav: [Genre.Comedy, Genre.Adventure], hate: Genre.War, trait: null, portrait: "m50" },
    { name: "Evander Heath", gender: 'männlich', age: 65, birthDay: 30, birthMonth: 7, skill: 17, potential: 30, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "m74" },
    { name: "Fabian Guest", gender: 'männlich', age: 58, birthDay: 2, birthMonth: 8, skill: 15, potential: 45, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Romance, trait: null, portrait: "m76" },
    { name: "Gabriel Moon", gender: 'männlich', age: 70, birthDay: 9, birthMonth: 4, skill: 13, potential: 35, bekanntheit: 0, fav: [Genre.Western, Genre.Adventure], hate: Genre.SciFi, trait: null, portrait: "m78" },
    { name: "Hugo Chase", gender: 'männlich', age: 68, birthDay: 8, birthMonth: 2, skill: 11, potential: 25, bekanntheit: 0, fav: [Genre.Action, Genre.Thriller], hate: Genre.Drama, trait: null, portrait: "m80" },
    { name: "Julian Stark", gender: 'männlich', age: 72, birthDay: 13, birthMonth: 10, skill: 9, potential: 30, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "m82" },
    { name: "Kieran Hope", gender: 'männlich', age: 57, birthDay: 5, birthMonth: 5, skill: 8, potential: 35, bekanntheit: 0, fav: [Genre.Romance, Genre.Drama], hate: Genre.Thriller, trait: null, portrait: "m84" },
    // Low Skill (9)
    { name: "Lucian Bolt", gender: 'männlich', age: 60, birthDay: 15, birthMonth: 11, skill: 8, potential: 25, bekanntheit: 0, fav: [Genre.War, Genre.Action], hate: Genre.Musical, trait: null, portrait: "m85" },
    { name: "Mathias Creed", gender: 'männlich', age: 66, birthDay: 18, birthMonth: 7, skill: 8, potential: 40, bekanntheit: 0, fav: [Genre.Action, Genre.Adventure], hate: Genre.Drama, trait: null, portrait: "m87" },
    { name: "Nico Shade", gender: 'männlich', age: 59, birthDay: 12, birthMonth: 8, skill: 25, potential: 40, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "m88" },
    { name: "Oliver Rust", gender: 'männlich', age: 75, birthDay: 21, birthMonth: 9, skill: 28, potential: 45, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "m91" },
    { name: "Percival Wray", gender: 'männlich', age: 63, birthDay: 4, birthMonth: 2, skill: 15, potential: 25, bekanntheit: 0, fav: [Genre.War, Genre.Drama], hate: Genre.Musical, trait: null, portrait: "m92" },
    { name: "Quentin Farr", gender: 'männlich', age: 67, birthDay: 30, birthMonth: 10, skill: 24, potential: 38, bekanntheit: 0, fav: [Genre.Drama, Genre.Thriller], hate: Genre.Action, trait: null, portrait: "m94" },
    { name: "Rafferty Oakes", gender: 'männlich', age: 61, birthDay: 23, birthMonth: 5, skill: 26, potential: 50, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Drama, trait: TalentTrait.UnentdecktesJuwel, portrait: "m96" },
    { name: "Soren Kye", gender: 'männlich', age: 70, birthDay: 14, birthMonth: 8, skill: 19, potential: 30, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "m97" },
    { name: "Tristan Vore", gender: 'männlich', age: 58, birthDay: 18, birthMonth: 3, skill: 11, potential: 25, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "m99" },
    // FRAUEN (19)
    // High Skill (2)
    { name: "Natalie Heath", gender: 'weiblich', age: 60, birthDay: 1, birthMonth: 1, skill: 85, potential: 85, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "w49" },
    { name: "Olivia Dawn", gender: 'weiblich', age: 65, birthDay: 1, birthMonth: 1, skill: 80, potential: 80, bekanntheit: 0, fav: [Genre.Adventure, Genre.Fantasy], hate: Genre.Thriller, trait: null, portrait: "w50" },
    // Mid Skill (8)
    { name: "Paige Frye", gender: 'weiblich', age: 56, birthDay: 22, birthMonth: 6, skill: 10, potential: 20, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "w81" },
    { name: "Riley Noon", gender: 'weiblich', age: 59, birthDay: 13, birthMonth: 10, skill: 9, potential: 30, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "w82" },
    { name: "Stella Bolt", gender: 'weiblich', age: 62, birthDay: 5, birthMonth: 5, skill: 8, potential: 35, bekanntheit: 0, fav: [Genre.Romance, Genre.Drama], hate: Genre.Thriller, trait: null, portrait: "w84" },
    { name: "Taylor Vale", gender: 'weiblich', age: 67, birthDay: 15, birthMonth: 11, skill: 8, potential: 25, bekanntheit: 0, fav: [Genre.War, Genre.Drama], hate: Genre.Musical, trait: null, portrait: "w85" },
    { name: "Zoe Shade", gender: 'weiblich', age: 60, birthDay: 1, birthMonth: 3, skill: 8, potential: 15, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "w86" },
    { name: "Amara Creed", gender: 'weiblich', age: 72, birthDay: 18, birthMonth: 7, skill: 8, potential: 40, bekanntheit: 0, fav: [Genre.Action, Genre.Adventure], hate: Genre.Drama, trait: null, portrait: "w87" },
    { name: "Bianca Rust", gender: 'weiblich', age: 58, birthDay: 12, birthMonth: 8, skill: 25, potential: 40, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "w88" },
    { name: "Celeste Wray", gender: 'weiblich', age: 64, birthDay: 26, birthMonth: 12, skill: 22, potential: 30, bekanntheit: 0, fav: [Genre.Crime, Genre.Thriller], hate: Genre.Fantasy, trait: null, portrait: "w89" },
    // Low Skill (9)
    { name: "Daphne Farr", gender: 'weiblich', age: 61, birthDay: 21, birthMonth: 9, skill: 28, potential: 45, bekanntheit: 0, fav: [Genre.Comedy, Genre.Romance], hate: Genre.Horror, trait: null, portrait: "w91" },
    { name: "Elena Kye", gender: 'weiblich', age: 70, birthDay: 4, birthMonth: 2, skill: 15, potential: 25, bekanntheit: 0, fav: [Genre.War, Genre.Drama], hate: Genre.Musical, trait: null, portrait: "w92" },
    { name: "Felicity Vore", gender: 'weiblich', age: 66, birthDay: 30, birthMonth: 10, skill: 24, potential: 38, bekanntheit: 0, fav: [Genre.Drama, Genre.Thriller], hate: Genre.Action, trait: null, portrait: "w94" },
    { name: "Genevieve Hope", gender: 'weiblich', age: 57, birthDay: 9, birthMonth: 1, skill: 18, potential: 22, bekanntheit: 0, fav: [Genre.Romance, Genre.Comedy], hate: Genre.Thriller, trait: null, portrait: "w95" },
    { name: "Helena Stark", gender: 'weiblich', age: 63, birthDay: 23, birthMonth: 5, skill: 26, potential: 50, bekanntheit: 0, fav: [Genre.Action, Genre.SciFi], hate: Genre.Drama, trait: TalentTrait.UnentdecktesJuwel, portrait: "w96" },
    { name: "Iris Law", gender: 'weiblich', age: 74, birthDay: 14, birthMonth: 8, skill: 19, potential: 30, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Comedy, trait: null, portrait: "w97" },
    { name: "Juliette O’Connell", gender: 'weiblich', age: 69, birthDay: 18, birthMonth: 3, skill: 11, potential: 25, bekanntheit: 0, fav: [Genre.SciFi, Genre.Fantasy], hate: Genre.Western, trait: null, portrait: "w99" },
    { name: "Lorelei Adler", gender: 'weiblich', age: 58, birthDay: 29, birthMonth: 7, skill: 21, potential: 35, bekanntheit: 0, fav: [Genre.Drama, Genre.Romance], hate: Genre.Action, trait: null, portrait: "w100" },
    { name: "Seraphina Drake", gender: 'weiblich', age: 65, birthDay: 2, birthMonth: 8, skill: 15, potential: 45, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Romance, trait: null, portrait: "w76" },
    { name: "Vivian Mercer", gender: 'weiblich', age: 65, birthDay: 2, birthMonth: 8, skill: 15, potential: 45, bekanntheit: 0, fav: [Genre.Horror, Genre.Thriller], hate: Genre.Romance, trait: null, portrait: "w76" },
    // Eigene Charakter
    { name: "Danielle Jumper", gender: 'weiblich', age: 25, birthDay: 22, birthMonth: 5, skill: 15, potential: 75, bekanntheit: 0, fav: [Genre.Horror, Genre.Action], hate: Genre.Romance, trait: TalentTrait.Publikumsliebling, portrait: "e5" },
    { name: "Tom Taylor", gender: 'männlich', age: 20, birthDay: 10, birthMonth: 5, skill: 13, potential: 76, bekanntheit: 0, fav: [Genre.SciFi, Genre.Action], hate: Genre.Western, trait: TalentTrait.Publikumsliebling, portrait: "e3" },
    { name: "Floyd Snyder", gender: 'männlich', age: 18, birthDay: 2, birthMonth: 2, skill: 11, potential: 75, bekanntheit: 0, fav: [Genre.Crime, Genre.Drama], hate: Genre.Western, trait: TalentTrait.Publikumsliebling, portrait: "e4" },
];
export const generateInitialActors = () => {
    const actors = [];
    const gameStartDate = new Date(1990, 0, 1);
    // Wir beginnen bei ID 1000 für Schauspieler
    let startId = 1000;
    ACTOR_DEFINITIONS.forEach((def, index) => {
        const birthYear = gameStartDate.getFullYear() - def.age;
        // Erstelle Geburtsdatum: Monat ist 0-basiert in JS (birthMonth - 1)
        const birthDate = new Date(birthYear, (def.birthMonth || 1) - 1, def.birthDay || 1);
        // Kostenberechnung
        let multiplier = 9;
        if (def.skill <= 20)
            multiplier = 2;
        else if (def.skill <= 50)
            multiplier = 4;
        else if (def.skill <= 80)
            multiplier = 6;
        const baseCost = 15000 + multiplier * Math.pow(def.skill, 3.1);
        const cost = Math.round(baseCost / 100) * 100;
        // Portrait-Daten abrufen
        const portraitData = portraitDataMap[def.portrait] || { skin: 'light', hair: 'brown' };
        const actor = {
            id: startId + index,
            name: def.name,
            gender: def.gender,
            birthDate: birthDate,
            skill: def.skill,
            cost: cost,
            bekanntheit: def.bekanntheit,
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
        actors.push(actor);
    });
    return actors.sort((a, b) => b.skill - a.skill);
};
