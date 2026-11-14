const { contextBridge, ipcRenderer } = require('electron');

const authListeners = new Set();
const pendingAuthCallbacks = [];

ipcRenderer.on('auth:callback', (_event, url) => {
  for (const listener of authListeners) listener(url);
  if (authListeners.size === 0) pendingAuthCallbacks.push(url);
});

contextBridge.exposeInMainWorld('projectFlowDesktop', {
  isDesktop: true,
  openExternal: (url) => ipcRenderer.invoke('desktop:open-external', url),
  onAuthCallback: (listener) => {
    authListeners.add(listener);
    for (const url of pendingAuthCallbacks.splice(0)) listener(url);
    return () => authListeners.delete(listener);
  },
});
