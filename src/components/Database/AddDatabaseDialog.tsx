/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}

export const AddDatabaseDialog = ({ isOpen, onClose, connectionType, connectionName, connectionId }: AddDatabaseDialogProps) => {
    const [databaseName, setDatabaseName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle database/collection creation logic here
        console.log(`Creating ${connectionType === 'sql' ? 'database' : 'collection'}:`, databaseName);
        onClose();
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
                        <Button type="submit">
                            Create {connectionType === 'sql' ? 'Database' : 'Collection'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};