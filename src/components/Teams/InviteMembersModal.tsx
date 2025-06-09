'use client'
import React, { useEffect, useState } from "react"
import ModalBackdrop from '../Common/ModalBackdrop';
import { checkUsersExist, inviteUsersToTeamByEmail } from "@/lib/firebase/teams";
import { getUserDetails } from "@/lib/firebase/auth";

export default function InviteMembersModal({
    isOpen = false,
    setShowInviteMembersModal,
    inviteMembersModalRef,
    selectedTeamName,
    selectedTeamId,
    currentUserId
}: {
    isOpen: boolean,
    setShowInviteMembersModal: (value: boolean) => void,
    inviteMembersModalRef: React.RefObject<HTMLDivElement | null>,
    selectedTeamName: string,
    selectedTeamId: string,
    currentUserId: string
}) {
    const [emails, setEmails] = useState<string>("");
    const [emailStatus, setEmailStatus] = useState<{ [email: string]: { exists: boolean, loading: boolean } }>({});
    const [role, setRole] = useState<string>("member");
    const [message, setMessage] = useState<string>("I'd like to invite you to join our team on API Nexus.");
    const [isSending, setIsSending] = useState(false);
    const [sendResults, setSendResults] = useState<{ email: string; success: boolean; message?: string }[]>([]);

    useEffect(() => {
        const loggingUser = async () => {
            const userData = await getUserDetails();
            console.log("The user Data is: ", userData);
        }
        loggingUser();
    })

    if (!isOpen) return null;

    const handleEmailChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setEmails(value);
        
        // Extract emails and validate
        const emailList = value.split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        
        // Reset status for removed emails
        const newStatus = { ...emailStatus };
        Object.keys(newStatus).forEach(key => {
            if (!emailList.includes(key)) {
                delete newStatus[key];
            }
        });
        
        // Check new emails
        if (emailList.length > 0) {
            // Mark all as loading
            emailList.forEach(email => {
                if (!newStatus[email]) {
                    newStatus[email] = { exists: false, loading: true };
                }
            });
            setEmailStatus(newStatus);
            
            // Check existence in Firestore
            const existenceMap = await checkUsersExist(emailList);
            
            // Update status
            setEmailStatus(prev => {
                const updated = { ...prev };
                emailList.forEach(email => {
                    if (updated[email]) {
                        updated[email] = {
                            exists: existenceMap[email] || false,
                            loading: false
                        };
                    }
                });
                return updated;
            });
        } else {
            setEmailStatus({});
        }
    };

    const handleInviteMembers = async () => {
        if (!emails) return;
        
        const emailList = emails.split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        
        if (emailList.length === 0) return;
        
        setIsSending(true);
        setSendResults([]);
        
        const { results } = await inviteUsersToTeamByEmail(
            selectedTeamId,
            emailList,
            currentUserId
        );
        
        setSendResults(results);
        setIsSending(false);
        
        // Clear form if all successful
        if (results.every(r => r.success)) {
            setEmails("");
            setMessage("I'd like to invite you to join our team on API Nexus.");
        }
    };

    return (
        <ModalBackdrop onClose={() => setShowInviteMembersModal(false)}>
            <div
                ref={inviteMembersModalRef}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-headline">
                                Invite Members to {selectedTeamName}
                            </h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="member-emails" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email Addresses*
                                    </label>
                                    <textarea
                                        id="member-emails"
                                        name="member-emails"
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter email addresses separated by commas"
                                        value={emails}
                                        onChange={handleEmailChange}
                                    ></textarea>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Separate multiple email addresses with commas
                                    </p>
                                    
                                    {/* Email status indicators */}
                                    {Object.keys(emailStatus).length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {Object.entries(emailStatus).map(([email, status]) => (
                                                <div key={email} className="flex items-center text-xs">
                                                    <span className="text-gray-600 dark:text-gray-400">{email}</span>
                                                    {status.loading ? (
                                                        <span className="ml-2 text-gray-500">Checking...</span>
                                                    ) : status.exists ? (
                                                        <span className="ml-2 text-green-600 dark:text-green-400 flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            User exists
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 text-yellow-600 dark:text-yellow-400 flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            Not registered
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="member-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Role
                                    </label>
                                    <select
                                        id="member-role"
                                        name="member-role"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="invitation-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Invitation Message
                                    </label>
                                    <textarea
                                        id="invitation-message"
                                        name="invitation-message"
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Add a personal message to your invitation"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                {/* Send results */}
                                {sendResults.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Invitation Results:
                                        </h4>
                                        <div className="space-y-1">
                                            {sendResults.map((result, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`text-sm ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                >
                                                    {result.email}: {result.message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isSending ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={handleInviteMembers}
                        disabled={isSending}
                    >
                        {isSending ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                        ) : 'Send Invitations'}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                        onClick={() => setShowInviteMembersModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </ModalBackdrop>
    )
}