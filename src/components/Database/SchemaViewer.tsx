// components/Database/SchemaViewer.tsx (modified)
'use client'
import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Table, ChevronDown, ChevronRight } from 'lucide-react';
import { SchemaObject } from '@/types/Connection';
import { TableActions } from './TableActions';
import { SchemaActions } from './SchemaActions';
import { TableDescriptionDialog } from './TableDescriptionDialog';

interface SchemaViewerProps {
    schema: {
        name: string;
        tables: SchemaObject[];
        views: SchemaObject[];
        functions: SchemaObject[];
        procedures: SchemaObject[];
    };
    connectionId: string;
    databaseName: string;
    onOpenTab: (tab: {
        id: string;
        title: string;
        type: 'table' | 'view' | 'function' | 'procedure';
        connection: string;
        database: string;
        schema: string;
    }) => void;
    onShowDependencyGraph: (schema: string, table: string) => void;
}

export const SchemaViewer = ({
    schema,
    connectionId,
    databaseName,
    onOpenTab,
    onShowDependencyGraph
}: SchemaViewerProps) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        tables: true,
        views: false,
        functions: false,
        procedures: false
    });
    const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState<SchemaObject | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleShowDescription = (table: SchemaObject) => {
        setSelectedTable(table);
        setShowDescriptionDialog(true);
    };

    return (
        <div className="space-y-2">
            {/* Schema Header with Actions */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md group">
                <div className="font-medium">{schema.name}</div>
                <SchemaActions
                    onAddTable={() => console.log('Add table to', schema.name)}
                    onDeleteSchema={() => console.log('Delete schema', schema.name)}
                    onShowDependencies={() => onShowDependencyGraph(schema.name, '')}
                />
            </div>

            {/* Tables Section */}
            <Collapsible open={expandedSections.tables} onOpenChange={() => toggleSection('tables')}>
                <div className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                    <CollapsibleTrigger className="flex items-center gap-2 w-full">
                        {expandedSections.tables ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                        <Table className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Tables</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                            {schema.tables.length}
                        </span>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="ml-6 space-y-1">
                    {schema.tables.map(table => (
                        <TableItem
                            key={table.name}
                            table={table}
                            onOpenTab={() => onOpenTab({
                                id: `${connectionId}-${databaseName}-${schema.name}-${table.name}`,
                                title: table.name,
                                type: 'table',
                                connection: connectionId,
                                database: databaseName,
                                schema: schema.name
                            })}
                            onShowDependencyGraph={() => onShowDependencyGraph(schema.name, table.name)}
                            onShowDescription={() => handleShowDescription(table)}
                        />
                    ))}
                </CollapsibleContent>
            </Collapsible>

            {/* Table Description Dialog */}
            {selectedTable && (
                <TableDescriptionDialog
                    isOpen={showDescriptionDialog}
                    onClose={() => setShowDescriptionDialog(false)}
                    tableName={selectedTable.name}
                    columns={selectedTable.columns || []}
                />
            )}
        </div>
    );
};

const TableItem = ({
    table,
    onOpenTab,
    onShowDependencyGraph,
    onShowDescription
}: {
    table: SchemaObject;
    onOpenTab: () => void;
    onShowDependencyGraph: () => void;
    onShowDescription: () => void;
}) => {
    return (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 group">
            <div
                className="flex items-center gap-2 cursor-pointer flex-1"
                onDoubleClick={onOpenTab}
            >
                <Table className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{table.name}</span>
            </div>
            <TableActions
                onOpenQueryEditor={onOpenTab}
                onShowDescription={onShowDescription}
                onShowDependencies={onShowDependencyGraph}
                onDeleteTable={() => console.log('Delete table', table.name)}
            />
        </div>
    );
};