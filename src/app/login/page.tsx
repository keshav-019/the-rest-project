'use client'
import React from "react";
import { useState, useEffect } from 'react';
import Logo from "@/components/Common/Logo";
import Link from "next/link";
import {
    loginWithEmail,
    signUpWithEmail
} from '@/lib/firebase/auth';
import { auth } from "@/lib/firebase";

export default function Authentication() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [fadeIn, setFadeIn] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    // 🔐 2FA STATES
    const [requires2FA, setRequires2FA] = useState(false);
    const [totpCode, setTotpCode] = useState('');
    const [twoFactorSecret, setTwoFactorSecret] = useState('');

    useEffect(() => {
        setFadeIn(true);
    }, []);

    // 🔐 VERIFY 2FA
    const handleVerify2FA = async () => {
        setError(undefined);
        setIsLoading('2fa');

        try {
            const res = await fetch('/api/2fa/verify', {
                method: "POST",
                body: JSON.stringify({
                    token: totpCode,
                    secret: twoFactorSecret
                })
            });

            const data = await res.json();

            if (!data.verified) {
                setError("Invalid authentication code");
                return;
            }

            // 🔥 IMPORTANT FIX: STORE USER AFTER 2FA
            const user = auth.currentUser;

            if (user) {
                const existingUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

                localStorage.setItem('currentUser', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || existingUser?.displayName || name,
                    username: existingUser?.username || null,
                    bio: existingUser?.bio || "",
                }));
            }

            window.location.href = '/';

        } catch {
            setError("Verification failed");
        } finally {
            setIsLoading(null);
        }
    };

    const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(undefined);
        setIsLoading('email-password');

        try {
            if (isLoginView) {

                if (!email || !password) {
                    setError('Please enter both email and password');
                    return;
                }

                const result = await loginWithEmail(email, password);

                // 🔥 2FA REQUIRED
                if (result.success === 'requires-2fa') {
                    setRequires2FA(true);
                    setTwoFactorSecret(result.secret || '');
                    return;
                }

                // 🔥 NORMAL LOGIN (NO 2FA)
                if (result.success) {
                    window.location.href = '/';
                } else {
                    setError(result.error);
                }

            } else {

                if (!name || !email || !password || !confirmPassword) {
                    setError('Please fill all fields');
                    return;
                }

                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }

                if (password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return;
                }

                const result = await signUpWithEmail(email, password, name, username);

                if (result.success) {
                    window.location.href = '/';
                } else {
                    setError(result.error);
                }
            }

        } finally {
            setIsLoading(null);
        }
    };

    const toggleAuthView = () => {
        setIsLoginView(!isLoginView);
        setError(undefined);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setIsLoading(null);

        setRequires2FA(false);
        setTotpCode('');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <div
                className={`w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-xl ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionProperty: 'opacity, transform' }}
            >
                <div className="flex justify-center mb-6">
                    <Logo size="medium" />
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">
                        {isLoginView ? 'Sign in to Your Account' : 'Create an Account'}
                    </h1>
                    <p className="text-gray-600">
                        {isLoginView ? 'Choose a provider to continue' : 'Get started with your account'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">

                    {!isLoginView && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
                    </div>

                    {!isLoginView && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
                            />
                            <button type="button" className="absolute right-3 top-2.5"
                                onClick={() => setShowPassword(!showPassword)}>👁</button>
                        </div>
                    </div>

                    {!isLoginView && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
                        </div>
                    )}

                    {/* 🔐 TOTP */}
                    {requires2FA && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Authentication Code</label>
                            <input type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
                        </div>
                    )}

                    {isLoginView && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                <label className="ml-2 text-sm text-gray-700">Remember me</label>
                            </div>
                            <Link href="/forgotpassword" className="text-sm text-blue-600">
                                Forgot password?
                            </Link>
                        </div>
                    )}

                    <button
                        type={requires2FA ? "button" : "submit"}
                        onClick={requires2FA ? handleVerify2FA : undefined}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3"
                    >
                        {requires2FA ? "Verify Code" : (isLoginView ? "Sign In" : "Sign Up")}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="text-center text-sm">
                        {isLoginView ? (
                            <p>Don't have an account? <button onClick={toggleAuthView} className="text-blue-600">Sign up</button></p>
                        ) : (
                            <p>Already have an account? <button onClick={toggleAuthView} className="text-blue-600">Sign in</button></p>
                        )}
                    </div>

                </form>
            </div>
        </div>
    );
}