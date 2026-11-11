'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, getCurrentUser, getCars, formatETB, getBookings, hasRole } from '@/lib/storage';
import { Car, Booking } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csv';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function OwnerEarningsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activity, setActivity] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.replace('/signin?next=%2Fowner%2Fearnings');
      return;
    }
    const ownerCars = getCars().filter(c => c.ownerId === session.userId);
    const ownerCarIds = new Set(ownerCars.map(c => c.id));
    const ownerBookings = getBookings().filter(b => ownerCarIds.has(b.carId) && ['completed', 'reviewed'].includes(b.status));
    const allBookings = getBookings().filter(b => ownerCarIds.has(b.carId));
    startTransition(() => {
      setCars(ownerCars);
      setBookings(ownerBookings);
      setActivity(allBookings);
      setLoaded(true);
    });
  }, [router]);

  const totalEarnings = bookings.reduce((acc, b) => acc + b.subtotal, 0);

  const exportCSV = () => {
    downloadCsv(`shegger_wheels_owner_earnings_${Date.now()}.csv`, [
      ['Booking ID', 'Car ID', 'Start Date', 'End Date', 'Days', 'Subtotal (ETB)'],
      ...bookings.map(b => [b.id, b.carId, b.startDate, b.endDate, b.days, b.subtotal]),
    ]);
  };

  const monthlyEarnings = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const key = date.toISOString().slice(0, 7);
    return {
      month: date.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      earnings: bookings.filter((booking) => booking.startDate.slice(0, 7) === key).reduce((sum, booking) => sum + booking.subtotal, 0),
    };
  });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const windowEnd = today.getTime() + 86_400_000;
  const windowStart = windowEnd - 30 * 86_400_000;
  const utilization = cars.map((car) => {
    const bookedMilliseconds = activity
      .filter((booking) => booking.carId === car.id && ['confirmed', 'in_progress', 'completed', 'reviewed'].includes(booking.status))
      .reduce((sum, booking) => {
        const start = Date.parse(`${booking.startDate}T00:00:00Z`);
        const end = Date.parse(`${booking.endDate}T00:00:00Z`);
        return sum + Math.max(0, Math.min(end, windowEnd) - Math.max(start, windowStart));
      }, 0);
    return { car, percent: Math.min(100, Math.round(bookedMilliseconds / (30 * 86_400_000) * 100)) };
  });

  if (!loaded) {
    return <div className="min-h-screen flex flex-col bg-slate-50"><Navbar /><main className="flex-1 p-10 text-center">Loading owner report…</main><Footer /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => router.push('/owner')} className="text-slate-600 hover:text-emerald-600 text-sm font-medium flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Owner Hub
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900">Earnings & Financial Reports</h1>
          </div>
          <button
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-2">
            <div className="text-sm font-medium text-slate-500">Total Earnings</div>
            <div className="text-3xl font-extrabold text-emerald-600">{formatETB(totalEarnings)}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-2">
            <div className="text-sm font-medium text-slate-500">Completed Rentals</div>
            <div className="text-3xl font-extrabold text-slate-900">{bookings.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-2">
            <div className="text-sm font-medium text-slate-500">Active Cars</div>
            <div className="text-3xl font-extrabold text-blue-600">{cars.length}</div>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Monthly realized earnings</h2>
          <div className="h-72" role="img" aria-label="Line chart of realized earnings by month">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyEarnings}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="earnings" stroke="#047857" strokeWidth={3} /></LineChart></ResponsiveContainer>
          </div>
          <table className="w-full text-sm"><caption className="sr-only">Monthly realized earnings</caption><thead><tr><th className="text-left p-2">Month</th><th className="text-right p-2">ETB</th></tr></thead><tbody>{monthlyEarnings.map((row) => <tr key={row.month} className="border-t"><td className="p-2">{row.month}</td><td className="p-2 text-right">{formatETB(row.earnings)}</td></tr>)}</tbody></table>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Fleet utilization · last 30 days</h2>
          {utilization.length === 0 ? <p className="text-sm text-slate-500">No vehicles are listed yet.</p> : utilization.map(({ car, percent }) => <div key={car.id} className="space-y-1"><div className="flex justify-between text-sm"><span>{car.make} {car.model}</span><span>{percent}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-600" style={{ width: `${percent}%` }} /></div></div>)}
        </section>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 font-bold text-slate-900">Earnings Breakdown by Rental</div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Car ID</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No completed or confirmed rental earnings yet.
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-xs text-slate-600">{b.id}</td>
                    <td className="p-4 font-medium text-slate-800">{cars.find((car) => car.id === b.carId)?.make ?? b.carId}</td>
                    <td className="p-4 text-slate-600 text-xs">{b.startDate} → {b.endDate}</td>
                    <td className="p-4 text-slate-600">{b.days} days</td>
                    <td className="p-4 text-right font-bold text-emerald-600">{formatETB(b.subtotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}
