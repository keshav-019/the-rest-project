import { Collection } from "./Collections";

// types/User.ts
export interface UserData {
    name: string | undefined | null,
    username: string | undefined | null,
    createdAt?: Date,
    isNewUser?: boolean,
    personalCollections: Collection[];
    teams: {
        [teamId: string]: {
            collections: Collection[];
            environments: Environment[];
            lastSynced: Date;
        }
    };
    recentActivity: {
        type: 'collection_created' | 'request_created' | 'folder_created';
        id: string;
        name: string;
        timestamp: Date;
        teamId?: string; // if it's a team activity
    }[];
    settings: {
        defaultEnvironment?: string;
    };
}
  
export interface Environment {
    id: string;
    name: string;
    variables: {
      name: string;
      value: string;
    }[];
    isShared: boolean;
}

export interface ProviderData {
    provider: string,
    uid: string,
    displayName: string,
    phoneNumber: string | null | undefined,
    photoURL: string | null | undefined,
    providerId: string,
    email: string
}

export interface User {
    uid: string,
    displayName: string,
    email: string,
    emailVerified: boolean,
    username: string,
    isAnonymous: boolean,
    providerData: ProviderData
}

export type AuthType = "none" | "bearer" | "basic" | "apiKey" | "oauth2"