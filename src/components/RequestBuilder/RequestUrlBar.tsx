import { RequestType } from "@/types/Collections";

export default function RequestURLBar({method, setMethod, url, setUrl, handleSendRequest, isLoading, setIsStarred, isStarred, handleShareRequest}: {method: string, setMethod: (value: RequestType) => void, url: string, setUrl: (value: string) => void, handleSendRequest: () => void, isLoading: boolean | undefined, setIsStarred: (value:boolean) => void, isStarred: boolean | undefined, handleShareRequest: () => void}) {
    return (
        <>        
            {/* Request URL Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="w-28">
                        <select 
                        className="w-full h-10 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        value={method}
                        onChange={(e) => setMethod(e.target.value as RequestType)}
                        >
                        <option className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">GET</option>
                        <option className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">POST</option>
                        <option className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">PUT</option>
                        <option className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">PATCH</option>
                        <option className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">DELETE</option>
                        <option className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">HEAD</option>
                        <option className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">OPTIONS</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <input 
                        type="text" 
                        placeholder="Enter request URL" 
                        className="w-full h-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        className="h-10 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                        onClick={handleSendRequest}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                    <button 
                        className="h-10 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                        onClick={() => setIsStarred(!isStarred)}
                    >
                        <svg 
                        className="w-5 h-5" 
                        fill={isStarred ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                    </button>
                    <button 
                        className="h-10 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                        onClick={handleShareRequest}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}