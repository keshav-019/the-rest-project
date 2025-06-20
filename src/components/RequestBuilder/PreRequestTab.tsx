'use client'
export default function PreRequestTab({preRequestScript, setPreRequestScript}: {preRequestScript: string, setPreRequestScript: (value: string) => void}) {
    return (
        <div className="space-y-4">
            <div className="relative">
                <select title='languageselect' className="absolute top-2 right-2 z-10 h-8 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>JavaScript</option>
                    <option>Python</option>
                </select>
                <textarea title="setprerequestscript"
                    className="w-full h-64 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={preRequestScript}
                    onChange={(e) => setPreRequestScript(e.target.value)}
                    spellCheck="false"
                />
            </div>
        </div>
    );
}