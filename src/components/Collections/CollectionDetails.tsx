import { Collection, Request } from '@/types/Collections';
import { useEffect, useState } from 'react';
import RichTextEditor from '@/components/Common/RichTextEditor';
import { sanitizeRichText } from '@/lib/rich-text';

interface CollectionDetailsProps {
    collection: Collection;
    onEditCollection: (updatedCollection: Collection | Request) => void;
    onShareCollection?: (collection: Collection) => void;
    onDeleteCollection?: (collection: Collection) => void;
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

    return (
        <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{collection.name}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {collection.teamId
                                ? 'Team collection'
                                : 'Personal collection'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            title="editmodal"
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => setShowEditModal(true)}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                ></path>
                            </svg>
                        </button>
                        <button
                            title="share-collection"
                            type="button"
                            disabled={!isShareEnabled}
                            onClick={() => onShareCollection?.(collection)}
                            className={`px-3 py-2 rounded-lg ${
                                isShareEnabled
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                ></path>
                            </svg>
                        </button>
                        <button
                            title="delete-collection"
                            type="button"
                            onClick={() => onDeleteCollection?.(collection)}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {showEditModal ? (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="w-[min(720px,92vw)] rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Edit Collection</h3>
                            <input
                                type="text"
                                placeholder="Collection Name"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
                                value={editedCollection.name}
                                onChange={(e) =>
                                    setEditedCollection({
                                        ...editedCollection,
                                        name: e.target.value,
                                    })
                                }
                            />
                            <RichTextEditor
                                value={editedCollection.description}
                                onChange={(value) =>
                                    setEditedCollection({
                                        ...editedCollection,
                                        description: value,
                                    })
                                }
                            />
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onEditCollection({
                                            ...editedCollection,
                                            description: sanitizeRichText(editedCollection.description),
                                            updatedAt: new Date().toISOString(),
                                        });
                                        setShowEditModal(false);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6 dark:border-gray-700 dark:bg-gray-900">
                    {descriptionHtml ? (
                        <div
                            className="rich-text-content text-gray-700 dark:text-gray-300"
                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                        />
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No description available.</p>
                    )}
                </div>

                <div className="mb-4">
                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {collection.shareId ? (
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Shared ID: {collection.shareId}
                            </span>
                        ) : null}
                        {!isShareEnabled ? (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                Sharing available for team collections only
                            </span>
                        ) : null}
                        <span>
                            Updated: {collection.updatedAt ? new Date(collection.updatedAt).toLocaleString() : 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Variables</h3>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Variable
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Initial Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Current Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {collection.variables.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            No variables yet.
                                        </td>
                                    </tr>
                                ) : (
                                    collection.variables.map((variable, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {variable.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {variable.initialValue || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {variable.currentValue || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Requests</h3>
                    </div>

                    <div className="space-y-4">
                        {collection.requests.length === 0 ? (
                            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-sm text-gray-500 dark:text-gray-400">
                                No top-level requests in this collection.
                            </div>
                        ) : (
                            collection.requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <span className="px-2 py-1 text-xs font-medium rounded mr-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 uppercase">
                                                {request.protocol || 'http'}
                                            </span>
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded mr-3 ${
                                                    request.method === 'GET'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : request.method === 'POST'
                                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                }`}
                                            >
                                                {request.method}
                                            </span>
                                            <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                                                {request.name}
                                            </h4>
                                        </div>
                                        <button
                                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                                            onClick={() => onEditCollection(request)}
                                        >
                                            Open
                                        </button>
                                    </div>
                                    <div className="px-6 py-4">
                                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                                            {request.description || 'No description available.'}
                                        </p>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-medium mr-2">URL:</span>
                                            <span>{request.url || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
