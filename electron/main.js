// electron/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const pty = require('node-pty');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { Client } = require('ssh2');

let mainWindow;
let ptyProcess = null;
let sshConnection = null;
let sshStream = null;

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
    if (sshStream) {
        try {
            sshStream.end();
        } catch (error) {
            console.error('Error closing SSH stream:', error);
        }
        sshStream = null;
    }
    if (sshConnection) {
        try {
            sshConnection.end();
        } catch (error) {
            console.error('Error closing SSH connection:', error);
        }
        sshConnection = null;
    }
    console.log('Cleanup complete.');
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
    // This handler seems unused in the main process logic provided, but leaving it.
    return true;
});

ipcMain.handle('request-pty', () => {
    cleanup();

    const shell = process.platform === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');

    try {
        ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || process.env.USERPROFILE || process.cwd(),
            env: { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor' }
        });

        ptyProcess.onData((data) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('pty-data', data);
            }
        });

        ptyProcess.onExit(() => {
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

ipcMain.handle('connect-ssh', async (event, connection) => {
    cleanup();
    console.log('Attempting SSH connection to:', connection.host);

    return new Promise((resolve) => {
        sshConnection = new Client();

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
                    'aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-gcm',
                    'aes128-gcm@openssh.com', 'aes256-gcm', 'aes256-gcm@openssh.com',
                    'aes256-cbc'
                ],
                hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1']
            }
        };

        if (connection.authMethod === 'password') {
            connectOptions.password = connection.password;
        } else {
            try {
                connectOptions.privateKey = fs.readFileSync(connection.keyPath);
                if (connection.passphrase) {
                    connectOptions.passphrase = connection.passphrase;
                }
            } catch (err) {
                mainWindow.webContents.send('pty-data', `\r\nKey file error: ${err.message}\r\n`);
                return resolve(false);
            }
        }

        sshConnection.on('ready', () => {
            console.log('SSH connection ready');
            sshConnection.shell({ term: 'xterm-256color' }, (err, stream) => {
                if (err) {
                    console.error('SSH shell error:', err);
                    mainWindow.webContents.send('pty-data', `\r\nSSH shell error: ${err.message}\r\n`);
                    cleanup();
                    return resolve(false);
                }

                sshStream = stream;
                console.log('SSH shell established');

                stream.on('data', (data) => {
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('pty-data', data.toString('utf8'));
                    }
                });

                stream.on('close', () => {
                    console.log('SSH stream closed');
                    mainWindow.webContents.send('pty-data', '\r\nConnection closed.\r\n');
                    cleanup();
                });

                resolve(true);
            });
        });

        sshConnection.on('error', (err) => {
            console.error('SSH connection error:', err);
            mainWindow.webContents.send('pty-data', `\r\nSSH Connection Error: ${err.message}\r\n`);
            cleanup();
            resolve(false);
        });

        sshConnection.on('timeout', () => {
            console.error('SSH connection timeout');
            mainWindow.webContents.send('pty-data', `\r\nSSH Connection Error: Timed out\r\n`);
            cleanup();
            resolve(false);
        });


        sshConnection.connect(connectOptions);
    });
});

ipcMain.handle('resize-pty', (event, cols, rows) => {
    if (ptyProcess) {
        ptyProcess.resize(cols, rows);
        return true;
    }
    if (sshStream) {
        sshStream.setWindow(rows, cols, 0, 0);
        return true;
    }
    return false;
});

ipcMain.handle('send-to-pty', (event, data) => {
    if (ptyProcess) {
        ptyProcess.write(data);
        return true;
    }
    if (sshStream) {
        sshStream.write(data);
        return true;
    }
    return false;
});

ipcMain.handle('open-file-dialog', async () => {
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