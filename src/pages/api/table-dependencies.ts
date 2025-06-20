/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/table-dependencies.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, host, port, username, password, database, schema, table } = req.body;

    try {
        if (type !== 'postgresql') {
            throw new Error('Only PostgreSQL is supported for dependency graphs');
        }

        const pool = new Pool({
            host,
            port: parseInt(port),
            user: username,
            password,
            database,
            max: 5
        });

        try {
            const client = await pool.connect();

            try {
                // Get table columns and constraints
                const columnsResult = await client.query(`
                    SELECT 
                        c.column_name as name,
                        c.data_type as type,
                        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
                        c.is_nullable = 'YES' as is_nullable,
                        fk.referenced_table as foreign_key_table,
                        fk.referenced_column as foreign_key_column
                    FROM 
                        information_schema.columns c
                    LEFT JOIN (
                        SELECT 
                        kcu.column_name
                        FROM 
                        information_schema.key_column_usage kcu
                        JOIN 
                        information_schema.table_constraints tc 
                        ON kcu.constraint_name = tc.constraint_name
                        WHERE 
                        tc.constraint_type = 'PRIMARY KEY'
                        AND kcu.table_schema = $1
                        AND kcu.table_name = $2
                    ) pk ON c.column_name = pk.column_name
                    LEFT JOIN (
                        SELECT 
                        kcu.column_name,
                        kcu2.table_name as referenced_table,
                        kcu2.column_name as referenced_column
                        FROM 
                        information_schema.key_column_usage kcu
                        JOIN 
                        information_schema.table_constraints tc 
                        ON kcu.constraint_name = tc.constraint_name
                        JOIN 
                        information_schema.key_column_usage kcu2
                        ON tc.constraint_name = kcu2.constraint_name
                        AND kcu.ordinal_position = kcu2.ordinal_position
                        WHERE 
                        tc.constraint_type = 'FOREIGN KEY'
                        AND kcu.table_schema = $1
                        AND kcu.table_name = $2
                        AND kcu2.table_schema = $1
                        AND kcu2.table_name != $2
                    ) fk ON c.column_name = fk.column_name
                    WHERE 
                        c.table_schema = $1
                        AND c.table_name = $2
                    ORDER BY 
                        c.ordinal_position
                `, [schema, table]);

                // Create nodes and edges for the graph
                const nodes = [
                    {
                        id: `${schema}.${table}`,
                        label: `${schema}.${table}`,
                        position: { x: 250, y: 100 },
                        columns: columnsResult.rows.map(col => ({
                            name: col.name,
                            type: col.type,
                            isPrimaryKey: col.is_primary_key,
                            isNullable: col.is_nullable,
                            foreignKey: col.foreign_key_table ? {
                                table: col.foreign_key_table,
                                column: col.foreign_key_column
                            } : undefined
                        }))
                    }
                ];

                const edges = columnsResult.rows
                    .filter(col => col.foreign_key_table)
                    .map(col => ({
                        id: `${schema}.${table}.${col.name}-${schema}.${col.foreign_key_table}.${col.foreign_key_column}`,
                        source: `${schema}.${col.foreign_key_table}`,
                        target: `${schema}.${table}`,
                        label: `${col.foreign_key_table}.${col.foreign_key_column} → ${table}.${col.name}`
                    }));

                // Add referenced tables as nodes
                const referencedTables = [...new Set(
                    columnsResult.rows
                        .filter(col => col.foreign_key_table)
                        .map(col => col.foreign_key_table)
                )];

                await Promise.all(referencedTables.map(async refTable => {
                    const refColumns = await client.query(`
                        SELECT 
                        column_name as name,
                        data_type as type,
                        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
                        is_nullable = 'YES' as is_nullable
                        FROM 
                        information_schema.columns c
                        LEFT JOIN (
                        SELECT 
                            kcu.column_name
                        FROM 
                            information_schema.key_column_usage kcu
                        JOIN 
                            information_schema.table_constraints tc 
                            ON kcu.constraint_name = tc.constraint_name
                        WHERE 
                            tc.constraint_type = 'PRIMARY KEY'
                            AND kcu.table_schema = $1
                            AND kcu.table_name = $2
                        ) pk ON c.column_name = pk.column_name
                        WHERE 
                        c.table_schema = $1
                        AND c.table_name = $2
                        ORDER BY 
                        c.ordinal_position
                    `, [schema, refTable]);

                    nodes.push({
                        id: `${schema}.${refTable}`,
                        label: `${schema}.${refTable}`,
                        position: {
                            x: Math.random() * 500,
                            y: Math.random() * 500
                        },
                        columns: refColumns.rows.map(col => ({
                            name: col.name,
                            type: col.type,
                            isPrimaryKey: col.is_primary_key,
                            isNullable: col.is_nullable,
                            foreignKey: undefined
                        }))
                    });
                }));

                return res.status(200).json({ nodes, edges });
            } finally {
                client.release();
            }
        } finally {
            await pool.end();
        }
    } catch (error: any) {
        return res.status(500).json({
            error: error.message || 'Failed to get table dependencies'
        });
    }
}