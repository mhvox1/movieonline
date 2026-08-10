
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { PlayerData, Language, ScalingMode, CustomDataPackage } from '../types';

interface GameContextType {
  playerData: PlayerData | null;
  setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
  masterVolume: number;
  setMasterVolume: React.Dispatch<React.SetStateAction<number>>;
  musicVolume: number;
  setMusicVolume: React.Dispatch<React.SetStateAction<number>>;
  effectsVolume: number;
  setEffectsVolume: React.Dispatch<React.SetStateAction<number>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  playSfx: (soundName: 'click') => void;
  isRightClickToMainScreenEnabled: boolean;
  setIsRightClickToMainScreenEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  showWeeklyNewspaper: boolean;
  setShowWeeklyNewspaper: React.Dispatch<React.SetStateAction<boolean>>;
  jumpToNewsOnMessage: boolean;
  setJumpToNewsOnMessage: React.Dispatch<React.SetStateAction<boolean>>;
  pauseOnMessage: boolean;
  setPauseOnMessage: React.Dispatch<React.SetStateAction<boolean>>;
  isF12ReloadEnabled: boolean;
  setIsF12ReloadEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  scalingMode: ScalingMode;
  setScalingMode: React.Dispatch<React.SetStateAction<ScalingMode>>;
  betaVersion: boolean;
  betaInfo: boolean;
  setBetaInfo: React.Dispatch<React.SetStateAction<boolean>>;
  generalSound: boolean;
  setGeneralSound: React.Dispatch<React.SetStateAction<boolean>>;
  gameRelease: boolean;
  speed: boolean;
  setSpeed: React.Dispatch<React.SetStateAction<boolean>>;
  Demo: boolean;
  setDemo: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Editor related
  editorEnabled: boolean;
  setEditorEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  activeDataPackage: string;
  setActiveDataPackage: React.Dispatch<React.SetStateAction<string>>;
  customPackages: CustomDataPackage[];
  saveCustomPackage: (pkg: CustomDataPackage) => void;
  deleteCustomPackage: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SETTINGS_KEY = 'film_tycoon_settings';
const PACKAGES_KEY = 'movie_business_custom_packages';

// VERSIONIERUNG: Erhöhe diese Zahl, wenn du neue Einstellungen hinzufügst oder Strukturen änderst.
// Das System wird dann versuchen, alte Werte zu migrieren oder auf Defaults zurückzufallen.
const SETTINGS_VERSION = 104;

const DEFAULT_SETTINGS = {
    masterVolume: 5,
    musicVolume: 5,
    effectsVolume: 5,
    isMuted: false,
    isRightClickToMainScreenEnabled: false,
    showWeeklyNewspaper: true,
    jumpToNewsOnMessage: false,
    pauseOnMessage: true,
    isF12ReloadEnabled: true,
    language: 'de' as Language,
    scalingMode: 'maintain-ratio' as ScalingMode,
    betaInfo: false,
    generalSound: false,
    speed: true, //False = x20
    editorEnabled: true,
    activeDataPackage: 'Original',
    version: SETTINGS_VERSION
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  
  // Initialize states with defaults
  const [masterVolume, setMasterVolume] = useState(DEFAULT_SETTINGS.masterVolume);
  const [musicVolume, setMusicVolume] = useState(DEFAULT_SETTINGS.musicVolume);
  const [effectsVolume, setEffectsVolume] = useState(DEFAULT_SETTINGS.effectsVolume);
  const [isMuted, setIsMuted] = useState(DEFAULT_SETTINGS.isMuted);
  const [isRightClickToMainScreenEnabled, setIsRightClickToMainScreenEnabled] = useState(DEFAULT_SETTINGS.isRightClickToMainScreenEnabled);
  const [showWeeklyNewspaper, setShowWeeklyNewspaper] = useState(DEFAULT_SETTINGS.showWeeklyNewspaper);
  const [jumpToNewsOnMessage, setJumpToNewsOnMessage] = useState(DEFAULT_SETTINGS.jumpToNewsOnMessage);
  const [pauseOnMessage, setPauseOnMessage] = useState(DEFAULT_SETTINGS.pauseOnMessage);
  const [isF12ReloadEnabled, setIsF12ReloadEnabled] = useState(DEFAULT_SETTINGS.isF12ReloadEnabled);
  const [language, setLanguage] = useState<Language>(DEFAULT_SETTINGS.language);
  const [scalingMode, setScalingMode] = useState<ScalingMode>(DEFAULT_SETTINGS.scalingMode);
  const [betaVersion] = useState(false); // Default to true for now
  const [betaInfo, setBetaInfo] = useState(DEFAULT_SETTINGS.betaInfo);
  const [generalSound, setGeneralSound] = useState(DEFAULT_SETTINGS.generalSound);
  const [speed, setSpeed] = useState(DEFAULT_SETTINGS.speed); // true = limited (x20 hidden), false = unlimited (x20 shown)
  const [Demo, setDemo] = useState(false); // Demo Mode active by default
  
  // Editor States
  const [editorEnabled, setEditorEnabled] = useState(DEFAULT_SETTINGS.editorEnabled); 
  const [activeDataPackage, setActiveDataPackage] = useState<string>(DEFAULT_SETTINGS.activeDataPackage);
  const [customPackages, setCustomPackages] = useState<CustomDataPackage[]>([]);
  
  // Set to true to disable pre-filled values in New Game screen
  const [gameRelease] = useState(false);

  // Load settings from localStorage on initial mount with Migration Logic
  useEffect(() => {
    try {
      const savedSettingsJSON = localStorage.getItem(SETTINGS_KEY);
      
      // Start with Defaults to ensure all new fields are present
      let finalSettings = { ...DEFAULT_SETTINGS };

      if (savedSettingsJSON) {
        const savedSettings = JSON.parse(savedSettingsJSON);

        // Check Version
        if (savedSettings.version !== SETTINGS_VERSION) {
            console.log(`Settings version mismatch (Saved: ${savedSettings.version}, Current: ${SETTINGS_VERSION}). Migrating safe values...`);
            
            // Migration Strategy: "Safe Keep". 
            // We only copy over values that are safe to keep (user preferences). 
            // Structural things or deprecated flags are ignored (they stay Default).
            
            if (typeof savedSettings.masterVolume === 'number') finalSettings.masterVolume = savedSettings.masterVolume;
            if (typeof savedSettings.musicVolume === 'number') finalSettings.musicVolume = savedSettings.musicVolume;
            if (typeof savedSettings.effectsVolume === 'number') finalSettings.effectsVolume = savedSettings.effectsVolume;
            if (typeof savedSettings.isMuted === 'boolean') finalSettings.isMuted = savedSettings.isMuted;
            if (typeof savedSettings.language === 'string') finalSettings.language = savedSettings.language;
            if (typeof savedSettings.scalingMode === 'string') finalSettings.scalingMode = savedSettings.scalingMode;
            if (typeof savedSettings.isRightClickToMainScreenEnabled === 'boolean') finalSettings.isRightClickToMainScreenEnabled = savedSettings.isRightClickToMainScreenEnabled;
            if (typeof savedSettings.isF12ReloadEnabled === 'boolean') finalSettings.isF12ReloadEnabled = savedSettings.isF12ReloadEnabled;
            
            // Force update the stored version immediately
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(finalSettings));
        } else {
            // Version matches, merge saved settings over defaults (to fill any accidentally missing keys with defaults)
            finalSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        }
      }

      // Apply Final Settings to State
      setMasterVolume(finalSettings.masterVolume);
      setMusicVolume(finalSettings.musicVolume);
      setEffectsVolume(finalSettings.effectsVolume);
      setIsMuted(finalSettings.isMuted);
      setIsRightClickToMainScreenEnabled(finalSettings.isRightClickToMainScreenEnabled);
      setShowWeeklyNewspaper(finalSettings.showWeeklyNewspaper);
      setJumpToNewsOnMessage(finalSettings.jumpToNewsOnMessage);
      setPauseOnMessage(finalSettings.pauseOnMessage);
      setIsF12ReloadEnabled(finalSettings.isF12ReloadEnabled);
      setLanguage(finalSettings.language);
      setScalingMode(finalSettings.scalingMode);
      setBetaInfo(finalSettings.betaInfo);
      setGeneralSound(finalSettings.generalSound);
      setSpeed(finalSettings.speed);
      
      // Editor stuff
      if (finalSettings.activeDataPackage) setActiveDataPackage(finalSettings.activeDataPackage);
      if (typeof finalSettings.editorEnabled === 'boolean') setEditorEnabled(finalSettings.editorEnabled);

      // Load Custom Packages (separate key, no migration needed usually)
      const savedPackages = localStorage.getItem(PACKAGES_KEY);
      if (savedPackages) {
          setCustomPackages(JSON.parse(savedPackages));
      }

    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen, lade Standards:", error);
      // Fallback is already handled by initial state values being DEFAULT_SETTINGS
    }
  }, []);

  // Effect to handle generalSound toggle
  useEffect(() => {
    if (generalSound) {
        if (masterVolume === 0 && musicVolume === 0 && effectsVolume === 0 && isMuted) {
             setMasterVolume(5);
             setMusicVolume(5);
             setEffectsVolume(5);
             setIsMuted(false);
        }
    } else {
        setMasterVolume(0);
        setMusicVolume(0);
        setEffectsVolume(0);
        setIsMuted(true);
    }
  }, [generalSound]);


  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settings = {
        masterVolume,
        musicVolume,
        effectsVolume,
        isMuted,
        isRightClickToMainScreenEnabled,
        showWeeklyNewspaper,
        jumpToNewsOnMessage,
        pauseOnMessage,
        isF12ReloadEnabled,
        language,
        scalingMode,
        betaInfo,
        generalSound,
        speed,
        activeDataPackage,
        editorEnabled,
        version: SETTINGS_VERSION // Important: Save current version
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
    }
  }, [masterVolume, musicVolume, effectsVolume, isMuted, isRightClickToMainScreenEnabled, showWeeklyNewspaper, jumpToNewsOnMessage, pauseOnMessage, isF12ReloadEnabled, language, scalingMode, betaInfo, generalSound, speed, activeDataPackage, editorEnabled]);


  const playSfx = (soundName: 'click') => {
    if (isMuted || effectsVolume === 0 || masterVolume === 0) return;

    // Erstellt ein neues Audio-Element für jeden Klick, um Überlappung zu ermöglichen
    const audio = new Audio(`./sfx/${soundName}.wav`);
    audio.volume = (effectsVolume / 10) * (masterVolume / 10);
    audio.play().catch(error => console.error("SFX play error:", error));
  };
  
  const saveCustomPackage = (pkg: CustomDataPackage) => {
      const updatedPackages = [...customPackages.filter(p => p.id !== pkg.id), pkg];
      setCustomPackages(updatedPackages);
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(updatedPackages));
  };
  
  const deleteCustomPackage = (id: string) => {
      const updatedPackages = customPackages.filter(p => p.id !== id);
      setCustomPackages(updatedPackages);
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(updatedPackages));
      if (activeDataPackage === id) setActiveDataPackage('Original');
  };

  return (
    <GameContext.Provider value={{ 
      playerData, 
      setPlayerData,
      masterVolume,
      setMasterVolume,
      musicVolume,
      setMusicVolume,
      effectsVolume,
      setEffectsVolume,
      isMuted,
      setIsMuted,
      playSfx,
      isRightClickToMainScreenEnabled,
      setIsRightClickToMainScreenEnabled,
      showWeeklyNewspaper,
      setShowWeeklyNewspaper,
      jumpToNewsOnMessage,
      setJumpToNewsOnMessage,
      pauseOnMessage,
      setPauseOnMessage,
      isF12ReloadEnabled,
      setIsF12ReloadEnabled,
      language,
      setLanguage,
      scalingMode,
      setScalingMode,
      betaVersion,
      betaInfo,
      setBetaInfo,
      generalSound,
      setGeneralSound,
      gameRelease,
      speed,
      setSpeed,
      Demo,
      setDemo,
      editorEnabled,
      setEditorEnabled,
      activeDataPackage,
      setActiveDataPackage,
      customPackages,
      saveCustomPackage,
      deleteCustomPackage
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
