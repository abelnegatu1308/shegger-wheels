import { Suspense } from 'react';
import OwnerCarEditor from '@/components/OwnerCarEditor';

async function AvailabilityContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OwnerCarEditor carId={id} mode="availability" />;
}

export default function OwnerCarAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="p-8">Loading availability…</p>}><AvailabilityContent params={params} /></Suspense>;
}
