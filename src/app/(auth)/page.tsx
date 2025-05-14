'use client';
import React from "react";
import { useGoogleFont } from '../../../utils/fonts';
import { useState, useEffect } from 'react';
import { Logo } from "../../../components";

export default function Authentication() {
  const fontFamily = useGoogleFont('Inter')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [fadeIn, setFadeIn] = useState(false)
  
  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setFadeIn(true)
  }, [])
  
  const handleLogin = (provider: string) => {
    setError(null)
    setIsLoading(provider)
    
    // Simulate authentication process
    setTimeout(() => {
      // For demo purposes, let's show an error for GitHub login
      if (provider === 'github') {
        setError('Authentication failed with GitHub. Please try again.')
        setIsLoading(null)
      } else {
        // Simulate successful login for other providers
        window.location.href = '/'
      }
    }, 1500)
  }
  
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100"
      style={{ fontFamily }}
    >
      <div 
        className={`w-full max-w-md px-8 py-10 bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-xl ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionProperty: 'opacity, transform' }}>
        <div className="flex justify-center mb-6">
          <Logo size="medium" />
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Sign in to Your Account</h1>
          <p className="text-gray-600">Choose a provider to continue</p>
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
        
        <div className="space-y-4">
          {/* Google Login Button */}
          <button 
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
            onClick={() => handleLogin('google')}
            disabled={isLoading !== null}
          >
            {isLoading === 'google' ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>{isLoading === 'google' ? 'Signing in...' : 'Continue with Google'}</span>
          </button>
          
          {/* GitHub Login Button */}
          <button 
            className="w-full flex items-center justify-center gap-3 bg-gray-900 rounded-lg py-3 px-4 text-white font-medium hover:bg-gray-800 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-70"
            onClick={() => handleLogin('github')}
            disabled={isLoading !== null}
          >
            {isLoading === 'github' ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            )}
            <span>{isLoading === 'github' ? 'Signing in...' : 'Continue with GitHub'}</span>
          </button>
          
          {/* Microsoft Login Button */}
          <button 
            className="w-full flex items-center justify-center gap-3 bg-blue-500 rounded-lg py-3 px-4 text-white font-medium hover:bg-blue-600 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-70"
            onClick={() => handleLogin('microsoft')}
            disabled={isLoading !== null}
          >
            {isLoading === 'microsoft' ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
                <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
                <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
              </svg>
            )}
            <span>{isLoading === 'microsoft' ? 'Signing in...' : 'Continue with Microsoft'}</span>
          </button>
          
          {/* LinkedIn Login Button */}
          <button 
            className="w-full flex items-center justify-center gap-3 bg-blue-700 rounded-lg py-3 px-4 text-white font-medium hover:bg-blue-800 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
            onClick={() => handleLogin('linkedin')}
            disabled={isLoading !== null}
          >
            {isLoading === 'linkedin' ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            )}
            <span>{isLoading === 'linkedin' ? 'Signing in...' : 'Continue with LinkedIn'}</span>
          </button>
        </div>
        
        {/* Remember me & Forgot password */}
        <div className="mt-6 flex items-center justify-between">
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
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Forgot your password?
            </a>
          </div>
        </div>
        
        {/* Additional Options */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}