
import React, { useState, useMemo } from 'react';
import { PlayerData, BuildingType, ActiveConstruction, GameSpeed } from '../types';
import { studiogelaendeBackgroundImage } from './backgrounds/StudiogelaendeBackgroundImage';
import { BUILDING_DATA } from './buildings';
import GameHeader from './GameHeader';
import DrehbuchIcon from './icons/DrehbuchIcon';
import MarketingIcon from './icons/MarketingIcon';
import ForschungIcon from './icons/ForschungIcon';
import CastingIcon from './icons/CastingIcon';
import KinoIcon from './icons/KinoIcon';
import RestaurantIcon from './icons/RestaurantIcon';
import FilmmuseumIcon from './icons/FilmmuseumIcon';
import { useGame } from '../contexts/GameContext';
import { RESEARCH_TECHS } from './research';
import PlanungsbueroIcon from './icons/PlanungsbueroIcon';
import BurogebaudeIcon from './icons/BurogebaudeIcon';
import ProduktionIcon from './icons/ProduktionIcon';
import BauhofIcon from './icons/BauhofIcon';
import LocationIcon from './icons/LocationIcon';
import SchnittIcon from './icons/SchnittIcon';
import BugIcon from './icons/BugIcon';
import WardrobeIcon from './icons/WardrobeIcon';
import KindergartenIcon from './icons/KindergartenIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import TrophyIcon from './icons/TrophyIcon';
import MoneyBagIcon from './icons/MoneyBagIcon';
import { useTranslation } from '../hooks/useTranslation';

interface BuildingHierarchyItem {
    id: string;
    type?: BuildingType;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    children: BuildingType[];
}

interface StudiogelaendeScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  initialBuilding?: BuildingType;
}

const BuildingButton: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isActive: boolean;
    isUnderConstruction: boolean;
    onClick: () => void;
    hasChildren?: boolean;
    isExpanded?: boolean;
}> = ({ title, description, icon, isActive, isUnderConstruction, onClick, hasChildren, isExpanded }) => {
  const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
  const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';
  
  return (
    <button
      onClick={onClick}
      className={`bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses} ${isUnderConstruction ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start">
        <div className={`bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && 'bg-amber-500'} ${isUnderConstruction && 'border border-blue-400'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className={`text-md font-bold font-cinzel ${isActive ? 'text-amber-300' : 'text-amber-400'} group-hover:text-amber-300 transition-colors truncate`}>
                {title}
            </h3>
            {hasChildren && (
                <span className={`text-xs ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                </span>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-1 truncate">{description}</p>
        </div>
      </div>
    </button>
  );
};


const iconMap: Record<BuildingType, React.ReactNode> = {
    [BuildingType.Burogebaude]: <BurogebaudeIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Autorenbuero]: <DrehbuchIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.CastingOffice]: <CastingIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.MarketingDepartment]: <MarketingIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.ResearchLab]: <ForschungIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Planungsbuero]: <PlanungsbueroIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Studio]: <ProduktionIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Studio1]: <ProduktionIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Studio2]: <ProduktionIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Studio3]: <ProduktionIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Bauhof]: <BauhofIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Kino]: <KinoIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Restaurant]: <RestaurantIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Filmmuseum]: <FilmmuseumIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Backlot]: <LocationIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Postproduktionshaus]: <SchnittIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Sicherheitszentrale]: <BugIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.KostuemUndMaskenatelier]: <WardrobeIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Betriebskita]: <KindergartenIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Studiohotel]: <BriefcaseIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Eventhalle]: <TrophyIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
    [BuildingType.Fanshop]: <MoneyBagIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
};

const StudiogelaendeScreen: React.FC<StudiogelaendeScreenProps> = ({ onBack, gameSpeed, setGameSpeed, initialBuilding }) => {
  const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(initialBuilding || BuildingType.Burogebaude);
  
  const subsidiaryBuildingTypes = useMemo(() => [
        BuildingType.Autorenbuero,
        BuildingType.CastingOffice,
        BuildingType.MarketingDepartment,
        BuildingType.ResearchLab,
        BuildingType.Planungsbuero,
  ], []);

  // State to track if the main office building group is expanded
    const [expandedParent, setExpandedParent] = useState<string | null>(null);

  if (!playerData) return null;

  const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

  const selectedBuilding = useMemo(() => {
    if (!selectedBuildingType) return null;
    return playerData.buildings.find(b => b.type === selectedBuildingType) || { type: selectedBuildingType, level: 0 };
  }, [selectedBuildingType, playerData.buildings]);

    const revenueGroupTitle = language === 'de' ? 'Besucher & Einnahmen' : 'Visitors & Revenue';
    const revenueGroupDescription = language === 'de'
        ? 'Tourismus, Events und Zusatzgeschäft auf dem Studiogelände.'
        : 'Tourism, events and extra business on the studio lot.';

    const buildingHierarchy: BuildingHierarchyItem[] = [
    { 
                id: 'office',
        type: BuildingType.Burogebaude, 
        children: subsidiaryBuildingTypes,
    },
    { 
                id: 'studio',
        type: BuildingType.Studio, 
        children: [
            BuildingType.Studio1,
            BuildingType.Studio2,
            BuildingType.Studio3,
            BuildingType.Backlot,
            BuildingType.Postproduktionshaus,
            BuildingType.KostuemUndMaskenatelier,
        ],
    },
    { id: BuildingType.Bauhof, type: BuildingType.Bauhof, children: [] },
    { id: BuildingType.Sicherheitszentrale, type: BuildingType.Sicherheitszentrale, children: [] },
    { id: BuildingType.Betriebskita, type: BuildingType.Betriebskita, children: [] },
    {
        id: 'revenue',
        title: revenueGroupTitle,
        description: revenueGroupDescription,
        icon: <MoneyBagIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />,
        children: [
            BuildingType.Kino,
            BuildingType.Restaurant,
            BuildingType.Filmmuseum,
            BuildingType.Studiohotel,
            BuildingType.Eventhalle,
            BuildingType.Fanshop,
        ],
    },
  ];

    const { totalSlots, usedSlots } = useMemo(() => {
        const buroBuilding = playerData.buildings.find(b => b.type === BuildingType.Burogebaude);
        const total = (buroBuilding?.level || 0) * 3;

        const used = playerData.buildings
            .filter(b => subsidiaryBuildingTypes.includes(b.type))
            .reduce((sum, b) => sum + b.level, 0);

        return { totalSlots: total, usedSlots: used };
    }, [playerData.buildings, subsidiaryBuildingTypes]);


  const handleUpgrade = () => {
    if (!selectedBuilding) return;

    const buildingData = BUILDING_DATA[selectedBuilding.type];
    const currentLevel = selectedBuilding.level;
    const nextLevelData = buildingData.levels[currentLevel];
    
    // Check Construction Limit based on Bauhof
    const activeConstructions = playerData.activeConstructions || (playerData.activeConstruction ? [playerData.activeConstruction] : []);
    const bauhof = playerData.buildings.find(b => b.type === BuildingType.Bauhof);
    const maxConstructions = 1 + (bauhof && bauhof.level >= 1 ? 1 : 0) + (bauhof && bauhof.level >= 2 ? 1 : 0);

    if (!nextLevelData || (playerData.capital < nextLevelData.cost && !isTestMode) || activeConstructions.length >= maxConstructions) {
      return;
    }
    
    // Prevent double build of same type
    if (activeConstructions.some(c => c.buildingType === selectedBuilding.type)) {
        return;
    }

    const duration = isTestMode ? 1 : nextLevelData.duration;
    const endDate = new Date(playerData.gameDate);
    endDate.setDate(endDate.getDate() + duration);

    const newActiveConstruction: ActiveConstruction = {
        buildingType: selectedBuilding.type,
        endDate: endDate,
    };

    setPlayerData(prev => {
        if (!prev) return null;
        const buildingKey = getBuildingKey(selectedBuilding.type);
        const buildingName = t.studiogelaende.buildings[buildingKey]?.name || selectedBuilding.type;
        return {
            ...prev,
            capital: prev.capital - nextLevelData.cost,
            activeConstructions: [...(prev.activeConstructions || []), newActiveConstruction],
            activeConstruction: newActiveConstruction, // Legacy compatibility, points to latest
            transactionLog: [
                ...prev.transactionLog,
                {
                    date: new Date(prev.gameDate),
                    type: 'Ausgabe',
                    category: 'Studiogelände',
                    description: `${currentLevel === 0 ? t.studiogelaende.screen.build : t.studiogelaende.screen.upgrade}: ${buildingName}`,
                    descriptionKey: currentLevel === 0 ? 'constructionBuild' : 'constructionUpgrade',
                    descriptionVars: { building: buildingName },
                    amount: nextLevelData.cost,
                }
            ]
        }
    });
  };

  const getDaysRemaining = (endDate: Date) => {
      return Math.max(0, Math.ceil((endDate.getTime() - playerData.gameDate.getTime()) / (1000 * 3600 * 24)));
  }

  const getBuildingKey = (type: BuildingType): string => {
    return Object.keys(BuildingType).find(key => BuildingType[key as keyof typeof BuildingType] === type) || 'Burogebaude';
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  // Helper to check if a specific building type is under construction in the list
  const getConstructionEntry = (type: BuildingType) => {
      return (playerData.activeConstructions || []).find(c => c.buildingType === type) || (playerData.activeConstruction?.buildingType === type ? playerData.activeConstruction : undefined);
  };

  // Helper to calculate available slots
  const getConstructionSlotsInfo = () => {
       const activeConstructions = playerData.activeConstructions || (playerData.activeConstruction ? [playerData.activeConstruction] : []);
       const bauhof = playerData.buildings.find(b => b.type === BuildingType.Bauhof);
       const maxConstructions = 1 + (bauhof && bauhof.level >= 1 ? 1 : 0) + (bauhof && bauhof.level >= 2 ? 1 : 0);
       return { current: activeConstructions.length, max: maxConstructions };
  };
  const constructionSlots = getConstructionSlotsInfo();

  return (
    <div
      className="w-full h-full bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${studiogelaendeBackgroundImage})` }}
    >
      <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
      <div className="flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden">
        <aside className="w-96 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col">
            <header className="p-6 text-center border-b border-gray-700">
                <h1 className="text-3xl font-bold font-cinzel text-amber-400">{t.studiogelaende.screen.title}</h1>
                <div className="mt-2 bg-gray-800/60 rounded px-2 py-1 text-xs text-gray-300 border border-gray-600 inline-block">
                    <span className="text-amber-400 font-bold">{language === 'de' ? 'Bau-Slots' : 'Construction Slots'}: {constructionSlots.current} / {constructionSlots.max}</span>
                </div>
            </header>
            <nav className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
                {buildingHierarchy.map(item => {
                    const parentBuilding = item.type
                        ? (playerData.buildings.find(b => b.type === item.type) || { type: item.type, level: 0 })
                        : null;
                    const isParentUnderConstruction = parentBuilding ? !!getConstructionEntry(parentBuilding.type) : false;
                    const buildingKey = parentBuilding ? getBuildingKey(parentBuilding.type) : null;
                    const isExpanded = expandedParent === item.id;
                    const buttonTitle = parentBuilding
                        ? (t.studiogelaende.buildings[buildingKey!]?.name || parentBuilding.type)
                        : (item.title || '');
                    const buttonDescription = parentBuilding
                        ? (isParentUnderConstruction ? t.studiogelaende.screen.underConstruction : t.studiogelaende.screen.level.replace('{level}', parentBuilding.level.toString()))
                        : (item.description || '');
                    const buttonIcon = parentBuilding ? iconMap[parentBuilding.type] : item.icon;

                    return (
                        <React.Fragment key={item.id}>
                            <BuildingButton
                                title={buttonTitle}
                                description={buttonDescription}
                                icon={buttonIcon}
                                isActive={!!parentBuilding && selectedBuildingType === parentBuilding.type}
                                isUnderConstruction={isParentUnderConstruction}
                                onClick={() => {
                                    if (parentBuilding) {
                                        setSelectedBuildingType(parentBuilding.type);
                                    }
                                    if (item.children.length > 0) {
                                        setExpandedParent(prev => prev === item.id ? null : item.id);
                                    } else {
                                        setExpandedParent(null);
                                    }
                                }}
                                hasChildren={item.children.length > 0}
                                isExpanded={isExpanded}
                            />
                            {item.children.length > 0 && isExpanded && (
                                <div className="pl-5 ml-4 border-l-2 border-gray-600/50 space-y-4 animate-fade-in">
                                    {item.children.map(childType => {
                                        const childBuilding = playerData.buildings.find(b => b.type === childType) || { type: childType, level: 0 };
                                        const isChildUnderConstruction = !!getConstructionEntry(childBuilding.type);
                                        const childBuildingKey = getBuildingKey(childBuilding.type);
                                        return (
                                            <BuildingButton
                                                key={childBuilding.type}
                                                title={t.studiogelaende.buildings[childBuildingKey]?.name || childBuilding.type}
                                                description={isChildUnderConstruction ? t.studiogelaende.screen.underConstruction : t.studiogelaende.screen.level.replace('{level}', childBuilding.level.toString())}
                                                icon={iconMap[childBuilding.type]}
                                                isActive={selectedBuildingType === childBuilding.type}
                                                isUnderConstruction={isChildUnderConstruction}
                                                onClick={() => setSelectedBuildingType(childBuilding.type)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
            <footer className="p-4 border-t border-gray-700">
                <button
                    onClick={onBack}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase"
                >
                    {t.studiogelaende.screen.backToMain}
                </button>
            </footer>
        </aside>

        <main className="flex-grow p-8 overflow-y-auto flex items-center justify-center">
             {selectedBuilding ? (
                    (() => {
                        const buildingKey = getBuildingKey(selectedBuilding.type);
                        const buildingTranslations = t.studiogelaende.buildings[buildingKey];
                        const data = BUILDING_DATA[selectedBuilding.type];
                        if (!buildingTranslations || !data) {
                            return (
                                <div className="text-center text-red-500">
                                    {language === 'de' ? `Daten fehlen für ${selectedBuilding.type}` : `Missing data for ${selectedBuilding.type}`}
                                </div>
                            );
                        }

                        const currentLevel = selectedBuilding.level;
                        const currentLevelData = currentLevel > 0 ? data.levels[currentLevel - 1] : null;
                        const nextLevelData = data.levels[currentLevel];
                        
                        const constructionEntry = getConstructionEntry(selectedBuilding.type);
                        const isUnderConstruction = !!constructionEntry;
                        
                        const isLockedByResearch = currentLevel === 0 && data.requiredTech && !playerData.unlockedTechnologies.includes(data.requiredTech);
                        const isSubsidiary = subsidiaryBuildingTypes.includes(selectedBuilding.type);
                        const hasReachedSlotLimit = isSubsidiary && usedSlots >= totalSlots;
                        const slotsFull = constructionSlots.current >= constructionSlots.max;
                        
                        // --- New Dependency Logic ---
                        let dependencyMissing = '';
                        const studioHallenLevel = playerData.buildings.find(b => b.type === BuildingType.Studio)?.level || 0;
                        const studio1Level = playerData.buildings.find(b => b.type === BuildingType.Studio1)?.level || 0;
                        const studio2Level = playerData.buildings.find(b => b.type === BuildingType.Studio2)?.level || 0;

                        if (selectedBuilding.type === BuildingType.Studio2 && currentLevel === 0) {
                            if (studioHallenLevel < 2) dependencyMissing = `${t.studiogelaende.buildings['Studio']?.name || 'Studio'} Level 2`;
                            else if (studio1Level < 3) dependencyMissing = `${t.studiogelaende.buildings['Studio1']?.name || 'Studio 1'} Level 3`;
                        }
                        if (selectedBuilding.type === BuildingType.Studio3 && currentLevel === 0) {
                            if (studioHallenLevel < 3) dependencyMissing = `${t.studiogelaende.buildings['Studio']?.name || 'Studio'} Level 3`;
                            else if (studio2Level < 3) dependencyMissing = `${t.studiogelaende.buildings['Studio2']?.name || 'Studio 2'} Level 3`;
                        }
                        // -----------------------------
                        
                        let disabledTooltip = '';
                        if (playerData.capital < (nextLevelData?.cost || 0) && !isTestMode) disabledTooltip = t.studiogelaende.screen.tooltip.noCapital;
                        else if (!!constructionEntry) disabledTooltip = t.studiogelaende.screen.tooltip.constructionActive; // Is this specific building constructing?
                        else if (slotsFull) disabledTooltip = t.studiogelaende.screen.tooltip.constructionActive; // Are all slots full? reusing translation for now
                        else if (isLockedByResearch) {
                            const techId = data.requiredTech;
                            const techName = techId ? (t.research.techs[techId as keyof typeof t.research.techs]?.name || RESEARCH_TECHS.find(tech => tech.id === techId)?.name || '') : '';
                            disabledTooltip = t.studiogelaende.screen.tooltip.researchRequired.replace('{techName}', techName);
                        }
                        else if (hasReachedSlotLimit) disabledTooltip = t.studiogelaende.screen.tooltip.officeUpgrade;
                        else if (dependencyMissing) disabledTooltip = t.studiogelaende.screen.tooltip.dependencyMissing.replace('{requirement}', dependencyMissing);

                        return (
                            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700">
                                <h2 className="text-4xl font-bold text-center mb-2 font-cinzel text-amber-400">{buildingTranslations.name}</h2>
                                <p className="text-center text-gray-400 mb-2">{t.studiogelaende.screen.level.replace('{level}', currentLevel.toString())}</p>
                                {currentLevelData && (
                                    <p className="text-center text-gray-500 text-sm mb-4">
                                        {t.studiogelaende.screen.monthlyCost.replace('{cost}', formatCurrency(currentLevelData.monthlyCost))}
                                    </p>
                                )}
                                <p className="text-center text-gray-300 mb-6">{buildingTranslations.description}</p>
                                
                                {selectedBuilding.type === BuildingType.Burogebaude && (
                                    <div className="my-4 p-3 bg-gray-900 rounded-md border border-gray-700">
                                        <h4 className="font-bold text-white text-center">{t.studiogelaende.screen.departmentSlots}</h4>
                                        <div className="text-center mt-1">
                                            <p className="text-2xl font-bold text-amber-400">{usedSlots} / {totalSlots}</p>
                                            <p className="text-xs text-gray-400">{t.studiogelaende.screen.slotsUsed}</p>
                                        </div>
                                    </div>
                                )}

                                {currentLevel > 0 && (() => {
                                    const levelData = data.levels[currentLevel - 1];
                                    const levelTranslations = buildingTranslations.levels[`level${currentLevel}`];
                                    return (
                                        <div className="my-4 p-3 bg-gray-900 rounded-md border border-gray-700">
                                            <h4 className="font-bold text-white text-center">{t.studiogelaende.screen.currentBonus}</h4>
                                            <div className="text-center mt-1">
                                                {levelData.structuredBonus ? (
                                                    levelData.structuredBonus.map((bonus, index) => (
                                                        <div key={index}>
                                                            <span className="font-semibold text-white">{bonus.label} </span>
                                                            <span className="font-bold tracking-wider text-yellow-400">{bonus.stars}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-green-400">{levelTranslations?.bonus || levelData.bonusDescription}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                                <hr className="border-gray-600 my-6" />
                                
                                {isUnderConstruction && constructionEntry ? (
                                    <div className="text-center p-4 bg-blue-900 rounded-md border border-blue-600">
                                        <h3 className="text-xl font-bold text-white">{t.studiogelaende.screen.upgrading}</h3>
                                        <p className="text-blue-300 text-lg">{t.studiogelaende.screen.daysRemaining.replace('{days}', getDaysRemaining(constructionEntry.endDate).toString())}</p>
                                    </div>
                                ) : nextLevelData ? (() => {
                                    const nextLevelTranslations = buildingTranslations.levels[`level${nextLevelData.level}`];
                                    return (
                                    <div>
                                        <h3 className="text-xl font-bold text-amber-400 text-center">{t.studiogelaende.screen.nextLevel.replace('{level}', nextLevelData.level.toString())}</h3>
                                        <p className="text-gray-400 mt-1 text-center">{nextLevelTranslations?.desc || nextLevelData.description}</p>
                                        <div className="mt-4 space-y-2 text-lg">
                                            <div className="flex justify-between"><span>{t.studiogelaende.screen.cost}</span> <span className="font-bold">{formatCurrency(nextLevelData.cost)}</span></div>
                                            <div className="flex justify-between"><span>{t.studiogelaende.screen.duration}</span> <span className="font-bold">{isTestMode ? 1 : nextLevelData.duration} {t.project.production.days}</span></div>
                                            <div className="flex justify-between"><span>{t.studiogelaende.screen.monthlyCost.replace(': {cost}', ':')}</span> <span className="font-bold">{formatCurrency(nextLevelData.monthlyCost)}</span></div>
                                            <div className="flex justify-between items-start mt-2">
                                                <span>{t.studiogelaende.screen.bonus}</span>
                                                <div className="text-right">
                                                    {nextLevelData.structuredBonus ? (
                                                        nextLevelData.structuredBonus.map((bonus, index) => (
                                                            <div key={index}>
                                                                <span className="font-semibold text-white">{bonus.label} </span>
                                                                <span className="font-bold tracking-wider text-yellow-400">{bonus.stars}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="font-bold text-green-400">{nextLevelTranslations?.bonus || nextLevelData.bonusDescription}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUpgrade}
                                            disabled={(playerData.capital < nextLevelData.cost && !isTestMode) || !!constructionEntry || slotsFull || isLockedByResearch || hasReachedSlotLimit || !!dependencyMissing}
                                            title={disabledTooltip}
                                            className="mt-6 w-full bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none"
                                        >
                                            {currentLevel === 0 ? t.studiogelaende.screen.build : t.studiogelaende.screen.upgrade}
                                        </button>
                                        {disabledTooltip && <p className="text-center text-red-400 text-sm mt-2">{disabledTooltip}</p>}
                                    </div>
                                )})() : (
                                    <p className="text-center text-green-400 font-bold text-xl">{t.studiogelaende.screen.fullyUpgraded}</p>
                                )}
                            </div>
                        );
                    })()
                ) : (
                    <div className="m-auto text-center text-gray-500">
                        <p className="text-2xl">{t.studiogelaende.screen.selectBuilding}</p>
                        <p className="text-lg">{t.studiogelaende.screen.selectBuildingHint}</p>
                    </div>
                )}
        </main>
      </div>
    </div>
  );
};

export default StudiogelaendeScreen;
