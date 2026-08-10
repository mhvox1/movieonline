import { jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { GameState, BuildingType, ProjectPhase, GameSpeed, MaritalStatus, EmployeeType, Genre } from "./types";
import MainMenu from "./components/MainMenu";
import NewGameScreen from "./components/NewGameScreen.tsx";
import MainScreen from "./components/MainScreen";
import NewProjectScreen_Phase1 from "./components/NewProjectScreen_Phase1";
import OfficeScreen from "./components/OfficeScreen";
import ResearchScreen from "./components/ResearchScreen";
import StudiogelaendeScreen from "./components/StudiogelaendeScreen";
import FinanzenScreen from "./components/FinanzenScreen";
import MarketingScreen from "./components/MarketingScreen";
import ScreenTransition from "./components/ScreenTransition";
import SettingsScreen from "./components/SettingsScreen";
import LoadGameScreen from "./components/LoadGameScreen";
import PrivatlebenScreen from "./components/PrivatlebenScreen";
import { generateInitialCompetitors } from "./components/competitorGenerator";
import { generateScriptMarket } from "./components/scriptGenerator";
import { generateInitialEmployees, generateEmployeeMarket } from "./components/employeeGenerator";
import { INITIAL_STOCKS } from "./components/stocks";
import { ALL_AGENCIES } from "./components/agencies";
import { GameProvider, useGame } from "./contexts/GameContext";
import { generateInitialActors } from "./components/actors";
import { generateInitialDirectors } from "./components/directors";
import CompletedProjectScreen from "./components/CompletedProjectScreen";
import { translations } from "./translations";
import { ALL_MALE_PORTRAITS, ALL_FEMALE_PORTRAITS } from "./components/portraits";
import { generateWeeklyPosters } from "./components/coverConfig";
import { generateContractOffers } from "./components/contractData";
import { generateInitialMovieHistory } from "./components/festivalData";
import EditorScreen from "./components/EditorScreen";
import Scratchpad from "./components/Scratchpad";
import { RESEARCH_TECHS } from "./components/research";
import { clampCeoSalary } from "./hooks/helpers";
import { useOnlineSync } from "./hooks/useOnlineSync.ts";
import { useDateLoop } from "./hooks/useDateLoop.ts";
import AuthLoginScreen from "./components/AuthLoginScreen.tsx";
import { loadSaveFiles, persistSaveFiles } from "./hooks/saveStorage";
const generateInitialGenreTrends = () => {
  const trends = {};
  Object.values(Genre).forEach((genre) => {
    const popularity = parseFloat((0.8 + Math.random() * 0.4).toFixed(2));
    const momentum = parseFloat((Math.random() * 0.04 - 0.02).toFixed(2));
    trends[genre] = {
      popularity,
      momentum,
      peakDuration: 0
    };
  });
  return trends;
};
const generateFakeStockHistory = (currentPrice, volatility) => {
  const history = [currentPrice];
  let simPrice = currentPrice;
  for (let i = 0; i < 51; i++) {
    const change = (Math.random() - 0.5) * volatility * 4;
    simPrice = simPrice / (1 + change);
    history.unshift(simPrice);
  }
  return history;
};
const REALTIME_GAME_START_REAL = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0));
const REALTIME_GAME_START_INGAME = new Date(Date.UTC(1990, 0, 1, 0, 0, 0, 0));
const MS_PER_REAL_DAY = 24 * 60 * 60 * 1e3;
const AUTH_TOKEN_KEY = "mb_auth_token";
const LOCAL_STUDIO_ID_KEY = "movie_business_online_studio_id_v1";
const LAST_SEEN_RESET_ANCHOR_KEY = "movie_business_last_reset_anchor_v1";
const normalizeApiBaseUrl = (value) => String(value || "").trim().replace(/\/$/, "");
const safeSessionGet = (key) => {
  try {
    return sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
};
const safeSessionSet = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
  }
};
const safeSessionRemove = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
  }
};
const getStoredAuthToken = () => {
  if (typeof window === "undefined") return "";
  const sessionToken = safeSessionGet(AUTH_TOKEN_KEY).trim();
  if (sessionToken) return sessionToken;
  const legacyToken = String(localStorage.getItem(AUTH_TOKEN_KEY) || "").trim();
  if (legacyToken) {
    safeSessionSet(AUTH_TOKEN_KEY, legacyToken);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  return legacyToken;
};
const setStoredAuthToken = (token) => {
  const normalized = String(token || "").trim();
  if (!normalized) return;
  safeSessionSet(AUTH_TOKEN_KEY, normalized);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};
const clearStoredAuthToken = () => {
  safeSessionRemove(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};
const getStoredStudioId = () => {
  if (typeof window === "undefined") return "";
  const sessionStudioId = safeSessionGet(LOCAL_STUDIO_ID_KEY).trim();
  if (sessionStudioId) return sessionStudioId;
  const legacyStudioId = String(localStorage.getItem(LOCAL_STUDIO_ID_KEY) || "").trim();
  if (legacyStudioId) {
    safeSessionSet(LOCAL_STUDIO_ID_KEY, legacyStudioId);
    localStorage.removeItem(LOCAL_STUDIO_ID_KEY);
  }
  return legacyStudioId;
};
const clearStoredStudioId = () => {
  safeSessionRemove(LOCAL_STUDIO_ID_KEY);
  localStorage.removeItem(LOCAL_STUDIO_ID_KEY);
};
const resolveApiBaseUrl = () => {
  const envUrl = import.meta?.env?.VITE_ONLINE_CORE_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return normalizeApiBaseUrl(envUrl);
  }
  if (typeof window === "undefined") {
    return "http://localhost:8787";
  }
  const queryApi = normalizeApiBaseUrl(new URLSearchParams(window.location.search).get("api") || "");
  if (queryApi) {
    return queryApi;
  }
  const hostname = String(window.location.hostname || "").toLowerCase();
  const isIpv4Host = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6Host = hostname.includes(":");
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8787";
  }
  if (isIpv4Host || isIpv6Host) {
    return normalizeApiBaseUrl(window.location.origin);
  }
  if (hostname.startsWith("api.")) {
    return normalizeApiBaseUrl(window.location.origin);
  }
  return `${window.location.protocol}//api.${window.location.host}`;
};
const API_BASE = resolveApiBaseUrl();
const SAVE_KEY = "film_tycoon_saves";
const AUTO_SAVE_INTERVAL_MS = 15e3;
const clampSkillValue = (value, fallback = 20) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
};
const normalizeEmployeePortraitUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image")) return raw;
  const filename = raw.split("/").pop() || raw;
  return `/portrait/${filename}`;
};
const getDaysInMonth = (date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
};
const calculateCurrentRealtimeGameDate = (referenceDate = /* @__PURE__ */ new Date()) => {
  const elapsedRealMs = Math.max(0, referenceDate.getTime() - REALTIME_GAME_START_REAL.getTime());
  const elapsedRealDays = elapsedRealMs / MS_PER_REAL_DAY;
  const fullMonthsElapsed = Math.floor(elapsedRealDays);
  const monthFraction = elapsedRealDays - fullMonthsElapsed;
  const current = new Date(REALTIME_GAME_START_INGAME);
  current.setUTCMonth(current.getUTCMonth() + fullMonthsElapsed);
  const daysInCurrentMonth = getDaysInMonth(current);
  const dayOffsetFloat = monthFraction * daysInCurrentMonth;
  current.setTime(current.getTime() + dayOffsetFloat * MS_PER_REAL_DAY);
  return current;
};
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unbekannter Fehler"
    };
  }
  componentDidCatch(error, info) {
    console.error("UI runtime error:", error, info);
  }
  handleReload = () => {
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-black text-white p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-xl w-full bg-gray-900/90 border border-red-700 rounded-lg p-6 text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-cinzel text-red-400 mb-3", children: "Ein Fehler ist aufgetreten" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-200 mb-2", children: "Die UI wurde gestoppt, um einen Blackscreen zu verhindern." }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-red-300 break-words mb-5", children: this.state.message }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: this.handleReload,
            className: "bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-2 px-5 rounded-sm uppercase text-sm",
            children: "Neu laden"
          }
        )
      ] }) });
    }
    return this.props.children;
  }
}
const AppContent = () => {
  const { playerData, setPlayerData, masterVolume, musicVolume, isMuted, playSfx, isRightClickToMainScreenEnabled, jumpToNewsOnMessage, pauseOnMessage, isF12ReloadEnabled, language, scalingMode, activeDataPackage, customPackages } = useGame();
  const [authToken, setAuthToken] = useState(() => getStoredAuthToken());
  const onlineSyncState = useOnlineSync(playerData);
  useDateLoop({ setPlayerData, enabled: !authToken });
  const [gameState, setGameState] = useState(GameState.MainMenu);
  const [gameSpeed, setGameSpeed] = useState(GameSpeed.NORMAL);
  const [lastActiveSpeed, setLastActiveSpeed] = useState(GameSpeed.NORMAL);
  const [isSystemPaused, setIsSystemPaused] = useState(false);
  const [targetOfficeTab, setTargetOfficeTab] = useState("nachrichten");
  const [targetMarketingTab, setTargetMarketingTab] = useState("my_films");
  const [targetMarketingDistributionTab, setTargetMarketingDistributionTab] = useState();
  const [targetFinanzenTab, setTargetFinanzenTab] = useState("take_loan");
  const [targetStudiogelaendeBuilding, setTargetStudiogelaendeBuilding] = useState(BuildingType.Autorenbuero);
  const [targetProjectsView, setTargetProjectsView] = useState("project");
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [targetFilmTitle, setTargetFilmTitle] = useState();
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const audioRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pendingRegistration, setPendingRegistration] = useState(false);
  const lastAppliedAdminRevisionRef = useRef("");
  const autoSaveInFlightRef = useRef(false);
  const autoSaveIntervalIdRef = useRef(null);
  const hasPlayerData = Boolean(playerData);
  const t = translations[language];
  useEffect(() => {
    if (!authToken || !onlineSyncState?.currentIngameDateIso) {
      return;
    }
    const serverDate = new Date(onlineSyncState.currentIngameDateIso);
    if (Number.isNaN(serverDate.getTime())) {
      return;
    }
    setPlayerData((current) => {
      if (!current) return current;
      const localDate = new Date(current.gameDate);
      if (Math.abs(serverDate.getTime() - localDate.getTime()) < 1e3) {
        return current;
      }
      return {
        ...current,
        gameDate: serverDate
      };
    });
  }, [authToken, onlineSyncState?.currentIngameDateIso, setPlayerData]);
  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1080;
  const apiRequest = useCallback(async (path, init, tokenOverride) => {
    const token = tokenOverride ?? authToken;
    const headers = {
      "Content-Type": "application/json",
      ...init?.headers || {}
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMessage = typeof data?.error === "string" ? data.error : `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }
    return data;
  }, [authToken]);
  const refreshAuthUser = useCallback(async (tokenToUse) => {
    const token = tokenToUse ?? authToken;
    if (!token) {
      setAuthUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const result = await apiRequest("/auth/me", { method: "GET" }, token);
      setAuthUser(result.user || null);
    } catch {
      clearStoredAuthToken();
      setAuthToken("");
      setAuthUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [apiRequest, authToken]);
  const writeAutoSaveSnapshotSync = useCallback((snapshot) => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const saves = Array.isArray(parsed) ? parsed : [];
      const withoutAuto = saves.filter((save) => Number(save?.slotId) !== 0);
      const nextSaves = [
        {
          slotId: 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          data: snapshot
        },
        ...withoutAuto
      ];
      localStorage.setItem(SAVE_KEY, JSON.stringify(nextSaves));
    } catch {
    }
  }, []);
  const writeAutoSaveSnapshot = useCallback(async (snapshot) => {
    if (autoSaveInFlightRef.current) return;
    autoSaveInFlightRef.current = true;
    try {
      writeAutoSaveSnapshotSync(snapshot);
      const existingSaves = await loadSaveFiles();
      const withoutAuto = existingSaves.filter((save) => save.slotId !== 0);
      await persistSaveFiles([
        {
          slotId: 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          data: snapshot
        },
        ...withoutAuto
      ]);
    } catch {
    } finally {
      autoSaveInFlightRef.current = false;
    }
  }, [writeAutoSaveSnapshotSync]);
  const hasCriticalActivity = useCallback((data) => {
    if (!data) return false;
    return Boolean(
      Array.isArray(data.activeProjects) && data.activeProjects.length > 0 || data.activePlanning || data.activeResearch || Array.isArray(data.activeConstructions) && data.activeConstructions.length > 0 || data.activeConstruction || Array.isArray(data.activeCastings) && data.activeCastings.length > 0 || Array.isArray(data.activeCastingCampaigns) && data.activeCastingCampaigns.length > 0 || Array.isArray(data.activeTalentScoutings) && data.activeTalentScoutings.length > 0 || data.activeWriting || data.activeCourse || data.activeSeminar
    );
  }, []);
  useEffect(() => {
    void refreshAuthUser();
  }, [refreshAuthUser]);
  useEffect(() => {
    if (autoSaveIntervalIdRef.current !== null) {
      window.clearInterval(autoSaveIntervalIdRef.current);
      autoSaveIntervalIdRef.current = null;
    }
    if (!playerData || gameState === GameState.MainMenu) {
      return;
    }
    autoSaveIntervalIdRef.current = window.setInterval(() => {
      if (!playerData) return;
      if (!hasCriticalActivity(playerData)) return;
      void writeAutoSaveSnapshot(playerData);
    }, AUTO_SAVE_INTERVAL_MS);
    return () => {
      if (autoSaveIntervalIdRef.current !== null) {
        window.clearInterval(autoSaveIntervalIdRef.current);
        autoSaveIntervalIdRef.current = null;
      }
    };
  }, [gameState, hasCriticalActivity, playerData, writeAutoSaveSnapshot]);
  useEffect(() => {
    if (!playerData) return;
    const saveNow = () => {
      if (!playerData) return;
      writeAutoSaveSnapshotSync(playerData);
      void writeAutoSaveSnapshot(playerData);
    };
    const handleBeforeUnload = () => {
      saveNow();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveNow();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [playerData, writeAutoSaveSnapshot, writeAutoSaveSnapshotSync]);
  useEffect(() => {
    if (!hasPlayerData) {
      return;
    }
    const studioId = String(onlineSyncState?.studioId || getStoredStudioId() || "").trim();
    if (!studioId) {
      return;
    }
    let cancelled = false;
    const applyAdminRealtimePatch = (remoteStudio) => {
      setPlayerData((prev) => {
        if (!prev) return prev;
        const remoteState = remoteStudio?.state;
        if (!remoteState || typeof remoteState !== "object") return prev;
        let changed = false;
        let nextData = prev;
        const remoteStudioName = String(remoteStudio?.studioName || "").trim();
        if (remoteStudioName && remoteStudioName !== prev.studioName) {
          nextData = { ...nextData, studioName: remoteStudioName };
          changed = true;
        }
        const remotePlayerName = String(remoteState?.playerName || "").trim();
        if (remotePlayerName && remotePlayerName !== prev.playerName) {
          if (!changed) nextData = { ...nextData };
          nextData.playerName = remotePlayerName;
          changed = true;
        }
        const remotePlayerPortraitId = String(remoteState?.playerPortraitId || "").trim();
        if (remotePlayerPortraitId && remotePlayerPortraitId !== prev.playerPortraitId) {
          if (!changed) nextData = { ...nextData };
          nextData.playerPortraitId = remotePlayerPortraitId;
          changed = true;
        }
        const remoteCapital = Number(remoteState?.capital);
        if (Number.isFinite(remoteCapital) && remoteCapital !== prev.capital) {
          if (!changed) nextData = { ...nextData };
          nextData.capital = remoteCapital;
          changed = true;
        }
        const remoteMessagesRaw = Array.isArray(remoteState?.messages) ? remoteState.messages : null;
        if (remoteMessagesRaw) {
          const toValidDate = (value, fallbackDate) => {
            const parsed = new Date(value || "");
            if (Number.isNaN(parsed.getTime())) {
              return fallbackDate;
            }
            return parsed;
          };
          const normalizedRemoteMessages = remoteMessagesRaw.filter((item) => item && typeof item === "object").map((message) => {
            const fallbackDate = nextData.gameDate instanceof Date ? nextData.gameDate : /* @__PURE__ */ new Date();
            const normalizedId = String(message?.id || "").trim();
            return {
              ...message,
              id: normalizedId || `msg_remote_${Math.random().toString(36).slice(2, 10)}`,
              sender: String(message?.sender || "System"),
              read: Boolean(message?.read),
              date: toValidDate(message?.date, fallbackDate),
              readDate: message?.readDate ? toValidDate(message.readDate, fallbackDate) : null
            };
          });
          const localById = new Map((nextData.messages || []).map((msg) => [String(msg.id || ""), msg]));
          const mergedMessages = normalizedRemoteMessages.map((remoteMsg) => {
            const localMsg = localById.get(String(remoteMsg.id || ""));
            if (!localMsg) return remoteMsg;
            return {
              ...remoteMsg,
              read: Boolean(remoteMsg.read || localMsg.read),
              isArchived: Boolean(remoteMsg.isArchived || localMsg.isArchived),
              readDate: remoteMsg.readDate || localMsg.readDate || null
            };
          });
          const localMessages = nextData.messages || [];
          let messagesChanged = mergedMessages.length !== localMessages.length;
          if (!messagesChanged) {
            messagesChanged = mergedMessages.some((msg, index) => {
              const local = localMessages[index];
              if (!local) return true;
              const msgDate = msg?.date instanceof Date ? msg.date.getTime() : new Date(msg?.date || "").getTime();
              const localDate = local?.date instanceof Date ? local.date.getTime() : new Date(local?.date || "").getTime();
              const msgReadDate = msg?.readDate ? new Date(msg.readDate).getTime() : null;
              const localReadDate = local?.readDate ? new Date(local.readDate).getTime() : null;
              return String(msg?.id || "") !== String(local?.id || "") || String(msg?.sender || "") !== String(local?.sender || "") || String(msg?.subject || "") !== String(local?.subject || "") || String(msg?.body || "") !== String(local?.body || "") || Boolean(msg?.read) !== Boolean(local?.read) || Boolean(msg?.isArchived) !== Boolean(local?.isArchived) || msgDate !== localDate || msgReadDate !== localReadDate;
            });
          }
          if (messagesChanged) {
            if (!changed) nextData = { ...nextData };
            nextData.messages = mergedMessages;
            changed = true;
          }
        }
        const remoteGenreTrends = remoteState?.genreTrends;
        if (remoteGenreTrends && typeof remoteGenreTrends === "object") {
          const normalizedRemoteGenreTrends = {};
          Object.keys(remoteGenreTrends).forEach((genreKey) => {
            const entry = remoteGenreTrends[genreKey] || {};
            normalizedRemoteGenreTrends[genreKey] = {
              popularity: Number(entry?.popularity ?? 0),
              momentum: Number(entry?.momentum ?? 0),
              peakDuration: Number(entry?.peakDuration ?? 0)
            };
          });
          const localGenreTrends = nextData.genreTrends || {};
          const localKeys = Object.keys(localGenreTrends);
          const remoteKeys = Object.keys(normalizedRemoteGenreTrends);
          let genreTrendsChanged = localKeys.length !== remoteKeys.length;
          if (!genreTrendsChanged) {
            genreTrendsChanged = remoteKeys.some((key) => {
              const remoteEntry = normalizedRemoteGenreTrends[key] || {};
              const localEntry = localGenreTrends[key] || {};
              return Number(remoteEntry.popularity) !== Number(localEntry.popularity) || Number(remoteEntry.momentum) !== Number(localEntry.momentum) || Number(remoteEntry.peakDuration) !== Number(localEntry.peakDuration);
            });
          }
          if (genreTrendsChanged) {
            if (!changed) nextData = { ...nextData };
            nextData.genreTrends = normalizedRemoteGenreTrends;
            changed = true;
          }
        }
        const remoteMarketTrendRaw = remoteState?.marketTrend;
        const normalizedRemoteMarketTrend = remoteMarketTrendRaw && typeof remoteMarketTrendRaw === "object" ? {
          type: String(remoteMarketTrendRaw.type || "") === "bear" ? "bear" : "bull",
          duration: Number(remoteMarketTrendRaw.duration ?? 0),
          minFactor: Number(remoteMarketTrendRaw.minFactor ?? 0),
          maxFactor: Number(remoteMarketTrendRaw.maxFactor ?? 0)
        } : null;
        const localMarketTrend = nextData.marketTrend || null;
        const marketTrendChanged = normalizedRemoteMarketTrend ? !localMarketTrend || String(localMarketTrend.type || "") !== String(normalizedRemoteMarketTrend.type || "") || Number(localMarketTrend.duration ?? 0) !== Number(normalizedRemoteMarketTrend.duration ?? 0) || Number(localMarketTrend.minFactor ?? 0) !== Number(normalizedRemoteMarketTrend.minFactor ?? 0) || Number(localMarketTrend.maxFactor ?? 0) !== Number(normalizedRemoteMarketTrend.maxFactor ?? 0) : Boolean(localMarketTrend);
        if (marketTrendChanged) {
          if (!changed) nextData = { ...nextData };
          nextData.marketTrend = normalizedRemoteMarketTrend;
          changed = true;
        }
        const remoteCompletedFilms = Array.isArray(remoteState?.completedFilms) ? remoteState.completedFilms : null;
        if (remoteCompletedFilms) {
          const nextCompletedFilms = nextData.completedFilms.map((localFilm, index) => {
            const remoteFilm = remoteCompletedFilms[index];
            if (!remoteFilm || typeof remoteFilm !== "object") return localFilm;
            const newTitle = String(remoteFilm?.workingTitle || localFilm.workingTitle || "");
            const newGenre = remoteFilm?.genre || localFilm.genre;
            const newQuality = Number(remoteFilm?.finalQuality ?? localFilm.finalQuality ?? 0);
            const newHype = Number(remoteFilm?.hype ?? localFilm.hype ?? 0);
            if (newTitle !== localFilm.workingTitle || newGenre !== localFilm.genre || newQuality !== localFilm.finalQuality || newHype !== (localFilm.hype || 0)) {
              changed = true;
              return {
                ...localFilm,
                workingTitle: newTitle,
                genre: newGenre,
                finalQuality: newQuality,
                hype: newHype
              };
            }
            return localFilm;
          });
          if (changed) {
            if (nextData === prev) nextData = { ...nextData };
            nextData.completedFilms = nextCompletedFilms;
          }
        }
        const remoteCompetitors = Array.isArray(remoteState?.competitors) ? remoteState.competitors : null;
        if (remoteCompetitors) {
          const nextCompetitors = nextData.competitors.map((localComp) => {
            const remoteComp = remoteCompetitors.find((candidate) => String(candidate?.id ?? "") === String(localComp.id));
            if (!remoteComp || typeof remoteComp !== "object") return localComp;
            let compChanged = false;
            const remoteCompName = String(remoteComp?.name || localComp.name || "");
            const remoteFilms = Array.isArray(remoteComp?.completedFilms) ? remoteComp.completedFilms : [];
            const consumedRemoteIndexes = /* @__PURE__ */ new Set();
            const toTimeOrNaN = (value) => {
              const ts = value ? new Date(value).getTime() : Number.NaN;
              return Number.isNaN(ts) ? Number.NaN : ts;
            };
            const nextCompFilms = localComp.completedFilms.map((localFilm, index) => {
              const localReleaseTs = toTimeOrNaN(localFilm?.releaseDate);
              const localTitle = String(localFilm?.title || "").trim().toLowerCase();
              let matchedRemoteIndex = -1;
              if (Number.isFinite(localReleaseTs)) {
                matchedRemoteIndex = remoteFilms.findIndex((candidate, candidateIndex) => {
                  if (consumedRemoteIndexes.has(candidateIndex)) return false;
                  const candidateTs = toTimeOrNaN(candidate?.releaseDate);
                  return Number.isFinite(candidateTs) && candidateTs === localReleaseTs;
                });
              }
              if (matchedRemoteIndex < 0 && localTitle) {
                matchedRemoteIndex = remoteFilms.findIndex((candidate, candidateIndex) => {
                  if (consumedRemoteIndexes.has(candidateIndex)) return false;
                  const candidateTitle = String(candidate?.title || "").trim().toLowerCase();
                  return candidateTitle === localTitle;
                });
              }
              if (matchedRemoteIndex < 0 && index < remoteFilms.length && !consumedRemoteIndexes.has(index)) {
                matchedRemoteIndex = index;
              }
              const remoteFilm = matchedRemoteIndex >= 0 ? remoteFilms[matchedRemoteIndex] : null;
              if (!remoteFilm || typeof remoteFilm !== "object") return localFilm;
              if (matchedRemoteIndex >= 0) consumedRemoteIndexes.add(matchedRemoteIndex);
              const newTitle = String(remoteFilm?.title || localFilm.title || "");
              const newGenre = remoteFilm?.genre || localFilm.genre;
              const newQuality = Number(remoteFilm?.quality ?? localFilm.quality ?? 0);
              const newChartQuality = Number(remoteFilm?.chartQuality ?? localFilm.chartQuality ?? 0);
              const newViewers = Number(remoteFilm?.viewers ?? localFilm.viewers ?? 0);
              const newTotalViewers = Number(remoteFilm?.totalViewers ?? localFilm.totalViewers ?? 0);
              const newWeeks = Number(remoteFilm?.weeksInCharts ?? localFilm.weeksInCharts ?? 0);
              if (newTitle !== localFilm.title || newGenre !== localFilm.genre || newQuality !== localFilm.quality || newChartQuality !== localFilm.chartQuality || newViewers !== localFilm.viewers || newTotalViewers !== localFilm.totalViewers || newWeeks !== localFilm.weeksInCharts) {
                compChanged = true;
                changed = true;
                return {
                  ...localFilm,
                  title: newTitle,
                  genre: newGenre,
                  quality: newQuality,
                  chartQuality: newChartQuality,
                  viewers: newViewers,
                  totalViewers: newTotalViewers,
                  weeksInCharts: newWeeks
                };
              }
              return localFilm;
            });
            if (remoteCompName !== localComp.name) {
              compChanged = true;
              changed = true;
            }
            if (!compChanged) return localComp;
            return {
              ...localComp,
              name: remoteCompName,
              completedFilms: nextCompFilms
            };
          });
          if (changed) {
            if (nextData === prev) nextData = { ...nextData };
            nextData.competitors = nextCompetitors;
          }
        }
        return changed ? nextData : prev;
      });
    };
    const pollAdminUpdates = async () => {
      try {
        const remoteStudio = await apiRequest(`/studios/${encodeURIComponent(studioId)}`, { method: "GET" });
        if (cancelled || !remoteStudio) return;
        const revision = String(remoteStudio?.adminUpdatedAtIso || "").trim();
        if (!revision || revision === lastAppliedAdminRevisionRef.current) {
          return;
        }
        lastAppliedAdminRevisionRef.current = revision;
        applyAdminRealtimePatch(remoteStudio);
      } catch {
      }
    };
    void pollAdminUpdates();
    const intervalId = window.setInterval(pollAdminUpdates, 3e3);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [apiRequest, authToken, hasPlayerData, onlineSyncState?.studioId, setPlayerData]);
  const handleLogin = useCallback(async ({ username, password }) => {
    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: username, password })
      }, "");
      const token = String(result.token || "");
      if (!token || !result.user) {
        return { ok: false, error: "Ungueltige Serverantwort" };
      }
      setStoredAuthToken(token);
      setAuthToken(token);
      setAuthUser(result.user);
      setPendingRegistration(false);
      setGameState(GameState.MainScreen);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Login fehlgeschlagen" };
    }
  }, [apiRequest]);
  const handleLogout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
    }
    clearStoredAuthToken();
    clearStoredStudioId();
    setAuthToken("");
    setAuthUser(null);
    setPendingRegistration(false);
    setPlayerData(null);
    setGameState(GameState.MainMenu);
  }, [apiRequest, setPlayerData]);
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const safeFactor = 0.99;
      if (scalingMode === "stretch") {
        setScale({ x: w / BASE_WIDTH * safeFactor, y: h / BASE_HEIGHT * safeFactor });
      } else {
        const s = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT) * safeFactor;
        setScale({ x: s, y: s });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [scalingMode]);
  useEffect(() => {
    if (isSystemPaused && pendingNavigation) {
      setGameState(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [isSystemPaused, pendingNavigation]);
  const handleSetGameSpeed = useCallback((newSpeed) => {
    if (newSpeed !== GameSpeed.PAUSED) {
      setLastActiveSpeed(newSpeed);
    }
    setIsSystemPaused(false);
    setGameSpeed(newSpeed);
  }, []);
  const systemPause = useCallback(() => {
    setGameSpeed((currentSpeed) => {
      if (currentSpeed === GameSpeed.PAUSED) {
        setLastActiveSpeed(GameSpeed.PAUSED);
        setIsSystemPaused(true);
        return GameSpeed.PAUSED;
      }
      setLastActiveSpeed(currentSpeed);
      setIsSystemPaused(true);
      return GameSpeed.PAUSED;
    });
  }, []);
  const systemResume = useCallback(() => {
    if (isSystemPaused) {
      setGameSpeed(lastActiveSpeed);
      setIsSystemPaused(false);
    }
  }, [isSystemPaused, lastActiveSpeed]);
  const togglePauseSpeed = useCallback(() => {
    if (gameSpeed === GameSpeed.PAUSED) {
      const resumeSpeed = lastActiveSpeed === GameSpeed.PAUSED ? GameSpeed.NORMAL : lastActiveSpeed;
      setGameSpeed(resumeSpeed);
      setIsSystemPaused(false);
    } else {
      setLastActiveSpeed(gameSpeed);
      setGameSpeed(GameSpeed.PAUSED);
      setIsSystemPaused(true);
    }
  }, [gameSpeed, lastActiveSpeed]);
  const onNavigate = useCallback((state) => {
    systemPause();
    setPendingNavigation(state);
  }, [systemPause]);
  const handleNewGame = useCallback(() => {
    setPendingRegistration(false);
    setGameState(GameState.NewGame);
  }, []);
  const handleStartRegistration = useCallback(() => {
    setPendingRegistration(true);
    setGameState(GameState.NewGame);
  }, []);
  const handleLoadGame = useCallback(() => {
    setGameState(GameState.LoadGame);
  }, []);
  const handleEditor = useCallback(() => {
    setGameState(GameState.Editor);
  }, []);
  const handleSettings = useCallback(() => {
    setGameState(GameState.Settings);
  }, []);
  const handleBackToMenu = useCallback(() => {
    setPlayerData(null);
    setGameState(GameState.MainMenu);
  }, [setPlayerData]);
  const handleBackToMainScreen = useCallback(() => {
    systemResume();
    setGameState(GameState.MainScreen);
  }, [systemResume]);
  const handleNavigateToOfficeTab = useCallback((tab) => {
    setTargetOfficeTab(tab);
    onNavigate(GameState.Office);
  }, [onNavigate]);
  const prevMessagesCountRef = useRef(void 0);
  const gameJustLoadedRef = useRef(true);
  useEffect(() => {
    if (!playerData) {
      gameJustLoadedRef.current = true;
      prevMessagesCountRef.current = void 0;
      return;
    }
    if (gameJustLoadedRef.current) {
      prevMessagesCountRef.current = playerData.messages.length;
      gameJustLoadedRef.current = false;
      return;
    }
    const currentCount = playerData.messages.length;
    const prevCount = prevMessagesCountRef.current;
    const hasNewMessage = currentCount > (prevCount ?? 0);
    if (hasNewMessage) {
      if (jumpToNewsOnMessage) {
        handleNavigateToOfficeTab("nachrichten");
      } else if (pauseOnMessage) {
        if (!isSystemPaused) {
          systemPause();
        }
      } else {
        if (isSystemPaused) {
          systemResume();
        }
      }
    }
    prevMessagesCountRef.current = currentCount;
  }, [playerData, jumpToNewsOnMessage, pauseOnMessage, handleNavigateToOfficeTab, isSystemPaused, systemPause, systemResume]);
  useEffect(() => {
    const handleRightClick = (event) => {
      if (playerData && isRightClickToMainScreenEnabled) {
        event.preventDefault();
        if (gameState !== GameState.MainScreen) {
          handleBackToMainScreen();
        }
      }
    };
    window.addEventListener("contextmenu", handleRightClick);
    return () => {
      window.removeEventListener("contextmenu", handleRightClick);
    };
  }, [playerData, isRightClickToMainScreenEnabled, handleBackToMainScreen, gameState]);
  const handleConfirmLoad = useCallback((data) => {
    const hydratePlayerData = (parsedData) => {
      const trends = parsedData.genreTrends || generateInitialGenreTrends();
      const fallbackGlobalDate = calculateCurrentRealtimeGameDate();
      const parsedGameDate = parsedData.gameDate ? new Date(parsedData.gameDate) : fallbackGlobalDate;
      const sanitizedGameDate = Number.isNaN(parsedGameDate.getTime()) || parsedGameDate.getFullYear() < 1900 ? fallbackGlobalDate : parsedGameDate;
      const gameStartDate = new Date(REALTIME_GAME_START_INGAME);
      let playerBirthDate = parsedData.playerBirthDate ? new Date(parsedData.playerBirthDate) : void 0;
      if (!playerBirthDate) {
        playerBirthDate = new Date(1965, 0, 1);
      }
      let playerPortraitId = parsedData.playerPortraitId;
      if (!playerPortraitId) {
        const gender = parsedData.gender || "m\xE4nnlich";
        const pool = gender === "m\xE4nnlich" ? ALL_MALE_PORTRAITS : ALL_FEMALE_PORTRAITS;
        playerPortraitId = pool[Math.floor(Math.random() * pool.length)];
      }
      const authProfileImageData = typeof authUser?.profileImageData === "string" ? authUser.profileImageData.trim() : "";
      if (authProfileImageData) {
        playerPortraitId = authProfileImageData;
      }
      const hydrateProject = (proj) => {
        if (!proj) return null;
        const hydrateDeal = (deal) => {
          if (!deal) return void 0;
          return {
            ...deal,
            startDate: new Date(deal.startDate),
            signedDate: deal.signedDate ? new Date(deal.signedDate) : new Date(deal.startDate),
            endDate: new Date(deal.endDate),
            homeEntertainmentStartDate: deal.homeEntertainmentStartDate ? new Date(deal.homeEntertainmentStartDate) : void 0,
            payTvStartDate: deal.payTvStartDate ? new Date(deal.payTvStartDate) : void 0,
            freeTvStartDate: deal.freeTvStartDate ? new Date(deal.freeTvStartDate) : void 0,
            nextPhaseStartDate: deal.nextPhaseStartDate ? new Date(deal.nextPhaseStartDate) : void 0
          };
        };
        return {
          ...proj,
          scriptStartDate: new Date(proj.scriptStartDate),
          scriptEndDate: new Date(proj.scriptEndDate),
          castingStartDate: proj.castingStartDate ? new Date(proj.castingStartDate) : void 0,
          castingEndDate: proj.castingEndDate ? new Date(proj.castingEndDate) : void 0,
          productionStartDate: proj.productionStartDate ? new Date(proj.productionStartDate) : void 0,
          productionEndDate: proj.productionEndDate ? new Date(proj.productionEndDate) : void 0,
          postProductionStartDate: proj.postProductionStartDate ? new Date(proj.postProductionStartDate) : void 0,
          postProductionEndDate: proj.postProductionEndDate ? new Date(proj.postProductionEndDate) : void 0,
          isArchived: proj.isArchived || false,
          hype: proj.hype || 0,
          saleDetails: proj.saleDetails ? { ...proj.saleDetails, saleDate: new Date(proj.saleDetails.saleDate) } : void 0,
          nextOfferDate: proj.nextOfferDate ? new Date(proj.nextOfferDate) : void 0,
          studioId: proj.studioId || (proj.phase >= ProjectPhase.Production ? "studio1" : void 0),
          activeDeal: hydrateDeal(proj.activeDeal),
          // Hydrate Active Deal
          // Ensure sub-objects are hydrated (simple copy for now as Date parsing is top-level concern here)
          cinemaRelease: proj.cinemaRelease ? { ...proj.cinemaRelease, releaseDate: new Date(proj.cinemaRelease.releaseDate), endDate: proj.cinemaRelease.endDate ? new Date(proj.cinemaRelease.endDate) : void 0 } : void 0
        };
      };
      let activeProjects = [];
      if (parsedData.activeProjects) {
        activeProjects = parsedData.activeProjects.map(hydrateProject).filter((p) => p !== null);
      } else if (parsedData.currentProject) {
        const migratedProject = hydrateProject(parsedData.currentProject);
        if (migratedProject && migratedProject.phase >= ProjectPhase.Casting) {
          activeProjects.push(migratedProject);
        }
      }
      let hydratedPortfolio = {};
      if (parsedData.portfolio && typeof Object.values(parsedData.portfolio)[0] === "number") {
        const tempPortfolio = {};
        hydratedPortfolio = tempPortfolio;
      } else {
        hydratedPortfolio = parsedData.portfolio || {};
      }
      const hydrateEmployee = (emp) => {
        let lastTrainingDate = emp.lastTrainingDate ? new Date(emp.lastTrainingDate) : void 0;
        if (!lastTrainingDate && emp.lastTrainingYear) {
          lastTrainingDate = new Date(emp.lastTrainingYear, 0, 1);
        }
        let activeTraining = emp.activeTraining ? {
          endDate: new Date(emp.activeTraining.endDate),
          startDate: emp.activeTraining.startDate ? new Date(emp.activeTraining.startDate) : new Date(sanitizedGameDate)
        } : void 0;
        return {
          ...emp,
          satisfaction: emp.satisfaction ?? 80,
          portraitUrl: normalizeEmployeePortraitUrl(emp.portraitUrl),
          activeTraining,
          lastTrainingDate,
          lastPraised: emp.lastPraised ? new Date(emp.lastPraised) : void 0
        };
      };
      let employees = parsedData.employees || [];
      if (parsedData.writers && !parsedData.employees) {
        employees = parsedData.writers.map((writer) => ({
          ...writer,
          type: EmployeeType.Autor
        }));
      }
      employees = employees.map(hydrateEmployee);
      const allEmployees = parsedData.allEmployees || generateInitialEmployees();
      const employeeMarket = (parsedData.employeeMarket || generateEmployeeMarket(employees.map((e) => e.id), parsedData.reputation, allEmployees)).map(hydrateEmployee);
      const generateRandomBirthDateForSave = () => {
        const age = Math.floor(Math.random() * (81 - 21 + 1)) + 21;
        const birthYear = gameStartDate.getFullYear() - age;
        const birthMonth = Math.floor(Math.random() * 12);
        const birthDay = Math.floor(Math.random() * 28) + 1;
        return new Date(birthYear, birthMonth, birthDay);
      };
      const sanitizeTalentBirthDate = (value, gameDate, isDirector) => {
        const parsedBirthDate = value ? new Date(value) : generateRandomBirthDateForSave();
        if (Number.isNaN(parsedBirthDate.getTime())) {
          return generateRandomBirthDateForSave();
        }
        if (parsedBirthDate.getTime() > gameDate.getTime()) {
          const minimumAge = isDirector ? 18 : 8;
          const correctedBirthDate = new Date(gameDate);
          correctedBirthDate.setFullYear(correctedBirthDate.getFullYear() - minimumAge);
          return correctedBirthDate;
        }
        return parsedBirthDate;
      };
      const hydrateTalent = (t2, isDirector) => t2 ? {
        ...t2,
        birthDate: sanitizeTalentBirthDate(t2.birthDate, new Date(sanitizedGameDate), isDirector),
        skill: Math.min(100, t2.skill),
        potential: Math.min(100, t2.potential || 100),
        bekanntheit: t2.bekanntheit ?? 5,
        lastPraised: t2.lastPraised ? new Date(t2.lastPraised) : void 0,
        lastBonusPaid: t2.lastBonusPaid ? new Date(t2.lastBonusPaid) : void 0,
        contract: t2.contract ? { ...t2.contract, expiryDate: new Date(t2.contract.expiryDate) } : void 0,
        activeTraining: t2.activeTraining ? { ...t2.activeTraining, endDate: new Date(t2.activeTraining.endDate) } : void 0,
        awards: t2.awards || [],
        isFavorite: t2.isFavorite || false,
        exclusiveContractCooldownUntil: t2.exclusiveContractCooldownUntil ? new Date(t2.exclusiveContractCooldownUntil) : void 0,
        unavailableForProjectsUntil: t2.unavailableForProjectsUntil ? new Date(t2.unavailableForProjectsUntil) : void 0
      } : t2;
      const hydratedDirectors = (parsedData.directors || []).map((director) => hydrateTalent(director, true));
      const hydratedActors = (parsedData.actors || []).map((actor) => hydrateTalent(actor, false));
      const activeConstruction = parsedData.activeConstruction ? { ...parsedData.activeConstruction, endDate: new Date(parsedData.activeConstruction.endDate) } : null;
      let activeConstructions = parsedData.activeConstructions ? parsedData.activeConstructions.map((c) => ({ ...c, endDate: new Date(c.endDate) })) : [];
      if (activeConstruction && activeConstructions.length === 0) {
        activeConstructions = [activeConstruction];
      }
      let lastCeoEvaluationYear = parsedData.lastCeoEvaluationYear || 1989;
      if (parsedData.lastCeoEvaluationYear === 1990 && new Date(sanitizedGameDate).getFullYear() < 1991) {
        lastCeoEvaluationYear = 1989;
      }
      const activeSeminar = parsedData.activeSeminar ? { ...parsedData.activeSeminar, startDate: new Date(parsedData.activeSeminar.startDate), endDate: new Date(parsedData.activeSeminar.endDate) } : null;
      const hydratedBuildings = Object.values(BuildingType).map((type) => {
        const existingBuilding = parsedData.buildings?.find((building) => building.type === type);
        const existingLevel = existingBuilding?.level || 0;
        if (type === BuildingType.ResearchLab) {
          return { type, level: Math.max(existingLevel, 1) };
        }
        return { type, level: existingLevel };
      });
      const hydratedResearch = parsedData.activeResearch ? (() => {
        const startDate = new Date(parsedData.activeResearch.startDate);
        const endDate = new Date(parsedData.activeResearch.endDate);
        const tech = RESEARCH_TECHS.find((entry) => entry.id === parsedData.activeResearch.techId);
        const requiredPoints = parsedData.activeResearch.requiredPoints ?? tech?.cost ?? 0;
        const totalDurationMs = Math.max(endDate.getTime() - startDate.getTime(), 1);
        const elapsedMs = Math.max(0, Math.min(new Date(sanitizedGameDate).getTime() - startDate.getTime(), totalDurationMs));
        const estimatedProgress = requiredPoints > 0 ? Math.round(requiredPoints * (elapsedMs / totalDurationMs)) : 0;
        return {
          ...parsedData.activeResearch,
          startDate,
          endDate,
          requiredPoints,
          progressPoints: parsedData.activeResearch.progressPoints ?? estimatedProgress
        };
      })() : null;
      const hydrated = {
        ...parsedData,
        gender: parsedData.gender || "m\xE4nnlich",
        playerBirthDate,
        playerPortraitId,
        gameDifficulty: parsedData.gameDifficulty || "normal",
        gameDate: new Date(sanitizedGameDate),
        lastMonthlyReportDate: parsedData.lastMonthlyReportDate ? new Date(parsedData.lastMonthlyReportDate) : null,
        nextEventDate: parsedData.nextEventDate ? new Date(parsedData.nextEventDate) : void 0,
        eventLog: parsedData.eventLog ? parsedData.eventLog.map((e) => ({ ...e, date: new Date(e.date) })) : [],
        transactionLog: parsedData.transactionLog.map((t2) => ({ ...t2, date: new Date(t2.date) })),
        messages: parsedData.messages ? parsedData.messages.map((m) => ({
          ...m,
          date: new Date(m.date),
          readDate: m.readDate ? new Date(m.readDate) : null
        })) : [],
        activeResearch: hydratedResearch,
        buildings: hydratedBuildings,
        activeMarketingCampaign: parsedData.activeMarketingCampaign ? { ...parsedData.activeMarketingCampaign, startDate: new Date(parsedData.activeMarketingCampaign.startDate), endDate: new Date(parsedData.activeMarketingCampaign.endDate) } : null,
        activeProductionCampaigns: parsedData.activeProductionCampaigns ? parsedData.activeProductionCampaigns.map((c) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate) })) : parsedData.activeProductionCampaign ? [{ ...parsedData.activeProductionCampaign, startDate: new Date(parsedData.activeProductionCampaign.startDate), endDate: new Date(parsedData.activeProductionCampaign.endDate) }] : [],
        activeProductionCampaign: null,
        activeConstruction,
        activeConstructions,
        activeCourse: parsedData.activeCourse ? { ...parsedData.activeCourse, endDate: new Date(parsedData.activeCourse.endDate) } : null,
        activeSeminar,
        // New Array Fields Migration
        activeCastings: parsedData.activeCastings ? parsedData.activeCastings.map((c) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate) })) : parsedData.activeCasting ? [{ ...parsedData.activeCasting, endDate: new Date(parsedData.activeCasting.endDate), startDate: parsedData.activeCasting.startDate ? new Date(parsedData.activeCasting.startDate) : void 0 }] : [],
        activeCasting: null,
        // Legacy field nulled
        activeCastingCampaigns: parsedData.activeCastingCampaigns ? parsedData.activeCastingCampaigns.map((c) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate) })) : parsedData.activeCastingCampaign ? [{ ...parsedData.activeCastingCampaign, startDate: new Date(parsedData.activeCastingCampaign.startDate), endDate: new Date(parsedData.activeCastingCampaign.endDate) }] : [],
        activeCastingCampaign: null,
        // Legacy field nulled
        activeTalentScoutings: parsedData.activeTalentScoutings ? parsedData.activeTalentScoutings.map((s) => ({ ...s, endDate: new Date(s.endDate) })) : parsedData.activeTalentScouting ? [{ ...parsedData.activeTalentScouting, endDate: new Date(parsedData.activeTalentScouting.endDate) }] : [],
        activeTalentScouting: null,
        // Legacy field nulled
        portfolio: hydratedPortfolio,
        stocks: parsedData.stocks ? parsedData.stocks.map((s) => ({ ...s, history: s.history || [s.price] })) : structuredClone(INITIAL_STOCKS),
        loans: parsedData.loans.map((l) => {
          const dateTaken = new Date(l.dateTaken);
          return { ...l, dateTaken };
        }),
        currentProject: hydrateProject(parsedData.currentProject),
        activeProjects,
        activePlanning: parsedData.activePlanning ? hydrateProject(parsedData.activePlanning) : null,
        completedFilms: (parsedData.completedFilms || []).map(hydrateProject),
        competitors: parsedData.competitors ? parsedData.competitors.map((c) => ({
          ...c,
          completedFilms: c.completedFilms.map((f) => ({ ...f, releaseDate: new Date(f.releaseDate) })),
          currentActivity: { ...c.currentActivity, endDate: new Date(c.currentActivity.endDate) }
        })) : generateInitialCompetitors(gameStartDate, hydratedDirectors, hydratedActors),
        directors: hydratedDirectors,
        actors: hydratedActors,
        talentChemie: parsedData.talentChemie || [],
        genreSpezialisierungen: parsedData.genreSpezialisierungen || [],
        agencies: parsedData.agencies || structuredClone(ALL_AGENCIES),
        activeMarketScout: parsedData.activeMarketScout ? { ...parsedData.activeMarketScout, endDate: new Date(parsedData.activeMarketScout.endDate) } : null,
        availableScripts: parsedData.availableScripts || [],
        scriptMarket: parsedData.scriptMarket || generateScriptMarket(parsedData.reputation, trends, t),
        lastScriptMarketRefresh: parsedData.lastScriptMarketRefresh ? new Date(parsedData.lastScriptMarketRefresh) : null,
        allEmployees,
        employees,
        employeeMarket,
        lastEmployeeMarketRefresh: parsedData.lastEmployeeMarketRefresh ? new Date(parsedData.lastEmployeeMarketRefresh) : null,
        activeWriting: parsedData.activeWriting ? { ...parsedData.activeWriting, startDate: new Date(parsedData.activeWriting.startDate), endDate: new Date(parsedData.activeWriting.endDate), nextEventDate: new Date(parsedData.activeWriting.nextEventDate) } : null,
        savedProjectTemplates: parsedData.savedProjectTemplates || [],
        pendingInstallments: parsedData.pendingInstallments || [],
        negotiationSkill: parsedData.negotiationSkill || 0,
        charisma: parsedData.charisma || 0,
        financialSense: parsedData.financialSense || 0,
        filmSense: parsedData.filmSense || 0,
        organizationTalent: parsedData.organizationTalent || 0,
        energy: parsedData.energy ?? 100,
        privateCapital: parsedData.privateCapital || 0,
        privatePortfolio: parsedData.privatePortfolio || {},
        ceoSalary: clampCeoSalary(parsedData.ceoSalary || 0),
        lastCeoEvaluationYear,
        ceoBonusHistory: parsedData.ceoBonusHistory || [],
        personalReputation: parsedData.personalReputation || 0,
        activePropertyId: parsedData.activePropertyId || (parsedData.ownedProperties && parsedData.ownedProperties.length > 0 ? parsedData.ownedProperties[0] : "prop_rental"),
        maritalStatus: parsedData.maritalStatus || MaritalStatus.Single,
        datingProgress: parsedData.datingProgress || 0,
        partnerName: parsedData.partnerName || null,
        partnerGender: parsedData.partnerGender,
        partnerBirthDate: parsedData.partnerBirthDate ? new Date(parsedData.partnerBirthDate) : void 0,
        partnerJob: parsedData.partnerJob,
        partnerTraits: parsedData.partnerTraits,
        partnerLastCourseDate: parsedData.partnerLastCourseDate ? new Date(parsedData.partnerLastCourseDate) : void 0,
        partnerActiveTraining: parsedData.partnerActiveTraining ? { ...parsedData.partnerActiveTraining, startDate: new Date(parsedData.partnerActiveTraining.startDate), endDate: new Date(parsedData.partnerActiveTraining.endDate) } : void 0,
        partnerChildrenAgreementCount: parsedData.partnerChildrenAgreementCount || 0,
        partnerChildrenAgreementLimit: parsedData.partnerChildrenAgreementLimit || 3,
        relationshipStatus: parsedData.relationshipStatus || 0,
        relationshipStartDate: parsedData.relationshipStartDate ? new Date(parsedData.relationshipStartDate) : null,
        engagementDate: parsedData.engagementDate ? new Date(parsedData.engagementDate) : null,
        weddingDetails: parsedData.weddingDetails ? { ...parsedData.weddingDetails, date: new Date(parsedData.weddingDetails.date) } : null,
        weddingDate: parsedData.weddingDate ? new Date(parsedData.weddingDate) : null,
        prenupSigned: parsedData.prenupSigned,
        partnerPregnancy: parsedData.partnerPregnancy ? { dueDate: new Date(parsedData.partnerPregnancy.dueDate), isAdoption: parsedData.partnerPregnancy.isAdoption } : null,
        pendingConception: parsedData.pendingConception ? { conceptionDate: new Date(parsedData.pendingConception.conceptionDate) } : null,
        children: parsedData.children ? parsedData.children.map((c) => ({
          ...c,
          birthDate: new Date(c.birthDate),
          activeTraining: c.activeTraining ? { ...c.activeTraining, startDate: new Date(c.activeTraining.startDate), endDate: new Date(c.activeTraining.endDate) } : void 0
        })) : [],
        ownedProperties: parsedData.ownedProperties || [],
        rentedProperties: parsedData.rentedProperties || [],
        ownedLuxuryGoods: parsedData.ownedLuxuryGoods || [],
        completedCourses: parsedData.completedCourses || [],
        learnedGenreFocus: parsedData.learnedGenreFocus || {},
        lastSatisfactionCheckDate: parsedData.lastSatisfactionCheckDate ? new Date(parsedData.lastSatisfactionCheckDate) : null,
        lastWeeklyCostDate: parsedData.lastWeeklyCostDate ? new Date(parsedData.lastWeeklyCostDate) : null,
        lastNewspaperDate: parsedData.lastNewspaperDate ? new Date(parsedData.lastNewspaperDate) : null,
        lastCampaignYear: parsedData.lastCampaignYear,
        genreTrends: trends,
        interestRateModifier: parsedData.interestRateModifier || 0,
        marketTrend: parsedData.marketTrend || null,
        weeklyPosters: parsedData.weeklyPosters || generateWeeklyPosters(),
        lastSeminarDate: parsedData.lastSeminarDate ? new Date(parsedData.lastSeminarDate) : null,
        lastLeisureDate: parsedData.lastLeisureDate ? new Date(parsedData.lastLeisureDate) : null,
        lastCourseFinishDate: parsedData.lastCourseFinishDate ? new Date(parsedData.lastCourseFinishDate) : null,
        contractOffers: parsedData.contractOffers || generateContractOffers(void 0, parsedData.reputation),
        lastContractRefreshDate: parsedData.lastContractRefreshDate ? new Date(parsedData.lastContractRefreshDate) : new Date(sanitizedGameDate),
        movieAwardHistory: parsedData.movieAwardHistory || generateInitialMovieHistory(new Date(sanitizedGameDate).getFullYear()),
        customEvents: parsedData.customEvents || [],
        // Load custom events if present
        // Tutorial is globally disabled.
        tutorialStep: 999,
        tutorialActive: false,
        // Scratchpad Init
        scratchpadContent: parsedData.scratchpadContent || "",
        isScratchpadOpen: parsedData.isScratchpadOpen || false,
        scratchpadPosition: parsedData.scratchpadPosition || { x: 700, y: 300 }
      };
      return hydrated;
    };
    setHasInteracted(true);
    setPlayerData(hydratePlayerData(data));
    setGameState(GameState.MainScreen);
  }, [authUser, setPlayerData, t]);
  const handleStartGame = useCallback(async (data) => {
    let effectiveUsername = data.username.trim() || authUser?.username?.trim() || "";
    const mustRegister = pendingRegistration || !authUser;
    if (mustRegister) {
      if (!data.accountRegistration) {
        window.alert("Es sind Registrierungsdaten erforderlich.");
        return;
      }
      try {
        const registerResult = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email: data.accountRegistration.email,
            password: data.accountRegistration.password,
            username: data.accountRegistration.username,
            studioName: data.studioName
          })
        }, "");
        const token = String(registerResult.token || "");
        if (!token || !registerResult.user) {
          window.alert("Registrierung fehlgeschlagen: Ungueltige Serverantwort.");
          return;
        }
        setStoredAuthToken(token);
        setAuthToken(token);
        setAuthUser(registerResult.user);
        effectiveUsername = String(registerResult.user.username || effectiveUsername).trim();
        setPendingRegistration(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Registrierung fehlgeschlagen";
        window.alert(`Registrierung fehlgeschlagen: ${message}`);
        return;
      }
    }
    if (!effectiveUsername) {
      window.alert("Kein gueltiger Nutzername gefunden. Bitte erneut einloggen.");
      return;
    }
    let gameStartDate = calculateCurrentRealtimeGameDate();
    try {
      const serverTime = await apiRequest("/server-time", { method: "GET" }, "");
      const serverIngameDateIso = String(serverTime?.ingameDateIso || "").trim();
      if (serverIngameDateIso) {
        const parsedServerDate = new Date(serverIngameDateIso);
        if (!Number.isNaN(parsedServerDate.getTime())) {
          gameStartDate = parsedServerDate;
        }
      }
    } catch {
    }
    const nextEventDate = new Date(gameStartDate);
    const isTestMode = data.studioName === "Teststudio";
    if (isTestMode) {
      nextEventDate.setDate(nextEventDate.getDate() + 3);
    } else {
      nextEventDate.setDate(nextEventDate.getDate() + 15);
    }
    let allDirectors = generateInitialDirectors();
    let allActors = generateInitialActors();
    let initialMovieHistory = generateInitialMovieHistory(gameStartDate.getFullYear());
    let competitors = generateInitialCompetitors(gameStartDate, allDirectors, allActors);
    let customEvents = [];
    if (activeDataPackage !== "Original") {
      const selectedPackage = customPackages.find((p) => p.id === activeDataPackage);
      if (selectedPackage) {
        if (selectedPackage.directors) {
          const customIds = new Set(selectedPackage.directors.map((d) => d.id));
          allDirectors = allDirectors.filter((d) => !customIds.has(d.id));
          allDirectors = [...allDirectors, ...selectedPackage.directors];
        }
        if (selectedPackage.actors) {
          const customIds = new Set(selectedPackage.actors.map((a) => a.id));
          allActors = allActors.filter((a) => !customIds.has(a.id));
          allActors = [...allActors, ...selectedPackage.actors];
        }
        if (selectedPackage.competitors) {
          competitors = competitors.map((comp) => {
            const rename = selectedPackage.competitors.find((c) => c.id === comp.id);
            return rename ? { ...comp, name: rename.name } : comp;
          });
        }
        if (selectedPackage.awardHistory && selectedPackage.awardHistory.length > 0) {
          initialMovieHistory = selectedPackage.awardHistory;
        }
        if (selectedPackage.customEvents) {
          customEvents = selectedPackage.customEvents;
        }
      }
    }
    const allEmployees = generateInitialEmployees();
    let initialBuildings = Object.values(BuildingType).map((type) => {
      if (type === BuildingType.Burogebaude || type === BuildingType.Studio || type === BuildingType.Studio1 || type === BuildingType.ResearchLab) {
        return { type, level: 1 };
      }
      return { type, level: 0 };
    });
    let initialEmployees = [];
    let initialHiredIds = [];
    const initialGenreTrends = generateInitialGenreTrends();
    const initialWeeklyPosters = generateWeeklyPosters();
    const initialContracts = generateContractOffers(void 0, Math.round(1 + data.charisma / 20));
    const initialStocks = structuredClone(INITIAL_STOCKS).map((stock) => ({
      ...stock,
      history: generateFakeStockHistory(stock.price, stock.volatility)
    }));
    const rawSalary = 1500 + Math.random() * 1e3;
    const initialSalary = clampCeoSalary(Math.ceil(rawSalary / 100) * 100);
    const formatCurrency = (val) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);
    const salutationTemplate = data.gender === "m\xE4nnlich" ? t.office.messages.salutationMale : t.office.messages.salutationFemale;
    const salutation = salutationTemplate.replace("{lastName}", effectiveUsername);
    const welcomeMessage = {
      id: `msg_welcome_${Date.now()}`,
      date: gameStartDate,
      sender: t.office.messages.ceoBoardSender,
      subjectTemplate: {
        key: "office.messages.ceoWelcomeSubject",
        variables: { studioName: data.studioName }
      },
      bodyTemplate: {
        key: "office.messages.ceoWelcomeBody",
        variables: {
          salutation,
          name: effectiveUsername,
          studioName: data.studioName,
          salary: formatCurrency(initialSalary)
        }
      },
      read: false
    };
    const birthYear = gameStartDate.getFullYear() - 25;
    const playerBirthDate = new Date(birthYear, data.birthMonth, data.birthDay);
    const testPartnerGender = data.gender === "m\xE4nnlich" ? "weiblich" : "m\xE4nnlich";
    const testPartnerName = testPartnerGender === "weiblich" ? "Maria Mustermann" : "Markus Mustermann";
    const testPartnerBirthDate = new Date(1965, 5, 15);
    const testPartnerPortraitId = testPartnerGender === "weiblich" ? "w1" : "m1";
    const startingCapitalByDifficulty = {
      leicht: 25e5,
      normal: 1e6,
      schwer: 25e4
    };
    const newPlayerData = {
      playerName: effectiveUsername,
      studioName: data.studioName,
      gender: data.gender,
      playerBirthDate,
      playerPortraitId: data.playerPortraitId,
      gameDifficulty: "normal",
      capital: startingCapitalByDifficulty.normal,
      gameDate: gameStartDate,
      reputation: Math.round(1 + data.charisma / 20),
      currentProject: null,
      activeProjects: [],
      activePlanning: null,
      completedFilms: [],
      pendingInstallments: [],
      researchPoints: 0,
      unlockedTechnologies: ["unlock_marketing_1", "genre_action", "genre_drama", `res_market_analysis_1`],
      activeResearch: null,
      activeMarketingCampaign: null,
      activeProductionCampaign: null,
      activeProductionCampaigns: [],
      activeConstruction: null,
      activeConstructions: [],
      activeCourse: null,
      activeSeminar: null,
      activeCasting: null,
      activeCastings: [],
      // Init empty array
      activeCastingCampaign: null,
      activeCastingCampaigns: [],
      // Init empty array
      activeTalentScoutings: [],
      // Init empty array
      activeTalentScouting: null,
      buildings: initialBuildings,
      loans: [],
      portfolio: {},
      stocks: initialStocks,
      transactionLog: [],
      messages: [welcomeMessage],
      lastMonthlyReportDate: gameStartDate,
      monthlyHistory: [],
      nextEventDate,
      eventLog: [],
      competitors,
      // Used merged competitors
      directors: allDirectors,
      // Used merged and de-duplicated directors
      actors: allActors,
      // Used merged and de-duplicated actors
      talentChemie: [],
      genreSpezialisierungen: [],
      agencies: structuredClone(ALL_AGENCIES),
      activeMarketScout: null,
      availableScripts: [],
      scriptMarket: generateScriptMarket(1, initialGenreTrends, t),
      lastScriptMarketRefresh: gameStartDate,
      allEmployees,
      employees: initialEmployees,
      employeeMarket: generateEmployeeMarket(initialHiredIds, 1, allEmployees),
      lastEmployeeMarketRefresh: gameStartDate,
      activeWriting: null,
      savedProjectTemplates: [],
      negotiationSkill: data.negotiationSkill,
      charisma: data.charisma,
      financialSense: data.financialSense,
      filmSense: data.filmSense,
      organizationTalent: data.organizationTalent,
      energy: 100,
      privateCapital: 5e3,
      privatePortfolio: {},
      ceoSalary: initialSalary,
      lastCeoEvaluationYear: gameStartDate.getFullYear() - 1,
      ceoBonusHistory: [],
      personalReputation: 5,
      maritalStatus: isTestMode ? MaritalStatus.Married : MaritalStatus.Single,
      datingProgress: 0,
      partnerName: isTestMode ? testPartnerName : null,
      partnerGender: isTestMode ? testPartnerGender : void 0,
      partnerBirthDate: isTestMode ? testPartnerBirthDate : void 0,
      partnerJob: isTestMode ? "Architekt/in" : void 0,
      partnerSalary: isTestMode ? 4500 : void 0,
      partnerPortraitId: isTestMode ? testPartnerPortraitId : void 0,
      relationshipStatus: isTestMode ? 100 : 0,
      relationshipStartDate: isTestMode ? new Date(1985, 5, 15) : null,
      partnerSkills: isTestMode ? { acting: 50, directing: 50, writing: 50, scouting: 50, research: 50, marketing: 50, planning: 50 } : void 0,
      engagementDate: null,
      weddingDetails: null,
      partnerPregnancy: isTestMode ? { dueDate: new Date(gameStartDate.getFullYear(), gameStartDate.getMonth(), gameStartDate.getDate() + 1), isAdoption: false } : null,
      pendingConception: null,
      children: [],
      ownedProperties: [],
      rentedProperties: [],
      activePropertyId: "prop_rental",
      ownedLuxuryGoods: [],
      completedCourses: [],
      partnerChildrenAgreementCount: 0,
      partnerChildrenAgreementLimit: Math.floor(Math.random() * 3) + 2,
      learnedGenreFocus: {},
      lastSatisfactionCheckDate: null,
      lastWeeklyCostDate: void 0,
      lastNewspaperDate: void 0,
      lastCampaignYear: void 0,
      lastNotifiedKinoStartTitle: void 0,
      lastNotifiedPayTvAvailableTitle: void 0,
      lastNotifiedHomeEntertainmentEndTitle: void 0,
      lastNotifiedFreeTvAvailableTitle: void 0,
      genreTrends: initialGenreTrends,
      interestRateModifier: 0,
      marketTrend: null,
      weeklyPosters: initialWeeklyPosters,
      lastSeminarDate: void 0,
      lastLeisureDate: void 0,
      lastCourseFinishDate: void 0,
      weddingDate: isTestMode ? new Date(gameStartDate.getFullYear(), gameStartDate.getMonth(), gameStartDate.getDate() - 200) : null,
      prenupSigned: void 0,
      partnerTraits: void 0,
      partnerLastCourseDate: void 0,
      partnerActiveTraining: void 0,
      contractOffers: initialContracts,
      lastContractRefreshDate: gameStartDate,
      movieAwardHistory: initialMovieHistory,
      // Used merged history
      customEvents,
      // Inject custom events
      // Tutorial is globally disabled.
      tutorialStep: 999,
      tutorialActive: false,
      // Scratchpad Init
      scratchpadContent: "",
      isScratchpadOpen: false,
      scratchpadPosition: { x: 700, y: 300 }
    };
    setHasInteracted(true);
    setPlayerData(newPlayerData);
    try {
      const existingSaves = await loadSaveFiles();
      const withoutAuto = existingSaves.filter((save) => save.slotId !== 0);
      await persistSaveFiles([
        {
          slotId: 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          data: newPlayerData
        },
        ...withoutAuto
      ]);
    } catch (error) {
      console.warn("Initial autosave could not be written:", error);
    }
    setGameState(GameState.MainScreen);
  }, [setPlayerData, t, activeDataPackage, customPackages, pendingRegistration, authUser, apiRequest]);
  useEffect(() => {
    let cancelled = false;
    const canAutoBoot = gameState === GameState.MainMenu || gameState === GameState.MainScreen;
    if (!authUser || playerData || !canAutoBoot) {
      return;
    }
    const bootIntoGame = async () => {
      try {
        const serverTime = await apiRequest("/server-time", { method: "GET" }, "");
        if (cancelled) return;
        const serverResetAnchor = String(serverTime?.resetStartDateIso || "").trim();
        const seenResetAnchor = String(localStorage.getItem(LAST_SEEN_RESET_ANCHOR_KEY) || "").trim();
        if (serverResetAnchor && serverResetAnchor !== seenResetAnchor) {
          await persistSaveFiles([]);
          localStorage.removeItem(SAVE_KEY);
          clearStoredStudioId();
          localStorage.setItem(LAST_SEEN_RESET_ANCHOR_KEY, serverResetAnchor);
        }
        const saves = await loadSaveFiles();
        if (cancelled) return;
        const authUsername = String(authUser.username || "").trim().toLowerCase();
        const candidates = saves.filter((save) => {
          if (!save.data) return false;
          const savePlayerName = String(save.data?.playerName || "").trim().toLowerCase();
          return Boolean(savePlayerName) && savePlayerName === authUsername;
        });
        if (candidates.length > 0) {
          candidates.sort((a, b) => {
            const aTime = Date.parse(a.timestamp || "") || 0;
            const bTime = Date.parse(b.timestamp || "") || 0;
            return bTime - aTime;
          });
          handleConfirmLoad(candidates[0].data);
          return;
        }
        const studioName = String(authUser.studioName || "").trim() || `${authUser.username} Studios`;
        const preferredSkills = authUser.preferredSkills || null;
        const authProfileImageData = typeof authUser.profileImageData === "string" ? authUser.profileImageData.trim() : "";
        await handleStartGame({
          username: authUser.username,
          studioName,
          gender: "m\xE4nnlich",
          birthDay: 1,
          birthMonth: 0,
          playerPortraitId: authProfileImageData || "m1",
          negotiationSkill: clampSkillValue(preferredSkills?.negotiationSkill, 20),
          charisma: clampSkillValue(preferredSkills?.charisma, 20),
          financialSense: clampSkillValue(preferredSkills?.financialSense, 20),
          filmSense: clampSkillValue(preferredSkills?.filmSense, 20),
          organizationTalent: clampSkillValue(preferredSkills?.organizationTalent, 20)
        });
      } catch {
        if (!cancelled) {
          setGameState(GameState.NewGame);
        }
      }
    };
    void bootIntoGame();
    return () => {
      cancelled = true;
    };
  }, [authUser, playerData, gameState, handleConfirmLoad, handleStartGame]);
  useEffect(() => {
    if (authUser && playerData && gameState === GameState.MainMenu) {
      setGameState(GameState.MainScreen);
    }
  }, [authUser, playerData, gameState]);
  useEffect(() => {
    const authProfileImageData = typeof authUser?.profileImageData === "string" ? authUser.profileImageData.trim() : "";
    if (!authProfileImageData || !playerData) {
      return;
    }
    if (playerData.playerPortraitId === authProfileImageData) {
      return;
    }
    setPlayerData((prev) => {
      if (!prev) return prev;
      if (prev.playerPortraitId === authProfileImageData) return prev;
      return {
        ...prev,
        playerPortraitId: authProfileImageData
      };
    });
  }, [authUser, playerData, setPlayerData]);
  useEffect(() => {
    const unlockAudio = () => {
      setHasInteracted(true);
    };
    window.addEventListener("pointerdown", unlockAudio, { once: true, capture: true });
    window.addEventListener("keydown", unlockAudio, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, []);
  const tryStartBackgroundMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const effectiveVolume = isMuted ? 0 : masterVolume / 10 * (musicVolume / 10);
    audio.volume = effectiveVolume;
    if (!hasInteracted || effectiveVolume <= 0) {
      return;
    }
    audio.play().catch((error) => {
      console.warn("Hintergrundmusik konnte nicht automatisch gestartet werden:", error);
    });
  }, [hasInteracted, isMuted, masterVolume, musicVolume]);
  useEffect(() => {
    tryStartBackgroundMusic();
  }, [tryStartBackgroundMusic]);
  useEffect(() => {
    if (audioRef.current) {
      const effectiveVolume = isMuted ? 0 : masterVolume / 10 * (musicVolume / 10);
      audioRef.current.volume = effectiveVolume;
      if (hasInteracted && effectiveVolume > 0 && audioRef.current.paused) {
        void audioRef.current.play().catch(() => {
        });
      }
    }
  }, [musicVolume, masterVolume, isMuted, hasInteracted]);
  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (event.target.closest('button, a, input[type="checkbox"], input[type="radio"], select')) {
        playSfx("click");
      }
    };
    window.addEventListener("click", handleGlobalClick, true);
    return () => {
      window.removeEventListener("click", handleGlobalClick, true);
    };
  }, [playSfx]);
  useEffect(() => {
    const handleF12Reload = (event) => {
      if (!isF12ReloadEnabled) return;
      const target = event.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "F12") {
        event.preventDefault();
        window.location.reload();
      }
    };
    window.addEventListener("keydown", handleF12Reload);
    return () => window.removeEventListener("keydown", handleF12Reload);
  }, [isF12ReloadEnabled]);
  useEffect(() => {
    const handleSpace = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        if (gameState === GameState.MainScreen) {
          e.preventDefault();
          togglePauseSpeed();
        }
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [togglePauseSpeed, gameState]);
  const handleShowProjectProgress = useCallback(() => {
    if (playerData?.activeProjects && playerData.activeProjects.length > 0) {
      onNavigate(GameState.Projects);
      setTargetProjectsView("current_project");
    } else if (playerData?.currentProject?.phase === ProjectPhase.Completed) {
      onNavigate(GameState.CompletedProject);
    } else if (playerData?.activePlanning) {
      onNavigate(GameState.Projects);
      setTargetProjectsView("project");
    }
  }, [playerData, onNavigate]);
  const handleNavigateToMarketingTab = useCallback((tab, filmTitle, distTab) => {
    setTargetMarketingTab(tab);
    setTargetFilmTitle(filmTitle);
    setTargetMarketingDistributionTab(distTab);
    onNavigate(GameState.Marketing);
  }, [onNavigate]);
  const handleNavigateToFinanzenTab = useCallback((tab) => {
    setTargetFinanzenTab(tab);
    onNavigate(GameState.Finanzen);
  }, [onNavigate]);
  const handleNavigateToStudiogelaendeBuilding = useCallback((building) => {
    setTargetStudiogelaendeBuilding(building);
    onNavigate(GameState.Studiogelaende);
  }, [onNavigate]);
  const handleNavigateToProjectsView = useCallback((view, filmTitle) => {
    setTargetProjectsView(view);
    setTargetFilmTitle(filmTitle);
    onNavigate(GameState.Projects);
  }, [onNavigate]);
  const renderScreen = () => {
    const mainMenuScreen = /* @__PURE__ */ jsx(
      MainMenu,
      {
        onNewGame: handleNewGame,
        onLoadGame: handleLoadGame,
        onSettings: handleSettings,
        onEditor: handleEditor,
        onLogout: handleLogout,
        isAuthenticated: Boolean(authUser)
      }
    );
    if (authLoading) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-black text-white text-xl font-bold", children: "Account wird geladen..." });
    }
    if (!authUser && gameState !== GameState.NewGame) {
      return /* @__PURE__ */ jsx(AuthLoginScreen, { onLogin: handleLogin, onStartRegistration: handleStartRegistration });
    }
    switch (gameState) {
      case GameState.NewGame:
        return /* @__PURE__ */ jsx(NewGameScreen, { onStart: handleStartGame, onBack: handleBackToMenu, requiresAccountRegistration: pendingRegistration || !authUser, currentUsername: authUser?.username || "" });
      case GameState.LoadGame:
        return /* @__PURE__ */ jsx(LoadGameScreen, { onConfirmLoad: handleConfirmLoad, onBack: handleBackToMenu });
      case GameState.MainScreen:
        return playerData ? /* @__PURE__ */ jsx(MainScreen, { onNavigate, onShowProject: handleShowProjectProgress, gameSpeed, setGameSpeed: handleSetGameSpeed, systemPause, systemResume, onNavigateToOfficeTab: handleNavigateToOfficeTab, onNavigateToMarketingTab: handleNavigateToMarketingTab, onNavigateToFinanzenTab: handleNavigateToFinanzenTab, onNavigateToStudiogelaendeBuilding: handleNavigateToStudiogelaendeBuilding, onNavigateToProjectsView: handleNavigateToProjectsView }) : mainMenuScreen;
      case GameState.Projects:
        return playerData ? /* @__PURE__ */ jsx(NewProjectScreen_Phase1, { onBack: handleBackToMainScreen, gameSpeed, setGameSpeed, setGameState, initialView: targetProjectsView, initialFilmTitle: targetFilmTitle }) : mainMenuScreen;
      case GameState.CompletedProject:
        const projectToShow = playerData?.completedFilms.find((f) => f.workingTitle === targetFilmTitle) || playerData?.currentProject;
        if (!playerData) return mainMenuScreen;
        return projectToShow ? /* @__PURE__ */ jsx(
          CompletedProjectScreen,
          {
            project: projectToShow,
            onBack: handleBackToMainScreen,
            setGameState,
            onNavigateToMarketingTab: handleNavigateToMarketingTab
          }
        ) : /* @__PURE__ */ jsx(MainScreen, { onNavigate, onShowProject: handleShowProjectProgress, gameSpeed, setGameSpeed: handleSetGameSpeed, systemPause, systemResume, onNavigateToOfficeTab: handleNavigateToOfficeTab, onNavigateToMarketingTab: handleNavigateToMarketingTab, onNavigateToFinanzenTab: handleNavigateToFinanzenTab, onNavigateToStudiogelaendeBuilding: handleNavigateToStudiogelaendeBuilding, onNavigateToProjectsView: handleNavigateToProjectsView });
      case GameState.Office:
        return playerData ? /* @__PURE__ */ jsx(OfficeScreen, { onBack: handleBackToMainScreen, gameSpeed, setGameSpeed, initialTab: targetOfficeTab }) : mainMenuScreen;
      case GameState.Research:
        return playerData ? /* @__PURE__ */ jsx(ResearchScreen, { onBack: handleBackToMainScreen, gameSpeed, setGameSpeed }) : mainMenuScreen;
      case GameState.Studiogelaende:
        return playerData ? /* @__PURE__ */ jsx(StudiogelaendeScreen, { onBack: handleBackToMainScreen, gameSpeed, setGameSpeed, initialBuilding: targetStudiogelaendeBuilding }) : mainMenuScreen;
      case GameState.Finanzen:
        return playerData ? /* @__PURE__ */ jsx(FinanzenScreen, { onBack: handleBackToMainScreen, gameSpeed, setGameSpeed, initialTab: targetFinanzenTab }) : mainMenuScreen;
      case GameState.Marketing:
        return playerData ? /* @__PURE__ */ jsx(MarketingScreen, { onBack: handleBackToMainScreen, gameSpeed, setGameSpeed, initialTab: targetMarketingTab, initialFilmTitle: targetFilmTitle, initialDistributionTab: targetMarketingDistributionTab }) : mainMenuScreen;
      case GameState.Settings:
        return /* @__PURE__ */ jsx(SettingsScreen, { onBack: playerData ? handleBackToMainScreen : handleBackToMenu, onQuit: handleLogout, gameSpeed, setGameSpeed });
      case GameState.Privatleben:
        return playerData ? /* @__PURE__ */ jsx(PrivatlebenScreen, { onBack: handleBackToMainScreen, gameSpeed, setGameSpeed }) : mainMenuScreen;
      case GameState.Editor:
        return /* @__PURE__ */ jsx(EditorScreen, { onBack: handleBackToMenu });
      default:
        return mainMenuScreen;
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        width: `${BASE_WIDTH}px`,
        height: `${BASE_HEIGHT}px`,
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${scale.x}, ${scale.y})`,
        transformOrigin: "center center",
        overflow: "hidden"
      },
      className: "shadow-2xl bg-black",
      children: [
        /* @__PURE__ */ jsx("audio", { ref: audioRef, src: "https://www.schnoxcore.com/media/music/background.mp3", loop: true, preload: "auto" }),
        playerData && playerData.isScratchpadOpen && /* @__PURE__ */ jsx(Scratchpad, {}),
        /* @__PURE__ */ jsx(AppErrorBoundary, { children: /* @__PURE__ */ jsx(ScreenTransition, { childKey: gameState, children: renderScreen() }) })
      ]
    }
  ) });
};
const App = () => {
  return /* @__PURE__ */ jsx(GameProvider, { children: /* @__PURE__ */ jsx(AppContent, {}) });
};
var App_default = App;
export {
  App_default as default
};
