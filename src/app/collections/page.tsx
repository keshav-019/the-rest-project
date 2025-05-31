'use client';
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Define all interfaces at the top
interface Variable {
  name: string;
  initialValue: string;
  currentValue: string;
}

interface Request {
  id: string;
  method: string;
  name: string;
  description: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  requests: Request[];
}

interface Collection {
  id: string;
  name: string;
  description: string;
  variables: Variable[];
  folders: Folder[];
  requests: Request[];
}

// Props interfaces for components
interface NewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

interface AddItemDropdownProps {
  type: 'collection' | 'folder';
  onAddRequest: () => void;
  onAddFolder: () => void;
}

interface CollectionsTreeProps {
  collections: Collection[];
  onAddRequest: (collectionId: string, folderId?: string) => void;
  onAddFolder: (collectionId: string) => void;
  onSelectCollection: (collection: Collection) => void;
}

interface CollectionItemProps {
  collection: Collection;
  onAddRequest: (collectionId: string, folderId?: string) => void;
  onAddFolder: (collectionId: string) => void;
}

interface FolderItemProps {
  folder: Folder;
  onAddRequest: () => void;
}

interface RequestItemProps {
  request: Request;
}

interface CollectionDetailsProps {
  collection: Collection;
  onEditCollection: (updatedCollection: Collection | Request) => void;
}

// Modal for creating new collections
const NewCollectionModal: React.FC<NewCollectionModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">New Collection</h3>
        <input
          type="text"
          placeholder="Collection Name"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCreate(name);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// Dropdown menu for adding items
const AddItemDropdown: React.FC<AddItemDropdownProps> = ({ type, onAddRequest, onAddFolder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            {type === 'collection' && (
              <button
                onClick={() => {
                  onAddFolder();
                  setIsOpen(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                Add Folder
              </button>
            )}
            <button
              onClick={() => {
                onAddRequest();
                setIsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              Add Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Collection Tree Component
const CollectionsTree: React.FC<CollectionsTreeProps> = ({ 
  collections, 
  onAddRequest, 
  onAddFolder
}) => {
  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Collections</h2>
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
            onClick={() => onAddFolder('root')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </div>
        
        <div className="space-y-2">
          {collections.map((collection) => (
            <CollectionItem 
              key={collection.id} 
              collection={collection} 
              onAddRequest={onAddRequest}
              onAddFolder={onAddFolder}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Collection Component
const CollectionItem: React.FC<CollectionItemProps> = ({ collection, onAddRequest, onAddFolder }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
        <div className="flex items-center" onClick={() => setIsExpanded(!isExpanded)}>
          <svg 
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${isExpanded ? 'transform rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span className="ml-2 text-gray-800 dark:text-white font-medium">{collection.name}</span>
        </div>
        <AddItemDropdown 
          type="collection" 
          onAddRequest={() => onAddRequest(collection.id)} 
          onAddFolder={() => onAddFolder(collection.id)}
        />
      </div>
      
      {isExpanded && (
        <div className="ml-4 space-y-1">
          {collection.folders.map((folder) => (
            <FolderItem 
              key={folder.id} 
              folder={folder} 
              onAddRequest={() => onAddRequest(collection.id, folder.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Folder Component
const FolderItem: React.FC<FolderItemProps> = ({ folder, onAddRequest }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
        <div className="flex items-center" onClick={() => setIsExpanded(!isExpanded)}>
          <svg 
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${isExpanded ? 'transform rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span className="ml-2 text-gray-700 dark:text-gray-300">{folder.name}</span>
        </div>
        <AddItemDropdown 
          type="folder" 
          onAddRequest={onAddRequest} 
          onAddFolder={() => {}}
        />
      </div>
      
      {isExpanded && (
        <div className="ml-4 space-y-1">
          {folder.requests.map((request) => (
            <RequestItem key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

// Request Component
const RequestItem: React.FC<RequestItemProps> = ({ request }) => {
  const router = useRouter();
  
  return (
    <div 
      className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
      onClick={() => router.push(`/requestbuilder?requestId=${request.id}`)}
    >
      <div className="flex items-center">
        <span className={`px-2 py-1 text-xs font-medium rounded mr-2 ${
          request.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
          request.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }`}>
          {request.method}
        </span>
        <span className="text-gray-700 dark:text-gray-300">{request.name}</span>
      </div>
      <button 
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/requestbuilder?requestId=${request.id}`);
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
        </svg>
      </button>
    </div>
  );
};

// Collection Details Component
const CollectionDetails: React.FC<CollectionDetailsProps> = ({ collection, onEditCollection }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedCollection, setEditedCollection] = useState<Collection>({...collection});

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{collection.name}</h2>
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors cursor-pointer"
              onClick={() => setShowEditModal(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
            </button>
            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Edit Collection Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Edit Collection</h3>
              <input
                type="text"
                placeholder="Collection Name"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
                value={editedCollection.name}
                onChange={(e) => setEditedCollection({...editedCollection, name: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
                value={editedCollection.description}
                onChange={(e) => setEditedCollection({...editedCollection, description: e.target.value})}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onEditCollection(editedCollection);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            {collection.description || "No description available."}
          </p>
        </div>
        
        {/* Environment Name */}
        <div className="mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Environment:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Development</span>
          </div>
        </div>
        
        {/* Variables Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Variables</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium focus:outline-none cursor-pointer">
              + Add Variable
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Variable
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Initial Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {collection.variables.map((variable, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {variable.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {variable.initialValue || <span className="text-gray-400 italic">No Initial Value</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {variable.currentValue || <span className="text-gray-400 italic">No Current Value</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Requests Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Requests</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium focus:outline-none cursor-pointer">
              + Add Request
            </button>
          </div>
          
          <div className="space-y-4">
            {collection.requests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded mr-3 ${
                      request.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      request.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {request.method}
                    </span>
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">{request.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                      onClick={() => onEditCollection(request)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {request.description || "No description available."}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium mr-2">URL:</span>
                    <span>{request.url}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Collections Component
const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'User Authentication API',
      description: 'This collection contains all API endpoints related to user authentication, including login, registration, password reset, and token management.',
      variables: [
        { name: 'baseUrl', initialValue: 'https://api.example.com/auth', currentValue: 'https://api.example.com/auth' },
        { name: 'apiVersion', initialValue: 'v1', currentValue: 'v2' },
        { name: 'authToken', initialValue: '', currentValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      ],
      folders: [
        {
          id: '1-1',
          name: 'Authentication',
          requests: [
            { id: '1-1-1', method: 'POST', name: 'Login', description: 'Authenticates a user and returns an access token and refresh token.', url: 'https://api.example.com/auth/v2/login' },
            { id: '1-1-2', method: 'POST', name: 'Register', description: 'Creates a new user account and returns user details.', url: 'https://api.example.com/auth/v2/register' },
            { id: '1-1-3', method: 'POST', name: 'Refresh Token', description: 'Generates a new access token using a valid refresh token.', url: 'https://api.example.com/auth/v2/refresh' }
          ]
        },
        {
          id: '1-2',
          name: 'User Management',
          requests: []
        }
      ],
      requests: []
    },
    {
      id: '2',
      name: 'Payment API',
      description: 'Endpoints for processing payments and managing transactions.',
      variables: [],
      folders: [],
      requests: []
    },
    {
      id: '3',
      name: 'Product Catalog',
      description: 'API for managing product inventory and catalog.',
      variables: [],
      folders: [],
      requests: []
    }
  ]);

  const [selectedCollection, setSelectedCollection] = useState<Collection>(collections[0]);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const router = useRouter();

  const handleAddCollection = (name: string) => {
    const newCollection: Collection = {
      id: `${collections.length + 1}`,
      name,
      description: '',
      variables: [],
      folders: [],
      requests: []
    };
    setCollections([...collections, newCollection]);
  };

  const handleAddFolder = (collectionId: string) => {
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) return;

    const newCollections = [...collections];
    const folderId = `${collectionId}-${newCollections[collectionIndex].folders.length + 1}`;
    
    newCollections[collectionIndex].folders.push({
      id: folderId,
      name: `New Folder ${newCollections[collectionIndex].folders.length + 1}`,
      requests: []
    });

    setCollections(newCollections);
  };

  const handleAddRequest = (collectionId: string, folderId?: string) => {
    const newCollections = [...collections];
    const collectionIndex = newCollections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) return;

    const folder = folderId ? newCollections[collectionIndex].folders.find(f => f.id === folderId) : undefined;
    const requestId = folderId 
      ? `${folderId}-${(folder?.requests.length || 0) + 1}`
      : `${collectionId}-${newCollections[collectionIndex].requests.length + 1}`;

    const newRequest: Request = {
      id: requestId,
      method: 'GET',
      name: 'New Request',
      description: '',
      url: ''
    };

    if (folderId && folder) {
      folder.requests.push(newRequest);
    } else {
      newCollections[collectionIndex].requests.push(newRequest);
    }

    setCollections(newCollections);
    router.push(`/requestbuilder?requestId=${requestId}`);
  };

  const handleEditCollection = (updatedCollection: Collection | Request) => {
    if (updatedCollection.id.includes('-')) {
      // This is a request edit - navigate to request builder
      router.push(`/requestbuilder?requestId=${updatedCollection.id}`);
      return;
    }

    const newCollections = collections.map(collection => 
      collection.id === updatedCollection.id ? updatedCollection as Collection : collection
    );
    setCollections(newCollections);
    setSelectedCollection(updatedCollection as Collection);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">API Nexus</h1>
        </div>
        <nav className="mt-5">
          <ul>
            <li className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Link href="/" className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Dashboard
              </Link>
            </li>
            <li className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Link href="/requestbuilder" className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                Request Builder
              </Link>
            </li>
            <li className="px-5 py-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400">
              <Link href="/collections" className="flex items-center text-blue-700 dark:text-blue-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Collections
              </Link>
            </li>
            <li className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Link href="/environments" className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Environments
              </Link>
            </li>
            <li className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Link href="/history" className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                History
              </Link>
            </li>
            <li className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Link href="/teams" className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Team
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex items-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search collections..." 
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer flex items-center"
              onClick={() => setShowNewCollectionModal(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Collection
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path>
              </svg>
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer">
              JS
            </div>
          </div>
        </header>

        {/* Collections Content */}
        <main className="flex-1 overflow-hidden flex">
          <CollectionsTree 
            collections={collections} 
            onAddRequest={handleAddRequest}
            onAddFolder={handleAddFolder}
            onSelectCollection={setSelectedCollection}
          />
          
          <CollectionDetails 
            collection={selectedCollection} 
            onEditCollection={handleEditCollection}
          />
        </main>
      </div>

      {/* New Collection Modal */}
      <NewCollectionModal 
        isOpen={showNewCollectionModal} 
        onClose={() => setShowNewCollectionModal(false)}
        onCreate={handleAddCollection}
      />
    </div>
  );
};

export default Collections;