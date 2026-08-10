
import React, { useState, useEffect, useRef } from 'react';
import { PlayerData, GameSpeed, Language, ScalingMode, SaveFile } from '../types';
import { settingsBackgroundImage } from './backgrounds/SettingsBackgroundImage';
import SaveIcon from './icons/SaveIcon';
import EinstellungenIcon from './icons/EinstellungenIcon';
import QuitIcon from './icons/QuitIcon';
import InfoIcon from './icons/InfoIcon';
import { useGame } from '../contexts/GameContext';
import GameHeader from './GameHeader';
import { useTranslation } from '../hooks/useTranslation';
import BugIcon from './icons/BugIcon';
import BetaFeedbackModal from './BetaFeedbackModal';
import TrashIcon from './icons/TrashIcon';
import { loadSaveFiles, persistSaveFiles } from '../hooks/saveStorage';

interface SettingsScreenProps {
  onBack: () => void;
  onQuit: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
}

type SettingsTab = 'save' | 'options' | 'manual';
type OptionsTab = 'grafik' | 'sound' | 'spiel';
type ManualTab = 'production' | 'studio' | 'finance' | 'privatelife';

const SETTINGS_KEY = 'film_tycoon_settings';

const SettingsButton: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
  textColor?: string;
}> = ({ title, description, icon, isActive, disabled, onClick, textColor }) => {
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
          <h3 className={`text-md font-bold font-cinzel ${textColor || (isActive ? 'text-amber-300' : 'text-amber-400')} group-hover:text-amber-300 transition-colors`}>
            {title}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

const OptionsTabButton: React.FC<{ title: string, isActive: boolean, onClick: () => void }> = ({ title, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`py-2 px-6 font-bold text-lg transition-colors duration-200 ${isActive ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
    >
        {title}
    </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onQuit, gameSpeed, setGameSpeed }) => {
  const { t, language } = useTranslation();
  const { 
    playerData, 
    masterVolume, setMasterVolume,
    musicVolume, setMusicVolume,
    effectsVolume, setEffectsVolume,
    isMuted, setIsMuted,
    isRightClickToMainScreenEnabled, setIsRightClickToMainScreenEnabled,
    showWeeklyNewspaper, setShowWeeklyNewspaper,
    jumpToNewsOnMessage, setJumpToNewsOnMessage,
    pauseOnMessage, setPauseOnMessage,
    setLanguage,
    scalingMode, setScalingMode,
    betaVersion,
    activeDataPackage, setActiveDataPackage, customPackages,
    editorEnabled 
  } = useGame();
  
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  const [activeTab, setActiveTab] = useState<SettingsTab>(playerData ? 'save' : 'options');
  const [optionsTab, setOptionsTab] = useState<OptionsTab>('spiel');
  const [manualTab, setManualTab] = useState<ManualTab>('production');
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [saves, setSaves] = useState<SaveFile[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [overwriteConfirmSlot, setOverwriteConfirmSlot] = useState<number | null>(null);
  const [showBetaModal, setShowBetaModal] = useState(false);

  const preMuteVolumes = useRef({ master: masterVolume, music: musicVolume, effects: effectsVolume });

    useEffect(() => {
        let isMounted = true;

        const initializeSaves = async () => {
            try {
                const initialSaves = await loadSaveFiles();
                const fullSaves = Array.from({ length: 5 }, (_, i) => {
                    const slotId = i + 1;
                    return initialSaves.find((s: SaveFile) => s.slotId === slotId) || { slotId, timestamp: '', data: null };
                });
                if (isMounted) {
                    setSaves(fullSaves);
                }
            } catch (error) {
                console.error("Failed to load game saves:", error);
                if (isMounted) {
                    setSaves(Array.from({ length: 5 }, (_, i) => ({ slotId: i + 1, timestamp: '', data: null })));
                }
            }
        };

        void initializeSaves();

        return () => {
            isMounted = false;
        };
    }, []);

  // Safety effect: If playerData becomes null (e.g. on quit), reset sensitive states
  useEffect(() => {
    if (!playerData) {
        if (activeTab === 'save') setActiveTab('options');
        if (showQuitConfirm) setShowQuitConfirm(false);
    }
  }, [playerData, activeTab, showQuitConfirm]);

    const handleSave = async (slotId: number, confirmed: boolean = false) => {
    if (!playerData) return;

    const saveSlot = saves.find(s => s.slotId === slotId);

    if (saveSlot?.data && !confirmed) {
        setOverwriteConfirmSlot(slotId);
        return;
    }

    try {
            // Reload current saves to include potential AutoSave (Slot 0) that is not in state
            let allSaves: SaveFile[] = await loadSaveFiles();
      
      const newSave: SaveFile = {
          slotId,
          timestamp: new Date().toISOString(),
          data: playerData,
      };

      // Update or Add
      allSaves = allSaves.filter(s => s.slotId !== slotId);
      allSaves.push(newSave);

    await persistSaveFiles(allSaves);
      
      // Update local state for display (only slots 1-5)
      const updatedDisplaySaves = saves.map(s => s.slotId === slotId ? newSave : s);
      setSaves(updatedDisplaySaves);

      setSaveMessage(t.settings.saveSuccess);
      setTimeout(() => setSaveMessage(''), 3000); 
    } catch (error) {
      console.error("Failed to save game:", error);
      setSaveMessage(t.settings.saveError);
      setTimeout(() => setSaveMessage(''), 3000);
    }
    setOverwriteConfirmSlot(null);
  };

  const handleMuteToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsMuted(checked);
    if (checked) {
      preMuteVolumes.current = { master: masterVolume, music: musicVolume, effects: effectsVolume };
      setMasterVolume(0);
      setMusicVolume(0);
      setEffectsVolume(0);
    } else {
      setMasterVolume(preMuteVolumes.current.master > 0 ? preMuteVolumes.current.master : 8);
      setMusicVolume(preMuteVolumes.current.music > 0 ? preMuteVolumes.current.music : 6);
      setEffectsVolume(preMuteVolumes.current.effects > 0 ? preMuteVolumes.current.effects : 7);
    }
  };
  
  useEffect(() => {
    if (masterVolume > 0 || musicVolume > 0 || effectsVolume > 0) {
        if (isMuted) setIsMuted(false);
    } else {
        if (!isMuted) setIsMuted(true);
    }
  }, [masterVolume, musicVolume, effectsVolume, isMuted, setIsMuted]);


  const renderContent = () => {
    if (activeTab === 'options') {
        return (
             <div className="h-full flex flex-col max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-6 font-cinzel text-amber-400">{t.settings.options}</h2>
                <div className="flex mb-6 border-b border-gray-600 flex-shrink-0 justify-center gap-4">
                    <OptionsTabButton title={t.settings.gameTab} isActive={optionsTab === 'spiel'} onClick={() => setOptionsTab('spiel')} />
                    <OptionsTabButton title={t.settings.graphicsTab} isActive={optionsTab === 'grafik'} onClick={() => setOptionsTab('grafik')} />
                    <OptionsTabButton title={t.settings.soundTab} isActive={optionsTab === 'sound'} onClick={() => setOptionsTab('sound')} />
                </div>
                <div className="flex-grow overflow-y-auto pr-4 text-gray-300 custom-scrollbar">
                    
                    {optionsTab === 'grafik' && (
                        <div className="space-y-4 max-w-md mx-auto">
                            <h3 className="text-2xl font-cinzel text-amber-300 mb-4 text-center">{t.settings.graphicsTab}</h3>
                            
                            <div className="relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                <label htmlFor="scaling-mode" className="font-semibold cursor-pointer text-white">
                                    {t.settings.displayMode}
                                </label>
                                <select
                                    id="scaling-mode"
                                    value={scalingMode}
                                    onChange={(e) => setScalingMode(e.target.value as ScalingMode)}
                                    className="bg-gray-700 border border-gray-500 rounded text-white px-3 py-1 outline-none focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer"
                                >
                                    <option value="maintain-ratio">{t.settings.maintainRatio}</option>
                                    <option value="stretch">{t.settings.stretch}</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {optionsTab === 'sound' && (
                         <div className="space-y-6 max-w-md mx-auto">
                            <h3 className="text-2xl font-cinzel text-amber-300 mb-4 text-center">{t.settings.soundTab}</h3>
                            <div>
                                <label className="text-white font-semibold">{t.settings.volumeMaster}</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-400 w-2 text-center">0</span>
                                    <input type="range" min="0" max="10" value={masterVolume} onChange={(e) => setMasterVolume(Number(e.target.value))} className="w-full accent-amber-500"/>
                                    <span className="text-sm text-gray-400 w-2 text-center">10</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-white font-semibold">{t.settings.volumeMusic}</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-400 w-2 text-center">0</span>
                                    <input type="range" min="0" max="10" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} className="w-full accent-amber-500"/>
                                    <span className="text-sm text-gray-400 w-2 text-center">10</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-white font-semibold">{t.settings.volumeEffects}</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-400 w-2 text-center">0</span>
                                    <input type="range" min="0" max="10" value={effectsVolume} onChange={(e) => setEffectsVolume(Number(e.target.value))} className="w-full accent-amber-500"/>
                                    <span className="text-sm text-gray-400 w-2 text-center">10</span>
                                </div>
                            </div>
                             <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-700">
                                <input 
                                    type="checkbox" 
                                    id="mute-checkbox"
                                    checked={isMuted}
                                    onChange={handleMuteToggle}
                                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                />
                                <label htmlFor="mute-checkbox" className="text-white cursor-pointer">{t.settings.mute}</label>
                            </div>
                        </div>
                    )}
                    {optionsTab === 'spiel' && (
                        <div className="space-y-4 max-w-md mx-auto">
                            <h3 className="text-2xl font-cinzel text-amber-300 mb-4 text-center">{t.settings.gameTab}</h3>
                            
                            {!playerData && (
                                <div className="relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                    <label htmlFor="language-select" className="font-semibold cursor-pointer text-white">
                                        {t.settings.language}
                                    </label>
                                    <select
                                        id="language-select"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as Language)}
                                        className="bg-gray-700 border border-gray-500 rounded text-white px-3 py-1 outline-none focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer"
                                    >
                                        <option value="de">Deutsch</option>
                                        <option value="en">English</option>
                                       </select>
                                </div>
                            )}

                             {/* Data Package Selection (Only in Main Menu AND if Editor is Enabled) */}
                             {!playerData && editorEnabled && (
                                <div className="relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                    <div className="flex flex-col">
                                        <label htmlFor="data-package-select" className="font-semibold cursor-pointer text-white">
                                            {t.settings.dataSource}
                                        </label>
                                        <span className="text-xs text-gray-400">{t.settings.dataSourceDesc}</span>
                                    </div>
                                    <select
                                        id="data-package-select"
                                        value={activeDataPackage}
                                        onChange={(e) => setActiveDataPackage(e.target.value)}
                                        className="bg-gray-700 border border-gray-500 rounded text-white px-3 py-1 outline-none focus:ring-2 focus:ring-amber-500 transition-colors cursor-pointer max-w-[200px]"
                                    >
                                        <option value="Original">Original</option>
                                        {customPackages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* ... Other game options ... */}
                             {/* Right Click Option */}
                            <div className="relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                <label htmlFor="right-click-menu" className="font-semibold cursor-pointer text-white">
                                    {t.settings.rightClickMenu}
                                </label>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700">
                                    {t.settings.rightClickMenuTooltip}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
                                </div>
                                {/* Toggle Switch */}
                                <label htmlFor="right-click-menu" className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        id="right-click-menu"
                                        checked={isRightClickToMainScreenEnabled}
                                        onChange={(e) => setIsRightClickToMainScreenEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            {/* Weekly Newspaper Option */}
                            <div className="relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                <label htmlFor="weekly-newspaper" className="font-semibold cursor-pointer text-white">
                                    {t.settings.weeklyNewspaper}
                                </label>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700">
                                    {t.settings.weeklyNewspaperTooltip}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
                                </div>
                                {/* Toggle Switch */}
                                <label htmlFor="weekly-newspaper" className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        id="weekly-newspaper"
                                        checked={showWeeklyNewspaper}
                                        onChange={(e) => setShowWeeklyNewspaper(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                            
                            {/* Jump to News Option */}
                            <div className="relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                <label htmlFor="jump-to-news" className="font-semibold cursor-pointer text-white">
                                    {t.settings.jumpToNews}
                                </label>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700">
                                    {t.settings.jumpToNewsTooltip}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
                                </div>
                                {/* Toggle Switch */}
                                <label htmlFor="jump-to-news" className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        id="jump-to-news"
                                        checked={jumpToNewsOnMessage}
                                        onChange={(e) => setJumpToNewsOnMessage(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            {/* Pause on Message Option */}
                            <div className="relative group flex justify-between items-center bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                <label htmlFor="pause-on-message" className="font-semibold cursor-pointer text-white">
                                    {t.settings.pauseOnMessage}
                                </label>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg invisible group-hover:visible pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700">
                                    {t.settings.pauseOnMessageTooltip}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
                                </div>
                                {/* Toggle Switch */}
                                <label htmlFor="pause-on-message" className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        id="pause-on-message"
                                        checked={pauseOnMessage}
                                        onChange={(e) => setPauseOnMessage(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        );
    }
    
    if (activeTab === 'manual') {
        return (
             <div className="h-full flex flex-col max-w-5xl mx-auto bg-gray-900/80 backdrop-blur-md p-8 rounded-xl border border-gray-700 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-6 font-cinzel text-amber-400">{t.settings.manualTab}</h2>
                <div className="flex mb-6 border-b border-gray-600 flex-shrink-0 justify-center gap-4">
                    <OptionsTabButton title={t.settings.manual.tabs.production} isActive={manualTab === 'production'} onClick={() => setManualTab('production')} />
                    <OptionsTabButton title={t.settings.manual.tabs.studio} isActive={manualTab === 'studio'} onClick={() => setManualTab('studio')} />
                    <OptionsTabButton title={t.settings.manual.tabs.finance} isActive={manualTab === 'finance'} onClick={() => setManualTab('finance')} />
                    <OptionsTabButton title={t.settings.manual.tabs.privatelife} isActive={manualTab === 'privatelife'} onClick={() => setManualTab('privatelife')} />
                </div>
                
                <div className="flex-grow overflow-y-auto pr-4 text-gray-300 custom-scrollbar">
                     <div className="space-y-6 max-w-3xl mx-auto text-gray-300 bg-gray-800/50 p-6 rounded-md border border-gray-600">
                        
                        {manualTab === 'production' && (
                            <>
                                <h3 className="text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2">{t.settings.manual.production.title}</h3>
                                <p className="mb-6 italic">{t.settings.manual.production.intro}</p>
                                
                                <div className="space-y-6">
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.production.script}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.production.casting}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.production.filming}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.production.post}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.production.release}</p>
                                </div>
                            </>
                        )}

                        {manualTab === 'studio' && (
                             <>
                                <h3 className="text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2">{t.settings.manual.studio.title}</h3>
                                <p className="mb-6 italic">{t.settings.manual.studio.intro}</p>
                                
                                <div className="space-y-6">
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.studio.buildings}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.studio.employees}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.studio.research}</p>
                                </div>
                            </>
                        )}
                        
                        {manualTab === 'finance' && (
                             <>
                                <h3 className="text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2">{t.settings.manual.finance.title}</h3>
                                <p className="mb-6 italic">{t.settings.manual.finance.intro}</p>
                                
                                <div className="space-y-6">
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.finance.banking}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.finance.stock}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.finance.marketing}</p>
                                </div>
                            </>
                        )}

                        {manualTab === 'privatelife' && (
                             <>
                                <h3 className="text-2xl font-bold text-amber-300 mb-4 border-b border-amber-500/30 pb-2">{t.settings.manual.privatelife.title}</h3>
                                <p className="mb-6 italic">{t.settings.manual.privatelife.intro}</p>
                                
                                <div className="space-y-6">
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.privatelife.energy}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.privatelife.relationships}</p>
                                    <p className="leading-relaxed text-sm whitespace-pre-line">{t.settings.manual.privatelife.assets}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
             </div>
        );
    }
    
    if (activeTab === 'save') {
        // ... (Existing Save Code) ...
        return (
            <div className="h-full flex flex-col">
                <h2 className="text-4xl font-bold text-center mb-8 font-cinzel text-amber-400">{t.settings.saveGame}</h2>
                <p className="text-gray-400 text-sm text-center mb-6 italic">{t.settings.autoSaveNote}</p>
                <div className="space-y-4 max-w-2xl mx-auto w-full">
                    {saves.map((save) => (
                        <button
                            key={save.slotId}
                            onClick={() => handleSave(save.slotId)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-4 text-left transition-all hover:border-amber-500 hover:bg-gray-800 group relative"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-white">{t.settings.saveSlot} {save.slotId}</span>
                                {save.data ? (
                                    <span className="text-sm text-gray-400">
                                        {new Date(save.timestamp).toLocaleString(locale)}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-500">{t.settings.slotEmpty}</span>
                                )}
                            </div>
                             {save.data && (
                                <div className="mt-2 text-sm text-gray-300 grid grid-cols-3 gap-4">
                                    <span>{t.settings.slotStudio}: <span className="font-semibold">{save.data.studioName}</span></span>
                                    <span>{t.settings.slotDate}: <span className="font-semibold">{new Date(save.data.gameDate).toLocaleDateString(locale)}</span></span>
                                    <span>{t.settings.slotCapital}: <span className="font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(save.data.capital)}</span></span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                <span className="font-bold text-amber-400 uppercase tracking-wider bg-black/80 px-3 py-1 rounded">{save.data ? t.settings.overwriteTitle : t.settings.saveGame}</span>
                            </div>
                        </button>
                    ))}
                </div>
                {saveMessage && <p className="text-center text-green-400 mt-4 font-bold text-lg animate-pulse">{saveMessage}</p>}
            </div>
        );
    }
    return null;
  };

  return (
    <div
      className="w-full h-full bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${settingsBackgroundImage})` }}
    >
       <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
       <div className="flex-grow w-full flex flex-row bg-black bg-opacity-0 overflow-hidden">
         <aside className="w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col">
            <header className="p-6 text-center border-b border-gray-700">
                <h1 className="text-3xl font-bold font-cinzel text-amber-400">{t.settings.title}</h1>
            </header>
            <nav className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
                {playerData && (
                    <SettingsButton 
                        title={t.settings.saveGame}
                        description={t.settings.saveGame}
                        icon={<SaveIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                        isActive={activeTab === 'save'}
                        onClick={() => setActiveTab('save')}
                    />
                )}
                <SettingsButton 
                    title={t.settings.options}
                    description={t.settings.options}
                    icon={<EinstellungenIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                    isActive={activeTab === 'options'}
                    onClick={() => setActiveTab('options')}
                />
                
                {/* Handbuch Button moved to Sidebar */}
                <SettingsButton 
                    title={t.settings.manualTab}
                    description={t.settings.manualTab}
                    icon={<InfoIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                    isActive={activeTab === 'manual'}
                    onClick={() => setActiveTab('manual')}
                />
                
                {/* Quit Button moved to Sidebar */}
                {playerData && (
                    <div className="mt-4 pt-4 border-t border-gray-600/50">
                        <SettingsButton 
                            title={t.settings.quitGame}
                            description={t.settings.quitGame}
                            icon={<QuitIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                            isActive={false}
                            onClick={() => setShowQuitConfirm(true)}
                        />
                         {betaVersion && (
                            <div className="mt-2">
                                <SettingsButton 
                                    title={t.beta.reportError}
                                    description={t.beta.reportErrorDesc}
                                    icon={<BugIcon className="h-5 w-5 bg-red-400 group-hover:bg-black transition-colors" />}
                                    isActive={false}
                                    onClick={() => setShowBetaModal(true)}
                                    textColor="text-red-500"
                                />
                            </div>
                        )}
                    </div>
                )}
            </nav>
            <footer className="p-4 border-t border-gray-700">
                <button
                    onClick={onBack}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase"
                >
                   {playerData ? t.settings.backToGame : t.settings.backToMenu}
                </button>
            </footer>
         </aside>
         <main className="flex-grow p-8 overflow-y-auto bg-black/40 backdrop-blur-sm">
             {renderContent()}
         </main>
       </div>

       {overwriteConfirmSlot !== null && (
         <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                 <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.settings.overwriteTitle}</h2>
                 <p className="text-gray-300 text-lg mb-6">{t.settings.overwriteText}</p>
                 <div className="flex justify-center gap-4">
                     <button onClick={() => setOverwriteConfirmSlot(null)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                     <button onClick={() => handleSave(overwriteConfirmSlot, true)} className="bg-amber-500 text-gray-900 font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all">{t.settings.overwriteYes}</button>
                 </div>
             </div>
         </div>
       )}

        {showQuitConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.settings.quitGameTitle}</h2>
                <p className="text-gray-300 text-lg mb-6">{t.settings.quitGameText}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setShowQuitConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                    <button onClick={onQuit} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.settings.quitGameYes}</button>
                </div>
            </div>
        </div>
        )}

        {/* Beta Feedback Modal */}
        {showBetaModal && <BetaFeedbackModal onClose={() => setShowBetaModal(false)} />}
    </div>
  );
};

export default SettingsScreen;
