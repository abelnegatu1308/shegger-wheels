'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, getCurrentUser, getCars, saveCars, formatETB, hasRole } from '@/lib/storage';
import { Car } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function OwnerCarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      router.push('/signin?next=%2Fowner%2Fcars');
      return;
    }
    const ownerCars = getCars().filter(c => c.ownerId === session.userId);
    startTransition(() => {
      setCars(ownerCars);
    });
  }, [router]);

  const toggleStatus = (carId: string) => {
    const session = getCurrentSession();
    if (!session || !hasRole(getCurrentUser(), 'owner')) {
      setError('Sign in with an owner demo account to manage listings.');
      return;
    }
    const allCars = getCars();
    const car = allCars.find((candidate) => candidate.id === carId);
    if (!car || car.ownerId !== session.userId) {
      setError('Not yours: you can only change your own listings.');
      return;
    }
    if (!['approved', 'inactive'].includes(car.status)) {
      setError('Only approved listings can be deactivated. Pending or rejected listings must be reviewed by an admin.');
      return;
    }
    const updated = allCars.map((candidate) => candidate.id === carId
      ? { ...candidate, status: candidate.status === 'approved' ? 'inactive' as const : 'pending' as const }
      : candidate);
    if (!saveCars(updated)) {
      setError('Could not update this listing. Check browser storage and try again.');
      return;
    }
    setCars(updated.filter(c => c.ownerId === getCurrentSession()?.userId));
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => router.push('/owner')} className="text-slate-600 hover:text-emerald-600 text-sm font-medium flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Owner Hub
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900">Your Car Listings</h1>
          </div>
          <Link
            href="/owner/cars/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add New Car
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {error && <p role="alert" className="m-4 text-sm text-rose-700">{error}</p>}
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Car</th>
                <th className="p-4">Neighbourhood</th>
                <th className="p-4">Price / Day</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    You have not listed any cars yet. Click &quot;Add New Car&quot; to get started.
                  </td>
                </tr>
              ) : (
                cars.map(car => (
                  <tr key={car.id} className="hover:bg-slate-50/50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={car.photos[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{car.make} {car.model}</div>
                        <div className="text-xs text-slate-500">{car.year} • {car.transmission} • {car.seats} seats</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{car.neighbourhood}, {car.city}</td>
                    <td className="p-4 font-bold text-emerald-600">{formatETB(car.pricePerDay)}</td>
                    <td className="p-4">
                      <span className={`text-xs uppercase px-2.5 py-1 rounded-full font-semibold ${
                        car.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        car.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <Link
                        href={`/owner/cars/${car.id}/edit`}
                        className="text-blue-600 hover:underline text-xs font-semibold"
                      >
                        Edit
                      </Link>
                      <Link href={`/owner/cars/${car.id}/availability`} className="text-slate-700 hover:underline text-xs font-semibold">Availability</Link>
                      <Link href={`/owner/cars/${car.id}/bookings`} className="text-emerald-700 hover:underline text-xs font-semibold">Bookings</Link>
                      {['approved', 'inactive'].includes(car.status) ? (
                        <button onClick={() => toggleStatus(car.id)} className="text-slate-600 hover:underline text-xs font-semibold">
                          {car.status === 'approved' ? 'Deactivate' : 'Request reactivation'}
                        </button>
                      ) : <span className="text-xs text-slate-500">{car.status === 'pending' ? 'Awaiting review' : 'Admin review required'}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}
