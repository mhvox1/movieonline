const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'studios.json');

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ studios: {} }, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.studios) {
      return { studios: {} };
    }
    return parsed;
  } catch {
    return { studios: {} };
  }
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function listStudios() {
  const db = readDb();
  return Object.values(db.studios);
}

function getStudio(studioId) {
  const db = readDb();
  return db.studios[String(studioId)] || null;
}

function upsertStudio(studio) {
  const db = readDb();
  db.studios[String(studio.id)] = studio;
  writeDb(db);
  return studio;
}

module.exports = {
  DB_FILE,
  listStudios,
  getStudio,
  upsertStudio,
};
