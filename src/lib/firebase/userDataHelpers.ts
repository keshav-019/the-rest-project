// userDataHelpers.ts
import { Collection } from '@/types/Collections';
import { UserData, Environment } from '@/types/User';

/**
 * Updates personal collections in user data
 * @param currentUserData Current user data object
 * @param newCollections Array of new collections to replace existing ones
 * @returns Updated user data with new collections
 */
export function updatePersonalCollections(
    currentUserData: UserData,
    newCollections: Collection[]
): UserData {
    return {
        ...currentUserData,
        personalCollections: newCollections,
    };
}

/**
 * Updates team collections in user data for a specific team
 * @param currentUserData Current user data object
 * @param teamId ID of the team to update
 * @param newCollections Array of new collections to replace existing ones
 * @returns Updated user data with new team collections
 */
export function updateTeamCollections(
    currentUserData: UserData,
    teamId: string,
    newCollections: Collection[]
): UserData {
    // If team doesn't exist, initialize it with default values
    if (!currentUserData.teams[teamId]) {
        return {
            ...currentUserData,
            teams: {
                ...currentUserData.teams,
                [teamId]: {
                    collections: newCollections,
                    environments: [],
                    lastSynced: new Date(),
                },
            },
        };
    }

    return {
        ...currentUserData,
        teams: {
            ...currentUserData.teams,
            [teamId]: {
                ...currentUserData.teams[teamId],
                collections: newCollections,
                lastSynced: new Date(),
            },
        },
    };
}

/**
 * Updates team environments in user data for a specific team
 * @param currentUserData Current user data object
 * @param teamId ID of the team to update
 * @param newEnvironments Array of new environments to replace existing ones
 * @returns Updated user data with new team environments
 */
export function updateTeamEnvironments(
    currentUserData: UserData,
    teamId: string,
    newEnvironments: Environment[]
): UserData {
    // If team doesn't exist, initialize it with default values
    if (!currentUserData.teams[teamId]) {
        return {
            ...currentUserData,
            teams: {
                ...currentUserData.teams,
                [teamId]: {
                    collections: [],
                    environments: newEnvironments,
                    lastSynced: new Date(),
                },
            },
        };
    }

    return {
        ...currentUserData,
        teams: {
            ...currentUserData.teams,
            [teamId]: {
                ...currentUserData.teams[teamId],
                environments: newEnvironments,
                lastSynced: new Date(),
            },
        },
    };
}

/**
 * Updates a single environment in a team's environments
 * @param currentUserData Current user data object
 * @param teamId ID of the team to update
 * @param updatedEnvironment Updated environment object
 * @returns Updated user data with the modified environment
 */
export function updateSingleTeamEnvironment(
    currentUserData: UserData,
    teamId: string,
    updatedEnvironment: Environment
): UserData {
    if (!currentUserData.teams[teamId]) {
        throw new Error(`Team with ID ${teamId} not found`);
    }

    const updatedEnvironments = currentUserData.teams[teamId].environments.map(env =>
        env.id === updatedEnvironment.id ? updatedEnvironment : env
    );

    return {
        ...currentUserData,
        teams: {
            ...currentUserData.teams,
            [teamId]: {
                ...currentUserData.teams[teamId],
                environments: updatedEnvironments,
                lastSynced: new Date(),
            },
        },
    };
}

/**
 * Updates a single collection in personal collections
 * @param currentUserData Current user data object
 * @param updatedCollection Updated collection object
 * @returns Updated user data with the modified collection
 */
export function updateSinglePersonalCollection(
    currentUserData: UserData,
    updatedCollection: Collection
): UserData {
    const updatedCollections = currentUserData.personalCollections.map(col =>
        col.id === updatedCollection.id ? updatedCollection : col
    );

    return {
        ...currentUserData,
        personalCollections: updatedCollections,
    };
}

/**
 * Updates a single collection in a team's collections
 * @param currentUserData Current user data object
 * @param teamId ID of the team to update
 * @param updatedCollection Updated collection object
 * @returns Updated user data with the modified collection
 */
export function updateSingleTeamCollection(
    currentUserData: UserData,
    teamId: string,
    updatedCollection: Collection
): UserData {
    if (!currentUserData.teams[teamId]) {
        throw new Error(`Team with ID ${teamId} not found`);
    }

    const updatedCollections = currentUserData.teams[teamId].collections.map(col =>
        col.id === updatedCollection.id ? updatedCollection : col
    );

    return {
        ...currentUserData,
        teams: {
            ...currentUserData.teams,
            [teamId]: {
                ...currentUserData.teams[teamId],
                collections: updatedCollections,
                lastSynced: new Date(),
            },
        },
    };
}

/**
 * Updates personal environments in user data
 * @param currentUserData Current user data object
 * @param newEnvironments Array of new environments to replace existing ones
 * @returns Updated user data with new personal environments
 */
export function updatePersonalEnvironments(
    currentUserData: UserData,
    newEnvironments: Environment[]
): UserData {
    return {
        ...currentUserData,
        personalEnvironments: newEnvironments,
    };
}


export function updateSinglePersonalEnvironment(
    currentUserData: UserData,
    updatedEnvironment: Environment
): UserData {
    const updatedEnvironments = currentUserData.personalEnvironments.map(env =>
        env.id === updatedEnvironment.id ? updatedEnvironment : env
    );

    return {
        ...currentUserData,
        personalEnvironments: updatedEnvironments,
    };
}

