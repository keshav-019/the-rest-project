import { NextResponse } from 'next/server';
import {
    getDatabaseStructure,
    getTableDescription,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

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
