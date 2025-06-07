import { useState } from "react";
import PasswordChangeModal from "./PasswordChangeModal";
import TwoFactorModal from "./TwoFactorModal";
import ActiveSessionsModal from "./ActiveSessionsModal";

// Main Security Tab Component
export default function SecurityTab() {
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
    const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [lastPasswordChange] = useState('3 months ago');

    const handlePasswordSave = (passwordData: string) => {
        // Handle password change logic here
        console.log('Password change:', passwordData);
        setPasswordModalOpen(false);
        // You could show a success message here
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Security Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your password and authentication methods.
                </p>
            </div>

            <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Password</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Last changed {lastPasswordChange}
                            </p>
                        </div>
                        <button 
                            onClick={() => setPasswordModalOpen(true)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            Change
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-medium text-gray-800 dark:text-white">Two-factor authentication</h3>
                                {twoFactorEnabled && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Enabled
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {twoFactorEnabled 
                                    ? 'Your account is secured with 2FA' 
                                    : 'Add an extra layer of security to your account'
                                }
                            </p>
                        </div>
                        <button 
                            onClick={() => setTwoFactorModalOpen(true)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            {twoFactorEnabled ? 'Manage' : 'Enable'}
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Active sessions</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                You&apos;re logged in on 3 devices
                            </p>
                        </div>
                        <button 
                            onClick={() => setSessionsModalOpen(true)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            View all
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PasswordChangeModal 
                isOpen={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                onSave={handlePasswordSave}
            />
            
            <TwoFactorModal 
                isOpen={twoFactorModalOpen}
                onClose={() => setTwoFactorModalOpen(false)}
                isEnabled={twoFactorEnabled}
                onToggle={setTwoFactorEnabled}
            />
            
            <ActiveSessionsModal 
                isOpen={sessionsModalOpen}
                onClose={() => setSessionsModalOpen(false)}
            />
        </div>
    );
}