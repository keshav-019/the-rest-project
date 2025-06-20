// components/SettingsPage.tsx
'use client'
import React, { useEffect, useState } from 'react';
import ProfileTab from '@/components/Settings/ProfileTab';
import SecurityTab from '@/components/Settings/SecurityTab';
import NotificationsTab from '@/components/Settings/NotificationsTab';
import PreferencesTab from '@/components/Settings/PreferencesTab';
import { ActiveTab } from '@/types/Collections';
import ActiveTabComponent from '@/components/Settings/ActiveTab';
import HeaderComponent from '@/components/Common/Header';
import { Team } from '@/types/User';
import { getUserDetails, getInitials } from '@/lib/firebase/auth';
import { getUserTeams } from '@/lib/firebase/teams';

/* eslint-disable @typescript-eslint/no-unused-vars */

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    const [name, setName] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [bio, setBio] = useState<string>('');
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const {user, userData} = await getUserDetails();
            const teams = await getUserTeams(user?.uid || '');
            setEmail(user?.email || '');
            setAutoSave(userData?.autoSave || true);
            setDisplayName(user?.displayName || '');
            setUsername(user?.username || '');
            setInitials(getInitials(user?.displayName || ''));
            setName(user?.displayName || '');
            setTeams(teams);
            setBio(userData?.bio || '');
        }
        fetchUserData();
    });

    // Add this handler for exiting team mode
    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        localStorage.removeItem('activeEnvironmentId');

        // Refresh the page to reset all states
        window.location.reload();
    };

    // Add this handler for team selection
    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        localStorage.setItem('teamMode', JSON.stringify(team));
        setShowTeamsDropdown(false);
        localStorage.removeItem('activeEnvironmentId');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header at the top */}
            <HeaderComponent 
                toSearch={false} 
                parentComponent={'Settings'} 
                onAddCollection={() => {}} 
                environments={[]}
                autoSave={autoSave}
                displayName={displayName}
                email={email}
                initials={initials}
                setAutoSave={setAutoSave}
                username={username}
                teams={teams}
                activeEnvironmentId={''}
                onEnvironmentSelect={() => {}}
                onExitTeamMode={handleExitTeamMode}
                onTeamSelect={handleTeamSelect}
                setShowTeams={setShowTeamsDropdown}
                showTeams={showTeamsDropdown}
                teamMode={teamMode}
            />
            
            {/* Main content area with sidebar and content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h1>
                    </div>
                    <ActiveTabComponent activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <ProfileTab setName={setName} bio={bio} email={email} name={name} setBio={setBio} setEmail={setEmail} setLocalName={setName} />
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <SecurityTab />
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <NotificationsTab notifications={notifications} setNotifications={setNotifications} />
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <PreferencesTab darkMode={darkMode} setDarkMode={setDarkMode} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}