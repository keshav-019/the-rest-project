'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { Team } from '@/types/User';
import { useState } from 'react';

interface TeamModeWelcomeProps {
    team: Team;
}

export default function TeamModeWelcome({ team }: TeamModeWelcomeProps) {
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full border border-gray-200 dark:border-gray-700"
                >
                    <div className="p-6">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Team Mode Activated
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                You&rsquo;re now working with <span className="font-medium text-blue-600 dark:text-blue-400">{team.name}</span>
                            </p>
                        </div>

                        <div className="mb-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                All your changes will be shared with team members in real-time.
                            </p>
                        </div>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
            }
        </AnimatePresence>
    );
}