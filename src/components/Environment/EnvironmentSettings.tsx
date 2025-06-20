'use client'
import { Environment } from '@/types/User'

interface EnvironmentSettingsProps {
    editForm: Partial<Environment>
    colorOptions: { name: string; value: string }[]
    onEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onColorSelect: (color: string) => void
    onSave: () => void
    onCancel: () => void
}

export default function EnvironmentSettings({
    editForm,
    colorOptions,
    onEditChange,
    onColorSelect,
    onSave,
    onCancel
}: EnvironmentSettingsProps) {
    return (
        <div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Environment Name *
                        </label>
                        <input title='editchange'
                            type="text"
                            name="name"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editForm.name || ''}
                            onChange={onEditChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea title='description'
                            name="description"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={editForm.description || ''}
                            onChange={onEditChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Color
                        </label>
                        <div className="flex items-center space-x-2">
                            {colorOptions.map((color) => (
                                <div
                                    key={color.value}
                                    onClick={() => onColorSelect(color.value)}
                                    className={`w-8 h-8 rounded-full cursor-pointer ${editForm.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isShared"
                            name="isShared"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            checked={editForm.isShared || false}
                            onChange={(e) => onEditChange(e)}
                        />
                        <label htmlFor="isShared" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            Share with team
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={!editForm.name}
                            className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${editForm.name ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'}`}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}