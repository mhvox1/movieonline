const SERVER_EPOCH_REAL_UTC = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0));
const GAME_EPOCH_UTC = new Date(Date.UTC(1990, 0, 1, 0, 0, 0, 0));
const { readWorldState } = require('./worldStateStore');

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysBetweenUtc(from, to) {
  const fromDay = startOfUtcDay(from).getTime();
  const toDay = startOfUtcDay(to).getTime();
  return Math.floor((toDay - fromDay) / 86400000);
}

function addMonthsUtc(date, months) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth() + months,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ));
}

function getDaysInUtcMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}

function getServerEpochRealUtc() {
  const worldState = readWorldState();
  const resetStartDateIso = String(worldState?.resetStartDateIso || '').trim();
  if (!resetStartDateIso) {
    return SERVER_EPOCH_REAL_UTC;
  }

  const parsed = new Date(resetStartDateIso);
  if (Number.isNaN(parsed.getTime())) {
    return SERVER_EPOCH_REAL_UTC;
  }

  return startOfUtcDay(parsed);
}

function getIngameMonthIndex(now = new Date()) {
  return Math.max(0, daysBetweenUtc(getServerEpochRealUtc(), now));
}

function getCurrentIngameDate(now = new Date()) {
  const epochRealUtc = getServerEpochRealUtc();
  const elapsedRealMs = Math.max(0, now.getTime() - epochRealUtc.getTime());
  const elapsedRealDays = elapsedRealMs / 86400000;
  const fullMonthsElapsed = Math.floor(elapsedRealDays);
  const monthFraction = elapsedRealDays - fullMonthsElapsed;

  const current = addMonthsUtc(GAME_EPOCH_UTC, fullMonthsElapsed);
  const daysInCurrentMonth = getDaysInUtcMonth(current);
  const dayOffsetMs = monthFraction * daysInCurrentMonth * 86400000;

  return new Date(current.getTime() + dayOffsetMs);
}

function calculateElapsedIngameMonths(lastProcessedAtIso, now = new Date()) {
  if (!lastProcessedAtIso) {
    return 0;
  }

  const lastProcessedAt = new Date(lastProcessedAtIso);
  if (Number.isNaN(lastProcessedAt.getTime())) {
    return 0;
  }

  return Math.max(0, daysBetweenUtc(lastProcessedAt, now));
}

module.exports = {
  SERVER_EPOCH_REAL_UTC,
  GAME_EPOCH_UTC,
  getServerEpochRealUtc,
  getIngameMonthIndex,
  getCurrentIngameDate,
  calculateElapsedIngameMonths,
};
