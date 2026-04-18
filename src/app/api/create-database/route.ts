import { NextResponse } from 'next/server';
import {
    createDatabase,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body?.connection ?? body);
        const databaseName = String(body?.databaseName ?? '').trim();

        if (!databaseName) {
            return NextResponse.json(
                { message: 'Database name is required' },
                { status: 400 }
            );
        }

        await createDatabase(connection, databaseName);
        return NextResponse.json({
            success: true,
            message: `Database ${databaseName} created successfully`,
        });
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { message: apiError.message },
            { status: apiError.status }
        );
    }
}
