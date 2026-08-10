
import React, { useState } from 'react';
import { GameSpeed } from '../types';
import { useGame } from '../contexts/GameContext';
import { PROPERTY_IMAGES } from './images/propertyImages';
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

interface PrivatlebenScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
}

type PrivatlebenTab = 'overview' | 'status' | 'assets' | 'family' | 'education';

const SidebarButton: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ title, description, icon, isActive, disabled, onClick }) => {
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

const PrivatlebenScreen: React.FC<PrivatlebenScreenProps> = ({ onBack, gameSpeed, setGameSpeed }) => {
  const { playerData } = useGame();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<PrivatlebenTab>('overview');
  
  if (!playerData) return null;
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
          return <OverviewTab />;
      case 'status':
        return <StatusFinanceTab />;
       case 'assets':
        return <AssetsTab />;
       case 'family':
            return <RelationshipsTab />;
       case 'education':
           return <EducationTab />;
      default:
        return null;
    }
  };
  
  const navItems = [
      { id: 'overview', icon: <PrivatlebenIcon className="w-5 h-5 bg-gray-400 group-hover:bg-black"/> },
      { id: 'status', icon: <OfficeIcon className="w-5 h-5 bg-gray-400 group-hover:bg-black"/> },
      { id: 'assets', icon: <AssetsIcon className="w-5 h-5 bg-gray-400 group-hover:bg-black"/> },
      { id: 'family', icon: <FamilyIcon className="w-5 h-5 bg-gray-400 group-hover:bg-black"/> },
      { id: 'education', icon: <EducationIcon className="w-5 h-5 bg-gray-400 group-hover:bg-black"/> }
  ];

  return (
    <div
      className="w-full h-full bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${PROPERTY_IMAGES['prop_rental']})` }} // Default BG, layout covers it
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div> {/* Dark overlay for readability */}
      
      <div className="relative z-10 w-full h-full flex flex-col">
          <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
          
          <div className="flex-grow w-full flex flex-row overflow-hidden">
            <aside className="w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col z-20">
                <header className="p-6 text-center border-b border-gray-700">
                    <h1 className="text-3xl font-bold font-cinzel text-amber-400">{t.privatelife.screen.title}</h1>
                </header>
                <nav className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
                    {navItems.map(item => {
                        const titleKey = item.id as keyof typeof t.privatelife.screen.nav;
                        const descKey = `${item.id}Desc` as keyof typeof t.privatelife.screen.nav;
                        return (
                            <SidebarButton
                                key={item.id}
                                title={t.privatelife.screen.nav[titleKey]}
                                description={t.privatelife.screen.nav[descKey]}
                                icon={item.icon}
                                isActive={activeTab === item.id}
                                onClick={() => setActiveTab(item.id as PrivatlebenTab)}
                            />
                        );
                    })}
                </nav>
                <footer className="p-4 border-t border-gray-700">
                    <button onClick={onBack} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase">
                        {t.privatelife.screen.backToMain}
                    </button>
                </footer>
            </aside>
            
            <main className="flex-grow p-8 overflow-y-auto relative z-10">
                 {renderContent()}
            </main>
          </div>
      </div>
    </div>
  );
};

export default PrivatlebenScreen;
