// components/SettingsPage.tsx
'use client';
import React, { useState } from 'react';
import ProfileTab from '@/components/Settings/ProfileTab';
import SecurityTab from '@/components/Settings/SecurityTab';
import NotificationsTab from '@/components/Settings/NotificationsTab';
import PreferencesTab from '@/components/Settings/PreferencesTab';
import { ActiveTab } from '@/types/Collections';
import ActiveTabComponent from '@/components/Settings/ActiveTab';

/* eslint-disable @typescript-eslint/no-unused-vars */

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    const [name, setName] = useState('John Doe');
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
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
                        <ProfileTab setName={setName}/>
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
    );
}