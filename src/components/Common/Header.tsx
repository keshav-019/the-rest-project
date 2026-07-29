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
    photoURL: string;
    terminalProps?: {
        onNewLocalTerminal: () => void;
        currentTheme: string;
        onChangeTheme: (theme: string) => void;
        themes: string[];
    };
}

const HeaderComponent = ({ toSearch, parentComponent, onAddCollection, environments, initials, username, email, displayName, autoSave, setAutoSave, teamMode, teams, onTeamSelect, onExitTeamMode, showTeams, setShowTeams, activeEnvironmentId, onEnvironmentSelect, terminalProps, photoURL }: HeaderProps) => {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-5 shadow-sm shadow-slate-950/[0.03] backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
            <div className="flex min-w-0 flex-1 items-center gap-6">
                <div className="w-[220px] shrink-0">
                    <LogoDisplay />
                </div>

                {toSearch &&
                    (
                        <div className="min-w-[220px] max-w-2xl flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={parentComponent === 'Environment' ? "Search environments..." : "Search collections..."}
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:bg-gray-900"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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

            <div className="flex shrink-0 items-center gap-3">
                {parentComponent === 'Collections' &&
                    <button
                        className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-950/10 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-950/10 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Monitor className="h-5 w-5 mr-2" />
                            <span>New Terminal</span>
                        </button>

                        <div className="relative">
                            <select
                                value={terminalProps.currentTheme}
                                onChange={(e) => terminalProps.onChangeTheme(e.target.value)}
                                className="h-10 appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
                    photoURL={photoURL}
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
