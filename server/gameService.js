const { calculateElapsedIngameMonths } = require('./timeModel');
const { runCatchUpMonths } = require('./simulation');

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

function processStudioSync(studio, now = new Date()) {
  const elapsedMonths = calculateElapsedIngameMonths(studio.lastProcessedAtIso, now);
  const start = addMonths(studio.ingameYear, studio.ingameMonth, 1);
  const simulationResult = runCatchUpMonths(studio.state, elapsedMonths, start.year, start.month);
  const end = addMonths(studio.ingameYear, studio.ingameMonth, elapsedMonths);

  const updatedStudio = {
    ...studio,
    state: simulationResult.nextState,
    ingameYear: end.year,
    ingameMonth: end.month,
    lastProcessedAtIso: now.toISOString(),
  };

  return {
    updatedStudio,
    elapsedMonths,
    processedMonths: simulationResult.processedMonths,
    events: simulationResult.events,
  };
}

module.exports = {
  processStudioSync,
};
