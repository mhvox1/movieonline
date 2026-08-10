import { WORLD_EVENTS } from './events/worldEvents';
import { INDUSTRY_EVENTS } from './events/industryEvents';
import { STUDIO_EVENTS } from './events/studioEvents';
import { FAMILY_EVENTS } from './events/familyEvents';
import { DECISION_EVENTS } from './events/studio/decisionEvents';
export const ALL_EVENTS = [
    ...WORLD_EVENTS,
    ...INDUSTRY_EVENTS,
    ...STUDIO_EVENTS,
    ...FAMILY_EVENTS,
    ...DECISION_EVENTS, // Add Decision Events
];
export { FAMILY_EVENTS } from './events/familyEvents';
export { DECISION_EVENTS } from './events/studio/decisionEvents';
// Re-export personal event functions to avoid breaking imports elsewhere
export { generatePartnerEvent, BREAKUP_EVENT, PROPOSAL_ACCEPTED_EVENT, PROPOSAL_REJECTED_EVENT, WEDDING_DAY_EVENT, generateForcedBreakupEvent } from './events/personalEvents';
