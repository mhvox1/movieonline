const { readWorldState, writeWorldState } = require('./worldStateStore');
const { listStudios, upsertStudio } = require('./studioStore');
const { getCurrentIngameDate } = require('./timeModel');
const { hashSeed, createDeterministicRng } = require('./simulation');
const {
  monthKey,
  shiftMonth,
  buildReleaseDraftQueue,
  getReleaseBoard,
  getMonthOccupancy,
  findNextAvailableMonth,
  postponeRelease,
} = require('./releaseCalendarService');

const DEFAULT_GENRES = [
  'Action',
  'Abenteuer',
  'Komoedie',
  'Krimi',
  'Dokumentation',
  'Drama',
  'Fantasy',
  'Horror',
  'Musical',
  'Romanze',
  'Sci-Fi',
  'Thriller',
  'Kriegsfilm',
  'Western',
];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function monthIndex(year, month) {
  return (year * 12) + (month - 1);
}

function isReleaseDue(releaseYear, releaseMonth, currentYear, currentMonth) {
  return monthIndex(releaseYear, releaseMonth) <= monthIndex(currentYear, currentMonth);
}

function getMonthsSinceRelease(releaseYear, releaseMonth, year, month) {
  return monthIndex(year, month) - monthIndex(releaseYear, releaseMonth);
}

function getDistributionPhase(monthsSinceRelease) {
  if (monthsSinceRelease < 0) {
    return 'pre_release';
  }
  if (monthsSinceRelease <= 2) {
    return 'cinema';
  }
  if (monthsSinceRelease <= 5) {
    return 'home';
  }
  if (monthsSinceRelease <= 8) {
    return 'payTv';
  }
  if (monthsSinceRelease <= 11) {
    return 'freeTv';
  }
  return 'ended';
}

function createDistributionDealForFilm(film) {
  const quality = toNumber(film.baseQuality, 50);
  const hype = toNumber(film.baseHype, 0);

  let strategy = 'balanced';
  if (quality >= 82 || hype >= 60) strategy = 'cinema_focus';
  else if (quality <= 60 && hype <= 25) strategy = 'tv_first';
  else if (quality >= 75 && hype <= 25) strategy = 'awards';

  const phases = strategy === 'tv_first'
    ? { cinemaMonths: 1, homeMonths: 2, payTvMonths: 2, freeTvMonths: 3 }
    : strategy === 'awards'
      ? { cinemaMonths: 4, homeMonths: 2, payTvMonths: 2, freeTvMonths: 2 }
      : strategy === 'cinema_focus'
        ? { cinemaMonths: 5, homeMonths: 2, payTvMonths: 2, freeTvMonths: 1 }
        : { cinemaMonths: 3, homeMonths: 3, payTvMonths: 3, freeTvMonths: 3 };

  const durationMonths = phases.cinemaMonths + phases.homeMonths + phases.payTvMonths + phases.freeTvMonths;
  const guaranteeBase = (quality * 350) + (hype * 220);

  return {
    dealId: `deal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    strategy,
    revenueShare: Number((0.18 + Math.min(0.42, quality / 220)).toFixed(3)),
    monthlyGuarantee: Math.floor(guaranteeBase),
    durationMonths,
    phases,
  };
}

function getDistributionPhaseFromDeal(monthsSinceRelease, deal) {
  if (!deal || !deal.phases) {
    return getDistributionPhase(monthsSinceRelease);
  }
  if (monthsSinceRelease < 0) return 'pre_release';

  const cinemaEnd = toNumber(deal.phases.cinemaMonths, 0) - 1;
  const homeEnd = cinemaEnd + toNumber(deal.phases.homeMonths, 0);
  const payTvEnd = homeEnd + toNumber(deal.phases.payTvMonths, 0);
  const freeTvEnd = payTvEnd + toNumber(deal.phases.freeTvMonths, 0);

  if (monthsSinceRelease <= cinemaEnd) return 'cinema';
  if (monthsSinceRelease <= homeEnd) return 'home';
  if (monthsSinceRelease <= payTvEnd) return 'payTv';
  if (monthsSinceRelease <= freeTvEnd) return 'freeTv';
  return 'ended';
}

function selectDueReleasesForMonth(year, month) {
  const queue = buildReleaseDraftQueue(year, month);
  const allowed = queue.admitted;
  const overflow = queue.waitlist;

  for (const entry of overflow) {
    const shifted = shiftMonth(year, month, 1);
    postponeRelease(entry.studioId, entry.filmIndex, shifted.year, shifted.month, 'slot_limit');
  }

  return {
    allowedReleaseIds: new Set(allowed.map(item => item.releaseId)),
    delayedCount: overflow.length,
    queue,
  };
}

function getTrend(state, genre) {
  const existing = state.genreTrends[genre];
  if (existing) {
    return {
      popularity: toNumber(existing.popularity, 1),
      momentum: toNumber(existing.momentum, 0),
      peakDuration: toNumber(existing.peakDuration, 0),
    };
  }
  return { popularity: 1, momentum: 0, peakDuration: 0 };
}

function gatherGenres(studios, worldState) {
  const genreSet = new Set(DEFAULT_GENRES);

  for (const genre of Object.keys(worldState.genreTrends || {})) {
    genreSet.add(genre);
  }

  for (const studio of studios) {
    const state = studio.state || {};
    if (state.genreTrends && typeof state.genreTrends === 'object') {
      for (const genre of Object.keys(state.genreTrends)) {
        genreSet.add(genre);
      }
    }

    const films = Array.isArray(state.completedFilms) ? state.completedFilms : [];
    for (const film of films) {
      if (film && typeof film.genre === 'string' && film.genre.trim().length > 0) {
        genreSet.add(film.genre.trim());
      }
    }
  }

  return Array.from(genreSet);
}

function ensureFilmCatalog(studios, worldState, year, month) {
  const currentMonthKey = monthKey(year, month);
  const releasedFilmKeys = [];
  const dueSelection = selectDueReleasesForMonth(year, month);

  for (const studio of studios) {
    const completedFilms = Array.isArray(studio.state?.completedFilms) ? studio.state.completedFilms : [];
    let studioChanged = false;

    for (let i = 0; i < completedFilms.length; i += 1) {
      const film = completedFilms[i];
      const title = String(film?.workingTitle || '').trim();
      if (!title) {
        continue;
      }

      const onlineRelease = film?.onlineRelease;
      if (!onlineRelease || onlineRelease.status !== 'scheduled') {
        continue;
      }

      const releaseYear = toNumber(onlineRelease.releaseYear, 0);
      const releaseMonth = toNumber(onlineRelease.releaseMonth, 0);
      if (releaseYear <= 0 || releaseMonth <= 0) {
        continue;
      }

      if (!isReleaseDue(releaseYear, releaseMonth, year, month)) {
        continue;
      }

      const releaseId = String(onlineRelease.releaseId || `${studio.id}::${title}::${releaseYear}-${releaseMonth}`);
      if (!dueSelection.allowedReleaseIds.has(releaseId)) {
        continue;
      }

      const filmKey = releaseId;

      if (worldState.filmCatalog[filmKey]) {
        releasedFilmKeys.push(filmKey);

        // Heal inconsistent state if film was already cataloged but still marked as scheduled.
        if (onlineRelease.status !== 'released') {
          completedFilms[i] = {
            ...film,
            onlineRelease: {
              ...onlineRelease,
              status: 'released',
            },
          };
          studioChanged = true;
        }
        continue;
      }

      const quality = clamp(Math.round(toNumber(film.finalQuality, 50)), 1, 100);
      const genre = typeof film.genre === 'string' && film.genre.trim().length > 0 ? film.genre : 'Drama';
      const deal = createDistributionDealForFilm({ baseQuality: quality, baseHype: toNumber(film.hype, 0) });

      worldState.filmCatalog[filmKey] = {
        filmKey,
        releaseId,
        studioId: String(studio.id),
        studioName: studio.studioName,
        title,
        genre,
        releaseYear,
        releaseMonth,
        releaseMonthKey: monthKey(releaseYear, releaseMonth),
        baseQuality: quality,
        baseHype: clamp(Math.round(toNumber(film.hype, 0)), 0, 100),
        distributionDeal: deal,
        chartQuality: quality,
        currentPhase: 'cinema',
        phaseRevenue: {
          cinema: 0,
          home: 0,
          payTv: 0,
          freeTv: 0,
        },
        monthlyRevenueByMonth: {},
        monthlyViewersByMonth: {},
        weeksInCharts: 0,
        totalViewers: 0,
        totalRevenue: 0,
      };

      completedFilms[i] = {
        ...film,
        onlineRelease: {
          ...onlineRelease,
          releaseId,
          status: 'released',
          releasedAtIso: new Date().toISOString(),
        },
      };
      studioChanged = true;
      releasedFilmKeys.push(filmKey);
    }

    if (studioChanged) {
      studio.state = {
        ...(studio.state || {}),
        completedFilms,
      };
      upsertStudio(studio);
    }
  }

  return {
    currentMonthKey,
    releasedFilmKeys,
    delayedCount: dueSelection.delayedCount,
  };
}

function calculateGenreTrends(worldState, genres, year, month) {
  const currentIndex = monthIndex(year, month);
  const releasesPerGenre = {};

  for (const film of Object.values(worldState.filmCatalog)) {
    const releaseIdx = monthIndex(toNumber(film.releaseYear, year), toNumber(film.releaseMonth, month));
    if ((currentIndex - releaseIdx) <= 2 && (currentIndex - releaseIdx) >= 0) {
      releasesPerGenre[film.genre] = (releasesPerGenre[film.genre] || 0) + 1;
    }
  }

  for (const genre of genres) {
    const trend = getTrend(worldState, genre);
    let popularity = trend.popularity;
    let momentum = trend.momentum;

    const noiseSeed = hashSeed(['genre-noise', genre, String(year), String(month)]);
    const noiseRandom = createDeterministicRng(noiseSeed);
    const noise = (noiseRandom() * 0.02) - 0.01;
    momentum += noise;

    const recentReleases = toNumber(releasesPerGenre[genre], 0);
    if (recentReleases > 6) {
      momentum -= 0.04;
    } else if (recentReleases > 3) {
      momentum -= 0.015;
    } else if (recentReleases === 0 && popularity < 0.8) {
      momentum += 0.005;
    }

    if (popularity > 1.6) {
      momentum -= 0.02;
    } else if (popularity < 0.5) {
      momentum += 0.015;
    }

    momentum *= 0.95;
    popularity += momentum;

    if (popularity < 0.3) {
      popularity = 0.3;
      momentum = Math.max(0, momentum);
    }
    if (popularity > 1.9) {
      popularity = 1.9;
      momentum = Math.min(0, momentum);
    }

    worldState.genreTrends[genre] = {
      popularity: Number(popularity.toFixed(3)),
      momentum: Number(momentum.toFixed(4)),
      peakDuration: popularity > 1.55 ? (toNumber(trend.peakDuration, 0) + 1) : 0,
    };
  }
}

function computeChartAndRevenue(studios, worldState, year, month) {
  const chartEntries = [];
  const payoutByStudio = {};
  const currentMonthKey = monthKey(year, month);

  for (const film of Object.values(worldState.filmCatalog)) {
    const releaseIdx = monthIndex(toNumber(film.releaseYear, year), toNumber(film.releaseMonth, month));
    const currentIdx = monthIndex(year, month);
    if (releaseIdx > currentIdx) {
      continue;
    }

    const monthsSinceRelease = getMonthsSinceRelease(
      toNumber(film.releaseYear, year),
      toNumber(film.releaseMonth, month),
      year,
      month
    );
    const phase = getDistributionPhaseFromDeal(monthsSinceRelease, film.distributionDeal);
    film.currentPhase = phase;
    if (phase === 'ended') {
      continue;
    }

    const trendFactor = toNumber(worldState.genreTrends[film.genre]?.popularity, 1);
    const isOpening = releaseIdx === currentIdx;

    const seed = hashSeed([
      'boxoffice',
      film.filmKey,
      String(year),
      String(month),
    ]);
    const random = createDeterministicRng(seed);

    let chartQuality = toNumber(film.chartQuality, toNumber(film.baseQuality, 50));
    let viewers = 0;
    let revenue = 0;

    if (phase === 'cinema') {
      if (!isOpening) {
        const decay = 1 - (0.05 + (random() * 0.07));
        chartQuality = chartQuality * decay;
      }

      chartQuality = Math.max(0, chartQuality);
      const baseViewers = Math.pow(Math.max(0, chartQuality - 10) / 20, 1.1) * 250000 * trendFactor;
      const randomizer = 0.925 + (random() * 0.15);
      viewers = Math.floor(Math.max(0, baseViewers) * randomizer);
      revenue = Math.floor(viewers * 4);
    } else {
      const performanceScore = toNumber(film.baseQuality, 50) + (toNumber(film.baseHype, 0) * 0.5);
      const randomizer = 0.85 + (random() * 0.3);
      let phaseMultiplier = 0;

      if (phase === 'home') phaseMultiplier = 1400;
      if (phase === 'payTv') phaseMultiplier = 950;
      if (phase === 'freeTv') phaseMultiplier = 550;

      const variableRevenue = Math.max(0, performanceScore * phaseMultiplier * trendFactor * randomizer);
      const share = toNumber(film.distributionDeal?.revenueShare, 0.28);
      const guarantee = toNumber(film.distributionDeal?.monthlyGuarantee, 0);
      revenue = Math.floor((variableRevenue * share) + guarantee);
      viewers = Math.floor(revenue / 4);
    }

    film.chartQuality = chartQuality;
    film.weeksInCharts = toNumber(film.weeksInCharts, 0) + 1;
    film.totalViewers = toNumber(film.totalViewers, 0) + viewers;
    film.totalRevenue = toNumber(film.totalRevenue, 0) + revenue;
    if (!film.monthlyRevenueByMonth || typeof film.monthlyRevenueByMonth !== 'object') {
      film.monthlyRevenueByMonth = {};
    }
    if (!film.monthlyViewersByMonth || typeof film.monthlyViewersByMonth !== 'object') {
      film.monthlyViewersByMonth = {};
    }
    film.monthlyRevenueByMonth[currentMonthKey] = toNumber(film.monthlyRevenueByMonth[currentMonthKey], 0) + revenue;
    film.monthlyViewersByMonth[currentMonthKey] = toNumber(film.monthlyViewersByMonth[currentMonthKey], 0) + viewers;

    if (!film.phaseRevenue || typeof film.phaseRevenue !== 'object') {
      film.phaseRevenue = { cinema: 0, home: 0, payTv: 0, freeTv: 0 };
    }
    if (phase === 'cinema' || phase === 'home' || phase === 'payTv' || phase === 'freeTv') {
      film.phaseRevenue[phase] = toNumber(film.phaseRevenue[phase], 0) + revenue;
    }

    payoutByStudio[film.studioId] = (payoutByStudio[film.studioId] || 0) + revenue;

    chartEntries.push({
      filmKey: film.filmKey,
      title: film.title,
      studioId: film.studioId,
      studioName: film.studioName,
      genre: film.genre,
      chartQuality: Number(chartQuality.toFixed(2)),
      viewers,
      revenue,
      phase,
      monthKey: currentMonthKey,
      weeksInCharts: film.weeksInCharts,
      totalViewers: film.totalViewers,
    });
  }

  chartEntries.sort((a, b) => b.viewers - a.viewers);

  for (const studio of studios) {
    const payout = toNumber(payoutByStudio[String(studio.id)], 0);
    if (payout <= 0) {
      continue;
    }

    if (!Array.isArray(studio.state.transactionLog)) {
      studio.state.transactionLog = [];
    }

    studio.state.capital = toNumber(studio.state.capital, 0) + payout;
    studio.state.transactionLog.push({
      date: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
      type: 'Einnahme',
      category: 'Filmverleih',
      description: `Globales Box Office (${monthKey(year, month)})`,
      amount: payout,
    });

    upsertStudio(studio);
  }

  return chartEntries;
}

function getLatestChart() {
  const worldState = readWorldState();
  if (!Array.isArray(worldState.chartsHistory) || worldState.chartsHistory.length === 0) {
    return null;
  }
  return worldState.chartsHistory[worldState.chartsHistory.length - 1];
}

function getChartsHistory(limit = 12) {
  const worldState = readWorldState();
  const safeLimit = Math.max(1, Math.min(120, toNumber(limit, 12)));
  const history = Array.isArray(worldState.chartsHistory) ? worldState.chartsHistory : [];
  return history.slice(-safeLimit);
}

function getLeaderboard(options = {}) {
  const mode = String(options.mode || 'lifetime');
  const requestedMonthKey = options.monthKey ? String(options.monthKey) : null;
  const worldState = readWorldState();
  const totals = {};

  const latestChart = getLatestChart();
  const effectiveMonthKey = requestedMonthKey || latestChart?.monthKey || null;

  for (const film of Object.values(worldState.filmCatalog || {})) {
    const studioId = String(film.studioId || 'unknown');
    if (!totals[studioId]) {
      totals[studioId] = {
        studioId,
        studioName: film.studioName || studioId,
        filmCount: 0,
        totalViewers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        monthlyViewers: 0,
        prestigeScore: 0,
        qualityScoreSum: 0,
        bestFilmTitle: null,
        bestFilmViewers: 0,
      };
    }

    const entry = totals[studioId];
    entry.filmCount += 1;
    entry.totalViewers += toNumber(film.totalViewers, 0);
    entry.totalRevenue += toNumber(film.totalRevenue, 0);
    entry.qualityScoreSum += toNumber(film.baseQuality, 50);

    if (effectiveMonthKey) {
      entry.monthlyRevenue += toNumber(film.monthlyRevenueByMonth?.[effectiveMonthKey], 0);
      entry.monthlyViewers += toNumber(film.monthlyViewersByMonth?.[effectiveMonthKey], 0);
    }

    const filmViewers = toNumber(film.totalViewers, 0);
    if (filmViewers > entry.bestFilmViewers) {
      entry.bestFilmViewers = filmViewers;
      entry.bestFilmTitle = film.title || null;
    }
  }

  for (const entry of Object.values(totals)) {
    const avgQuality = entry.filmCount > 0 ? (entry.qualityScoreSum / entry.filmCount) : 0;
    entry.prestigeScore = Number((
      (entry.filmCount * 5) +
      (avgQuality * 2) +
      (entry.totalViewers / 500000)
    ).toFixed(2));
  }

  const rankBy =
    mode === 'monthly-revenue' ? 'monthlyRevenue'
      : mode === 'prestige' ? 'prestigeScore'
        : 'totalRevenue';

  return Object.values(totals)
    .sort((a, b) => toNumber(b[rankBy], 0) - toNumber(a[rankBy], 0))
    .map((entry, index) => ({
      rank: index + 1,
      mode,
      monthKey: effectiveMonthKey,
      ...entry,
    }));
}

function getReleaseCalendar(year, month) {
  return getMonthOccupancy(year, month);
}

function getReleaseBoardForMonth(year, month) {
  return getReleaseBoard(year, month);
}

function getDistributionDeals(options = {}) {
  const worldState = readWorldState();
  const studioFilter = options.studioId ? String(options.studioId) : null;
  const status = String(options.status || 'all');

  const deals = [];
  for (const film of Object.values(worldState.filmCatalog || {})) {
    if (studioFilter && String(film.studioId) !== studioFilter) {
      continue;
    }

    const phase = String(film.currentPhase || 'pre_release');
    const isActive = phase !== 'ended';
    if (status === 'active' && !isActive) continue;
    if (status === 'ended' && isActive) continue;

    deals.push({
      releaseId: film.releaseId,
      studioId: film.studioId,
      studioName: film.studioName,
      filmTitle: film.title,
      phase,
      releaseMonthKey: film.releaseMonthKey,
      distributionDeal: film.distributionDeal || null,
      totalRevenue: toNumber(film.totalRevenue, 0),
      totalViewers: toNumber(film.totalViewers, 0),
      phaseRevenue: film.phaseRevenue || {},
    });
  }

  deals.sort((a, b) => b.totalRevenue - a.totalRevenue);
  return deals;
}

function getStudioReleasePlan(studioId, year, month) {
  const studio = listStudios().find(item => String(item.id) === String(studioId));
  if (!studio) {
    return null;
  }

  const completedFilms = Array.isArray(studio.state?.completedFilms) ? studio.state.completedFilms : [];
  const films = completedFilms.map(film => {
    const release = film.onlineRelease || null;
    const targetYear = toNumber(release?.releaseYear, 0);
    const targetMonth = toNumber(release?.releaseMonth, 0);
    const suggested = targetYear > 0 && targetMonth > 0
      ? findNextAvailableMonth(targetYear, targetMonth, 24)
      : null;

    return {
      title: film.workingTitle || null,
      genre: film.genre || null,
      finalQuality: toNumber(film.finalQuality, 0),
      hype: toNumber(film.hype, 0),
      release: release
        ? {
            ...release,
            monthKey: (targetYear > 0 && targetMonth > 0) ? monthKey(targetYear, targetMonth) : null,
          }
        : null,
      suggestedNextAvailable: suggested
        ? {
            year: suggested.year,
            month: suggested.month,
            monthKey: suggested.monthKey,
            available: suggested.available,
          }
        : null,
    };
  });

  return {
    studioId: String(studio.id),
    studioName: studio.studioName,
    selectedMonth: {
      year,
      month,
      monthKey: monthKey(year, month),
    },
    calendar: getMonthOccupancy(year, month),
    films,
  };
}

function runWorldMarketTick(now = new Date()) {
  const worldState = readWorldState();
  const ingameDate = getCurrentIngameDate(now);
  const year = ingameDate.getUTCFullYear();
  const month = ingameDate.getUTCMonth() + 1;
  const key = monthKey(year, month);

  if (worldState.lastProcessedMonthKey === key) {
    const latestChart = getLatestChart();
    return {
      skipped: true,
      reason: 'already_processed',
      monthKey: key,
      chartTop: latestChart ? latestChart.topFilms : [],
      leaderboard: getLeaderboard({ mode: 'lifetime' }),
      genreTrends: worldState.genreTrends,
    };
  }

  const studios = listStudios().map(studio => ({ ...studio, state: { ...(studio.state || {}) } }));
  const genres = gatherGenres(studios, worldState);

  const catalogUpdate = ensureFilmCatalog(studios, worldState, year, month);
  calculateGenreTrends(worldState, genres, year, month);
  const chartEntries = computeChartAndRevenue(studios, worldState, year, month);

  const topFilms = chartEntries.slice(0, 10);
  const topFilmsTop20 = chartEntries.slice(0, 20);
  const totalViewers = chartEntries.reduce((sum, entry) => sum + toNumber(entry.viewers, 0), 0);
  const totalRevenue = chartEntries.reduce((sum, entry) => sum + toNumber(entry.revenue, 0), 0);

  worldState.chartsHistory.push({
    year,
    month,
    monthKey: key,
    processedAtIso: now.toISOString(),
    topFilms,
    topFilmsTop20,
    totalViewers,
    totalRevenue,
    filmCount: chartEntries.length,
  });

  if (worldState.chartsHistory.length > 60) {
    worldState.chartsHistory = worldState.chartsHistory.slice(-60);
  }

  worldState.lastProcessedMonthKey = key;
  worldState.updatedAtIso = now.toISOString();
  writeWorldState(worldState);

  const leaderboard = getLeaderboard({ mode: 'lifetime' });

  return {
    skipped: false,
    monthKey: key,
    releasedFilmCount: catalogUpdate.releasedFilmKeys.length,
    delayedReleaseCount: catalogUpdate.delayedCount,
    filmCount: chartEntries.length,
    totalViewers,
    totalRevenue,
    topFilms,
    topFilmsTop20,
    leaderboard,
    genreTrends: worldState.genreTrends,
  };
}

function getWorldStateSnapshot() {
  return readWorldState();
}

module.exports = {
  runWorldMarketTick,
  getLatestChart,
  getChartsHistory,
  getLeaderboard,
  getReleaseCalendar,
  getReleaseBoardForMonth,
  getDistributionDeals,
  getStudioReleasePlan,
  getWorldStateSnapshot,
};
