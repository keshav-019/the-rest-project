import { ActiveTab } from "@/types/Collections";
import { BellIcon, CogIcon, LockClosedIcon, UserIcon } from "@heroicons/react/16/solid";


export default function ActiveTabComponent({activeTab, setActiveTab}: {activeTab: ActiveTab, setActiveTab: (value: React.SetStateAction<ActiveTab>) => void}) {
    return (
        <nav className="mt-6">
            <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-6 py-3 text-sm font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
                <UserIcon className="w-5 h-5 mr-3" />
                Profile
            </button>
            <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-6 py-3 text-sm font-medium ${activeTab === 'security' ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
                <LockClosedIcon className="w-5 h-5 mr-3" />
                Security
            </button>
            <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-6 py-3 text-sm font-medium ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
                <BellIcon className="w-5 h-5 mr-3" />
                Notifications
            </button>
            <button
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center w-full px-6 py-3 text-sm font-medium ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
                <CogIcon className="w-5 h-5 mr-3" />
                Preferences
            </button>
        </nav>
    );
}


