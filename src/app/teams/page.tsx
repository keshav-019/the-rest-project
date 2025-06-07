'use client';
import { useState, useEffect, useRef } from "react";
import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Common/Sidebar";

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

  interface ModalBackdropProps {
    children: React.ReactNode;
    onClose: () => void;
  }

  const ModalBackdrop = ({ children, onClose }: ModalBackdropProps) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-gray-500 dark:bg-gray-900 opacity-75 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">API Nexus</h1>
        </div>
        <Sidebar activeTab="/teams" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
      <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex items-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer">
              JS
            </div>
          </div>
        </header>

        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4">
              <button 
                className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'myTeams' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('myTeams')}
              >
                My Teams
              </button>
              <button 
                className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'invitations' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('invitations')}
              >
                Invitations
              </button>
            </nav>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {activeTab === 'myTeams' ? 'My Teams' : 'Team Invitations'}
            </h2>
            {activeTab === 'myTeams' && (
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                onClick={() => setShowCreateTeamModal(true)}
              >
                Create New Team
              </button>
            )}
          </div>

          {activeTab === 'myTeams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Team Cards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Development</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Owner
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Team for developing and testing our core API services
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Members:</span>
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">JD</div>
                      <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">AS</div>
                      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">TK</div>
                      <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">+2</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                      onClick={() => handleViewTeamDetails('API Development')}
                    >
                      Manage
                    </button>
                    <button 
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        setSelectedTeamName('API Development')
                        setShowInviteMembersModal(true)
                      }}
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Frontend Team</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Member
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Team responsible for frontend application development
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Members:</span>
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">MJ</div>
                      <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">KL</div>
                      <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">RW</div>
                      <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">+4</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                      onClick={() => handleViewTeamDetails('Frontend Team')}
                    >
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer">
                      Leave
                    </button>
                  </div>
                </div>
              </div>

              {/* Create New Team Card */}
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setShowCreateTeamModal(true)}
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Create New Team</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Start collaborating with your colleagues
                </p>
              </div>
            </div>
          )}

          {activeTab === 'invitations' && (
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
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">QA</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            QA Team
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Quality assurance and testing
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">Sarah Johnson</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">sarah.j@example.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      2 days ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer">
                          Accept
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer">
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-medium">DS</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Data Science
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Analytics and machine learning
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">Michael Chen</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">m.chen@example.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      5 days ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer">
                          Accept
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer">
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Create Team Modal */}
      {showCreateTeamModal && (
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
                            defaultChecked
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
              <button 
                type="button" 
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                onClick={handleCreateTeam}
              >
                Create Team
              </button>
              <button 
                type="button" 
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                onClick={() => setShowCreateTeamModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* Invite Members Modal */}
      {showInviteMembersModal && (
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
                      ></textarea>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Separate multiple email addresses with commas
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="member-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </label>
                      <select
                        id="member-role"
                        name="member-role"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                        defaultValue={`I'd like to invite you to join our team on API Nexus.`}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                onClick={handleInviteMembers}
              >
                Send Invitations
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
      )}

      {/* Team Details Modal */}
      {showTeamDetailsModal && (
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
      )}
    </div>
  );
}