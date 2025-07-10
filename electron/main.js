const { app, BrowserWindow, ipcMain } = require('electron');
const pty = require('node-pty');
const path = require('path');
const isDev = require('electron-is-dev');
const os = require('os');

let mainWindow;
let ptyProcess;
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

function applyGarudaPrompt() {
    if (!ptyProcess) return;
    
    const shell = process.platform === 'win32'
        ? 'powershell.exe'
        : process.env.SHELL || '/bin/bash';

    // Apply Garuda-specific prompt styling
    setTimeout(() => {
        if (ptyProcess) {
            if (shell.includes('bash')) {
                // Bash multi-line prompt for Garuda theme
                ptyProcess.write('export PS1="\\[\\e[35m\\]\\u\\[\\e[0m\\]@\\[\\e[33m\\]\\h\\[\\e[0m\\] \\[\\e[36m\\]in\\[\\e[0m\\] \\[\\e[32m\\]\\w\\[\\e[0m\\]\\n\\[\\e[34m\\]❯\\[\\e[0m\\] "\r');
            } else if (shell.includes('zsh')) {
                // Zsh multi-line prompt for Garuda theme
                ptyProcess.write('export PS1="%F{magenta}%n%f@%F{yellow}%m%f %F{cyan}in%f %F{green}%~%f\\n%F{blue}❯%f "\r');
            } else if (shell.includes('fish')) {
                // Fish multi-line prompt for Garuda theme
                ptyProcess.write('function fish_prompt\\nset_color magenta; echo -n (whoami); set_color normal; echo -n "@"; set_color yellow; echo -n (hostname); set_color normal; echo -n " "; set_color cyan; echo -n "in"; set_color normal; echo -n " "; set_color green; echo (pwd)\\nset_color blue; echo -n "❯ "; set_color normal\\nend\r');
            }
        }
    }, 500);
}

function resetPrompt() {
    if (!ptyProcess) return;
    
    const shell = process.platform === 'win32'
        ? 'powershell.exe'
        : process.env.SHELL || '/bin/bash';

    // Reset to default prompt
    setTimeout(() => {
        if (ptyProcess) {
            if (shell.includes('bash')) {
                ptyProcess.write('unset PS1\r');
            } else if (shell.includes('zsh')) {
                ptyProcess.write('unset PS1\r');
            } else if (shell.includes('fish')) {
                ptyProcess.write('functions -e fish_prompt\r');
            }
        }
    }, 500);
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

// IPC Handlers
ipcMain.handle('cleanup-pty', () => {
    cleanupPty();
    return true;
});

ipcMain.handle('change-theme', (event, theme) => {
    const previousTheme = currentTheme;
    currentTheme = theme;
    
    // If switching from Garuda to another theme, reset prompt
    if (previousTheme === 'Garuda' && theme !== 'Garuda') {
        resetPrompt();
    }
    
    // If switching to Garuda, apply special prompt
    if (theme === 'Garuda') {
        applyGarudaPrompt();
    }
});

ipcMain.handle('request-pty', () => {
    cleanupPty();

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

        // Set up data handler
        ptyProcess.onData = ptyProcess.on('data', (data) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('pty-data', data);
            }
        });

        // Apply theme-specific prompt if needed
        if (currentTheme === 'Garuda') {
            applyGarudaPrompt();
        }

        ptyProcess.on('exit', () => {
            ptyProcess = null;
        });

        return true;
    } catch (error) {
        console.error('Failed to spawn PTY:', error);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('pty-data', `\r\nError: Failed to start terminal: ${error.message}\r\n`);
        }
        return false;
    }
});

// electron/main.js (additional handlers)
ipcMain.handle('connect-ssh', async (event, connection) => {
    cleanupPty();
    
    try {
        const { Client } = require('ssh2');
        const conn = new Client();
        
        ptyProcess = pty.spawn('bash', [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            env: process.env
        });
        
        conn.on('ready', () => {
            conn.shell((err, stream) => {
                if (err) {
                    event.sender.send('pty-data', `\r\nSSH Error: ${err.message}\r\n`);
                    return;
                }
                
                // Pipe between terminal and SSH stream
                ptyProcess.on('data', (data) => stream.write(data));
                stream.on('data', (data) => {
                    if (ptyProcess) {
                        ptyProcess.write(data);
                    } else {
                        event.sender.send('pty-data', data);
                    }
                });
                
                stream.on('close', () => {
                    if (ptyProcess) ptyProcess.kill();
                    conn.end();
                });
            });
        });
        
        conn.on('error', (err) => {
            event.sender.send('pty-data', `\r\nSSH Connection Error: ${err.message}\r\n`);
        });
        
        // Connect with appropriate auth method
        if (connection.authMethod === 'password') {
            conn.connect({
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: connection.password
            });
        } else {
            conn.connect({
                host: connection.host,
                port: connection.port,
                username: connection.username,
                privateKey: require('fs').readFileSync(connection.keyPath),
                passphrase: connection.passphrase || undefined
            });
        }
        
        return true;
    } catch (error) {
        console.error('SSH connection failed:', error);
        event.sender.send('pty-data', `\r\nSSH Error: ${error.message}\r\n`);
        return false;
    }
});

ipcMain.handle('open-file-dialog', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'SSH Keys', extensions: ['pem', 'key', 'ppk'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.filePaths[0] || null;
});

ipcMain.handle('send-to-pty', (event, data) => {
    if (ptyProcess) {
        ptyProcess.write(data);
    }
});

ipcMain.handle('resize-pty', (event, cols, rows) => {
    if (ptyProcess) {
        ptyProcess.resize(cols, rows);
    }
});