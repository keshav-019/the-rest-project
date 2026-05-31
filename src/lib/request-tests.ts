import {
    RequestTestCase,
    ResponseData,
} from '@/types/Collections';

const responseBodyToString = (response: ResponseData): string => {
    if (typeof response.data === 'string') {
        return response.data;
    }

    try {
        return JSON.stringify(response.data);
    } catch {
        return String(response.data);
    }
};

const evaluateSingleTest = (
    testCase: RequestTestCase,
    response: ResponseData,
    responseHeaders: Array<{ key: string; value: string }>
): { result: 'pass' | 'fail' | 'skipped'; message: string } => {
    if (!testCase.enabled) {
        return {
            result: 'skipped',
            message: 'Disabled',
        };
    }

    if (testCase.assertion === 'status_equals') {
        const expected = Number(testCase.expected);
        if (Number.isNaN(expected)) {
            return { result: 'fail', message: 'Expected status must be a number' };
        }

        return response.status === expected
            ? { result: 'pass', message: `Status was ${response.status}` }
            : { result: 'fail', message: `Expected ${expected}, got ${response.status}` };
    }

    if (testCase.assertion === 'body_contains') {
        const body = responseBodyToString(response);
        return body.includes(testCase.expected)
            ? { result: 'pass', message: `Body contains "${testCase.expected}"` }
            : { result: 'fail', message: `Body does not contain "${testCase.expected}"` };
    }

    if (testCase.assertion === 'header_exists') {
        const headerLookup = testCase.expected.trim().toLowerCase();
        const headerExists = responseHeaders.some((header) => header.key.toLowerCase() === headerLookup);
        return headerExists
            ? { result: 'pass', message: `Header ${testCase.expected} found` }
            : { result: 'fail', message: `Header ${testCase.expected} not found` };
    }

    const expected = Number(testCase.expected);
    if (Number.isNaN(expected)) {
        return { result: 'fail', message: 'Expected max response time must be a number' };
    }

    const actual = response.timing.end - response.timing.start;
    return actual <= expected
        ? { result: 'pass', message: `${actual}ms <= ${expected}ms` }
        : { result: 'fail', message: `${actual}ms > ${expected}ms` };
};

export const evaluateRequestTests = (
    testCases: RequestTestCase[],
    response: ResponseData,
    responseHeaders: Array<{ key: string; value: string }>
): { updatedTestCases: RequestTestCase[]; summary: { passed: number; failed: number; skipped: number } } => {
    const summary = {
        passed: 0,
        failed: 0,
        skipped: 0,
    };

    const runAt = new Date().toISOString();

    const updatedTestCases = testCases.map((testCase) => {
        const evaluation = evaluateSingleTest(testCase, response, responseHeaders);

        if (evaluation.result === 'pass') {
            summary.passed += 1;
        } else if (evaluation.result === 'fail') {
            summary.failed += 1;
        } else {
            summary.skipped += 1;
        }

        return {
            ...testCase,
            lastResult: evaluation.result,
            lastMessage: evaluation.message,
            lastRunAt: runAt,
        };
    });

    return {
        updatedTestCases,
        summary,
    };
};
