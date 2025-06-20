'use client'
import { Input } from '@/components/ui/input';
import { Database, Search } from 'lucide-react';

export const TopToolbar = () => {

    return (
        <div className="h-14 border-b bg-card px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-semibold">DatabasePro</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search connections..."
                        className="pl-10 w-64"
                    />
                </div>
            </div>
        </div>
    );
};