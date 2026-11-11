'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, Car as CarIcon, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getBookings, getPublicCars, formatETB } from '@/lib/storage';
import { Booking, Car } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarImage from '@/components/CarImage';

function CarsCatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [neighbourhood, setNeighbourhood] = useState(searchParams.get('neighbourhood') || '');
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [minSeats, setMinSeats] = useState(searchParams.get('minSeats') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const refresh = () => {
      setCars(getPublicCars());
      setBookings(getBookings());
    };
    refresh();
    window.addEventListener('sw_storage_update', refresh);
    return () => window.removeEventListener('sw_storage_update', refresh);
  }, []);

  const neighbourhoods = Array.from(new Set(cars.map(c => c.neighbourhood)));
  const makes = Array.from(new Set(cars.map(c => c.make)));
  const cities = Array.from(new Set(cars.map(c => c.city)));

  const filteredCars = cars.filter(car => {
    const matchesSearch = searchQuery === '' ||
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.neighbourhood.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNeighbourhood = !neighbourhood || car.neighbourhood === neighbourhood;
    const matchesMake = !make || car.make === make;
    const matchesCity = !city || car.city === city;
    const matchesTransmission = !transmission || car.transmission === transmission;
    const matchesSeats = !minSeats || car.seats >= Number(minSeats);
    const matchesMinPrice = !minPrice || car.pricePerDay >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || car.pricePerDay <= Number(maxPrice);
    const validDateRange = !startDate && !endDate || Boolean(startDate && endDate && startDate < endDate);
    const matchesDates = validDateRange && (!startDate || !endDate || (
      !car.unavailableDates.some((date) => date >= startDate && date < endDate) &&
      !bookings.some((booking) =>
        booking.carId === car.id &&
        ['requested', 'confirmed', 'in_progress', 'disputed'].includes(booking.status) &&
        startDate < booking.endDate &&
        endDate > booking.startDate
      )
    ));

    return matchesSearch && matchesNeighbourhood && matchesMake && matchesCity && matchesTransmission &&
      matchesSeats && matchesMinPrice && matchesMaxPrice && matchesDates;
  }).sort((a, b) => {
    if (sort === 'price-asc') return a.pricePerDay - b.pricePerDay;
    if (sort === 'price-desc') return b.pricePerDay - a.pricePerDay;
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const page = Math.min(currentPage, totalPages);
  const paginatedCars = filteredCars.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (neighbourhood) params.set('neighbourhood', neighbourhood);
    if (make) params.set('make', make);
    if (city) params.set('city', city);
    if (transmission) params.set('transmission', transmission);
    if (minSeats) params.set('minSeats', minSeats);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (sort) params.set('sort', sort);
    const query = params.toString();
    const nextUrl = query ? `/cars?${query}` : '/cars';
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [city, endDate, make, maxPrice, minPrice, minSeats, neighbourhood, router, searchQuery, sort, startDate, transmission]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Explore Car Catalogue</h1>
          <p className="text-slate-600 text-sm mt-1">Discover verified vehicles available for rent across Addis Ababa.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 h-fit">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" /> Filters
              </h3>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setNeighbourhood('');
                  setMake('');
                  setCity('');
                  setTransmission('');
                  setMinSeats('');
                  setMinPrice('');
                  setMaxPrice('');
                  setStartDate('');
                  setEndDate('');
                  setSort('newest');
                  router.replace('/cars');
                }}
                className="text-xs text-emerald-600 hover:underline font-medium"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Search Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Make, model, keyword..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Neighbourhood</label>
                <select
                  value={neighbourhood}
                  onChange={(e) => { setNeighbourhood(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Areas</option>
                  {neighbourhoods.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Make</label>
                <select
                  value={make}
                  onChange={(e) => { setMake(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Makes</option>
                  {makes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
                <select value={city} onChange={(e) => { setCity(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">All Cities</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => { setTransmission(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Any Transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Minimum Seats</label>
                <input type="number" min="1" value={minSeats} onChange={(e) => { setMinSeats(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Any capacity" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Min Price (ETB)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    min="0"
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Max Price (ETB)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    min="0"
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase">From<input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setCurrentPage(1); }} className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm" /></label>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Until<input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setCurrentPage(1); }} className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm" /></label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Showing <span className="font-bold text-slate-900">{filteredCars.length}</span> available vehicles
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {paginatedCars.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🚗
                </div>
                <h3 className="text-xl font-bold text-slate-900">No cars match your filters</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Try adjusting your search criteria, neighbourhood, or price range to find available vehicles in Addis Ababa.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setNeighbourhood('');
                    setMake('');
                    setCity('');
                    setTransmission('');
                    setMinSeats('');
                    setMinPrice('');
                    setMaxPrice('');
                    setStartDate('');
                    setEndDate('');
                    setSort('newest');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCars.map(car => (
                  <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-slate-200 flex flex-col">
                    <div className="relative h-48 bg-slate-200">
                      <CarImage src={car.photos[0]} alt={`${car.make} ${car.model}`} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                      <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {car.transmission}
                      </span>
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {car.neighbourhood}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-medium">{car.year} • {car.seats} Seats • {car.city}</div>
                        <h3 className="text-lg font-bold text-slate-900">{car.make} {car.model}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{car.description}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div>
                          <span className="text-xl font-extrabold text-emerald-600">{formatETB(car.pricePerDay)}</span>
                          <span className="text-xs text-slate-500"> / day</span>
                        </div>
                        <Link
                          href={`/cars/${car.id}`}
                          className="bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-300 rounded-xl bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-slate-700 px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 border border-slate-300 rounded-xl bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CarsCatalogue() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading catalogue...</div>}>
      <CarsCatalogueContent />
    </Suspense>
  );
}
