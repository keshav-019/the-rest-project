'use client';
import React from "react";
import { useState, useEffect } from 'react';
import Logo from "@/components/Common/Logo";
import Link from "next/link";
import {
    loginWithEmail,
    signUpWithEmail
} from '@/lib/firebase/auth';

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

    useEffect(() => {
        setFadeIn(true);
    }, []);

    const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(undefined);
        setIsLoading('email-password');

        try {
            if (isLoginView) {
                // Login validation
                if (!email || !password) {
                    setError('Please enter both email and password');
                    return;
                }

                const result = await loginWithEmail(email, password);
                if (result.success) {
                    window.location.href = '/';
                    console.log("The result is: ", result.user);
                } else {
                    setError(result.error);
                }
            } else {
                // Signup validation
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

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                    {!isLoginView && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    {
                        !isLoginView && (<div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="username"
                                required
                            />
                        </div>
                        )
                    }

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {!isLoginView && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {isLoginView && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/forgotpassword" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-70"
                        disabled={isLoading !== null}
                    >
                        {isLoading === 'email-password' ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            isLoginView ? 'Sign In' : 'Sign Up'
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="text-center text-sm mt-6">
                        {isLoginView ? (
                            <p>
                                Don&apos;t have an account?{' '}
                                <button
                                    type="button"
                                    onClick={toggleAuthView}
                                    className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={toggleAuthView}
                                    className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                    Sign in
                                </button>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}