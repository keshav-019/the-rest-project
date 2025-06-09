'use client'
import { Environment } from "@/types/User";
import { ChevronDownIcon } from "../Common/Icons";

export default function EnvironmentSelector({environments}: {environments: Environment[] | undefined}) {
    return (
        <div className="relative">
            <select 
                className="h-10 pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                disabled={!environments || environments.length === 0}
            >
                {!environments || environments.length === 0 ? (
                    <option>No Environments</option>
                ) : (
                    <>
                        {environments.map((environment, index) => (
                            <option key={index} value={environment.id || index}>
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