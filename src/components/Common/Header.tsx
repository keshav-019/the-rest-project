// components/Header.tsx
'use client';
import React, { useEffect, useState } from 'react';
import LogoDisplay from './LogoDisplay';
import UserDropdown from './UserDropdown';
import { PlusIcon, SearchIcon } from './Icons';
import { getInitials } from '@/lib/firebase/auth';
import { User } from '@/types/User';

interface HeaderProps {
    onAddCollection: (value: string) => void,
    toSearch: boolean,
    parentComponent: string
}

const Header = ({ toSearch, parentComponent, onAddCollection }: HeaderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [initials, setInitials] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setUser(userData);
        console.log("The user value is: ", user); // Still null (old state)
        console.log("The parsed user data is: ", userData); // This will show the actual data
        
        // Use userData directly instead of user
        setInitials(getInitials(userData?.displayName));
        setEmail(userData?.email || '');
        setUsername(userData?.username || '');
        setDisplayName(userData?.displayName || '');
    }, []);

    return (
        <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex items-center space-x-8 w-full">
                <div className="w-50"> {/* Matches CollectionsTree width */}
                    <LogoDisplay />
                </div>

                {toSearch && 
                    (
                        <div className="flex-1 max-w-2xl mx-4"> {/* Centered search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={parentComponent === 'Environment' ? "Search environments..." : "Search collections..."}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <SearchIcon />
                                </div>
                            </div>
                        </div>
                    )
                }
                {!toSearch &&
                    (
                        <div></div>
                    )
                }
            </div>

            <div className="flex items-center space-x-4">
                {parentComponent === 'Collections' &&
                    <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer flex items-center w-48"
                        onClick={(e) => {
                            e.preventDefault();
                            onAddCollection('New Collection');
                        }}
                    >
                        <PlusIcon />
                        <span className="ml-2">New Collection</span>
                    </button>
                }

                <UserDropdown username={username} displayName={displayName} email={email} initials={initials} />
            </div>
        </header>
    );
};

export default Header;