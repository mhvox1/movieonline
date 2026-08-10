const { listStudios, upsertStudio } = require('./studioStore');

const DEFAULT_RELEASE_SLOT_LIMIT = 8;

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function monthIndex(year, month) {
  return (toNumber(year, 0) * 12) + (toNumber(month, 1) - 1);
}

function shiftMonth(year, month, delta) {
  let y = toNumber(year, 2000);
  let m = toNumber(month, 1);
  let d = toNumber(delta, 0);

  while (d > 0) {
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    d -= 1;
  }

  while (d < 0) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    d += 1;
  }

  return { year: y, month: m };
}

function getReleaseSlotLimit() {
  const fromEnv = toNumber(process.env.WORLD_RELEASE_SLOT_LIMIT, DEFAULT_RELEASE_SLOT_LIMIT);
  return Math.max(1, Math.min(100, fromEnv));
}

function collectScheduledReleases() {
  const rows = [];
  const studios = listStudios();

  for (const studio of studios) {
    const completedFilms = Array.isArray(studio.state?.completedFilms) ? studio.state.completedFilms : [];

    for (let i = 0; i < completedFilms.length; i += 1) {
      const film = completedFilms[i];
      const release = film?.onlineRelease;
      if (!release || release.status !== 'scheduled') {
        continue;
      }

      const releaseYear = toNumber(release.releaseYear, 0);
      const releaseMonth = toNumber(release.releaseMonth, 0);
      if (releaseYear <= 0 || releaseMonth <= 0) {
        continue;
      }

      rows.push({
        studioId: String(studio.id),
        studioName: studio.studioName,
        filmIndex: i,
        filmTitle: String(film.workingTitle || ''),
        releaseId: String(release.releaseId || ''),
        releaseYear,
        releaseMonth,
        monthKey: monthKey(releaseYear, releaseMonth),
        scheduledAtIso: release.scheduledAtIso || null,
        priorityTier: String(release.priorityTier || 'normal'),
        strategy: String(release.strategy || 'balanced'),
        finalQuality: toNumber(film.finalQuality, 50),
        hype: toNumber(film.hype, 0),
      });
    }
  }

  return rows;
}

function getMonthOccupancy(year, month) {
  const key = monthKey(year, month);
  const scheduled = collectScheduledReleases().filter(item => item.monthKey === key);
  const limit = getReleaseSlotLimit();

  return {
    year,
    month,
    monthKey: key,
    limit,
    occupied: scheduled.length,
    available: Math.max(0, limit - scheduled.length),
    entries: scheduled,
  };
}

function findNextAvailableMonth(startYear, startMonth, maxLookAhead = 24) {
  let cursor = { year: startYear, month: startMonth };

  for (let i = 0; i <= maxLookAhead; i += 1) {
    const occupancy = getMonthOccupancy(cursor.year, cursor.month);
    if (occupancy.available > 0) {
      return occupancy;
    }
    cursor = shiftMonth(cursor.year, cursor.month, 1);
  }

  return null;
}

function getPriorityTierWeight(tier) {
  const value = String(tier || 'normal').toLowerCase();
  if (value === 'blockbuster') return 4000;
  if (value === 'high') return 2500;
  if (value === 'low') return 800;
  return 1500;
}

function getStrategyWeight(strategy) {
  const value = String(strategy || 'balanced').toLowerCase();
  if (value === 'awards') return 250;
  if (value === 'aggressive') return 500;
  if (value === 'niche') return 100;
  return 300;
}

function computeReleasePriorityScore(entry, year, month) {
  const scheduledIdx = monthIndex(entry.releaseYear, entry.releaseMonth);
  const currentIdx = monthIndex(year, month);
  const overdueMonths = Math.max(0, currentIdx - scheduledIdx);
  const scheduledTime = entry.scheduledAtIso ? new Date(entry.scheduledAtIso).getTime() : 0;
  const waitDays = scheduledTime > 0
    ? Math.floor((Date.now() - scheduledTime) / 86400000)
    : 0;

  return (
    (overdueMonths * 5000) +
    getPriorityTierWeight(entry.priorityTier) +
    getStrategyWeight(entry.strategy) +
    (toNumber(entry.finalQuality, 50) * 12) +
    (toNumber(entry.hype, 0) * 8) +
    (waitDays * 3)
  );
}

function buildReleaseDraftQueue(year, month) {
  const candidates = collectScheduledReleases()
    .filter(entry => monthIndex(entry.releaseYear, entry.releaseMonth) <= monthIndex(year, month))
    .map(entry => ({
      ...entry,
      priorityScore: computeReleasePriorityScore(entry, year, month),
    }))
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;

      const aTime = a.scheduledAtIso ? new Date(a.scheduledAtIso).getTime() : 0;
      const bTime = b.scheduledAtIso ? new Date(b.scheduledAtIso).getTime() : 0;
      if (aTime !== bTime) return aTime - bTime;

      return b.finalQuality - a.finalQuality;
    });

  const limit = getReleaseSlotLimit();
  const admitted = candidates.slice(0, limit);
  const waitlist = candidates.slice(limit);

  return {
    year,
    month,
    monthKey: monthKey(year, month),
    limit,
    totalCandidates: candidates.length,
    admitted,
    waitlist,
  };
}

function getReleaseBoard(year, month) {
  const queue = buildReleaseDraftQueue(year, month);
  return {
    ...queue,
    occupancy: getMonthOccupancy(year, month),
  };
}

function postponeRelease(studioId, filmIndex, year, month, reason) {
  const studios = listStudios();
  const studio = studios.find(item => String(item.id) === String(studioId));
  if (!studio) {
    return false;
  }

  const completedFilms = Array.isArray(studio.state?.completedFilms) ? [...studio.state.completedFilms] : [];
  if (!completedFilms[filmIndex]) {
    return false;
  }

  const film = completedFilms[filmIndex];
  const release = film.onlineRelease || {};
  completedFilms[filmIndex] = {
    ...film,
    onlineRelease: {
      ...release,
      releaseYear: year,
      releaseMonth: month,
      status: 'scheduled',
      rescheduledAtIso: new Date().toISOString(),
      rescheduleReason: reason || 'slot_limit',
    },
  };

  studio.state = {
    ...(studio.state || {}),
    completedFilms,
  };

  if (!Array.isArray(studio.state.transactionLog)) {
    studio.state.transactionLog = [];
  }
  studio.state.transactionLog.push({
    date: new Date().toISOString(),
    type: 'Ausgabe',
    category: 'Filmverleih',
    description: `Release verschoben: "${film.workingTitle || 'Unbekannt'}" auf ${monthKey(year, month)} (${reason || 'Slotlimit'})`,
    amount: 0,
  });

  upsertStudio(studio);
  return true;
}

module.exports = {
  monthIndex,
  monthKey,
  shiftMonth,
  getReleaseSlotLimit,
  collectScheduledReleases,
  buildReleaseDraftQueue,
  getReleaseBoard,
  getMonthOccupancy,
  findNextAvailableMonth,
  postponeRelease,
};
