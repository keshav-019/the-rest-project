import type {
    Auth,
    Param,
    RequestProtocol,
    RequestType,
    ResponseData,
} from '@/types/Collections';

export interface ExecuteProtocolRequestInput {
    protocol: RequestProtocol;
    method: RequestType;
    url: string;
    params: Param[];
    headers: Record<string, string>;
    body: string;
    auth: Auth;
}

export interface ExecuteProtocolRequestOutput {
    result: ResponseData;
    responseHeaders: Array<{ key: string; value: string }>;
    timeline: Array<{ name: string; duration: number }>;
}

export const isHttpLikeProtocol = (protocol: RequestProtocol): boolean =>
    protocol === 'http' || protocol === 'graphql';

const withQueryParams = (baseUrl: string, params: Param[]): string => {
    const enabledParams = params.filter((param) => param.enabled && param.key);
    if (enabledParams.length === 0) {
        return baseUrl;
    }

    const queryString = enabledParams
        .map((param) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
        .join('&');

    if (!baseUrl) {
        return queryString ? `?${queryString}` : '';
    }

    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
};

const buildTimingPhases = (duration: number): Array<{ name: string; duration: number }> => {
    const safeDuration = Math.max(duration, 1);

    return [
        { name: 'DNS Lookup', duration: Math.max(1, Math.round(safeDuration * 0.12)) },
        { name: 'Connection', duration: Math.max(1, Math.round(safeDuration * 0.18)) },
        { name: 'Request Sent', duration: Math.max(1, Math.round(safeDuration * 0.1)) },
        { name: 'Waiting (TTFB)', duration: Math.max(1, Math.round(safeDuration * 0.35)) },
        { name: 'Content Download', duration: Math.max(1, Math.round(safeDuration * 0.25)) },
    ];
};

const addAuthHeaders = (
    headers: Record<string, string>,
    auth: Auth,
    requestUrl: string
): { headers: Record<string, string>; requestUrl: string } => {
    const updatedHeaders = { ...headers };
    let nextUrl = requestUrl;

    if (auth.type === 'bearer' && auth.credentials.token) {
        updatedHeaders.Authorization = `Bearer ${auth.credentials.token}`;
    } else if (auth.type === 'basic' && auth.credentials.username && auth.credentials.password) {
        const basicAuth = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
        updatedHeaders.Authorization = `Basic ${basicAuth}`;
    } else if (auth.type === 'apiKey') {
        const key = auth.credentials.key || 'X-API-KEY';
        const value = auth.credentials.value || '';

        if (auth.credentials.addTo === 'query') {
            nextUrl += `${nextUrl.includes('?') ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        } else {
            updatedHeaders[key] = value;
        }
    }

    return {
        headers: updatedHeaders,
        requestUrl: nextUrl,
    };
};

const parseBody = (rawBody: string): unknown => {
    if (!rawBody.trim()) {
        return undefined;
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        return rawBody;
    }
};

export const executeProtocolRequest = async (
    input: ExecuteProtocolRequestInput
): Promise<ExecuteProtocolRequestOutput> => {
    const startTime = Date.now();

    const requestUrlWithParams = withQueryParams(input.url, input.params);
    const withAuth = addAuthHeaders(input.headers, input.auth, requestUrlWithParams);

    if (!isHttpLikeProtocol(input.protocol)) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const timeline = buildTimingPhases(duration);

        const simulatedData = {
            protocol: input.protocol,
            message:
                'Request prepared. Runtime transport for this protocol can be connected to your backend adapter.',
            request: {
                method: input.method,
                url: withAuth.requestUrl,
                headers: withAuth.headers,
                body: parseBody(input.body),
            },
        };

        return {
            result: {
                status: 202,
                statusText: 'Prepared',
                data: simulatedData,
                headers: {
                    'x-protocol': input.protocol,
                    'x-runtime': 'simulated',
                },
                cookies: [],
                timing: {
                    start: startTime,
                    end: endTime,
                    phases: timeline,
                },
            },
            responseHeaders: [
                { key: 'x-protocol', value: input.protocol },
                { key: 'x-runtime', value: 'simulated' },
            ],
            timeline,
        };
    }

    const outgoingMethod = input.protocol === 'graphql' ? 'POST' : input.method;

    const parsedBody = parseBody(input.body);
    const preparedBody =
        outgoingMethod === 'GET' || outgoingMethod === 'HEAD'
            ? undefined
            : input.protocol === 'graphql'
              ? JSON.stringify(
                    typeof parsedBody === 'string'
                        ? {
                              query: parsedBody,
                          }
                        : parsedBody || {}
                )
              : JSON.stringify(parsedBody ?? {});

    const response = await fetch(withAuth.requestUrl, {
        method: outgoingMethod,
        headers: withAuth.headers,
        body: preparedBody,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    const timeline = buildTimingPhases(duration);

    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    const responseHeaders: Array<{ key: string; value: string }> = [];
    response.headers.forEach((value, key) => {
        responseHeaders.push({ key, value });
    });

    return {
        result: {
            status: response.status,
            statusText: response.statusText,
            data,
            headers: Object.fromEntries(response.headers.entries()),
            cookies: [],
            timing: {
                start: startTime,
                end: endTime,
                phases: timeline,
            },
        },
        responseHeaders,
        timeline,
    };
};
