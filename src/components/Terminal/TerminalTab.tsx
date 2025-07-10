// components/Terminal/TerminalTab.tsx
'use client'
import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface TerminalTabProps {
    type: 'local' | 'ssh';
    connection?: any;
    theme: any;
}

export default function TerminalTab({ type, connection, theme }: TerminalTabProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminal = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: theme,
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

        // Initialize terminal based on type
        if (type === 'local') {
            initializeLocalTerminal(term);
        } else if (type === 'ssh' && connection) {
            initializeSSHTerminal(term, connection);
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
    }, [type, connection, theme]);

    const initializeLocalTerminal = (term: Terminal) => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.removePtyListeners();

            window.electronAPI.requestPty().then((success) => {
                if (!success) {
                    term.writeln('\r\nFailed to initialize terminal session\r\n');
                } else {
                    setIsInitialized(true);
                }
            });

            window.electronAPI.onPtyData((data: string) => {
                term.write(data);
            });

            term.onData((data) => {
                window.electronAPI?.sendToPty(data);
            });

            term.onResize(({ cols, rows }) => {
                window.electronAPI?.resizePty(cols, rows);
            });
        } else {
            term.writeln('\r\nLocal terminal initialized (simulated)\r\n$ ');
            setIsInitialized(true);
        }
    };

    const initializeSSHTerminal = (term: Terminal, connection: any) => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.connectSSH(connection).then((success) => {
                if (!success) {
                    term.writeln(`\r\nFailed to connect to ${connection.host}\r\n`);
                } else {
                    setIsInitialized(true);
                    term.writeln(`\r\nConnected to ${connection.host}\r\n`);
                }
            });

            window.electronAPI.onPtyData((data: string) => {
                term.write(data);
            });

            term.onData((data) => {
                window.electronAPI?.sendToPty(data);
            });

            term.onResize(({ cols, rows }) => {
                window.electronAPI?.resizePty(cols, rows);
            });
        } else {
            term.writeln(`\r\nSSH connection to ${connection.host} (simulated)\r\n$ `);
            setIsInitialized(true);
        }
    };

    return (
        <div className="h-full w-full bg-black p-4">
            <div className="h-full w-full relative">
                {!isInitialized && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                        <div className="text-white">
                            {type === 'ssh' ? `Connecting to ${connection?.host}...` : 'Initializing terminal...'}
                        </div>
                    </div>
                )}
                <div
                    ref={terminalRef}
                    className="h-full w-full rounded-lg border border-gray-700 terminal-container"
                />
            </div>
        </div>
    );
}