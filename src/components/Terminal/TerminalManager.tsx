// components/Terminal/TerminalManager.tsx
'use client'
import { useState, useEffect } from 'react';
import { Monitor, Server, X } from 'lucide-react';
import TerminalTab from './TerminalTab';
import ConnectionModal from './ConnectionModal';
import HeaderComponent from '../Common/Header';
import { TerminalConnection } from '@/types/Terminal';
import { themes } from './terminalThemes';
import WelcomeScreen from './WelcomeScreenComponent';
import { getInitials, getUserDetails } from '@/lib/firebase/auth';
import { getUserTeams } from '@/lib/firebase/teams';
import { Team } from '@/types/User';
import { useUserData } from '@/hooks/useUserData';

export default function TerminalManager() {
    const [activeTab, setActiveTab] = useState<string>('welcome');
    const [tabs, setTabs] = useState<{ id: string, type: 'local' | 'ssh', connection?: TerminalConnection }[]>([
        { id: 'welcome', type: 'local' }
    ]);
    const { userData, teamId } = useUserData();
    const [connections, setConnections] = useState<TerminalConnection[]>([]);
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<TerminalConnection | null>(null);
    const [currentTheme, setCurrentTheme] = useState<string>('Ubuntu');
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [photoURL, setPhotoURL] = useState<string>('');
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
    const [displayName, setDisplayName] = useState<string>('');

    // Initialize environments from userData
    useEffect(() => {
        const fetchUserData = async () => {
            const { user, userData } = await getUserDetails();
            const teams = await getUserTeams(user?.uid || '');
            setEmail(user?.email || '');
            setAutoSave(userData?.autoSave || true);
            setDisplayName(user?.displayName || '');
            setUsername(user?.username || '');
            setInitials(getInitials(user?.displayName || ''));
            setPhotoURL(user?.photoURL || '');
            setTeams(teams);
        }
        fetchUserData();
    }, [userData, teamId]);

    // Load saved connections and theme from localStorage
    useEffect(() => {
        const savedConnections = localStorage.getItem('ssh-connections');
        const savedTheme = localStorage.getItem('terminal-theme');

        if (savedConnections) {
            try {
                setConnections(JSON.parse(savedConnections));
            } catch (e) {
                console.error('Failed to parse saved connections', e);
            }
        }

        if (savedTheme && themes[savedTheme as keyof typeof themes]) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    // Save connections and theme to localStorage
    useEffect(() => {
        localStorage.setItem('ssh-connections', JSON.stringify(connections));
        localStorage.setItem('terminal-theme', currentTheme);
    }, [connections, currentTheme]);

    const addNewTab = (type: 'local' | 'ssh', connection?: TerminalConnection) => {
        const id = `${type}-${Date.now()}`;
        setTabs([...tabs, { id, type, connection }]);
        setActiveTab(id);
    };

    const closeTab = (id: string) => {
        if (id === 'welcome') return;
        const newTabs = tabs.filter(tab => tab.id !== id);
        setTabs(newTabs);

        if (activeTab === id) {
            setActiveTab('welcome');
        }
    };

    const addConnection = (connection: TerminalConnection) => {
        const newConnections = [...connections, connection];
        setConnections(newConnections);
        setShowConnectionModal(false);
    };

    const updateConnection = (updatedConnection: TerminalConnection) => {
        setConnections(connections.map(conn =>
            conn.id === updatedConnection.id ? updatedConnection : conn
        ));
        setShowConnectionModal(false);
    };

    const changeTheme = (theme: string) => {
        setCurrentTheme(theme);
        if (window.electronAPI) {
            window.electronAPI.changeTheme(theme);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-gray-900">
            <HeaderComponent
                parentComponent={"Dashboard"}
                toSearch={false}
                onAddCollection={() => { }}
                environments={[]}
                autoSave={autoSave}
                displayName={displayName}
                email={email}
                initials={initials}
                setAutoSave={setAutoSave}
                username={username}
                teams={teams}
                activeEnvironmentId={''}
                onEnvironmentSelect={() => { }}
                onExitTeamMode={() => { }}
                onTeamSelect={() => { }}
                setShowTeams={setShowTeamsDropdown}
                showTeams={showTeamsDropdown}
                teamMode={teamMode}
                photoURL={photoURL}
            />

            {/* Tab bar */}
            <div className="border-b border-slate-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 px-3 py-2 backdrop-blur">
                <div className="flex overflow-x-auto flex-1 gap-2">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`group flex items-center min-w-[180px] max-w-[280px] px-3 py-2 rounded-xl border cursor-pointer transition-all ${activeTab === tab.id
                                ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm dark:bg-blue-900/20 dark:border-blue-700/40 dark:text-blue-100'
                                : 'bg-slate-100/70 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.type === 'local' ?
                                (
                                    <Monitor className={`h-4 w-4 mr-2 shrink-0 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-gray-300'}`} />
                                ) : (
                                    <Server className={`h-4 w-4 mr-2 shrink-0 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-gray-300'}`} />
                                )}
                            <span className="text-sm font-medium truncate">
                                {tab.id === 'welcome' ? 'Welcome' :
                                    tab.type === 'local' ? 'Local Terminal' :
                                        tab.connection?.name || 'SSH Connection'}
                            </span>
                            {tab.id !== 'welcome' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                    }}
                                    className={`ml-2 shrink-0 rounded-md p-1 transition-colors ${activeTab === tab.id
                                        ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40'
                                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Terminal content */}
            <div className="flex-1 overflow-hidden">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`h-full w-full ${activeTab === tab.id ? 'block' : 'hidden'}`}
                    >
                        {tab.id === 'welcome' ?
                            (
                                <WelcomeScreen
                                    connections={connections}
                                    onAddConnection={() => {
                                        setSelectedConnection(null);
                                        setShowConnectionModal(true);
                                    }}
                                    onConnectionClick={(conn) => addNewTab('ssh', conn)}
                                    onLocalTerminalClick={() => addNewTab('local')}
                                />
                            ) : (
                                <TerminalTab
                                    type={tab.type}
                                    connection={tab.connection}
                                    currentTheme={currentTheme}
                                    onChangeTheme={changeTheme}
                                    themes={Object.keys(themes)}
                                // isActive={activeTab === tab.id}
                                />
                            )}
                    </div>
                ))}
            </div>

            <ConnectionModal
                isOpen={showConnectionModal}
                onClose={() => setShowConnectionModal(false)}
                onSubmit={selectedConnection ? updateConnection : addConnection} // [cite: 118]
                connection={selectedConnection}
            />
        </div>
    );
}
