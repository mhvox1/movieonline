import { useEffect, useMemo, useRef, useState } from 'react';
import { PlayerData } from '../types';

type OnlineSyncPhase = 'idle' | 'syncing' | 'ok' | 'error';

export interface OnlineSyncState {
  phase: OnlineSyncPhase;
  studioId: string | null;
  lastSyncIso: string | null;
  ingameYear: number | null;
  ingameMonth: number | null;
  elapsedMonths: number;
  worldMonthKey: string | null;
  topFilmTitle: string | null;
  topFilmStudio: string | null;
  error: string | null;
}

const LOCAL_STUDIO_ID_KEY = 'movie_business_online_studio_id_v1';
const AUTH_TOKEN_KEY = 'mb_auth_token';

const safeSessionGet = (key: string): string => {
  try {
    return sessionStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

const safeSessionSet = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures.
  }
};

const getSessionBackedValue = (key: string): string => {
  if (typeof window === 'undefined') return '';

  const sessionValue = safeSessionGet(key).trim();
  if (sessionValue) return sessionValue;

  const legacyValue = String(localStorage.getItem(key) || '').trim();
  if (legacyValue) {
    safeSessionSet(key, legacyValue);
    localStorage.removeItem(key);
  }

  return legacyValue;
};

const initialState: OnlineSyncState = {
  phase: 'idle',
  studioId: null,
  lastSyncIso: null,
  ingameYear: null,
  ingameMonth: null,
  elapsedMonths: 0,
  worldMonthKey: null,
  topFilmTitle: null,
  topFilmStudio: null,
  error: null,
};

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);

const normalizeApiBaseUrl = (value: string): string => String(value || '').trim().replace(/\/$/, '');

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any)?.env?.VITE_ONLINE_CORE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return normalizeApiBaseUrl(envUrl);
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:8787';
  }

  const queryApi = normalizeApiBaseUrl(new URLSearchParams(window.location.search).get('api') || '');
  if (queryApi) {
    return queryApi;
  }

  const hostname = String(window.location.hostname || '').toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8787';
  }

  if (hostname.startsWith('api.')) {
    return normalizeApiBaseUrl(window.location.origin);
  }

  return `${window.location.protocol}//api.${window.location.host}`;
};

const ensureStudioId = (playerData: PlayerData): string => {
  const existing = getSessionBackedValue(LOCAL_STUDIO_ID_KEY);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const base = `${slugify(playerData.studioName)}-${slugify(playerData.playerName)}`;
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const generated = `${base || 'studio'}-${randomSuffix}`;
  safeSessionSet(LOCAL_STUDIO_ID_KEY, generated);
  localStorage.removeItem(LOCAL_STUDIO_ID_KEY);
  return generated;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getSessionBackedValue(AUTH_TOKEN_KEY);
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

async function bootstrapStudio(baseUrl: string, studioId: string, playerData: PlayerData): Promise<string> {
  const response = await fetch(`${baseUrl}/studios/${encodeURIComponent(studioId)}/bootstrap`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      studioName: playerData.studioName,
      initialState: playerData,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  // 200 = existing canonical studio reused, 201 = created, 409 = legacy already exists.
  if (response.status === 200 || response.status === 201 || response.status === 409) {
    const resolvedStudioId = String((payload as any)?.studio?.id || (payload as any)?.id || studioId || '').trim();
    return resolvedStudioId || studioId;
  }

  throw new Error(`Bootstrap failed (${response.status}): ${JSON.stringify(payload)}`);
}

async function syncStudio(baseUrl: string, studioId: string, stateSnapshot: PlayerData): Promise<any> {
  const response = await fetch(`${baseUrl}/studios/${encodeURIComponent(studioId)}/sync`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ stateSnapshot }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error ? String(payload.error) : `Sync failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

async function fetchWorldSnapshot(baseUrl: string): Promise<any> {
  const response = await fetch(`${baseUrl}/world/charts/latest`, {
    method: 'GET',
  });

  if (!response.ok) {
    return null;
  }

  return response.json().catch(() => null);
}

export const useOnlineSync = (playerData: PlayerData | null): OnlineSyncState => {
  const [state, setState] = useState<OnlineSyncState>(initialState);
  const bootstrapDoneRef = useRef(false);
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    if (!playerData) {
      bootstrapDoneRef.current = false;
      setState(initialState);
      return;
    }

    let cancelled = false;
    let syncInFlight = false;
    let studioId = ensureStudioId(playerData);

    const runSync = async () => {
      if (syncInFlight || cancelled) {
        return;
      }
      syncInFlight = true;
      let shouldRetryBootstrap = false;

      setState(prev => ({
        ...prev,
        phase: 'syncing',
        studioId,
        error: null,
      }));

      try {
        if (!bootstrapDoneRef.current) {
          const resolvedStudioId = await bootstrapStudio(apiBaseUrl, studioId, playerData);
          if (resolvedStudioId && resolvedStudioId !== studioId) {
            studioId = resolvedStudioId;
            safeSessionSet(LOCAL_STUDIO_ID_KEY, resolvedStudioId);
            localStorage.removeItem(LOCAL_STUDIO_ID_KEY);
          }
          bootstrapDoneRef.current = true;
        }

        const result = await syncStudio(apiBaseUrl, studioId, playerData);
        const world = await fetchWorldSnapshot(apiBaseUrl);
        if (cancelled) {
          return;
        }

        const latestChart = world?.chart || null;
        const topFilm = latestChart?.topFilms?.[0] || null;

        setState({
          phase: 'ok',
          studioId,
          lastSyncIso: result?.studio?.lastProcessedAtIso || new Date().toISOString(),
          ingameYear: Number(result?.studio?.ingameYear || 0) || null,
          ingameMonth: Number(result?.studio?.ingameMonth || 0) || null,
          elapsedMonths: Number(result?.elapsedMonths || 0) || 0,
          worldMonthKey: latestChart?.monthKey || null,
          topFilmTitle: topFilm?.title || null,
          topFilmStudio: topFilm?.studioName || null,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
        if (errorMessage.toLowerCase().includes('bootstrap first')) {
          bootstrapDoneRef.current = false;
          shouldRetryBootstrap = true;
        }
        setState(prev => ({
          ...prev,
          phase: 'error',
          studioId,
          error: errorMessage,
        }));
      } finally {
        syncInFlight = false;
        if (shouldRetryBootstrap && !cancelled) {
          window.setTimeout(runSync, 250);
        }
      }
    };

    runSync();
    const intervalId = window.setInterval(runSync, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [apiBaseUrl, playerData]);

  return state;
};
