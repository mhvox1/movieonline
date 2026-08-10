const { upsertStudio } = require('../studioStore');
const { runWorldTick } = require('../worldTick');
const { runWorldMarketTick, getWorldStateSnapshot } = require('../worldMarketService');

function seedStudio(id, name, genre, quality, hype, capital) {
  upsertStudio({
    id,
    studioName: name,
    ingameYear: 2008,
    ingameMonth: 4,
    lastProcessedAtIso: new Date().toISOString(),
    createdAtIso: new Date().toISOString(),
    state: {
      capital,
      playerName: name,
      ceoSalary: 0,
      employees: [],
      loans: [],
      transactionLog: [],
      completedFilms: [
        {
          workingTitle: `${name} Film`,
          genre,
          finalQuality: quality,
          hype,
          phase: 'Completed',
        },
      ],
      activeProjects: [],
      pendingNotifications: [],
      monthlyHistory: [],
      directors: [],
      actors: [],
    },
  });
}

seedStudio('wm_a', 'Atlas Pictures', 'Action', 82, 30, 500000);
seedStudio('wm_b', 'Nova Cinema', 'Drama', 74, 20, 500000);
seedStudio('wm_c', 'Moonlight Arts', 'Horror', 68, 45, 500000);

const worldTickSummary = runWorldTick(new Date());
const marketSummary = runWorldMarketTick(new Date());
const snapshot = getWorldStateSnapshot();

console.log(JSON.stringify({
  worldTickSummary,
  marketSummary,
  latestChart: snapshot.chartsHistory[snapshot.chartsHistory.length - 1] || null,
}, null, 2));
