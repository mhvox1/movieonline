


import React, { useMemo } from 'react';
import { RESEARCH_TECHS } from '../research';
import { BUILDING_DATA } from '../buildings';
import DashboardWidget from '../DashboardWidget';
import { useGame } from '../../contexts/GameContext';
import { GameState, BuildingType, EmployeeType, OfficeTabType, Employee } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { CurrentViewType } from '../NewProjectScreen_Phase1';
import { daysToHours } from '../../hooks/timeUtils';

interface StudioActivitiesWidgetProps {
    onNavigate: (state: GameState) => void;
    onNavigateToOfficeTab: (tab: OfficeTabType) => void;
    onNavigateToStudiogelaendeBuilding: (building: BuildingType) => void;
    onNavigateToProjectsView: (view: CurrentViewType) => void;
    onOpenModal?: () => void; // New Prop
}

const ProgressBar: React.FC<{ progress: number, text?: string, color?: string }> = ({ progress, text, color = 'bg-green-500' }) => (
    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 mt-1">
        <div 
            className={`${color} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-bold text-black`} 
            style={{ width: `${progress}%` }}>
              {text || `${Math.round(progress)}%`}
        </div>
    </div>
);

const getHoursRemaining = (endDate: Date, gameDate: Date) => Math.max(0, daysToHours((new Date(endDate).getTime() - gameDate.getTime()) / 86400000));

const calculateResearchProgress = (progressPoints: number, requiredPoints: number) => {
    if (requiredPoints <= 0) return 100;
    return Math.min(100, Math.max(0, (progressPoints / requiredPoints) * 100));
};

const calculateProgress = (start: Date, end: Date, current: Date) => {
    const totalDuration = new Date(end).getTime() - new Date(start).getTime();
    if (totalDuration <= 0) return 100;
    const elapsed = new Date(current).getTime() - new Date(start).getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};

interface ActivityItem {
    id: string;
    endDate: Date;
    render: () => React.ReactNode;
}

const StudioActivitiesWidget: React.FC<StudioActivitiesWidgetProps> = ({ onNavigate, onNavigateToOfficeTab, onNavigateToStudiogelaendeBuilding, onNavigateToProjectsView, onOpenModal }) => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    
    if (!playerData) return null;
    
    const { activeResearch, activeConstructions, activeConstruction, gameDate, buildings, activePlanning, employees, activeCastings, activeTalentScoutings, activeCastingCampaigns, activeWriting } = playerData;

    // Aggregate ALL Casting Agents (Employees + Family)
    const castingAgents = useMemo(() => {
        // 1. Regular Employees
        const agents: Employee[] = employees.filter(e => e.type === EmployeeType.CastingMitarbeiter);

        // 2. Partner (if employed as Casting Agent)
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.CastingMitarbeiter) {
            agents.push({
                id: 99901, // Standard Family Partner ID
                name: `${playerData.partnerName} (Partner)`,
                type: EmployeeType.CastingMitarbeiter,
                talent: 0, salary: 0, experience: 0, satisfaction: 100 // Dummy values needed for type
            } as Employee);
        }

        // 3. Children (if employed as Casting Agent)
        playerData.children.forEach((child, index) => {
            if (child.isEmployed && child.employedAs === EmployeeType.CastingMitarbeiter) {
                agents.push({
                    id: 99910 + index, // Standard Family Child ID offset
                    name: `${child.name} (Kind)`,
                    type: EmployeeType.CastingMitarbeiter,
                    talent: 0, salary: 0, experience: 0, satisfaction: 100
                } as Employee);
            }
        });

        return agents;
    }, [employees, playerData.partnerIsEmployed, playerData.partnerEmployedAs, playerData.children, playerData.partnerName]);

    const scopeTranslations: Record<'small' | 'medium' | 'large', string> = {
        small: language === 'de' ? 'klein' : 'small',
        medium: language === 'de' ? 'mittel' : 'medium',
        large: language === 'de' ? 'groß' : 'large',
    };
    
    const allActivities: ActivityItem[] = [];

    // 1. PROJEKTPLANUNG
    if (activePlanning) {
        allActivities.push({
            id: 'planning',
            endDate: new Date(activePlanning.scriptEndDate),
            render: () => {
                const startDate = new Date(activePlanning.scriptStartDate);
                const endDate = new Date(activePlanning.scriptEndDate);
                const progress = calculateProgress(startDate, endDate, gameDate);
                const hoursRemaining = getHoursRemaining(endDate, gameDate);

                return (
                    <div>
                        <div className="flex justify-between items-baseline text-sm mb-1">
                            <span className="font-bold text-cyan-400">{t.widgets.activities.planning}</span>
                            <span className="text-xs text-gray-400">{t.widgets.activities.days.replace('{days}', hoursRemaining.toString())}</span>
                        </div>
                        <p className="text-xs text-white truncate mb-1">"{activePlanning.workingTitle}"</p>
                        <ProgressBar progress={progress} text={`${Math.round(progress)}%`} color="bg-cyan-500" />
                    </div>
                );
            }
        });
    }

    // 2. DREHBUCH
    if (activeWriting) {
        allActivities.push({
            id: 'writing',
            endDate: new Date(activeWriting.endDate),
            render: () => {
                const startDate = new Date(activeWriting.startDate);
                const endDate = new Date(activeWriting.endDate);
                const progress = calculateProgress(startDate, endDate, gameDate);
                const hoursRemaining = getHoursRemaining(endDate, gameDate);

                return (
                    <div>
                        <div className="flex justify-between items-baseline text-sm mb-1">
                            <span className="font-bold text-purple-400">{t.widgets.activities.writing}</span>
                            <span className="text-xs text-gray-400">{t.widgets.activities.days.replace('{days}', hoursRemaining.toString())}</span>
                        </div>
                        <p className="text-xs text-white truncate mb-1">"{activeWriting.script.title}"</p>
                        <ProgressBar progress={progress} text={`${Math.round(progress)}%`} color="bg-purple-500" />
                    </div>
                );
            }
        });
    }

    // 3. FORSCHUNG
    if (activeResearch) {
        allActivities.push({
            id: 'research',
            endDate: new Date(activeResearch.endDate),
            render: () => {
                const progress = calculateResearchProgress(activeResearch.progressPoints, activeResearch.requiredPoints);
                const remainingPoints = Math.max(0, activeResearch.requiredPoints - activeResearch.progressPoints);

                return (
                     <div>
                        <div className="flex justify-between items-baseline text-sm mb-1">
                            <span className="font-bold text-sky-400">{t.widgets.activities.research}</span>
                            <span className="text-xs text-gray-400">{t.widgets.activities.remainingPoints.replace('{points}', remainingPoints.toString())}</span>
                        </div>
                        <p className="text-xs text-white truncate mb-1">{RESEARCH_TECHS.find(t=>t.id === activeResearch.techId)?.name || '...'}</p>
                        <ProgressBar progress={progress} text={`${Math.round(progress)}%`} color="bg-sky-500" />
                    </div>
                );
            }
        });
    }

    // 4. BAUAUFTRÄGE
    // Use fallback array if not migrated
    const constructions = activeConstructions || (activeConstruction ? [activeConstruction] : []);
    
    constructions.forEach((construction, index) => {
        const building = buildings.find(b => b.type === construction.buildingType);
        const currentLevel = building?.level || 0;
        const nextLevelData = BUILDING_DATA[construction.buildingType].levels[currentLevel];
        
        if (nextLevelData) {
             allActivities.push({
                id: `construction_${index}_${construction.buildingType}`,
                endDate: new Date(construction.endDate),
                render: () => {
                    const durationInDays = nextLevelData.duration;
                    const endDate = new Date(construction.endDate);
                    const startDate = new Date(endDate);
                    startDate.setDate(endDate.getDate() - durationInDays);

                    const progress = calculateProgress(startDate, endDate, gameDate);
                    const hoursRemaining = getHoursRemaining(endDate, gameDate);
                
                    return (
                        <div>
                            <div className="flex justify-between items-baseline text-sm mb-1">
                                <span className="font-bold text-orange-400">{t.widgets.activities.construction}</span>
                                <span className="text-xs text-gray-400">{t.widgets.activities.days.replace('{days}', hoursRemaining.toString())}</span>
                            </div>
                            <p className="text-xs text-white truncate mb-1">{construction.buildingType} ({t.widgets.activities.level.replace('{level}', (currentLevel + 1).toString())})</p>
                            <ProgressBar progress={progress} text={`${Math.round(progress)}%`} color="bg-orange-500" />
                        </div>
                    );
                }
            });
        }
    });

    // 5. CASTING TASKS (Iterate agents)
    castingAgents.forEach(agent => {
        // Find matching task for THIS agent in the arrays
        const agentCasting = activeCastings?.find(c => c.casterId === agent.id);
        const agentCampaign = activeCastingCampaigns?.find(c => c.casterId === agent.id);
        const agentScouting = activeTalentScoutings?.find(s => s.scoutId === agent.id);

        if (agentCasting && agentCasting.startDate) {
            allActivities.push({
                id: `casting_${agent.id}`,
                endDate: new Date(agentCasting.endDate),
                render: () => {
                    const progress = calculateProgress(agentCasting.startDate!, agentCasting.endDate, gameDate);
                    const hoursRemaining = getHoursRemaining(agentCasting.endDate, gameDate);
                    return (
                        <div>
                             <div className="flex justify-between items-baseline text-sm mb-1">
                                <span className="font-bold text-cyan-400">{t.widgets.activities.castingScouting}</span>
                                <span className="text-xs text-gray-400">{t.widgets.activities.days.replace('{days}', hoursRemaining.toString())}</span>
                            </div>
                            <p className="text-xs text-white truncate mb-1">{agentCasting.talentName} ({agent.name})</p>
                            <ProgressBar progress={progress} color="bg-cyan-400" />
                        </div>
                    );
                }
            });
        } 
        else if (agentCampaign) {
             allActivities.push({
                id: `campaign_${agent.id}`,
                endDate: new Date(agentCampaign.endDate),
                render: () => {
                    const progress = calculateProgress(agentCampaign.startDate, agentCampaign.endDate, gameDate);
                    const scopeText = scopeTranslations[agentCampaign.scope] || agentCampaign.scope;
                    const hoursRemaining = getHoursRemaining(agentCampaign.endDate, gameDate);
                    
                    return (
                        <div>
                             <div className="flex justify-between items-baseline text-sm mb-1">
                                <span className="font-bold text-purple-400">{t.widgets.activities.campaign}</span>
                                <span className="text-xs text-gray-400">{t.widgets.activities.days.replace('{days}', hoursRemaining.toString())}</span>
                            </div>
                            <p className="text-xs text-white truncate mb-1">{scopeText} ({agent.name})</p>
                            <ProgressBar progress={progress} color="bg-purple-400" />
                        </div>
                    );
                }
            });
        } 
        else if (agentScouting) {
             allActivities.push({
                id: `scouting_${agent.id}`,
                endDate: new Date(agentScouting.endDate),
                render: () => {
                    const params = agentScouting.searchParams;
                    const hoursRemaining = getHoursRemaining(agentScouting.endDate, gameDate);
                     return (
                        <div>
                             <div className="flex justify-between items-baseline text-sm mb-1">
                                <span className="font-bold text-indigo-400">{t.widgets.activities.scouting}</span>
                                <span className="text-xs text-gray-400">{t.widgets.activities.days.replace('{days}', hoursRemaining.toString())}</span>
                            </div>
                            <p className="text-xs text-white truncate mb-1">{params.qualityTier} ({agent.name})</p>
                            <ProgressBar progress={100} text="..." color="bg-indigo-400" />
                        </div>
                    );
                }
            });
        }
        else if (agent.activeTraining) {
            allActivities.push({
                id: `training_${agent.id}`,
                endDate: new Date(agent.activeTraining.endDate),
                render: () => {
                    const endDate = new Date(agent.activeTraining!.endDate);
                    const hoursRemaining = getHoursRemaining(endDate, gameDate);
                    return (
                        <div>
                             <div className="flex justify-between items-baseline text-sm mb-1">
                                <span className="font-bold text-yellow-400">{t.widgets.activities.inTraining}</span>
                                <span className="text-xs text-gray-400">{t.widgets.activities.days.replace('{days}', hoursRemaining.toString())}</span>
                            </div>
                            <p className="text-xs text-white truncate mb-1">{agent.name}</p>
                            <ProgressBar progress={100} text="..." color="bg-yellow-500" />
                        </div>
                    );
                }
            });
        }
    });

    // Sort by End Date (Soonest first)
    allActivities.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

    // Pick the most urgent one
    const mostUrgentActivity = allActivities.length > 0 ? allActivities[0] : null;

    // Modified wrapper: Make the whole widget clickable to open the modal
    return (
        <div onClick={onOpenModal} className="cursor-pointer hover:scale-[1.01] transition-transform duration-200">
            <DashboardWidget title={t.widgets.activities.title}>
                {mostUrgentActivity ? (
                    mostUrgentActivity.render()
                ) : (
                    <p className="text-gray-500 text-center italic py-2">{t.widgets.activities.noActivities}</p>
                )}
                
                {allActivities.length > 1 && (
                    <p className="text-[10px] text-gray-500 text-center mt-2 border-t border-gray-700/50 pt-1 font-bold">
                        +{allActivities.length - 1} weitere Aufträge (Klicken)
                    </p>
                )}
            </DashboardWidget>
        </div>
    );
};

export default StudioActivitiesWidget;