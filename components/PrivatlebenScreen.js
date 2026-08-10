import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { privatlebenBackgroundImage } from './backgrounds/PrivatlebenBackgroundImage';
import PrivatlebenIcon from './icons/PrivatlebenIcon';
import AssetsIcon from './icons/AssetsIcon';
import FamilyIcon from './icons/FamilyIcon';
import EducationIcon from './icons/EducationIcon';
import OfficeIcon from './icons/OfficeIcon';
import GameHeader from './GameHeader';
import { useTranslation } from '../hooks/useTranslation';
// Import tabs
import { OverviewTab } from './tabs/privatelife/OverviewTab';
import { StatusFinanceTab } from './tabs/privatelife/StatusFinanceTab';
import { AssetsTab } from './tabs/privatelife/AssetsTab';
import { RelationshipsTab } from './tabs/privatelife/RelationshipsTab';
import { EducationTab } from './tabs/privatelife/EducationTab';
const SidebarButton = ({ title, description, icon, isActive, disabled, onClick }) => {
    const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
    const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';
    const disabledClasses = 'opacity-50 cursor-not-allowed hover:-translate-y-0';
    return (_jsx("button", { onClick: onClick, disabled: disabled, className: `relative bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses} ${disabled ? disabledClasses : ''}`, children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: `bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && 'bg-amber-500'}`, children: icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: `text-md font-bold font-cinzel ${isActive ? 'text-amber-300' : 'text-amber-400'} group-hover:text-amber-300 transition-colors`, children: title }), _jsx("p", { className: "text-xs text-gray-300 mt-1", children: description })] })] }) }));
};
const PrivatlebenScreen = ({ onBack, gameSpeed, setGameSpeed }) => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    if (!playerData)
        return null;
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return _jsx(OverviewTab, {});
            case 'status':
                return _jsx(StatusFinanceTab, {});
            case 'assets':
                return _jsx(AssetsTab, {});
            case 'family':
                return _jsx(RelationshipsTab, {});
            case 'education':
                return _jsx(EducationTab, {});
            default:
                return null;
        }
    };
    const navItems = [
        { id: 'overview', icon: _jsx(PrivatlebenIcon, { className: "w-5 h-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'status', icon: _jsx(OfficeIcon, { className: "w-5 h-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'assets', icon: _jsx(AssetsIcon, { className: "w-5 h-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'family', icon: _jsx(FamilyIcon, { className: "w-5 h-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'education', icon: _jsx(EducationIcon, { className: "w-5 h-5 bg-gray-400 group-hover:bg-black" }) }
    ];
    return (_jsxs("div", { className: "w-full h-full bg-cover bg-center flex flex-col", style: { backgroundImage: `url(${privatlebenBackgroundImage})` }, children: [_jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm z-0" }), " ", _jsxs("div", { className: "relative z-10 w-full h-full flex flex-col", children: [_jsx(GameHeader, { gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, disabled: true }), _jsxs("div", { className: "flex-grow w-full flex flex-row overflow-hidden", children: [_jsxs("aside", { className: "w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col z-20", children: [_jsx("header", { className: "p-6 text-center border-b border-gray-700", children: _jsx("h1", { className: "text-3xl font-bold font-cinzel text-amber-400", children: t.privatelife.screen.title }) }), _jsx("nav", { className: "flex-grow p-4 flex flex-col gap-4 overflow-y-auto", children: navItems.map(item => {
                                            const titleKey = item.id;
                                            const descKey = `${item.id}Desc`;
                                            return (_jsx(SidebarButton, { title: t.privatelife.screen.nav[titleKey], description: t.privatelife.screen.nav[descKey], icon: item.icon, isActive: activeTab === item.id, onClick: () => setActiveTab(item.id) }, item.id));
                                        }) }), _jsx("footer", { className: "p-4 border-t border-gray-700", children: _jsx("button", { onClick: onBack, className: "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase", children: t.privatelife.screen.backToMain }) })] }), _jsx("main", { className: "flex-grow p-8 overflow-y-auto relative z-10", children: renderContent() })] })] })] }));
};
export default PrivatlebenScreen;
