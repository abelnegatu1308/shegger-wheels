'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Car,
  Calendar,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  Settings,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  Award
} from 'lucide-react';
import { getCurrentSession, getCurrentUser, signOut, getAnnouncements, getUsers, signInAsDemo } from '@/lib/storage';
import { User, SessionState, Announcement } from '@/types';

export default function Navbar() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoError, setDemoError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function loadData() {
      const s = getCurrentSession();
      setSession(s);
      setUser(getCurrentUser());
      const anns = getAnnouncements().filter(a => a.active);
      setAnnouncements(anns);
    }
    loadData();

    window.addEventListener('sw_storage_update', loadData);
    return () => window.removeEventListener('sw_storage_update', loadData);
  }, [pathname]);

  const allUsers = getUsers();
  const switchDemo = (userId: string, role: 'renter' | 'owner' | 'admin', destination: string) => {
    if (!signInAsDemo(userId, role)) {
      setDemoError('That demo account is suspended or does not have this role.');
      return;
    }
    setDemoError('');
    setDemoModalOpen(false);
    router.push(destination);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Active Announcements Banner */}
      {announcements.map(ann => (
        <div key={ann.id} className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Award className="w-4 h-4" />
          <span><strong>{ann.title}:</strong> {ann.message}</span>
        </div>
      ))}

      {/* Demo Mode Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-400">DEMO MODE ACTIVE</span>
          <span className="hidden sm:inline">— Peer-to-Peer Car Rental for Addis Ababa (No real payments or database)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDemoModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded text-xs font-medium transition"
          >
            Switch Demo Account
          </button>
        </div>
      </div>

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
                <button
                  onClick={() => signOut()}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                  title="Sign Out"
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
        </div>
      )}

      {/* Switch Demo Account Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="demo-account-title" className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 id="demo-account-title" className="text-lg font-bold text-slate-900">Switch Demo Account</h3>
              <button aria-label="Close demo account dialog" onClick={() => setDemoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {demoError && <p role="alert" className="text-sm text-rose-700">{demoError}</p>}
            <p className="text-sm text-slate-600">
              Select one of the pre-configured demo users to instantly test Renter, Owner, or Admin capabilities:
            </p>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div key={u.id} className="border border-slate-200 rounded-xl p-3 flex flex-col gap-2 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    <span className="text-xs uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {u.roles.join(', ')}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    {u.roles.includes('renter') && (
                      <button
                        disabled={u.status !== 'active'}
                        onClick={() => switchDemo(u.id, 'renter', '/dashboard')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 rounded font-medium transition"
                      >
                        Sign in as Renter
                      </button>
                    )}
                    {u.roles.includes('owner') && (
                      <button
                        disabled={u.status !== 'active'}
                        onClick={() => switchDemo(u.id, 'owner', '/owner')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded font-medium transition"
                      >
                        Sign in as Owner
                      </button>
                    )}
                    {u.roles.includes('admin') && (
                      <button
                        disabled={u.status !== 'active'}
                        onClick={() => switchDemo(u.id, 'admin', '/admin')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1.5 rounded font-medium transition"
                      >
                        Sign in as Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm py-2 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
