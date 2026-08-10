import React, { useState, useMemo, useEffect } from 'react';
import { PlayerData, ProjectData, GameState, ProjectPhase, GameSpeed, Script, GenreProfile, EmployeeType, MovieSize, ProjectType } from '../types';
import { 
    LOCATION_OPTIONS, EXTRAS_OPTIONS, EDITING_OPTIONS, MUSIC_OPTIONS, SOUND_OPTIONS, 
    KAMERA_OPTIONS, LICHT_OPTIONS, TON_OPTIONS, AUSSTATTUNG_OPTIONS, SFX_OPTIONS, CATERING_OPTIONS, MOVIE_SIZE_CONFIG
} from './constants';
import { GENRE_IDEAL_PROFILES } from './genreProfiles';
import { useGame } from '../contexts/GameContext';
import KameraIcon from './icons/KameraIcon';
import LightIcon from './icons/LightIcon';
import SoundIcon from './icons/SoundIcon';
import AusstattungIcon from './icons/AusstattungIcon';
import LocationIcon from './icons/LocationIcon';
import ExtrasIcon from './icons/ExtrasIcon';
import SFXIcon from './icons/SFXIcon';
import CateringIcon from './icons/CateringIcon';
import StarIcon from './icons/StarIcon';
import { useTranslation } from '../hooks/useTranslation';
import { getProductionDurationMultiplier } from './studioBuildingEffects';
import { TranslationType } from '../translations/types';


interface NewProjectScreenPhase3Props {
  setGameState: (state: GameState) => void;
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  // FIX: Add 'project' prop to handle multiple active projects correctly.
  project: ProjectData;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

const FocusSlider: React.FC<{ label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="w-full">
        <div className="flex justify-between items-end mb-0.5">
            <label className="block text-xs text-gray-300">{label}</label>
            <span className="font-bold text-white text-xs">{value}</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="10" 
            step="1" 
            value={value} 
            onChange={onChange} 
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 block" 
        />
    </div>
);

const DepartmentCard: React.FC<{
    option: any;
    isSelected: boolean;
    onSelect: () => void;
    unlocked: boolean;
    translatedName?: string;
    translatedDesc?: string;
    translation: TranslationType;
    departmentKey: string;
    discountFactor: number; // NEW
}> = ({ option, isSelected, onSelect, unlocked, translatedName, translatedDesc, translation, departmentKey, discountFactor }) => {
    const starCount = option.level - 1; // 0 to 4 stars
    const isCatering = departmentKey === 'catering';
    const finalCost = Math.round(option.cost * (1 - discountFactor));

    return (
        <button
            onClick={onSelect}
            disabled={!unlocked}
            className={`p-3 rounded-lg border-2 text-left h-full flex flex-col transition-all duration-200 ${
                isSelected ? 'border-amber-400 bg-amber-900/50' : 'border-gray-600 hover:border-gray-500'
            } ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <h5 className="font-bold text-white">{option.level}. {translatedName || option.name}</h5>
            <p className="text-xs text-gray-400 mt-1 flex-grow">{translatedDesc || option.description}</p>
            <div className="text-xs mt-2 pt-2 border-t border-gray-600/50 space-y-1">
                <div className="flex justify-between">
                    <span>{translation.project.production.cardCost}</span> 
                    <div>
                         {discountFactor > 0 && <span className="line-through text-gray-500 mr-1">{formatCurrency(option.cost)}</span>}
                         <span className="font-bold">{formatCurrency(finalCost)}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span>{isCatering ? translation.project.production.cardMoral : translation.project.production.cardQuality}</span>
                    <div className="flex h-3 items-center">
                        {Array.from({ length: starCount }).map((_, i) => <StarIcon key={`filled-${i}`} className="h-3 w-3 text-yellow-400" />)}
                        {Array.from({ length: 4 - starCount }).map((_, i) => <StarIcon key={`empty-${i}`} className="h-3 w-3 text-gray-600" />)}
                    </div>
                </div>
                {option.durationModifier !== undefined && <div className="flex justify-between"><span>{translation.project.production.cardDurationMod}</span> <span className="font-bold">{option.durationModifier}x</span></div>}
            </div>
        </button>
    );
};

const DepartmentSummaryCard: React.FC<{
    department: { name: string; icon: React.ReactNode; level: number; options: any[], translationKey: string };
    onClick: () => void;
    translation: TranslationType;
    discountFactor: number;
}> = ({ department, onClick, translation, discountFactor }) => {
    const selectedOption = department.options.find(o => o.level === department.level)!;
    const starCount = selectedOption.level - 1;
    const isCatering = department.translationKey === 'catering';
    const finalCost = Math.round(selectedOption.cost * (1 - discountFactor));
    
    // Access translation safely
    const deptKey = department.translationKey as keyof typeof translation.productionOptions;
    const levelKey = `level${department.level}` as keyof typeof translation.productionOptions[typeof deptKey];
    const optionTranslation = translation.productionOptions[deptKey]?.[levelKey];

    return (
        <button
            onClick={onClick}
            className="w-full bg-gray-900/50 p-2 h-24 rounded-lg border border-gray-700 hover:border-amber-500/50 transition-all duration-300 flex items-start"
        >
            <div className="flex items-start gap-3 w-full">
                <div className="bg-gray-800 p-1 rounded-md mt-1 flex-shrink-0">{department.icon}</div>
                <div className="text-left flex-grow min-w-0">
                    <h4 className="font-cinzel text-amber-300 text-base truncate">{department.name}</h4>
                    <p className="text-xs text-gray-300 whitespace-normal truncate">{optionTranslation?.name || selectedOption.name}</p>
                </div>
                <div className="text-right text-xs flex-shrink-0 space-y-1 w-28">
                    <p className="text-gray-400">{translation.project.production.cardCost} <span className="font-mono text-white">{formatCurrency(finalCost)}</span></p>
                    <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-400">{isCatering ? translation.project.production.cardMoral : translation.project.production.cardQuality}</span>
                        <div className="flex h-3 items-center">
                            {Array.from({ length: starCount }).map((_, i) => <StarIcon key={`filled-${i}`} className="h-3 w-3 text-yellow-400" />)}
                            {Array.from({ length: 4 - starCount }).map((_, i) => <StarIcon key={`empty-${i}`} className="h-3 w-3 text-gray-600" />)}
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
};


const NewProjectScreen_Phase3: React.FC<NewProjectScreenPhase3Props> = ({ setGameState, onBack, gameSpeed, setGameSpeed, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  
  if (!playerData || !setPlayerData || !project) return null;

  type EditingDepartment = {
    name: string;
    icon: React.ReactNode;
    level: number;
    setLevel: React.Dispatch<React.SetStateAction<number>>;
    options: any[];
    translationKey: string;
  } | null;

  const [editingDepartment, setEditingDepartment] = useState<EditingDepartment>(null);

  const [kameraLevel, setKameraLevel] = useState(project.kameraLevel || 1);
  const [lichtLevel, setLichtLevel] = useState(project.lichtLevel || 1);
  const [tonLevel, setTonLevel] = useState(project.tonLevel || 1);
  const [ausstattungLevel, setAusstattungLevel] = useState(project.ausstattungLevel || 1);
  const [sfxLevel, setSfxLevel] = useState(project.sfxLevel || 1);
  const [cateringLevel, setCateringLevel] = useState(project.cateringLevel || 1);
  const [locationLevel, setLocationLevel] = useState(project.locationLevel || 1);
  const [extrasLevel, setExtrasLevel] = useState(project.extrasLevel || 1);
  
  const [focusAction, setFocusAction] = useState(project.focusAction || 0);
  const [focusHumor, setFocusHumor] = useState(project.focusHumor || 0);
  const [focusRomance, setFocusRomance] = useState(project.focusRomance || 0);
  const [focusDialogues, setFocusDialogues] = useState(project.focusDialogues || 0);
  const [focusViolence, setFocusViolence] = useState(project.focusViolence || 0);
  const [focusCostumes, setFocusCostumes] = useState(project.focusCostumes || 0);
  const [focusMakeup, setFocusMakeup] = useState(project.focusMakeup || 0);
  const [focusStunts, setFocusStunts] = useState(project.focusStunts || 0);
  
  const [error, setError] = useState('');
  const [showStartProductionConfirm, setShowStartProductionConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [weeklyProductionCost, setWeeklyProductionCost] = useState(0);
  
  const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

  const selectedDirector = useMemo(() => project.directorId === -1 ? { id: -1, name: playerData.playerName, cost: 0, speedModifier: 1.0, contract: undefined } : playerData.directors.find(d => d.id === project.directorId), [project.directorId, playerData.directors, playerData.playerName]);

  // CONCEPT IMPLEMENTATION: Project Planner Budget Efficiency
  const plannerDiscount = useMemo(() => {
      // Find the specific planner assigned to the project
      if (!project.plannerId) return 0;
      
      let planner: any = playerData.employees.find(e => e.id === project.plannerId);
      // Fallback check for family (Partner/Children) in ID range or manually
      if (!planner) {
          // Check partner
           if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.ProjektPlaner && project.plannerId === 99901) {
               planner = { talent: playerData.partnerSkills?.planning || 0, satisfaction: 100 }; // Simplified
           } else {
               // Check children
               const child = playerData.children.find(c => {
                   // Child IDs are like "child_timestamp", mapped to numeric IDs 99910+ index in ProjectPlanningTab.
                   // Here we might just use the numeric ID.
                   // Re-map logic: 99910 + index
                   const index = project.plannerId! - 99910;
                   return playerData.children[index] === c;
               });
               if (child && child.isEmployed && child.employedAs === EmployeeType.ProjektPlaner && child.skills) {
                   planner = { talent: child.skills.planning, satisfaction: 100 };
               }
           }
      }

      if (planner) {
           const effTalent = planner.talent * (planner.satisfaction / 100);
           // Discount: up to 20%
           return Math.min(0.20, effTalent / 500);
      }
      return 0;
  }, [project.plannerId, playerData]);

  const totalPoints = useMemo(() => {
        if (project.projectType === ProjectType.Series) {
            switch (project.seriesFormat) {
                case 'short':
                    return 8;
                case 'prestige':
                    return 12;
                case 'standard':
                default:
                    return 10;
            }
        }

    if (!project.movieSize || project.movieSizeBudget === undefined) return 0;
    const config = MOVIE_SIZE_CONFIG[project.movieSize];
    const budgetStep = config.budgetSteps.indexOf(project.movieSizeBudget);
    
    if (budgetStep !== -1 && config.focusPoints) {
        return config.focusPoints[budgetStep];
    }
    // Fallback if something is wrong with the index, though it should match
    return 10;
    }, [project.movieSize, project.movieSizeBudget, project.projectType, project.seriesFormat]);

  const usedPoints = useMemo(() => {
    return focusAction + focusHumor + focusRomance + focusDialogues + focusViolence + focusCostumes + focusMakeup + focusStunts;
  }, [focusAction, focusHumor, focusRomance, focusDialogues, focusViolence, focusCostumes, focusMakeup, focusStunts]);

  const handleFocusChange = (
      setter: React.Dispatch<React.SetStateAction<number>>,
      currentValue: number,
      newValue: number
  ) => {
      const delta = newValue - currentValue;
      if (usedPoints + delta <= totalPoints) {
          setter(newValue);
      }
  };

  const { productionDepartmentCost, totalDuration, totalQualityBonus } = useMemo(() => {
    const departments = [
        { options: KAMERA_OPTIONS, level: kameraLevel },
        { options: LICHT_OPTIONS, level: lichtLevel },
        { options: TON_OPTIONS, level: tonLevel },
        { options: AUSSTATTUNG_OPTIONS, level: ausstattungLevel },
        { options: SFX_OPTIONS, level: sfxLevel },
        { options: CATERING_OPTIONS, level: cateringLevel },
        { options: LOCATION_OPTIONS, level: locationLevel },
        { options: EXTRAS_OPTIONS, level: extrasLevel },
    ];

    let cost = 0;
    let durationModifier = 1.0;
    let qualityBonus = 0;

    for (const dept of departments) {
        const selectedOption = dept.options.find(o => o.level === dept.level);
        if (selectedOption) {
            // APPLY DISCOUNT HERE
            const discountedDeptCost = Math.round(selectedOption.cost * (1 - plannerDiscount));
            cost += discountedDeptCost;
            
            if (typeof (selectedOption as any).durationModifier === 'number') {
                durationModifier *= (selectedOption as any).durationModifier;
            }
            if (typeof selectedOption.qualityBonus === 'number') {
                qualityBonus += selectedOption.qualityBonus;
            }
        }
    }

    // Dynamic Base Duration based on Quality
    // Target: Quality 40 -> ~40 Days, Quality 75 -> ~120 Days
    const estimatedQuality = project.projectPotential || project.scriptQuality || 50;
    
    let baseDuration = 40;
    if (estimatedQuality > 40) {
        // Increase duration for higher quality films
        // Slope: (120 - 40) / (75 - 40) ≈ 2.28 days per quality point
        baseDuration += (estimatedQuality - 40) * 1;
    }

    let finalProductionDuration = isTestMode ? 10 : Math.round(baseDuration * (selectedDirector?.speedModifier || 1) * durationModifier);
    
    // CONTRACT WORK SPEED BONUS: 2/3 of normal time
    if (project.contract) {
        finalProductionDuration = Math.max(5, Math.round(finalProductionDuration * 0.66));
    }

    return { productionDepartmentCost: cost, totalDuration: finalProductionDuration, totalQualityBonus: qualityBonus };
  }, [
    kameraLevel, lichtLevel, tonLevel, ausstattungLevel, sfxLevel, cateringLevel, locationLevel, extrasLevel,
    isTestMode, selectedDirector, project.projectPotential, project.scriptQuality, plannerDiscount, project.contract
  ]);

  /*
   * FIX: Renamed from bisherigeGesamtkosten to bisherigeKosten to resolve the error "Cannot find name 'bisherigeKosten'"
   * when calling formatCurrency(bisherigeKosten) later in the JSX.
   */
  const bisherigeKosten = useMemo(() => {
    return (project.scriptBudget || 0) +
           (project.movieSizeBudget || 0) +
                     (project.seriesPlanningCost || 0) +
           (project.castingCost || 0) +
           (project.directorGage || 0) +
           (project.mainActorGage || 0) +
           (project.supportingActorGage || 0);
  }, [project]);

  /*
   * FIX: Updated to use the renamed variable bisherigeKosten.
   */
  const neueGesamtkosten = bisherigeKosten + productionDepartmentCost;

  useEffect(() => {
    if (neueGesamtkosten > 0) {
        const cost = Math.round(neueGesamtkosten * (0.004 + Math.random() * 0.003));
        setWeeklyProductionCost(cost);
    }
  }, [neueGesamtkosten]);

  const handleStartProduction = () => {
    if (playerData.capital < productionDepartmentCost && !isTestMode) {
        setError(t.project.casting.insufficientFunds);
        setShowStartProductionConfirm(false);
        return;
    }
    setError('');

    const startDate = new Date(playerData.gameDate);
    const endDate = new Date(playerData.gameDate);
    const adjustedDuration = Math.max(3, Math.round(totalDuration * getProductionDurationMultiplier(playerData)));
    endDate.setDate(endDate.getDate() + adjustedDuration);

    const totalProductionEvents = isTestMode ? (1 + Math.floor(Math.random() * 3)) : (1 + Math.floor(Math.random() * 3));

    let firstEventDate: Date | undefined;
    if (adjustedDuration > 3) {
        const eventDay = isTestMode ? 2 : 3 + Math.floor(Math.random() * Math.max(1, adjustedDuration - 4));
        firstEventDate = new Date(startDate);
        firstEventDate.setDate(firstEventDate.getDate() + eventDay);
    }

    setPlayerData(prev => {
        if (!prev) return null;

        const existingHype = project.hype || 0;
        let finalHype = existingHype;

        if (finalHype === 0) {
            const currentReputation = prev.reputation;
            const hypeVariance = Math.floor(Math.random() * 11) - 5; // -5 to +5
            finalHype = Math.max(0, Math.min(100, currentReputation + hypeVariance));
        }

        const updatedProjects = prev.activeProjects.map(p => {
            if (p.workingTitle === project.workingTitle) {
                return {
                    ...p,
                    phase: ProjectPhase.Production,
                    kameraLevel,
                    lichtLevel,
                    tonLevel,
                    ausstattungLevel,
                    sfxLevel,
                    cateringLevel,
                    locationLevel,
                    extrasLevel,
                    focusAction,
                    focusHumor,
                    focusRomance,
                    focusDialogues,
                    focusViolence,
                    focusCostumes,
                    focusMakeup,
                    focusStunts,
                    productionCost: productionDepartmentCost,
                    productionStartDate: startDate,
                    productionEndDate: endDate,
                    nextProductionEventDate: firstEventDate,
                    totalProductionEvents,
                    weeklyProductionCost,
                    hype: finalHype,
                    castingDirectorPool: undefined,
                    castingActorPool: undefined,
                    castingInvitedActors: undefined,
                };
            }
            return p;
        });

        let newCurrentProject = prev.currentProject;
        if(prev.currentProject?.workingTitle === project.workingTitle) {
            newCurrentProject = updatedProjects.find(p => p.workingTitle === project.workingTitle) || null;
        }

        return {
            ...prev,
            capital: prev.capital - productionDepartmentCost,
            activeProjects: updatedProjects,
            currentProject: newCurrentProject,
            transactionLog: [
                ...prev.transactionLog,
                {
                    date: new Date(prev.gameDate),
                    type: 'Ausgabe',
                    category: 'Filmproduktion',
                    description: `Produktionsstart: "${project.workingTitle}"`,
                    descriptionKey: 'productionStart',
                    descriptionVars: { title: project.workingTitle },
                    amount: productionDepartmentCost
                }
            ]
        };
    });
    
    setShowStartProductionConfirm(false);
    onBack(); // Go back to main or project list
  };

  // Handle Discard Project Logic (Duplicated logic from ProjectProgressScreen to ensure safety)
  const handleDiscardProject = () => {
    setPlayerData(prev => {
        if (!prev) return null;

        const updatedActiveProjects = prev.activeProjects.filter(p => p.workingTitle !== project.workingTitle);
        let newActivePlanning = prev.activePlanning;
        if (prev.activePlanning && prev.activePlanning.workingTitle === project.workingTitle) {
            newActivePlanning = null;
        }
        let newCurrentProject = prev.currentProject;
        if (prev.currentProject && prev.currentProject.workingTitle === project.workingTitle) {
            newCurrentProject = null;
        }

        let updatedAvailableScripts = [...prev.availableScripts];
        let newCapital = prev.capital;
        const newTransactions = [...prev.transactionLog];
        const newMessages = [...prev.messages];

        if (project.contract) {
            const penalty = project.contract.penalty;
            const upfront = project.contract.upfrontPayment || 0;
            const totalDeduction = penalty + upfront;
            newCapital -= totalDeduction;

            newTransactions.push({
                date: new Date(prev.gameDate),
                type: 'Ausgabe',
                category: 'Filmproduktion',
                description: language === 'de'
                    ? `Vertragsstrafe + Rückzahlung Vorschuss: "${project.workingTitle}"`
                    : `Contract penalty + advance repayment: "${project.workingTitle}"`,
                amount: totalDeduction
            });

            const formattedPenalty = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(penalty);
            const formattedUpfront = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(upfront);
            
            let subject = `Vertragsbruch: ${project.workingTitle}`;
            let body = `Sehr geehrte Damen und Herren,\n\nwir mussten feststellen, dass die Produktion von "${project.workingTitle}" abgebrochen wurde.\n\nDies stellt einen Bruch unseres Produktionsvertrages dar. Gemäß der Vereinbarung wird die Vertragsstrafe in Höhe von ${formattedPenalty} sofort fällig.\n\nZusätzlich fordern wir den geleisteten Vorschuss in Höhe von ${formattedUpfront} zurück.\n\nDer Gesamtbetrag wird Ihrem Konto belastet.\n\nMit freundlichen Grüßen,\n${project.contract.stationName}`;

            if (language !== 'de') {
                    subject = `Breach of Contract: ${project.workingTitle}`;
                    body = `Dear Sir or Madam,\n\nWe have noted that the production of "${project.workingTitle}" has been cancelled.\n\nThis constitutes a breach of our agreement. The penalty fee of ${formattedPenalty} is now due.\n\nAdditionally, we demand the repayment of the advance of ${formattedUpfront}.\n\nThe total amount will be deducted from your account immediately.\n\nSincerely,\n${project.contract.stationName}`;
            }

            newMessages.push({
                id: `msg_contract_fail_${Date.now()}`,
                date: new Date(prev.gameDate),
                sender: project.contract.stationName,
                subject: subject,
                body: body,
                read: false
            });

        } else {
            const scriptExists = prev.availableScripts.some(s => s.id === project.scriptId);
            if (project.scriptId && !scriptExists) {
                const restoredScript: Script = {
                    id: project.scriptId,
                    title: project.scriptTitle || project.workingTitle,
                    genre: project.genre,
                    quality: project.scriptQuality,
                    description: project.scriptDescription || (language === 'de' ? 'Beschreibung nicht verfügbar.' : 'Description not available.'),
                    price: project.scriptBudget,
                    mainRole: project.mainRole,
                    supportingRole: project.supportingRole,
                    era: project.era,
                    sourcePlotIndex: project.sourcePlotIndex,
                    titleStructure: project.titleStructure,
                };
                updatedAvailableScripts.push(restoredScript);
            }
        }

        return {
            ...prev,
            capital: newCapital,
            activeProjects: updatedActiveProjects,
            activePlanning: newActivePlanning,
            currentProject: newCurrentProject,
            availableScripts: updatedAvailableScripts,
            transactionLog: newTransactions,
            messages: newMessages,
            pendingNotifications: prev.pendingNotifications?.filter(n => n.title !== project.workingTitle)
        }
    });
    onBack();
  };


  const departments = [
      { name: t.project.production.departments.camera, icon: <KameraIcon className="h-6 w-6"/>, level: kameraLevel, setLevel: setKameraLevel, options: KAMERA_OPTIONS, translationKey: 'camera' },
      { name: t.project.production.departments.lighting, icon: <LightIcon className="h-6 w-6"/>, level: lichtLevel, setLevel: setLichtLevel, options: LICHT_OPTIONS, translationKey: 'lighting' },
      { name: t.project.production.departments.sound, icon: <SoundIcon className="h-6 w-6"/>, level: tonLevel, setLevel: setTonLevel, options: TON_OPTIONS, translationKey: 'sound' },
      { name: t.project.production.departments.set, icon: <AusstattungIcon className="h-6 w-6"/>, level: ausstattungLevel, setLevel: setAusstattungLevel, options: AUSSTATTUNG_OPTIONS, translationKey: 'set' },
      { name: t.project.production.departments.sfx, icon: <SFXIcon className="h-6 w-6"/>, level: sfxLevel, setLevel: setSfxLevel, options: SFX_OPTIONS, translationKey: 'sfx' },
      { name: t.project.production.departments.location, icon: <LocationIcon className="h-6 w-6"/>, level: locationLevel, setLevel: setLocationLevel, options: LOCATION_OPTIONS, translationKey: 'location' },
      { name: t.project.production.departments.catering, icon: <CateringIcon className="h-6 w-6"/>, level: cateringLevel, setLevel: setCateringLevel, options: CATERING_OPTIONS, translationKey: 'catering' },
      { name: t.project.production.departments.extras, icon: <ExtrasIcon className="h-6 w-6"/>, level: extrasLevel, setLevel: setExtrasLevel, options: EXTRAS_OPTIONS, translationKey: 'extras' },
  ];

  return (
    <>
        <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-2xl w-full max-w-7xl h-auto border border-gray-700 flex flex-col">
            <h2 className="text-4xl font-bold text-center mb-6 font-cinzel text-amber-400">{t.project.production.boardTitle}: "{project.workingTitle}"</h2>

            <div className="grid grid-cols-12 gap-6 overflow-hidden h-[480px]">
                {/* Left Column: Creative Focus */}
                <div className="col-span-4 bg-gray-900/50 p-4 rounded-lg border border-gray-600 overflow-hidden flex flex-col">
                    <div className="flex-shrink-0 flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h3 className="text-xl font-bold text-amber-300">{t.project.production.creativeFocus}</h3>
                        <span className="font-bold text-white text-lg">
                             {t.genres[project.genre]}
                        </span>
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1 min-h-0">
                        <FocusSlider label={t.creativeFocus.action} value={focusAction} onChange={(e) => handleFocusChange(setFocusAction, focusAction, Number(e.target.value))} />
                        <FocusSlider label={t.creativeFocus.humor} value={focusHumor} onChange={(e) => handleFocusChange(setFocusHumor, focusHumor, Number(e.target.value))} />
                        <FocusSlider label={t.creativeFocus.romance} value={focusRomance} onChange={(e) => handleFocusChange(setFocusRomance, focusRomance, Number(e.target.value))} />
                        <FocusSlider label={t.creativeFocus.dialogues} value={focusDialogues} onChange={(e) => handleFocusChange(setFocusDialogues, focusDialogues, Number(e.target.value))} />
                        <FocusSlider label={t.creativeFocus.violence} value={focusViolence} onChange={(e) => handleFocusChange(setFocusViolence, focusViolence, Number(e.target.value))} />
                        <FocusSlider label={t.creativeFocus.costumes} value={focusCostumes} onChange={(e) => handleFocusChange(setFocusCostumes, focusCostumes, Number(e.target.value))} />
                        <FocusSlider label={t.creativeFocus.makeup} value={focusMakeup} onChange={(e) => handleFocusChange(setFocusMakeup, focusMakeup, Number(e.target.value))} />
                        <FocusSlider label={t.creativeFocus.stunts} value={focusStunts} onChange={(e) => handleFocusChange(setFocusStunts, focusStunts, Number(e.target.value))} />
                    </div>
                    <div className="flex-shrink-0 mt-4">
                        <p className="text-xs text-gray-500 text-center">{language === 'de' ? 'Verteilen Sie Punkte basierend auf der Projektgröße.' : 'Distribute points based on project size.'}</p>
                    </div>
                </div>

                {/* Right Column: Production Departments */}
                <div className="col-span-8 overflow-y-auto pr-4">
                     {plannerDiscount > 0 && (
                        <div className="mb-4 bg-green-900/30 border border-green-500/50 p-2 rounded-lg text-center">
                            <p className="text-green-300 text-sm font-bold">
                                {language === 'de' ? 'Projektplaner Bonus' : 'Project Planner Bonus'}: {Math.round(plannerDiscount * 100)}% {language === 'de' ? 'Rabatt auf Produktionskosten' : 'discount on production costs'}
                            </p>
                        </div>
                     )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {departments.map(dept => (
                            <DepartmentSummaryCard
                                key={dept.name}
                                department={dept}
                                onClick={() => setEditingDepartment(dept)}
                                translation={t}
                                discountFactor={plannerDiscount}
                            />
                        ))}
                     </div>
                </div>
            </div>

            <div className="flex-shrink-0 mt-6 pt-4 border-t-2 border-amber-500/50">
                <div className="flex justify-between items-center">
                    <div/>
                    <div className="text-right">
                        <div className="grid grid-cols-2 gap-x-8 text-lg">
                            <span className="text-gray-300">{t.project.production.estimatedDuration}:</span>
                            <span className="font-bold text-white">{totalDuration} {t.project.production.days}</span>

                            <span className="text-gray-300">{t.project.production.prevCosts}:</span>
                            <span className="font-bold text-white">{formatCurrency(bisherigeKosten)}</span>

                            <span className="text-gray-300">{t.widgets.currentProject.totalCosts}:</span>
                            <span className="font-bold text-amber-400">{formatCurrency(productionDepartmentCost)}</span>
                            
                            <span className="text-amber-400 font-cinzel text-xl mt-2 border-t border-gray-600 pt-2">{t.project.production.newTotal}:</span>
                            <span className="font-bold text-2xl mt-2 border-t border-gray-600 pt-2 text-white">{formatCurrency(neueGesamtkosten)}</span>
                            
                            <span className="text-xs text-gray-400 italic mt-1 col-span-2 text-right">({t.project.production.weekly}: ~{formatCurrency(weeklyProductionCost)})</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => setShowStartProductionConfirm(true)} className="w-96 bg-green-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider hover:bg-green-500">
                            {t.project.production.startFilming}
                        </button>
                        <button 
                            onClick={() => setShowDiscardConfirm(true)} 
                            className="w-96 bg-red-800/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-sm uppercase text-xs transition-colors"
                        >
                            {t.project.progress.discard}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-400 text-sm text-right mt-2 font-bold">{error}</p>}
            </div>
        </div>

        {editingDepartment && (
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingDepartment(null)}>
                <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-5xl p-6" onClick={e => e.stopPropagation()}>
                    <h2 className="text-3xl font-cinzel text-amber-400 text-center mb-4 flex items-center justify-center gap-3">
                        {editingDepartment.icon} {editingDepartment.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {editingDepartment.options.map(option => {
                            const unlocked = !option.requiredTechs || option.requiredTechs.every((t: string) => playerData.unlockedTechnologies.includes(t));
                            const optionTranslation = t.productionOptions[editingDepartment.translationKey as keyof typeof t.productionOptions][`level${option.level}` as any];
                            
                            return (
                                <DepartmentCard
                                    key={option.level}
                                    option={option}
                                    isSelected={editingDepartment.level === option.level}
                                    unlocked={unlocked}
                                    onSelect={() => {
                                        if (unlocked) {
                                            editingDepartment.setLevel(option.level);
                                            setEditingDepartment(null);
                                        }
                                    }}
                                    translation={t}
                                    translatedName={optionTranslation?.name}
                                    translatedDesc={optionTranslation?.desc}
                                    departmentKey={editingDepartment.translationKey}
                                    discountFactor={plannerDiscount}
                                />
                            );
                        })}
                    </div>
                    <div className="text-center mt-6">
                        <button onClick={() => setEditingDepartment(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-sm uppercase">{t.common.cancel}</button>
                    </div>
                </div>
            </div>
        )}
        {showStartProductionConfirm && (
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                    <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.production.confirmTitle}</h2>
                    <p className="text-gray-300 text-lg mb-6">{t.project.production.confirmText.replace('{title}', project.workingTitle)}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setShowStartProductionConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                        <button onClick={handleStartProduction} className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all">{t.common.yes}</button>
                    </div>
                </div>
            </div>
        )}

        {showDiscardConfirm && (
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                    <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.progress.discardConfirmTitle}</h2>
                    <p className="text-gray-300 text-lg mb-6">{t.project.progress.discardConfirmText}</p>
                    {project.contract && (
                         <div className="bg-red-900/30 p-3 rounded border border-red-500/50 mb-6 text-left">
                           <p className="text-red-400 font-bold text-sm mb-1 uppercase">{language === 'de' ? 'Achtung: Vertragsstrafe & Rückzahlung' : 'Warning: Penalty & Repayment'}</p>
                            <p className="text-gray-300 text-xs">
                               {language === 'de' ? 'Bei Abbruch wird die Vertragsstrafe von ' : 'If cancelled, the contractual penalty of '}<span className="font-mono font-bold text-white">{formatCurrency(project.contract.penalty)}</span>{language === 'de' ? ' sowie die Rückzahlung des Vorschusses von ' : ' and the repayment of the advance of '}<span className="font-mono font-bold text-white">{formatCurrency(project.contract.upfrontPayment || 0)}</span>{language === 'de' ? ' sofort fällig.' : ' become due immediately.'}
                            </p>
                         </div>
                    )}
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setShowDiscardConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                        <button onClick={handleDiscardProject} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.project.progress.discardConfirmYes}</button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default NewProjectScreen_Phase3;
