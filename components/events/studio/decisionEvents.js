import { applyTransaction, newspaperImage, calculateEventCost } from '../eventHelpers';
// Helper to calculate dynamic costs based on player wealth/level using the standard helper percentages
const getBalancedCost = (capital, tier) => {
    let pct = 0.01;
    if (tier === 'low')
        pct = 0.005; // 0.5%
    if (tier === 'medium')
        pct = 0.02; // 2.0%
    if (tier === 'high')
        pct = 0.05; // 5.0% (Max Cap)
    return calculateEventCost(capital, pct);
};
export const DECISION_EVENTS = [
    {
        id: 'dec_01_charity',
        category: 'Studio',
        title: 'Anfrage: Wohltätigkeitsgala',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Charity Foundation',
        actions: [
            { text: 'Großzügig spenden', value: 'donate', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Mittel, Ruf +1' },
            { text: 'Höflich absagen', value: 'decline', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Auswirkungen' }
        ]
    },
    {
        id: 'dec_02_bribe',
        category: 'Studio',
        title: 'Indiskretes Angebot',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Filmkritiker-Verband',
        actions: [
            { text: 'Bezahlen (Ruf-Risiko)', value: 'pay', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Kosten: Mittel, Chance auf Ruf +1 oder -1' },
            { text: 'Ablehnen', value: 'refuse', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Auswirkungen' }
        ]
    },
    {
        id: 'dec_03_security',
        category: 'Studio',
        title: 'Sicherheitslücke entdeckt',
        text: '',
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        actions: [
            { text: 'System patchen (Mittel)', value: 'patch', className: 'bg-amber-600 text-white font-bold py-2 px-4 rounded hover:bg-amber-500', tooltip: 'Kosten: Mittel, Problem gelöst' },
            { text: 'Risiko eingehen', value: 'risk', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Kostenlos, aber Risiko eines Datenlecks' }
        ]
    },
    {
        id: 'dec_04_indie',
        category: 'Studio',
        title: 'Indie-Projekt finanzieren',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Nachwuchs-Regisseur',
        actions: [
            { text: 'Finanzieren', value: 'fund', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Mittel, Chance auf Ruf +1 & FP' },
            { text: 'Ablehnen', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Auswirkungen' }
        ]
    },
    {
        id: 'dec_05_eco',
        category: 'Studio',
        title: 'Grüne Initiative',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Umweltamt',
        actions: [
            { text: 'Umrüsten (Teuer)', value: 'upgrade', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Hoch, Ruf +1' },
            { text: 'Ignorieren', value: 'ignore', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Risiko von Ruf -1' }
        ]
    },
    {
        id: 'dec_06_scandal',
        category: 'Studio',
        title: 'PR-Krise: Star-Skandal',
        text: '',
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        actions: [
            { text: 'Star verteidigen', value: 'defend', className: 'bg-amber-600 text-white font-bold py-2 px-4 rounded hover:bg-amber-500', tooltip: 'Chance auf Ruf +1 oder -1' },
            { text: 'Distanzieren', value: 'distance', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Vermeidet Skandal, Ruf -1' }
        ]
    },
    {
        id: 'dec_07_merch',
        category: 'Studio',
        title: 'Fragwürdiger Merch-Deal',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Lizenzabteilung',
        actions: [
            { text: 'Deal machen (Geld)', value: 'deal', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Einnahmen, Ruf -1' },
            { text: 'Qualität wahren (Ruf)', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Einnahmen, Ruf +1' }
        ]
    },
    {
        id: 'dec_08_party',
        category: 'Studio',
        title: 'Mitarbeiterfest',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Personalrat',
        actions: [
            { text: 'Große Party schmeißen', value: 'big_party', className: 'bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-500', tooltip: 'Kosten: Mittel, Moral ++' },
            { text: 'Kleine Feier', value: 'small_party', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Niedrig, Moral +' },
            { text: 'Absagen', value: 'cancel', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Kostenlos, Moral -' }
        ]
    },
    {
        id: 'dec_09_tour',
        category: 'Studio',
        title: 'Studiotouren',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Marketingabteilung',
        actions: [
            { text: 'Erlauben (Einnahmen)', value: 'allow', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kleine Einnahmen' },
            { text: 'Privatsphäre wahren', value: 'deny', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Auswirkungen' }
        ]
    },
    {
        id: 'dec_10_spy',
        category: 'Studio',
        title: 'Verdacht auf Spionage',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Sicherheitsdienst',
        actions: [
            { text: 'Privatdetektiv (Mittel)', value: 'investigate', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Mittel, Chance Spion zu fangen' },
            { text: 'Intern warnen', value: 'warn', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Kostenlos, Risiko von Ideendiebstahl' }
        ]
    },
    {
        id: 'dec_11_ransomware',
        category: 'Studio',
        title: 'Ransomware-Angriff',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Unbekannte Hacker',
        actions: [
            { text: 'Lösegeld zahlen', value: 'pay', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Kosten: Hoch, Daten sofort zurück' },
            { text: 'IT-Abteilung reparieren lassen', value: 'fix', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Niedrig, Risiko von Datenverlust' }
        ]
    },
    {
        id: 'dec_12_nepotism',
        category: 'Studio',
        title: 'Eine Bitte des Bürgermeisters',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Bürgermeister',
        actions: [
            { text: 'Neffen einstellen', value: 'hire', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Ruf +1, Moral -5' },
            { text: 'Ablehnen', value: 'refuse', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Ruf -1, Moral +2' }
        ]
    },
    {
        id: 'dec_13_preservation',
        category: 'Studio',
        title: 'Historische Kulisse',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Denkmalschutzamt',
        actions: [
            { text: 'Restaurieren (Mittel)', value: 'restore', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Mittel, Ruf +1' },
            { text: 'Abreißen', value: 'demolish', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Kostenlos, Ruf -1' }
        ]
    },
    {
        id: 'dec_14_strike_threat',
        category: 'Studio',
        title: 'Streikandrohung',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Gewerkschaft',
        actions: [
            { text: 'Lohnerhöhung', value: 'raise', className: 'bg-yellow-600 text-white font-bold py-2 px-4 rounded hover:bg-yellow-500', tooltip: 'Kosten: Mittel, Moral ++' },
            { text: 'Hart bleiben', value: 'risk', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Risiko: Produktionsstopp oder Moral -' }
        ]
    },
    {
        id: 'dec_15_leak',
        category: 'Studio',
        title: 'Datenleck in der Verwaltung',
        text: 'Ein unvorsichtiger Mitarbeiter hat einen Laptop mit internen Gehaltslisten und Strategiepapieren im Zug vergessen. Ein Journalist bietet an, die Story gegen eine "Exklusiv-Interview"-Zusage unter den Teppich zu kehren. Alternativ riskieren wir den Skandal.',
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        actions: [
            { text: 'Deal eingehen (Interview)', value: 'rewrite', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Bindend, Ruf gerettet' },
            { text: 'Aussitzen (Risiko)', value: 'spin', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Risiko von Rufverlust' }
        ]
    },
    {
        id: 'dec_16_sponsor',
        category: 'Studio',
        title: 'Kontroverser Sponsor',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Marketingabteilung',
        actions: [
            { text: 'Geld annehmen', value: 'take', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Viel Geld, Ruf -1' },
            { text: 'Ablehnen', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Ruf +1' }
        ]
    },
    {
        id: 'dec_17_art',
        category: 'Studio',
        title: 'Historische Kamera-Auktion',
        text: 'Eine seltene, antike Filmkamera aus den 1920ern wird versteigert. Sie würde sich hervorragend in der Lobby machen und Besucher beeindrucken, ist aber eigentlich überteuert.',
        imageUrl: newspaperImage,
        sender: 'Einkauf',
        actions: [
            { text: 'Kaufen (Prestige)', value: 'buy', className: 'bg-amber-600 text-white font-bold py-2 px-4 rounded hover:bg-amber-500', tooltip: 'Hohe Kosten, Ruf +1' },
            { text: 'Ignorieren', value: 'police', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Geld gespart' }
        ]
    },
    {
        id: 'dec_18_docu',
        category: 'Studio',
        title: 'Enthüllungs-Doku',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Journalist',
        actions: [
            { text: 'Kooperieren', value: 'coop', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Ruf +1, Moral -' },
            { text: 'Blockieren', value: 'block', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Risiko: Ruf -1 bei Veröffentlichung' }
        ]
    },
    {
        id: 'dec_19_jury',
        category: 'Studio',
        title: 'Jury-Einladung',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Filmfestival',
        actions: [
            { text: 'Annehmen', value: 'accept', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Ruf +1' },
            { text: 'Absagen', value: 'decline', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Auswirkungen' }
        ]
    },
    {
        id: 'dec_20_merger',
        category: 'Studio',
        title: 'Übernahme-Gerüchte',
        text: '',
        imageUrl: newspaperImage,
        sender: 'PR-Abteilung',
        actions: [
            { text: 'Dementieren', value: 'deny', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Beruhigt Personal (Moral +)' },
            { text: 'Anheizen', value: 'stoke', className: 'bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-500', tooltip: 'Chance auf Aktienkurs-Anstieg' }
        ]
    },
    {
        id: 'dec_21_ai_script',
        category: 'Studio',
        title: 'KI-Drehbuch-Tools',
        text: '',
        imageUrl: newspaperImage,
        sender: 'IT-Abteilung',
        actions: [
            { text: 'Einführen (Sparen)', value: 'adopt', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Spart Kosten, Qualität -, Moral -' },
            { text: 'Ablehnen (Qualität)', value: 'reject', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Moral +, Ruf +1' }
        ]
    },
    {
        id: 'dec_22_paparazzi',
        category: 'Studio',
        title: 'Paparazzi-Drohne',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Sicherheitsdienst',
        actions: [
            { text: 'Abschießen!', value: 'shoot', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Rechtliches Risiko, Moral Team +' },
            { text: 'Ignorieren', value: 'ignore', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Leaks möglich, Moral -' }
        ]
    },
    {
        id: 'dec_23_haunted',
        category: 'Studio',
        title: 'Spuk am Set',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Nachtwächter',
        actions: [
            { text: 'Exorzist rufen', value: 'exorcist', className: 'bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-500', tooltip: 'Kosten: Klein, Moral +' },
            { text: 'Für PR nutzen', value: 'pr', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Hype +, Moral -' }
        ]
    },
    {
        id: 'dec_24_streaming',
        category: 'Studio',
        title: 'Verkauf von Archiv-Rechten',
        text: 'Ein kleiner Streaming-Dienst bietet uns eine Pauschalsumme, um Zugriff auf unser Archiv an alten Produktionsnotizen und "B-Roll"-Material zu erhalten. Es ist schnelles Geld, aber wir verlieren die exklusive Kontrolle über unser Erbe.',
        imageUrl: newspaperImage,
        sender: 'Lizenzabteilung',
        actions: [
            { text: 'Verkaufen (Kapital)', value: 'accept', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Viel Geld, Ruf -1' },
            { text: 'Behalten (Kontrolle)', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Ruf +1' }
        ]
    },
    {
        id: 'dec_25_foreign_censorship',
        category: 'Studio',
        title: 'Politische Wahlkampfspende',
        text: 'Ein aussichtsreicher Bürgermeisterkandidat bittet um eine offizielle Spende des Studios. Er verspricht im Gegenzug wirtschaftsfreundliche Politik und weniger Auflagen.',
        imageUrl: newspaperImage,
        sender: 'Wahlkampfteam',
        actions: [
            { text: 'Spenden (Einfluss)', value: 'cut', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Mittel Kosten, Ruf +1' },
            { text: 'Neutral bleiben', value: 'refuse', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Auswirkungen' }
        ]
    },
    {
        id: 'dec_26_child_tutor',
        category: 'Studio',
        title: 'Forderung nach Betriebskita',
        text: 'Die Belegschaft wächst und viele Mitarbeiter fordern eine Kinderbetreuung auf dem Studiogelände. Das würde die Moral enorm steigern, ist aber im Unterhalt teuer.',
        imageUrl: newspaperImage,
        sender: 'Betriebsrat',
        actions: [
            { text: 'Bauen & Finanzieren', value: 'hire', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Hoch, Moral ++' },
            { text: 'Ablehnen', value: 'cheap', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Moral -' }
        ]
    },
    {
        id: 'dec_27_outsourcing',
        category: 'Studio',
        title: 'VFX Outsourcing',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Produktionsleitung',
        actions: [
            { text: 'Billiganbieter', value: 'cheap', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Spart Geld, Qualität -' },
            { text: 'In-House behalten', value: 'keep', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Teuer, Qualität +' }
        ]
    },
    {
        id: 'dec_28_inspection',
        category: 'Studio',
        title: 'Hygiene-Mängel in der Kantine',
        text: 'Das Gesundheitsamt hat Mängel in der Studiokantine festgestellt. Wir können den Betrieb für eine Woche schließen und alles grundreinigen (Mitarbeiter unzufrieden) oder eine Strafe zahlen und bei laufendem Betrieb renovieren.',
        imageUrl: newspaperImage,
        sender: 'Gesundheitsamt',
        actions: [
            { text: 'Schließen & Reinigen', value: 'fix', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Kosten: Niedrig, Moral -5' },
            { text: 'Strafe & Umbau', value: 'bribe', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Kosten: Hoch, Moral +2' }
        ]
    },
    {
        id: 'dec_29_directors_cut',
        category: 'Studio',
        title: 'Digitalisierung des Archivs',
        text: 'Unsere alten Masterbänder im Keller beginnen sich zu zersetzen. Der Archivar drängt auf eine teure Digitalisierung, um die Firmengeschichte zu retten. Es bringt keinen direkten Gewinn, aber erhält den Firmenwert.',
        imageUrl: newspaperImage,
        sender: 'Archivar',
        actions: [
            { text: 'Investieren', value: 'allow', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Mittel, Ruf +1' },
            { text: 'Risiko eingehen', value: 'deny', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Chance auf Rufverlust' }
        ]
    },
    {
        id: 'dec_30_noise',
        category: 'Studio',
        title: 'Lärmbeschwerde',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Anwohnervereinigung',
        actions: [
            { text: 'Lärmschutzwand', value: 'wall', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Mittel, Problem gelöst' },
            { text: 'Ignorieren', value: 'ignore', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Risiko: Ruf -1' }
        ]
    },
    {
        id: 'dec_31_videogame',
        category: 'Studio',
        title: 'Videospiel-Lizenz',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Game Studio',
        actions: [
            { text: 'Schnelles Spiel', value: 'trash', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Viel Geld, Ruf -1' },
            { text: 'Qualitätsanspruch', value: 'quality', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Wenig Geld, Ruf +1' }
        ]
    },
    {
        id: 'dec_32_award_lobby',
        category: 'Studio',
        title: 'Award-Lobbying',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Marketing',
        actions: [
            { text: 'Kampagne starten', value: 'campaign', className: 'bg-amber-600 text-white font-bold py-2 px-4 rounded hover:bg-amber-500', tooltip: 'Kosten: Mittel, Prestige-Chance +' },
            { text: 'Fair bleiben', value: 'fair', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Kosten' }
        ]
    },
    {
        id: 'dec_33_diversity',
        category: 'Studio',
        title: 'Diversity-Initiative',
        text: '',
        imageUrl: newspaperImage,
        sender: 'HR',
        actions: [
            { text: 'Programm starten', value: 'start', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Mittel, Ruf +1, Moral +' },
            { text: 'Später vielleicht', value: 'later', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Ruf -1' }
        ]
    },
    {
        id: 'dec_34_parking',
        category: 'Studio',
        title: 'Parkplatz-Krieg',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Betriebsrat',
        actions: [
            { text: 'Parkhaus bauen', value: 'build', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Hoch, Moral +' },
            { text: 'Plätze für alle', value: 'vip', className: 'bg-yellow-600 text-white font-bold py-2 px-4 rounded hover:bg-yellow-500', tooltip: 'Kostenlos, Stars sauer, Crew happy' }
        ]
    },
    {
        id: 'dec_35_espionage',
        category: 'Studio',
        title: 'Industriespionage',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Informant',
        actions: [
            { text: 'Infos kaufen', value: 'buy', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Kosten: Mittel, FP +, Risiko' },
            { text: 'Ablehnen', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Sicher' }
        ]
    },
    {
        id: 'dec_36_food_poison',
        category: 'Studio',
        title: 'Lebensmittelvergiftung',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Kantine',
        actions: [
            { text: 'Schweigegeld', value: 'hush', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Mittel, Skandal vermieden' },
            { text: 'Entschuldigen', value: 'public', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Ruf -1' }
        ]
    },
    {
        id: 'dec_37_reality',
        category: 'Studio',
        title: 'Reality-Show',
        text: '',
        imageUrl: newspaperImage,
        sender: 'TV-Sender',
        actions: [
            { text: 'Dreh erlauben', value: 'allow', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Geld +, Moral -' },
            { text: 'Privatsphäre wahren', value: 'deny', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Moral +' }
        ]
    },
    {
        id: 'dec_38_bonus',
        category: 'Studio',
        title: 'Weihnachtsgeld',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Buchhaltung',
        actions: [
            { text: 'Großzügig sein', value: 'generous', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Hoch, Moral ++' },
            { text: 'Standard', value: 'standard', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Mittel, Moral +' },
            { text: 'Streichen', value: 'cut', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Spart Geld, Moral --' }
        ]
    },
    {
        id: 'dec_39_recall',
        category: 'Studio',
        title: 'Merch-Rückruf',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Qualitätssicherung',
        actions: [
            { text: 'Rückruf starten', value: 'recall', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Hoch, Ruf gerettet' },
            { text: 'Vertuschen', value: 'coverup', className: 'bg-red-800 text-white font-bold py-2 px-4 rounded hover:bg-red-700', tooltip: 'Günstig, Risiko: Ruf -1' }
        ]
    },
    {
        id: 'dec_40_sponsor_local',
        category: 'Studio',
        title: 'Lokalsport-Sponsoring',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Sportverein',
        actions: [
            { text: 'Sponsern', value: 'sponsor', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Klein, Ruf +' },
            { text: 'Absagen', value: 'decline', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Keine Auswirkung' }
        ]
    },
    {
        id: 'dec_41_investor_son',
        category: 'Studio',
        title: 'Der Neffe des Investors (Bürojob)',
        text: 'Unser Hauptinvestor möchte, dass sein völlig unqualifizierter Neffe ein hochbezahltes "Praktikum" in der Marketingabteilung bekommt. Er würde nur im Weg stehen.',
        imageUrl: newspaperImage,
        sender: 'Investor Relations',
        actions: [
            { text: 'Einstellen (Geld)', value: 'cast', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Geld +, Moral Team -' },
            { text: 'Ablehnen', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Investor verärgert' }
        ]
    },
    {
        id: 'dec_42_greenwashing',
        category: 'Studio',
        title: 'Greenwashing-Vorwurf',
        text: '',
        imageUrl: newspaperImage,
        sender: 'PR',
        actions: [
            { text: 'Öko-Reform', value: 'real', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Teuer, Ruf +1' },
            { text: 'PR-Kampagne', value: 'fake', className: 'bg-yellow-600 text-white font-bold py-2 px-4 rounded hover:bg-yellow-500', tooltip: 'Billiger, Ruf +, Risiko' }
        ]
    },
    {
        id: 'dec_43_old_tech',
        category: 'Studio',
        title: 'Alte Technik',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Lager',
        actions: [
            { text: 'Museum spenden', value: 'donate', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Ruf +1' },
            { text: 'Verkaufen', value: 'sell', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Geld +' }
        ]
    },
    {
        id: 'dec_44_smoking',
        category: 'Studio',
        title: 'Rauchverbot',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Gesundheitsamt',
        actions: [
            { text: 'Verbot einführen', value: 'ban', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Moral Raucher -' },
            { text: 'Zonen bauen', value: 'zones', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Klein' }
        ]
    },
    {
        id: 'dec_45_office_dog',
        category: 'Studio',
        title: 'Bürohund',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Team',
        actions: [
            { text: 'Erlauben', value: 'allow', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Moral +' },
            { text: 'Verbieten', value: 'forbid', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Moral -' }
        ]
    },
    {
        id: 'dec_46_charity_run',
        category: 'Studio',
        title: 'Firmenlauf',
        text: '',
        imageUrl: newspaperImage,
        sender: 'HR',
        actions: [
            { text: 'Teilnehmen', value: 'participate', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Klein, Ruf +1, Moral +' },
            { text: 'Arbeiten', value: 'work', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Produktivität +' }
        ]
    },
    {
        id: 'dec_47_influencer_house',
        category: 'Studio',
        title: 'Influencer-WG',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Marketing',
        actions: [
            { text: 'Hosten', value: 'host', className: 'bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-500', tooltip: 'Viel Geld, Moral -' },
            { text: 'Ablehnen', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Ruhe' }
        ]
    },
    {
        id: 'dec_48_cryo',
        category: 'Studio',
        title: 'Kältekammer',
        text: '',
        imageUrl: newspaperImage,
        sender: 'Gesundheitsmanagement',
        actions: [
            { text: 'Anschaffen', value: 'buy', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Hoch, Moral +' },
            { text: 'Zu teuer', value: 'reject', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Geld gespart' }
        ]
    },
    {
        id: 'dec_49_jet',
        category: 'Studio',
        title: 'Dienstwagen-Flotte',
        text: 'Die Abteilungsleiter beschweren sich, dass ihre Dienstwagen veraltet sind. Sie fordern neue Luxusmodelle, um das Prestige des Studios nach außen zu tragen.',
        imageUrl: newspaperImage,
        sender: 'Fuhrpark',
        actions: [
            { text: 'Genehmigen (Luxus)', value: 'approve', className: 'bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-500', tooltip: 'Kosten: Hoch, Moral Führungskräfte +' },
            { text: 'Ablehnen', value: 'deny', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Sparsamkeit' }
        ]
    },
    {
        id: 'dec_50_time_capsule',
        category: 'Studio',
        title: 'Zeitkapsel',
        text: '',
        imageUrl: newspaperImage,
        sender: 'PR',
        actions: [
            { text: 'Vergraben', value: 'bury', className: 'bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500', tooltip: 'Kosten: Klein, Ruf +1' },
            { text: 'Ignorieren', value: 'ignore', className: 'bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500', tooltip: 'Nichts' }
        ]
    }
];
const formatMoney = (n) => n.toLocaleString('de-DE');
export const resolveDecisionEvent = (eventId, choice, data) => {
    let newData = { ...data };
    let logEntry = '';
    const costLow = getBalancedCost(data.capital, 'low');
    const costMed = getBalancedCost(data.capital, 'medium');
    const costHigh = getBalancedCost(data.capital, 'high');
    switch (eventId) {
        case 'dec_01_charity':
            if (choice === 'donate') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Spende Charity-Gala', costMed);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Spende getätigt. (Kapital: -${formatMoney(costMed)}$, Ruf: +1)`;
            }
            else {
                logEntry = `Spende abgelehnt. Keine Auswirkungen.`;
            }
            break;
        case 'dec_02_bribe':
            if (choice === 'pay') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'PR-Ausgaben (Diskret)', costMed);
                if (Math.random() > 0.5) {
                    newData.reputation = Math.min(100, newData.reputation + 1);
                    logEntry = `Kritiker bezahlt. Positive Reviews folgen. (Kapital: -${formatMoney(costMed)}$, Ruf: +1)`;
                }
                else {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Bestechungsversuch durchgesickert! (Kapital: -${formatMoney(costMed)}$, Ruf: -1)`;
                }
            }
            else {
                logEntry = `Angebot abgelehnt. Integrität gewahrt.`;
            }
            break;
        case 'dec_03_security':
            if (choice === 'patch') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'IT-Sicherheitsupdate', costMed);
                logEntry = `Systeme aktualisiert. Sicherheit gewährleistet. (Kapital: -${formatMoney(costMed)}$)`;
            }
            else {
                if (Math.random() < 0.3) {
                    const penalty = costHigh;
                    newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Datenleck & Strafe', penalty);
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Risiko hat sich nicht ausgezahlt! Datenleck aufgetreten. (Kapital: -${formatMoney(penalty)}$, Ruf: -1)`;
                }
                else {
                    logEntry = `Glück gehabt. Keine Sicherheitsvorfälle.`;
                }
            }
            break;
        case 'dec_04_indie':
            if (choice === 'fund') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Indie-Förderung', costMed);
                if (Math.random() > 0.4) {
                    newData.reputation = Math.min(100, newData.reputation + 1);
                    newData.researchPoints += 100;
                    logEntry = `Indie-Projekt war ein Erfolg! (Kapital: -${formatMoney(costMed)}$, Ruf: +1, FP: +100)`;
                }
                else {
                    logEntry = `Indie-Projekt gefloppt. Investition verloren. (Kapital: -${formatMoney(costMed)}$)`;
                }
            }
            else {
                logEntry = `Anfrage abgelehnt.`;
            }
            break;
        case 'dec_05_eco':
            if (choice === 'upgrade') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Grüne Modernisierung', costHigh);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Studio modernisiert. Image leicht verbessert. (Kapital: -${formatMoney(costHigh)}$, Ruf: +1)`;
            }
            else {
                if (Math.random() < 0.4) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Kritik von Umweltverbänden. (Ruf: -1)`;
                }
                else {
                    logEntry = `Keine Modernisierung. Status quo.`;
                }
            }
            break;
        case 'dec_06_scandal':
            if (choice === 'defend') {
                if (Math.random() > 0.5) {
                    newData.reputation = Math.min(100, newData.reputation + 1);
                    logEntry = `Fans schätzen die Loyalität. (Ruf: +1)`;
                }
                else {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Mit in den Skandal gezogen. (Ruf: -1)`;
                }
            }
            else {
                newData.reputation = Math.max(0, newData.reputation - 1);
                logEntry = `Distanzierung wirkte kalkuliert. (Ruf: -1, aber Skandal vermieden)`;
            }
            break;
        case 'dec_07_merch':
            if (choice === 'deal') {
                const profit = costMed * 2;
                newData = applyTransaction(newData, 'Einnahme', 'Zufallsereignis', 'Lizenz-Deal (Fast Food)', profit);
                newData.reputation = Math.max(0, newData.reputation - 1);
                logEntry = `Schnelles Geld mit billigem Merch. (Kapital: +${formatMoney(profit)}$, Ruf: -1)`;
            }
            else {
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Qualitätsstandards gewahrt. (Ruf: +1)`;
            }
            break;
        case 'dec_08_party':
            if (choice === 'big_party') {
                newData = applyTransaction(newData, 'Ausgabe', 'Personal', 'Mitarbeiterfest (Groß)', costMed);
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.min(100, e.satisfaction + 15) }));
                logEntry = `Großes Fest gefeiert. (Kapital: -${formatMoney(costMed)}$, Moral: +15)`;
            }
            else if (choice === 'small_party') {
                newData = applyTransaction(newData, 'Ausgabe', 'Personal', 'Mitarbeiterfest (Klein)', costLow);
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.min(100, e.satisfaction + 5) }));
                logEntry = `Nettes Beisammensein. (Kapital: -${formatMoney(costLow)}$, Moral: +5)`;
            }
            else {
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.max(0, e.satisfaction - 5) }));
                logEntry = `Party abgesagt. Enttäuschung im Team. (Moral: -5)`;
            }
            break;
        case 'dec_09_tour':
            if (choice === 'allow') {
                const income = costLow;
                newData = applyTransaction(newData, 'Einnahme', 'Studiogelände', 'Tour-Einnahmen', income);
                logEntry = `Touren durchgeführt. (Kapital: +${formatMoney(income)}$)`;
            }
            else {
                logEntry = `Privatsphäre gewahrt. Ungestörtes Arbeiten möglich.`;
            }
            break;
        case 'dec_10_spy':
            if (choice === 'investigate') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Detektei (Sicherheit)', costMed);
                if (Math.random() > 0.3) {
                    logEntry = `Spion enttarnt und gefeuert! Gefahr gebannt. (Kapital: -${formatMoney(costMed)}$)`;
                }
                else {
                    logEntry = `Nichts gefunden. Verdacht war wohl unbegründet. (Kapital: -${formatMoney(costMed)}$)`;
                }
            }
            else {
                if (Math.random() < 0.2) {
                    const loss = costHigh;
                    newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Ideendiebstahl', loss);
                    logEntry = `Spion war erfolgreich! Ideen gestohlen. (Kapital: -${formatMoney(loss)}$)`;
                }
                else {
                    logEntry = `Warnung hat gereicht. Keine Vorfälle.`;
                }
            }
            break;
        case 'dec_11_ransomware':
            if (choice === 'pay') {
                const ransom = costHigh;
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Lösegeld (Hacker)', ransom);
                logEntry = `Lösegeld gezahlt. Systeme laufen wieder. (Kapital: -${formatMoney(ransom)}$)`;
            }
            else {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'IT-Restaurierung', costLow);
                newData.researchPoints = Math.max(0, newData.researchPoints - 200);
                logEntry = `Systeme mühsam wiederhergestellt. (Kapital: -${formatMoney(costLow)}$, FP: -200)`;
            }
            break;
        case 'dec_12_nepotism':
            if (choice === 'hire') {
                newData.reputation = Math.min(100, newData.reputation + 1);
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.max(0, e.satisfaction - 5) }));
                logEntry = `Neffen eingestellt. (Ruf: +1, Moral: -5)`;
            }
            else {
                newData.reputation = Math.max(0, newData.reputation - 1);
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.min(100, e.satisfaction + 2) }));
                logEntry = `Vetternwirtschaft abgelehnt. (Ruf: -1, Moral: +2)`;
            }
            break;
        case 'dec_13_preservation':
            if (choice === 'restore') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Denkmalschutz-Sanierung', costMed);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Altes Set restauriert. (Kapital: -${formatMoney(costMed)}$, Ruf: +1)`;
            }
            else {
                newData.reputation = Math.max(0, newData.reputation - 1);
                logEntry = `Set abgerissen. (Ruf: -1)`;
            }
            break;
        case 'dec_14_strike_threat':
            if (choice === 'raise') {
                newData = applyTransaction(newData, 'Ausgabe', 'Personal', 'Sonderzahlung (Gewerkschaft)', costMed);
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.min(100, e.satisfaction + 10) }));
                logEntry = `Forderungen erfüllt. Streik abgewendet. (Kapital: -${formatMoney(costMed)}$, Moral: +10)`;
            }
            else {
                if (Math.random() < 0.4) {
                    newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.max(0, e.satisfaction - 15) }));
                    const strikeCost = costHigh;
                    newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Streikfolgen', strikeCost);
                    logEntry = `Gepokert und verloren. Streik ausgebrochen! (Kapital: -${formatMoney(strikeCost)}$, Moral: -15)`;
                }
                else {
                    logEntry = `Gewerkschaft hat eingelenkt. Kein Streik. Glück gehabt.`;
                }
            }
            break;
        case 'dec_15_leak':
            if (choice === 'rewrite') {
                newData = applyTransaction(newData, 'Ausgabe', 'Filmproduktion', 'Interview-Honorar', costMed);
                logEntry = `Exklusiv-Interview gegeben. Story unter Kontrolle. (Kapital: -${formatMoney(costMed)}$)`;
            }
            else {
                if (Math.random() < 0.4) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Skandal ausgebrochen! Ruf gelitten. (Ruf: -1)`;
                }
                else {
                    logEntry = `Aussitzen hat funktioniert. Niemand interessiert sich mehr dafür.`;
                }
            }
            break;
        case 'dec_16_sponsor':
            if (choice === 'take') {
                const income = costHigh * 1.5;
                newData = applyTransaction(newData, 'Einnahme', 'Zufallsereignis', 'Sponsoring (Kontrovers)', income);
                newData.reputation = Math.max(0, newData.reputation - 1);
                logEntry = `Geld genommen. Image hat leicht gelitten. (Kapital: +${formatMoney(income)}$, Ruf: -1)`;
            }
            else {
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Moral gezeigt. Sponsoring abgelehnt. (Ruf: +1)`;
            }
            break;
        case 'dec_17_art':
            if (choice === 'buy') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Antike Kamera', costHigh);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Kamera gekauft. Ein Schmuckstück! (Kapital: -${formatMoney(costHigh)}$, Ruf: +1)`;
            }
            else {
                logEntry = `Zu teuer. Nicht gekauft.`;
            }
            break;
        case 'dec_18_docu':
            if (choice === 'coop') {
                newData.reputation = Math.min(100, newData.reputation + 1);
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.max(0, e.satisfaction - 2) }));
                logEntry = `Transparenz gezeigt. (Ruf: +1, Moral: -2)`;
            }
            else {
                if (Math.random() < 0.5) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Blockade hat neugierig gemacht. Journalisten haben Schmutz gefunden. (Ruf: -1)`;
                }
                else {
                    logEntry = `Doku wurde langweilig und nicht gesendet. Glück gehabt.`;
                }
            }
            break;
        case 'dec_19_jury':
            if (choice === 'accept') {
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Ehrenvolle Aufgabe übernommen. (Ruf: +1)`;
            }
            else {
                logEntry = `Einladung höflich abgelehnt. Fokus bleibt auf dem Studio.`;
            }
            break;
        case 'dec_20_merger':
            if (choice === 'deny') {
                newData.employees = newData.employees.map(e => ({ ...e, satisfaction: Math.min(100, e.satisfaction + 5) }));
                logEntry = `Klares Dementi. Mitarbeiter sind beruhigt. (Moral: +5)`;
            }
            else {
                logEntry = `Gerüchte angeheizt. Aktienkurs schwankt, Investoren sind aufmerksam.`;
            }
            break;
        case 'dec_21_ai_script':
            if (choice === 'adopt') {
                newData.employees.filter(e => e.type === 'Autor').forEach(e => e.satisfaction -= 20);
                logEntry = 'KI eingeführt. Autoren sauer. (Autoren-Moral: -20)';
            }
            else {
                newData.employees.filter(e => e.type === 'Autor').forEach(e => e.satisfaction += 10);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = 'KI abgelehnt. Autoren happy. (Autoren-Moral: +10, Ruf: +1)';
            }
            break;
        case 'dec_22_paparazzi':
            if (choice === 'shoot') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Anwaltskosten Drohne', costLow);
                newData.employees.forEach(e => e.satisfaction += 5);
                logEntry = `Drohne zerstört. Team feiert. (Kapital: -${formatMoney(costLow)}$, Moral: +5)`;
            }
            else {
                newData.employees.forEach(e => e.satisfaction -= 5);
                logEntry = 'Fotos sind im Netz. Stimmung mies. (Moral: -5)';
            }
            break;
        case 'dec_23_haunted':
            if (choice === 'exorcist') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Geisterjäger', costLow);
                newData.employees.forEach(e => e.satisfaction += 10);
                logEntry = `Geister vertrieben? Team fühlt sich sicherer. (Kapital: -${formatMoney(costLow)}$, Moral: +10)`;
            }
            else {
                logEntry = 'PR-Stunt draus gemacht. Naja.';
            }
            break;
        case 'dec_24_streaming':
            if (choice === 'accept') {
                const salePrice = costHigh * 1.5;
                newData = applyTransaction(newData, 'Einnahme', 'Zufallsereignis', 'Archiv-Verkauf', salePrice);
                logEntry = `Archiv verkauft. Kasse voll. (Kapital: +${formatMoney(salePrice)}$)`;
            }
            else {
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = 'Erbe bewahrt. (Ruf: +1)';
            }
            break;
        case 'dec_25_foreign_censorship':
            if (choice === 'cut') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Parteispende', costMed);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Gespendet. Gute Kontakte gesichert. (Kapital: -${formatMoney(costMed)}$, Ruf: +1)`;
            }
            else {
                logEntry = 'Neutral geblieben.';
            }
            break;
        case 'dec_26_child_tutor':
            if (choice === 'hire') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Kita-Bau', costHigh);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 15));
                logEntry = `Kita gebaut! Alle Eltern happy. (Kapital: -${formatMoney(costHigh)}$, Moral: +15)`;
            }
            else {
                newData.employees.forEach(e => e.satisfaction = Math.max(0, e.satisfaction - 5));
                logEntry = 'Abgelehnt. Stimmung sinkt. (Moral: -5)';
            }
            break;
        case 'dec_27_outsourcing':
            if (choice === 'cheap') {
                newData = applyTransaction(newData, 'Einnahme', 'Filmproduktion', 'Ersparnis', costMed);
                if (Math.random() < 0.5) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Schlechte Qualität. (Kapital: +${formatMoney(costMed)}$, Ruf: -1)`;
                }
                else
                    logEntry = `Hat geklappt. (Kapital: +${formatMoney(costMed)}$)`;
            }
            else {
                newData = applyTransaction(newData, 'Ausgabe', 'Filmproduktion', 'VFX-Inhouse', costMed);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Qualität gesichert. (Kapital: -${formatMoney(costMed)}$, Ruf: +1)`;
            }
            break;
        case 'dec_28_inspection':
            if (choice === 'fix') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Reinigung', costLow);
                newData.employees.forEach(e => e.satisfaction = Math.max(0, e.satisfaction - 5));
                logEntry = `Geschlossen & Geputzt. Mitarbeiter hungrig. (Kapital: -${formatMoney(costLow)}$, Moral: -5)`;
            }
            else {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Strafe & Umbau', costHigh);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 2));
                logEntry = `Teure Renovierung bei laufendem Betrieb. Aber schön jetzt. (Kapital: -${formatMoney(costHigh)}$, Moral: +2)`;
            }
            break;
        case 'dec_29_directors_cut':
            if (choice === 'allow') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Digitalisierung', costMed);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Archiv gerettet. (Kapital: -${formatMoney(costMed)}$, Ruf: +1)`;
            }
            else {
                if (Math.random() < 0.2) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = 'Einige Bänder sind unwiederbringlich zerfallen. (Ruf: -1)';
                }
                else {
                    logEntry = 'Risiko eingegangen. Noch hält es.';
                }
            }
            break;
        case 'dec_30_noise':
            if (choice === 'wall') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Lärmschutz', costHigh);
                logEntry = `Ruhe im Viertel. (Kapital: -${formatMoney(costHigh)}$)`;
            }
            else {
                if (Math.random() < 0.5) {
                    newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Ordnungsstrafe', costMed);
                    logEntry = `Strafe wegen Lärm. (Kapital: -${formatMoney(costMed)}$)`;
                }
                else
                    logEntry = 'Nachbarn beruhigt.';
            }
            break;
        case 'dec_31_videogame':
            if (choice === 'trash') {
                newData = applyTransaction(newData, 'Einnahme', 'Marketing', 'Game-Lizenz', costHigh);
                newData.reputation = Math.max(0, newData.reputation - 1);
                logEntry = `Cashgrab. (Kapital: +${formatMoney(costHigh)}$, Ruf: -1)`;
            }
            else {
                newData = applyTransaction(newData, 'Einnahme', 'Marketing', 'Game-Lizenz', costMed);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Gutes Spiel. (Kapital: +${formatMoney(costMed)}$, Ruf: +1)`;
            }
            break;
        case 'dec_32_award_lobby':
            if (choice === 'campaign') {
                newData = applyTransaction(newData, 'Ausgabe', 'Marketing', 'For Your Consideration', costHigh);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Teure Kampagne. Hoffentlich klappts. (Kapital: -${formatMoney(costHigh)}$, Ruf: +1)`;
            }
            else {
                logEntry = 'Kein Lobbying.';
            }
            break;
        case 'dec_33_diversity':
            if (choice === 'start') {
                newData = applyTransaction(newData, 'Ausgabe', 'Personal', 'Diversity Programm', costMed);
                newData.reputation = Math.min(100, newData.reputation + 1);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 5));
                logEntry = `Programm gestartet. Gutes Feedback. (Kapital: -${formatMoney(costMed)}$, Ruf: +1, Moral: +5)`;
            }
            else {
                newData.reputation = Math.max(0, newData.reputation - 1);
                logEntry = 'Kritik geerntet. (Ruf: -1)';
            }
            break;
        case 'dec_34_parking':
            if (choice === 'build') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Parkhaus', costHigh);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 10));
                logEntry = `Parkhaus gebaut. Alle happy. (Kapital: -${formatMoney(costHigh)}$, Moral: +10)`;
            }
            else {
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 2));
                logEntry = 'VIP Plätze für alle geöffnet. (Moral: +2)';
            }
            break;
        case 'dec_35_espionage':
            if (choice === 'buy') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Intel', costMed);
                newData.researchPoints += 150;
                if (Math.random() < 0.2) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Erwischt! Rufschaden. (Kapital: -${formatMoney(costMed)}$, FP: +150, Ruf: -1)`;
                }
                else
                    logEntry = `Gute Infos bekommen. (Kapital: -${formatMoney(costMed)}$, FP: +150)`;
            }
            else {
                logEntry = 'Abgelehnt.';
            }
            break;
        case 'dec_36_food_poison':
            if (choice === 'hush') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Abfindung', costMed);
                logEntry = `Problem vertuscht. (Kapital: -${formatMoney(costMed)}$)`;
            }
            else {
                newData.reputation = Math.max(0, newData.reputation - 1);
                logEntry = 'Öffentlich gemacht. Ruf litt kurz. (Ruf: -1)';
            }
            break;
        case 'dec_37_reality':
            if (choice === 'allow') {
                newData = applyTransaction(newData, 'Einnahme', 'Zufallsereignis', 'Drehgenehmigung', costHigh);
                newData.employees.forEach(e => e.satisfaction = Math.max(0, e.satisfaction - 10));
                logEntry = `Geld kassiert, Team genervt. (Kapital: +${formatMoney(costHigh)}$, Moral: -10)`;
            }
            else {
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 5));
                logEntry = 'Ruhe bewahrt. (Moral: +5)';
            }
            break;
        case 'dec_38_bonus':
            if (choice === 'generous') {
                newData = applyTransaction(newData, 'Ausgabe', 'Personal', 'Weihnachtsbonus', costHigh);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 20));
                logEntry = `Großer Bonus! (Kapital: -${formatMoney(costHigh)}$, Moral: +20)`;
            }
            else if (choice === 'standard') {
                newData = applyTransaction(newData, 'Ausgabe', 'Personal', 'Weihnachtsbonus', costMed);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 10));
                logEntry = `Standard Bonus. (Kapital: -${formatMoney(costMed)}$, Moral: +10)`;
            }
            else {
                newData.employees.forEach(e => e.satisfaction = Math.max(0, e.satisfaction - 15));
                logEntry = 'Kein Bonus. Team sauer. (Moral: -15)';
            }
            break;
        case 'dec_39_recall':
            if (choice === 'recall') {
                newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Rückrufaktion', costHigh);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Verantwortung gezeigt. (Kapital: -${formatMoney(costHigh)}$, Ruf: +1)`;
            }
            else {
                if (Math.random() < 0.6) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    newData = applyTransaction(newData, 'Ausgabe', 'Zufallsereignis', 'Klagen', costHigh);
                    logEntry = `Skandal! Klagen hageln rein. (Kapital: -${formatMoney(costHigh)}$, Ruf: -1)`;
                }
                else
                    logEntry = 'Glück gehabt.';
            }
            break;
        case 'dec_40_sponsor_local':
            if (choice === 'sponsor') {
                newData = applyTransaction(newData, 'Ausgabe', 'Marketing', 'Sponsoring', costLow);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Lokalhelden unterstützt. (Kapital: -${formatMoney(costLow)}$, Ruf: +1)`;
            }
            else
                logEntry = 'Kein Sponsoring.';
            break;
        case 'dec_41_investor_son':
            if (choice === 'cast') {
                const bonus = costHigh;
                newData = applyTransaction(newData, 'Einnahme', 'Zufallsereignis', 'Investor Dank', bonus);
                newData.employees.forEach(e => e.satisfaction = Math.max(0, e.satisfaction - 5));
                logEntry = `Neffe eingestellt. Team genervt, aber Kasse stimmt. (Kapital: +${formatMoney(bonus)}$, Moral: -5)`;
            }
            else {
                logEntry = 'Abgelehnt. Investor nicht amüsiert.';
            }
            break;
        case 'dec_42_greenwashing':
            if (choice === 'real') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Solarpanels', costHigh);
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = `Echte Maßnahmen. (Kapital: -${formatMoney(costHigh)}$, Ruf: +1)`;
            }
            else {
                newData = applyTransaction(newData, 'Ausgabe', 'Marketing', 'Green-PR', costLow);
                if (Math.random() < 0.4) {
                    newData.reputation = Math.max(0, newData.reputation - 1);
                    logEntry = `Als Greenwashing entlarvt! (Kapital: -${formatMoney(costLow)}$, Ruf: -1)`;
                }
                else {
                    newData.reputation = Math.min(100, newData.reputation + 1);
                    logEntry = `PR hat funktioniert. (Kapital: -${formatMoney(costLow)}$, Ruf: +1)`;
                }
            }
            break;
        case 'dec_43_old_tech':
            if (choice === 'donate') {
                newData.reputation = Math.min(100, newData.reputation + 1);
                logEntry = 'Gespendet. (Ruf: +1)';
            }
            else {
                newData = applyTransaction(newData, 'Einnahme', 'Zufallsereignis', 'Verkauf', costLow);
                logEntry = `Verkauft. (Kapital: +${formatMoney(costLow)}$)`;
            }
            break;
        case 'dec_44_smoking':
            if (choice === 'ban') {
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 2));
                logEntry = 'Rauchverbot. Luft besser. (Moral: +2)';
            }
            else {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Raucherzonen', costLow);
                logEntry = `Zonen gebaut. (Kapital: -${formatMoney(costLow)}$)`;
            }
            break;
        case 'dec_45_office_dog':
            if (choice === 'allow') {
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 10));
                newData = applyTransaction(newData, 'Ausgabe', 'Personal', 'Reinigung', costLow);
                logEntry = `Hund ist da! (Kapital: -${formatMoney(costLow)}$, Moral: +10)`;
            }
            else {
                newData.employees.forEach(e => e.satisfaction = Math.max(0, e.satisfaction - 2));
                logEntry = 'Kein Hund. (Moral: -2)';
            }
            break;
        case 'dec_46_charity_run':
            if (choice === 'participate') {
                newData = applyTransaction(newData, 'Ausgabe', 'Marketing', 'Lauf-Shirts', costLow);
                newData.reputation = Math.min(100, newData.reputation + 1);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 5));
                logEntry = `Mitgelaufen! (Kapital: -${formatMoney(costLow)}$, Ruf: +1, Moral: +5)`;
            }
            else {
                logEntry = 'Gearbeitet.';
            }
            break;
        case 'dec_47_influencer_house':
            if (choice === 'host') {
                newData = applyTransaction(newData, 'Einnahme', 'Studiogelände', 'Miete', costHigh);
                newData.employees.forEach(e => e.satisfaction = Math.max(0, e.satisfaction - 15));
                logEntry = `Influencer nerven, aber zahlen gut. (Kapital: +${formatMoney(costHigh)}$, Moral: -15)`;
            }
            else {
                logEntry = 'Abgelehnt.';
            }
            break;
        case 'dec_48_cryo':
            if (choice === 'buy') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Kältekammer', costHigh);
                logEntry = `Angeschafft. Sehr kalt. (Kapital: -${formatMoney(costHigh)}$)`;
            }
            else {
                logEntry = 'Zu teuer.';
            }
            break;
        case 'dec_49_jet':
            if (choice === 'approve') {
                newData = applyTransaction(newData, 'Ausgabe', 'Studiogelände', 'Luxus-Dienstwagen', costHigh);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 5));
                logEntry = `Neue Flotte. Chefs glücklich. (Kapital: -${formatMoney(costHigh)}$, Moral: +5)`;
            }
            else {
                logEntry = 'Abgelehnt. Sparsamkeit.';
            }
            break;
        case 'dec_50_time_capsule':
            if (choice === 'bury') {
                newData = applyTransaction(newData, 'Ausgabe', 'Marketing', 'Zeitkapsel', costLow);
                newData.employees.forEach(e => e.satisfaction = Math.min(100, e.satisfaction + 2));
                logEntry = `Vergraben für die Zukunft. (Kapital: -${formatMoney(costLow)}$, Moral: +2)`;
            }
            else {
                logEntry = 'Ignoriert.';
            }
            break;
    }
    return { updatedData: newData, logEntry };
};
