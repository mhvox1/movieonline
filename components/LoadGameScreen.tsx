
import React, { useState, useEffect } from 'react';
import { newGameBackgroundImage } from './backgrounds/NewGameBackgroundImage';
import { PlayerData, SaveFile } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { loadSaveFiles, persistSaveFiles } from '../hooks/saveStorage';

interface LoadGameScreenProps {
  onConfirmLoad: (playerData: PlayerData) => void;
  onBack: () => void;
}

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const LoadGameScreen: React.FC<LoadGameScreenProps> = ({ onConfirmLoad, onBack }) => {
  const { t, language } = useTranslation();
  const [saves, setSaves] = useState<SaveFile[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<SaveFile | null>(null);
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  useEffect(() => {
    let isMounted = true;

    const initializeSaves = async () => {
      try {
        const loadedSaves = await loadSaveFiles();
        const standardSlots = Array.from({ length: 5 }, (_, i) => ({ slotId: i + 1, timestamp: '', data: null }));

        const finalSaves: SaveFile[] = [];
        const autoSave = loadedSaves.find(s => s.slotId === 0);
        if (autoSave) finalSaves.push(autoSave);

        standardSlots.forEach(slot => {
          const loaded = loadedSaves.find(s => s.slotId === slot.slotId);
          finalSaves.push(loaded || slot);
        });

        if (isMounted) {
          setSaves(finalSaves);
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

  const handleLoad = (save: SaveFile) => {
    if (save.data) {
      onConfirmLoad(save.data);
    }
  };

  const handleDelete = async (slotId: number) => {
    const newSaves = saves.map(save => {
        if (save.slotId === slotId) {
             // If AutoSave is deleted, it just becomes empty/null but effectively disappears from list next reload if we filter, 
             // but here we just clear data to keep structure consistent
            return { ...save, timestamp: '', data: null };
        }
        return save;
    });

    // Clean up: If AutoSave is empty, remove it from storage entirely to avoid showing empty slot 0
    const storageSaves = newSaves.filter(s => s.slotId !== 0 || s.data !== null);

    try {
      await persistSaveFiles(storageSaves);
        setSaves(newSaves); // Update local state to show empty slot
    } catch (error) {
        console.error("Failed to delete save game:", error);
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div
      className="w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${newGameBackgroundImage})` }}
    >
      <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-0 p-8">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
          <h2 className="text-4xl font-bold text-center mb-8 font-cinzel text-amber-400">{t.mainMenu.loadGame}</h2>
          <div className="space-y-4">
            {saves.map((save) => {
              // Hide empty Auto-Save slot if it somehow exists in state but has no data
              if (save.slotId === 0 && !save.data) return null;

              const isAutoSave = save.slotId === 0;

              return (
              <div key={save.slotId} className="flex items-center gap-4">
                <button
                  onClick={() => handleLoad(save)}
                  disabled={!save.data}
                  className={`flex-grow bg-gray-900 border rounded-md p-4 text-left transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-600 disabled:hover:bg-gray-900 ${isAutoSave ? 'border-green-500/50 hover:border-green-400' : 'border-gray-600 hover:border-amber-500'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-lg ${isAutoSave ? 'text-green-400' : 'text-white'}`}>
                        {isAutoSave ? "AUTOMATISCH" : `${t.settings.saveSlot} ${save.slotId}`}
                    </span>
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
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(save)}
                    disabled={!save.data}
                    className="flex-shrink-0 bg-red-800 text-white p-3 rounded-md transition-colors hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                    aria-label={`Delete save slot ${save.slotId}`}
                >
                    <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            )})}
          </div>
          <div className="mt-8">
            <button
              onClick={onBack}
              className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-sm text-lg uppercase tracking-wider transform hover:bg-gray-500 transition-all duration-300 ease-in-out"
            >
              {t.common.back}
            </button>
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.settings.deleteTitle}</h2>
                <p className="text-gray-300 text-lg mb-6">
                    {t.settings.deleteText}
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all"
                    >
                        {t.common.cancel}
                    </button>
                    <button
                        onClick={() => handleDelete(showDeleteConfirm.slotId)}
                        className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all"
                    >
                        {t.settings.deleteYes}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LoadGameScreen;
