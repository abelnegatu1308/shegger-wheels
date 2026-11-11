'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MapPanel from '@/components/MapPanel';
import { getBookings, getCars, getCurrentSession, getCurrentUser } from '@/lib/storage';
import { Booking, Car } from '@/types';

const simulatedRoute: [number, number][] = [
  [8.9806, 38.7578],
  [8.9871, 38.7638],
  [8.9952, 38.7702],
];

export default function BookingTrack({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.replace(`/signin?next=${encodeURIComponent(`/bookings/${bookingId}/track`)}`);
      return;
    }
    const currentUser = getCurrentUser();
    const found = getBookings().find((candidate) => candidate.id === bookingId);
    startTransition(() => {
      if (found && currentUser && [found.renterId, found.ownerId].includes(currentUser.id) && found.status === 'in_progress') {
        setBooking(found);
        setCar(getCars().find((candidate) => candidate.id === found.carId) ?? null);
      } else {
        setDenied(true);
      }
      setLoaded(true);
    });
  }, [bookingId, router]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
        <Link href={booking ? `/bookings/${booking.id}` : '/bookings'} className="text-sm text-emerald-800 underline">← Back to booking</Link>
        {!loaded ? <p>Loading trip status…</p> : denied || !booking || !car ? (
          <section className="bg-white p-8 rounded-2xl border border-slate-200 space-y-3"><h1 className="text-2xl font-bold">Tracking unavailable</h1><p role="alert" className="text-slate-600">Only a renter or owner of an in-progress trip can view its simulated tracking panel.</p></section>
        ) : (
          <section className="space-y-5">
            <div><p className="text-xs font-mono uppercase tracking-widest text-emerald-700">Trip control / simulation</p><h1 className="text-3xl font-black mt-2">{car.make} {car.model} trip</h1><p className="text-sm text-slate-600 mt-2">The marker uses a few predefined demo points around Addis Ababa. This is not GPS or live vehicle tracking.</p></div>
            <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-300"><MapPanel center={[car.latitude, car.longitude]} label={`${car.neighbourhood}, ${car.city}`} route={simulatedRoute} step={step} /></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4"><p className="text-sm">Simulation point <strong>{step + 1}</strong> of <strong>{simulatedRoute.length}</strong> · {car.neighbourhood}, Addis Ababa</p><button onClick={() => setStep((current) => (current + 1) % simulatedRoute.length)} className="min-h-11 px-5 bg-emerald-700 text-white rounded-xl font-semibold">Advance simulation</button></div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
