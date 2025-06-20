/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/database-structure.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, host, port, username, password, database } = req.body;

    try {
        let structure;

        switch (type) {
            case 'postgresql':
                structure = await getPostgresStructure(host, port, username, password, database);
                break;
            case 'mysql':
                structure = await getMySQLStructure(host, port, username, password, database);
                break;
            default:
                throw new Error('Unsupported database type');
        }

        return res.status(200).json(structure);
    } catch (error: any) {
        return res.status(500).json({
            error: error.message || 'Failed to get database structure'
        });
    }
}

async function getPostgresStructure(host: string, port: string, username: string, password: string, database?: string) {
    const pool = new Pool({
        host,
        port: parseInt(port),
        user: username,
        password,
        database: database || 'postgres',
        max: 5
    });

    try {
        const client = await pool.connect();

        try {
            // Get databases
            const dbResult = await client.query(`
                SELECT datname as name 
                FROM pg_database 
                WHERE datistemplate = false
                AND datname NOT IN ('postgres', 'template0', 'template1')
            `);

            const databases = await Promise.all(dbResult.rows.map(async (db: any) => {
                // Get schemas for each database
                const dbPool = new Pool({
                    host,
                    port: parseInt(port),
                    user: username,
                    password,
                    database: db.name,
                    max: 5
                });

                try {
                    const dbClient = await dbPool.connect();

                    try {
                        // Get schemas
                        const schemasResult = await dbClient.query(`
                            SELECT schema_name as name
                            FROM information_schema.schemata
                            WHERE schema_name NOT LIKE 'pg_%'
                            AND schema_name != 'information_schema'
                        `);

                        const schemas = await Promise.all(schemasResult.rows.map(async (schema: any) => {
                            // Get tables, views, functions, procedures for each schema
                            const tablesResult = await dbClient.query(`
                                SELECT table_name as name, 'table' as type
                                FROM information_schema.tables
                                WHERE table_schema = $1
                                AND table_type = 'BASE TABLE'
                            `, [schema.name]);

                            const viewsResult = await dbClient.query(`
                                SELECT table_name as name, 'view' as type
                                FROM information_schema.tables
                                WHERE table_schema = $1
                                AND table_type = 'VIEW'
                            `, [schema.name]);

                            const functionsResult = await dbClient.query(`
                                SELECT routine_name as name, 'function' as type
                                FROM information_schema.routines
                                WHERE routine_schema = $1
                                AND routine_type = 'FUNCTION'
                            `, [schema.name]);

                            const proceduresResult = await dbClient.query(`
                                SELECT routine_name as name, 'procedure' as type
                                FROM information_schema.routines
                                WHERE routine_schema = $1
                                AND routine_type = 'PROCEDURE'
                            `, [schema.name]);

                            return {
                                name: schema.name,
                                tables: tablesResult.rows,
                                views: viewsResult.rows,
                                functions: functionsResult.rows,
                                procedures: proceduresResult.rows
                            };
                        }));

                        return {
                            name: db.name,
                            schemas
                        };
                    } finally {
                        dbClient.release();
                    }
                } finally {
                    await dbPool.end();
                }
            }));

            return { databases };
        } finally {
            client.release();
        }
    } finally {
        await pool.end();
    }
}

async function getMySQLStructure(host: string, port: string, username: string, password: string, database?: string) {
    const connection = await mysql.createConnection({
        host,
        port: parseInt(port),
        user: username,
        password,
        database: database || 'mysql'
    });

    try {
        console.log("The Get My SQL Structure function is called");
        // Get databases
        const [dbResults] = await connection.query('SHOW DATABASES');

        const structure = {
            databases: await Promise.all(
                (dbResults as any[]).map(async (db: any) => {
                    const dbName = db.Database;
                    const dbConn = await mysql.createConnection({
                        host,
                        port: parseInt(port),
                        user: username,
                        password,
                        database: dbName
                    });

                    try {
                        const [tables] = await dbConn.query('SHOW TABLES');
                        return {
                            name: dbName,
                            tables: (tables as any[]).map(table => ({
                                name: table[`Tables_in_${dbName}`],
                                type: 'table'
                            }))
                        };
                    } finally {
                        await dbConn.end();
                    }
                })
            )
        };

        return structure;
    } finally {
        await connection.end();
    }
}