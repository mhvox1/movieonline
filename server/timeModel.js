const SERVER_EPOCH_REAL_UTC = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0));
const GAME_EPOCH_UTC = new Date(Date.UTC(1990, 0, 1, 0, 0, 0, 0));
const TEST_MODE_REAL_MS_PER_INGAME_HOUR = 10 * 1000;
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

function getMonthIndexFromIngameDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 0;
  }
  return Math.max(0, ((date.getUTCFullYear() - GAME_EPOCH_UTC.getUTCFullYear()) * 12) + (date.getUTCMonth() - GAME_EPOCH_UTC.getUTCMonth()));
}

function isTestModeEnabled() {
  const worldState = readWorldState();
  return Boolean(worldState?.testModeEnabled);
}

function getTestModeIngameStartUtc() {
  const worldState = readWorldState();
  const ingameStartIso = String(worldState?.testModeIngameStartIso || '').trim();
  if (ingameStartIso) {
    const parsedIngameStart = new Date(ingameStartIso);
    if (!Number.isNaN(parsedIngameStart.getTime())) {
      return parsedIngameStart;
    }
  }

  const resetStartDateIso = String(worldState?.resetStartDateIso || '').trim();
  if (resetStartDateIso) {
    const parsedResetStart = new Date(resetStartDateIso);
    if (!Number.isNaN(parsedResetStart.getTime())) {
      return parsedResetStart;
    }
  }

  return GAME_EPOCH_UTC;
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

  return parsed;
}

function getIngameMonthIndex(now = new Date()) {
  if (isTestModeEnabled()) {
    return getMonthIndexFromIngameDate(getCurrentIngameDate(now));
  }
  return Math.max(0, daysBetweenUtc(getServerEpochRealUtc(), now));
}

function getCurrentIngameDate(now = new Date()) {
  const epochRealUtc = getServerEpochRealUtc();
  const elapsedRealMs = Math.max(0, now.getTime() - epochRealUtc.getTime());

  if (isTestModeEnabled()) {
    const testModeIngameStart = getTestModeIngameStartUtc();
    const elapsedIngameHours = elapsedRealMs / TEST_MODE_REAL_MS_PER_INGAME_HOUR;
    return new Date(testModeIngameStart.getTime() + (elapsedIngameHours * 3600000));
  }

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

  if (isTestModeEnabled()) {
    const previousMonthIndex = getIngameMonthIndex(lastProcessedAt);
    const nextMonthIndex = getIngameMonthIndex(now);
    return Math.max(0, nextMonthIndex - previousMonthIndex);
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
