'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { downloadCsv } from '@/lib/csv';
import {
  getAnnouncements,
  getBookings,
  getCars,
  getCurrentSession,
  getCurrentUser,
  getDisputes,
  getUsers,
  hasRole,
  resolveBookingDispute,
  saveAnnouncements,
  saveCars,
  saveUsers,
} from '@/lib/storage';
import { Announcement, Booking, Car, Dispute, User } from '@/types';

export type AdminSection = 'listings' | 'users' | 'user' | 'bookings' | 'disputes' | 'dispute' | 'reports' | 'announcements';

type Props = { section: AdminSection; recordId?: string };

export default function AdminWorkspace({ section, recordId }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [announcements, setAnnouncementsState] = useState<Announcement[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [resolution, setResolution] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = () => {
    setUsers(getUsers());
    setCars(getCars());
    setBookings(getBookings());
    setDisputes(getDisputes());
    setAnnouncementsState(getAnnouncements());
  };

  useEffect(() => {
    if (!getCurrentSession() || !hasRole(getCurrentUser(), 'admin')) {
      router.replace(`/signin?next=${encodeURIComponent(`/admin/${section === 'user' ? `users/${recordId}` : section === 'dispute' ? `disputes/${recordId}` : section}`)}`);
      return;
    }
    setAuthorized(true);
    refresh();
    setLoaded(true);
  }, [recordId, router, section]);

  const isAdmin = () => Boolean(getCurrentSession() && hasRole(getCurrentUser(), 'admin'));

  const moderateListing = (carId: string, status: 'approved' | 'rejected') => {
    if (!isAdmin()) {
      setError('Admin access is required to moderate listings.');
      return;
    }
    const current = getCars().find((car) => car.id === carId);
    if (!current || current.status !== 'pending') {
      setError('This listing is no longer pending review.');
      return;
    }
    saveCars(getCars().map((car) => car.id === carId ? { ...car, status } : car));
    setError('');
    setNotice(`Listing ${status}.`);
    refresh();
  };

  const toggleUserStatus = (userId: string) => {
    const session = getCurrentSession();
    if (!isAdmin() || !session) {
      setError('Admin access is required to manage demo accounts.');
      return;
    }
    if (session.userId === userId || userId === 'u_admin_1') {
      setError('The active admin account cannot be suspended from this demo.');
      return;
    }
    const current = getUsers().find((user) => user.id === userId);
    if (!current) {
      setError('Demo account not found.');
      return;
    }
    saveUsers(getUsers().map((user) => user.id === userId
      ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
      : user));
    setError('');
    setNotice(`Account ${current.status === 'active' ? 'suspended' : 'reinstated'}.`);
    refresh();
  };

  const resolveDispute = (event: FormEvent) => {
    event.preventDefault();
    if (!recordId) return;
    const result = resolveBookingDispute(recordId, resolution);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setResolution('');
    setError('');
    setNotice('Dispute resolved and booking status updated.');
    refresh();
  };

  const publishAnnouncement = (event: FormEvent) => {
    event.preventDefault();
    if (!isAdmin()) {
      setError('Admin access is required to publish platform announcements.');
      return;
    }
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      setError('Add both a title and message.');
      return;
    }
    const session = getCurrentSession();
    const entry: Announcement = {
      id: `ann_${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now()}`,
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: session?.userId ?? '',
    };
    saveAnnouncements([...getAnnouncements(), entry]);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setError('');
    setNotice('Announcement published.');
    refresh();
  };

  const toggleAnnouncement = (id: string) => {
    if (!isAdmin()) {
      setError('Admin access is required to change announcements.');
      return;
    }
    saveAnnouncements(getAnnouncements().map((announcement) => announcement.id === id
      ? { ...announcement, active: !announcement.active }
      : announcement));
    setError('');
    setNotice('Announcement status updated.');
    refresh();
  };

  const exportReport = () => {
    if (!isAdmin()) {
      setError('Admin access is required to export platform reports.');
      return;
    }
    downloadCsv('sheger-wheels-platform-report.csv', [
      ['Booking ID', 'Car ID', 'Renter ID', 'Owner ID', 'Start date', 'End date', 'Total ETB', 'Fee ETB', 'Status'],
      ...bookings.map((booking) => [booking.id, booking.carId, booking.renterId, booking.ownerId, booking.startDate, booking.endDate, booking.total, booking.fee, booking.status]),
    ]);
  };

  const sectionTitle: Record<AdminSection, string> = {
    listings: 'Listing moderation',
    users: 'Demo accounts',
    user: 'Account details',
    bookings: 'All bookings',
    disputes: 'Dispute queue',
    dispute: 'Dispute resolution',
    reports: 'Platform reports',
    announcements: 'Announcements',
  };

  const user = users.find((candidate) => candidate.id === recordId);
  const dispute = disputes.find((candidate) => candidate.id === recordId);
  const disputeBooking = dispute && bookings.find((booking) => booking.id === dispute.bookingId);
  const pendingCars = cars.filter((car) => car.status === 'pending');
  const bookingStatuses = ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed', 'resolved', 'declined', 'reviewed'];
  const statusData = bookingStatuses.map((status) => ({ status: status.replaceAll('_', ' '), count: bookings.filter((booking) => booking.status === status).length }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <header className="bg-slate-950 text-white p-8 rounded-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-300">Sheger Wheels / admin console</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-2">{sectionTitle[section]}</h1>
          <nav aria-label="Admin tools" className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm text-slate-300">
            <Link href="/admin">Overview</Link><Link href="/admin/listings">Listings</Link><Link href="/admin/users">Users</Link><Link href="/admin/bookings">Bookings</Link><Link href="/admin/disputes">Disputes</Link><Link href="/admin/reports">Reports</Link><Link href="/admin/announcements">Announcements</Link>
          </nav>
        </header>

        {!authorized || !loaded ? <p>Verifying demo admin access…</p> : <>
          {error && <p role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm">{error}</p>}
          {notice && <p role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm">{notice}</p>}

          {section === 'listings' && <section className="space-y-4">
            <p className="text-sm text-slate-600">Only pending owner submissions can be approved or rejected.</p>
            {pendingCars.length === 0 ? <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-600">No pending listings.</div> : pendingCars.map((car) => <ListingReview key={car.id} car={car} onModerate={moderateListing} />)}
          </section>}

          {(section === 'users' || section === 'user') && (
            section === 'user' ? (
              !user ? <p className="bg-white p-8 rounded-2xl">Demo account not found.</p> : <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <h2 className="text-xl font-bold">{user.name}</h2><p>{user.email} · {user.phone}</p><p>Roles: {user.roles.join(', ')} · Status: {user.status}</p>
                <p className="text-xs text-slate-500">Created {new Date(user.createdAt).toLocaleDateString()}</p>
                {user.id !== 'u_admin_1' && getCurrentSession()?.userId !== user.id && <button onClick={() => toggleUserStatus(user.id)} className="px-4 py-2 rounded-xl bg-slate-900 text-white">{user.status === 'active' ? 'Suspend account' : 'Reinstate account'}</button>}
              </section>
            ) : <section className="bg-white rounded-2xl border border-slate-200 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100 text-xs uppercase"><tr><th className="p-4">Name / Email</th><th className="p-4">Roles</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody className="divide-y">{users.map((entry) => <tr key={entry.id}><td className="p-4"><Link className="font-semibold text-emerald-800 underline" href={`/admin/users/${entry.id}`}>{entry.name}</Link><div className="text-xs text-slate-500">{entry.email}</div></td><td className="p-4">{entry.roles.join(', ')}</td><td className="p-4 capitalize">{entry.status}</td><td className="p-4">{entry.id !== 'u_admin_1' && getCurrentSession()?.userId !== entry.id && <button onClick={() => toggleUserStatus(entry.id)} className="text-rose-700 underline">{entry.status === 'active' ? 'Suspend' : 'Reinstate'}</button>}</td></tr>)}</tbody></table></section>
          )}

          {section === 'bookings' && <section className="bg-white rounded-2xl border border-slate-200 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100 text-xs uppercase"><tr><th className="p-4">Booking</th><th className="p-4">Renter / Owner</th><th className="p-4">Dates</th><th className="p-4">Amount / Fee</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y">{bookings.map((booking) => <tr key={booking.id}><td className="p-4 font-mono text-xs"><Link className="underline" href={`/bookings/${booking.id}`}>{booking.id}</Link></td><td className="p-4 text-xs">{booking.renterId}<br />{booking.ownerId}</td><td className="p-4">{booking.startDate} – {booking.endDate}</td><td className="p-4">{booking.total.toLocaleString()} / {booking.fee.toLocaleString()} ETB</td><td className="p-4 capitalize">{booking.status.replaceAll('_', ' ')}</td></tr>)}</tbody></table></section>}

          {(section === 'disputes' || section === 'dispute') && <section className="space-y-4">
            {section === 'dispute' ? !dispute ? <p className="bg-white p-8 rounded-2xl">Dispute not found.</p> : <article className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-xl font-bold">{dispute.reason}</h2><p>{dispute.description}</p><p className="text-xs text-slate-500">Booking {dispute.bookingId} · Opened by {dispute.openedBy} · {dispute.status}</p>
              {dispute.ownerResponse && <p className="bg-slate-50 p-4 rounded-xl"><strong>Owner response:</strong> {dispute.ownerResponse}</p>}
              {dispute.resolutionNotes && <p className="bg-emerald-50 p-4 rounded-xl"><strong>Resolution:</strong> {dispute.resolutionNotes}</p>}
              {dispute.status !== 'resolved' && <form onSubmit={resolveDispute} className="space-y-3"><label className="block font-semibold">Resolution notes<textarea required rows={4} value={resolution} onChange={(event) => setResolution(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" /></label><button className="px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold">Resolve dispute</button></form>}
              {disputeBooking && <Link href={`/bookings/${disputeBooking.id}`} className="block text-emerald-800 underline">Open related booking</Link>}
            </article> : disputes.length === 0 ? <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-600">No disputes to review.</div> : disputes.map((entry) => <article key={entry.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{entry.reason}</h2><p className="text-sm text-slate-600">{entry.description}</p><p className="text-xs text-slate-500 mt-2">{entry.bookingId} · {entry.status}</p></div><Link href={`/admin/disputes/${entry.id}`} className="self-center text-emerald-800 underline">Review</Link></article>)}
          </section>}

          {section === 'reports' && <section className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[
              ['Demo users', users.length],
              ['Active users', users.filter((entry) => entry.status === 'active').length],
              ['Approved / pending cars', `${cars.filter((car) => car.status === 'approved').length} / ${pendingCars.length}`],
              ['Mock platform fees', `${bookings.filter((booking) => ['confirmed', 'in_progress', 'completed', 'reviewed'].includes(booking.status)).reduce((sum, booking) => sum + booking.fee, 0).toLocaleString()} ETB`],
            ].map(([label, value]) => <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200"><p className="text-xs uppercase text-slate-500">{label}</p><p className="text-2xl font-black mt-2">{value}</p></div>)}</div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200"><h2 className="font-bold mb-5">Bookings by lifecycle status</h2><div className="h-72" role="img" aria-label="Bar chart of demo bookings by lifecycle status"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" angle={-25} textAnchor="end" height={64} interval={0} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#047857" /></BarChart></ResponsiveContainer></div><table className="w-full text-sm mt-4"><caption className="sr-only">Booking count by status</caption><thead><tr><th className="text-left p-2">Status</th><th className="text-right p-2">Count</th></tr></thead><tbody>{statusData.map((row) => <tr key={row.status} className="border-t"><td className="p-2 capitalize">{row.status}</td><td className="p-2 text-right">{row.count}</td></tr>)}</tbody></table><button onClick={exportReport} className="mt-5 px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold">Export platform CSV</button></div>
          </section>}

          {section === 'announcements' && <section className="space-y-5">
            <form onSubmit={publishAnnouncement} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4"><h2 className="font-bold text-lg">Publish announcement</h2><label className="block text-sm font-semibold">Title<input required value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl p-3" /></label><label className="block text-sm font-semibold">Message<textarea required rows={3} value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl p-3" /></label><button className="px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold">Publish</button></form>
            {announcements.length === 0 ? <p className="text-slate-600">No announcements yet.</p> : announcements.map((announcement) => <article key={announcement.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between gap-3"><div><h3 className="font-bold">{announcement.title}</h3><p className="text-sm text-slate-600">{announcement.message}</p><p className="text-xs text-slate-500 mt-2">{announcement.active ? 'Active' : 'Inactive'}</p></div><button onClick={() => toggleAnnouncement(announcement.id)} className="self-center text-emerald-800 underline">{announcement.active ? 'Deactivate' : 'Activate'}</button></article>)}
          </section>}
        </>}
      </main>
      <Footer />
    </div>
  );
}

function ListingReview({ car, onModerate }: { car: Car; onModerate: (carId: string, status: 'approved' | 'rejected') => void }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden md:flex">
      <img src={car.photos[0]} alt={`${car.make} ${car.model}`} className="w-full md:w-64 h-48 object-cover bg-slate-200" />
      <div className="p-5 flex-1 space-y-3"><div><h2 className="font-bold text-xl">{car.make} {car.model} ({car.year})</h2><p className="text-sm text-slate-600">{car.neighbourhood}, {car.city} · {car.pricePerDay.toLocaleString()} ETB/day · Owner {car.ownerId}</p></div><p className="text-sm text-slate-700">{car.description}</p><div className="flex gap-3"><button onClick={() => onModerate(car.id, 'approved')} className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-semibold">Approve listing</button><button onClick={() => onModerate(car.id, 'rejected')} className="px-5 py-2 rounded-xl bg-rose-700 text-white font-semibold">Reject listing</button></div></div>
    </article>
  );
}
