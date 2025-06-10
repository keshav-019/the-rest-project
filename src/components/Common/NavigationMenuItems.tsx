import { MenuItem } from "@headlessui/react";

export default function NavigationMenuItems({menuItems}: {menuItems: { href: string; icon: React.JSX.Element; label: string; }[]}) {
    return (
        <div className="py-1">
            {menuItems.map((item, index) => (
                <MenuItem key={index}>
                    <a
                        href={item.href}
                        className="group flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700"
                    >
                        <span className="mr-3 w-5 h-5 text-gray-400 dark:text-gray-500">
                            {item.icon}
                        </span>
                        {item.label}
                    </a>
                </MenuItem>
            ))}
        </div>
    );
}



