const crypto = require('crypto');

const SESSION_LIFETIME_DAYS = 30;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createPasswordHash(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = createPasswordHash(password, salt);
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) return false;
  const candidate = createPasswordHash(password, salt);
  const hashBuf = Buffer.from(hash, 'hex');
  const candidateBuf = Buffer.from(candidate, 'hex');
  if (hashBuf.length !== candidateBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, candidateBuf);
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createSessionRecord(userId) {
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
  return {
    token: generateToken(),
    userId,
    createdAtIso: now.toISOString(),
    updatedAtIso: now.toISOString(),
    expiresAtIso: expires.toISOString(),
  };
}

function sanitizeUserForClient(user) {
  if (!user) return null;

  const preferredSkills = user.preferredSkills && typeof user.preferredSkills === 'object'
    ? {
        negotiationSkill: Number(user.preferredSkills.negotiationSkill || 20),
        charisma: Number(user.preferredSkills.charisma || 20),
        financialSense: Number(user.preferredSkills.financialSense || 20),
        filmSense: Number(user.preferredSkills.filmSense || 20),
        organizationTalent: Number(user.preferredSkills.organizationTalent || 20),
      }
    : null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAtIso: user.createdAtIso,
    lastLoginAtIso: user.lastLoginAtIso || null,
    studioName: user.studioName || null,
    importedLegacySaves: Boolean(user.importedLegacySaves),
    preferredSkills,
  };
}

function validateRegisterPayload(payload) {
  const errors = [];
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const username = String(payload.username || '').trim();
  const studioName = String(payload.studioName || '').trim();

  if (!email || !email.includes('@')) {
    errors.push('A valid email is required');
  }
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (!studioName || studioName.length < 2) {
    errors.push('Studio name must be at least 2 characters');
  }

  return {
    errors,
    normalized: {
      email,
      password,
      username,
      studioName,
    },
  };
}

function validateLoginPayload(payload) {
  const identifier = String(payload?.identifier || payload?.username || payload?.email || '').trim();
  const password = String(payload.password || '');
  const errors = [];
  if (!identifier || identifier.length < 3) {
    errors.push('A valid username or email is required');
  }
  if (!password) {
    errors.push('Password is required');
  }
  return { errors, normalized: { identifier, password } };
}

module.exports = {
  normalizeEmail,
  hashPassword,
  verifyPassword,
  generateId,
  createSessionRecord,
  sanitizeUserForClient,
  validateRegisterPayload,
  validateLoginPayload,
};
