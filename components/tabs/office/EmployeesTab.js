import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { EmployeeType } from '../../../types';
import StarRating from '../../StarRating';
import { useGame } from '../../../contexts/GameContext';
import PersonalIcon from '../../icons/PersonalIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import EmployeeProfile from './EmployeeProfile';
import TrainingIcon from '../../icons/TrainingIcon';
const TabButton = ({ title, isActive, onClick, disabled }) => (_jsx("button", { onClick: onClick, disabled: disabled, className: `py-3 px-6 font-bold text-base transition-colors duration-200 focus:outline-none relative top-px rounded-t-lg border-t border-x
            ${isActive
        ? 'bg-gray-800/80 text-amber-400 border-gray-700 z-10'
        : 'bg-black/40 text-gray-400 hover:text-white border-transparent hover:bg-gray-900/40'} ${disabled
        ? 'opacity-50 cursor-not-allowed'
        : ''}`, children: title }));
const EmployeesTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [employeeSubTab, setEmployeeSubTab] = useState('employed');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    if (!playerData)
        return null;
    const formatCurrency = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const typeMap = {
        [EmployeeType.Autor]: 'autor',
        [EmployeeType.CastingMitarbeiter]: 'castingMitarbeiter',
        [EmployeeType.Forscher]: 'forscher',
        [EmployeeType.Marketingmanager]: 'marketingmanager',
        [EmployeeType.ProjektPlaner]: 'projektPlaner',
    };
    const getTranslatedEmployeeType = (type) => {
        const key = typeMap[type];
        return t.office.employees.employeeTypes[key] || type;
    };
    // Filter Logic
    const employeesList = useMemo(() => {
        const source = employeeSubTab === 'employed' ? playerData.employees : playerData.employeeMarket;
        if (employeeFilter === 'all')
            return source;
        return source.filter(e => e.type === employeeFilter);
    }, [playerData.employees, playerData.employeeMarket, employeeSubTab, employeeFilter]);
    // Auto-select first if selection is invalid or empty
    useEffect(() => {
        if (employeesList.length > 0) {
            if (!selectedEmployeeId || !employeesList.some(e => e.id === selectedEmployeeId)) {
                setSelectedEmployeeId(employeesList[0].id);
            }
        }
        else {
            setSelectedEmployeeId(null);
        }
    }, [employeesList, selectedEmployeeId]);
    const selectedEmployee = useMemo(() => {
        if (!selectedEmployeeId)
            return null;
        return employeesList.find(e => e.id === selectedEmployeeId) || null;
    }, [selectedEmployeeId, employeesList]);
    // Actions
    const handleHireEmployee = (employeeToHire) => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            const newEmployee = {
                ...employeeToHire,
                satisfaction: 78 + Math.floor(Math.random() * 5), // 78-82
            };
            return {
                ...prev,
                employees: [...prev.employees, newEmployee],
                employeeMarket: prev.employeeMarket.filter(w => w.id !== employeeToHire.id),
            };
        });
        setSelectedEmployeeId(null);
    };
    const handleFireEmployee = (employeeId) => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                employees: prev.employees.filter(e => e.id !== employeeId),
            };
        });
        setSelectedEmployeeId(null);
    };
    const handleIncreaseSalary = (employeeId) => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            const satisfactionBoost = 5 + Math.floor(Math.random() * 6); // 5 to 10
            return {
                ...prev,
                employees: prev.employees.map(e => e.id === employeeId ? {
                    ...e,
                    salary: Math.round(e.salary * 1.10),
                    satisfaction: Math.min(100, e.satisfaction + satisfactionBoost),
                    lastSalaryIncreaseDate: new Date(prev.gameDate)
                } : e)
            };
        });
    };
    const handlePraiseEmployee = (employeeId) => {
        const satisfactionGain = 3 + Math.floor(Math.random() * 6); // 3 to 8
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                employees: prev.employees.map(e => e.id === employeeId ? {
                    ...e,
                    satisfaction: Math.min(100, e.satisfaction + satisfactionGain),
                    lastPraised: new Date(prev.gameDate)
                } : e)
            };
        });
    };
    const handleTrain = (employeeId, duration) => {
        const employee = playerData.employees.find(e => e.id === employeeId);
        if (!employee)
            return;
        const cost = employee.salary * 5;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const startDate = new Date(prev.gameDate);
            const endDate = new Date(prev.gameDate);
            endDate.setDate(endDate.getDate() + duration);
            return {
                ...prev,
                capital: prev.capital - cost,
                employees: prev.employees.map(e => e.id === employeeId ? { ...e, activeTraining: { startDate, endDate } } : e),
                transactionLog: [
                    ...prev.transactionLog,
                    { date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Personal', description: `Weiterbildung für ${employee.name}`, amount: cost }
                ]
            };
        });
    };
    // Helper to get busy text for list item
    const getEmployeeStatusText = (employee) => {
        if (employee.activeTraining)
            return t.office.employees.busyTraining;
        if (playerData.activeWriting?.writerId === employee.id)
            return t.office.employees.busyWriting;
        if (playerData.activePlanning?.plannerId === employee.id)
            return t.office.employees.busyPlanning;
        if (playerData.activeCasting?.casterId === employee.id)
            return t.office.employees.busyCasting;
        if (playerData.activeCastingCampaign?.casterId === employee.id)
            return t.office.employees.busyCasting;
        if (playerData.activeTalentScouting?.scoutId === employee.id)
            return t.office.employees.busyCasting;
        if (playerData.activeResearch && employee.type === EmployeeType.Forscher) {
            const researchers = playerData.employees.filter(e => e.type === EmployeeType.Forscher);
            if (researchers.length <= 1)
                return t.office.employees.busyResearch;
        }
        return null;
    };
    return (_jsxs("div", { className: "w-full h-full flex flex-col", children: [_jsxs("div", { className: "flex-shrink-0 flex items-end pl-2", children: [_jsx(TabButton, { title: t.office.employees.myEmployees, isActive: employeeSubTab === 'employed', onClick: () => { setEmployeeSubTab('employed'); setEmployeeFilter('all'); } }), _jsx(TabButton, { title: t.office.employees.market, isActive: employeeSubTab === 'market', onClick: () => { setEmployeeSubTab('market'); setEmployeeFilter('all'); } })] }), _jsxs("div", { className: "flex-grow bg-gray-800/80 p-6 rounded-b-lg rounded-tr-lg border border-gray-700 shadow-2xl overflow-hidden flex flex-col relative z-0", children: [_jsxs("div", { className: "flex-shrink-0 mb-6 flex items-center gap-4 border-b border-gray-700 pb-4", children: [_jsx("label", { htmlFor: "type-filter", className: "text-gray-400 font-bold text-sm uppercase tracking-wider", children: t.office.employees.filterType }), _jsx("div", { className: "relative", children: _jsxs("select", { id: "type-filter", value: employeeFilter, onChange: (e) => setEmployeeFilter(e.target.value), className: "bg-gray-900 border border-gray-600 text-white text-sm rounded-md focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 min-w-[200px]", children: [_jsx("option", { value: "all", children: t.office.employees.allTypes }), Object.values(EmployeeType).map(type => (_jsx("option", { value: type, children: getTranslatedEmployeeType(type) }, type)))] }) })] }), _jsxs("div", { className: "flex-grow flex gap-6 overflow-hidden", children: [_jsx("div", { className: "w-1/2 flex flex-col h-full bg-gray-900/50 p-1 rounded-lg border border-gray-700 overflow-hidden", children: selectedEmployee ? (_jsx(EmployeeProfile, { employee: selectedEmployee, isHired: employeeSubTab === 'employed', playerData: playerData, onHire: handleHireEmployee, onFire: handleFireEmployee, onIncreaseSalary: handleIncreaseSalary, onPraise: handlePraiseEmployee, onTrain: handleTrain })) : (_jsx("div", { className: "h-full flex items-center justify-center text-gray-500 italic p-6 text-center", children: employeesList.length === 0 ? (employeeSubTab === 'employed' ? t.office.employees.noHired : t.office.employees.noMarket) : (language === 'de' ? 'Wählen Sie einen Mitarbeiter aus der Liste.' : 'Select an employee from the list.') })) }), _jsxs("div", { className: "w-1/2 flex flex-col h-full", children: [_jsx("div", { className: "bg-gray-900/40 p-2 rounded-t-lg border-b border-gray-700 flex justify-between items-center px-4", children: _jsxs("span", { className: "text-xs font-bold text-gray-400 uppercase tracking-wider", children: [employeesList.length, " ", language === 'de' ? 'Mitarbeiter' : 'Employees'] }) }), _jsxs("div", { className: "bg-gray-900/20 flex-grow overflow-y-auto pr-2 custom-scrollbar p-2 rounded-b-lg border border-gray-700 border-t-0", children: [_jsx("div", { className: "space-y-3", children: employeesList.map(employee => {
                                                    const isSelected = selectedEmployeeId === employee.id;
                                                    const statusText = getEmployeeStatusText(employee);
                                                    const isBusy = !!statusText;
                                                    return (_jsxs("button", { onClick: () => setSelectedEmployeeId(employee.id), className: `w-full p-3 rounded-lg border text-left transition-all relative overflow-hidden group flex items-center gap-4 ${isSelected
                                                            ? 'bg-amber-900/40 border-amber-500 ring-1 ring-amber-500/50'
                                                            : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'}`, children: [_jsx("div", { className: "w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-500 flex items-center justify-center", children: employee.portraitUrl ? (_jsx("img", { src: employee.portraitUrl, alt: employee.name, className: "w-full h-full object-cover", draggable: "false" })) : (_jsx(PersonalIcon, { className: "w-8 h-8 text-gray-400 p-1" })) }), _jsxs("div", { className: "flex-grow min-w-0", children: [_jsxs("div", { className: "flex justify-between items-baseline", children: [_jsx("p", { className: `font-bold truncate text-base ${isSelected ? 'text-amber-300' : 'text-white'}`, children: employee.name }), _jsx(StarRating, { rating: employee.talent, size: "sm" })] }), _jsx("p", { className: "text-xs text-gray-400", children: getTranslatedEmployeeType(employee.type) }), _jsxs("div", { className: "flex justify-between items-center mt-1", children: [_jsx("span", { className: "text-xs font-mono text-gray-300", children: formatCurrency(employee.salary) }), isBusy && (_jsxs("span", { className: "text-[10px] text-yellow-500 flex items-center gap-1 bg-yellow-900/30 px-1.5 py-0.5 rounded border border-yellow-700/50 ml-2", children: [employee.activeTraining && _jsx(TrainingIcon, { className: "w-3 h-3" }), t.talentDossier.status.busy] }))] })] })] }, employee.id));
                                                }) }), employeesList.length === 0 && (_jsx("div", { className: "flex flex-col items-center justify-center h-full text-gray-500 opacity-50", children: _jsx("p", { className: "italic", children: "Keine Eintr\u00E4ge gefunden." }) }))] })] })] })] })] }));
};
export default EmployeesTab;
