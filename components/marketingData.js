import { ProjectPhase } from '../types';
export const MARKETING_CAMPAIGNS = [
// Alle Kampagnen wurden auf Wunsch des Benutzers entfernt.
];
export const PRODUCTION_MARKETING_CAMPAIGNS = [
    {
        id: 'word_of_mouth',
        name: 'Mundpropaganda',
        description: 'Eine subtile, aber effektive Basiskampagne. Wir streuen gezielte Gerüchte in Fan-Foren und platzieren "versehentlich" geleakte Set-Fotos in Nischen-Blogs. Dies erzeugt authentische erste Gespräche und Neugier bei der Hardcore-Fanbase.',
        cost: 25000,
        hypeGain: 5,
        hypeStars: 1,
        phase: ProjectPhase.Production,
    },
    {
        id: 'local_press',
        name: 'Lokale Presse',
        description: 'Klassische PR-Arbeit für eine solide Grundlage. Wir organisieren Interviews in Lokalzeitungen und schalten Radio-Spots in der Region des Drehorts. Baut eine verlässliche, lokale Fanbasis auf und sorgt für positive Grundstimmung.',
        cost: 100000,
        hypeGain: 15,
        hypeStars: 3,
        phase: ProjectPhase.Production,
    },
    {
        id: 'national_campaign',
        name: 'Nationale Kampagne',
        description: 'Eine landesweite Kampagne, um den Film ins nationale Bewusstsein zu rücken. Inklusive der Schaltung von Kino-Trailern, Anzeigen in großen Magazinen und ersten TV-Spots zur Nebensendezeit.',
        cost: 500000,
        hypeGain: 25,
        hypeStars: 5,
        phase: ProjectPhase.Production,
    },
    {
        id: 'international_offensive',
        name: 'Internationale Offensive',
        description: 'Der Film wird als globales Ereignis positioniert. Wir organisieren Premieren in wichtigen Märkten wie London, Paris und Tokio und arrangieren Interviews mit internationalen Medien. Erzeugt weltweite Aufmerksamkeit.',
        cost: 2000000,
        hypeGain: 40,
        hypeStars: 7,
        phase: ProjectPhase.Production,
    },
    {
        id: 'global_saturation',
        name: 'Globale Sättigung',
        description: 'Die ultimative Marketing-Walze. TV-Spots zur Primetime weltweit, riesige Plakatwände an ikonischen Orten und eine massive Online-Präsenz. Absolut niemand wird diesen Film übersehen können. Extrem teuer, extrem wirkungsvoll.',
        cost: 7500000,
        hypeGain: 60,
        hypeStars: 10,
        phase: ProjectPhase.Production,
    },
];
