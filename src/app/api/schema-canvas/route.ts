import { NextResponse } from 'next/server';
import {
    executeDatabaseQuery,
    getDatabaseStructure,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';
import { ColumnDefinition } from '@/types/Connection';

export const runtime = 'nodejs';

const toSqlLiteral = (value: string): string => `'${value.replace(/'/g, "''")}'`;

const isTrueLike = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'y';
};

const normalizeType = (value: string): string => {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'postgres') {
        return 'postgresql';
    }
    if (normalized === 'mssql') {
        return 'sqlserver';
    }
    return normalized;
};

const getPostgresSchemaCanvasMetadata = async (
    connection: ReturnType<typeof parseConnectionPayload>,
    database: string | undefined,
    schema: string
) => {
    const sql = `
        SELECT
            c.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            CASE WHEN pk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_primary_key,
            fk.foreign_table_name,
            fk.foreign_column_name
        FROM information_schema.columns c
        JOIN information_schema.tables t
          ON t.table_schema = c.table_schema
         AND t.table_name = c.table_name
         AND t.table_type = 'BASE TABLE'
        LEFT JOIN (
            SELECT
                kcu.table_name,
                kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
             AND tc.table_name = kcu.table_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = ${toSqlLiteral(schema)}
        ) pk
          ON pk.table_name = c.table_name
         AND pk.column_name = c.column_name
        LEFT JOIN (
            SELECT
                kcu.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
             AND tc.table_name = kcu.table_name
            JOIN information_schema.constraint_column_usage ccu
              ON tc.constraint_name = ccu.constraint_name
             AND tc.table_schema = ccu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = ${toSqlLiteral(schema)}
        ) fk
          ON fk.table_name = c.table_name
         AND fk.column_name = c.column_name
        WHERE c.table_schema = ${toSqlLiteral(schema)}
        ORDER BY c.table_name, c.ordinal_position
    `;

    const result = await executeDatabaseQuery(
        {
            ...connection,
            database: database || connection.database,
        },
        sql,
        database || connection.database
    );

    const tableMap = new Map<string, ColumnDefinition[]>();
    for (const row of result.rows) {
        const tableName = String(row.table_name ?? '').trim();
        const columnName = String(row.column_name ?? '').trim();

        if (!tableName || !columnName) {
            continue;
        }

        if (!tableMap.has(tableName)) {
            tableMap.set(tableName, []);
        }

        tableMap.get(tableName)!.push({
            name: columnName,
            type: String(row.data_type ?? 'text').trim() || 'text',
            isPrimaryKey: isTrueLike(row.is_primary_key),
            isNullable: isTrueLike(row.is_nullable),
            foreignKey: row.foreign_table_name && row.foreign_column_name
                ? {
                    table: String(row.foreign_table_name).trim(),
                    column: String(row.foreign_column_name).trim(),
                }
                : undefined,
        });
    }

    return {
        tables: Array.from(tableMap.entries())
            .map(([name, columns]) => ({ name, columns }))
            .sort((a, b) => a.name.localeCompare(b.name)),
    };
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body);
        const database = String(body?.database ?? '').trim() || undefined;
        const schema = String(body?.schema ?? '').trim() || undefined;

        if (!schema) {
            return NextResponse.json(
                { error: 'Schema is required' },
                { status: 400 }
            );
        }

        const normalizedType = normalizeType(String(connection.type ?? ''));
        if (normalizedType === 'postgresql') {
            const metadata = await getPostgresSchemaCanvasMetadata(connection, database, schema);
            return NextResponse.json(metadata);
        }

        const structure = await getDatabaseStructure({
            ...connection,
            database: database || connection.database,
        });

        const selectedDatabase = database
            ? structure.databases.find((entry) => entry.name === database)
            : structure.databases[0];
        const selectedSchema = selectedDatabase?.schemas.find((entry) => entry.name === schema);

        return NextResponse.json({
            tables: (selectedSchema?.tables || []).map((table) => ({
                name: table.name,
                columns: table.columns || [],
            })),
        });
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { error: apiError.message },
            { status: apiError.status }
        );
    }
}
