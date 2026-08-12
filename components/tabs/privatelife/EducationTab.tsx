
import React, { useState } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ALL_COURSES, WEEKEND_SEMINARS, LEISURE_ACTIVITIES } from '../../privateLifeData';
import { useTranslation } from '../../../hooks/useTranslation';
import StarIcon from '../../icons/StarIcon';
import HeartIcon from '../../icons/HeartIcon';

const ProgressBar: React.FC<{ progress: number, color: string, label: string }> = ({ progress, color, label }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">{label}</span>
            <span className="text-xs font-mono text-white">{Math.round(progress)}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-600">
            <div className={`${color} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

const TabButton: React.FC<{ title: string, isActive: boolean, onClick: () => void }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`py-2 px-4 font-bold text-sm transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 relative top-px whitespace-nowrap
            ${isActive 
                ? 'bg-gray-800/80 text-amber-400 border-gray-700 border-t border-x rounded-t-lg' 
                : 'bg-gray-900/50 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 border-b border-gray-700'
            }`}
    >
        {title}
    </button>
);

const StarEffect: React.FC<{ amount: number }> = ({ amount }) => {
    // 1-3 = 1 Star, 4-7 = 2 Stars, 8+ = 3 Stars
    let stars = 1;
    if (amount >= 8) stars = 3;
    else if (amount >= 4) stars = 2;
    
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
                <StarIcon key={i} className={`w-3 h-3 ${i < stars ? 'text-amber-400' : 'text-gray-700'}`} />
            ))}
        </div>
    );
};

interface ActivityDetailsModalProps {
    item: any;
    type: 'course' | 'seminar' | 'leisure' | 'vacation';
    onClose: () => void;
    onConfirm: () => void;
    canAfford: boolean;
    isBusy: boolean;
    isCompleted: boolean;
    hasEnergy: boolean;
    cooldownActive: boolean;
    frequencyLimitReached: boolean;
    formatCurrency: (val: number) => string;
    t: any;
    skillNameMap: Record<string, string>;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({ item, type, onClose, onConfirm, canAfford, isBusy, isCompleted, hasEnergy, cooldownActive, frequencyLimitReached, formatCurrency, t, skillNameMap }) => {
    const isGerman = t.common?.locale === 'de-DE';
    // Determine Name and Description (Translation Support)
    let title = item.name;
    let description = item.description;

    if (type === 'course' && t.privatelife.education.courses?.[item.id]) {
        title = t.privatelife.education.courses[item.id].name;
        description = t.privatelife.education.courses[item.id].description;
    } else if (type === 'seminar' && t.privatelife.education.seminars?.[item.id]) {
        title = t.privatelife.education.seminars[item.id].name;
        description = t.privatelife.education.seminars[item.id].description;
    } else if (type === 'leisure' && t.privatelife.education.activities?.[item.id]) {
        title = t.privatelife.education.activities[item.id].name;
        description = t.privatelife.education.activities[item.id].description;
    } else if (type === 'vacation') {
        title = t.privatelife.education.luxuryVacation;
        description = t.privatelife.education.luxuryVacationDesc;
    }
    
    let warning = '';
    if (!canAfford) warning = t.employeeDossier.notEnoughCapital;
    else if (!hasEnergy) warning = isGerman ? 'Nicht genügend Energie.' : 'Not enough energy.';
    else if (isBusy && type !== 'vacation') warning = isGerman ? 'Sie sind bereits beschäftigt.' : 'You are already busy.';
    else if (isCompleted) warning = t.privatelife.education.alreadyFinished;
    else if (cooldownActive) warning = isGerman ? 'Wartezeit nach Studium aktiv (60 Stunden).' : 'Study cooldown active (60 hours).';
    else if (frequencyLimitReached) warning = isGerman ? 'Maximal 1 Aktivität pro Monat.' : 'Maximum 1 activity per month.';

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold font-cinzel text-amber-400 mb-4 text-center">{title}</h3>
                
                <div className="space-y-4 mb-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 italic text-sm leading-relaxed">"{description}"</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{isGerman ? 'Dauer' : 'Duration'}</p>
                            <p className="text-white font-bold">
                                {type === 'vacation' ? '14' : item.duration} {t.privatelife.education.days}
                            </p>
                        </div>
                         <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{isGerman ? 'Kosten' : 'Cost'}</p>
                            <p className={`font-bold font-mono ${canAfford ? 'text-white' : 'text-red-400'}`}>
                                {formatCurrency(type === 'vacation' ? 50000 : item.cost)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Energy Cost/Bonus Display */}
                    {(item.energyCost || item.weeklyEnergyCost || item.energyBonus) && (
                         <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-600/30 text-center">
                            <p className="text-xs text-gray-300 uppercase tracking-wider font-bold mb-2">{isGerman ? 'Energie' : 'Energy'}</p>
                            {item.energyBonus ? (
                                <p className="text-lg font-bold text-green-400">+{item.energyBonus} Vitalität</p>
                            ) : (
                                <>
                                    <div className="flex justify-center gap-1">
                                        {(() => {
                                            const cost = item.energyCost || item.weeklyEnergyCost;
                                            let heartCount = 1;
                                            if (cost >= 15) heartCount = 3;
                                            else if (cost >= 8) heartCount = 2;

                                            return Array.from({ length: heartCount }).map((_, i) => (
                                                <HeartIcon key={i} className="w-5 h-5 text-red-500" filled={true} />
                                            ));
                                        })()}
                                    </div>
                                    {item.weeklyEnergyCost && <p className="text-[10px] text-red-400 mt-1">{isGerman ? 'pro Stunde' : 'per hour'}</p>}
                                </>
                            )}
                        </div>
                    )}

                    <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                        <p className="text-xs text-blue-300 uppercase tracking-wider mb-2 font-bold">Effekt bei Abschluss</p>
                        <div className="space-y-1">
                            {type === 'vacation' && (
                                <div className="flex items-center gap-2">
                                     <span className="text-lg font-bold text-white">100%</span>
                                     <span className="text-sm text-gray-300">{t.privatelife.education.energy}</span>
                                </div>
                            )}
                            {item.skillBonus && (
                                <div className="flex items-center gap-2">
                                    <StarEffect amount={item.skillBonus.amount} />
                                    <span className="text-sm text-gray-300">{skillNameMap[item.skillBonus.skill]}</span>
                                </div>
                            )}
                            {item.statBonus && item.statBonus.stat === 'personalReputation' && (
                                <div className="flex items-center gap-2">
                                    <StarEffect amount={item.statBonus.amount} />
                                    <span className="text-sm text-gray-300">{t.privatelife.overview.reputation}</span>
                                </div>
                            )}
                             {item.energyBonus && (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-white">+{item.energyBonus}</span>
                                    <span className="text-sm text-gray-300">{t.privatelife.education.energy}</span>
                                </div>
                            )}
                            {!item.skillBonus && !item.statBonus && !item.energyBonus && type !== 'vacation' && (
                                 <p className="text-sm text-gray-400">Kein direkter Bonus</p>
                            )}
                        </div>
                    </div>
                </div>

                {warning && <p className="text-red-400 text-sm text-center mb-4 font-bold">{warning}</p>}

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-sm uppercase tracking-wider transition-colors">
                        {t.common.cancel}
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        disabled={!canAfford || (isBusy && type !== 'vacation') || isCompleted || !hasEnergy || cooldownActive || frequencyLimitReached}
                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-sm uppercase tracking-wider transition-colors"
                    >
                        {isCompleted ? t.privatelife.education.alreadyFinished : t.common.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};

type EducationSubTab = 'seminars' | 'leisure' | 'studies';

export const EducationTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<EducationSubTab>('seminars');
    
    const [selectedItem, setSelectedItem] = useState<{ 
        type: 'course' | 'seminar' | 'leisure' | 'vacation'; 
        data: any 
    } | null>(null);

    if (!playerData) return null;

    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const skillNameMap: Record<string, string> = {
        negotiationSkill: t.newGame.skillNegotiation,
        charisma: t.newGame.skillCharisma,
        financialSense: t.newGame.skillFinance,
        filmSense: t.newGame.skillFilmSense,
        organizationTalent: t.newGame.skillOrganization
    };

    // Helpers for constraints
    const currentMonthKey = `${playerData.gameDate.getFullYear()}-${playerData.gameDate.getMonth()}`;
    
    const hasAttendedSeminarThisMonth = () => {
        if (!playerData.lastSeminarDate) return false;
        const last = new Date(playerData.lastSeminarDate);
        return `${last.getFullYear()}-${last.getMonth()}` === currentMonthKey;
    };

    const hasAttendedLeisureThisMonth = () => {
        if (!playerData.lastLeisureDate) return false;
        const last = new Date(playerData.lastLeisureDate);
        return `${last.getFullYear()}-${last.getMonth()}` === currentMonthKey;
    };
    
    const isCourseCooldownActive = () => {
        if (!playerData.lastCourseFinishDate) return false;
        const finishDate = new Date(playerData.lastCourseFinishDate);
        // 60-hour cooldown after finishing a study
        const cooldownEnd = new Date(finishDate);
        cooldownEnd.setHours(cooldownEnd.getHours() + 60);
        
        return playerData.gameDate < cooldownEnd;
    };

    // --- REFACTORED HANDLERS: NO MORE TIME JUMPS ---

    const handleAttendSeminar = (seminar: typeof WEEKEND_SEMINARS[0]) => {
        if (playerData.privateCapital < seminar.cost) return;
        if (hasAttendedSeminarThisMonth()) return;
        const energyCost = seminar.energyCost || 0;
        if ((playerData.energy || 100) < energyCost) return;
  
        const endDate = new Date(playerData.gameDate);
        endDate.setHours(endDate.getHours() + seminar.duration);

        setPlayerData(prev => {
            if (!prev) return null;

            return {
                ...prev,
                privateCapital: prev.privateCapital - seminar.cost,
                // Time jump removed here. We set activeSeminar instead.
                activeSeminar: {
                    id: seminar.id,
                    name: seminar.name,
                    startDate: new Date(prev.gameDate),
                    endDate: endDate,
                    type: 'seminar',
                    skillBonus: seminar.skillBonus,
                    // No stat bonus on seminars usually, but supported
                    energyChange: -energyCost
                },
                transactionLog: [...prev.transactionLog, {
                    date: new Date(prev.gameDate),
                    type: 'Ausgabe',
                    category: 'Privatleben',
                    description: `Seminar: ${seminar.name}`,
                    amount: seminar.cost
                }]
            };
        });
    };
  
    const confirmEnrollCourse = (course: any) => {
      if (playerData.privateCapital < course.cost) return;
      if (playerData.activeCourse) return;
      if (isCourseCooldownActive()) return;
  
    const endDate = new Date(playerData.gameDate);
    endDate.setHours(endDate.getHours() + course.duration);
  
      setPlayerData(prev => {
          if (!prev) return null;
          return {
              ...prev,
              privateCapital: prev.privateCapital - course.cost,
              activeCourse: {
                  courseId: course.id,
                  endDate: endDate,
                  weeklyEnergyCost: course.weeklyEnergyCost
              },
              transactionLog: [...prev.transactionLog, {
                  date: new Date(prev.gameDate),
                  type: 'Ausgabe',
                  category: 'Privatleben',
                  description: `Studium: ${course.name}`,
                  amount: course.cost
              }]
          };
      });
    };
    
    const handleLeisureActivity = (activity: typeof LEISURE_ACTIVITIES[0]) => {
        if (playerData.privateCapital < activity.cost) return;
        if (hasAttendedLeisureThisMonth()) return;
        
        const energyCost = activity.energyCost || 0;
        if (energyCost > 0 && (playerData.energy || 100) < energyCost) return;
  
        const endDate = new Date(playerData.gameDate);
        endDate.setHours(endDate.getHours() + activity.duration);

        const energyBonus = activity.energyBonus || 0;
        const netEnergyChange = energyBonus - energyCost;

        // Get Translated Name for Log
        const translatedName = t.privatelife.education.activities?.[activity.id]?.name || activity.name;

        setPlayerData(prev => {
            if (!prev) return null;

            return {
                ...prev,
                privateCapital: prev.privateCapital - activity.cost,
                // Time jump removed. Set activeSeminar (used for both seminars and leisure tracking)
                activeSeminar: {
                    id: activity.id,
                    name: translatedName,
                    startDate: new Date(prev.gameDate),
                    endDate: endDate,
                    type: 'leisure',
                    skillBonus: activity.skillBonus,
                    statBonus: activity.statBonus,
                    energyChange: netEnergyChange
                },
                transactionLog: [...prev.transactionLog, {
                    date: new Date(prev.gameDate),
                    type: 'Ausgabe',
                    category: 'Privatleben',
                    description: `Freizeit: ${translatedName}`,
                    amount: activity.cost
                }]
            };
        });
    };
  
    const handleVacation = () => {
        // Vacation still jumps time as it is a long "skip" feature.
        const vacationCost = 50000;
        if (playerData.privateCapital < vacationCost) return;
        
        setPlayerData(prev => {
            if (!prev) return null;
            const newDate = new Date(prev.gameDate);
            newDate.setHours(newDate.getHours() + 14);
  
            return {
                ...prev,
                privateCapital: prev.privateCapital - vacationCost,
                gameDate: newDate,
                energy: 100, // Full restore
                transactionLog: [...prev.transactionLog, {
                    date: new Date(prev.gameDate),
                    type: 'Ausgabe',
                    category: 'Privatleben',
                    description: `Luxusurlaub`,
                    amount: vacationCost
                }]
            };
        });
    };

    const handleConfirmSelection = () => {
        if (!selectedItem) return;
        
        switch (selectedItem.type) {
            case 'seminar':
                handleAttendSeminar(selectedItem.data);
                break;
            case 'leisure':
                handleLeisureActivity(selectedItem.data);
                break;
            case 'course':
                confirmEnrollCourse(selectedItem.data);
                break;
            case 'vacation':
                handleVacation();
                break;
        }
        setSelectedItem(null);
    };

    const isBusyWithSeminar = !!playerData.activeSeminar;

    return (
        <div className="w-full h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between">
                <h2 className="text-2xl font-bold font-cinzel text-amber-400">{t.privatelife.screen.nav.education}</h2>
                <div className="text-sm text-gray-400">{t.privatelife.status.privateCapital}: <span className="font-bold text-white ml-2">{formatCurrency(playerData.privateCapital)}</span></div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    
                    {/* Left Column: Stats */}
                    <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700 h-fit">
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">{t.privatelife.education.attributesTitle}</h3>
                        <div className="space-y-6">
                            <ProgressBar progress={playerData.negotiationSkill} color="bg-amber-500" label={t.newGame.skillNegotiation} />
                            <ProgressBar progress={playerData.charisma} color="bg-amber-500" label={t.newGame.skillCharisma} />
                            <ProgressBar progress={playerData.financialSense} color="bg-amber-500" label={t.newGame.skillFinance} />
                            <ProgressBar progress={playerData.filmSense} color="bg-amber-500" label={t.newGame.skillFilmSense} />
                            <ProgressBar progress={playerData.organizationTalent} color="bg-amber-500" label={t.newGame.skillOrganization} />
                        </div>
                        {playerData.activeCourse && (
                            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-center animate-pulse">
                                <p className="text-blue-300 font-bold text-sm uppercase tracking-wider mb-1">{t.privatelife.education.currentStudy}</p>
                                <p className="text-white font-bold text-lg">"{t.privatelife.education.courses?.[playerData.activeCourse!.courseId]?.name || ALL_COURSES.find(c => c.id === playerData.activeCourse!.courseId)?.name}"</p>
                                <p className="text-gray-400 text-xs mt-1">{t.privatelife.education.finishedAt.replace('{date}', new Date(playerData.activeCourse.endDate).toLocaleDateString(locale))}</p>
                            </div>
                        )}
                        {playerData.activeSeminar && (
                             <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center">
                                <p className="text-yellow-300 font-bold text-sm uppercase tracking-wider mb-1">{language === 'de' ? 'Aktive Teilnahme' : 'Active Participation'}</p>
                                <p className="text-white font-bold text-lg">"{playerData.activeSeminar.name}"</p>
                                <p className="text-gray-400 text-xs mt-1">{language === 'de' ? 'Läuft noch bis' : 'Runs until'} {new Date(playerData.activeSeminar.endDate).toLocaleDateString(locale)}</p>
                            </div>
                        )}
                        {isCourseCooldownActive() && !playerData.activeCourse && (
                             <div className="mt-8 p-4 bg-gray-900/50 border border-gray-600 rounded-lg text-center">
                                <p className="text-gray-400 text-sm">{language === 'de' ? 'Wartezeit nach Studium aktiv (60 Stunden).' : 'Study cooldown active (60 hours).'}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Actions */}
                    <div className="bg-gray-800/60 rounded-lg border border-gray-700 overflow-hidden flex flex-col h-full">
                        
                         {/* Navigation */}
                         <div className="px-4 pt-3 border-b border-gray-700 bg-gray-800/30 flex overflow-x-auto">
                            <TabButton title={t.privatelife.education.tabs.seminars} isActive={activeTab === 'seminars'} onClick={() => setActiveTab('seminars')} />
                            <TabButton title={t.privatelife.education.tabs.studies} isActive={activeTab === 'studies'} onClick={() => setActiveTab('studies')} />
                            <TabButton title={t.privatelife.education.tabs.leisure} isActive={activeTab === 'leisure'} onClick={() => setActiveTab('leisure')} />
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            {/* Seminars */}
                            {activeTab === 'seminars' && (
                                <div>
                                    <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                        <span className="text-xl">⚡</span> {t.privatelife.education.seminarsTitle}
                                    </h3>
                                    {hasAttendedSeminarThisMonth() && <p className="text-xs text-red-400 mb-2">{language === 'de' ? 'Monatslimit erreicht.' : 'Monthly limit reached.'}</p>}
                                    <div className="space-y-3">
                                        {WEEKEND_SEMINARS.map(sem => {
                                            const transName = t.privatelife.education.seminars?.[sem.id]?.name || sem.name;
                                            const transDesc = t.privatelife.education.seminars?.[sem.id]?.description || sem.description;
                                            return (
                                            <button 
                                                key={sem.id} 
                                                onClick={() => setSelectedItem({ type: 'seminar', data: sem })}
                                                disabled={hasAttendedSeminarThisMonth() || isBusyWithSeminar}
                                                className={`w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors ${(hasAttendedSeminarThisMonth() || isBusyWithSeminar) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-amber-200 transition-colors">{transName}</p>
                                                    <p className="text-xs text-gray-400">{transDesc}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <StarEffect amount={sem.skillBonus.amount} />
                                                        <span className="text-xs text-green-400 font-bold">{skillNameMap[sem.skillBonus.skill]}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= sem.cost ? 'bg-blue-900/40 text-blue-300' : 'bg-red-900/40 text-red-300'}`}>
                                                        {formatCurrency(sem.cost)}
                                                    </span>
                                                </div>
                                            </button>
                                        )})}
                                    </div>
                                </div>
                            )}

                            {/* Leisure */}
                            {activeTab === 'leisure' && (
                                <div>
                                    <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                        <span className="text-xl">🌴</span> {t.privatelife.education.leisureTitle}
                                    </h3>
                                    {hasAttendedLeisureThisMonth() && <p className="text-xs text-red-400 mb-2">{language === 'de' ? 'Monatslimit erreicht.' : 'Monthly limit reached.'}</p>}
                                    <div className="space-y-3">
                                        {LEISURE_ACTIVITIES.map(activity => {
                                             const translatedName = t.privatelife.education.activities?.[activity.id]?.name || activity.name;
                                             const translatedDesc = t.privatelife.education.activities?.[activity.id]?.description || activity.description;
                                            return (
                                            <button 
                                                key={activity.id} 
                                                onClick={() => setSelectedItem({ type: 'leisure', data: activity })}
                                                disabled={hasAttendedLeisureThisMonth() || isBusyWithSeminar}
                                                className={`w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors ${(hasAttendedLeisureThisMonth() || isBusyWithSeminar) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-amber-200 transition-colors">{translatedName}</p>
                                                    <p className="text-xs text-gray-400">{translatedDesc}</p>
                                                    <div className="flex gap-2 mt-1 items-center">
                                                        {activity.statBonus && activity.statBonus.stat === 'personalReputation' && (
                                                            <>
                                                                <StarEffect amount={activity.statBonus.amount} />
                                                                <span className="text-xs text-green-400 font-bold">{t.privatelife.overview.reputation}</span>
                                                            </>
                                                        )}
                                                        {activity.skillBonus && (
                                                            <>
                                                                <StarEffect amount={activity.skillBonus.amount} />
                                                                <span className="text-xs text-cyan-400 font-bold">{skillNameMap[activity.skillBonus.skill]}</span>
                                                            </>
                                                        )}
                                                         {activity.energyBonus && (
                                                            <>
                                                                <span className="text-xs text-green-400 font-bold">+{activity.energyBonus} {t.privatelife.education.energy}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= activity.cost ? 'bg-blue-900/40 text-blue-300' : 'bg-red-900/40 text-red-300'}`}>
                                                        {activity.cost > 0 ? formatCurrency(activity.cost) : <span className="text-green-400">{language === 'de' ? 'Gratis' : 'Free'}</span>}
                                                    </span>
                                                </div>
                                            </button>
                                        )})}
                                        <button 
                                            onClick={() => setSelectedItem({ type: 'vacation', data: {} })}
                                            className="w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors"
                                        >
                                            <div>
                                                <p className="font-bold text-white group-hover:text-amber-200 transition-colors">{t.privatelife.education.luxuryVacation}</p>
                                                <p className="text-xs text-gray-400">{t.privatelife.education.luxuryVacationDesc}</p>
                                            </div>
                                            <div className="text-right">
                                                 <span className={`text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= 50000 ? 'bg-purple-900/40 text-purple-300' : 'bg-red-900/40 text-red-300'}`}>
                                                    {formatCurrency(50000)}
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Long Term */}
                            {activeTab === 'studies' && (
                                <div>
                                    <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                        <span className="text-xl">🎓</span> {t.privatelife.education.studiesTitle}
                                    </h3>
                                    {isCourseCooldownActive() && !playerData.activeCourse && <p className="text-xs text-red-400 mb-2">{language === 'de' ? 'Wartezeit aktiv (60 Stunden).' : 'Cooldown active (60 hours).'}</p>}
                                    <div className="space-y-3">
                                        {ALL_COURSES.map(course => {
                                            const transName = t.privatelife.education.courses?.[course.id]?.name || course.name;
                                            const transDesc = t.privatelife.education.courses?.[course.id]?.description || course.description;
                                            return (
                                            <button 
                                                key={course.id} 
                                                onClick={() => setSelectedItem({ type: 'course', data: course })}
                                                disabled={(isCourseCooldownActive() && !playerData.activeCourse) || isBusyWithSeminar}
                                                className={`w-full text-left bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors ${((isCourseCooldownActive() && !playerData.activeCourse) || isBusyWithSeminar) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="max-w-[70%]">
                                                    <p className="font-bold text-white group-hover:text-amber-200 transition-colors">{transName}</p>
                                                    <p className="text-xs text-gray-400 line-clamp-1">{transDesc}</p>
                                                    <div className="flex gap-2 mt-1 items-center">
                                                         <StarEffect amount={course.skillBonus?.amount || 0} />
                                                         <span className="text-xs text-blue-400 font-bold">{course.skillBonus ? skillNameMap[course.skillBonus.skill] : ''}</span>
                                                    </div>
                                                    {playerData.completedCourses.includes(course.id) && <span className="text-[10px] text-green-500 font-bold uppercase mt-1 block">{t.privatelife.education.alreadyFinished}</span>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 mb-1">{course.duration} {t.privatelife.education.days}</p>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${playerData.privateCapital >= course.cost ? 'bg-amber-900/40 text-amber-300' : 'bg-red-900/40 text-red-300'}`}>
                                                        {formatCurrency(course.cost)}
                                                    </span>
                                                </div>
                                            </button>
                                        )})}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {selectedItem && (
                <ActivityDetailsModal 
                    item={selectedItem.data}
                    type={selectedItem.type}
                    onClose={() => setSelectedItem(null)}
                    onConfirm={handleConfirmSelection}
                    canAfford={playerData.privateCapital >= (selectedItem.type === 'vacation' ? 50000 : selectedItem.data.cost)}
                    isBusy={!!playerData.activeCourse || isBusyWithSeminar}
                    isCompleted={selectedItem.type === 'course' && playerData.completedCourses.includes(selectedItem.data.id)}
                    hasEnergy={selectedItem.type !== 'leisure' ? (playerData.energy || 0) >= (selectedItem.data.energyCost || 0) : true} // Energy logic handled inside leisure for negative costs
                    cooldownActive={selectedItem.type === 'course' && isCourseCooldownActive()}
                    frequencyLimitReached={(selectedItem.type === 'seminar' && hasAttendedSeminarThisMonth()) || (selectedItem.type === 'leisure' && hasAttendedLeisureThisMonth())}
                    formatCurrency={formatCurrency}
                    t={t}
                    skillNameMap={skillNameMap}
                />
            )}
        </div>
    );
};
