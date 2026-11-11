'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, getCurrentUser, getCars, getBookings, formatETB, hasRole } from '@/lib/storage';
import { Car, Booking, User } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Car as CarIcon, Plus, DollarSign, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

export default function OwnerHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.push('/signin?next=/owner');
      return;
    }
    const currentUser = getCurrentUser();
    const sessionUserId = session.userId;
    const ownerCars = getCars().filter(c => c.ownerId === sessionUserId);
    const ownerCarIds = new Set(ownerCars.map(c => c.id));
    const ownerBookings = getBookings().filter(b => ownerCarIds.has(b.carId));
    startTransition(() => {
      setUser(currentUser);
      setCars(ownerCars);
      setBookings(ownerBookings);
    });
  }, [router]);

  if (!user) return null;

  const totalEarnings = bookings
    .filter(b => ['confirmed', 'in_progress', 'completed', 'reviewed'].includes(b.status))
    .reduce((acc, b) => acc + b.subtotal, 0);

  const pendingRequests = bookings.filter(b => b.status === 'requested');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Owner Hub
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Welcome, {user.name}</h1>
            <p className="text-slate-600 text-sm mt-1">Manage your fleet, approve booking requests, and track monthly earnings.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-blue-600">{cars.length}</div>
              <div className="text-xs text-slate-500 font-medium">Your Cars</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-emerald-600">{formatETB(totalEarnings)}</div>
              <div className="text-xs text-slate-500 font-medium">Total Earnings</div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/owner/cars" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 transition space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">Manage Cars</h3>
            <p className="text-xs text-slate-500">Add, edit, or deactivate your vehicle listings.</p>
          </Link>
          <Link href="/owner/cars/new" className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl shadow-sm transition space-y-2">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" /> List New Car
            </h3>
            <p className="text-xs text-emerald-100">Publish a new car to the Sheggar Wheels marketplace.</p>
          </Link>
          <Link href="/owner/earnings" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 transition space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">Earnings & Reports</h3>
            <p className="text-xs text-slate-500">Monthly breakdown and CSV earnings export.</p>
          </Link>
          <Link href="/owner/reviews" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 transition space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">Reviews & Replies</h3>
            <p className="text-xs text-slate-500">Respond to renter feedback and ratings.</p>
          </Link>
          <Link href="/owner/disputes" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-rose-400 transition space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">Dispute desk</h3>
            <p className="text-xs text-slate-500">Review and respond to issues linked to your bookings.</p>
          </Link>
        </div>

        {/* Pending Requests */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-slate-900">Pending Booking Requests ({pendingRequests.length})</h2>
          {pendingRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-500 text-sm">
              No pending booking requests at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(b => {
                const car = cars.find(c => c.id === b.carId);
                return (
                  <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded w-fit">
                        Pending Approval
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{car ? `${car.make} ${car.model}` : b.carId}</h3>
                      <p className="text-xs text-slate-600">
                        Dates: {b.startDate} to {b.endDate} ({b.days} days) • Total: <strong className="text-emerald-600">{formatETB(b.total)}</strong>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/bookings/${b.id}`}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Review & Manage
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
