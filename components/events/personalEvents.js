import { personalNoteImage } from './eventHelpers';
import { weddingBackgroundImage } from '../backgrounds/WeddingBackgroundImage';
// Event deaktiviert (gibt null zurück), Code bleibt für spätere Aktivierung erhalten.
export const generatePartnerEvent = (playerData) => {
    return null;
};
export const BREAKUP_EVENT = (partnerName) => ({
    id: 'personal_breakup',
    category: 'Personal',
    title: "Beziehungs-Aus",
    text: `Es hat einfach nicht mehr funktioniert. ${partnerName} hat sich von Ihnen getrennt. Sie verlieren an persönlichem Ruf.`,
    imageUrl: personalNoteImage,
});
export const PROPOSAL_ACCEPTED_EVENT = (partnerName) => ({
    id: 'personal_proposal_accepted',
    category: 'Personal',
    title: "Sie hat 'Ja' gesagt!",
    text: `${partnerName} hat Ihren Heiratsantrag angenommen! Herzlichen Glückwunsch zur Verlobung.`,
    imageUrl: personalNoteImage,
});
export const PROPOSAL_REJECTED_EVENT = (partnerName) => ({
    id: 'personal_proposal_rejected',
    category: 'Personal',
    title: "Ein Korb...",
    text: `Leider fühlt sich ${partnerName} noch nicht bereit für diesen Schritt und hat Ihren Antrag abgelehnt. Ihre Beziehung hat darunter gelitten.`,
    imageUrl: personalNoteImage,
});
export const WEDDING_DAY_EVENT = (title, text, playerPortraitUrl, partnerPortraitUrl) => ({
    id: 'personal_wedding_day',
    category: 'Personal',
    title: title,
    text: text,
    imageUrl: personalNoteImage,
    backgroundImage: weddingBackgroundImage, // Use full background
    customVariables: {
        playerPortraitUrl: playerPortraitUrl || '',
        partnerPortraitUrl: partnerPortraitUrl || ''
    }
});
export const generateForcedBreakupEvent = (partnerName, portraitUrl) => {
    const scenarios = [
        {
            title: "Der Abschiedsbrief",
            text: `Du kommst nach Hause und findest die Wohnung ungewöhnlich still vor. Im Flur liegt ein Schlüsselbund, auf dem Küchentisch ein Brief.\n\n"${partnerName}" hat dich verlassen. Im Brief steht, dass die Distanz zwischen euch zu groß geworden ist und es keine gemeinsame Zukunft mehr gibt. Der Schrank ist leergeräumt.`
        },
        {
            title: "Das Ende",
            text: `Es lag schon lange in der Luft, aber heute kam der endgültige Knall. Ein Streit über eine Kleinigkeit eskalierte völlig.\n\n"${partnerName}" hat dir unter Tränen vorgeworfen, dass du nur noch für deine Arbeit lebst und die Beziehung vernachlässigt hast. Es ist vorbei. Du bist wieder allein.`
        },
        {
            title: "Koffer vor der Tür",
            text: `Als du abends ankommst, stehen gepackte Koffer im Flur. "${partnerName}" wartet bereits auf das Taxi.\n\n"Ich kann das nicht mehr", sind die einzigen Worte. Die Gefühle sind erkaltet, die Beziehungswert ist am Boden. Du siehst nur noch die Rücklichter des Taxis.`
        },
        {
            title: "Schmerzhafte Erkenntnis",
            text: `Bei einem Abendessen, das eigentlich zur Versöhnung gedacht war, herrschte nur eisiges Schweigen. "${partnerName}" hat schließlich ausgesprochen, was ihr beide wusstet: Es funktioniert nicht mehr.\n\nIhr habt euch auseinandergelebt. Die Trennung ist schmerzhaft, aber unvermeidlich.`
        },
        {
            title: "Ein neuer Weg",
            text: `"${partnerName}" hat dich um ein ernstes Gespräch gebeten. Es gibt jemanden anderen – oder vielleicht ist es auch nur der Wunsch nach Freiheit. Der Grund spielt keine Rolle mehr.\n\nDie Beziehung ist beendet. Du musst nun deinen Weg alleine weitergehen und dich wieder auf dich selbst konzentrieren.`
        }
    ];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return {
        id: `forced_breakup_${Date.now()}`,
        category: 'Personal',
        title: scenario.title,
        text: scenario.text,
        imageUrl: personalNoteImage,
        customVariables: {
            breakupPortraitUrl: portraitUrl || ''
        }
    };
};
