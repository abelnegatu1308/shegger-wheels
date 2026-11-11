'use client';

import React, { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, ShieldCheck, Zap, Compass, Star, CheckCircle } from 'lucide-react';
import { getPublicCars, formatETB } from '@/lib/storage';
import { Car } from '@/types';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import CarImage from '@/components/CarImage';

export default function Home() {
  const router = useRouter();
  const [neighbourhood, setNeighbourhood] = useState('');
  const [make, setMake] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cars, setCars] = useState<Car[]>([]);

  const spotlightCars = cars.slice(0, 4);

  const neighbourhoods = Array.from(new Set(cars.map(c => c.neighbourhood)));
  const makes = Array.from(new Set(cars.map(c => c.make)));

  useEffect(() => {
    const refreshCars = () => setCars(getPublicCars());
    startTransition(() => refreshCars());
    window.addEventListener('sw_storage_update', refreshCars);
    return () => window.removeEventListener('sw_storage_update', refreshCars);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 6;
      const y = (e.clientY / innerHeight - 0.5) * 6;
      startTransition(() => setCursorPos({ x, y }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (neighbourhood) params.set('neighbourhood', neighbourhood);
    if (make) params.set('make', make);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    router.push(`/cars?${params.toString()}`);
  };

  const activeCar = spotlightCars[activeCarIndex] || cars[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#f1f5f9] selection:bg-[#10b981] selection:text-black overflow-x-hidden font-sans">
      <Navbar />

      {/* Cinematic Editorial Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-12 py-16 overflow-hidden">
        {/* Background Architectural Grid & Atmospheric Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(16,185,129,0.12),rgba(7,9,14,0))] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Asymmetric Editorial Typography & Mission */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-3 bg-[#0f172a] border border-[#1e293b] text-[#10b981] px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping"></span>
              Addis Ababa Urban Mobility
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-white uppercase">
              Sheger <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#2dd4bf] to-[#38bdf8] drop-shadow-[0_0_50px_rgba(16,185,129,0.25)]">
                Wheels
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#94a3b8] max-w-xl font-light leading-relaxed">
              A cinematic peer-to-peer automotive ecosystem bridging trusted local vehicle owners with discerning travelers across Bole, Kazanchis, CMC, and beyond.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/cars"
                className="bg-[#10b981] hover:bg-[#059669] text-slate-950 font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-[#10b981]/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 text-sm tracking-wider uppercase"
              >
                Explore Fleet <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white border border-[#334155] px-8 py-4 rounded-2xl font-bold transition-all duration-300 text-sm tracking-wider uppercase shadow-xl"
              >
                List Your Vehicle
              </Link>
            </div>

            {/* Editorial Metadata Stream */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#1e293b]/80 font-mono text-xs">
              <div>
                <div className="text-2xl font-black text-white">{cars.length}</div>
                <div className="text-[#64748b] tracking-wider uppercase mt-0.5">Verified Fleet</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#10b981]">100%</div>
                <div className="text-[#64748b] tracking-wider uppercase mt-0.5">Mock Secure Pay</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#38bdf8]">Addis</div>
                <div className="text-[#64748b] tracking-wider uppercase mt-0.5">Hub Coverage</div>
              </div>
            </div>
          </div>

          {/* Interactive 3D Perspective Stage */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-[#10b981]/30 to-[#38bdf8]/20 rounded-[2.5rem] blur-2xl opacity-50 animate-pulse"></div>

            <div
              className="relative bg-[#0f172a]/90 border border-[#334155]/80 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out space-y-6"
              style={{
                transform: `perspective(1200px) rotateY(${cursorPos.x}deg) rotateX(${-cursorPos.y}deg)`
              }}
            >
              <div className="flex justify-between items-center">
                <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full">
                  STAGE 01 // SPOTLIGHT VEHICLE
                </span>
                <span className="text-xs font-mono text-[#94a3b8]">{activeCar ? `${activeCar.neighbourhood}` : 'Addis Ababa'}</span>
              </div>

              {/* 3D Cinematic Display Window */}
              <div className="relative h-72 rounded-2xl overflow-hidden bg-black border border-[#1e293b] shadow-inner group">
                <CarImage src={activeCar?.photos[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80'} alt="Vehicle spotlight" sizes="(min-width: 1024px) 40vw, 100vw" priority className="object-cover transform transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-mono text-[#10b981] uppercase tracking-wider">{activeCar?.year} • {activeCar?.transmission}</span>
                    <h3 className="text-2xl font-black text-white tracking-tight">{activeCar?.make} {activeCar?.model}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#10b981]">{formatETB(activeCar?.pricePerDay || 2500)}</span>
                    <span className="text-[10px] text-[#64748b] block uppercase tracking-widest font-mono">per day</span>
                  </div>
                </div>
              </div>

              {/* Spotlight Selector Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {spotlightCars.map((car, idx) => (
                  <button
                    key={car.id}
                    onClick={() => setActiveCarIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeCarIndex === idx
                        ? 'bg-[#10b981] text-slate-950 font-bold shadow-lg shadow-[#10b981]/30'
                        : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155] hover:text-white'
                    }`}
                  >
                    {car.make} {car.model}
                  </button>
                ))}
              </div>

              <Link
                href={`/cars/${activeCar?.id}`}
                className="w-full bg-[#1e293b] hover:bg-[#10b981] hover:text-slate-950 text-white font-extrabold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-[#334155] text-xs font-mono uppercase tracking-widest shadow-lg"
              >
                Inspect Vehicle Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Architectural Quick Search Bar */}
      <section className="relative z-30 max-w-6xl mx-auto px-4 -mt-12 mb-20 w-full">
        <div className="bg-[#0f172a]/95 border border-[#1e293b] p-6 sm:p-8 rounded-[2rem] shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-mono text-[#64748b] uppercase tracking-widest mb-2">Neighbourhood</label>
              <select
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                className="w-full bg-[#07090e] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981]"
              >
                <option value="">All Addis Locations</option>
                {neighbourhoods.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#64748b] uppercase tracking-widest mb-2">Make</label>
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full bg-[#07090e] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981]"
              >
                <option value="">All Makes</option>
                {makes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#64748b] uppercase tracking-widest mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#07090e] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#64748b] uppercase tracking-widest mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#07090e] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-[#10b981] hover:bg-[#059669] text-slate-950 font-black py-3.5 rounded-xl transition shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest"
              >
                <Search className="w-4 h-4" /> Filter Fleet
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Fleet Editorial Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] font-mono text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">
              CURATED CATALOGUE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mt-3">Featured Vehicles</h2>
          </div>
          <Link
            href="/cars"
            className="text-[#10b981] hover:text-[#38bdf8] font-mono text-xs uppercase tracking-widest flex items-center gap-1 transition"
          >
            Full Fleet Catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spotlightCars.slice(0, 3).map(car => (
            <div key={car.id} className="bg-[#0f172a] border border-[#1e293b] rounded-[2rem] overflow-hidden shadow-2xl hover:border-[#10b981]/50 transition-all duration-300 flex flex-col group">
              <div className="relative h-60 bg-black overflow-hidden">
                <CarImage src={car.photos[0]} alt={`${car.make} ${car.model}`} sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transform transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-[#94a3b8] text-[10px] font-mono uppercase px-3 py-1 rounded-full border border-[#334155]">
                  {car.transmission}
                </span>
                <span className="absolute top-4 left-4 bg-[#10b981] text-slate-950 text-[10px] font-mono uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-lg">
                  {car.neighbourhood}
                </span>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between space-y-6">
                <div className="space-y-2">
                  <div className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">{car.year} Model • {car.seats} Seats</div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#10b981] transition">{car.make} {car.model}</h3>
                  <p className="text-xs text-[#94a3b8] line-clamp-2 font-light leading-relaxed">{car.description}</p>
                </div>
                <div className="pt-6 border-t border-[#1e293b] flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-black text-[#10b981]">{formatETB(car.pricePerDay)}</span>
                    <span className="text-[10px] text-[#64748b] uppercase tracking-widest block font-mono">per day</span>
                  </div>
                  <Link
                    href={`/cars/${car.id}`}
                    className="bg-[#1e293b] hover:bg-[#10b981] hover:text-slate-950 text-white px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition shadow"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experimental Editorial Pillars */}
      <section className="bg-[#05070a] py-24 border-t border-[#1e293b] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-widest bg-[#38bdf8]/10 px-3 py-1 rounded-full border border-[#38bdf8]/20">
              ARCHITECTURAL PRINCIPLES
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">The Sheger Standard</h2>
            <p className="text-[#94a3b8] text-sm font-light">Engineered for absolute trust, cinematic aesthetics, and high-speed peer-to-peer mobility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-[#0f172a]/60 border border-[#1e293b] p-8 rounded-[2rem] space-y-4 hover:border-[#10b981]/50 transition">
              <div className="w-12 h-12 bg-[#10b981]/10 text-[#10b981] rounded-2xl flex items-center justify-center font-bold text-lg border border-[#10b981]/20 font-mono">01</div>
              <h3 className="font-bold text-white uppercase text-base tracking-wide">Verified Identity</h3>
              <p className="text-xs text-[#94a3b8] font-light leading-relaxed">Rigorous demo verification for every vehicle and owner across Addis Ababa.</p>
            </div>
            <div className="bg-[#0f172a]/60 border border-[#1e293b] p-8 rounded-[2rem] space-y-4 hover:border-[#10b981]/50 transition">
              <div className="w-12 h-12 bg-[#38bdf8]/10 text-[#38bdf8] rounded-2xl flex items-center justify-center font-bold text-lg border border-[#38bdf8]/20 font-mono">02</div>
              <h3 className="font-bold text-white uppercase text-base tracking-wide">TeleBirr Gateway</h3>
              <p className="text-xs text-[#94a3b8] font-light leading-relaxed">Simulated instant mobile money checkout tailored for local transactions.</p>
            </div>
            <div className="bg-[#0f172a]/60 border border-[#1e293b] p-8 rounded-[2rem] space-y-4 hover:border-[#10b981]/50 transition">
              <div className="w-12 h-12 bg-[#10b981]/10 text-[#10b981] rounded-2xl flex items-center justify-center font-bold text-lg border border-[#10b981]/20 font-mono">03</div>
              <h3 className="font-bold text-white uppercase text-base tracking-wide">Addis Hubs</h3>
              <p className="text-xs text-[#94a3b8] font-light leading-relaxed">Strategic vehicle positioning across Bole, Kazanchis, CMC, and Piassa.</p>
            </div>
            <div className="bg-[#0f172a]/60 border border-[#1e293b] p-8 rounded-[2rem] space-y-4 hover:border-[#10b981]/50 transition">
              <div className="w-12 h-12 bg-[#38bdf8]/10 text-[#38bdf8] rounded-2xl flex items-center justify-center font-bold text-lg border border-[#38bdf8]/20 font-mono">04</div>
              <h3 className="font-bold text-white uppercase text-base tracking-wide">Lifecycle Control</h3>
              <p className="text-xs text-[#94a3b8] font-light leading-relaxed">Finite state booking workflows, live receipts, reviews, and CSV reports.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
