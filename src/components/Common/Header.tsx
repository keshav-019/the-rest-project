// components/Header.tsx
'use client'
import React from 'react';
import LogoDisplay from './LogoDisplay';
import UserDropdown from './UserDropdown';
import { PlusIcon, SearchIcon } from './Icons';
import { Environment, Team } from '@/types/User';
import EnvironmentSelector from '../Environment/EnvironmentSelector';
import { Monitor } from 'lucide-react';

interface HeaderProps {
    onAddCollection: (value: string) => void,
    toSearch: boolean,
    parentComponent: string,
    environments: Environment[] | undefined,
    initials: string,
    username: string,
    email: string,
    displayName: string,
    autoSave: boolean,
    setAutoSave: (value: boolean) => void,
    teamMode: Team | null,
    teams: Team[],
    onTeamSelect: (team: Team | null) => void;
    onExitTeamMode: () => void;
    showTeams: boolean;
    setShowTeams: (value: boolean) => void;
    activeEnvironmentId: string | null;
    onEnvironmentSelect: (environmentId: string) => void;
    terminalProps?: {
        onNewLocalTerminal: () => void;
        currentTheme: string;
        onChangeTheme: (theme: string) => void;
        themes: string[];
    };
}

const HeaderComponent = ({ toSearch, parentComponent, onAddCollection, environments, initials, username, email, displayName, autoSave, setAutoSave, teamMode, teams, onTeamSelect, onExitTeamMode, showTeams, setShowTeams, activeEnvironmentId, onEnvironmentSelect, terminalProps }: HeaderProps) => {
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

                {parentComponent === 'Request Builder' &&
                    <EnvironmentSelector
                        environments={environments}
                        activeEnvironmentId={activeEnvironmentId}
                        onEnvironmentSelect={onEnvironmentSelect}
                        disabled={!environments || environments.length === 0}
                    />
                }

                {terminalProps && parentComponent === 'Terminal' && (
                    <>
                        <button
                            onClick={terminalProps.onNewLocalTerminal}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                        >
                            <Monitor className="h-5 w-5 mr-2" />
                            <span>New Terminal</span>
                        </button>

                        <div className="relative">
                            <select
                                value={terminalProps.currentTheme}
                                onChange={(e) => terminalProps.onChangeTheme(e.target.value)}
                                className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {terminalProps.themes.map(theme => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </>
                )}

                <UserDropdown
                    username={username}
                    displayName={displayName}
                    email={email}
                    initials={initials}
                    teams={teams}
                    autoSave={autoSave}
                    setAutoSave={setAutoSave}
                    teamMode={teamMode}
                    onExitTeamMode={onExitTeamMode}
                    setTeamMode={onTeamSelect}
                    setShowTeams={setShowTeams}
                    showTeams={showTeams}
                />
            </div>
        </header>
    );
};

export default HeaderComponent;