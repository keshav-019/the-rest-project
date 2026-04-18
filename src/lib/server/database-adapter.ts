/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only';

import { ColumnDefinition, SchemaObject } from '@/types/Connection';

export type SupportedDatabaseType = 'postgresql' | 'mysql' | 'sqlserver' | 'oracle';

export interface DatabaseConnectionPayload {
    type: string;
    host: string;
    port?: string | number;
    username?: string;
    password?: string;
    database?: string;
}

interface NormalizedDatabaseConnection {
    type: SupportedDatabaseType;
    host: string;
    port: number;
    username?: string;
    password?: string;
    database?: string;
}

export interface QueryExecutionResult {
    rows: Record<string, any>[];
    fields: Array<{ name: string }>;
    rowCount: number;
    executionTime: number;
}

export interface DatabaseStructureResponse {
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
}

export interface DependencyGraphResponse {
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
}

const DEFAULT_PORTS: Record<SupportedDatabaseType, number> = {
    postgresql: 5432,
    mysql: 3306,
    sqlserver: 1433,
    oracle: 1521,
};

const MAX_DATABASES = 20;
const DEFAULT_CONNECT_TIMEOUT_MS = 10000;
const DEFAULT_QUERY_TIMEOUT_MS = 30000;
const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_$]*$/;
const SAFE_COLUMN_TYPE = /^[A-Za-z0-9_\s(),.\[\]-]+$/;
const SAFE_CONSTRAINT = /^[A-Za-z0-9_\s(),.\[\]-]+$/;
const LOCALHOST_ALIASES = new Set(['localhost', '127.0.0.1', '::1']);

type ColumnMap = Map<string, Map<string, ColumnDefinition>>;
type DynamicImport = (modulePath: string) => Promise<any>;

const dynamicImport = new Function(
    'modulePath',
    'return import(modulePath)'
) as DynamicImport;

const loadNodeModule = async <T = any>(modulePath: string): Promise<T> => {
    return dynamicImport(modulePath) as Promise<T>;
};

const toPositiveInteger = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const CONNECT_TIMEOUT_MS = toPositiveInteger(
    process.env.DB_CONNECT_TIMEOUT_MS,
    DEFAULT_CONNECT_TIMEOUT_MS
);
const QUERY_TIMEOUT_MS = toPositiveInteger(
    process.env.DB_QUERY_TIMEOUT_MS,
    DEFAULT_QUERY_TIMEOUT_MS
);

class DatabaseAdapterError extends Error {
    status: number;

    constructor(message: string, status = 500) {
        super(message);
        this.name = 'DatabaseAdapterError';
        this.status = status;
    }
}

const asString = (value: unknown): string => String(value ?? '').trim();

const withTimeout = async <T>(
    promise: Promise<T>,
    timeoutMs: number,
    message: string
): Promise<T> => {
    let timer: NodeJS.Timeout | undefined;
    try {
        return await Promise.race([
            promise,
            new Promise<T>((_, reject) => {
                timer = setTimeout(() => {
                    reject(new DatabaseAdapterError(message, 504));
                }, timeoutMs);
            }),
        ]);
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
};

const resolveHostForRuntime = (host: string): string => {
    const trimmedHost = host.trim();
    if (!trimmedHost) {
        return trimmedHost;
    }

    const runningInDocker = process.env.RUNNING_IN_DOCKER === 'true';
    if (!runningInDocker) {
        return trimmedHost;
    }

    const normalizedHost = trimmedHost.toLowerCase();
    if (LOCALHOST_ALIASES.has(normalizedHost)) {
        return process.env.DOCKER_HOST_ALIAS || 'host.docker.internal';
    }

    return trimmedHost;
};

const getRowValue = (row: Record<string, any>, key: string): any => {
    if (key in row) {
        return row[key];
    }

    const lowerKey = key.toLowerCase();
    const upperKey = key.toUpperCase();

    if (lowerKey in row) {
        return row[lowerKey];
    }

    if (upperKey in row) {
        return row[upperKey];
    }

    const matchingKey = Object.keys(row).find((existingKey) => existingKey.toLowerCase() === lowerKey);
    if (!matchingKey) {
        return undefined;
    }

    return row[matchingKey];
};

const isTrueLike = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }
    const normalized = asString(value).toLowerCase();
    return normalized === 'yes' || normalized === 'true' || normalized === '1' || normalized === 'y';
};

const toSqlLiteral = (value: string): string => `'${value.replace(/'/g, "''")}'`;

const quoteIdentifier = (type: SupportedDatabaseType, identifier: string): string => {
    if (type === 'mysql') {
        return `\`${identifier.replace(/`/g, '``')}\``;
    }

    if (type === 'sqlserver') {
        return `[${identifier.replace(/]/g, ']]')}]`;
    }

    return `"${identifier.replace(/"/g, '""')}"`;
};

const ensureSafeIdentifier = (value: string, label: string): string => {
    if (!SAFE_IDENTIFIER.test(value)) {
        throw new DatabaseAdapterError(`Invalid ${label}: ${value}`, 400);
    }
    return value;
};

const ensureSafeFragment = (value: string, label: string, regex: RegExp): string => {
    const trimmed = value.trim();
    if (!trimmed || !regex.test(trimmed)) {
        throw new DatabaseAdapterError(`Invalid ${label}: ${value}`, 400);
    }
    return trimmed;
};

const toPlainRow = (row: Record<string, any>): Record<string, any> => {
    const plain: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
        plain[key] = value;
    }
    return plain;
};

const normalizeDatabaseType = (type: string): SupportedDatabaseType => {
    const normalized = type.trim().toLowerCase();
    if (normalized === 'postgres' || normalized === 'postgresql') return 'postgresql';
    if (normalized === 'mysql') return 'mysql';
    if (normalized === 'sqlserver' || normalized === 'mssql') return 'sqlserver';
    if (normalized === 'oracle') return 'oracle';
    throw new DatabaseAdapterError(`Unsupported database type: ${type}`, 400);
};

const normalizeConnection = (
    payload: DatabaseConnectionPayload,
    databaseOverride?: string
): NormalizedDatabaseConnection => {
    const type = normalizeDatabaseType(payload.type);
    const host = resolveHostForRuntime(asString(payload.host));

    if (!host) {
        throw new DatabaseAdapterError('Database host is required', 400);
    }

    const rawPort = payload.port === undefined || payload.port === null
        ? ''
        : asString(payload.port);

    const parsedPort = rawPort ? Number(rawPort) : DEFAULT_PORTS[type];
    if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
        throw new DatabaseAdapterError(`Invalid port value: ${payload.port}`, 400);
    }

    const database = asString(databaseOverride) || asString(payload.database) || undefined;

    return {
        type,
        host,
        port: parsedPort,
        username: asString(payload.username) || undefined,
        password: payload.password ?? undefined,
        database,
    };
};

export const parseConnectionPayload = (raw: any): DatabaseConnectionPayload => {
    const source = raw?.connection && typeof raw.connection === 'object'
        ? raw.connection
        : raw;

    if (!source || typeof source !== 'object') {
        throw new DatabaseAdapterError('Connection details are required', 400);
    }

    return {
        type: asString(source.type),
        host: asString(source.host),
        port: source.port,
        username: source.username,
        password: source.password,
        database: source.database,
    };
};

const executePostgresQuery = async (
    connection: NormalizedDatabaseConnection,
    query: string
): Promise<QueryExecutionResult> => {
    const pgModule = await loadNodeModule<any>('pg');
    const { Client } = pgModule;

    const client = new Client({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database || 'postgres',
        connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
        query_timeout: QUERY_TIMEOUT_MS,
        statement_timeout: QUERY_TIMEOUT_MS,
    });

    const startedAt = Date.now();
    await withTimeout(
        client.connect(),
        CONNECT_TIMEOUT_MS,
        `Connection timed out while connecting to ${connection.host}:${connection.port}`
    );

    try {
        const result = await withTimeout<any>(
            client.query(query),
            QUERY_TIMEOUT_MS,
            `Query timed out after ${QUERY_TIMEOUT_MS}ms`
        );
        return {
            rows: result.rows.map((row: any) => toPlainRow(row)),
            fields: (result.fields || []).map((field: any) => ({ name: field.name })),
            rowCount: result.rowCount ?? result.rows.length,
            executionTime: Date.now() - startedAt,
        };
    } finally {
        await client.end().catch(() => undefined);
    }
};

const executeMysqlQuery = async (
    connection: NormalizedDatabaseConnection,
    query: string
): Promise<QueryExecutionResult> => {
    const mysqlModule = await loadNodeModule<any>('mysql2/promise');
    const mysql = (mysqlModule as any).default ?? mysqlModule;

    const mysqlConnection = await withTimeout<any>(
        mysql.createConnection({
            host: connection.host,
            port: connection.port,
            user: connection.username,
            password: connection.password,
            database: connection.database,
            connectTimeout: CONNECT_TIMEOUT_MS,
        }),
        CONNECT_TIMEOUT_MS,
        `Connection timed out while connecting to ${connection.host}:${connection.port}`
    );

    const startedAt = Date.now();

    try {
        const [rows, fields] = await withTimeout<[any, any]>(
            mysqlConnection.query({
                sql: query,
                timeout: QUERY_TIMEOUT_MS,
            }),
            QUERY_TIMEOUT_MS,
            `Query timed out after ${QUERY_TIMEOUT_MS}ms`
        );
        const normalizedRows = Array.isArray(rows)
            ? rows.map((row: any) => toPlainRow(row))
            : [];
        const rowCount = Array.isArray(rows)
            ? rows.length
            : Number((rows as any)?.affectedRows ?? 0);

        return {
            rows: normalizedRows,
            fields: Array.isArray(fields)
                ? fields.map((field: any) => ({ name: field.name }))
                : [],
            rowCount,
            executionTime: Date.now() - startedAt,
        };
    } finally {
        await mysqlConnection.end().catch(() => undefined);
    }
};

const executeSqlServerQuery = async (
    connection: NormalizedDatabaseConnection,
    query: string
): Promise<QueryExecutionResult> => {
    const mssqlModule = await loadNodeModule<any>('mssql');
    const sql = (mssqlModule as any).default ?? mssqlModule;

    const pool = await withTimeout<any>(
        new sql.ConnectionPool({
            server: connection.host,
            port: connection.port,
            user: connection.username,
            password: connection.password,
            database: connection.database || 'master',
            connectionTimeout: CONNECT_TIMEOUT_MS,
            requestTimeout: QUERY_TIMEOUT_MS,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true,
            },
        }).connect(),
        CONNECT_TIMEOUT_MS,
        `Connection timed out while connecting to ${connection.host}:${connection.port}`
    );

    const startedAt = Date.now();

    try {
        const result = await withTimeout<any>(
            pool.request().query(query),
            QUERY_TIMEOUT_MS,
            `Query timed out after ${QUERY_TIMEOUT_MS}ms`
        );
        const rows = Array.isArray(result.recordset)
            ? result.recordset.map((row: any) => toPlainRow(row))
            : [];
        const fields = rows.length > 0
            ? Object.keys(rows[0]).map((name) => ({ name }))
            : [];
        const rowsAffected = Array.isArray(result.rowsAffected)
            ? result.rowsAffected.reduce((total: number, value: number) => total + value, 0)
            : 0;

        return {
            rows,
            fields,
            rowCount: rows.length > 0 ? rows.length : rowsAffected,
            executionTime: Date.now() - startedAt,
        };
    } finally {
        await pool.close().catch(() => undefined);
    }
};

const buildOracleConnectString = (connection: NormalizedDatabaseConnection): string => {
    if (!connection.database) {
        return `${connection.host}:${connection.port}`;
    }
    return `${connection.host}:${connection.port}/${connection.database}`;
};

const executeOracleQuery = async (
    connection: NormalizedDatabaseConnection,
    query: string
): Promise<QueryExecutionResult> => {
    const oracleModule = await loadNodeModule<any>('oracledb');
    const oracledb = (oracleModule as any).default ?? oracleModule;

    const oracleConnection = await withTimeout<any>(
        oracledb.getConnection({
            user: connection.username,
            password: connection.password,
            connectString: buildOracleConnectString(connection),
        }),
        CONNECT_TIMEOUT_MS,
        `Connection timed out while connecting to ${connection.host}:${connection.port}`
    );

    const startedAt = Date.now();
    try {
        oracleConnection.callTimeout = QUERY_TIMEOUT_MS;
    } catch {
        // Ignore when driver/runtime does not support callTimeout.
    }

    try {
        const result = await withTimeout<any>(
            oracleConnection.execute(query, [], {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
            }),
            QUERY_TIMEOUT_MS,
            `Query timed out after ${QUERY_TIMEOUT_MS}ms`
        );

        const rows = Array.isArray(result.rows)
            ? result.rows.map((row: any) => toPlainRow(row))
            : [];

        return {
            rows,
            fields: Array.isArray(result.metaData)
                ? result.metaData.map((field: any) => ({ name: field.name }))
                : [],
            rowCount: typeof result.rowsAffected === 'number'
                ? result.rowsAffected
                : rows.length,
            executionTime: Date.now() - startedAt,
        };
    } finally {
        await oracleConnection.close().catch(() => undefined);
    }
};

export const executeDatabaseQuery = async (
    payload: DatabaseConnectionPayload,
    query: string,
    databaseOverride?: string
): Promise<QueryExecutionResult> => {
    const normalized = normalizeConnection(payload, databaseOverride);

    switch (normalized.type) {
        case 'postgresql':
            return executePostgresQuery(normalized, query);
        case 'mysql':
            return executeMysqlQuery(normalized, query);
        case 'sqlserver':
            return executeSqlServerQuery(normalized, query);
        case 'oracle':
            return executeOracleQuery(normalized, query);
        default:
            throw new DatabaseAdapterError(`Unsupported database type: ${normalized.type}`, 400);
    }
};

export const testDatabaseConnection = async (
    payload: DatabaseConnectionPayload
): Promise<{ success: boolean; message: string }> => {
    const normalized = normalizeConnection(payload);
    const testQuery = normalized.type === 'oracle' ? 'SELECT 1 AS ok FROM dual' : 'SELECT 1 AS ok';
    await executeDatabaseQuery(normalized, testQuery, normalized.database);

    return {
        success: true,
        message: `Successfully connected to ${normalized.host}:${normalized.port}`,
    };
};

const ensureColumnEntry = (columnMap: ColumnMap, tableKey: string, column: ColumnDefinition) => {
    if (!columnMap.has(tableKey)) {
        columnMap.set(tableKey, new Map<string, ColumnDefinition>());
    }
    columnMap.get(tableKey)!.set(column.name, column);
};

const getColumnsForTable = (columnMap: ColumnMap, tableKey: string): ColumnDefinition[] => {
    return Array.from(columnMap.get(tableKey)?.values() || []);
};

const makeSchemaBucket = (name: string) => ({
    name,
    tables: [] as SchemaObject[],
    views: [] as SchemaObject[],
    functions: [] as SchemaObject[],
    procedures: [] as SchemaObject[],
});

const ensureSchemaBucket = (
    schemaMap: Map<string, ReturnType<typeof makeSchemaBucket>>,
    schemaName: string
) => {
    if (!schemaMap.has(schemaName)) {
        schemaMap.set(schemaName, makeSchemaBucket(schemaName));
    }
    return schemaMap.get(schemaName)!;
};

const listPostgresDatabases = async (
    connection: DatabaseConnectionPayload
): Promise<string[]> => {
    if (connection.database) {
        return [connection.database];
    }

    const seedDatabase = 'postgres';
    try {
        const result = await executeDatabaseQuery(
            { ...connection, database: seedDatabase },
            `SELECT datname AS name
             FROM pg_database
             WHERE datistemplate = false
             ORDER BY datname
             LIMIT ${MAX_DATABASES}`,
            seedDatabase
        );
        const names = result.rows.map((row) => asString(getRowValue(row, 'name'))).filter(Boolean);
        return names.length > 0 ? names : [seedDatabase];
    } catch {
        return [seedDatabase];
    }
};

const getPostgresStructure = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databases: DatabaseStructureResponse['databases'] = [];
    const databaseNames = await listPostgresDatabases(connection);

    for (const databaseName of databaseNames) {
        const schemaMap = new Map<string, ReturnType<typeof makeSchemaBucket>>();
        const columnMap: ColumnMap = new Map();

        const schemasResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT schema_name
             FROM information_schema.schemata
             WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
             ORDER BY schema_name`,
            databaseName
        );

        for (const row of schemasResult.rows) {
            const schemaName = asString(getRowValue(row, 'schema_name'));
            if (schemaName) {
                ensureSchemaBucket(schemaMap, schemaName);
            }
        }

        const columnsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT
                table_schema,
                table_name,
                column_name,
                data_type,
                is_nullable
             FROM information_schema.columns
             WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
             ORDER BY table_schema, table_name, ordinal_position`,
            databaseName
        );

        for (const row of columnsResult.rows) {
            const schemaName = asString(getRowValue(row, 'table_schema'));
            const tableName = asString(getRowValue(row, 'table_name'));
            const columnName = asString(getRowValue(row, 'column_name'));
            const dataType = asString(getRowValue(row, 'data_type'));

            if (!schemaName || !tableName || !columnName) {
                continue;
            }

            const tableKey = `${schemaName}.${tableName}`;
            ensureColumnEntry(columnMap, tableKey, {
                name: columnName,
                type: dataType || 'text',
                isPrimaryKey: false,
                isNullable: isTrueLike(getRowValue(row, 'is_nullable')),
            });
        }

        const constraintsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT
                tc.table_schema,
                tc.table_name,
                kcu.column_name,
                tc.constraint_type,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
             FROM information_schema.table_constraints tc
             JOIN information_schema.key_column_usage kcu
               ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
              AND tc.table_name = kcu.table_name
             LEFT JOIN information_schema.constraint_column_usage ccu
               ON tc.constraint_name = ccu.constraint_name
              AND tc.table_schema = ccu.table_schema
             WHERE tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
               AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')`,
            databaseName
        );

        for (const row of constraintsResult.rows) {
            const schemaName = asString(getRowValue(row, 'table_schema'));
            const tableName = asString(getRowValue(row, 'table_name'));
            const columnName = asString(getRowValue(row, 'column_name'));
            const constraintType = asString(getRowValue(row, 'constraint_type'));
            const tableKey = `${schemaName}.${tableName}`;
            const column = columnMap.get(tableKey)?.get(columnName);

            if (!column) {
                continue;
            }

            if (constraintType === 'PRIMARY KEY') {
                column.isPrimaryKey = true;
            }

            if (constraintType === 'FOREIGN KEY') {
                const foreignTable = asString(getRowValue(row, 'foreign_table_name'));
                const foreignColumn = asString(getRowValue(row, 'foreign_column_name'));
                if (foreignTable && foreignColumn) {
                    column.foreignKey = {
                        table: foreignTable,
                        column: foreignColumn,
                    };
                }
            }
        }

        const tablesResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT table_schema, table_name
             FROM information_schema.tables
             WHERE table_type = 'BASE TABLE'
               AND table_schema NOT IN ('pg_catalog', 'information_schema')
             ORDER BY table_schema, table_name`,
            databaseName
        );

        for (const row of tablesResult.rows) {
            const schemaName = asString(getRowValue(row, 'table_schema'));
            const tableName = asString(getRowValue(row, 'table_name'));
            if (!schemaName || !tableName) {
                continue;
            }
            const schema = ensureSchemaBucket(schemaMap, schemaName);
            schema.tables.push({
                name: tableName,
                type: 'table',
                columns: getColumnsForTable(columnMap, `${schemaName}.${tableName}`),
            });
        }

        const viewsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT table_schema, table_name
             FROM information_schema.views
             WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
             ORDER BY table_schema, table_name`,
            databaseName
        );

        for (const row of viewsResult.rows) {
            const schemaName = asString(getRowValue(row, 'table_schema'));
            const viewName = asString(getRowValue(row, 'table_name'));
            if (!schemaName || !viewName) {
                continue;
            }
            const schema = ensureSchemaBucket(schemaMap, schemaName);
            schema.views.push({
                name: viewName,
                type: 'view',
                columns: getColumnsForTable(columnMap, `${schemaName}.${viewName}`),
            });
        }

        const routinesResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT routine_schema, routine_name, routine_type
             FROM information_schema.routines
             WHERE routine_schema NOT IN ('pg_catalog', 'information_schema')
             ORDER BY routine_schema, routine_name`,
            databaseName
        );

        for (const row of routinesResult.rows) {
            const schemaName = asString(getRowValue(row, 'routine_schema'));
            const routineName = asString(getRowValue(row, 'routine_name'));
            const routineType = asString(getRowValue(row, 'routine_type')).toUpperCase();
            if (!schemaName || !routineName) {
                continue;
            }

            const schema = ensureSchemaBucket(schemaMap, schemaName);
            const object: SchemaObject = {
                name: routineName,
                type: routineType === 'PROCEDURE' ? 'procedure' : 'function',
                columns: [],
            };

            if (routineType === 'PROCEDURE') {
                schema.procedures.push(object);
            } else {
                schema.functions.push(object);
            }
        }

        const schemas = Array.from(schemaMap.values()).map((schema) => ({
            ...schema,
            tables: schema.tables.sort((a, b) => a.name.localeCompare(b.name)),
            views: schema.views.sort((a, b) => a.name.localeCompare(b.name)),
            functions: schema.functions.sort((a, b) => a.name.localeCompare(b.name)),
            procedures: schema.procedures.sort((a, b) => a.name.localeCompare(b.name)),
        })).sort((a, b) => a.name.localeCompare(b.name));

        databases.push({
            name: databaseName,
            schemas,
        });
    }

    return { databases };
};

const listMysqlDatabases = async (
    connection: DatabaseConnectionPayload
): Promise<string[]> => {
    if (connection.database) {
        return [connection.database];
    }

    const result = await executeDatabaseQuery(connection, 'SHOW DATABASES');
    const names = result.rows.map((row) => {
        const firstValue = Object.values(row)[0];
        return asString(firstValue);
    }).filter(Boolean);

    return names.slice(0, MAX_DATABASES);
};

const getMysqlStructure = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databases: DatabaseStructureResponse['databases'] = [];
    const databaseNames = await listMysqlDatabases(connection);

    for (const databaseName of databaseNames) {
        const columnMap: ColumnMap = new Map();
        const schemaName = databaseName;
        const schemaBucket = makeSchemaBucket(schemaName);

        const columnsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ${toSqlLiteral(databaseName)}
             ORDER BY TABLE_NAME, ORDINAL_POSITION`,
            databaseName
        );

        for (const row of columnsResult.rows) {
            const tableName = asString(getRowValue(row, 'TABLE_NAME'));
            const columnName = asString(getRowValue(row, 'COLUMN_NAME'));
            const dataType = asString(getRowValue(row, 'DATA_TYPE'));

            if (!tableName || !columnName) {
                continue;
            }

            ensureColumnEntry(columnMap, tableName, {
                name: columnName,
                type: dataType || 'text',
                isPrimaryKey: false,
                isNullable: isTrueLike(getRowValue(row, 'IS_NULLABLE')),
            });
        }

        const constraintsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT
                tc.TABLE_NAME,
                kcu.COLUMN_NAME,
                tc.CONSTRAINT_TYPE,
                kcu.REFERENCED_TABLE_NAME,
                kcu.REFERENCED_COLUMN_NAME
             FROM information_schema.TABLE_CONSTRAINTS tc
             JOIN information_schema.KEY_COLUMN_USAGE kcu
               ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
              AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
              AND tc.TABLE_NAME = kcu.TABLE_NAME
             WHERE tc.TABLE_SCHEMA = ${toSqlLiteral(databaseName)}
               AND tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'FOREIGN KEY')`,
            databaseName
        );

        for (const row of constraintsResult.rows) {
            const tableName = asString(getRowValue(row, 'TABLE_NAME'));
            const columnName = asString(getRowValue(row, 'COLUMN_NAME'));
            const constraintType = asString(getRowValue(row, 'CONSTRAINT_TYPE'));
            const column = columnMap.get(tableName)?.get(columnName);
            if (!column) {
                continue;
            }

            if (constraintType === 'PRIMARY KEY') {
                column.isPrimaryKey = true;
            }

            if (constraintType === 'FOREIGN KEY') {
                const foreignTable = asString(getRowValue(row, 'REFERENCED_TABLE_NAME'));
                const foreignColumn = asString(getRowValue(row, 'REFERENCED_COLUMN_NAME'));
                if (foreignTable && foreignColumn) {
                    column.foreignKey = {
                        table: foreignTable,
                        column: foreignColumn,
                    };
                }
            }
        }

        const tablesResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT TABLE_NAME
             FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = ${toSqlLiteral(databaseName)}
               AND TABLE_TYPE = 'BASE TABLE'
             ORDER BY TABLE_NAME`,
            databaseName
        );

        for (const row of tablesResult.rows) {
            const tableName = asString(getRowValue(row, 'TABLE_NAME'));
            if (!tableName) {
                continue;
            }
            schemaBucket.tables.push({
                name: tableName,
                type: 'table',
                columns: getColumnsForTable(columnMap, tableName),
            });
        }

        const viewsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT TABLE_NAME
             FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = ${toSqlLiteral(databaseName)}
               AND TABLE_TYPE = 'VIEW'
             ORDER BY TABLE_NAME`,
            databaseName
        );

        for (const row of viewsResult.rows) {
            const viewName = asString(getRowValue(row, 'TABLE_NAME'));
            if (!viewName) {
                continue;
            }
            schemaBucket.views.push({
                name: viewName,
                type: 'view',
                columns: getColumnsForTable(columnMap, viewName),
            });
        }

        const routinesResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT ROUTINE_NAME, ROUTINE_TYPE
             FROM information_schema.ROUTINES
             WHERE ROUTINE_SCHEMA = ${toSqlLiteral(databaseName)}
             ORDER BY ROUTINE_NAME`,
            databaseName
        );

        for (const row of routinesResult.rows) {
            const routineName = asString(getRowValue(row, 'ROUTINE_NAME'));
            const routineType = asString(getRowValue(row, 'ROUTINE_TYPE')).toUpperCase();
            if (!routineName) {
                continue;
            }

            const routineObject: SchemaObject = {
                name: routineName,
                type: routineType === 'PROCEDURE' ? 'procedure' : 'function',
                columns: [],
            };

            if (routineType === 'PROCEDURE') {
                schemaBucket.procedures.push(routineObject);
            } else {
                schemaBucket.functions.push(routineObject);
            }
        }

        databases.push({
            name: databaseName,
            schemas: [
                {
                    ...schemaBucket,
                    tables: schemaBucket.tables.sort((a, b) => a.name.localeCompare(b.name)),
                    views: schemaBucket.views.sort((a, b) => a.name.localeCompare(b.name)),
                    functions: schemaBucket.functions.sort((a, b) => a.name.localeCompare(b.name)),
                    procedures: schemaBucket.procedures.sort((a, b) => a.name.localeCompare(b.name)),
                },
            ],
        });
    }

    return { databases };
};

const listSqlServerDatabases = async (
    connection: DatabaseConnectionPayload
): Promise<string[]> => {
    if (connection.database) {
        return [connection.database];
    }

    try {
        const result = await executeDatabaseQuery(
            { ...connection, database: 'master' },
            `SELECT TOP (${MAX_DATABASES}) name
             FROM sys.databases
             WHERE state = 0
             ORDER BY name`,
            'master'
        );
        const names = result.rows.map((row) => asString(getRowValue(row, 'name'))).filter(Boolean);
        return names.length > 0 ? names : ['master'];
    } catch {
        return [connection.database || 'master'];
    }
};

const getSqlServerStructure = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databases: DatabaseStructureResponse['databases'] = [];
    const databaseNames = await listSqlServerDatabases(connection);

    for (const databaseName of databaseNames) {
        const schemaMap = new Map<string, ReturnType<typeof makeSchemaBucket>>();
        const columnMap: ColumnMap = new Map();

        const schemasResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT name AS schema_name
             FROM sys.schemas
             WHERE name NOT IN ('sys', 'INFORMATION_SCHEMA')
             ORDER BY name`,
            databaseName
        );

        for (const row of schemasResult.rows) {
            const schemaName = asString(getRowValue(row, 'schema_name'));
            if (schemaName) {
                ensureSchemaBucket(schemaMap, schemaName);
            }
        }

        const columnsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
             FROM INFORMATION_SCHEMA.COLUMNS
             ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION`,
            databaseName
        );

        for (const row of columnsResult.rows) {
            const schemaName = asString(getRowValue(row, 'TABLE_SCHEMA'));
            const tableName = asString(getRowValue(row, 'TABLE_NAME'));
            const columnName = asString(getRowValue(row, 'COLUMN_NAME'));
            const dataType = asString(getRowValue(row, 'DATA_TYPE'));

            if (!schemaName || !tableName || !columnName) {
                continue;
            }

            const tableKey = `${schemaName}.${tableName}`;
            ensureColumnEntry(columnMap, tableKey, {
                name: columnName,
                type: dataType || 'text',
                isPrimaryKey: false,
                isNullable: isTrueLike(getRowValue(row, 'IS_NULLABLE')),
            });
        }

        const primaryKeyResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT tc.TABLE_SCHEMA, tc.TABLE_NAME, kcu.COLUMN_NAME
             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
             JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
               ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
              AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
              AND tc.TABLE_NAME = kcu.TABLE_NAME
             WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'`,
            databaseName
        );

        for (const row of primaryKeyResult.rows) {
            const schemaName = asString(getRowValue(row, 'TABLE_SCHEMA'));
            const tableName = asString(getRowValue(row, 'TABLE_NAME'));
            const columnName = asString(getRowValue(row, 'COLUMN_NAME'));
            const tableKey = `${schemaName}.${tableName}`;
            const column = columnMap.get(tableKey)?.get(columnName);
            if (column) {
                column.isPrimaryKey = true;
            }
        }

        const foreignKeyResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT
                fk.TABLE_SCHEMA AS FK_TABLE_SCHEMA,
                fk.TABLE_NAME AS FK_TABLE_NAME,
                fk.COLUMN_NAME AS FK_COLUMN_NAME,
                pk.TABLE_NAME AS PK_TABLE_NAME,
                pk.COLUMN_NAME AS PK_COLUMN_NAME
             FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
             JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk
               ON rc.CONSTRAINT_NAME = fk.CONSTRAINT_NAME
             JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE pk
               ON rc.UNIQUE_CONSTRAINT_NAME = pk.CONSTRAINT_NAME
              AND fk.ORDINAL_POSITION = pk.ORDINAL_POSITION`,
            databaseName
        );

        for (const row of foreignKeyResult.rows) {
            const schemaName = asString(getRowValue(row, 'FK_TABLE_SCHEMA'));
            const tableName = asString(getRowValue(row, 'FK_TABLE_NAME'));
            const columnName = asString(getRowValue(row, 'FK_COLUMN_NAME'));
            const foreignTableName = asString(getRowValue(row, 'PK_TABLE_NAME'));
            const foreignColumnName = asString(getRowValue(row, 'PK_COLUMN_NAME'));

            const tableKey = `${schemaName}.${tableName}`;
            const column = columnMap.get(tableKey)?.get(columnName);
            if (column && foreignTableName && foreignColumnName) {
                column.foreignKey = {
                    table: foreignTableName,
                    column: foreignColumnName,
                };
            }
        }

        const tablesResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT TABLE_SCHEMA, TABLE_NAME
             FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_TYPE = 'BASE TABLE'
               AND TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
             ORDER BY TABLE_SCHEMA, TABLE_NAME`,
            databaseName
        );

        for (const row of tablesResult.rows) {
            const schemaName = asString(getRowValue(row, 'TABLE_SCHEMA'));
            const tableName = asString(getRowValue(row, 'TABLE_NAME'));
            if (!schemaName || !tableName) {
                continue;
            }
            const schema = ensureSchemaBucket(schemaMap, schemaName);
            schema.tables.push({
                name: tableName,
                type: 'table',
                columns: getColumnsForTable(columnMap, `${schemaName}.${tableName}`),
            });
        }

        const viewsResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT TABLE_SCHEMA, TABLE_NAME
             FROM INFORMATION_SCHEMA.VIEWS
             WHERE TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
             ORDER BY TABLE_SCHEMA, TABLE_NAME`,
            databaseName
        );

        for (const row of viewsResult.rows) {
            const schemaName = asString(getRowValue(row, 'TABLE_SCHEMA'));
            const viewName = asString(getRowValue(row, 'TABLE_NAME'));
            if (!schemaName || !viewName) {
                continue;
            }
            const schema = ensureSchemaBucket(schemaMap, schemaName);
            schema.views.push({
                name: viewName,
                type: 'view',
                columns: getColumnsForTable(columnMap, `${schemaName}.${viewName}`),
            });
        }

        const routinesResult = await executeDatabaseQuery(
            { ...connection, database: databaseName },
            `SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE
             FROM INFORMATION_SCHEMA.ROUTINES
             ORDER BY ROUTINE_SCHEMA, ROUTINE_NAME`,
            databaseName
        );

        for (const row of routinesResult.rows) {
            const schemaName = asString(getRowValue(row, 'ROUTINE_SCHEMA'));
            const routineName = asString(getRowValue(row, 'ROUTINE_NAME'));
            const routineType = asString(getRowValue(row, 'ROUTINE_TYPE')).toUpperCase();
            if (!schemaName || !routineName) {
                continue;
            }

            const schema = ensureSchemaBucket(schemaMap, schemaName);
            const routineObject: SchemaObject = {
                name: routineName,
                type: routineType === 'PROCEDURE' ? 'procedure' : 'function',
                columns: [],
            };

            if (routineType === 'PROCEDURE') {
                schema.procedures.push(routineObject);
            } else {
                schema.functions.push(routineObject);
            }
        }

        const schemas = Array.from(schemaMap.values()).map((schema) => ({
            ...schema,
            tables: schema.tables.sort((a, b) => a.name.localeCompare(b.name)),
            views: schema.views.sort((a, b) => a.name.localeCompare(b.name)),
            functions: schema.functions.sort((a, b) => a.name.localeCompare(b.name)),
            procedures: schema.procedures.sort((a, b) => a.name.localeCompare(b.name)),
        })).sort((a, b) => a.name.localeCompare(b.name));

        databases.push({
            name: databaseName,
            schemas,
        });
    }

    return { databases };
};

const getOracleStructure = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databaseName = connection.database || connection.username || 'oracle';
    const schemaMap = new Map<string, ReturnType<typeof makeSchemaBucket>>();
    const columnMap: ColumnMap = new Map();

    const schemaResult = await executeDatabaseQuery(
        { ...connection, database: connection.database || undefined },
        'SELECT USER AS SCHEMA_NAME FROM dual'
    );
    const schemaName = asString(getRowValue(schemaResult.rows[0] || {}, 'SCHEMA_NAME')) || 'DEFAULT';
    const schema = ensureSchemaBucket(schemaMap, schemaName);

    const columnsResult = await executeDatabaseQuery(
        { ...connection, database: connection.database || undefined },
        `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, NULLABLE
         FROM USER_TAB_COLUMNS
         ORDER BY TABLE_NAME, COLUMN_ID`
    );

    for (const row of columnsResult.rows) {
        const tableName = asString(getRowValue(row, 'TABLE_NAME'));
        const columnName = asString(getRowValue(row, 'COLUMN_NAME'));
        const dataType = asString(getRowValue(row, 'DATA_TYPE'));
        if (!tableName || !columnName) {
            continue;
        }
        ensureColumnEntry(columnMap, tableName, {
            name: columnName,
            type: dataType || 'text',
            isPrimaryKey: false,
            isNullable: isTrueLike(getRowValue(row, 'NULLABLE')),
        });
    }

    const constraintsResult = await executeDatabaseQuery(
        { ...connection, database: connection.database || undefined },
        `SELECT
            acc.table_name,
            acc.column_name,
            ac.constraint_type,
            r_acc.table_name AS referenced_table_name,
            r_acc.column_name AS referenced_column_name
         FROM user_constraints ac
         JOIN user_cons_columns acc
           ON ac.constraint_name = acc.constraint_name
         LEFT JOIN user_constraints r_ac
           ON ac.r_constraint_name = r_ac.constraint_name
         LEFT JOIN user_cons_columns r_acc
           ON r_ac.constraint_name = r_acc.constraint_name
          AND acc.position = r_acc.position
         WHERE ac.constraint_type IN ('P', 'R')`
    );

    for (const row of constraintsResult.rows) {
        const tableName = asString(getRowValue(row, 'TABLE_NAME'));
        const columnName = asString(getRowValue(row, 'COLUMN_NAME'));
        const constraintType = asString(getRowValue(row, 'CONSTRAINT_TYPE'));
        const column = columnMap.get(tableName)?.get(columnName);

        if (!column) {
            continue;
        }

        if (constraintType === 'P') {
            column.isPrimaryKey = true;
        }

        if (constraintType === 'R') {
            const foreignTable = asString(getRowValue(row, 'REFERENCED_TABLE_NAME'));
            const foreignColumn = asString(getRowValue(row, 'REFERENCED_COLUMN_NAME'));
            if (foreignTable && foreignColumn) {
                column.foreignKey = {
                    table: foreignTable,
                    column: foreignColumn,
                };
            }
        }
    }

    const tablesResult = await executeDatabaseQuery(
        { ...connection, database: connection.database || undefined },
        'SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME'
    );
    for (const row of tablesResult.rows) {
        const tableName = asString(getRowValue(row, 'TABLE_NAME'));
        if (!tableName) {
            continue;
        }
        schema.tables.push({
            name: tableName,
            type: 'table',
            columns: getColumnsForTable(columnMap, tableName),
        });
    }

    const viewsResult = await executeDatabaseQuery(
        { ...connection, database: connection.database || undefined },
        'SELECT VIEW_NAME FROM USER_VIEWS ORDER BY VIEW_NAME'
    );
    for (const row of viewsResult.rows) {
        const viewName = asString(getRowValue(row, 'VIEW_NAME'));
        if (!viewName) {
            continue;
        }
        schema.views.push({
            name: viewName,
            type: 'view',
            columns: getColumnsForTable(columnMap, viewName),
        });
    }

    const routinesResult = await executeDatabaseQuery(
        { ...connection, database: connection.database || undefined },
        `SELECT OBJECT_NAME, OBJECT_TYPE
         FROM USER_PROCEDURES
         WHERE OBJECT_TYPE IN ('FUNCTION', 'PROCEDURE')
         ORDER BY OBJECT_NAME`
    );

    for (const row of routinesResult.rows) {
        const routineName = asString(getRowValue(row, 'OBJECT_NAME'));
        const routineType = asString(getRowValue(row, 'OBJECT_TYPE')).toUpperCase();
        if (!routineName) {
            continue;
        }
        const routineObject: SchemaObject = {
            name: routineName,
            type: routineType === 'PROCEDURE' ? 'procedure' : 'function',
            columns: [],
        };

        if (routineType === 'PROCEDURE') {
            schema.procedures.push(routineObject);
        } else {
            schema.functions.push(routineObject);
        }
    }

    return {
        databases: [
            {
                name: databaseName,
                schemas: [
                    {
                        ...schema,
                        tables: schema.tables.sort((a, b) => a.name.localeCompare(b.name)),
                        views: schema.views.sort((a, b) => a.name.localeCompare(b.name)),
                        functions: schema.functions.sort((a, b) => a.name.localeCompare(b.name)),
                        procedures: schema.procedures.sort((a, b) => a.name.localeCompare(b.name)),
                    },
                ],
            },
        ],
    };
};

const toSortedSchemas = (schemaMap: Map<string, ReturnType<typeof makeSchemaBucket>>) => {
    return Array.from(schemaMap.values()).map((schema) => ({
        ...schema,
        tables: schema.tables.sort((a, b) => a.name.localeCompare(b.name)),
        views: schema.views.sort((a, b) => a.name.localeCompare(b.name)),
        functions: schema.functions.sort((a, b) => a.name.localeCompare(b.name)),
        procedures: schema.procedures.sort((a, b) => a.name.localeCompare(b.name)),
    })).sort((a, b) => a.name.localeCompare(b.name));
};

const getPostgresStructureSummary = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databases: DatabaseStructureResponse['databases'] = [];
    const databaseNames = await listPostgresDatabases(connection);

    for (const databaseName of databaseNames) {
        const schemaMap = new Map<string, ReturnType<typeof makeSchemaBucket>>();

        try {
            const tablesResult = await executeDatabaseQuery(
                { ...connection, database: databaseName },
                `SELECT table_schema, table_name
                 FROM information_schema.tables
                 WHERE table_type = 'BASE TABLE'
                   AND table_schema NOT IN ('pg_catalog', 'information_schema')
                 ORDER BY table_schema, table_name`,
                databaseName
            );

            for (const row of tablesResult.rows) {
                const schemaName = asString(getRowValue(row, 'table_schema'));
                const tableName = asString(getRowValue(row, 'table_name'));
                if (!schemaName || !tableName) {
                    continue;
                }

                const schema = ensureSchemaBucket(schemaMap, schemaName);
                schema.tables.push({
                    name: tableName,
                    type: 'table',
                    columns: [],
                });
            }
        } catch {
            // Skip inaccessible databases but keep them listed.
        }

        databases.push({
            name: databaseName,
            schemas: toSortedSchemas(schemaMap),
        });
    }

    return { databases };
};

const getMysqlStructureSummary = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databases: DatabaseStructureResponse['databases'] = [];
    const databaseNames = await listMysqlDatabases(connection);

    for (const databaseName of databaseNames) {
        const schemaMap = new Map<string, ReturnType<typeof makeSchemaBucket>>();

        try {
            const tablesResult = await executeDatabaseQuery(
                { ...connection, database: databaseName },
                `SELECT TABLE_NAME
                 FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = ${toSqlLiteral(databaseName)}
                   AND TABLE_TYPE = 'BASE TABLE'
                 ORDER BY TABLE_NAME`,
                databaseName
            );

            const schema = ensureSchemaBucket(schemaMap, databaseName);
            for (const row of tablesResult.rows) {
                const tableName = asString(getRowValue(row, 'TABLE_NAME'));
                if (!tableName) {
                    continue;
                }

                schema.tables.push({
                    name: tableName,
                    type: 'table',
                    columns: [],
                });
            }
        } catch {
            // Skip inaccessible databases but keep them listed.
        }

        databases.push({
            name: databaseName,
            schemas: toSortedSchemas(schemaMap),
        });
    }

    return { databases };
};

const getSqlServerStructureSummary = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databases: DatabaseStructureResponse['databases'] = [];
    const databaseNames = await listSqlServerDatabases(connection);

    for (const databaseName of databaseNames) {
        const schemaMap = new Map<string, ReturnType<typeof makeSchemaBucket>>();

        try {
            const tablesResult = await executeDatabaseQuery(
                { ...connection, database: databaseName },
                `SELECT TABLE_SCHEMA, TABLE_NAME
                 FROM INFORMATION_SCHEMA.TABLES
                 WHERE TABLE_TYPE = 'BASE TABLE'
                   AND TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
                 ORDER BY TABLE_SCHEMA, TABLE_NAME`,
                databaseName
            );

            for (const row of tablesResult.rows) {
                const schemaName = asString(getRowValue(row, 'TABLE_SCHEMA'));
                const tableName = asString(getRowValue(row, 'TABLE_NAME'));
                if (!schemaName || !tableName) {
                    continue;
                }

                const schema = ensureSchemaBucket(schemaMap, schemaName);
                schema.tables.push({
                    name: tableName,
                    type: 'table',
                    columns: [],
                });
            }
        } catch {
            // Skip inaccessible databases but keep them listed.
        }

        databases.push({
            name: databaseName,
            schemas: toSortedSchemas(schemaMap),
        });
    }

    return { databases };
};

const getOracleStructureSummary = async (
    connection: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const databaseName = connection.database || connection.username || 'oracle';
    const schemaMap = new Map<string, ReturnType<typeof makeSchemaBucket>>();

    let schemaName = 'DEFAULT';
    try {
        const schemaResult = await executeDatabaseQuery(
            { ...connection, database: connection.database || undefined },
            'SELECT USER AS SCHEMA_NAME FROM dual'
        );
        schemaName = asString(getRowValue(schemaResult.rows[0] || {}, 'SCHEMA_NAME')) || 'DEFAULT';
    } catch {
        // keep DEFAULT schema fallback
    }

    const schema = ensureSchemaBucket(schemaMap, schemaName);
    try {
        const tablesResult = await executeDatabaseQuery(
            { ...connection, database: connection.database || undefined },
            'SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME'
        );

        for (const row of tablesResult.rows) {
            const tableName = asString(getRowValue(row, 'TABLE_NAME'));
            if (!tableName) {
                continue;
            }

            schema.tables.push({
                name: tableName,
                type: 'table',
                columns: [],
            });
        }
    } catch {
        // keep database visible even when table discovery fails
    }

    return {
        databases: [
            {
                name: databaseName,
                schemas: toSortedSchemas(schemaMap),
            },
        ],
    };
};

export const getDatabaseStructure = async (
    payload: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const normalized = normalizeConnection(payload);
    switch (normalized.type) {
        case 'postgresql':
            return getPostgresStructure(normalized);
        case 'mysql':
            return getMysqlStructure(normalized);
        case 'sqlserver':
            return getSqlServerStructure(normalized);
        case 'oracle':
            return getOracleStructure(normalized);
        default:
            throw new DatabaseAdapterError(`Unsupported database type: ${normalized.type}`, 400);
    }
};

export const getDatabaseStructureSummary = async (
    payload: DatabaseConnectionPayload
): Promise<DatabaseStructureResponse> => {
    const normalized = normalizeConnection(payload);
    switch (normalized.type) {
        case 'postgresql':
            return getPostgresStructureSummary(normalized);
        case 'mysql':
            return getMysqlStructureSummary(normalized);
        case 'sqlserver':
            return getSqlServerStructureSummary(normalized);
        case 'oracle':
            return getOracleStructureSummary(normalized);
        default:
            throw new DatabaseAdapterError(`Unsupported database type: ${normalized.type}`, 400);
    }
};

const findTargetSchema = (
    structure: DatabaseStructureResponse,
    databaseName?: string,
    schemaName?: string
) => {
    const database = databaseName
        ? structure.databases.find((entry) => entry.name === databaseName)
        : structure.databases[0];

    if (!database) {
        return undefined;
    }

    const schema = schemaName
        ? database.schemas.find((entry) => entry.name === schemaName)
        : database.schemas[0];

    return schema;
};

export const buildDependencyGraph = (
    structure: DatabaseStructureResponse,
    schemaName: string,
    tableName: string,
    databaseName?: string
): DependencyGraphResponse => {
    const schema = findTargetSchema(structure, databaseName, schemaName);
    if (!schema || schema.tables.length === 0) {
        return { nodes: [], edges: [] };
    }

    const tableMap = new Map(schema.tables.map((table) => [table.name, table]));
    const rootTable = tableName && tableMap.has(tableName)
        ? tableName
        : schema.tables[0].name;

    const queue: string[] = [rootTable];
    const includedTables = new Set<string>();

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (includedTables.has(current)) {
            continue;
        }

        includedTables.add(current);
        const currentTable = tableMap.get(current);
        if (!currentTable) {
            continue;
        }

        for (const column of currentTable.columns || []) {
            const targetTable = column.foreignKey?.table;
            if (targetTable && tableMap.has(targetTable) && !includedTables.has(targetTable)) {
                queue.push(targetTable);
            }
        }

        for (const table of schema.tables) {
            const referencesCurrent = (table.columns || []).some(
                (column) => column.foreignKey?.table === current
            );
            if (referencesCurrent && !includedTables.has(table.name)) {
                queue.push(table.name);
            }
        }
    }

    const orderedTableNames = [
        rootTable,
        ...Array.from(includedTables).filter((name) => name !== rootTable).sort((a, b) => a.localeCompare(b)),
    ];

    const nodes = orderedTableNames.map((name, index) => ({
        id: name,
        label: name,
        position: {
            x: (index % 3) * 320,
            y: Math.floor(index / 3) * 240,
        },
        columns: tableMap.get(name)?.columns || [],
    }));

    const edges = orderedTableNames.flatMap((name) => {
        const table = tableMap.get(name);
        if (!table) {
            return [];
        }

        return (table.columns || [])
            .filter((column) => column.foreignKey?.table && includedTables.has(column.foreignKey.table))
            .map((column) => ({
                id: `${name}-${column.name}-${column.foreignKey!.table}`,
                source: name,
                target: column.foreignKey!.table,
                label: `${column.name} -> ${column.foreignKey!.column}`,
            }));
    });

    return { nodes, edges };
};

export const getTableDescription = (
    structure: DatabaseStructureResponse,
    tableName: string,
    schemaName?: string,
    databaseName?: string
): {
    columns: ColumnDefinition[];
    foreignKeys: Array<{
        column: string;
        referencesTable: string;
        referencesColumn: string;
    }>;
    indexes: Array<{
        name: string;
        columns: string[];
        unique: boolean;
    }>;
} => {
    const schema = findTargetSchema(structure, databaseName, schemaName);
    if (!schema) {
        throw new DatabaseAdapterError('Schema not found', 404);
    }

    const table = schema.tables.find((entry) => entry.name === tableName)
        || schema.views.find((entry) => entry.name === tableName);

    if (!table) {
        throw new DatabaseAdapterError(`Table not found: ${tableName}`, 404);
    }

    const columns = table.columns || [];
    const foreignKeys = columns
        .filter((column) => !!column.foreignKey)
        .map((column) => ({
            column: column.name,
            referencesTable: column.foreignKey!.table,
            referencesColumn: column.foreignKey!.column,
        }));

    const primaryKeyColumns = columns.filter((column) => column.isPrimaryKey).map((column) => column.name);
    const indexes = primaryKeyColumns.length > 0
        ? [{ name: `${table.name}_pk`, columns: primaryKeyColumns, unique: true }]
        : [];

    return {
        columns,
        foreignKeys,
        indexes,
    };
};

export const createDatabase = async (
    payload: DatabaseConnectionPayload,
    databaseName: string
): Promise<void> => {
    const normalized = normalizeConnection(payload);
    const safeDatabaseName = ensureSafeIdentifier(databaseName, 'database name');

    if (normalized.type === 'oracle') {
        throw new DatabaseAdapterError('Database creation is not supported for Oracle from this UI flow', 400);
    }

    const createStatement = `CREATE DATABASE ${quoteIdentifier(normalized.type, safeDatabaseName)}`;

    if (normalized.type === 'postgresql') {
        await executeDatabaseQuery(
            { ...normalized, database: normalized.database || 'postgres' },
            createStatement,
            normalized.database || 'postgres'
        );
        return;
    }

    if (normalized.type === 'sqlserver') {
        await executeDatabaseQuery(
            { ...normalized, database: 'master' },
            createStatement,
            'master'
        );
        return;
    }

    await executeDatabaseQuery(
        { ...normalized, database: undefined },
        createStatement
    );
};

const buildQualifiedTableName = (
    type: SupportedDatabaseType,
    tableName: string,
    schema?: string,
    database?: string
): string => {
    const safeTableName = ensureSafeIdentifier(tableName, 'table name');

    if (type === 'mysql') {
        if (database) {
            return `${quoteIdentifier(type, ensureSafeIdentifier(database, 'database name'))}.${quoteIdentifier(type, safeTableName)}`;
        }
        return quoteIdentifier(type, safeTableName);
    }

    if (type === 'sqlserver') {
        if (schema) {
            return `${quoteIdentifier(type, ensureSafeIdentifier(schema, 'schema name'))}.${quoteIdentifier(type, safeTableName)}`;
        }
        return `${quoteIdentifier(type, 'dbo')}.${quoteIdentifier(type, safeTableName)}`;
    }

    if (type === 'oracle') {
        if (schema) {
            return `${quoteIdentifier(type, ensureSafeIdentifier(schema, 'schema name'))}.${quoteIdentifier(type, safeTableName)}`;
        }
        return quoteIdentifier(type, safeTableName);
    }

    if (schema) {
        return `${quoteIdentifier(type, ensureSafeIdentifier(schema, 'schema name'))}.${quoteIdentifier(type, safeTableName)}`;
    }

    return quoteIdentifier(type, safeTableName);
};

export const createTable = async (
    payload: DatabaseConnectionPayload,
    database: string | undefined,
    schema: string | undefined,
    tableDefinition: {
        name: string;
        columns: Array<{
            name: string;
            type: string;
            constraints?: string[];
        }>;
    }
): Promise<void> => {
    const normalized = normalizeConnection(payload, database);
    if (!tableDefinition || !Array.isArray(tableDefinition.columns) || tableDefinition.columns.length === 0) {
        throw new DatabaseAdapterError('Table definition must include at least one column', 400);
    }

    const qualifiedTableName = buildQualifiedTableName(
        normalized.type,
        tableDefinition.name,
        schema,
        database
    );

    const columnSql = tableDefinition.columns.map((column) => {
        const safeName = ensureSafeIdentifier(column.name, 'column name');
        const safeType = ensureSafeFragment(column.type, 'column type', SAFE_COLUMN_TYPE);
        const constraintSql = (column.constraints || [])
            .map((constraint) => ensureSafeFragment(constraint, 'column constraint', SAFE_CONSTRAINT))
            .join(' ');

        if (constraintSql) {
            return `${quoteIdentifier(normalized.type, safeName)} ${safeType} ${constraintSql}`;
        }

        return `${quoteIdentifier(normalized.type, safeName)} ${safeType}`;
    });

    const statement = `CREATE TABLE ${qualifiedTableName} (${columnSql.join(', ')})`;
    await executeDatabaseQuery(
        { ...normalized, database: database || normalized.database },
        statement,
        database || normalized.database
    );
};

export const toApiErrorResponse = (error: unknown): { status: number; message: string } => {
    if (error instanceof DatabaseAdapterError) {
        return { status: error.status, message: error.message };
    }

    if (error instanceof Error) {
        return { status: 500, message: error.message };
    }

    return {
        status: 500,
        message: 'Unknown database operation error',
    };
};
