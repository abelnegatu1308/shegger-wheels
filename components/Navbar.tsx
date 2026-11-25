'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Car,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { getCurrentSession, getCurrentUser, signOut } from '@/lib/storage';
import { User, SessionState } from '@/types';

export default function Navbar() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function loadData() {
      const s = getCurrentSession();
      setSession(s);
      setUser(getCurrentUser());
    }
    loadData();

    window.addEventListener('sw_storage_update', loadData);
    return () => window.removeEventListener('sw_storage_update', loadData);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md">
                <Car className="w-6 h-6" />
              </div>
              <span>Sheggar<span className="text-emerald-600">Wheels</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/" className={`hover:text-emerald-600 transition ${pathname === '/' ? 'text-emerald-600 font-semibold' : ''}`}>
                Home
              </Link>
              <Link href="/cars" className={`hover:text-emerald-600 transition ${pathname.startsWith('/cars') ? 'text-emerald-600 font-semibold' : ''}`}>
                Browse Cars
              </Link>
              {session && (
                <>
                  <Link href="/dashboard" className={`hover:text-emerald-600 transition ${pathname === '/dashboard' ? 'text-emerald-600 font-semibold' : ''}`}>
                    Renter Dashboard
                  </Link>
                  <Link href="/bookings" className={`hover:text-emerald-600 transition ${pathname.startsWith('/bookings') ? 'text-emerald-600 font-semibold' : ''}`}>
                    Bookings
                  </Link>
                </>
              )}
              {user?.roles.includes('owner') && (
                <Link href="/owner" className={`hover:text-emerald-600 transition ${pathname.startsWith('/owner') ? 'text-emerald-600 font-semibold' : ''}`}>
                  Owner Hub
                </Link>
              )}
              {user?.roles.includes('admin') && (
                <Link href="/admin" className={`hover:text-emerald-600 transition ${pathname.startsWith('/admin') ? 'text-emerald-600 font-semibold' : ''}`}>
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {session && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-emerald-600 font-medium capitalize">Role: {session.activeRole}</div>
                </div>
                <Link
                  href="/signin"
                  className="px-2 py-2 text-xs font-medium text-slate-600 hover:text-emerald-600 transition"
                >
                  Switch account
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            href="/cars"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Cars
          </Link>
          {session && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Renter Dashboard
              </Link>
              <Link
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Bookings
              </Link>
            </>
          )}
          {user?.roles.includes('owner') && (
            <Link
              href="/owner"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Owner Hub
            </Link>
          )}
          {user?.roles.includes('admin') && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Admin Panel
            </Link>
          )}

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
            {session && user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-emerald-600 capitalize">Role: {session.activeRole}</div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-rose-600 font-medium text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          {session && user && (
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Switch account
            </Link>
          )}
        </div>
      )}

    </header>
  );
}
