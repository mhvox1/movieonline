
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, BuildingType, EmployeeType, Director, Actor, ProjectPhase, ActorAge } from '../../../types';
import StarRating from '../../StarRating';
import { useGame } from '../../../contexts/GameContext';
import PersonalIcon from '../../icons/PersonalIcon';
import HandshakeIcon from '../../icons/HandshakeIcon';
import CastingIcon from '../../icons/CastingIcon';
import ScoutingIcon from '../../icons/ScoutingIcon';
import { useTranslation } from '../../../hooks/useTranslation';

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

const CampaignSetupView: React.FC<{
    employee: Employee;
    onClose: () => void;
    onComplete: () => void;
}> = ({ employee, onClose, onComplete }) => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    const [role, setRole] = useState<'actor' | 'director' | 'both'>('actor');
    const [scope, setScope] = useState<'personal' | 'small' | 'medium' | 'large'>('personal'); // Default to personal
    
    // New Filters
    const [targetSkillLevel, setTargetSkillLevel] = useState<1 | 2 | 3 | 4 | 5>(1); 
    const [targetAgeGroup, setTargetAgeGroup] = useState<ActorAge>(ActorAge.Young);

    const formatCurrency = (value: number) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    // Cost multipliers for better talent (only applies if cost > 0)
    const skillCostMultipliers = {
        1: 1.0, 
        2: 1.2, 
        3: 1.5,
        4: 2.0,
        5: 3.0
    };

    const campaignConfig = {
        personal: { name: t.office.casting.campaign.scopes.personal, baseCost: 0, duration: [15, 25], talents: "1-2" },
        small: { name: t.office.casting.campaign.scopes.small, baseCost: 50000, duration: [30, 45], talents: "2-3" },
        medium: { name: t.office.casting.campaign.scopes.medium, baseCost: 100000, duration: [45, 55], talents: "3-6" },
        large: { name: t.office.casting.campaign.scopes.large, baseCost: 250000, duration: [60, 85], talents: "8-12" },
    };

    if (!playerData) return null;
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const currentConfig = campaignConfig[scope];
    
    // Calculate final cost
    const cost = Math.round(currentConfig.baseCost * skillCostMultipliers[targetSkillLevel]);
    
    const { duration, talents } = currentConfig;
    // Fix: Allow free campaigns even if capital is negative
    const canAfford = playerData ? (playerData.capital >= cost || cost === 0 || isTestMode) : false;
    
    // Check if THIS employee is already busy with a campaign (though button should be disabled outside)
    const isEmployeeBusy = playerData.activeCastingCampaigns && playerData.activeCastingCampaigns.some(c => c.casterId === employee.id);

    // Available Skill Levels based on Scope
    const availableSkillLevels = useMemo(() => {
        if (scope === 'personal') return [1, 2];
        if (scope === 'small') return [1, 2, 3];
        if (scope === 'medium') return [1, 2, 3, 4];
        return [1, 2, 3, 4, 5];
    }, [scope]);
    
    // Reset skill level if out of range when switching scope
    useEffect(() => {
        if (!availableSkillLevels.includes(targetSkillLevel)) {
            setTargetSkillLevel(availableSkillLevels[0] as 1|2|3|4|5);
        }
    }, [scope, availableSkillLevels, targetSkillLevel]);


    if (!playerData) return null;

    const handleStartCampaign = () => {
        if (!canAfford || isEmployeeBusy) return;

        const [min, max] = duration;
        const finalDuration = min + Math.floor(Math.random() * (max - min + 1));
        const endDate = new Date(playerData.gameDate);
        endDate.setDate(endDate.getDate() + finalDuration);

        setPlayerData(prev => {
            if (!prev) return null;
            
            // Only add transaction if cost > 0
            const transactions = [...prev.transactionLog];
            if (cost > 0) {
                 transactions.push({
                    date: new Date(prev.gameDate),
                    type: 'Ausgabe',
                    category: 'Talent-Scouting',
                    description: `${t.office.casting.campaign.title}: ${currentConfig.name}`,
                    amount: cost
                });
            }

            return {
                ...prev,
                capital: prev.capital - cost,
                activeCastingCampaigns: [...(prev.activeCastingCampaigns || []), {
                    casterId: employee.id,
                    startDate: new Date(prev.gameDate),
                    endDate,
                    scope,
                    role,
                    targetSkillLevel, // Save targets
                    targetAgeGroup
                }],
                transactionLog: transactions
            };
        });
        onComplete();
    };

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-lg font-bold text-white mb-4 text-center">{t.office.casting.campaign.title}</h4>
            
            {/* Role Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t.office.casting.setup.role}</label>
                <select value={role} onChange={e => setRole(e.target.value as 'director' | 'actor' | 'both')} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2">
                    <option value="actor">{t.office.casting.setup.roleActor}</option>
                    <option value="director">{t.office.casting.setup.roleDirector}</option>
                    <option value="both">{t.office.casting.setup.roleBoth}</option>
                </select>
            </div>

            {/* Scope Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t.office.casting.campaign.scope}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(campaignConfig).map(([key, config]) => (
                         <button key={key} onClick={() => setScope(key as 'personal' | 'small' | 'medium' | 'large')} className={`p-2 rounded-md text-center border-2 ${scope === key ? 'border-amber-400 bg-amber-900/50' : 'border-gray-600 hover:border-gray-500'}`}>
                            <p className="font-bold text-sm">{config.name}</p>
                         </button>
                    ))}
                </div>
            </div>

            {/* Skill Level Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t.office.casting.campaign.targetSkill}</label>
                <select 
                    value={targetSkillLevel} 
                    onChange={e => setTargetSkillLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} 
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2"
                >
                    {availableSkillLevels.map(level => (
                        <option key={level} value={level}>
                             {/* @ts-ignore */}
                            {t.office.casting.campaign.skillLevels[level]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Age Group Selection - HIDDEN FOR DIRECTORS */}
            {role !== 'director' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.office.casting.campaign.targetAge}</label>
                    <select 
                        value={targetAgeGroup} 
                        onChange={e => setTargetAgeGroup(e.target.value as ActorAge)} 
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2"
                    >
                        <option value={ActorAge.Child}>{t.office.casting.campaign.ageGroups.child}</option>
                        <option value={ActorAge.Young}>{t.office.casting.campaign.ageGroups.young}</option>
                        <option value={ActorAge.MiddleAged}>{t.office.casting.campaign.ageGroups.middleAged}</option>
                        <option value={ActorAge.Old}>{t.office.casting.campaign.ageGroups.old}</option>
                    </select>
                </div>
            )}

            <div className="mt-4 p-4 bg-gray-900/50 rounded-md border border-gray-700 text-center">
                <p className="text-lg">{t.office.casting.campaign.details.cost}: <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>{cost > 0 ? formatCurrency(cost) : t.office.casting.setup.free}</span></p>
                <p className="text-sm text-gray-400">{t.office.casting.campaign.details.duration}: {duration[0]}-{duration[1]} {t.project.casting.days}</p>
                <p className="text-sm text-gray-400">{t.office.casting.campaign.details.talents}: {talents}</p>
            </div>
            
            <div className="flex gap-4 mt-6">
                <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-sm uppercase text-sm">{t.common.back}</button>
                <button onClick={handleStartCampaign} disabled={!canAfford || isEmployeeBusy} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-sm uppercase text-sm disabled:bg-gray-600">{t.office.casting.campaign.start}</button>
            </div>
            {!canAfford && <p className="text-red-400 text-xs text-center">{t.project.casting.insufficientFunds}</p>}
            {isEmployeeBusy && <p className="text-red-400 text-xs text-center">{t.office.casting.campaign.alreadyActive}</p>}
        </div>
    );
};


const CastingSetupView: React.FC<{
    employee: Employee;
    onClose: () => void;
    onComplete: () => void;
}> = ({ employee, onClose, onComplete }) => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    const [selectedTalentId, setSelectedTalentId] = useState<string>('');
    const [castingType, setCastingType] = useState<'stufe' | 'permanent'>('stufe');
    const [roleFilter, setRoleFilter] = useState<'director' | 'actor'>('actor');
    const [favoriteFilter, setFavoriteFilter] = useState<'all' | 'favorites'>('all');

    const availableTalents = useMemo(() => {
        if (!playerData) return [];
        let talents: (Director | Actor)[] = [];
        if (roleFilter === 'director') {
            talents = playerData.directors;
        } else {
            talents = playerData.actors;
        }

        return talents
            .filter(t => {
                const isDiscovered = t.isDiscovered;
                const notMaxFame = t.bekanntheit < 5;
                const isFavorite = favoriteFilter === 'favorites' ? t.isFavorite === true : true;
                return isDiscovered && notMaxFame && isFavorite;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [playerData, roleFilter, favoriteFilter]);
    
    useEffect(() => {
        if (availableTalents.length > 0) {
            const currentSelectionExists = availableTalents.some(t => String(t.id) === selectedTalentId);
            if (!currentSelectionExists) {
                setSelectedTalentId(String(availableTalents[0].id));
            }
        } else {
            setSelectedTalentId('');
        }
    }, [availableTalents, selectedTalentId]);
    
    const { cost, duration } = useMemo(() => {
        if (!selectedTalentId) return { cost: 0, duration: 0 };
        const talent = availableTalents.find(t => String(t.id) === selectedTalentId);
        if (!talent) return { cost: 0, duration: 0 };
        
        const casterTalent = employee.talent;

        const calculatedDuration = Math.max(3, Math.round(50 - (casterTalent * 0.4)));
        const calculatedCost = 0; // Casting for known talents is free.

        return { cost: calculatedCost, duration: calculatedDuration };
    }, [selectedTalentId, availableTalents, employee.talent]);
    
    if (!playerData) return null;
    
    // Check if this employee is busy
    const isEmployeeBusy = playerData.activeCastings && playerData.activeCastings.some(c => c.casterId === employee.id);

    const handleStartCasting = () => {
        const talent = availableTalents.find(t => String(t.id) === selectedTalentId);
        if (!talent || isEmployeeBusy) return;
        
        const targetBekanntheit = castingType === 'permanent' ? 5 : talent.bekanntheit + 1;

        const endDate = new Date(playerData.gameDate);
        endDate.setDate(endDate.getDate() + duration);

        setPlayerData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                activeCastings: [...(prev.activeCastings || []), {
                    talentId: talent.id,
                    casterId: employee.id,
                    startDate: new Date(prev.gameDate),
                    endDate,
                    cost: 0, // It's free
                    talentName: talent.name,
                    targetBekanntheit,
                }],
            }
        });
        onComplete();
    };

    const selectedTalent = availableTalents.find(t => String(t.id) === selectedTalentId);
    
    return (
        <div className="space-y-4">
             <h4 className="text-lg font-bold text-white mb-4 text-center">{t.office.casting.setup.title}</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.office.casting.setup.role}</label>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as 'director' | 'actor')} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2">
                        <option value="actor">{t.office.casting.setup.roleActor}</option>
                        <option value="director">{t.office.casting.setup.roleDirector}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.office.casting.setup.filter}</label>
                    <select value={favoriteFilter} onChange={e => setFavoriteFilter(e.target.value as 'all' | 'favorites')} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2">
                        <option value="all">{t.office.casting.setup.all}</option>
                        <option value="favorites">{t.office.casting.setup.favorites}</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t.office.casting.setup.selectTalent}</label>
                <select value={selectedTalentId} onChange={e => setSelectedTalentId(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2" disabled={availableTalents.length === 0}>
                    {availableTalents.length > 0 ? (
                        availableTalents.map(t => <option key={t.id} value={t.id}>{t.name} (Fame: {t.bekanntheit})</option>)
                    ) : (
                        <option>{t.office.casting.setup.noTalent}</option>
                    )}
                </select>
            </div>
            {selectedTalent && (
                <>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-md flex-1 cursor-pointer">
                            <input type="radio" name="castingType" value="stufe" checked={castingType === 'stufe'} onChange={() => setCastingType('stufe')} />
                            <span>{t.office.casting.setup.typeLevel} ({selectedTalent.bekanntheit + 1})</span>
                        </label>
                         <label className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-md flex-1 cursor-pointer">
                            <input type="radio" name="castingType" value="permanent" checked={castingType === 'permanent'} onChange={() => setCastingType('permanent')} />
                            <span>{t.office.casting.setup.typePermanent}</span>
                        </label>
                    </div>
                    <div className="mt-4 p-4 bg-gray-900/50 rounded-md border border-gray-700 text-center">
                        <p className="text-lg">{t.office.casting.setup.cost} <span className="font-bold text-green-400">{t.office.casting.setup.free}</span></p>
                        <p className="text-sm text-gray-400">{t.office.casting.setup.duration} {duration} {t.project.casting.days}</p>
                    </div>
                </>
            )}
            <div className="flex gap-4 mt-6">
                <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-sm uppercase text-sm">{t.common.back}</button>
                <button onClick={handleStartCasting} disabled={!selectedTalent || isEmployeeBusy} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-sm uppercase text-sm disabled:bg-gray-600">{t.office.casting.setup.start}</button>
            </div>
             {isEmployeeBusy && <p className="text-red-400 text-xs text-center">{t.office.casting.setup.alreadyActive}</p>}
        </div>
    );
};

export const TalentManagementTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [auftragModalEmployee, setAuftragModalEmployee] = useState<Employee | null>(null);
    const [showCastingSetup, setShowCastingSetup] = useState(false);
    const [showCampaignSetup, setShowCampaignSetup] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState<Employee | null>(null);
    const [showGeneralCastingConfirm, setShowGeneralCastingConfirm] = useState(false);

    if (!playerData) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const typeMap: Record<EmployeeType, keyof typeof t.office.employees.employeeTypes> = {
        [EmployeeType.Autor]: 'autor',
        [EmployeeType.CastingMitarbeiter]: 'castingMitarbeiter',
        [EmployeeType.Forscher]: 'forscher',
        [EmployeeType.Marketingmanager]: 'marketingmanager',
        [EmployeeType.ProjektPlaner]: 'projektPlaner',
    };
    
    const getTranslatedEmployeeType = (type: EmployeeType) => {
        const key = typeMap[type];
        return t.office.employees.employeeTypes[key] || type;
    };

    const castingMitarbeiter = useMemo(() => {
        const agents = playerData.employees.filter(e => e.type === EmployeeType.CastingMitarbeiter);
        
        // Add Partner if applicable
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.CastingMitarbeiter) {
            const partnerAgent: Employee = {
                id: 99901,
                name: `${playerData.partnerName} (Partner)`,
                type: EmployeeType.CastingMitarbeiter,
                talent: playerData.partnerSkills?.scouting || 0,
                salary: 0,
                experience: 0,
                satisfaction: 100,
                portraitUrl: playerData.partnerPortraitId ? `https://www.schnoxcore.com/media/portraits/${playerData.partnerPortraitId}.png` : undefined
            };
            agents.push(partnerAgent);
        }

        // Add Children if applicable
        playerData.children.forEach((child, index) => {
             if (child.isEmployed && child.employedAs === EmployeeType.CastingMitarbeiter) {
                 agents.push({
                    id: 99910 + index,
                    name: `${child.name} (Kind)`,
                    type: EmployeeType.CastingMitarbeiter,
                    talent: child.skills?.scouting || 0,
                    salary: 0,
                    experience: 0,
                    satisfaction: 100,
                    portraitUrl: child.portraitId ? `https://www.schnoxcore.com/media/kinder/${child.portraitId}.png` : undefined 
                 });
             }
        });

        return agents;
    }, [playerData]);
    
    const getEmployeeTask = (employee: Employee) => {
        if (employee.activeTraining) {
            return t.widgets.activities.inTraining + ` ${new Date(employee.activeTraining.endDate).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}`;
        }
        
        // Check Active Casting
        const activeCasting = playerData.activeCastings?.find(c => c.casterId === employee.id);
        if (activeCasting) {
            const taskPrefix = activeCasting.isGeneralCasting ? "Allg. Casting" : "Casting";
            return `${taskPrefix} für: ${activeCasting.talentName}`;
        }
        
        // Check Scouting
        const activeScouting = playerData.activeTalentScoutings?.find(s => s.scoutId === employee.id);
        if (activeScouting) {
            const params = activeScouting.searchParams;
            return `${t.widgets.activities.scouting} (${params.qualityTier}, ${params.role})`;
        }
        
        // Check Campaign
        const activeCampaign = playerData.activeCastingCampaigns?.find(c => c.casterId === employee.id);
        if (activeCampaign) {
            const scopeText = t.office.casting.campaign.scopes[activeCampaign.scope] || activeCampaign.scope;
            return `${t.widgets.activities.campaign} (${scopeText}) bis ${new Date(activeCampaign.endDate).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}`;
        }
        
        return t.office.casting.noAssignment;
    };
    
    const handleCloseModal = () => {
        setAuftragModalEmployee(null);
        setShowCastingSetup(false);
        setShowCampaignSetup(false);
    };

    const handleCancelCasting = () => {
        if (!showCancelConfirm) return;

        setPlayerData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                activeCastings: (prev.activeCastings || []).filter(c => c.casterId !== showCancelConfirm.id),
                activeCastingCampaigns: (prev.activeCastingCampaigns || []).filter(c => c.casterId !== showCancelConfirm.id),
                activeTalentScoutings: (prev.activeTalentScoutings || []).filter(s => s.scoutId !== showCancelConfirm.id),
            };
        });
        setShowCancelConfirm(null);
    };

    const handleStartGeneralCasting = () => {
        if (!playerData || !auftragModalEmployee) return;
    
        const findFirstAvailableTalent = () => {
            const potentialTargets = [...playerData.directors, ...playerData.actors]
                .filter(t => t.isDiscovered && t.bekanntheit < 5)
                .sort((a,b) => a.id - b.id);
    
            for (const target of potentialTargets) {
                let isTalentBusy = false;
                if (target.unavailableForProjectsUntil && new Date(playerData.gameDate) < new Date(target.unavailableForProjectsUntil)) isTalentBusy = true;
                else if (target.activeTraining) isTalentBusy = true;
                else if (playerData.currentProject) {
                    const proj = playerData.currentProject;
                    const isTalentInProject = proj.directorId === target.id || proj.mainActorId === target.id || proj.supportingActorId === target.id;
                    const isActivePhase = proj.phase === ProjectPhase.Casting || proj.phase === ProjectPhase.Production;
                    if (isTalentInProject && isActivePhase) isTalentBusy = true;
                }
                
                // Also check if talent is busy in ANOTHER casting mission
                if (playerData.activeCastings && playerData.activeCastings.some(c => c.talentId === target.id)) isTalentBusy = true;

                if (!isTalentBusy) return target;
            }
            return null;
        };
    
        const firstTalent = findFirstAvailableTalent();
    
        if (!firstTalent) {
            alert("No available talents for general casting found.");
            return;
        }
        
        const casterTalent = auftragModalEmployee.talent;
        const duration = Math.max(3, Math.round(50 - (casterTalent * 0.4)));
        const endDate = new Date(playerData.gameDate);
        endDate.setDate(endDate.getDate() + duration);
    
        setPlayerData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                activeCastings: [...(prev.activeCastings || []), {
                    talentId: firstTalent.id,
                    casterId: auftragModalEmployee.id,
                    startDate: new Date(prev.gameDate),
                    endDate,
                    cost: 0,
                    talentName: firstTalent.name,
                    isGeneralCasting: true,
                }],
            }
        });
        handleCloseModal();
    };

    return (
        <>
            <div className="w-full h-full flex flex-col">
                <div className="bg-gray-800/80 p-4 rounded-lg shadow-2xl border border-gray-700 overflow-y-auto">
                    <h2 className="text-2xl font-cinzel text-amber-400 mb-4 text-center">{t.office.casting.title}</h2>
                    <div className="space-y-3">
                        {castingMitarbeiter.length > 0 ? (
                            castingMitarbeiter.map(employee => {
                                const isCasting = playerData.activeCastings?.some(c => c.casterId === employee.id);
                                const isCampaign = playerData.activeCastingCampaigns?.some(c => c.casterId === employee.id);
                                const isScouting = playerData.activeTalentScoutings?.some(s => s.scoutId === employee.id);
                                const isBusy = isCasting || isCampaign || isScouting;
                                const isTraining = !!employee.activeTraining;

                                return (
                                <div key={employee.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-600 flex items-center justify-center">
                                        {employee.portraitUrl ? (
                                            <img src={employee.portraitUrl} alt={employee.name} className="w-full h-full object-cover" draggable="false" />
                                        ) : (
                                            <PersonalIcon className="w-10 h-10 text-gray-400 p-1" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-bold text-lg text-white">{employee.name}</p>
                                            <StarRating rating={employee.talent} />
                                        </div>
                                        <p className="text-sm text-gray-400">{getEmployeeTask(employee)}</p>
                                    </div>
                                    {isBusy ? (
                                        <button 
                                            onClick={() => setShowCancelConfirm(employee)}
                                            className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-sm uppercase text-sm"
                                        >
                                            {t.office.casting.cancelJob}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setAuftragModalEmployee(employee)}
                                            disabled={isTraining}
                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-sm uppercase text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        >
                                            {t.office.casting.assignJob}
                                        </button>
                                    )}
                                </div>
                            )})
                        ) : (
                            <p className="text-center text-gray-500 italic py-8">{t.office.casting.noStaffHint}</p>
                        )}
                    </div>
                </div>
            </div>

            {auftragModalEmployee && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-4xl text-white animate-fade-in flex flex-row" onClick={e => e.stopPropagation()}>
                        
                        {/* Left Column (Dossier) */}
                        <div className="w-1/3 bg-gray-900/50 p-6 border-r border-gray-700 flex flex-col items-center">
                            <div className="w-40 h-40 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600 mb-4 overflow-hidden">
                                {auftragModalEmployee.portraitUrl ? (
                                    <img src={auftragModalEmployee.portraitUrl} alt={auftragModalEmployee.name} className="w-full h-full object-cover" draggable="false" />
                                ) : (
                                    <PersonalIcon className="w-24 h-24 text-amber-300" />
                                )}
                            </div>
                            <h2 className="text-2xl font-bold font-cinzel text-amber-400 text-center">{auftragModalEmployee.name}</h2>
                            <p className="text-lg text-gray-400">{getTranslatedEmployeeType(auftragModalEmployee.type)}</p>
                            
                            <div className="w-full mt-4 pt-4 border-t border-gray-700 space-y-3 text-sm">
                                <div className="flex justify-between items-center"><span className="text-gray-400">{t.office.casting.modal.talent}</span> <StarRating rating={auftragModalEmployee.talent}/></div>
                                <div>
                                    <ProgressBar progress={auftragModalEmployee.satisfaction} color="bg-yellow-500" label={t.office.casting.modal.satisfaction} />
                                </div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">{t.office.casting.modal.salary}</span> <span className="font-bold">{formatCurrency(auftragModalEmployee.salary)}</span></div>
                            </div>

                            <button onClick={handleCloseModal} className="mt-12 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider transition-colors">
                                {t.office.casting.modal.close}
                            </button>
                        </div>

                        {/* Right Column (Auftrag) */}
                        <div className="w-2/3 flex flex-col p-6">
                            {showCastingSetup ? (
                                <CastingSetupView 
                                    employee={auftragModalEmployee} 
                                    onClose={() => setShowCastingSetup(false)} 
                                    onComplete={handleCloseModal}
                                />
                            ) : showCampaignSetup ? (
                                <CampaignSetupView 
                                    employee={auftragModalEmployee} 
                                    onClose={() => setShowCampaignSetup(false)} 
                                    onComplete={handleCloseModal}
                                />
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold font-cinzel text-amber-400 mb-6 text-center">{t.office.casting.modal.title}</h3>
                                    <div className="space-y-4">
                                        <button onClick={() => setShowCastingSetup(true)} className="w-full flex items-center justify-between p-4 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-left">
                                            <div className="flex items-center gap-4">
                                                <CastingIcon className="h-8 w-8 text-cyan-400"/>
                                                <div>
                                                    <p className="font-bold text-lg">{t.office.casting.modal.specificCasting}</p>
                                                    <p className="text-xs text-gray-400">{t.office.casting.modal.specificCastingDesc}</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button onClick={() => setShowGeneralCastingConfirm(true)} className="w-full flex items-center justify-between p-4 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-left">
                                            <div className="flex items-center gap-4">
                                                <HandshakeIcon className="h-8 w-8 text-blue-400"/>
                                                <div>
                                                    <p className="font-bold text-lg">{t.office.casting.modal.generalCasting}</p>
                                                    <p className="text-xs text-gray-400">{t.office.casting.modal.generalCastingDesc}</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button onClick={() => setShowCampaignSetup(true)} className="w-full flex items-center justify-between p-4 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-left">
                                            <div className="flex items-center gap-4">
                                                <ScoutingIcon className="h-8 w-8 text-purple-400"/>
                                                <div>
                                                    <p className="font-bold text-lg">{t.office.casting.modal.startCampaign}</p>
                                                    <p className="text-xs text-gray-400">{t.office.casting.modal.startCampaignDesc}</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCancelConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCancelConfirm(null)}>
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.office.casting.cancel.confirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">
                            {t.office.casting.cancel.confirmText}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowCancelConfirm(null)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.no}</button>
                            <button onClick={handleCancelCasting} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.common.yes}, {t.office.casting.cancelJob.toLowerCase()}</button>
                        </div>
                    </div>
                </div>
            )}
            {showGeneralCastingConfirm && auftragModalEmployee && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGeneralCastingConfirm(false)}>
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.office.casting.general.confirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">
                            {t.office.casting.general.confirmText.replace(/{name}/g, auftragModalEmployee.name)}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowGeneralCastingConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button onClick={() => { handleStartGeneralCasting(); setShowGeneralCastingConfirm(false); }} className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all">{t.common.confirm}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TalentManagementTab;
