// Updated UserDropdown.tsx with team dropdown and scrollable section
'use client'
import React, { useState } from 'react';
import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react';
import {
    DashboardIcon,
    CollectionsIcon,
    RequestBuilderIcon,
    EnvironmentsIcon,
    TeamIcon,
    SettingsIcon
} from './Icons';
import { useRouter } from 'next/navigation';
import { Team } from '@/types/User';
import UserProfile from './UserProfile';
import TeamsDropdown from './TeamsDropdown';
import AutoSaveMenuButton from './AutoSave';
import LogoutMenuButton from './LogoutMenuButton';
import NavigationMenuItems from './NavigationMenuItems';

export interface UserDropdownProps {
    initials: string,
    email: string,
    username: string,
    displayName: string,
    autoSave: boolean,
    setAutoSave: (value: boolean) => void,
    teams?: Team[]
}

const UserDropdown = ({ initials, email, username, displayName, autoSave, setAutoSave, teams }: UserDropdownProps) => {
    const [showTeams, setShowTeams] = useState(false);
    const router = useRouter();

    const menuItems = [
        { href: "/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
        { href: "/collections", icon: <CollectionsIcon />, label: "Collections" },
        { href: "/", icon: <RequestBuilderIcon />, label: "Request Builder" },
        { href: "/environments", icon: <EnvironmentsIcon />, label: "Environments" },
        { href: "/teams", icon: <TeamIcon />, label: "Team" },
        { href: "/settings", icon: <SettingsIcon />, label: "Settings" },
    ];

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        router.push('/login');
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
                    <UserProfile displayName={displayName} email={email} initials={initials} username={username} />

                    {/* Navigation Menu Items */}
                    <NavigationMenuItems menuItems={menuItems} />

                    {/* Teams Dropdown */}
                    {teams &&
                        <TeamsDropdown setShowTeams={setShowTeams} showTeams={showTeams} teams={teams} />
                    }

                    {/* Settings Section */}
                    <AutoSaveMenuButton autoSave={autoSave} setAutoSave={setAutoSave} />

                    {/* Logout Section */}
                    <LogoutMenuButton handleLogout={handleLogout} />
                </MenuItems>
            </Transition>
        </Menu>
    );
};

export default UserDropdown;