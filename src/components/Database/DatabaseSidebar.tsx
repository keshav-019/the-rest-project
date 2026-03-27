/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Database/DatabaseSidebar.tsx
'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Database, Search, ChevronRight, ChevronDown, Circle,
    Plus, RefreshCw, Trash2, Eye,
    TableIcon
} from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import DatabaseService from '@/lib/database-service';
import { ConnectionConfig, SchemaObject, WindowTab } from '@/types/Connection';
import { SchemaActions } from './SchemaActions';
import { TableActions } from './TableActions';
import { useToast } from '@/hooks/useToast';

interface DatabaseSidebarProps {
    connections: ConnectionConfig[];
    loading: boolean;
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

export const DatabaseSidebar = ({
    connections,
    loading,
    onOpenTab,
    onShowDetails,
    onShowDependencyGraph,
    refreshConnections,
    showConnectionDialog,
    setShowConnectionDialog
}: DatabaseSidebarProps) => {
    const { toast } = useToast();
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
        connectionId: ''
    });
    const [databaseStructures, setDatabaseStructures] = useState<Record<string, DatabaseStructure>>({});
    const [loadingStructures, setLoadingStructures] = useState<Record<string, boolean>>({});
    const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({});
    const [filteredDatabases, setFilteredDatabases] = useState<Record<string, string[]>>({});
    const [showTableDescription, setShowTableDescription] = useState({
        isOpen: false,
        table: null as SchemaObject | null
    });

    const toggleConnection = async (connectionId: string) => {
        if (expandedConnections.includes(connectionId)) {
            setExpandedConnections(prev => prev.filter(id => id !== connectionId));
            setExpandedDatabases(prev => prev.filter(id => !id.startsWith(`${connectionId}-`)));
        } else {
            setExpandedConnections(prev => [...prev, connectionId]);
            await loadDatabaseStructure(connectionId);
        }
    };

    const loadDatabaseStructure = async (connectionId: string) => {
        setLoadingStructures(prev => ({ ...prev, [connectionId]: true }));

        try {
            const dbService = DatabaseService.getInstance();
            const structure = await dbService.getDatabaseStructure(connectionId);

            setDatabaseStructures(prev => ({
                ...prev,
                [connectionId]: structure
            }));
        } catch (error: any) {
            toast({
                title: "Failed to load structure",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoadingStructures(prev => ({ ...prev, [connectionId]: false }));
        }
    };

    const toggleDatabase = (connectionId: string, databaseName: string) => {
        const dbId = `${connectionId}-${databaseName}`;
        setExpandedDatabases(prev =>
            prev.includes(dbId)
                ? prev.filter(id => id !== dbId)
                : [...prev, dbId]
        );
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

    const filteredConnections = connections.filter(conn =>
        conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <TooltipProvider>
            <div className="w-full h-full flex flex-col overflow-hidden">
                {/* Header with search and actions */}
                <div className="p-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter connections..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowConnectionDialog(true)}
                            className="flex-1"
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Connection
                        </Button>
                    </div>
                </div>

                {/* Connection list */}
                <div className="flex-1 min-h-0 relative"> {/* Add min-h-0 and overflow-hidden */}
                    <ScrollArea className="absolute inset-0">
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
                                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer group/connection"
                                            onClick={() => toggleConnection(connection.id)}
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                {expandedConnections.includes(connection.id) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                                <Database className={`h-4 w-4 ${connection.databaseType === 'sql' ? 'text-blue-500' : 'text-green-500'}`} />
                                                <span className="truncate">{connection.name}</span>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover/connection:opacity-100">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                refreshConnections();
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
                                                            className="h-6 w-6 p-0"
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
                                                            className="h-6 w-6 p-0 text-red-500"
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
                                            <div className="ml-6 space-y-1">
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
                                                        .map(database => (
                                                            <div key={`${connection.id}-${database.name}`} className="space-y-1">
                                                                {/* Database header with actions */}
                                                                <div
                                                                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer group/database"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleDatabase(connection.id, database.name);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        {expandedDatabases.includes(`${connection.id}-${database.name}`) ? (
                                                                            <ChevronDown className="h-3 w-3" />
                                                                        ) : (
                                                                            <ChevronRight className="h-3 w-3" />
                                                                        )}
                                                                        <Database className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="text-sm">{database.name}</span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1 opacity-0 group-hover/database:opacity-100">
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
                                                                {expandedDatabases.includes(`${connection.id}-${database.name}`) && (
                                                                    <div className="ml-6 space-y-2">
                                                                        {database.schemas?.map(schema => (
                                                                            <div key={`${connection.id}-${database.name}-${schema.name}`} className="space-y-1">
                                                                                <div
                                                                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer group/schema"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toggleSchema(connection.id, database.name, schema.name);
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        {expandedSchemas.includes(`${connection.id}-${database.name}-${schema.name}`) ? (
                                                                                            <ChevronDown className="h-3 w-3" />
                                                                                        ) : (
                                                                                            <ChevronRight className="h-3 w-3" />
                                                                                        )}
                                                                                        <span className="font-medium">{schema.name}</span>
                                                                                    </div>
                                                                                    <SchemaActions
                                                                                        onAddTable={() => handleAddTable(connection.id, database.name, schema.name)}
                                                                                        onDeleteSchema={() => handleDeleteSchema(connection.id, database.name, schema.name)}
                                                                                        onShowDependencies={() => setShowDependencyGraph({
                                                                                            isOpen: true,
                                                                                            schema: schema.name,
                                                                                            table: '',
                                                                                            connectionId: connection.id
                                                                                        })}
                                                                                    />
                                                                                </div>

                                                                                {expandedSchemas.includes(`${connection.id}-${database.name}-${schema.name}`) && (
                                                                                    <div className="ml-4 space-y-1">
                                                                                        {loadingTables[`${connection.id}-${database.name}-${schema.name}`] ? (
                                                                                            <div className="flex items-center p-2 text-sm text-muted-foreground">
                                                                                                <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                                                                                                Loading tables...
                                                                                            </div>
                                                                                        ) : (
                                                                                            schema.tables.map(table => (
                                                                                                // Update the table item rendering in DatabaseSidebar.tsx
                                                                                                <div
                                                                                                    key={table.name}
                                                                                                    className="flex items-center p-2 rounded-md hover:bg-accent/50 group/table"
                                                                                                >
                                                                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                                                        <TableIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                                                                                        <span
                                                                                                            className="text-sm truncate transition-all duration-100 group-hover/table:max-w-[calc(100%-100px)]"
                                                                                                            title={table.name}
                                                                                                        >
                                                                                                            {table.name}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="flex-shrink-0 opacity-0 group-hover/table:opacity-100 ml-2">
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
                                                                                                                connectionId: connection.id
                                                                                                            })}
                                                                                                            onDeleteTable={() => handleDeleteTable(connection.id, database.name, schema.name, table.name)}
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
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
                    </ScrollArea>
                </div>

                {/* Keep all dialog components the same as before */}
            </div>
        </TooltipProvider>
    );
};