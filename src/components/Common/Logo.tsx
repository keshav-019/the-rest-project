'use client';
import React from "react"

export default function Logo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
    const sizeClasses = {
        small: 'h-8',
        medium: 'h-12',
        large: 'h-16'
    }

    return (
        <div className={`${sizeClasses[size]} flex items-center`}>
            <div className="flex items-center justify-center bg-blue-600 text-white rounded-lg p-2 mr-2">
                <svg
                    className="h-full"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <div className="font-bold text-gray-800 text-xl">API Client</div>
        </div>
    )
}