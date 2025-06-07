


export default function PreferencesTab({setDarkMode, darkMode} : {setDarkMode: (value: React.SetStateAction<boolean>) => void, darkMode: boolean}) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Application Preferences</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Customize your application experience.
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Dark mode</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Switch between light and dark theme
                        </p>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">Language</h3>
                    <div className="mt-2">
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            defaultValue="en"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">Time zone</h3>
                    <div className="mt-2">
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            defaultValue="UTC"
                        >
                            <option value="UTC">UTC</option>
                            <option value="EST">Eastern Time (EST)</option>
                            <option value="PST">Pacific Time (PST)</option>
                            <option value="CET">Central European Time (CET)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}



