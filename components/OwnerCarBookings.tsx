'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBookings, getCars, getCurrentSession, getCurrentUser, hasRole, transitionBooking } from '@/lib/storage';
import { Booking, Car } from '@/types';

export default function OwnerCarBookings({ carId }: { carId: string }) {
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.replace(`/signin?next=${encodeURIComponent(`/owner/cars/${carId}/bookings`)}`);
      return;
    }
    const ownCar = getCars().find((candidate) => candidate.id === carId && candidate.ownerId === session.userId);
    if (!ownCar) setError('Not yours: this vehicle is not part of your fleet.');
    const cars = getCars();
    const bookings = getBookings().filter((booking) => booking.carId === carId && booking.ownerId === session.userId);
    startTransition(() => {
      setCar(ownCar ?? null);
      setBookings(bookings);
      setLoaded(true);
    });
  }, [carId, router]);

  const updateBooking = (bookingId: string, status: Booking['status']) => {
    const result = transitionBooking(bookingId, status);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setBookings(getBookings().filter((booking) => booking.carId === carId && booking.ownerId === result.value.ownerId));
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
        <Link href="/owner/cars" className="text-sm text-slate-600 hover:text-emerald-700">← Back to fleet</Link>
        <div><p className="text-xs uppercase tracking-widest font-mono text-emerald-700">Owner studio / booking desk</p><h1 className="text-3xl font-black mt-2">{car ? `${car.make} ${car.model}` : 'Car bookings'}</h1></div>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {!loaded ? <p>Loading booking requests…</p> : !car ? null : bookings.length === 0 ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">There are no bookings for this vehicle yet.</section>
        ) : (
          <section className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600"><tr><th className="p-4">Renter</th><th className="p-4">Dates</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="p-4 font-mono text-xs">{booking.renterId}</td>
                  <td className="p-4">{booking.startDate} – {booking.endDate}</td>
                  <td className="p-4">{booking.total.toLocaleString()} ETB</td>
                  <td className="p-4 capitalize">{booking.status.replaceAll('_', ' ')}</td>
                  <td className="p-4 flex flex-wrap gap-2">
                    <Link href={`/bookings/${booking.id}`} className="underline text-emerald-800">Details</Link>
                    {booking.status === 'requested' && <>
                      <button onClick={() => updateBooking(booking.id, 'confirmed')} className="text-emerald-800 underline">Approve</button>
                      <button onClick={() => updateBooking(booking.id, 'declined')} className="text-rose-700 underline">Decline</button>
                    </>}
                    {booking.status === 'confirmed' && <button onClick={() => updateBooking(booking.id, 'in_progress')} className="text-blue-800 underline">Start trip</button>}
                    {booking.status === 'in_progress' && <button onClick={() => updateBooking(booking.id, 'completed')} className="text-emerald-800 underline">Complete</button>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
