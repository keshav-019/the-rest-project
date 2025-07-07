// src/lib/TerminalService.ts
interface Window {
    electronAPI?: {
        executeCommand: (command: string) => Promise<string>;
        connectSSH: (server: any) => Promise<boolean>;
        executeSSHCommand: (server: any, command: string) => Promise<string>;
    };
}

export class TerminalService {
    static isElectron() {
        return typeof window !== 'undefined' && window.electronAPI !== undefined;
    }

    static async executeLocalCommand(command: string): Promise<string> {
        if (!this.isElectron()) {
            return Promise.resolve('$ ' + command + '\n' + 'This would execute in a real terminal');
        }
        return window.electronAPI!.executeCommand(command);
    }

    static async executeSSHCommand(server: any, command: string): Promise<string> {
        if (!this.isElectron()) {
            return Promise.resolve(`${server.username}@${server.host}:~$ ${command}\nSSH output would appear here`);
        }
        return window.electronAPI!.executeSSHCommand(server, command);
    }

    static async connectToSSH(server: any): Promise<boolean> {
        if (!this.isElectron()) {
            return Promise.resolve(true);
        }
        return window.electronAPI!.connectSSH(server);
    }
}