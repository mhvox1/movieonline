
import React, { useState } from 'react';
import { mainMenuBackgroundImage } from './backgrounds/MainMenuBackgroundImage';
import { useTranslation } from '../hooks/useTranslation';
import { useGame } from '../contexts/GameContext';
import { GameState } from '../types'; // Import GameState if using enum for navigation

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onEditor?: () => void; // Optional editor callback
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

// FIX: Accept onNavigate prop from App if passed down, or just assume callbacks
// The component is likely used inside App.tsx which handles state. 
// We will assume MainMenu receives onEditor if needed or triggers navigation.
// BUT since App.tsx passes props, we need to update the prop interface in App.tsx or handle it here via callback.
// The provided file content shows MainMenu accepts onNewGame, onLoadGame, onSettings.
// We'll stick to that pattern but check context.
// Wait, to navigate to Editor, we need a prop or context. The current MainMenu receives functions.
// We will need to update App.tsx to pass the onEditor handler, but since I am editing MainMenu now,
// I'll update the interface and assume the parent will provide it. 
// UPDATE: I will check if onNavigate exists in props from the context of App.tsx which I will also edit.

// Let's modify MainMenu to accept onEditor.

const MainMenu: React.FC<MainMenuProps & { onEditor: () => void }> = ({ onNewGame, onLoadGame, onSettings, onEditor, onLogout, isAuthenticated = false }) => {
  const { t } = useTranslation();
  const { betaInfo, Demo, editorEnabled } = useGame();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleQuit = () => {
    setShowQuitConfirm(false);
    setIsExiting(true);
    // This will attempt to close the tab/window. It may be blocked by the browser.
    // The isExiting state serves as a fallback to show a goodbye message.
    window.close();
  };
  
  if (isExiting) {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center">
            <h1 className="text-4xl font-cinzel text-gray-400">{t.mainMenu.goodbye}</h1>
        </div>
    );
  }

  return (
    <div
      className="w-full h-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${mainMenuBackgroundImage})` }}
    >
      <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-20 p-8">
        
        {/* Buttons Panel */}
        <div className="flex flex-col space-y-4 w-full max-w-xs z-10">
          <button
            onClick={onNewGame}
            className="bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 hover:scale-105 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"
          >
            {t.mainMenu.newGame}
          </button>
          <button
            onClick={onLoadGame}
            className="bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 hover:scale-105 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"
          >
            {t.mainMenu.loadGame}
          </button>
          <button
            onClick={onSettings}
            className="bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 hover:scale-105 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"
          >
            {t.mainMenu.settings}
          </button>

          {isAuthenticated && onLogout && (
            <button
              onClick={onLogout}
              className="bg-slate-700 text-white font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-slate-600 hover:scale-105 transition-all duration-300 ease-in-out shadow-lg"
            >
              Logout
            </button>
          )}
          
          {editorEnabled && (
               <button
                onClick={onEditor}
                className="bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 hover:scale-105 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"
              >
                 Editor
              </button>
          )}

          <button
            onClick={() => setShowQuitConfirm(true)}
            className="bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-amber-400 hover:scale-105 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"
          >
            {t.mainMenu.quit}
          </button>
        </div>

        {/* Demo Info Box (Prioritized over Beta Info) */}
        {Demo ? (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black/90 border-2 border-blue-500/50 p-4 rounded-xl max-w-md text-center shadow-[0_0_40px_rgba(59,130,246,0.3)] backdrop-blur-md z-0">
                <h3 className="text-blue-400 font-bold font-cinzel text-lg mb-2 tracking-widest border-b border-blue-500/30 pb-2">DEMO VERSION</h3>
                
                <div className="space-y-2 text-gray-300 text-xs">
                    <p className="leading-relaxed">
                        Willkommen in der Welt von <span className="font-bold text-white">Movie Business</span>!
                        <br/>
                        In dieser Demo kannst du dein eigenes Studio vom <span className="text-blue-300 font-bold">01.01.1990</span> bis zum <span className="text-blue-300 font-bold">31.12.1990</span> aufbauen und den vollen Umfang der Simulation testen.
                    </p>

                    <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700 my-2 transform hover:scale-105 transition-transform duration-300">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Vollversion Release</p>
                        <p className="text-2xl font-black text-amber-500 font-cinzel tracking-wider drop-shadow-md">
                            25.02.2026
                        </p>
                        <p className="text-[10px] text-white font-bold uppercase mt-0.5 tracking-widest">
                            Auf Steam
                        </p>
                    </div>

                    <p className="text-[10px] italic text-gray-400">
                        Wir freuen uns riesig über jedes Feedback, um das Spiel noch besser zu machen! 
                        Nutze dafür gerne die Funktion im Menü.
                    </p>

                    <p className="text-sm font-bold text-white pt-1">
                        Viel Spaß beim Produzieren!
                    </p>
                </div>
            </div>
        ) : betaInfo && (
            /* Beta Info Box */
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 border border-amber-500/50 p-4 rounded-lg max-w-xl text-center shadow-2xl backdrop-blur-sm z-0">
                <h3 className="text-amber-400 font-bold font-cinzel text-lg mb-2">BETA VERSION</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                    {t.mainMenu.betaDisclaimer}
                </p>
            </div>
        )}

      </div>

      {/* Version Info - Hidden in Demo mode */}
      {!Demo && (
          <div className="absolute bottom-2 right-4 text-gray-400 text-sm font-mono pointer-events-none select-none">
            {t.mainMenu.version}
          </div>
      )}

      {showQuitConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.mainMenu.quitConfirmTitle}</h2>
                <p className="text-gray-300 text-lg mb-6">{t.mainMenu.quitConfirmText}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setShowQuitConfirm(false)}
                        className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all"
                    >
                        {t.common.cancel}
                    </button>
                    <button
                        onClick={handleQuit}
                        className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all"
                    >
                        {t.mainMenu.quitConfirmYes}
                    </button>
                </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default MainMenu;
