'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentSession, getBookings, getCars, formatETB } from '@/lib/storage';
import { Booking, Car, User } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Car as CarIcon, CheckCircle2, Clock, XCircle, ArrowRight, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.push('/signin?next=/dashboard');
      return;
    }
    const currentUser = getCurrentUser();
    const sessionUserId = session.userId;
    const userBookings = getBookings().filter(b => b.renterId === sessionUserId);
    const allCars = getCars();
    startTransition(() => {
      setUser(currentUser);
      setBookings(userBookings);
      setCars(allCars);
    });
  }, [router]);

  if (!user) return null;

  const upcomingTrips = bookings.filter(b => ['requested', 'confirmed', 'in_progress'].includes(b.status));
  const pastTrips = bookings.filter(b => ['completed', 'reviewed', 'declined', 'cancelled', 'disputed', 'resolved'].includes(b.status));
  const totalSpend = bookings
    .filter(b => ['confirmed', 'in_progress', 'completed', 'reviewed'].includes(b.status))
    .reduce((acc, b) => acc + b.total, 0);

  const getCarDetails = (carId: string) => cars.find(c => c.id === carId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              Renter Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Welcome back, {user.name}!</h1>
            <p className="text-slate-600 text-sm mt-1">Manage your upcoming trips, view booking history, and review past rentals.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-emerald-600">{bookings.length}</div>
              <div className="text-xs text-slate-500 font-medium">Total Bookings</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-slate-900">{formatETB(totalSpend)}</div>
              <div className="text-xs text-slate-500 font-medium">Total Spend</div>
            </div>
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Upcoming & Active Trips</h2>
          {upcomingTrips.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-500 text-sm">
              You have no upcoming trips right now.{' '}
              <a href="/cars" className="text-emerald-600 font-semibold hover:underline">Browse cars</a> to book your next ride.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map(b => {
                const car = getCarDetails(b.carId);
                return (
                  <div key={b.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                          {b.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">ID: {b.id}</span>
                      </div>
                      {car && <h3 className="text-lg font-bold text-slate-900">{car.make} {car.model}</h3>}
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>📅 {b.startDate} to {b.endDate} ({b.days} days)</div>
                        <div>💰 Total: <strong className="text-emerald-600">{formatETB(b.total)}</strong></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex gap-2">
                      <a
                        href={`/bookings/${b.id}`}
                        className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white text-center py-2 rounded-xl text-xs font-semibold transition"
                      >
                        View Receipt & Status
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Trips & History */}
        <div className="space-y-4 pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Past Trip History</h2>
            <a
              href="/bookings"
              className="text-emerald-600 hover:underline font-semibold text-sm"
            >
              View All Bookings & Export CSV →
            </a>
          </div>

          {pastTrips.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-500 text-sm">
              No past trip history found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                    <th className="p-4">Car</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastTrips.map(b => {
                    const car = getCarDetails(b.carId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-medium text-slate-800">{car ? `${car.make} ${car.model}` : b.carId}</td>
                        <td className="p-4 text-slate-600 text-xs">{b.startDate} → {b.endDate}</td>
                        <td className="p-4 font-bold text-slate-800">{formatETB(b.total)}</td>
                        <td className="p-4">
                          <span className="text-xs uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <a
                            href={`/bookings/${b.id}`}
                            className="text-emerald-600 hover:underline text-xs font-semibold"
                          >
                            Details
                          </a>
                          {b.status === 'completed' && (
                            <a
                              href={`/bookings/${b.id}/review`}
                              className="text-blue-600 hover:underline text-xs font-semibold"
                            >
                              Leave Review
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
