const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'world-state.json');

function getDefaultWorldState() {
  return {
    lastProcessedMonthKey: '',
    genreTrends: {},
    chartsHistory: [],
    filmCatalog: {},
    testModeEnabled: false,
    updatedAtIso: null,
  };
}

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(getDefaultWorldState(), null, 2), 'utf-8');
  }
}

function readWorldState() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return getDefaultWorldState();
    }
    return {
      ...getDefaultWorldState(),
      ...parsed,
      chartsHistory: Array.isArray(parsed.chartsHistory) ? parsed.chartsHistory : [],
      filmCatalog: parsed.filmCatalog && typeof parsed.filmCatalog === 'object' ? parsed.filmCatalog : {},
      genreTrends: parsed.genreTrends && typeof parsed.genreTrends === 'object' ? parsed.genreTrends : {},
    };
  } catch {
    return getDefaultWorldState();
  }
}

function writeWorldState(state) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

module.exports = {
  DB_FILE,
  readWorldState,
  writeWorldState,
};
