'use client';
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useClipboard } from "@/hooks/useClipboard";
import { saveAs } from 'file-saver';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Interfaces for collections (copied from Collections component)
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

interface Param {
  enabled: boolean;
  key: string;
  value: string;
}

interface Header {
  enabled: boolean;
  key: string;
  value: string;
}

interface Auth {
  type: 'none' | 'bearer' | 'basic' | 'apiKey' | 'oauth2';
  credentials: {
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    addTo?: 'header' | 'query';
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
  };
}

interface ResponseData {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
  timing: {
    start: number;
    end: number;
    phases: Array<{
      name: string;
      duration: number;
    }>;
  };
}

enum RequestType {
  GET='GET',
  POST='POST',
  PUT='PUT',
  PATCH='PATCH',
  DELETE='DELETE',
  HEAD='HEAD',
  OPTIONS='OPTIONS'
}

// Components for Collections Tree
const CollectionItem: React.FC<{ 
  collection: Collection; 
  onSelectRequest: (request: Request) => void 
}> = ({ collection, onSelectRequest }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div 
        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
      
      {isExpanded && (
        <div className="ml-4 space-y-1">
          {collection.folders.map((folder) => (
            <FolderItem 
              key={folder.id} 
              folder={folder} 
              onSelectRequest={onSelectRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderItem: React.FC<{ 
  folder: Folder; 
  onSelectRequest: (request: Request) => void 
}> = ({ folder, onSelectRequest }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div 
        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
      
      {isExpanded && (
        <div className="ml-4 space-y-1">
          {folder.requests.map((request) => (
            <RequestItem 
              key={request.id} 
              request={request} 
              onSelectRequest={onSelectRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RequestItem: React.FC<{ 
  request: Request; 
  onSelectRequest: (request: Request) => void 
}> = ({ request, onSelectRequest }) => {
  return (
    <div 
      className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
      onClick={() => onSelectRequest(request)}
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
    </div>
  );
};

const CollectionsTree: React.FC<{ 
  collections: Collection[]; 
  onSelectRequest: (request: Request) => void 
}> = ({ collections, onSelectRequest }) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Collections</h2>
        </div>
        
        <div className="space-y-2">
          {collections.map((collection) => (
            <CollectionItem 
              key={collection.id} 
              collection={collection} 
              onSelectRequest={onSelectRequest}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main RequestBuilder component
export default function RequestBuilder() {
  const [activeRequestTab, setActiveRequestTab] = useState<'Params' | 'Headers' | 'Body' | 'Auth' | 'Pre-request' | 'Tests'>('Params');
  const [activeResponseTab, setActiveResponseTab] = useState<'Response' | 'Headers' | 'Cookies' | 'Timeline'>('Response');
  const [method, setMethod] = useState<RequestType>(RequestType.GET);
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [isStarred, setIsStarred] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [params, setParams] = useState<Param[]>([
    { enabled: false, key: '', value: '' }
  ]);
  const [headers, setHeaders] = useState<Header[]>([
    { enabled: true, key: 'Content-Type', value: 'application/json' },
    { enabled: true, key: 'Accept', value: 'application/json' },
    { enabled: false, key: '', value: '' }
  ]);
  const [body, setBody] = useState('{\n  "key": "value"\n}');
  const [auth, setAuth] = useState<Auth>({ type: 'none', credentials: {} });
  const [preRequestScript, setPreRequestScript] = useState('// Add your pre-request script here');
  const [tests, setTests] = useState('// Add your tests here');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Array<{key: string; value: string}>>([]);
  const [cookies, setCookies] = useState<Array<{name: string; value: string; domain: string; path: string}>>([]);
  const [timeline, setTimeline] = useState<Array<{name: string; duration: number}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { copyToClipboard } = useClipboard();

  useEffect(() => {
    // Load mock collections (same as in Collections component)
    const mockCollections: Collection[] = [
      {
        id: '1',
        name: 'User Authentication API',
        description: 'This collection contains all API endpoints related to user authentication',
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
              { id: '1-1-1', method: 'POST', name: 'Login', description: 'Authenticates a user', url: 'https://api.example.com/auth/v2/login' },
              { id: '1-1-2', method: 'POST', name: 'Register', description: 'Creates a new user account', url: 'https://api.example.com/auth/v2/register' },
              { id: '1-1-3', method: 'POST', name: 'Refresh Token', description: 'Generates a new access token', url: 'https://api.example.com/auth/v2/refresh' }
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
        description: 'Endpoints for processing payments',
        variables: [],
        folders: [],
        requests: []
      },
      {
        id: '3',
        name: 'Product Catalog',
        description: 'API for managing product inventory',
        variables: [],
        folders: [],
        requests: []
      }
    ];
    setCollections(mockCollections);
  }, []);

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();
    
    try {
      // Construct URL with query params
      let requestUrl = url;
      const enabledParams = params.filter(p => p.enabled && p.key);
      if (enabledParams.length > 0) {
        const queryString = enabledParams
          .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
          .join('&');
        requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString;
      }

      // Prepare headers
      const requestHeaders: Record<string, string> = {};
      headers
        .filter(h => h.enabled && h.key)
        .forEach(h => {
          requestHeaders[h.key] = h.value;
        });

      // Handle authentication
      if (auth.type === 'bearer' && auth.credentials.token) {
        requestHeaders['Authorization'] = `Bearer ${auth.credentials.token}`;
      } else if (auth.type === 'basic' && auth.credentials.username && auth.credentials.password) {
        const basicAuth = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
        requestHeaders['Authorization'] = `Basic ${basicAuth}`;
      } else if (auth.type === 'apiKey') {
        if (auth.credentials.addTo === 'header') {
          requestHeaders[auth.credentials.key || 'X-API-KEY'] = auth.credentials.value || '';
        } else if (auth.credentials.addTo === 'query') {
          requestUrl += (requestUrl.includes('?') ? '&' : '?') + 
            `${encodeURIComponent(auth.credentials.key || 'api_key')}=${encodeURIComponent(auth.credentials.value || '')}`;
        }
      }

      // Prepare body
      let requestBody: any = null;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          requestBody = body ? JSON.parse(body) : {};
        } catch (e) {
          throw new Error('Invalid JSON body');
        }
      }

      // Execute request
      const response = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(requestBody) : undefined
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Process response
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Extract headers
      const responseHeaders: Array<{key: string; value: string}> = [];
      response.headers.forEach((value, key) => {
        responseHeaders.push({ key, value });
      });

      // Create timing phases (simplified for demo)
      const timingPhases = [
        { name: 'DNS Lookup', duration: Math.round(duration * 0.1) },
        { name: 'TCP Handshake', duration: Math.round(duration * 0.2) },
        { name: 'SSL Handshake', duration: Math.round(duration * 0.3) },
        { name: 'Request Sent', duration: Math.round(duration * 0.05) },
        { name: 'Waiting (TTFB)', duration: Math.round(duration * 0.25) },
        { name: 'Content Download', duration: Math.round(duration * 0.1) }
      ];

      const result: ResponseData = {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        cookies: [], // Would need to parse Set-Cookie headers
        timing: {
          start: startTime,
          end: endTime,
          phases: timingPhases
        }
      };

      setResponse(result);
      setResponseHeaders(responseHeaders);
      setCookies([]); // In a real app, parse cookies from response
      setTimeline(timingPhases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParam = () => {
    setParams([...params, { enabled: false, key: '', value: '' }]);
  };

  const handleUpdateParam = (index: number, field: keyof Param, value: string | boolean) => {
    const newParams = [...params];
    if (field === 'enabled') {
      newParams[index][field] = value as boolean;
    } else {
      newParams[index][field] = value as string;
    }
    setParams(newParams);
  };

  const handleRemoveParam = (index: number) => {
    const newParams = [...params];
    newParams.splice(index, 1);
    setParams(newParams);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { enabled: false, key: '', value: '' }]);
  };

  const handleUpdateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    const newHeaders = [...headers];
    if (field === 'enabled') {
      newHeaders[index][field] = value as boolean;
    } else {
      newHeaders[index][field] = value as string;
    }
    setHeaders(newHeaders);
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const handleCopyResponse = () => {
    if (response) {
      copyToClipboard(JSON.stringify(response.data, null, 2));
    }
  };

  const handleDownloadResponse = () => {
    if (response) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      saveAs(blob, 'response.json');
    }
  };

  const handleShareRequest = () => {
    const requestData = {
      method,
      url,
      params: params.filter(p => p.enabled && p.key),
      headers: headers.filter(h => h.enabled && h.key),
      body: body,
      auth,
      preRequestScript,
      tests
    };
    
    copyToClipboard(JSON.stringify(requestData, null, 2));
    alert('Request configuration copied to clipboard!');
  };

  const handleSelectRequest = (request: Request) => {
    setMethod(request.method as RequestType);
    setUrl(request.url);
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
            <li className="px-5 py-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400">
              <Link href="/requestbuilder" className="flex items-center text-blue-700 dark:text-blue-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                Request Builder
              </Link>
            </li>
            <li className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Link href="/collections" className="flex items-center text-gray-700 dark:text-gray-300">
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

      {/* Collections Tree Sidebar */}
      <CollectionsTree 
        collections={collections} 
        onSelectRequest={handleSelectRequest}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex items-center">
            <div className="relative">
              <select className="h-10 pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                <option>Default Environment</option>
                <option>Development</option>
                <option>Staging</option>
                <option>Production</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer">
              JS
            </div>
          </div>
        </header>

        {/* Request Builder Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {/* Request URL Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-28">
                <select 
                  className="w-full h-10 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as RequestType)}
                >
                  <option className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">GET</option>
                  <option className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">POST</option>
                  <option className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">PUT</option>
                  <option className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">PATCH</option>
                  <option className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">DELETE</option>
                  <option className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">HEAD</option>
                  <option className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">OPTIONS</option>
                </select>
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Enter request URL" 
                  className="w-full h-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button 
                className="h-10 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                onClick={handleSendRequest}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
              <button 
                className="h-10 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                onClick={() => setIsStarred(!isStarred)}
              >
                <svg 
                  className="w-5 h-5" 
                  fill={isStarred ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </button>
              <button 
                className="h-10 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                onClick={handleShareRequest}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(100%-4rem)]">
            {/* Request Configuration */}
            <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex -mb-px">
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Params' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveRequestTab('Params')}
                    >
                      Params
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Headers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveRequestTab('Headers')}
                    >
                      Headers
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Body' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveRequestTab('Body')}
                    >
                      Body
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Auth' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveRequestTab('Auth')}
                    >
                      Auth
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Pre-request' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveRequestTab('Pre-request')}
                    >
                      Pre-request
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeRequestTab === 'Tests' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveRequestTab('Tests')}
                    >
                      Tests
                    </button>
                  </nav>
                </div>

                {/* Request Tab Content */}
                <div className="p-4">
                  {activeRequestTab === 'Params' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Parameters</h3>
                        <div className="flex space-x-2">
                          <button 
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                            onClick={() => window.location.reload()}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                          </button>
                          <button 
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                            onClick={handleAddParam}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {params.map((param, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" 
                              checked={param.enabled}
                              onChange={(e) => handleUpdateParam(index, 'enabled', e.target.checked)}
                            />
                            <input 
                              type="text" 
                              placeholder="Key" 
                              className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={param.key}
                              onChange={(e) => handleUpdateParam(index, 'key', e.target.value)}
                            />
                            <input 
                              type="text" 
                              placeholder="Value" 
                              className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={param.value}
                              onChange={(e) => handleUpdateParam(index, 'value', e.target.value)}
                            />
                            <button 
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                              onClick={() => handleRemoveParam(index)}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeRequestTab === 'Headers' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Headers</h3>
                        <div className="flex space-x-2">
                          <button 
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                            onClick={() => window.location.reload()}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                          </button>
                          <button 
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                            onClick={handleAddHeader}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {headers.map((header, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" 
                              checked={header.enabled}
                              onChange={(e) => handleUpdateHeader(index, 'enabled', e.target.checked)}
                            />
                            <input 
                              type="text" 
                              placeholder="Key" 
                              className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={header.key}
                              onChange={(e) => handleUpdateHeader(index, 'key', e.target.value)}
                            />
                            <input 
                              type="text" 
                              placeholder="Value" 
                              className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={header.value}
                              onChange={(e) => handleUpdateHeader(index, 'value', e.target.value)}
                            />
                            <button 
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                              onClick={() => handleRemoveHeader(index)}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeRequestTab === 'Body' && (
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-medium">
                          raw
                        </button>
                        <button className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md text-sm font-medium">
                          form-data
                        </button>
                        <button className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md text-sm font-medium">
                          x-www-form-urlencoded
                        </button>
                      </div>
                      <div className="relative">
                        <select className="absolute top-2 right-2 z-10 h-8 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>JSON</option>
                          <option>Text</option>
                          <option>JavaScript</option>
                          <option>HTML</option>
                          <option>XML</option>
                        </select>
                        <textarea
                          className="w-full h-64 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  )}

                  {activeRequestTab === 'Auth' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <select 
                          className="w-full h-10 pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                          value={auth.type}
                          onChange={(e) => setAuth({ ...auth, type: e.target.value as any })}
                        >
                          <option value="none">No Auth</option>
                          <option value="bearer">Bearer Token</option>
                          <option value="basic">Basic Auth</option>
                          <option value="apiKey">API Key</option>
                          <option value="oauth2">OAuth 2.0</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>

                      {auth.type === 'bearer' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Token</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your bearer token"
                            value={auth.credentials.token || ''}
                            onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, token: e.target.value } })}
                          />
                        </div>
                      )}

                      {auth.type === 'basic' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter username"
                            value={auth.credentials.username || ''}
                            onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, username: e.target.value } })}
                          />
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter password"
                            value={auth.credentials.password || ''}
                            onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, password: e.target.value } })}
                          />
                        </div>
                      )}

                      {auth.type === 'apiKey' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter key"
                                value={auth.credentials.key || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, key: e.target.value } })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter value"
                                value={auth.credentials.value || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, value: e.target.value } })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Add to</label>
                            <select
                              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={auth.credentials.addTo || 'header'}
                              onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, addTo: e.target.value as any } })}
                            >
                              <option value="header">Header</option>
                              <option value="query">Query Params</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {auth.type === 'oauth2' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client ID</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter client ID"
                                value={auth.credentials.clientId || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, clientId: e.target.value } })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Secret</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter client secret"
                                value={auth.credentials.clientSecret || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, clientSecret: e.target.value } })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Access Token URL</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter access token URL"
                              value={auth.credentials.tokenUrl || ''}
                              onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, tokenUrl: e.target.value } })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeRequestTab === 'Pre-request' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <select className="absolute top-2 right-2 z-10 h-8 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>JavaScript</option>
                          <option>Python</option>
                        </select>
                        <textarea
                          className="w-full h-64 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={preRequestScript}
                          onChange={(e) => setPreRequestScript(e.target.value)}
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  )}

                  {activeRequestTab === 'Tests' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <select className="absolute top-2 right-2 z-10 h-8 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>JavaScript</option>
                          <option>Python</option>
                        </select>
                        <textarea
                          className="w-full h-64 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={tests}
                          onChange={(e) => setTests(e.target.value)}
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Response Viewer */}
            <div className="w-full md:w-1/2 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 h-full">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex -mb-px">
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Response' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveResponseTab('Response')}
                    >
                      Response
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Headers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveResponseTab('Headers')}
                    >
                      Headers
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Cookies' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveResponseTab('Cookies')}
                    >
                      Cookies
                    </button>
                    <button 
                      className={`px-6 py-3 border-b-2 ${activeResponseTab === 'Timeline' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} font-medium text-sm focus:outline-none cursor-pointer`}
                      onClick={() => setActiveResponseTab('Timeline')}
                    >
                      Timeline
                    </button>
                  </nav>
                </div>

                <div className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Request failed</h3>
                          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                            {error}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : response ? (
                    <>
                      {activeResponseTab === 'Response' && (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                response.status >= 200 && response.status < 300 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : response.status >= 400 && response.status < 500
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {response.status} {response.statusText}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {response.timing.end - response.timing.start} ms
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {typeof response.data === 'string' 
                                  ? `${response.data.length} chars` 
                                  : `${JSON.stringify(response.data).length} bytes`}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                                onClick={handleCopyResponse}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                </svg>
                              </button>
                              <button 
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                                onClick={handleDownloadResponse}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="relative">
                            <div className="absolute top-0 right-0 p-2 flex space-x-2">
                              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                </svg>
                              </button>
                              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                              </button>
                            </div>
                            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                              {typeof response.data === 'string' 
                                ? response.data 
                                : JSON.stringify(response.data, null, 2)}
                            </pre>
                          </div>
                        </>
                      )}

                      {activeResponseTab === 'Headers' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Headers</h3>
                            <button 
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                              onClick={() => copyToClipboard(JSON.stringify(responseHeaders, null, 2))}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                              </svg>
                            </button>
                          </div>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Key</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {responseHeaders.map((header, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{header.key}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{header.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {activeResponseTab === 'Cookies' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Cookies</h3>
                            <button 
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                              onClick={() => copyToClipboard(JSON.stringify(cookies, null, 2))}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                              </svg>
                            </button>
                          </div>
                          {cookies.length > 0 ? (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Domain</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Path</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                  {cookies.map((cookie, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{cookie.name}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cookie.value}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cookie.domain}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cookie.path}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              No cookies received
                            </div>
                          )}
                        </div>
                      )}

                      {activeResponseTab === 'Timeline' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Timing</h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Total: {response.timing.end - response.timing.start} ms
                            </div>
                          </div>
                          <div className="space-y-2">
                            {timeline.map((phase, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-700 dark:text-gray-300">{phase.name}</span>
                                  <span className="text-gray-500 dark:text-gray-400">{phase.duration} ms</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(phase.duration / (response.timing.end - response.timing.start)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">No response yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Send a request to see the response here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}