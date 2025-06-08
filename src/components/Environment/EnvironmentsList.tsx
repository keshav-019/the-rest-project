'use client'
import { useState } from 'react'
import { Environment } from '@/types/User'
import EnvironmentMenu from './EnvironmentMenu'

interface EnvironmentsListProps {
    environments: Environment[]
    activeEnvironmentId: string | null
    onEnvironmentSelect: (envId: string) => void
    onAddClick: () => void
    onEnvironmentDelete: (envId: string) => void
    onEnvironmentUpdate: (updatedEnv: Environment) => void
}

export default function EnvironmentsList({
    environments,
    activeEnvironmentId,
    onEnvironmentSelect,
    onAddClick,
    onEnvironmentDelete,
    onEnvironmentUpdate
}: EnvironmentsListProps) {
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredEnvironments = environments.filter(env =>
        env.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleMenuClick = (envId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setMenuOpenFor(menuOpenFor === envId ? null : envId)
    }

    return (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Environments</h2>
                    <button
                        onClick={onAddClick}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Filter environments..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    {filteredEnvironments.map((env) => (
                        <div
                            key={env.id}
                            onClick={() => onEnvironmentSelect(env.id)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${activeEnvironmentId === env.id
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className="flex items-center">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: env.color || '#3b82f6' }}
                                />
                                <span className="text-gray-800 dark:text-white font-medium">
                                    {env.name}
                                </span>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={(e) => handleMenuClick(env.id, e)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                                {menuOpenFor === env.id && (
                                    <EnvironmentMenu
                                        environment={env}
                                        onClose={() => setMenuOpenFor(null)}
                                        onDelete={onEnvironmentDelete}
                                        onUpdate={onEnvironmentUpdate}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}