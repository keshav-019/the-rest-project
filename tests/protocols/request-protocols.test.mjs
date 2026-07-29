import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import vm from 'node:vm';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..', '..');
const require = createRequire(import.meta.url);

let server;
let baseUrl;
let executeProtocolRequest;

const readBody = (request) =>
    new Promise((resolveBody, rejectBody) => {
        const chunks = [];
        request.on('data', (chunk) => chunks.push(chunk));
        request.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
        request.on('error', rejectBody);
    });

const loadRequestProtocols = async () => {
    const sourcePath = resolve(repoRoot, 'src', 'lib', 'request-protocols.ts');
    const source = await readFile(sourcePath, 'utf8');
    const output = ts.transpileModule(source, {
        compilerOptions: {
            esModuleInterop: true,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
        },
        fileName: sourcePath,
    }).outputText;

    const module = { exports: {} };
    const context = vm.createContext({
        module,
        exports: module.exports,
        require,
        fetch,
        btoa: (value) => Buffer.from(value, 'binary').toString('base64'),
        console,
        Date,
        JSON,
        Math,
        Object,
        URL,
    });

    vm.runInContext(output, context, { filename: sourcePath });
    return module.exports;
};

const setup = async () => {
    ({ executeProtocolRequest } = await loadRequestProtocols());

    server = createServer(async (request, response) => {
        if (request.url?.startsWith('/graphql') && request.method === 'POST') {
            const body = await readBody(request);
            response.writeHead(200, {
                'content-type': 'application/json',
                'x-test-server': 'graphql',
            });
            response.end(JSON.stringify({
                data: { hello: 'world' },
                received: JSON.parse(body),
            }));
            return;
        }

        response.writeHead(404, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: 'not found' }));
    });

    await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
};

const teardown = async () => {
    await new Promise((resolveClose) => server.close(resolveClose));
};

const testGraphQL = async () => {
    const response = await executeProtocolRequest({
        protocol: 'graphql',
        method: 'POST',
        url: `${baseUrl}/graphql`,
        params: [{ enabled: true, key: 'source', value: 'node-test' }],
        headers: { 'Content-Type': 'application/json' },
        body: '{ hello }',
        auth: { type: 'none', credentials: {} },
    });

    assert.equal(response.result.status, 200);
    assert.equal(response.result.data.data.hello, 'world');
    assert.equal(response.result.data.received.query, '{ hello }');
    assert.equal(response.result.headers['x-test-server'], 'graphql');
};

const testPreparedProtocols = async () => {
    const protocols = ['grpc', 'mcp', 'websocket', 'socketio', 'mqtt'];

    for (const protocol of protocols) {
        const response = await executeProtocolRequest({
            protocol,
            method: protocol === 'websocket' || protocol === 'socketio' ? 'GET' : 'POST',
            url: `${protocol}://localhost:9999/example`,
            params: [],
            headers: { 'X-Test': protocol },
            body: JSON.stringify({ ok: true }),
            auth: { type: 'none', credentials: {} },
        });

        assert.equal(response.result.status, 202);
        assert.equal(response.result.statusText, 'Prepared');
        assert.equal(response.result.headers['x-runtime'], 'simulated');
        assert.equal(response.result.data.protocol, protocol);
        assert.equal(response.result.data.request.headers['X-Test'], protocol);
    }
};

const run = async () => {
    await setup();
    try {
        await testGraphQL();
        console.log('ok - executes GraphQL against a throwaway local server');

        await testPreparedProtocols();
        console.log('ok - prepares non-HTTP protocol requests without hiding transport status');
    } finally {
        await teardown();
    }
};

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
