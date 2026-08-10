import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTranslation } from '../hooks/useTranslation';
const formatCurrency = (val, locale) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
const ProgressBar = ({ progress, color, label }) => (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("span", { className: "text-xs text-gray-400 font-bold uppercase tracking-wider font-serif", children: label }), _jsxs("span", { className: `text-xs font-mono font-bold ${progress < 30 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`, children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "w-full bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-600 shadow-inner", children: _jsx("div", { className: `${color} h-full rounded-full transition-all duration-300 ease-out`, style: { width: `${Math.max(0, progress)}%` } }) })] }));
const NegotiationRow = ({ label, valueDisplay, onDemandMore, disabled, btnLabel, isPercentage }) => (_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0 hover:bg-gray-800/30 px-2 rounded transition-colors group", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-sm font-serif text-gray-400 uppercase tracking-wide", children: label }), _jsx("span", { className: `text-xl font-mono font-bold ${disabled ? 'text-gray-500' : 'text-white'}`, children: valueDisplay })] }), _jsxs("button", { onClick: onDemandMore, disabled: disabled, className: "flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-amber-500 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-500/50 shadow-sm active:transform active:scale-95", children: [_jsx("span", { children: btnLabel }), _jsx("span", { className: "text-lg leading-none", children: "\u2191" })] })] }));
const NegotiationModal = ({ offerContext, onClose }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    // Unified Data Retrieval
    const { film, offer, isLifecycle, legacyPhase } = useMemo(() => {
        if (!playerData || !offerContext)
            return { film: null, offer: null, isLifecycle: false, legacyPhase: null };
        const film = playerData.completedFilms.find(f => f.workingTitle === offerContext.filmTitle);
        if (!film)
            return { film: null, offer: null, isLifecycle: false, legacyPhase: null };
        // 1. Check for New Lifecycle Offers
        if (film.offers && film.offers.length > 0) {
            const lifeOffer = film.offers.find(o => o.distributor.id === offerContext.distributorId);
            if (lifeOffer) {
                // Map LifecycleOffer to a working structure for state
                return {
                    film,
                    offer: {
                        ...lifeOffer,
                        lumpSum: lifeOffer.upfrontPayment,
                        revenueShare: lifeOffer.revenueShare,
                        installments: { monthlyAmount: lifeOffer.monthlyPayment, months: lifeOffer.durationMonths },
                        totalValue: lifeOffer.totalValueEstimate, // Helper for initial value
                        // Pass existing negotiation state if available
                        savedState: lifeOffer.negotiationState
                    },
                    isLifecycle: true,
                    legacyPhase: null
                };
            }
        }
        // 2. Fallback to Legacy System
        let offerList;
        switch (offerContext.phase) {
            case 'kino':
                offerList = film.cinemaDistributionOffers;
                break;
            case 'home_entertainment':
                offerList = film.homeEntertainmentOffers;
                break;
            case 'pay_tv':
                offerList = film.payTvOffers;
                break;
            case 'free_tv':
                offerList = film.freeTvOffers;
                break;
        }
        const legacyOffer = offerList?.find(o => o.distributor.id === offerContext.distributorId);
        return { film, offer: legacyOffer, isLifecycle: false, legacyPhase: offerContext.phase };
    }, [playerData, offerContext]);
    // Initialize state from saved negotiation state OR default values
    const [willingness, setWillingness] = useState(offer?.savedState?.willingness ?? 100);
    // lastOffer is the ORIGINAL offer (baseline)
    const [originalOffer] = useState(offer);
    // currentOffer is the modified one (either from save or fresh copy)
    const [currentOffer, setCurrentOffer] = useState(() => {
        if (offer?.savedState?.currentOffer) {
            // Merge saved values back into full offer structure
            return {
                ...offer,
                lumpSum: offer.savedState.currentOffer.lumpSum,
                revenueShare: offer.savedState.currentOffer.revenueShare,
                installments: offer.savedState.currentOffer.installments ? { ...offer.installments, ...offer.savedState.currentOffer.installments } : offer.installments
            };
        }
        return offer;
    });
    const [feedback, setFeedback] = useState(t.marketing.negotiation.feedbackDefault);
    const [dealIsBroken, setDealIsBroken] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [shake, setShake] = useState(false); // For visual feedback on risk
    // Auto-calculate release date (3-6 weeks, Thursday)
    // Updated Logic: Runs for ALL deal types now, as every deal needs a start date.
    useEffect(() => {
        if (selectedDate || !playerData)
            return;
        let targetDate;
        const savedDateStr = offer?.savedState?.plannedReleaseDate;
        if (savedDateStr) {
            // 1. Try to use saved date
            targetDate = new Date(savedDateStr);
            const minDate = new Date(playerData.gameDate);
            minDate.setDate(minDate.getDate() + 21); // Minimum buffer: 3 weeks (21 days)
            // If saved date is too soon (e.g. player waited 2 weeks), shift it forward by weeks
            while (targetDate < minDate) {
                targetDate.setDate(targetDate.getDate() + 7);
            }
        }
        else {
            // 2. Generate fresh date (3-6 weeks) if no saved state
            const minDays = 21;
            const maxDays = 42;
            const randomAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
            targetDate = new Date(playerData.gameDate);
            targetDate.setDate(targetDate.getDate() + randomAdd);
            // Adjust to next Thursday (Day 4)
            const day = targetDate.getDay();
            const daysUntilThursday = (4 - day + 7) % 7;
            targetDate.setDate(targetDate.getDate() + daysUntilThursday);
        }
        setSelectedDate(targetDate.toISOString());
    }, [playerData, selectedDate, offer]);
    if (!playerData || !film || !offer)
        return null;
    // Function to calculate willingness cost based on skill
    const calculateCost = (baseCost) => {
        const skill = playerData.negotiationSkill || 0;
        // Skill reduces cost. Max skill (100) reduces cost by 50%.
        const skillFactor = 1 - (skill / 200);
        // Tier Factor: Higher tier distributors are tougher
        const tierFactor = 1 + (offer.distributor.tier * 0.1);
        // Random variance +/- 20%
        const variance = 0.8 + Math.random() * 0.4;
        return baseCost * skillFactor * tierFactor * variance;
    };
    const handleDemandLumpSum = () => {
        if (dealIsBroken)
            return;
        // Increase by ~2% or 1000 minimum
        const increase = Math.max(1000, Math.round(currentOffer.lumpSum * 0.02 / 100) * 100);
        const newAmount = currentOffer.lumpSum + increase;
        // Base Cost 18 allows roughly 6-8 clicks for skilled players (100-0)
        const cost = calculateCost(18);
        updateNegotiation(cost, { lumpSum: newAmount });
    };
    const handleDemandShare = () => {
        if (dealIsBroken)
            return;
        // Increase by 0.2% (very small steps for share)
        const increase = 0.002;
        const newShare = Math.min(0.60, currentOffer.revenueShare + increase);
        // Share is harder to negotiate -> Base Cost 22
        const cost = calculateCost(22);
        updateNegotiation(cost, { revenueShare: newShare });
    };
    const handleDemandMonthly = () => {
        if (dealIsBroken || !currentOffer.installments)
            return;
        // Increase by ~1% or 50 minimum (very small steps)
        const increase = Math.max(50, Math.round(currentOffer.installments.monthlyAmount * 0.01 / 10) * 10);
        const newAmount = currentOffer.installments.monthlyAmount + increase;
        // Base Cost 15 allows slightly more wiggle room here
        const cost = calculateCost(15);
        updateNegotiation(cost, { installments: { ...currentOffer.installments, monthlyAmount: newAmount } });
    };
    const updateNegotiation = (cost, changes) => {
        const newWillingness = willingness - cost;
        setWillingness(newWillingness);
        if (newWillingness <= 0) {
            setDealIsBroken(true);
            setFeedback(t.marketing.negotiation.feedbackBroke);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
        else {
            setCurrentOffer((prev) => ({ ...prev, ...changes }));
            // Random Feedback
            const feedbacks = t.marketing.negotiation.feedbacks;
            if (newWillingness < 30)
                setFeedback(t.marketing.negotiation.feedbackWarning);
            else
                setFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
        }
    };
    // Calculate Total Value for UI - GUARANTEED VALUE ONLY
    const currentTotalValue = useMemo(() => {
        let val = currentOffer.lumpSum;
        if (currentOffer.installments) {
            val += (currentOffer.installments.monthlyAmount * currentOffer.installments.months);
        }
        // Removed estimated revenue share to show guaranteed value only
        return val;
    }, [currentOffer.lumpSum, currentOffer.installments]);
    const originalTotalValue = useMemo(() => {
        let val = originalOffer.lumpSum;
        if (originalOffer.installments) {
            val += (originalOffer.installments.monthlyAmount * originalOffer.installments.months);
        }
        // Removed estimated revenue share to show guaranteed value only
        return val;
    }, [originalOffer]);
    const profitIncrease = currentTotalValue - originalTotalValue;
    const handleAcceptFinalOffer = () => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            const filmToUpdate = prev.completedFilms.find(f => f.workingTitle === film.workingTitle);
            if (!filmToUpdate)
                return null;
            let updatedFilmData = { ...filmToUpdate, nextOfferDate: undefined };
            let transactionAmount = 0;
            const newTransactions = [...prev.transactionLog];
            // No longer copying messages twice!
            const saleDate = new Date(prev.gameDate);
            let phaseName = isLifecycle ? t.marketing.negotiation.lifecyclePhase : (legacyPhase ? t.marketing.negotiation.distributionPhase : (language === 'de' ? 'Verleih' : 'Distribution'));
            // 1. Process Upfront Payment
            if (currentOffer.lumpSum > 0) {
                transactionAmount += currentOffer.lumpSum;
                newTransactions.push({
                    date: saleDate, type: 'Einnahme', category: 'Filmverleih',
                    description: `${t.transactionDescriptions.lumpSumPayment.replace('{phase}', phaseName).replace('{filmTitle}', film.workingTitle)}`,
                    amount: currentOffer.lumpSum, descriptionKey: 'lumpSumPayment', descriptionVars: { phase: phaseName, filmTitle: film.workingTitle }
                });
            }
            // Calculate Total Guaranteed
            const totalGuaranteed = currentOffer.lumpSum + (currentOffer.installments.monthlyAmount * currentOffer.installments.months);
            // 1b. Create Confirmation Message
            const confirmMsg = {
                id: `msg_deal_confirm_${Date.now()}`,
                date: new Date(prev.gameDate),
                sender: currentOffer.distributor.name,
                subjectTemplate: { key: 'marketing.offerMessage.dealConfirmationSubject', variables: { filmTitle: film.workingTitle } },
                bodyTemplate: {
                    key: 'marketing.offerMessage.dealConfirmationBody',
                    variables: {
                        filmTitle: film.workingTitle,
                        lumpSum: formatCurrency(currentOffer.lumpSum, locale),
                        installments: `${formatCurrency(currentOffer.installments.monthlyAmount, locale)} / ${language === 'de' ? 'Monat' : 'month'} (${currentOffer.installments.months} ${language === 'de' ? 'Monate' : 'months'})`,
                        totalSum: formatCurrency(totalGuaranteed, locale),
                        revenueShare: (currentOffer.revenueShare * 100).toFixed(1),
                        duration: currentOffer.installments.months,
                        distributorName: currentOffer.distributor.name
                    }
                },
                read: false,
                linkedProject: film // SHOW COVER IN CONFIRMATION
            };
            const chosenStartDate = new Date(selectedDate);
            // 2. Set Active Deal / Legacy Status
            if (isLifecycle) {
                const phases = currentOffer.phases || { cinemaMonths: 0, homeVideoMonths: 6, payTvMonths: 6, freeTvMonths: 12 };
                // Helper: Calculate absolute Dates based on phase durations
                const calcDate = (base, months) => {
                    const d = new Date(base);
                    d.setMonth(d.getMonth() + months);
                    return d;
                };
                // Calculate total lifecycle duration to set correct endDate
                const totalLifecycleMonths = phases.cinemaMonths + phases.homeVideoMonths + phases.payTvMonths + phases.freeTvMonths;
                // Calculate timeline based on chosen start date
                const homeStart = phases.cinemaMonths > 0 ? calcDate(chosenStartDate, phases.cinemaMonths) : chosenStartDate;
                const payStart = phases.homeVideoMonths > 0 ? calcDate(homeStart, phases.homeVideoMonths) : homeStart;
                const freeStart = phases.payTvMonths > 0 ? calcDate(payStart, phases.payTvMonths) : payStart;
                // NEW: Create Lifecycle Distribution Deal
                const newDeal = {
                    distributorId: currentOffer.distributor.id,
                    distributorName: currentOffer.distributor.name,
                    startDate: chosenStartDate, // Use the selected date (important for cinema)
                    signedDate: saleDate, // Track when it was signed
                    durationMonths: currentOffer.installments.months,
                    // FIX: End Date must be based on total phase duration, not installment duration
                    endDate: new Date(new Date(chosenStartDate).setMonth(chosenStartDate.getMonth() + totalLifecycleMonths)),
                    upfrontPayment: currentOffer.lumpSum,
                    monthlyPayment: currentOffer.installments.monthlyAmount,
                    revenueShare: currentOffer.revenueShare,
                    phases: phases,
                    currentPhase: 'waiting_for_release', // ALWAYS wait for the date
                    monthsPassed: 0,
                    totalEarnings: currentOffer.lumpSum,
                    // Pre-calculate transition dates for useFinanceLoop
                    nextPhaseStartDate: chosenStartDate, // Trigger start on this date
                    homeEntertainmentStartDate: homeStart,
                    payTvStartDate: payStart,
                    freeTvStartDate: freeStart,
                };
                updatedFilmData.activeDeal = newDeal;
                updatedFilmData.offers = []; // Clear offers
                // Also initialize legacy fields for backward compatibility view AND logic
                if (phases.cinemaMonths > 0) {
                    updatedFilmData.cinemaRelease = {
                        status: 'planning', // IMPORTANT: Starts in planning, waits for date
                        distributorName: currentOffer.distributor.name,
                        distributorId: currentOffer.distributor.id,
                        lumpSum: currentOffer.lumpSum,
                        revenueShare: currentOffer.revenueShare,
                        releaseDate: chosenStartDate,
                        weeksInCharts: 0, // FIX: Initialize explicitly to avoid NaN
                        viewers: 0,
                        totalViewers: 0,
                        totalPlayerRevenue: 0,
                        chartQuality: film.finalQuality || 50
                    };
                }
                else if (phases.homeVideoMonths > 0) {
                    updatedFilmData.homeEntertainment = {
                        status: 'active',
                        distributorName: currentOffer.distributor.name,
                        distributorId: currentOffer.distributor.id,
                        lumpSum: currentOffer.lumpSum,
                        saleDate: chosenStartDate,
                        endDate: new Date(new Date(chosenStartDate).setMonth(chosenStartDate.getMonth() + phases.homeVideoMonths)),
                        contractDurationMonths: phases.homeVideoMonths
                    };
                }
                else if (phases.payTvMonths > 0) {
                    // Legacy PayTV fallback (visual)
                    updatedFilmData.payTv = {
                        status: 'active',
                        distributorName: currentOffer.distributor.name,
                        distributorId: currentOffer.distributor.id,
                        lumpSum: currentOffer.lumpSum,
                        saleDate: chosenStartDate,
                        endDate: new Date(new Date(chosenStartDate).setMonth(chosenStartDate.getMonth() + phases.payTvMonths)),
                        contractDurationMonths: phases.payTvMonths
                    };
                }
            }
            else {
                // ... Legacy Handling (Kino, TV, etc.) ...
                switch (legacyPhase) {
                    case 'kino':
                        updatedFilmData.cinemaRelease = {
                            status: 'planning', distributorName: currentOffer.distributor.name, distributorId: currentOffer.distributor.id,
                            lumpSum: currentOffer.lumpSum, revenueShare: currentOffer.revenueShare, releaseDate: chosenStartDate,
                            weeksInCharts: 0, // FIX: Initialize explicitly to avoid NaN
                            viewers: 0,
                            totalViewers: 0,
                            totalPlayerRevenue: 0,
                            chartQuality: film.finalQuality || 50
                        };
                        updatedFilmData.cinemaDistributionOffers = [];
                        break;
                    // ... other legacy cases omitted for brevity
                }
            }
            const updatedFilms = prev.completedFilms.map(f => f.workingTitle === film.workingTitle ? updatedFilmData : f);
            // Mark original message as accepted AND other offers as rejected in ONE pass
            const updatedMessages = prev.messages.map(m => {
                if (m.offerContext && m.offerContext.filmTitle === film.workingTitle) {
                    // Match distributor ID
                    if (m.offerContext.distributorId === currentOffer.distributor.id) {
                        return { ...m, offerContext: { ...m.offerContext, isAccepted: true, isRejected: false } };
                    }
                    else {
                        // Auto-reject others for same film (Lifecycle covers everything)
                        if (isLifecycle)
                            return { ...m, offerContext: { ...m.offerContext, isRejected: true } };
                    }
                }
                return m;
            });
            return {
                ...prev,
                capital: prev.capital + transactionAmount,
                completedFilms: updatedFilms,
                transactionLog: newTransactions,
                messages: [...updatedMessages, confirmMsg] // Append confirmation message to updated list
            };
        });
        onClose();
    };
    const handleCloseNegotiation = () => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            let updatedMessages = [...prev.messages];
            let updatedFilms = [...prev.completedFilms];
            if (dealIsBroken) {
                // Mark message as failed
                updatedMessages = updatedMessages.map(m => {
                    if (m.offerContext?.filmTitle === film.workingTitle && m.offerContext.distributorId === offer.distributor.id) {
                        return { ...m, offerContext: { ...m.offerContext, isNegotiationFailed: true } };
                    }
                    return m;
                });
                // Mark Offer as failed in film data
                if (isLifecycle) {
                    updatedFilms = updatedFilms.map(f => {
                        if (f.workingTitle === film.workingTitle && f.offers) {
                            const updatedOffers = f.offers.map(o => {
                                if (o.distributor.id === offer.distributor.id) {
                                    return { ...o, status: 'failed' };
                                }
                                return o;
                            });
                            return { ...f, offers: updatedOffers };
                        }
                        return f;
                    });
                }
            }
            else if (isLifecycle) {
                // Save state (including the calculated date!) if just cancelling (only for lifecycle offers)
                updatedFilms = updatedFilms.map(f => {
                    if (f.workingTitle === film.workingTitle && f.offers) {
                        const updatedOffers = f.offers.map(o => {
                            if (o.distributor.id === offer.distributor.id) {
                                return {
                                    ...o,
                                    negotiationState: {
                                        willingness: willingness,
                                        plannedReleaseDate: selectedDate, // SAVE DATE HERE
                                        currentOffer: {
                                            lumpSum: currentOffer.lumpSum,
                                            revenueShare: currentOffer.revenueShare,
                                            installments: currentOffer.installments
                                        }
                                    }
                                };
                            }
                            return o;
                        });
                        return { ...f, offers: updatedOffers };
                    }
                    return f;
                });
            }
            return { ...prev, messages: updatedMessages, completedFilms: updatedFilms };
        });
        onClose();
    };
    // Check if cinema release is part of the deal (either legacy or lifecycle)
    const isCinemaDeal = legacyPhase === 'kino' || (isLifecycle && offer.phases?.cinemaMonths > 0);
    const showRevenueShare = isLifecycle || legacyPhase === 'kino';
    const showInstallments = isLifecycle || (offer.installments && offer.installments.monthlyAmount > 0);
    // Resolve strategy text and phases string for contract
    const strategyKey = offer.strategyType || 'free_tv_dump';
    let activePhases = [];
    if (strategyKey === 'cinema_release')
        activePhases = ['cinema', 'home', 'pay', 'free'];
    else if (strategyKey === 'direct_to_video')
        activePhases = ['home', 'pay', 'free'];
    else if (strategyKey === 'tv_premiere')
        activePhases = ['pay', 'free'];
    else
        activePhases = ['free'];
    const phasesString = activePhases.map(k => t.marketing.negotiation.phases[k]).join(', ');
    const contractSubject = t.marketing.negotiation.contractSubject.replace('{filmTitle}', film.workingTitle);
    const contractBody = t.marketing.negotiation.contractBody
        .replace(/{studioName}/g, playerData.studioName)
        .replace(/{distributorName}/g, offer.distributor.name)
        .replace(/{phases}/g, phasesString);
    // Determine start label based on first phase
    let startLabel = t.marketing.negotiation.startLabels.default;
    if (activePhases[0] === 'cinema')
        startLabel = t.marketing.negotiation.startLabels.cinema;
    else if (activePhases[0] === 'home')
        startLabel = t.marketing.negotiation.startLabels.home;
    else if (activePhases[0] === 'pay')
        startLabel = t.marketing.negotiation.startLabels.pay;
    else if (activePhases[0] === 'free')
        startLabel = t.marketing.negotiation.startLabels.free;
    return (_jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4", onClick: handleCloseNegotiation, children: _jsxs("div", { className: `bg-gray-900 text-gray-200 rounded-sm shadow-2xl w-full max-w-4xl flex flex-col relative border border-gray-700 ${shake ? 'animate-shake' : ''}`, style: {
                fontFamily: '"Times New Roman", serif',
                minHeight: '80vh',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }, onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "p-8 border-b border-gray-700 flex justify-between items-start bg-gray-950", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h1", { className: "text-4xl font-bold font-cinzel text-amber-500 tracking-wider mb-2 uppercase", children: t.marketing.negotiation.title.replace('{distributorName}', '') }), _jsx("h2", { className: "text-xl font-bold font-cinzel text-white", children: offer.distributor.name })] }), _jsxs("div", { className: "text-right flex flex-col items-end", children: [_jsx("div", { className: "border-2 border-amber-500/50 rounded-full w-24 h-24 flex items-center justify-center -rotate-12 bg-gray-900", children: _jsxs("span", { className: "text-amber-500 font-bold text-center text-xs uppercase font-cinzel", children: ["Official", _jsx("br", {}), "Offer"] }) }), _jsxs("p", { className: "text-gray-500 text-xs mt-2 font-mono", children: ["ID: ", offerContext.distributorId, "-", Date.now().toString().slice(-4)] })] })] }), _jsxs("div", { className: "flex-grow flex flex-col md:flex-row", children: [_jsxs("div", { className: "w-full md:w-2/3 p-8 flex flex-col border-r border-gray-700 border-dashed relative", children: [dealIsBroken && (_jsx("div", { className: "absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none", children: _jsx("div", { className: "border-4 border-red-600 text-red-600 font-bold text-4xl uppercase px-8 py-4 -rotate-12 bg-black opacity-90 shadow-2xl", style: { fontFamily: 'Courier New' }, children: t.marketing.negotiation.feedbackRejected }) })), _jsxs("div", { className: "mb-6 text-sm text-gray-400 leading-relaxed text-justify font-sans", children: [_jsxs("p", { children: [_jsx("strong", { className: "text-gray-200", children: "Re:" }), " ", contractSubject] }), _jsx("p", { className: "mt-2", children: contractBody })] }), _jsxs("div", { className: "bg-gray-800 border border-gray-600 p-6 shadow-sm rounded-sm mb-4 relative", children: [_jsx("div", { className: "absolute -top-3 left-4 bg-gray-900 px-2 text-sm font-bold text-amber-500 uppercase tracking-widest font-sans border border-gray-700 rounded", children: t.marketing.negotiation.conditions }), _jsxs("div", { className: "space-y-2 pt-2", children: [_jsx(NegotiationRow, { label: t.marketing.negotiation.lumpSum, valueDisplay: formatCurrency(currentOffer.lumpSum, locale), onDemandMore: handleDemandLumpSum, disabled: dealIsBroken, btnLabel: t.marketing.negotiation.demandMore }), showRevenueShare && (_jsx(NegotiationRow, { label: t.marketing.negotiation.revenueShare, valueDisplay: `${(currentOffer.revenueShare * 100).toFixed(1)}%`, onDemandMore: handleDemandShare, disabled: dealIsBroken, btnLabel: t.marketing.negotiation.demandMore })), showInstallments && currentOffer.installments && (_jsx(NegotiationRow, { label: t.marketing.negotiation.monthlyInstallment.replace('{months}', currentOffer.installments.months), valueDisplay: formatCurrency(currentOffer.installments.monthlyAmount || 0, locale), onDemandMore: handleDemandMonthly, disabled: dealIsBroken, btnLabel: t.marketing.negotiation.demandMore }))] })] }), _jsxs("div", { className: "bg-gray-800 border border-gray-600 p-4 shadow-sm rounded-sm mb-6 flex items-center gap-4", children: [_jsx("div", { className: "font-bold text-gray-400 font-serif uppercase text-sm", children: startLabel }), _jsx("div", { className: "bg-gray-900 border border-gray-700 text-amber-400 px-4 py-1.5 rounded font-mono font-bold flex-grow text-center", children: selectedDate ? new Date(selectedDate).toLocaleDateString(locale) : '...' })] }), _jsx("div", { className: "mt-auto", children: _jsx(ProgressBar, { progress: willingness, color: willingness < 30 ? 'bg-red-600' : 'bg-green-600', label: t.marketing.negotiation.willingness }) })] }), _jsxs("div", { className: "w-full md:w-1/3 p-6 bg-gray-800 flex flex-col", children: [_jsx("h3", { className: "font-bold text-gray-500 uppercase tracking-widest text-xs mb-4 border-b border-gray-600 pb-2", children: t.marketing.negotiation.statusReport }), _jsxs("div", { className: "space-y-4 mb-8", children: [_jsxs("div", { className: "bg-gray-900/50 p-4 border border-gray-700 shadow-sm rounded-sm", children: [_jsx("p", { className: "text-xs text-gray-500 font-bold uppercase mb-1", children: t.marketing.negotiation.originalOffer }), _jsxs("div", { className: "text-right font-mono text-gray-400", children: [_jsx("div", { className: "font-bold", children: formatCurrency(originalTotalValue, locale) }), _jsx("p", { className: "text-[10px] text-gray-600 mt-1 italic", children: t.marketing.negotiation.guaranteed })] })] }), _jsxs("div", { className: "bg-gray-700 p-4 border-l-4 border-blue-500 shadow-md rounded-sm", children: [_jsx("p", { className: "text-xs text-blue-400 font-bold uppercase mb-1", children: t.marketing.negotiation.currentValue }), _jsxs("div", { className: "text-right font-mono text-white", children: [_jsx("div", { className: "font-bold text-2xl", children: formatCurrency(currentTotalValue, locale) }), profitIncrease > 0 && (_jsxs("div", { className: "text-sm text-green-400 mt-1", children: ["+", formatCurrency(profitIncrease, locale)] })), _jsx("p", { className: "text-[10px] text-gray-400 mt-2 italic", children: t.marketing.negotiation.guaranteed })] })] })] }), _jsx("div", { className: "flex-grow flex items-center justify-center p-4", children: _jsxs("p", { className: `font-serif italic text-lg text-center leading-relaxed ${dealIsBroken ? 'text-red-500 font-bold' :
                                            willingness < 30 ? 'text-orange-400' : 'text-gray-400'}`, children: ["\"", feedback, "\""] }) })] })] }), _jsx("div", { className: "p-6 bg-gray-950 border-t border-gray-700 flex justify-between items-center gap-4", children: dealIsBroken ? (_jsx("div", { className: "w-full flex justify-center", children: _jsx("button", { onClick: handleCloseNegotiation, className: "bg-gray-700 text-white font-bold py-3 px-8 rounded shadow-md hover:bg-gray-600 font-serif w-full max-w-xs", children: t.marketing.negotiation.abortNegotiation }) })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex gap-2", children: _jsx("button", { onClick: () => setConfirmation('cancel'), className: "bg-transparent text-gray-400 font-bold py-2 px-4 hover:text-red-400 hover:underline font-serif", children: t.marketing.negotiation.cancel }) }), _jsx("div", { className: "flex gap-4", children: _jsxs("button", { onClick: () => setConfirmation('accept'), className: "bg-green-800 hover:bg-green-700 text-white font-bold py-3 px-12 rounded shadow-md uppercase tracking-wider font-serif text-sm border border-green-600 flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: "\u270D" }), " ", t.marketing.negotiation.signContract] }) })] })) }), confirmation && (_jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20", children: _jsxs("div", { className: "bg-gray-800 text-gray-200 p-8 shadow-2xl max-w-md w-full transform rotate-1 border-2 border-amber-600 rounded-lg", children: [confirmation === 'accept' ? (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-2xl font-bold font-cinzel text-amber-500 mb-4 text-center border-b border-gray-600 pb-2", children: t.marketing.negotiation.sealDeal }), _jsxs("div", { className: "space-y-4 mb-6 font-mono text-sm", children: [_jsxs("div", { className: "flex justify-between items-center bg-gray-900 p-2 rounded", children: [_jsx("span", { children: t.marketing.negotiation.totalValueLabel }), _jsx("strong", { className: "text-green-400 text-lg", children: formatCurrency(currentTotalValue, locale) })] }), profitIncrease > 0 && (_jsx("p", { className: "text-center text-gray-400 text-xs", children: t.marketing.negotiation.bonusGain.replace('{amount}', formatCurrency(profitIncrease, locale)) })), isCinemaDeal && _jsxs("div", { className: "flex justify-between text-blue-400 pt-2 border-t border-gray-600 mt-2", children: [_jsx("span", { children: t.marketing.negotiation.start }), " ", _jsx("strong", { children: selectedDate ? new Date(selectedDate).toLocaleDateString(locale) : '-' })] })] }), _jsx("p", { className: "text-center italic mb-6 text-gray-500", children: t.marketing.negotiation.binding })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-2xl font-bold font-cinzel text-red-500 mb-4 text-center", children: t.marketing.negotiation.abortTitle }), _jsx("p", { className: "text-gray-400 mb-6 text-center", children: t.marketing.negotiation.abortText })] })), _jsxs("div", { className: "flex justify-around gap-4", children: [_jsx("button", { onClick: () => setConfirmation(null), className: "flex-1 py-3 text-gray-500 font-bold hover:text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors", children: t.marketing.negotiation.back }), _jsx("button", { onClick: () => {
                                            if (confirmation === 'accept') {
                                                handleAcceptFinalOffer();
                                            }
                                            else {
                                                handleCloseNegotiation();
                                            }
                                            setConfirmation(null);
                                        }, className: "flex-1 bg-amber-600 text-black font-bold py-3 rounded shadow hover:bg-amber-500 font-serif", children: confirmation === 'accept' ? t.marketing.negotiation.sign : t.marketing.negotiation.end })] })] }) }))] }) }));
};
export default NegotiationModal;
