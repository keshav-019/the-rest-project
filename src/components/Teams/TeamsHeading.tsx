import { InviteTabTeam } from "@/types/Collections";

export default function TeamsHeading({activeTab, setShowCreateTeamModal}: {activeTab: InviteTabTeam, setShowCreateTeamModal: (value: boolean) => void}) {
    return (
        <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {activeTab === 'myTeams' ? 'My Teams' : 'Team Invitations'}
            </h2>
            {activeTab === 'myTeams' && (
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                    onClick={() => setShowCreateTeamModal(true)}
                >
                    Create New Team
                </button>
            )}
        </div>
    );
}