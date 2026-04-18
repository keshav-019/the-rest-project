/* eslint-disable @typescript-eslint/no-explicit-any */
import DatabaseService from '@/lib/database-service';
import { ConnectionConfig } from '@/types/Connection';

export const getConnections = async (): Promise<ConnectionConfig[]> => {
    const service = DatabaseService.getInstance();
    return service.getConnections();
};

export const saveConnection = async (config: ConnectionConfig): Promise<ConnectionConfig> => {
    const service = DatabaseService.getInstance();
    return service.saveConnection(config);
};

export const testConnection = async (
    config: ConnectionConfig
): Promise<{ success: boolean; message: string }> => {
    const service = DatabaseService.getInstance();
    return service.testConnection(config);
};

export const getDatabaseStructure = async (connectionId: string): Promise<any> => {
    const service = DatabaseService.getInstance();
    return service.getDatabaseStructure(connectionId);
};
