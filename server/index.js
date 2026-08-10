const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const {
  getIngameMonthIndex,
  getCurrentIngameDate,
  calculateElapsedIngameMonths,
} = require('./timeModel');
const { runCatchUpMonths } = require('./simulation');
const { listStudios, getStudio, upsertStudio, DB_FILE } = require('./studioStore');
const { validateStudioState } = require('./validation');
const { processStudioSync } = require('./gameService');
const { runWorldTick } = require('./worldTick');
const {
  runWorldMarketTick,
  getWorldStateSnapshot,
  getLatestChart,
  getChartsHistory,
  getLeaderboard,
  getReleaseCalendar,
  getReleaseBoardForMonth,
  getDistributionDeals,
  getStudioReleasePlan,
} = require('./worldMarketService');
const { readWorldState, writeWorldState } = require('./worldStateStore');
const { createListing, buyListing, getMarketOverview } = require('./marketService');
const { DB_FILE: MARKET_DB_FILE } = require('./marketStore');
const { validateStudioTalentLocks } = require('./talentLockService');
const { scheduleFilmRelease } = require('./releaseService');
const { listUsers, getUserById, getUserByEmail, getUserByUsername, upsertUser, removeUser, DB_FILE: USER_DB_FILE } = require('./userStore');
const { createSession, getSession, removeSession, pruneExpiredSessions } = require('./sessionStore');
const {
  hashPassword,
  verifyPassword,
  generateId,
  createSessionRecord,
  sanitizeUserForClient,
  validateRegisterPayload,
  validateLoginPayload,
} = require('./authService');

const PORT = Number(process.env.PORT || 8787);
const AUTO_WORLD_TICK_ENABLED = String(process.env.AUTO_WORLD_TICK_ENABLED || '1').trim() !== '0';
const AUTO_WORLD_TICK_INTERVAL_MS = Math.max(10_000, Number(process.env.AUTO_WORLD_TICK_INTERVAL_MS || 60_000) || 60_000);
const VERWALTUNG_FILE = path.join(__dirname, '..', 'public', 'Verwaltung.html');
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'maik.springer@mein.gmx').trim().toLowerCase();
const ADMIN_FALLBACK_EMAIL = String(process.env.ADMIN_FALLBACK_EMAIL || 'admin@moviebusiness.local').trim().toLowerCase();
const ADMIN_BOOTSTRAP_PASSWORD = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin1234');
const MAX_JSON_BODY_BYTES = 10 * 1024 * 1024;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '') || 'user';
}

function generateTempPassword() {
  return `mb_${Math.random().toString(36).slice(2, 10)}!`;
}

function generateUniqueManagedEmail(username) {
  const base = slugify(username);
  let attempt = 0;

  while (attempt < 2000) {
    const suffix = attempt === 0 ? '' : `.${attempt}`;
    const email = `${base}${suffix}@moviebusiness.local`;
    if (!getUserByEmail(email)) {
      return email;
    }
    attempt += 1;
  }

  return `${base}.${Date.now()}@moviebusiness.local`;
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(body);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > MAX_JSON_BODY_BYTES) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function addMonths(year, month, delta) {
  let y = year;
  let m = month;
  let d = delta;

  while (d > 0) {
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    d -= 1;
  }

  return { year: y, month: m };
}

function parseStudioRoute(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2 || parts[0] !== 'studios') {
    return null;
  }

  return {
    studioId: parts[1],
    action: parts[2] || '',
    subAction: parts[3] || '',
  };
}

function parseAdminUserRoute(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 3 || parts[0] !== 'admin' || parts[1] !== 'users') {
    return null;
  }

  return {
    userId: parts[2],
    action: parts[3] || '',
  };
}

function getBearerToken(req, url) {
  const authHeader = String(req.headers.authorization || '');
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return url.searchParams.get('token') || '';
}

function resolveAuthUser(req, url) {
  pruneExpiredSessions();
  const token = getBearerToken(req, url);
  if (!token) {
    return { token: '', user: null };
  }
  const session = getSession(token);
  if (!session) {
    return { token, user: null };
  }
  const user = getUserById(session.userId);
  return { token, user };
}

function isAdmin(user) {
  if (!user) {
    return false;
  }
  return user.role === 'admin' || normalizeEmail(user.email) === ADMIN_EMAIL;
}

function ensurePrimaryAdminUser() {
  const adminUser = getUserByEmail(ADMIN_EMAIL);
  if (!adminUser) {
    return;
  }

  if (adminUser.role !== 'admin') {
    adminUser.role = 'admin';
    upsertUser(adminUser);
  }
}

function toIsoTimeOrZero(value) {
  const ts = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(ts) ? ts : 0;
}

function pickPreferredStudio(studios) {
  if (!Array.isArray(studios) || studios.length === 0) {
    return null;
  }

  const sorted = [...studios].sort((a, b) => {
    const byLastProcessed = toIsoTimeOrZero(b?.lastProcessedAtIso) - toIsoTimeOrZero(a?.lastProcessedAtIso);
    if (byLastProcessed !== 0) return byLastProcessed;
    const byCreated = toIsoTimeOrZero(b?.createdAtIso) - toIsoTimeOrZero(a?.createdAtIso);
    if (byCreated !== 0) return byCreated;
    return String(b?.id || '').localeCompare(String(a?.id || ''));
  });

  return sorted[0] || null;
}

function findPreferredStudioByOwner(ownerId) {
  const normalizedOwnerId = String(ownerId || '').trim();
  if (!normalizedOwnerId) {
    return null;
  }

  const ownedStudios = listStudios().filter(studio => String(studio?.ownerId || '').trim() === normalizedOwnerId);
  return pickPreferredStudio(ownedStudios);
}

function dedupeStudiosByOwnerOnStartup() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { removed: 0, ownersFixed: 0 };
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw || '{}');
    const studiosMap = parsed && typeof parsed === 'object' && parsed.studios && typeof parsed.studios === 'object'
      ? parsed.studios
      : {};

    const byOwner = {};
    Object.entries(studiosMap).forEach(([studioId, studio]) => {
      const ownerId = String(studio?.ownerId || '').trim();
      if (!ownerId || ownerId === 'Konkurrenz') return;
      if (!byOwner[ownerId]) byOwner[ownerId] = [];
      byOwner[ownerId].push({ studioId, studio });
    });

    let removed = 0;
    let ownersFixed = 0;
    Object.entries(byOwner).forEach(([ownerId, entries]) => {
      if (!Array.isArray(entries) || entries.length <= 1) return;

      const preferred = pickPreferredStudio(entries.map(entry => entry.studio));
      if (!preferred) return;
      const preferredId = String(preferred.id || '').trim();
      if (!preferredId) return;

      ownersFixed += 1;
      entries.forEach(entry => {
        if (String(entry.studioId) === preferredId) return;
        if (studiosMap[entry.studioId]) {
          delete studiosMap[entry.studioId];
          removed += 1;
        }
      });
    });

    if (removed > 0) {
      parsed.studios = studiosMap;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      console.log(`[online-core] deduped studios: removed=${removed}, ownersFixed=${ownersFixed}`);
    }

    return { removed, ownersFixed };
  } catch (error) {
    console.warn('[online-core] studio dedupe skipped due to error:', error instanceof Error ? error.message : error);
    return { removed: 0, ownersFixed: 0 };
  }
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(html);
}

function ensureAdminSeed() {
  const nowIso = new Date().toISOString();
  const bootstrapTargets = [
    {
      email: ADMIN_FALLBACK_EMAIL,
      username: 'Admin',
      studioName: 'Admin Studio',
    },
    {
      email: ADMIN_EMAIL,
      username: 'Primary Admin',
      studioName: 'Movie Business HQ',
    },
  ];

  const seen = new Set();
  bootstrapTargets.forEach(target => {
    const email = normalizeEmail(target.email);
    if (!email || seen.has(email)) {
      return;
    }
    seen.add(email);

    const existing = getUserByEmail(email);
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        upsertUser(existing);
      }
      return;
    }

    const passwordSaltHash = hashPassword(ADMIN_BOOTSTRAP_PASSWORD);
    upsertUser({
      id: generateId('usr'),
      email,
      username: target.username,
      studioName: target.studioName,
      role: 'admin',
      passwordSalt: passwordSaltHash.salt,
      passwordHash: passwordSaltHash.hash,
      createdAtIso: nowIso,
      lastLoginAtIso: null,
      importedLegacySaves: false,
    });
  });
}

function sanitizeUsersForAdmin(users) {
  return users.map(user => ({
    id: user.id,
    email: user.email,
    username: user.username,
    studioName: user.studioName || null,
    role: user.role,
    hasProfileImage: Boolean(user.profileImageData),
    createdAtIso: user.createdAtIso,
    lastLoginAtIso: user.lastLoginAtIso || null,
    importedLegacySaves: Boolean(user.importedLegacySaves),
  }));
}

function sanitizeStudiosForAdmin(studios) {
  const ownStudios = studios.map(studio => {
    const completedFilms = Array.isArray(studio.state?.completedFilms) ? studio.state.completedFilms : [];
    const activeProjects = Array.isArray(studio.state?.activeProjects) ? studio.state.activeProjects : [];
    return {
      id: String(studio.id || ''),
      studioName: String(studio.studioName || ''),
      ownerId: studio.ownerId || null,
      capital: Number(studio.state?.capital || 0),
      ingameYear: Number(studio.ingameYear || 0),
      ingameMonth: Number(studio.ingameMonth || 0),
      completedFilmsCount: completedFilms.length,
      activeProjectsCount: activeProjects.length,
      lastProcessedAtIso: studio.lastProcessedAtIso || null,
      source: 'player',
      studioRef: {
        type: 'player',
        studioId: String(studio.id || ''),
      },
    };
  });

  const competitorsByName = new Map();
  studios.forEach(studio => {
    const competitors = Array.isArray(studio.state?.competitors) ? studio.state.competitors : [];
    competitors.forEach(competitor => {
      const name = String(competitor?.name || '').trim();
      if (!name) return;

      const key = name.toLowerCase();
      if (competitorsByName.has(key)) return;

      const completedFilms = Array.isArray(competitor?.completedFilms) ? competitor.completedFilms : [];
      const isProducing = String(competitor?.currentActivity?.type || '') === 'producing';

      competitorsByName.set(key, {
        id: `competitor:${slugify(name)}`,
        studioName: name,
        ownerId: 'Konkurrenz',
        capital: 0,
        ingameYear: Number(studio.ingameYear || 0),
        ingameMonth: Number(studio.ingameMonth || 0),
        completedFilmsCount: completedFilms.length,
        activeProjectsCount: isProducing ? 1 : 0,
        lastProcessedAtIso: null,
        source: 'competitor',
        studioRef: {
          type: 'competitor',
          competitorName: name,
        },
      });
    });
  });

  return [...ownStudios, ...Array.from(competitorsByName.values())]
    .sort((a, b) => a.studioName.localeCompare(b.studioName, 'de'));
}

function collectFilmsForAdmin(studios) {
  const byKey = new Map();

  const addFilm = (film, priority) => {
    const title = String(film?.title || '').trim();
    const studioName = String(film?.studioName || '').trim();
    const stableId = String(film?.id || '').trim();
    const key = stableId || `${title.toLowerCase()}::${studioName.toLowerCase()}`;
    if (!key) return;

    const existing = byKey.get(key);
    if (existing && existing.priority <= priority) {
      return;
    }

    byKey.set(key, {
      ...film,
      priority,
    });
  };

  const worldState = getWorldStateSnapshot();
  const latestChart = getLatestChart();

  // Mirror in-game Kino Top 20 logic (competitor films + active player cinema films).
  const kinoTopCandidates = [];
  studios.forEach(studio => {
    const competitors = Array.isArray(studio.state?.competitors) ? studio.state.competitors : [];
    competitors.forEach((competitor, competitorIndex) => {
      const competitorFilms = Array.isArray(competitor?.completedFilms) ? competitor.completedFilms : [];
      competitorFilms.forEach((film, filmIndex) => {
        const viewers = Number(film?.viewers || 0);
        if (!Number.isFinite(viewers) || viewers <= 0) return;
        const releaseDateIso = film?.releaseDate ? new Date(film.releaseDate).toISOString() : null;
        kinoTopCandidates.push({
          id: `competitor:${competitor?.id || competitorIndex}:${filmIndex}`,
          title: String(film?.title || 'Unbenannter Film'),
          studioId: String(competitor?.id || ''),
          studioName: String(competitor?.name || film?.studioName || 'Konkurrenzstudio'),
          genre: String(film?.genre || ''),
          quality: Number(film?.quality || 0),
          hype: viewers,
          releaseDateIso,
          source: 'Kino Top 20',
          filmRef: {
            type: 'competitor',
            competitorId: Number(competitor?.id),
            competitorName: String(competitor?.name || ''),
            filmIndex,
            title: String(film?.title || ''),
            releaseDateIso,
          },
          __viewers: viewers,
        });
      });
    });

    const completedFilms = Array.isArray(studio.state?.completedFilms) ? studio.state.completedFilms : [];
    completedFilms.forEach((film, index) => {
      const cinema = film?.cinemaRelease;
      const isCinemaActive = String(cinema?.status || '') === 'active' || String(film?.activeDeal?.currentPhase || '') === 'cinema';
      if (!isCinemaActive || !cinema?.releaseDate) return;

      const viewers = Number(cinema?.viewers || 0);
      if (!Number.isFinite(viewers) || viewers <= 0) return;

      const releaseDate = new Date(cinema.releaseDate);
      if (Number.isNaN(releaseDate.getTime())) return;
      const chartAppearanceDate = new Date(releaseDate);
      chartAppearanceDate.setDate(chartAppearanceDate.getDate() + 7);
      const currentGameDate = new Date(studio.state?.gameDate || Date.now());
      currentGameDate.setHours(0, 0, 0, 0);
      chartAppearanceDate.setHours(0, 0, 0, 0);
      if (currentGameDate < chartAppearanceDate) return;

      kinoTopCandidates.push({
        id: `${String(studio.id || 'studio')}::${index}`,
        title: String(film?.workingTitle || 'Unbenannter Film'),
        studioId: String(studio.id || ''),
        studioName: String(studio.studioName || ''),
        genre: String(film?.genre || ''),
        quality: Number(film?.finalQuality || 0),
        hype: viewers,
        releaseDateIso: cinema.releaseDate,
        source: 'Kino Top 20',
        filmRef: {
          type: 'player',
          studioId: String(studio.id || ''),
          filmIndex: index,
        },
        __viewers: viewers,
      });
    });
  });

  kinoTopCandidates
    .sort((a, b) => Number(b.__viewers || 0) - Number(a.__viewers || 0))
    .slice(0, 20)
    .forEach(film => {
      const { __viewers, ...cleanFilm } = film;
      addFilm(cleanFilm, 0);
    });

  const chartEntries = Array.isArray(latestChart?.topFilms) ? latestChart.topFilms : [];
  chartEntries.forEach((entry, index) => {
    addFilm({
      id: `chart:${latestChart.monthKey || 'latest'}:${entry?.filmKey || index}`,
      title: String(entry?.title || 'Unbenannter Film'),
      studioId: String(entry?.studioId || ''),
      studioName: String(entry?.studioName || ''),
      genre: String(entry?.genre || ''),
      quality: Number(entry?.chartQuality || 0),
      hype: Number(entry?.viewers || 0),
      releaseDateIso: null,
      source: `Kinocharts ${latestChart?.monthKey || ''}`.trim(),
      filmRef: {
        type: 'world',
        filmKey: String(entry?.filmKey || ''),
      },
    }, 1);
  });

  Object.values(worldState.filmCatalog || {}).forEach((film, index) => {
    const releaseYear = Number(film?.releaseYear || 0);
    const releaseMonth = Number(film?.releaseMonth || 0);
    const releaseDateIso = releaseYear > 0 && releaseMonth > 0
      ? new Date(Date.UTC(releaseYear, Math.max(0, releaseMonth - 1), 1)).toISOString()
      : null;

    addFilm({
      id: String(film?.filmKey || `world:${index}`),
      title: String(film?.title || 'Unbenannter Film'),
      studioId: String(film?.studioId || ''),
      studioName: String(film?.studioName || ''),
      genre: String(film?.genre || ''),
      quality: Number(film?.baseQuality || 0),
      hype: Number(film?.baseHype || 0),
      releaseDateIso,
      source: 'Weltmarkt',
      filmRef: {
        type: 'world',
        filmKey: String(film?.filmKey || ''),
      },
    }, 2);
  });

  studios.forEach(studio => {
    const completedFilms = Array.isArray(studio.state?.completedFilms) ? studio.state.completedFilms : [];
    completedFilms.forEach((film, index) => {
      const releaseDateIso = film?.cinemaRelease?.releaseDate || film?.onlineRelease?.scheduledAtIso || null;
      addFilm({
        id: `${String(studio.id || 'studio')}::${index}`,
        title: String(film?.workingTitle || 'Unbenannter Film'),
        studioId: String(studio.id || ''),
        studioName: String(studio.studioName || ''),
        genre: String(film?.genre || ''),
        quality: Number(film?.finalQuality || 0),
        hype: Number(film?.hype || 0),
        releaseDateIso,
        source: 'Studiofilm',
        filmRef: {
          type: 'player',
          studioId: String(studio.id || ''),
          filmIndex: index,
        },
      }, 3);
    });

    const competitors = Array.isArray(studio.state?.competitors) ? studio.state.competitors : [];
    competitors.forEach((competitor, competitorIndex) => {
      const competitorFilms = Array.isArray(competitor?.completedFilms) ? competitor.completedFilms : [];
      competitorFilms.forEach((film, filmIndex) => {
        const releaseDateIso = film?.releaseDate ? new Date(film.releaseDate).toISOString() : null;
        addFilm({
          id: `competitor:${competitor?.id || competitorIndex}:${filmIndex}`,
          title: String(film?.title || 'Unbenannter Film'),
          studioId: String(competitor?.id || ''),
          studioName: String(competitor?.name || film?.studioName || 'Konkurrenzstudio'),
          genre: String(film?.genre || ''),
          quality: Number(film?.quality || 0),
          hype: Number(film?.viewers || 0),
          releaseDateIso,
          source: 'Konkurrenzfilm',
          filmRef: {
            type: 'competitor',
            competitorId: Number(competitor?.id),
            competitorName: String(competitor?.name || ''),
            filmIndex,
            title: String(film?.title || ''),
            releaseDateIso,
          },
        }, 4);
      });
    });
  });

  return Array.from(byKey.values())
    .sort((a, b) => {
      const aDate = a.releaseDateIso ? new Date(a.releaseDateIso).getTime() : 0;
      const bDate = b.releaseDateIso ? new Date(b.releaseDateIso).getTime() : 0;
      if (bDate !== aDate) return bDate - aDate;
      return String(a.title || '').localeCompare(String(b.title || ''), 'de');
    })
    .map(item => {
      const { priority, ...film } = item;
      return film;
    });
}

function buildLiveGlobalChartsFallback(studios, referenceDate = new Date()) {
  const now = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
    ? referenceDate
    : new Date();
  const ingameDate = getCurrentIngameDate(now);
  const fallbackMonthKey = `${ingameDate.getUTCFullYear()}-${String(ingameDate.getUTCMonth() + 1).padStart(2, '0')}`;
  const chartEntries = [];

  const pushEntry = (entry) => {
    if (!entry || !entry.title || !entry.studioName) return;
    const viewers = Number(entry.viewers || 0);
    if (!Number.isFinite(viewers) || viewers <= 0) return;
    chartEntries.push({
      title: String(entry.title),
      studioId: String(entry.studioId || ''),
      studioName: String(entry.studioName || ''),
      genre: String(entry.genre || 'Drama'),
      chartQuality: Number(entry.chartQuality || 0),
      viewers,
      revenue: Number(entry.revenue || 0),
      phase: 'cinema',
      monthKey: fallbackMonthKey,
      weeksInCharts: Number(entry.weeksInCharts || 0),
      totalViewers: Number(entry.totalViewers || viewers),
    });
  };

  studios.forEach(studio => {
    const competitors = Array.isArray(studio.state?.competitors) ? studio.state.competitors : [];
    competitors.forEach((competitor, competitorIndex) => {
      const competitorFilms = Array.isArray(competitor?.completedFilms) ? competitor.completedFilms : [];
      competitorFilms.forEach((film, filmIndex) => {
        pushEntry({
          title: String(film?.title || `Konkurrenzfilm ${filmIndex + 1}`),
          studioId: String(competitor?.id || `competitor_${competitorIndex}`),
          studioName: String(competitor?.name || film?.studioName || 'Konkurrenzstudio'),
          genre: String(film?.genre || 'Drama'),
          chartQuality: Number(film?.chartQuality || film?.quality || 0),
          viewers: Number(film?.viewers || 0),
          weeksInCharts: Number(film?.weeksInCharts || 0),
          totalViewers: Number(film?.totalViewers || film?.viewers || 0),
        });
      });
    });

    const completedFilms = Array.isArray(studio.state?.completedFilms) ? studio.state.completedFilms : [];
    completedFilms.forEach((film, index) => {
      const cinema = film?.cinemaRelease;
      const isCinemaActive = String(cinema?.status || '') === 'active' || String(film?.activeDeal?.currentPhase || '') === 'cinema';
      if (!isCinemaActive || !cinema?.releaseDate) return;

      const releaseDate = new Date(cinema.releaseDate);
      if (Number.isNaN(releaseDate.getTime())) return;

      const chartAppearanceDate = new Date(releaseDate);
      chartAppearanceDate.setDate(chartAppearanceDate.getDate() + 7);

      const currentGameDate = new Date(studio.state?.gameDate || Date.now());
      currentGameDate.setHours(0, 0, 0, 0);
      chartAppearanceDate.setHours(0, 0, 0, 0);
      if (currentGameDate < chartAppearanceDate) return;

      pushEntry({
        title: String(film?.workingTitle || `Film ${index + 1}`),
        studioId: String(studio.id || ''),
        studioName: String(studio.studioName || ''),
        genre: String(film?.genre || 'Drama'),
        chartQuality: Number(cinema?.chartQuality || film?.finalQuality || 0),
        viewers: Number(cinema?.viewers || 0),
        weeksInCharts: Number(cinema?.weeksInCharts || 0),
        totalViewers: Number(cinema?.totalViewers || cinema?.viewers || 0),
      });
    });
  });

  chartEntries.sort((a, b) => Number(b.viewers || 0) - Number(a.viewers || 0));
  const topFilmsTop20 = chartEntries.slice(0, 20);
  const topFilms = topFilmsTop20.slice(0, 10);
  const totalViewers = topFilmsTop20.reduce((sum, entry) => sum + Number(entry.viewers || 0), 0);

  return {
    year: ingameDate.getUTCFullYear(),
    month: ingameDate.getUTCMonth() + 1,
    monthKey: fallbackMonthKey,
    processedAtIso: now.toISOString(),
    topFilms,
    topFilmsTop20,
    totalViewers,
    totalRevenue: 0,
    filmCount: chartEntries.length,
    source: 'live_fallback',
  };
}

function collectMarketFeedbackForAdmin(studios) {
  return studios
    .map(studio => {
      const genreTrends = studio?.state?.genreTrends && typeof studio.state.genreTrends === 'object'
        ? studio.state.genreTrends
        : {};
      const marketTrend = studio?.state?.marketTrend && typeof studio.state.marketTrend === 'object'
        ? studio.state.marketTrend
        : null;

      const normalizedTrends = Object.keys(genreTrends)
        .sort((a, b) => a.localeCompare(b, 'de'))
        .map(genre => {
          const value = genreTrends[genre] || {};
          return {
            genre,
            popularity: Number(value.popularity || 0),
            momentum: Number(value.momentum || 0),
            peakDuration: Number(value.peakDuration || 0),
          };
        });

      return {
        studioId: String(studio.id || ''),
        studioName: String(studio.studioName || ''),
        ownerId: studio.ownerId || null,
        ingameYear: Number(studio.ingameYear || 0),
        ingameMonth: Number(studio.ingameMonth || 0),
        source: 'player',
        studioRef: {
          type: 'player',
          studioId: String(studio.id || ''),
        },
        marketTrend: marketTrend
          ? {
              type: marketTrend.type === 'bear' ? 'bear' : 'bull',
              duration: Number(marketTrend.duration || 0),
              minFactor: Number(marketTrend.minFactor || 0),
              maxFactor: Number(marketTrend.maxFactor || 0),
            }
          : null,
        genreTrends: normalizedTrends,
      };
    })
    .sort((a, b) => a.studioName.localeCompare(b.studioName, 'de'));
}

function updateMarketFeedbackForAdmin(studioRef, marketFeedback) {
  const type = String(studioRef?.type || '');
  if (type !== 'player') return 0;

  const studioId = String(studioRef?.studioId || '').trim();
  if (!studioId) return 0;

  const studio = getStudio(studioId);
  if (!studio) return 0;

  const currentState = studio.state && typeof studio.state === 'object' ? studio.state : {};
  const nextGenreTrends = {};
  const incomingTrends = Array.isArray(marketFeedback?.genreTrends) ? marketFeedback.genreTrends : [];

  incomingTrends.forEach(entry => {
    const genre = String(entry?.genre || '').trim();
    if (!genre) return;

    const popularity = Number(entry?.popularity);
    const momentum = Number(entry?.momentum);
    const peakDuration = Number(entry?.peakDuration);

    nextGenreTrends[genre] = {
      popularity: Number.isFinite(popularity) ? popularity : 1,
      momentum: Number.isFinite(momentum) ? momentum : 0,
      peakDuration: Number.isFinite(peakDuration) ? Math.max(0, Math.round(peakDuration)) : 0,
    };
  });

  let nextMarketTrend = null;
  const incomingMarketTrend = marketFeedback?.marketTrend;
  if (incomingMarketTrend && typeof incomingMarketTrend === 'object') {
    const rawType = String(incomingMarketTrend.type || '').trim().toLowerCase();
    const duration = Number(incomingMarketTrend.duration);
    const minFactor = Number(incomingMarketTrend.minFactor);
    const maxFactor = Number(incomingMarketTrend.maxFactor);

    if ((rawType === 'bull' || rawType === 'bear') && Number.isFinite(duration) && Number.isFinite(minFactor) && Number.isFinite(maxFactor)) {
      nextMarketTrend = {
        type: rawType,
        duration: Math.max(0, Math.round(duration)),
        minFactor,
        maxFactor,
      };
    }
  }

  const adminUpdatedAtIso = new Date().toISOString();
  upsertStudio({
    ...studio,
    adminUpdatedAtIso,
    state: {
      ...currentState,
      genreTrends: nextGenreTrends,
      marketTrend: nextMarketTrend,
    },
  });

  return 1;
}

function updateStudioForAdmin(studioRef, studioData) {
  const type = String(studioRef?.type || '');
  const nextName = String(studioData?.studioName || '').trim();
  const adminUpdatedAtIso = new Date().toISOString();

  if (type === 'player') {
    const studioId = String(studioRef?.studioId || '').trim();
    if (!studioId) return 0;

    const studio = getStudio(studioId);
    if (!studio) return 0;

    if (nextName) {
      studio.studioName = nextName;
      studio.state = {
        ...(studio.state || {}),
        studioName: nextName,
      };
    }

    if (studioData?.capital !== undefined && studioData?.capital !== null) {
      studio.state = {
        ...(studio.state || {}),
        capital: Number(studioData.capital || 0),
      };
    }

    if (studioData?.ingameYear !== undefined && studioData?.ingameYear !== null) {
      studio.ingameYear = Number(studioData.ingameYear || 0);
    }
    if (studioData?.ingameMonth !== undefined && studioData?.ingameMonth !== null) {
      studio.ingameMonth = Number(studioData.ingameMonth || 0);
    }

    upsertStudio({
      ...studio,
      adminUpdatedAtIso,
    });
    return 1;
  }

  if (type === 'competitor') {
    const competitorName = String(studioRef?.competitorName || '').trim().toLowerCase();
    if (!competitorName) return 0;

    const studios = listStudios();
    let changed = 0;

    studios.forEach(studio => {
      const competitors = Array.isArray(studio.state?.competitors) ? studio.state.competitors : [];
      let localChanged = false;

      const nextCompetitors = competitors.map(competitor => {
        const currentName = String(competitor?.name || '').trim().toLowerCase();
        if (currentName !== competitorName) {
          return competitor;
        }

        changed += 1;
        localChanged = true;
        return {
          ...competitor,
          name: nextName || competitor.name,
          completedFilms: Array.isArray(competitor.completedFilms)
            ? competitor.completedFilms.map(film => ({
                ...film,
                studioName: nextName || competitor.name,
              }))
            : competitor.completedFilms,
        };
      });

      if (localChanged) {
        upsertStudio({
          ...studio,
          adminUpdatedAtIso,
          state: {
            ...(studio.state || {}),
            competitors: nextCompetitors,
          },
        });
      }
    });

    return changed;
  }

  return 0;
}

function updateFilmForAdmin(filmRef, filmData) {
  const type = String(filmRef?.type || '');
  const adminUpdatedAtIso = new Date().toISOString();

  const title = String(filmData?.title || '').trim();
  const genre = String(filmData?.genre || '').trim();
  const quality = Number(filmData?.quality || 0);
  const hype = Number(filmData?.hype || 0);
  const releaseDateIso = filmData?.releaseDateIso ? String(filmData.releaseDateIso) : null;

  if (type === 'world') {
    const filmKey = String(filmRef?.filmKey || '').trim();
    if (!filmKey) return 0;

    const worldState = getWorldStateSnapshot();
    const film = worldState.filmCatalog?.[filmKey];
    if (!film) return 0;

    if (title) film.title = title;
    if (genre) film.genre = genre;
    if (Number.isFinite(quality)) {
      film.baseQuality = quality;
      film.chartQuality = quality;
    }
    if (Number.isFinite(hype)) {
      film.baseHype = hype;
    }

    if (releaseDateIso) {
      const releaseDate = new Date(releaseDateIso);
      if (!Number.isNaN(releaseDate.getTime())) {
        const releaseYear = releaseDate.getUTCFullYear();
        const releaseMonth = releaseDate.getUTCMonth() + 1;
        film.releaseYear = releaseYear;
        film.releaseMonth = releaseMonth;
        film.releaseMonthKey = `${releaseYear}-${String(releaseMonth).padStart(2, '0')}`;
      }
    }

    worldState.filmCatalog[filmKey] = film;
    worldState.updatedAtIso = new Date().toISOString();
    writeWorldState(worldState);
    return 1;
  }

  if (type === 'player') {
    const studioId = String(filmRef?.studioId || '').trim();
    const filmIndex = Number(filmRef?.filmIndex);
    if (!studioId || !Number.isInteger(filmIndex) || filmIndex < 0) return 0;

    const studio = getStudio(studioId);
    if (!studio) return 0;

    const completedFilms = Array.isArray(studio.state?.completedFilms) ? [...studio.state.completedFilms] : [];
    const currentFilm = completedFilms[filmIndex];
    if (!currentFilm || typeof currentFilm !== 'object') return 0;

    const nextFilm = { ...currentFilm };
    if (title) nextFilm.workingTitle = title;
    if (genre) nextFilm.genre = genre;
    if (Number.isFinite(quality)) nextFilm.finalQuality = quality;
    if (Number.isFinite(hype)) nextFilm.hype = hype;

    if (releaseDateIso) {
      if (nextFilm.cinemaRelease && typeof nextFilm.cinemaRelease === 'object') {
        nextFilm.cinemaRelease = {
          ...nextFilm.cinemaRelease,
          releaseDate: releaseDateIso,
        };
      } else if (nextFilm.onlineRelease && typeof nextFilm.onlineRelease === 'object') {
        nextFilm.onlineRelease = {
          ...nextFilm.onlineRelease,
          scheduledAtIso: releaseDateIso,
        };
      }
    }

    completedFilms[filmIndex] = nextFilm;
    upsertStudio({
      ...studio,
      adminUpdatedAtIso,
      state: {
        ...(studio.state || {}),
        completedFilms,
      },
    });

    return 1;
  }

  if (type === 'competitor') {
    const competitorId = Number(filmRef?.competitorId);
    const hasCompetitorId = Number.isFinite(competitorId);
    const competitorName = String(filmRef?.competitorName || '').trim().toLowerCase();
    const filmIndex = Number(filmRef?.filmIndex);
    const expectedTitle = String(filmRef?.title || filmData?.previousTitle || '').trim().toLowerCase();
    const expectedReleaseDateIso = filmRef?.releaseDateIso
      ? String(filmRef.releaseDateIso)
      : (filmData?.previousReleaseDateIso ? String(filmData.previousReleaseDateIso) : '');
    if ((!competitorName && !hasCompetitorId) || !Number.isInteger(filmIndex) || filmIndex < 0) return 0;

    const toTimeOrNaN = (value) => {
      if (!value) return Number.NaN;
      const ts = new Date(value).getTime();
      return Number.isNaN(ts) ? Number.NaN : ts;
    };

    const expectedReleaseTs = toTimeOrNaN(expectedReleaseDateIso);
    const matchesExpectedFilm = (film) => {
      if (!film || typeof film !== 'object') return false;
      if (expectedTitle && String(film?.title || '').trim().toLowerCase() === expectedTitle) {
        return true;
      }
      if (Number.isFinite(expectedReleaseTs)) {
        const filmReleaseTs = toTimeOrNaN(film?.releaseDate);
        return Number.isFinite(filmReleaseTs) && filmReleaseTs === expectedReleaseTs;
      }
      return false;
    };

    const studios = listStudios();
    let changed = 0;

    studios.forEach(studio => {
      const competitors = Array.isArray(studio.state?.competitors) ? studio.state.competitors : [];
      let localChanged = false;

      const nextCompetitors = competitors.map(competitor => {
        const currentId = Number(competitor?.id);
        const currentName = String(competitor?.name || '').trim().toLowerCase();
        const idMatches = hasCompetitorId && Number.isFinite(currentId) && currentId === competitorId;
        const nameMatches = !!competitorName && currentName === competitorName;
        if (!idMatches && !nameMatches) {
          return competitor;
        }

        const completedFilms = Array.isArray(competitor.completedFilms) ? [...competitor.completedFilms] : [];
        let targetIndex = filmIndex;
        if (targetIndex < 0 || targetIndex >= completedFilms.length || !matchesExpectedFilm(completedFilms[targetIndex])) {
          const resolvedIndex = completedFilms.findIndex(matchesExpectedFilm);
          if (resolvedIndex >= 0) {
            targetIndex = resolvedIndex;
          }
        }

        const currentFilm = completedFilms[targetIndex];
        if (!currentFilm || typeof currentFilm !== 'object') {
          return competitor;
        }

        const nextFilm = { ...currentFilm };
        if (title) nextFilm.title = title;
        if (genre) nextFilm.genre = genre;
        if (Number.isFinite(quality)) {
          nextFilm.quality = quality;
          nextFilm.chartQuality = quality;
        }
        if (Number.isFinite(hype)) {
          nextFilm.viewers = hype;
        }
        if (releaseDateIso) {
          nextFilm.releaseDate = releaseDateIso;
        }

        completedFilms[targetIndex] = nextFilm;
        changed += 1;
        localChanged = true;

        return {
          ...competitor,
          completedFilms,
        };
      });

      if (localChanged) {
        upsertStudio({
          ...studio,
          adminUpdatedAtIso,
          state: {
            ...(studio.state || {}),
            competitors: nextCompetitors,
          },
        });
      }
    });

    return changed;
  }

  return 0;
}

function collectTalentsForAdmin(studios) {
  const actors = [];
  const directors = [];
  const actorKeys = new Set();
  const directorKeys = new Set();

  const createTalentKey = (talent, fallbackId, fallbackName, fallbackGender) => {
    const rawId = talent?.id;
    if (rawId !== undefined && rawId !== null && String(rawId).trim().length > 0) {
      return `id:${String(rawId)}`;
    }
    return `name:${String(fallbackName || '').toLowerCase()}|${String(fallbackGender || '').toLowerCase()}|f:${fallbackId}`;
  };

  studios.forEach(studio => {
    const studioId = String(studio.id || '');
    const studioName = String(studio.studioName || '');

    const studioActors = Array.isArray(studio.state?.actors) ? studio.state.actors : [];
    const studioDirectors = Array.isArray(studio.state?.directors) ? studio.state.directors : [];

    studioActors.forEach((actor, index) => {
      const id = String(actor?.id ?? `${studioId}::actor::${index}`);
      const name = String(actor?.name || 'Unbekannt');
      const gender = String(actor?.gender || '');
      const uniqueKey = createTalentKey(actor, `${studioId}::actor::${index}`, name, gender);

      if (actorKeys.has(uniqueKey)) {
        return;
      }
      actorKeys.add(uniqueKey);

      actors.push({
        id,
        name,
        gender,
        skill: Number(actor?.skill || 0),
        potential: Number(actor?.potential || 0),
        bekanntheit: Number(actor?.bekanntheit || 0),
        studioId,
        studioName,
        talentKey: uniqueKey,
        talentData: actor && typeof actor === 'object' ? { ...actor } : {},
      });
    });

    studioDirectors.forEach((director, index) => {
      const id = String(director?.id ?? `${studioId}::director::${index}`);
      const name = String(director?.name || 'Unbekannt');
      const gender = String(director?.gender || '');
      const uniqueKey = createTalentKey(director, `${studioId}::director::${index}`, name, gender);

      if (directorKeys.has(uniqueKey)) {
        return;
      }
      directorKeys.add(uniqueKey);

      directors.push({
        id,
        name,
        gender,
        skill: Number(director?.skill || 0),
        potential: Number(director?.potential || 0),
        bekanntheit: Number(director?.bekanntheit || 0),
        studioId,
        studioName,
        talentKey: uniqueKey,
        talentData: director && typeof director === 'object' ? { ...director } : {},
      });
    });
  });

  actors.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  directors.sort((a, b) => a.name.localeCompare(b.name, 'de'));

  return { actors, directors };
}

function collectOverviewForAdmin() {
  const users = listUsers();
  const studios = listStudios();
  const talents = collectTalentsForAdmin(studios);
  const films = collectFilmsForAdmin(studios);

  return {
    usersCount: users.length,
    studiosCount: studios.length,
    actorsCount: talents.actors.length,
    directorsCount: talents.directors.length,
    talentsCount: talents.actors.length + talents.directors.length,
    filmsCount: films.length,
  };
}

function createResetStartDate(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

function getLatestResetStartDateIso() {
  const worldState = readWorldState();
  const value = String(worldState?.resetStartDateIso || '').trim();
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString();
}

function applyCalculatedIngameDateToState(state, ingameDateIso) {
  if (!state || typeof state !== 'object' || Array.isArray(state) || !ingameDateIso) {
    return state;
  }

  return {
    ...state,
    gameDate: ingameDateIso,
  };
}

function resetGameDataForAdmin() {
  const now = new Date();
  const resetStartDateIso = createResetStartDate(now).toISOString();
  const removedStudios = listStudios().length;

  fs.writeFileSync(DB_FILE, JSON.stringify({ studios: {} }, null, 2), 'utf-8');
  writeWorldState({
    lastProcessedMonthKey: '',
    genreTrends: {},
    chartsHistory: [],
    filmCatalog: {},
    updatedAtIso: now.toISOString(),
    resetAtIso: now.toISOString(),
    resetStartDateIso,
  });
  fs.writeFileSync(MARKET_DB_FILE, JSON.stringify({ listings: [] }, null, 2), 'utf-8');

  return {
    removedStudios,
    resetWorldState: true,
    resetMarket: true,
    resetStartDateIso,
  };
}

function updateTalentInStudios(type, talentKey, payload) {
  const listKey = type === 'actor' ? 'actors' : 'directors';
  const studios = listStudios();
  let changed = 0;

  const createTalentKey = (talent, fallbackId) => {
    const rawId = talent?.id;
    if (rawId !== undefined && rawId !== null && String(rawId).trim().length > 0) {
      return `id:${String(rawId)}`;
    }
    return `name:${String(talent?.name || '').toLowerCase()}|${String(talent?.gender || '').toLowerCase()}|f:${fallbackId}`;
  };

  studios.forEach(studio => {
    const currentList = Array.isArray(studio.state?.[listKey]) ? studio.state[listKey] : [];
    let localChanged = false;

    const nextList = currentList.map((talent, index) => {
      const fallbackId = `${String(studio.id || '')}::${listKey}::${index}`;
      const key = createTalentKey(talent, fallbackId);
      if (key !== talentKey) {
        return talent;
      }
      localChanged = true;
      changed += 1;
      return {
        ...payload,
      };
    });

    if (localChanged) {
      upsertStudio({
        ...studio,
        state: {
          ...(studio.state || {}),
          [listKey]: nextList,
        },
      });
    }
  });

  return changed;
}

function collectUserBackup(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }
  const studios = listStudios().filter(s => s.ownerId === userId);
  return {
    exportedAtIso: new Date().toISOString(),
    user: sanitizeUserForClient(user),
    studios,
  };
}

function collectUserProfileForAdmin(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  const studios = listStudios()
    .filter(studio => studio.ownerId === userId)
    .map(studio => {
      const state = studio.state && typeof studio.state === 'object' ? studio.state : {};
      const activeProjects = Array.isArray(state.activeProjects) ? state.activeProjects : [];
      const completedFilms = Array.isArray(state.completedFilms) ? state.completedFilms : [];
      const activeConstructions = Array.isArray(state.activeConstructions)
        ? state.activeConstructions
        : (state.activeConstruction ? [state.activeConstruction] : []);
      const activeProductionCampaigns = Array.isArray(state.activeProductionCampaigns)
        ? state.activeProductionCampaigns
        : (state.activeProductionCampaign ? [state.activeProductionCampaign] : []);
      const activeCastings = Array.isArray(state.activeCastings)
        ? state.activeCastings
        : (state.activeCasting ? [state.activeCasting] : []);
      const activeTalentScoutings = Array.isArray(state.activeTalentScoutings)
        ? state.activeTalentScoutings
        : (state.activeTalentScouting ? [state.activeTalentScouting] : []);
      const buildings = Array.isArray(state.buildings) ? state.buildings : [];
      const messages = Array.isArray(state.messages) ? state.messages : [];
      const unreadMessagesCount = messages.filter(message => !message?.read).length;
      const contractOffers = Array.isArray(state.contractOffers) ? state.contractOffers : [];

      return {
        id: String(studio.id || ''),
        studioName: String(studio.studioName || ''),
        ingameYear: Number(studio.ingameYear || 0),
        ingameMonth: Number(studio.ingameMonth || 0),
        gameDate: state.gameDate || null,
        lastProcessedAtIso: studio.lastProcessedAtIso || null,
        adminUpdatedAtIso: studio.adminUpdatedAtIso || null,
        status: {
          capital: Number(state.capital || 0),
          reputation: Number(state.reputation || 0),
          activeProjectsCount: activeProjects.length,
          activeProjectTitles: activeProjects
            .map(project => String(project?.workingTitle || '').trim())
            .filter(Boolean)
            .slice(0, 8),
          activePlanningTitle: state.activePlanning?.workingTitle || null,
          completedFilmsCount: completedFilms.length,
          activeConstructionsCount: activeConstructions.length,
          activeConstructionTypes: activeConstructions
            .map(entry => String(entry?.type || entry?.buildingType || '').trim())
            .filter(Boolean)
            .slice(0, 8),
          activeResearchTechId: state.activeResearch?.techId || null,
          activeResearchEndDate: state.activeResearch?.endDate || null,
          activeWritingTitle: state.activeWriting?.projectTitle || null,
          planning: state.activePlanning
            ? {
                title: String(state.activePlanning?.workingTitle || '').trim() || '-',
                phase: String(state.activePlanning?.phase || '').trim() || '-',
                genre: String(state.activePlanning?.genre || '').trim() || '-',
                projectType: String(state.activePlanning?.projectType || '').trim() || '-',
                scriptTitle: String(state.activePlanning?.scriptTitle || '').trim() || '-',
                scriptEndDate: state.activePlanning?.scriptEndDate || null,
              }
            : null,
          activeProductionCampaignsCount: activeProductionCampaigns.length,
          activeCastingsCount: activeCastings.length,
          activeTalentScoutingsCount: activeTalentScoutings.length,
          contractOffersCount: contractOffers.length,
          unreadMessagesCount,
          messagesCount: messages.length,
          runningProjects: activeProjects
            .map(project => ({
              title: String(project?.workingTitle || '').trim() || 'Unbenanntes Projekt',
              phase: String(project?.phase || '').trim() || '-',
              genre: String(project?.genre || '').trim() || '-',
              productionEndDate: project?.productionEndDate || null,
              postProductionEndDate: project?.postProductionEndDate || null,
            }))
            .slice(0, 20),
          runningOffers: contractOffers
            .map(offer => ({
              title: String(offer?.title || '').trim() || '-',
              stationName: String(offer?.stationName || '').trim() || '-',
              genre: String(offer?.genre || '').trim() || '-',
              payout: Number(offer?.payout || 0),
              maxDurationMonths: Number(offer?.maxDurationMonths || 0),
            }))
            .slice(0, 20),
          runningConstructions: activeConstructions
            .map(entry => ({
              type: String(entry?.type || entry?.buildingType || '').trim() || '-',
              endDate: entry?.endDate || null,
            }))
            .slice(0, 20),
          builtBuildings: buildings
            .filter(entry => Number(entry?.level || 0) > 0)
            .map(entry => ({
              type: String(entry?.type || '').trim() || '-',
              level: Number(entry?.level || 0),
            }))
            .slice(0, 40),
          research: state.activeResearch
            ? {
                techId: state.activeResearch?.techId || '-',
                progressPoints: Number(state.activeResearch?.progressPoints || 0),
                requiredPoints: Number(state.activeResearch?.requiredPoints || 0),
                endDate: state.activeResearch?.endDate || null,
              }
            : null,
        },
      };
    });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      studioName: user.studioName || '',
      role: user.role,
      profileImageData: typeof user.profileImageData === 'string' ? user.profileImageData : null,
      adminPlainPassword: typeof user.adminPlainPassword === 'string' ? user.adminPlainPassword : '',
      createdAtIso: user.createdAtIso,
      lastLoginAtIso: user.lastLoginAtIso || null,
      importedLegacySaves: Boolean(user.importedLegacySaves),
    },
    studios,
  };
}

function updateUserProfileForAdmin(userId, userData) {
  const user = getUserById(userId);
  if (!user) {
    return 0;
  }

  const nextUsername = String(userData?.username || '').trim();
  const nextStudioName = String(userData?.studioName || '').trim();
  const nextPassword = String(userData?.password || '');
  const hasProfileImageField = Object.prototype.hasOwnProperty.call(userData || {}, 'profileImageData');
  const nextProfileImage = hasProfileImageField
    ? String(userData?.profileImageData || '').trim()
    : null;

  if (nextUsername) {
    const existingByUsername = getUserByUsername(nextUsername);
    if (existingByUsername && String(existingByUsername.id || '') !== String(user.id || '')) {
      throw new Error('Username already exists');
    }
  }

  if (nextUsername) {
    user.username = nextUsername;
  }

  if (nextStudioName) {
    user.studioName = nextStudioName;
  }

  if (hasProfileImageField) {
    user.profileImageData = nextProfileImage || null;
  }

  if (nextPassword) {
    if (nextPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    const passwordSaltHash = hashPassword(nextPassword);
    user.passwordSalt = passwordSaltHash.salt;
    user.passwordHash = passwordSaltHash.hash;
    user.adminPlainPassword = nextPassword;
  }

  upsertUser(user);

  const shouldSyncStudios = Boolean(nextStudioName || nextUsername || hasProfileImageField);
  if (shouldSyncStudios) {
    const nowIso = new Date().toISOString();
    const studios = listStudios();
    studios.forEach(studio => {
      if (studio.ownerId !== userId) return;

      const nextState = {
        ...(studio.state || {}),
      };

      if (nextStudioName) {
        nextState.studioName = nextStudioName;
      }

      if (nextUsername) {
        nextState.playerName = nextUsername;
      }

      if (hasProfileImageField) {
        nextState.playerPortraitId = nextProfileImage || nextState.playerPortraitId;
      }

      upsertStudio({
        ...studio,
        studioName: nextStudioName || studio.studioName,
        adminUpdatedAtIso: nowIso,
        state: nextState,
      });
    });
  }

  return 1;
}

function sendIngameMessageToUserStudios(userId, payload) {
  const user = getUserById(userId);
  if (!user) {
    return 0;
  }

  const subject = String(payload?.subject || '').trim();
  const body = String(payload?.body || '').trim();
  if (!subject || !body) {
    return 0;
  }

  const sender = String(payload?.sender || 'Verwaltung').trim() || 'Verwaltung';
  const nowIso = new Date().toISOString();
  const studios = listStudios();
  let changed = 0;

  studios.forEach(studio => {
    if (studio.ownerId !== userId) return;

    const messages = Array.isArray(studio.state?.messages) ? [...studio.state.messages] : [];
    messages.push({
      id: `msg_admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: studio.state?.gameDate || nowIso,
      sender,
      subject,
      body,
      read: false,
    });

    upsertStudio({
      ...studio,
      adminUpdatedAtIso: nowIso,
      state: {
        ...(studio.state || {}),
        messages,
      },
    });
    changed += 1;
  });

  return changed;
}

function applyOwnerProfileOverrides(studio) {
  if (!studio || typeof studio !== 'object') {
    return studio;
  }

  const ownerId = String(studio.ownerId || '').trim();
  if (!ownerId) {
    return studio;
  }

  const owner = getUserById(ownerId);
  if (!owner) {
    return studio;
  }

  const profileImageData = typeof owner.profileImageData === 'string' ? owner.profileImageData.trim() : '';
  if (!profileImageData) {
    return studio;
  }

  return {
    ...studio,
    state: {
      ...(studio.state || {}),
      playerPortraitId: profileImageData,
    },
  };
}

function createServer() {
  ensureAdminSeed();
  ensurePrimaryAdminUser();
  dedupeStudiosByOwnerOnStartup();

  return http.createServer(async (req, res) => {
    if (!req.url || !req.method) {
      sendJson(res, 400, { error: 'Bad request' });
      return;
    }

    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const auth = resolveAuthUser(req, url);

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true, service: 'movie-business-online-core' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/server-time') {
      const now = new Date();
      const worldState = readWorldState();
      sendJson(res, 200, {
        nowIso: now.toISOString(),
        ingameMonthIndex: getIngameMonthIndex(now),
        ingameDateIso: getCurrentIngameDate(now).toISOString(),
        resetStartDateIso: worldState?.resetStartDateIso || null,
        resetAtIso: worldState?.resetAtIso || null,
        rule: '1 real UTC day = 1 ingame month',
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/register') {
      try {
        const body = await parseJsonBody(req);
        const { errors, normalized } = validateRegisterPayload(body);
        if (errors.length > 0) {
          sendJson(res, 400, { error: 'Invalid register payload', details: errors });
          return;
        }

        if (getUserByEmail(normalized.email)) {
          sendJson(res, 409, { error: 'Account with this email already exists' });
          return;
        }

        if (getUserByUsername(normalized.username)) {
          sendJson(res, 409, { error: 'Account with this username already exists' });
          return;
        }

        const existingUsers = listUsers();
        const nowIso = new Date().toISOString();
        const passwordSaltHash = hashPassword(normalized.password);
        const user = {
          id: generateId('usr'),
          email: normalized.email,
          username: normalized.username,
          studioName: normalized.studioName,
          role: normalized.email === ADMIN_EMAIL ? 'admin' : 'user',
          passwordSalt: passwordSaltHash.salt,
          passwordHash: passwordSaltHash.hash,
          createdAtIso: nowIso,
          lastLoginAtIso: nowIso,
          importedLegacySaves: false,
        };

        upsertUser(user);
        const sessionRecord = createSessionRecord(user.id);
        createSession(sessionRecord);

        sendJson(res, 201, {
          token: sessionRecord.token,
          user: sanitizeUserForClient(user),
          dbFile: USER_DB_FILE,
        });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/login') {
      try {
        const body = await parseJsonBody(req);
        const { errors, normalized } = validateLoginPayload(body);
        if (errors.length > 0) {
          sendJson(res, 400, { error: 'Invalid login payload', details: errors });
          return;
        }

        const identifier = String(normalized.identifier || '').trim();
        const isEmailIdentifier = identifier.includes('@');
        const user = isEmailIdentifier
          ? getUserByEmail(identifier)
          : (getUserByUsername(identifier) || getUserByEmail(identifier));
        if (!user || !verifyPassword(normalized.password, user.passwordSalt, user.passwordHash)) {
          sendJson(res, 401, { error: 'Invalid credentials' });
          return;
        }

        const nowIso = new Date().toISOString();
        user.lastLoginAtIso = nowIso;
        upsertUser(user);

        const sessionRecord = createSessionRecord(user.id);
        createSession(sessionRecord);

        sendJson(res, 200, {
          token: sessionRecord.token,
          user: sanitizeUserForClient(user),
        });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/logout') {
      if (!auth.token) {
        sendJson(res, 200, { ok: true });
        return;
      }
      removeSession(auth.token);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/auth/me') {
      if (!auth.user) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }
      sendJson(res, 200, { user: sanitizeUserForClient(auth.user) });
      return;
    }

    if (req.method === 'GET' && (url.pathname === '/Verwaltung.html' || url.pathname === '/verwaltung.html')) {
      if (!fs.existsSync(VERWALTUNG_FILE)) {
        sendHtml(res, 404, '<h1>404 Not Found</h1><p>Verwaltung.html missing.</p>');
        return;
      }
      const html = fs.readFileSync(VERWALTUNG_FILE, 'utf-8');
      sendHtml(res, 200, html);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/users') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      sendJson(res, 200, {
        users: sanitizeUsersForAdmin(listUsers()),
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/overview') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      sendJson(res, 200, {
        overview: collectOverviewForAdmin(),
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/admin/game/reset') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      try {
        const resetResult = resetGameDataForAdmin();
        sendJson(res, 200, {
          ok: true,
          ...resetResult,
        });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/studios') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      sendJson(res, 200, {
        studios: sanitizeStudiosForAdmin(listStudios()),
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/films') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      sendJson(res, 200, {
        films: collectFilmsForAdmin(listStudios()),
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/talents') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      sendJson(res, 200, collectTalentsForAdmin(listStudios()));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/market-feedback') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      sendJson(res, 200, {
        items: collectMarketFeedbackForAdmin(listStudios()),
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/admin/talents/update') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const type = String(body?.type || '').trim();
        const talentKey = String(body?.talentKey || '').trim();
        const talentData = body?.talentData;

        if (type !== 'actor' && type !== 'director') {
          sendJson(res, 400, { error: 'type must be actor or director' });
          return;
        }

        if (!talentKey) {
          sendJson(res, 400, { error: 'talentKey is required' });
          return;
        }

        if (!talentData || typeof talentData !== 'object' || Array.isArray(talentData)) {
          sendJson(res, 400, { error: 'talentData must be an object' });
          return;
        }

        const changed = updateTalentInStudios(type, talentKey, talentData);
        if (changed <= 0) {
          sendJson(res, 404, { error: 'Talent not found' });
          return;
        }

        sendJson(res, 200, { ok: true, changed });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/admin/studios/update') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const studioRef = body?.studioRef;
        const studioData = body?.studioData;

        if (!studioRef || typeof studioRef !== 'object') {
          sendJson(res, 400, { error: 'studioRef is required' });
          return;
        }
        if (!studioData || typeof studioData !== 'object' || Array.isArray(studioData)) {
          sendJson(res, 400, { error: 'studioData must be an object' });
          return;
        }

        const changed = updateStudioForAdmin(studioRef, studioData);
        if (changed <= 0) {
          sendJson(res, 404, { error: 'Studio not found' });
          return;
        }

        sendJson(res, 200, { ok: true, changed });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/admin/films/update') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const filmRef = body?.filmRef;
        const filmData = body?.filmData;

        if (!filmRef || typeof filmRef !== 'object') {
          sendJson(res, 400, { error: 'filmRef is required' });
          return;
        }
        if (!filmData || typeof filmData !== 'object' || Array.isArray(filmData)) {
          sendJson(res, 400, { error: 'filmData must be an object' });
          return;
        }

        const changed = updateFilmForAdmin(filmRef, filmData);
        if (changed <= 0) {
          sendJson(res, 404, { error: 'Film not found' });
          return;
        }

        sendJson(res, 200, { ok: true, changed });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/admin/market-feedback/update') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const studioRef = body?.studioRef;
        const marketFeedback = body?.marketFeedback;

        if (!studioRef || typeof studioRef !== 'object') {
          sendJson(res, 400, { error: 'studioRef is required' });
          return;
        }

        if (!marketFeedback || typeof marketFeedback !== 'object' || Array.isArray(marketFeedback)) {
          sendJson(res, 400, { error: 'marketFeedback must be an object' });
          return;
        }

        const changed = updateMarketFeedbackForAdmin(studioRef, marketFeedback);
        if (changed <= 0) {
          sendJson(res, 404, { error: 'Market feedback target not found' });
          return;
        }

        sendJson(res, 200, { ok: true, changed });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    const adminUserRoute = parseAdminUserRoute(url.pathname);
    if (adminUserRoute) {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }

      const { userId, action } = adminUserRoute;

      if (req.method === 'GET' && action === 'backup') {
        const backup = collectUserBackup(userId);
        if (!backup) {
          sendJson(res, 404, { error: 'User not found' });
          return;
        }
        sendJson(res, 200, backup);
        return;
      }

      if (req.method === 'GET' && action === 'profile') {
        const profile = collectUserProfileForAdmin(userId);
        if (!profile) {
          sendJson(res, 404, { error: 'User not found' });
          return;
        }
        sendJson(res, 200, profile);
        return;
      }

      if (req.method === 'DELETE' && action === '') {
        const targetUser = getUserById(userId);
        if (!targetUser) {
          sendJson(res, 404, { error: 'User not found' });
          return;
        }

        if (normalizeEmail(targetUser.email) === ADMIN_EMAIL) {
          sendJson(res, 400, { error: 'Primary admin user cannot be deleted' });
          return;
        }

        const deleted = removeUser(userId);
        if (!deleted) {
          sendJson(res, 404, { error: 'User not found' });
          return;
        }
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && action === 'role') {
        try {
          const body = await parseJsonBody(req);
          const role = String(body?.role || '').trim();

          if (role !== 'admin' && role !== 'user') {
            sendJson(res, 400, { error: 'Role must be admin or user' });
            return;
          }

          const targetUser = getUserById(userId);
          if (!targetUser) {
            sendJson(res, 404, { error: 'User not found' });
            return;
          }

          if (normalizeEmail(targetUser.email) === ADMIN_EMAIL && role !== 'admin') {
            sendJson(res, 400, { error: 'Primary admin user must remain admin' });
            return;
          }

          targetUser.role = role;
          upsertUser(targetUser);

          sendJson(res, 200, {
            ok: true,
            user: sanitizeUserForClient(targetUser),
          });
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
        }
        return;
      }

      if (req.method === 'POST' && action === 'update') {
        try {
          const body = await parseJsonBody(req);
          const userData = body?.userData;
          if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
            sendJson(res, 400, { error: 'userData must be an object' });
            return;
          }

          const changed = updateUserProfileForAdmin(userId, userData);
          if (changed <= 0) {
            sendJson(res, 404, { error: 'User not found' });
            return;
          }

          const profile = collectUserProfileForAdmin(userId);
          sendJson(res, 200, { ok: true, changed, profile });
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
        }
        return;
      }

      if (req.method === 'POST' && action === 'message') {
        try {
          const body = await parseJsonBody(req);
          const message = body?.message;
          if (!message || typeof message !== 'object' || Array.isArray(message)) {
            sendJson(res, 400, { error: 'message must be an object' });
            return;
          }

          const changed = sendIngameMessageToUserStudios(userId, message);
          if (changed <= 0) {
            sendJson(res, 404, { error: 'User studio not found or message invalid' });
            return;
          }

          sendJson(res, 200, { ok: true, changed });
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
        }
        return;
      }
    }

    if (req.method === 'POST' && url.pathname === '/admin/users/import') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }
      try {
        const body = await parseJsonBody(req);
        const payload = body && typeof body === 'object' ? body : {};
        const backupUser = payload.user;
        const backupStudios = Array.isArray(payload.studios) ? payload.studios : [];

        if (!backupUser || !backupUser.email || !backupUser.username) {
          sendJson(res, 400, { error: 'Invalid backup payload' });
          return;
        }

        if (getUserByEmail(backupUser.email)) {
          sendJson(res, 409, { error: 'Account with this email already exists' });
          return;
        }

        const generatedPassword = String(payload.tempPassword || 'import1234');
        const passwordSaltHash = hashPassword(generatedPassword);
        const nowIso = new Date().toISOString();

        const importedUser = {
          id: generateId('usr'),
          email: String(backupUser.email).toLowerCase(),
          username: String(backupUser.username),
          studioName: String(backupUser.studioName || ''),
          role: 'user',
          passwordSalt: passwordSaltHash.salt,
          passwordHash: passwordSaltHash.hash,
          adminPlainPassword: generatedPassword,
          createdAtIso: nowIso,
          lastLoginAtIso: null,
          importedLegacySaves: true,
        };

        upsertUser(importedUser);

        backupStudios.forEach(studio => {
          if (!studio || typeof studio !== 'object' || !studio.id) {
            return;
          }
          upsertStudio({
            ...studio,
            id: String(studio.id),
            ownerId: importedUser.id,
          });
        });

        sendJson(res, 201, {
          user: sanitizeUserForClient(importedUser),
          tempPassword: generatedPassword,
          importedStudios: backupStudios.length,
        });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/admin/users/create') {
      if (!isAdmin(auth.user)) {
        sendJson(res, 401, { error: 'Admin login required' });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const username = String(body?.username || '').trim();
        const studioName = String(body?.studioName || '').trim();
        const password = String(body?.password || '');
        const imageData = typeof body?.imageData === 'string' ? body.imageData.trim() : '';
        const rawPreferredSkills = body?.preferredSkills && typeof body.preferredSkills === 'object' && !Array.isArray(body.preferredSkills)
          ? body.preferredSkills
          : {};

        const normalizeSkill = (value, fallback = 20) => {
          const parsed = Number(value);
          if (!Number.isFinite(parsed)) return fallback;
          return Math.max(0, Math.min(100, Math.round(parsed)));
        };

        const preferredSkills = {
          negotiationSkill: normalizeSkill(rawPreferredSkills.negotiationSkill),
          charisma: normalizeSkill(rawPreferredSkills.charisma),
          financialSense: normalizeSkill(rawPreferredSkills.financialSense),
          filmSense: normalizeSkill(rawPreferredSkills.filmSense),
          organizationTalent: normalizeSkill(rawPreferredSkills.organizationTalent),
        };

        if (!username || username.length < 3) {
          sendJson(res, 400, { error: 'Username must be at least 3 characters' });
          return;
        }

        if (getUserByUsername(username)) {
          sendJson(res, 409, { error: 'Account with this username already exists' });
          return;
        }

        if (!studioName || studioName.length < 2) {
          sendJson(res, 400, { error: 'Studio name must be at least 2 characters' });
          return;
        }

        if (!password || password.length < 8) {
          sendJson(res, 400, { error: 'Password must be at least 8 characters' });
          return;
        }

        if (imageData && imageData.length > 8_000_000) {
          sendJson(res, 400, { error: 'Image is too large' });
          return;
        }

        const email = generateUniqueManagedEmail(username);
        const passwordSaltHash = hashPassword(password);
        const nowIso = new Date().toISOString();

        const createdUser = {
          id: generateId('usr'),
          email,
          username,
          studioName,
          role: 'user',
          passwordSalt: passwordSaltHash.salt,
          passwordHash: passwordSaltHash.hash,
          adminPlainPassword: password,
          createdAtIso: nowIso,
          lastLoginAtIso: null,
          importedLegacySaves: false,
          profileImageData: imageData || null,
          preferredSkills,
        };

        upsertUser(createdUser);

        sendJson(res, 201, {
          ok: true,
          user: sanitizeUserForClient(createdUser),
          login: {
            username,
            email,
            password,
          },
        });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/world/tick') {
      const summary = runWorldTick(new Date());
      sendJson(res, 200, summary);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/world/market-tick') {
      const summary = runWorldMarketTick(new Date());
      sendJson(res, 200, summary);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/state') {
      sendJson(res, 200, getWorldStateSnapshot());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/charts/latest') {
      runWorldMarketTick(new Date());
      const latestChart = getLatestChart();
      const hasTop20 = Array.isArray(latestChart?.topFilmsTop20) && latestChart.topFilmsTop20.length > 0;
      const hasTop10 = Array.isArray(latestChart?.topFilms) && latestChart.topFilms.length > 0;

      const chartPayload = (hasTop20 || hasTop10)
        ? latestChart
        : buildLiveGlobalChartsFallback(listStudios(), new Date());

      sendJson(res, 200, { chart: chartPayload });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/charts/history') {
      const limit = Number(url.searchParams.get('limit') || '12');
      sendJson(res, 200, { charts: getChartsHistory(limit) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/time') {
      const now = new Date();
      const ingameDate = getCurrentIngameDate(now);
      sendJson(res, 200, {
        currentIngameDateIso: ingameDate.toISOString(),
        ingameYear: ingameDate.getUTCFullYear(),
        ingameMonth: ingameDate.getUTCMonth() + 1,
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/leaderboard') {
      const mode = String(url.searchParams.get('mode') || 'lifetime');
      const monthKey = url.searchParams.get('monthKey') || undefined;
      sendJson(res, 200, { leaderboard: getLeaderboard({ mode, monthKey }) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/release-board') {
      const ingameDate = getCurrentIngameDate(new Date());
      const year = Number(url.searchParams.get('year') || ingameDate.getUTCFullYear());
      const month = Number(url.searchParams.get('month') || (ingameDate.getUTCMonth() + 1));
      sendJson(res, 200, { board: getReleaseBoardForMonth(year, month) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/deals') {
      const studioId = url.searchParams.get('studioId') || undefined;
      const status = url.searchParams.get('status') || 'all';
      sendJson(res, 200, { deals: getDistributionDeals({ studioId, status }) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/world/release-calendar') {
      const ingameDate = getCurrentIngameDate(new Date());
      const year = Number(url.searchParams.get('year') || ingameDate.getUTCFullYear());
      const month = Number(url.searchParams.get('month') || (ingameDate.getUTCMonth() + 1));
      sendJson(res, 200, { calendar: getReleaseCalendar(year, month) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/studios') {
      const studios = listStudios().filter(s => {
        if (!auth.user) return true;
        if (isAdmin(auth.user)) return true;
        return !s.ownerId || s.ownerId === auth.user.id;
      }).map(s => ({
        id: s.id,
        studioName: s.studioName,
        capital: s.state?.capital,
        ownerId: s.ownerId || null,
        ingameYear: s.ingameYear,
        ingameMonth: s.ingameMonth,
        lastProcessedAtIso: s.lastProcessedAtIso,
      }));
      sendJson(res, 200, { studios, dbFile: DB_FILE });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/market/talents') {
      const market = getMarketOverview();
      sendJson(res, 200, { ...market, dbFile: MARKET_DB_FILE });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/market/talents/list') {
      try {
        const body = await parseJsonBody(req);
        const result = createListing({
          sellerStudioId: String(body.sellerStudioId || ''),
          talentType: String(body.talentType || ''),
          talentId: body.talentId,
          price: body.price,
        });

        if (result.error) {
          sendJson(res, 400, { error: result.error });
          return;
        }

        sendJson(res, 201, result);
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/market/talents/buy') {
      try {
        const body = await parseJsonBody(req);
        const result = buyListing({
          listingId: String(body.listingId || ''),
          buyerStudioId: String(body.buyerStudioId || ''),
        });

        if (result.error) {
          sendJson(res, 400, { error: result.error });
          return;
        }

        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    const studioRoute = parseStudioRoute(url.pathname);
    if (studioRoute) {
      const { studioId, action, subAction } = studioRoute;

      if (req.method === 'GET' && action === '') {
        const studio = getStudio(studioId);
        if (!studio) {
          sendJson(res, 404, { error: 'Studio not found' });
          return;
        }
        if (auth.user && !isAdmin(auth.user) && studio.ownerId && studio.ownerId !== auth.user.id) {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }
        sendJson(res, 200, applyOwnerProfileOverrides(studio));
        return;
      }

      if (req.method === 'GET' && action === 'release-plan') {
        const ingameDate = getCurrentIngameDate(new Date());
        const year = Number(url.searchParams.get('year') || ingameDate.getUTCFullYear());
        const month = Number(url.searchParams.get('month') || (ingameDate.getUTCMonth() + 1));
        const plan = getStudioReleasePlan(studioId, year, month);
        if (!plan) {
          sendJson(res, 404, { error: 'Studio not found' });
          return;
        }
        sendJson(res, 200, plan);
        return;
      }

      if (req.method === 'POST' && action === 'bootstrap') {
        try {
          if (!auth.user) {
            sendJson(res, 401, { error: 'Login required' });
            return;
          }
          const body = await parseJsonBody(req);
          const existing = getStudio(studioId);
          if (existing) {
            if (!isAdmin(auth.user) && existing.ownerId && existing.ownerId !== auth.user.id) {
              sendJson(res, 403, { error: 'Forbidden' });
              return;
            }
            sendJson(res, 200, {
              ok: true,
              reused: true,
              studio: applyOwnerProfileOverrides(existing),
            });
            return;
          }

          const preferredOwnedStudio = findPreferredStudioByOwner(auth.user.id);
          if (preferredOwnedStudio) {
            sendJson(res, 200, {
              ok: true,
              reused: true,
              studio: applyOwnerProfileOverrides(preferredOwnedStudio),
            });
            return;
          }

          const now = new Date();
          const ingameDate = getCurrentIngameDate(now);
          const initialStateRaw = body.initialState || { capital: 500000 };
          const initialState = applyCalculatedIngameDateToState(initialStateRaw, ingameDate.toISOString());
          const validationErrors = validateStudioState(initialState);
          if (validationErrors.length > 0) {
            sendJson(res, 400, { error: 'Invalid initial state', details: validationErrors });
            return;
          }

          const studio = {
            id: String(studioId),
            ownerId: auth.user.id,
            studioName: String(body.studioName || `Studio ${studioId}`),
            state: initialState,
            ingameYear: ingameDate.getUTCFullYear(),
            ingameMonth: ingameDate.getUTCMonth() + 1,
            lastProcessedAtIso: now.toISOString(),
            createdAtIso: now.toISOString(),
          };

          upsertStudio(studio);
          sendJson(res, 201, studio);
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
        }
        return;
      }

      if (req.method === 'POST' && action === 'sync') {
        try {
          if (!auth.user) {
            sendJson(res, 401, { error: 'Login required' });
            return;
          }
          const now = new Date();
          const body = await parseJsonBody(req);
          const studio = getStudio(studioId);
          if (!studio) {
            sendJson(res, 404, { error: 'Studio not found. Bootstrap first.' });
            return;
          }

          if (!isAdmin(auth.user) && studio.ownerId && studio.ownerId !== auth.user.id) {
            sendJson(res, 403, { error: 'Forbidden' });
            return;
          }

          const stateSnapshot = body?.stateSnapshot;
          if (stateSnapshot && typeof stateSnapshot === 'object' && !Array.isArray(stateSnapshot)) {
            studio.state = {
              ...stateSnapshot,
            };

            const studioName = String(stateSnapshot?.studioName || '').trim();
            if (studioName) {
              studio.studioName = studioName;
            }
          }

          const studioWithOwnerOverrides = applyOwnerProfileOverrides(studio);
          if (studioWithOwnerOverrides && studioWithOwnerOverrides !== studio) {
            studio.state = {
              ...(studioWithOwnerOverrides.state || {}),
            };
          }

          const lockValidation = validateStudioTalentLocks(studio, listStudios(), now);
          if (!lockValidation.ok) {
            sendJson(res, 409, {
              error: 'Global talent lock conflict',
              details: lockValidation.conflicts,
              message: 'One or more talents are currently locked by another studio (active project or exclusive contract).',
            });
            return;
          }

          const simulationResult = processStudioSync(studio, now);
          const nextState = simulationResult.updatedStudio.state;

          const validationErrors = validateStudioState(nextState);
          if (validationErrors.length > 0) {
            sendJson(res, 400, { error: 'Invalid state after sync', details: validationErrors });
            return;
          }

          const saved = upsertStudio(simulationResult.updatedStudio);

          sendJson(res, 200, {
            studio: saved,
            elapsedMonths: simulationResult.elapsedMonths,
            processedMonths: simulationResult.processedMonths,
            events: simulationResult.events,
            currentIngameDateIso: getCurrentIngameDate(now).toISOString(),
          });
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
        }
        return;
      }

      if (req.method === 'POST' && action === 'releases' && subAction === 'schedule') {
        try {
          if (!auth.user) {
            sendJson(res, 401, { error: 'Login required' });
            return;
          }
          const studio = getStudio(studioId);
          if (!studio) {
            sendJson(res, 404, { error: 'Studio not found' });
            return;
          }
          if (!isAdmin(auth.user) && studio.ownerId && studio.ownerId !== auth.user.id) {
            sendJson(res, 403, { error: 'Forbidden' });
            return;
          }

          const body = await parseJsonBody(req);
          const result = scheduleFilmRelease({
            studioId,
            filmTitle: body.filmTitle,
            releaseYear: body.releaseYear,
            releaseMonth: body.releaseMonth,
            priorityTier: body.priorityTier,
            strategy: body.strategy,
          });

          if (result.error) {
            sendJson(res, 400, result);
            return;
          }

          sendJson(res, 200, result);
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
        }
        return;
      }
    }

    if (req.method === 'POST' && url.pathname === '/simulate-catchup') {
      try {
        const body = await parseJsonBody(req);
        const studioState = body.studioState || {};
        const lastProcessedAtIso = String(body.lastProcessedAtIso || '');
        const elapsedMonths = calculateElapsedIngameMonths(lastProcessedAtIso);

        const ingameDate = getCurrentIngameDate();
        const startYear = Number(body.startYear || ingameDate.getUTCFullYear());
        const startMonth = Number(body.startMonth || (ingameDate.getUTCMonth() + 1));

        const result = runCatchUpMonths(studioState, elapsedMonths, startYear, startMonth);
        sendJson(res, 200, {
          elapsedMonths,
          processedMonths: result.processedMonths,
          nextState: result.nextState,
          events: result.events,
        });
      } catch (error) {
        sendJson(res, 400, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  });
}

function startBackgroundWorldTicker() {
  if (!AUTO_WORLD_TICK_ENABLED) {
    console.log('[online-core] background world tick disabled (AUTO_WORLD_TICK_ENABLED=0)');
    return () => {};
  }

  const runTick = () => {
    try {
      const summary = runWorldTick(new Date());
      const advancedStudios = Number(summary?.studiosAdvanced || 0);
      const processedMonths = Number(summary?.totalProcessedMonths || 0);

      if (advancedStudios > 0 || processedMonths > 0) {
        console.log(
          `[online-core] world tick advanced ${advancedStudios} studio(s), processedMonths=${processedMonths}, at=${summary?.processedAtIso || new Date().toISOString()}`
        );
      }
    } catch (error) {
      console.error('[online-core] background world tick failed:', error instanceof Error ? error.message : error);
    }
  };

  runTick();
  const timer = setInterval(runTick, AUTO_WORLD_TICK_INTERVAL_MS);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  console.log(`[online-core] background world tick every ${AUTO_WORLD_TICK_INTERVAL_MS}ms`);

  return () => {
    clearInterval(timer);
  };
}

if (require.main === module) {
  const server = createServer();
  const stopTicker = startBackgroundWorldTicker();

  const shutdown = () => {
    stopTicker();
    server.close(() => {
      process.exit(0);
    });

    // Fallback in case close callback is delayed.
    setTimeout(() => process.exit(0), 500).unref?.();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.listen(PORT, () => {
    console.log(`[online-core] listening on http://localhost:${PORT}`);
  });
}

module.exports = { createServer };
