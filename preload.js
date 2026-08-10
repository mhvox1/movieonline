const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSaves: () => ipcRenderer.invoke('saves:get'),
  setSaves: (saves) => ipcRenderer.invoke('saves:set', saves),
  getSaveDirectory: () => ipcRenderer.invoke('saves:getDirectory')
});
