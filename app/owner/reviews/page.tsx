'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, getCurrentUser, getReviews, getCars, hasRole, respondToOwnerReview } from '@/lib/storage';
import { Review, Car } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Star } from 'lucide-react';

export default function OwnerReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.replace('/signin?next=%2Fowner%2Freviews');
      return;
    }
    const ownerCars = getCars().filter(c => c.ownerId === session.userId);
    const ownerCarIds = new Set(ownerCars.map(c => c.id));
    const ownerReviews = getReviews().filter(r => ownerCarIds.has(r.carId));
    startTransition(() => {
      setCars(ownerCars);
      setReviews(ownerReviews);
    });
  }, [router]);

  const handleReply = (reviewId: string) => {
    const result = respondToOwnerReview(reviewId, replyText[reviewId] ?? '');
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError('');
    setReviews(getReviews().filter((review) => cars.some((car) => car.id === review.carId)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <button onClick={() => router.push('/owner')} className="text-slate-600 hover:text-emerald-600 text-sm font-medium flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Owner Hub
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900">Renter Reviews & Replies</h1>
        </div>

        <div className="space-y-6">
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {reviews.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 text-slate-500">
              No reviews have been submitted for your vehicles yet.
            </div>
          ) : (
            reviews.map(rev => {
              const car = cars.find(c => c.id === rev.carId);
              return (
                <div key={rev.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{car ? `${car.make} ${car.model}` : rev.carId}</div>
                      <div className="text-xs text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700">{rev.comment}</p>

                  {rev.ownerReply ? (
                    <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-emerald-600 text-xs text-slate-700 space-y-1">
                      <strong>Your Reply:</strong> {rev.ownerReply}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a professional reply..."
                        value={replyText[rev.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleReply(rev.id)}
                        className="bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Send Reply
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
