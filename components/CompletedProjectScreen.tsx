import React, { useMemo, useEffect } from 'react';
import { GameState, MarketingTab, ProjectData, Message, ProjectType } from '../types';
import { newProjectBackgroundImage } from './backgrounds/NewProjectBackgroundImage';
import StarRating from './StarRating';
import TrophyIcon from './icons/TrophyIcon';
import { useGame } from '../contexts/GameContext';
import { GENRE_IDEAL_PROFILES } from './genreProfiles';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import { getCoverPath } from './coverConfig';
import { MOVIE_SIZE_CONFIG, EXTRAS_OPTIONS, GENRE_IDEAL_AGE_RATING } from './constants';
import { useTranslation } from '../hooks/useTranslation';

interface CompletedProjectScreenProps {
  onBack: () => void;
  setGameState: (state: GameState) => void;
  onNavigateToMarketingTab: (tab: MarketingTab, filmTitle?: string) => void;
  project: ProjectData; // Changed: Require project to be passed directly
}

const getQualityPrestigeBonus = (quality: number): number => {
    if (quality >= 40 && quality <= 59) return 1;
    if (quality >= 60 && quality <= 74) return 3;
    if (quality >= 75 && quality <= 89) return 6;
    if (quality >= 90 && quality <= 97) return 11;
    if (quality >= 98) return 19;
    return 0;
};

const CompletedProjectScreen: React.FC<CompletedProjectScreenProps> = ({ onBack, setGameState, onNavigateToMarketingTab, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  // Removed local project variable, using prop instead
  const locale = language === 'de' ? 'de-DE' : 'en-US';
    const isSeries = project.projectType === ProjectType.Series;

  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  useEffect(() => {
    // Check if feedback generation is needed
    if (project && !project.testAudienceFeedback && playerData) {
      setPlayerData(prev => {
        if (!prev) return prev;
        
        // Find correct project in completed films to update
        // We look for it in completedFilms OR currentProject if it's there
        // Actually, we should update it wherever it resides.
        // Assuming it's in completedFilms by now (moved by useProjectLoop)
        
        const feedback: { viewer: string; text: string }[] = [];
        
        // --- Feedback Generation Logic (Same as before) ---
        const idealProfile = GENRE_IDEAL_PROFILES[project.genre];
        if (idealProfile) {
            const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
            const viewers = [
                'Michael', 'Jennifer', 'David', 'Jessica', 'James', 'Sarah', 'John', 'Linda', 'Robert', 'Patricia',
                'Chris', 'Elizabeth', 'Daniel', 'Susan', 'Paul', 'Karen', 'Mark', 'Nancy', 'Brian', 'Lisa',
                'Kevin', 'Betty', 'George', 'Dorothy', 'Steven', 'Mary', 'Ryan', 'Sandra', 'Jacob', 'Ashley'
            ];
            const usedViewerNames = new Set<string>();
            const pickUniqueRandomViewer = (): string => {
                if (usedViewerNames.size >= viewers.length) return "Viewer";
                let viewerName;
                do {
                    viewerName = pickRandom(viewers);
                } while (usedViewerNames.has(viewerName));
                usedViewerNames.add(viewerName);
                return viewerName;
            };

            const focusCategories = [
                { key: 'action', label: t.creativeFocus.action, value: project.focusAction },
                { key: 'humor', label: t.creativeFocus.humor, value: project.focusHumor },
                { key: 'romance', label: t.creativeFocus.romance, value: project.focusRomance },
                { key: 'dialogues', label: t.creativeFocus.dialogues, value: project.focusDialogues },
                { key: 'violence', label: t.creativeFocus.violence, value: project.focusViolence },
                { key: 'costumes', label: t.creativeFocus.costumes, value: project.focusCostumes },
                { key: 'makeup', label: t.creativeFocus.makeup, value: project.focusMakeup },
                { key: 'stunts', label: t.creativeFocus.stunts, value: project.focusStunts },
            ];

            const categoriesWithDeviation = focusCategories.map(category => {
                const playerValue = category.value === 0 ? 0 : category.value ?? 5;
                const idealValue = idealProfile[category.key as keyof typeof idealProfile];
                const deviation = idealValue !== undefined ? Math.abs(playerValue - idealValue) : 0;
                return { ...category, deviation, idealValue };
            });

            const imperfectMatches = categoriesWithDeviation.filter(c => c.deviation > 0).sort((a, b) => b.deviation - a.deviation);
            const perfectMatches = categoriesWithDeviation.filter(c => c.deviation === 0).sort(() => 0.5 - Math.random());
            
            let selectedCategories = [...imperfectMatches, ...perfectMatches].slice(0, 4);

            selectedCategories.forEach((category) => {
                if (category.idealValue === undefined) return;
                const playerValue = category.value === 0 ? 0 : category.value ?? 5;
                const idealValue = category.idealValue;
                const difference = playerValue - idealValue;
                let comment = '';
                
                const feedbackTemplates = {
                    tooLow: [
                        `I expected much more ${category.label}. It was almost missing.`,
                        `${category.label} was neglected in this film.`
                    ],
                    low: [
                        `A bit more ${category.label} wouldn't have hurt.`,
                        `I think they could have emphasized ${category.label} more.`
                    ],
                    tooHigh: [
                        `They really overdid it with ${category.label}. Less would have been more.`,
                        `Why so much ${category.label}? It was too much.`
                    ],
                    high: [
                        `At times, the ${category.label} was a bit overwhelming.`,
                        `I think the film would have worked with slightly less ${category.label}.`
                    ],
                    perfect: [
                        `The balance of ${category.label} was perfect. Great job!`,
                        `Just the right amount of ${category.label}. That made the film for me.`
                    ]
                };
                
                if (language === 'de') {
                     feedbackTemplates.tooLow = [
                        `Von ${category.label} hätte ich mir deutlich mehr erwartet. Das fehlte fast komplett.`,
                        `Ich fand, dass ${category.label} in dem Film sträflich vernachlässigt wurde.`,
                    ];
                    feedbackTemplates.low = [
                        `Eine Prise mehr ${category.label} hätte dem Film nicht geschadet.`,
                        `Ich fand, man hätte ${category.label} noch etwas stärker betonen können.`,
                    ];
                    feedbackTemplates.tooHigh = [
                        `Mit ${category.label} hat man es wirklich übertrieben. Weniger wäre hier definitiv mehr gewesen.`,
                        `Warum so viel ${category.label}? Das war wirklich too much.`,
                    ];
                    feedbackTemplates.high = [
                        `Stellenweise war mir das ein bisschen zu viel ${category.label}.`,
                        `Ich glaube, der Film hätte auch mit etwas weniger ${category.label} funktioniert.`,
                    ];
                    feedbackTemplates.perfect = [
                        `Die Balance beim Thema ${category.label} war perfekt getroffen. Großartig!`,
                        `Genau die richtige Dosis ${category.label}. Das hat für mich den Film ausgemacht.`,
                    ];
                }

                if (difference <= -3) comment = pickRandom(feedbackTemplates.tooLow);
                else if (difference < 0) comment = pickRandom(feedbackTemplates.low);
                else if (difference >= 3) comment = pickRandom(feedbackTemplates.tooHigh);
                else if (difference > 0) comment = pickRandom(feedbackTemplates.high);
                else comment = pickRandom(feedbackTemplates.perfect);
                
                feedback.push({ viewer: pickUniqueRandomViewer(), text: comment });
            });
        }
        
        // Update state with new feedback
        const updatedCompletedFilms = prev.completedFilms.map(f => {
            if (f.workingTitle === project.workingTitle) {
                return { ...f, testAudienceFeedback: feedback };
            }
            return f;
        });

        // Also update currentProject if it matches (for consistency, though we likely navigated here after completion)
        let updatedCurrentProject = prev.currentProject;
        if (prev.currentProject && prev.currentProject.workingTitle === project.workingTitle) {
             updatedCurrentProject = { ...prev.currentProject, testAudienceFeedback: feedback };
        }

        return {
            ...prev,
            completedFilms: updatedCompletedFilms,
            currentProject: updatedCurrentProject
        };
      });
    }

    // Total cost calculation logic... (runs if totalCost missing)
    if (project && project.totalCost === undefined && playerData) {
         const weeklyCostsTransactions = playerData.transactionLog.filter(t => 
            t.category === 'Filmproduktion' && 
                ((t.descriptionKey === 'weeklyProductionCosts' && t.descriptionVars?.filmTitle === project.workingTitle) || t.description.startsWith('Wöchentliche Fixkosten') || t.description.startsWith('Weekly fixed costs')) &&
            t.description.includes(`"${project.workingTitle}"`)
        );
        const totalWeeklyCosts = weeklyCostsTransactions.reduce((sum, t) => sum + t.amount, 0);

        const productionEventTransactions = playerData.transactionLog.filter(t => 
            project.productionStartDate &&
            t.category === 'Filmproduktion' && 
            t.type === 'Ausgabe' &&
            (t.description.startsWith('Produktions-Event:') || t.description.startsWith('Production Event:')) &&
            new Date(t.date) >= new Date(project.productionStartDate)
        );
        const totalProductionEventCosts = productionEventTransactions.reduce((sum, t) => sum + t.amount, 0);

        const marketingCampaignTransactions = playerData.transactionLog.filter(t =>
            t.category === 'Marketing' &&
            t.type === 'Ausgabe' &&
            t.descriptionKey === 'marketingCampaign' &&
            t.descriptionVars?.filmTitle === project.workingTitle
        );
        const totalMarketingCampaignCosts = marketingCampaignTransactions.reduce((sum, t) => sum + t.amount, 0);

        const totalCost = (project.scriptBudget || 0) + 
                  (project.movieSizeBudget || 0) +
                  (project.seriesPlanningCost || 0) +
                          (project.castingCost || 0) +
                          (project.directorGage || 0) + 
                          (project.mainActorGage || 0) + 
                          (project.supportingActorGage || 0) + 
                          (project.productionCost || 0) + 
                          (project.postProductionCost || 0) +
                          totalWeeklyCosts +
                          totalProductionEventCosts +
                          totalMarketingCampaignCosts;
        
        setPlayerData(prev => {
            if (!prev) return prev;
            // Update in completed list
             const updatedCompletedFilms = prev.completedFilms.map(f => {
                if (f.workingTitle === project.workingTitle) {
                    return { ...f, totalCost };
                }
                return f;
            });
            // Update current if matching
            let updatedCurrentProject = prev.currentProject;
            if (prev.currentProject && prev.currentProject.workingTitle === project.workingTitle) {
                 updatedCurrentProject = { ...prev.currentProject, totalCost };
            }

            return {
                ...prev,
                completedFilms: updatedCompletedFilms,
                currentProject: updatedCurrentProject
            };
        });
    }
  }, [project, playerData, setPlayerData, t, language]);
  
  if (!playerData || !project) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>{t.project.progress.noActive}</p>
        <button onClick={onBack}>{t.common.back}</button>
      </div>
    );
  }

  const archiveProject = (startMarketing: boolean) => {
    setPlayerData(prev => {
        if (!prev) return prev;
        
        const film = { ...project };
        const filmQuality = film.finalQuality || 0;
        let newMessages = [...prev.messages];

        // --- CONTRACT LOGIC START ---
        if (film.contract) {
            const isSuccess = filmQuality >= film.contract.minQuality;
            const productionCost = film.totalCost || 0;
            const upfront = film.contract.upfrontPayment || 0;
            
            let capitalChange = 0;
            let transactionDescription = "";
            let transactionType: 'Einnahme' | 'Ausgabe' = 'Einnahme';

            const refund = productionCost;

            if (isSuccess) {
                const remainingPayout = film.contract.payout - upfront;
                capitalChange = refund + remainingPayout;
                
                transactionDescription = language === 'de'
                    ? `Auftrag erfüllt: "${film.workingTitle}" (Erstattung + Restprovision)`
                    : `Contract fulfilled: "${film.workingTitle}" (reimbursement + remaining commission)`;
                transactionType = 'Einnahme';
                
                prev.reputation = Math.min(100, prev.reputation + 1);
            } else {
                const deduction = film.contract.penalty + upfront;
                capitalChange = refund - deduction;
                
                if (capitalChange >= 0) {
                     transactionDescription = language === 'de'
                        ? `Auftrag beendet: "${film.workingTitle}" (Erstattung abzügl. Strafe/Vorschuss)`
                        : `Contract closed: "${film.workingTitle}" (reimbursement minus penalty/advance)`;
                     transactionType = 'Einnahme';
                } else {
                     transactionDescription = language === 'de'
                        ? `Auftragsstrafe + Rückzahlung: "${film.workingTitle}"`
                        : `Contract penalty + repayment: "${film.workingTitle}"`;
                     transactionType = 'Ausgabe';
                     capitalChange = Math.abs(capitalChange); 
                }
                
                prev.reputation = Math.max(0, prev.reputation - 2);
            }

            if (transactionType === 'Einnahme') {
                prev.capital += capitalChange;
            } else {
                prev.capital -= capitalChange;
            }

            prev.transactionLog.push({
                date: new Date(prev.gameDate),
                type: transactionType,
                category: 'Filmproduktion',
                description: transactionDescription,
                amount: capitalChange
            });
            
              const emailSubject = language === 'de' ? `Projektabschluss: ${film.contract.title}` : `Project Completion: ${film.contract.title}`;
            let emailBody = "";
            const formattedUpfront = formatCurrency(upfront);

            if (isSuccess) {
                  emailBody = language === 'de'
                    ? `Sehr geehrte Damen und Herren,\n\nvielen Dank für die Fertigstellung von "${film.contract.title}".\n\nDas Ergebnis hat uns überzeugt. Die Qualität von ${Math.round(filmQuality)} liegt über unserer Anforderung von ${film.contract.minQuality}.\n\nWie vereinbart erstatten wir die Produktionskosten in Höhe von ${formatCurrency(productionCost)} und überweisen die Restprovision (abzügl. Vorschuss von ${formattedUpfront}).\n\nWir freuen uns auf weitere Zusammenarbeit.\n\nMit freundlichen Grüßen,\n${film.contract.stationName}`
                    : `Dear Sir or Madam,\n\nthank you for completing "${film.contract.title}".\n\nThe result convinced us. The quality of ${Math.round(filmQuality)} exceeds our requirement of ${film.contract.minQuality}.\n\nAs agreed, we reimburse production costs of ${formatCurrency(productionCost)} and transfer the remaining commission (minus the advance of ${formattedUpfront}).\n\nWe look forward to working together again.\n\nSincerely,\n${film.contract.stationName}`;
            } else {
                  emailBody = language === 'de'
                    ? `Sehr geehrte Damen und Herren,\n\nwir haben die Endfassung von "${film.contract.title}" geprüft.\n\nLeider entspricht die Qualität von ${Math.round(filmQuality)} nicht unseren Anforderungen (Ziel: ${film.contract.minQuality}).\n\nWir erstatten vertragsgemäß die Produktionskosten von ${formatCurrency(productionCost)}, müssen jedoch die vereinbarte Vertragsstrafe in Höhe von ${formatCurrency(film.contract.penalty)} sowie den geleisteten Vorschuss von ${formattedUpfront} verrechnen.\n\nMit freundlichen Grüßen,\n${film.contract.stationName}`
                    : `Dear Sir or Madam,\n\nwe have reviewed the final cut of "${film.contract.title}".\n\nUnfortunately, the quality of ${Math.round(filmQuality)} does not meet our requirement (target: ${film.contract.minQuality}).\n\nAs per contract, we reimburse production costs of ${formatCurrency(productionCost)}, but must offset the agreed contractual penalty of ${formatCurrency(film.contract.penalty)} and the advance of ${formattedUpfront}.\n\nSincerely,\n${film.contract.stationName}`;
            }

            const contractEndMessage: Message = {
                id: `msg_contract_end_${Date.now()}`,
                date: new Date(prev.gameDate),
                sender: film.contract.stationName,
                subject: emailSubject,
                body: emailBody,
                read: false
            };
            newMessages.push(contractEndMessage);
        }
        // --- CONTRACT LOGIC END ---
        
        let prestigeChange = 0;
        let newReputation = prev.reputation;
        if (!film.prestigeAwarded && !film.contract) { 
            prestigeChange = 1; 
            prestigeChange += getQualityPrestigeBonus(filmQuality);
            newReputation = Math.min(100, Math.max(0, prev.reputation + prestigeChange));
            film.prestigeAwarded = true; 
        }

        if (startMarketing && !film.contract) {
            const firstOfferInDays = 3 + Math.floor(Math.random() * 5); 
            const nextOfferDate = new Date(prev.gameDate);
            nextOfferDate.setDate(nextOfferDate.getDate() + firstOfferInDays);
            film.nextOfferDate = nextOfferDate;
        }

        const updateTalentStats = (talent: any) => { 
            const newTalent = { ...talent };
            // Skill increases
            const skillGain = 1 + Math.floor(Math.random() * 3);
            newTalent.potential = Math.min(100, newTalent.potential);
            newTalent.skill = Math.min(100, Math.min(newTalent.potential, newTalent.skill + skillGain));
            
            // Loyalty / Moral
            newTalent.loyalty = Math.min(100, (newTalent.loyalty || 0) + 5 + Math.floor(Math.random() * 6));
            const moralDecrease = 20 + Math.floor(Math.random() * 21);
            newTalent.moral = Math.max(0, newTalent.moral - moralDecrease);

            const isDirector = 'speedModifier' in newTalent;
            const skill = newTalent.skill;

            // Updated Formula (Tiered)
            let multiplier = isDirector ? 8 : 10;
            if (skill <= 20) multiplier = isDirector ? 2 : 4;
            else if (skill <= 50) multiplier = isDirector ? 4 : 6;
            else if (skill <= 80) multiplier = isDirector ? 6 : 8;

            const baseCost = 15000 + multiplier * Math.pow(skill, 3.1);

            // UPDATE: Removed Bekanntheit multiplier from cost calculation
            // Bekanntheit is now purely an internal knowledge level, not market fame.
            newTalent.cost = Math.round(baseCost / 100) * 100;
            return newTalent;
        };
        
        const hiredDirectorId = film.directorId;
        const hiredActorIds = [film.mainActorId, film.supportingActorId].filter(id => id !== undefined && id !== -1) as number[];
        
        let updatedDirectors = prev.directors.map(d => (d.id === hiredDirectorId) ? updateTalentStats(d) : d);
        let updatedActors = prev.actors.map(a => (hiredActorIds.includes(a.id)) ? updateTalentStats(a) : a);

        let finalSpezialisierungen = [...prev.genreSpezialisierungen];
        if (filmQuality >= 70) {
            const involvedTalentIds = [film.directorId, ...hiredActorIds].filter(id => id !== undefined && id !== -1) as number[];
            involvedTalentIds.forEach(talentId => {
                const spezIndex = finalSpezialisierungen.findIndex(s => s.talentId === talentId && s.genre === film.genre);
                if (spezIndex > -1) {
                    finalSpezialisierungen[spezIndex].level = Math.min(5, finalSpezialisierungen[spezIndex].level + 1);
                } else {
                    finalSpezialisierungen.push({ talentId, genre: film.genre, level: 1 });
                }
            });
        }
        
        let finalChemie = [...prev.talentChemie];
        const updateChemie = (id1: number, id2: number) => {
            if (id1 === -1 || id2 === -1) return;
            const ids = [id1, id2].sort((a,b) => a-b);
            const chemieIndex = finalChemie.findIndex(c => c.talentA_id === ids[0] && c.talentB_id === ids[1]);
            if(chemieIndex > -1) {
                finalChemie[chemieIndex].level = Math.min(5, finalChemie[chemieIndex].level + 1);
            } else {
                finalChemie.push({ talentA_id: ids[0], talentB_id: ids[1], level: 1 });
            }
        };

        if (filmQuality >= 80 && film.directorId !== undefined && film.mainActorId !== undefined) {
            updateChemie(film.directorId, film.mainActorId);
        }
        if (filmQuality >= 75 && film.mainActorId !== undefined && film.supportingActorId !== undefined) {
            updateChemie(film.mainActorId, film.supportingActorId);
        }
        
        const updatedCompletedFilms = prev.completedFilms.map(f => {
            if (f.workingTitle === film.workingTitle) {
                return film; 
            }
            return f;
        });

        // Filter out contract films from marketing list if they are contract
        const finalCompletedFilms = film.contract 
            ? updatedCompletedFilms.filter(f => f.workingTitle !== film.workingTitle)
            : updatedCompletedFilms;
            
        // ALSO: Clear the specific project from currentProject if it matches
        let newCurrentProject = prev.currentProject;
        if (prev.currentProject && prev.currentProject.workingTitle === film.workingTitle) {
            newCurrentProject = null;
        }

        return {
            ...prev,
            reputation: newReputation,
            completedFilms: finalCompletedFilms,
            directors: updatedDirectors,
            actors: updatedActors,
            talentChemie: finalChemie,
            genreSpezialisierungen: finalSpezialisierungen,
            currentProject: newCurrentProject, // Clears it only if it matches
            messages: newMessages,
            lastNotifiedScriptTitle: undefined,
            lastNotifiedCastingTitle: undefined,
            lastNotifiedProductionFinishedTitle: undefined,
            lastNotifiedCompletedTitle: undefined,
        }
    });
  };
  
  const handleArchive = () => {
    archiveProject(true);
    setGameState(GameState.MainScreen);
  };
  
  const {
      coverImageId = 1,
      coverTitlePosition = 'bottom',
      coverTitleFontSize = 30,
      coverTitleFontFamily = 'Cinzel',
      coverTitleColor = '#FFFFFF'
  } = project;

  const getPositionClass = () => {
        switch (coverTitlePosition) {
            case 'top': return 'justify-start pt-2';
            case 'top-center': return 'justify-start pt-[25%]';
            case 'center': return 'justify-center';
            case 'bottom-center': return 'justify-end pb-[25%]';
            case 'bottom': return 'justify-end pb-2';
            default: return 'justify-end pb-2';
        }
    };

    // Helper to resolve name including family
  const resolveName = (id: number | undefined) => {
        if (id === undefined) return language === 'de' ? 'Unbekannt' : 'Unknown';
    if (id === -1) return playerData.playerName;
        if (id === 99901) return playerData.partnerName || (language === 'de' ? 'Partner' : 'Partner');
        if (id >= 99910) return playerData.children[id - 99910]?.name || (language === 'de' ? 'Kind' : 'Child');
    
    const director = playerData.directors.find(d => d.id === id);
    if (director) return director.name;
    
    const actor = playerData.actors.find(a => a.id === id);
    if (actor) return actor.name;
    
        return language === 'de' ? 'Unbekannt' : 'Unknown';
  };

  const director = resolveName(project.directorId);
  const mainActor = resolveName(project.mainActorId);
  const supportingActor = resolveName(project.supportingActorId);

  const movieSizeName = project.movieSize ? MOVIE_SIZE_CONFIG[project.movieSize].name : 'N/A';
  const extrasName = project.extrasLevel ? (t.productionOptions.extras[`level${project.extrasLevel}` as keyof typeof t.productionOptions.extras]?.name || EXTRAS_OPTIONS.find(e => e.level === project.extrasLevel)?.name) : '-';

  
  const FocusBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="flex items-center justify-between text-xs py-1">
        <span className="text-gray-400 w-24">{label}</span>
        <div className="flex-grow bg-gray-700 rounded-full h-2.5 mx-2">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value * 10}%` }}></div>
        </div>
        <span className="font-mono text-white w-4 text-right">{value}</span>
    </div>
);

const idealProfile = GENRE_IDEAL_PROFILES[project.genre];

const getFocusColor = (playerValue: number | undefined, idealValue: number): string => {
  const value = playerValue === 0 ? 0 : playerValue ?? 5;
  const diff = Math.abs(value - idealValue);

  if (diff === 0) return 'bg-green-500';
  if (diff === 1) return 'bg-yellow-500';
  return 'bg-red-500';
};

const InfoRow: React.FC<{ label: React.ReactNode; value: string | number | React.ReactNode; isSub?: boolean }> = ({ label, value, isSub = false }) => (
  <div className={`flex justify-between items-center py-1.5 ${isSub ? 'pl-4' : ''} border-b border-gray-800`}>
    <span className={isSub ? 'text-gray-400' : 'text-gray-300'}>{label}</span>
    <span className="font-semibold text-white text-right">{value}</span>
  </div>
);

  // --- SPECIAL RENDER FOR CONTRACT WORK ---
  if (project.contract) {
      const isSuccess = (project.finalQuality || 0) >= project.contract.minQuality;
      const totalCost = project.totalCost || 0;
      const upfront = project.contract.upfrontPayment || 0;
      
      // Calculate net transaction for this screen (what hits the account NOW)
      // Success: Refund + (Payout - Upfront)
      // Failure: Refund - (Penalty + Upfront)
      // Note: Refund is the production cost
      const penalty = project.contract.penalty;
      const netTransaction = isSuccess
        ? (totalCost + (project.contract.payout - upfront))
        : (totalCost - penalty - upfront);
        
      
      return (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${newProjectBackgroundImage})` }}
        >
          <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-80 p-4 overflow-y-auto">
             <div className="bg-gray-800 border-2 border-amber-500 rounded-lg shadow-2xl w-full max-w-3xl p-8 relative flex flex-col animate-fade-in">
                
                {/* Header */}
                <h2 className="text-4xl font-bold text-center mb-8 font-cinzel text-amber-400 border-b border-gray-700 pb-4">
                    {language === 'de' ? 'Zusammenfassung-Auftragsarbeit' : 'Contract Work Summary'}
                </h2>

                <div className="space-y-6">
                    {/* Contract Details */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">{language === 'de' ? 'Vertragsbedingungen' : 'Contract Terms'}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <InfoRow label={language === 'de' ? 'Sender:' : 'Station:'} value={project.contract.stationName} />
                            <InfoRow label={language === 'de' ? 'Genre:' : 'Genre:'} value={t.genres[project.contract.genre]} />
                            <InfoRow label={language === 'de' ? 'Titel:' : 'Title:'} value={project.workingTitle} />
                            <InfoRow label={language === 'de' ? 'Geforderte Qualität:' : 'Required Quality:'} value={`${project.contract.minQuality}`} />
                            <InfoRow label={language === 'de' ? 'Erhaltener Vorschuss:' : 'Advance Received:'} value={formatCurrency(upfront)} />
                        </div>
                    </div>

                    {/* Result */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                         <h3 className="text-xl font-bold text-white mb-4">{language === 'de' ? 'Ergebnis' : 'Result'}</h3>
                         <div className="flex justify-between items-center mb-4 text-lg">
                             <span>{language === 'de' ? 'Erreichte Qualität:' : 'Achieved Quality:'}</span>
                             <div className="flex items-center gap-3">
                                 <StarRating rating={project.finalQuality || 0} size="md"/>
                                 <span className={`font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                                     ({Math.round(project.finalQuality || 0)})
                                 </span>
                             </div>
                         </div>
                         
                         <div className={`p-4 rounded border-l-4 ${isSuccess ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                             {isSuccess ? (
                                 <>
                                    <h4 className="text-green-400 font-bold mb-2">{language === 'de' ? 'Auftrag erfolgreich!' : 'Contract Successful!'}</h4>
                                    <p className="text-gray-300 text-sm">
                                        {language === 'de'
                                            ? <>Sie haben den Auftrag zu unserer Zufriedenheit erledigt. Sie erhalten die Produktionskosten von <span className="text-white font-bold">{formatCurrency(totalCost)}</span> erstattet. Zusätzlich wird die vereinbarte Provision von <span className="text-white font-bold">{formatCurrency(project.contract.payout)}</span> fällig (abzüglich des bereits erhaltenen Vorschusses von {formatCurrency(upfront)}).</>
                                            : <>You fulfilled the contract to our satisfaction. You are reimbursed production costs of <span className="text-white font-bold">{formatCurrency(totalCost)}</span>. In addition, the agreed commission of <span className="text-white font-bold">{formatCurrency(project.contract.payout)}</span> becomes due (minus the advance already received of {formatCurrency(upfront)}).</>}
                                    </p>
                                 </>
                             ) : (
                                 <>
                                     <h4 className="text-red-400 font-bold mb-2">{language === 'de' ? 'Auftrag gescheitert' : 'Contract Failed'}</h4>
                                     <p className="text-gray-300 text-sm">
                                         {language === 'de'
                                            ? <>Sie haben die geforderte Qualität nicht erreicht. Die Produktionskosten von <span className="text-white font-bold">{formatCurrency(totalCost)}</span> werden erstattet, aber die Vertragsstrafe von <span className="text-red-400 font-bold">{formatCurrency(penalty)}</span> sowie der erhaltene Vorschuss von <span className="text-red-400 font-bold">{formatCurrency(upfront)}</span> werden abgezogen.</>
                                            : <>You did not reach the required quality. Production costs of <span className="text-white font-bold">{formatCurrency(totalCost)}</span> are reimbursed, but the contractual penalty of <span className="text-red-400 font-bold">{formatCurrency(penalty)}</span> and the advance received of <span className="text-red-400 font-bold">{formatCurrency(upfront)}</span> are deducted.</>}
                                     </p>
                                 </>
                             )}
                         </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-2">{language === 'de' ? 'Abrechnung (Jetzt)' : 'Settlement (Now)'}</h3>
                        <div className="space-y-1">
                             {isSuccess ? (
                                 <>
                                    <InfoRow label={language === 'de' ? 'Erstattung Produktionskosten:' : 'Production Cost Reimbursement:'} value={`+${formatCurrency(totalCost)}`} />
                                    <InfoRow label={language === 'de' ? 'Vereinbarte Provision:' : 'Agreed Commission:'} value={`+${formatCurrency(project.contract.payout)}`} />
                                    <InfoRow label={language === 'de' ? 'Abzüglich Vorschuss:' : 'Less Advance:'} value={`-${formatCurrency(upfront)}`} />
                                    <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-lg">
                                        <span>{language === 'de' ? 'Gutschrift:' : 'Credit:'}</span>
                                        <span className="text-green-400">+{formatCurrency(netTransaction)}</span>
                                    </div>
                                 </>
                             ) : (
                                 <>
                                    <InfoRow label={language === 'de' ? 'Erstattung Produktionskosten:' : 'Production Cost Reimbursement:'} value={`+${formatCurrency(totalCost)}`} />
                                    <InfoRow label={language === 'de' ? 'Vertragsstrafe:' : 'Contract Penalty:'} value={`-${formatCurrency(penalty)}`} />
                                    <InfoRow label={language === 'de' ? 'Rückzahlung Vorschuss:' : 'Advance Repayment:'} value={`-${formatCurrency(upfront)}`} />
                                    <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-lg">
                                        <span>{language === 'de' ? 'Gesamtbilanz (Gutschrift/Lastschrift):' : 'Net Balance (Credit/Debit):'}</span>
                                        <span className={netTransaction >= 0 ? "text-green-400" : "text-red-400"}>
                                            {netTransaction >= 0 ? '+' : ''}{formatCurrency(netTransaction)}
                                        </span>
                                    </div>
                                 </>
                             )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleArchive}
                      className="bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                    >
                      {t.common.close}
                    </button>
                </div>
             </div>
          </div>
        </div>
      );
  }
  
  // --- STANDARD RENDER FOR NORMAL FILMS ---
  const idealRating = GENRE_IDEAL_AGE_RATING[project.genre];
  const isRatingCorrect = project.ageRating === idealRating;
  const ratingLabel = project.ageRating ? t.project.planning.ratings[project.ageRating] : '-';
    const summaryTitle = isSeries
        ? (language === 'de' ? 'Serienzusammenfassung' : 'Series Summary')
        : t.completedProject.title;
    const sizeOrSeasonLabel = isSeries
        ? (language === 'de' ? 'Staffel' : 'Season')
        : t.completedProject.size;
    const sizeOrSeasonValue = isSeries
        ? `${project.seasonNumber || 1}`
        : movieSizeName;

  return (
    <div
      className="w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${newProjectBackgroundImage})` }}
    >
      <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-0 p-4 overflow-y-auto">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-7xl border border-gray-700">
          <h2 className="text-4xl font-bold text-center mb-2 font-cinzel text-amber-400">{summaryTitle}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Cover */}
                <div className="md:col-span-1 flex items-center justify-center">
                    <div className="relative w-[300px] h-[450px] bg-gray-900 rounded-lg shadow-lg overflow-hidden group border-2 border-gray-700">
                        <img
                            src={project.customCover || getCoverPath(project.genre, coverImageId)}
                            alt={`Cover für ${project.workingTitle}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                        />
                        <div className={`absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass()}`}>
                            <h3 className="text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                                style={{ fontFamily: coverTitleFontFamily, fontSize: `${(coverTitleFontSize || 30)}px`, lineHeight: 1.2, color: coverTitleColor }}>
                                {project.workingTitle}
                            </h3>
                        </div>
                         { (project.directorId !== undefined && project.mainActorId !== undefined) &&
                            (() => {
                                const titlePos = coverTitlePosition || 'bottom';
                                const namesPositionClass = (titlePos === 'top' || titlePos === 'top-center' || titlePos === 'center') ? 'bottom-2' : 'top-2';
                                const directorNameUpper = director.toUpperCase();
                                const mainActorNameUpper = mainActor.toUpperCase();
                                const combinedLength = directorNameUpper.length + mainActorNameUpper.length;

                                let nameFontSize = 14; 
                                if (combinedLength > 35) nameFontSize = 10;
                                else if (combinedLength > 25) nameFontSize = 11;
                                else if (combinedLength > 18) nameFontSize = 12;
                
                                return (
                                    <div 
                                        className={`absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-1`}
                                        style={{
                                            color: coverTitleColor || '#FFFFFF',
                                            fontSize: `${nameFontSize}px`,
                                            lineHeight: '1.2'
                                        }}
                                    >
                                        <p>{directorNameUpper} <span className="mx-1">•</span> {mainActorNameUpper}</p>
                                    </div>
                                );
                            })()
                        }
                    </div>
                </div>

                {/* Middle Column: Details */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-amber-300 border-b border-gray-600 pb-2 mb-2">{t.completedProject.overview}</h3>
                        <InfoRow label={t.completedProject.filmTitle} value={project.workingTitle} />
                        <InfoRow label={t.completedProject.genre} value={t.genres[project.genre]} />
                        <InfoRow label={sizeOrSeasonLabel} value={sizeOrSeasonValue} />
                        <InfoRow 
                            label={t.project.planning.ageRating} 
                            value={
                                <span className={isRatingCorrect ? 'text-green-400' : 'text-red-400'}>
                                    {ratingLabel}
                                </span>
                            } 
                        />
                        <InfoRow label={t.completedProject.director} value={director} />
                        <InfoRow label={t.completedProject.mainActor} value={mainActor} />
                        <InfoRow label={t.completedProject.supportingActor} value={supportingActor} />
                        <InfoRow label={t.completedProject.extras} value={extrasName} />
                    </div>
                    
                     <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                         <div className="flex justify-between items-center">
                            <span className="text-gray-300">{t.completedProject.finalQuality}</span>
                            <StarRating rating={project.finalQuality || 0} size="md"/>
                        </div>
                        <div className="mt-2 flex justify-between items-center border-t border-gray-600 pt-2">
                            <span className="text-gray-300">{t.completedProject.totalCost}</span>
                            <span className="font-bold text-amber-400">{formatCurrency(project.totalCost || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Feedback & Focus */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 h-1/2 overflow-y-auto">
                        <h3 className="text-lg font-bold text-amber-300 border-b border-gray-600 pb-2 mb-2">{t.completedProject.feedback}</h3>
                        <div className="space-y-3">
                            {(project.testAudienceFeedback || []).map((fb, i) => (
                                <div key={i} className="bg-gray-800/50 p-2 rounded-md">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ChatBubbleIcon className="h-4 w-4 text-gray-400" />
                                        <p className="font-bold text-white text-xs">{fb.viewer} sagt:</p>
                                    </div>
                                    <p className="text-xs text-gray-300 italic">"{fb.text}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 h-1/2">
                        <h3 className="text-lg font-bold text-amber-300 border-b border-gray-600 pb-2 mb-2">{t.completedProject.creativeFocus}</h3>
                        {idealProfile ? (
                            <div className="space-y-1">
                                <FocusBar label={t.creativeFocus.action} value={project.focusAction || 0} color={getFocusColor(project.focusAction, idealProfile.action)} />
                                <FocusBar label={t.creativeFocus.humor} value={project.focusHumor || 0} color={getFocusColor(project.focusHumor, idealProfile.humor)} />
                                <FocusBar label={t.creativeFocus.romance} value={project.focusRomance || 0} color={getFocusColor(project.focusRomance, idealProfile.romance)} />
                                <FocusBar label={t.creativeFocus.dialogues} value={project.focusDialogues || 0} color={getFocusColor(project.focusDialogues, idealProfile.dialogues)} />
                                <FocusBar label={t.creativeFocus.violence} value={project.focusViolence || 0} color={getFocusColor(project.focusViolence, idealProfile.violence)} />
                                <FocusBar label={t.creativeFocus.costumes} value={project.focusCostumes || 0} color={getFocusColor(project.focusCostumes, idealProfile.costumes)} />
                                <FocusBar label={t.creativeFocus.makeup} value={project.focusMakeup || 0} color={getFocusColor(project.focusMakeup, idealProfile.makeup)} />
                                <FocusBar label={t.creativeFocus.stunts} value={project.focusStunts || 0} color={getFocusColor(project.focusStunts, idealProfile.stunts)} />
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">Kein Idealprofil verfügbar</p>
                        )}
                    </div>
                </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleArchive}
              className="bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              {t.completedProject.returnToMenu}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedProjectScreen;
