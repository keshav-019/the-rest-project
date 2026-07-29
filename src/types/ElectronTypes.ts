export interface ElectronAPI {
    requestPty: () => Promise<boolean>;
    sendToPty: (data: string) => Promise<void>;
    resizePty: (cols: number, rows: number) => Promise<void>;
    cleanupPty: () => Promise<void>;
    onPtyData: (callback: (data: string) => void) => void;
    removePtyListeners: () => void;
    connectSSH: (connection: unknown) => Promise<boolean>;
    openFileDialog: () => Promise<string | null>;
    changeTheme: (theme: string) => Promise<boolean>;
    executeCommand?: (command: string) => Promise<string>;
    executeSSHCommand?: (server: unknown, command: string) => Promise<string>;
    onSSHClose?: () => void;
}

declare global {
    interface Window {
        electron?: ElectronAPI;
        electronAPI?: ElectronAPI;
    }
}
