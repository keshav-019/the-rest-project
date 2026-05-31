/* eslint-disable @typescript-eslint/no-unused-vars */
// components/TeamsDropdown.tsx
import { Team } from "@/types/User";
import { TeamIcon, ChevronDownIcon } from "./Icons";
import { useRouter } from "next/navigation";

interface TeamsDropdownProps {
    teams: Team[];
    showTeams: boolean;
    setShowTeams: (value: boolean) => void;
    onTeamSelect: (team: Team) => void;
    onExitTeamMode: () => void;
    currentTeam: Team | null;
}

export default function TeamsDropdown({
    teams,
    showTeams,
    setShowTeams,
    onTeamSelect,
    onExitTeamMode,
    currentTeam
}: TeamsDropdownProps) {
    const router = useRouter();
    
    return (
        <div className="py-1">
            <button
                className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setShowTeams(!showTeams)}
            >
                <span className="flex items-center">
                    <TeamIcon className="mr-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    {currentTeam ? currentTeam.name : 'Teams'}
                </span>
                <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${showTeams ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            {showTeams && (
                <div className="max-h-36 overflow-y-auto ui-scrollbar">
                    {teams.length !== 0 && teams.map((team) => (
                        <div
                            key={team.teamId}
                            className={`px-8 py-2 text-sm cursor-pointer ${currentTeam?.teamId === team.teamId 
                                ? 'bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700'}`}
                            onClick={() => {
                                onTeamSelect(team);
                                setShowTeams(false);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span>{team.name}</span>
                                {currentTeam?.teamId === team.teamId && (
                                    <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                        Current
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {teams.length === 0 && <div
                            className={`px-8 py-2 text-sm cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700`}
                            onClick={() => {
                                router.push('/teams');
                            }}
                        >
                            <div className="flex items-center justify-between">
                                No Teams. Create One?
                            </div>
                        </div>
                    }
                </div>
            )}
        </div>
    );
}
