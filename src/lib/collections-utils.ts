import {
    Collection,
    Folder,
    Header,
    Param,
    Request,
    RequestProtocol,
    RequestTestCase,
    RequestTestAssertion,
    RequestType,
} from '@/types/Collections';
import { generateRandomString } from '@/lib/utils/utils';

const HTTP_METHODS = new Set<string>(Object.values(RequestType));

export type DashboardTimeFilter =
    | 'today'
    | 'yesterday'
    | 'last7days'
    | 'lastMonth'
    | 'lastYear'
    | 'all';

export interface DateRange {
    start: Date;
    end: Date;
}

export interface CollectionRequestRef {
    collection: Collection;
    folder: Folder | null;
    request: Request;
}

export const SUPPORTED_PROTOCOLS: Array<{ value: RequestProtocol; label: string }> = [
    { value: 'http', label: 'HTTP' },
    { value: 'graphql', label: 'GraphQL' },
    { value: 'grpc', label: 'gRPC' },
    { value: 'mcp', label: 'MCP' },
    { value: 'websocket', label: 'WebSocket' },
    { value: 'socketio', label: 'Socket.IO' },
    { value: 'mqtt', label: 'MQTT' },
];

export const PROTOCOL_METHOD_OPTIONS: Record<RequestProtocol, RequestType[]> = {
    http: [
        RequestType.GET,
        RequestType.POST,
        RequestType.PUT,
        RequestType.PATCH,
        RequestType.DELETE,
        RequestType.HEAD,
        RequestType.OPTIONS,
    ],
    graphql: [RequestType.POST],
    grpc: [RequestType.POST],
    mcp: [RequestType.POST],
    websocket: [RequestType.GET],
    socketio: [RequestType.GET],
    mqtt: [RequestType.POST],
};

export const TEST_ASSERTIONS: Array<{ value: RequestTestAssertion; label: string }> = [
    { value: 'status_equals', label: 'Status Equals' },
    { value: 'body_contains', label: 'Body Contains' },
    { value: 'header_exists', label: 'Header Exists' },
    { value: 'max_response_time', label: 'Max Response Time (ms)' },
];

const createEntityId = (prefix: string): string => `${prefix}_${Date.now()}_${generateRandomString(8)}`;

const asRecord = (value: unknown): Record<string, unknown> | null => {
    if (typeof value === 'object' && value !== null) {
        return value as Record<string, unknown>;
    }
    return null;
};

const asString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return fallback;
};

const asArray = <T = unknown>(value: unknown): T[] => {
    if (Array.isArray(value)) {
        return value as T[];
    }
    return [];
};

const pickProtocol = (value: unknown): RequestProtocol => {
    if (typeof value !== 'string') {
        return 'http';
    }
    const normalized = value.trim().toLowerCase();
    if (
        normalized === 'http' ||
        normalized === 'graphql' ||
        normalized === 'grpc' ||
        normalized === 'mcp' ||
        normalized === 'websocket' ||
        normalized === 'socketio' ||
        normalized === 'mqtt'
    ) {
        return normalized;
    }
    if (normalized === 'socket.io') {
        return 'socketio';
    }
    return 'http';
};

const pickMethod = (method: unknown, protocol: RequestProtocol): RequestType => {
    const normalizedMethod = asString(method, '').toUpperCase();
    if (HTTP_METHODS.has(normalizedMethod)) {
        return normalizedMethod as RequestType;
    }
    return PROTOCOL_METHOD_OPTIONS[protocol][0];
};

const normalizeParam = (value: unknown): Param => {
    const record = asRecord(value);
    return {
        enabled: typeof record?.enabled === 'boolean' ? record.enabled : true,
        key: asString(record?.key),
        value: asString(record?.value),
    };
};

const normalizeHeader = (value: unknown): Header => {
    const record = asRecord(value);
    return {
        enabled: typeof record?.enabled === 'boolean' ? record.enabled : true,
        key: asString(record?.key),
        value: asString(record?.value),
    };
};

const normalizeTestCase = (value: unknown, index: number): RequestTestCase => {
    const record = asRecord(value);
    const assertion = (() => {
        const raw = asString(record?.assertion);
        if (
            raw === 'status_equals' ||
            raw === 'body_contains' ||
            raw === 'header_exists' ||
            raw === 'max_response_time'
        ) {
            return raw;
        }
        return 'status_equals';
    })();

    const lastResultRaw = asString(record?.lastResult);
    const lastResult =
        lastResultRaw === 'pass' || lastResultRaw === 'fail' || lastResultRaw === 'skipped'
            ? lastResultRaw
            : undefined;

    return {
        id: asString(record?.id, createEntityId('test')),
        name: asString(record?.name, `Test ${index + 1}`),
        assertion,
        expected: asString(record?.expected),
        enabled: typeof record?.enabled === 'boolean' ? record.enabled : true,
        lastResult,
        lastMessage: asString(record?.lastMessage),
        lastRunAt: asString(record?.lastRunAt),
    };
};

export const createDefaultRequest = (parentId: string, protocol: RequestProtocol = 'http'): Request => {
    const method = PROTOCOL_METHOD_OPTIONS[protocol][0];
    return {
        id: `${parentId}-${Date.now()}`,
        method,
        protocol,
        name: 'New Request',
        description: '',
        url: '',
        auth: { type: 'none', credentials: {} },
        body: '',
        headers: [{ enabled: false, key: '', value: '' }],
        params: [{ enabled: false, key: '', value: '' }],
        preRequestScript: '',
        tests: '',
        testCases: [],
        usageCount: 0,
        successCount: 0,
        failureCount: 0,
        avgResponseTime: 0,
        updatedAt: new Date().toISOString(),
    };
};

export const createDefaultCollection = (name: string, teamId?: string): Collection => {
    const now = new Date().toISOString();
    return {
        id: createEntityId('collection'),
        name,
        description: '',
        variables: [],
        folders: [],
        requests: [],
        createdAt: now,
        updatedAt: now,
        teamId,
    };
};

export const createDefaultFolder = (collectionId: string, nextIndex: number): Folder => ({
    id: `${collectionId}-${Date.now()}`,
    name: `New Folder ${nextIndex}`,
    requests: [],
});

export const ensureRequestDefaults = (request: Request): Request => {
    const protocol = pickProtocol(request.protocol);
    const method = pickMethod(request.method, protocol);

    return {
        ...request,
        method,
        protocol,
        name: request.name || 'Untitled Request',
        description: request.description || '',
        url: request.url || '',
        headers: (request.headers || []).map(normalizeHeader),
        params: (request.params || []).map(normalizeParam),
        body: request.body || '',
        preRequestScript: request.preRequestScript || '',
        tests: request.tests || '',
        testCases: (request.testCases || []).map(normalizeTestCase),
        usageCount: request.usageCount || 0,
        successCount: request.successCount || 0,
        failureCount: request.failureCount || 0,
        avgResponseTime: request.avgResponseTime || 0,
        updatedAt: request.updatedAt || new Date().toISOString(),
    };
};

export const ensureCollectionDefaults = (collection: Collection, teamId?: string): Collection => {
    const now = new Date().toISOString();

    return {
        ...collection,
        id: collection.id || createEntityId('collection'),
        name: collection.name || 'Imported Collection',
        description: collection.description || '',
        variables: collection.variables || [],
        folders: (collection.folders || []).map((folder) => ({
            ...folder,
            id: folder.id || createEntityId('folder'),
            name: folder.name || 'Folder',
            requests: (folder.requests || []).map((request) => ensureRequestDefaults(request)),
        })),
        requests: (collection.requests || []).map((request) => ensureRequestDefaults(request)),
        createdAt: collection.createdAt || now,
        updatedAt: collection.updatedAt || now,
        teamId: teamId || collection.teamId,
    };
};

export const normalizeCollections = (collections: Collection[], teamId?: string): Collection[] =>
    collections.map((collection) => ensureCollectionDefaults(collection, teamId));

export const flattenCollectionRequests = (collections: Collection[]): CollectionRequestRef[] => {
    const result: CollectionRequestRef[] = [];

    collections.forEach((collection) => {
        const normalizedCollection = ensureCollectionDefaults(collection, collection.teamId);

        normalizedCollection.requests.forEach((request) => {
            result.push({ collection: normalizedCollection, folder: null, request });
        });

        normalizedCollection.folders.forEach((folder) => {
            folder.requests.forEach((request) => {
                result.push({ collection: normalizedCollection, folder, request });
            });
        });
    });

    return result;
};

export const updateRequestInCollections = (
    collections: Collection[],
    requestId: string,
    updater: (request: Request, context: { collection: Collection; folder: Folder | null }) => Request
): Collection[] => {
    const now = new Date().toISOString();

    return collections.map((collection) => {
        let changed = false;

        const requests = collection.requests.map((request) => {
            if (request.id !== requestId) {
                return request;
            }
            changed = true;
            return updater(ensureRequestDefaults(request), { collection, folder: null });
        });

        const folders = collection.folders.map((folder) => {
            let folderChanged = false;
            const folderRequests = folder.requests.map((request) => {
                if (request.id !== requestId) {
                    return request;
                }
                changed = true;
                folderChanged = true;
                return updater(ensureRequestDefaults(request), { collection, folder });
            });

            if (!folderChanged) {
                return folder;
            }

            return {
                ...folder,
                requests: folderRequests,
            };
        });

        if (!changed) {
            return collection;
        }

        return {
            ...collection,
            requests,
            folders,
            updatedAt: now,
        };
    });
};

export const findRequest = (collections: Collection[], requestId: string): CollectionRequestRef | null => {
    for (const collection of collections) {
        for (const request of collection.requests) {
            if (request.id === requestId) {
                return { collection, folder: null, request };
            }
        }

        for (const folder of collection.folders) {
            for (const request of folder.requests) {
                if (request.id === requestId) {
                    return { collection, folder, request };
                }
            }
        }
    }

    return null;
};

export const withCollectionShareId = (collection: Collection): Collection => {
    if (collection.shareId) {
        return collection;
    }

    return {
        ...collection,
        shareId: `share_${generateRandomString(20)}`,
        updatedAt: new Date().toISOString(),
    };
};

export const buildCollectionShareUrl = (origin: string, shareId: string): string =>
    `${origin.replace(/\/$/, '')}/collections/shared/${shareId}`;

export const coerceDate = (value: unknown): Date | null => {
    if (!value) {
        return null;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    const record = asRecord(value);
    if (!record) {
        return null;
    }

    if (typeof record.toDate === 'function') {
        const parsed = (record.toDate as () => Date)();
        if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    if (typeof record.seconds === 'number') {
        return new Date(record.seconds * 1000);
    }

    return null;
};

export const formatRelativeTime = (value: unknown): string => {
    const date = coerceDate(value);
    if (!date) {
        return 'just now';
    }

    const diff = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diff < minute) return 'just now';
    if (diff < hour) return `${Math.round(diff / minute)}m ago`;
    if (diff < day) return `${Math.round(diff / hour)}h ago`;
    if (diff < week) return `${Math.round(diff / day)}d ago`;

    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    });
};

export const getTimeRange = (filter: DashboardTimeFilter, now: Date = new Date()): DateRange | null => {
    const end = new Date(now);
    const start = new Date(now);

    if (filter === 'all') {
        return null;
    }

    if (filter === 'today') {
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }

    if (filter === 'yesterday') {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(start);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return { start, end: yesterdayEnd };
    }

    if (filter === 'last7days') {
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }

    if (filter === 'lastMonth') {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { start: monthStart, end: monthEnd };
    }

    const yearStart = new Date(now.getFullYear() - 1, 0, 1);
    const yearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    return { start: yearStart, end: yearEnd };
};

export const isInRange = (value: unknown, range: DateRange | null): boolean => {
    if (!range) {
        return true;
    }

    const date = coerceDate(value);
    if (!date) {
        return false;
    }

    return date >= range.start && date <= range.end;
};

const parseImportedRequest = (requestLike: unknown, fallbackName: string, idSeed: string): Request => {
    const requestRecord = asRecord(requestLike) || {};
    const protocol = pickProtocol(requestRecord.protocol);

    const parsed = ensureRequestDefaults({
        id: asString(requestRecord.id, `${idSeed}-${Date.now()}-${generateRandomString(4)}`),
        name: asString(requestRecord.name, fallbackName),
        description: asString(requestRecord.description),
        protocol,
        method: pickMethod(requestRecord.method, protocol),
        url: asString(requestRecord.url),
        params: asArray(requestRecord.params).map(normalizeParam),
        headers: asArray(requestRecord.headers).map(normalizeHeader),
        body: asString(requestRecord.body),
        auth: {
            type: (asRecord(requestRecord.auth)?.type as Request['auth']['type']) || 'none',
            credentials: asRecord(asRecord(requestRecord.auth)?.credentials) || {},
        },
        preRequestScript: asString(requestRecord.preRequestScript),
        tests: asString(requestRecord.tests),
        testCases: asArray(requestRecord.testCases).map(normalizeTestCase),
        isFavorite: Boolean(requestRecord.isFavorite),
        usageCount: Number(requestRecord.usageCount || 0),
        successCount: Number(requestRecord.successCount || 0),
        failureCount: Number(requestRecord.failureCount || 0),
        avgResponseTime: Number(requestRecord.avgResponseTime || 0),
        lastResponseTime: typeof requestRecord.lastResponseTime === 'number' ? requestRecord.lastResponseTime : undefined,
        lastStatus: typeof requestRecord.lastStatus === 'number' ? requestRecord.lastStatus : undefined,
        lastUsedAt: asString(requestRecord.lastUsedAt),
        updatedAt: asString(requestRecord.updatedAt),
    });

    return parsed;
};

const parseImportedFolder = (folderLike: unknown, idSeed: string): Folder => {
    const folderRecord = asRecord(folderLike) || {};
    const requests = asArray(folderRecord.requests).map((requestLike, index) =>
        parseImportedRequest(requestLike, `Request ${index + 1}`, `${idSeed}-request`)
    );

    return {
        id: asString(folderRecord.id, `${idSeed}-${generateRandomString(6)}`),
        name: asString(folderRecord.name, 'Imported Folder'),
        requests,
    };
};

const convertNativeCollection = (collectionLike: unknown, teamId?: string): Collection => {
    const collectionRecord = asRecord(collectionLike) || {};
    const collectionId = asString(collectionRecord.id, createEntityId('collection'));

    const folders = asArray(collectionRecord.folders).map((folderLike, index) =>
        parseImportedFolder(folderLike, `${collectionId}-folder-${index + 1}`)
    );

    const requests = asArray(collectionRecord.requests).map((requestLike, index) =>
        parseImportedRequest(requestLike, `Request ${index + 1}`, `${collectionId}-request`)
    );

    return ensureCollectionDefaults(
        {
            id: collectionId,
            name: asString(collectionRecord.name, 'Imported Collection'),
            description: asString(collectionRecord.description),
            variables: asArray(collectionRecord.variables) as Collection['variables'],
            folders,
            requests,
            createdAt: asString(collectionRecord.createdAt),
            updatedAt: asString(collectionRecord.updatedAt),
            shareId: asString(collectionRecord.shareId),
            teamId: asString(collectionRecord.teamId),
        },
        teamId
    );
};

const postmanUrlToString = (value: unknown): { url: string; params: Param[] } => {
    if (typeof value === 'string') {
        return { url: value, params: [] };
    }

    const urlRecord = asRecord(value) || {};
    const raw = asString(urlRecord.raw);
    if (raw) {
        const queryParams = asArray(urlRecord.query).map((paramLike) => {
            const paramRecord = asRecord(paramLike) || {};
            return {
                enabled: !Boolean(paramRecord.disabled),
                key: asString(paramRecord.key),
                value: asString(paramRecord.value),
            } satisfies Param;
        });

        return {
            url: raw,
            params: queryParams,
        };
    }

    const host = asArray(urlRecord.host).map((part) => asString(part)).filter(Boolean).join('.');
    const path = asArray(urlRecord.path).map((part) => asString(part)).filter(Boolean).join('/');
    const protocol = asString(urlRecord.protocol, 'https');
    const query = asArray(urlRecord.query)
        .map((part) => {
            const queryRecord = asRecord(part) || {};
            const key = asString(queryRecord.key);
            const valuePart = asString(queryRecord.value);
            if (!key) {
                return '';
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(valuePart)}`;
        })
        .filter(Boolean)
        .join('&');

    const base = host ? `${protocol}://${host}${path ? `/${path}` : ''}` : '';

    return {
        url: query ? `${base}?${query}` : base,
        params: [],
    };
};

const extractPostmanScript = (events: unknown, listener: 'prerequest' | 'test'): string => {
    const list = asArray(events);
    const matched = list.find((event) => asString(asRecord(event)?.listen) === listener);
    const script = asRecord(asRecord(matched)?.script);
    const execList = asArray(script?.exec).map((line) => asString(line)).filter(Boolean);
    return execList.join('\n');
};

const convertPostmanRequest = (itemLike: unknown, fallbackName: string): Request => {
    const itemRecord = asRecord(itemLike) || {};
    const requestRecord = asRecord(itemRecord.request) || {};

    const method = asString(requestRecord.method, 'GET').toUpperCase();
    const { url, params } = postmanUrlToString(requestRecord.url);

    const headers = asArray(requestRecord.header).map((headerLike) => {
        const headerRecord = asRecord(headerLike) || {};
        return {
            enabled: !Boolean(headerRecord.disabled),
            key: asString(headerRecord.key),
            value: asString(headerRecord.value),
        } satisfies Header;
    });

    const bodyRecord = asRecord(requestRecord.body) || {};
    const mode = asString(bodyRecord.mode);
    const rawBody =
        mode === 'raw'
            ? asString(bodyRecord.raw)
            : mode === 'urlencoded'
              ? JSON.stringify(asArray(bodyRecord.urlencoded), null, 2)
              : asString(bodyRecord.raw);

    return ensureRequestDefaults({
        id: createEntityId('request'),
        method: HTTP_METHODS.has(method) ? (method as RequestType) : RequestType.GET,
        protocol: 'http',
        name: asString(itemRecord.name, fallbackName),
        description: asString(itemRecord.description),
        url,
        params,
        headers,
        body: rawBody,
        auth: { type: 'none', credentials: {} },
        preRequestScript: extractPostmanScript(itemRecord.event, 'prerequest'),
        tests: extractPostmanScript(itemRecord.event, 'test'),
        testCases: [],
    });
};

const collectPostmanRequests = (items: unknown[], parentName = ''): Request[] => {
    const requests: Request[] = [];

    items.forEach((itemLike, index) => {
        const itemRecord = asRecord(itemLike) || {};
        const itemName = asString(itemRecord.name, `Item ${index + 1}`);
        const nestedItems = asArray(itemRecord.item);

        if (nestedItems.length > 0) {
            const nestedPrefix = parentName ? `${parentName} / ${itemName}` : itemName;
            requests.push(...collectPostmanRequests(nestedItems, nestedPrefix));
            return;
        }

        const fallbackName = parentName ? `${parentName} / ${itemName}` : itemName;
        requests.push(convertPostmanRequest(itemRecord, fallbackName));
    });

    return requests;
};

const convertPostmanCollection = (payload: Record<string, unknown>, teamId?: string): Collection => {
    const info = asRecord(payload.info) || {};
    const collection = createDefaultCollection(asString(info.name, 'Imported Postman Collection'), teamId);
    collection.description = asString(info.description);

    asArray(payload.item).forEach((itemLike, index) => {
        const itemRecord = asRecord(itemLike) || {};
        const nestedItems = asArray(itemRecord.item);

        if (nestedItems.length > 0) {
            collection.folders.push({
                id: createEntityId('folder'),
                name: asString(itemRecord.name, `Folder ${index + 1}`),
                requests: collectPostmanRequests(nestedItems),
            });
            return;
        }

        collection.requests.push(
            convertPostmanRequest(itemRecord, asString(itemRecord.name, `Request ${index + 1}`))
        );
    });

    return ensureCollectionDefaults(collection, teamId);
};

const parseHoppscotchRequest = (requestLike: unknown): Request => {
    const requestRecord = asRecord(requestLike) || {};

    const method = asString(requestRecord.method, 'GET').toUpperCase();
    const endpoint = asString(requestRecord.endpoint) || asString(requestRecord.url);

    const headerSource = requestRecord.headers;
    const headers = Array.isArray(headerSource)
        ? headerSource.map((headerLike) => {
              const headerRecord = asRecord(headerLike) || {};
              return {
                  enabled:
                      typeof headerRecord.enabled === 'boolean'
                          ? headerRecord.enabled
                          : typeof headerRecord.active === 'boolean'
                            ? headerRecord.active
                            : true,
                  key: asString(headerRecord.key),
                  value: asString(headerRecord.value),
              } satisfies Header;
          })
        : Object.entries(asRecord(headerSource) || {}).map(([key, value]) => ({
              enabled: true,
              key,
              value: asString(value),
          }));

    const paramsSource = requestRecord.params;
    const params = Array.isArray(paramsSource)
        ? paramsSource.map((paramLike) => {
              const paramRecord = asRecord(paramLike) || {};
              return {
                  enabled:
                      typeof paramRecord.enabled === 'boolean'
                          ? paramRecord.enabled
                          : typeof paramRecord.active === 'boolean'
                            ? paramRecord.active
                            : true,
                  key: asString(paramRecord.key),
                  value: asString(paramRecord.value),
              } satisfies Param;
          })
        : [];

    const bodyValue = asRecord(requestRecord.body);
    const body =
        asString(requestRecord.rawParams) ||
        asString(requestRecord.content) ||
        asString(bodyValue?.content) ||
        asString(requestRecord.body);

    const protocol = pickProtocol(requestRecord.protocol);

    return ensureRequestDefaults({
        id: createEntityId('request'),
        method: HTTP_METHODS.has(method) ? (method as RequestType) : pickMethod(method, protocol),
        protocol,
        name: asString(requestRecord.name, 'Imported Request'),
        description: asString(requestRecord.description),
        url: endpoint,
        params,
        headers,
        body,
        auth: { type: 'none', credentials: {} },
        preRequestScript: asString(requestRecord.preRequestScript),
        tests: asString(requestRecord.tests),
        testCases: [],
    });
};

const convertHoppscotchCollection = (collectionLike: unknown, teamId?: string): Collection => {
    const collectionRecord = asRecord(collectionLike) || {};
    const collection = createDefaultCollection(asString(collectionRecord.name, 'Imported Hoppscotch Collection'), teamId);
    collection.description = asString(collectionRecord.description);

    asArray(collectionRecord.requests).forEach((requestLike) => {
        collection.requests.push(parseHoppscotchRequest(requestLike));
    });

    asArray(collectionRecord.folders).forEach((folderLike, index) => {
        const folderRecord = asRecord(folderLike) || {};
        collection.folders.push({
            id: createEntityId('folder'),
            name: asString(folderRecord.name, `Folder ${index + 1}`),
            requests: asArray(folderRecord.requests).map(parseHoppscotchRequest),
        });
    });

    return ensureCollectionDefaults(collection, teamId);
};

const convertHoppscotchExport = (payload: Record<string, unknown>, teamId?: string): Collection[] => {
    const collections = asArray(payload.collections);
    if (collections.length > 0) {
        return collections.map((collectionLike) => convertHoppscotchCollection(collectionLike, teamId));
    }

    if (Array.isArray(payload.requests) || Array.isArray(payload.folders)) {
        return [convertHoppscotchCollection(payload, teamId)];
    }

    return [];
};

const convertInsomniaExport = (payload: Record<string, unknown>, teamId?: string): Collection[] => {
    const resources = asArray(payload.resources);

    const groups = resources
        .map((resource) => asRecord(resource))
        .filter((resource): resource is Record<string, unknown> => Boolean(resource && asString(resource._type) === 'request_group'));

    const requests = resources
        .map((resource) => asRecord(resource))
        .filter((resource): resource is Record<string, unknown> => Boolean(resource && asString(resource._type) === 'request'));

    const foldersById = new Map<string, Folder>();
    groups.forEach((group) => {
        const id = asString(group._id, createEntityId('folder'));
        foldersById.set(id, {
            id,
            name: asString(group.name, 'Folder'),
            requests: [],
        });
    });

    const topLevelCollection = createDefaultCollection('Imported Insomnia Collection', teamId);

    requests.forEach((requestRecord) => {
        const request = ensureRequestDefaults({
            id: asString(requestRecord._id, createEntityId('request')),
            method: pickMethod(asString(requestRecord.method, 'GET'), 'http'),
            protocol: 'http',
            name: asString(requestRecord.name, 'Imported Request'),
            description: '',
            url: asString(requestRecord.url),
            params: [],
            headers: asArray(requestRecord.headers).map((headerLike) => {
                const headerRecord = asRecord(headerLike) || {};
                return {
                    enabled: true,
                    key: asString(headerRecord.name || headerRecord.key),
                    value: asString(headerRecord.value),
                } satisfies Header;
            }),
            body: asString(asRecord(requestRecord.body)?.text),
            auth: { type: 'none', credentials: {} },
            preRequestScript: '',
            tests: '',
            testCases: [],
        });

        const parentId = asString(requestRecord.parentId);
        const folder = foldersById.get(parentId);
        if (folder) {
            folder.requests.push(request);
        } else {
            topLevelCollection.requests.push(request);
        }
    });

    topLevelCollection.folders = Array.from(foldersById.values()).filter((folder) => folder.requests.length > 0);

    return [ensureCollectionDefaults(topLevelCollection, teamId)];
};

export const parseImportedCollections = (rawContent: string, teamId?: string): Collection[] => {
    const parsed = JSON.parse(rawContent) as unknown;

    if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
            return [];
        }

        return parsed.map((collectionLike) => convertNativeCollection(collectionLike, teamId));
    }

    const payload = asRecord(parsed);
    if (!payload) {
        throw new Error('Invalid import format: expected JSON object or array');
    }

    if (Array.isArray(payload.collections) || Array.isArray(payload.requests) || Array.isArray(payload.folders)) {
        const hoppscotchCollections = convertHoppscotchExport(payload, teamId);
        if (hoppscotchCollections.length > 0) {
            return hoppscotchCollections;
        }
    }

    if (asString(payload._type) === 'export' && Array.isArray(payload.resources)) {
        return convertInsomniaExport(payload, teamId);
    }

    if (payload.info && Array.isArray(payload.item)) {
        return [convertPostmanCollection(payload, teamId)];
    }

    if (payload.name && (Array.isArray(payload.folders) || Array.isArray(payload.requests))) {
        return [convertHoppscotchCollection(payload, teamId)];
    }

    if (payload.name && (Array.isArray(payload.requests) || Array.isArray(payload.folders))) {
        return [convertNativeCollection(payload, teamId)];
    }

    throw new Error('Unsupported import format. Supported: native JSON, Postman, Hoppscotch, Insomnia.');
};

export const getCollectionLastUpdated = (collection: Collection): Date | null => {
    const candidates: Date[] = [];

    const collectionDate = coerceDate(collection.updatedAt) || coerceDate(collection.createdAt);
    if (collectionDate) {
        candidates.push(collectionDate);
    }

    collection.requests.forEach((request) => {
        const requestDate = coerceDate(request.updatedAt) || coerceDate(request.lastUsedAt);
        if (requestDate) {
            candidates.push(requestDate);
        }
    });

    collection.folders.forEach((folder) => {
        folder.requests.forEach((request) => {
            const requestDate = coerceDate(request.updatedAt) || coerceDate(request.lastUsedAt);
            if (requestDate) {
                candidates.push(requestDate);
            }
        });
    });

    if (candidates.length === 0) {
        return null;
    }

    return candidates.sort((a, b) => b.getTime() - a.getTime())[0];
};
