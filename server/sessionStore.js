const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'sessions.json');

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ sessions: {} }, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDbFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!parsed || typeof parsed !== 'object' || !parsed.sessions) {
      return { sessions: {} };
    }
    return parsed;
  } catch {
    return { sessions: {} };
  }
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function pruneExpiredSessions() {
  const db = readDb();
  const now = Date.now();
  let changed = false;
  for (const [token, session] of Object.entries(db.sessions)) {
    const expiry = new Date(session.expiresAtIso).getTime();
    if (!Number.isFinite(expiry) || expiry <= now) {
      delete db.sessions[token];
      changed = true;
    }
  }
  if (changed) {
    writeDb(db);
  }
}

function createSession(session) {
  const db = readDb();
  db.sessions[session.token] = session;
  writeDb(db);
  return session;
}

function getSession(token) {
  pruneExpiredSessions();
  const db = readDb();
  return db.sessions[String(token)] || null;
}

function removeSession(token) {
  const db = readDb();
  const key = String(token || '');
  if (!db.sessions[key]) {
    return false;
  }
  delete db.sessions[key];
  writeDb(db);
  return true;
}

module.exports = {
  DB_FILE,
  createSession,
  getSession,
  removeSession,
  pruneExpiredSessions,
};
