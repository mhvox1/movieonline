import React, { useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameState, ProjectPhase, PostProductionOption, ProjectData } from '../types';
import { EDITING_OPTIONS, MUSIC_OPTIONS, SOUND_OPTIONS } from './constants';
import { RESEARCH_TECHS } from './research';
import SchnittIcon from './icons/SchnittIcon';
import MusikIcon from './icons/MusikIcon';
import SoundIcon from './icons/SoundIcon';
import StarIcon from './icons/StarIcon';
import { useTranslation } from '../hooks/useTranslation';
import { getPostProductionDurationMultiplier } from './studioBuildingEffects';

interface NewProjectScreenPhase4Props {
    setGameState: (state: GameState) => void;
    onBack: () => void;
    // FIX: Add project to props
    project: ProjectData;
}

const DepartmentSummaryCard: React.FC<{
    department: { name: string; icon: React.ReactNode; level: number; options: any[], translationKey: string };
    onClick: () => void;
    translation: any;
    formatCurrency: (value: number) => string;
}> = ({ department, onClick, translation, formatCurrency }) => {
    const selectedOption = department.options.find(o => o.level === department.level)!;
    const optionTranslation = translation.productionOptions[department.translationKey][`level${department.level}`];
    
    return (
        <button
            onClick={onClick}
            className="w-full bg-gray-900/50 p-3 h-24 rounded-lg border border-gray-700 hover:border-amber-500/50 transition-all duration-300 flex items-start"
        >
            <div className="flex items-start gap-4 w-full">
                <div className="bg-gray-800 p-2 rounded-md mt-1 flex-shrink-0">{department.icon}</div>
                <div className="text-left flex-grow min-w-0">
                    <h4 className="font-cinzel text-amber-300 text-base truncate">{department.name}</h4>
                    <p className="text-sm text-gray-300 whitespace-normal truncate">{optionTranslation?.name || selectedOption.name}</p>
                </div>
                <div className="text-right text-xs flex-shrink-0 space-y-1 w-32">
                    <p className="text-gray-400">{translation.project.postProduction.cost} <span className="font-mono text-white">{formatCurrency(selectedOption.cost)}</span></p>
                    <p className="text-gray-400">{translation.project.postProduction.duration} <span className="font-mono text-white">{selectedOption.duration} {translation.project.postProduction.days}</span></p>
                     <p className="text-gray-400">{translation.project.postProduction.quality}: <span className="font-mono text-white">+{selectedOption.qualityBonus}</span></p>
                </div>
            </div>
        </button>
    );
};

const DepartmentCard: React.FC<{
    option: PostProductionOption;
    isSelected: boolean;
    onSelect: () => void;
    unlocked: boolean;
    translatedName?: string;
    translatedDesc?: string;
    translation: any;
    formatCurrency: (value: number) => string;
}> = ({ option, isSelected, onSelect, unlocked, translatedName, translatedDesc, translation, formatCurrency }) => {
    return (
        <button
            onClick={onSelect}
            disabled={!unlocked}
            className={`p-3 rounded-lg border-2 text-left h-full flex flex-col transition-all duration-200 ${
                isSelected ? 'border-amber-400 bg-amber-900/50' : 'border-gray-600 hover:border-gray-500'
            } ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <h5 className="font-bold text-white">{translatedName || option.name}</h5>
            <p className="text-xs text-gray-400 mt-1 flex-grow">{translatedDesc || option.description}</p>
            <div className="text-xs mt-2 pt-2 border-t border-gray-600/50 space-y-1">
                <div className="flex justify-between"><span>{translation.project.postProduction.cost}</span> <span className="font-bold">{formatCurrency(option.cost)}</span></div>
                <div className="flex justify-between"><span>{translation.project.postProduction.duration}</span> <span className="font-bold">{option.duration} {translation.project.postProduction.days}</span></div>
                <div className="flex justify-between"><span>{translation.project.postProduction.qualityBonus}</span> <span className="font-bold">+{option.qualityBonus}</span></div>
            </div>
             {!unlocked && option.requiredTechs && (
                <p className="text-xs text-red-400 mt-1">{translation.project.postProduction.requires} {RESEARCH_TECHS.find(t => t.id === option.requiredTechs![0])?.name}</p>
            )}
        </button>
    );
};


type EditingDepartment = {
    name: string;
    icon: React.ReactNode;
    level: number;
    setLevel: React.Dispatch<React.SetStateAction<number>>;
    options: PostProductionOption[];
    translationKey: string;
} | null;


const NewProjectScreen_Phase4: React.FC<NewProjectScreenPhase4Props> = ({ setGameState, onBack, project }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    if (!playerData || !project) {
        return <div className="text-white">Fehler: Kein aktives Projekt gefunden.</div>;
    }
    
    const [editingLevel, setEditingLevel] = useState(project.editingLevel || 1);
    const [musicLevel, setMusicLevel] = useState(project.musicLevel || 1);
    const [soundLevel, setSoundLevel] = useState(project.soundLevel || 1);
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<EditingDepartment>(null);

    const postProductionDepartments = [
      { name: t.project.postProduction.departments.editing, icon: <SchnittIcon className="h-6 w-6"/>, level: editingLevel, setLevel: setEditingLevel, options: EDITING_OPTIONS, translationKey: 'editing' },
      { name: t.project.postProduction.departments.music, icon: <MusikIcon className="h-6 w-6"/>, level: musicLevel, setLevel: setMusicLevel, options: MUSIC_OPTIONS, translationKey: 'music' },
      { name: t.project.postProduction.departments.sound, icon: <SoundIcon className="h-6 w-6"/>, level: soundLevel, setLevel: setSoundLevel, options: SOUND_OPTIONS, translationKey: 'postSound' },
    ];


    const { totalCost: additionalCosts, totalDuration } = useMemo(() => {
        const editing = EDITING_OPTIONS.find(o => o.level === editingLevel)!;
        const music = MUSIC_OPTIONS.find(o => o.level === musicLevel)!;
        const sound = SOUND_OPTIONS.find(o => o.level === soundLevel)!;

        const cost = editing.cost + music.cost + sound.cost;
        let duration = editing.duration + music.duration + sound.duration;

        // CONTRACT WORK SPEED BONUS: 2/3 of normal time
        if (project.contract) {
            duration = Math.max(5, Math.round(duration * 0.66));
        }

        return { totalCost: cost, totalDuration: duration };
    }, [editingLevel, musicLevel, soundLevel, project.contract]);

    const bisherigeKosten = useMemo(() => {
        if (!project) return 0;
        
        const fixedCosts = (project.scriptBudget || 0) +
                   (project.movieSizeBudget || 0) +
                   (project.seriesPlanningCost || 0) +
                           (project.castingCost || 0) +
                           (project.directorGage || 0) +
                           (project.mainActorGage || 0) +
                           (project.supportingActorGage || 0) +
                           (project.productionCost || 0);
                           
        const weeklyCostsTransactions = playerData.transactionLog.filter(t => 
            t.category === 'Filmproduktion' &&
            (
                (t.descriptionKey === 'weeklyProductionCosts' && t.descriptionVars?.filmTitle === project.workingTitle) ||
                ((t.description.startsWith('Wöchentliche Fixkosten') || t.description.startsWith('Weekly fixed costs')) && t.description.includes(`"${project.workingTitle}"`))
            )
        );
        const totalWeeklyCosts = weeklyCostsTransactions.reduce((sum, t) => sum + t.amount, 0);
    
        const productionEventTransactions = playerData.transactionLog.filter(t => 
            project.productionStartDate &&
            t.category === 'Filmproduktion' && 
            t.type === 'Ausgabe' &&
            (t.description.startsWith('Produktions-Event:') || t.description.startsWith('Production Event:')) &&
            new Date(t.date) >= new Date(project.productionStartDate)
        );
        const totalProductionEventCosts = productionEventTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        return fixedCosts + totalWeeklyCosts + totalProductionEventCosts;
    }, [project, playerData.transactionLog]);

    const totalFinalCost = bisherigeKosten + additionalCosts;
    
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const canAfford = playerData.capital >= additionalCosts || isTestMode;

    const handleStartPostProduction = () => {
        if (!canAfford) return;

        const startDate = new Date(playerData.gameDate);
        const endDate = new Date(playerData.gameDate);
        const finalDuration = isTestMode ? 5 : Math.max(3, Math.round(totalDuration * getPostProductionDurationMultiplier(playerData)));
        endDate.setDate(endDate.getDate() + finalDuration);

        setPlayerData(prev => {
            if (!prev) return null;

            const updatedProjects = prev.activeProjects.map(p => {
                if (p.workingTitle === project.workingTitle) {
                    return {
                        ...p,
                        phase: ProjectPhase.PostProduction,
                        editingLevel,
                        musicLevel,
                        soundLevel,
                        postProductionCost: additionalCosts,
                        postProductionStartDate: startDate,
                        postProductionEndDate: endDate,
                    };
                }
                return p;
            });
            
            let newCurrentProject = prev.currentProject;
            if (prev.currentProject?.workingTitle === project.workingTitle) {
                newCurrentProject = updatedProjects.find(p => p.workingTitle === project.workingTitle) || null;
            }

            return {
                ...prev,
                capital: prev.capital - additionalCosts,
                activeProjects: updatedProjects,
                currentProject: newCurrentProject,
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Filmproduktion',
                        description: `Postproduktion: "${project.workingTitle}"`,
                        descriptionKey: 'postProductionStart',
                        descriptionVars: { title: project.workingTitle },
                        amount: additionalCosts
                    }
                ]
            };
        });
        
        setShowStartConfirm(false);
        onBack();
    };

    return (
        <>
            <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm p-6 rounded-lg shadow-2xl w-full max-w-7xl h-auto border border-gray-700 flex flex-col">
                <h2 className="text-4xl font-bold text-center mb-6 font-cinzel text-amber-400">{t.project.postProduction.suiteTitle}: "{project.workingTitle}"</h2>

                <div className="flex-grow grid grid-cols-1 gap-6 overflow-hidden">
                    <div className="overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                        {postProductionDepartments.map(dept => (
                            <DepartmentSummaryCard
                                key={dept.name}
                                department={dept}
                                onClick={() => setEditingDepartment(dept)}
                                translation={t}
                                formatCurrency={formatCurrency}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-shrink-0 mt-6 pt-4 border-t-2 border-amber-500/50">
                    <div className="flex justify-between items-center">
                        <div/>
                        <div className="text-right">
                            <div className="grid grid-cols-2 gap-x-8 text-lg">
                                <span className="text-gray-300">{t.project.postProduction.additionalDuration}:</span>
                                <span className="font-bold text-white">{isTestMode ? 5 : totalDuration} {t.project.postProduction.days}</span>

                                <span className="text-gray-300">{t.project.postProduction.previousCosts}:</span>
                                <span className="font-bold text-white">{formatCurrency(bisherigeKosten)}</span>

                                <span className="text-gray-300">{t.project.postProduction.additionalCosts}:</span>
                                <span className={`font-bold ${canAfford ? 'text-white' : 'text-red-500'}`}>{formatCurrency(additionalCosts)}</span>
                                
                                <span className="text-amber-400 font-cinzel text-xl mt-2 border-t border-gray-600 pt-2">{t.project.postProduction.totalCosts}:</span>
                                <span className={`font-bold text-2xl mt-2 border-t border-gray-600 pt-2 ${canAfford ? 'text-amber-400' : 'text-red-500'}`}>{formatCurrency(totalFinalCost)}</span>
                            </div>
                            {!canAfford && <p className="text-red-400 text-sm text-right mt-1">{t.project.casting.insufficientFunds}</p>}
                        </div>
                        <button onClick={() => setShowStartConfirm(true)} disabled={!canAfford} className="w-96 bg-green-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {t.project.postProduction.startPost}
                        </button>
                    </div>
                </div>
            </div>
            {editingDepartment && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingDepartment(null)}>
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-5xl p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-3xl font-cinzel text-amber-400 text-center mb-4 flex items-center justify-center gap-3">
                            {editingDepartment.icon} {editingDepartment.name}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {editingDepartment.options.map(option => {
                                const unlocked = !option.requiredTechs || option.requiredTechs.every((techId: string) => playerData.unlockedTechnologies.includes(techId));
                                const optionTranslation = t.productionOptions[editingDepartment.translationKey as keyof typeof t.productionOptions][`level${option.level}`];

                                return (
                                    <DepartmentCard
                                        key={option.level}
                                        option={option}
                                        isSelected={editingDepartment.level === option.level}
                                        unlocked={unlocked}
                                        translatedName={optionTranslation?.name}
                                        translatedDesc={optionTranslation?.desc}
                                        onSelect={() => {
                                            if (unlocked) {
                                                editingDepartment.setLevel(option.level);
                                                setEditingDepartment(null);
                                            }
                                        }}
                                        translation={t}
                                        formatCurrency={formatCurrency}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={() => setEditingDepartment(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-sm uppercase">{t.common.cancel}</button>
                        </div>
                    </div>
                </div>
            )}
            {showStartConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.postProduction.confirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">{t.project.postProduction.confirmText.replace('{title}', project.workingTitle)}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowStartConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button onClick={handleStartPostProduction} className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all">{t.common.yes}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewProjectScreen_Phase4;
