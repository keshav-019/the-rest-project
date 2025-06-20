// components/Database/DatabaseActions.tsx
'use client'
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Plus, Trash2 } from 'lucide-react';

export const DatabaseActions = ({
    onAddSchema,
    onDeleteDatabase
}: {
    onAddSchema: () => void;
    onDeleteDatabase: () => void;
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
                            onClick={onAddSchema}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Schema</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={onDeleteDatabase}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Database</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};