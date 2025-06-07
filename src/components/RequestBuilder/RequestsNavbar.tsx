import { TabType } from "@/types/Collections";

export default function RequestsNavBar({activeRequestTab, setActiveRequestTab}: {activeRequestTab: string, setActiveRequestTab: (value: TabType) => void}) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
                <button
                    className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Params' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveRequestTab('Params')}
                >
                    Params
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Headers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveRequestTab('Headers')}
                >
                    Headers
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Body' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveRequestTab('Body')}
                >
                    Body
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Auth' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveRequestTab('Auth')}
                >
                    Auth
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Pre-request' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveRequestTab('Pre-request')}
                >
                    Pre-request
                </button>
                <button
                    className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Tests' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                    onClick={() => setActiveRequestTab('Tests')}
                >
                    Tests
                </button>
            </nav>
        </div>
    );
}