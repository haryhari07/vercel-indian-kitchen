
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const router = useRouter();

  const isLogin = activeTab === 'signin';

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

  const handleGoogleLogin = async () => {
    try {
      // Simulate Google Login by logging in as a demo user
      // For this to work, we'll try to login as google-user, if it fails, we'll signup
      const email = 'google-user@example.com';
      const password = 'password123'; 
      const name = 'Google User';
      
      try {
        await login(email, password);
      } catch (e) {
        await signup(email, password, name);
      }
      router.push('/');
    } catch (err) {
      setError('Google login simulation failed.');
    }
  };

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
                className="w-full border border-[var(--ak-border)] bg-white rounded-md px-3 py-2.5 text-sm flex items-center justify-center gap-2 hover:border-gray-300 transition hover:bg-gray-50"
              >
                <span className="text-lg">🔑</span>
                <span>Continue with Google</span>
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
