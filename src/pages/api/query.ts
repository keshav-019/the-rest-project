/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/query.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, host, port, username, password, database, query } = req.body;

    try {
        let structure;

        switch (type) {
            case 'postgresql':
                structure = await getPostgresStructureForQuery(host, port, username, password, database, query);
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

async function getPostgresStructureForQuery(host: string, port: string, username: string, password: string, database: string, query: string) {
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
            const dbResult = await client.query(query);

            return { dbResult };
        } finally {
            client.release();
        }
    } finally {
        await pool.end();
    }
}