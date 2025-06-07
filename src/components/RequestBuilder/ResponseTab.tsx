import { ActiveResponseTab } from "@/types/Collections";

export default function ResponseTab({activeResponseTab, setActiveResponseTab}: {activeResponseTab: ActiveResponseTab, setActiveResponseTab: (value: ActiveResponseTab) => void}) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
                <button
                    className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Response' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveResponseTab('Response')}
                >
                    Response
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Headers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveResponseTab('Headers')}
                >
                    Headers
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Cookies' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveResponseTab('Cookies')}
                >
                    Cookies
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Timeline' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveResponseTab('Timeline')}
                >
                    Timeline
                </button>
            </nav>
        </div>
    );
}