/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import oracledb from 'oracledb';
import { ConnectionConfig } from '@/types/Connection';

oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        switch (req.method) {
            case 'POST':
                return await handleTestConnection(req, res);
            default:
                res.setHeader('Allow', ['POST']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function handleTestConnection(req: NextApiRequest, res: NextApiResponse) {
    const config = req.body as ConnectionConfig;

    try {
        switch (config.type) {
            case 'postgresql':
                await testPostgresConnection(config);
                break;
            case 'mysql':
                await testMySQLConnection(config);
                break;
            case 'oracle':
                await testOracleConnection(config);
                break;
            case 'sqlserver':
                await testSQLServerConnection(config);
                break;
            default:
                throw new Error('Unsupported database type');
        }

        return res.status(200).json({
            success: true,
            message: `Successfully connected to ${config.name}`
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Connection failed'
        });
    }
}

async function testPostgresConnection(config: ConnectionConfig) {
    const pool = new Pool({
        host: config.host,
        port: parseInt(config.port || '5432'),
        user: config.username,
        password: config.password,
        database: config.database || 'postgres',
        connectionTimeoutMillis: 5000
    });

    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
    } finally {
        await pool.end();
    }
}

async function testMySQLConnection(config: ConnectionConfig) {
    const connection = await mysql.createConnection({
        host: config.host,
        port: parseInt(config.port || '3306'),
        user: config.username,
        password: config.password,
        database: config.database || 'mysql'
    });

    await connection.query('SELECT 1');
    await connection.end();
}

async function testOracleConnection(config: ConnectionConfig) {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: config.username,
            password: config.password,
            connectString: `${config.host}:${config.port || '1521'}/${config.database || 'ORCL'}`
        });
        await connection.execute('SELECT 1 FROM DUAL');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function testSQLServerConnection(config: ConnectionConfig) {
    // For SQL Server you would use mssql or tedious package
    // This is a placeholder implementation
    throw new Error('SQL Server connection not implemented in this example');
}