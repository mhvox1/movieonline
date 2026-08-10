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
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function run() {
  writeWorldState({
    lastProcessedMonthKey: '',
    genreTrends: {},
    chartsHistory: [],
    filmCatalog: {},
    updatedAtIso: null,
  });

  const server = createServer();
  await new Promise(resolve => server.listen(8787, resolve));

  try {
    const suffix = Date.now().toString(36);
    const studioA = `r1_${suffix}`;
    const studioB = `r2_${suffix}`;

    await call('POST', `/studios/${studioA}/bootstrap`, {
      studioName: 'Release One',
      initialState: {
        capital: 500000,
        completedFilms: [
          { workingTitle: 'Fireline', genre: 'Action', finalQuality: 82, hype: 15, phase: 'Completed' },
        ],
        activeProjects: [],
        employees: [],
        loans: [],
        transactionLog: [],
        monthlyHistory: [],
        directors: [],
        actors: [],
      },
    });

    await call('POST', `/studios/${studioB}/bootstrap`, {
      studioName: 'Release Two',
      initialState: {
        capital: 500000,
        completedFilms: [
          { workingTitle: 'Nightglass', genre: 'Thriller', finalQuality: 75, hype: 22, phase: 'Completed' },
        ],
        activeProjects: [],
        employees: [],
        loans: [],
        transactionLog: [],
        monthlyHistory: [],
        directors: [],
        actors: [],
      },
    });

    const schedule1 = await call('POST', `/studios/${studioA}/releases/schedule`, {
      filmTitle: 'Fireline',
      releaseYear: 2008,
      releaseMonth: 4,
    });

    const schedule2 = await call('POST', `/studios/${studioB}/releases/schedule`, {
      filmTitle: 'Nightglass',
      releaseYear: 2008,
      releaseMonth: 4,
    });

    const tick = await call('POST', '/world/market-tick', {});
    const latest = await call('GET', '/world/charts/latest');
    const history = await call('GET', '/world/charts/history?limit=3');
    const leaderboard = await call('GET', '/world/leaderboard');

    console.log(JSON.stringify({
      schedule1,
      schedule2,
      tick,
      latest,
      history,
      leaderboard,
    }, null, 2));
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
