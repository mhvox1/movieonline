const { getStudio, upsertStudio } = require('./studioStore');
const { getCurrentIngameDate } = require('./timeModel');
const { getMonthOccupancy, findNextAvailableMonth } = require('./releaseCalendarService');

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeMonthWindow(releaseYear, releaseMonth) {
  let year = toNumber(releaseYear, 0);
  let month = toNumber(releaseMonth, 0);

  if (year <= 0 || month <= 0) {
    const ingameDate = getCurrentIngameDate(new Date());
    year = ingameDate.getUTCFullYear();
    month = ingameDate.getUTCMonth() + 2;
  }

  while (month > 12) {
    month -= 12;
    year += 1;
  }

  while (month < 1) {
    month += 12;
    year -= 1;
  }

  if (year < 1900) {
    year = 1900;
  }

  return { year, month };
}

function findCompletedFilmIndex(completedFilms, filmTitle) {
  const target = String(filmTitle || '').trim().toLowerCase();
  if (!target) {
    return -1;
  }

  for (let i = completedFilms.length - 1; i >= 0; i -= 1) {
    const title = String(completedFilms[i]?.workingTitle || '').trim().toLowerCase();
    if (title === target) {
      return i;
    }
  }

  return -1;
}

function scheduleFilmRelease({ studioId, filmTitle, releaseYear, releaseMonth, priorityTier, strategy }) {
  const studio = getStudio(String(studioId || ''));
  if (!studio) {
    return { error: 'Studio not found' };
  }

  const completedFilms = Array.isArray(studio.state?.completedFilms) ? [...studio.state.completedFilms] : [];
  const idx = findCompletedFilmIndex(completedFilms, filmTitle);
  if (idx < 0) {
    return { error: 'Completed film not found in studio' };
  }

  const { year, month } = normalizeMonthWindow(releaseYear, releaseMonth);
  const occupancy = getMonthOccupancy(year, month);
  if (occupancy.available <= 0) {
    const suggested = findNextAvailableMonth(year, month + 1, 36);
    return {
      error: 'Release month is fully booked',
      requested: {
        year,
        month,
        monthKey: occupancy.monthKey,
        limit: occupancy.limit,
        occupied: occupancy.occupied,
      },
      suggested: suggested
        ? {
            year: suggested.year,
            month: suggested.month,
            monthKey: suggested.monthKey,
            available: suggested.available,
          }
        : null,
    };
  }

  const existing = completedFilms[idx];
  const releaseId = existing?.onlineRelease?.releaseId || `rel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  completedFilms[idx] = {
    ...existing,
    onlineRelease: {
      releaseId,
      releaseYear: year,
      releaseMonth: month,
      status: 'scheduled',
      priorityTier: String(priorityTier || existing?.onlineRelease?.priorityTier || 'normal'),
      strategy: String(strategy || existing?.onlineRelease?.strategy || 'balanced'),
      scheduledAtIso: new Date().toISOString(),
    },
  };

  const nextStudio = {
    ...studio,
    state: {
      ...(studio.state || {}),
      completedFilms,
      transactionLog: Array.isArray(studio.state?.transactionLog)
        ? [...studio.state.transactionLog, {
            date: new Date().toISOString(),
            type: 'Einnahme',
            category: 'Filmverleih',
            description: `Release geplant: "${existing.workingTitle}" (${year}-${String(month).padStart(2, '0')})`,
            amount: 0,
          }]
        : [],
    },
  };

  upsertStudio(nextStudio);

  return {
    studioId: String(studio.id),
    studioName: studio.studioName,
    filmTitle: existing.workingTitle,
    release: completedFilms[idx].onlineRelease,
  };
}

module.exports = {
  scheduleFilmRelease,
};
