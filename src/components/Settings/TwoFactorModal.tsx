import { useState } from "react";

// Two-Factor Authentication Component
export default function TwoFactorModal({ isOpen, onClose, isEnabled, onToggle }: {isOpen: boolean, onClose: () => void, isEnabled: boolean, onToggle: (value: boolean) => void}) {
    const [step, setStep] = useState(1);
    const [qrCode] = useState('JBSWY3DPEHPK3PXPEXAMPLE'); // Mock QR code secret
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes] = useState([
        'ABCD-1234', 'EFGH-5678', 'IJKL-9012',
        'MNOP-3456', 'QRST-7890', 'UVWX-1234'
    ]);

    const handleVerification = () => {
        if (verificationCode.length === 6) {
            setStep(3);
            onToggle(true);
        }
    };

    const handleDisable = () => {
        onToggle(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                        Two-Factor Authentication
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Your account is protected with two-factor authentication.</p>
                        <button
                            onClick={handleDisable}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                        >
                            Disable 2FA
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
                                    <div className="w-32 h-32 bg-white mx-auto mb-2 flex items-center justify-center border">
                                        <span className="text-xs text-gray-500">QR Code</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{qrCode}</p>
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
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="block w-full px-3 py-2 text-center text-2xl tracking-widest rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
                                    placeholder="000000"
                                />
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleVerification}
                                        disabled={verificationCode.length !== 6}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Verify
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
                                    Save these backup codes in a safe place:
                                </p>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                                        {backupCodes.map((code, index) => (
                                            <div key={index} className="text-center py-1">{code}</div>
                                        ))}
                                    </div>
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