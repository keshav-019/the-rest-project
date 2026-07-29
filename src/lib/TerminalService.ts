// src/lib/TerminalService.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

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
        
        if (window.electronAPI?.executeCommand) {
            return window.electronAPI.executeCommand(command);
        }
        return Promise.resolve('$ ' + command + '\n' + 'Direct command execution is not exposed by this Electron preload.');
    }

    static async executeSSHCommand(server: any, command: string): Promise<string> {
        if (!this.isElectron()) {
            return Promise.resolve(`${server.username}@${server.host}:~$ ${command}\nSSH output would appear here`);
        }
        
        if (window.electronAPI?.executeSSHCommand) {
            return window.electronAPI.executeSSHCommand(server, command);
        }
        return Promise.resolve(`${server.username}@${server.host}:~$ ${command}\nSSH command execution is not exposed by this Electron preload.`);
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
