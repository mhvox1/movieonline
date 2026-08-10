function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function makeTalentKey(talentType, talentId) {
  return `${talentType}:${talentId}`;
}

function isOngoingProject(project) {
  if (!project || typeof project !== 'object') {
    return false;
  }
  const phase = String(project.phase || '').trim();
  return phase !== '' && phase !== 'Completed';
}

function collectTalentNamesByType(state) {
  const names = new Map();
  const actors = Array.isArray(state?.actors) ? state.actors : [];
  const directors = Array.isArray(state?.directors) ? state.directors : [];

  directors.forEach(entry => {
    const id = toNumber(entry?.id, NaN);
    if (Number.isFinite(id) && id > 0) {
      names.set(makeTalentKey('director', id), String(entry?.name || '').trim() || `Director ${id}`);
    }
  });

  actors.forEach(entry => {
    const id = toNumber(entry?.id, NaN);
    if (Number.isFinite(id) && id > 0) {
      names.set(makeTalentKey('actor', id), String(entry?.name || '').trim() || `Actor ${id}`);
    }
  });

  return names;
}

function pushClaim(claims, talentType, talentId, studio, reason, reasonRef, now, talentName) {
  const id = toNumber(talentId, NaN);
  if (!Number.isFinite(id) || id <= 0) {
    return;
  }

  const key = makeTalentKey(talentType, id);
  claims.push({
    key,
    talentType,
    talentId: id,
    talentName: talentName || `${talentType} ${id}`,
    studioId: String(studio?.id || ''),
    studioName: String(studio?.studioName || ''),
    reason,
    reasonRef,
    collectedAtIso: now.toISOString(),
  });
}

function collectStudioTalentClaims(studio, now = new Date()) {
  const state = studio?.state && typeof studio.state === 'object' ? studio.state : {};
  const claims = [];
  const namesByKey = collectTalentNamesByType(state);

  const activeProjects = Array.isArray(state.activeProjects) ? state.activeProjects : [];
  activeProjects.forEach(project => {
    if (!isOngoingProject(project)) {
      return;
    }

    const title = String(project?.workingTitle || '').trim() || 'Unbenanntes Projekt';
    const phase = String(project?.phase || '').trim() || 'Unknown';
    const reasonRef = `${title} (${phase})`;

    const directorId = toNumber(project?.directorId, NaN);
    const mainActorId = toNumber(project?.mainActorId, NaN);
    const supportingActorId = toNumber(project?.supportingActorId, NaN);

    pushClaim(
      claims,
      'director',
      directorId,
      studio,
      'project_assignment',
      reasonRef,
      now,
      namesByKey.get(makeTalentKey('director', directorId))
    );
    pushClaim(
      claims,
      'actor',
      mainActorId,
      studio,
      'project_assignment',
      reasonRef,
      now,
      namesByKey.get(makeTalentKey('actor', mainActorId))
    );
    pushClaim(
      claims,
      'actor',
      supportingActorId,
      studio,
      'project_assignment',
      reasonRef,
      now,
      namesByKey.get(makeTalentKey('actor', supportingActorId))
    );
  });

  const directors = Array.isArray(state.directors) ? state.directors : [];
  directors.forEach(director => {
    const directorId = toNumber(director?.id, NaN);
    const contract = director?.contract;
    const contractType = String(contract?.type || '').trim();
    const expiryDate = toDate(contract?.expiryDate);
    const isExclusive = contractType === 'exclusive' && (!expiryDate || expiryDate.getTime() > now.getTime());
    if (isExclusive) {
      const expiryLabel = expiryDate ? expiryDate.toISOString().slice(0, 10) : 'open';
      pushClaim(
        claims,
        'director',
        directorId,
        studio,
        'exclusive_contract',
        `expiry=${expiryLabel}`,
        now,
        String(director?.name || '').trim() || undefined
      );
    }
  });

  const actors = Array.isArray(state.actors) ? state.actors : [];
  actors.forEach(actor => {
    const actorId = toNumber(actor?.id, NaN);
    const contract = actor?.contract;
    const contractType = String(contract?.type || '').trim();
    const expiryDate = toDate(contract?.expiryDate);
    const isExclusive = contractType === 'exclusive' && (!expiryDate || expiryDate.getTime() > now.getTime());
    if (isExclusive) {
      const expiryLabel = expiryDate ? expiryDate.toISOString().slice(0, 10) : 'open';
      pushClaim(
        claims,
        'actor',
        actorId,
        studio,
        'exclusive_contract',
        `expiry=${expiryLabel}`,
        now,
        String(actor?.name || '').trim() || undefined
      );
    }
  });

  const deduped = new Map();
  claims.forEach(entry => {
    const dedupeKey = `${entry.key}|${entry.reason}|${entry.reasonRef || ''}`;
    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, entry);
    }
  });

  return Array.from(deduped.values());
}

function buildGlobalTalentLocks(studios, now = new Date(), excludedStudioId = null) {
  const locks = new Map();

  (Array.isArray(studios) ? studios : []).forEach(studio => {
    const studioId = String(studio?.id || '');
    if (!studioId) {
      return;
    }
    if (excludedStudioId && studioId === String(excludedStudioId)) {
      return;
    }

    const claims = collectStudioTalentClaims(studio, now);
    claims.forEach(claim => {
      if (!locks.has(claim.key)) {
        locks.set(claim.key, claim);
      }
    });
  });

  return locks;
}

function validateStudioTalentLocks(studio, allStudios, now = new Date()) {
  const currentStudioId = String(studio?.id || '');
  const globalLocks = buildGlobalTalentLocks(allStudios, now, currentStudioId);
  const ownClaims = collectStudioTalentClaims(studio, now);
  const conflicts = [];

  ownClaims.forEach(claim => {
    const existing = globalLocks.get(claim.key);
    if (!existing) {
      return;
    }
    if (String(existing.studioId) === currentStudioId) {
      return;
    }

    conflicts.push({
      talentType: claim.talentType,
      talentId: claim.talentId,
      talentName: claim.talentName,
      requestedByStudioId: currentStudioId,
      requestedByStudioName: String(studio?.studioName || ''),
      requestedReason: claim.reason,
      requestedReasonRef: claim.reasonRef,
      lockedByStudioId: existing.studioId,
      lockedByStudioName: existing.studioName,
      lockedReason: existing.reason,
      lockedReasonRef: existing.reasonRef,
    });
  });

  return {
    ok: conflicts.length === 0,
    conflicts,
    ownClaims,
  };
}

function isTalentLockedInStudioState(studioState, talentType, talentId, now = new Date()) {
  const studio = {
    id: 'local-check',
    studioName: 'local-check',
    state: studioState || {},
  };

  const claims = collectStudioTalentClaims(studio, now);
  const key = makeTalentKey(talentType, talentId);
  return claims.some(entry => entry.key === key);
}

module.exports = {
  collectStudioTalentClaims,
  buildGlobalTalentLocks,
  validateStudioTalentLocks,
  isTalentLockedInStudioState,
};
