'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, getCurrentUser, getCars, saveCars, hasRole } from '@/lib/storage';
import { Car } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

export default function NewCarPage() {
  const router = useRouter();
  const session = getCurrentSession();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2022');
  const [transmission, setTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [seats, setSeats] = useState('5');
  const [neighbourhood, setNeighbourhood] = useState('Bole');
  const [pricePerDay, setPricePerDay] = useState('3000');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.replace('/signin?next=%2Fowner%2Fcars%2Fnew');
      return;
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.push('/signin?next=%2Fowner%2Fcars%2Fnew');
      return;
    }
    if (!make.trim() || !model.trim() || !description.trim() || !Number.isInteger(Number(year)) ||
      Number(year) < 1990 || Number(year) > new Date().getFullYear() + 1 ||
      !Number.isInteger(Number(seats)) || Number(seats) < 2 || Number(seats) > 12 ||
      !Number.isFinite(Number(pricePerDay)) || Number(pricePerDay) <= 0) {
      setError('Enter a make, model, valid vehicle year, 2–12 seats, a positive daily price, and a description.');
      return;
    }
    try {
      const photo = new URL(photoUrl);
      if (!['https:', 'http:'].includes(photo.protocol)) throw new Error('Unsupported photo URL');
    } catch {
      setError('Enter a valid public photo URL using HTTP or HTTPS.');
      return;
    }

    const allCars = getCars();
    const newCar: Car = {
      id: `car_${Date.now()}`,
      ownerId: session.userId,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      transmission,
      seats: Number(seats),
      city: 'Addis Ababa',
      neighbourhood,
      latitude: 9.01,
      longitude: 38.75,
      pricePerDay: Number(pricePerDay),
      photos: [photoUrl],
      description: description.trim(),
      status: 'pending', // Requires admin approval
      unavailableDates: [],
      createdAt: new Date().toISOString(),
    };

    allCars.push(newCar);
    if (!saveCars(allCars)) {
      setError('The listing could not be saved. Check browser storage and try again.');
      return;
    }
    router.push('/owner/cars');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        <button onClick={() => router.back()} className="text-slate-600 hover:text-emerald-600 text-sm font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">List New Car</h1>
            <p className="text-xs text-slate-500 mt-1">Publish your vehicle for rent in Addis Ababa. Listings require admin approval before going live.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Make</label>
                <input
                  type="text"
                  required
                  placeholder="Toyota, Hyundai, Ford..."
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Model</label>
                <input
                  type="text"
                  required
                  placeholder="Corolla, Tucson..."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Year</label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Seats</label>
                <input
                  type="number"
                  required
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Neighbourhood</label>
                <input
                  type="text"
                  required
                  placeholder="Bole, Kazanchis, CMC..."
                  value={neighbourhood}
                  onChange={(e) => setNeighbourhood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Price Per Day (ETB)</label>
                <input
                  type="number"
                  required
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Photo URL</label>
              <input
                type="url"
                required
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
              <textarea
                rows={4}
                required
                placeholder="Describe condition, features, fuel efficiency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition"
            >
              Submit Listing for Admin Approval
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
