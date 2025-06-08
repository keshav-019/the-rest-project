import { InviteTabTeam } from "@/types/Collections";

export default function TeamsHeader({setActiveTab, activeTab}: {setActiveTab: React.Dispatch<React.SetStateAction<InviteTabTeam>>, activeTab: InviteTabTeam}) {
    const teamsList:{tabname: string, activeTabIdentifier: InviteTabTeam}[] = [
        {tabname: 'My Teams', activeTabIdentifier: 'myTeams'},
        {tabname: 'Invitations', activeTabIdentifier: 'invitations'}
    ]

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="px-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-4">
                    {teamsList.map((team, index) => {
                        return (
                            <button key={index}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === team.activeTabIdentifier
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                onClick={() => setActiveTab(team.activeTabIdentifier)}
                            >
                                {team.tabname}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}