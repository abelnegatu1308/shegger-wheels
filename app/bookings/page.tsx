'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, getCurrentUser, getBookings, getCars, formatETB, hasRole } from '@/lib/storage';
import { Booking, Car, User } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Download, FileText, ArrowLeft, Filter, AlertTriangle } from 'lucide-react';
import { downloadCsv } from '@/lib/csv';

export default function BookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'renter')) {
      router.push('/signin?next=/bookings');
      return;
    }
    const currentUser = getCurrentUser();
    const userBookings = getBookings().filter(b => b.renterId === session.userId);
    const allCars = getCars();
    startTransition(() => {
      setUser(currentUser);
      setBookings(userBookings);
      setCars(allCars);
    });
  }, [router]);

  const filteredBookings = bookings.filter(b => !statusFilter || b.status === statusFilter);

  // CSV Export requirement
  const exportCSV = () => {
    downloadCsv(`shegger_wheels_bookings_${Date.now()}.csv`, [
      ['Booking ID', 'Car ID', 'Start Date', 'End Date', 'Days', 'Total (ETB)', 'Payment Status', 'Status', 'Created At'],
      ...filteredBookings.map(b => [b.id, b.carId, b.startDate, b.endDate, b.days, b.total, b.paymentStatus, b.status, b.createdAt]),
    ]);
  };

  if (!user) return null;

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Booking History & Export</h1>
            <p className="text-slate-600 text-sm mt-1">Review all your past and active rental bookings in Addis Ababa.</p>
          </div>
          <button
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-slate-600">
            Total records: <strong className="text-slate-900">{filteredBookings.length}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Car</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No bookings found matching the selected status.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map(b => {
                  const car = cars.find(c => c.id === b.carId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-xs text-slate-600">{b.id}</td>
                      <td className="p-4 font-medium text-slate-800">{car ? `${car.make} ${car.model}` : b.carId}</td>
                      <td className="p-4 text-slate-600 text-xs">{b.startDate} → {b.endDate} ({b.days}d)</td>
                      <td className="p-4 font-bold text-slate-900">{formatETB(b.total)}</td>
                      <td className="p-4">
                        <span className="text-xs uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          {b.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/bookings/${b.id}`}
                          className="text-emerald-600 hover:underline text-xs font-semibold"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2"><button onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="min-h-11 px-4 rounded-xl border border-slate-300 disabled:opacity-40">Previous</button><button onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="min-h-11 px-4 rounded-xl border border-slate-300 disabled:opacity-40">Next</button></div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
