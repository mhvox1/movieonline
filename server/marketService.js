const { getStudio, upsertStudio } = require('./studioStore');
const {
  listTalentListings,
  createTalentListing,
  removeTalentListing,
  getTalentListing,
} = require('./marketStore');

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function ensureTalentCollections(studio) {
  const state = studio.state || {};
  if (!Array.isArray(state.directors)) {
    state.directors = [];
  }
  if (!Array.isArray(state.actors)) {
    state.actors = [];
  }
  if (!Array.isArray(state.transactionLog)) {
    state.transactionLog = [];
  }
  studio.state = state;
}

function findAndExtractTalent(studio, talentType, talentId) {
  const key = talentType === 'director' ? 'directors' : 'actors';
  const list = studio.state[key];
  const idx = list.findIndex(t => Number(t.id) === Number(talentId));
  if (idx < 0) {
    return null;
  }
  const [talent] = list.splice(idx, 1);
  return talent;
}

function insertTalent(studio, talentType, talent) {
  const key = talentType === 'director' ? 'directors' : 'actors';
  studio.state[key].push(talent);
}

function createListing({ sellerStudioId, talentType, talentId, price }) {
  if (talentType !== 'director' && talentType !== 'actor') {
    return { error: 'talentType must be "director" or "actor"' };
  }

  const seller = getStudio(sellerStudioId);
  if (!seller) {
    return { error: 'Seller studio not found' };
  }

  ensureTalentCollections(seller);
  const safePrice = Math.max(1, Math.floor(toNumber(price, 0)));
  if (safePrice <= 0) {
    return { error: 'Price must be positive' };
  }

  const talent = findAndExtractTalent(seller, talentType, talentId);
  if (!talent) {
    return { error: 'Talent not found in seller studio' };
  }

  const listing = {
    id: `tal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    talentType,
    talent,
    talentId: talent.id,
    talentName: talent.name || 'Unknown',
    price: safePrice,
    sellerStudioId: String(sellerStudioId),
    sellerStudioName: seller.studioName,
    createdAtIso: nowIso(),
  };

  seller.state.transactionLog.push({
    date: nowIso(),
    type: 'Einnahme',
    category: 'Talentmarkt',
    description: `Talent gelistet: ${listing.talentName}`,
    amount: 0,
  });

  upsertStudio(seller);
  createTalentListing(listing);

  return { listing };
}

function buyListing({ listingId, buyerStudioId }) {
  const listing = getTalentListing(listingId);
  if (!listing) {
    return { error: 'Listing not found' };
  }

  const buyer = getStudio(buyerStudioId);
  if (!buyer) {
    return { error: 'Buyer studio not found' };
  }

  const seller = getStudio(listing.sellerStudioId);
  if (!seller) {
    return { error: 'Seller studio not found' };
  }

  ensureTalentCollections(buyer);
  ensureTalentCollections(seller);

  if (String(buyer.id) === String(seller.id)) {
    return { error: 'Cannot buy your own listing' };
  }

  const buyerCapital = toNumber(buyer.state.capital, 0);
  if (buyerCapital < listing.price) {
    return { error: 'Buyer has insufficient capital' };
  }

  buyer.state.capital = buyerCapital - listing.price;
  seller.state.capital = toNumber(seller.state.capital, 0) + listing.price;

  insertTalent(buyer, listing.talentType, listing.talent);

  buyer.state.transactionLog.push({
    date: nowIso(),
    type: 'Ausgabe',
    category: 'Talentmarkt',
    description: `Talent gekauft: ${listing.talentName}`,
    amount: listing.price,
  });

  seller.state.transactionLog.push({
    date: nowIso(),
    type: 'Einnahme',
    category: 'Talentmarkt',
    description: `Talent verkauft: ${listing.talentName}`,
    amount: listing.price,
  });

  upsertStudio(buyer);
  upsertStudio(seller);
  removeTalentListing(listing.id);

  return {
    listingId: listing.id,
    buyerStudioId: String(buyer.id),
    sellerStudioId: String(seller.id),
    talentName: listing.talentName,
    price: listing.price,
  };
}

function getMarketOverview() {
  return {
    listings: listTalentListings(),
  };
}

module.exports = {
  createListing,
  buyListing,
  getMarketOverview,
};
