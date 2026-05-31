/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ConnectionConfig {
    id: string;
    name: string;
    databaseType: "sql" | "nosql";
    type: string; // 'postgresql', 'mysql', 'mongodb', etc.
    host: string;
    port: string;
    username?: string;
    password?: string;
    database?: string;
    databases?: any[];
    connectionString?: string;
    status?: 'connected' | 'disconnected';
}

export interface DatabaseStructure {
    databases: {
        name: string;
        tables?: {
            name: string;
            type: string;
        }[];
        collections?: {
            name: string;
            type: string;
        }[];
    }[];
}


export interface SchemaObject {
    name: string;
    type: 'table' | 'view' | 'function' | 'procedure';
    columns?: ColumnDefinition[];
}

export interface ColumnDefinition {
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isNullable: boolean;
    foreignKey?: {
        table: string;
        column: string;
    };
}


export interface WindowTab {
    id: string;
    title: string;
    type: 'table' | 'view' | 'function' | 'procedure' | 'query' | 'collection' | 'schema';
    connection: string;
    database: string;
    schema?: string;
    schemaObjects?: SchemaObject[];
}


