// Updated UserDropdown.tsx with team dropdown and scrollable section
'use client'
import React, { useEffect } from 'react';
import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react';
import {
    DashboardIcon,
    CollectionsIcon,
    RequestBuilderIcon,
    EnvironmentsIcon,
    TeamIcon,
    SettingsIcon} from './Icons';
import { useRouter } from 'next/navigation';
import { Team } from '@/types/User';
import UserProfile from './UserProfile';
import TeamsDropdown from './TeamsDropdown';
import AutoSaveMenuButton from './AutoSave';
import LogoutMenuButton from './LogoutMenuButton';
import NavigationMenuItems from './NavigationMenuItems';
import { Database, TerminalIcon } from 'lucide-react';

export interface UserDropdownProps {
    initials: string,
    email: string,
    username: string,
    displayName: string,
    autoSave: boolean,
    setAutoSave: (value: boolean) => void,
    teamMode: Team | null,
    setTeamMode: (value: Team | null) => void,
    onExitTeamMode: () => void,
    showTeams: boolean,
    setShowTeams: (value: boolean) => void,
    teams?: Team[],
    photoURL?: string
}

const UserDropdown = ({ initials, email, username, displayName, autoSave, setAutoSave, teamMode, setTeamMode, onExitTeamMode, showTeams, setShowTeams, teams, photoURL }: UserDropdownProps) => {
    const router = useRouter();

    const menuItems = [
        { href: "/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
        { href: "/collections", icon: <CollectionsIcon />, label: "Collections" },
        { href: "/", icon: <RequestBuilderIcon />, label: "Request Builder" },
        { href: "/environments", icon: <EnvironmentsIcon />, label: "Environments" },
        { href: "/teams", icon: <TeamIcon />, label: "Team" },
        { href: "/database", icon: <Database />, label: "Data Pro"},
        { href: "/terminal", icon: <TerminalIcon />, label: "SSH Manager"},
        { href: "/settings", icon: <SettingsIcon />, label: "Settings" },
    ];

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        router.push('/login');
    };

    const handleEnterTeamMode = (team: Team) => {
        setTeamMode(team);
        // Store team mode in localStorage
        localStorage.setItem('teamMode', JSON.stringify(team));
    };

    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        router.refresh(); // Refresh the page to reset to personal mode
    };

    // Check for team mode on initial load
    useEffect(() => {
        const savedTeamMode = localStorage.getItem('teamMode');
        if (savedTeamMode) {
            setTeamMode(JSON.parse(savedTeamMode));
        }
    }, []);

    return (
        <Menu as="div" className="relative">
            <MenuButton className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                {photoURL && photoURL !== '' ? (
                    <img
                        src={photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{initials}</span>
                )}

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
                    <UserProfile displayName={displayName} email={email} initials={initials} username={username} photoURL={photoURL} />

                    {/* Navigation Menu Items */}
                    <NavigationMenuItems menuItems={menuItems} />

                    {/* Teams Dropdown */}
                    {teams && !teamMode && (
                        <TeamsDropdown
                            setShowTeams={setShowTeams}
                            showTeams={showTeams}
                            teams={teams}
                            onTeamSelect={handleEnterTeamMode}
                            currentTeam={teamMode}
                            onExitTeamMode={onExitTeamMode}
                        />
                    )}

                    {/* Settings Section */}
                    <AutoSaveMenuButton autoSave={autoSave} setAutoSave={setAutoSave} />

                    {/* Logout/Exit Team Mode Section */}
                    {teamMode ? (
                        <button
                            onClick={handleExitTeamMode}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Exit Team Mode
                        </button>
                    ) : (
                        <LogoutMenuButton handleLogout={handleLogout} />
                    )}
                </MenuItems>
            </Transition>
        </Menu>
    );
};

export default UserDropdown;