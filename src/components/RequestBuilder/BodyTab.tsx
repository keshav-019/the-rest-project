



export default function BodyTab({body, setBody}: {body: string, setBody: (value: React.SetStateAction<string>) => void}) {
    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-medium">
                    raw
                </button>
                <button className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md text-sm font-medium">
                    form-data
                </button>
                <button className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md text-sm font-medium">
                    x-www-form-urlencoded
                </button>
            </div>
            <div className="relative">
                <select className="absolute top-2 right-2 z-10 h-8 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>JSON</option>
                    <option>Text</option>
                    <option>JavaScript</option>
                    <option>HTML</option>
                    <option>XML</option>
                </select>
                <textarea
                    className="w-full h-64 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    spellCheck="false"
                />
            </div>
        </div>
    )
}