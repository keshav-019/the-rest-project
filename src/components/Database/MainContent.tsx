'use client'
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableViewer } from './TableViewer';
import { CollectionViewer } from './CollectionViewer';
import { QueryEditorSQL } from './QueryEditorSQL';
import { DependencyGraph } from './DependencyGraph';
import { Database, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WindowTab } from '@/types/Connection';

interface MainContentProps {
    activeTab: string | null;
    openTabs: WindowTab[];
    onTabChange: (tabId: string) => void;
    onCloseTab: (tabId: string) => void;
    showDetails: { isOpen: boolean; database: string; connection: string };
    onCloseDetails: () => void;
    showDependencyGraph: { isOpen: boolean; database: string; connection: string };
    onCloseDependencyGraph: () => void;
    setShowConnectionDialog: (value: boolean) => void;
}

export const MainContent = ({
    activeTab,
    openTabs,
    onTabChange,
    onCloseTab,
    showDetails,
    onCloseDetails,
    showDependencyGraph,
    onCloseDependencyGraph,
    setShowConnectionDialog
}: MainContentProps) => {
    if (openTabs.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
                <div className="text-center space-y-6 p-8 max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center bg-gray-800 p-6 rounded-full">
                        <Database className="h-12 w-12 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-100">Welcome to DatabasePro</h2>
                    <p className="text-gray-400">
                        Connect to your databases and start exploring your data.
                        Double-click on any table in the sidebar to get started.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6 bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
                        onClick={() => setShowConnectionDialog(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Connection
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeTab || ''} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="h-auto p-0 bg-transparent border-b rounded-none w-full justify-start">
                        {openTabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`group flex items-center min-w-0 relative ${activeTab === tab.id
                                    ? 'bg-background border-b-2 border-primary'
                                    : 'hover:bg-accent/50'
                                    }`}
                            >
                                <TabsTrigger
                                    value={tab.id}
                                    className="flex-1 px-4 py-3 text-left border-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none min-w-0 h-auto"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="truncate font-medium">{tab.title}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {tab.type === 'table' ? '📊' : tab.type === 'collection' ? '📁' : '⚡'}
                                        </span>
                                    </div>
                                </TabsTrigger>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 mr-2 shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseTab(tab.id);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </TabsList>

                    {openTabs.map(tab => (
                        <TabsContent
                            key={tab.id}
                            value={tab.id}
                            className="flex-1 m-0 min-h-0 overflow-hidden"
                        >
                            {tab.type === 'table' && (
                                <TableViewer
                                    tableName={tab.title}
                                    connection={tab.connection}
                                    database={tab.database!}
                                />
                            )}
                            {tab.type === 'collection' && (
                                <CollectionViewer
                                    collectionName={tab.title}
                                    connection={tab.connection}
                                    database={tab.database!}
                                />
                            )}
                            {tab.type === 'query' && (
                                <QueryEditorSQL
                                    connection={tab.connection}
                                    database={tab.database}
                                />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <Dialog open={showDetails.isOpen} onOpenChange={onCloseDetails}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Database Details - {showDetails.database}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium mb-2">General Information</h3>
                                <div className="space-y-1 text-sm">
                                    <div>Database: {showDetails.database}</div>
                                    <div>Connection: {showDetails.connection}</div>
                                    <div>Type: SQL Database</div>
                                    <div>Tables: 15</div>
                                    <div>Size: 128 MB</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Statistics</h3>
                                <div className="space-y-1 text-sm">
                                    <div>Total Records: 45,230</div>
                                    <div>Active Connections: 3</div>
                                    <div>Last Backup: 2 hours ago</div>
                                    <div>Created: Jan 15, 2024</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DependencyGraph
                isOpen={showDependencyGraph.isOpen}
                onClose={onCloseDependencyGraph}
                schema={showDependencyGraph.database}
                table={''}
                connectionId={''}
            />
        </>
    );
};