import { NextResponse } from 'next/server';
import {
    createTable,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body?.connection ?? body);
        const database = String(body?.database ?? '').trim() || undefined;
        const schema = String(body?.schema ?? '').trim() || undefined;
        const tableDefinition = body?.tableDefinition;

        if (!tableDefinition?.name) {
            return NextResponse.json(
                { error: 'Table definition with a table name is required' },
                { status: 400 }
            );
        }

        await createTable(connection, database, schema, tableDefinition);
        return NextResponse.json({
            success: true,
            message: `Table ${tableDefinition.name} created successfully`,
        });
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { error: apiError.message },
            { status: apiError.status }
        );
    }
}
