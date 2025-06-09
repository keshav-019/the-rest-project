import { Collection, Variable } from "./Collections";

export interface Invitations {
    teamName: string, 
    teamDescription: string, 
    teamId: string, 
    invitedBy: string, 
    invitedByName: string,
    date: Date, 
    invitationId: string, 
    invitedByEmail: string
}

export interface Invited {
    teamName: string, 
    teamDescription: string, 
    teamId: string, 
    date: Date, 
    userid: string, 
    invitationId: string, 
    userEmail: string
}

// types/User.ts
export interface UserData {
    name: string | undefined | null,
    username: string | undefined | null,
    createdAt?: Date,
    isNewUser?: boolean,
    personalCollections: Collection[];
    personalEnvironments: Environment[];
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
    invitations: Invitations[],
    invited: Invited[]
}

export interface Team {
    name: string,
    description: string,
    teamId: string,
    createdAt: Date,
    createdBy: string,
    users: User[],
    collections: Collection[],
    environments: Environment[],
    userids: string[],
    isPrivate: boolean,
    isOwner: boolean,
    recentActivity: {
        type: 'collection_created' | 'request_created' | 'folder_created';
        id: string;
        name: string;
        timestamp: Date;
    }[]
}
  
export interface Environment {
    id: string;
    name: string;
    description: string;
    variables: Variable[];
    color: string;
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
    providerData: ProviderData,
    name?: string
}

export type AuthType = "none" | "bearer" | "basic" | "apiKey" | "oauth2"