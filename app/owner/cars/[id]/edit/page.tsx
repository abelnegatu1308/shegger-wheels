import { Suspense } from 'react';
import OwnerCarEditor from '@/components/OwnerCarEditor';

async function EditCarContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OwnerCarEditor carId={id} mode="edit" />;
}

export default function EditOwnerCarPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="p-8">Loading vehicle…</p>}><EditCarContent params={params} /></Suspense>;
}
