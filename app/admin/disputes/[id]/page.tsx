import { Suspense } from 'react';
import AdminWorkspace from '@/components/AdminWorkspace';

async function DisputeContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminWorkspace section="dispute" recordId={id} />;
}

export default function AdminDisputePage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="p-8">Loading dispute…</p>}><DisputeContent params={params} /></Suspense>;
}
