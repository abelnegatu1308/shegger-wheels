'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, safeReturnPath, signInAsDemo } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const users = getUsers();

  const handleSignIn = (userId: string, role: 'renter' | 'owner' | 'admin') => {
    const params = new URLSearchParams(window.location.search);
    const fallback = role === 'owner' ? '/owner' : role === 'admin' ? '/admin' : '/dashboard';
    const nextUrl = safeReturnPath(params.get('next'), fallback);
    if (!signInAsDemo(userId, role)) {
      setErrorMsg('This demo account is unavailable or does not have that role. Choose an active account.');
      return;
    }
    router.push(nextUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Demo Sign In</h1>
            <p className="text-sm text-slate-600">Select a pre-configured demo account to test the platform instantly.</p>
          </div>

          <div className="space-y-3 pt-2">
            {errorMsg && (
              <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}
            {users.map(u => (
              <div key={u.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </div>
                  <span className="text-xs font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    {u.roles.join(', ')}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  {u.roles.includes('renter') && (
                    <button
                      onClick={() => handleSignIn(u.id, 'renter')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 rounded-xl font-semibold transition"
                    >
                      Sign in as Renter
                    </button>
                  )}
                  {u.roles.includes('owner') && (
                    <button
                      onClick={() => handleSignIn(u.id, 'owner')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl font-semibold transition"
                    >
                      Sign in as Owner
                    </button>
                  )}
                  {u.roles.includes('admin') && (
                    <button
                      onClick={() => handleSignIn(u.id, 'admin')}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded-xl font-semibold transition"
                    >
                      Sign in as Admin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have a renter account?{' '}
              <a href="/signup" className="text-emerald-600 font-semibold hover:underline">Create Renter Account</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
