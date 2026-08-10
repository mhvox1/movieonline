import type { SaveFile } from './types';

declare global {
  interface Window {
    electronAPI?: {
      getSaves: () => Promise<SaveFile[]>;
      setSaves: (saves: SaveFile[]) => Promise<boolean>;
      getSaveDirectory: () => Promise<string>;
    };
  }
}

export {};
