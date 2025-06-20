/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useConnections.ts
'use client';
import { useEffect, useState } from 'react';
import DatabaseService from '@/lib/database-service';

export function useConnections() {
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const dbService = DatabaseService.getInstance();
                const data = await dbService.getConnections();
                setConnections(data);
            } catch (error) {
                console.error('Failed to fetch connections:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []);

    const refreshConnections = async () => {
        setLoading(true);
        try {
            const dbService = DatabaseService.getInstance();
            const data = await dbService.getConnections();
            setConnections(data);
        } catch (error) {
            console.error('Failed to refresh connections:', error);
        } finally {
            setLoading(false);
        }
    };

    return { connections, loading, refreshConnections };
}