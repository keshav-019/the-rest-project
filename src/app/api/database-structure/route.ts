import { NextResponse } from 'next/server';
import {
    getDatabaseStructure,
    getDatabaseStructureSummary,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body);
        const includeTables = body?.includeTables === true;
        const structure = includeTables
            ? await getDatabaseStructure(connection)
            : await getDatabaseStructureSummary(connection, {
                includeTables: false,
            });
        return NextResponse.json(structure);
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { error: apiError.message },
            { status: apiError.status }
        );
    }
}
