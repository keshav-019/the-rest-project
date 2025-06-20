/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDefinition, ConnectionConfig, SchemaObject } from '@/types/Connection';

class DatabaseService {
    private static instance: DatabaseService;
    private connections: ConnectionConfig[] = [];

    private constructor() {
        this.loadConnections();
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    private loadConnections() {
        if (typeof window !== 'undefined') {
            const savedConnections = localStorage.getItem('database-connections');
            this.connections = savedConnections ? JSON.parse(savedConnections) : [];
        }
    }

    private saveConnections() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('database-connections', JSON.stringify(this.connections));
        }
    }

    async getConnections(): Promise<ConnectionConfig[]> {
        return [...this.connections];
    }

    async saveConnection(config: ConnectionConfig): Promise<ConnectionConfig> {
        const existingIndex = this.connections.findIndex(c => c.id === config.id);

        const newConnection = {
            ...config,
            id: config.id || `${Date.now()}`,
            status: 'disconnected'
        } as ConnectionConfig;

        if (existingIndex >= 0) {
            this.connections[existingIndex] = newConnection;
        } else {
            this.connections.push(newConnection);
        }

        this.saveConnections();
        return newConnection;
    }

    async testConnection(config: ConnectionConfig): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch('/api/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: config.type,
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    password: config.password,
                    database: config.database
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Connection failed');
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to test connection');
        }
    }

    async executeQuery(connectionId: string, query: string, database?: string): Promise<any> {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) throw new Error('Connection not found');

        const response = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: connection.type,
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: connection.password,
                database: database || connection.database, // Use specified db or connection's default
                query
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Query execution failed');
        }

        return await response.json();
    }

    async getDatabaseStructure(connectionId: string): Promise<{
        databases: Array<{
            name: string;
            schemas: Array<{
                name: string;
                tables: SchemaObject[];
                views: SchemaObject[];
                functions: SchemaObject[];
                procedures: SchemaObject[];
            }>;
        }>;
    }> {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) throw new Error('Connection not found');

        const response = await fetch('/api/database-structure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: connection.type,
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: connection.password,
                database: connection.database
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get structure');
        }

        return await response.json();
    }

    async getTableDependencies(
        connectionId: string,
        schema: string,
        table: string
    ): Promise<{
        nodes: Array<{
            id: string;
            label: string;
            position: { x: number; y: number };
            columns: ColumnDefinition[];
        }>;
        edges: Array<{
            id: string;
            source: string;
            target: string;
            label: string;
        }>;
    }> {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) throw new Error('Connection not found');

        const response = await fetch('/api/table-dependencies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: connection.type,
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: connection.password,
                database: connection.database,
                schema,
                table
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get dependencies');
        }

        return await response.json();
    }

    // Add to DatabaseService class
    async createDatabase(connectionId: string, databaseName: string): Promise<void> {
        try {
            const connection = this.connections.find(c => c.id === connectionId);
            if (!connection) {
                throw new Error('Connection not found');
            }

            const response = await fetch('/api/create-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    connection: connection,
                    databaseName
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create database');
            }

            return await response.json();
        } catch (error: any) {
            throw new Error(`Failed to create database: ${error.message}`);
        }
    }

    // Add to DatabaseService class
    async getTableDescription(
        connectionId: string,
        database: string,
        schema: string,
        table: string
    ): Promise<{
        columns: ColumnDefinition[];
        foreignKeys: any[];
        indexes: any[];
    }> {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) throw new Error('Connection not found');

        const response = await fetch('/api/table-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: connection.type,
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: connection.password,
                database,
                schema,
                table
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get table description');
        }

        return await response.json();
    }

    async createTable(
        connectionId: string,
        database: string,
        schema: string,
        tableDefinition: {
            name: string;
            columns: Array<{
                name: string;
                type: string;
                constraints?: string[];
            }>;
        }
    ): Promise<void> {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) throw new Error('Connection not found');

        const response = await fetch('/api/create-table', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                connection,
                database,
                schema,
                tableDefinition
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create table');
        }
    }
}

export default DatabaseService;