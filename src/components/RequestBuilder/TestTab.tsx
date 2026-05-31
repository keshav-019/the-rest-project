'use client'
import { useMemo, useState } from 'react';
import {
    RequestTestAssertion,
    RequestTestCase,
} from '@/types/Collections';
import { TEST_ASSERTIONS } from '@/lib/collections-utils';

interface TestTabProps {
    tests: string;
    setTests: (value: string) => void;
    testCases: RequestTestCase[];
    setTestCases: React.Dispatch<React.SetStateAction<RequestTestCase[]>>;
}

const createTestCase = (
    index: number,
    name: string,
    assertion: RequestTestAssertion,
    expected: string
): RequestTestCase => ({
    id: `test-${Date.now()}-${index}`,
    name: name.trim() || `Test ${index + 1}`,
    assertion,
    expected,
    enabled: true,
});

export default function TestTab({ tests, setTests, testCases, setTestCases }: TestTabProps) {
    const [draftName, setDraftName] = useState('');
    const [draftAssertion, setDraftAssertion] = useState<RequestTestAssertion>('status_equals');
    const [draftExpected, setDraftExpected] = useState('200');

    const summary = useMemo(() => {
        return testCases.reduce(
            (acc, testCase) => {
                if (testCase.lastResult === 'pass') acc.passed += 1;
                if (testCase.lastResult === 'fail') acc.failed += 1;
                if (testCase.lastResult === 'skipped') acc.skipped += 1;
                return acc;
            },
            { passed: 0, failed: 0, skipped: 0 }
        );
    }, [testCases]);

    const addTestCase = () => {
        setTestCases((previous) => [
            ...previous,
            createTestCase(previous.length, draftName, draftAssertion, draftExpected),
        ]);
        setDraftName('');
        setDraftExpected(draftAssertion === 'status_equals' ? '200' : '');
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        Passed: {summary.passed}
                    </span>
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        Failed: {summary.failed}
                    </span>
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        Skipped: {summary.skipped}
                    </span>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="Test name"
                        className="md:col-span-1 h-9 px-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
                    />
                    <select
                        value={draftAssertion}
                        onChange={(e) => {
                            const nextAssertion = e.target.value as RequestTestAssertion;
                            setDraftAssertion(nextAssertion);
                            if (nextAssertion === 'status_equals') {
                                setDraftExpected('200');
                            } else if (nextAssertion === 'max_response_time') {
                                setDraftExpected('1000');
                            } else {
                                setDraftExpected('');
                            }
                        }}
                        className="md:col-span-1 h-9 px-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
                    >
                        {TEST_ASSERTIONS.map((assertion) => (
                            <option key={assertion.value} value={assertion.value}>
                                {assertion.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={draftExpected}
                        onChange={(e) => setDraftExpected(e.target.value)}
                        placeholder="Expected value"
                        className="md:col-span-1 h-9 px-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
                    />
                    <button
                        type="button"
                        onClick={addTestCase}
                        className="md:col-span-1 h-9 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                        Add Test
                    </button>
                </div>

                <div className="space-y-2">
                    {testCases.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add assertions to validate status, payload, headers, and response time.
                        </p>
                    ) : (
                        testCases.map((testCase, index) => (
                            <div
                                key={testCase.id}
                                className="flex flex-wrap items-center gap-2 rounded border border-gray-200 dark:border-gray-700 px-3 py-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={testCase.enabled}
                                    onChange={(e) => {
                                        const enabled = e.target.checked;
                                        setTestCases((previous) =>
                                            previous.map((entry) =>
                                                entry.id === testCase.id ? { ...entry, enabled } : entry
                                            )
                                        );
                                    }}
                                />
                                <input
                                    type="text"
                                    value={testCase.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setTestCases((previous) =>
                                            previous.map((entry) =>
                                                entry.id === testCase.id ? { ...entry, name } : entry
                                            )
                                        );
                                    }}
                                    className="h-8 px-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                                />
                                <select
                                    value={testCase.assertion}
                                    onChange={(e) => {
                                        const assertion = e.target.value as RequestTestAssertion;
                                        setTestCases((previous) =>
                                            previous.map((entry) =>
                                                entry.id === testCase.id ? { ...entry, assertion } : entry
                                            )
                                        );
                                    }}
                                    className="h-8 px-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                                >
                                    {TEST_ASSERTIONS.map((assertion) => (
                                        <option key={assertion.value} value={assertion.value}>
                                            {assertion.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={testCase.expected}
                                    onChange={(e) => {
                                        const expected = e.target.value;
                                        setTestCases((previous) =>
                                            previous.map((entry) =>
                                                entry.id === testCase.id ? { ...entry, expected } : entry
                                            )
                                        );
                                    }}
                                    placeholder="Expected"
                                    className="h-8 px-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                                />

                                <span
                                    className={`text-[11px] px-2 py-1 rounded ${
                                        testCase.lastResult === 'pass'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            : testCase.lastResult === 'fail'
                                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                >
                                    {testCase.lastResult || 'Not run'}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTestCases((previous) =>
                                            previous.filter((entry) => entry.id !== testCase.id)
                                        );
                                    }}
                                    className="ml-auto text-xs text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>

                                {testCase.lastMessage ? (
                                    <p className="basis-full text-[11px] text-gray-500 dark:text-gray-400">
                                        {testCase.lastMessage}
                                    </p>
                                ) : null}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="relative">
                <select
                    title="languageselect"
                    className="absolute top-2 right-2 z-10 h-8 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option>JavaScript</option>
                    <option>Python</option>
                </select>
                <textarea
                    title="settests"
                    className="w-full h-56 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tests}
                    onChange={(e) => setTests(e.target.value)}
                    spellCheck="false"
                />
            </div>
        </div>
    );
}
