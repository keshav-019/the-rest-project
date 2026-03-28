'use client'
import { useState, useEffect, useRef } from "react";
import React from "react";
import TeamsHeader from "@/components/Teams/TeamsHeader";
import TeamsHeading from "@/components/Teams/TeamsHeading";
import TeamTiles from "@/components/Teams/TeamTiles";
import InvitationsHeading from "@/components/Teams/InvitationsHeading";
import CreateTeamModal from "@/components/Teams/CreateTeamModal";
import InviteMembersModal from "@/components/Teams/InviteMembersModal";
import TeamDetailsModal from "@/components/Teams/TeamDetailsModal";
import { Team, User } from "@/types/User";
import { getCurrentUser, getInitials, getUserDetails } from "@/lib/firebase/auth";
import { acceptTeamInvitation, createTeam, declineTeamInvitation, getTeamMode, getUserTeams } from "@/lib/firebase/teams";
import { getUserInvitations } from "@/lib/firebase/teams";
import HeaderComponent from "@/components/Common/Header";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TeamManagement() {
    const [activeTab, setActiveTab] = useState<'myTeams' | 'invitations'>('myTeams');
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [showInviteMembersModal, setShowInviteMembersModal] = useState(false);
    const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [user, setUser] = useState<User | null>(getCurrentUser());
    const [teams, setTeams] = useState<Team[]>([]);
    // Update the state in TeamManagement component
    const [invitations, setInvitations] = useState<any[]>([]);
    // Refs for modal focus management
    const createTeamModalRef = useRef<HTMLDivElement>(null);
    const inviteMembersModalRef = useRef<HTMLDivElement>(null);
    const teamDetailsModalRef = useRef<HTMLDivElement>(null);
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [name, setName] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);

    // Focus trap for modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showCreateTeamModal) setShowCreateTeamModal(false);
                if (showInviteMembersModal) setShowInviteMembersModal(false);
                if (showTeamDetailsModal) setShowTeamDetailsModal(false);
            }
        };

        if (showCreateTeamModal || showInviteMembersModal || showTeamDetailsModal) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);

            // Focus the modal when it opens
            const currentModalRef =
                showCreateTeamModal ? createTeamModalRef.current :
                    showInviteMembersModal ? inviteMembersModalRef.current :
                        teamDetailsModalRef.current;

            currentModalRef?.focus();
        } else {
            document.body.style.overflow = 'auto';
        }

        const setTeamsFromDatabase = async () => {
            const {user, userData} = await getUserDetails();
            if(!user?.uid) throw new Error('No user is logged in');
            const teams = await getUserTeams(user?.uid || '');
            setEmail(user?.email || '');
            setAutoSave(userData?.autoSave || true);
            setDisplayName(user?.displayName || '');
            setUsername(user?.username || '');
            setInitials(getInitials(user?.displayName || ''));
            setPhotoURL(user?.photoURL || '');
            setName(user?.displayName || '');
            setTeams(teams);
            setBio(userData?.bio || '');
        }

        setTeamsFromDatabase();

        const fetchInvitations = async () => {
            if (user?.uid) {
                try {
                    const { invitations } = await getUserInvitations(user.uid);
                    console.log("The invitations are: ", invitations, " and date of invitation is: ", 
                        invitations[0]?.date, " and the new Date value would be: ", 
                        invitations[0]?.date instanceof Date ? invitations[0].date : 'Invalid date'
                    );
                    setInvitations(invitations || []);
                } catch (error) {
                    console.error('Error fetching invitations:', error);
                }
            }
        };
    
        if (activeTab === 'invitations') {
            fetchInvitations();
        }

        const getTeamDetails = getTeamMode();

        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showCreateTeamModal, showInviteMembersModal, showTeamDetailsModal, activeTab, user?.uid]);

    const handleCreateTeam = (newTeam: Team) => {
        setTeams([...teams, newTeam]);
        setShowCreateTeamModal(false);
        if(user?.uid === undefined) throw new Error('No logged in User Found');
        createTeam(newTeam, user?.uid);
    };

    const handleViewTeamDetails = (team: Team) => {
        setSelectedTeam(team);
        setShowTeamDetailsModal(true);
    };

    // Add these handler functions
    const handleAcceptInvitation = async (invitationId: string) => {
        try {
            if (!user?.uid) return;
            
            const { success, team } = await acceptTeamInvitation(user.uid, invitationId);
            if (success && team) {
                // Update teams list if invitation was accepted
                setTeams(prev => [...prev, team]);
                // Remove the invitation from local state
                setInvitations(prev => prev.filter(inv => inv.invitationId !== invitationId));
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleDeclineInvitation = async (invitationId: string) => {
        try {
            if (!user?.uid) return;
            
            const { success } = await declineTeamInvitation(user.uid, invitationId);
            if (success) {
                // Remove the invitation from local state
                setInvitations(prev => prev.filter(inv => inv.invitationId !== invitationId));
            }
        } catch (error) {
            console.error('Error declining invitation:', error);
        }
    };

    // Add this handler for exiting team mode
    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        localStorage.removeItem('activeEnvironmentId');

        // Refresh the page to reset all states
        window.location.reload();
    };

    // Add this handler for team selection
    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        localStorage.setItem('teamMode', JSON.stringify(team));
        setShowTeamsDropdown(false);
        localStorage.removeItem('activeEnvironmentId');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <HeaderComponent 
                    parentComponent={"Teams"} 
                    toSearch={false} 
                    onAddCollection={() => {}} 
                    environments={[]}
                    autoSave={autoSave}
                    displayName={displayName}
                    email={email}
                    initials={initials}
                    setAutoSave={setAutoSave}
                    username={username}
                    teams={teams}
                    teamMode={teamMode}
                    activeEnvironmentId={''}
                    onEnvironmentSelect={() => {}}
                    onExitTeamMode={handleExitTeamMode}
                    onTeamSelect={handleTeamSelect}
                    setShowTeams={setShowTeamsDropdown}
                    showTeams={showTeamsDropdown}
                    photoURL={photoURL}
                />

                <TeamsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

                <main className="p-6">
                    <TeamsHeading activeTab={activeTab} setShowCreateTeamModal={setShowCreateTeamModal} />

                    {activeTab === 'myTeams' && (
                        <TeamTiles 
                            teams={teams}
                            handleViewTeamDetails={handleViewTeamDetails}
                            setSelectedTeamName={(name) => setSelectedTeam(teams.find(t => t.name === name) || null)}
                            setShowCreateTeamModal={setShowCreateTeamModal}
                            setShowInviteMembersModal={setShowInviteMembersModal}
                        />
                    )}

                    {activeTab === 'invitations' && (
                        <InvitationsHeading 
                            invitations={invitations}
                            onAccept={handleAcceptInvitation}
                            onDecline={handleDeclineInvitation}
                        />
                    )}
                </main>
            </div>

            {/* Create Team Modal */}
            {showCreateTeamModal && (
                <CreateTeamModal 
                    createTeamModalRef={createTeamModalRef} 
                    handleCreateTeam={handleCreateTeam} 
                    isOpen={true} 
                    setShowCreateTeamModal={setShowCreateTeamModal} 
                />
            )}

            {/* Invite Members Modal */}
            {showInviteMembersModal && (
                selectedTeam?.name && <InviteMembersModal
                    isOpen={true}
                    setShowInviteMembersModal={setShowInviteMembersModal}
                    inviteMembersModalRef={inviteMembersModalRef}
                    selectedTeamName={selectedTeam?.name}
                    selectedTeamId={selectedTeam?.teamId || ''}
                    currentUserId={user?.uid || ''}
                />
            )}

            {/* Team Details Modal */}
            {showTeamDetailsModal && (
                selectedTeam?.name && <TeamDetailsModal isOpen={true} selectedTeamName={selectedTeam?.name} setShowInviteMembersModal={setShowInviteMembersModal} setShowTeamDetailsModal={setShowTeamDetailsModal} teamDetailsModalRef={teamDetailsModalRef} />
            )}
        </div>
    );
}