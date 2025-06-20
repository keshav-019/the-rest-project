/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { Param } from "@/types/Collections";
import EnvironmentAutocomplete from "./EnvironmentAutocomplete";
import { useRef, useState } from "react";
import { Environment } from "@/types/User";

interface ParamsTabProps {
    handleAddParam: () => void;
    params: Param[];
    handleUpdateParam: (index: number, field: keyof Param, value: string | boolean) => void;
    handleRemoveParam: (index: number) => void;
    environments: Environment[];
    activeEnvironmentId: string | null;
}

export default function ParamsTab({
    handleAddParam,
    params,
    handleUpdateParam,
    handleRemoveParam,
    environments,
    activeEnvironmentId
}: ParamsTabProps) {
    const paramKeyRefs = useRef<(HTMLInputElement | null)[]>([]);
    const paramValueRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [activeParamIndex, setActiveParamIndex] = useState<number | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredVariables, setFilteredVariables] = useState<{name: string, value: string}[]>([]);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Parameters</h3>
                <div className="flex space-x-2">
                    <button
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                        onClick={() => window.location.reload()}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </button>
                    <button
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                        onClick={handleAddParam}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {params.map((param, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input title="updateparamcheckbox"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            checked={param.enabled}
                            onChange={(e) => handleUpdateParam(index, 'enabled', e.target.checked)}
                        />
                        <div className="relative flex-1">
                            <input title="handleupdateparam"
                                ref={(el) => { paramKeyRefs.current[index] = el; }}
                                type="text"
                                placeholder="Key"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={param.key}
                                onChange={(e) => handleUpdateParam(index, 'key', e.target.value)}
                                onFocus={() => setActiveParamIndex(index)}
                            />
                            {activeParamIndex === index && (
                                <EnvironmentAutocomplete
                                    value={param.key}
                                    onChange={(newValue) => handleUpdateParam(index, 'key', newValue)}
                                    onVariableSelect={() => {}}
                                    environments={environments}
                                    activeEnvironmentId={activeEnvironmentId}
                                    targetElement={paramKeyRefs.current[index]}
                                    onShowSuggestions={setShowSuggestions}
                                    onSetVariables={setFilteredVariables}
                                />
                            )}
                        </div>
                        <div className="relative flex-1">
                            <input
                                ref={(el) => { paramValueRefs.current[index] = el; }}
                                type="text"
                                placeholder="Value"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={param.value}
                                onChange={(e) => handleUpdateParam(index, 'value', e.target.value)}
                                onFocus={() => setActiveParamIndex(index)}
                            />
                            {activeParamIndex === index && (
                                <EnvironmentAutocomplete
                                    value={param.value}
                                    onChange={(newValue) => handleUpdateParam(index, 'value', newValue)}
                                    onVariableSelect={() => {}}
                                    environments={environments}
                                    activeEnvironmentId={activeEnvironmentId}
                                    targetElement={paramValueRefs.current[index]}
                                    onShowSuggestions={setShowSuggestions}
                                    onSetVariables={setFilteredVariables}
                                />
                            )}
                        </div>
                        <button
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                            onClick={() => handleRemoveParam(index)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}