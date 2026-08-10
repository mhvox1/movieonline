import { SaveFile } from '../types';

const SAVE_KEY = 'film_tycoon_saves';

const readLocalStorageSaves = (): SaveFile[] => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read local save data:', error);
    return [];
  }
};

const hasElectronSaveApi = () => typeof window !== 'undefined' && !!window.electronAPI;

export const loadSaveFiles = async (): Promise<SaveFile[]> => {
  const localSaves = readLocalStorageSaves();

  if (!hasElectronSaveApi()) {
    return localSaves;
  }

  try {
    const diskSaves = await window.electronAPI!.getSaves();
    if (Array.isArray(diskSaves) && diskSaves.length > 0) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(diskSaves));
      return diskSaves;
    }

    if (localSaves.length > 0) {
      await window.electronAPI!.setSaves(localSaves);
    }

    return localSaves;
  } catch (error) {
    console.error('Failed to read disk save data:', error);
    return localSaves;
  }
};

export const persistSaveFiles = async (saves: SaveFile[]): Promise<void> => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));

  if (!hasElectronSaveApi()) {
    return;
  }

  try {
    await window.electronAPI!.setSaves(saves);
  } catch (error) {
    console.error('Failed to write disk save data:', error);
  }
};
