/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyTwoFactorCode } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'

function TwoFactorVerificationContent() {
    const searchParams = useSearchParams()
    const userId = searchParams?.get('userId') || ''
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) {
            setError('User ID is missing')
            return
        }

        if (code.length !== 6) {
            setError('Please enter a 6-digit code')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const result = await verifyTwoFactorCode(userId, code)
            if (result.success) {
                router.push('/dashboard')
            } else {
                setError(result.error || 'Verification failed')
            }
        } catch (err: any) {
            setError('An error occurred during verification')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Two-Factor Verification
                </h1>

                {!userId && (
                    <div className="mb-4 text-red-500">
                        Error: User ID is missing. Please try logging in again.
                    </div>
                )}

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please enter the 6-digit code from your authenticator app.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                setError('')
                            }}
                            className="w-full px-4 py-2 text-center text-2xl tracking-widest rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="000000"
                            autoFocus
                            disabled={!userId}
                        />
                    </div>

                    {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

                    <button
                        type="submit"
                        disabled={code.length !== 6 || isLoading || !userId}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Lost access to your authenticator app?</p>
                    <button className="text-blue-600 dark:text-blue-400 hover:underline">
                        Use a backup code
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function TwoFactorVerificationPage() {
    return (
        <Suspense fallback={<div>Loading verification...</div>}>
            <TwoFactorVerificationContent />
        </Suspense>
    )
}