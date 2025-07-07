// components/Terminal/TerminalComponent.tsx
'use client';
import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

const TerminalComponent = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminal = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const isInitialized = useRef(false);

    const cleanup = useCallback(() => {
        if (terminal.current) {
            terminal.current.dispose();
            terminal.current = null;
        }
        if (fitAddon.current) {
            fitAddon.current = null;
        }
        isInitialized.current = false;
    }, []);

    useEffect(() => {
        if (!terminalRef.current || isInitialized.current) return;

        // Initialize terminal
        terminal.current = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1a1a1a',
                foreground: '#ffffff',
                cursor: '#ffffff',
                selection: '#ffffff33',
            },
            cols: 80,
            rows: 24,
            convertEol: true,
        });

        // Initialize addons
        fitAddon.current = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        terminal.current.loadAddon(fitAddon.current);
        terminal.current.loadAddon(webLinksAddon);

        // Open terminal
        terminal.current.open(terminalRef.current);

        // Fit terminal to container
        fitAddon.current.fit();

        // Handle window resize
        const handleResize = () => {
            if (fitAddon.current && terminal.current) {
                fitAddon.current.fit();
                // Send resize to PTY
                if (window.electron) {
                    window.electron.resizePty(terminal.current.cols, terminal.current.rows);
                }
            }
        };

        window.addEventListener('resize', handleResize);

        // Setup PTY communication
        if (typeof window !== 'undefined' && window.electron) {
            // Clean up any existing PTY and request new one
            window.electron.cleanupPty().then(() => {
                window.electron.requestPty();
            });

            // Listen for data from PTY
            window.electron.onPtyData((data: string) => {
                if (terminal.current) {
                    terminal.current.write(data);
                }
            });

            // Send data to PTY when user types
            terminal.current.onData((data) => {
                if (window.electron) {
                    window.electron.sendToPty(data);
                }
            });

            // Handle terminal resize
            terminal.current.onResize(({ cols, rows }) => {
                if (window.electron) {
                    window.electron.resizePty(cols, rows);
                }
            });
        }

        isInitialized.current = true;

        return () => {
            window.removeEventListener('resize', handleResize);
            if (window.electron) {
                window.electron.cleanupPty();
            }
            cleanup();
        };
    }, [cleanup]);

    return (
        <div className="h-full w-full bg-black p-4">
            <div
                ref={terminalRef}
                className="h-full w-full rounded-lg border border-gray-700"
                style={{ minHeight: '400px' }}
            />
        </div>
    );
};

export default TerminalComponent;