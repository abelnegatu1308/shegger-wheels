'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBookings, getDisputes, getCurrentSession, getCurrentUser, hasRole, openBookingDispute, respondToOwnerDispute } from '@/lib/storage';
import { Booking, Dispute } from '@/types';

export default function OwnerDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('Vehicle condition');
  const [description, setDescription] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const refresh = () => {
    const session = getCurrentSession();
    if (!session) return;
    const related = getBookings().filter((booking) => booking.ownerId === session.userId);
    const ids = new Set(related.map((booking) => booking.id));
    setBookings(related.filter((booking) => ['in_progress', 'completed'].includes(booking.status)));
    setDisputes(getDisputes().filter((dispute) => ids.has(dispute.bookingId)));
  };

  useEffect(() => {
    if (!getCurrentSession() || !hasRole(getCurrentUser(), 'owner')) {
      router.replace('/signin?next=%2Fowner%2Fdisputes');
      return;
    }
    refresh();
    setLoaded(true);
  }, [router]);

  const openDispute = (event: React.FormEvent) => {
    event.preventDefault();
    const result = openBookingDispute(bookingId, reason, description);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError('');
    setDescription('');
    refresh();
  };

  const sendResponse = (disputeId: string) => {
    const result = respondToOwnerDispute(disputeId, responses[disputeId] ?? '');
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError('');
    refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        <div><p className="font-mono text-xs uppercase tracking-widest text-emerald-700">Owner studio / resolutions</p><h1 className="text-3xl font-black mt-2">Rental disputes</h1><p className="text-sm text-slate-600 mt-2">Review disputes attached to your bookings and add a response for the demo admin.</p></div>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <form onSubmit={openDispute} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-lg">Report an issue</h2>
          <label className="block text-sm font-semibold">Rental<select required value={bookingId} onChange={(event) => setBookingId(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl p-3">
            <option value="">Choose an active or completed rental</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.id} · {booking.status}</option>)}
          </select></label>
          <label className="block text-sm font-semibold">Reason<input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl p-3" required /></label>
          <label className="block text-sm font-semibold">Details<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full border border-slate-300 rounded-xl p-3" required /></label>
          <button className="min-h-11 px-5 rounded-xl bg-emerald-700 text-white font-semibold">Open dispute</button>
        </form>
        <section className="space-y-4">
          <h2 className="font-bold text-lg">Disputes involving your bookings</h2>
          {!loaded ? <p>Loading disputes…</p> : disputes.length === 0 ? <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">No disputes to review.</div> : disputes.map((dispute) => (
            <article key={dispute.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between gap-3"><h3 className="font-bold">{dispute.reason}</h3><span className="text-xs uppercase font-bold">{dispute.status.replaceAll('_', ' ')}</span></div>
              <p className="text-sm text-slate-700">{dispute.description}</p><p className="text-xs text-slate-500">Booking {dispute.bookingId} · Opened by {dispute.openedBy}</p>
              {dispute.ownerResponse && <p className="rounded-xl bg-slate-50 p-3 text-sm"><strong>Your response:</strong> {dispute.ownerResponse}</p>}
              {dispute.resolutionNotes && <p className="rounded-xl bg-emerald-50 p-3 text-sm"><strong>Admin resolution:</strong> {dispute.resolutionNotes}</p>}
              {dispute.status !== 'resolved' && <div className="flex flex-col sm:flex-row gap-2"><label className="sr-only" htmlFor={`response-${dispute.id}`}>Response</label><input id={`response-${dispute.id}`} value={responses[dispute.id] ?? ''} onChange={(event) => setResponses({ ...responses, [dispute.id]: event.target.value })} placeholder="Write your response" className="flex-1 border border-slate-300 rounded-xl px-3 py-2" /><button onClick={() => sendResponse(dispute.id)} className="min-h-11 px-4 rounded-xl bg-slate-900 text-white font-semibold">Send response</button></div>}
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
