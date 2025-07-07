export interface ElectronAPI {
    requestPty: () => Promise<boolean>;
    sendToPty: (data: string) => Promise<void>;
    resizePty: (cols: number, rows: number) => Promise<void>;
    onPtyData: (callback: (data: string) => void) => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}