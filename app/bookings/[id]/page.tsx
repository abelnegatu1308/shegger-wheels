'use client';

import React, { useEffect, useState, Suspense, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, getCurrentUser, getBookings, getCars, formatETB, transitionBooking, openBookingDispute } from '@/lib/storage';
import { Booking, Car, User } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone, MapPin, XCircle, AlertTriangle } from 'lucide-react';

function BookingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [actionError, setActionError] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeOpened, setDisputeOpened] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    const session = getCurrentSession();
    if (!session) {
      router.push(`/signin?next=${encodeURIComponent(`/bookings/${bookingId}`)}`);
      return;
    }
    const currentUser = getCurrentUser();
    const foundBooking = getBookings().find(b => b.id === bookingId);
    startTransition(() => {
      setUser(currentUser);
      if (foundBooking) {
        const permitted = currentUser && (
          foundBooking.renterId === currentUser.id ||
          foundBooking.ownerId === currentUser.id ||
          currentUser.roles.includes('admin')
        );
        if (!permitted) {
          setAccessDenied(true);
        } else {
          setBooking(foundBooking);
          const foundCar = getCars().find(c => c.id === foundBooking.carId);
          if (foundCar) setCar(foundCar);
        }
      }
      setLoaded(true);
    });
  }, [bookingId, router]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1">Loading booking…</div>
        <Footer />
      </div>
    );
  }

  if (accessDenied || !booking || !user) {
    const message = accessDenied ? 'Not yours: this booking belongs to another account.' : 'This booking could not be found.';
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">{accessDenied ? 'Access denied' : 'Booking not found'}</h2>
          <p role="alert" className="text-slate-600">{message}</p>
          <button onClick={() => router.push('/dashboard')} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold">Back to Dashboard</button>
        </div>
        <Footer />
      </div>
    );
  }

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.ownerId === user.id;
  const isAdmin = user.roles.includes('admin');

  if (!isRenter && !isOwner && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Denied (Not Yours)</h2>
          <p className="text-slate-600 text-sm">
            Security Guard: You do not own or participate in this booking. Cross-user access is strictly restricted.
          </p>
          <button onClick={() => router.push('/dashboard')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCancel = () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    const result = transitionBooking(bookingId, 'cancelled');
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setActionError('');
    setBooking(result.value);
  };

  const handleStatusChange = (newStatus: Booking['status']) => {
    const result = transitionBooking(bookingId, newStatus);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setActionError('');
    setBooking(result.value);
  };

  const handleOpenDispute = (event: React.FormEvent) => {
    event.preventDefault();
    const result = openBookingDispute(bookingId, disputeReason, disputeDescription);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setActionError('');
    setDisputeOpened(true);
    setBooking({ ...booking, status: 'disputed' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <button
          onClick={() => router.back()}
          className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  {booking.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {booking.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {car ? `${car.make} ${car.model}` : 'Rental Booking'}
              </h1>
            </div>
            <div className="text-left md:text-right">
              <div className="text-2xl font-extrabold text-emerald-600">{formatETB(booking.total)}</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Payment: {booking.paymentStatus}</div>
            </div>
          </div>

          {car && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 items-center">
              <img src={car.photos[0]} alt="" className="w-full h-32 rounded-xl object-cover" />
              <div className="md:col-span-2 space-y-1">
                <h3 className="font-bold text-slate-900 text-lg">{car.make} {car.model} ({car.year})</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {car.neighbourhood}, {car.city}
                </p>
                <p className="text-xs text-slate-500">Transmission: {car.transmission} • {car.seats} Seats</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Rental Schedule</h4>
              <div className="space-y-1 text-slate-600">
                <div>Start Date: <strong className="text-slate-800">{booking.startDate}</strong></div>
                <div>End Date: <strong className="text-slate-800">{booking.endDate}</strong></div>
                <div>Duration: <strong className="text-slate-800">{booking.days} days</strong></div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Price Breakdown</h4>
              <div className="space-y-1 text-slate-600">
                <div>Price per day: {formatETB(booking.pricePerDay)}</div>
                <div>Subtotal: {formatETB(booking.subtotal)}</div>
                <div>Platform Fee: {formatETB(booking.fee)}</div>
                <div className="pt-2 border-t border-slate-200 font-bold text-slate-900 flex justify-between">
                  <span>Total:</span>
                  <span className="text-emerald-600">{formatETB(booking.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
            {actionError && <p role="alert" className="w-full text-sm text-rose-700">{actionError}</p>}
            <div className="text-xs text-slate-500">
              Created at: {new Date(booking.createdAt).toLocaleString()}
            </div>

            <div className="flex gap-3">
              {isRenter && booking.status === 'in_progress' && (
                <Link href={`/bookings/${booking.id}/track`} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition">
                  Simulated trip map
                </Link>
              )}
              {isRenter && ['requested', 'confirmed'].includes(booking.status) && (
                <button
                  onClick={handleCancel}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl font-semibold text-xs transition border border-rose-200"
                >
                  Cancel Booking
                </button>
              )}

              {isOwner && booking.status === 'requested' && (
                <>
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleStatusChange('declined')}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition"
                  >
                    Decline Request
                  </button>
                </>
              )}

              {isOwner && booking.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition"
                >
                  Start Rental (In Progress)
                </button>
              )}

              {isOwner && booking.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition"
                >
                  Mark Rental Complete
                </button>
              )}

              {isRenter && booking.status === 'completed' && (
                <a
                  href={`/bookings/${booking.id}/review`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition"
                >
                  Leave Review
                </a>
              )}
            </div>
          </div>

          {(isRenter || isOwner) && ['in_progress', 'completed'].includes(booking.status) && !disputeOpened && (
            <form onSubmit={handleOpenDispute} className="border-t border-slate-100 pt-5 space-y-3">
              <h2 className="font-bold text-slate-900">Report a rental issue</h2>
              <label className="block text-sm font-semibold">Reason<input value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2" required /></label>
              <label className="block text-sm font-semibold">Details<textarea value={disputeDescription} onChange={(event) => setDisputeDescription(event.target.value)} rows={3} className="mt-1 w-full border border-slate-300 rounded-xl p-3" required /></label>
              <button className="min-h-11 px-5 rounded-xl border border-rose-300 text-rose-800 hover:bg-rose-50 font-semibold">Open dispute</button>
            </form>
          )}
          {disputeOpened && <p role="status" className="text-sm text-emerald-700">Dispute submitted. The owner and demo admin can now review it.</p>}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading booking details...</div>}>
      <BookingDetailContent />
    </Suspense>
  );
}
