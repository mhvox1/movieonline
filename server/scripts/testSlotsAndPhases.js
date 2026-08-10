process.env.WORLD_RELEASE_SLOT_LIMIT = '2';

const http = require('http');
const { createServer } = require('../index');
const { writeWorldState } = require('../worldStateStore');

function call(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8787,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      res => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function film(title, genre, quality, hype) {
  return { workingTitle: title, genre, finalQuality: quality, hype, phase: 'Completed' };
}

async function run() {
  writeWorldState({
    lastProcessedMonthKey: '',
    genreTrends: {},
    chartsHistory: [],
    filmCatalog: {},
    updatedAtIso: null,
  });

  const suffix = Date.now().toString(36);
  const s1 = `sp1_${suffix}`;
  const s2 = `sp2_${suffix}`;
  const s3 = `sp3_${suffix}`;
  const s4 = `sp4_${suffix}`;

  const server = createServer();
  await new Promise(resolve => server.listen(8787, resolve));

  try {
    await call('POST', `/studios/${s1}/bootstrap`, {
      studioName: 'Slot Prime',
      initialState: { capital: 600000, completedFilms: [film('Prime Fire', 'Action', 84, 30)], activeProjects: [], employees: [], loans: [], transactionLog: [], monthlyHistory: [], directors: [], actors: [] },
    });
    await call('POST', `/studios/${s2}/bootstrap`, {
      studioName: 'Slot Neon',
      initialState: { capital: 600000, completedFilms: [film('Neon Vow', 'Drama', 76, 18)], activeProjects: [], employees: [], loans: [], transactionLog: [], monthlyHistory: [], directors: [], actors: [] },
    });
    await call('POST', `/studios/${s3}/bootstrap`, {
      studioName: 'Slot Obsidian',
      initialState: { capital: 600000, completedFilms: [film('Obsidian Tide', 'Thriller', 72, 28)], activeProjects: [], employees: [], loans: [], transactionLog: [], monthlyHistory: [], directors: [], actors: [] },
    });
    await call('POST', `/studios/${s4}/bootstrap`, {
      studioName: 'Slot Vintage',
      initialState: { capital: 600000, completedFilms: [film('Vintage Echoes', 'Horror', 69, 12)], activeProjects: [], employees: [], loans: [], transactionLog: [], monthlyHistory: [], directors: [], actors: [] },
    });

    const sch1 = await call('POST', `/studios/${s1}/releases/schedule`, { filmTitle: 'Prime Fire', releaseYear: 2008, releaseMonth: 4, priorityTier: 'blockbuster', strategy: 'aggressive' });
    const sch2 = await call('POST', `/studios/${s2}/releases/schedule`, { filmTitle: 'Neon Vow', releaseYear: 2008, releaseMonth: 4, priorityTier: 'normal', strategy: 'balanced' });
    const sch3Fail = await call('POST', `/studios/${s3}/releases/schedule`, { filmTitle: 'Obsidian Tide', releaseYear: 2008, releaseMonth: 4 });

    let sch3 = sch3Fail;
    if (sch3Fail.status !== 200 && sch3Fail.body?.suggested) {
      sch3 = await call('POST', `/studios/${s3}/releases/schedule`, {
        filmTitle: 'Obsidian Tide',
        releaseYear: sch3Fail.body.suggested.year,
        releaseMonth: sch3Fail.body.suggested.month,
      });
    }

    const sch4 = await call('POST', `/studios/${s4}/releases/schedule`, { filmTitle: 'Vintage Echoes', releaseYear: 2008, releaseMonth: 1, priorityTier: 'high', strategy: 'awards' });

    const tick = await call('POST', '/world/market-tick', {});
    const latest = await call('GET', '/world/charts/latest');
    const leaderboardLifetime = await call('GET', '/world/leaderboard?mode=lifetime');
    const leaderboardMonthly = await call('GET', '/world/leaderboard?mode=monthly-revenue');
    const leaderboardPrestige = await call('GET', '/world/leaderboard?mode=prestige');
    const releaseBoard = await call('GET', '/world/release-board?year=2008&month=4');
    const dealsActive = await call('GET', '/world/deals?status=active');
    const studioPlan = await call('GET', `/studios/${s2}/release-plan?year=2008&month=5`);
    const calApr = await call('GET', '/world/release-calendar?year=2008&month=4');
    const calMay = await call('GET', '/world/release-calendar?year=2008&month=5');

    console.log(JSON.stringify({
      slotLimit: process.env.WORLD_RELEASE_SLOT_LIMIT,
      schedules: { sch1, sch2, sch3Fail, sch3, sch4 },
      tick,
      latest,
      leaderboardLifetime,
      leaderboardMonthly,
      leaderboardPrestige,
      releaseBoard,
      dealsActive,
      studioPlan,
      calendar: { calApr, calMay },
    }, null, 2));
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
