
import React, { useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ALL_PROPERTIES } from '../../privateLifeData';
import { PROPERTY_IMAGES } from '../../images/propertyImages';
import { useTranslation } from '../../../hooks/useTranslation';
import { MaritalStatus } from '../../../types';

const ProgressBar: React.FC<{ progress: number, color: string, label: string }> = ({ progress, color, label }) => (
    <div>
      <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">{label}</span>
          <span className="text-xs font-mono text-white">{Math.round(progress)}/100</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden border border-gray-600">
          <div className={`${color} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
);

// Helper to calculate portrait URL based on age
const getPlayerPortraitUrl = (baseId: string | undefined | null, birthDate: Date, gameDate: Date): string | null => {
    if (!baseId) return null;
    
    // Support for custom uploaded images (Base64 Data URLs)
    if (baseId.startsWith('data:image')) {
        return baseId;
    }
    
    const birth = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    let ageSuffix: 'k' | 'j' | 'm' | 'a';
    if (age <= 15) {
        ageSuffix = 'k';
    } else if (age >= 16 && age <= 34) {
        ageSuffix = 'j';
    } else if (age >= 35 && age <= 59) {
        ageSuffix = 'm';
    } else { // age >= 60
        ageSuffix = 'a';
    }
    
    return `https://www.schnoxcore.com/media/portrait/${baseId}${ageSuffix}.png`;
};

export const OverviewTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    if (!playerData) return null;

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

    const currentResidence = useMemo(() => {
        return ALL_PROPERTIES.find(p => p.id === playerData.activePropertyId) || ALL_PROPERTIES[0];
    }, [playerData.activePropertyId]);

    // Localized Property Name & Description
    const residenceName = t.privatelife.properties[currentResidence.id]?.name || currentResidence.name;
    const residenceDesc = t.privatelife.properties[currentResidence.id]?.description || currentResidence.description;

    const backgroundUrl = useMemo(() => {
        return PROPERTY_IMAGES[playerData.activePropertyId] || PROPERTY_IMAGES['prop_rental'];
    }, [playerData.activePropertyId]);

    const energy = playerData.energy !== undefined ? playerData.energy : 100;
    
    // Determine energy color/state text
    let energyColor = "text-yellow-400";
    let energyBarColor = "bg-yellow-500";
    
    if (energy >= 80) {
        energyColor = "text-green-400";
        energyBarColor = "bg-green-500";
    } else if (energy < 30) {
        energyColor = "text-red-400";
        energyBarColor = "bg-red-500";
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const recoveryAmount = Math.round((currentResidence.recoveryBonus || 2) * 10) / 10;

    const handlePrivateCapitalClick = () => {
        if (isTestMode) {
            setPlayerData(prev => prev ? { ...prev, privateCapital: prev.privateCapital + 10000 } : null);
        }
    };

    // Calculate Age dynamically
    const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(playerData.playerBirthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
    const birthDateString = new Date(playerData.playerBirthDate).toLocaleDateString(locale);

    const playerPortraitUrl = getPlayerPortraitUrl(playerData.playerPortraitId, playerData.playerBirthDate, playerData.gameDate);

    const statusKeyMap: Record<string, string> = {
        'Single': 'Single',
        'Bekanntschaft': 'Acquaintance',
        'In einer Beziehung': 'Dating',
        'Verlobt': 'Engaged',
        'Verheiratet': 'Married',
        'Geschieden': 'Divorced',
        'Verwitwet': 'Widowed'
    };
    const maritalStatusKey = statusKeyMap[playerData.maritalStatus] || 'Single';
    const maritalStatusLabel = t.privatelife.family.status[maritalStatusKey] || playerData.maritalStatus;
    
    // Calculate Household Income
    let partnerContribution = 0;
    const isSharedIncome = [MaritalStatus.Dating, MaritalStatus.Engaged, MaritalStatus.Married].includes(playerData.maritalStatus);

    if (isSharedIncome) {
        if (playerData.partnerIsEmployed) {
             if (playerData.partnerEmployedAs === 'Actor' || playerData.partnerEmployedAs === 'Director') {
                 // Talents get gage per movie, usually no monthly salary unless configured. Assuming 0 fix for now or minimal.
                 partnerContribution = 0; 
             } else {
                 // Staff Employee
                 const employee = playerData.employees.find(e => e.name === playerData.partnerName);
                 if (employee) {
                     partnerContribution = employee.salary;
                 }
             }
        } else if (playerData.partnerSalary) {
            partnerContribution = playerData.partnerSalary;
        }
    }
    
    const householdIncome = playerData.ceoSalary + partnerContribution;
    const incomeLabel = partnerContribution > 0 ? t.privatelife.status.householdIncome : t.privatelife.status.salary;

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Window 1: Housing Situation (Left Column) */}
                <div className="bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-600 bg-black/20">
                        <h3 className="text-xl font-bold font-cinzel text-amber-400">{t.privatelife.overview.housing}</h3>
                    </div>
                    <div className="flex-grow relative group">
                        <img src={backgroundUrl} alt={residenceName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{residenceName}</h3>
                            <p className="text-gray-300 text-sm mb-4 drop-shadow-md leading-relaxed">{residenceDesc}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-gray-600 pt-4">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">{t.privatelife.status.recovery}</p>
                                    <p className="font-bold text-blue-400">+{recoveryAmount} / {t.widgets.charts.week}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">{t.privatelife.overview.reputation}</p>
                                    <p className="font-bold text-green-400">+{currentResidence.reputationBonus}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Personal, Finances & Attributes */}
                <div className="flex flex-col gap-6">
                    
                    {/* Window 2: Personal Data */}
                    <div className="bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl p-6 flex flex-col justify-center flex-shrink-0">
                        <h3 className="text-xl font-bold font-cinzel text-amber-400 mb-6 border-b border-gray-600 pb-2">{t.privatelife.overview.personal}</h3>
                        
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-500 shadow-inner overflow-hidden flex-shrink-0">
                                {playerPortraitUrl ? (
                                    <img src={playerPortraitUrl} alt="Spieler" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-6xl">{playerData.gender === 'weiblich' ? '�"�' : '�"'}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{playerData.playerName}</p>
                                <p className="text-gray-400 text-sm mt-1">{t.privatelife.overview.status}: <span className="text-amber-300 font-semibold">{maritalStatusLabel}</span></p>
                                <p className="text-gray-400 text-sm">{t.privatelife.overview.reputation}: <span className="text-purple-300 font-semibold">{playerData.personalReputation}</span></p>
                                <p className="text-gray-400 text-sm mt-1">{t.newGame.birthDate}: <span className="text-white font-semibold">{birthDateString} ({age} {t.talentDossier.years})</span></p>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                             <div className="flex justify-between items-baseline mb-2">
                                <p className="text-sm font-bold uppercase tracking-wider text-gray-300">{t.privatelife.overview.vitality}</p>
                                <span className={`text-lg font-bold ${energyColor}`}>{Math.round(energy)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative shadow-inner">
                                <div className={`${energyBarColor} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${energy}%` }}></div>
                            </div>
                             <p className="text-xs text-gray-500 mt-2 text-right italic">{t.privatelife.overview.vitalityDesc.replace('{amount}', recoveryAmount.toString())}</p>
                        </div>
                    </div>

                    {/* Window 3: Finances */}
                    <div className="bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl p-6 flex-shrink-0">
                        <h3 className="text-xl font-bold font-cinzel text-amber-400 mb-4 border-b border-gray-600 pb-2">{t.privatelife.overview.finances}</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                className={`bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center ${isTestMode ? 'cursor-pointer hover:bg-gray-800' : ''}`}
                                onClick={handlePrivateCapitalClick}
                                title={isTestMode ? "Click +10.000" : ""}
                            >
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t.privatelife.status.privateCapital}</p>
                                <p className="text-xl font-bold text-white font-mono">{formatCurrency(playerData.privateCapital)}</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{incomeLabel}</p>
                                <p className="text-xl font-bold text-green-400 font-mono">{formatCurrency(householdIncome)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Window 4: Attributes */}
                    <div className="bg-gray-900/60 rounded-lg border border-gray-600 shadow-xl p-6 flex flex-col">
                        <h3 className="text-xl font-bold font-cinzel text-amber-400 mb-4 border-b border-gray-600 pb-2">{t.privatelife.overview.attributes}</h3>
                        <div className="space-y-4">
                            <ProgressBar progress={playerData.negotiationSkill} color="bg-amber-500" label={t.newGame.skillNegotiation} />
                            <ProgressBar progress={playerData.charisma} color="bg-amber-500" label={t.newGame.skillCharisma} />
                            <ProgressBar progress={playerData.financialSense} color="bg-amber-500" label={t.newGame.skillFinance} />
                            <ProgressBar progress={playerData.filmSense} color="bg-amber-500" label={t.newGame.skillFilmSense} />
                            <ProgressBar progress={playerData.organizationTalent} color="bg-amber-500" label={t.newGame.skillOrganization} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

