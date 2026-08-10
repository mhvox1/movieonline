const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'global-chat.json');
const MAX_STORED_MESSAGES = 300;

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ messages: [] }, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.messages)) {
      return { messages: [] };
    }
    return parsed;
  } catch {
    return { messages: [] };
  }
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function listGlobalChatMessages(limit = 80) {
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 80));
  const db = readDb();
  return db.messages.slice(-safeLimit);
}

function addGlobalChatMessage(message) {
  const db = readDb();
  db.messages.push(message);
  if (db.messages.length > MAX_STORED_MESSAGES) {
    db.messages = db.messages.slice(-MAX_STORED_MESSAGES);
  }
  writeDb(db);
  return message;
}

module.exports = {
  DB_FILE,
  listGlobalChatMessages,
  addGlobalChatMessage,
};
