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
import { useToast } from '@/components/ui/use-toast';
import { ConnectionConfig } from '@/types/Connection';

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
            const result = await dbService.testConnection(formData as ConnectionConfig);
            
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
            const connection = await dbService.saveConnection(formData as ConnectionConfig);
            
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
            <DialogContent className="max-w-md bg-gray-800 border-0 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-gray-100">New Database Connection</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Enter your database connection details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Connection Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="bg-gray-700 border-0 text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Database Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({...formData, type: value})}
                        >
                            <SelectTrigger className="bg-gray-700 border-0 text-gray-100">
                                <SelectValue placeholder="Select database type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-0">
                                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                                <SelectItem value="mysql">MySQL</SelectItem>
                                <SelectItem value="sqlserver">SQL Server</SelectItem>
                                <SelectItem value="oracle">Oracle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Host</Label>
                            <Input
                                value={formData.host}
                                onChange={(e) => setFormData({...formData, host: e.target.value})}
                                className="bg-gray-700 border-0 text-gray-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Port</Label>
                            <Input
                                value={formData.port}
                                onChange={(e) => setFormData({...formData, port: e.target.value})}
                                className="bg-gray-700 border-0 text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Username</Label>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="bg-gray-700 border-0 text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Password</Label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="bg-gray-700 border-0 text-gray-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Database (optional)</Label>
                        <Input
                            value={formData.database}
                            onChange={(e) => setFormData({...formData, database: e.target.value})}
                            className="bg-gray-700 border-0 text-gray-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-gray-700 border-0 text-gray-100 hover:bg-gray-600"
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