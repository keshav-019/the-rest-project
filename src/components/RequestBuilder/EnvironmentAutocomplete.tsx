/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect, useRef } from 'react';
import { Environment } from '@/types/User';

interface EnvironmentAutocompleteProps {
    environments: Environment[];
    activeEnvironmentId: string | null;
    value: string;
    onChange: (value: string) => void;
    onVariableSelect: (variableName: string) => void;
    targetElement?: HTMLInputElement | HTMLTextAreaElement | null;
    onShowSuggestions?: (show: boolean) => void;
    onSetVariables?: (variables: {name: string, value: string}[]) => void;
}

export default function EnvironmentAutocomplete({
    environments,
    activeEnvironmentId,
    value,
    onChange,
    onVariableSelect,
    targetElement,
    onShowSuggestions,
    onSetVariables
}: EnvironmentAutocompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredVariables, setFilteredVariables] = useState<{name: string, value: string}[]>([]);
    const [selectionIndex, setSelectionIndex] = useState(-1);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Sync state with parent if callbacks provided
    useEffect(() => {
        onShowSuggestions?.(showSuggestions);
    }, [showSuggestions]);

    useEffect(() => {
        onSetVariables?.(filteredVariables);
    }, [filteredVariables]);

    useEffect(() => {
        if (!targetElement || !activeEnvironmentId) {
            setShowSuggestions(false);
            return;
        }

        const cursorPos = targetElement.selectionStart || 0;
        const textBeforeCursor = value.slice(0, cursorPos);
        
        const lastOpen = textBeforeCursor.lastIndexOf('{{');
        const lastClose = textBeforeCursor.lastIndexOf('}}');
        
        if (lastOpen > lastClose) {
            const activeEnv = environments.find(env => env.id === activeEnvironmentId);
            if (activeEnv) {
                const varContent = textBeforeCursor.slice(lastOpen + 2);
                const currentVarPart = varContent.split(/[}\s]/)[0];
                
                const vars = activeEnv.variables
                    .filter(v => v.name.toLowerCase().includes(currentVarPart.toLowerCase()))
                    .map(v => ({ name: v.name, value: v.currentValue }));

                setFilteredVariables(vars);
                setShowSuggestions(vars.length > 0);
                return;
            }
        }
        
        setShowSuggestions(false);
    }, [value, activeEnvironmentId, environments, targetElement]);

    const handleVariableSelect = (variableName: string) => {
        if (!targetElement) return;

        const cursorPos = targetElement.selectionStart || 0;
        const textBeforeCursor = value.slice(0, cursorPos);
        
        const lastOpen = textBeforeCursor.lastIndexOf('{{');
        const lastClose = textBeforeCursor.lastIndexOf('}}');
        
        if (lastOpen > lastClose) {
            const beforeVar = value.slice(0, lastOpen + 2);
            const afterVar = value.slice(cursorPos);
            
            const nextClose = afterVar.indexOf('}}');
            const finalText = nextClose >= 0
                ? beforeVar + variableName + afterVar.slice(nextClose)
                : beforeVar + variableName + '}}' + afterVar;

            onChange(finalText);
            onVariableSelect(variableName);
            setShowSuggestions(false);

            setTimeout(() => {
                const newCursorPos = lastOpen + variableName.length + 4;
                targetElement.setSelectionRange(newCursorPos, newCursorPos);
                targetElement.focus();
            }, 0);
        }
    };

    return (
        <div className="relative">
            {showSuggestions && filteredVariables.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    {filteredVariables.map((variable, index) => (
                        <div
                            key={variable.name}
                            className={`px-4 py-2 cursor-pointer ${selectionIndex === index ? 'bg-blue-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onMouseDown={() => handleVariableSelect(variable.name)}
                        >
                            <div className="font-medium text-gray-900 dark:text-gray-100">{variable.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{variable.value}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}