import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ... existing imports
// Include all necessary imports, especially PlayerData, GameState, etc. to avoid breaking the file structure
import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, BuildingType, ProjectPhase, GameSpeed, MaritalStatus, EmployeeType, Genre } from './types';
import MainMenu from './components/MainMenu';
import NewGameScreen from './components/NewGameScreen';
import MainScreen from './components/MainScreen';
import NewProjectScreen_Phase1 from './components/NewProjectScreen_Phase1';
import OfficeScreen from './components/OfficeScreen';
import ResearchScreen from './components/ResearchScreen';
import StudiogelaendeScreen from './components/StudiogelaendeScreen';
import FinanzenScreen from './components/FinanzenScreen';
import MarketingScreen from './components/MarketingScreen';
import ScreenTransition from './components/ScreenTransition';
import SettingsScreen from './components/SettingsScreen';
import LoadGameScreen from './components/LoadGameScreen';
import PrivatlebenScreen from './components/PrivatlebenScreen';
import { generateInitialCompetitors } from './components/competitorGenerator';
import { generateScriptMarket } from './components/scriptGenerator';
import { generateInitialEmployees, generateEmployeeMarket } from './components/employeeGenerator';
import { INITIAL_STOCKS } from './components/stocks';
import { ALL_AGENCIES } from './components/agencies';
import { GameProvider, useGame } from './contexts/GameContext';
import { generateInitialActors } from './components/actors';
import { generateInitialDirectors } from './components/directors';
import CompletedProjectScreen from './components/CompletedProjectScreen';
import { translations } from './translations';
import { ALL_MALE_PORTRAITS, ALL_FEMALE_PORTRAITS } from './components/portraits';
import { generateWeeklyPosters } from './components/coverConfig';
import { generateContractOffers } from './components/contractData';
import { generateInitialMovieHistory } from './components/festivalData';
import EditorScreen from './components/EditorScreen';
import TutorialOverlay from './components/TutorialOverlay';
import Scratchpad from './components/Scratchpad';
import { clampCeoSalary } from './hooks/helpers';
import { useDateLoop } from './hooks/useDateLoop';
import AuthLoginScreen from './components/AuthLoginScreen';
// Helper function to generate initial genre trends
const generateInitialGenreTrends = () => {
    const trends = {};
    Object.values(Genre).forEach((genre) => {
        // Start popularity between 0.80 and 1.20 to avoid extreme penalties at start
        const popularity = parseFloat((0.8 + Math.random() * 0.4).toFixed(2));
        // Slight momentum between -0.02 and +0.02
        const momentum = parseFloat(((Math.random() * 0.04) - 0.02).toFixed(2));
        trends[genre] = {
            popularity,
            momentum,
            peakDuration: 0,
        };
    });
    return trends;
};
// Helper function to generate fake history for stocks at game start
const generateFakeStockHistory = (currentPrice, volatility) => {
    const history = [currentPrice];
    let simPrice = currentPrice;
    // Generate 52 weeks of history backwards (1 Year)
    for (let i = 0; i < 51; i++) {
        // Reverse calculation: present = prev * (1 + change)
        // To guess previous, we just apply a random change in reverse
        const change = (Math.random() - 0.5) * volatility * 4; // Slightly higher volatility for history
        simPrice = simPrice / (1 + change);
        history.unshift(simPrice);
    }
    return history;
};
const REALTIME_GAME_START_REAL = new Date(2026, 7, 1, 0, 0, 0, 0);
const REALTIME_GAME_START_INGAME = new Date(2026, 7, 1, 0, 0, 0, 0);
const MS_PER_REAL_DAY = 24 * 60 * 60 * 1000;
const AUTH_TOKEN_KEY = 'mb_auth_token';
const API_BASE = 'http://localhost:8787';
const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};
const calculateCurrentRealtimeGameDate = (referenceDate = new Date()) => {
    const elapsedRealMs = Math.max(0, referenceDate.getTime() - REALTIME_GAME_START_REAL.getTime());
    const elapsedRealDays = elapsedRealMs / MS_PER_REAL_DAY;
    const fullMonthsElapsed = Math.floor(elapsedRealDays);
    const monthFraction = elapsedRealDays - fullMonthsElapsed;
    const current = new Date(REALTIME_GAME_START_INGAME);
    current.setMonth(current.getMonth() + fullMonthsElapsed);
    const daysInCurrentMonth = getDaysInMonth(current);
    const dayOffsetFloat = monthFraction * daysInCurrentMonth;
    current.setTime(current.getTime() + dayOffsetFloat * MS_PER_REAL_DAY);
    return current;
};
const AppContent = () => {
    const { playerData, setPlayerData, masterVolume, musicVolume, isMuted, playSfx, isRightClickToMainScreenEnabled, jumpToNewsOnMessage, pauseOnMessage, isF12ReloadEnabled, language, scalingMode, activeDataPackage, customPackages } = useGame();
    useDateLoop({ setPlayerData });
    const [gameState, setGameState] = useState(GameState.MainMenu);
    const [gameSpeed, setGameSpeed] = useState(GameSpeed.NORMAL);
    const [lastActiveSpeed, setLastActiveSpeed] = useState(GameSpeed.NORMAL);
    const [isSystemPaused, setIsSystemPaused] = useState(false);
    const [targetOfficeTab, setTargetOfficeTab] = useState('nachrichten');
    const [targetMarketingTab, setTargetMarketingTab] = useState('my_films');
    const [targetMarketingDistributionTab, setTargetMarketingDistributionTab] = useState();
    const [targetFinanzenTab, setTargetFinanzenTab] = useState('take_loan');
    const [targetStudiogelaendeBuilding, setTargetStudiogelaendeBuilding] = useState(BuildingType.Autorenbuero);
    const [targetProjectsView, setTargetProjectsView] = useState('project');
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [targetFilmTitle, setTargetFilmTitle] = useState();
    const [scale, setScale] = useState({ x: 1, y: 1 });
    const audioRef = useRef(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || '');
    const [authUser, setAuthUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [pendingRegistration, setPendingRegistration] = useState(false);
    // Access translations for logic outside components
    const t = translations[language];
    // ÄNDERUNG: Basis-Auflösung auf 2560x1440 (WQHD) erhöht.
    const BASE_WIDTH = 1920;
    const BASE_HEIGHT = 1080;
    const apiRequest = useCallback(async (path, init = {}, tokenOverride) => {
        const token = tokenOverride !== undefined ? tokenOverride : authToken;
        const headers = {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const errorMessage = typeof data?.error === 'string' ? data.error : `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }
        return data;
    }, [authToken]);
    const refreshAuthUser = useCallback(async (tokenToUse) => {
        const token = tokenToUse !== undefined ? tokenToUse : authToken;
        if (!token) {
            setAuthUser(null);
            setAuthLoading(false);
            return;
        }
        try {
            const result = await apiRequest('/auth/me', { method: 'GET' }, token);
            setAuthUser(result.user || null);
        }
        catch {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setAuthToken('');
            setAuthUser(null);
        }
        finally {
            setAuthLoading(false);
        }
    }, [apiRequest, authToken]);
    useEffect(() => {
        void refreshAuthUser();
    }, [refreshAuthUser]);
    const handleLogin = useCallback(async ({ email, password }) => {
        try {
            const result = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }, '');
            const token = String(result.token || '');
            if (!token || !result.user) {
                return { ok: false, error: 'Ungueltige Serverantwort' };
            }
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            setAuthToken(token);
            setAuthUser(result.user);
            setPendingRegistration(false);
            setGameState(GameState.MainMenu);
            return { ok: true };
        }
        catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : 'Login fehlgeschlagen' };
        }
    }, [apiRequest]);
    const handleLogout = useCallback(async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        }
        catch {
            // ignore logout errors
        }
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken('');
        setAuthUser(null);
        setPendingRegistration(false);
        setPlayerData(null);
        setGameState(GameState.MainMenu);
    }, [apiRequest, setPlayerData]);
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // FIX: Use 0.99 factor to prevent sub-pixel overflow triggering scrollbars
            const safeFactor = 0.99;
            if (scalingMode === 'stretch') {
                setScale({ x: (w / BASE_WIDTH) * safeFactor, y: (h / BASE_HEIGHT) * safeFactor });
            }
            else {
                const s = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT) * safeFactor;
                setScale({ x: s, y: s });
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial calculation
        return () => window.removeEventListener('resize', handleResize);
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
        setGameSpeed(currentSpeed => {
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
    // Toggle between paused and the previous active speed.  This ignores
    // the isSystemPaused flag so it works even if the player manually
    // paused via the UI.
    const togglePauseSpeed = useCallback(() => {
        if (gameSpeed === GameSpeed.PAUSED) {
            // resume; fall back to NORMAL if lastActiveSpeed somehow is also PAUSED
            const resumeSpeed = lastActiveSpeed === GameSpeed.PAUSED ? GameSpeed.NORMAL : lastActiveSpeed;
            setGameSpeed(resumeSpeed);
            setIsSystemPaused(false);
        }
        else {
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
    const prevMessagesCountRef = useRef(undefined);
    const gameJustLoadedRef = useRef(true);
    useEffect(() => {
        if (!playerData) {
            gameJustLoadedRef.current = true;
            prevMessagesCountRef.current = undefined;
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
                handleNavigateToOfficeTab('nachrichten');
            }
            else if (pauseOnMessage) {
                if (!isSystemPaused) {
                    systemPause();
                }
            }
            else { // pauseOnMessage is false
                if (isSystemPaused) {
                    systemResume();
                }
            }
        }
        prevMessagesCountRef.current = currentCount;
    }, [playerData, jumpToNewsOnMessage, pauseOnMessage, handleNavigateToOfficeTab, isSystemPaused, systemPause, systemResume]);
    useEffect(() => {
        const handleRightClick = (event) => {
            // Only active when in a game and the setting is enabled.
            if (playerData && isRightClickToMainScreenEnabled) {
                event.preventDefault();
                // Don't do anything if we are already on the MainScreen
                if (gameState !== GameState.MainScreen) {
                    handleBackToMainScreen();
                }
            }
        };
        window.addEventListener('contextmenu', handleRightClick);
        return () => {
            window.removeEventListener('contextmenu', handleRightClick);
        };
    }, [playerData, isRightClickToMainScreenEnabled, handleBackToMainScreen, gameState]);
    const handleConfirmLoad = useCallback((data) => {
        const hydratePlayerData = (parsedData) => {
            // ... (existing hydration logic remains unchanged) ...
            const trends = parsedData.genreTrends || generateInitialGenreTrends();
            const gameStartDate = new Date(REALTIME_GAME_START_INGAME);
            let playerBirthDate = parsedData.playerBirthDate ? new Date(parsedData.playerBirthDate) : undefined;
            if (!playerBirthDate) {
                playerBirthDate = new Date(1965, 0, 1);
            }
            let playerPortraitId = parsedData.playerPortraitId;
            if (!playerPortraitId) {
                const gender = parsedData.gender || 'männlich';
                const pool = gender === 'männlich' ? ALL_MALE_PORTRAITS : ALL_FEMALE_PORTRAITS;
                playerPortraitId = pool[Math.floor(Math.random() * pool.length)];
            }
            const hydrateProject = (proj) => {
                if (!proj)
                    return null;
                // Helper to hydrate Deal Dates
                const hydrateDeal = (deal) => {
                    if (!deal)
                        return undefined;
                    return {
                        ...deal,
                        startDate: new Date(deal.startDate),
                        signedDate: deal.signedDate ? new Date(deal.signedDate) : new Date(deal.startDate),
                        endDate: new Date(deal.endDate),
                        homeEntertainmentStartDate: deal.homeEntertainmentStartDate ? new Date(deal.homeEntertainmentStartDate) : undefined,
                        payTvStartDate: deal.payTvStartDate ? new Date(deal.payTvStartDate) : undefined,
                        freeTvStartDate: deal.freeTvStartDate ? new Date(deal.freeTvStartDate) : undefined,
                        nextPhaseStartDate: deal.nextPhaseStartDate ? new Date(deal.nextPhaseStartDate) : undefined,
                    };
                };
                return {
                    ...proj,
                    scriptStartDate: new Date(proj.scriptStartDate),
                    scriptEndDate: new Date(proj.scriptEndDate),
                    castingStartDate: proj.castingStartDate ? new Date(proj.castingStartDate) : undefined,
                    castingEndDate: proj.castingEndDate ? new Date(proj.castingEndDate) : undefined,
                    productionStartDate: proj.productionStartDate ? new Date(proj.productionStartDate) : undefined,
                    productionEndDate: proj.productionEndDate ? new Date(proj.productionEndDate) : undefined,
                    postProductionStartDate: proj.postProductionStartDate ? new Date(proj.postProductionStartDate) : undefined,
                    postProductionEndDate: proj.postProductionEndDate ? new Date(proj.postProductionEndDate) : undefined,
                    isArchived: proj.isArchived || false,
                    hype: proj.hype || 0,
                    saleDetails: proj.saleDetails ? { ...proj.saleDetails, saleDate: new Date(proj.saleDetails.saleDate) } : undefined,
                    nextOfferDate: proj.nextOfferDate ? new Date(proj.nextOfferDate) : undefined,
                    studioId: proj.studioId || (proj.phase >= ProjectPhase.Production ? 'studio1' : undefined),
                    activeDeal: hydrateDeal(proj.activeDeal), // Hydrate Active Deal
                    // Ensure sub-objects are hydrated (simple copy for now as Date parsing is top-level concern here)
                    cinemaRelease: proj.cinemaRelease ? { ...proj.cinemaRelease, releaseDate: new Date(proj.cinemaRelease.releaseDate), endDate: proj.cinemaRelease.endDate ? new Date(proj.cinemaRelease.endDate) : undefined } : undefined
                };
            };
            // Migrate currentProject to activeProjects
            let activeProjects = [];
            if (parsedData.activeProjects) {
                activeProjects = parsedData.activeProjects.map(hydrateProject).filter((p) => p !== null);
            }
            else if (parsedData.currentProject) {
                const migratedProject = hydrateProject(parsedData.currentProject);
                if (migratedProject && migratedProject.phase >= ProjectPhase.Casting) {
                    activeProjects.push(migratedProject);
                }
            }
            let hydratedPortfolio = {};
            if (parsedData.portfolio && typeof Object.values(parsedData.portfolio)[0] === 'number') {
                const tempPortfolio = {};
                hydratedPortfolio = tempPortfolio;
            }
            else {
                hydratedPortfolio = parsedData.portfolio || {};
            }
            const hydrateEmployee = (emp) => {
                let lastTrainingDate = emp.lastTrainingDate ? new Date(emp.lastTrainingDate) : undefined;
                if (!lastTrainingDate && emp.lastTrainingYear) {
                    lastTrainingDate = new Date(emp.lastTrainingYear, 0, 1);
                }
                let activeTraining = emp.activeTraining ? {
                    endDate: new Date(emp.activeTraining.endDate),
                    startDate: emp.activeTraining.startDate ? new Date(emp.activeTraining.startDate) : new Date(parsedData.gameDate)
                } : undefined;
                return {
                    ...emp,
                    satisfaction: emp.satisfaction ?? 80,
                    activeTraining,
                    lastTrainingDate,
                    lastPraised: emp.lastPraised ? new Date(emp.lastPraised) : undefined,
                };
            };
            let employees = parsedData.employees || [];
            if (parsedData.writers && !parsedData.employees) {
                employees = parsedData.writers.map((writer) => ({
                    ...writer,
                    type: EmployeeType.Autor,
                }));
            }
            employees = employees.map(hydrateEmployee);
            const allEmployees = parsedData.allEmployees || generateInitialEmployees();
            const employeeMarket = (parsedData.employeeMarket || generateEmployeeMarket(employees.map(e => e.id), parsedData.reputation, allEmployees)).map(hydrateEmployee);
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
            const hydrateTalent = (t, isDirector) => t ? {
                ...t,
                birthDate: sanitizeTalentBirthDate(t.birthDate, new Date(parsedData.gameDate), isDirector),
                skill: Math.min(100, t.skill),
                potential: Math.min(100, t.potential || 100),
                bekanntheit: t.bekanntheit ?? 5,
                lastPraised: t.lastPraised ? new Date(t.lastPraised) : undefined,
                lastBonusPaid: t.lastBonusPaid ? new Date(t.lastBonusPaid) : undefined,
                contract: t.contract ? { ...t.contract, expiryDate: new Date(t.contract.expiryDate) } : undefined,
                activeTraining: t.activeTraining ? { ...t.activeTraining, endDate: new Date(t.activeTraining.endDate) } : undefined,
                awards: t.awards || [],
                isFavorite: t.isFavorite || false,
                exclusiveContractCooldownUntil: t.exclusiveContractCooldownUntil ? new Date(t.exclusiveContractCooldownUntil) : undefined,
                unavailableForProjectsUntil: t.unavailableForProjectsUntil ? new Date(t.unavailableForProjectsUntil) : undefined,
            } : t;
            const hydratedDirectors = (parsedData.directors || []).map((director) => hydrateTalent(director, true));
            const hydratedActors = (parsedData.actors || []).map((actor) => hydrateTalent(actor, false));
            const activeConstruction = parsedData.activeConstruction ? { ...parsedData.activeConstruction, endDate: new Date(parsedData.activeConstruction.endDate) } : null;
            let activeConstructions = parsedData.activeConstructions ? parsedData.activeConstructions.map((c) => ({ ...c, endDate: new Date(c.endDate) })) : [];
            if (activeConstruction && activeConstructions.length === 0) {
                activeConstructions = [activeConstruction];
            }
            // Migration Fix for CEO Evaluation Year
            let lastCeoEvaluationYear = parsedData.lastCeoEvaluationYear || 1989; // Default to 1989 for new structure
            if (parsedData.lastCeoEvaluationYear === 1990 && new Date(parsedData.gameDate).getFullYear() < 1991) {
                // Fix legacy savegames where 1990 was default but 1991 hasn't been reached yet
                lastCeoEvaluationYear = 1989;
            }
            // Hydrate Active Seminar
            const activeSeminar = parsedData.activeSeminar ? { ...parsedData.activeSeminar, startDate: new Date(parsedData.activeSeminar.startDate), endDate: new Date(parsedData.activeSeminar.endDate) } : null;
            const hydrated = {
                ...parsedData,
                gender: parsedData.gender || 'männlich',
                playerBirthDate,
                playerPortraitId,
                gameDifficulty: parsedData.gameDifficulty || 'normal',
                gameDate: new Date(parsedData.gameDate),
                lastMonthlyReportDate: parsedData.lastMonthlyReportDate ? new Date(parsedData.lastMonthlyReportDate) : null,
                nextEventDate: parsedData.nextEventDate ? new Date(parsedData.nextEventDate) : undefined,
                eventLog: parsedData.eventLog ? parsedData.eventLog.map((e) => ({ ...e, date: new Date(e.date) })) : [],
                transactionLog: parsedData.transactionLog.map((t) => ({ ...t, date: new Date(t.date) })),
                messages: parsedData.messages ? parsedData.messages.map((m) => ({
                    ...m,
                    date: new Date(m.date),
                    readDate: m.readDate ? new Date(m.readDate) : null,
                })) : [],
                activeResearch: parsedData.activeResearch ? { ...parsedData.activeResearch, startDate: new Date(parsedData.activeResearch.startDate), endDate: new Date(parsedData.activeResearch.endDate) } : null,
                activeMarketingCampaign: parsedData.activeMarketingCampaign ? { ...parsedData.activeMarketingCampaign, startDate: new Date(parsedData.activeMarketingCampaign.startDate), endDate: new Date(parsedData.activeMarketingCampaign.endDate) } : null,
                activeProductionCampaigns: parsedData.activeProductionCampaigns
                    ? parsedData.activeProductionCampaigns.map((c) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate) }))
                    : (parsedData.activeProductionCampaign ? [{ ...parsedData.activeProductionCampaign, startDate: new Date(parsedData.activeProductionCampaign.startDate), endDate: new Date(parsedData.activeProductionCampaign.endDate) }] : []),
                activeProductionCampaign: null,
                activeConstruction: activeConstruction,
                activeConstructions: activeConstructions,
                activeCourse: parsedData.activeCourse ? { ...parsedData.activeCourse, endDate: new Date(parsedData.activeCourse.endDate) } : null,
                activeSeminar: activeSeminar,
                // New Array Fields Migration
                activeCastings: parsedData.activeCastings ? parsedData.activeCastings.map((c) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate) })) : (parsedData.activeCasting ? [{ ...parsedData.activeCasting, endDate: new Date(parsedData.activeCasting.endDate), startDate: parsedData.activeCasting.startDate ? new Date(parsedData.activeCasting.startDate) : undefined }] : []),
                activeCasting: null, // Legacy field nulled
                activeCastingCampaigns: parsedData.activeCastingCampaigns ? parsedData.activeCastingCampaigns.map((c) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate) })) : (parsedData.activeCastingCampaign ? [{ ...parsedData.activeCastingCampaign, startDate: new Date(parsedData.activeCastingCampaign.startDate), endDate: new Date(parsedData.activeCastingCampaign.endDate) }] : []),
                activeCastingCampaign: null, // Legacy field nulled
                activeTalentScoutings: parsedData.activeTalentScoutings ? parsedData.activeTalentScoutings.map((s) => ({ ...s, endDate: new Date(s.endDate) })) : (parsedData.activeTalentScouting ? [{ ...parsedData.activeTalentScouting, endDate: new Date(parsedData.activeTalentScouting.endDate) }] : []),
                activeTalentScouting: null, // Legacy field nulled
                portfolio: hydratedPortfolio,
                stocks: parsedData.stocks ? parsedData.stocks.map((s) => ({ ...s, history: s.history || [s.price] })) : structuredClone(INITIAL_STOCKS),
                loans: parsedData.loans.map((l) => {
                    const dateTaken = new Date(l.dateTaken);
                    return { ...l, dateTaken };
                }),
                currentProject: hydrateProject(parsedData.currentProject),
                activeProjects: activeProjects,
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
                employees: employees,
                employeeMarket: employeeMarket,
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
                lastCeoEvaluationYear: lastCeoEvaluationYear,
                ceoBonusHistory: parsedData.ceoBonusHistory || [],
                personalReputation: parsedData.personalReputation || 0,
                activePropertyId: parsedData.activePropertyId || (parsedData.ownedProperties && parsedData.ownedProperties.length > 0 ? parsedData.ownedProperties[0] : 'prop_rental'),
                maritalStatus: parsedData.maritalStatus || MaritalStatus.Single,
                datingProgress: parsedData.datingProgress || 0,
                partnerName: parsedData.partnerName || null,
                partnerGender: parsedData.partnerGender,
                partnerBirthDate: parsedData.partnerBirthDate ? new Date(parsedData.partnerBirthDate) : undefined,
                partnerJob: parsedData.partnerJob,
                partnerTraits: parsedData.partnerTraits,
                partnerLastCourseDate: parsedData.partnerLastCourseDate ? new Date(parsedData.partnerLastCourseDate) : undefined,
                partnerActiveTraining: parsedData.partnerActiveTraining ? { ...parsedData.partnerActiveTraining, startDate: new Date(parsedData.partnerActiveTraining.startDate), endDate: new Date(parsedData.partnerActiveTraining.endDate) } : undefined,
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
                    activeTraining: c.activeTraining ? { ...c.activeTraining, startDate: new Date(c.activeTraining.startDate), endDate: new Date(c.activeTraining.endDate) } : undefined
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
                contractOffers: parsedData.contractOffers || generateContractOffers(undefined, parsedData.reputation),
                lastContractRefreshDate: parsedData.lastContractRefreshDate ? new Date(parsedData.lastContractRefreshDate) : new Date(parsedData.gameDate),
                movieAwardHistory: parsedData.movieAwardHistory || generateInitialMovieHistory(new Date(parsedData.gameDate).getFullYear()),
                customEvents: parsedData.customEvents || [], // Load custom events if present
                // Tutorial Init (Default to completed if not present in save for now, or reset if desired)
                // If loading old save, set tutorialActive to false or check progress logic
                tutorialStep: parsedData.tutorialStep ?? 999, // Assume finished for old saves
                tutorialActive: parsedData.tutorialActive ?? false,
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
    }, [setPlayerData, t]);
    const handleStartGame = useCallback(async (data) => {
        const mustRegister = pendingRegistration || !authUser;
        if (mustRegister) {
            if (!data.accountRegistration) {
                window.alert('Es sind Registrierungsdaten erforderlich.');
                return;
            }
            try {
                const registerResult = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: data.accountRegistration.email,
                        password: data.accountRegistration.password,
                        username: data.accountRegistration.username,
                        studioName: data.studioName,
                    }),
                }, '');
                const token = String(registerResult.token || '');
                if (!token || !registerResult.user) {
                    window.alert('Registrierung fehlgeschlagen: Ungueltige Serverantwort.');
                    return;
                }
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                setAuthToken(token);
                setAuthUser(registerResult.user);
                setPendingRegistration(false);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen';
                window.alert(`Registrierung fehlgeschlagen: ${message}`);
                return;
            }
        }
        // ... (rest of start game logic remains unchanged)
        // No changes needed here as default deal data is created at runtime
        const gameStartDate = calculateCurrentRealtimeGameDate();
        const nextEventDate = new Date(gameStartDate);
        // Check for Test Mode to trigger early event
        const isTestMode = data.firstName === 'Max' && data.lastName === 'Mustermann' && data.studioName === 'Teststudio';
        if (isTestMode) {
            nextEventDate.setDate(nextEventDate.getDate() + 3);
        }
        else {
            nextEventDate.setDate(nextEventDate.getDate() + 15);
        }
        // 1. Generate Standard Data
        let allDirectors = generateInitialDirectors();
        let allActors = generateInitialActors();
        let initialMovieHistory = generateInitialMovieHistory(gameStartDate.getFullYear());
        let competitors = generateInitialCompetitors(gameStartDate, allDirectors, allActors);
        let customEvents = [];
        // 2. Load Custom Data Package if selected
        if (activeDataPackage !== 'Original') {
            const selectedPackage = customPackages.find(p => p.id === activeDataPackage);
            if (selectedPackage) {
                // Merge Talents - REPLACE existing ones if ID matches
                if (selectedPackage.directors) {
                    const customIds = new Set(selectedPackage.directors.map(d => d.id));
                    // Remove base directors that are being overwritten
                    allDirectors = allDirectors.filter(d => !customIds.has(d.id));
                    // Add custom directors
                    allDirectors = [...allDirectors, ...selectedPackage.directors];
                }
                if (selectedPackage.actors) {
                    const customIds = new Set(selectedPackage.actors.map(a => a.id));
                    // Remove base actors that are being overwritten
                    allActors = allActors.filter(a => !customIds.has(a.id));
                    // Add custom actors
                    allActors = [...allActors, ...selectedPackage.actors];
                }
                // Rename Competitors
                if (selectedPackage.competitors) {
                    competitors = competitors.map(comp => {
                        const rename = selectedPackage.competitors.find(c => c.id === comp.id);
                        return rename ? { ...comp, name: rename.name } : comp;
                    });
                }
                // Replace History
                if (selectedPackage.awardHistory && selectedPackage.awardHistory.length > 0) {
                    initialMovieHistory = selectedPackage.awardHistory;
                }
                // Inject Events
                if (selectedPackage.customEvents) {
                    customEvents = selectedPackage.customEvents;
                }
            }
        }
        const allEmployees = generateInitialEmployees();
        // --- Start Buildings Setup ---
        let initialBuildings = Object.values(BuildingType).map(type => {
            if (type === BuildingType.Burogebaude || type === BuildingType.Studio || type === BuildingType.Studio1 || type === BuildingType.ResearchLab) {
                return { type, level: 1 };
            }
            return { type, level: 0 };
        });
        let initialEmployees = [];
        let initialHiredIds = [];
        const initialGenreTrends = generateInitialGenreTrends();
        const initialWeeklyPosters = generateWeeklyPosters();
        const initialContracts = generateContractOffers(undefined, Math.round(1 + (data.charisma / 20)));
        // Initialize Stocks with Fake History
        const initialStocks = structuredClone(INITIAL_STOCKS).map((stock) => ({
            ...stock,
            history: generateFakeStockHistory(stock.price, stock.volatility)
        }));
        // CEO Salary Initialization
        const rawSalary = 1500 + Math.random() * 1000;
        const initialSalary = clampCeoSalary(Math.ceil(rawSalary / 100) * 100);
        const formatCurrency = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
        // Initial Welcome Message
        const salutationTemplate = data.gender === 'männlich' ? t.office.messages.salutationMale : t.office.messages.salutationFemale;
        const salutation = salutationTemplate.replace('{lastName}', data.lastName);
        const welcomeMessage = {
            id: `msg_welcome_${Date.now()}`,
            date: gameStartDate,
            sender: t.office.messages.ceoBoardSender,
            subjectTemplate: {
                key: 'office.messages.ceoWelcomeSubject',
                variables: { studioName: data.studioName }
            },
            bodyTemplate: {
                key: 'office.messages.ceoWelcomeBody',
                variables: {
                    salutation: salutation,
                    name: `${data.firstName} ${data.lastName}`,
                    studioName: data.studioName,
                    salary: formatCurrency(initialSalary)
                }
            },
            read: false
        };
        const birthYear = gameStartDate.getFullYear() - 25;
        const playerBirthDate = new Date(birthYear, data.birthMonth, data.birthDay);
        const testPartnerGender = data.gender === 'männlich' ? 'weiblich' : 'männlich';
        const testPartnerName = testPartnerGender === 'weiblich' ? 'Maria Mustermann' : 'Markus Mustermann';
        const testPartnerBirthDate = new Date(1965, 5, 15);
        const testPartnerPortraitId = testPartnerGender === 'weiblich' ? 'w1' : 'm1';
        const startingCapitalByDifficulty = {
            leicht: 2500000,
            normal: 1000000,
            schwer: 250000,
        };
        setHasInteracted(true);
        setPlayerData({
            playerName: `${data.firstName} ${data.lastName}`,
            studioName: data.studioName,
            gender: data.gender,
            playerBirthDate,
            playerPortraitId: data.playerPortraitId,
            gameDifficulty: data.difficulty,
            capital: startingCapitalByDifficulty[data.difficulty],
            gameDate: gameStartDate,
            reputation: Math.round(1 + (data.charisma / 20)),
            currentProject: null,
            activeProjects: [],
            activePlanning: null,
            completedFilms: [],
            pendingInstallments: [],
            researchPoints: 0,
            unlockedTechnologies: ['unlock_marketing_1', 'genre_action', 'genre_drama', `res_market_analysis_1`],
            activeResearch: null,
            activeMarketingCampaign: null,
            activeProductionCampaign: null,
            activeProductionCampaigns: [],
            activeConstruction: null,
            activeConstructions: [],
            activeCourse: null,
            activeSeminar: null,
            activeCasting: null,
            activeCastings: [], // Init empty array
            activeCastingCampaign: null,
            activeCastingCampaigns: [], // Init empty array
            activeTalentScoutings: [], // Init empty array
            activeTalentScouting: null,
            buildings: initialBuildings,
            loans: [],
            portfolio: {},
            stocks: initialStocks,
            transactionLog: [],
            messages: [welcomeMessage],
            lastMonthlyReportDate: gameStartDate,
            monthlyHistory: [],
            nextEventDate: nextEventDate,
            eventLog: [],
            competitors: competitors, // Used merged competitors
            directors: allDirectors, // Used merged and de-duplicated directors
            actors: allActors, // Used merged and de-duplicated actors
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
            privateCapital: 5000,
            privatePortfolio: {},
            ceoSalary: initialSalary,
            lastCeoEvaluationYear: gameStartDate.getFullYear() - 1,
            ceoBonusHistory: [],
            personalReputation: 5,
            maritalStatus: isTestMode ? MaritalStatus.Married : MaritalStatus.Single,
            datingProgress: 0,
            partnerName: isTestMode ? testPartnerName : null,
            partnerGender: isTestMode ? testPartnerGender : undefined,
            partnerBirthDate: isTestMode ? testPartnerBirthDate : undefined,
            partnerJob: isTestMode ? 'Architekt/in' : undefined,
            partnerSalary: isTestMode ? 4500 : undefined,
            partnerPortraitId: isTestMode ? testPartnerPortraitId : undefined,
            relationshipStatus: isTestMode ? 100 : 0,
            relationshipStartDate: isTestMode ? new Date(1985, 5, 15) : null,
            partnerSkills: isTestMode ? { acting: 50, directing: 50, writing: 50, scouting: 50, research: 50, marketing: 50, planning: 50 } : undefined,
            engagementDate: null,
            weddingDetails: null,
            partnerPregnancy: isTestMode ? { dueDate: new Date(gameStartDate.getFullYear(), gameStartDate.getMonth(), gameStartDate.getDate() + 1), isAdoption: false } : null,
            pendingConception: null,
            children: [],
            ownedProperties: [],
            rentedProperties: [],
            activePropertyId: 'prop_rental',
            ownedLuxuryGoods: [],
            completedCourses: [],
            partnerChildrenAgreementCount: 0,
            partnerChildrenAgreementLimit: Math.floor(Math.random() * 3) + 2,
            learnedGenreFocus: {},
            lastSatisfactionCheckDate: null,
            lastWeeklyCostDate: undefined,
            lastNewspaperDate: undefined,
            lastCampaignYear: undefined,
            lastNotifiedKinoStartTitle: undefined,
            lastNotifiedPayTvAvailableTitle: undefined,
            lastNotifiedHomeEntertainmentEndTitle: undefined,
            lastNotifiedFreeTvAvailableTitle: undefined,
            genreTrends: initialGenreTrends,
            interestRateModifier: 0,
            marketTrend: null,
            weeklyPosters: initialWeeklyPosters,
            lastSeminarDate: undefined,
            lastLeisureDate: undefined,
            lastCourseFinishDate: undefined,
            weddingDate: isTestMode ? new Date(gameStartDate.getFullYear(), gameStartDate.getMonth(), gameStartDate.getDate() - 200) : null,
            prenupSigned: undefined,
            partnerTraits: undefined,
            partnerLastCourseDate: undefined,
            partnerActiveTraining: undefined,
            contractOffers: initialContracts,
            lastContractRefreshDate: gameStartDate,
            movieAwardHistory: initialMovieHistory, // Used merged history
            customEvents: customEvents, // Inject custom events
            // Tutorial Start: Only active if enabled
            tutorialStep: data.tutorialEnabled ? 1 : 999,
            tutorialActive: data.tutorialEnabled,
            // Scratchpad Init
            scratchpadContent: "",
            isScratchpadOpen: false,
            scratchpadPosition: { x: 700, y: 300 }
        });
        setGameState(GameState.MainScreen);
    }, [setPlayerData, t, activeDataPackage, customPackages, pendingRegistration, authUser, apiRequest]);
    useEffect(() => {
        if (hasInteracted && audioRef.current) {
            audioRef.current.play().catch(error => {
                console.warn("Hintergrundmusik konnte nicht automatisch gestartet werden:", error);
            });
        }
    }, [hasInteracted]);
    useEffect(() => {
        if (audioRef.current) {
            const effectiveVolume = isMuted ? 0 : (masterVolume / 10) * (musicVolume / 10);
            audioRef.current.volume = effectiveVolume;
        }
    }, [musicVolume, masterVolume, isMuted]);
    useEffect(() => {
        const handleGlobalClick = (event) => {
            if (event.target.closest('button, a, input[type="checkbox"], input[type="radio"], select')) {
                playSfx('click');
            }
        };
        window.addEventListener('click', handleGlobalClick, true);
        return () => {
            window.removeEventListener('click', handleGlobalClick, true);
        };
    }, [playSfx]);
    useEffect(() => {
        const handleF12Reload = (event) => {
            if (!isF12ReloadEnabled)
                return;
            const target = event.target;
            const tag = target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
                return;
            if (event.key === 'F12') {
                event.preventDefault();
                window.location.reload();
            }
        };
        window.addEventListener('keydown', handleF12Reload);
        return () => window.removeEventListener('keydown', handleF12Reload);
    }, [isF12ReloadEnabled]);
    // spacebar toggles pause/resume **only on main screen**
    useEffect(() => {
        const handleSpace = (e) => {
            // ignore when typing in form fields
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
                return;
            if (e.code === 'Space') {
                // only react if we are currently on the main game screen
                if (gameState === GameState.MainScreen) {
                    e.preventDefault();
                    togglePauseSpeed();
                }
            }
        };
        window.addEventListener('keydown', handleSpace);
        return () => window.removeEventListener('keydown', handleSpace);
    }, [togglePauseSpeed, gameState]);
    const handleShowProjectProgress = useCallback(() => {
        if (playerData?.activeProjects && playerData.activeProjects.length > 0) {
            onNavigate(GameState.Projects);
            setTargetProjectsView('current_project');
        }
        else if (playerData?.currentProject?.phase === ProjectPhase.Completed) {
            onNavigate(GameState.CompletedProject);
        }
        else if (playerData?.activePlanning) {
            onNavigate(GameState.Projects);
            setTargetProjectsView('project');
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
        if (authLoading) {
            return _jsx("div", { className: "w-full h-full flex items-center justify-center bg-black text-white text-xl font-bold", children: "Account wird geladen..." });
        }
        if (!authUser && gameState !== GameState.NewGame) {
            return _jsx(AuthLoginScreen, { onLogin: handleLogin, onStartRegistration: handleStartRegistration });
        }
        switch (gameState) {
            case GameState.NewGame:
                return _jsx(NewGameScreen, { onStart: handleStartGame, onBack: handleBackToMenu, requiresAccountRegistration: pendingRegistration || !authUser });
            case GameState.LoadGame:
                return _jsx(LoadGameScreen, { onConfirmLoad: handleConfirmLoad, onBack: handleBackToMenu });
            case GameState.MainScreen:
                return playerData ? _jsx(MainScreen, { onNavigate: onNavigate, onShowProject: handleShowProjectProgress, gameSpeed: gameSpeed, setGameSpeed: handleSetGameSpeed, systemPause: systemPause, systemResume: systemResume, onNavigateToOfficeTab: handleNavigateToOfficeTab, onNavigateToMarketingTab: handleNavigateToMarketingTab, onNavigateToFinanzenTab: handleNavigateToFinanzenTab, onNavigateToStudiogelaendeBuilding: handleNavigateToStudiogelaendeBuilding, onNavigateToProjectsView: handleNavigateToProjectsView }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.Projects:
                return playerData ? _jsx(NewProjectScreen_Phase1, { onBack: handleBackToMainScreen, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, setGameState: setGameState, initialView: targetProjectsView, initialFilmTitle: targetFilmTitle }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.CompletedProject:
                const projectToShow = playerData?.completedFilms.find(f => f.workingTitle === targetFilmTitle) || playerData?.currentProject;
                if (!playerData)
                    return _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
                return projectToShow
                    ? _jsx(CompletedProjectScreen, { project: projectToShow, onBack: handleBackToMainScreen, setGameState: setGameState, onNavigateToMarketingTab: handleNavigateToMarketingTab })
                    : _jsx(MainScreen, { onNavigate: onNavigate, onShowProject: handleShowProjectProgress, gameSpeed: gameSpeed, setGameSpeed: handleSetGameSpeed, systemPause: systemPause, systemResume: systemResume, onNavigateToOfficeTab: handleNavigateToOfficeTab, onNavigateToMarketingTab: handleNavigateToMarketingTab, onNavigateToFinanzenTab: handleNavigateToFinanzenTab, onNavigateToStudiogelaendeBuilding: handleNavigateToStudiogelaendeBuilding, onNavigateToProjectsView: handleNavigateToProjectsView });
            case GameState.Office:
                return playerData ? _jsx(OfficeScreen, { onBack: handleBackToMainScreen, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, initialTab: targetOfficeTab }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.Research:
                return playerData ? _jsx(ResearchScreen, { onBack: handleBackToMainScreen, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.Studiogelaende:
                return playerData ? _jsx(StudiogelaendeScreen, { onBack: handleBackToMainScreen, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, initialBuilding: targetStudiogelaendeBuilding }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.Finanzen:
                return playerData ? _jsx(FinanzenScreen, { onBack: handleBackToMainScreen, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, initialTab: targetFinanzenTab }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.Marketing:
                return playerData ? _jsx(MarketingScreen, { onBack: handleBackToMainScreen, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, initialTab: targetMarketingTab, initialFilmTitle: targetFilmTitle, initialDistributionTab: targetMarketingDistributionTab }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.Settings:
                return _jsx(SettingsScreen, { onBack: playerData ? handleBackToMainScreen : handleBackToMenu, onQuit: authUser ? handleBackToMenu : handleLogout, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed });
            case GameState.Privatleben:
                return playerData ? _jsx(PrivatlebenScreen, { onBack: handleBackToMainScreen, gameSpeed: gameSpeed, setGameSpeed: setGameSpeed }) : _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
            case GameState.Editor:
                return _jsx(EditorScreen, { onBack: handleBackToMenu });
            default:
                return _jsx(MainMenu, { onNewGame: handleNewGame, onLoadGame: handleLoadGame, onSettings: handleSettings, onEditor: handleEditor });
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black flex items-center justify-center overflow-hidden", children: _jsxs("div", { style: {
                width: `${BASE_WIDTH}px`,
                height: `${BASE_HEIGHT}px`,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${scale.x}, ${scale.y})`,
                transformOrigin: 'center center',
                overflow: 'hidden'
            }, className: "shadow-2xl bg-black", children: [_jsx("audio", { ref: audioRef, src: "https://www.schnoxcore.com/media/music/background.mp3", loop: true, preload: "auto" }), playerData && _jsx(TutorialOverlay, { gameState: gameState }), playerData && playerData.isScratchpadOpen && _jsx(Scratchpad, {}), _jsx(ScreenTransition, { childKey: gameState, children: renderScreen() })] }) }));
};
const App = () => {
    return (_jsx(GameProvider, { children: _jsx(AppContent, {}) }));
};
export default App;
