import { Suspense } from 'react';
import OwnerCarBookings from '@/components/OwnerCarBookings';

async function BookingsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OwnerCarBookings carId={id} />;
}

export default function OwnerCarBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="p-8">Loading bookings…</p>}><BookingsContent params={params} /></Suspense>;
}
