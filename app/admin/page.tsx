'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, getCurrentUser, getUsers, saveUsers, getCars, saveCars, getBookings, getDisputes, formatETB, hasRole } from '@/lib/storage';
import { User, Car, Booking, Dispute } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldAlert, CheckCircle2, XCircle, Users, Car as CarIcon, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'admin')) {
      router.push('/signin?next=/admin');
      return;
    }
    startTransition(() => {
      setUsers(getUsers());
      setCars(getCars());
      setBookings(getBookings());
      setDisputes(getDisputes());
    });
  }, [router]);

  const handleApproveCar = (carId: string, status: 'approved' | 'rejected') => {
    if (!getCurrentSession() || !hasRole(getCurrentUser(), 'admin')) return;
    if (!cars.some((car) => car.id === carId && car.status === 'pending')) return;
    const updated = cars.map(c => c.id === carId ? { ...c, status } : c);
    saveCars(updated);
    setCars(updated);
  };

  const handleSuspendUser = (userId: string) => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'admin') || session.userId === userId || userId === 'u_admin_1') return;
    const updated = users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' as const : 'active' as const } : u);
    saveUsers(updated);
    setUsers(updated);
  };

  const pendingCars = cars.filter(c => c.status === 'pending');
  const totalCommission = bookings
    .filter(b => ['confirmed', 'in_progress', 'completed', 'reviewed'].includes(b.status))
    .reduce((acc, b) => acc + b.fee, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="bg-purple-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="bg-purple-500/30 text-purple-200 text-xs font-bold uppercase px-3 py-1 rounded-full border border-purple-400/30">
              Admin Moderation Hub
            </span>
            <h1 className="text-3xl font-extrabold mt-2">Platform Administration</h1>
            <p className="text-purple-200 text-sm mt-1">Review pending listings, manage demo users, and oversee platform commissions.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-purple-800/80 p-4 rounded-2xl text-center border border-purple-700">
              <div className="text-2xl font-extrabold">{users.length}</div>
              <div className="text-xs text-purple-300">Users</div>
            </div>
            <div className="bg-purple-800/80 p-4 rounded-2xl text-center border border-purple-700">
              <div className="text-2xl font-extrabold">{cars.length}</div>
              <div className="text-xs text-purple-300">Cars</div>
            </div>
            <div className="bg-purple-800/80 p-4 rounded-2xl text-center border border-purple-700">
              <div className="text-2xl font-extrabold text-emerald-400">{formatETB(totalCommission)}</div>
              <div className="text-xs text-purple-300">Commission</div>
            </div>
            <div className="bg-purple-800/80 p-4 rounded-2xl text-center border border-purple-700">
              <div className="text-2xl font-extrabold text-amber-300">{disputes.filter((dispute) => dispute.status !== 'resolved').length}</div>
              <div className="text-xs text-purple-300">Open disputes</div>
            </div>
          </div>
        </div>

        <nav aria-label="Admin tools" className="flex flex-wrap gap-3">
          {[
            ['/admin/listings', 'Listing moderation'],
            ['/admin/users', 'Demo accounts'],
            ['/admin/bookings', 'All bookings'],
            ['/admin/disputes', 'Dispute queue'],
            ['/admin/reports', 'Platform reports'],
            ['/admin/announcements', 'Announcements'],
          ].map(([href, label]) => <Link key={href} href={href} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-emerald-600">{label}</Link>)}
        </nav>

        {/* Pending Listings Approval */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Pending Car Listings ({pendingCars.length})</h2>
          {pendingCars.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-500 text-sm">
              No pending car listings awaiting approval.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCars.map(car => (
                <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div className="relative h-44 bg-slate-200">
                    <img src={car.photos[0]} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{car.make} {car.model} ({car.year})</h3>
                      <p className="text-xs text-slate-500">{car.neighbourhood}, {car.city} • {formatETB(car.pricePerDay)}/day</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApproveCar(car.id, 'approved')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveCar(car.id, 'rejected')}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Users Management */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-slate-900">Demo Users Management</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Roles</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs uppercase bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full">
                        {u.roles.join(', ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.id !== 'u_admin_1' && (
                        <button
                          onClick={() => handleSuspendUser(u.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${u.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          {u.status === 'active' ? 'Suspend User' : 'Reinstate User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
