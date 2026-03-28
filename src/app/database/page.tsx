'use client'
import { Suspense, useEffect, useState } from 'react';
import { DatabaseSidebar } from '@/components/Database/DatabaseSidebar';
import { MainContent } from '@/components/Database/MainContent';
import { StatusBar } from '@/components/Database/StatusBar';
import { ThemeProvider } from '@/components/Database/ThemeProvider';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useConnections } from '@/hooks/useConnections';
import HeaderComponent from '@/components/Common/Header';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { ConnectionDialog } from '@/components/Database/ConnectionDialog';
import { WindowTab } from '@/types/Connection';
import { getCurrentUser, getInitials, getUserDetails } from '@/lib/firebase/auth';
import { Team } from '@/types/User';
import { getUserTeams } from '@/lib/firebase/teams';

const DatabaseScreen = () => {
    const { connections, loading, refreshConnections } = useConnections();
    const [openTabs, setOpenTabs] = useState<WindowTab[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState({ isOpen: false, database: '', connection: '' });
    const [showDependencyGraph, setShowDependencyGraph] = useState({ isOpen: false, database: '', connection: '' });
    const [showConnectionDialog, setShowConnectionDialog] = useState(false);
    const [username, setUsername] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [initials, setInitials] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [autoSave, setAutoSave] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            const currentUser = getCurrentUser();
            setUsername(currentUser?.username || '')
            const [teams, userDetails] = await Promise.all([
                getUserTeams(currentUser?.uid || ''),
                getUserDetails()
            ]);
            setTeams(teams);
            setInitials(getInitials(currentUser?.displayName));
            setEmail(currentUser?.email || '');
            setDisplayName(currentUser?.displayName || '');
            setAutoSave(userDetails.userData?.autoSave || true);
            setPhotoURL(currentUser?.photoURL || '');
        };

        loadData();
    }, [])

    const handleOpenTab = (tab: WindowTab) => {
        const existingTab = openTabs.find(t => t.id === tab.id);
        if (!existingTab) {
            setOpenTabs(prev => [...prev, tab]);
        }
        setActiveTab(tab.id);
    };

    const handleCloseTab = (tabId: string) => {
        setOpenTabs(prev => prev.filter(tab => tab.id !== tabId));
        if (activeTab === tabId) {
            const remainingTabs = openTabs.filter(tab => tab.id !== tabId);
            setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null);
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    const handleShowDetails = (database: string, connection: string) => {
        setShowDetails({ isOpen: true, database, connection });
    };

    const handleShowDependencyGraph = (database: string, connection: string) => {
        setShowDependencyGraph({ isOpen: true, database, connection });
    };

    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        if (team) {
            localStorage.setItem('teamMode', JSON.stringify(team));
        } else {
            localStorage.removeItem('teamMode');
        }
        setShowTeamsDropdown(false);
        localStorage.removeItem('activeEnvironmentId');
    };

    // Add this handler for exiting team mode
    const handleExitTeamMode = () => {
        console.log("The function handle Exit Team Mode called");
        setTeamMode(null);
        localStorage.removeItem('teamMode');

        // Reset environment when exiting team mode
        localStorage.removeItem('activeEnvironmentId');

        // Refresh the page to reset all states
        window.location.reload();
    };

    return (
        <ThemeProvider>
            <ErrorBoundary fallback={<div className="p-4 text-red-500">Database interface crashed. Please refresh.</div>}>
                <div className="h-screen flex flex-col bg-gray-900 text-gray-100 w-full">
                    <HeaderComponent
                        toSearch={false}
                        parentComponent={'Request Builder'}
                        onAddCollection={() => { }}
                        environments={[]}
                        initials={initials}
                        username={username}
                        email={email}
                        displayName={displayName}
                        teams={teams}
                        autoSave={autoSave}
                        setAutoSave={setAutoSave}
                        teamMode={teamMode}
                        onTeamSelect={handleTeamSelect}
                        onExitTeamMode={handleExitTeamMode}
                        showTeams={showTeamsDropdown}
                        setShowTeams={setShowTeamsDropdown}
                        activeEnvironmentId={''}
                        onEnvironmentSelect={() => {}}
                        photoURL={photoURL}
                    />
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
                            <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-gray-800 min-h-0">
                                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                                    <DatabaseSidebar
                                        connections={connections}
                                        loading={loading}
                                        onOpenTab={handleOpenTab}
                                        onShowDetails={handleShowDetails}
                                        onShowDependencyGraph={handleShowDependencyGraph}
                                        refreshConnections={refreshConnections}
                                        setShowConnectionDialog={setShowConnectionDialog}
                                        showConnectionDialog={showConnectionDialog}
                                    />
                                </Suspense>
                            </ResizablePanel>
                            <ResizableHandle withHandle className="bg-gray-700 hover:bg-gray-600" />
                            <ResizablePanel defaultSize={75} className="bg-gray-900 min-h-0">
                                <MainContent
                                    activeTab={activeTab}
                                    openTabs={openTabs}
                                    onTabChange={handleTabChange}
                                    onCloseTab={handleCloseTab}
                                    showDetails={showDetails}
                                    onCloseDetails={() => setShowDetails({ isOpen: false, database: '', connection: '' })}
                                    showDependencyGraph={showDependencyGraph}
                                    onCloseDependencyGraph={() => setShowDependencyGraph({ isOpen: false, database: '', connection: '' })}
                                    setShowConnectionDialog={setShowConnectionDialog}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <StatusBar />
                </div>
                {/* Add this ConnectionDialog component */}
                <ConnectionDialog
                    isOpen={showConnectionDialog}
                    onClose={() => setShowConnectionDialog(false)}
                    onConnectionCreated={() => {
                        refreshConnections();
                        setShowConnectionDialog(false);
                    }}
                />
            </ErrorBoundary>
        </ThemeProvider>
    );
};

export default DatabaseScreen;