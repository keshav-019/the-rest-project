export default function TeamTiles({handleViewTeamDetails, setSelectedTeamName, setShowInviteMembersModal, setShowCreateTeamModal}: {handleViewTeamDetails: (value: string) => void, setSelectedTeamName: (value: string) => void, setShowInviteMembersModal: (value: boolean) => void, setShowCreateTeamModal: (value: boolean) => void}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Development</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Owner
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Team for developing and testing our core API services
                    </p>
                </div>
                <div className="p-5">
                    <div className="flex items-center mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Members:</span>
                        <div className="flex -space-x-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">JD</div>
                            <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">AS</div>
                            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">TK</div>
                            <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">+2</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                            onClick={() => handleViewTeamDetails('API Development')}
                        >
                            Manage
                        </button>
                        <button
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => {
                                setSelectedTeamName('API Development')
                                setShowInviteMembersModal(true)
                            }}
                        >
                            Invite
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Frontend Team</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Member
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Team responsible for frontend application development
                    </p>
                </div>
                <div className="p-5">
                    <div className="flex items-center mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Members:</span>
                        <div className="flex -space-x-2">
                            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">MJ</div>
                            <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">KL</div>
                            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">RW</div>
                            <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">+4</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                            onClick={() => handleViewTeamDetails('Frontend Team')}
                        >
                            View
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer">
                            Leave
                        </button>
                    </div>
                </div>
            </div>

            {/* Create New Team Card */}
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setShowCreateTeamModal(true)}
            >
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Create New Team</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Start collaborating with your colleagues
                </p>
            </div>
        </div>
    )
}