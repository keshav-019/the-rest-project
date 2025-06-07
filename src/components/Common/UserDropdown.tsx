// components/UserDropdown.tsx
'use client';
import React, { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
    DashboardIcon,
    CollectionsIcon,
    RequestBuilderIcon,
    EnvironmentsIcon,
    TeamIcon,
    SettingsIcon,
    LogoutIcon,
    CheckIcon,
    CogIcon
} from './Icons';

const UserDropdown = ({ initials, email, username, displayName }: { initials: string, email: string, username: string, displayName: string }) => {
    const [autoSave, setAutoSave] = useState(true);
    
    const menuItems = [
        { href: "/", icon: <DashboardIcon />, label: "Dashboard" },
        { href: "/collections", icon: <CollectionsIcon />, label: "Collections" },
        { href: "/", icon: <RequestBuilderIcon />, label: "Request Builder" },
        { href: "/environments", icon: <EnvironmentsIcon />, label: "Environments" },
        { href: "/teams", icon: <TeamIcon />, label: "Team" },
        { href: "/settings", icon: <SettingsIcon />, label: "Settings" },
    ];

    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logout clicked');
    };

    return (
        <Menu as="div" className="relative">
            <MenuButton className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                {initials}
            </MenuButton>

            <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <MenuItems className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200 dark:border-gray-700">
                    
                    {/* User Profile Section */}
                    <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-t-lg">
                        <div className="flex items-center space-x-3">
                            {/* User Avatar/Initials */}
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                {initials}
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {displayName || 'Unknown User'}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                    @{username || 'no-username'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu Items */}
                    <div className="py-1">
                        {menuItems.map((item, index) => (
                            <MenuItem key={index}>
                                {({ active }) => (
                                    <a
                                        href={item.href}
                                        className={`${
                                            active 
                                                ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                                                : 'text-gray-700 dark:text-gray-200'
                                        } group flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-gray-700`}
                                    >
                                        <span className={`mr-3 w-5 h-5 ${
                                            active 
                                                ? 'text-blue-600 dark:text-blue-400' 
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </a>
                                )}
                            </MenuItem>
                        ))}
                    </div>

                    {/* Settings Section */}
                    <div className="py-1">
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => setAutoSave(!autoSave)}
                                    className={`${
                                        active 
                                            ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                                            : 'text-gray-700 dark:text-gray-200'
                                    } group flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-gray-700`}
                                >
                                    <div className="flex items-center">
                                        <span className={`mr-3 w-5 h-5 ${
                                            active 
                                                ? 'text-blue-600 dark:text-blue-400' 
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                            <CogIcon />
                                        </span>
                                        Auto Save
                                    </div>
                                    <div className={`w-4 h-4 flex items-center justify-center ${
                                        autoSave 
                                            ? 'text-green-500' 
                                            : 'text-transparent'
                                    }`}>
                                        <CheckIcon />
                                    </div>
                                </button>
                            )}
                        </MenuItem>
                    </div>

                    {/* Logout Section */}
                    <div className="py-1">
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    className={`${
                                        active 
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                                            : 'text-gray-700 dark:text-gray-200'
                                    } group flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400`}
                                >
                                    <span className={`mr-3 w-5 h-5 ${
                                        active 
                                            ? 'text-red-600 dark:text-red-400' 
                                            : 'text-gray-400 dark:text-gray-500'
                                    } group-hover:text-red-500`}>
                                        <LogoutIcon />
                                    </span>
                                    Logout
                                </button>
                            )}
                        </MenuItem>
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
    );
};

export default UserDropdown;