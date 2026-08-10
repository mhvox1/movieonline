import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { ProjectPhase } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import StarRating from '../../StarRating';
import DirectorIcon from '../../icons/DirectorIcon';
import ActorIcon from '../../icons/ActorIcon';
import StarIcon from '../../icons/StarIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import TalentProfile from './TalentProfile';
import { getTalentPortraitUrl } from '../../TalentDossierModal';
const TabButton = ({ title, isActive, onClick, disabled }) => (_jsx("button", { onClick: onClick, disabled: disabled, className: `py-3 px-6 font-bold text-base transition-colors duration-200 focus:outline-none relative top-px rounded-t-lg border-t border-x
            ${isActive
        ? 'bg-gray-800/80 text-amber-400 border-gray-700 z-10'
        : 'bg-black/40 text-gray-400 hover:text-white border-transparent hover:bg-gray-900/40'} ${disabled
        ? 'opacity-50 cursor-not-allowed'
        : ''}`, children: title }));
const SortButton = ({ label, sortKey, currentSortConfig, onSort }) => {
    const isActive = currentSortConfig.key === sortKey;
    return (_jsxs("button", { onClick: onSort, className: `px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors border ${isActive ? 'bg-gray-700 text-amber-400 border-amber-500/50' : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'}`, children: [label, isActive && (currentSortConfig.direction === 'ascending'
                ? _jsx("span", { className: "text-[10px]", children: "\u25B2" })
                : _jsx("span", { className: "text-[10px]", children: "\u25BC" }))] }));
};
const getAge = (birthDate, gameDate) => {
    if (!birthDate)
        return 0;
    const bd = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) {
        age--;
    }
    return age;
};
const KontakteTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    // State
    const [contactsSubTab, setContactsSubTab] = useState('actors');
    const [selectedTalentId, setSelectedTalentId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'skill', direction: 'descending' });
    if (!playerData)
        return null;
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    // Calculate detailed status for all talents
    const talentStatusMap = useMemo(() => {
        const statusMap = new Map();
        // 1. Competitors
        playerData.competitors.forEach(studio => {
            if (studio.currentActivity.type === 'producing' && new Date(playerData.gameDate) < new Date(studio.currentActivity.endDate)) {
                const activityText = `${t.talentDossier.status.busy} "${studio.currentActivity.filmTitle}" (${studio.name})`;
                if (studio.currentActivity.directorId)
                    statusMap.set(studio.currentActivity.directorId, activityText);
                if (studio.currentActivity.actorId)
                    statusMap.set(studio.currentActivity.actorId, activityText);
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
                    if (project.directorId)
                        statusMap.set(project.directorId, activityText);
                    if (project.mainActorId)
                        statusMap.set(project.mainActorId, activityText);
                    if (project.supportingActorId)
                        statusMap.set(project.supportingActorId, activityText);
                }
            });
        }
        // 3. Training & Casting & Exclusive
        const checkList = [...playerData.directors, ...playerData.actors];
        checkList.forEach(talent => {
            if (!statusMap.has(talent.id)) {
                if (talent.activeTraining) {
                    statusMap.set(talent.id, `${t.talentDossier.status.inTraining} ${new Date(talent.activeTraining.endDate).toLocaleDateString(locale)}`);
                }
                else if (playerData.activeCasting?.talentId === talent.id) {
                    statusMap.set(talent.id, t.talentDossier.status.casting);
                }
                else if (talent.contract?.type === 'exclusive') {
                    // Only show "Exclusive" if not busy with something else above
                    statusMap.set(talent.id, t.talentDossier.status.exclusive);
                }
            }
        });
        return statusMap;
    }, [playerData.competitors, playerData.gameDate, playerData.activeProjects, playerData.directors, playerData.actors, t, locale]);
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    const talentsList = useMemo(() => {
        const rawList = contactsSubTab === 'actors' ? playerData.actors : playerData.directors;
        let filtered = rawList.filter(t => t.isDiscovered &&
            !t.isFamily &&
            (filter === 'favorites' ? t.isFavorite === true : true));
        return filtered.sort((a, b) => {
            if (sortConfig.key === 'skill') {
                if (a.bekanntheit === 0 && b.bekanntheit > 0)
                    return 1;
                if (a.bekanntheit > 0 && b.bekanntheit === 0)
                    return -1;
                if (a.bekanntheit === 0 && b.bekanntheit === 0)
                    return 0;
            }
            let valA, valB;
            switch (sortConfig.key) {
                case 'age':
                    valA = getAge(a.birthDate, playerData.gameDate);
                    valB = getAge(b.birthDate, playerData.gameDate);
                    break;
                case 'loyalty':
                    valA = a.loyalty;
                    valB = b.loyalty;
                    break;
                case 'moral':
                    valA = a.moral;
                    valB = b.moral;
                    break;
                default:
                    valA = a.skill;
                    valB = b.skill;
            }
            if (valA < valB)
                return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB)
                return sortConfig.direction === 'ascending' ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }, [playerData.actors, playerData.directors, contactsSubTab, filter, sortConfig, playerData.gameDate]);
    // Auto-select first if selection is invalid or empty
    useEffect(() => {
        if (talentsList.length > 0) {
            if (!selectedTalentId || !talentsList.some(t => t.id === selectedTalentId)) {
                setSelectedTalentId(talentsList[0].id);
            }
        }
        else {
            setSelectedTalentId(null);
        }
    }, [talentsList, selectedTalentId]);
    const selectedTalent = useMemo(() => {
        if (!selectedTalentId)
            return null;
        return talentsList.find(t => t.id === selectedTalentId) || null;
    }, [selectedTalentId, talentsList]);
    const handleTalentUpdate = (newTalent) => {
        // Callback functionality handled within component
    };
    return (_jsxs("div", { className: "w-full h-full flex flex-col", children: [_jsxs("div", { className: "flex-shrink-0 flex items-end pl-2", children: [_jsx(TabButton, { title: t.office.contacts.actors, isActive: contactsSubTab === 'actors', onClick: () => { setContactsSubTab('actors'); setFilter('all'); } }), _jsx(TabButton, { title: t.office.contacts.directors, isActive: contactsSubTab === 'directors', onClick: () => { setContactsSubTab('directors'); setFilter('all'); } })] }), _jsxs("div", { className: "flex-grow bg-gray-800/80 p-6 rounded-b-lg rounded-tr-lg border border-gray-700 shadow-2xl overflow-hidden flex flex-col relative z-0", children: [_jsxs("div", { className: "flex-shrink-0 mb-4 flex justify-between items-center border-b border-gray-700 pb-2", children: [_jsx("div", { className: "flex gap-2 items-center", children: _jsxs("select", { className: "bg-gray-900 border border-gray-600 rounded-md py-1 px-3 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none", value: filter, onChange: (e) => setFilter(e.target.value), children: [_jsx("option", { value: "all", children: t.office.contacts.showAll }), _jsx("option", { value: "favorites", children: t.office.contacts.showFavorites })] }) }), _jsxs("div", { className: "flex items-center gap-1 overflow-x-auto", children: [_jsx("span", { className: "text-xs text-gray-500 mr-1 hidden xl:inline", children: t.office.contacts.sortBy }), _jsx(SortButton, { label: t.office.contacts.sortSkill, sortKey: "skill", currentSortConfig: sortConfig, onSort: () => handleSort('skill') }), _jsx(SortButton, { label: t.office.contacts.sortAge, sortKey: "age", currentSortConfig: sortConfig, onSort: () => handleSort('age') }), _jsx(SortButton, { label: t.office.contacts.sortLoyalty, sortKey: "loyalty", currentSortConfig: sortConfig, onSort: () => handleSort('loyalty') })] })] }), _jsxs("div", { className: "flex-grow flex gap-6 overflow-hidden", children: [_jsx("div", { className: "w-1/2 flex flex-col h-full bg-gray-900/50 p-1 rounded-lg border border-gray-700 overflow-hidden", children: selectedTalent ? (_jsx(TalentProfile, { talent: selectedTalent, playerData: playerData, onTalentChange: handleTalentUpdate, allowIdentityEdit: true }, `${selectedTalent.id}-${selectedTalent.name}-${selectedTalent.portraitUrl}`)) : (_jsx("div", { className: "h-full flex items-center justify-center text-gray-500 italic p-6 text-center", children: talentsList.length === 0 ? (t.office.contacts.noActors // Generic message if empty
                                    ) : ("Wählen Sie einen Talent aus der Liste.") })) }), _jsxs("div", { className: "w-1/2 flex flex-col h-full", children: [_jsx("div", { className: "bg-gray-900/40 p-2 rounded-t-lg border-b border-gray-700 flex justify-between items-center px-4", children: _jsxs("span", { className: "text-xs font-bold text-gray-400 uppercase tracking-wider", children: [talentsList.length, " ", t.talentDossier.talent] }) }), _jsxs("div", { className: "bg-gray-900/20 flex-grow overflow-y-auto pr-2 custom-scrollbar p-2 rounded-b-lg border border-gray-700 border-t-0", children: [_jsx("div", { className: "space-y-3", children: talentsList.map(talent => {
                                                    const isSelected = selectedTalentId === talent.id;
                                                    const age = getAge(talent.birthDate, playerData.gameDate);
                                                    const hasExclusiveContract = talent.contract?.type === 'exclusive';
                                                    const statusText = talentStatusMap.get(talent.id);
                                                    const isBusy = !!statusText && statusText !== t.talentDossier.status.exclusive;
                                                    const portraitUrl = getTalentPortraitUrl(talent, playerData.gameDate);
                                                    let containerClass = '';
                                                    if (isBusy)
                                                        containerClass = 'border-red-500/30 bg-red-900/10'; // removed opacity for readability
                                                    else if (hasExclusiveContract)
                                                        containerClass = 'border-green-500/50 bg-green-900/10';
                                                    return (_jsxs("button", { onClick: () => setSelectedTalentId(talent.id), className: `w-full p-3 rounded-lg border text-left transition-all relative overflow-hidden group flex items-center gap-4 ${isSelected
                                                            ? 'bg-amber-900/40 border-amber-500 ring-1 ring-amber-500/50'
                                                            : `bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 ${containerClass}`}`, children: [_jsx("div", { className: "w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-500 flex items-center justify-center relative", children: portraitUrl ? (_jsx("img", { src: portraitUrl, alt: talent.name, className: `w-full h-full object-cover ${isBusy ? 'grayscale' : ''}`, draggable: "false" })) : ('speedModifier' in talent ? _jsx(DirectorIcon, { className: "w-8 h-8 text-gray-400 p-1" }) : _jsx(ActorIcon, { className: "w-8 h-8 text-gray-400 p-1" })) }), _jsxs("div", { className: "flex-grow min-w-0", children: [_jsxs("div", { className: "flex justify-between items-baseline", children: [_jsxs("p", { className: `font-bold truncate text-base ${isSelected ? 'text-amber-300' : 'text-white'}`, children: [talent.name, ", ", age] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-amber-400", title: `${t.talentDossier.fame}: ${talent.bekanntheit}`, children: [_jsx(StarIcon, { className: "w-3 h-3" }), _jsx("span", { className: "font-bold", children: talent.bekanntheit })] })] }), _jsxs("div", { className: "flex justify-between items-center mt-1", children: [_jsxs("div", { className: "flex flex-col", children: [statusText && _jsx("span", { className: "text-[10px] text-yellow-400 truncate max-w-[150px]", title: statusText, children: statusText }), !statusText && _jsx(StarRating, { rating: talent.skill, isRevealed: talent.bekanntheit >= 1, size: "sm" })] }), _jsx("span", { className: "text-xs font-mono text-gray-300", children: hasExclusiveContract ? _jsx("span", { className: "text-green-400 font-bold", children: "Exklusiv" }) : formatCurrency(talent.cost) })] })] })] }, talent.id));
                                                }) }), talentsList.length === 0 && (_jsx("div", { className: "flex flex-col items-center justify-center h-full text-gray-500 opacity-50", children: _jsx("p", { className: "italic", children: "Keine Talente gefunden." }) }))] })] })] })] })] }));
};
export default KontakteTab;
