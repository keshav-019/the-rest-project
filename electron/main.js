// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const pty = require('node-pty');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { Client } = require('ssh2');

let mainWindow;
let ptyProcess;
let sshConnection;
let currentTheme = 'Ubuntu';

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
        cleanup();
    });
}

function cleanup() {
    if (ptyProcess) {
        try {
            ptyProcess.kill();
        } catch (error) {
            console.error('Error killing PTY process:', error);
        }
        ptyProcess = null;
    }
    if (sshConnection) {
        try {
            sshConnection.end();
        } catch (error) {
            console.error('Error closing SSH connection:', error);
        }
        sshConnection = null;
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    cleanup();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handlers
ipcMain.handle('cleanup-pty', () => {
    cleanup();
    return true;
});

ipcMain.handle('change-theme', (event, theme) => {
    currentTheme = theme;
    return true;
});

ipcMain.handle('request-pty', () => {
    cleanup();

    const shell = process.platform === 'win32'
        ? 'powershell.exe'
        : process.env.SHELL || '/bin/bash';

    try {
        ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || process.env.USERPROFILE || process.cwd(),
            env: {
                ...process.env,
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor'
            }
        });

        ptyProcess.on('data', (data) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('pty-data', data);
            }
        });

        ptyProcess.on('exit', () => {
            ptyProcess = null;
        });

        console.log('Local PTY process started successfully');
        return true;
    } catch (error) {
        console.error('Failed to spawn PTY:', error);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('pty-data', `\r\nError: Failed to start terminal: ${error.message}\r\n`);
        }
        return false;
    }
});

// electron/main.js (updated SSH handler)
ipcMain.handle('connect-ssh', async (event, connection) => {
    cleanup();
    console.log('Attempting SSH connection to:', connection.host);

    return new Promise((resolve) => {
        sshConnection = new Client();

        // Set timeout for connection
        const timeout = setTimeout(() => {
            console.log('SSH connection timeout');
            mainWindow.webContents.send('ssh-error', 'Timed out while waiting for handshake');
            cleanup();
            resolve(false);
        }, 20000); // 20 seconds timeout

        sshConnection.on('ready', () => {
            clearTimeout(timeout);
            console.log('SSH connection ready');

            ptyProcess = pty.spawn('bash', [], {
                name: 'xterm-256color',
                cols: 80,
                rows: 24,
                env: process.env
            });

            sshConnection.shell((err, stream) => {
                if (err) {
                    console.error('SSH shell error:', err);
                    mainWindow.webContents.send('ssh-error', err.message);
                    cleanup();
                    return resolve(false);
                }

                console.log('SSH shell established');

                // Data piping
                ptyProcess.on('data', (data) => stream.write(data));
                stream.on('data', (data) => ptyProcess.write(data));

                // Cleanup handlers
                stream.on('close', () => {
                    console.log('SSH stream closed');
                    mainWindow.webContents.send('ssh-close');
                    cleanup();
                });

                ptyProcess.on('exit', () => {
                    stream.end();
                    cleanup();
                });

                resolve(true);
            });
        });

        sshConnection.on('error', (err) => {
            clearTimeout(timeout);
            console.error('SSH connection error:', err);
            mainWindow.webContents.send('ssh-error', err.message);
            cleanup();
            resolve(false);
        });

        // Connection options
        const connectOptions = {
            host: connection.host,
            port: connection.port,
            username: connection.username,
            readyTimeout: 20000,
            algorithms: {
                kex: [
                    'ecdh-sha2-nistp256',
                    'ecdh-sha2-nistp384',
                    'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256',
                    'diffie-hellman-group14-sha1'
                ],
                cipher: [
                    'aes128-ctr',
                    'aes192-ctr',
                    'aes256-ctr',
                    'aes128-gcm',
                    'aes128-gcm@openssh.com',
                    'aes256-gcm',
                    'aes256-gcm@openssh.com',
                    'aes256-cbc'
                ],
                hmac: [
                    'hmac-sha2-256',
                    'hmac-sha2-512',
                    'hmac-sha1'
                ]
            }
        };

        // Authentication
        if (connection.authMethod === 'password') {
            connectOptions.password = connection.password;
        } else {
            try {
                connectOptions.privateKey = fs.readFileSync(connection.keyPath);
                if (connection.passphrase) {
                    connectOptions.passphrase = connection.passphrase;
                }
            } catch (err) {
                mainWindow.webContents.send('ssh-error', `Key file error: ${err.message}`);
                return resolve(false);
            }
        }

        sshConnection.connect(connectOptions);
    });
});

ipcMain.handle('resize-pty', (event, cols, rows) => {
    if (ptyProcess) {
        try {
            ptyProcess.resize(cols, rows);
            return true;
        } catch (error) {
            console.error('Error resizing PTY:', error);
            return false;
        }
    }
    return false;
});

ipcMain.handle('send-to-pty', (event, data) => {
    if (ptyProcess) {
        try {
            ptyProcess.write(data);
            return true;
        } catch (error) {
            console.error('Error writing to PTY:', error);
            return false;
        }
    }
    return false;
});

ipcMain.handle('open-file-dialog', async () => {
    const { dialog } = require('electron');
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'SSH Keys', extensions: ['pem', 'key', 'ppk'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        return result.filePaths[0] || null;
    } catch (error) {
        console.error('File dialog error:', error);
        return null;
    }
});