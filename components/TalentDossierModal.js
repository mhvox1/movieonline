import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { ProjectPhase } from '../types';
import StarRating from './StarRating';
import DirectorIcon from './icons/DirectorIcon';
import ActorIcon from './icons/ActorIcon';
import { useGame } from '../contexts/GameContext';
import FavoriteStarIcon from './icons/FavoriteStarIcon';
import StarIcon from './icons/StarIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import { useTranslation } from '../hooks/useTranslation';
export const getTalentPortraitUrl = (talent, gameDate) => {
    if (!talent.portraitUrl) {
        return '';
    }
    // Support for custom uploaded images (Base64 Data URLs)
    if (talent.portraitUrl.startsWith('data:image')) {
        return talent.portraitUrl;
    }
    const portraitBaseId = String(talent.portraitUrl || '').trim().split('/').pop()?.replace(/\.(png|jpg|jpeg|webp)$/i, '') || '';
    if (!portraitBaseId) {
        return '';
    }
    if (!talent.birthDate) {
        return `/portrait/${portraitBaseId}m.png`; // Fallback default age
    }
    const birthDate = new Date(talent.birthDate);
    let age = gameDate.getFullYear() - birthDate.getFullYear();
    const m = gameDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && gameDate.getDate() < birthDate.getDate())) {
        age--;
    }
    let ageSuffix;
    if (age <= 15) {
        ageSuffix = 'k';
    }
    else if (age >= 16 && age <= 34) {
        ageSuffix = 'j';
    }
    else if (age >= 35 && age <= 59) {
        ageSuffix = 'm';
    }
    else { // age >= 60
        ageSuffix = 'a';
    }
    const baseId = portraitBaseId;
    return `/portrait/${baseId}${ageSuffix}.png`;
};
// Deterministic shuffle logic for Fog of War
const seededRandom = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};
const deterministicShuffle = (array, seed) => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let randomIndex;
    let seedCounter = 0;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(seededRandom(seed + (seedCounter++)) * currentIndex);
        currentIndex--;
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
};
const ProgressBar = ({ progress, color, label }) => (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("span", { className: "text-xs text-gray-400 font-bold uppercase tracking-wider", children: label }), _jsxs("span", { className: "text-xs font-mono text-white", children: [Math.round(progress), "/100"] })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-2 overflow-hidden border border-gray-600", children: _jsx("div", { className: `${color} h-full rounded-full transition-all duration-500 ease-out`, style: { width: `${progress}%` } }) })] }));
const TalentDossierModal = ({ talent, onClose, talentList, onTalentChange }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    if (!playerData)
        return null;
    const currentTalent = useMemo(() => {
        if (!playerData)
            return talent;
        if ('speedModifier' in talent) {
            return playerData.directors.find((d) => d.id === talent.id) || talent;
        }
        else {
            return playerData.actors.find((a) => a.id === talent.id) || talent;
        }
    }, [playerData, talent]);
    const age = useMemo(() => {
        if (!playerData || !currentTalent.birthDate)
            return '?';
        const birthDate = new Date(currentTalent.birthDate);
        const today = new Date(playerData.gameDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }, [playerData, currentTalent.birthDate]);
    const finalPortraitUrl = getTalentPortraitUrl(currentTalent, playerData.gameDate);
    const isDirector = 'speedModifier' in currentTalent;
    // Gender specific job titles
    let jobTitle = isDirector ? t.talentDossier.director : t.talentDossier.actor;
    if (language === 'de') {
        const isFemale = currentTalent.gender === 'weiblich';
        if (isDirector) {
            jobTitle = isFemale ? "Regisseurin" : "Regisseur";
        }
        else {
            jobTitle = isFemale ? "Schauspielerin" : "Schauspieler";
        }
    }
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    // --- FOG OF WAR ---
    const discoveryOrder = useMemo(() => {
        const items = ['traits', 'potential', 'lieblingsgenre1', 'lieblingsgenre2', 'hatedGenre'];
        return deterministicShuffle(items, currentTalent.id);
    }, [currentTalent.id]);
    const numRevealed = Math.max(0, currentTalent.bekanntheit - 1);
    const revealedProperties = currentTalent.bekanntheit >= 5
        ? ['traits', 'potential', 'lieblingsgenre1', 'lieblingsgenre2', 'hatedGenre']
        : discoveryOrder.slice(0, numRevealed);
    const isSkillVisible = currentTalent.bekanntheit >= 1;
    const areTraitsVisible = revealedProperties.includes('traits');
    const isPotentialVisible = revealedProperties.includes('potential');
    const isFavoriteGenre1Visible = revealedProperties.includes('lieblingsgenre1');
    const isFavoriteGenre2Visible = revealedProperties.includes('lieblingsgenre2');
    const isHatedGenreVisible = revealedProperties.includes('hatedGenre');
    const currentStatusText = useMemo(() => {
        if (currentTalent.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(currentTalent.unavailableForProjectsUntil)) {
            for (const competitor of playerData.competitors) {
                if (competitor.currentActivity.directorId === currentTalent.id || competitor.currentActivity.actorId === currentTalent.id) {
                    return `${t.talentDossier.status.busy} (${competitor.name})`;
                }
            }
            return t.talentDossier.status.busy + " (Extern)";
        }
        if (currentTalent.activeTraining) {
            return `${t.talentDossier.status.inTraining} ${new Date(currentTalent.activeTraining.endDate).toLocaleDateString(locale)}`;
        }
        if (playerData.activeCasting?.talentId === currentTalent.id)
            return t.talentDossier.status.casting;
        const project = playerData.currentProject;
        if (project) {
            const busyPhases = [ProjectPhase.Production, ProjectPhase.Casting, ProjectPhase.Scriptwriting];
            if (busyPhases.includes(project.phase)) {
                const isTalentInProject = project.directorId === currentTalent.id || project.mainActorId === currentTalent.id || project.supportingActorId === currentTalent.id;
                if (isTalentInProject) {
                    return `${t.talentDossier.status.busy} "${project.workingTitle}"`;
                }
            }
        }
        if (currentTalent.contract?.type === 'exclusive')
            return t.talentDossier.status.exclusive;
        return t.talentDossier.status.available;
    }, [playerData, currentTalent, t, locale]);
    const isBusy = !!(currentStatusText !== t.talentDossier.status.available && currentStatusText !== t.talentDossier.status.exclusive);
    const updateTalent = (updateFn) => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            const updated = updateFn(currentTalent);
            if (isDirector) {
                return { ...prev, directors: prev.directors.map(d => d.id === currentTalent.id ? updated : d) };
            }
            else {
                return { ...prev, actors: prev.actors.map(a => a.id === currentTalent.id ? updated : a) };
            }
        });
    };
    const handleToggleFavorite = () => updateTalent(t => ({ ...t, isFavorite: !t.isFavorite }));
    // Navigation
    const currentIndex = useMemo(() => talentList.findIndex(t => t.id === talent.id), [talentList, talent]);
    const handlePrev = () => {
        if (talentList.length <= 1)
            return;
        const prevIndex = (currentIndex - 1 + talentList.length) % talentList.length;
        onTalentChange(talentList[prevIndex]);
    };
    const handleNext = () => {
        if (talentList.length <= 1)
            return;
        const nextIndex = (currentIndex + 1) % talentList.length;
        onTalentChange(talentList[nextIndex]);
    };
    return (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: onClose, children: _jsxs("div", { className: "flex items-center gap-4 w-full max-w-3xl", children: [_jsx("button", { onClick: (e) => { e.stopPropagation(); handlePrev(); }, disabled: talentList.length <= 1, className: "p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white", children: _jsx(ArrowLeftIcon, { className: "h-8 w-8" }) }), _jsxs("div", { className: "relative bg-gray-800 border border-amber-500 rounded-lg shadow-2xl flex-grow overflow-hidden animate-fade-in", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "bg-gray-900/50 p-6 border-b border-gray-700 flex items-center gap-6 relative", children: [_jsx("button", { onClick: handleToggleFavorite, className: `absolute top-4 right-4 p-1 rounded-full transition-colors z-20`, children: _jsx(FavoriteStarIcon, { isFavorite: !!currentTalent.isFavorite, className: `h-8 w-8 ${currentTalent.isFavorite ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300` }) }), _jsx("div", { className: "w-32 h-32 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-gray-600 overflow-hidden shadow-lg relative", children: finalPortraitUrl ? (_jsx("img", { src: finalPortraitUrl, alt: currentTalent.name, className: `w-full h-full object-cover ${isBusy ? 'grayscale' : ''}`, draggable: "false" })) : (isDirector ? _jsx(DirectorIcon, { className: "w-16 h-16 text-gray-400" }) : _jsx(ActorIcon, { className: "w-16 h-16 text-gray-400" })) }), _jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400", children: currentTalent.name }), _jsxs("p", { className: "text-gray-400 text-lg font-semibold", children: [jobTitle, " ", _jsxs("span", { className: "text-sm text-gray-500 ml-2", children: ["(", age, " ", t.talentDossier.years, ")"] })] }), _jsx("p", { className: `text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded border ${isBusy ? 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20' : 'text-green-400 border-green-500/50 bg-green-900/20'}`, children: currentStatusText })] })] }), _jsxs("div", { className: "p-6 grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gray-900/30 p-3 rounded-lg border border-gray-700", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-gray-400 text-sm font-bold uppercase", children: t.talentDossier.fame }), _jsx("div", { className: "flex gap-0.5", children: [1, 2, 3, 4, 5].map(star => (_jsx(StarIcon, { className: `w-4 h-4 ${star <= currentTalent.bekanntheit ? 'text-yellow-400' : 'text-gray-700'}` }, star))) })] }), _jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-gray-400 text-sm font-bold uppercase", children: t.talentDossier.skill }), isSkillVisible ? _jsx(StarRating, { rating: currentTalent.skill }) : _jsx("span", { className: "text-gray-500 font-bold", children: "?" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-400 text-sm font-bold uppercase", children: t.talentDossier.potential }), isPotentialVisible ? _jsx(StarRating, { rating: currentTalent.potential, showValue: false }) : _jsx("span", { className: "text-gray-500 font-bold", children: "?" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(ProgressBar, { progress: currentTalent.loyalty, color: "bg-green-500", label: t.talentDossier.loyalty }), _jsx(ProgressBar, { progress: currentTalent.moral, color: "bg-yellow-500", label: t.talentDossier.moral })] }), _jsxs("div", { className: "flex justify-between items-center border-t border-gray-700 pt-3", children: [_jsx("span", { className: "text-gray-400 text-sm", children: t.talentDossier.gage }), _jsx("span", { className: "font-bold text-amber-400 font-mono text-lg", children: formatCurrency(currentTalent.cost) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold font-cinzel text-amber-400 mb-2 uppercase border-b border-gray-700 pb-1", children: t.talentDossier.traits }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: areTraitsVisible ? (currentTalent.traits.length > 0 ? currentTalent.traits.map((tr) => {
                                                        // @ts-ignore
                                                        const traitInfo = t.traits[tr] || { name: tr, isPositive: true };
                                                        return (_jsx("span", { className: `text-xs px-2 py-1 rounded border ${traitInfo.isPositive ? 'bg-blue-900/30 border-blue-700/50 text-blue-300' : 'bg-orange-900/30 border-orange-700/50 text-orange-300'}`, children: traitInfo.name }, tr));
                                                    }) : _jsx("span", { className: "text-gray-500 italic text-xs", children: t.talentDossier.noTraits })) : _jsx("span", { className: "text-gray-500 font-bold", children: "?" }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold font-cinzel text-amber-400 mb-2 uppercase border-b border-gray-700 pb-1", children: t.talentDossier.genrePref }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-start", children: [_jsxs("span", { className: "text-green-400 font-bold w-20 flex-shrink-0", children: [t.talentDossier.favorites, ":"] }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [isFavoriteGenre1Visible && currentTalent.favoriteGenres.length > 0 ? _jsx("span", { className: "text-gray-300", children: t.genres[currentTalent.favoriteGenres[0]] }) : _jsx("span", { className: "text-gray-600", children: "?" }), currentTalent.favoriteGenres.length > 1 && _jsx("span", { className: "text-gray-500", children: ", " }), isFavoriteGenre2Visible && currentTalent.favoriteGenres.length > 1 ? _jsx("span", { className: "text-gray-300", children: t.genres[currentTalent.favoriteGenres[1]] }) : _jsx("span", { className: "text-gray-600", children: "?" })] })] }), _jsxs("div", { className: "flex items-start", children: [_jsxs("span", { className: "text-red-400 font-bold w-20 flex-shrink-0", children: [t.talentDossier.hated, ":"] }), isHatedGenreVisible && currentTalent.hatedGenre ? _jsx("span", { className: "text-gray-300", children: t.genres[currentTalent.hatedGenre] }) : _jsx("span", { className: "text-gray-600", children: "?" })] })] })] })] })] }), _jsx("div", { className: "p-4 bg-gray-900/50 border-t border-gray-700 text-right", children: _jsx("button", { onClick: onClose, className: "bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-sm uppercase tracking-wider transition-colors text-sm", children: t.common.close }) })] }), _jsx("button", { onClick: (e) => { e.stopPropagation(); handleNext(); }, disabled: talentList.length <= 1, className: "p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white", children: _jsx(ArrowRightIcon, { className: "h-8 w-8" }) })] }) }));
};
export default TalentDossierModal;
