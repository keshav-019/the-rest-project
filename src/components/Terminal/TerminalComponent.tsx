'use client';
import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

const themes = {
    'Ubuntu': {
        background: '#300A24',
        foreground: '#FFFFFF',
        cursor: '#FFFFFF',
        selection: '#5D5D5D',
        black: '#2E3436',
        red: '#CC0000',
        green: '#4E9A06',
        yellow: '#C4A000',
        blue: '#3465A4',
        magenta: '#75507B',
        cyan: '#06989A',
        white: '#D3D7CF',
        brightBlack: '#555753',
        brightRed: '#EF2929',
        brightGreen: '#8AE234',
        brightYellow: '#FCE94F',
        brightBlue: '#729FCF',
        brightMagenta: '#AD7FA8',
        brightCyan: '#34E2E2',
        brightWhite: '#EEEEEC'
    },
    'Garuda': {
        background: '#24283B',
        foreground: '#C0CAF5',
        cursor: '#F7768E',
        selection: '#414868',
        black: '#1A1B26',
        red: '#F7768E',
        green: '#9ECE6A',
        yellow: '#E0AF68',
        blue: '#7AA2F7',
        magenta: '#BB9AF7',
        cyan: '#7DCFFF',
        white: '#A9B1D6',
        brightBlack: '#414868',
        brightRed: '#F7768E',
        brightGreen: '#9ECE6A',
        brightYellow: '#E0AF68',
        brightBlue: '#7AA2F7',
        brightMagenta: '#BB9AF7',
        brightCyan: '#7DCFFF',
        brightWhite: '#C0CAF5'
    },
    'Warp': {
        background: '#0C0C0D',
        foreground: '#F2F2F2',
        cursor: '#FFFFFF',
        selection: '#3D3D3D',
        black: '#0C0C0D',
        red: '#E74856',
        green: '#16C60C',
        yellow: '#F9F1A5',
        blue: '#3B78FF',
        magenta: '#B4009E',
        cyan: '#61D6D6',
        white: '#F2F2F2',
        brightBlack: '#767676',
        brightRed: '#E74856',
        brightGreen: '#16C60C',
        brightYellow: '#F9F1A5',
        brightBlue: '#3B78FF',
        brightMagenta: '#B4009E',
        brightCyan: '#61D6D6',
        brightWhite: '#F2F2F2'
    }
};

const TerminalComponent = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminal = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const [currentTheme, setCurrentTheme] = useState<string>('Ubuntu');
    const [isInitialized, setIsInitialized] = useState(false);

    const changeTheme = (themeName: string) => {
        if (terminal.current && themes[themeName as keyof typeof themes]) {
            terminal.current.options.theme = themes[themeName as keyof typeof themes];
            setCurrentTheme(themeName);
            
            // Notify electron main process about theme change
            if (window.electronAPI) {
                window.electronAPI.changeTheme(themeName);
            }
        }
    };

    useEffect(() => {
        if (!terminalRef.current || terminal.current) return;

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: themes[currentTheme as keyof typeof themes],
            convertEol: true,
            disableStdin: false,
            allowTransparency: false,
            windowsMode: process.platform === 'win32'
        });

        terminal.current = term;

        // Initialize addons
        fitAddon.current = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        term.loadAddon(fitAddon.current);
        term.loadAddon(webLinksAddon);
        term.open(terminalRef.current);

        // Fit terminal to container
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                if (fitAddon.current) {
                    try {
                        fitAddon.current.fit();
                        if (window.electronAPI && term) {
                            window.electronAPI.resizePty(term.cols, term.rows);
                        }
                    } catch (e) {
                        console.error('Resize error:', e);
                    }
                }
            }, 10);
        });

        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current);
        }

        // Setup PTY communication
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.removePtyListeners();

            window.electronAPI.requestPty().then((success) => {
                if (!success) {
                    term.writeln('\r\nFailed to initialize terminal session\r\n');
                } else {
                    setIsInitialized(true);
                }
            });

            // Data handler
            window.electronAPI.onPtyData((data: string) => {
                term.write(data);
            });

            // Input handler
            term.onData((data) => {
                window.electronAPI?.sendToPty(data);
            });

            // Handle terminal resize
            term.onResize(({ cols, rows }) => {
                window.electronAPI?.resizePty(cols, rows);
            });
        }

        return () => {
            if (window.electronAPI) {
                window.electronAPI.removePtyListeners();
                window.electronAPI.cleanupPty();
            }
            resizeObserver.disconnect();
            term.dispose();
            terminal.current = null;
            setIsInitialized(false);
        };
    }, []);

    return (
        <div className="h-full w-full bg-black p-4 flex">
            <div className="flex-1 overflow-hidden relative">
                {!isInitialized && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                        <div className="text-white">Initializing terminal...</div>
                    </div>
                )}
                <div
                    ref={terminalRef}
                    className="h-full w-full rounded-lg border border-gray-700 terminal-container"
                    style={{ minHeight: '400px' }}
                />
            </div>
            <div className="w-64 p-4 border-l border-gray-700">
                <h2 className="text-lg font-bold mb-4 text-white">Terminal Themes</h2>
                {Object.keys(themes).map((theme) => (
                    <div
                        key={theme}
                        className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                            currentTheme === theme ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                        onClick={() => changeTheme(theme)}
                    >
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-full mr-2 border border-gray-500"
                                style={{ backgroundColor: themes[theme as keyof typeof themes].cursor }}
                            />
                            <span className="text-white">{theme}</span>
                        </div>
                        <div className="flex flex-wrap mt-2">
                            {['red', 'green', 'blue', 'yellow', 'magenta', 'cyan'].map((color) => (
                                <div
                                    key={color}
                                    className="w-6 h-6 rounded-full m-1 border border-gray-600"
                                    style={{
                                        backgroundColor: themes[theme as keyof typeof themes][color as keyof typeof themes['Ubuntu']]
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TerminalComponent;