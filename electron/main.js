// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const pty = require('node-pty');
const path = require('path');
const isDev = require('electron-is-dev');
const os = require('os');

let mainWindow;
let ptyProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        cleanupPty();
    });
}

function cleanupPty() {
    if (ptyProcess) {
        try {
            ptyProcess.kill();
        } catch (error) {
            console.error('Error killing PTY process:', error);
        }
        ptyProcess = null;
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    cleanupPty();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle PTY cleanup
ipcMain.handle('cleanup-pty', () => {
    cleanupPty();
    return true;
});

// Handle PTY requests
ipcMain.handle('request-pty', () => {
    // Clean up any existing PTY first
    cleanupPty();

    // Determine shell based on platform with fallbacks
    let shell;
    if (os.platform() === 'win32') {
        shell = 'powershell.exe';
    } else {
        // Try different shells in order of preference
        const shells = ['/bin/bash', '/usr/bin/bash', '/bin/sh', '/usr/bin/sh'];
        const fs = require('fs');
        shell = shells.find(s => {
            try {
                return fs.existsSync(s);
            } catch (e) {
                return false;
            }
        }) || 'bash'; // fallback to bash in PATH
    }

    console.log('Using shell:', shell);

    try {
        ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || process.cwd(),
            env: process.env
        });

        ptyProcess.onData((data) => {
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send('pty-data', data);
            }
        });

        ptyProcess.onExit((exitCode, signal) => {
            // Just clean up the process reference, no exit message
            ptyProcess = null;
        });

        return true;
    } catch (error) {
        console.error('Failed to spawn PTY:', error);
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('pty-data', `Error: Failed to start terminal: ${error.message}\r\n`);
        }
        return false;
    }
});

ipcMain.handle('send-to-pty', (event, data) => {
    if (ptyProcess) {
        try {
            ptyProcess.write(data);
        } catch (error) {
            console.error('Error writing to PTY:', error);
        }
    }
});

ipcMain.handle('resize-pty', (event, cols, rows) => {
    if (ptyProcess) {
        try {
            ptyProcess.resize(cols, rows);
        } catch (error) {
            console.error('Error resizing PTY:', error);
        }
    }
});