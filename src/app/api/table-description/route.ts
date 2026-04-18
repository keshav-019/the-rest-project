import { NextResponse } from 'next/server';
import {
    executeDatabaseQuery,
    getDatabaseStructure,
    getTableDescription,
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

const getPostgresTableDescription = async (
    connection: ReturnType<typeof parseConnectionPayload>,
    database: string | undefined,
    schema: string,
    table: string
) => {
    const sql = `
        SELECT
            c.column_name,
            c.data_type,
            c.is_nullable,
            CASE WHEN pk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_primary_key,
            fk.foreign_table_name,
            fk.foreign_column_name
        FROM information_schema.columns c
        LEFT JOIN (
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
             AND tc.table_name = kcu.table_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = ${toSqlLiteral(schema)}
              AND tc.table_name = ${toSqlLiteral(table)}
        ) pk
          ON pk.column_name = c.column_name
        LEFT JOIN (
            SELECT
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
              AND tc.table_name = ${toSqlLiteral(table)}
        ) fk
          ON fk.column_name = c.column_name
        WHERE c.table_schema = ${toSqlLiteral(schema)}
          AND c.table_name = ${toSqlLiteral(table)}
        ORDER BY c.ordinal_position
    `;

    const result = await executeDatabaseQuery(
        {
            ...connection,
            database: database || connection.database,
        },
        sql,
        database || connection.database
    );

    const columns: ColumnDefinition[] = result.rows.map((row) => ({
        name: String(row.column_name ?? '').trim(),
        type: String(row.data_type ?? 'text').trim() || 'text',
        isPrimaryKey: isTrueLike(row.is_primary_key),
        isNullable: isTrueLike(row.is_nullable),
        foreignKey: row.foreign_table_name && row.foreign_column_name
            ? {
                table: String(row.foreign_table_name).trim(),
                column: String(row.foreign_column_name).trim(),
            }
            : undefined,
    })).filter((column) => column.name);

    const foreignKeys = columns
        .filter((column) => !!column.foreignKey)
        .map((column) => ({
            column: column.name,
            referencesTable: column.foreignKey!.table,
            referencesColumn: column.foreignKey!.column,
        }));

    const primaryKeyColumns = columns.filter((column) => column.isPrimaryKey).map((column) => column.name);
    const indexes = primaryKeyColumns.length > 0
        ? [{ name: `${table}_pk`, columns: primaryKeyColumns, unique: true }]
        : [];

    return {
        columns,
        foreignKeys,
        indexes,
    };
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body);
        const database = String(body?.database ?? '').trim() || undefined;
        const schema = String(body?.schema ?? '').trim() || undefined;
        const table = String(body?.table ?? '').trim();

        if (!table) {
            return NextResponse.json(
                { error: 'Table is required' },
                { status: 400 }
            );
        }

        const normalizedType = normalizeType(String(connection.type ?? ''));
        if (normalizedType === 'postgresql') {
            const postgresSchema = schema || 'public';
            const description = await getPostgresTableDescription(
                connection,
                database,
                postgresSchema,
                table
            );
            return NextResponse.json(description);
        }

        const structure = await getDatabaseStructure({
            ...connection,
            database: database || connection.database,
        });
        const description = getTableDescription(structure, table, schema, database);
        return NextResponse.json(description);
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { error: apiError.message },
            { status: apiError.status }
        );
    }
}
