// components/Environment/EnvironmentSelector.tsx
'use client'
import { Environment } from "@/types/User";
import { ChevronDownIcon } from "../Common/Icons";

interface EnvironmentSelectorProps {
    environments: Environment[] | undefined;
    activeEnvironmentId: string | null;
    onEnvironmentSelect: (environmentId: string) => void;
    disabled?: boolean;
}

export default function EnvironmentSelector({
    environments,
    activeEnvironmentId,
    onEnvironmentSelect,
    disabled = false
}: EnvironmentSelectorProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        if (selectedId) {
            onEnvironmentSelect(selectedId);
        }
    };

    return (
        <div className="relative">
            <select title="handlechange"
                className={`h-10 pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${disabled ? 'opacity-50' : ''}`}
                disabled={disabled || !environments || environments.length === 0}
                value={activeEnvironmentId || ''}
                onChange={handleChange}
            >
                {!environments || environments.length === 0 ? (
                    <option value="">No Environments</option>
                ) : (
                    <>
                        <option value="">Select Environment</option>
                        {environments.map((environment) => (
                            <option key={environment.id} value={environment.id}>
                                {environment.name}
                            </option>
                        ))}
                    </>
                )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <ChevronDownIcon className="w-5 h-5" />
            </div>
        </div>
    );
}