
import React, { useState, useMemo, useEffect } from 'react';
import { Director, Actor, TalentTrait, ProjectPhase, BuildingType, EmployeeType, SkillSet, Employee } from '../types';
import StarRating from './StarRating';
import DirectorIcon from './icons/DirectorIcon';
import ActorIcon from './icons/ActorIcon';
import { useGame } from '../contexts/GameContext';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import ContractIcon from './icons/ContractIcon';
import TrainingIcon from './icons/TrainingIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import HandshakeIcon from './icons/HandshakeIcon';
import FavoriteStarIcon from './icons/FavoriteStarIcon';
import ScoutingIcon from './icons/ScoutingIcon';
import TrashIcon from './icons/TrashIcon';
import BonusIcon from './icons/BonusIcon';
import StarIcon from './icons/StarIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import { useTranslation } from '../hooks/useTranslation';

export const getTalentPortraitUrl = (talent: Director | Actor, gameDate: Date): string => {
    if (!talent.portraitUrl) {
        return '';
    }

    // Support for custom uploaded images (Base64 Data URLs)
    if (talent.portraitUrl.startsWith('data:image')) {
        return talent.portraitUrl;
    }
    
    if (!talent.birthDate) {
         return `https://www.schnoxcore.com/media/portraits/${talent.portraitUrl}m.png`; // Fallback default age
    }
    
    const birthDate = new Date(talent.birthDate);
    let age = gameDate.getFullYear() - birthDate.getFullYear();
    const m = gameDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && gameDate.getDate() < birthDate.getDate())) {
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
    
    const baseId = talent.portraitUrl;
    
    return `https://www.schnoxcore.com/media/portraits/${baseId}${ageSuffix}.png`;
};

interface TalentDossierModalProps {
  talent: Director | Actor;
  onClose: () => void;
  talentList: (Director | Actor)[];
  onTalentChange: (newTalent: Director | Actor) => void;
  context?: 'project-selection' | 'dossier';
  onHire?: (talent: Director | Actor, gage: number) => void;
}

// Deterministic shuffle logic for Fog of War
const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const deterministicShuffle = (array: string[], seed: number) => {
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

const ProgressBar: React.FC<{ progress: number, color: string, label: string }> = ({ progress, color, label }) => (
  <div className="w-full">
    <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
        <span className="text-xs font-mono text-white">{Math.round(progress)}/100</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden border border-gray-600">
        <div className={`${color} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

const TalentDossierModal: React.FC<TalentDossierModalProps> = ({ talent, onClose, talentList, onTalentChange }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    if (!playerData) return null;

    const currentTalent = useMemo(() => {
        if (!playerData) return talent;
        if ('speedModifier' in talent) {
            return playerData.directors.find((d: Director) => d.id === talent.id) || talent;
        } else {
            return playerData.actors.find((a: Actor) => a.id === talent.id) || talent;
        }
    }, [playerData, talent]);
    
    const age = useMemo(() => {
        if (!playerData || !currentTalent.birthDate) return '?';
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
        } else {
            jobTitle = isFemale ? "Schauspielerin" : "Schauspieler";
        }
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    
    // --- FOG OF WAR ---
    const discoveryOrder = useMemo(() => {
        const items: Array<'traits' | 'potential' | 'lieblingsgenre1' | 'lieblingsgenre2' | 'hatedGenre'> = ['traits', 'potential', 'lieblingsgenre1', 'lieblingsgenre2', 'hatedGenre'];
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
        if (playerData.activeCasting?.talentId === currentTalent.id) return t.talentDossier.status.casting;
        
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
        
        if (currentTalent.contract?.type === 'exclusive') return t.talentDossier.status.exclusive;
        return t.talentDossier.status.available;
    }, [playerData, currentTalent, t, locale]);

    const isBusy = !!(currentStatusText !== t.talentDossier.status.available && currentStatusText !== t.talentDossier.status.exclusive);

    const updateTalent = (updateFn: (t: Director | Actor) => Director | Actor) => {
        setPlayerData(prev => {
            if (!prev) return null;
            const updated = updateFn(currentTalent);
            if (isDirector) {
                return { ...prev, directors: prev.directors.map(d => d.id === currentTalent.id ? updated as Director : d) };
            } else {
                return { ...prev, actors: prev.actors.map(a => a.id === currentTalent.id ? updated as Actor : a) };
            }
        });
    };

    const handleToggleFavorite = () => updateTalent(t => ({ ...t, isFavorite: !t.isFavorite }));

    // Navigation
    const currentIndex = useMemo(() => talentList.findIndex(t => t.id === talent.id), [talentList, talent]);
    const handlePrev = () => {
        if (talentList.length <= 1) return;
        const prevIndex = (currentIndex - 1 + talentList.length) % talentList.length;
        onTalentChange(talentList[prevIndex]);
    };
    const handleNext = () => {
        if (talentList.length <= 1) return;
        const nextIndex = (currentIndex + 1) % talentList.length;
        onTalentChange(talentList[nextIndex]);
    };

    return (
    <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        
        <div className="flex items-center gap-4 w-full max-w-3xl">
            <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                disabled={talentList.length <= 1}
                className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white"
            >
                <ArrowLeftIcon className="h-8 w-8" />
            </button>

            <div className="relative bg-gray-800 border border-amber-500 rounded-lg shadow-2xl flex-grow overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
                
                {/* Header / Portrait Section */}
                <div className="bg-gray-900/50 p-6 border-b border-gray-700 flex items-center gap-6 relative">
                     <button 
                        onClick={handleToggleFavorite} 
                        className={`absolute top-4 right-4 p-1 rounded-full transition-colors z-20`}
                    >
                        <FavoriteStarIcon isFavorite={!!currentTalent.isFavorite} className={`h-8 w-8 ${currentTalent.isFavorite ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300`} />
                    </button>

                    <div className="w-32 h-32 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-gray-600 overflow-hidden shadow-lg relative">
                         {finalPortraitUrl ? (
                            <img src={finalPortraitUrl} alt={currentTalent.name} className={`w-full h-full object-cover ${isBusy ? 'grayscale' : ''}`} draggable="false" />
                        ) : (
                            isDirector ? <DirectorIcon className="w-16 h-16 text-gray-400" /> : <ActorIcon className="w-16 h-16 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400">{currentTalent.name}</h2>
                        <p className="text-gray-400 text-lg font-semibold">{jobTitle} <span className="text-sm text-gray-500 ml-2">({age} {t.talentDossier.years})</span></p>
                         <p className={`text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded border ${isBusy ? 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20' : 'text-green-400 border-green-500/50 bg-green-900/20'}`}>{currentStatusText}</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column: Stats */}
                    <div className="space-y-4">
                         <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm font-bold uppercase">{t.talentDossier.fame}</span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <StarIcon key={star} className={`w-4 h-4 ${star <= currentTalent.bekanntheit ? 'text-yellow-400' : 'text-gray-700'}`} />
                                    ))}
                                </div>
                             </div>
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm font-bold uppercase">{t.talentDossier.skill}</span>
                                {isSkillVisible ? <StarRating rating={currentTalent.skill} /> : <span className="text-gray-500 font-bold">?</span>}
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm font-bold uppercase">{t.talentDossier.potential}</span>
                                {isPotentialVisible ? <StarRating rating={currentTalent.potential} showValue={false} /> : <span className="text-gray-500 font-bold">?</span>}
                             </div>
                         </div>

                         <div className="space-y-2">
                             <ProgressBar progress={currentTalent.loyalty} color="bg-green-500" label={t.talentDossier.loyalty} />
                             <ProgressBar progress={currentTalent.moral} color="bg-yellow-500" label={t.talentDossier.moral} />
                         </div>

                        <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                            <span className="text-gray-400 text-sm">{t.talentDossier.gage}</span>
                            <span className="font-bold text-amber-400 font-mono text-lg">{formatCurrency(currentTalent.cost)}</span>
                        </div>
                    </div>

                    {/* Right Column: Traits & Genres */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-bold font-cinzel text-amber-400 mb-2 uppercase border-b border-gray-700 pb-1">{t.talentDossier.traits}</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {areTraitsVisible ? (
                                    currentTalent.traits.length > 0 ? currentTalent.traits.map((tr: string) => {
                                        // @ts-ignore
                                        const traitInfo = t.traits[tr] || { name: tr, isPositive: true };
                                        return (
                                            <span key={tr} className={`text-xs px-2 py-1 rounded border ${traitInfo.isPositive ? 'bg-blue-900/30 border-blue-700/50 text-blue-300' : 'bg-orange-900/30 border-orange-700/50 text-orange-300'}`}>
                                                {traitInfo.name}
                                            </span>
                                        )
                                    }) : <span className="text-gray-500 italic text-xs">{t.talentDossier.noTraits}</span>
                                ) : <span className="text-gray-500 font-bold">?</span>}
                            </div>
                        </div>

                         <div>
                            <h3 className="text-sm font-bold font-cinzel text-amber-400 mb-2 uppercase border-b border-gray-700 pb-1">{t.talentDossier.genrePref}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start">
                                    <span className="text-green-400 font-bold w-20 flex-shrink-0">{t.talentDossier.favorites}:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {isFavoriteGenre1Visible && currentTalent.favoriteGenres.length > 0 ? <span className="text-gray-300">{t.genres[currentTalent.favoriteGenres[0]]}</span> : <span className="text-gray-600">?</span>}
                                        {currentTalent.favoriteGenres.length > 1 && <span className="text-gray-500">, </span>}
                                        {isFavoriteGenre2Visible && currentTalent.favoriteGenres.length > 1 ? <span className="text-gray-300">{t.genres[currentTalent.favoriteGenres[1]]}</span> : <span className="text-gray-600">?</span>}
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-red-400 font-bold w-20 flex-shrink-0">{t.talentDossier.hated}:</span>
                                    {isHatedGenreVisible && currentTalent.hatedGenre ? <span className="text-gray-300">{t.genres[currentTalent.hatedGenre]}</span> : <span className="text-gray-600">?</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-right">
                     <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-sm uppercase tracking-wider transition-colors text-sm">
                        {t.common.close}
                    </button>
                </div>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                disabled={talentList.length <= 1}
                className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white"
            >
                <ArrowRightIcon className="h-8 w-8" />
            </button>
        </div>
    </div>
  );
};

export default TalentDossierModal;
