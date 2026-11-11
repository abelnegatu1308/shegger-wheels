'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, saveUsers, signInAsDemo, safeReturnPath } from '@/lib/storage';
import { User } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      setErrorMsg('An account with this email already exists in the demo. Please sign in instead.');
      return;
    }

    const newUser: User = {
      id: `u_renter_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      roles: ['renter'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    if (!saveUsers(users)) {
      setErrorMsg('Your account could not be saved. Check browser storage and try again.');
      return;
    }

    if (!signInAsDemo(newUser.id, 'renter')) {
      setErrorMsg('Your demo account was created but could not be signed in. Please use the sign-in page.');
      return;
    }
    const next = safeReturnPath(new URLSearchParams(window.location.search).get('next'), '/dashboard');
    router.push(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Renter Account</h1>
            <p className="text-sm text-slate-600">Join Sheggar Wheels to start booking vehicles in Addis Ababa.</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Abebe Kebede"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="abebe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+251 91 122 3344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
            >
              Register & Sign In
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have a demo account?{' '}
              <a href="/signin" className="text-emerald-600 font-semibold hover:underline">Sign In</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
