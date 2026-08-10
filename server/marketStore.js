const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'market.json');

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ listings: [] }, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.listings)) {
      return { listings: [] };
    }
    return parsed;
  } catch {
    return { listings: [] };
  }
}

function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function listTalentListings() {
  return readDb().listings;
}

function createTalentListing(listing) {
  const db = readDb();
  db.listings.push(listing);
  writeDb(db);
  return listing;
}

function removeTalentListing(listingId) {
  const db = readDb();
  const before = db.listings.length;
  db.listings = db.listings.filter(listing => listing.id !== listingId);
  if (db.listings.length === before) {
    return false;
  }
  writeDb(db);
  return true;
}

function getTalentListing(listingId) {
  return readDb().listings.find(listing => listing.id === listingId) || null;
}

module.exports = {
  DB_FILE,
  listTalentListings,
  createTalentListing,
  removeTalentListing,
  getTalentListing,
};
