import { Environment, UserData } from '@/types/User'

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
                    lastSynced: new Date()
                },
            },
        }
    }

    return {
        ...currentUserData,
        teams: {
            ...currentUserData.teams,
            [teamId]: {
                ...currentUserData.teams[teamId],
                environments: newEnvironments,
                lastSynced: new Date()
            },
        },
    }
}

// Add other helper functions as needed