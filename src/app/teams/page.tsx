'use client';
import { useState, useEffect, useRef } from "react";
import React from "react";
import Header from "@/components/Common/Header";
import TeamsHeader from "@/components/Teams/TeamsHeader";
import TeamsHeading from "@/components/Teams/TeamsHeading";
import TeamTiles from "@/components/Teams/TeamTiles";
import InvitationsHeading from "@/components/Teams/InvitationsHeading";
import CreateTeamModal from "@/components/Teams/CreateTeamModal";
import InviteMembersModal from "@/components/Teams/InviteMembersModal";
import TeamDetailsModal from "@/components/Teams/TeamDetailsModal";

export default function TeamManagement() {
    const [activeTab, setActiveTab] = useState<'myTeams' | 'invitations'>('myTeams');
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [showInviteMembersModal, setShowInviteMembersModal] = useState(false);
    const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
    const [selectedTeamName, setSelectedTeamName] = useState('');

    // Refs for modal focus management
    const createTeamModalRef = useRef<HTMLDivElement>(null);
    const inviteMembersModalRef = useRef<HTMLDivElement>(null);
    const teamDetailsModalRef = useRef<HTMLDivElement>(null);

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

        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showCreateTeamModal, showInviteMembersModal, showTeamDetailsModal]);

    const handleCreateTeam = () => {
        setShowCreateTeamModal(false);
    };

    const handleInviteMembers = () => {
        setShowInviteMembersModal(false);
    };

    const handleViewTeamDetails = (teamName: string) => {
        setSelectedTeamName(teamName);
        setShowTeamDetailsModal(true);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Header parentComponent={"Teams"} toSearch={false} onAddCollection={() => {}} />

                <TeamsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

                <main className="p-6">
                    <TeamsHeading activeTab={activeTab} setShowCreateTeamModal={setShowCreateTeamModal} />

                    {activeTab === 'myTeams' && (
                        <TeamTiles handleViewTeamDetails={handleViewTeamDetails} setSelectedTeamName={setSelectedTeamName} setShowCreateTeamModal={setShowCreateTeamModal} setShowInviteMembersModal={setShowInviteMembersModal} />
                    )}

                    {activeTab === 'invitations' && (
                        <InvitationsHeading />
                    )}
                </main>
            </div>

            {/* Create Team Modal */}
            {showCreateTeamModal && (
                <CreateTeamModal createTeamModalRef={createTeamModalRef} handleCreateTeam={handleCreateTeam} isOpen={true} setShowCreateTeamModal={setShowCreateTeamModal} />
            )}

            {/* Invite Members Modal */}
            {showInviteMembersModal && (
                <InviteMembersModal handleInviteMembers={handleInviteMembers} inviteMembersModalRef={inviteMembersModalRef} isOpen={true} selectedTeamName={selectedTeamName} setShowInviteMembersModal={setShowInviteMembersModal} />
            )}

            {/* Team Details Modal */}
            {showTeamDetailsModal && (
                <TeamDetailsModal isOpen={true} selectedTeamName={selectedTeamName} setShowInviteMembersModal={setShowInviteMembersModal} setShowTeamDetailsModal={setShowTeamDetailsModal} teamDetailsModalRef={teamDetailsModalRef} />
            )}
        </div>
    );
}