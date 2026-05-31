/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Database/ConnectionDialog.tsx
'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DatabaseService from '@/lib/database-service';
import { ConnectionConfig } from '@/types/Connection';
import { useToast } from '@/hooks/useToast';

interface ConnectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConnectionCreated: (connection: any) => void;
}

export const ConnectionDialog = ({ isOpen, onClose, onConnectionCreated }: ConnectionDialogProps) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'postgresql',
        host: 'localhost',
        port: '5432',
        username: '',
        password: '',
        database: ''
    });
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const dbService = DatabaseService.getInstance();
            const result = await dbService.testConnection({
                ...formData,
                databaseType: 'sql',
            } as ConnectionConfig);
            
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
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveConnection = async () => {
        setIsSaving(true);
        try {
            const dbService = DatabaseService.getInstance();
            const connection = await dbService.saveConnection({
                ...formData,
                databaseType: 'sql',
            } as ConnectionConfig);
            
            onConnectionCreated(connection);
            onClose();
            
            toast({
                title: "Connection saved",
                description: "Connection was saved successfully",
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Failed to save connection",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-gray-100">New Database Connection</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-gray-400">
                        Enter your database connection details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Connection Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Database Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({...formData, type: value})}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-100">
                                <SelectValue placeholder="Select database type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                                <SelectItem value="mysql">MySQL</SelectItem>
                                <SelectItem value="sqlserver">SQL Server</SelectItem>
                                <SelectItem value="oracle">Oracle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">Host</Label>
                            <Input
                                value={formData.host}
                                onChange={(e) => setFormData({...formData, host: e.target.value})}
                                className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-gray-300">Port</Label>
                            <Input
                                value={formData.port}
                                onChange={(e) => setFormData({...formData, port: e.target.value})}
                                className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Username</Label>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Password</Label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Database (optional)</Label>
                        <Input
                            value={formData.database}
                            onChange={(e) => setFormData({...formData, database: e.target.value})}
                            className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-slate-200 dark:border-gray-700"
                            onClick={handleTestConnection}
                            disabled={isTesting}
                        >
                            {isTesting ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSaveConnection}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Connection'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
