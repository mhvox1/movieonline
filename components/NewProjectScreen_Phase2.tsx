
import React, { useState, useMemo, useEffect } from 'react';
import { GameState, GameSpeed, Director, Actor, ProjectPhase, ProjectData, TalentTrait, RoleCasting, ActorAge, CastingOption, EmployeeType, SkillSet, Script, CastingTalentPreference, ProjectCastingPreferences, TalentAgePreference, TalentGenderPreference, TalentQualityPreference } from '../types';
import StarRating from './StarRating';
import { useGame } from '../contexts/GameContext';
import TalentDossierModal, { getTalentPortraitUrl } from './TalentDossierModal';
import StarIcon from './icons/StarIcon';
import CircularStatusIndicator from './CircularStatusIndicator';
import InfoIcon from './icons/InfoIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import { CASTING_OPTIONS } from './constants';
import { useTranslation } from '../hooks/useTranslation';
import { TranslationType } from '../translations/types';

interface NewProjectScreenPhase2Props {
  setGameState: (state: GameState) => void;
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  project: ProjectData;
}

const PLAYER_TALENT_ID = -1;
const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

const getAgeLabel = (age: ActorAge, t: TranslationType) => {
    switch (age) {
        case ActorAge.Child: return t.actorAge.child;
        case ActorAge.Young: return t.actorAge.young;
        case ActorAge.MiddleAged: return t.actorAge.middleAged;
        case ActorAge.Old: return t.actorAge.old;
        default: return age;
    }
};

const DEFAULT_CASTING_PREFERENCE: CastingTalentPreference = {
    gender: 'any',
    age: 'any',
    quality: 'any',
};

const createPreferenceFromRole = (role?: RoleCasting): CastingTalentPreference => ({
    gender: role?.gender ?? 'any',
    age: role?.age ?? 'any',
    quality: 'any',
});

const createCastingPreferences = (project: ProjectData, script?: Script | null): ProjectCastingPreferences => ({
    director: {
        ...DEFAULT_CASTING_PREFERENCE,
        ...project.castingPreferences?.director,
    },
    mainActor: {
        ...createPreferenceFromRole(project.mainRole || script?.mainRole),
        ...project.castingPreferences?.mainActor,
    },
    supportingActor: {
        ...createPreferenceFromRole(project.supportingRole || script?.supportingRole),
        ...project.castingPreferences?.supportingActor,
    },
});

const getGenderPreferenceLabel = (gender: TalentGenderPreference, t: TranslationType) => {
    if (gender === 'any') return t.project.casting.any;
    return gender === 'männlich' ? t.newGame.male : t.newGame.female;
};

const getAgePreferenceLabel = (age: TalentAgePreference, t: TranslationType) => {
    if (age === 'any') return t.project.casting.any;
    return getAgeLabel(age, t);
};

const getQualityPreferenceLabel = (quality: TalentQualityPreference, t: TranslationType) => {
    switch (quality) {
        case 'low': return t.project.casting.qualityLow;
        case 'medium': return t.project.casting.qualityMedium;
        case 'high': return t.project.casting.qualityHigh;
        case 'top': return t.project.casting.qualityTop;
        default: return t.project.casting.any;
    }
};

const getAllowedQualityPreferences = (castingLevel: number): TalentQualityPreference[] => {
    switch (castingLevel) {
        case 1:
            return ['low'];
        case 2:
            return ['low', 'medium'];
        case 3:
        default:
            return ['low', 'medium', 'high', 'top'];
    }
};

const normalizeQualityPreference = (
    quality: TalentQualityPreference,
    allowedQualities: TalentQualityPreference[]
): TalentQualityPreference => {
    if (quality === 'any') return allowedQualities[allowedQualities.length - 1] || 'low';
    if (allowedQualities.includes(quality)) return quality;
    return allowedQualities[allowedQualities.length - 1] || 'low';
};

const RoleDisplay: React.FC<{ role: RoleCasting, title: string, translation: any }> = ({ role, title, translation }) => (
    <div className="bg-gray-900/50 p-2 rounded-md text-center">
        <h4 className="font-bold text-amber-300 text-sm">{title}</h4>
        <p className="text-xs text-gray-300">{role.gender === 'männlich' ? translation.newGame.male : translation.newGame.female}</p>
        <p className="text-[10px] text-gray-400">{getAgeLabel(role.age, translation)}</p>
    </div>
);

const CastingPreferenceCard: React.FC<{
    title: string;
    preference: CastingTalentPreference;
    recommendation?: RoleCasting;
    allowChildAge?: boolean;
    allowedQualities: TalentQualityPreference[];
    onChange: (preference: CastingTalentPreference) => void;
}> = ({ title, preference, recommendation, allowChildAge = true, allowedQualities, onChange }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h4 className="font-bold text-amber-300 text-sm">{title}</h4>
                    <p className="text-[10px] text-gray-500">
                        {recommendation
                            ? `${t.project.casting.scriptSuggestion}: ${getGenderPreferenceLabel(recommendation.gender, t)}, ${getAgePreferenceLabel(recommendation.age, t)}`
                            : t.project.casting.noScriptSuggestion}
                    </p>
                </div>
                {recommendation && (
                    <button
                        type="button"
                        onClick={() => onChange({ ...preference, gender: recommendation.gender, age: recommendation.age })}
                        className="text-[10px] font-bold uppercase tracking-wide text-amber-300 hover:text-amber-200"
                    >
                        {t.project.casting.applySuggestion}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <label className="text-[10px] text-gray-400">
                    <span className="block mb-1">{t.project.casting.gender}</span>
                    <select
                        value={preference.gender}
                        onChange={(e) => onChange({ ...preference, gender: e.target.value as TalentGenderPreference })}
                        className="w-full bg-gray-950 border border-gray-600 rounded-md p-1.5 text-white text-xs"
                    >
                        <option value="any">{t.project.casting.any}</option>
                        <option value="männlich">{t.newGame.male}</option>
                        <option value="weiblich">{t.newGame.female}</option>
                    </select>
                </label>

                <label className="text-[10px] text-gray-400">
                    <span className="block mb-1">{t.project.casting.age}</span>
                    <select
                        value={preference.age}
                        onChange={(e) => onChange({ ...preference, age: e.target.value as TalentAgePreference })}
                        className="w-full bg-gray-950 border border-gray-600 rounded-md p-1.5 text-white text-xs"
                    >
                        <option value="any">{t.project.casting.any}</option>
                        {allowChildAge && <option value={ActorAge.Child}>{getAgeLabel(ActorAge.Child, t)}</option>}
                        <option value={ActorAge.Young}>{getAgeLabel(ActorAge.Young, t)}</option>
                        <option value={ActorAge.MiddleAged}>{getAgeLabel(ActorAge.MiddleAged, t)}</option>
                        <option value={ActorAge.Old}>{getAgeLabel(ActorAge.Old, t)}</option>
                    </select>
                </label>

                <label className="text-[10px] text-gray-400">
                    <span className="block mb-1">{t.project.casting.quality}</span>
                    <select
                        value={preference.quality}
                        onChange={(e) => onChange({ ...preference, quality: e.target.value as TalentQualityPreference })}
                        className="w-full bg-gray-950 border border-gray-600 rounded-md p-1.5 text-white text-xs"
                    >
                        {allowedQualities.map((quality) => (
                            <option key={quality} value={quality}>{getQualityPreferenceLabel(quality, t)}</option>
                        ))}
                    </select>
                </label>
            </div>

            <p className="text-[10px] text-gray-500">
                {t.project.casting.currentPreference}: {getGenderPreferenceLabel(preference.gender, t)}, {getAgePreferenceLabel(preference.age, t)}, {getQualityPreferenceLabel(preference.quality, t)}
            </p>
        </div>
    );
};

const CastingSetupView: React.FC<{ 
    onStartCasting: (level: number, knownTalentIds: number[], preferences: ProjectCastingPreferences, casterId?: number) => void, 
    onBack: () => void, 
    project: ProjectData,
    setSelectedTalentInfo: (talent: Actor | Director) => void,
    onCancel: () => void
}> = ({ onStartCasting, onBack, project, setSelectedTalentInfo, onCancel }) => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [selectedKnownDirectors, setSelectedKnownDirectors] = useState<number[]>([]);
    const [selectedKnownActors, setSelectedKnownActors] = useState<number[]>([]);
    const [knownTalentFilter, setKnownTalentFilter] = useState<'all' | 'favorites'>('all');
    const [knownTalentType, setKnownTalentType] = useState<'directors' | 'actors'>('directors');
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);
    const [selectedCasterId, setSelectedCasterId] = useState<number | undefined>();
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const castingMitarbeiter = useMemo(() => {
        if (!playerData) return [];
        return playerData.employees.filter(e => e.type === EmployeeType.CastingMitarbeiter);
    }, [playerData]);

    const selectedOption = CASTING_OPTIONS.find(opt => opt.level === selectedLevel)!;

    // Fallback to script data if roles are missing in project
    const script = useMemo(() => {
        if (!playerData || !project.scriptId) return null;
        return playerData.availableScripts.find(s => s.id === project.scriptId);
    }, [playerData, project.scriptId]);

    const [castingPreferences, setCastingPreferences] = useState<ProjectCastingPreferences>(() => createCastingPreferences(project, script));

    const mainRole = project.mainRole || script?.mainRole;
    const supportingRole = project.supportingRole || script?.supportingRole;


    if (!playerData) return null;

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const canAfford = playerData.capital >= selectedOption.cost;
    const allowedQualityPreferences = useMemo(() => getAllowedQualityPreferences(selectedLevel), [selectedLevel]);

    const talentSelectionLimit = useMemo(() => {
        // Map level to limit
        if (selectedLevel === 1) return 4;
        if (selectedLevel === 2) return 7;
        if (selectedLevel === 3) return 10;
        return 0;
    }, [selectedLevel]);

    const handleToggleKnownDirector = (directorId: number) => {
        setSelectedKnownDirectors(prev => {
            if (prev.includes(directorId)) {
                return prev.filter(id => id !== directorId);
            }
            if (prev.length + selectedKnownActors.length < talentSelectionLimit) {
                return [...prev, directorId];
            }
            return prev;
        });
    };

    const handleToggleKnownActor = (actorId: number) => {
        setSelectedKnownActors(prev => {
            if (prev.includes(actorId)) {
                return prev.filter(id => id !== actorId);
            }
            if (prev.length + selectedKnownDirectors.length < talentSelectionLimit) {
                return [...prev, actorId];
            }
            return prev;
        });
    };
    
    const hasMinimumSkipSelection = selectedKnownDirectors.length > 0 && selectedKnownActors.length > 0;

    // Guard remains for safety in case this is triggered programmatically.
    const handleSkipButtonClick = () => {
        if (!hasMinimumSkipSelection) return;
        setShowSkipConfirm(true);
    };

    const handleSkipCasting = () => {
        setPlayerData(prev => {
            if (!prev) return null;
            
            // Update the specific project in activeProjects
            const updatedProjects = prev.activeProjects.map(p => 
                p.workingTitle === project.workingTitle 
                ? {
                    ...p,
                    phase: ProjectPhase.CastingFinished,
                    castingCost: 0,
                    castingStartDate: new Date(prev.gameDate),
                    castingEndDate: new Date(prev.gameDate),
                    castingInvitedActors: [...selectedKnownDirectors, ...selectedKnownActors],
                    castingDirectorPool: [], 
                    castingActorPool: []     
                } 
                : p
            );

            return {
                ...prev,
                activeProjects: updatedProjects
            };
        });
        setShowSkipConfirm(false);
    };
    
    useEffect(() => {
        const totalSelected = selectedKnownDirectors.length + selectedKnownActors.length;
        if (totalSelected > talentSelectionLimit) {
            let excess = totalSelected - talentSelectionLimit;
            if (selectedKnownActors.length > 0) {
                const actorTrim = Math.min(excess, selectedKnownActors.length);
                excess -= actorTrim;
                setSelectedKnownActors(prev => prev.slice(0, prev.length - actorTrim));
            }
            if (excess > 0 && selectedKnownDirectors.length > 0) {
                setSelectedKnownDirectors(prev => prev.slice(0, prev.length - excess));
            }
        }
    }, [talentSelectionLimit, selectedKnownDirectors.length, selectedKnownActors.length]);

    useEffect(() => {
        setCastingPreferences(prev => ({
            director: {
                ...prev.director,
                quality: normalizeQualityPreference(prev.director.quality, allowedQualityPreferences),
            },
            mainActor: {
                ...prev.mainActor,
                quality: normalizeQualityPreference(prev.mainActor.quality, allowedQualityPreferences),
            },
            supportingActor: {
                ...prev.supportingActor,
                quality: normalizeQualityPreference(prev.supportingActor.quality, allowedQualityPreferences),
            },
        }));
    }, [allowedQualityPreferences]);

    // Construct Family Members as pseudo-talents
    const familyDirectors = useMemo<Director[]>(() => {
        const directors: Director[] = [];
        
        // Partner: Must be employed as Director
        if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === 'Director') {
            const skill = playerData.partnerSkills.directing;
            directors.push({
                id: 99901, // Special ID range for family
                name: `${playerData.partnerName} (Partner)`,
                gender: playerData.partnerGender || 'weiblich',
                birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
                skill: skill,
                cost: 0,
                bekanntheit: 5, 
                speedModifier: 1.0,
                favoriteGenres: [],
                hatedGenre: '' as any,
                traits: [],
                experience: 0,
                potential: Math.min(100, skill + 20),
                loyalty: 100,
                moral: 100,
                isDiscovered: true,
                portraitUrl: playerData.partnerPortraitId,
                isFamily: true
            });
        }
        
        // Children: Must be 18+ AND employed as Director
        playerData.children.forEach((child, index) => {
             const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
             
             if (age >= 18 && child.isEmployed && child.employedAs === 'Director' && child.skills) {
                 directors.push({
                    id: 99910 + index,
                    name: `${child.name} (Kind)`,
                    gender: child.gender === 'Mädchen' ? 'weiblich' : 'männlich',
                    birthDate: child.birthDate,
                    skill: child.skills.directing,
                    cost: 0,
                    bekanntheit: 5,
                    speedModifier: 1.0,
                    favoriteGenres: [],
                    hatedGenre: '' as any,
                    traits: [],
                    experience: 0,
                    potential: Math.min(100, child.skills.directing + 30),
                    loyalty: 100,
                    moral: 100,
                    isDiscovered: true,
                    portraitUrl: child.portraitId,
                    isFamily: true
                 });
             }
        });
        
        return directors;
    }, [playerData]);

    const familyActors = useMemo<Actor[]>(() => {
        const actors: Actor[] = [];

        // Partner: Must be employed as Actor
        if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === 'Actor') {
            const skill = playerData.partnerSkills.acting;
            actors.push({
                id: 99901, 
                name: `${playerData.partnerName} (Partner)`,
                gender: playerData.partnerGender || 'weiblich',
                birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
                skill: skill,
                cost: 0,
                bekanntheit: 5, 
                favoriteGenres: [],
                hatedGenre: '' as any,
                traits: [],
                experience: 0,
                potential: Math.min(100, skill + 20),
                loyalty: 100,
                moral: 100,
                isDiscovered: true,
                portraitUrl: playerData.partnerPortraitId,
                isFamily: true
            });
        }
        
        // Children: 12-17 (Available), 18+ (Must be employed as Actor)
        playerData.children.forEach((child, index) => {
             const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
             
             const isChildActor = age >= 12 && age < 18;
             const isAdultEmployedActor = age >= 18 && child.isEmployed && child.employedAs === 'Actor';

             if ((isChildActor || isAdultEmployedActor) && child.skills) {
                 actors.push({
                    id: 99910 + index,
                    name: `${child.name} (Kind)`,
                    gender: child.gender === 'Mädchen' ? 'weiblich' : 'männlich',
                    birthDate: child.birthDate,
                    skill: child.skills.acting,
                    cost: 0,
                    bekanntheit: 5,
                    favoriteGenres: [],
                    hatedGenre: '' as any,
                    traits: [],
                    experience: 0,
                    potential: Math.min(100, child.skills.acting + 30),
                    loyalty: 100,
                    moral: 100,
                    isDiscovered: true,
                    portraitUrl: child.portraitId,
                    isFamily: true
                 });
             }
        });
        
        return actors;
    }, [playerData]);


    const availableDirectors = useMemo(() => {
        const regularDirectors = playerData.directors
            .filter(d => 
                d.isDiscovered && 
                (knownTalentFilter === 'all' || d.isFavorite || d.contract?.type === 'exclusive')
            );
        
        const combined = [...familyDirectors, ...regularDirectors];

        return combined.filter(d => {
            const isUnavailable = d.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(d.unavailableForProjectsUntil);
            const isInTraining = !!d.activeTraining;
            
            // Check if busy in ANY other project (Casting invite or Production)
            const isBusyInOtherProject = playerData.activeProjects.some(p => {
                // Ignore current project
                if (p.workingTitle === project.workingTitle) return false;
                
                // 1. Locked in Casting Phase (Invited)
                if (p.phase === ProjectPhase.Casting || p.phase === ProjectPhase.CastingFinished) {
                    return p.castingInvitedActors?.includes(d.id);
                }
                
                // 2. Locked in Production (Shooting)
                // Note: PostProduction technically means shooting is over, so talents become available again
                if (p.phase === ProjectPhase.ProductionSetup || p.phase === ProjectPhase.Production) {
                    return p.directorId === d.id;
                }
                
                return false;
            });
            
            return !isUnavailable && !isInTraining && !isBusyInOtherProject;
        }).sort((a,b) => b.skill - a.skill);
    }, [playerData.directors, knownTalentFilter, familyDirectors, playerData.gameDate, playerData.activeProjects, project.workingTitle]);

    const availableActors = useMemo(() => {
        const regularActors = playerData.actors
            .filter(a => 
                a.isDiscovered && 
                (knownTalentFilter === 'all' || a.isFavorite || a.contract?.type === 'exclusive')
            );
            
        const combined = [...familyActors, ...regularActors];

        return combined.filter(a => {
            const isUnavailable = a.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(a.unavailableForProjectsUntil);
            const isInTraining = !!a.activeTraining;
            
             // Check if busy in ANY other project (Casting invite or Production)
             const isBusyInOtherProject = playerData.activeProjects.some(p => {
                // Ignore current project
                if (p.workingTitle === project.workingTitle) return false;
                
                // 1. Locked in Casting Phase (Invited)
                if (p.phase === ProjectPhase.Casting || p.phase === ProjectPhase.CastingFinished) {
                    return p.castingInvitedActors?.includes(a.id);
                }
                
                // 2. Locked in Production (Shooting)
                if (p.phase === ProjectPhase.ProductionSetup || p.phase === ProjectPhase.Production) {
                    return p.mainActorId === a.id || p.supportingActorId === a.id;
                }
                
                return false;
            });
            
            return !isUnavailable && !isInTraining && !isBusyInOtherProject;
        }).sort((a,b) => b.skill - a.skill);
    }, [playerData.actors, knownTalentFilter, familyActors, playerData.gameDate, playerData.activeProjects, project.workingTitle]);

    const availableTalents = useMemo(() => {
        if (knownTalentType === 'directors') {
            return availableDirectors.map(director => ({ talent: director, type: 'director' as const }));
        }
        return availableActors.map(actor => ({ talent: actor, type: 'actor' as const }));
    }, [availableActors, availableDirectors, knownTalentType]);

    const selectedCastingOption = CASTING_OPTIONS.find(option => option.level === selectedLevel)!;
    const translatedSelectedOption = t.productionOptions.casting[`level${selectedCastingOption.level}` as keyof typeof t.productionOptions.casting];
    
    const totalSelected = selectedKnownDirectors.length + selectedKnownActors.length;

    return (
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-2xl w-full max-w-6xl border border-gray-700 flex flex-col min-h-[640px]">
            <h2 className="text-2xl font-bold font-cinzel text-amber-400 text-center mb-3">{t.project.casting.setupTitle}</h2>
            <div className="grid grid-cols-3 gap-4 flex-grow">
                {/* Left Column - Talents */}
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex flex-col h-[480px]">
                    <h3 className="text-base font-cinzel text-amber-400 mb-2">{t.project.casting.inviteTalent}</h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <select value={knownTalentType} onChange={(e) => setKnownTalentType(e.target.value as 'directors' | 'actors')} className="bg-gray-900 border border-gray-600 rounded-md p-1 text-white text-xs">
                            <option value="directors">{t.project.casting.directors}</option>
                            <option value="actors">{t.project.casting.actors}</option>
                        </select>
                        <select value={knownTalentFilter} onChange={(e) => setKnownTalentFilter(e.target.value as 'all' | 'favorites')} className="bg-gray-900 border border-gray-600 rounded-md p-1 text-white text-xs">
                            <option value="all">{t.project.casting.filterAll}</option>
                            <option value="favorites">{t.project.casting.filterFavorites}</option>
                        </select>
                    </div>
                    <div className="space-y-1 overflow-y-auto pr-1 flex-grow">
                        {availableTalents.map(({ talent, type }) => {
                            const isDirector = type === 'director';
                            const isSelected = isDirector ? selectedKnownDirectors.includes(talent.id) : selectedKnownActors.includes(talent.id);
                            const isDisabled = !isSelected && totalSelected >= talentSelectionLimit;
                            const age = Math.max(0, Math.floor((new Date(playerData.gameDate).getTime() - new Date(talent.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)));
                            const isFamily = !!talent.isFamily;
                            const isExclusive = talent.contract?.type === 'exclusive';

                            let containerClass = 'border-gray-700';
                            if (isSelected) containerClass = 'border-amber-500/50 bg-amber-900/30';
                            else if (isFamily) containerClass = 'border-purple-500/30 bg-purple-900/10';
                            else if (isExclusive) containerClass = 'border-green-500/50 bg-green-900/10';

                            return (
                                <div key={`${type}-${talent.id}`} className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${containerClass} ${isDisabled ? 'opacity-50' : ''}`}>
                                    <button 
                                        onClick={() => !isFamily && setSelectedTalentInfo(talent)} 
                                        className={`flex-grow flex items-center gap-2 text-left group disabled:cursor-not-allowed ${isFamily ? 'cursor-default' : 'cursor-pointer'}`} 
                                        disabled={isDisabled}
                                    >
                                        <CircularStatusIndicator portraitUrl={getTalentPortraitUrl(talent, playerData.gameDate)} loyalty={talent.loyalty} moral={talent.moral} size={36} isDirector={isDirector} />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <p className={`font-bold truncate text-sm ${isFamily ? 'text-purple-300' : isExclusive ? 'text-green-300' : 'text-white group-hover:text-amber-300'}`} title={`${talent.name}, ${age} ${t.talentDossier.years}`}>{talent.name}, {age}</p>
                                                <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
                                                    <StarIcon className="w-2.5 h-2.5"/>
                                                    <span className="font-bold">{talent.bekanntheit}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <StarRating rating={talent.skill} isRevealed={talent.bekanntheit >= 1} size="sm"/>
                                                <span className="text-[10px] text-gray-500 uppercase">{isDirector ? t.project.casting.director : t.project.casting.actor}</span>
                                            </div>
                                        </div>
                                    </button>
                                    <input type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => isDirector ? handleToggleKnownDirector(talent.id) : handleToggleKnownActor(talent.id)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Center Column - Suggestions and Preferences */}
                <div className="space-y-2">
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                        <h3 className="text-base font-cinzel text-center text-amber-400 mb-2">{t.project.casting.suggestions}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {mainRole ? <RoleDisplay role={mainRole} title={t.project.casting.mainActor} translation={t} /> : <div className="text-gray-500 text-xs text-center col-span-2 bg-gray-800/50 p-1.5 rounded">{t.project.casting.noSuggestions}</div>}
                            {supportingRole && <RoleDisplay role={supportingRole} title={t.project.casting.supportingActor} translation={t} />}
                        </div>
                    </div>

                    <div className="my-2 bg-gray-900 p-3 rounded-lg border border-gray-600">
                        <h3 className="text-base font-cinzel text-center text-amber-400 mb-1">{t.project.casting.preferencesTitle}</h3>
                        <p className="text-[10px] text-center text-gray-500 mb-3">{t.project.casting.preferencesSubtitle}</p>
                        <div className="space-y-2">
                            <CastingPreferenceCard
                                title={t.project.casting.director}
                                preference={castingPreferences.director}
                                allowChildAge={false}
                                allowedQualities={allowedQualityPreferences}
                                onChange={(preference) => setCastingPreferences(prev => ({ ...prev, director: preference }))}
                            />
                            <CastingPreferenceCard
                                title={t.project.casting.mainActor}
                                preference={castingPreferences.mainActor}
                                recommendation={mainRole}
                                allowedQualities={allowedQualityPreferences}
                                onChange={(preference) => setCastingPreferences(prev => ({ ...prev, mainActor: preference }))}
                            />
                            <CastingPreferenceCard
                                title={t.project.casting.supportingActor}
                                preference={castingPreferences.supportingActor}
                                recommendation={supportingRole}
                                allowedQualities={allowedQualityPreferences}
                                onChange={(preference) => setCastingPreferences(prev => ({ ...prev, supportingActor: preference }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Controls */}
                <div className="space-y-2 flex flex-col min-h-[480px]">
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                        <label htmlFor="caster-select" className="block text-xs font-medium text-gray-300 mb-1">{t.project.casting.assignCaster}</label>
                        <select
                            id="caster-select"
                            value={selectedCasterId ?? ''}
                            onChange={(e) => setSelectedCasterId(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-white text-sm"
                            disabled={castingMitarbeiter.length === 0}
                        >
                            <option value="">{t.project.casting.noStaff}</option>
                            {castingMitarbeiter.map(caster => (
                                <option key={caster.id} value={caster.id}>{caster.name} ({t.talentDossier.skill}: {caster.talent})</option>
                            ))}
                        </select>
                        {castingMitarbeiter.length === 0 && <p className="text-[10px] text-gray-500 mt-1">{t.project.casting.noStaffAvailable}</p>}
                    </div>

                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                        <label htmlFor="casting-level-select" className="block text-xs font-medium text-gray-300 mb-1">{t.project.casting.castingMethod}</label>
                        <select
                            id="casting-level-select"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(Number(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-white text-sm"
                        >
                            {CASTING_OPTIONS.map(option => {
                                const translatedOption = t.productionOptions.casting[`level${option.level}` as keyof typeof t.productionOptions.casting];
                                return <option key={option.level} value={option.level}>{translatedOption?.name || option.name}</option>;
                            })}
                        </select>
                        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2">
                            <h4 className="font-bold text-sm text-white">{translatedSelectedOption?.name || selectedCastingOption.name}</h4>
                            <p className="text-[10px] text-gray-400 leading-tight mt-1">{translatedSelectedOption?.desc || selectedCastingOption.description}</p>
                            <div className="flex justify-between text-[10px] mt-2">
                                <span>{t.project.casting.cost} {formatCurrency(selectedCastingOption.cost)}</span>
                                <span>{t.project.casting.duration} {isTestMode ? 5 : selectedCastingOption.duration} {t.project.casting.days}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs font-semibold text-center mt-2">{t.project.casting.totalInvites}: <span className={totalSelected >= talentSelectionLimit ? 'text-red-400' : 'text-green-400'}>{totalSelected} / {talentSelectionLimit}</span></p>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-600 flex justify-end">
                <div className="w-full max-w-md mr-[50px] space-y-2">
                    {!hasMinimumSkipSelection && (
                        <p className="text-red-400 text-[10px] text-right">
                            {t.project.casting.skipErrorNotEnough}
                        </p>
                    )}
                    {!canAfford && <p className="text-red-400 text-[10px] text-right">{t.project.casting.insufficientFunds}</p>}
                    <div className="flex items-center justify-between gap-2">
                        <button 
                            onClick={() => setShowDiscardConfirm(true)} 
                            className="min-w-[150px] bg-red-800/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-sm uppercase tracking-wider text-[10px] whitespace-nowrap transition-colors"
                        >
                            {t.project.progress.discard}
                        </button>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleSkipButtonClick} 
                                disabled={!hasMinimumSkipSelection}
                                className="min-w-[150px] bg-amber-700/80 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-sm uppercase tracking-wider text-[10px] whitespace-nowrap border border-amber-600 disabled:bg-gray-700 disabled:text-gray-400 disabled:border-gray-600 disabled:cursor-not-allowed"
                            >
                                {t.project.casting.skipCasting}
                            </button>
                            <button onClick={() => setShowStartConfirm(true)} disabled={!canAfford} className="min-w-[150px] bg-green-600 text-white font-bold py-2 px-4 rounded-sm uppercase tracking-wider text-xs whitespace-nowrap hover:bg-green-500 disabled:bg-gray-600">
                                {t.project.casting.startCasting}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {showStartConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.casting.confirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">
                           {t.project.casting.confirmText}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowStartConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button 
                                onClick={() => {
                                    onStartCasting(selectedLevel, [...selectedKnownDirectors, ...selectedKnownActors], castingPreferences, selectedCasterId);
                                    setShowStartConfirm(false);
                                }} 
                                className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all"
                            >
                                {t.project.casting.startCasting}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showSkipConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-600 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center border-2">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-500 mb-4">{t.project.casting.skipConfirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">
                           {t.project.casting.skipConfirmText}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowSkipConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button 
                                onClick={handleSkipCasting} 
                                className="bg-amber-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-500 transition-all"
                            >
                                {t.common.yes}
                            </button>
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
                            <button onClick={onCancel} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.project.progress.discardConfirmYes}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TalentListItem: React.FC<{
  talent: Director | Actor;
  isSelected: boolean;
  onSelect: () => void;
  onShowInfo: () => void;
  isDisabled?: boolean;
  disabledTooltip?: string;
  type: 'director' | 'main_actor' | 'supporting_actor';
  gameDate: Date;
  isNew: boolean;
  costModifier?: number; // Optional modifier for display
}> = ({ talent, isSelected, onSelect, onShowInfo, isDisabled, disabledTooltip, type, gameDate, isNew, costModifier = 1.0 }) => {
  const hasExclusiveContract = talent.contract?.type === 'exclusive';
  const isPlayer = talent.id === PLAYER_TALENT_ID;
  const isFamily = !!talent.isFamily;
  const { t } = useTranslation();

  let containerClasses = 'flex items-center gap-2 p-1.5 rounded-md transition-colors';
  
  if (isDisabled) {
    containerClasses += ' bg-red-900/50 ring-1 ring-red-700 opacity-70 cursor-not-allowed';
  } else if (isSelected) {
    containerClasses += ' bg-amber-800/30 ring-1 ring-amber-600';
  } else if (hasExclusiveContract) {
    containerClasses += ' bg-green-900/50 ring-1 ring-green-700';
  } else if (isFamily) {
    containerClasses += ' bg-purple-900/50 ring-1 ring-purple-700';
  } else {
    containerClasses += ' bg-gray-900/50';
  }
  
  const displayCost = talent.cost * costModifier;

  const costDisplay = isPlayer || hasExclusiveContract || isFamily
    ? <span className="font-bold text-green-400">Kostenlos</span>
    : <span className="font-bold text-amber-400">{formatCurrency(displayCost)}</span>;

  const portraitUrl = getTalentPortraitUrl(talent, gameDate);
    const age = Math.max(0, Math.floor((new Date(gameDate).getTime() - new Date(talent.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25)));

  return (
    <div className={containerClasses} title={isDisabled ? disabledTooltip : ''}>
        <button 
            onClick={() => !isFamily && onShowInfo()}
            disabled={isDisabled}
            className={`flex-grow bg-transparent p-0 text-left flex items-center gap-2 w-full disabled:cursor-not-allowed group ${isFamily ? 'cursor-default' : 'cursor-pointer'}`}
        >
            <CircularStatusIndicator
                portraitUrl={portraitUrl}
                loyalty={talent.loyalty}
                moral={talent.moral}
                size={36}
                isDirector={'speedModifier' in talent}
                isBusy={isDisabled}
            />
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline">
                    <p className={`font-bold truncate text-sm ${isFamily ? 'text-purple-300' : hasExclusiveContract ? 'text-green-300' : 'text-white group-hover:text-amber-300 transition-colors'}`} title={`${talent.name}, ${age} ${t.talentDossier.years}`}>{talent.name}, {age}</p>
                    <div className="flex items-center gap-0.5 text-[10px] text-amber-400" title={`Bekanntheit: ${talent.bekanntheit}`}>
                        <StarIcon className="w-2.5 h-2.5"/>
                        <span className="font-bold text-sm">{talent.bekanntheit}</span>
                        {isNew && <span className="ml-1 text-green-400 font-bold text-[9px]">{t.common.new}</span>}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                    <StarRating rating={talent.skill} isRevealed={talent.bekanntheit >= 1} size="sm" />
                    <div className="text-[10px]">
                        {costDisplay}
                    </div>
                </div>
            </div>
        </button>
        <div className="flex-shrink-0 pr-1">
            <input 
                type="radio" 
                name={`talent-select-${type}`}
                checked={isSelected} 
                onChange={onSelect} 
                disabled={isDisabled} 
                className="h-4 w-4 rounded-full bg-gray-600 border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed" 
            />
        </div>
    </div>
  );
};


const NewProjectScreen_Phase2: React.FC<NewProjectScreenPhase2Props> = ({ setGameState, onBack, gameSpeed, setGameSpeed, project }) => {
  const { playerData, setPlayerData } = useGame();
  const { t, language } = useTranslation();
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  
  if (!playerData) return null;

  const [selectedDirectorId, setSelectedDirectorId] = useState<number | undefined>(project.directorId);
  const [selectedMainActorId, setSelectedMainActorId] = useState<number | undefined>(project.mainActorId);
  const [selectedSupportingActorId, setSelectedSupportingActorId] = useState<number | undefined>(project.supportingActorId);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [selectedTalentInfo, setSelectedTalentInfo] = useState<Director | Actor | null>(null);
  const [error, setError] = useState('');
  const [talentFilter, setTalentFilter] = useState<'all' | 'favorites' | 'exclusive'>('all');

  const newActorIds = useMemo(() => new Set((project.castingActorPool || []).map(a => a.id)), [project.castingActorPool]);
  const newDirectorIds = useMemo(() => new Set((project.castingDirectorPool || []).map(d => d.id)), [project.castingDirectorPool]);
  
  const invitedActorIds = useMemo(() => new Set(project.castingInvitedActors || []), [project.castingInvitedActors]);

   const familyDirectors = useMemo<Director[]>(() => {
        const directors: Director[] = [];
        if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === 'Director') {
             directors.push({
                id: 99901, name: `${playerData.partnerName} (Partner)`, gender: playerData.partnerGender || 'weiblich', birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
                skill: playerData.partnerSkills.directing, cost: 0, bekanntheit: 5, speedModifier: 1.0, favoriteGenres: [], hatedGenre: '' as any, traits: [], experience: 0,
                potential: Math.min(100, playerData.partnerSkills.directing + 20), loyalty: 100, moral: 100, isDiscovered: true, portraitUrl: playerData.partnerPortraitId, isFamily: true
            });
        }
        playerData.children.forEach((child, index) => {
             const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
             if (age >= 18 && child.isEmployed && child.employedAs === 'Director' && child.skills) {
                 directors.push({
                    id: 99910 + index, name: `${child.name} (Kind)`, gender: child.gender === 'Mädchen' ? 'weiblich' : 'männlich', birthDate: child.birthDate,
                    skill: child.skills.directing, cost: 0, bekanntheit: 5, speedModifier: 1.0, favoriteGenres: [], hatedGenre: '' as any, traits: [], experience: 0,
                    potential: Math.min(100, child.skills.directing + 30), loyalty: 100, moral: 100, isDiscovered: true, portraitUrl: child.portraitId, isFamily: true
                 });
             }
        });
        return directors;
    }, [playerData]);

    const familyActors = useMemo<Actor[]>(() => {
        const actors: Actor[] = [];
        if (playerData.partnerName && playerData.partnerSkills && playerData.partnerIsEmployed && playerData.partnerEmployedAs === 'Actor') {
            actors.push({
                id: 99901, name: `${playerData.partnerName} (Partner)`, gender: playerData.partnerGender || 'weiblich', birthDate: playerData.partnerBirthDate || new Date(playerData.gameDate.getFullYear() - 30, 0, 1),
                skill: playerData.partnerSkills.acting, cost: 0, bekanntheit: 5, favoriteGenres: [], hatedGenre: '' as any, traits: [], experience: 0,
                potential: Math.min(100, playerData.partnerSkills.acting + 20), loyalty: 100, moral: 100, isDiscovered: true, portraitUrl: playerData.partnerPortraitId, isFamily: true
            });
        }
        playerData.children.forEach((child, index) => {
             const age = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
             const isChildActor = age >= 12 && age < 18;
             const isAdultEmployedActor = age >= 18 && child.isEmployed && child.employedAs === 'Actor';
             if ((isChildActor || isAdultEmployedActor) && child.skills) {
                 actors.push({
                    id: 99910 + index, name: `${child.name} (Kind)`, gender: child.gender === 'Mädchen' ? 'weiblich' : 'männlich', birthDate: child.birthDate,
                    skill: child.skills.acting, cost: 0, bekanntheit: 5, favoriteGenres: [], hatedGenre: '' as any, traits: [], experience: 0,
                    potential: Math.min(100, child.skills.acting + 30), loyalty: 100, moral: 100, isDiscovered: true, portraitUrl: child.portraitId, isFamily: true
                 });
             }
        });
        return actors;
    }, [playerData]);
    
  const availableDirectorsForSelection = useMemo(() => {
    // 1. Gather all unique potential candidates (Map ensures uniqueness by ID)
    const uniqueDirectorsMap = new Map<number, Director>();
    
    // A. Family
    familyDirectors.forEach(d => uniqueDirectorsMap.set(d.id, d));
    
    // B. Invited Known Talents (from playerData.directors)
    playerData.directors.forEach(d => {
        if (invitedActorIds.has(d.id)) { // invitedActorIds contains IDs for both roles
             uniqueDirectorsMap.set(d.id, d);
        }
    });

    // C. New Casting Pool (Project specific - newly discovered)
    if (project.castingDirectorPool) {
        project.castingDirectorPool.forEach(d => uniqueDirectorsMap.set(d.id, d));
    }

    // Convert Map to Array
    const allCandidates = Array.from(uniqueDirectorsMap.values());
    
    // 2. Filter Logic
    return allCandidates.filter(t => {
        // A. Hard Availability Check
        // Allow family always (logic handled elsewhere if blocked, but usually visible)
        if ((t as any).isFamily) return true;

        // Check if busy in ANOTHER project (blocking)
        // If actively filming elsewhere, they are unavailable.
        const isFilmingElsewhere = playerData.activeProjects.some(p => 
            p.workingTitle !== project.workingTitle &&
            (p.phase === ProjectPhase.Production || p.phase === ProjectPhase.PostProduction) &&
            p.directorId === t.id
        );
        if (isFilmingElsewhere) return false;

         // Check generic unavailability (e.g. sick, event, competitor blocked)
        if (t.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(t.unavailableForProjectsUntil)) return false;

        // B. Apply User Filter STRICTLY
        if (talentFilter === 'favorites') {
            if (!t.isFavorite) return false;
        }
        if (talentFilter === 'exclusive') {
            if (t.contract?.type !== 'exclusive') return false;
        }
        
        return true;
    }).sort((a,b) => b.skill - a.skill);
  }, [playerData, project, talentFilter, familyDirectors, invitedActorIds]);

  const availableActorsForSelection = useMemo(() => {
    const uniqueActorsMap = new Map<number, Actor>();

    // A. Family
    familyActors.forEach(a => uniqueActorsMap.set(a.id, a));

    // B. Invited Known Talents
    playerData.actors.forEach(a => {
        if (invitedActorIds.has(a.id)) {
            uniqueActorsMap.set(a.id, a);
        }
    });

    // C. New Casting Pool
    if (project.castingActorPool) {
        project.castingActorPool.forEach(a => uniqueActorsMap.set(a.id, a));
    }

    const allCandidates = Array.from(uniqueActorsMap.values());
    
    return allCandidates.filter(t => {
        // A. Hard Availability Check
        if ((t as any).isFamily) return true;
        
        const isFilmingElsewhere = playerData.activeProjects.some(p => 
            p.workingTitle !== project.workingTitle &&
            (p.phase === ProjectPhase.Production || p.phase === ProjectPhase.PostProduction) &&
            (p.mainActorId === t.id || p.supportingActorId === t.id)
        );
        if (isFilmingElsewhere) return false;

        if (t.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(t.unavailableForProjectsUntil)) return false;

        // B. Apply User Filter STRICTLY
        if (talentFilter === 'favorites') {
            if (!t.isFavorite) return false;
        }
        if (talentFilter === 'exclusive') {
            if (t.contract?.type !== 'exclusive') return false;
        }
        return true;
    }).sort((a,b) => b.skill - a.skill);
  }, [playerData, project, talentFilter, familyActors, invitedActorIds]);

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
                
                let subject = language === 'de' ? `Vertragsbruch: ${project.workingTitle}` : `Breach of Contract: ${project.workingTitle}`;
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


    const handleStartProduction = () => {
        if (!selectedDirectorId || !selectedMainActorId) {
            setError(t.project.casting.errorSelection);
            return;
        }
        setError("");
        
        const director = availableDirectorsForSelection.find(d => d.id === selectedDirectorId);
        const mainActor = availableActorsForSelection.find(a => a.id === selectedMainActorId);
        const supportingActor = availableActorsForSelection.find(a => a.id === selectedSupportingActorId);
        
        const getGage = (t: any, isSupporting: boolean = false) => {
            if (!t || t.id === -1 || t.contract || t.isFamily) return 0;
            let cost = t.cost;
            if (isSupporting) cost = Math.floor(cost * 0.5);
            return cost;
        };
        
        const directorGage = getGage(director);
        const mainActorGage = getGage(mainActor);
        const supportingActorGage = getGage(supportingActor, true);
        const totalTalentCost = directorGage + mainActorGage + supportingActorGage;

        if (playerData.capital < totalTalentCost) {
            setError(t.project.casting.errorFunds);
            return;
        }

        setPlayerData(prev => {
            if (!prev) return null;
            
            let newLog = [...prev.transactionLog];
            if (directorGage > 0) newLog.push({ date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Filmproduktion', description: `Gage: ${director!.name}`, amount: directorGage });
            if (mainActorGage > 0) newLog.push({ date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Filmproduktion', description: `Gage: ${mainActor!.name}`, amount: mainActorGage });
            if (supportingActorGage > 0) newLog.push({ date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Filmproduktion', description: `Gage: ${supportingActor!.name}`, amount: supportingActorGage });

            let finalDirectors = [...prev.directors];
            let finalActors = [...prev.actors];
            [director, mainActor, supportingActor].filter(Boolean).forEach(talent => {
                if (!talent || talent.id === -1 || talent.isFamily) return;
                const isDir = 'speedModifier' in talent;
                if (isDir) { if (!finalDirectors.some(d => d.id === talent.id)) finalDirectors.push(talent as Director); } 
                else { if (!finalActors.some(a => a.id === talent.id)) finalActors.push(talent as Actor); }
            });

            const updatedProjects = prev.activeProjects.map(p => {
                if (p.workingTitle === project.workingTitle) {
                    return { 
                        ...p,
                        phase: ProjectPhase.ProductionSetup,
                        directorId: selectedDirectorId, directorGage,
                        mainActorId: selectedMainActorId, mainActorGage,
                        supportingActorId: selectedSupportingActorId, supportingActorGage,
                        castingDirectorPool: undefined, castingActorPool: undefined
                    };
                }
                return p;
            });

            return { 
                ...prev,
                capital: prev.capital - totalTalentCost,
                transactionLog: newLog,
                directors: finalDirectors,
                actors: finalActors,
                activeProjects: updatedProjects
            };
        });
    };

    const handleStartCasting = (level: number, knownTalentIds: number[], preferences: ProjectCastingPreferences, casterId?: number) => {
        const option = CASTING_OPTIONS.find(opt => opt.level === level)!;
        const cost = option.cost;
        const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
        
        setPlayerData(prev => {
            if (!prev) return null;
            if (prev.capital < cost && !isTestMode) return prev;

            let duration = isTestMode ? 5 : option.duration;
            
            // CONTRACT WORK SPEED BONUS: 2/3 of normal time
            if (project.contract) {
                duration = Math.max(1, Math.round(duration * 0.66));
            }

            const endDate = new Date(prev.gameDate);
            endDate.setDate(endDate.getDate() + duration);
            
            const updatedProjects = prev.activeProjects.map(p => {
                if (p.workingTitle === project.workingTitle) {
                    return {
                        ...p,
                        phase: ProjectPhase.Casting,
                        castingLevel: level,
                        castingCost: cost,
                        castingStartDate: new Date(prev.gameDate),
                        castingEndDate: endDate,
                        castingInvitedActors: knownTalentIds,
                        castingPreferences: preferences,
                    };
                }
                return p;
            });

            const optionName = t.productionOptions.casting[`level${level}` as keyof typeof t.productionOptions.casting]?.name || option.name;
            
            return {
                ...prev,
                capital: prev.capital - cost,
                activeProjects: updatedProjects,
                transactionLog: [...prev.transactionLog, { date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Filmproduktion', description: `Casting: ${optionName}`, amount: cost }]
            };
        });
    };

    if (project.phase === ProjectPhase.CastingSetup || project.phase === ProjectPhase.ScriptFinished) {
        return (
            <div className="h-full flex items-center justify-center">
                 {selectedTalentInfo && (
                    <TalentDossierModal 
                        talent={selectedTalentInfo} 
                        onClose={() => setSelectedTalentInfo(null)}
                        talentList={[]}
                        onTalentChange={() => {}}
                    />
                )}
                <CastingSetupView 
                    project={project} 
                    onStartCasting={handleStartCasting} 
                    onBack={onBack} 
                    setSelectedTalentInfo={setSelectedTalentInfo}
                    onCancel={handleDiscardProject}
                />
            </div>
        );
    }
    
    if (project.phase === ProjectPhase.CastingFinished) {
      const selectedDirector = availableDirectorsForSelection.find(d => d.id === selectedDirectorId);
      const selectedMainActor = availableActorsForSelection.find(a => a.id === selectedMainActorId);
      const selectedSupportingActor = availableActorsForSelection.find(a => a.id === selectedSupportingActorId);
      
      const getTalentCost = (talent: Director | Actor | undefined, isSupporting: boolean = false) => {
        if (!talent || talent.id === PLAYER_TALENT_ID || talent.contract?.type === 'exclusive' || talent.isFamily) return 0;
        return isSupporting ? Math.floor(talent.cost * 0.5) : talent.cost;
      };

      const talentCost = getTalentCost(selectedDirector) + getTalentCost(selectedMainActor) + getTalentCost(selectedSupportingActor, true);
    const bisherigeKosten = (project.scriptBudget || 0) + (project.movieSizeBudget || 0) + (project.seriesPlanningCost || 0) + (project.castingCost || 0);
      const neueGesamtkosten = bisherigeKosten + talentCost;
        
      return (
            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-6 rounded-lg shadow-2xl w-full max-w-7xl border border-gray-700 flex flex-col h-auto">
                <div className="flex justify-between items-center flex-shrink-0 mb-4">
                  <div className="w-48"></div>
                  <div className="text-center flex-grow">
                      <h2 className="text-4xl font-bold font-cinzel text-amber-400">Talentauswahl</h2>
                      <p className="text-lg text-gray-300">{project.workingTitle} • {t.genres[project.genre]}</p>
                  </div>
                  <div className="w-48 text-right">
                      <select value={talentFilter} onChange={(e) => setTalentFilter(e.target.value as any)} className="bg-gray-900 border border-gray-600 rounded-md p-1 text-white">
                          <option value="all">{t.project.casting.filterAll}</option>
                          <option value="favorites">{t.project.casting.filterFavorites}</option>
                          <option value="exclusive">{t.project.casting.filterExclusive}</option>
                      </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 overflow-hidden h-[480px]">
                    <div className="flex flex-col min-h-0">
                        <div className="flex flex-col items-center border-b-2 border-amber-500/50 pb-2 mb-3 min-h-[72px]">
                           <h3 className="text-xl xl:text-2xl font-bold font-cinzel text-amber-300 whitespace-nowrap">{t.project.casting.director}</h3>
                           <div className="h-5 mt-1 text-sm text-gray-400" aria-hidden="true"></div>
                        </div>
                        <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
                            {availableDirectorsForSelection.map(dir => <TalentListItem key={dir.id} talent={dir} isSelected={selectedDirectorId === dir.id} onSelect={() => setSelectedDirectorId(dir.id)} onShowInfo={() => setSelectedTalentInfo(dir)} type="director" gameDate={playerData.gameDate} isNew={newDirectorIds.has(dir.id)} />)}
                        </div>
                    </div>
                    <div className="flex flex-col min-h-0">
                        <div className="flex flex-col items-center border-b-2 border-amber-500/50 pb-2 mb-3 min-h-[72px]">
                            <h3 className="text-xl xl:text-2xl font-bold font-cinzel text-amber-300 whitespace-nowrap">{t.project.casting.mainActor}</h3>
                            <div className="h-5 mt-1 text-sm text-gray-400">
                                {project.mainRole ? `(${project.mainRole.gender === 'männlich' ? t.newGame.male : t.newGame.female}, ${getAgeLabel(project.mainRole.age, t)})` : ''}
                            </div>
                        </div>
                        <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
                            {availableActorsForSelection.map(act => <TalentListItem key={act.id} talent={act} isSelected={selectedMainActorId === act.id} onSelect={() => setSelectedMainActorId(act.id)} onShowInfo={() => setSelectedTalentInfo(act)} isDisabled={selectedSupportingActorId === act.id} disabledTooltip={`${act.name} ist bereits als Nebendarsteller ausgewählt.`} type="main_actor" gameDate={playerData.gameDate} isNew={newActorIds.has(act.id)} />)}
                        </div>
                    </div>
                    <div className="flex flex-col min-h-0">
                        <div className="flex flex-col items-center border-b-2 border-amber-500/50 pb-2 mb-3 min-h-[72px]">
                            <h3 className="text-xl xl:text-2xl font-bold font-cinzel text-amber-300 whitespace-nowrap">{t.project.casting.supportingActor}</h3>
                            <div className="h-5 mt-1 text-sm text-gray-400">
                                {project.supportingRole ? `(${project.supportingRole.gender === 'männlich' ? t.newGame.male : t.newGame.female}, ${getAgeLabel(project.supportingRole.age, t)})` : ''}
                            </div>
                        </div>
                        <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
                              <div className={`flex items-center gap-2 p-2 rounded-md transition-colors ${!selectedSupportingActorId ? 'bg-amber-800/30 ring-1 ring-amber-600' : 'bg-gray-900/50'}`}>
                                <label htmlFor="no-support" className="flex-grow font-bold text-white cursor-pointer px-3 py-4">{t.project.casting.noSupport}</label>
                                <div className="flex-shrink-0 pr-2"><input id="no-support" type="radio" name="talent-select-supporting_actor" checked={!selectedSupportingActorId} onChange={() => setSelectedSupportingActorId(undefined)} className="h-5 w-5 rounded-full bg-gray-600 border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer"/></div>
                            </div>
                            {availableActorsForSelection.map(act => <TalentListItem key={act.id} talent={act} isSelected={selectedSupportingActorId === act.id} onSelect={() => setSelectedSupportingActorId(act.id)} onShowInfo={() => setSelectedTalentInfo(act)} isDisabled={selectedMainActorId === act.id} disabledTooltip={`${act.name} ist bereits als Hauptdarsteller ausgewählt.`} type="supporting_actor" gameDate={playerData.gameDate} isNew={newActorIds.has(act.id)} costModifier={0.5} />)}
                        </div>
                    </div>
                </div>
      
                <div className="mt-6 pt-4 border-t border-gray-700 flex-shrink-0">
                    {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
                    <div className="flex justify-between items-center">
                        <div className="text-sm">
                            <div className="flex justify-between w-64"><span>{t.project.casting.costs}:</span> <span className="font-bold text-white">{formatCurrency(bisherigeKosten)}</span></div>
                            <div className="flex justify-between w-64"><span>{t.project.casting.gages}:</span> <span className="font-bold text-white">{formatCurrency(talentCost)}</span></div>
                            <div className="flex justify-between w-64 border-t mt-1 pt-1 border-gray-600"><span className="text-base">{t.project.casting.total}:</span> <span className="font-bold text-amber-400 text-base">{formatCurrency(neueGesamtkosten)}</span></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowDiscardConfirm(true)} className="bg-red-800 text-white font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider hover:bg-red-700">{t.project.progress.discard}</button>
                            <button onClick={handleStartProduction} className="bg-amber-500 text-gray-900 font-bold py-3 px-8 rounded-sm text-lg uppercase tracking-wider hover:bg-amber-400">{t.project.casting.toProduction}</button>
                        </div>
                    </div>
                </div>
                {selectedTalentInfo && <TalentDossierModal 
                    talent={selectedTalentInfo} 
                    onClose={() => setSelectedTalentInfo(null)} 
                    talentList={[...availableDirectorsForSelection, ...availableActorsForSelection]}
                    onTalentChange={(newTalent) => setSelectedTalentInfo(newTalent)}
                />}

                {/* MODAL INTEGRATED HERE - NOW IT WORKS */}
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
            </div>
          );
    }
    
    // Discard Confirmation Modal for Setup Phase
    if (showDiscardConfirm) {
        return (
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
        )
    }

    return (
        <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Lade Besetzung für "{project.workingTitle}"...</h2>
            <p>Ungültiger Projektstatus: {project.phase}</p>
        </div>
    );
};

export default NewProjectScreen_Phase2;
