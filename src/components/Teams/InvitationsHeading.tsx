import { Invitations } from "@/types/User";
import { formatDistanceToNow } from "date-fns";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface InvitationsHeadingProps {
    invitations: Invitations[];
    onAccept: (invitationId: string) => void;
    onDecline: (invitationId: string) => void;
}

export default function InvitationsHeading({ 
    invitations, 
    onAccept, 
    onDecline 
}: InvitationsHeadingProps) {
    if (invitations.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending invitations</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        You don&apos;t have any team invitations at this time.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Team
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Invited By
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {invitations.map((invitation) => (
                        <tr key={invitation.invitationId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                            {invitation.teamName.split(' ').map((word:any) => word[0]).join('').slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {invitation.teamName}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {invitation.teamDescription || 'No description'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                    {invitation.invitedByName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {invitation.invitedByEmail || ''}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {invitation.date ? formatDistanceToNow(new Date(invitation.date), { addSuffix: true }) : 'Unknown date'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        onClick={() => onAccept(invitation.invitationId)}
                                        className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => onDecline(invitation.invitationId)}
                                        className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}