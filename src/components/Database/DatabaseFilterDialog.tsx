// components/Database/DatabaseFilterDialog.tsx
'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConnectionConfig } from '@/types/Connection';

interface DatabaseFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    connections: ConnectionConfig[];
    filteredDatabases: Record<string, string[]>;
    onFilterChange: (newFilters: Record<string, string[]>) => void;
}

export const DatabaseFilterDialog = ({
    isOpen,
    onClose,
    connections,
    filteredDatabases,
    onFilterChange
}: DatabaseFilterDialogProps) => {
    const [localFilters, setLocalFilters] = useState<Record<string, string[]>>({});
    const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

    // Initialize local state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters({ ...filteredDatabases });
        }
    }, [isOpen, filteredDatabases]);

    const handleSelectAll = (connectionId: string, select: boolean) => {
        const connection = connections.find(c => c.id === connectionId);
        if (!connection) return;

        const allDbs = connection.databases?.map(db => db.name) || [];

        setLocalFilters(prev => ({
            ...prev,
            [connectionId]: select ? [] : allDbs
        }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
        onClose();
    };

    const resetFilters = () => {
        onFilterChange({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Filter Databases</DialogTitle>
                    <DialogDescription>
                        Select which databases to show for each connection
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 h-[500px]">
                    {/* Connection list */}
                    <div className="w-1/3 border-r pr-4">
                        <div className="space-y-2">
                            {connections.map(connection => (
                                <Button
                                    key={connection.id}
                                    variant={selectedConnection === connection.id ? 'default' : 'ghost'}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedConnection(connection.id)}
                                >
                                    {connection.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Database list for selected connection */}
                    <div className="w-2/3">
                        {selectedConnection ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium">
                                        {connections.find(c => c.id === selectedConnection)?.name}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSelectAll(selectedConnection, true)}
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSelectAll(selectedConnection, false)}
                                        >
                                            Deselect All
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select a connection to filter its databases
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={resetFilters}>
                        Reset All Filters
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={applyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};