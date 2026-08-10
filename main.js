
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const SAVE_DIR_NAME = 'Movie Business';
const SAVE_FILE_NAME = 'savegames.json';

const getSaveDirectory = () => path.join(app.getPath('documents'), SAVE_DIR_NAME);
const getSaveFilePath = () => path.join(getSaveDirectory(), SAVE_FILE_NAME);

const readSaveFile = async () => {
  try {
    const content = await fs.readFile(getSaveFilePath(), 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeSaveFile = async (saves) => {
  await fs.mkdir(getSaveDirectory(), { recursive: true });
  await fs.writeFile(getSaveFilePath(), JSON.stringify(saves, null, 2), 'utf-8');
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  dialog.showErrorBox('Movie Business', 'Die Anwendung läuft bereits.');
  app.quit();
} else {
  let win;

  ipcMain.handle('saves:get', async () => {
    return readSaveFile();
  });

  ipcMain.handle('saves:set', async (_event, saves) => {
    if (!Array.isArray(saves)) {
      throw new Error('Invalid save payload');
    }
    await writeSaveFile(saves);
    return true;
  });

  ipcMain.handle('saves:getDirectory', () => {
    return getSaveDirectory();
  });

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  function createWindow() {
    // Wir setzen das Fenster auf Standard-Fullscreen.
    // Die Skalierungslogik (Zoom) wird nun vollständig in der React-App (App.tsx)
    // gehandhabt, indem wir eine virtuelle Auflösung von 2560x1440 erzwingen.
    
    win = new BrowserWindow({
      width: 1920,
      height: 1080,
      fullscreen: true,
      autoHideMenuBar: true,
      backgroundColor: '#111827',
      icon: path.join(__dirname, 'build/icon.ico'),
      show: false, // Warten bis bereit
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        // Standard-Zoom beibehalten, die App skaliert sich selbst visuell kleiner.
        zoomFactor: 1.0 
      }
    });

    win.setMenu(null);

    win.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && !input.isAutoRepeat && input.key === 'F11') {
        event.preventDefault();
        win.setFullScreen(!win.isFullScreen());
      }
    });

    win.loadFile(path.join(__dirname, 'dist/index.html'));

    // Sobald geladen, zeigen und fokussieren
    win.once('ready-to-show', () => {
      win.show();
      win.focus();
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
