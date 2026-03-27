// components/Terminal/TerminalTab.tsx
'use client'
import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit'; 
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { themes } from './terminalThemes';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

interface TerminalTabProps {
    type: 'local' | 'ssh';
    connection?: any;
    currentTheme: string;
    onChangeTheme: (theme: string) => void;
    themes: string[];
}

export default function TerminalTab({
    type,
    connection,
    currentTheme,
    onChangeTheme,
    themes: availableThemes
}: TerminalTabProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminal = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        console.log(`[TERMINAL] ${message}`);
        setLogs(prev => [...prev, message]);
    };

    // Main effect for initialization and connection, runs only once.
    useEffect(() => {
        if (!terminalRef.current || terminal.current) return;

        addLog(`Initializing ${type} terminal...`);
        const themeObj = themes[currentTheme as keyof typeof themes] || themes['Ubuntu'];

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: themeObj,
            convertEol: true,
            disableStdin: false,
            allowTransparency: false,
            windowsMode: process.platform === 'win32'
        });

        terminal.current = term;
        fitAddon.current = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        term.loadAddon(fitAddon.current);
        term.loadAddon(webLinksAddon);
        term.open(terminalRef.current);

        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                if (fitAddon.current) {
                    try {
                        fitAddon.current.fit();
                    } catch (e: any) {
                        addLog(`Resize error: ${e.message}`);
                    }
                }
            }, 10);
        });

        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current);
        }
        
        setupPtyListeners(term);

        if (type === 'local') {
            initializeLocalTerminal(term);
        } else if (type === 'ssh' && connection) {
            initializeSSHTerminal(term, connection);
        }

        return () => {
            addLog('Cleaning up terminal...');
            if (window.electronAPI) {
                window.electronAPI.removePtyListeners();
                window.electronAPI.cleanupPty();
            }
            resizeObserver.disconnect();
            term.dispose();
            terminal.current = null;
            setIsInitialized(false);
        };
    // The dependency array no longer includes `currentTheme` to prevent reconnection.
    }, [type, connection]);

    // New separate effect to handle theme changes without reconnecting.
    useEffect(() => {
        if (terminal.current) {
            const themeObj = themes[currentTheme as keyof typeof themes] || themes['Ubuntu'];
            terminal.current.options.theme = themeObj;
        }
    }, [currentTheme]);


    const setupPtyListeners = (term: Terminal) => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.removePtyListeners();

            window.electronAPI.onPtyData((data: string) => {
                term.write(data);
            });

            term.onData((data) => {
                window.electronAPI?.sendToPty(data);
            });

            term.onResize(({ cols, rows }) => {
                window.electronAPI?.resizePty(cols, rows);
            });
        }
    };

    const initializeLocalTerminal = (term: Terminal) => {
        addLog('Starting local terminal...');
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.requestPty()
                .then((success) => {
                    if (!success) {
                        addLog('Failed to initialize local terminal');
                        term.writeln('\r\nFailed to initialize terminal session\r\n');
                        return;
                    }
                    setIsInitialized(true);
                    addLog('Local terminal ready');
                })
                .catch((err) => {
                    addLog(`Local terminal error: ${err.message}`);
                    term.writeln(`\r\nError: ${err.message}\r\n`);
                });
        } else {
            term.writeln('\r\nLocal terminal initialized (simulated)\r\n$ ');
            setIsInitialized(true);
            addLog('Local terminal ready (simulated)');
        }
    };

    const initializeSSHTerminal = (term: Terminal, conn: any) => {
        addLog(`Connecting to ${conn.host}...`);
        term.writeln(`\r\nAttempting to connect to ${conn.username}@${conn.host}...\r\n`);

        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.connectSSH(conn)
                .then((success) => {
                    if (!success) {
                        addLog(`Failed to connect to ${conn.host}`);
                        // Error messages are now sent from main process via onPtyData
                    } else {
                        setIsInitialized(true);
                        addLog(`Connected to ${conn.host}`);
                    }
                })
                .catch((err) => {
                    addLog(`SSH connection error: ${err.message}`);
                    term.writeln(`\r\nSSH Error: ${err.message}\r\n`);
                });
        } else {
            term.writeln(`\r\nSSH connection to ${conn.host} (simulated)\r\n$ `);
            setIsInitialized(true);
            addLog(`Connected to ${conn.host} (simulated)`);
        }
    };

    return (
        <div className="h-full w-full bg-black p-2 flex flex-col">
            {/* Terminal container */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-hidden relative">
                    <div
                        ref={terminalRef}
                        className="h-full w-full terminal-container"
                    />
                </div>

                {/* Theme selector */}
                <div className="w-56 p-4 border-l border-gray-700 bg-gray-800 overflow-y-auto">
                    <h3 className="text-sm font-medium text-white mb-3">Terminal Theme</h3>
                    <div className="space-y-2">
                        {availableThemes.map(theme => {
                            const themeObj = themes[theme as keyof typeof themes] || themes['Ubuntu'];
                            return (
                                <div
                                    key={theme}
                                    className={`p-2 rounded cursor-pointer transition-colors ${currentTheme === theme ? 'bg-gray-700' : 'bg-gray-900 hover:bg-gray-700'}`}
                                    onClick={() => {
                                        addLog(`Changing theme to ${theme}`);
                                        onChangeTheme(theme);
                                    }}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2 border border-gray-500"
                                            style={{ backgroundColor: themeObj.cursor }}
                                        />
                                        <span className="text-white text-sm">{theme}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}