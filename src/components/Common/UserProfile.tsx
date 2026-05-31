'use client';

export interface UserProfileProps {
    initials: string,
    displayName: string,
    username: string,
    email: string,
    photoURL?: string // ✅ NEW
}

export default function UserProfile({
    initials,
    displayName,
    username,
    email,
    photoURL
}: UserProfileProps) {
    const trimmedUsername = username?.trim();

    return (
        <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-t-lg">
            <div className="flex items-center space-x-3">

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg shadow-md overflow-hidden">

                    {photoURL ? (
                        <img
                            src={photoURL}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // fallback if image fails
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <span>{initials}</span>
                    )}

                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {displayName || 'Unknown User'}
                    </div>

                    {trimmedUsername && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                            @{trimmedUsername}
                        </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {email}
                    </div>
                </div>

            </div>
        </div>
    );
}
