import { Team } from "@/types/User";
import { TeamIcon, ChevronDownIcon } from "./Icons";

export default function TeamsDropdown({setShowTeams, showTeams, teams} : {setShowTeams: (value: boolean) => void, showTeams: boolean, teams: Team[]}) {
    return (
        <div className="py-1">
            <button
                className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setShowTeams(!showTeams)}
            >
                <span className="flex items-center">
                    <TeamIcon className="mr-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    Teams
                </span>
                <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${showTeams ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {showTeams && (
                <div className={`max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-blue-500 dark:scrollbar-thumb-gray-500`}> {/* 3 items max visible */}
                    {teams.map((team, index) => (
                        <div
                            key={index}
                            className="px-8 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            {team.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


