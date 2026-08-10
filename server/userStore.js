const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDbFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!parsed || typeof parsed !== 'object' || !parsed.users) {
      return { users: {} };
    }
    return parsed;
  } catch {
    return { users: {} };
  }
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function listUsers() {
  const db = readDb();
  return Object.values(db.users);
}

function getUserById(userId) {
  const db = readDb();
  return db.users[String(userId)] || null;
}

function getUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  const users = listUsers();
  return users.find(user => String(user.email || '').toLowerCase() === normalized) || null;
}

function getUserByUsername(username) {
  const normalized = String(username || '').trim().toLowerCase();
  if (!normalized) return null;
  const users = listUsers();
  return users.find(user => String(user.username || '').trim().toLowerCase() === normalized) || null;
}

function upsertUser(user) {
  const db = readDb();
  db.users[String(user.id)] = user;
  writeDb(db);
  return user;
}

function removeUser(userId) {
  const db = readDb();
  const key = String(userId);
  if (!db.users[key]) {
    return false;
  }
  delete db.users[key];
  writeDb(db);
  return true;
}

module.exports = {
  DB_FILE,
  listUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  upsertUser,
  removeUser,
};
