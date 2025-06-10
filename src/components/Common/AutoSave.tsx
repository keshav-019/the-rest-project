import { MenuItem } from "@headlessui/react";
import { CogIcon, CheckIcon } from "./Icons";


export default function AutoSaveMenuButton({autoSave, setAutoSave}: {autoSave: boolean, setAutoSave: (value: boolean) => void}) {
    return (
        <div className="py-1">
            <MenuItem>
                {() => (
                    <button
                        onClick={() => setAutoSave(!autoSave)}
                        className="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
                    >
                        <div className="flex items-center">
                            <span className="mr-3 w-5 h-5 text-gray-400 dark:text-gray-500">
                                <CogIcon />
                            </span>
                            Auto Save
                        </div>
                        <div className={`w-4 h-4 flex items-center justify-center ${autoSave ? 'text-green-500' : 'text-transparent'}`}>
                            <CheckIcon />
                        </div>
                    </button>
                )}
            </MenuItem>
        </div>
    );
}