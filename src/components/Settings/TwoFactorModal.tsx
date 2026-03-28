'use client';

import { useState } from "react";
import { enableTwoFactor } from "@/lib/2fa";
import { auth } from "@/lib/firebase";

export default function TwoFactorModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [step, setStep] = useState<"init" | "scan" | "verify">("init");
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [token, setToken] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setError("");
        setSuccess("");

        try {
            setLoading(true);

            const user = auth.currentUser;

            const res = await fetch("/api/2fa/setup", {
                method: "POST",
                body: JSON.stringify({
                    email: user?.email,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStep("scan");

        } catch (err: any) {
            setError(err.message || "Failed to generate QR");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setError("");
        setSuccess("");

        try {
            setLoading(true);

            const res = await fetch("/api/2fa/verify", {
                method: "POST",
                body: JSON.stringify({ token, secret }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            if (!data.verified) {
                setError("Invalid code. Try again.");
                return;
            }

            // 🔥 Save to Firestore
            await enableTwoFactor(secret);

            // 🔥 Save to localStorage (your requirement)
            const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...currentUser,
                    twoFactorEnabled: true,
                    twoFactorSecret: secret // 🔥 THIS WAS MISSING
                })
            );

            setSuccess("2FA Enabled Successfully!");

            setTimeout(() => {
                onClose();
                setStep("init");
                setQrCode("");
                setSecret("");
                setToken("");
            }, 1200);

        } catch (err: any) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4">

                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    Two-Factor Authentication
                </h3>

                {/* Step 1 */}
                {step === "init" && (
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`w-full px-4 py-2 rounded-md text-white ${loading
                            ? "bg-blue-400"
                            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {loading ? "Generating..." : "Generate QR Code"}
                    </button>
                )}

                {/* Step 2 */}
                {step === "scan" && (
                    <div className="space-y-3 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Scan this QR code with your authenticator app
                        </p>

                        <img src={qrCode} alt="QR Code" className="mx-auto" />

                        <button
                            onClick={() => setStep("verify")}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Step 3 */}
                {step === "verify" && (
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md 
                         bg-white dark:bg-gray-700 
                         text-gray-800 dark:text-white 
                         border-gray-300 dark:border-gray-600"
                        />

                        <button
                            onClick={handleVerify}
                            disabled={loading}
                            className={`w-full px-4 py-2 rounded-md text-white ${loading
                                ? "bg-blue-400"
                                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                }`}
                        >
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                )}

                {/* Messages */}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}

                <button
                    onClick={onClose}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                    Close
                </button>
            </div>
        </div>
    );
}