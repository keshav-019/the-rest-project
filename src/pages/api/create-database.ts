/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/create-database.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { connection, databaseName } = req.body;

    try {
        switch (connection.type) {
            case 'postgresql':
                await createPostgresDatabase(connection, databaseName);
                break;
            case 'mysql':
                await createMySQLDatabase(connection, databaseName);
                break;
            default:
                throw new Error('Unsupported database type for creation');
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function createPostgresDatabase(config: any, dbName: string) {
    const pool = new Pool({
        host: config.host,
        port: parseInt(config.port || '5432'),
        user: config.username,
        password: config.password,
        database: 'postgres' // Connect to default DB to create new one
    });

    try {
        const client = await pool.connect();
        await client.query(`CREATE DATABASE ${dbName}`);
        client.release();
    } finally {
        await pool.end();
    }
}

async function createMySQLDatabase(config: any, dbName: string) {
    const connection = await mysql.createConnection({
        host: config.host,
        port: parseInt(config.port || '3306'),
        user: config.username,
        password: config.password
    });

    await connection.query(`CREATE DATABASE ${dbName}`);
    await connection.end();
}