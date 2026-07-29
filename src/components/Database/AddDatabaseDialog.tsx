/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DatabaseService from '@/lib/database-service';
import { useToast } from '@/hooks/useToast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface AddDatabaseDialogProps {
    isOpen: boolean;
    onClose: () => void;
    connectionType: 'sql' | 'nosql';
    connectionName: string;
    connectionId?: string
    onCreated?: () => void;
}

export const AddDatabaseDialog = ({ isOpen, onClose, connectionType, connectionName, connectionId, onCreated }: AddDatabaseDialogProps) => {
    const [databaseName, setDatabaseName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connectionId || !databaseName.trim()) {
            return;
        }

        setIsCreating(true);
        try {
            const dbService = DatabaseService.getInstance();
            await dbService.createDatabase(connectionId, databaseName.trim());
            toast({
                title: `${connectionType === 'sql' ? 'Database' : 'Collection'} created`,
                description: `${databaseName.trim()} was created on ${connectionName}.`,
                variant: 'default',
            });
            setDatabaseName('');
            onCreated?.();
            onClose();
        } catch (error) {
            toast({
                title: `Failed to create ${connectionType === 'sql' ? 'database' : 'collection'}`,
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive',
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Add {connectionType === 'sql' ? 'Database' : 'Collection'} to {connectionName}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {connectionType === 'sql' ? 'Database' : 'Collection'} Name
                        </Label>
                        <Input
                            id="name"
                            value={databaseName}
                            onChange={(e) => setDatabaseName(e.target.value)}
                            placeholder={connectionType === 'sql' ? 'new_database' : 'new_collection'}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? 'Creating...' : `Create ${connectionType === 'sql' ? 'Database' : 'Collection'}`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
