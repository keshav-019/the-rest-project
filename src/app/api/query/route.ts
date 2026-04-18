import { NextResponse } from 'next/server';
import {
    executeDatabaseQuery,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body);
        const query = String(body?.query ?? '').trim();

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        const result = await executeDatabaseQuery(connection, query, connection.database);

        return NextResponse.json({
            rows: result.rows,
            fields: result.fields,
            rowCount: result.rowCount,
            executionTime: result.executionTime,
            dbResult: {
                rows: result.rows,
                fields: result.fields,
                rowCount: result.rowCount,
            },
        });
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { error: apiError.message },
            { status: apiError.status }
        );
    }
}
