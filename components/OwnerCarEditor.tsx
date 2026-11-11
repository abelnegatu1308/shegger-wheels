'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBookings, getCars, getCurrentSession, getCurrentUser, hasRole, saveCars } from '@/lib/storage';
import { Car } from '@/types';

type Props = { carId: string; mode: 'edit' | 'availability' };

export default function OwnerCarEditor({ carId, mode }: Props) {
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [unavailableDate, setUnavailableDate] = useState('');
  const [form, setForm] = useState({ make: '', model: '', year: '', pricePerDay: '', neighbourhood: '', description: '' });

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.replace(`/signin?next=${encodeURIComponent(`/owner/cars/${carId}/${mode}`)}`);
      return;
    }
    const ownCar = getCars().find((candidate) => candidate.id === carId && candidate.ownerId === session.userId);
    const cars = getCars();
    if (ownCar) {
      setCar(ownCar);
      setForm({
        make: ownCar.make,
        model: ownCar.model,
        year: String(ownCar.year),
        pricePerDay: String(ownCar.pricePerDay),
        neighbourhood: ownCar.neighbourhood,
        description: ownCar.description,
      });
    } else {
      setError('Not yours: this vehicle is not part of your fleet.');
    }
    setLoaded(true);
  }, [carId, mode, router]);

  const updateListing = (event: React.FormEvent) => {
    event.preventDefault();
    const session = getCurrentSession();
    const user = getCurrentUser();
    const current = getCars().find((candidate) => candidate.id === carId);
    if (!session || !hasRole(user, 'owner')) {
      setError('Sign in with an owner demo account before editing a listing.');
      return;
    }
    if (!current || current.ownerId !== session.userId) {
      setError('Not yours: this vehicle is not part of your fleet.');
      return;
    }
    const year = Number(form.year);
    const pricePerDay = Number(form.pricePerDay);
    if (!form.make.trim() || !form.model.trim() || !form.neighbourhood.trim() || !form.description.trim() ||
      !Number.isInteger(year) || year < 1990 || year > new Date().getFullYear() + 1 ||
      !Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      setError('Enter a make, model, valid year, neighbourhood, description, and positive daily price.');
      return;
    }
    const updated = getCars().map((candidate) => candidate.id === carId
      ? {
          ...candidate,
          make: form.make.trim(),
          model: form.model.trim(),
          year,
          pricePerDay,
          neighbourhood: form.neighbourhood.trim(),
          description: form.description.trim(),
          status: candidate.status === 'approved' ? 'pending' as const : candidate.status,
        }
      : candidate);
    if (!saveCars(updated)) {
      setError('Could not save the listing. Check browser storage and try again.');
      return;
    }
    setCar(updated.find((candidate) => candidate.id === carId) ?? null);
    setError('');
    setSaved(true);
  };

  const addUnavailableDate = (event: React.FormEvent) => {
    event.preventDefault();
    const session = getCurrentSession();
    const current = getCars().find((candidate) => candidate.id === carId);
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      setError('Sign in with an owner demo account before changing availability.');
      return;
    }
    if (!current || current.ownerId !== session.userId) {
      setError('Not yours: this vehicle is not part of your fleet.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(unavailableDate) || unavailableDate <= new Date().toISOString().slice(0, 10)) {
      setError('Choose a future date to block.');
      return;
    }
    const overlapsBooking = getBookings().some((booking) =>
      booking.carId === carId &&
      ['requested', 'confirmed', 'in_progress', 'disputed'].includes(booking.status) &&
      unavailableDate >= booking.startDate &&
      unavailableDate < booking.endDate
    );
    if (overlapsBooking) {
      setError('That date is reserved by an active booking and cannot be blocked.');
      return;
    }
    if (current.unavailableDates.includes(unavailableDate)) {
      setError('That date is already blocked.');
      return;
    }
    const updated = { ...current, unavailableDates: [...current.unavailableDates, unavailableDate].sort() };
    if (!saveCars(getCars().map((candidate) => candidate.id === carId ? updated : candidate))) {
      setError('Could not update availability. Check browser storage and try again.');
      return;
    }
    setCar(updated);
    setUnavailableDate('');
    setError('');
    setSaved(true);
  };

  const removeUnavailableDate = (date: string) => {
    const session = getCurrentSession();
    const current = getCars().find((candidate) => candidate.id === carId);
    if (!session || !hasRole(getCurrentUser(), 'owner') || !current || current.ownerId !== session.userId) {
      setError('Not yours: you cannot change availability for this vehicle.');
      return;
    }
    const updated = { ...current, unavailableDates: current.unavailableDates.filter((item) => item !== date) };
    if (!saveCars(getCars().map((candidate) => candidate.id === carId ? updated : candidate))) {
      setError('Could not update availability. Check browser storage and try again.');
      return;
    }
    setCar(updated);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
        <button onClick={() => router.push('/owner/cars')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700"><ArrowLeft className="w-4 h-4" /> Back to listings</button>
        {!loaded ? <p>Loading vehicle…</p> : !car ? (
          <section className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4"><h1 className="text-2xl font-bold">Vehicle unavailable</h1><p role="alert" className="text-rose-700">{error}</p></section>
        ) : mode === 'edit' ? (
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div><p className="text-xs font-mono uppercase tracking-widest text-emerald-700">Owner studio / listing</p><h1 className="text-3xl font-black mt-2">Edit {car.make} {car.model}</h1><p className="text-sm text-slate-600 mt-2">Changes to an approved listing return it to pending review.</p></div>
            <form onSubmit={updateListing} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                ['make', 'Make'],
                ['model', 'Model'],
                ['year', 'Year'],
                ['pricePerDay', 'Price per day (ETB)'],
                ['neighbourhood', 'Neighbourhood'],
              ] as const).map(([field, label]) => (
                <label key={field} className="text-sm font-semibold text-slate-700">{label}
                  <input type={field === 'year' || field === 'pricePerDay' ? 'number' : 'text'} value={form[field]} onChange={(event) => { setSaved(false); setForm({ ...form, [field]: event.target.value }); }} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-3 text-sm" required />
                </label>
              ))}
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Description
                <textarea rows={4} value={form.description} onChange={(event) => { setSaved(false); setForm({ ...form, description: event.target.value }); }} className="mt-1 w-full border border-slate-300 rounded-xl p-3 text-sm" required />
              </label>
              {error && <p role="alert" className="sm:col-span-2 text-sm text-rose-700">{error}</p>}
              {saved && <p role="status" className="sm:col-span-2 text-sm text-emerald-700">Listing saved. Your updated details are persisted in demo storage.</p>}
              <button className="sm:col-span-2 min-h-12 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"><Save className="w-4 h-4" /> Save listing</button>
            </form>
          </section>
        ) : (
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div><p className="text-xs font-mono uppercase tracking-widest text-emerald-700">Owner studio / calendar</p><h1 className="text-3xl font-black mt-2">{car.make} {car.model} availability</h1><p className="text-sm text-slate-600 mt-2">Blocked dates are excluded from new demo booking requests. Existing reservations cannot be overridden.</p></div>
            <form onSubmit={addUnavailableDate} className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 text-sm font-semibold text-slate-700">Date to block<input type="date" min={new Date().toISOString().slice(0, 10)} value={unavailableDate} onChange={(event) => setUnavailableDate(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-3 text-sm" required /></label>
              <button className="self-end min-h-12 px-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold">Block date</button>
            </form>
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            {saved && <p role="status" className="text-sm text-emerald-700">Availability updated.</p>}
            <div className="space-y-2">
              <h2 className="font-bold flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Unavailable dates ({car.unavailableDates.length})</h2>
              {car.unavailableDates.length === 0 ? <p className="text-sm text-slate-500">No blocked dates yet.</p> : car.unavailableDates.map((date) => (
                <div key={date} className="flex justify-between items-center border border-slate-200 rounded-xl p-3 text-sm"><span>{date}</span><button onClick={() => removeUnavailableDate(date)} className="text-rose-700 hover:underline font-semibold">Remove</button></div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
