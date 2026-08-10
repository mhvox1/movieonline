const { listStudios, upsertStudio } = require('./studioStore');
const { processStudioSync } = require('./gameService');
const { runWorldMarketTick } = require('./worldMarketService');

function runWorldTick(now = new Date()) {
  const studios = listStudios();
  let totalProcessedMonths = 0;
  let studiosAdvanced = 0;
  let totalEvents = 0;

  for (const studio of studios) {
    const result = processStudioSync(studio, now);
    upsertStudio(result.updatedStudio);

    totalProcessedMonths += result.processedMonths;
    totalEvents += result.events.length;
    if (result.processedMonths > 0) {
      studiosAdvanced += 1;
    }
  }

  const marketSummary = runWorldMarketTick(now);

  return {
    studiosTotal: studios.length,
    studiosAdvanced,
    totalProcessedMonths,
    totalEvents,
    marketSummary,
    processedAtIso: now.toISOString(),
  };
}

if (require.main === module) {
  const summary = runWorldTick(new Date());
  console.log(JSON.stringify(summary, null, 2));
}

module.exports = {
  runWorldTick,
};
