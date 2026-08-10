import { events1990 } from './year1990';
import { events1991 } from './year1991';
import { events1992 } from './year1992';
import { events1993 } from './year1993';
import { events1994 } from './year1994';
import { events1995 } from './year1995';
import { events1996 } from './year1996';
import { events1997 } from './year1997';
import { events1998 } from './year1998';
import { events1999 } from './year1999';
import { events2000 } from './year2000';
import { events2001 } from './year2001';
import { events2002 } from './year2002';
import { events2003 } from './year2003';
import { events2004 } from './year2004';
import { events2005 } from './year2005';
import { events2006 } from './year2006';
import { events2007 } from './year2007';
import { events2008 } from './year2008';
import { events2009 } from './year2009';
import { events2010 } from './year2010';
import { events2011 } from './year2011';
import { events2012 } from './year2012';
import { events2013 } from './year2013';
import { events2014 } from './year2014';
import { events2015 } from './year2015';
import { events2016 } from './year2016';
import { events2017 } from './year2017';
import { events2018 } from './year2018';
import { events2019 } from './year2019';
import { events2020 } from './year2020';
import { events2021 } from './year2021';
import { events2022 } from './year2022';
import { events2023 } from './year2023';
import { events2024 } from './year2024';
import { events2025 } from './year2025';
import { events2026 } from './year2026';
const allHistoricalEvents = {
    1990: events1990,
    1991: events1991,
    1992: events1992,
    1993: events1993,
    1994: events1994,
    1995: events1995,
    1996: events1996,
    1997: events1997,
    1998: events1998,
    1999: events1999,
    2000: events2000,
    2001: events2001,
    2002: events2002,
    2003: events2003,
    2004: events2004,
    2005: events2005,
    2006: events2006,
    2007: events2007,
    2008: events2008,
    2009: events2009,
    2010: events2010,
    2011: events2011,
    2012: events2012,
    2013: events2013,
    2014: events2014,
    2015: events2015,
    2016: events2016,
    2017: events2017,
    2018: events2018,
    2019: events2019,
    2020: events2020,
    2021: events2021,
    2022: events2022,
    2023: events2023,
    2024: events2024,
    2025: events2025,
    2026: events2026,
};
export const checkForHistoricalEvent = (currentDate) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11
    const day = currentDate.getDate();
    const yearlyEvents = allHistoricalEvents[year];
    if (!yearlyEvents)
        return null;
    // Check if any event falls within the LAST 7 DAYS (since finance loop runs weekly)
    // We prioritize the most recent one if multiple happened
    // Iterate backwards from today to 6 days ago
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(checkDate.getDate() - i);
        const checkYear = checkDate.getFullYear();
        const checkMonth = checkDate.getMonth();
        const checkDay = checkDate.getDate();
        // If year changed during lookback, grab that year's list
        const eventsToList = allHistoricalEvents[checkYear];
        if (!eventsToList)
            continue;
        const event = eventsToList.find(e => e.year === checkYear &&
            e.month === checkMonth &&
            e.day === checkDay);
        if (event) {
            return event;
        }
    }
    return null;
};
