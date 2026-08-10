
import React, { useState, useMemo, useEffect } from 'react';
import { Director, Actor, EmployeeType, ProjectPhase } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import StarRating from '../../StarRating';
import DirectorIcon from '../../icons/DirectorIcon';
import ActorIcon from '../../icons/ActorIcon';
import StarIcon from '../../icons/StarIcon';
import CircularStatusIndicator from '../../CircularStatusIndicator';
import { useTranslation } from '../../../hooks/useTranslation';
import TalentProfile from './TalentProfile';
import { getTalentPortraitUrl } from '../../TalentDossierModal';

type ContactsSubTab = 'actors' | 'directors';
type TalentFilter = 'all' | 'favorites';
type SortKey = 'age' | 'skill' | 'loyalty' | 'moral';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

const TabButton: React.FC<{ title: string, isActive: boolean, onClick: () => void, disabled?: boolean }> = ({ title, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`py-3 px-6 font-bold text-base transition-colors duration-200 focus:outline-none relative top-px rounded-t-lg border-t border-x
            ${isActive 
                ? 'bg-gray-800/80 text-amber-400 border-gray-700 z-10' 
                : 'bg-black/40 text-gray-400 hover:text-white border-transparent hover:bg-gray-900/40'
            } ${
            disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
    >
        {title}
    </button>
);

const SortButton: React.FC<{ label: string; sortKey: SortKey; currentSortConfig: SortConfig; onSort: () => void; }> = ({ label, sortKey, currentSortConfig, onSort }) => {
    const isActive = currentSortConfig.key === sortKey;
    return (
        <button
            onClick={onSort}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors border ${
                isActive ? 'bg-gray-700 text-amber-400 border-amber-500/50' : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
            }`}
        >
            {label}
            {isActive && (
                currentSortConfig.direction === 'ascending'
                ? <span className="text-[10px]">▲</span>
                : <span className="text-[10px]">▼</span>
            )}
        </button>
    );
};

const getAge = (birthDate: Date, gameDate: Date): number => {
    if (!birthDate) return 0;
    const bd = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) {
        age--;
    }
    return age;
};

const KontakteTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    
    // State
    const [contactsSubTab, setContactsSubTab] = useState<ContactsSubTab>('actors');
    const [selectedTalentId, setSelectedTalentId] = useState<number | null>(null);
    const [filter, setFilter] = useState<TalentFilter>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'skill', direction: 'descending' });

    if (!playerData) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    // Calculate detailed status for all talents
    const talentStatusMap = useMemo(() => {
        const statusMap = new Map<number, string>();
        
        // 1. Competitors
        playerData.competitors.forEach(studio => {
            if (studio.currentActivity.type === 'producing' && new Date(playerData.gameDate) < new Date(studio.currentActivity.endDate)) {
                const activityText = `${t.talentDossier.status.busy} "${studio.currentActivity.filmTitle}" (${studio.name})`;
                if (studio.currentActivity.directorId) statusMap.set(studio.currentActivity.directorId, activityText);
                if (studio.currentActivity.actorId) statusMap.set(studio.currentActivity.actorId, activityText);
            }
        });

        // 2. Player Projects (Iterate ALL Active Projects)
        if (playerData.activeProjects) {
            playerData.activeProjects.forEach(project => {
                const busyPhases = [
                    ProjectPhase.ProductionSetup, 
                    ProjectPhase.Production, 
                    ProjectPhase.PostProductionSetup, 
                    ProjectPhase.PostProduction
                ];
                
                if (busyPhases.includes(project.phase)) {
                    const activityText = `${t.talentDossier.status.busy} "${project.workingTitle}"`;
                    if (project.directorId) statusMap.set(project.directorId, activityText);
                    if (project.mainActorId) statusMap.set(project.mainActorId, activityText);
                    if (project.supportingActorId) statusMap.set(project.supportingActorId, activityText);
                }
            });
        }
        
        // 3. Training & Casting & Exclusive
        const checkList = [...playerData.directors, ...playerData.actors];
        checkList.forEach(talent => {
            if (!statusMap.has(talent.id)) {
                if (talent.activeTraining) {
                     statusMap.set(talent.id, `${t.talentDossier.status.inTraining} ${new Date(talent.activeTraining.endDate).toLocaleDateString(locale)}`);
                } else if (playerData.activeCasting?.talentId === talent.id) {
                     statusMap.set(talent.id, t.talentDossier.status.casting);
                } else if (talent.contract?.type === 'exclusive') {
                    // Only show "Exclusive" if not busy with something else above
                    statusMap.set(talent.id, t.talentDossier.status.exclusive);
                }
            }
        });

        return statusMap;
    }, [playerData.competitors, playerData.gameDate, playerData.activeProjects, playerData.directors, playerData.actors, t, locale]);

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const talentsList = useMemo(() => {
        const rawList = contactsSubTab === 'actors' ? playerData.actors : playerData.directors;
        
        let filtered = rawList.filter(t => 
            t.isDiscovered && 
            !t.isFamily && 
            (filter === 'favorites' ? t.isFavorite === true : true)
        );

        return filtered.sort((a, b) => {
            if (sortConfig.key === 'skill') {
                if (a.bekanntheit === 0 && b.bekanntheit > 0) return 1;
                if (a.bekanntheit > 0 && b.bekanntheit === 0) return -1;
                if (a.bekanntheit === 0 && b.bekanntheit === 0) return 0;
            }

            let valA, valB;
            switch (sortConfig.key) {
                case 'age': valA = getAge(a.birthDate, playerData.gameDate); valB = getAge(b.birthDate, playerData.gameDate); break;
                case 'loyalty': valA = a.loyalty; valB = b.loyalty; break;
                case 'moral': valA = a.moral; valB = b.moral; break;
                default: valA = a.skill; valB = b.skill;
            }

            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }, [playerData.actors, playerData.directors, contactsSubTab, filter, sortConfig, playerData.gameDate]);

    // Auto-select first if selection is invalid or empty
    useEffect(() => {
        if (talentsList.length > 0) {
            if (!selectedTalentId || !talentsList.some(t => t.id === selectedTalentId)) {
                setSelectedTalentId(talentsList[0].id);
            }
        } else {
            setSelectedTalentId(null);
        }
    }, [talentsList, selectedTalentId]);

    const selectedTalent = useMemo(() => {
        if (!selectedTalentId) return null;
        return talentsList.find(t => t.id === selectedTalentId) || null;
    }, [selectedTalentId, talentsList]);

    const handleTalentUpdate = (newTalent: Director | Actor) => {
        // Callback functionality handled within component
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Top Tabs */}
            <div className="flex-shrink-0 flex items-end pl-2">
                <TabButton title={t.office.contacts.actors} isActive={contactsSubTab === 'actors'} onClick={() => { setContactsSubTab('actors'); setFilter('all'); }} />
                <TabButton title={t.office.contacts.directors} isActive={contactsSubTab === 'directors'} onClick={() => { setContactsSubTab('directors'); setFilter('all'); }} />
            </div>

            {/* Main Content Box */}
            <div className="flex-grow bg-gray-800/80 p-6 rounded-b-lg rounded-tr-lg border border-gray-700 shadow-2xl overflow-hidden flex flex-col relative z-0">
                
                {/* Filters Row */}
                <div className="flex-shrink-0 mb-4 flex justify-between items-center border-b border-gray-700 pb-2">
                    <div className="flex gap-2 items-center">
                        <select
                            className="bg-gray-900 border border-gray-600 rounded-md py-1 px-3 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as TalentFilter)}
                        >
                            <option value="all">{t.office.contacts.showAll}</option>
                            <option value="favorites">{t.office.contacts.showFavorites}</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        <span className="text-xs text-gray-500 mr-1 hidden xl:inline">{t.office.contacts.sortBy}</span>
                        <SortButton label={t.office.contacts.sortSkill} sortKey="skill" currentSortConfig={sortConfig} onSort={() => handleSort('skill')} />
                        <SortButton label={t.office.contacts.sortAge} sortKey="age" currentSortConfig={sortConfig} onSort={() => handleSort('age')} />
                        <SortButton label={t.office.contacts.sortLoyalty} sortKey="loyalty" currentSortConfig={sortConfig} onSort={() => handleSort('loyalty')} />
                    </div>
                </div>

                <div className="flex-grow flex gap-6 overflow-hidden">
                    
                    {/* LEFT COLUMN: DETAIL VIEW (50%) */}
                    <div className="w-1/2 flex flex-col h-full bg-gray-900/50 p-1 rounded-lg border border-gray-700 overflow-hidden">
                        {selectedTalent ? (
                            <TalentProfile 
                                key={`${selectedTalent.id}-${selectedTalent.name}-${selectedTalent.portraitUrl}`} // FORCE RE-RENDER ON DATA CHANGE
                                talent={selectedTalent}
                                playerData={playerData}
                                onTalentChange={handleTalentUpdate}
                                allowIdentityEdit={true}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 italic p-6 text-center">
                                {talentsList.length === 0 ? (
                                    t.office.contacts.noActors // Generic message if empty
                                ) : (
                                    "Wählen Sie einen Talent aus der Liste."
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: LIST VIEW (50%) */}
                    <div className="w-1/2 flex flex-col h-full">
                        <div className="bg-gray-900/40 p-2 rounded-t-lg border-b border-gray-700 flex justify-between items-center px-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{talentsList.length} {t.talentDossier.talent}</span>
                        </div>
                        <div className="bg-gray-900/20 flex-grow overflow-y-auto pr-2 custom-scrollbar p-2 rounded-b-lg border border-gray-700 border-t-0">
                             <div className="space-y-3">
                                {talentsList.map(talent => {
                                    const isSelected = selectedTalentId === talent.id;
                                    const age = getAge(talent.birthDate, playerData.gameDate);
                                    const hasExclusiveContract = talent.contract?.type === 'exclusive';
                                    const statusText = talentStatusMap.get(talent.id);
                                    const isBusy = !!statusText && statusText !== t.talentDossier.status.exclusive;
                                    const portraitUrl = getTalentPortraitUrl(talent, playerData.gameDate);

                                    let containerClass = '';
                                    if (isBusy) containerClass = 'border-red-500/30 bg-red-900/10'; // removed opacity for readability
                                    else if (hasExclusiveContract) containerClass = 'border-green-500/50 bg-green-900/10';

                                    return (
                                        <button 
                                            key={talent.id} 
                                            onClick={() => setSelectedTalentId(talent.id)}
                                            className={`w-full p-3 rounded-lg border text-left transition-all relative overflow-hidden group flex items-center gap-4 ${
                                                isSelected 
                                                ? 'bg-amber-900/40 border-amber-500 ring-1 ring-amber-500/50' 
                                                : `bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 ${containerClass}`
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-500 flex items-center justify-center relative">
                                                {portraitUrl ? (
                                                    <img src={portraitUrl} alt={talent.name} className={`w-full h-full object-cover ${isBusy ? 'grayscale' : ''}`} draggable="false" />
                                                ) : (
                                                    'speedModifier' in talent ? <DirectorIcon className="w-8 h-8 text-gray-400 p-1" /> : <ActorIcon className="w-8 h-8 text-gray-400 p-1" />
                                                )}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-baseline">
                                                    <p className={`font-bold truncate text-base ${isSelected ? 'text-amber-300' : 'text-white'}`}>{talent.name}, {age}</p>
                                                    <div className="flex items-center gap-1 text-xs text-amber-400" title={`${t.talentDossier.fame}: ${talent.bekanntheit}`}>
                                                        <StarIcon className="w-3 h-3"/>
                                                        <span className="font-bold">{talent.bekanntheit}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="flex flex-col">
                                                         {/* STATUS TEXT LINE */}
                                                         {statusText && <span className="text-[10px] text-yellow-400 truncate max-w-[150px]" title={statusText}>{statusText}</span>}
                                                         {!statusText && <StarRating rating={talent.skill} isRevealed={talent.bekanntheit >= 1} size="sm" />}
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-300">
                                                        {hasExclusiveContract ? <span className="text-green-400 font-bold">Exklusiv</span> : formatCurrency(talent.cost)}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                             </div>
                             {talentsList.length === 0 && (
                                 <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                     <p className="italic">Keine Talente gefunden.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KontakteTab;
