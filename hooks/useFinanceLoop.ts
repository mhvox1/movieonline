
import React, { useEffect, useRef } from 'react';
import { PlayerData, Loan, Transaction, BuildingType, RandomEvent, Stock, Message, Director, Actor, EmployeeType, Employee, MovieSize, Genre } from '../types';
import { BUILDING_DATA } from '../components/buildings';
import { getMonthlySatisfactionBonus } from '../components/studioBuildingEffects';
import { WORLD_EVENTS } from '../components/events/worldEvents';
import { INDUSTRY_EVENTS } from '../components/events/industryEvents';
import { getTalentPortraitUrl } from '../components/TalentDossierModal';
import { generateScriptMarket } from '../components/scriptGenerator';
import { refreshEmployeeMarket, generateSingleEmployee } from '../components/employeeGenerator';
import { checkForHistoricalEvent } from '../components/events/history/historyManager';
import { newspaperImage } from '../components/events/eventHelpers';
import { generateContractOffers } from '../components/contractData';
import { generateNewTalent } from '../components/talentGenerator';
import { MOVIE_SIZE_CONFIG } from '../components/constants';
import { clampCeoSalary } from './helpers';

interface UseFinanceLoopProps {
    playerData: PlayerData;
    setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
    systemPause: () => void;
    setMonthlyReportData: React.Dispatch<React.SetStateAction<{ transactions: Transaction[], month: number, year: number } | null>>;
    setMuseumPrestigeInfo: React.Dispatch<React.SetStateAction<boolean>>;
    setNewspaperData: React.Dispatch<React.SetStateAction<RandomEvent | null>>;
    showWeeklyNewspaper: boolean;
    t: any;
}

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const renderTemplate = (template: string, variables: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key) => String(variables[key] ?? `{${key}}`));
const SHOW_FINANCE_POPUP_MODALS = false;

const toWeeklyThursdayNoonKey = (date: Date): string => {
    const anchor = new Date(date);
    const day = anchor.getDay();
    const daysSinceThursday = (day - 4 + 7) % 7;
    anchor.setDate(anchor.getDate() - daysSinceThursday);
    anchor.setHours(12, 0, 0, 0);

    if (date.getTime() < anchor.getTime()) {
        anchor.setDate(anchor.getDate() - 7);
    }

    const y = anchor.getFullYear();
    const m = String(anchor.getMonth() + 1).padStart(2, '0');
    const d = String(anchor.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const useFinanceLoop = ({
    playerData,
    setPlayerData,
    systemPause,
    setMonthlyReportData,
    setMuseumPrestigeInfo,
    setNewspaperData,
    showWeeklyNewspaper,
    t
}: UseFinanceLoopProps) => {
    // We use a ref to track the last processed month to avoid duplicate processing if render happens multiple times for same date
    const lastProcessedMonthRef = useRef<string>(""); 
    const lastProcessedWeekRef = useRef<string>("");

    // Initial setup for refs
    useEffect(() => {
        if (playerData && !lastProcessedMonthRef.current) {
            const d = new Date(playerData.gameDate);
            lastProcessedMonthRef.current = `${d.getFullYear()}-${d.getMonth()}`;
            
            lastProcessedWeekRef.current = toWeeklyThursdayNoonKey(d);
        }
    }, []);

    useEffect(() => {
        if (!playerData) return;

        const currentDate = new Date(playerData.gameDate);
        const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        
        const currentWeekKey = toWeeklyThursdayNoonKey(currentDate);

        // --- WEEKLY LOGIC ---
        if (currentWeekKey !== lastProcessedWeekRef.current) {
            lastProcessedWeekRef.current = currentWeekKey;

            setPlayerData(prevData => {
                if (!prevData) return null;
                const newState = { ...prevData };
                
                // --- 0. GENRE TREND SIMULATION ---
                // Calculate Market Saturation based on recent releases (last 12 weeks / 84 days)
                const threeMonthsAgo = new Date(currentDate);
                threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 84);

                const releasesPerGenre: Record<string, number> = {};
                
                // Check Competitor Releases
                newState.competitors.forEach(comp => {
                    comp.completedFilms.forEach(film => {
                        const rDate = new Date(film.releaseDate);
                        if (rDate >= threeMonthsAgo && rDate <= currentDate) {
                            releasesPerGenre[film.genre] = (releasesPerGenre[film.genre] || 0) + 1;
                        }
                    });
                });

                // Check Player Releases
                newState.completedFilms.forEach(film => {
                    const rDate = film.cinemaRelease?.releaseDate ? new Date(film.cinemaRelease.releaseDate) : null;
                    if (rDate && rDate >= threeMonthsAgo && rDate <= currentDate) {
                        releasesPerGenre[film.genre] = (releasesPerGenre[film.genre] || 0) + 1;
                    }
                });

                const newGenreTrends = { ...newState.genreTrends };
                const allGenres = Object.values(Genre);

                allGenres.forEach(genre => {
                    let trend = newGenreTrends[genre] || { popularity: 1.0, momentum: 0, peakDuration: 0 };
                    let { popularity, momentum } = trend;

                    // 1. Random Fluctuation (The "Market Mood")
                    // Small random push +/- 0.01
                    const noise = (Math.random() * 0.02) - 0.01;
                    momentum += noise;

                    // 2. Saturation Impact
                    const recentReleases = releasesPerGenre[genre] || 0;
                    if (recentReleases > 6) {
                        // Massive saturation
                        momentum -= 0.04; 
                    } else if (recentReleases > 3) {
                        // Moderate saturation
                        momentum -= 0.015;
                    } else if (recentReleases === 0 && popularity < 0.8) {
                        // Niche demand / underserved market
                        momentum += 0.005;
                    }

                    // 3. Gravity / Rubber Band Effect
                    // Push down if too high, pull up if too low
                    if (popularity > 1.6) {
                        momentum -= 0.02; // Hype dies down
                    } else if (popularity < 0.5) {
                        momentum += 0.015; // Revival chance
                    }

                    // 4. Momentum Damping (Friction)
                    // Prevents infinite acceleration
                    momentum *= 0.95;

                    // 5. Apply
                    popularity += momentum;

                    // 6. Hard Clamping
                    // 0.3 = Dead genre (still some fans), 1.9 = Absolute Mania
                    if (popularity < 0.3) {
                        popularity = 0.3;
                        momentum = Math.max(0, momentum); // Stop falling
                    }
                    if (popularity > 1.9) {
                        popularity = 1.9;
                        momentum = Math.min(0, momentum); // Stop rising
                    }

                    newGenreTrends[genre] = {
                        ...trend,
                        popularity: parseFloat(popularity.toFixed(3)),
                        momentum: parseFloat(momentum.toFixed(4))
                    };
                });
                
                newState.genreTrends = newGenreTrends;

                // --- 1. EMPLOYEE SATISFACTION DECAY & BUILDING CHECK ---
                const employeeBuildingMap: Record<EmployeeType, BuildingType> = {
                    [EmployeeType.Autor]: BuildingType.Autorenbuero,
                    [EmployeeType.CastingMitarbeiter]: BuildingType.CastingOffice,
                    [EmployeeType.Forscher]: BuildingType.ResearchLab,
                    [EmployeeType.Marketingmanager]: BuildingType.MarketingDepartment,
                    [EmployeeType.ProjektPlaner]: BuildingType.Planungsbuero,
                };

                let employeesToKeep: Employee[] = [];
                let quitEmployees: string[] = [];

                newState.employees.forEach(emp => {
                    let baseDecay = Math.floor(Math.random() * 3); 

                    if (emp.lastSalaryIncreaseDate) {
                        const weeksSinceRaise = (new Date(newState.gameDate).getTime() - new Date(emp.lastSalaryIncreaseDate).getTime()) / (1000 * 60 * 60 * 24 * 7);
                        if (weeksSinceRaise <= 4) baseDecay = 0;
                    }

                    const requiredBuildingType = employeeBuildingMap[emp.type];
                    const buildingTranslationKey = requiredBuildingType as keyof typeof t.studiogelaende.buildings;
                    const requiredBuildingName = t.studiogelaende.buildings?.[buildingTranslationKey]?.name || requiredBuildingType;
                    const hasBuilding = newState.buildings.some(b => b.type === requiredBuildingType && b.level > 0);
                    let buildingMalus = 0;

                    if (!hasBuilding) buildingMalus = Math.floor(Math.random() * 3) + 1; 

                    const totalDecay = baseDecay + buildingMalus;
                    let newSatisfaction = Math.max(0, emp.satisfaction - totalDecay);
                    
                    let hasQuit = false;

                    if (newSatisfaction < 10) {
                        if (Math.random() < 0.10) {
                            hasQuit = true;
                            quitEmployees.push(emp.name);
                            const quitMsg: Message = {
                                id: `msg_quit_${emp.id}_${Date.now()}`,
                                date: new Date(newState.gameDate),
                                sender: emp.name,
                                subject: t.office.messages.employeeQuitSubject,
                                body: renderTemplate(t.office.messages.employeeQuitBody, {
                                    noWorkspaceText: !hasBuilding
                                        ? renderTemplate(t.office.messages.employeeQuitNoWorkspace, { requiredBuildingType: requiredBuildingName })
                                        : '',
                                    name: emp.name,
                                }),
                                read: false,
                                imageUrl: emp.portraitUrl
                            };
                            newState.messages = [...newState.messages, quitMsg];
                        }
                    } 
                    
                    if (!hasQuit && newSatisfaction < 50) {
                        const lastComplaint = emp.lastComplaintDate ? new Date(emp.lastComplaintDate) : null;
                        const weeksSinceComplaint = lastComplaint ? (new Date(newState.gameDate).getTime() - lastComplaint.getTime()) / (1000 * 60 * 60 * 24 * 7) : 999;
                        
                        if (weeksSinceComplaint >= 4) {
                            emp.lastComplaintDate = new Date(newState.gameDate);
                            let reason = t.office.messages.employeeComplaintReasonDefault;
                            if (!hasBuilding) {
                                reason = renderTemplate(t.office.messages.employeeComplaintReasonNoWorkspace, { requiredBuildingType: requiredBuildingName });
                            }
                            
                            const complaintMsg: Message = {
                                id: `msg_complaint_${emp.id}_${Date.now()}`,
                                date: new Date(newState.gameDate),
                                sender: emp.name,
                                subject: t.office.messages.employeeComplaintSubject,
                                body: renderTemplate(t.office.messages.employeeComplaintBody, { reason }),
                                read: false,
                                imageUrl: emp.portraitUrl
                            };
                            newState.messages = [...newState.messages, complaintMsg];
                        }
                    }

                    if (!hasQuit) {
                        emp.satisfaction = newSatisfaction;
                        employeesToKeep.push(emp);
                    } else {
                        if (newState.activeWriting?.writerId === emp.id) newState.activeWriting = null;
                        if (newState.activePlanning?.plannerId === emp.id) newState.activePlanning = null;
                        if (newState.activeCastings) newState.activeCastings = newState.activeCastings.filter(c => c.casterId !== emp.id);
                        if (newState.activeCastingCampaigns) newState.activeCastingCampaigns = newState.activeCastingCampaigns.filter(c => c.casterId !== emp.id);
                        if (newState.activeTalentScoutings) newState.activeTalentScoutings = newState.activeTalentScoutings.filter(s => s.scoutId !== emp.id);
                    }
                });
                
                newState.employees = employeesToKeep;

                // --- TALENT DEATH LOGIC START ---
                let deathEvent: RandomEvent | null = null;
                let deceasedTalentId: number | null = null;
                let isDirectorDeath = false;

                const getAge = (birthDate: Date) => {
                    const diff = new Date(newState.gameDate).getTime() - new Date(birthDate).getTime();
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                };

                const isBusyInProject = (id: number) => {
                    const activeProjects = newState.activeProjects || [];
                    for (const proj of activeProjects) {
                        if (proj.directorId === id || proj.mainActorId === id || proj.supportingActorId === id) return true;
                    }
                    if (newState.activePlanning) {
                         if (newState.activePlanning.directorId === id || newState.activePlanning.mainActorId === id || newState.activePlanning.supportingActorId === id) return true;
                    }
                    return false;
                };

                const candidates = [
                    ...newState.directors.map(d => ({ ...d, type: 'director' })), 
                    ...newState.actors.map(a => ({ ...a, type: 'actor' }))
                ].filter(talent => {
                    if (talent.isFamily || talent.id === -1 || talent.id === 99901 || talent.id >= 99910) return false;
                    if (isBusyInProject(talent.id)) return false;
                    const age = getAge(talent.birthDate);
                    return age >= 65; 
                });

                for (let i = candidates.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
                }

                for (const talent of candidates) {
                    const age = getAge(talent.birthDate);
                    let deathChance = 0;

                    if (age >= 95) deathChance = 0.25;      
                    else if (age >= 90) deathChance = 0.10; 
                    else if (age >= 80) deathChance = 0.01; 
                    else if (age >= 75) deathChance = 0.003; 
                    else if (age >= 65) deathChance = 0.001; 

                    if (Math.random() < deathChance) {
                        deceasedTalentId = talent.id;
                        isDirectorDeath = talent.type === 'director';
                        
                        const roleLabel = isDirectorDeath 
                            ? (talent.gender === 'weiblich' ? t.newspaper.roles.directress : t.newspaper.roles.director)
                            : (talent.gender === 'weiblich' ? t.newspaper.roles.actress : t.newspaper.roles.actor);
                        
                        const portraitUrl = getTalentPortraitUrl(talent, newState.gameDate);
                        const headline = t.newspaper.deathHeadline.replace(/{name}/g, talent.name);
                        
                        const rawTexts = t.newspaper.deathText as string[];
                        const textTemplate = pickRandom(rawTexts);
                        const text = textTemplate
                            .replace(/{name}/g, talent.name)
                            .replace(/{age}/g, age.toString())
                            .replace(/{role}/g, roleLabel);

                        deathEvent = {
                            id: `death_${talent.id}_${Date.now()}`,
                            category: 'World',
                            title: headline,
                            text: text,
                            imageUrl: portraitUrl || undefined,
                        };

                        const emailSubject = t.newspaper.deathEmailSubject
                            .replace(/{role}/g, roleLabel)
                            .replace(/{name}/g, talent.name);
                        
                        const emailBody = t.newspaper.deathEmailBody
                            .replace(/{role}/g, roleLabel)
                            .replace(/{name}/g, talent.name)
                            .replace(/{age}/g, age.toString());

                        const email: Message = {
                            id: `msg_death_${talent.id}`,
                            date: new Date(newState.gameDate),
                            sender: t.common?.locale === 'de' ? 'Branchenverband' : 'Industry Association',
                            subject: emailSubject,
                            body: emailBody,
                            read: false,
                            imageUrl: portraitUrl || undefined 
                        };
                        newState.messages = [...newState.messages, email];

                        newState.eventLog = [...newState.eventLog, {
                             date: new Date(newState.gameDate),
                                title: t.common?.locale === 'de' ? 'Todesfall' : 'Death',
                                text: t.common?.locale === 'de'
                                  ? `${talent.name} ist im Alter von ${age} Jahren verstorben.`
                                  : `${talent.name} passed away at the age of ${age}.`,
                             category: 'World'
                        }];

                        break; 
                    }
                }

                if (deceasedTalentId) {
                    if (isDirectorDeath) {
                        newState.directors = newState.directors.filter(d => d.id !== deceasedTalentId);
                    } else {
                        newState.actors = newState.actors.filter(a => a.id !== deceasedTalentId);
                    }
                    const role = isDirectorDeath ? 'director' : 'actor';
                    const replacement = generateNewTalent(newState.directors, newState.actors, undefined, undefined, role, false, undefined, newState.gameDate);
                    replacement.isDiscovered = false;
                    replacement.bekanntheit = 0;
                    if (isDirectorDeath) newState.directors = [...newState.directors, replacement as Director];
                    else newState.actors = [...newState.actors, replacement as Actor];
                }
                // --- TALENT DEATH LOGIC END ---

                // 2. Stock Market Updates
                const newStocks = newState.stocks.map(stock => {
                    const volatility = stock.volatility;
                    let trend = stock.trend;
                    if (newState.marketTrend) {
                        if (newState.marketTrend.type === 'bull') {
                            trend += (newState.marketTrend.minFactor + Math.random() * (newState.marketTrend.maxFactor - newState.marketTrend.minFactor));
                        } else {
                             trend -= (newState.marketTrend.minFactor + Math.random() * (newState.marketTrend.maxFactor - newState.marketTrend.minFactor));
                        }
                        newState.marketTrend = { ...newState.marketTrend, duration: newState.marketTrend.duration - 1 };
                        if (newState.marketTrend.duration <= 0) newState.marketTrend = null;
                    }
                    const changePercent = (Math.random() - 0.5) * volatility + trend;
                    let newPrice = stock.price * (1 + changePercent);
                    newPrice = Math.max(0.01, newPrice); 
                    const newHistory = [...stock.history, newPrice];
                    return { ...stock, price: newPrice, history: newHistory };
                });
                newState.stocks = newStocks;

                // 3. Weekly Production Costs & Cinema Box Office
                if (newState.activeProjects && newState.activeProjects.length > 0) {
                     newState.activeProjects = newState.activeProjects.map(project => {
                         if ((project.phase === 'Production' || project.phase === 'PostProduction') && project.weeklyProductionCost) {
                             const cost = project.weeklyProductionCost;
                             newState.capital -= cost;
                             newState.transactionLog = [...newState.transactionLog, {
                                 date: new Date(currentDate),
                                 type: 'Ausgabe',
                                 category: 'Filmproduktion',
                                 description: `Wöchentliche Fixkosten: "${project.workingTitle}"`,
                                 descriptionKey: 'weeklyProductionCosts',
                                 descriptionVars: { filmTitle: project.workingTitle },
                                 amount: cost
                             }];
                             return { ...project, accumulatedWeeklyCosts: (project.accumulatedWeeklyCosts || 0) + cost };
                         }
                         return project;
                     });
                }
                
                // 3b. Weekly Cinema Box Office (Player Films)
                if (newState.completedFilms && newState.completedFilms.length > 0) {
                    newState.completedFilms = newState.completedFilms.map(film => {
                        const isLifecycleCinema = film.activeDeal?.currentPhase === 'cinema';
                        // Legacy support
                        const isLegacyCinema = film.cinemaRelease?.status === 'active';

                        if (isLifecycleCinema || isLegacyCinema) {
                             // Initialize Cinema Release object if missing (important for lifecycle deals)
                             if (!film.cinemaRelease && film.activeDeal) {
                                 film.cinemaRelease = {
                                     status: 'active',
                                     distributorId: film.activeDeal.distributorId,
                                     distributorName: film.activeDeal.distributorName,
                                     lumpSum: film.activeDeal.upfrontPayment,
                                     revenueShare: film.activeDeal.revenueShare,
                                     releaseDate: film.activeDeal.startDate,
                                     viewers: 0,
                                     totalViewers: 0,
                                     weeksInCharts: 0,
                                     chartQuality: film.finalQuality || 50,
                                     totalPlayerRevenue: 0,
                                     monthlyAccumulatedRevenue: 0
                                 };
                             }
                             
                             // Ensure status is active if it was planning but date passed
                             if (film.cinemaRelease && film.cinemaRelease.status === 'planning') {
                                 film.cinemaRelease.status = 'active';
                             }

                             if (film.cinemaRelease) {
                                 // Simulation Logic
                                 // FIX: Handle undefined weeksInCharts by defaulting to 0 to avoid NaN
                                 const weeks = film.cinemaRelease.weeksInCharts || 0;
                                 
                                 // Decay Chart Quality
                                 const decay = weeks === 0 ? 1.0 : (1 - (0.05 + Math.random() * 0.07)); // 5-12% decay (same as competitor)
                                 film.cinemaRelease.chartQuality = (film.cinemaRelease.chartQuality || film.finalQuality || 50) * decay;

                                 // -------------------------------------------------------------
                                 // VIEWER CALCULATION - UNIFIED FORMULA
                                 // -------------------------------------------------------------
                                 
                                 const chartQ = film.cinemaRelease.chartQuality;
                                 
                                 // 1. Base Viewers based on Quality Cubed
                                 // Q50 -> 375k
                                 // Q70 -> 1.0M
                                 // Q90 -> 2.2M
                                 const baseViewers = Math.pow(chartQ, 3) * 3;

                                 // 2. Modifiers
                                 // Size: B(0.6), B+(0.8), A(1.0), AA(1.6), AAA(2.5)
                                 const movieSize = film.movieSize || MovieSize.B;
                                 let sizeFactor = 1.0;
                                 switch(movieSize) {
                                     case MovieSize.B: sizeFactor = 0.6; break;
                                     case MovieSize.BPlus: sizeFactor = 0.8; break;
                                     case MovieSize.A: sizeFactor = 1.0; break;
                                     case MovieSize.AA: sizeFactor = 1.6; break;
                                     case MovieSize.AAA: sizeFactor = 2.5; break;
                                 }
                                 
                                 // Hype: 0 -> 0.7x, 100 -> 1.2x
                                 const hype = film.hype || 0;
                                 const hypeFactor = 0.7 + (hype / 200);

                                 // Trend
                                 let trendFactor = 1.0;
                                 if (newState.genreTrends && newState.genreTrends[film.genre]) {
                                     trendFactor = newState.genreTrends[film.genre].popularity;
                                 }

                                 // Final Calculation
                                 let viewers = Math.floor(baseViewers * sizeFactor * hypeFactor * trendFactor);
                                 
                                 // Add Randomness (+- 10%)
                                 const randomizer = 0.9 + Math.random() * 0.2;
                                 viewers = Math.floor(viewers * randomizer);
                                 
                                 // -------------------------------------------------------------
                                 
                                 // Update Stats
                                 film.cinemaRelease.viewers = viewers;
                                 film.cinemaRelease.totalViewers = (film.cinemaRelease.totalViewers || 0) + viewers;
                                 film.cinemaRelease.weeksInCharts = weeks + 1;
                                 
                                 // Calculate Weekly Revenue Share
                                 const ticketPrice = 5; 
                                 const grossRevenue = viewers * ticketPrice;
                                 
                                 let playerSharePercent = 0.15; // default fallback
                                 if (film.activeDeal) {
                                     playerSharePercent = film.activeDeal.revenueShare;
                                 } else if (film.cinemaRelease.revenueShare) {
                                     playerSharePercent = film.cinemaRelease.revenueShare;
                                 }

                                 const playerRevenue = Math.round(grossRevenue * playerSharePercent);
                                 
                                 // --- CHANGE: ACCUMULATE WEEKLY, PAY OUT MONTHLY ---
                                 // 1. Accumulate for monthly payout
                                 film.cinemaRelease.monthlyAccumulatedRevenue = (film.cinemaRelease.monthlyAccumulatedRevenue || 0) + playerRevenue;

                                 // 2. Update Lifetime Earnings Stats immediately (for charts/history), but NOT capital
                                 if (film.activeDeal) {
                                     film.activeDeal.totalEarnings += playerRevenue;
                                 } else {
                                     film.cinemaRelease.totalPlayerRevenue = (film.cinemaRelease.totalPlayerRevenue || 0) + playerRevenue;
                                 }
                             }
                        }
                        return film;
                    });
                }

                // 4. Weekly Script Market Refresh
                const newScriptMarket = generateScriptMarket(newState.reputation, newState.genreTrends, t);
                newState.scriptMarket = newScriptMarket;
                newState.lastScriptMarketRefresh = new Date(currentDate);

                // 5. Weekly Employee Market Refresh
                const newEmployeeMarket = refreshEmployeeMarket(newState.employees, newState.reputation);
                newState.employeeMarket = newEmployeeMarket;
                newState.lastEmployeeMarketRefresh = new Date(currentDate);

                // --- PRIORITY: HISTORICAL EVENT ---
                const historicalDef = checkForHistoricalEvent(currentDate);
                let historicalEvent: RandomEvent | null = null;
                
                if (historicalDef) {
                    const trans = t.historyEvents ? t.historyEvents[historicalDef.id] : null;
                    if (trans) {
                        historicalEvent = {
                            id: historicalDef.id,
                            category: historicalDef.category,
                            title: trans.title,
                            text: trans.text,
                            imageUrl: historicalDef.imageUrl || newspaperImage
                        };
                        newState.eventLog = [...newState.eventLog, {
                             date: new Date(newState.gameDate),
                             title: trans.title,
                             text: trans.text,
                             category: historicalDef.category
                        }];
                    }
                }

                if (showWeeklyNewspaper) {
                    if (deathEvent) {
                        if (SHOW_FINANCE_POPUP_MODALS) {
                            setNewspaperData(deathEvent);
                            systemPause();
                        }
                    } else if (historicalEvent) {
                        if (SHOW_FINANCE_POPUP_MODALS) {
                            setNewspaperData(historicalEvent);
                            systemPause();
                        }
                    } else {
                    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
                    const isTestPhase = isTestMode && currentDate < new Date(1990, 2, 1);
                    let eventToTrigger: RandomEvent | null = null;

                    if (isTestPhase) {
                        const targetId = Math.random() > 0.5 ? 'industry_02' : 'industry_03';
                        eventToTrigger = INDUSTRY_EVENTS.find(e => e.id === targetId) || null;
                    }
                    if (!eventToTrigger) {
                        const combinedEvents = [...WORLD_EVENTS, ...INDUSTRY_EVENTS];
                        eventToTrigger = combinedEvents[Math.floor(Math.random() * combinedEvents.length)];
                    }
                    
                    if (eventToTrigger) {
                        let effectResult = null;
                        if (eventToTrigger.effect) {
                             effectResult = eventToTrigger.effect(newState);
                             if (effectResult.updatedPlayerData) {
                                 if (effectResult.updatedPlayerData.genreTrends) {
                                     newState.genreTrends = effectResult.updatedPlayerData.genreTrends;
                                 }
                                 if (effectResult.updatedPlayerData.reputation !== undefined) newState.reputation = effectResult.updatedPlayerData.reputation;
                                 if (effectResult.updatedPlayerData.capital !== undefined) newState.capital = effectResult.updatedPlayerData.capital;
                             }
                        }

                        let translatedTitle = eventToTrigger.title;
                        let translatedText = eventToTrigger.text;

                        if (t.worldEvents && t.worldEvents[eventToTrigger.id]) {
                            translatedTitle = t.worldEvents[eventToTrigger.id].title;
                            translatedText = t.worldEvents[eventToTrigger.id].text;
                        } 
                        else if (t.industryEvents && t.industryEvents[eventToTrigger.id]) {
                            translatedTitle = t.industryEvents[eventToTrigger.id].title;
                            translatedText = t.industryEvents[eventToTrigger.id].text;
                        }

                        if (effectResult && effectResult.customVariables) {
                             Object.entries(effectResult.customVariables).forEach(([key, value]) => {
                                 let stringValue = String(value);
                                 if (key === 'genre' && typeof value === 'string') {
                                     // Translate Genre Enum value if possible
                                     stringValue = t.genres[value] || stringValue;
                                 }

                                 const regex = new RegExp(`{${key}}`, 'g');
                                 translatedTitle = translatedTitle.replace(regex, stringValue);
                                 translatedText = translatedText.replace(regex, stringValue);
                             });
                        }

                        if (SHOW_FINANCE_POPUP_MODALS) {
                            setNewspaperData({
                                ...eventToTrigger,
                                title: translatedTitle,
                                text: translatedText
                            });
                        }
                        
                         newState.eventLog = [...newState.eventLog, {
                             date: new Date(newState.gameDate),
                             title: translatedTitle,
                             text: translatedText,
                             category: eventToTrigger.category
                        }];

                        if (SHOW_FINANCE_POPUP_MODALS) {
                            systemPause();
                        }
                    }
                    }
                }

                return newState;
            });
        }

        // --- MONTHLY LOGIC ---
        if (currentMonthKey !== lastProcessedMonthRef.current) {
            lastProcessedMonthRef.current = currentMonthKey;

            setPlayerData(currentData => {
                if (!currentData) return null;
                const newState = { ...currentData };
                
                const billingDate = new Date(currentDate);
                billingDate.setDate(billingDate.getDate() - 1); 
                
                const reportingMonth = billingDate.getMonth();
                const reportingYear = billingDate.getFullYear();

                const recurrentTransactions: Transaction[] = []; 
                const transactionDate = new Date(billingDate); 

                // --- TALENT CONTRACT EXPIRY ---
                // Expire exclusive talent contracts once expiryDate is reached.
                const isGermanLocale = t.common?.locale === 'de';
                const contractMessages: Message[] = [];

                const expireContractIfNeeded = <T extends Director | Actor>(talent: T, role: 'director' | 'actor'): T => {
                    const contract = talent.contract;
                    if (!contract || contract.type !== 'exclusive') return talent;

                    const expiryDate = new Date(contract.expiryDate);
                    if (currentDate < expiryDate) return talent;

                    const formattedDate = expiryDate.toLocaleDateString(isGermanLocale ? 'de-DE' : 'en-US');
                    const subject = isGermanLocale
                        ? `Exklusivvertrag ausgelaufen: ${talent.name}`
                        : `Exclusive contract expired: ${talent.name}`;
                    const body = isGermanLocale
                        ? `Der Exklusivvertrag mit ${talent.name} ist am ${formattedDate} ausgelaufen. Das Talent ist nun wieder frei verhandelbar.`
                        : `The exclusive contract with ${talent.name} expired on ${formattedDate}. The talent is now available for negotiation again.`;

                    contractMessages.push({
                        id: `msg_contract_expired_${role}_${talent.id}_${currentDate.getTime()}`,
                        date: new Date(currentDate),
                        sender: isGermanLocale ? 'Talent-Management' : 'Talent Management',
                        subject,
                        body,
                        read: false,
                        imageUrl: getTalentPortraitUrl(talent, newState.gameDate) || undefined,
                    });

                    return {
                        ...talent,
                        contract: undefined,
                    };
                };

                newState.directors = newState.directors.map(d => expireContractIfNeeded(d, 'director'));
                newState.actors = newState.actors.map(a => expireContractIfNeeded(a, 'actor'));
                if (contractMessages.length > 0) {
                    newState.messages = [...newState.messages, ...contractMessages];
                }

                // --- ANNUAL CEO REVIEW ---
                if (currentDate.getMonth() === 0) { 
                    const prevYear = currentDate.getFullYear() - 1;
                    const historyForYear = newState.monthlyHistory.filter(h => h.year === prevYear);

                    if (historyForYear.length > 0 && newState.lastCeoEvaluationYear !== prevYear) {
                        const annualProfit = historyForYear.reduce((sum, m) => sum + m.profit, 0);
                        
                        let level = 4;
                        let bonusPercent = 0;
                        let salaryMultiplier = 1.0;
                        
                        if (annualProfit < -500000) level = 0;
                        else if (annualProfit < -100000) level = 1;
                        else if (annualProfit < 0) level = 2;
                        else if (annualProfit < 100000) level = 3;
                        else if (annualProfit < 500000) level = 4;
                        else if (annualProfit < 1000000) level = 5;
                        else if (annualProfit < 5000000) level = 6;
                        else if (annualProfit < 10000000) level = 7;
                        else if (annualProfit < 50000000) level = 8;
                        else level = 9;

                        if (annualProfit > 0) {
                            if (level === 3) bonusPercent = 0.5;
                            else if (level === 4) bonusPercent = 1.0;
                            else if (level === 5) bonusPercent = 1.5;
                            else if (level === 6) bonusPercent = 2.5;
                            else if (level === 7) bonusPercent = 3.5;
                            else if (level === 8) bonusPercent = 5.0;
                            else if (level === 9) bonusPercent = 7.5;
                        }

                        if (level <= 1) salaryMultiplier = 1.0; 
                        else if (level === 2) salaryMultiplier = 1.05; 
                        else if (level === 3) salaryMultiplier = 1.10; 
                        else if (level === 4) salaryMultiplier = 1.20; 
                        else if (level === 5) salaryMultiplier = 1.35; 
                        else if (level === 6) salaryMultiplier = 1.50; 
                        else if (level === 7) salaryMultiplier = 1.65; 
                        else if (level === 8) salaryMultiplier = 1.80; 
                        else if (level === 9) salaryMultiplier = 2.00; 

                        const bonusAmount = Math.floor(Math.max(0, annualProfit) * (bonusPercent / 100));
                        const newSalary = clampCeoSalary(Math.round(newState.ceoSalary * salaryMultiplier / 100) * 100);

                        if (bonusAmount > 0) {
                            newState.capital -= bonusAmount;
                            newState.privateCapital += bonusAmount;
                            if (!newState.ceoBonusHistory) newState.ceoBonusHistory = [];
                            newState.ceoBonusHistory.push({ year: prevYear, amount: bonusAmount });

                             recurrentTransactions.push({
                                date: transactionDate,
                                type: 'Ausgabe',
                                category: 'Personal',
                                description: `Jahresbonus CEO (${prevYear})`,
                                amount: bonusAmount
                            });
                        }
                        
                        newState.ceoSalary = newSalary;
                        newState.lastCeoEvaluationYear = prevYear;

                        const formatCurrency = (val: number) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
                        const salutationTemplate = newState.gender === 'männlich' ? t.office.messages.salutationMale : t.office.messages.salutationFemale;
                        const salutation = salutationTemplate.replace('{lastName}', newState.playerName.split(' ').pop() || '');
                        
                        const msgSubjectKey = `office.messages.ceoReviewSubjectLevel${level}`;
                        const msgBodyKey = `office.messages.ceoReviewBodyLevel${level}`;
                        const profitLabel = annualProfit >= 0 ? "Jahresgewinn" : "Jahresverlust";
                        
                        const reviewMessage: Message = {
                            id: `msg_ceo_review_${prevYear}`,
                            date: currentDate,
                            sender: t.office.messages.ceoBoardSender,
                            subjectTemplate: {
                                key: msgSubjectKey,
                                variables: { year: prevYear }
                            },
                            bodyTemplate: {
                                key: msgBodyKey,
                                variables: {
                                    salutation,
                                    year: prevYear,
                                    profit: formatCurrency(annualProfit),
                                    profitLabel: profitLabel,
                                    bonus: formatCurrency(bonusAmount),
                                    newSalary: formatCurrency(newSalary),
                                    bonusPercent: bonusPercent
                                }
                            },
                            read: false
                        };
                        newState.messages = [...newState.messages, reviewMessage];
                    }
                }
                
                // --- 0. Installment Payments AND Non-Cinema Revenue Share ---
                newState.completedFilms = newState.completedFilms.map(film => {
                    // A) PAY OUT ACCUMULATED CINEMA REVENUE
                    if (film.cinemaRelease && film.cinemaRelease.monthlyAccumulatedRevenue && film.cinemaRelease.monthlyAccumulatedRevenue > 0) {
                         const amount = film.cinemaRelease.monthlyAccumulatedRevenue;
                         newState.capital += amount;
                         
                         // Note: totalPlayerRevenue / totalEarnings was already updated weekly, so we don't update it here again.
                         
                         recurrentTransactions.push({
                             date: transactionDate,
                             type: 'Einnahme',
                             category: 'Filmverleih',
                             description: `Umsatzbeteiligung (Kino): "${film.workingTitle}"`,
                             amount: amount
                         });
                         
                         // Reset Accumulator
                         film.cinemaRelease.monthlyAccumulatedRevenue = 0;
                    }


                    if (film.activeDeal) {
                         const deal = film.activeDeal;
                         let dealModified = false;
                         
                         // B) Fixed Monthly Installments
                         if (deal.monthsPassed < deal.durationMonths) {
                             const payment = deal.monthlyPayment;
                             if (payment > 0) {
                                 newState.capital += payment;
                                 deal.totalEarnings += payment; 
                                 
                                 recurrentTransactions.push({
                                    date: transactionDate,
                                    type: 'Einnahme',
                                    category: 'Filmverleih',
                                    description: `Rate für "${film.workingTitle}"`,
                                    descriptionKey: 'installment',
                                    descriptionVars: { filmTitle: film.workingTitle },
                                    amount: payment
                                });
                             }
                             
                             deal.monthsPassed += 1;
                             dealModified = true;
                         }

                         // C) Variable Revenue Share (Non-Cinema)
                         // Cinema revenue is now handled in the block above (A)
                         if (['home', 'payTv', 'freeTv'].includes(deal.currentPhase)) {
                             const quality = film.finalQuality || 50;
                             const hype = film.hype || 50;
                             
                             const performanceScore = quality + (hype * 0.5); 
                             const randomFactor = 0.8 + Math.random() * 0.4; 

                             let phaseMultiplier = 0;
                             let phaseLabel = "";

                             if (deal.currentPhase === 'home') {
                                 phaseMultiplier = 1500; 
                                 phaseLabel = "Home Ent.";
                             } else if (deal.currentPhase === 'payTv') {
                                 phaseMultiplier = 1000;
                                 phaseLabel = "Pay-TV";
                             } else if (deal.currentPhase === 'freeTv') {
                                 phaseMultiplier = 500;
                                 phaseLabel = "Free-TV";
                             }

                             const estimatedMarketRevenue = performanceScore * phaseMultiplier * randomFactor;
                             const playerShareAmount = Math.floor(estimatedMarketRevenue * deal.revenueShare);

                             if (playerShareAmount > 0) {
                                 newState.capital += playerShareAmount;
                                 deal.totalEarnings += playerShareAmount;
                                 dealModified = true;

                                 recurrentTransactions.push({
                                    date: transactionDate,
                                    type: 'Einnahme',
                                    category: 'Filmverleih',
                                    description: `Umsatzbeteiligung (${phaseLabel}): "${film.workingTitle}"`,
                                    amount: playerShareAmount
                                });
                             }
                         }

                         if (dealModified) {
                             return { ...film, activeDeal: { ...deal } };
                         }
                    }
                    return film;
                });
                
                // --- 1. Salary Payment ---
                newState.employees.forEach(emp => {
                    newState.capital -= emp.salary;
                    recurrentTransactions.push({
                        date: transactionDate,
                        type: 'Ausgabe',
                        category: 'Personal',
                        description: `Gehalt: ${emp.name}`,
                        descriptionKey: 'salary',
                        descriptionVars: { name: emp.name },
                        amount: emp.salary
                    });
                });
                
                if (newState.partnerIsEmployed && newState.partnerName) {
                     const partnerCost = 2500; 
                     newState.capital -= partnerCost;
                     recurrentTransactions.push({
                        date: transactionDate,
                        type: 'Ausgabe',
                        category: 'Personal',
                        description: `Gehalt: ${newState.partnerName} (Partner)`,
                        descriptionKey: 'salary',
                        descriptionVars: { name: newState.partnerName },
                        amount: partnerCost
                    });
                }
                
                newState.ceoSalary = clampCeoSalary(newState.ceoSalary);

                if (newState.ceoSalary > 0) {
                    newState.capital -= newState.ceoSalary;
                    newState.privateCapital += newState.ceoSalary;
                    recurrentTransactions.push({
                        date: transactionDate,
                        type: 'Ausgabe',
                        category: 'Personal',
                        description: `CEO Gehalt: ${newState.playerName}`,
                        descriptionKey: 'salary',
                        descriptionVars: { name: newState.playerName },
                        amount: newState.ceoSalary
                    });
                }
                
                // Building Maintenance
                newState.buildings.forEach(b => {
                    const buildingData = BUILDING_DATA[b.type];
                    const levelData = b.level > 0 ? buildingData.levels[b.level - 1] : null;
                    if (levelData && levelData.monthlyCost > 0) {
                        newState.capital -= levelData.monthlyCost;
                        const buildingKey = Object.keys(BuildingType).find(key => BuildingType[key as keyof typeof BuildingType] === b.type) || 'Burogebaude';
                        const buildingName = t.studiogelaende.buildings[buildingKey]?.name || b.type;
                        
                        recurrentTransactions.push({
                            date: transactionDate,
                            type: 'Ausgabe',
                            category: 'Studiogelände',
                            description: `Unterhalt: ${buildingName}`,
                            descriptionKey: 'maintenance',
                            descriptionVars: { building: buildingName },
                            amount: levelData.monthlyCost
                        });
                    }

                    if (levelData && levelData.monthlyIncome) {
                        let income = 0;
                        if (typeof levelData.monthlyIncome === 'number') {
                            income = levelData.monthlyIncome;
                        } else {
                            income = Math.floor(Math.random() * (levelData.monthlyIncome.max - levelData.monthlyIncome.min + 1)) + levelData.monthlyIncome.min;
                        }
                        
                        if (income > 0) {
                            newState.capital += income;
                            const buildingKey = Object.keys(BuildingType).find(key => BuildingType[key as keyof typeof BuildingType] === b.type) || 'Burogebaude';
                            const buildingName = t.studiogelaende.buildings[buildingKey]?.name || b.type;

                            recurrentTransactions.push({
                                date: transactionDate,
                                type: 'Einnahme',
                                category: 'Studiogelände',
                                description: `Einnahmen: ${buildingName}`,
                                descriptionKey: 'incomeFrom',
                                descriptionVars: { building: buildingName },
                                amount: income
                            });
                        }
                    }
                    
                    if (b.type === BuildingType.Filmmuseum && b.level > 0 && levelData?.bonusEffect?.prestigeChance) {
                        if (Math.random() < levelData.bonusEffect.prestigeChance) {
                             newState.reputation = Math.min(100, newState.reputation + 1);
                             setMuseumPrestigeInfo(true);
                        }
                    }
                });

                const campusSatisfactionBonus = getMonthlySatisfactionBonus(newState);
                if (campusSatisfactionBonus > 0) {
                    newState.employees = newState.employees.map(employee => ({
                        ...employee,
                        satisfaction: Math.min(100, employee.satisfaction + campusSatisfactionBonus),
                    }));

                    recurrentTransactions.push({
                        date: transactionDate,
                        type: 'Einnahme',
                        category: 'Personal',
                        description: 'Campus-Bonus: Betriebskita',
                        amount: 0,
                    });
                }

                // Loan Payments
                newState.loans.forEach(loan => {
                    if (loan.totalOwed > 0) {
                        const payment = Math.min(loan.monthlyPayment, loan.totalOwed);
                        newState.capital -= payment;
                        loan.totalOwed -= (payment - (loan.totalOwed * (loan.interestRate / 12))); 
                        
                        if (loan.totalOwed < 0) loan.totalOwed = 0;

                        recurrentTransactions.push({
                            date: transactionDate,
                            type: 'Ausgabe',
                            category: 'Finanzen',
                            description: `Kreditrate: ${loan.name}`,
                            descriptionKey: 'loanPayment',
                            descriptionVars: { loanName: loan.name },
                            amount: payment
                        });
                    }
                });
                newState.loans = newState.loans.filter(l => l.totalOwed > 1);
                
                const newContracts = generateContractOffers(undefined, newState.reputation);
                newState.contractOffers = newContracts;
                newState.lastContractRefreshDate = new Date(currentDate);

                // --- 2. MERGE & CALCULATE TOTALS ---
                if (recurrentTransactions.length > 0) {
                    newState.transactionLog = [...newState.transactionLog, ...recurrentTransactions];
                }

                const allTransactionsInMonth = newState.transactionLog.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === reportingMonth && tDate.getFullYear() === reportingYear;
                });

                const income = allTransactionsInMonth.filter(t => t.type === 'Einnahme').reduce((sum, t) => sum + t.amount, 0);
                const expenses = allTransactionsInMonth.filter(t => t.type === 'Ausgabe').reduce((sum, t) => sum + t.amount, 0);
                const profit = income - expenses;

                const newHistoryEntry = {
                    year: reportingYear,
                    month: reportingMonth,
                    income,
                    expense: expenses,
                    profit
                };

                newState.monthlyHistory = [...newState.monthlyHistory, newHistoryEntry];
                newState.lastMonthlyReportDate = new Date(currentDate);

                if (SHOW_FINANCE_POPUP_MODALS) {
                    setMonthlyReportData({
                        transactions: allTransactionsInMonth,
                        month: reportingMonth,
                        year: reportingYear
                    });

                    systemPause();
                }

                return newState;
            });
        }
    }, [playerData, setPlayerData, systemPause, setMonthlyReportData, setMuseumPrestigeInfo, setNewspaperData, showWeeklyNewspaper, t]);
};
