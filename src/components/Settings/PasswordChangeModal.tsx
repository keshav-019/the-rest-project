'use client';
import { ErrorType } from "@/types/Collections";
import { useState } from "react";
import {
    getAuth,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PasswordChangeModal({
    isOpen,
    onClose
}: {
    isOpen: boolean,
    onClose: () => void
}) {

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [errors, setErrors] = useState<ErrorType>({
        current: '',
        new: '',
        confirm: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const validateForm = () => {
        const newErrors: ErrorType = {
            current: '',
            new: '',
            confirm: '',
            message: ''
        };

        if (!currentPassword) newErrors.current = 'Current password is required';

        if (!newPassword) newErrors.new = 'New password is required';
        else if (newPassword.length < 8)
            newErrors.new = 'Password must be at least 8 characters';

        if (newPassword !== confirmPassword)
            newErrors.confirm = 'Passwords do not match';

        setErrors(newErrors);

        return !newErrors.current && !newErrors.new && !newErrors.confirm;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        setErrors({
            current: '',
            new: '',
            confirm: '',
            message: ''
        });
        setSuccess('');

        if (!validateForm()) return;

        try {
            setLoading(true);

            const auth = getAuth();
            const user = auth.currentUser;

            if (!user || !user.email) {
                throw new Error("User not authenticated");
            }

            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            setSuccess("Password updated successfully!");

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                onClose();
            }, 1200);

        } catch (err: any) {
            console.error(err);

            if (err.code === "auth/wrong-password") {
                setErrors(prev => ({ ...prev, current: "Incorrect current password" }));
            } else if (err.code === "auth/requires-recent-login") {
                setErrors(prev => ({ ...prev, message: "Please log in again" }));
            } else if (err.code === "auth/too-many-requests") {
                setErrors(prev => ({ ...prev, message: "Too many attempts. Try later." }));
            } else {
                setErrors(prev => ({ ...prev, message: err.message || "Something went wrong" }));
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">Change Password</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="block w-full px-3 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d={showPasswords.current
                                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7..."
                                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5..."}
                                    />
                                </svg>
                            </button>
                        </div>
                        {errors.current && <p className="text-red-500 text-sm mt-1">{errors.current}</p>}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full px-3 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                👁
                            </button>
                        </div>
                        {errors.new && <p className="text-red-500 text-sm mt-1">{errors.new}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full px-3 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                👁
                            </button>
                        </div>
                        {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
                    </div>

                    {/* Global Error */}
                    {errors.message && (
                        <p className="text-red-500 text-sm">{errors.message}</p>
                    )}

                    {/* Success */}
                    {success && (
                        <p className="text-green-600 text-sm">{success}</p>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${loading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                }`}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}