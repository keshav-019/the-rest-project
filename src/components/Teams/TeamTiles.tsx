import TeamTile from "./TeamTile";
import { Team } from "@/types/User";

export default function TeamTiles({handleViewTeamDetails, setSelectedTeamName, setShowInviteMembersModal, setShowCreateTeamModal, teams}: {handleViewTeamDetails: (team: Team) => void, setSelectedTeamName: (value: string) => void, setShowInviteMembersModal: (value: boolean) => void, setShowCreateTeamModal: (value: boolean) => void, teams: Team[]}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team, index) => {
                console.log("The team is: ", team);
                return (
                    <TeamTile key={index} handleViewTeamDetails={handleViewTeamDetails} setSelectedTeamName={setSelectedTeamName} setShowInviteMembersModal={setShowInviteMembersModal} teamDescription={team.description} teamTitle={team.name} team={team} />
                );
            })}

            {/* Create New Team Card */}
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setShowCreateTeamModal(true)}
            >
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Create New Team</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Start collaborating with your colleagues
                </p>
            </div>
        </div>
    )
}