'use client';

import React, { Suspense, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentSession, getBookings, getReviews, submitBookingReview } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, ArrowLeft, CheckCircle2 } from 'lucide-react';

function ReviewContent() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const [eligible, setEligible] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.replace(`/signin?next=${encodeURIComponent(`/bookings/${bookingId}/review`)}`);
      return;
    }
    const booking = getBookings().find((candidate) => candidate.id === bookingId);
    const alreadyReviewed = getReviews().some((review) => review.bookingId === bookingId);
    const isEligible = Boolean(booking && booking.renterId === session.userId && booking.status === 'completed' && !alreadyReviewed);
    startTransition(() => {
      setEligible(isEligible);
      setLoaded(true);
    });
  }, [bookingId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitBookingReview(bookingId, rating, comment);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError('');
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center flex-1 space-y-4 flex flex-col justify-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Review Submitted Successfully!</h2>
          <p className="text-slate-600 text-sm">Thank you for rating your trip on Sheggar Wheels.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!loaded || !eligible) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 flex-1 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">{loaded ? 'Review unavailable' : 'Loading review…'}</h1>
          {loaded && <p role="alert" className="text-slate-600">Only the renter can review a completed trip, and each booking can be reviewed once.</p>}
          <button onClick={() => router.push('/bookings')} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold">Back to bookings</button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        <button
          onClick={() => router.back()}
          className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Leave a Review</h1>
            <p className="text-sm text-slate-600">Share your experience with this vehicle and owner.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">{error}</p>}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Rating (1 to 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl ${rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Comment / Feedback</label>
              <textarea
                rows={4}
                required
                placeholder="How was the car condition? How was the owner communication?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition"
            >
              Submit Renter Review
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading review form...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
