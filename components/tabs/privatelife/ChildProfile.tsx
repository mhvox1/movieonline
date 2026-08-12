
import React, { useState, useMemo, useRef } from 'react';
import { PlayerData, Child, SkillSet, EmployeeType, ActorAge } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { msToHours } from '../../../hooks/timeUtils';
import SkillBar from '../../SkillBar';
import { SCHOOL_TYPES, SECONDARY_SCHOOL_TYPES, UNIVERSITY_TYPES, CHILD_INTERACTIONS, UNIVERSITY_MAJORS } from '../../privateLifeData';
import HeartIcon from '../../icons/HeartIcon';
import StarIcon from '../../icons/StarIcon';
import FolderIcon from '../../icons/FolderIcon'; // Import FolderIcon

interface ChildProfileProps {
    child: Child;
    playerData: PlayerData;
    onInteract: (interactionId: string) => void;
    onHire: (role: EmployeeType | 'Actor' | 'Director' | 'None') => void;
    onTrain: (skill: keyof SkillSet, duration: number) => void;
    onRequestEnrollment: (childId: string, type: 'primary' | 'secondary' | 'university') => void;
    getPortraitUrl: (portraitId: string | undefined, birthDate: Date, gameDate: Date) => string | null;
}

// Custom Star Rating for Schools (supports halves)
const SchoolStarRating: React.FC<{ stars: number }> = ({ stars }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((index) => {
                let fill = 'text-gray-600'; // Empty
                if (stars >= index) {
                    fill = 'text-yellow-400'; // Full
                } else if (stars >= index - 0.5) {
                     return (
                        <div key={index} className="relative w-3 h-3">
                             <StarIcon className="w-3 h-3 text-gray-600 absolute top-0 left-0" />
                             <div className="w-1.5 h-3 overflow-hidden absolute top-0 left-0">
                                <StarIcon className="w-3 h-3 text-yellow-400" />
                             </div>
                        </div>
                     );
                }
                return <StarIcon key={index} className={`w-3 h-3 ${fill}`} />;
            })}
        </div>
    );
};

const ChildProfile: React.FC<ChildProfileProps> = ({ child, playerData, onInteract, onHire, onTrain, onRequestEnrollment, getPortraitUrl }) => {
    const { t, language } = useTranslation();
    const { setPlayerData } = useGame();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [activeTab, setActiveTab] = useState<'development' | 'talents'>('development');
    const [showHireConfirm, setShowHireConfirm] = useState(false);
    const [showTrainingConfirm, setShowTrainingConfirm] = useState<{skill: keyof SkillSet, duration: number} | null>(null);
    const [selectedRole, setSelectedRole] = useState<EmployeeType | 'Actor' | 'Director' | 'None'>(EmployeeType.Autor);
    
    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (child.isEmployed && child.employedAs) {
            setSelectedRole(child.employedAs);
        } else {
            setSelectedRole('None');
        }
    }, [child.isEmployed, child.employedAs]);

    const activePortraitUrl = getPortraitUrl(child.portraitId, child.birthDate, playerData.gameDate);
    
    const childAge = Math.floor((new Date(playerData.gameDate).getTime() - new Date(child.birthDate).getTime()) / (1000 * 3600 * 24 * 365.25));
    const activeBirthDate = child.birthDate;
    const isSchoolAge = childAge >= 6;
    const isFemale = child.gender === 'Mädchen';
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

    const skillList: (keyof SkillSet)[] = ['acting', 'directing', 'writing', 'scouting', 'research', 'marketing', 'planning'];

    const getSkillLabel = (key: keyof SkillSet): string => {
        switch(key) {
            case 'acting': return t.office.contacts.actors; 
            case 'directing': return t.office.contacts.directors; 
            case 'writing': return t.office.employees.employeeTypes.autor; 
            case 'scouting': return t.office.employees.employeeTypes.castingMitarbeiter; 
            case 'research': return t.office.employees.employeeTypes.forscher; 
            case 'marketing': return t.office.employees.employeeTypes.marketingmanager; 
            case 'planning': return t.office.employees.employeeTypes.projektPlaner; 
            default: return key;
        }
    };
    
    let activeJob = t.privatelife.family.lifeStages.toddler || (language === 'de' ? 'Kleinkind' : 'Toddler');

    const getGenderedJob = (base: string) => {
        if (language !== 'de') return base;
        return isFemale ? `${base}in` : base;
    };

    const professionMap: Record<string, string> = {
        'Actor': isFemale ? (t.newspaper.roles.actress || 'Schauspielerin') : (t.newspaper.roles.actor || 'Schauspieler'),
        'Director': isFemale ? (t.newspaper.roles.directress || 'Regisseurin') : (t.newspaper.roles.director || 'Regisseur'),
        [EmployeeType.Autor]: t.office.employees.employeeTypes.autor,
        [EmployeeType.CastingMitarbeiter]: t.office.employees.employeeTypes.castingMitarbeiter,
        [EmployeeType.Forscher]: t.office.employees.employeeTypes.forscher,
        [EmployeeType.Marketingmanager]: t.office.employees.employeeTypes.marketingmanager,
        [EmployeeType.ProjektPlaner]: t.office.employees.employeeTypes.projektPlaner,
    };

    if (child.isEmployed && child.employedAs) {
        if (child.employedAs === 'Actor' || child.employedAs === 'Director') {
             activeJob = professionMap[child.employedAs];
        } else {
             const baseTitle = professionMap[child.employedAs] || child.employedAs;
             activeJob = getGenderedJob(baseTitle);
        }
    } else if (child.isGraduated) {
        const studiedProfessionKey = child.universityMajor;
        let professionName = studiedProfessionKey ? (professionMap[studiedProfessionKey] || studiedProfessionKey) : '';
        if (language === 'de' && studiedProfessionKey && studiedProfessionKey !== 'Actor' && studiedProfessionKey !== 'Director') {
             professionName = getGenderedJob(professionName);
        }
        activeJob = professionName || t.privatelife.family.lifeStages.graduate;
    } else if (childAge >= 18) {
        activeJob = t.privatelife.family.lifeStages.student;
    } else if (childAge >= 6) {
        activeJob = t.privatelife.family.lifeStages.pupil;
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    let currentSchool = null;
    if (child.schoolId) {
        currentSchool = SCHOOL_TYPES.find(s => s.id === child.schoolId) || 
                        SECONDARY_SCHOOL_TYPES.find(s => s.id === child.schoolId) ||
                        UNIVERSITY_TYPES.find(s => s.id === child.schoolId);
    }

    const availableInteractions = useMemo(() => {
        return CHILD_INTERACTIONS.filter(i => childAge >= i.minAge && childAge <= i.maxAge);
    }, [childAge]);

    const CHILD_INTERACTION_COOLDOWN_HOURS = 76;

    const lastInteraction = child.lastInteractionDate ? new Date(child.lastInteractionDate) : null;
    const hoursSinceInteraction = lastInteraction ? msToHours(new Date(playerData.gameDate).getTime() - lastInteraction.getTime()) : 999;
    const interactionAvailable = hoursSinceInteraction >= CHILD_INTERACTION_COOLDOWN_HOURS || isTestMode;
    const hoursUntilInteraction = Math.max(0, CHILD_INTERACTION_COOLDOWN_HOURS - hoursSinceInteraction);

    const trainingCost = 1500; 

    const isTrainingCooldown = React.useMemo(() => {
        if (child.activeTraining) return true;
        if (!child.lastCourseDate) return false;
        const cooldownEnd = new Date(child.lastCourseDate);
        cooldownEnd.setMonth(cooldownEnd.getMonth() + 6);
        return playerData.gameDate < cooldownEnd;
    }, [child.lastCourseDate, playerData.gameDate, child.activeTraining]);


    const handleTrainClick = (skill: keyof SkillSet) => {
        if (playerData.privateCapital >= trainingCost && !isTrainingCooldown) {
            const duration = 65 + Math.floor(Math.random() * 56);
            setShowTrainingConfirm({ skill, duration });
        }
    };

    const confirmTraining = () => {
        if (showTrainingConfirm) {
            onTrain(showTrainingConfirm.skill, showTrainingConfirm.duration);
            setShowTrainingConfirm(null);
        }
    };

    const isAdult = childAge >= 18;
    const isEmployed = child.isEmployed;
    const isGraduated = child.isGraduated;

    const isJobLocked = useMemo(() => {
        if (!child.jobAssignedDate) return false;
        const assignedDate = new Date(child.jobAssignedDate);
        const unlockDate = new Date(assignedDate);
        unlockDate.setMonth(unlockDate.getMonth() + 6);
        return playerData.gameDate < unlockDate;
    }, [child.jobAssignedDate, playerData.gameDate]);

    const unlockDateStr = useMemo(() => {
        if (!child.jobAssignedDate) return "";
        const assignedDate = new Date(child.jobAssignedDate);
        const unlockDate = new Date(assignedDate);
        unlockDate.setMonth(unlockDate.getMonth() + 6);
        return unlockDate.toLocaleDateString(locale);
    }, [child.jobAssignedDate, locale]);

    // --- PHOTO UPLOAD LOGIC ---
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPlayerData(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        children: prev.children.map(c => 
                            c.id === child.id ? { ...c, portraitId: base64String } : c
                        )
                    };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header - Shrunk */}
            <div className="flex items-center gap-4 mb-4 border-b border-gray-600 pb-3">
                 <div className="relative group">
                    {/* Portrait vergrößert von w-24 h-24 auf w-32 h-32 */}
                    <div className="w-32 h-32 bg-pink-900/30 rounded-full flex items-center justify-center border-2 border-pink-500/50 overflow-hidden flex-shrink-0">
                        {activePortraitUrl ? (
                            <img src={activePortraitUrl} alt={child.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl">?</span>
                        )}
                    </div>
                     {/* Upload Button */}
                    <div 
                        className="absolute bottom-0 right-0 p-1.5 bg-gray-800 hover:bg-amber-600 rounded-full cursor-pointer transition-colors border border-gray-500 shadow-md flex items-center justify-center z-10"
                        onClick={handleUploadClick}
                        title={language === 'de' ? 'Bild ändern' : 'Change Image'}
                    >
                        <FolderIcon className="w-3 h-3 text-white" />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{child.name}</h3>
                    <p className="text-gray-400 text-xs">{activeJob}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-gray-500">{childAge} {t.talentDossier.years}</p>
                        {activeBirthDate && <p className="text-[10px] text-gray-500">({new Date(activeBirthDate).toLocaleDateString(locale)})</p>}
                    </div>
                </div>
            </div>

            {/* Status Bar / School / Relationship - Reduced padding/margins */}
            <div className="mb-3 space-y-2">
                 <div className="p-2 bg-gray-700/30 rounded border border-gray-600">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-pink-400 font-bold uppercase text-[10px] flex items-center gap-1">
                            <HeartIcon className="w-2.5 h-2.5" filled/> {t.talentDossier.loyalty}
                        </h4>
                        <span className="text-[10px] font-mono text-white">{Math.round(child.relationship || 0)}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden border border-gray-600">
                        <div className="bg-pink-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${child.relationship || 0}%` }}></div>
                      </div>
                 </div>

                 {isSchoolAge && !isGraduated ? (
                     <div className="p-2 bg-gray-700/30 rounded border border-gray-600">
                        <div className="flex justify-between items-center mb-0.5">
                             <h4 className="text-blue-400 font-bold uppercase text-[10px]">
                                 {childAge >= 18 ? t.privatelife.education.universityEnrollmentTitle : (language === 'de' ? 'Schule' : 'School')}
                             </h4>
                        </div>
                        {currentSchool ? (
                             <div>
                                 <p className="text-white text-xs font-bold leading-tight truncate">{currentSchool.name}</p>
                                 {child.universityMajor && (
                                     <p className="text-[9px] text-amber-300">{language === 'de' ? 'Studium' : 'Major'}: {UNIVERSITY_MAJORS[child.universityMajor as string] || child.universityMajor}</p>
                                 )}
                                 <div className="flex justify-between mt-1 text-[10px]">
                                     <span className="text-gray-500">{currentSchool.monthlyCost > 0 ? formatCurrency(currentSchool.monthlyCost) : (language === 'de' ? 'Gratis' : 'Free')}</span>
                                     <div className="flex items-center gap-1.5">
                                        <span className="text-gray-500">{language === 'de' ? 'Qualität' : 'Quality'}:</span>
                                        <SchoolStarRating stars={currentSchool.stars} />
                                     </div>
                                 </div>
                             </div>
                        ) : (
                             <div className="text-center py-1">
                                <p className="text-red-400 text-xs font-bold">{language === 'de' ? 'Schulpflicht!' : 'School enrollment required!'}</p>
                             </div>
                        )}
                    </div>
                 ) : null}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-600 mb-3 text-xs">
                <button onClick={() => setActiveTab('development')} className={`flex-1 py-1.5 font-bold transition-colors ${activeTab === 'development' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-white'}`}>{t.privatelife.family.tabs.development}</button>
                <button onClick={() => setActiveTab('talents')} className={`flex-1 py-1.5 font-bold transition-colors ${activeTab === 'talents' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-white'}`}>{t.privatelife.family.tabs.talents}</button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'development' && (
                    <div className="space-y-2">
                        {availableInteractions.length > 0 ? (
                            <div className="space-y-2">
                                {availableInteractions.map(interaction => {
                                    const canAfford = playerData.privateCapital >= interaction.cost;
                                    const hasEnergy = (playerData.energy || 0) >= interaction.energyCost;
                                    const disabled = !canAfford || !hasEnergy || !interactionAvailable;
                                    
                                    const transLabel = t.privatelife.interactions?.[interaction.id]?.label || interaction.label;
                                    const transDesc = t.privatelife.interactions?.[interaction.id]?.description || interaction.description;

                                    return (
                                        <button 
                                            key={interaction.id}
                                            onClick={() => onInteract(interaction.id)} 
                                            disabled={disabled}
                                            className="w-full bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 border border-gray-600 p-1.5 rounded text-left flex justify-between items-center group transition-colors relative"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <span className="font-semibold text-white block text-xs truncate">{transLabel}</span>
                                                <span className="text-[9px] text-gray-400 line-clamp-1">{transDesc}</span>
                                            </div>
                                            <div className="text-right flex flex-col items-end flex-shrink-0">
                                                 <div className="text-[10px] font-bold">
                                                     {interaction.cost > 0 ? (
                                                         <span className={canAfford ? 'text-amber-400' : 'text-red-400'}>{formatCurrency(interaction.cost)}</span>
                                                     ) : (
                                                         <span className="text-green-400">{language === 'de' ? 'Gratis' : 'Free'}</span>
                                                     )}
                                                 </div>
                                            </div>
                                            {!interactionAvailable && <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center text-[10px] font-bold text-white z-20">{language === 'de' ? `Warten (${hoursUntilInteraction} Stunden)` : `Wait (${hoursUntilInteraction} hours)`}</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-center text-[10px]">{language === 'de' ? 'Keine Interaktionen verfügbar.' : 'No interactions available.'}</p>
                        )}
                    </div>
                )}

                {activeTab === 'talents' && isGraduated && (
                    <div className="space-y-4">
                        {child.skills ? (
                            <div className="bg-gray-700/30 p-2 rounded border border-gray-600">
                                <h4 className="text-pink-400 font-bold mb-2 uppercase text-[10px]">{t.privatelife.family.tabs.talents}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {skillList.map(skill => (
                                         <div key={skill} className="bg-gray-700/30 px-2 py-1 rounded border border-gray-600 relative group flex flex-col justify-center h-9">
                                             <div className="flex justify-between items-end mb-0.5">
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate max-w-[65%]">
                                                    {getSkillLabel(skill)}
                                                </span>
                                                <span className="text-[9px] font-mono text-white">
                                                    {Math.round(child.skills![skill])}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden border border-gray-600/50">
                                                <div 
                                                    className="bg-blue-500 h-1 rounded-full transition-all duration-500 ease-out" 
                                                    style={{ width: `${Math.min(100, Math.max(0, child.skills![skill]))}%` }}
                                                ></div>
                                            </div>
                                            <button 
                                                onClick={() => handleTrainClick(skill)}
                                                disabled={playerData.privateCapital < trainingCost || isTrainingCooldown}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-gray-600 shadow-lg z-10"
                                            >
                                                TRAIN
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {child.isEmployed ? (
                            <div className="p-2 bg-green-900/20 border border-green-500/50 rounded text-center">
                                <p className="text-green-400 font-bold text-xs">{language === 'de' ? 'Angestellt' : 'Employed'}</p>
                                <p className="text-[10px] text-gray-400">{language === 'de' ? 'Rolle' : 'Role'}: {activeJob}</p>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-gray-700">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-grow">
                                            <label className="block text-[10px] text-gray-400 mb-0.5">{language === 'de' ? 'Rolle wählen' : 'Choose Role'}</label>
                                            <select 
                                                value={selectedRole} 
                                                onChange={(e) => setSelectedRole(e.target.value as any)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-[10px]"
                                                disabled={isJobLocked}
                                            >
                                                <option value="None">{t.privatelife.family.actions.noJob}</option>
                                                <option value="Actor">{t.office.contacts.actors}</option>
                                                <option value="Director">{t.office.contacts.directors}</option>
                                                {Object.values(EmployeeType).map(type => (
                                                    <option key={type} value={type}>{t.office.employees.employeeTypes[Object.keys(t.office.employees.employeeTypes).find(k => t.office.employees.employeeTypes[k as keyof typeof t.office.employees.employeeTypes] === type) as keyof typeof t.office.employees.employeeTypes] || type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button 
                                            onClick={() => setShowHireConfirm(true)} 
                                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded uppercase text-[10px] h-7 disabled:bg-gray-600"
                                            disabled={isJobLocked}
                                        >
                                            OK
                                        </button>
                                    </div>
                                    {isJobLocked && <p className="text-[9px] text-red-400 mt-1 text-center">{t.privatelife.family.actions.positionLocked} {unlockDateStr}</p>}
                            </div>
                        )}
                        
                        {child.skills && (
                            <div className="pt-2 border-t border-gray-700">
                                {child.activeTraining ? (
                                    <div className="bg-blue-900/30 border border-blue-600/50 p-2 rounded text-center text-[10px] text-blue-200">
                                        {t.widgets.activities.inTraining}: <strong>{getSkillLabel(child.activeTraining.skill)}</strong>. <br/>
                                        Ende: {new Date(child.activeTraining.endDate).toLocaleDateString(locale)}
                                    </div>
                                ) : (
                                     <p className="text-[9px] text-gray-500 italic text-center">{language === 'de' ? 'Skill für Training wählen.' : 'Choose a skill for training.'}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hire Confirmation Modal */}
             {showHireConfirm && (
                 <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setShowHireConfirm(false)}>
                    <div className="bg-gray-800 border border-amber-500 rounded-lg p-5 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-amber-400 mb-3">{t.privatelife.family.actions.securityQuestion}</h3>
                        <p className="text-white text-xs mb-1 font-bold">
                            {selectedRole === 'None'
                                ? t.privatelife.family.actions.reallyFire
                                : t.privatelife.family.actions.reallyHire.replace('{role}', selectedRole)}
                        </p>
                        <p className="text-[10px] text-gray-300 mb-4">
                            {language === 'de' ? 'Dies beendet das aktuelle Arbeitsverhältnis sofort.' : 'This will end the current employment immediately.'}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setShowHireConfirm(false)} className="bg-gray-600 px-4 py-1.5 rounded text-white text-xs font-bold">{t.common.cancel}</button>
                            <button onClick={() => { onHire(selectedRole); setShowHireConfirm(false); }} className="bg-green-600 px-4 py-1.5 rounded text-white text-xs font-bold">{t.common.confirm}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Training Confirmation Modal */}
            {showTrainingConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={e => e.stopPropagation()}>
                    <div className="bg-gray-800 border border-blue-500 rounded-lg p-5 max-w-sm text-center shadow-2xl">
                        <h3 className="text-lg font-bold text-blue-400 mb-3">{language === 'de' ? 'Lehrgang bestätigen' : 'Confirm Training'}</h3>
                        <p className="text-gray-300 text-sm mb-1">
                            {language === 'de'
                                ? <>{child.name} auf Lehrgang für <strong>{getSkillLabel(showTrainingConfirm.skill)}</strong> schicken?</>
                                : <>Send {child.name} to training for <strong>{getSkillLabel(showTrainingConfirm.skill)}</strong>?</>}
                        </p>
                        <p className="text-gray-400 text-[10px] mb-3">
                            {language === 'de' ? 'Dauer' : 'Duration'}: {showTrainingConfirm.duration} {t.privatelife.education.days} | {language === 'de' ? 'Kosten' : 'Cost'}: {trainingCost}$
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowTrainingConfirm(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 px-6 rounded text-xs uppercase">{t.common.cancel}</button>
                            <button onClick={confirmTraining} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-6 rounded text-xs uppercase">{language === 'de' ? 'Starten' : 'Start'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChildProfile;
