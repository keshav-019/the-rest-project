'use client';
import Link from 'next/link';
import React from "react"
import ModalBackdrop from '../Common/ModalBackdrop';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */

export default function TeamDetailsModal({
    isOpen = false,
    team = {
        id: '',
        name: '',
        description: '',
        privacy: 'public',
        role: 'owner',
        members: []
    },
    setShowTeamDetailsModal,
    teamDetailsModalRef,
    selectedTeamName,
    setShowInviteMembersModal
}: {
    isOpen: boolean,
    team?: {
        id: string
        name: string
        description: string
        privacy: 'public' | 'private'
        role: 'owner' | 'admin' | 'member' | 'viewer'
        members: Array<{
            id: string
            name: string
            email: string
            role: 'owner' | 'admin' | 'member' | 'viewer'
            avatar?: string
            initials?: string
        }>
    },
    setShowTeamDetailsModal: (value: boolean) => void,
    teamDetailsModalRef: React.RefObject<HTMLDivElement | null>,
    selectedTeamName: string,
    setShowInviteMembersModal: (value: boolean) => void
}) {
    if (!isOpen) return null

    return (
        <ModalBackdrop onClose={() => setShowTeamDetailsModal(false)}>
            <div
                ref={teamDetailsModalRef}
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-50"
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
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-headline">
                                    {selectedTeamName}
                                </h3>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {selectedTeamName === 'API Development' ? 'Owner' : 'Member'}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {selectedTeamName === 'API Development'
                                    ? 'Team for developing and testing our core API services'
                                    : 'Team responsible for frontend application development'}
                            </p>

                            <div className="mt-6">
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <nav className="-mb-px flex space-x-8">
                                        <Link href="#" className="border-blue-500 text-blue-600 dark:text-blue-400 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                            Members
                                        </Link>
                                        {selectedTeamName === 'API Development' && (
                                            <Link href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                                Settings
                                            </Link>
                                        )}
                                    </nav>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-base font-medium text-gray-900 dark:text-white">Team Members</h4>
                                    {selectedTeamName === 'API Development' && (
                                        <button
                                            className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                                            onClick={() => {
                                                setShowTeamDetailsModal(false)
                                                setShowInviteMembersModal(true)
                                            }}
                                        >
                                            Invite Members
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedTeamName === 'API Development' ? (
                                            <>
                                                <li>
                                                    <div className="px-4 py-4 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                                                                JD
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">john.doe@example.com</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                Owner
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="px-4 py-4 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                                                AS
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Alice Smith</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">alice.smith@example.com</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="mr-4 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                                Admin
                                                            </span>
                                                            <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer">
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="px-4 py-4 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                                                TK
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Tom King</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">tom.king@example.com</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="mr-4 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                Member
                                                            </span>
                                                            <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer">
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li>
                                                    <div className="px-4 py-4 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium">
                                                                MJ
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Michael Jordan</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">m.jordan@example.com</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                Owner
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="px-4 py-4 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium">
                                                                KL
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Kevin Lee</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">k.lee@example.com</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                                Admin
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="px-4 py-4 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                                                JD
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">john.doe@example.com</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                Member
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            </>
                                        )}
                                    </ul>
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
                    {selectedTeamName !== 'API Development' && (
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                            onClick={() => setShowTeamDetailsModal(false)}
                        >
                            Leave Team
                        </button>
                    )}
                </div>
            </div>
        </ModalBackdrop>
    )
}