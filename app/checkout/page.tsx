'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createBookingRequest, formatETB, getCars, getCurrentSession, readSession, STORAGE_KEYS } from '@/lib/storage';
import { Car, CheckoutDraft } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.replace('/signin?next=%2Fcheckout');
      return;
    }
    const savedDraft = readSession<CheckoutDraft | null>(STORAGE_KEYS.CHECKOUT_DRAFT, null);
    if (!savedDraft) {
      setError('No active checkout was found. Choose a vehicle and rental dates to begin.');
      return;
    }
    const draft = savedDraft;
    const car = getCars().find((candidate) => candidate.id === draft.carId) ?? null;
    startTransition(() => {
      setDraft(draft);
      setCar(car);
    });
  }, [router]);

  const completeMockPayment = () => {
    if (!draft || loading) return;
    setLoading(true);
    setError('');

    const result = createBookingRequest(draft);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setBookingId(result.value.id);
    window.sessionStorage.removeItem(STORAGE_KEYS.CHECKOUT_DRAFT);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        <button onClick={() => router.back()} className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {bookingId ? (
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl" aria-hidden="true">✓</div>
            <h1 className="text-2xl font-bold text-slate-900">Booking request sent</h1>
            <p className="text-sm text-slate-600">Your mock TeleBirr payment is held in the demo. The owner must approve the request before the rental is confirmed.</p>
            <p className="text-xs text-slate-500">Demo transaction: DEMO-{bookingId.slice(-8).toUpperCase()}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/bookings/${bookingId}`} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-semibold text-sm">View booking</Link>
              <Link href="/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold text-sm">Go to dashboard</Link>
            </div>
          </section>
        ) : !draft ? (
          <section className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Checkout unavailable</h1>
            <p role={error ? 'alert' : undefined} className="text-slate-600">{error || 'Loading checkout…'}</p>
            <Link href="/cars" className="inline-flex bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold text-sm">Browse cars</Link>
          </section>
        ) : (
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto"><Smartphone className="w-6 h-6" /></div>
              <h1 className="text-2xl font-bold text-slate-900">Mock TeleBirr Checkout</h1>
              <p className="text-sm text-slate-600">This demo does not collect payment credentials or charge real money.</p>
            </div>

            {error && <p role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">{error}</p>}

            {car && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                <img src={car.photos[0]} alt={`${car.make} ${car.model}`} className="w-20 h-20 rounded-xl object-cover" />
                <div><h2 className="font-bold text-slate-950">{car.make} {car.model} ({car.year})</h2><p className="text-xs text-slate-500">{car.neighbourhood}, {car.city}</p><p className="text-xs font-semibold text-emerald-600 mt-1">{formatETB(car.pricePerDay)} / day</p></div>
              </div>
            )}

            {!car && <p role="alert" className="text-rose-700 text-sm">The selected vehicle is no longer available.</p>}

            <dl className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-sm">
              <div className="flex justify-between gap-3"><dt>Rental dates</dt><dd className="text-right font-semibold">{draft.startDate} to {draft.endDate} ({draft.days} days)</dd></div>
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatETB(draft.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Platform fee (5%)</dt><dd>{formatETB(draft.fee)}</dd></div>
              <div className="flex justify-between border-t border-slate-200 pt-3 font-extrabold"><dt>Total</dt><dd className="text-emerald-700">{formatETB(draft.total)}</dd></div>
            </dl>

            <p className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-800">
              Demo only: completing this step sends a booking request. The vehicle owner must approve it before the rental is confirmed.
            </p>
            <button onClick={completeMockPayment} disabled={loading || !car} className="w-full min-h-12 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition">
              {loading ? 'Submitting request…' : `Complete demo payment (${formatETB(draft.total)})`}
            </button>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
