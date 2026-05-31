'use client'
import React, { useState } from "react";
import ModalBackdrop from '../Common/ModalBackdrop';
import { Team } from "@/types/User";
import { getCurrentUser } from "@/lib/firebase/auth";

export default function CreateTeamModal({
    isOpen = false, 
    setShowCreateTeamModal, 
    createTeamModalRef, 
    handleCreateTeam
}: {
    isOpen: boolean, 
    setShowCreateTeamModal: (value: boolean) => void, 
    createTeamModalRef: React.RefObject<HTMLDivElement | null>, 
    handleCreateTeam: (team: Team) => void 
}) {
    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [privacy, setPrivacy] = useState('public');

    const handleSubmit = async () => {
        if (!teamName.trim()) return;
        
        const newTeam: Team = {
            name: teamName,
            description: teamDescription,
            teamId: Math.random().toString(36).substring(2, 11),
            createdAt: new Date(),
            createdBy: getCurrentUser()?.uid || '', // Replace with actual user ID
            users: [],
            collections: [],
            environments: [],
            isPrivate: privacy === 'private',
            isOwner: true,
            userids: [], // Replace with actual user ID
            recentActivity: []
        };
        
        handleCreateTeam(newTeam);
    };

    const teamButtons = [
        {name: 'Create Team', onClickFunction: handleSubmit},
        {name: 'Cancel', onClickFunction: () => setShowCreateTeamModal(false)}
    ];

    if (!isOpen) return null;

    return (
        <ModalBackdrop onClose={() => setShowCreateTeamModal(false)}>
            <div
                ref={createTeamModalRef}
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
                tabIndex={-1}
            >
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-headline">
                                Create New Team
                            </h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Team Name*
                                    </label>
                                    <input
                                        type="text"
                                        name="team-name"
                                        id="team-name"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter team name"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="team-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        id="team-description"
                                        name="team-description"
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Describe the purpose of this team"
                                        value={teamDescription}
                                        onChange={(e) => setTeamDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Privacy Settings
                                    </label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center">
                                            <input
                                                id="privacy-public"
                                                name="privacy"
                                                type="radio"
                                                checked={privacy === 'public'}
                                                onChange={() => setPrivacy('public')}
                                                className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="privacy-public" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                                Public - Anyone in your organization can see this team
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="privacy-private"
                                                name="privacy"
                                                type="radio"
                                                checked={privacy === 'private'}
                                                onChange={() => setPrivacy('private')}
                                                className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="privacy-private" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                                Private - Only team members can see this team
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    {teamButtons.map((teamButton, index) => {
                        return (
                            <button key={index}
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                                onClick={teamButton.onClickFunction}
                            >
                                {teamButton.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </ModalBackdrop>
    )
}
