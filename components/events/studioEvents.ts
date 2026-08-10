
import { RandomEvent } from '../../types';
import { financeEvents } from './studio/financeEvents';
import { facilityEvents } from './studio/facilityEvents';
import { personnelEvents } from './studio/personnelEvents';
import { prEvents } from './studio/prEvents';
import { techEvents } from './studio/techEvents';
import { miscEvents } from './studio/miscEvents';

export const STUDIO_EVENTS: RandomEvent[] = [
    ...financeEvents,
    ...facilityEvents,
    ...personnelEvents,
    ...prEvents,
    ...techEvents,
    ...miscEvents
];
