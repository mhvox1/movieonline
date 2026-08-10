
import React, { useState, useMemo } from 'react';
import { GameSpeed, OfficeTabType } from '../types';
import GameHeader from './GameHeader';
import BarChartIcon from './icons/BarChartIcon';
import CompetitionIcon from './icons/CompetitionIcon';
import KalenderIcon from './icons/KalenderIcon';
import DrehbuchIcon from './icons/DrehbuchIcon';
import PersonalIcon from './icons/PersonalIcon';
import DirectorIcon from './icons/DirectorIcon'; // Assuming a generic talent icon might be better
import { useGame } from '../contexts/GameContext';
import { officeBackgroundImage } from './backgrounds/OfficeBackgroundImage';
// FIX: Import ScoutingIcon to resolve 'Cannot find name' error.
import ScoutingIcon from './icons/ScoutingIcon';

// Import new tab components
import ChartsTab from './tabs/office/ChartsTab';
import CompetitionTab from './tabs/office/CompetitionTab';
import CalendarTab from './tabs/office/CalendarTab';
import ScriptsTab from './tabs/office/ScriptsTab';
import EmployeesTab from './tabs/office/EmployeesTab';
import TalentManagementTab from './tabs/office/TalentManagementTab';
import KontakteTab from './tabs/office/KontakteTab';
import NewsIcon from './icons/NewsIcon';
import NewsTab from './tabs/office/NewsTab';
import MailIcon from './icons/MailIcon';
import { useTranslation } from '../hooks/useTranslation';
// FIX: Import 'NachrichtenTab' component to resolve 'Cannot find name' error.
import NachrichtenTab from './tabs/office/NachrichtenTab';

interface OfficeScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  initialTab?: OfficeTabType;
}

const SidebarButton: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isActive: boolean;
    disabled?: boolean;
    onClick: () => void;
    hasNotification?: boolean;
}> = ({ title, description, icon, isActive, disabled, onClick, hasNotification }) => {
  const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
  const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';
  const disabledClasses = 'opacity-50 cursor-not-allowed hover:-translate-y-0';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${
        isActive ? activeClasses : defaultClasses
      } ${disabled ? disabledClasses : ''}`}
    >
      {hasNotification && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
      <div className="flex items-start">
        <div className={`bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && 'bg-amber-500'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-md font-bold font-cinzel ${isActive ? 'text-amber-300' : 'text-amber-400'} group-hover:text-amber-300 transition-colors`}>
            {title}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

const OfficeScreen: React.FC<OfficeScreenProps> = ({ onBack, gameSpeed, setGameSpeed, initialTab }) => {
  const { playerData } = useGame();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<OfficeTabType>(initialTab || 'nachrichten');

  if (!playerData) return null;
    
  const unreadMessagesCount = useMemo(() => {
    if (!playerData.messages) return 0;
    return playerData.messages.filter(m => !m.read && !m.isArchived).length;
  }, [playerData.messages]);

  const renderContent = () => {
    switch (activeTab) {
        case 'nachrichten':
            return <NachrichtenTab />;
        case 'kontakte':
            return <KontakteTab />;
        case 'talent_management':
            return <TalentManagementTab />;
        case 'employees':
            return <EmployeesTab />;
        case 'charts':
            return <ChartsTab />;
        case 'calendar':
            return <CalendarTab />;
        default:
            return null;
    }
  };

  const navItems = [
    { id: 'nachrichten', tKey: 'messages', icon: <MailIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black" />, notification: unreadMessagesCount > 0 },
    { id: 'kontakte', tKey: 'contacts', icon: <DirectorIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black" /> },
    { id: 'talent_management', tKey: 'casting', icon: <ScoutingIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black" /> },
    { id: 'employees', tKey: 'employees', icon: <PersonalIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black" /> },
    { id: 'charts', tKey: 'charts', icon: <BarChartIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black" /> },
    { id: 'calendar', tKey: 'calendar', icon: <KalenderIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black" /> }
  ];

  return (
    <div
      className="w-full h-full bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${officeBackgroundImage})` }}
    >
      <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
      <div className="flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden">
        <aside className="w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col">
            <header className="p-6 text-center border-b border-gray-700">
                <h1 className="text-3xl font-bold font-cinzel text-amber-400">{t.office.screen.title}</h1>
            </header>
            <nav className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
                {navItems.map(item => {
                    const title = t.office.screen.nav[item.tKey as keyof typeof t.office.screen.nav];
                    const descriptionKey = `${item.tKey}Desc`;
                    const description = t.office.screen.nav[descriptionKey as keyof typeof t.office.screen.nav];
                    
                    return (
                         <SidebarButton 
                            key={item.id}
                            title={title} 
                            description={description} 
                            icon={item.icon} 
                            isActive={activeTab === item.id} 
                            onClick={() => setActiveTab(item.id as OfficeTabType)} 
                            hasNotification={'notification' in item && item.notification} 
                        />
                    );
                })}
            </nav>
            <footer className="p-4 border-t border-gray-700">
                <button onClick={onBack} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase">
                    {t.office.screen.backToMain}
                </button>
            </footer>
        </aside>
        
        <main className="flex-grow p-8 overflow-y-auto">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default OfficeScreen;
