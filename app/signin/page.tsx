
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function SignInPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { login, signup, user, refreshUser } = useAuth();
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLogin = activeTab === 'signin';

  // Handle Google Login Sync
  useEffect(() => {
    if (status === 'authenticated' && !user) {
      const syncGoogleUser = async () => {
        setIsGoogleLoading(true);
        try {
          const res = await fetch('/api/auth/google-sync', {
            method: 'POST',
          });
          
          if (res.ok) {
            // Refresh user context to pick up the new session
            await refreshUser();
            router.push('/');
          } else {
            setError('Failed to sync Google account.');
            setIsGoogleLoading(false);
          }
        } catch (err) {
          console.error(err);
          setError('An error occurred during Google login.');
          setIsGoogleLoading(false);
        }
      };
      
      syncGoogleUser();
    } else if (user) {
      // If already logged in (e.g. after sync), redirect
      router.push('/');
    }
  }, [status, user, refreshUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !name) {
      setError('Please enter your name');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Force account selection
    signIn('google', { 
      callbackUrl: '/signin',
    });
  };

  if (isGoogleLoading || status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-[var(--ak-bg-soft)] flex items-center justify-center px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting with Google...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[var(--ak-bg-soft)] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white border border-[var(--ak-border)] shadow-sm mb-4">
            <span className="text-2xl">🍲</span>
          </div>
          <h1 className="section-title text-3xl mb-2">
            Welcome to Indian Kitchen
          </h1>
          <p className="section-subtitle text-sm">
            Join our community to save recipes, plan meals, and rate your favourites.
          </p>
        </div>

        <div className="card bg-white overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${
                activeTab === 'signin'
                  ? 'text-[var(--ak-primary)] border-b-2 border-[var(--ak-primary)] bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${
                activeTab === 'signup'
                  ? 'text-[var(--ak-primary)] border-b-2 border-[var(--ak-primary)] bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="px-6 py-7">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-100">
                  {error}
                </div>
              )}
              
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-[var(--ak-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ak-primary)] focus:border-[var(--ak-primary)] bg-[var(--ak-bg-soft)]"
                    placeholder="Your Name"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-[var(--ak-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ak-primary)] focus:border-[var(--ak-primary)] bg-[var(--ak-bg-soft)]"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  {isLogin && (
                    <button type="button" className="text-xs text-[var(--ak-primary)] hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-[var(--ak-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ak-primary)] focus:border-[var(--ak-primary)] bg-[var(--ak-bg-soft)]"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center mt-2">
                {isLogin ? 'Sign in' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--ak-border)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-400">or</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full border border-[var(--ak-border)] bg-white rounded-md px-3 py-2.5 text-sm flex items-center justify-center gap-2 hover:border-gray-300 transition hover:bg-gray-50 group"
              >
                {/* Google Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-gray-700 font-medium group-hover:text-gray-900">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-gray-700 underline hover:text-black">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-gray-700 underline hover:text-black">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
