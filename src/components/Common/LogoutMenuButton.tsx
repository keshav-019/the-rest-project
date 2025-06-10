import { MenuItem } from "@headlessui/react";
import { LogoutIcon } from "./Icons";


export default function LogoutMenuButton({ handleLogout }: { handleLogout: () => void }) {
    return (
        <div className="py-1">
            <MenuItem>
                {() => (
                    <button
                        onClick={handleLogout}
                        className="group flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-200 cursor-pointer"
                    >
                        <span className="mr-3 w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-red-500">
                            <LogoutIcon />
                        </span>
                        Logout
                    </button>
                )}
            </MenuItem>
        </div>
    );
}


