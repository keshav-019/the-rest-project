'use client'
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Collection } from '@/types/Collections';
import { Team } from '@/types/User';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getUserTeams } from '@/lib/firebase/teams';
import { ensureCollectionDefaults } from '@/lib/collections-utils';
import { sanitizeRichText } from '@/lib/rich-text';

export default function SharedCollectionPage() {
    const params = useParams<{ shareId: string }>();
    const router = useRouter();

    const [collection, setCollection] = useState<Collection | null>(null);
    const [ownerTeam, setOwnerTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessError, setAccessError] = useState<string | null>(null);
    const [descriptionHtml, setDescriptionHtml] = useState('');

    const shareId = useMemo(() => params?.shareId, [params]);

    useEffect(() => {
        const loadSharedCollection = async () => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            if (!shareId) {
                setAccessError('Invalid share link.');
                setIsLoading(false);
                return;
            }

            try {
                const teams = await getUserTeams(currentUser.uid);

                const matchedTeam = teams.find((team) =>
                    team.collections?.some((teamCollection) => teamCollection.shareId === shareId)
                );

                if (!matchedTeam) {
                    setAccessError('You do not have access to this shared collection.');
                    return;
                }

                const matchedCollection = matchedTeam.collections.find(
                    (teamCollection) => teamCollection.shareId === shareId
                );

                if (!matchedCollection) {
                    setAccessError('Shared collection was not found.');
                    return;
                }

                setOwnerTeam(matchedTeam);
                setCollection(ensureCollectionDefaults(matchedCollection, matchedTeam.teamId));
            } catch (error) {
                console.error('Failed to load shared collection:', error);
                setAccessError('Unable to load this shared collection right now.');
            } finally {
                setIsLoading(false);
            }
        };

        loadSharedCollection();
    }, [router, shareId]);

    useEffect(() => {
        setDescriptionHtml(sanitizeRichText(collection?.description || ''));
    }, [collection?.description]);

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-5xl mx-auto">
                {isLoading ? (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center text-gray-600 dark:text-gray-300">
                        Loading shared collection...
                    </div>
                ) : accessError ? (
                    <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center text-red-700 dark:text-red-300">
                        {accessError}
                    </div>
                ) : collection ? (
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                        {collection.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Shared by team: {ownerTeam?.name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push('/collections')}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                >
                                    Back To Collections
                                </button>
                            </div>
                            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                                {descriptionHtml ? (
                                    <div
                                        className="rich-text-content"
                                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                                    />
                                ) : (
                                    <p>No description provided.</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Requests
                            </h2>
                            {collection.requests.length === 0 && collection.folders.every((folder) => folder.requests.length === 0) ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No requests in this shared collection.</p>
                            ) : (
                                <div className="space-y-3">
                                    {collection.requests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                                        >
                                            <div className="flex items-center gap-2 text-xs mb-1">
                                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 uppercase">
                                                    {request.protocol || 'http'}
                                                </span>
                                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {request.method}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{request.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{request.url || '-'}</p>
                                        </div>
                                    ))}

                                    {collection.folders.map((folder) => (
                                        <div key={folder.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-3">{folder.name}</p>
                                            <div className="space-y-2">
                                                {folder.requests.map((request) => (
                                                    <div
                                                        key={request.id}
                                                        className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2"
                                                    >
                                                        <div className="flex items-center gap-2 text-xs mb-1">
                                                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 uppercase">
                                                                {request.protocol || 'http'}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                {request.method}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">{request.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{request.url || '-'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                ) : null}
            </div>
        </main>
    );
}
