import { Collection, Folder, Request } from '@/types/Collections';
import { useEffect, useMemo, useState } from 'react';
import {
    Boxes,
    Clock3,
    Code2,
    Edit3,
    FileText,
    FolderOpen,
    Share2,
    Trash2,
    Variable,
} from 'lucide-react';
import RichTextEditor from '@/components/Common/RichTextEditor';
import { sanitizeRichText } from '@/lib/rich-text';

interface CollectionDetailsProps {
    collection: Collection;
    onEditCollection: (updatedCollection: Collection | Request) => void;
    onShareCollection?: (collection: Collection) => void;
    onDeleteCollection?: (collection: Collection) => void;
}

function requestMethodTone(method: string) {
    if (method === 'GET') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800';
    }
    if (method === 'POST') {
        return 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800';
    }
    if (method === 'PUT' || method === 'PATCH') {
        return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800';
    }
    if (method === 'DELETE') {
        return 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-800';
    }
    return 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700';
}

function formatProtocol(protocol?: string) {
    return (protocol || 'http').replace('socketio', 'socket.io').toUpperCase();
}

function getFolderRequestCount(folders: Folder[]) {
    return folders.reduce((total, folder) => total + folder.requests.length, 0);
}

function formatStableDateTime(value?: string) {
    if (!value) {
        return 'Not saved yet';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Not saved yet';
    }

    return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

export default function CollectionDetails({
    collection,
    onEditCollection,
    onShareCollection,
    onDeleteCollection,
}: CollectionDetailsProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedCollection, setEditedCollection] = useState<Collection>({ ...collection });
    const [descriptionHtml, setDescriptionHtml] = useState('');

    useEffect(() => {
        setEditedCollection({ ...collection });
        setDescriptionHtml(sanitizeRichText(collection.description || ''));
    }, [collection]);

    const isShareEnabled = Boolean(collection.teamId);
    const folderRequestCount = useMemo(() => getFolderRequestCount(collection.folders), [collection.folders]);
    const totalRequestCount = collection.requests.length + folderRequestCount;
    const updatedLabel = formatStableDateTime(collection.updatedAt);

    const renderRequestCard = (request: Request) => (
        <article
            key={request.id}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
        >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 dark:bg-gray-700 dark:text-gray-300">
                            {formatProtocol(request.protocol)}
                        </span>
                        <span className={`rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${requestMethodTone(request.method)}`}>
                            {request.method}
                        </span>
                    </div>
                    <h4 className="truncate text-sm font-semibold text-slate-950 dark:text-white" title={request.name}>
                        {request.name}
                    </h4>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-gray-400" title={request.url || ''}>
                        {request.url || 'No endpoint configured'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onEditCollection(request)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-300"
                >
                    <Code2 className="h-4 w-4" />
                    Open
                </button>
            </div>
            {request.description ? (
                <p className="max-h-10 overflow-hidden text-xs leading-5 text-slate-600 dark:text-gray-300">{request.description}</p>
            ) : null}
        </article>
    );

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-900">
            <div className="mx-auto grid w-full max-w-6xl gap-5 p-5 lg:p-8">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <div className="min-w-0">
                            <p className="mb-2 text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                                {collection.teamId ? 'Team collection' : 'Personal collection'}
                            </p>
                            <h2 className="truncate text-2xl font-semibold text-slate-950 dark:text-white" title={collection.name}>
                                {collection.name}
                            </h2>
                            <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-3 dark:text-gray-300">
                                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-gray-900">
                                    <Boxes className="h-4 w-4 text-blue-500" />
                                    {totalRequestCount} requests
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-gray-900">
                                    <FolderOpen className="h-4 w-4 text-amber-500" />
                                    {collection.folders.length} folders
                                </span>
                                <span className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-gray-900">
                                    <Clock3 className="h-4 w-4 shrink-0 text-slate-500" />
                                    <span className="truncate">{updatedLabel}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                            <button
                                title="Edit collection"
                                type="button"
                                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600"
                                onClick={() => setShowEditModal(true)}
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                title="Share collection"
                                type="button"
                                disabled={!isShareEnabled}
                                onClick={() => onShareCollection?.(collection)}
                                className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                                    isShareEnabled
                                        ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-300'
                                        : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600'
                                }`}
                            >
                                <Share2 className="h-4 w-4" />
                                Share
                            </button>
                            <button
                                title="Delete collection"
                                type="button"
                                onClick={() => onDeleteCollection?.(collection)}
                                className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-gray-900 dark:text-rose-400 dark:hover:bg-rose-900/20"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>

                    {collection.shareId ? (
                        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            <Share2 className="h-4 w-4 shrink-0" />
                            <span className="truncate">Shared ID: {collection.shareId}</span>
                        </div>
                    ) : null}
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                            <FileText className="h-4 w-4" />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Description</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Rich notes, setup steps, links, and context for this collection.</p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                        {descriptionHtml ? (
                            <div
                                className="rich-text-content text-sm text-slate-700 dark:text-gray-300"
                                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                            />
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-gray-400">No description available.</p>
                        )}
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                            <Variable className="h-4 w-4" />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Variables</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Collection-scoped values available to requests.</p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                            <thead className="bg-slate-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                                        Variable
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                                        Initial Value
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-gray-400">
                                        Current Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {collection.variables.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-4 text-sm text-slate-500 dark:text-gray-400">
                                            No variables yet.
                                        </td>
                                    </tr>
                                ) : (
                                    collection.variables.map((variable, index) => (
                                        <tr key={`${variable.name}-${index}`}>
                                            <td className="max-w-[260px] truncate px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                {variable.name}
                                            </td>
                                            <td className="max-w-[260px] truncate px-4 py-3 text-sm text-slate-500 dark:text-gray-400">
                                                {variable.initialValue || '-'}
                                            </td>
                                            <td className="max-w-[260px] truncate px-4 py-3 text-sm text-slate-500 dark:text-gray-400">
                                                {variable.currentValue || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                            <Code2 className="h-4 w-4" />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Requests</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Open requests in the dedicated builder so this page stays focused on organization.</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {collection.requests.length === 0 && collection.folders.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-gray-600 dark:text-gray-400">
                                No requests yet. Use the collection tree to add one.
                            </div>
                        ) : null}

                        {collection.requests.length > 0 ? (
                            <div className="grid gap-3">{collection.requests.map(renderRequestCard)}</div>
                        ) : null}

                        {collection.folders.map((folder) => (
                            <div key={folder.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                <div className="flex min-w-0 items-center gap-2">
                                    <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                                    <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={folder.name}>
                                        {folder.name}
                                    </h4>
                                    <span className="ml-auto shrink-0 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-slate-500 dark:bg-gray-800 dark:text-gray-300">
                                        {folder.requests.length}
                                    </span>
                                </div>
                                {folder.requests.length > 0 ? (
                                    <div className="grid gap-3">{folder.requests.map(renderRequestCard)}</div>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-gray-400">No requests in this folder.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {showEditModal ? (
                <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4">
                    <div className="w-[min(720px,92vw)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-slate-200 px-5 py-4 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Edit Collection</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Update the collection name and rich description.</p>
                        </div>
                        <div className="grid gap-4 p-5">
                            <label className="grid gap-2 text-xs font-semibold text-slate-600 dark:text-gray-300">
                                Collection Name
                                <input
                                    type="text"
                                    placeholder="Collection Name"
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                    value={editedCollection.name}
                                    onChange={(e) =>
                                        setEditedCollection({
                                            ...editedCollection,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <RichTextEditor
                                value={editedCollection.description}
                                onChange={(value) =>
                                    setEditedCollection({
                                        ...editedCollection,
                                        description: value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onEditCollection({
                                        ...editedCollection,
                                        description: sanitizeRichText(editedCollection.description),
                                        updatedAt: new Date().toISOString(),
                                    });
                                    setShowEditModal(false);
                                }}
                                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
