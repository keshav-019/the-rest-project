



export default function NotificationsTab({setNotifications, notifications}: {setNotifications: (value: React.SetStateAction<boolean>) => void, notifications: boolean}) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Notification Preferences</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure how you receive notifications.
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">Email notifications</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Receive updates via email
                        </p>
                    </div>
                    <button
                        onClick={() => setNotifications(!notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">Notification types</h3>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="comments"
                                    name="comments"
                                    type="checkbox"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    defaultChecked
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="comments" className="font-medium text-gray-700 dark:text-gray-300">
                                    New requests
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Get notified when new requests are added
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="candidates"
                                    name="candidates"
                                    type="checkbox"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    defaultChecked
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="candidates" className="font-medium text-gray-700 dark:text-gray-300">
                                    Response errors
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Get notified when requests fail
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="offers"
                                    name="offers"
                                    type="checkbox"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    defaultChecked
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="offers" className="font-medium text-gray-700 dark:text-gray-300">
                                    Team updates
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Get notified when team members make changes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}





