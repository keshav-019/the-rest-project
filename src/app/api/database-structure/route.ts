import { NextResponse } from 'next/server';
import {
    getDatabaseStructure,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body);
        const structure = await getDatabaseStructure(connection);
        return NextResponse.json(structure);
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { error: apiError.message },
            { status: apiError.status }
        );
    }
}
