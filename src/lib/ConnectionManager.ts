// ConnectionManager.ts (new utility class)
import { Pool, PoolConfig } from 'pg';

class ConnectionManager {
    private static instance: ConnectionManager;
    private pools: Map<string, Pool> = new Map();
    
    private constructor() {}
    
    public static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }
    
    getPool(key: string, config: PoolConfig): Pool {
        if (!this.pools.has(key)) {
            const pool = new Pool(config);
            this.pools.set(key, pool);
        }
        return this.pools.get(key)!;
    }
    
    async cleanup() {
        await Promise.all(
            Array.from(this.pools.values()).map(pool => pool.end())
        );
        this.pools.clear();
    }
}

export default ConnectionManager;