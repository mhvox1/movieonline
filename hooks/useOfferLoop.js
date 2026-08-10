import { useEffect } from 'react';
import { generateLifecycleOffers } from '../components/offerGenerator';
import { ALL_DISTRIBUTORS } from '../components/distributors';
import { useTranslation } from './useTranslation';
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to check if dates are the same day (ignoring time)
const isSameDay = (d1, d2) => {
    if (!d2)
        return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
};
export const useOfferLoop = ({ playerData, setPlayerData, systemPause, pauseOnMessage }) => {
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    useEffect(() => {
        setPlayerData((currentData) => {
            if (!currentData)
                return null;
            const newDate = new Date(currentData.gameDate);
            let dataChanged = false;
            let newMessages = [];
            // Track which offers got an update so we can disable buttons on old messages
            const supersededKeys = [];
            const newState = { ...currentData };
            // --- SYNCHRONIZATION STEP ---
            // Ensure Offer Status matches Message Status to prevent ghost reminders
            // If a message says "Rejected" or "Failed", the offer MUST be rejected/failed.
            newState.completedFilms = newState.completedFilms.map(film => {
                if (!film.offers || film.offers.length === 0)
                    return film;
                let filmSyncChanged = false;
                const syncedOffers = film.offers.map(offer => {
                    // Check messages for this specific offer
                    const relevantMsg = newState.messages.find(m => m.offerContext &&
                        m.offerContext.filmTitle === film.workingTitle &&
                        m.offerContext.distributorId === offer.distributor.id);
                    if (relevantMsg && relevantMsg.offerContext) {
                        const ctx = relevantMsg.offerContext;
                        // Force status sync if message indicates a closed state but offer is still active
                        if (offer.status === 'active') {
                            if (ctx.isRejected) {
                                return { ...offer, status: 'rejected' };
                            }
                            if (ctx.isNegotiationFailed) {
                                return { ...offer, status: 'failed' };
                            }
                            if (ctx.isWithdrawn) {
                                return { ...offer, status: 'withdrawn' };
                            }
                        }
                    }
                    return offer;
                });
                // Check if any offer was actually updated
                if (JSON.stringify(syncedOffers) !== JSON.stringify(film.offers)) {
                    filmSyncChanged = true;
                    dataChanged = true; // Mark global data as changed
                    return { ...film, offers: syncedOffers };
                }
                return film;
            });
            // --- END SYNC ---
            const filmsToUpdate = newState.completedFilms.map(film => {
                // Ignore if deal active or no next offer date set
                if (film.activeDeal || !film.nextOfferDate)
                    return film;
                const filmTitle = film.workingTitle || 'Unbekannter Film';
                const safeFilmId = String(filmTitle).replace(/\s/g, '');
                let updatedFilm = { ...film };
                let filmChanged = false;
                // -------------------------------------------------------------
                // 1. GENERATE INITIAL OR NEW OFFERS (25-40 days cycle)
                // -------------------------------------------------------------
                if (newDate >= new Date(film.nextOfferDate)) {
                    const currentOffers = updatedFilm.offers || [];
                    // Filter out distributors who already made an offer (active or not)
                    const existingDistributorIds = new Set(currentOffers.map(o => o.distributor.id));
                    const availableDistributors = ALL_DISTRIBUTORS.filter(d => !existingDistributorIds.has(d.id));
                    // If it's the very first batch (no offers yet)
                    if (currentOffers.length === 0) {
                        // FIX: Generate EXACTLY 1 initial offer to avoid hidden background offers
                        const initialOffers = generateLifecycleOffers(updatedFilm, ALL_DISTRIBUTORS, newState, 1);
                        const bestOffer = initialOffers[0];
                        if (bestOffer) {
                            const strategyType = bestOffer.strategyType || 'free_tv_dump';
                            let subjectKey = 'marketing.offerMessage.freeTvSubject';
                            if (strategyType === 'cinema_release')
                                subjectKey = 'marketing.offerMessage.kinoSubject';
                            else if (strategyType === 'direct_to_video')
                                subjectKey = 'marketing.offerMessage.homeSubject';
                            else if (strategyType === 'tv_premiere')
                                subjectKey = 'marketing.offerMessage.payTvSubject';
                            const lastName = newState.playerName.split(' ').pop() || newState.playerName;
                            const salutationKey = newState.gender === 'männlich' ? 'marketing.offerMessage.salutationMale' : 'marketing.offerMessage.salutationFemale';
                            const bodyTextKey = `marketing.offerGenerator.strategy.${strategyType}`;
                            const newMessage = {
                                id: `msg_offer_${newDate.getTime()}_${safeFilmId}`,
                                date: newDate,
                                sender: bestOffer.distributor.name,
                                subjectTemplate: { key: subjectKey, variables: { filmTitle } },
                                bodyTemplate: {
                                    key: 'offer',
                                    variables: {
                                        salutationKey, lastName, filmTitle, distributorName: bestOffer.distributor.name,
                                        bodyTextKey, lumpSum: bestOffer.upfrontPayment, installmentsMonths: bestOffer.durationMonths,
                                        installmentsAmount: bestOffer.monthlyPayment, hasInstallments: bestOffer.monthlyPayment > 0,
                                        revenueShare: bestOffer.revenueShare, contractDurationMonths: bestOffer.durationMonths, totalValue: bestOffer.totalValueEstimate
                                    }
                                },
                                read: false,
                                offerContext: { filmTitle, distributorId: bestOffer.distributor.id, phase: 'kino' }, // phase is legacy fallback
                                linkedProject: film // ADDED: Enable Cover in Email
                            };
                            newMessages.push(newMessage);
                        }
                        updatedFilm.offers = initialOffers;
                        filmChanged = true;
                    }
                    // Else: Add ONE new offer if available (Cycle 25-40 days)
                    else if (availableDistributors.length > 0) {
                        const newOfferList = generateLifecycleOffers(updatedFilm, availableDistributors, newState, 1);
                        if (newOfferList.length > 0) {
                            const newOffer = newOfferList[0];
                            updatedFilm.offers = [...currentOffers, newOffer];
                            filmChanged = true;
                            // Send "New Offer" Notification
                            const lastName = newState.playerName.split(' ').pop() || newState.playerName;
                            const salutationKey = newState.gender === 'männlich' ? 'marketing.offerMessage.salutationMale' : 'marketing.offerMessage.salutationFemale';
                            const strategyType = newOffer.strategyType || 'free_tv_dump';
                            const bodyTextKey = `marketing.offerGenerator.strategy.${strategyType}`;
                            let subjectKey = 'marketing.offerMessage.kinoSubject';
                            if (strategyType === 'direct_to_video')
                                subjectKey = 'marketing.offerMessage.homeSubject';
                            else if (strategyType === 'tv_premiere')
                                subjectKey = 'marketing.offerMessage.payTvSubject';
                            else if (strategyType === 'free_tv_dump')
                                subjectKey = 'marketing.offerMessage.freeTvSubject';
                            const newMessage = {
                                id: `msg_new_offer_${newDate.getTime()}_${newOffer.distributor.id}`,
                                date: newDate,
                                sender: newOffer.distributor.name,
                                subjectTemplate: { key: subjectKey, variables: { filmTitle } },
                                bodyTemplate: {
                                    key: 'offer',
                                    variables: {
                                        salutationKey, lastName, filmTitle, distributorName: newOffer.distributor.name,
                                        bodyTextKey, lumpSum: newOffer.upfrontPayment, installmentsMonths: newOffer.durationMonths,
                                        installmentsAmount: newOffer.monthlyPayment, hasInstallments: newOffer.monthlyPayment > 0,
                                        revenueShare: newOffer.revenueShare, contractDurationMonths: newOffer.durationMonths, totalValue: newOffer.totalValueEstimate
                                    }
                                },
                                read: false,
                                offerContext: { filmTitle, distributorId: newOffer.distributor.id, phase: 'kino' },
                                linkedProject: film // ADDED: Enable Cover in Email
                            };
                            newMessages.push(newMessage);
                        }
                    }
                    // Set next NEW OFFER date (25-40 days)
                    const nextCheck = new Date(newDate);
                    nextCheck.setDate(nextCheck.getDate() + randomBetween(25, 40));
                    updatedFilm.nextOfferDate = nextCheck;
                    filmChanged = true;
                }
                // -------------------------------------------------------------
                // 2. MANAGE EXISTING OFFERS (3-Stage Logic)
                // -------------------------------------------------------------
                if (updatedFilm.offers && updatedFilm.offers.length > 0) {
                    let activeOffers = [...updatedFilm.offers];
                    let offersModified = false;
                    const lastName = newState.playerName.split(' ').pop() || newState.playerName;
                    const salutationKey = newState.gender === 'männlich' ? 'marketing.offerMessage.salutationMale' : 'marketing.offerMessage.salutationFemale';
                    // Iterate backwards to allow removal
                    for (let i = activeOffers.length - 1; i >= 0; i--) {
                        const offer = activeOffers[i];
                        // Strict check: Only process active offers.
                        // The synchronization step above ensures this is accurate with message history.
                        if (offer.status !== 'active')
                            continue;
                        // Guard: Only one action per day per offer
                        if (offer.lastInteractionDate && isSameDay(newDate, offer.lastInteractionDate)) {
                            continue;
                        }
                        // Check if interaction date is reached
                        if (newDate >= new Date(offer.nextInteractionDate)) {
                            const roll = Math.random();
                            let action = null;
                            const count = offer.followUpCount; // 0 (start), 1 (after 10-15d), 2 (after +10-15d)
                            // Stage Logic:
                            // Message 1 was the initial offer (Count 0).
                            // Now comes the 2nd Message (Count 0 -> 1)
                            if (count === 0) {
                                // 2nd Message (approx 10-15 days after offer)
                                if (roll < 0.70)
                                    action = 'remind'; // 70%
                                else if (roll < 0.90)
                                    action = 'improve'; // 20%
                                else
                                    action = 'withdraw'; // 10%
                            }
                            // Now comes the 3rd Message (Count 1 -> 2)
                            else if (count === 1) {
                                // 3rd Message (approx 10-15 days later)
                                if (roll < 0.33)
                                    action = 'remind';
                                else if (roll < 0.66)
                                    action = 'improve';
                                else
                                    action = 'withdraw';
                            }
                            // Now comes the 4th Message (Count 2 -> 3)
                            else if (count >= 2) {
                                // 4th Message (approx 10-15 days later)
                                action = 'withdraw';
                            }
                            // Execute Action
                            if (action === 'withdraw') {
                                // Withdraw Offer
                                activeOffers[i].status = 'withdrawn';
                                activeOffers[i].lastInteractionDate = new Date(newDate);
                                const newMessage = {
                                    id: `msg_withdraw_${newDate.getTime()}_${offer.distributor.id}`,
                                    date: newDate,
                                    sender: offer.distributor.name,
                                    subjectTemplate: { key: 'marketing.offerMessage.withdrawSubject', variables: { filmTitle } },
                                    bodyTemplate: {
                                        key: 'withdraw',
                                        variables: {
                                            salutationKey, lastName, filmTitle, distributorName: offer.distributor.name
                                        }
                                    },
                                    read: false,
                                    offerContext: { filmTitle, distributorId: offer.distributor.id, phase: 'kino', isWithdrawn: true },
                                    linkedProject: film // ADDED: Enable Cover in Email
                                };
                                newMessages.push(newMessage);
                                offersModified = true;
                                supersededKeys.push(`${filmTitle}_${offer.distributor.id}`);
                            }
                            else if (action === 'improve') {
                                // Improve Offer - back to 5-10% range
                                const improvements = { ...offer };
                                // Ensure meaningful increase (5% to 10%)
                                const baseUpfront = Math.max(offer.upfrontPayment, 10000);
                                const increaseFactor = 1.05 + Math.random() * 0.05; // 1.05 to 1.10
                                // FORCE INTEGER
                                improvements.upfrontPayment = Math.round(baseUpfront * increaseFactor / 1000) * 1000;
                                if (improvements.monthlyPayment > 0) {
                                    const monthlyIncrease = 1.05 + Math.random() * 0.05;
                                    // FORCE INTEGER
                                    improvements.monthlyPayment = Math.round(offer.monthlyPayment * monthlyIncrease / 100) * 100;
                                }
                                // RE-CALCULATE TOTAL FROM ROUNDED COMPONENTS (Guaranteed to be integer)
                                const newTotal = improvements.upfrontPayment + (improvements.monthlyPayment * improvements.durationMonths);
                                improvements.totalValueEstimate = newTotal;
                                improvements.lastInteractionDate = new Date(newDate);
                                // IMPORTANT: Clear negotiation state so the modal uses new values, not old saved ones
                                improvements.negotiationState = undefined;
                                // Schedule next interaction (10-15 days)
                                const nextInteraction = new Date(newDate);
                                nextInteraction.setDate(nextInteraction.getDate() + (10 + Math.floor(Math.random() * 6)));
                                improvements.nextInteractionDate = nextInteraction;
                                improvements.followUpCount = count + 1;
                                activeOffers[i] = improvements;
                                const newMessage = {
                                    id: `msg_improved_${newDate.getTime()}_${offer.distributor.id}`,
                                    date: newDate,
                                    sender: offer.distributor.name,
                                    subjectTemplate: { key: 'marketing.offerMessage.improvedSubject', variables: { filmTitle } },
                                    bodyTemplate: {
                                        key: 'offer',
                                        variables: {
                                            salutationKey, lastName, filmTitle, distributorName: offer.distributor.name,
                                            bodyTextKey: 'marketing.offerGenerator.improvedBody',
                                            lumpSum: improvements.upfrontPayment, installmentsMonths: improvements.durationMonths,
                                            installmentsAmount: improvements.monthlyPayment, hasInstallments: improvements.monthlyPayment > 0,
                                            revenueShare: improvements.revenueShare, contractDurationMonths: improvements.durationMonths,
                                            totalValue: improvements.totalValueEstimate // Explicitly pass new total
                                        }
                                    },
                                    read: false,
                                    offerContext: { filmTitle, distributorId: offer.distributor.id, phase: 'kino' },
                                    linkedProject: film // ADDED: Enable Cover in Email
                                };
                                newMessages.push(newMessage);
                                offersModified = true;
                                supersededKeys.push(`${filmTitle}_${offer.distributor.id}`);
                            }
                            else if (action === 'remind') {
                                // Send Reminder
                                activeOffers[i].lastInteractionDate = new Date(newDate);
                                // Schedule next interaction (10-15 days)
                                const nextInteraction = new Date(newDate);
                                nextInteraction.setDate(nextInteraction.getDate() + (10 + Math.floor(Math.random() * 6)));
                                activeOffers[i].nextInteractionDate = nextInteraction;
                                activeOffers[i].followUpCount = count + 1;
                                const newMessage = {
                                    id: `msg_remind_${newDate.getTime()}_${offer.distributor.id}`,
                                    date: newDate,
                                    sender: offer.distributor.name,
                                    subjectTemplate: { key: 'marketing.offerMessage.reminderSubject', variables: { filmTitle } },
                                    bodyTemplate: {
                                        key: 'reminder',
                                        variables: {
                                            salutationKey, lastName, filmTitle, distributorName: offer.distributor.name,
                                            totalValue: offer.totalValueEstimate // Pass Total Value for Reminder
                                        }
                                    },
                                    read: false,
                                    offerContext: { filmTitle, distributorId: offer.distributor.id, phase: 'kino' },
                                    linkedProject: film // ADDED: Enable Cover in Email
                                };
                                newMessages.push(newMessage);
                                offersModified = true;
                                supersededKeys.push(`${filmTitle}_${offer.distributor.id}`);
                            }
                        }
                    }
                    if (offersModified) {
                        updatedFilm.offers = activeOffers;
                        filmChanged = true;
                    }
                }
                if (filmChanged) {
                    dataChanged = true;
                    return updatedFilm;
                }
                return film;
            });
            if (newMessages.length > 0) {
                // Mark older messages from these distributors for these films as superseded
                let processedMessages = newState.messages.map(m => {
                    if (m.offerContext && !m.offerContext.isSuperseded) {
                        const key = `${m.offerContext.filmTitle}_${m.offerContext.distributorId}`;
                        if (supersededKeys.includes(key)) {
                            return { ...m, offerContext: { ...m.offerContext, isSuperseded: true } };
                        }
                    }
                    return m;
                });
                if (pauseOnMessage)
                    systemPause();
                return {
                    ...newState,
                    completedFilms: filmsToUpdate,
                    messages: [...processedMessages, ...newMessages]
                };
            }
            return dataChanged ? { ...newState, completedFilms: filmsToUpdate } : currentData;
        });
    }, [playerData.gameDate, setPlayerData, systemPause, pauseOnMessage, t, locale]);
};
