'use client'
import { Variable } from '@/types/Collections'
import { useState } from 'react'

interface VariableTableProps {
    variables: Variable[]
    onAdd: (newVar: Omit<Variable, 'id'>) => void
    onUpdate: (varName: string, newValue: string) => void
    onDelete: (varName: string) => void
}

export default function VariableTable({
    variables,
    onAdd,
    onUpdate,
    onDelete
}: VariableTableProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newVar, setNewVar] = useState<Omit<Variable, 'id'>>({
        name: '',
        initialValue: '',
        currentValue: ''
    })
    const [editingVar, setEditingVar] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')

    const handleAdd = () => {
        if (newVar.name && newVar.initialValue) {
            onAdd({
                name: newVar.name,
                initialValue: newVar.initialValue,
                currentValue: newVar.currentValue || newVar.initialValue
            })
            setNewVar({ name: '', initialValue: '', currentValue: '' })
            setIsAdding(false)
        }
    }

    const startEdit = (varName: string, currentValue: string) => {
        setEditingVar(varName)
        setEditValue(currentValue)
    }

    const saveEdit = () => {
        if (editingVar) {
            onUpdate(editingVar, editValue)
            setEditingVar(null)
            setEditValue('')
        }
    }

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Variables</h3>
                <div className="flex items-center space-x-2">
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium focus:outline-none cursor-pointer"
                        >
                            + Add Variable
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsAdding(false)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium focus:outline-none cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {isAdding && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newVar.name}
                                onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
                                placeholder="Variable name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Initial Value
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newVar.initialValue}
                                onChange={(e) => setNewVar({ ...newVar, initialValue: e.target.value })}
                                placeholder="Initial value"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Value
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newVar.currentValue}
                                onChange={(e) => setNewVar({ ...newVar, currentValue: e.target.value })}
                                placeholder="Current value (optional)"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={!newVar.name || !newVar.initialValue}
                        className={`px-4 py-2 rounded-lg text-white ${newVar.name && newVar.initialValue ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}`}
                    >
                        Add Variable
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Variable
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Current Value
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Initial Value
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {variables.length > 0 ? (
                            variables.map((variable) => (
                                <tr key={variable.name}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {variable.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {editingVar === variable.name ? (
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                        ) : (
                                            variable.currentValue
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {variable.initialValue}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {editingVar === variable.name ? (
                                            <>
                                                <button
                                                    onClick={saveEdit}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 cursor-pointer"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingVar(null)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(variable.name, variable.currentValue)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDelete(variable.name)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No variables defined yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}