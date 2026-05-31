import { NextResponse } from 'next/server';
import {
    buildDependencyGraph,
    getDatabaseStructure,
    parseConnectionPayload,
    toApiErrorResponse,
} from '@/lib/server/database-adapter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const connection = parseConnectionPayload(body);
        const schema = String(body?.schema ?? '').trim();
        const table = String(body?.table ?? '').trim();
        const database = String(body?.database ?? '').trim() || undefined;

        if (!schema) {
            return NextResponse.json(
                { error: 'Schema is required' },
                { status: 400 }
            );
        }

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
        const graph = buildDependencyGraph(structure, schema, table, database);
        return NextResponse.json(graph);
    } catch (error) {
        const apiError = toApiErrorResponse(error);
        return NextResponse.json(
            { error: apiError.message },
            { status: apiError.status }
        );
    }
}
