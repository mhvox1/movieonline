import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import GameHeader from './GameHeader';
import BarChartIcon from './icons/BarChartIcon';
import KalenderIcon from './icons/KalenderIcon';
import PersonalIcon from './icons/PersonalIcon';
import DirectorIcon from './icons/DirectorIcon'; // Assuming a generic talent icon might be better
import { useGame } from '../contexts/GameContext';
import { officeBackgroundImage } from './backgrounds/OfficeBackgroundImage';
// FIX: Import ScoutingIcon to resolve 'Cannot find name' error.
import ScoutingIcon from './icons/ScoutingIcon';
// Import new tab components
import ChartsTab from './tabs/office/ChartsTab';
import CalendarTab from './tabs/office/CalendarTab';
import EmployeesTab from './tabs/office/EmployeesTab';
import TalentManagementTab from './tabs/office/TalentManagementTab';
import KontakteTab from './tabs/office/KontakteTab';
import MailIcon from './icons/MailIcon';
import { useTranslation } from '../hooks/useTranslation';
// FIX: Import 'NachrichtenTab' component to resolve 'Cannot find name' error.
import NachrichtenTab from './tabs/office/NachrichtenTab';
const SidebarButton = ({ title, description, icon, isActive, disabled, onClick, hasNotification }) => {
    const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
    const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';
    const disabledClasses = 'opacity-50 cursor-not-allowed hover:-translate-y-0';
    return (_jsxs("button", { onClick: onClick, disabled: disabled, className: `relative bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses} ${disabled ? disabledClasses : ''}`, children: [hasNotification && (_jsxs("span", { className: "absolute -top-1 -right-1 flex h-3 w-3", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" }), _jsx("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-red-500" })] })), _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: `bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && 'bg-amber-500'}`, children: icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: `text-md font-bold font-cinzel ${isActive ? 'text-amber-300' : 'text-amber-400'} group-hover:text-amber-300 transition-colors`, children: title }), _jsx("p", { className: "text-xs text-gray-300 mt-1", children: description })] })] })] }));
};
const OfficeScreen = ({ onBack, gameSpeed, setGameSpeed, initialTab }) => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(initialTab || 'nachrichten');
    if (!playerData)
        return null;
    const unreadMessagesCount = useMemo(() => {
        if (!playerData.messages)
            return 0;
        return playerData.messages.filter(m => !m.read && !m.isArchived).length;
    }, [playerData.messages]);
    const renderContent = () => {
        switch (activeTab) {
            case 'nachrichten':
                return _jsx(NachrichtenTab, {});
            case 'kontakte':
                return _jsx(KontakteTab, {});
            case 'talent_management':
                return _jsx(TalentManagementTab, {});
            case 'employees':
                return _jsx(EmployeesTab, {});
            case 'charts':
                return _jsx(ChartsTab, {});
            case 'calendar':
                return _jsx(CalendarTab, {});
            default:
                return null;
        }
    };
    const navItems = [
        { id: 'nachrichten', tKey: 'messages', icon: _jsx(MailIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black" }), notification: unreadMessagesCount > 0 },
        { id: 'kontakte', tKey: 'contacts', icon: _jsx(DirectorIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'talent_management', tKey: 'casting', icon: _jsx(ScoutingIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'employees', tKey: 'employees', icon: _jsx(PersonalIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'charts', tKey: 'charts', icon: _jsx(BarChartIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black" }) },
        { id: 'calendar', tKey: 'calendar', icon: _jsx(KalenderIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black" }) }
    ];
    return (_jsxs("div", { className: "w-full h-full bg-cover bg-center flex flex-col", style: { backgroundImage: `url(${officeBackgroundImage})` }, children: [_jsx(GameHeader, { gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, disabled: true }), _jsxs("div", { className: "flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden", children: [_jsxs("aside", { className: "w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col", children: [_jsx("header", { className: "p-6 text-center border-b border-gray-700", children: _jsx("h1", { className: "text-3xl font-bold font-cinzel text-amber-400", children: t.office.screen.title }) }), _jsx("nav", { className: "flex-grow p-4 flex flex-col gap-4 overflow-y-auto", children: navItems.map(item => {
                                    const title = t.office.screen.nav[item.tKey];
                                    const descriptionKey = `${item.tKey}Desc`;
                                    const description = t.office.screen.nav[descriptionKey];
                                    return (_jsx(SidebarButton, { title: title, description: description, icon: item.icon, isActive: activeTab === item.id, onClick: () => setActiveTab(item.id), hasNotification: 'notification' in item && item.notification }, item.id));
                                }) }), _jsx("footer", { className: "p-4 border-t border-gray-700", children: _jsx("button", { onClick: onBack, className: "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase", children: t.office.screen.backToMain }) })] }), _jsx("main", { className: "flex-grow p-8 overflow-y-auto", children: renderContent() })] })] }));
};
export default OfficeScreen;
