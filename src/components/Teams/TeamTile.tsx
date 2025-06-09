import { getCurrentUser, getInitials } from "@/lib/firebase/auth";
import { Team, User } from "@/types/User";
import { useState } from "react";

/* eslint-disable @typescript-eslint/no-unused-vars */

// Helper function to generate consistent color hashes
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export default function TeamTile({handleViewTeamDetails, setSelectedTeamName, setShowInviteMembersModal, teamTitle, teamDescription, team}: {handleViewTeamDetails: (team: Team) => void, setSelectedTeamName: (value: string) => void, setShowInviteMembersModal: (value: boolean) => void, teamTitle: string, teamDescription: string, team: Team}) {
    // Get the first 3 members and calculate how many are remaining
    const displayedMembers = team.users.slice(0, 3);
    const remainingCount = team.users.length - displayedMembers.length;
    const [user, setUser] = useState<User | null>(getCurrentUser());
    const [isOwner, setIsOwner] = useState<boolean>(team.createdBy === user?.uid);
    // console.log("The users are: ", team.users[0].name);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{teamTitle}</h3>
                    <span className={isOwner ? "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}>
                        { isOwner ? 'Owner' : 'Member' }
                    </span>
                </div>
                <p className={"mt-2 text-sm text-gray-600 dark:text-gray-400"}>
                    {teamDescription}
                </p>
            </div>
            <div className="p-5">
                <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Members:</span>
                    <div className="flex -space-x-2">
                        {displayedMembers.map((user, index) => {
                            // Generate a consistent color based on user's uid or email
                            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                            const colorIndex = Math.abs(hashCode(user.email)) % colors.length;
                            const colorClass = colors[colorIndex];
                            
                            return (
                                <div 
                                    key={user.uid} 
                                    className={`w-7 h-7 rounded-full ${colorClass} flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800`}
                                >
                                    {getInitials(user.name || '')}
                                </div>
                            );
                        })}
                        {remainingCount > 0 && (
                            <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">
                                +{remainingCount}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                        onClick={() => handleViewTeamDetails(team)}
                    >
                        Manage
                    </button>
                    <button
                        className={isOwner ? "flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer": "flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"}
                        onClick={isOwner ? () => {
                            setSelectedTeamName(teamTitle);
                            setShowInviteMembersModal(true);
                        } : () => {}}
                    >
                        {isOwner ? 'Invite' : 'Leave'}
                    </button>
                </div>
            </div>
        </div>
    );
}
