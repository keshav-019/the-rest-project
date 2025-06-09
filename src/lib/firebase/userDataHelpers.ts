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

