'use client'
import { useState, useEffect } from "react";
import speakeasy from 'speakeasy';
import QRCode from 'react-qr-code';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getCurrentUser } from '@/lib/firebase/auth';

export default function TwoFactorModal({ 
    isOpen, 
    onClose, 
    isEnabled, 
    onToggle 
}: {
    isOpen: boolean, 
    onClose: () => void, 
    isEnabled: boolean, 
    onToggle: (value: boolean) => void
}) {
    const [step, setStep] = useState(1);
    const [secret, setSecret] = useState('');
    const [otpAuthUrl, setOtpAuthUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Generate a new secret when modal opens for enabling 2FA
    useEffect(() => {
        if (isOpen && !isEnabled) {
            const newSecret = speakeasy.generateSecret({
                name: 'API Nexus',
                issuer: 'API Nexus'
            });
            setSecret(newSecret.base32);
            setOtpAuthUrl(newSecret.otpauth_url || '');
            
            // Generate backup codes
            const codes = Array.from({ length: 6 }, () => 
                Math.random().toString(36).substring(2, 8).toUpperCase()
            );
            setBackupCodes(codes);
        }
    }, [isOpen, isEnabled]);

    const handleVerification = async () => {
        if (verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Verify the token
            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: verificationCode,
                window: 1
            });

            if (verified) {
                // Save 2FA secret and backup codes to user's document
                const user = getCurrentUser();
                if (user) {
                    await updateDoc(doc(db, 'users', user.uid), {
                        twoFactorSecret: secret,
                        twoFactorBackupCodes: backupCodes,
                        twoFactorEnabled: true,
                        updatedAt: new Date()
                    });
                }
                onToggle(true);
                setStep(3);
            } else {
                setError('Invalid verification code');
            }
        } catch (err) {
            console.error('2FA verification error:', err);
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        setIsLoading(true);
        try {
            const user = getCurrentUser();
            if (user) {
                await updateDoc(doc(db, 'users', user.uid), {
                    twoFactorSecret: null,
                    twoFactorBackupCodes: null,
                    twoFactorEnabled: false
                });
            }
            onToggle(false);
            onClose();
        } catch (err) {
            console.error('Failed to disable 2FA:', err);
            setError('Failed to disable 2FA. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                        Two-Factor Authentication
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {isEnabled ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">2FA is Enabled</h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Your account is protected with two-factor authentication.
                        </p>
                        <button
                            onClick={handleDisable}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                ) : (
                    <>
                        {step === 1 && (
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Scan this QR code with your authenticator app:
                                </p>
                                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center mb-4">
                                    <div className="mx-auto mb-2 flex items-center justify-center">
                                        <QRCode 
                                            value={otpAuthUrl} 
                                            size={128}
                                            level="H"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Or enter this secret key manually:
                                    </p>
                                    <p className="text-xs font-mono bg-gray-200 dark:bg-gray-600 p-2 rounded mt-1">
                                        {secret}
                                    </p>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Enter the 6-digit code from your authenticator app:
                                </p>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setError('');
                                    }}
                                    className="block w-full px-3 py-2 text-center text-2xl tracking-widest rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
                                    placeholder="000000"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-500 text-sm mb-4">{error}</p>
                                )}
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                                        disabled={isLoading}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleVerification}
                                        disabled={verificationCode.length !== 6 || isLoading}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">2FA Enabled!</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Save these backup codes in a safe place. Each code can be used once.
                                </p>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                                        {backupCodes.map((code, index) => (
                                            <div key={index} className="text-center py-1 bg-white dark:bg-gray-800 rounded">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <p>You won&rsquo;t be able to see these codes again.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}