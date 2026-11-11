import React from 'react';
import Link from 'next/link';
import { Car, ShieldCheck, HeartHandshake, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <div className="bg-emerald-600 text-white p-2 rounded-xl">
                <Car className="w-6 h-6" />
              </div>
              <span>Sheggar<span className="text-emerald-500">Wheels</span></span>
            </div>
            <p className="text-sm text-slate-400">
              Addis Ababa&apos;s premier peer-to-peer car rental marketplace. Connect trusted vehicle owners with verified travelers and city explorers.
            </p>
            <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/50 p-2.5 rounded-lg">
              🎓 Frontend Capstone Project — IBT-QIYAS Full-Stack Software Development Program
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-emerald-400 transition">Home</Link></li>
              <li><Link href="/cars" className="hover:text-emerald-400 transition">Browse Cars</Link></li>
              <li><Link href="/signin" className="hover:text-emerald-400 transition">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-emerald-400 transition">Create Renter Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Owner & Admin</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/owner" className="hover:text-emerald-400 transition">Owner Dashboard</Link></li>
              <li><Link href="/owner/cars/new" className="hover:text-emerald-400 transition">List Your Car</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-400 transition">Admin Moderation Panel</Link></li>
              <li><Link href="/owner/earnings" className="hover:text-emerald-400 transition">Earnings & Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Simulated Security</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Client-side demo session with localStorage & sessionStorage persistence.</span>
              </div>
              <div className="flex items-start gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Simulated TeleBirr payment & dispute workflows.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <div>&copy; {currentYear} Sheggar Wheels. All rights reserved. Demo Frontend Application.</div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span>Addis Ababa, Ethiopia</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Peer-to-Peer Mobility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
