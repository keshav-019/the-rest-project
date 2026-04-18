'use client'
import HeaderComponent from '@/components/Common/Header';
import { getInitials, getUserDetails } from '@/lib/firebase/auth';
import { getTeamById, getUserTeams } from '@/lib/firebase/teams';
import { Collection } from '@/types/Collections';
import { Team, UserData } from '@/types/User';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    coerceDate,
    DashboardTimeFilter,
    flattenCollectionRequests,
    formatRelativeTime,
    getCollectionLastUpdated,
    getTimeRange,
    isInRange,
    normalizeCollections,
} from '@/lib/collections-utils';

interface ActivityEntry {
    type: 'collection_created' | 'request_created' | 'folder_created' | 'request_sent' | 'collections_updated';
    id?: string;
    name?: string;
    timestamp: unknown;
    method?: string;
    url?: string;
    status?: number;
    duration?: number;
    success?: boolean;
}

const timeFilterOptions: Array<{ key: DashboardTimeFilter; label: string }> = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7days', label: 'Last 7 Days' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'lastYear', label: 'Last Year' },
    { key: 'all', label: 'All Time' },
];

const getMethodBadgeClass = (method: string) => {
    if (method === 'GET') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (method === 'POST') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (method === 'PUT' || method === 'PATCH') {
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
};

const buildActivityCopy = (activity: ActivityEntry): string => {
    if (activity.type === 'request_sent') {
        const method = activity.method || 'REQUEST';
        const endpoint = activity.url || activity.name || 'endpoint';
        return `You sent ${method} ${endpoint}`;
    }

    if (activity.type === 'collection_created') {
        return `You created collection "${activity.name || 'Untitled'}"`;
    }

    if (activity.type === 'request_created') {
        return `You created request "${activity.name || 'Untitled'}"`;
    }

    if (activity.type === 'folder_created') {
        return `You created folder "${activity.name || 'Folder'}"`;
    }

    return 'Your collections were updated';
};

const getActivityColor = (activity: ActivityEntry): string => {
    if (activity.type === 'request_sent') {
        return activity.success || (activity.status && activity.status < 400) ? 'bg-green-500' : 'bg-red-500';
    }
    if (activity.type === 'collection_created') return 'bg-blue-500';
    if (activity.type === 'request_created') return 'bg-purple-500';
    if (activity.type === 'folder_created') return 'bg-yellow-500';
    return 'bg-indigo-500';
};

const normalizeRecentActivity = (value: unknown): ActivityEntry[] => {
    if (Array.isArray(value)) {
        return value as ActivityEntry[];
    }

    if (value && typeof value === 'object') {
        return [value as ActivityEntry];
    }

    return [];
};

export default function Dashboard() {
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
    const [photoURL, setPhotoURL] = useState<string>('');

    const [collections, setCollections] = useState<Collection[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
    const [timeFilter, setTimeFilter] = useState<DashboardTimeFilter>('today');

    const router = useRouter();

    useEffect(() => {
        const loadDashboardData = async () => {
            const { user, userData } = await getUserDetails();
            if (!user) {
                router.push('/login');
                return;
            }

            const availableTeams = await getUserTeams(user.uid);
            setTeams(availableTeams);
            setEmail(user.email || '');
            setAutoSave(userData?.autoSave || true);
            setDisplayName(user.displayName || '');
            setUsername(user.username || '');
            setInitials(getInitials(user.displayName || ''));
            setPhotoURL(user.photoURL || '');

            const storedTeamMode = localStorage.getItem('teamMode');

            if (storedTeamMode) {
                try {
                    const parsedTeamMode = JSON.parse(storedTeamMode) as Team;
                    setTeamMode(parsedTeamMode);

                    const teamData = await getTeamById(parsedTeamMode.teamId);
                    setCollections(normalizeCollections(teamData.collections || [], parsedTeamMode.teamId));
                    setRecentActivity(normalizeRecentActivity(teamData.recentActivity));
                    return;
                } catch (error) {
                    console.error('Failed to load team dashboard data:', error);
                }
            }

            const safeUserData = (userData || {}) as UserData;
            setCollections(normalizeCollections(safeUserData.personalCollections || []));
            setRecentActivity(normalizeRecentActivity(safeUserData.recentActivity));
        };

        loadDashboardData();
    }, [router]);

    const range = useMemo(() => getTimeRange(timeFilter), [timeFilter]);

    const filteredActivities = useMemo(
        () => recentActivity.filter((activity) => isInRange(activity.timestamp, range)),
        [range, recentActivity]
    );

    const allRequests = useMemo(() => flattenCollectionRequests(collections), [collections]);

    const filteredCollections = useMemo(() => {
        if (!range) {
            return collections;
        }

        const matched = collections.filter((collection) => {
            const updated = getCollectionLastUpdated(collection);
            return isInRange(updated, range);
        });

        return matched.length > 0 ? matched : collections;
    }, [collections, range]);

    const successfulRequestCount = useMemo(() => {
        const activityCount = filteredActivities.filter(
            (activity) => activity.type === 'request_sent' && (activity.success || (activity.status || 0) < 400)
        ).length;

        if (activityCount > 0) {
            return activityCount;
        }

        return allRequests.reduce((total, { request }) => total + (request.successCount || 0), 0);
    }, [allRequests, filteredActivities]);

    const failedRequestCount = useMemo(() => {
        const activityCount = filteredActivities.filter(
            (activity) => activity.type === 'request_sent' && !activity.success && (activity.status || 0) >= 400
        ).length;

        if (activityCount > 0) {
            return activityCount;
        }

        return allRequests.reduce((total, { request }) => total + (request.failureCount || 0), 0);
    }, [allRequests, filteredActivities]);

    const avgResponseTime = useMemo(() => {
        const durations = filteredActivities
            .filter((activity) => activity.type === 'request_sent' && typeof activity.duration === 'number')
            .map((activity) => activity.duration as number);

        if (durations.length > 0) {
            return Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length);
        }

        const avgValues = allRequests.map(({ request }) => request.avgResponseTime || 0).filter((value) => value > 0);
        if (avgValues.length === 0) {
            return 0;
        }

        return Math.round(avgValues.reduce((sum, value) => sum + value, 0) / avgValues.length);
    }, [allRequests, filteredActivities]);

    const recentCollections = useMemo(
        () =>
            filteredCollections
                .map((collection) => ({
                    collection,
                    updatedAt: getCollectionLastUpdated(collection),
                }))
                .sort((left, right) => (right.updatedAt?.getTime() || 0) - (left.updatedAt?.getTime() || 0))
                .slice(0, 6),
        [filteredCollections]
    );

    const favoriteRequests = useMemo(() => {
        const filteredRequests = allRequests.filter(({ request }) => {
            const wasUsedInRange = isInRange(request.lastUsedAt, range);
            if (!range) {
                return true;
            }
            return wasUsedInRange || Boolean(request.isFavorite);
        });

        return filteredRequests
            .sort((left, right) => {
                const leftScore = (left.request.isFavorite ? 1000 : 0) + (left.request.usageCount || 0);
                const rightScore = (right.request.isFavorite ? 1000 : 0) + (right.request.usageCount || 0);
                return rightScore - leftScore;
            })
            .slice(0, 8);
    }, [allRequests, range]);

    const dashboardKPIs = [
        {
            name: 'Collections',
            total: filteredCollections.length,
            iconBg: 'bg-blue-100 dark:bg-blue-900',
            iconColor: 'text-blue-600 dark:text-blue-300',
            iconPath:
                'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        },
        {
            name: 'Successful Requests',
            total: successfulRequestCount,
            iconBg: 'bg-green-100 dark:bg-green-900',
            iconColor: 'text-green-600 dark:text-green-300',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            name: 'Failed Requests',
            total: failedRequestCount,
            iconBg: 'bg-red-100 dark:bg-red-900',
            iconColor: 'text-red-600 dark:text-red-300',
            iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            name: 'Avg. Response Time',
            total: `${avgResponseTime}ms`,
            iconBg: 'bg-purple-100 dark:bg-purple-900',
            iconColor: 'text-purple-600 dark:text-purple-300',
            iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        },
    ];

    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        localStorage.removeItem('activeEnvironmentId');
        window.location.reload();
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

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 flex flex-col overflow-hidden">
                <HeaderComponent
                    parentComponent={'Dashboard'}
                    toSearch={false}
                    onAddCollection={() => {}}
                    environments={[]}
                    autoSave={autoSave}
                    displayName={displayName}
                    email={email}
                    initials={initials}
                    setAutoSave={setAutoSave}
                    username={username}
                    teams={teams}
                    activeEnvironmentId={''}
                    onEnvironmentSelect={() => {}}
                    onExitTeamMode={handleExitTeamMode}
                    onTeamSelect={handleTeamSelect}
                    setShowTeams={setShowTeamsDropdown}
                    showTeams={showTeamsDropdown}
                    teamMode={teamMode}
                    photoURL={photoURL}
                />

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            {timeFilterOptions.map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setTimeFilter(option.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                                        timeFilter === option.key
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dashboardKPIs.map((kpi) => (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" key={kpi.name}>
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-full ${kpi.iconBg} ${kpi.iconColor} mr-4`}>
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d={kpi.iconPath}
                                            ></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{kpi.name}</p>
                                        <p className="text-2xl font-semibold text-gray-800 dark:text-white">{kpi.total}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {filteredActivities.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No activity for this time range yet.
                                    </p>
                                ) : (
                                    filteredActivities
                                        .slice()
                                        .sort((a, b) => {
                                            const aDate = coerceDate(a.timestamp)?.getTime() || 0;
                                            const bDate = coerceDate(b.timestamp)?.getTime() || 0;
                                            return bDate - aDate;
                                        })
                                        .slice(0, 8)
                                        .map((activity, index) => (
                                            <div
                                                className="flex items-start"
                                                key={`${activity.id || 'activity'}-${String(activity.timestamp)}-${index}`}
                                            >
                                                <div
                                                    className={`flex-shrink-0 w-10 h-10 rounded-full ${getActivityColor(activity)} flex items-center justify-center text-white font-medium`}
                                                >
                                                    {getInitials(displayName || username || 'You')}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {buildActivityCopy(activity)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatRelativeTime(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Collections</h3>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentCollections.length === 0 ? (
                                        <li className="py-3 text-sm text-gray-500 dark:text-gray-400">
                                            No collections available.
                                        </li>
                                    ) : (
                                        recentCollections.map(({ collection, updatedAt }) => (
                                            <li
                                                className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded px-2"
                                                key={collection.id}
                                                onClick={() => router.push(`/collections?collectionId=${collection.id}`)}
                                            >
                                                <div className="flex items-center min-w-0">
                                                    <svg
                                                        className="w-5 h-5 text-blue-500 mr-3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                        ></path>
                                                    </svg>
                                                    <span className="text-gray-800 dark:text-white truncate">{collection.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatRelativeTime(updatedAt)}
                                                </span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Favorite Requests</h3>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {favoriteRequests.length === 0 ? (
                                        <li className="py-3 text-sm text-gray-500 dark:text-gray-400">
                                            No requests yet. Open Request Builder and run some calls.
                                        </li>
                                    ) : (
                                        favoriteRequests.map(({ request }) => (
                                            <li
                                                className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded px-2"
                                                key={request.id}
                                                onClick={() => router.push(`/?requestId=${request.id}`)}
                                            >
                                                <div className="flex items-center min-w-0">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium ${getMethodBadgeClass(request.method)} rounded mr-3`}
                                                    >
                                                        {request.method}
                                                    </span>
                                                    <span className="text-gray-800 dark:text-white truncate">
                                                        {request.url || request.name}
                                                    </span>
                                                </div>
                                                <button
                                                    className={`${
                                                        request.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                                                    }`}
                                                    name="favorite-requests"
                                                    type="button"
                                                    title="favorite-requests"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                    </svg>
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
