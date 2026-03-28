'use client'
import HeaderComponent from "@/components/Common/Header";
import { useUserData } from "@/hooks/useUserData";
import { getInitials, getUserDetails } from "@/lib/firebase/auth";
import { getUserTeams } from "@/lib/firebase/teams";
import { Team } from "@/types/User";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const dashboardKPIs = [
        {
            name: 'Collections',
            total: 12,
            icon: (
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                </div>
            )
        },
        {
            name: 'Successful Requests',
            total: '1,284',
            icon: (
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            )
        },
        {
            name: 'Failed Requests',
            total: 23,
            icon: (
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            )
        },
        {
            name: 'Avg. Response Time',
            total: '245ms',
            icon: (
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            )
        }
    ];

    const recentActivityRequests = [
        {
            userid: 'kfNMVQVUnJQXTpP7ufKj8ZBuahm2',
            username: 'Keshav Jha',
            activity: (
                <p className="text-sm font-medium text-gray-900 dark:text-white">You sent a GET request to <span className="text-blue-600 dark:text-blue-400">api.example.com/users</span></p>
            ),
            timing: (
                <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
            ),
            colorClass: "bg-green-500"
        },
        {
            userid: 'hgsdfIJGSDJKHSDFJHSDFKHSDF823',
            username: 'Alex Kim',
            activity: (
                <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Kim updated the &quot;Payment API&quot; collection</p>
            ),
            timing: (
                <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
            ),
            colorClass: "bg-purple-500"
        },
        {
            userid: 'kfNMVQVUnJQXTpP7ufKj8ZBuahm2',
            username: 'Keshav Jha',
            activity: (
                <p className="text-sm font-medium text-gray-900 dark:text-white">You sent a GET request to <span className="text-blue-600 dark:text-blue-400">api.example.com/users</span></p>
            ),
            timing: (
                <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
            ),
            colorClass: "bg-blue-500"
        },
        {
            userid: 'kfNMVQVUnJQXTpP7ufKj8ZBuahm2',
            username: 'Maria Lopez',
            activity: (
                <p className="text-sm font-medium text-gray-900 dark:text-white">Maria Lopez shared the &quot;User Authentication&quot; collection with you</p>
            ),
            timing: (
                <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday at 4:30 PM</p>
            ),
            colorClass: "bg-yellow-500"
        }
    ];

    const recentCollections = [
        {
            name: 'Payment API',
            timing: 'Updated 2h ago'
        },
        {
            name: 'User Authentication',
            timing: 'Updated 1d ago'
        },
        {
            name: 'Product Catalog',
            timing: 'Updated 3d ago',
        },
        {
            name: 'Analytics API',
            timing: 'Updated 1w ago'
        }
    ];

    const requestColorMapping = [
        { requestType: 'GET', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        { requestType: 'POST', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
        { requestType: 'PUT', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
        { requestType: 'DEL', colorClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    ]

    const favouriteRequests = [
        { api: 'api.example.com/users', requestType: requestColorMapping.find(element => element.requestType === 'GET') },
        { api: 'api.example.com/auth/login', requestType: requestColorMapping.find(element => element.requestType === 'POST') },
        { api: 'api.example.com/products/123', requestType: requestColorMapping.find(element => element.requestType === 'PUT') },
        { api: 'api.example.com/users/456', requestType: requestColorMapping.find(element => element.requestType === 'DEL') }
    ];

    const { userData, teamId } = useUserData();
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
    const [photoURL, setPhotoURL] = useState<string>('');

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

    // Add this handler for exiting team mode
    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        localStorage.removeItem('activeEnvironmentId');

        // Refresh the page to reset all states
        window.location.reload();
    };

    // Add this handler for team selection
    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        localStorage.setItem('teamMode', JSON.stringify(team));
        setShowTeamsDropdown(false);
        localStorage.removeItem('activeEnvironmentId');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
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
                    onExitTeamMode={handleExitTeamMode}
                    onTeamSelect={handleTeamSelect}
                    setShowTeams={setShowTeamsDropdown}
                    showTeams={showTeamsDropdown}
                    teamMode={teamMode}
                    photoURL={photoURL}
                />

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Dashboard</h2>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dashboardKPIs.map((kpi, index) => {
                            return (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" key={index}>
                                    <div className="flex items-center">
                                        {kpi.icon}
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{kpi.name}</p>
                                            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{kpi.total}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentActivityRequests.map((activity, index) => {
                                    return (
                                        <div className="flex items-start" key={index}>
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.colorClass} flex items-center justify-center text-white font-medium`}>
                                                {getInitials(activity.username)}
                                            </div>
                                            <div className="ml-4">
                                                {activity.activity}
                                                {activity.timing}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Recent Collections and Favorites */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Collections</h3>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentCollections.map((collection, index) => {
                                        return (
                                            <li className="py-3 flex items-center justify-between" key={index}>
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                                    </svg>
                                                    <span className="text-gray-800 dark:text-white">{collection.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{collection.timing}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Favorite Requests</h3>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {favouriteRequests.map((request, index) => {
                                        return (
                                            <li className="py-3 flex items-center justify-between" key={index}>
                                                <div className="flex items-center">
                                                    <span className={`px-2 py-1 text-xs font-medium ${request.requestType?.colorClass} rounded mr-3`}>{request.requestType?.requestType}</span>
                                                    <span className="text-gray-800 dark:text-white">{request.api}</span>
                                                </div>
                                                <button className="text-yellow-500" name="favourite-requests" type="button" title="favourite-requests">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                    </svg>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}