import { NextResponse } from 'next/server';
import {
    parseConnectionPayload,
    testDatabaseConnection,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body);
        const result = await testDatabaseConnection(connection);
        return NextResponse.json(result);
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { message: apiError.message },
            { status: apiError.status }
        );
    }
}
