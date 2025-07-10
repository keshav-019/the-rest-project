// src/lib/TerminalService.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    interface Window {
        electronapp?: {
            requestPty: () => Promise<boolean>;
            sendToPty: (data: string) => Promise<void>;
            resizePty: (cols: number, rows: number) => Promise<void>;
            cleanupPty: () => Promise<void>;
            onPtyData: (callback: (data: string) => void) => void;
        };
        electronAPI?: {
            requestPty: () => Promise<boolean>;
            sendToPty: (data: string) => Promise<void>;
            resizePty: (cols: number, rows: number) => Promise<void>;
            cleanupPty: () => Promise<void>;
            onPtyData: (callback: (data: string) => void) => void;
            openFileDialog(): Promise<any>;
            executeCommand: (command: string) => Promise<string>;
            connectSSH: (server: any) => Promise<boolean>;
            executeSSHCommand: (server: any, command: string) => Promise<string>;
            removePtyListeners: () => any;
            changeTheme: (theme: any) => Promise<any>;
        };
    }
}

export class TerminalService {
    static isElectron(): boolean {
        // Check for either electron or electronAPI
        return typeof window !== 'undefined' && 
              (window.electron !== undefined || window.electronAPI !== undefined);
    }

    static async executeLocalCommand(command: string): Promise<string> {
        if (!this.isElectron()) {
            return Promise.resolve('$ ' + command + '\n' + 'This would execute in a real terminal');
        }
        
        if (window.electronAPI) {
            return window.electronAPI.executeCommand(command);
        }
        throw new Error('Electron API not available');
    }

    static async executeSSHCommand(server: any, command: string): Promise<string> {
        if (!this.isElectron()) {
            return Promise.resolve(`${server.username}@${server.host}:~$ ${command}\nSSH output would appear here`);
        }
        
        if (window.electronAPI) {
            return window.electronAPI.executeSSHCommand(server, command);
        }
        throw new Error('Electron API not available');
    }

    static async connectToSSH(server: any): Promise<boolean> {
        if (!this.isElectron()) {
            return Promise.resolve(true);
        }
        
        if (window.electronAPI) {
            return window.electronAPI.connectSSH(server);
        }
        throw new Error('Electron API not available');
    }
}