
import React, { useState, useMemo } from 'react';
import { Employee, EmployeeType, BuildingType } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';
import PersonalIcon from '../../icons/PersonalIcon';
import StarRating from '../../StarRating';
import HandshakeIcon from '../../icons/HandshakeIcon';
import ChatBubbleIcon from '../../icons/ChatBubbleIcon';
import BonusIcon from '../../icons/BonusIcon';
import TrainingIcon from '../../icons/TrainingIcon';
import TrashIcon from '../../icons/TrashIcon';

interface EmployeeProfileProps {
    employee: Employee;
    isHired: boolean;
    playerData: any;
    onHire: (employee: Employee) => void;
    onFire: (employeeId: number) => void;
    onIncreaseSalary: (employeeId: number) => void;
    onTrain: (employeeId: number, duration: number) => void;
    onPraise: (employeeId: number) => void;
}

const ProgressBar: React.FC<{ progress: number, color: string, label: string }> = ({ progress, color, label }) => (
    <div className="w-full">
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
            <span className="text-xs font-mono text-white">{Math.round(progress)}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-600">
            <div className={`${color} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ 
    employee, isHired, playerData, onHire, onFire, onIncreaseSalary, onTrain, onPraise 
}) => {
    const { t, language } = useTranslation();
    const [showConfirm, setShowConfirm] = useState<{type: 'hire' | 'fire' | 'train' | 'increase_salary', details?: any} | null>(null);
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

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

    const employeeBuildingMap: Record<EmployeeType, BuildingType> = {
        [EmployeeType.Autor]: BuildingType.Autorenbuero,
        [EmployeeType.CastingMitarbeiter]: BuildingType.CastingOffice,
        [EmployeeType.Forscher]: BuildingType.ResearchLab,
        [EmployeeType.Marketingmanager]: BuildingType.MarketingDepartment,
        [EmployeeType.ProjektPlaner]: BuildingType.Planungsbuero,
    };

    const requiredBuildingType = employeeBuildingMap[employee.type];
    const buildingTranslationKey = requiredBuildingType as keyof typeof t.studiogelaende.buildings;
    const requiredBuildingName = t.studiogelaende.buildings?.[buildingTranslationKey]?.name || requiredBuildingType;
    const hasRequiredBuilding = playerData.buildings.some((b: any) => b.type === requiredBuildingType && b.level > 0);
    
    const { canHire, hiringRequirementText } = useMemo(() => {
        if (isHired) return { canHire: true, hiringRequirementText: '' };

        const buroBuilding = playerData.buildings.find((b: any) => b.type === BuildingType.Burogebaude);
        const buroLevel = buroBuilding ? buroBuilding.level : 0;
        const maxEmployees = buroLevel * 3;
        
        if (playerData.employees.length >= maxEmployees) {
            return { canHire: false, hiringRequirementText: t.employeeDossier.hireRequirement };
        }
        return { canHire: true, hiringRequirementText: '' };
    }, [playerData, isHired, t]);

    const isBusy = useMemo(() => {
        if (!isHired) return false;
        if (employee.activeTraining) return true;
        if (playerData.activeWriting?.writerId === employee.id) return true;
        
        // Check Array Activity States
        if (playerData.activeCastings && playerData.activeCastings.some((c: any) => c.casterId === employee.id)) return true;
        if (playerData.activeCastingCampaigns && playerData.activeCastingCampaigns.some((c: any) => c.casterId === employee.id)) return true;
        if (playerData.activeTalentScoutings && playerData.activeTalentScoutings.some((s: any) => s.scoutId === employee.id)) return true;
        
        if (playerData.activePlanning?.plannerId === employee.id) return true;
        
        if (playerData.activeResearch && employee.type === EmployeeType.Forscher) {
            const researcherCount = playerData.employees.filter((e: any) => e.type === EmployeeType.Forscher).length;
            if (researcherCount <= 1) return true;
        }
        return false;
    }, [employee, isHired, playerData]);

    const trainingCost = employee.salary * 5;
    const canAffordTraining = playerData.capital >= trainingCost || (playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio');

    const { canTrain, nextTrainingDate } = useMemo(() => {
        if (!isHired || isBusy) return { canTrain: false, nextTrainingDate: null };
        if (!employee.lastTrainingDate) return { canTrain: true, nextTrainingDate: null };
        
        const lastTraining = new Date(employee.lastTrainingDate);
        const nextTrainingAllowed = new Date(lastTraining);
        nextTrainingAllowed.setMonth(nextTrainingAllowed.getMonth() + 6);
        
        return { 
            canTrain: playerData.gameDate >= nextTrainingAllowed, 
            nextTrainingDate: nextTrainingAllowed 
        };
    }, [isHired, isBusy, employee.lastTrainingDate, playerData.gameDate]);

    // Praise Logic (30 days)
    const lastPraisedDate = employee.lastPraised ? new Date(employee.lastPraised) : null;
    const daysSincePraise = lastPraisedDate ? Math.floor((new Date(playerData.gameDate).getTime() - lastPraisedDate.getTime()) / (1000 * 3600 * 24)) : 999;
    const canPraise = !lastPraisedDate || daysSincePraise >= 30;
    const nextPraiseDate = lastPraisedDate ? new Date(new Date(employee.lastPraised!).setDate(new Date(employee.lastPraised!).getDate() + 30)) : null;

    // Salary Increase Logic (30 days)
    const lastSalaryDate = employee.lastSalaryIncreaseDate ? new Date(employee.lastSalaryIncreaseDate) : null;
    const daysSinceSalaryIncrease = lastSalaryDate ? Math.floor((new Date(playerData.gameDate).getTime() - lastSalaryDate.getTime()) / (1000 * 3600 * 24)) : 999;
    const canIncreaseSalary = !lastSalaryDate || daysSinceSalaryIncrease >= 30;
    const nextSalaryDate = lastSalaryDate ? new Date(new Date(employee.lastSalaryIncreaseDate!).setDate(new Date(employee.lastSalaryIncreaseDate!).getDate() + 30)) : null;

    const handleTrainClick = () => {
        if (!canTrain) return;
        const duration = 25 + Math.floor(Math.random() * 6);
        setShowConfirm({ type: 'train', details: { duration } });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden p-4">
            {/* Header / Portrait */}
            <div className="flex items-center gap-6 mb-6 border-b border-gray-700 pb-4">
                {/* Portrait vergrößert von w-24 h-24 auf w-36 h-36 */}
                 <div className="w-36 h-36 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600 overflow-hidden shadow-lg relative flex-shrink-0">
                    {employee.portraitUrl ? (
                        <img src={employee.portraitUrl} alt={employee.name} className="w-full h-full object-cover" draggable="false" />
                    ) : (
                        // Fallback Icon ebenfalls vergrößert
                        <PersonalIcon className="w-24 h-24 text-gray-400" />
                    )}
                    {isBusy && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white uppercase transform -rotate-12 border border-white px-1 py-0.5 rounded">{t.talentDossier.status.busy}</span>
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-cinzel text-amber-400">{employee.name}</h2>
                    <p className="text-gray-400 font-semibold">{getTranslatedEmployeeType(employee.type)}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-5 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold text-sm uppercase">{t.employeeDossier.talent}</span>
                        <StarRating rating={employee.talent} />
                    </div>
                    {isHired && (
                        <ProgressBar progress={employee.satisfaction} color="bg-yellow-500" label={t.employeeDossier.satisfaction} />
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-gray-400 text-sm">{t.employeeDossier.salary}</span>
                        <span className="font-bold text-green-400 font-mono text-lg">{formatCurrency(employee.salary)}</span>
                    </div>
                </div>

                {!showConfirm ? (
                    <div className="space-y-3">
                        {!isHired ? (
                            <button 
                                onClick={() => setShowConfirm({type: 'hire'})} 
                                disabled={!canHire} 
                                className="w-full flex items-center justify-between p-4 bg-green-900/30 hover:bg-green-800/40 border border-green-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <HandshakeIcon className="h-6 w-6 text-green-400"/>
                                    <div className="text-left">
                                        <p className="font-bold text-white group-hover:text-green-300 transition-colors">{t.employeeDossier.hire}</p>
                                        {!canHire && <p className="text-xs text-red-400">{hiringRequirementText}</p>}
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => onPraise(employee.id)} 
                                    disabled={!canPraise}
                                    className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <ChatBubbleIcon className="h-5 w-5 text-blue-400"/>
                                        <div>
                                            <p className="font-bold text-sm text-white">{t.employeeDossier.praise}</p>
                                            {!canPraise && nextPraiseDate && <p className="text-[10px] text-gray-400">Verfügbar: {nextPraiseDate.toLocaleDateString(locale)}</p>}
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setShowConfirm({type: 'increase_salary'})} 
                                    disabled={!canIncreaseSalary}
                                    className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <BonusIcon className="h-5 w-5 text-green-400"/>
                                        <div className="flex-grow">
                                            <p className="font-bold text-sm text-white">{t.employeeDossier.increaseSalary}</p>
                                            <p className="text-[10px] text-gray-400">+10% ({formatCurrency(Math.round(employee.salary * 0.1))})</p>
                                            {!canIncreaseSalary && nextSalaryDate && <p className="text-[10px] text-gray-500">Verfügbar: {nextSalaryDate.toLocaleDateString(locale)}</p>}
                                        </div>
                                    </div>
                                </button>

                                <div className="relative">
                                    <button 
                                        onClick={handleTrainClick} 
                                        disabled={!canTrain || !canAffordTraining || isBusy}
                                        className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <TrainingIcon className="h-5 w-5 text-purple-400"/>
                                            <div>
                                                <p className="font-bold text-sm text-white">{t.employeeDossier.train}</p>
                                                <p className="text-[10px] text-gray-400">{formatCurrency(trainingCost)}</p>
                                            </div>
                                        </div>
                                    </button>
                                    {!canTrain && !isBusy && nextTrainingDate && (
                                        <p className="text-[10px] text-red-400 text-center mt-1">
                                            {t.employeeDossier.alreadyTrained.replace('{date}', nextTrainingDate.toLocaleDateString(locale))}
                                        </p>
                                    )}
                                </div>

                                <button 
                                    onClick={() => setShowConfirm({type: 'fire'})} 
                                    disabled={isBusy}
                                    className="w-full flex items-center justify-between p-3 border border-red-900/50 hover:bg-red-900/20 rounded-lg transition-colors text-left mt-4 disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <TrashIcon className="h-5 w-5 text-red-500"/>
                                        <p className="font-bold text-sm text-red-400">{t.employeeDossier.fire}</p>
                                    </div>
                                </button>

                                {isHired && !hasRequiredBuilding && (
                                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-center mt-4">
                                        <p className="text-red-200 text-xs italic">
                                            {t.employeeDossier.buildingWarning.replace('{building}', requiredBuildingName)}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-900/80 p-4 rounded-lg border border-amber-500/50 text-center animate-fade-in">
                        <h4 className="font-bold text-white mb-2 font-cinzel text-lg">
                            {showConfirm.type === 'hire' && t.employeeDossier.confirmHireTitle}
                            {showConfirm.type === 'fire' && t.employeeDossier.confirmFireTitle}
                            {showConfirm.type === 'train' && t.employeeDossier.confirmTrainTitle}
                            {showConfirm.type === 'increase_salary' && t.employeeDossier.confirmIncreaseSalaryTitle}
                        </h4>
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                            {showConfirm.type === 'hire' && t.employeeDossier.confirmHireText.replace('{name}', employee.name).replace('{salary}', formatCurrency(employee.salary))}
                            {showConfirm.type === 'fire' && t.employeeDossier.confirmFireText.replace('{name}', employee.name).replace('{busyText}', '')}
                            {showConfirm.type === 'train' && t.employeeDossier.confirmTrainText.replace('{name}', employee.name).replace('{duration}', showConfirm.details.duration).replace('{cost}', formatCurrency(trainingCost))}
                            {showConfirm.type === 'increase_salary' && t.employeeDossier.confirmIncreaseSalaryText.replace('{name}', employee.name).replace('{amount}', formatCurrency(Math.round(employee.salary * 0.1)))}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded text-xs uppercase">{t.common.cancel}</button>
                            <button 
                                onClick={() => {
                                    if (showConfirm.type === 'hire') onHire(employee);
                                    if (showConfirm.type === 'fire') onFire(employee.id);
                                    if (showConfirm.type === 'increase_salary') onIncreaseSalary(employee.id);
                                    if (showConfirm.type === 'train') onTrain(employee.id, showConfirm.details.duration);
                                    setShowConfirm(null);
                                }} 
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-xs uppercase"
                            >
                                {t.common.confirm}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeProfile;
