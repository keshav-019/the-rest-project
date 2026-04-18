'use client'
import ModalBackdrop from '../Common/ModalBackdrop';
import { getInitials } from '@/lib/firebase/auth';
import { Team } from '@/types/User';
/* eslint-disable @next/next/no-img-element */

interface TeamDetailsModalProps {
    isOpen: boolean;
    selectedTeam: Team;
    currentUserId: string;
    setShowInviteMembersModal: (value: boolean) => void;
    setShowTeamDetailsModal: (value: boolean) => void;
    teamDetailsModalRef: React.RefObject<HTMLDivElement | null>;
}

export default function TeamDetailsModal({
    isOpen,
    selectedTeam,
    currentUserId,
    setShowInviteMembersModal,
    setShowTeamDetailsModal,
    teamDetailsModalRef,
}: TeamDetailsModalProps) {
    if (!isOpen) {
        return null;
    }

    const isOwner = selectedTeam.createdBy === currentUserId || selectedTeam.isOwner;
    const teamMembers = selectedTeam.users || [];

    const roleBadgeClass = (isMemberOwner: boolean) =>
        isMemberOwner
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';

    return (
        <ModalBackdrop onClose={() => setShowTeamDetailsModal(false)}>
            <div
                ref={teamDetailsModalRef}
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="team-details-title"
                tabIndex={-1}
            >
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                            <svg
                                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>

                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <div className="flex justify-between items-center">
                                <h3
                                    className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                                    id="team-details-title"
                                >
                                    {selectedTeam.name}
                                </h3>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        isOwner
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}
                                >
                                    {isOwner ? 'Owner' : 'Member'}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {selectedTeam.description || 'No description provided for this team.'}
                            </p>

                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                        Team Members ({teamMembers.length})
                                    </h4>
                                    {isOwner ? (
                                        <button
                                            type="button"
                                            className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                                            onClick={() => {
                                                setShowTeamDetailsModal(false);
                                                setShowInviteMembersModal(true);
                                            }}
                                        >
                                            Invite Members
                                        </button>
                                    ) : null}
                                </div>

                                <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md border border-gray-200 dark:border-gray-700">
                                    {teamMembers.length === 0 ? (
                                        <div className="px-4 py-6 text-sm text-gray-600 dark:text-gray-400">
                                            No members available yet.
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {teamMembers.map((member) => {
                                                const memberName =
                                                    member.name ||
                                                    member.displayName ||
                                                    member.email?.split('@')[0] ||
                                                    'Unknown User';
                                                const isMemberOwner = member.uid === selectedTeam.createdBy;

                                                return (
                                                    <li key={member.uid}>
                                                        <div className="px-4 py-4 flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                {member.photoURL ? (
                                                                    <img
                                                                        src={member.photoURL}
                                                                        alt={memberName}
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                                                        {getInitials(memberName)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-3">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {memberName}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {member.email || 'No email'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {member.uid === currentUserId ? (
                                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                                        You
                                                                    </span>
                                                                ) : null}
                                                                <span
                                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${roleBadgeClass(
                                                                        isMemberOwner
                                                                    )}`}
                                                                >
                                                                    {isMemberOwner ? 'Owner' : 'Member'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                        onClick={() => setShowTeamDetailsModal(false)}
                    >
                        Close
                    </button>
                    {!isOwner ? (
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                            onClick={() => setShowTeamDetailsModal(false)}
                        >
                            Leave Team
                        </button>
                    ) : null}
                </div>
            </div>
        </ModalBackdrop>
    );
}
