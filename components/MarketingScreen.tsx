
import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameSpeed, MarketingTab, DistributionPhaseTab } from '../types';
import GameHeader from './GameHeader';
import TrophyIcon from './icons/TrophyIcon';
import ArchiveIcon from './icons/ArchiveIcon';
import { marketingBackgroundImage } from './backgrounds/MarketingBackgroundImage';
import ProduktionIcon from './icons/ProduktionIcon';
import BarChartIcon from './icons/BarChartIcon';
import PieChartIcon from './icons/PieChartIcon'; // Import PieChartIcon
import UebersichtIcon from './icons/UebersichtIcon';

// Import tab components

import MyFilmsTab from './tabs/marketing/MyFilmsTab';
import FestivalsTab from './tabs/marketing/FestivalsTab';
import CurrentFilmCampaignsTab from './tabs/marketing/CurrentFilmCampaignsTab';
import ChartsTab from './tabs/office/ChartsTab';
import TrendTab from './tabs/marketing/TrendTab';
import { useTranslation } from '../hooks/useTranslation';



interface MarketingScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  initialTab?: MarketingTab;
  initialFilmTitle?: string;
  initialDistributionTab?: DistributionPhaseTab;
}

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
      className={`bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${
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

const MarketingScreen: React.FC<MarketingScreenProps> = ({ onBack, gameSpeed, setGameSpeed, initialTab, initialFilmTitle, initialDistributionTab }) => {
  const { playerData } = useGame();
  const { t } = useTranslation();
  // Default to 'current_film' or 'my_films'. Removed 'release' fallback.
  const [activeTab, setActiveTab] = useState<MarketingTab | 'charts' | 'analysis'>((!initialTab) ? 'current_film' : initialTab);

  if (!playerData) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'my_films':
        return <MyFilmsTab initialFilmTitle={initialFilmTitle} />;
      case 'charts':
        return <ChartsTab key="charts-view" />;
      case 'analysis':
        return <TrendTab key="analysis-view" />;
      case 'festivals':
        return <FestivalsTab />;
      case 'current_film':
        return <CurrentFilmCampaignsTab />;
      default:
        return <CurrentFilmCampaignsTab />;
    }
  };

    const hasProductionCampaign = (playerData.activeProductionCampaigns && playerData.activeProductionCampaigns.length > 0)
      || !!playerData.activeProductionCampaign;
    const isCurrentFilmMarketingDisabled = 
      !playerData.currentProject && !hasProductionCampaign;

  return (
    <div
      className="w-full h-full bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${marketingBackgroundImage})` }}
    >
      <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
      <div className="flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden">
        <aside className="w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col">
          <header className="p-6 text-center border-b border-gray-700">
            <h1 className="text-3xl font-bold font-cinzel text-amber-400">{t.marketing.screen.title}</h1>
          </header>
          <nav className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
             
          
             <SidebarButton
              title={t.marketing.screen.navMyFilms}
              description={t.marketing.screen.navMyFilmsDesc}
              icon={<ArchiveIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
              isActive={activeTab === 'my_films'}
              onClick={() => setActiveTab('my_films')}
            />
            <SidebarButton
              title={t.marketing.screen.navCampaign}
              description={t.marketing.screen.navCampaignDesc}
              icon={<ProduktionIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
              isActive={activeTab === 'current_film'}
              onClick={() => setActiveTab('current_film')}
               />
             <SidebarButton
              title={t.marketing.screen.navAnalysis}
              description={t.marketing.screen.navAnalysisDesc}
              icon={<PieChartIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
              isActive={activeTab === 'analysis'}
              onClick={() => setActiveTab('analysis')}
            
            />
            <SidebarButton
              title={t.marketing.screen.navCharts}
              description={t.marketing.screen.navChartsDesc}
              icon={<BarChartIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
              isActive={activeTab === 'charts'}
              onClick={() => setActiveTab('charts')}
            />
            
            <SidebarButton
              title={t.marketing.screen.navFestivals}
              description={t.marketing.screen.navFestivalsDesc}
              icon={<TrophyIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
              isActive={activeTab === 'festivals'}
              onClick={() => setActiveTab('festivals')}
            />
          </nav>
          <footer className="p-4 border-t border-gray-700">
            <button
              onClick={onBack}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase"
            >
              {t.marketing.screen.backToMain}
            </button>
          </footer>
        </aside>

        <main className={`flex-grow p-8 overflow-y-auto flex items-center justify-center`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MarketingScreen;
