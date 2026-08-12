
import React from 'react';
import { PlayerData, GameState, EmployeeType } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { BUILDING_DATA } from './buildings';
import { RESEARCH_TECHS } from './research';
import { daysToHours } from '../hooks/timeUtils';

interface ActivitiesModalProps {
    onClose: () => void;
    onNavigate: (state: GameState, subTab?: any) => void;
    playerData: PlayerData;
}

const calculateProgress = (start: Date, end: Date, current: Date) => {
    const totalDuration = new Date(end).getTime() - new Date(start).getTime();
    if (totalDuration <= 0) return 100;
    const elapsed = new Date(current).getTime() - new Date(start).getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};

const getHoursRemaining = (endDate: Date, gameDate: Date) => 
    Math.max(0, daysToHours((new Date(endDate).getTime() - gameDate.getTime()) / 86400000));

const calculateResearchProgress = (progressPoints: number, requiredPoints: number) => {
    if (requiredPoints <= 0) return 100;
    return Math.min(100, Math.max(0, (progressPoints / requiredPoints) * 100));
};

const ActivityRow: React.FC<{
    title: string;
    subtitle: string;
    progress: number;
    detailLabel: string;
    color: string;
    onGo: () => void;
    t: any;
}> = ({ title, subtitle, progress, detailLabel, color, onGo, t }) => (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-white text-sm">{title}</h4>
                <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
            <button 
                onClick={onGo}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded transition-colors"
            >
                {t.common.ok} &rarr;
            </button>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative">
            <div 
                className={`${color} h-full rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${progress}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                {Math.round(progress)}% ({detailLabel})
            </div>
        </div>
    </div>
);

const ActivitiesModal: React.FC<ActivitiesModalProps> = ({ onClose, onNavigate, playerData }) => {
    const { t, language } = useTranslation();
    const gameDate = playerData.gameDate;
    
    // Constructions array fallback
    const constructions = playerData.activeConstructions || (playerData.activeConstruction ? [playerData.activeConstruction] : []);
    
    // New Arrays fallback
    const activeCastings = playerData.activeCastings || [];
    const activeCastingCampaigns = playerData.activeCastingCampaigns || [];
    const activeTalentScoutings = playerData.activeTalentScoutings || [];

    // Helper to resolve generic names (Employee, Partner, Child)
    const resolveName = (id: number): string => {
        if (id === 99901) return `${playerData.partnerName} (Partner)`;
        if (id >= 99910) {
            const child = playerData.children.find(c => parseInt(c.id.split('_')[1]) === id || (99910 + playerData.children.indexOf(c)) === id); 
            // Fallback ID matching logic for display
            return child ? `${child.name} (Kind)` : 'Kind';
        }
        const emp = playerData.employees.find(e => e.id === id);
        return emp ? emp.name : 'Mitarbeiter';
    };
    
    const scopeTranslations: Record<'small' | 'medium' | 'large', string> = {
        small: language === 'de' ? 'klein' : 'small',
        medium: language === 'de' ? 'mittel' : 'medium',
        large: language === 'de' ? 'groß' : 'large',
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/80 rounded-t-lg">
                    <h2 className="text-xl font-bold font-cinzel text-amber-400">{t.widgets.activities.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
                    {/* 1. PROJECT PLANNING */}
                    {playerData.activePlanning && (
                        <ActivityRow 
                            title={t.widgets.activities.planning}
                            subtitle={`"${playerData.activePlanning.workingTitle}"`}
                            progress={calculateProgress(playerData.activePlanning.scriptStartDate, playerData.activePlanning.scriptEndDate, gameDate)}
                            detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(playerData.activePlanning.scriptEndDate, gameDate).toString())}
                            color="bg-cyan-500"
                            onGo={() => { onNavigate(GameState.Projects); onClose(); }}
                            t={t}
                        />
                    )}

                    {/* 2. SCRIPT WRITING */}
                    {playerData.activeWriting && (
                        <ActivityRow 
                            title={t.widgets.activities.writing}
                            subtitle={`"${playerData.activeWriting.script.title}"`}
                            progress={calculateProgress(playerData.activeWriting.startDate, playerData.activeWriting.endDate, gameDate)}
                            detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(playerData.activeWriting.endDate, gameDate).toString())}
                            color="bg-purple-500"
                            onGo={() => { onNavigate(GameState.Projects, 'scripts'); onClose(); }}
                            t={t}
                        />
                    )}

                    {/* 3. RESEARCH */}
                    {playerData.activeResearch && (
                        <ActivityRow 
                            title={t.widgets.activities.research}
                            subtitle={RESEARCH_TECHS.find(tech => tech.id === playerData.activeResearch!.techId)?.name || '...'}
                            progress={calculateResearchProgress(playerData.activeResearch.progressPoints, playerData.activeResearch.requiredPoints)}
                            detailLabel={t.widgets.activities.remainingPoints.replace('{points}', Math.max(0, playerData.activeResearch.requiredPoints - playerData.activeResearch.progressPoints).toString())}
                            color="bg-sky-500"
                            onGo={() => { onNavigate(GameState.Research); onClose(); }}
                            t={t}
                        />
                    )}

                    {/* 4. CONSTRUCTION (Multiple) */}
                    {constructions.map((construction, idx) => (
                        <ActivityRow 
                            key={`construction_${idx}_${construction.buildingType}`}
                            title={t.widgets.activities.construction}
                            subtitle={construction.buildingType}
                            progress={calculateProgress(
                                new Date(construction.endDate.getTime() - daysToHours(BUILDING_DATA[construction.buildingType].levels[playerData.buildings.find(b=>b.type===construction.buildingType)?.level || 0]?.duration || 10) * 3600000), 
                                construction.endDate, 
                                gameDate
                            )}
                            detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(construction.endDate, gameDate).toString())}
                            color="bg-orange-500"
                            onGo={() => { onNavigate(GameState.Studiogelaende); onClose(); }}
                            t={t}
                        />
                    ))}

                    {/* 5. INDIVIDUAL CASTING (Array) */}
                    {activeCastings.map((casting, idx) => (
                        <ActivityRow 
                            key={`casting_${idx}_${casting.talentId}`}
                            title={t.widgets.activities.castingScouting}
                            subtitle={`${casting.talentName} (${resolveName(casting.casterId)})`}
                            progress={calculateProgress(casting.startDate!, casting.endDate, gameDate)}
                            detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(casting.endDate, gameDate).toString())}
                            color="bg-cyan-400"
                            onGo={() => { onNavigate(GameState.Office, 'talent_management'); onClose(); }}
                            t={t}
                        />
                    ))}

                    {/* 6. CASTING CAMPAIGN (Array) */}
                    {activeCastingCampaigns.map((campaign, idx) => {
                        const scopeText = (scopeTranslations as any)[campaign.scope] || campaign.scope;
                        return (
                            <ActivityRow 
                                key={`campaign_${idx}_${campaign.casterId}`}
                                title={t.widgets.activities.campaign}
                                subtitle={`${scopeText} (${resolveName(campaign.casterId)})`}
                                progress={calculateProgress(campaign.startDate, campaign.endDate, gameDate)}
                                detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(campaign.endDate, gameDate).toString())}
                                color="bg-purple-400"
                                onGo={() => { onNavigate(GameState.Office, 'talent_management'); onClose(); }}
                                t={t}
                            />
                        );
                    })}

                    {/* 7. SCOUTING (Array) */}
                    {activeTalentScoutings.map((scouting, idx) => (
                        <ActivityRow 
                            key={`scouting_${idx}_${scouting.scoutId}`}
                            title={t.widgets.activities.scouting}
                            subtitle={`${scouting.searchParams.qualityTier} (${resolveName(scouting.scoutId)})`}
                            progress={100} // Indeterminate mostly, or simple countdown
                            detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(scouting.endDate, gameDate).toString())}
                            color="bg-indigo-400"
                            onGo={() => { onNavigate(GameState.Office, 'talent_management'); onClose(); }}
                            t={t}
                        />
                    ))}
                    
                    {/* 8. EMPLOYEE TRAINING */}
                    {playerData.employees.map(emp => {
                        if (!emp.activeTraining) return null;
                        return (
                            <ActivityRow 
                                key={`emp_train_${emp.id}`}
                                title={t.widgets.activities.inTraining}
                                subtitle={emp.name}
                                progress={calculateProgress(emp.activeTraining.startDate!, emp.activeTraining.endDate, gameDate)}
                                detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(emp.activeTraining.endDate, gameDate).toString())}
                                color="bg-yellow-500"
                                onGo={() => { onNavigate(GameState.Office, 'employees'); onClose(); }}
                                t={t}
                            />
                        );
                    })}

                    {/* 9. FAMILY TRAINING (Partner) */}
                    {playerData.partnerActiveTraining && (
                         <ActivityRow 
                            title={t.widgets.activities.inTraining}
                            subtitle={`${playerData.partnerName || 'Partner'} (${playerData.partnerActiveTraining.skill})`}
                            progress={calculateProgress(playerData.partnerActiveTraining.startDate, playerData.partnerActiveTraining.endDate, gameDate)}
                            detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(playerData.partnerActiveTraining.endDate, gameDate).toString())}
                            color="bg-pink-500"
                            onGo={() => { onNavigate(GameState.Privatleben); onClose(); }}
                            t={t}
                        />
                    )}

                    {/* 10. FAMILY TRAINING (Children) */}
                    {playerData.children.map(child => {
                        if (!child.activeTraining) return null;
                        return (
                             <ActivityRow 
                                key={`child_train_${child.id}`}
                                title={t.widgets.activities.inTraining}
                                subtitle={`${child.name} (${child.activeTraining.skill})`}
                                progress={calculateProgress(child.activeTraining.startDate, child.activeTraining.endDate, gameDate)}
                                detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(child.activeTraining.endDate, gameDate).toString())}
                                color="bg-blue-400"
                                onGo={() => { onNavigate(GameState.Privatleben); onClose(); }}
                                t={t}
                            />
                        );
                    })}

                    {/* 11. SEMINARS / LEISURE (NEW) */}
                    {playerData.activeSeminar && (
                        <ActivityRow 
                            title={playerData.activeSeminar.type === 'seminar' ? t.privatelife.education.seminarsTitle : t.privatelife.education.leisureTitle}
                            subtitle={`"${playerData.activeSeminar.name}"`}
                            progress={calculateProgress(
                                new Date(playerData.activeSeminar.endDate.getTime() - daysToHours(playerData.activeSeminar.type === 'seminar' ? 2 : 1) * 3600000), 
                                playerData.activeSeminar.endDate, 
                                gameDate
                            )}
                            detailLabel={t.widgets.activities.days.replace('{days}', getHoursRemaining(playerData.activeSeminar.endDate, gameDate).toString())}
                            color={playerData.activeSeminar.type === 'seminar' ? "bg-amber-500" : "bg-green-400"}
                            onGo={() => { onNavigate(GameState.Privatleben); onClose(); }}
                            t={t}
                        />
                    )}

                    {/* EMPTY STATE CHECK */}
                    {(!playerData.activePlanning && !playerData.activeWriting && !playerData.activeResearch && 
                      constructions.length === 0 && 
                      activeCastings.length === 0 && 
                      activeCastingCampaigns.length === 0 &&
                      activeTalentScoutings.length === 0 && 
                      !playerData.employees.some(e=>e.activeTraining) &&
                      !playerData.partnerActiveTraining && !playerData.children.some(c=>c.activeTraining) &&
                      !playerData.activeSeminar) && (
                        <div className="text-center py-10 text-gray-500 italic">
                            {t.widgets.activities.noActivities}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivitiesModal;
