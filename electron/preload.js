// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    requestPty: () => ipcRenderer.invoke('request-pty'),
    sendToPty: (data) => ipcRenderer.invoke('send-to-pty', data),
    resizePty: (cols, rows) => ipcRenderer.invoke('resize-pty', cols, rows),
    cleanupPty: () => ipcRenderer.invoke('cleanup-pty'),
    onPtyData: (callback) => ipcRenderer.on('pty-data', (event, data) => callback(data)),
    removePtyListeners: () => ipcRenderer.removeAllListeners('pty-data'),
    connectSSH: (connection) => ipcRenderer.invoke('connect-ssh', connection),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    changeTheme: (theme) => ipcRenderer.invoke('change-theme', theme),
});