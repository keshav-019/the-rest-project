'use client'
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableViewer } from './TableViewer';
import { CollectionViewer } from './CollectionViewer';
import { QueryEditorSQL } from './QueryEditorSQL';
import { DependencyGraph } from './DependencyGraph';
import { SchemaCanvas } from './SchemaCanvas';
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
            <div className="h-full w-full grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-900 p-6">
                <div className="text-center space-y-5 p-8 max-w-xl mx-auto rounded-2xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 shadow-sm">
                    <div className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 p-6 rounded-2xl">
                        <Database className="h-11 w-11 text-blue-600 dark:text-blue-300" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-gray-100">Welcome to Database Pro</h2>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                        Connect to your databases and start exploring your data.
                        Double-click on any table in the sidebar to get started.
                    </p>
                    <Button
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
            <div className="h-full min-h-0 flex flex-col overflow-hidden">
                <Tabs value={activeTab || ''} onValueChange={onTabChange} className="h-full min-h-0 flex flex-col">
                    <TabsList className="h-auto p-2 bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 rounded-none w-full justify-start gap-2 overflow-x-auto ui-scrollbar">
                        {openTabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`group flex items-center min-w-[180px] max-w-[280px] rounded-lg border relative ${activeTab === tab.id
                                    ? 'bg-white border-blue-200 text-blue-800 shadow-sm dark:bg-gray-800 dark:border-blue-700/40 dark:text-blue-100'
                                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <TabsTrigger
                                    value={tab.id}
                                    className="flex-1 px-3 py-2 text-left border-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none min-w-0 h-auto"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="truncate font-medium text-sm">{tab.title}</span>
                                        <span className="text-xs text-slate-500 dark:text-gray-400">
                                            {tab.type === 'table'
                                                ? '📊'
                                                : tab.type === 'collection'
                                                  ? '📁'
                                                  : tab.type === 'schema'
                                                    ? '🗺️'
                                                    : '⚡'}
                                        </span>
                                    </div>
                                </TabsTrigger>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-60 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 mr-2 shrink-0"
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
                            forceMount
                            className="flex-1 m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden"
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
                            {tab.type === 'schema' && (
                                <SchemaCanvas
                                    connection={tab.connection}
                                    database={tab.database}
                                    schema={tab.schema || 'default'}
                                    tables={tab.schemaObjects || []}
                                    isActive={activeTab === tab.id}
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
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Statistics</h3>
                                <div className="space-y-1 text-sm">
                                    <div>Live statistics are loaded from your connected database in the table and query views.</div>
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
                connectionId={showDependencyGraph.connection}
            />
        </>
    );
};
