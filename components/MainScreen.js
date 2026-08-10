import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GameState, BuildingType, GameSpeed, EmployeeType } from '../types';
import { buroBackgroundImage } from './backgrounds/BuroBackgroundImage';
import FinanzenIcon from './icons/FinanzenIcon';
import ForschungIcon from './icons/ForschungIcon';
import NeuesProjektIcon from './icons/NeuesProjektIcon';
import OfficeIcon from './icons/OfficeIcon';
import StudiogelaendeIcon from './icons/StudiogelaendeIcon';
import GameHeader from './GameHeader';
import MonthlyReportModal from './MonthlyReportModal';
import RandomEventModal from './RandomEventModal';
import EinstellungenIcon from './icons/EinstellungenIcon';
import PrivatlebenIcon from './icons/PrivatlebenIcon';
import BirthModal from './BirthModal';
import MegaphoneIcon from './icons/MegaphoneIcon';
import FestivalResultModal from './FestivalResultModal';
import ProductionEventModal from './ProductionEventModal';
import StarRating from './StarRating';
import { useGame } from '../contexts/GameContext';
import { UNIVERSITY_MAJORS } from './privateLifeData';
import { useProjectLoop } from '../hooks/useProjectLoop';
import { useActivityLoop } from '../hooks/useActivityLoop';
import { useFinanceLoop } from '../hooks/useFinanceLoop';
import { useEventLoop } from '../hooks/useEventLoop';
import { usePersonalLifeLoop } from '../hooks/usePersonalLifeLoop';
import { useCompetitorLoop } from '../hooks/useCompetitorLoop';
import { useNotificationsLoop } from '../hooks/useNotificationsLoop';
import { useOfferLoop } from '../hooks/useOfferLoop';
import NewspaperModal from './NewspaperModal';
import { useTranslation } from '../hooks/useTranslation';
import FamilyIcon from './icons/FamilyIcon';
import SchoolEnrollmentModal from './SchoolEnrollmentModal';
import DemoEndModal from './DemoEndModal';
import ActivitiesModal from './ActivitiesModal';
// Import Widgets
import CurrentProjectWidget from './widgets/CurrentProjectWidget';
import MyFilmsWidget from './widgets/MyFilmsWidget';
import PersonalWidget from './widgets/PersonalWidget';
import NachrichtenWidget from './widgets/NachrichtenWidget';
import StudioActivitiesWidget from './widgets/StudioActivitiesWidget';
import KinoChartsWidget from './widgets/KinoChartsWidget';
const ActionButton = ({ title, description, icon, onClick, disabled, textColor }) => (_jsx("button", { onClick: onClick, disabled: disabled, className: "bg-black bg-opacity-60 backdrop-blur-md border border-gray-700 rounded-lg p-4 text-left transform hover:-translate-y-1 hover:border-amber-500/50 transition-all duration-300 ease-in-out group w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0", children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300", children: React.cloneElement(icon, { className: `h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors ${textColor ? textColor.replace('text-', 'bg-') : ''}` }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: `text-md font-bold font-cinzel ${textColor || 'text-amber-400 group-hover:text-amber-300'} transition-colors`, children: title }), _jsx("p", { className: "text-xs text-gray-300 mt-1", children: description })] })] }) }));
// Inner Content Component - Only rendered when playerData exists
const MainScreenContent = ({ onNavigate, onShowProject, gameSpeed, setGameSpeed, systemPause, systemResume, onNavigateToOfficeTab, onNavigateToMarketingTab, onNavigateToFinanzenTab, onNavigateToStudiogelaendeBuilding, onNavigateToProjectsView }) => {
    const { playerData, setPlayerData, showWeeklyNewspaper, pauseOnMessage, Demo } = useGame();
    const { t, language } = useTranslation();
    const [castingFinishedModalInfo, setCastingFinishedModalInfo] = useState(null);
    const [productionFinishedModalInfo, setProductionFinishedModalInfo] = useState(null);
    const [completedProjectModalInfo, setCompletedProjectModalInfo] = useState(null);
    const [planningFinishedModalInfo, setPlanningFinishedModalInfo] = useState(null);
    const [monthlyReportData, setMonthlyReportData] = useState(null);
    const [activeEvent, setActiveEvent] = useState(null);
    const [activeProductionEvent, setActiveProductionEvent] = useState(null);
    const [birthModalData, setBirthModalData] = useState(null);
    const [pregnancyNotification, setPregnancyNotification] = useState(null);
    const [graduationModalData, setGraduationModalData] = useState(null);
    const [festivalResultInfo, setFestivalResultInfo] = useState(null);
    const [campaignResultInfo, setCampaignResultInfo] = useState(null);
    const [talentScoutingResult, setTalentScoutingResult] = useState(null);
    const [museumPrestigeInfo, setMuseumPrestigeInfo] = useState(false);
    const [trainingFinishedInfo, setTrainingFinishedInfo] = useState(null);
    const [courseFinishedInfo, setCourseFinishedInfo] = useState(null);
    const [castingFinishedNotification, setCastingFinishedNotification] = useState(null);
    const [kinoStartInfo, setKinoStartInfo] = useState(null);
    const [homeEntertainmentStartInfo, setHomeEntertainmentStartInfo] = useState(null);
    const [kinoEndInfo, setKinoEndInfo] = useState(null);
    const [homeEntertainmentEndInfo, setHomeEntertainmentEndInfo] = useState(null);
    const [newspaperData, setNewspaperData] = useState(null);
    const [showDemoEnd, setShowDemoEnd] = useState(false);
    const [showActivitiesModal, setShowActivitiesModal] = useState(false); // New state for Activities Modal
    const lastCleanupYear = useRef(null);
    if (!playerData || !setPlayerData)
        return null;
    // Check for pending interactive decisions (Production Events AND Decision Events)
    const hasPendingDecision = useMemo(() => {
        return playerData.messages.some(m => (m.productionEventContext && !m.productionEventContext.isResolved) ||
            (m.decisionEventContext && !m.decisionEventContext.isResolved));
    }, [playerData.messages]);
    // Enforce pause if a decision is pending
    useEffect(() => {
        if (hasPendingDecision && gameSpeed !== GameSpeed.PAUSED) {
            setGameSpeed(GameSpeed.PAUSED);
        }
    }, [hasPendingDecision, gameSpeed, setGameSpeed]);
    // DEMO MODE CHECK
    useEffect(() => {
        if (Demo && !showDemoEnd) {
            // Date limit: 31.12.1990
            const demoLimit = new Date(1990, 11, 31); // Month is 0-indexed (11 = December)
            if (playerData.gameDate >= demoLimit) {
                setGameSpeed(GameSpeed.PAUSED);
                setShowDemoEnd(true);
            }
        }
    }, [playerData.gameDate, Demo, showDemoEnd, setGameSpeed]);
    // Bankruptcy Check
    useEffect(() => {
        if (playerData.isBankrupt && gameSpeed !== GameSpeed.PAUSED) {
            setGameSpeed(GameSpeed.PAUSED);
        }
    }, [playerData.isBankrupt, gameSpeed, setGameSpeed]);
    useProjectLoop({
        playerData, setPlayerData, systemPause,
    });
    useActivityLoop({
        playerData, setPlayerData, systemPause,
        setConstructionFinishedInfo: () => { }, // No-op, handled as message
        setCampaignResultInfo,
        setCourseFinishedInfo, setTalentScoutingResult,
        setTrainingFinishedInfo, setCastingFinishedNotification,
        setProductionCampaignResultInfo: () => { } // Modal disabled as requested
    });
    useFinanceLoop({
        playerData, setPlayerData, systemPause,
        setMonthlyReportData, setMuseumPrestigeInfo, setNewspaperData,
        showWeeklyNewspaper, t,
    });
    useEventLoop({
        playerData, setPlayerData, systemPause,
        setActiveEvent,
        setActiveWritingEvent: () => { }, // No-op, removed
        pauseOnMessage
    });
    usePersonalLifeLoop({
        playerData, setPlayerData, systemPause,
        setPregnancyNotification, setBirthModalData, setActiveEvent, setGraduationModalData
    });
    useCompetitorLoop({ playerData, setPlayerData });
    useNotificationsLoop({
        playerData, setPlayerData, systemPause,
        setFestivalResultInfo,
        setKinoStartInfo,
        setHomeEntertainmentStartInfo,
        setKinoEndInfo,
        setHomeEntertainmentEndInfo,
    });
    useOfferLoop({
        playerData, setPlayerData, systemPause,
        pauseOnMessage
    });
    // NEW: Notification Queue Processor
    useEffect(() => {
        if (!playerData || !setPlayerData)
            return;
        // Check if ANY modal is currently open. If so, don't show the next one yet.
        const hasActiveModal = planningFinishedModalInfo !== null ||
            castingFinishedModalInfo !== null ||
            productionFinishedModalInfo !== null ||
            completedProjectModalInfo !== null ||
            activeEvent !== null ||
            monthlyReportData !== null;
        const queue = playerData.pendingNotifications || [];
        // ONLY trigger if we have something in queue AND no modal is currently shown
        if (queue.length > 0 && !hasActiveModal) {
            const notification = queue[0];
            // Ensure we pause for the notification
            systemPause();
            switch (notification.type) {
                case 'planningFinished':
                    setPlanningFinishedModalInfo({ title: notification.title });
                    break;
                case 'castingFinished':
                    setCastingFinishedModalInfo({ title: notification.title, justifications: notification.justifications || null });
                    break;
                case 'productionFinished':
                    setProductionFinishedModalInfo({ title: notification.title });
                    break;
                case 'completed':
                    setCompletedProjectModalInfo({ title: notification.title, quality: notification.quality || 0 });
                    break;
            }
            // IMPORTANT: We do NOT remove from queue here. We remove on dismiss.
        }
    }, [
        playerData?.pendingNotifications, // Re-run when queue changes
        planningFinishedModalInfo,
        castingFinishedModalInfo,
        productionFinishedModalInfo,
        completedProjectModalInfo,
        activeEvent,
        monthlyReportData,
        setPlayerData,
        systemPause
    ]);
    // Function to dismiss notification and advance queue
    const handleDismissNotification = useCallback((targetView, filmTitle, targetGameState) => {
        // Clear local modal state immediately
        setPlanningFinishedModalInfo(null);
        setCastingFinishedModalInfo(null);
        setProductionFinishedModalInfo(null);
        setCompletedProjectModalInfo(null);
        setPlayerData(prev => {
            if (!prev)
                return null;
            // Create a NEW array to ensure React sees the state change
            const newQueue = (prev.pendingNotifications || []).slice(1);
            return {
                ...prev,
                pendingNotifications: newQueue
            };
        });
        // Navigation Logic
        if (targetView) {
            onNavigateToProjectsView(targetView, filmTitle);
        }
        else if (targetGameState) {
            if (targetGameState === GameState.CompletedProject) {
                onNavigateToProjectsView('project', filmTitle); // Sets target title in App
                onNavigate(GameState.CompletedProject); // Then switch screen
            }
            else {
                onNavigate(targetGameState);
            }
        }
        else {
            const remainingQueue = playerData.pendingNotifications?.length || 0;
            if (remainingQueue <= 1) {
                systemResume();
            }
        }
    }, [setPlayerData, onNavigateToProjectsView, onNavigate, systemResume, playerData?.pendingNotifications]);
    // Annual Data Cleanup for Performance
    useEffect(() => {
        if (!playerData || !setPlayerData)
            return;
        const newDate = new Date(playerData.gameDate);
        const currentYear = newDate.getFullYear();
        if (lastCleanupYear.current !== currentYear) {
            lastCleanupYear.current = currentYear;
            // Don't run cleanup in the first few years of the game
            if (currentYear < 1995)
                return;
            setPlayerData(prevData => {
                if (!prevData)
                    return null;
                const HISTORY_LIMIT_YEARS = 15;
                const STOCK_HISTORY_LIMIT = 104; // 2 years of weekly data
                const MESSAGE_HISTORY_YEARS = 3;
                const cutoffYear = currentYear - HISTORY_LIMIT_YEARS;
                const messageCutoffDate = new Date(newDate);
                messageCutoffDate.setFullYear(messageCutoffDate.getFullYear() - MESSAGE_HISTORY_YEARS);
                let updatedData = { ...prevData };
                let changesMade = false;
                // 1. Prune Transaction Log
                if (updatedData.transactionLog && updatedData.transactionLog.length > 5000) {
                    const originalCount = updatedData.transactionLog.length;
                    updatedData.transactionLog = updatedData.transactionLog.filter(t => new Date(t.date).getFullYear() >= cutoffYear);
                    if (originalCount > updatedData.transactionLog.length)
                        changesMade = true;
                }
                // 2. Prune Monthly History
                if (updatedData.monthlyHistory && updatedData.monthlyHistory.length > HISTORY_LIMIT_YEARS * 12) {
                    updatedData.monthlyHistory = updatedData.monthlyHistory.filter(h => h.year >= cutoffYear);
                    changesMade = true;
                }
                // 3. Prune Event Log
                if (updatedData.eventLog && updatedData.eventLog.length > 1000) {
                    updatedData.eventLog = updatedData.eventLog.filter(e => new Date(e.date).getFullYear() >= cutoffYear);
                    changesMade = true;
                }
                // 4. Prune CEO Bonus History (SAFE ACCESS)
                if (updatedData.ceoBonusHistory && updatedData.ceoBonusHistory.length > HISTORY_LIMIT_YEARS) {
                    updatedData.ceoBonusHistory = updatedData.ceoBonusHistory.filter(b => b.year >= cutoffYear);
                    changesMade = true;
                }
                // 5. Prune Stock History
                if (updatedData.stocks) {
                    let stockPruned = false;
                    updatedData.stocks = updatedData.stocks.map(stock => {
                        if (stock.history && stock.history.length > STOCK_HISTORY_LIMIT) {
                            stockPruned = true;
                            return { ...stock, history: stock.history.slice(-STOCK_HISTORY_LIMIT) };
                        }
                        return stock;
                    });
                    if (stockPruned)
                        changesMade = true;
                }
                // 6. Prune Competitor Film History
                if (updatedData.competitors) {
                    updatedData.competitors = updatedData.competitors.map(competitor => {
                        if (competitor.completedFilms && competitor.completedFilms.length > 50) {
                            const filteredFilms = competitor.completedFilms.filter(film => new Date(film.releaseDate).getFullYear() >= cutoffYear);
                            if (competitor.completedFilms.length > filteredFilms.length) {
                                changesMade = true;
                                return { ...competitor, completedFilms: filteredFilms };
                            }
                        }
                        return competitor;
                    });
                }
                // 7. Prune read & action-resolved messages
                if (updatedData.messages && updatedData.messages.length > 200) {
                    const originalCount = updatedData.messages.length;
                    updatedData.messages = updatedData.messages.filter(m => {
                        if (!m.read)
                            return true;
                        if ((m.offerContext && !m.offerContext.isAccepted && !m.offerContext.isRejected && !m.offerContext.isNegotiationFailed && !m.offerContext.isWithdrawn && !m.offerContext.isSuperseded) || (m.productionEventContext && !m.productionEventContext.isResolved)) {
                            return true;
                        }
                        if (new Date(m.date) > messageCutoffDate)
                            return true;
                        return false;
                    });
                    if (originalCount > updatedData.messages.length)
                        changesMade = true;
                }
                return changesMade ? updatedData : prevData;
            });
        }
    }, [playerData?.gameDate, setPlayerData]);
    // Helper to handle navigation from Activities Modal which might have specialized arguments
    const handleActivityNavigation = (state, subTab) => {
        // If we navigate to office, we might need to set the tab as well
        if (state === GameState.Office && subTab) {
            onNavigateToOfficeTab(subTab);
        }
        else if (state === GameState.Projects && subTab) {
            onNavigateToProjectsView(subTab);
        }
        else {
            onNavigate(state);
        }
    };
    const menuItems = useMemo(() => {
        const researchLab = playerData.buildings.find(b => b.type === BuildingType.ResearchLab && b.level > 0);
        const canResearch = !!researchLab;
        const items = [
            {
                title: t.mainScreen.menu.projects,
                description: t.mainScreen.menu.projectsDesc,
                icon: _jsx(NeuesProjektIcon, {}),
                onClick: () => onNavigate(GameState.Projects),
                disabled: false,
            },
            {
                title: t.mainScreen.menu.marketing,
                description: t.mainScreen.menu.marketingDesc,
                icon: _jsx(MegaphoneIcon, {}),
                onClick: () => onNavigate(GameState.Marketing),
                disabled: false
            },
            {
                title: t.mainScreen.menu.office,
                description: t.mainScreen.menu.officeDesc,
                icon: _jsx(OfficeIcon, {}),
                onClick: () => onNavigateToOfficeTab('nachrichten')
            },
            {
                title: t.mainScreen.menu.lot,
                description: t.mainScreen.menu.lotDesc,
                icon: _jsx(StudiogelaendeIcon, {}),
                onClick: () => onNavigateToStudiogelaendeBuilding(BuildingType.Burogebaude), // CHANGED from Autorenbuero to Burogebaude
                disabled: false
            },
            {
                title: t.mainScreen.menu.research,
                description: canResearch ? t.mainScreen.menu.researchDesc : t.mainScreen.menu.researchLocked,
                icon: _jsx(ForschungIcon, {}),
                onClick: () => onNavigate(GameState.Research)
            },
            {
                title: t.mainScreen.menu.finance,
                description: t.mainScreen.menu.financeDesc,
                icon: _jsx(FinanzenIcon, {}),
                onClick: () => onNavigateToFinanzenTab('take_loan'),
                disabled: false
            },
            {
                title: t.mainScreen.menu.privatelife,
                description: t.mainScreen.menu.privatelifeDesc,
                icon: _jsx(PrivatlebenIcon, {}),
                onClick: () => onNavigate(GameState.Privatleben),
                disabled: false
            },
        ];
        return items;
    }, [playerData, onNavigate, onNavigateToOfficeTab, onNavigateToFinanzenTab, onNavigateToStudiogelaendeBuilding, t, systemPause]);
    const handleEventClose = useCallback((actionValue) => {
        if (!activeEvent) {
            systemResume();
            return;
        }
        let finalState = { ...activeEvent.resultingState };
        if (actionValue === 'accept_date') {
            const partnerName = activeEvent.event.text.split('namens ')[1].split(' kennen.')[0];
            const baseState = activeEvent.resultingState;
            // Simplified partner acceptance via event
            // This is a legacy path, usually partners are met via Private Life tab
            finalState = {
                ...baseState,
                // Not fully implementing partner generation here as it's complex
                // This ensures the game doesn't crash if an old event triggers
            };
        }
        // Log the event that just occurred
        finalState.eventLog = [
            ...(finalState.eventLog || []),
            {
                date: new Date(finalState.gameDate),
                title: activeEvent.event.title,
                text: activeEvent.event.text,
                category: activeEvent.event.category,
            }
        ];
        const daysUntilNext = 10 + Math.floor(Math.random() * 21);
        const nextDate = new Date(finalState.gameDate);
        nextDate.setDate(nextDate.getDate() + daysUntilNext);
        finalState.nextEventDate = nextDate;
        setPlayerData(finalState);
        setActiveEvent(null);
        systemResume();
    }, [activeEvent, setPlayerData, systemResume]);
    const handleFestivalClose = useCallback(() => {
        if (festivalResultInfo) {
            setPlayerData(currentData => {
                if (!currentData)
                    return null;
                const winnersText = festivalResultInfo.awards.map((award) => {
                    const winnerNominee = award.nominees.find((n) => (n.talentName || n.filmTitle) === award.winnerIdentifier);
                    const winnerName = winnerNominee ? (winnerNominee.talentName || winnerNominee.filmTitle) : 'N/A';
                    return `${award.category}: ${winnerName}`;
                }).join(' | ');
                const newEvent = {
                    date: new Date(currentData.gameDate),
                    title: `Ergebnisse: ${festivalResultInfo.festivalName}`,
                    text: winnersText,
                    category: 'Industry',
                };
                return {
                    ...currentData,
                    eventLog: [...(currentData.eventLog || []), newEvent]
                };
            });
        }
        setFestivalResultInfo(null);
        systemResume();
    }, [festivalResultInfo, setPlayerData, systemResume]);
    const handleProductionEventClose = useCallback((choice) => {
        // Re-implement if strictly needed here, but moved logic to useEventLoop/NachrichtenTab mostly.
        // This handler is for the modal if triggered directly from MainScreen (which is rare now).
        // We will clear the state.
        setActiveProductionEvent(null);
        systemResume();
    }, [setPlayerData, systemResume]);
    const handleBackToMenu = () => {
        // This assumes onNavigate(GameState.MainMenu) effectively quits or restarts
        setPlayerData(null);
        onNavigate(GameState.MainMenu);
    };
    return (_jsxs("div", { className: "w-full h-full bg-cover bg-center", style: { backgroundImage: `url(${buroBackgroundImage})` }, children: [_jsxs("div", { className: "w-full h-full bg-black bg-opacity-0 flex flex-col", children: [_jsx(GameHeader, { gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, onNavigateToOfficeTab: onNavigateToOfficeTab, hasPendingDecision: hasPendingDecision }), _jsxs("main", { className: "flex-grow flex flex-row overflow-hidden", children: [_jsxs("div", { className: "bg-black bg-opacity-50 h-full w-full max-w-sm border-r border-gray-700 flex flex-col", children: [_jsx("div", { className: "flex-grow overflow-y-hidden p-4 space-y-2", children: menuItems.map((item) => (_jsx(ActionButton, { ...item }, item.title))) }), _jsx("div", { className: "flex-shrink-0 p-4 pt-2 border-t border-gray-700/50", children: _jsxs("button", { onClick: () => onNavigate(GameState.Settings), className: "w-full flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase transition-colors", children: [_jsx(EinstellungenIcon, { className: "h-4 w-4" }), _jsx("span", { children: t.mainScreen.menu.settings })] }) })] }), _jsx("div", { className: "flex-grow p-4 md:p-6 overflow-hidden", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsx(CurrentProjectWidget, { onNavigate: onNavigate, onNavigateToProjectsView: onNavigateToProjectsView }), _jsx(MyFilmsWidget, { onNavigateToMarketingTab: onNavigateToMarketingTab })] }), _jsxs("div", { className: "space-y-6", children: [_jsx(PersonalWidget, { onClick: () => onNavigate(GameState.Privatleben) }), _jsx(NachrichtenWidget, { onNavigateToOfficeTab: onNavigateToOfficeTab }), _jsx(StudioActivitiesWidget, { onNavigate: onNavigate, onNavigateToOfficeTab: onNavigateToOfficeTab, onNavigateToStudiogelaendeBuilding: onNavigateToStudiogelaendeBuilding, onNavigateToProjectsView: onNavigateToProjectsView, onOpenModal: () => setShowActivitiesModal(true) }), _jsx(KinoChartsWidget, { onNavigateToOfficeTab: onNavigateToOfficeTab })] })] }) })] })] }), planningFinishedModalInfo && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50", "aria-modal": "true", role: "dialog", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.mainScreen.modals.planningFinishedTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.mainScreen.modals.planningFinishedText.replace('{title}', planningFinishedModalInfo.title) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => handleDismissNotification(), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.close }), _jsx("button", { onClick: () => handleDismissNotification('saved_projects'), className: "bg-amber-500 text-gray-900 font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all", children: t.mainScreen.modals.toProjects })] })] }) })), castingFinishedModalInfo && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50", "aria-modal": "true", role: "dialog", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl p-8", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4 text-center", children: t.mainScreen.modals.castingFinishedTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6 text-center", children: t.mainScreen.modals.castingFinishedText.replace('{title}', castingFinishedModalInfo.title) }), _jsxs("div", { className: "flex justify-center gap-4 mt-6", children: [_jsx("button", { onClick: () => handleDismissNotification(), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.close }), _jsx("button", { onClick: () => handleDismissNotification('current_project', castingFinishedModalInfo.title), className: "bg-amber-500 text-gray-900 font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all", children: t.mainScreen.modals.toProject })] })] }) })), productionFinishedModalInfo && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50", "aria-modal": "true", role: "dialog", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.mainScreen.modals.productionFinishedTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.mainScreen.modals.productionFinishedText.replace('{title}', productionFinishedModalInfo.title) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => handleDismissNotification(), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.close }), _jsx("button", { onClick: () => handleDismissNotification('current_project', productionFinishedModalInfo.title), className: "bg-amber-500 text-gray-900 font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all", children: t.mainScreen.modals.toPostProduction })] })] }) })), completedProjectModalInfo && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50", "aria-modal": "true", role: "dialog", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.mainScreen.modals.filmCompletedTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.mainScreen.modals.filmCompletedText.replace('{title}', completedProjectModalInfo.title) }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => handleDismissNotification(undefined, completedProjectModalInfo.title, GameState.CompletedProject), className: "bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all", children: t.mainScreen.modals.toOverview }) })] }) })), pregnancyNotification && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50", "aria-modal": "true", role: "dialog", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-md p-8 text-center", children: [_jsx("div", { className: "mb-4 flex justify-center", children: _jsx("div", { className: "bg-pink-900/30 p-4 rounded-full", children: _jsx(FamilyIcon, { className: "w-12 h-12 text-pink-400" }) }) }), _jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: pregnancyNotification.isAdoption ? "Adoption eingeleitet!" : "Schwangerschaft bestätigt!" }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: pregnancyNotification.isAdoption
                                ? "Der Adoptionsantrag wurde bewilligt. Das Verfahren läuft nun offiziell."
                                : "Herzlichen Glückwunsch! Wir erwarten Nachwuchs." }), _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg mb-6", children: [_jsx("p", { className: "text-sm text-gray-400 uppercase tracking-wider", children: "Errechneter Termin" }), _jsx("p", { className: "text-xl font-bold text-white", children: new Date(pregnancyNotification.dueDate).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US') })] }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => { setPregnancyNotification(null); systemResume(); }, className: "bg-amber-500 text-gray-900 font-bold py-2 px-12 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all", children: t.common.ok }) })] }) })), graduationModalData && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4", "aria-modal": "true", role: "dialog", children: _jsxs("div", { className: "bg-gray-800 border border-blue-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center flex flex-col items-center", children: [_jsx("div", { className: "mb-6 flex justify-center", children: _jsx("div", { className: "w-24 h-24 bg-blue-900/40 rounded-full flex items-center justify-center border-4 border-blue-500", children: _jsx("span", { className: "text-5xl", children: "\uD83C\uDF93" }) }) }), _jsx("h2", { className: "text-3xl font-bold font-cinzel text-blue-400 mb-2", children: "Studium Abgeschlossen!" }), _jsx("p", { className: "text-white text-xl font-bold mb-4", children: graduationModalData.childName }), _jsxs("p", { className: "text-gray-300 mb-6", children: ["hat den Studiengang ", _jsx("span", { className: "text-amber-400 font-bold", children: UNIVERSITY_MAJORS[graduationModalData.major] || graduationModalData.major }), " an der ", _jsx("span", { className: "text-amber-400 font-bold", children: graduationModalData.uniName }), " erfolgreich beendet."] }), _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg w-full mb-6 border border-gray-600", children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider mb-2", children: "Abschluss-Qualit\u00E4t" }), _jsxs("div", { className: "flex justify-center items-center gap-2", children: [_jsx(StarRating, { rating: graduationModalData.skillLevel, size: "lg" }), _jsxs("span", { className: "text-xl font-bold text-white ml-2", children: [Math.round(graduationModalData.skillLevel), "/100"] })] })] }), _jsxs("p", { className: "text-sm text-gray-400 italic mb-6", children: [graduationModalData.childName, " steht nun f\u00FCr eine Anstellung im Studio zur Verf\u00FCgung."] }), _jsx("button", { onClick: () => { setGraduationModalData(null); systemResume(); }, className: "bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-12 rounded uppercase tracking-wider transition-all shadow-lg", children: t.common.ok })] }) })), playerData.schoolEnrollmentRequest && _jsx(SchoolEnrollmentModal, {}), showDemoEnd && (_jsx(DemoEndModal, { onBackToMenu: handleBackToMenu })), playerData.isBankrupt && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[100] p-6 animate-fade-in", children: _jsxs("div", { className: "bg-gray-900 border-2 border-red-600 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.5)] w-full max-w-lg p-10 text-center relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent" }), _jsx("h2", { className: "text-5xl font-bold font-cinzel text-red-500 mb-6 drop-shadow-lg uppercase tracking-widest", children: t.gameOver?.title || (language === 'de' ? 'BANKROTT!' : 'BANKRUPT!') }), _jsx("p", { className: "text-gray-300 text-xl mb-10 leading-relaxed", children: t.gameOver?.text || (language === 'de' ? 'Ihr Studio ist zahlungsunfähig. Das Spiel ist vorbei.' : 'Your studio is insolvent. The game is over.') }), _jsx("button", { onClick: () => {
                                setPlayerData(null);
                                onNavigate(GameState.MainMenu);
                            }, className: "bg-red-700 hover:bg-red-600 text-white text-lg font-bold py-4 px-10 rounded-sm uppercase tracking-wider transition-all shadow-lg transform hover:scale-105 border border-red-500", children: t.gameOver?.button || (language === 'de' ? 'Zurück zum Hauptmenü' : 'Back to Main Menu') })] }) })), activeEvent && _jsx(RandomEventModal, { event: activeEvent.event, deltas: activeEvent.deltas, onClose: handleEventClose }), activeProductionEvent && _jsx(ProductionEventModal, { event: activeProductionEvent, onClose: handleProductionEventClose }), monthlyReportData && _jsx(MonthlyReportModal, { reportData: monthlyReportData, onClose: () => { setMonthlyReportData(null); systemResume(); } }), birthModalData && _jsx(BirthModal, { data: birthModalData, onClose: () => { setBirthModalData(null); systemResume(); } }), festivalResultInfo && _jsx(FestivalResultModal, { results: festivalResultInfo, playerStudioName: playerData.studioName, onClose: handleFestivalClose }), newspaperData && _jsx(NewspaperModal, { event: newspaperData, onClose: () => { setNewspaperData(null); systemResume(); } }), showActivitiesModal && (_jsx(ActivitiesModal, { onClose: () => setShowActivitiesModal(false), onNavigate: handleActivityNavigation, playerData: playerData }))] }));
};
// Wrapper
const MainScreen = (props) => {
    const { playerData } = useGame();
    if (!playerData)
        return null;
    return _jsx(MainScreenContent, { ...props });
};
export default MainScreen;
