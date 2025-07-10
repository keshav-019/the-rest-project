// types/Terminal.ts
export interface TerminalConnection {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    authMethod: 'password' | 'key';
    password?: string;
    keyPath?: string;
    passphrase?: string;
    createdAt: string;
}