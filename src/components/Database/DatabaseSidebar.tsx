/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Database/DatabaseSidebar.tsx
'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Database, Search, ChevronRight, ChevronDown, Circle,
    Plus, RefreshCw, Trash2, Eye,
    TableIcon, Workflow
} from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import DatabaseService from '@/lib/database-service';
import { ConnectionConfig, SchemaObject, WindowTab } from '@/types/Connection';
import { SchemaActions } from './SchemaActions';
import { TableActions } from './TableActions';
import { useToast } from '@/hooks/useToast';
import { DependencyGraph } from './DependencyGraph';
import { AddDatabaseDialog } from './AddDatabaseDialog';
import { TableDescriptionDialog } from './TableDescriptionDialog';

interface DatabaseSidebarProps {
    connections: ConnectionConfig[];
    loading: boolean;
    onConnectionSelect: (connection: ConnectionConfig) => void;
    onOpenTab: (tab: WindowTab) => void;
    onShowDetails: (database: string, connection: string) => void;
    onShowDependencyGraph: (database: string, connection: string) => void;
    refreshConnections: () => void;
    showConnectionDialog: boolean;
    setShowConnectionDialog: (value: boolean) => void;
}

interface DatabaseStructure {
    databases: Array<{
        name: string;
        schemas: Array<{
            name: string;
            tables: SchemaObject[];
            views: SchemaObject[];
            functions: SchemaObject[];
            procedures: SchemaObject[];
        }>;
    }>;
}

const STRUCTURE_CACHE_TTL_MS = 5 * 60 * 1000;

export const DatabaseSidebar = ({
    connections,
    loading,
    onConnectionSelect,
    onOpenTab,
    onShowDetails,
    onShowDependencyGraph,
    refreshConnections,
    showConnectionDialog,
    setShowConnectionDialog
}: DatabaseSidebarProps) => {
    const { toast } = useToast();
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedConnections, setExpandedConnections] = useState<string[]>([]);
    const [expandedDatabases, setExpandedDatabases] = useState<string[]>([]);
    const [expandedSchemas, setExpandedSchemas] = useState<string[]>([]);
    const [showAddDatabaseDialog, setShowAddDatabaseDialog] = useState({
        isOpen: false,
        connectionId: '',
        connectionType: 'sql' as 'sql' | 'nosql',
        connectionName: ''
    });
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [showDependencyGraph, setShowDependencyGraph] = useState({
        isOpen: false,
        schema: '',
        table: '',
        connectionId: '',
        database: '',
    });
    const [databaseStructures, setDatabaseStructures] = useState<Record<string, DatabaseStructure>>({});
    const [loadingStructures, setLoadingStructures] = useState<Record<string, boolean>>({});
    const [fetchingStructures, setFetchingStructures] = useState<Record<string, boolean>>({});
    const [loadingDatabaseDetails, setLoadingDatabaseDetails] = useState<Record<string, boolean>>({});
    const [structureLoadedAt, setStructureLoadedAt] = useState<Record<string, number>>({});
    const [databaseDetailsLoaded, setDatabaseDetailsLoaded] = useState<Record<string, boolean>>({});
    const [filteredDatabases, setFilteredDatabases] = useState<Record<string, string[]>>({});
    const [showTableDescription, setShowTableDescription] = useState({
        isOpen: false,
        table: null as SchemaObject | null
    });

    const loadDatabaseStructure = async (
        connectionId: string,
        options: { force?: boolean; showSpinner?: boolean } = {}
    ) => {
        const { force = false, showSpinner = true } = options;
        const now = Date.now();
        const loadedAt = structureLoadedAt[connectionId] || 0;
        const hasFreshCache = Boolean(databaseStructures[connectionId]?.databases) && now - loadedAt < STRUCTURE_CACHE_TTL_MS;

        if (fetchingStructures[connectionId]) {
            return;
        }

        if (!force && hasFreshCache) {
            return;
        }

        if (showSpinner) {
            setLoadingStructures(prev => ({ ...prev, [connectionId]: true }));
        }
        setFetchingStructures(prev => ({ ...prev, [connectionId]: true }));

        try {
            const dbService = DatabaseService.getInstance();
            const structure = await dbService.getDatabaseStructure(connectionId, {
                includeTables: false,
            });

            setDatabaseStructures(prev => ({
                ...prev,
                [connectionId]: structure
            }));
            setStructureLoadedAt(prev => ({
                ...prev,
                [connectionId]: Date.now(),
            }));
            setDatabaseDetailsLoaded(prev => {
                const next = { ...prev };
                Object.keys(next).forEach((key) => {
                    if (key.startsWith(`${connectionId}-`)) {
                        delete next[key];
                    }
                });
                return next;
            });
        } catch (error: any) {
            toast({
                title: "Failed to load structure",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            if (showSpinner) {
                setLoadingStructures(prev => ({ ...prev, [connectionId]: false }));
            }
            setFetchingStructures(prev => ({ ...prev, [connectionId]: false }));
        }
    };

    const loadDatabaseDetails = async (
        connectionId: string,
        databaseName: string,
        options: { force?: boolean } = {}
    ) => {
        const { force = false } = options;
        const databaseKey = `${connectionId}-${databaseName}`;
        if (loadingDatabaseDetails[databaseKey]) {
            return;
        }
        if (!force && databaseDetailsLoaded[databaseKey]) {
            return;
        }

        setLoadingDatabaseDetails(prev => ({ ...prev, [databaseKey]: true }));

        try {
            const dbService = DatabaseService.getInstance();
            const structure = await dbService.getDatabaseStructure(connectionId, {
                databaseOverride: databaseName,
                includeTables: true,
            });
            const resolvedDatabase =
                structure.databases.find((entry) => entry.name === databaseName) ||
                structure.databases[0];

            if (!resolvedDatabase) {
                return;
            }

            setDatabaseStructures(prev => {
                const existing = prev[connectionId]?.databases || [];
                const nextDatabases = existing.some((entry) => entry.name === databaseName)
                    ? existing.map((entry) => (entry.name === databaseName ? resolvedDatabase : entry))
                    : [...existing, resolvedDatabase];

                return {
                    ...prev,
                    [connectionId]: {
                        databases: nextDatabases.sort((a, b) => a.name.localeCompare(b.name)),
                    },
                };
            });

            setDatabaseDetailsLoaded(prev => ({
                ...prev,
                [databaseKey]: true,
            }));
        } catch (error: any) {
            toast({
                title: "Failed to load tables",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoadingDatabaseDetails(prev => ({ ...prev, [databaseKey]: false }));
        }
    };

    const toggleConnection = async (connectionId: string) => {
        if (expandedConnections.includes(connectionId)) {
            setExpandedConnections(prev => prev.filter(id => id !== connectionId));
            setExpandedDatabases(prev => prev.filter(id => !id.startsWith(`${connectionId}-`)));
            return;
        }

        setExpandedConnections(prev => [...prev, connectionId]);

        const hasExistingStructure = Boolean(databaseStructures[connectionId]?.databases);
        if (!hasExistingStructure) {
            await loadDatabaseStructure(connectionId, { showSpinner: true });
            return;
        }

        const now = Date.now();
        const loadedAt = structureLoadedAt[connectionId] || 0;
        const isStale = now - loadedAt >= STRUCTURE_CACHE_TTL_MS;
        if (isStale) {
            void loadDatabaseStructure(connectionId, { showSpinner: false });
        }
    };

    const toggleDatabase = async (connectionId: string, databaseName: string) => {
        const dbId = `${connectionId}-${databaseName}`;
        const isExpanded = expandedDatabases.includes(dbId);
        setExpandedDatabases(prev =>
            isExpanded
                ? prev.filter(id => id !== dbId)
                : [...prev, dbId]
        );

        if (!isExpanded) {
            await loadDatabaseDetails(connectionId, databaseName);
        }
    };

    const toggleSchema = (connectionId: string, databaseName: string, schemaName: string) => {
        const schemaId = `${connectionId}-${databaseName}-${schemaName}`;
        setExpandedSchemas(prev =>
            prev.includes(schemaId)
                ? prev.filter(id => id !== schemaId)
                : [...prev, schemaId]
        );
    };

    const handleTestConnection = async (connectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const connection = connections.find(c => c.id === connectionId);
            if (!connection) return;

            const dbService = DatabaseService.getInstance();
            const result = await dbService.testConnection(connection);

            toast({
                title: "Connection successful",
                description: result.message,
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Connection failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteConnection = async (connectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            // TODO: Implement delete connection logic
            // const dbService = DatabaseService.getInstance();
            // await dbService.deleteConnection(connectionId);
            toast({
                title: "Connection deleted",
                variant: "default",
            });
            refreshConnections();
        } catch (error: any) {
            toast({
                title: "Failed to delete connection",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteDatabase = async (connectionId: string, databaseName: string) => {
        try {
            // TODO: Implement delete database logic
            // const dbService = DatabaseService.getInstance();
            // await dbService.deleteDatabase(connectionId, databaseName);
            toast({
                title: "Database deleted",
                variant: "default",
            });
            refreshConnections();
        } catch (error: any) {
            toast({
                title: "Failed to delete database",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleAddTable = async (connectionId: string, databaseName: string, schemaName: string) => {
        try {
            // TODO: Implement add table logic
            // const dbService = DatabaseService.getInstance();
            // await dbService.createTable(connectionId, databaseName, schemaName, {
            //   name: `new_table_${Date.now()}`,
            //   columns: [{ name: 'id', type: 'serial', constraints: ['PRIMARY KEY'] }]
            // });
            toast({
                title: "Table created",
                variant: "default",
            });
            refreshConnections();
        } catch (error: any) {
            toast({
                title: "Failed to create table",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteSchema = async (connectionId: string, databaseName: string, schemaName: string) => {
        try {
            // TODO: Implement delete schema logic
            // const dbService = DatabaseService.getInstance();
            // await dbService.deleteSchema(connectionId, databaseName, schemaName);
            toast({
                title: "Schema deleted",
                variant: "default",
            });
            refreshConnections();
        } catch (error: any) {
            toast({
                title: "Failed to delete schema",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteTable = async (connectionId: string, databaseName: string, schemaName: string, tableName: string) => {
        try {
            // TODO: Implement delete table logic
            // const dbService = DatabaseService.getInstance();
            // await dbService.deleteTable(connectionId, databaseName, schemaName, tableName);
            toast({
                title: "Table deleted",
                variant: "default",
            });
            refreshConnections();
        } catch (error: any) {
            toast({
                title: "Failed to delete table",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleOpenSchemaCanvas = (
        connectionId: string,
        databaseName: string,
        schemaName: string,
        fallbackTables: SchemaObject[]
    ) => {
        onOpenTab({
            id: `schema-${connectionId}-${databaseName}-${schemaName}`,
            title: `${databaseName} -> ${schemaName} Schema Map`,
            type: 'schema',
            connection: connectionId,
            database: databaseName,
            schema: schemaName,
            schemaObjects: fallbackTables,
        });
    };

    const filteredConnections = connections.filter(conn =>
        conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <TooltipProvider>
            <div className="flex h-full w-full min-w-[360px] flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                {/* Header with search and actions */}
                <div className="space-y-3 border-b border-slate-200 bg-slate-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/80">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Filter connections..."
                            className="h-9 rounded-lg border-slate-200 bg-white pl-10 text-sm dark:border-gray-700 dark:bg-gray-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowConnectionDialog(true)}
                            className="h-9 flex-1 rounded-lg border-transparent bg-blue-600 text-white hover:bg-blue-700"
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Connection
                        </Button>
                    </div>
                </div>

                {/* Connection list */}
                <div className="relative min-h-0 flex-1">
                    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden ui-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center p-4">
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading connections...</span>
                            </div>
                        ) : (
                            <div className="space-y-1 p-2">
                                {filteredConnections.map(connection => (
                                    <div key={connection.id} className="space-y-1">
                                        {/* Connection header with actions */}
                                        <div
                                            className={`grid min-h-11 grid-cols-[minmax(0,1fr)_112px] items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer transition-colors ${selectedConnectionId === connection.id
                                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40'
                                                : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800/80'
                                                }`}
                                            onClick={() => {
                                                setSelectedConnectionId(connection.id);
                                                onConnectionSelect(connection);
                                                void toggleConnection(connection.id);
                                            }}
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                {expandedConnections.includes(connection.id) ? (
                                                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 dark:text-gray-300" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 dark:text-gray-300" />
                                                )}
                                                <Database className={`h-4 w-4 shrink-0 ${connection.databaseType === 'sql' ? 'text-blue-500' : 'text-emerald-500'}`} />
                                                <span className="truncate min-w-0 text-sm font-medium" title={connection.name}>
                                                    {connection.name}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-4 justify-items-center gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void refreshConnections();
                                                                void loadDatabaseStructure(connection.id, { force: true, showSpinner: true });
                                                            }}
                                                        >
                                                            <RefreshCw className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Refresh</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowAddDatabaseDialog({
                                                                    isOpen: true,
                                                                    connectionId: connection.id,
                                                                    connectionType: connection.databaseType,
                                                                    connectionName: connection.name
                                                                });
                                                            }}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Add Database</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-300 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/30"
                                                            onClick={(e) => handleTestConnection(connection.id, e)}
                                                        >
                                                            <Circle className="h-2 w-2" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Test Connection</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={(e) => handleDeleteConnection(connection.id, e)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete Connection</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* Database content when expanded */}
                                        {expandedConnections.includes(connection.id) && (
                                            <div className="ml-3 space-y-1 border-l border-slate-200/80 pl-3 dark:border-gray-700/80">
                                                {loadingStructures[connection.id] ? (
                                                    <div className="flex items-center p-2 text-sm text-muted-foreground">
                                                        <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                                                        Loading databases...
                                                    </div>
                                                ) : databaseStructures[connection.id]?.databases ? (
                                                    databaseStructures[connection.id].databases
                                                        .filter(db =>
                                                            !filteredDatabases[connection.id] ||
                                                            filteredDatabases[connection.id].includes(db.name)
                                                        )
                                                        .map(database => {
                                                            const databaseId = `${connection.id}-${database.name}`;
                                                            const isDatabaseExpanded = expandedDatabases.includes(databaseId);
                                                            const isDatabaseLoading = Boolean(loadingDatabaseDetails[databaseId]);
                                                            const hasSchemas = (database.schemas?.length || 0) > 0;

                                                            return (
                                                            <div key={databaseId} className="space-y-1">
                                                                {/* Database header with actions */}
                                                                <div
                                                                    className="grid min-h-10 grid-cols-[minmax(0,1fr)_56px] items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 cursor-pointer hover:border-slate-200 hover:bg-slate-100 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        void toggleDatabase(connection.id, database.name);
                                                                    }}
                                                                >
                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                        {isDatabaseExpanded ? (
                                                                            <ChevronDown className="h-3 w-3 shrink-0" />
                                                                        ) : (
                                                                            <ChevronRight className="h-3 w-3 shrink-0" />
                                                                        )}
                                                                        <Database className="h-3 w-3 text-muted-foreground shrink-0" />
                                                                        <span className="text-sm truncate min-w-0" title={database.name}>{database.name}</span>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 justify-items-center gap-1">
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 w-6 p-0"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setShowAddDatabaseDialog({
                                                                                            isOpen: true,
                                                                                            connectionId: connection.id,
                                                                                            connectionType: connection.databaseType,
                                                                                            connectionName: connection.name
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Add Database</TooltipContent>
                                                                        </Tooltip>

                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 w-6 p-0 text-red-500"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteDatabase(connection.id, database.name);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Delete Database</TooltipContent>
                                                                        </Tooltip>
                                                                    </div>
                                                                </div>

                                                                {/* Schema content when expanded */}
                                                                {isDatabaseExpanded && (
                                                                    <div className="ml-3 space-y-2 border-l border-slate-200/80 pl-3 dark:border-gray-700/80">
                                                                        {isDatabaseLoading ? (
                                                                            <div className="flex items-center p-2 text-sm text-muted-foreground">
                                                                                <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                                                                                Loading tables...
                                                                            </div>
                                                                        ) : hasSchemas ? (
                                                                            database.schemas?.map((schema) => {
                                                                                const schemaId = `${connection.id}-${database.name}-${schema.name}`;
                                                                                const isSchemaExpanded = expandedSchemas.includes(schemaId);
                                                                                const schemaTables = schema.tables || [];

                                                                                return (
                                                                                    <div key={schemaId} className="space-y-1">
                                                                                        <div
                                                                                            className="grid min-h-10 grid-cols-[minmax(0,1fr)_84px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 cursor-pointer dark:border-gray-700 dark:bg-gray-800"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                toggleSchema(connection.id, database.name, schema.name);
                                                                                            }}
                                                                                        >
                                                                                            <div className="flex min-w-0 items-center gap-2">
                                                                                                {isSchemaExpanded ? (
                                                                                                    <ChevronDown className="h-3 w-3 shrink-0" />
                                                                                                ) : (
                                                                                                    <ChevronRight className="h-3 w-3 shrink-0" />
                                                                                                )}
                                                                                                <span className="font-medium truncate min-w-0" title={schema.name}>
                                                                                                    {schema.name}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="w-[84px] shrink-0">
                                                                                                <SchemaActions
                                                                                                    onAddTable={() => handleAddTable(connection.id, database.name, schema.name)}
                                                                                                    onDeleteSchema={() => handleDeleteSchema(connection.id, database.name, schema.name)}
                                                                                                    onShowDependencies={() => setShowDependencyGraph({
                                                                                                        isOpen: true,
                                                                                                        schema: schema.name,
                                                                                                        table: schema.tables[0]?.name || '',
                                                                                                        connectionId: connection.id,
                                                                                                        database: database.name,
                                                                                                    })}
                                                                                                />
                                                                                            </div>
                                                                                        </div>

                                                                                        {isSchemaExpanded && (
                                                                                            <div className="ml-3 space-y-1 border-l border-slate-200/80 pl-3 dark:border-gray-700/80">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="grid min-h-10 w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-blue-700 transition-transform hover:bg-blue-100 active:scale-[0.99] dark:border-blue-700/40 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        handleOpenSchemaCanvas(
                                                                                                            connection.id,
                                                                                                            database.name,
                                                                                                            schema.name,
                                                                                                            schemaTables
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    <span className="min-w-0 flex-1 flex items-center gap-2 text-xs font-semibold">
                                                                                                        <Workflow className="h-4 w-4 shrink-0" />
                                                                                                        <span className="truncate">Schema Canvas</span>
                                                                                                    </span>
                                                                                                    <span className="text-[11px] opacity-80 shrink-0">
                                                                                                        {schemaTables.length} tables
                                                                                                    </span>
                                                                                                </button>
                                                                                                {schemaTables.map((table) => (
                                                                                                    <div
                                                                                                        key={table.name}
                                                                                                        className="grid min-h-10 grid-cols-[minmax(0,1fr)_104px] items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-gray-800"
                                                                                                    >
                                                                                                        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                                                                                                            <TableIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                                                                                            <span
                                                                                                                className="text-sm truncate min-w-0"
                                                                                                                title={table.name}
                                                                                                            >
                                                                                                                {table.name}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <div className="w-[104px] shrink-0">
                                                                                                            <TableActions
                                                                                                                onOpenQueryEditor={() => onOpenTab({
                                                                                                                    id: `${connection.id}-${database.name}-${schema.name}-${table.name}`,
                                                                                                                    title: table.name,
                                                                                                                    type: 'table',
                                                                                                                    connection: connection.id,
                                                                                                                    database: database.name,
                                                                                                                    schema: schema.name
                                                                                                                })}
                                                                                                                onShowDescription={() => setShowTableDescription({
                                                                                                                    isOpen: true,
                                                                                                                    table: table
                                                                                                                })}
                                                                                                                onShowDependencies={() => setShowDependencyGraph({
                                                                                                                    isOpen: true,
                                                                                                                    schema: schema.name,
                                                                                                                    table: table.name,
                                                                                                                    connectionId: connection.id,
                                                                                                                    database: database.name,
                                                                                                                })}
                                                                                                                onDeleteTable={() => handleDeleteTable(connection.id, database.name, schema.name, table.name)}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            <div className="text-sm text-muted-foreground p-2">
                                                                                No tables found
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )})
                                                ) : (
                                                    <div className="text-sm text-muted-foreground p-2">
                                                        No databases found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <AddDatabaseDialog
                    isOpen={showAddDatabaseDialog.isOpen}
                    onClose={() => setShowAddDatabaseDialog({
                        isOpen: false,
                        connectionId: '',
                        connectionType: 'sql',
                        connectionName: '',
                    })}
                    connectionId={showAddDatabaseDialog.connectionId}
                    connectionType={showAddDatabaseDialog.connectionType}
                    connectionName={showAddDatabaseDialog.connectionName}
                    onCreated={() => {
                        refreshConnections();
                        if (showAddDatabaseDialog.connectionId) {
                            void loadDatabaseStructure(showAddDatabaseDialog.connectionId, {
                                force: true,
                                showSpinner: true,
                            });
                        }
                    }}
                />

                {showTableDescription.table ? (
                    <TableDescriptionDialog
                        isOpen={showTableDescription.isOpen}
                        onClose={() => setShowTableDescription({
                            isOpen: false,
                            table: null,
                        })}
                        tableName={showTableDescription.table.name}
                        columns={showTableDescription.table.columns || []}
                    />
                ) : null}

                <DependencyGraph
                    isOpen={showDependencyGraph.isOpen}
                    onClose={() => setShowDependencyGraph({
                        isOpen: false,
                        schema: '',
                        table: '',
                        connectionId: '',
                        database: '',
                    })}
                    schema={showDependencyGraph.schema}
                    table={showDependencyGraph.table}
                    connectionId={showDependencyGraph.connectionId}
                    database={showDependencyGraph.database}
                />
            </div>
        </TooltipProvider>
    );
};
