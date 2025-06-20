/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/test-connection.ts
import DatabaseService from '@/lib/database-service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const config = req.body;
    const dbService = DatabaseService.getInstance();

    try {
        const result = await dbService.testConnection(config);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}