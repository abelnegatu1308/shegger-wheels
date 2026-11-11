import { Suspense } from 'react';
import BookingTrack from '@/components/BookingTrack';

async function BookingTrackContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingTrack bookingId={id} />;
}

export default function BookingTrackPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<main className="p-10 text-center">Loading trip status…</main>}><BookingTrackContent params={params} /></Suspense>;
}
