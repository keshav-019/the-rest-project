// components/Database/TableActions.tsx
'use client'
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DatabaseZap, Table, FileEdit, Trash2 } from 'lucide-react';

export const TableActions = ({
    onOpenQueryEditor,
    onShowDescription,
    onShowDependencies,
    onDeleteTable
}: {
    onOpenQueryEditor: () => void;
    onShowDescription: () => void;
    onShowDependencies: () => void;
    onDeleteTable: () => void;
}) => {
    return (
        <TooltipProvider>
            <div className="flex gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(event) => {
                                event.stopPropagation();
                                onOpenQueryEditor();
                            }}
                        >
                            <FileEdit className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Query Editor</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(event) => {
                                event.stopPropagation();
                                onShowDescription();
                            }}
                        >
                            <Table className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Table Description</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(event) => {
                                event.stopPropagation();
                                onShowDependencies();
                            }}
                        >
                            <DatabaseZap className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Dependencies</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDeleteTable();
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Table</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
