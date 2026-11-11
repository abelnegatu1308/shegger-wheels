'use client';

import React, { useState, useEffect, Suspense, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car, Review, User } from '@/types';
import { getCars, getUsers, getReviews, formatETB, writeSession, STORAGE_KEYS, getCurrentSession, getCurrentUser, safeReturnPath } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MapPanel from '@/components/MapPanel';
import CarImage from '@/components/CarImage';
import { MapPin, Calendar, ShieldCheck, Star, Users, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function CarDetailContent() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!carId) return;
    const cars = getCars();
    const foundCar = cars.find(c => c.id === carId && c.status === 'approved');
    const foundOwner = foundCar
      ? getUsers().find(u => u.id === foundCar.ownerId && u.status === 'active' && u.roles.includes('owner')) ?? null
      : null;
    const allReviews = getReviews().filter(r => r.carId === carId);
    startTransition(() => {
      if (foundCar && foundOwner) {
        setCar(foundCar);
        setOwner(foundOwner);
      }
      setReviews(allReviews);
    });
  }, [carId]);

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Car Not Found</h2>
          <p className="text-slate-600 mb-6">The vehicle you are looking for does not exist or has been removed.</p>
          <button onClick={() => router.push('/cars')} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold">
            Back to Catalogue
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate rental pricing
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  let days = 0;
  if (start && end && end > start) {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  const subtotal = days * car.pricePerDay;
  const fee = Math.round(subtotal * 0.05); // 5% platform fee
  const total = subtotal + fee;

  const handleBookingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const session = getCurrentSession();
    if (!session) {
      router.push(`/signin?next=${encodeURIComponent(safeReturnPath(`/cars/${carId}`, '/cars'))}`);
      return;
    }
    const renter = getCurrentUser();
    if (!renter?.roles.includes('renter')) {
      setErrorMsg('This action requires a renter demo account.');
      return;
    }

    if (!startDate || !endDate || days <= 0) {
      setErrorMsg('Please select valid start and end dates.');
      return;
    }

    const draft = {
      carId: car.id,
      startDate,
      endDate,
      days,
      pricePerDay: car.pricePerDay,
      subtotal,
      fee,
      total,
    };
    writeSession(STORAGE_KEYS.CHECKOUT_DRAFT, draft);

    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <button
          onClick={() => router.back()}
          className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        {/* Car Header info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                {car.neighbourhood}, {car.city}
              </span>
              <span className="text-slate-500 text-xs font-medium">• {car.year} Model • {car.transmission} • {car.seats} Seats</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{car.make} {car.model}</h1>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-emerald-600">{formatETB(car.pricePerDay)}</div>
            <div className="text-xs text-slate-500 font-medium">per day (inclusive of taxes)</div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative h-96 rounded-3xl overflow-hidden bg-slate-200 border border-slate-200 shadow-sm">
              <CarImage src={car.photos[activePhoto] || car.photos[0]} alt={`${car.make} ${car.model}`} sizes="(min-width: 1024px) 65vw, 100vw" priority className="object-cover" />
            </div>
            {car.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {car.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`relative w-24 h-20 rounded-xl overflow-hidden border-2 transition ${activePhoto === idx ? 'border-emerald-600 shadow-md' : 'border-transparent opacity-70'}`}
                  >
                  <CarImage src={photo} alt={`View ${idx + 1} of ${car.make} ${car.model}`} sizes="96px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-6 h-fit">
            <h3 className="text-xl font-bold text-slate-900">Book This Vehicle</h3>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookingRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {days > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>{formatETB(car.pricePerDay)} × {days} days</span>
                    <span>{formatETB(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Service Fee (5%)</span>
                    <span>{formatETB(fee)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-base">
                    <span>Total Amount</span>
                    <span className="text-emerald-600">{formatETB(total)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-emerald-600/20 transition"
              >
                Proceed to Checkout
              </button>
            </form>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Owner & Insurance Guidelines</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Free cancellation up to 48 hours before trip</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Owner info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div><h3 className="text-xl font-bold text-slate-900">Pickup area</h3><p className="text-sm text-slate-500">{car.neighbourhood}, {car.city} · Seeded demo location</p></div>
              <div className="h-72 overflow-hidden rounded-2xl"><MapPanel center={[car.latitude, car.longitude]} label={`${car.neighbourhood}, ${car.city}`} /></div>
              <p className="text-xs text-slate-500">Map tiles load from OpenStreetMap. The pin is a sample listing location, not live vehicle tracking.</p>
            </section>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Vehicle Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{car.description}</p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Renter Reviews ({reviews.length})</h3>
              </div>

              {reviews.length === 0 ? (
                <p className="text-slate-500 text-sm">No reviews submitted for this vehicle yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="border-b border-slate-100 pb-4 last:border-0 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                            ★
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">Verified Renter</span>
                        </div>
                        <div className="flex text-amber-400 text-sm">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{rev.comment}</p>
                      {rev.ownerReply && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 ml-6 border-l-2 border-emerald-600">
                          <strong>Owner Reply:</strong> {rev.ownerReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Owner Profile Card */}
          {owner && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 h-fit">
              <h3 className="font-bold text-slate-900 text-lg">Hosted By</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                  {owner.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{owner.name}</div>
                  <div className="text-xs text-emerald-600 font-medium">Verified Car Owner</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <div>Member since: {new Date(owner.createdAt).toLocaleDateString()}</div>
                <div>Response rate: 100%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CarDetailClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading vehicle details...</div>}>
      <CarDetailContent />
    </Suspense>
  );
}
