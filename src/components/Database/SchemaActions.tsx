// components/Database/SchemaActions.tsx
'use client'
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DatabaseZap, Plus, Trash2 } from 'lucide-react';

export const SchemaActions = ({
    onAddTable,
    onDeleteSchema,
    onShowDependencies
}: {
    onAddTable: () => void;
    onDeleteSchema: () => void;
    onShowDependencies: () => void;
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
                                onAddTable();
                            }}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Table</TooltipContent>
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
                    <TooltipContent>Schema Dependencies</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDeleteSchema();
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Schema</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
