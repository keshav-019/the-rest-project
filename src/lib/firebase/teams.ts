import { Environment, Invitations, Team, User, UserData } from "@/types/User";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "./client";
import { Collection } from "@/types/Collections";
import { generateRandomString } from "../utils/utils";
import { getCurrentUser } from "./auth";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Find user by email
 * @param email The email to search for
 */
export const findUserByEmail = async (email: string): Promise<{ user: User | null; error?: string }> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { user: null };
        }

        const userDoc = querySnapshot.docs[0];
        return { user: userDoc.data() as User };
    } catch (error) {
        console.error('Error finding user by email:', error);
        return { user: null, error: 'Failed to search for user' };
    }
};

/**
 * Check if users exist for given emails
 * @param emails Array of emails to check
 */
export const checkUsersExist = async (emails: string[]): Promise<{ [email: string]: boolean }> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', 'in', emails));
        const querySnapshot = await getDocs(q);

        const existingEmails = new Set(
            querySnapshot.docs.map(doc => (doc.data() as User).email.toLowerCase())
        );

        const result: { [email: string]: boolean } = {};
        emails.forEach(email => {
            result[email] = existingEmails.has(email.toLowerCase());
        });

        return result;
    } catch (error) {
        console.error('Error checking user existence:', error);
        // Fallback to checking emails one by one if 'in' query fails (Firestore has limits)
        const result: { [email: string]: boolean } = {};
        await Promise.all(emails.map(async email => {
            const { user } = await findUserByEmail(email);
            result[email] = !!user;
        }));
        return result;
    }
};


/**
 * Invite users to a team by email
 * @param teamId The ID of the team to invite to
 * @param emails Array of emails to invite
 * @param invitedByUserId The ID of the user sending the invitation
 */
export const inviteUsersToTeamByEmail = async (
    teamId: string,
    emails: string[],
    invitedByUserId: string
): Promise<{ success: boolean; results: { email: string; success: boolean; message?: string }[] }> => {
    try {
        console.log("The Invite Users To Team By Email function was called: ", teamId, " and emails is: ", emails, " and invitedByUserId is: ", invitedByUserId);
        // Get team data
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (!teamDoc.exists()) {
            return {
                success: false,
                results: emails.map(email => ({
                    email,
                    success: false,
                    message: 'Team not found'
                }))
            };
        }
        const team = teamDoc.data() as Team;

        // Get inviting user data
        const invitingUserDoc = await getDoc(doc(db, 'users', invitedByUserId));
        if (!invitingUserDoc.exists()) {
            return {
                success: false,
                results: emails.map(email => ({
                    email,
                    success: false,
                    message: 'Inviting user not found'
                }))
            };
        }
        const invitingUser = invitingUserDoc.data() as User;

        // Process each email in parallel
        const results = await Promise.all(emails.map(async (email) => {
            try {
                // Find user by email
                const { user: invitedUser, error: findError } = await findUserByEmail(email);

                if (!invitedUser) {
                    // User doesn't exist - you might want to send an email invitation here
                    return {
                        email,
                        success: false,
                        message: 'User not found on platform'
                    };
                }

                // Check if user is already in the team
                if (team.userids.includes(invitedUser.uid)) {
                    return {
                        email,
                        success: false,
                        message: 'User is already in the team'
                    };
                }

                // Create invitation data
                const invitationId = generateRandomString(20);
                const invitationData = {
                    teamId,
                    teamName: team.name,
                    teamDescription: team.description,
                    invitedBy: invitedByUserId,
                    invitedByEmail: invitingUser.email,
                    invitedByName: invitingUser.name,
                    date: new Date(),
                    invitationId
                };

                // Add to inviting user's "invited" array
                await updateDoc(doc(db, 'users', invitedByUserId), {
                    invited: arrayUnion({
                        ...invitationData,
                        userid: invitedUser.uid,
                        email: email // Store email for reference
                    })
                });

                // Add to invited user's "invitations" array
                await updateDoc(doc(db, 'users', invitedUser.uid), {
                    invitations: arrayUnion(invitationData)
                });

                return {
                    email,
                    success: true,
                    message: 'Invitation sent successfully'
                };
            } catch (error) {
                console.error(`Error inviting ${email}:`, error);
                return {
                    email,
                    success: false,
                    message: 'Failed to send invitation'
                };
            }
        }));

        return {
            success: results.some(r => r.success),
            results
        };
    } catch (error) {
        console.error('Error inviting users to team:', error);
        return {
            success: false,
            results: emails.map(email => ({
                email,
                success: false,
                message: 'Failed to process invitations'
            }))
        };
    }
};

// Team management functions
/**
 * Get all teams that a user belongs to
 * @param userId The user's ID
 * @returns Array of teams the user is a member of
 */
export const getUserTeams = async (userId: string): Promise<Team[]> => {
    try {
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where('userids', 'array-contains', userId));
        const querySnapshot = await getDocs(q);

        const teams: Team[] = [];

        // Process teams in parallel for better performance
        await Promise.all(querySnapshot.docs.map(async (teamDoc) => {
            const teamData = teamDoc.data() as Team;

            // Fetch user data for all team members
            const userPromises = teamData.userids.map(async (uid) => {
                const userDoc = await getDoc(doc(db, 'users', uid)); // Fixed doc reference
                if (userDoc.exists()) {
                    return userDoc.data() as User;
                }
                return null;
            });

            // Wait for all user data to be fetched
            const users = (await Promise.all(userPromises)).filter(user => user !== null) as User[];

            teams.push({
                ...teamData,
                users
            });
        }));

        return teams;
    } catch (error) {
        console.error('Error fetching user teams:', error);
        throw new Error('Failed to fetch user teams');
    }
};



/**
 * Get a single team by its ID with all member details
 * @param teamId The ID of the team to fetch
 * @returns The team data with populated user information
 * @throws Error if team is not found or if there's a firebase error
 */
export const getTeamById = async (teamId: string): Promise<Team> => {
    try {
        // Get the team document
        const teamDocRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamDocRef);

        if (!teamDoc.exists()) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        const teamData = teamDoc.data() as Team;

        return teamData;
    } catch (error) {
        console.error(`Error fetching team ${teamId}:`, error);
        throw new Error(`Failed to fetch team: ${error instanceof Error ? error.message : String(error)}`);
    }
};


/**
 * Add an environment to a team
 * @param teamId The ID of the team
 * @param environment The environment to add
 */
export const addEnvironmentToTeam = async (teamId: string, environment: Environment): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists()) {
            throw new Error('Team not found');
        }

        const teamData = teamDoc.data() as Team;
        const updatedEnvironments = [...teamData.environments, environment];

        await updateDoc(teamRef, {
            environments: updatedEnvironments,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error adding environment to team:', error);
        throw error;
    }
};

/**
 * Remove an environment from a team
 * @param teamId The ID of the team
 * @param environmentId The ID of the environment to remove
 */
export const removeEnvironmentFromTeam = async (teamId: string, environmentId: string): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists()) {
            throw new Error('Team not found');
        }

        const teamData = teamDoc.data() as Team;
        const updatedEnvironments = teamData.environments.filter(env => env.id !== environmentId);

        await updateDoc(teamRef, {
            environments: updatedEnvironments,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error removing environment from team:', error);
        throw error;
    }
};

/**
 * Add a collection to a team
 * @param teamId The ID of the team
 * @param collection The collection to add
 */
export const addCollectionToTeam = async (teamId: string, collection: Collection): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists()) {
            throw new Error('Team not found');
        }

        const teamData = teamDoc.data() as Team;
        const updatedCollections = [...teamData.collections, collection];

        await updateDoc(teamRef, {
            collections: updatedCollections,
            updatedAt: new Date(),
            recentActivity: {
                type: 'collection_created',
                id: collection.id,
                name: collection.name,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error adding collection to team:', error);
        throw error;
    }
};

/**
 * Remove a collection from a team
 * @param teamId The ID of the team
 * @param collectionId The ID of the collection to remove
 */
export const removeCollectionFromTeam = async (teamId: string, collectionId: string): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists()) {
            throw new Error('Team not found');
        }

        const teamData = teamDoc.data() as Team;
        const updatedCollections = teamData.collections.filter(col => col.id !== collectionId);

        await updateDoc(teamRef, {
            collections: updatedCollections,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error removing collection from team:', error);
        throw error;
    }
};

/**
 * Create a new team
 * @param teamData The team data to create
 * @param userId The ID of the user creating the team (will be added as member)
 */
export const createTeam = async (teamData: Team, userId: string): Promise<Team> => {
    try {
        const teamId = generateRandomString(20);
        const newTeam: Team = {
            ...teamData,
            teamId,
            createdAt: new Date(),
            collections: [],
            createdBy: getCurrentUser()?.uid || '',
            isOwner: true,
            environments: [],
            userids: [getCurrentUser()?.uid || ''],
            recentActivity: []
        };

        await setDoc(doc(db, 'teams', teamId), newTeam);
        return newTeam;
    } catch (error) {
        console.error('Error creating team:', error);
        throw error;
    }
};

/**
 * Add a user to a team
 * @param teamId The ID of the team
 * @param userId The ID of the user to add
 */
export const addUserToTeam = async (teamId: string, userId: string): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        await updateDoc(teamRef, {
            userids: arrayUnion(userId),
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error adding user to team:', error);
        throw error;
    }
};

/**
 * Remove a user from a team
 * @param teamId The ID of the team
 * @param userId The ID of the user to remove
 */
export const removeUserFromTeam = async (teamId: string, userId: string): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        await updateDoc(teamRef, {
            userids: arrayRemove(userId),
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error removing user from team:', error);
        throw error;
    }
};


/**
 * Invite a user to a team
 * @param teamId The ID of the team to invite to
 * @param userId The ID of the user being invited
 * @param invitedByUserId The ID of the user sending the invitation
 */
export const inviteUserToTeam = async (
    teamId: string,
    userId: string,
    invitedByUserId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Get team data
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (!teamDoc.exists()) {
            return { success: false, error: 'Team not found' };
        }
        const team = teamDoc.data() as Team;

        // Get inviting user data
        const invitingUserDoc = await getDoc(doc(db, 'users', invitedByUserId));
        if (!invitingUserDoc.exists()) {
            return { success: false, error: 'Inviting user not found' };
        }
        const invitingUser = invitingUserDoc.data() as User;

        // Get invited user data
        const invitedUserDoc = await getDoc(doc(db, 'users', userId));
        if (!invitedUserDoc.exists()) {
            return { success: false, error: 'Invited user not found' };
        }

        // Create invitation data
        const invitationId = generateRandomString(20);
        const invitationData = {
            teamId,
            teamName: team.name,
            teamDescription: team.description,
            invitedBy: invitingUser.name || invitingUser.email,
            date: new Date(),
            invitationId
        };

        // Add to inviting user's "invited" array
        await updateDoc(doc(db, 'users', invitedByUserId), {
            invited: arrayUnion({
                ...invitationData,
                userid: userId
            })
        });

        // Add to invited user's "invitations" array
        await updateDoc(doc(db, 'users', userId), {
            invitations: arrayUnion(invitationData)
        });

        return { success: true };
    } catch (error) {
        console.error('Error inviting user to team:', error);
        return { success: false, error: 'Failed to send invitation' };
    }
};

/**
 * Accept a team invitation
 * @param userId The ID of the user accepting the invitation
 * @param invitationId The ID of the invitation to accept
 */
export const acceptTeamInvitation = async (
    userId: string,
    invitationId: string
): Promise<{ success: boolean; team?: Team; error?: string }> => {
    try {
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return { success: false, error: 'User not found' };
        }
        const userData = userDoc.data() as UserData;

        // Find the invitation
        const invitation = userData.invitations?.find(inv => inv.invitationId === invitationId);
        if (!invitation) {
            return { success: false, error: 'Invitation not found' };
        }

        // Get team data
        const teamDoc = await getDoc(doc(db, 'teams', invitation.teamId));
        if (!teamDoc.exists()) {
            return { success: false, error: 'Team not found' };
        }
        const team = teamDoc.data() as Team;

        // Add user to team
        await addUserToTeam(invitation.teamId, userId);

        // Remove from user's invitations
        await updateDoc(doc(db, 'users', userId), {
            invitations: arrayRemove(invitation)
        });

        // Remove from inviting user's invited list
        // First we need to find who invited this user
        const invitingUserQuery = query(
            collection(db, 'users'),
            where('invited', 'array-contains', {
                invitationId: invitationId,
                userid: userId
            })
        );
        const invitingUserSnapshot = await getDocs(invitingUserQuery);

        if (!invitingUserSnapshot.empty) {
            const invitingUserDoc = invitingUserSnapshot.docs[0];
            const invitedEntry = invitingUserDoc.data().invited.find(
                (inv: any) => inv.invitationId === invitationId
            );

            if (invitedEntry) {
                await updateDoc(invitingUserDoc.ref, {
                    invited: arrayRemove(invitedEntry)
                });
            }
        }

        return { success: true, team };
    } catch (error) {
        console.error('Error accepting team invitation:', error);
        return { success: false, error: 'Failed to accept invitation' };
    }
};

/**
 * Decline a team invitation
 * @param userId The ID of the user declining the invitation
 * @param invitationId The ID of the invitation to decline
 */
export const declineTeamInvitation = async (
    userId: string,
    invitationId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return { success: false, error: 'User not found' };
        }
        const userData = userDoc.data() as UserData;

        // Find the invitation
        const invitation = userData.invitations?.find(inv => inv.invitationId === invitationId);
        if (!invitation) {
            return { success: false, error: 'Invitation not found' };
        }

        // Remove from user's invitations
        await updateDoc(doc(db, 'users', userId), {
            invitations: arrayRemove(invitation)
        });

        // Remove from inviting user's invited list
        // First we need to find who invited this user
        const invitingUserQuery = query(
            collection(db, 'users'),
            where('invited', 'array-contains', {
                invitationId: invitationId,
                userid: userId
            })
        );
        const invitingUserSnapshot = await getDocs(invitingUserQuery);

        if (!invitingUserSnapshot.empty) {
            const invitingUserDoc = invitingUserSnapshot.docs[0];
            const invitedEntry = invitingUserDoc.data().invited.find(
                (inv: any) => inv.invitationId === invitationId
            );

            if (invitedEntry) {
                await updateDoc(invitingUserDoc.ref, {
                    invited: arrayRemove(invitedEntry)
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error declining team invitation:', error);
        return { success: false, error: 'Failed to decline invitation' };
    }
};

/**
 * Get all invitations for a user
 * @param userId The ID of the user
 */
// Update your getUserInvitations function in firebase/teams.ts
export const getUserInvitations = async (
    userId: string
): Promise<{ invitations: Invitations[]; error?: string }> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return { invitations: [], error: 'User not found' };
        }

        const userData = userDoc.data() as UserData;
        const rawInvitations = userData.invitations || [];

        // Convert Firestore Timestamps to Date objects
        const invitations = rawInvitations.map(inv => {
            // Check if it's a Firestore Timestamp
            const isTimestamp = inv.date && typeof inv.date === 'object' && 'toDate' in inv.date;

            return {
                ...inv,
                date: isTimestamp ? (inv.date as unknown as Timestamp).toDate() : new Date(inv.date)
            };
        });

        return { invitations };
    } catch (error) {
        console.error('Error getting user invitations:', error);
        return { invitations: [], error: 'Failed to get invitations' };
    }
};

/**
 * Get all users invited by a specific user
 * @param userId The ID of the inviting user
 */
export const getInvitedUsers = async (
    userId: string
): Promise<{ invited: any[]; error?: string }> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return { invited: [], error: 'User not found' };
        }
        const userData = userDoc.data() as UserData;
        return { invited: userData.invited || [] };
    } catch (error) {
        console.error('Error getting invited users:', error);
        return { invited: [], error: 'Failed to get invited users' };
    }
};

/**
 * Update all collections in a team (replaces the entire collections array)
 * @param teamId The ID of the team to update
 * @param collections The new array of collections
 * @throws Error if team is not found or update fails
 */
export const updateTeamCollections = async (
    teamId: string,
    collections: Collection[]
): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists()) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        await updateDoc(teamRef, {
            collections,
            updatedAt: new Date(),
            recentActivity: {
                type: 'collections_updated',
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error(`Error updating collections for team ${teamId}:`, error);
        throw new Error(`Failed to update team collections: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Update all environments in a team (replaces the entire environments array)
 * @param teamId The ID of the team to update
 * @param environments The new array of environments
 * @throws Error if team is not found or update fails
 */
export const updateTeamEnvironments = async (
    teamId: string,
    environments: Environment[]
): Promise<void> => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists()) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        await updateDoc(teamRef, {
            environments,
            updatedAt: new Date(),
            recentActivity: {
                type: 'environments_updated',
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error(`Error updating environments for team ${teamId}:`, error);
        throw new Error(`Failed to update team environments: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export function getTeamMode(): Team | null {
    try {
        const item = localStorage.getItem('teamMode');
        if (!item) return null;

        const parsed = JSON.parse(item);
        // Add runtime validation (adjust according to your Team type)
        return parsed && typeof parsed === 'object' ? parsed as Team : null;
    } catch {
        return null;
    }
}