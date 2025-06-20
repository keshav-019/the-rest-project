'use client'
import { Environment } from '@/types/User'
import { useState } from 'react'

interface EnvironmentMenuProps {
    environment: Environment
    onClose: () => void
    onDelete: (envId: string) => void
    onUpdate: (updatedEnv: Environment) => void
}

export default function EnvironmentMenu({
    environment,
    onClose,
    onDelete,
    onUpdate
}: EnvironmentMenuProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(environment.name)

    const handleUpdate = () => {
        onUpdate({
            ...environment,
            name: editName
        })
        setIsEditing(false)
        onClose()
    }

    return (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
                {isEditing ? (
                    <div className="px-4 py-2">
                        <input title='editname'
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Rename
                        </button>
                        <button
                            onClick={() => {
                                onDelete(environment.id)
                                onClose()
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}