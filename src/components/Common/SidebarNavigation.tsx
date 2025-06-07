import Sidebar from "./Sidebar";

export const SidebarNavigation = () => {
    return (
        <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">API Nexus</h1>
            </div>
            <Sidebar activeTab="/" />
        </div>
    );
};