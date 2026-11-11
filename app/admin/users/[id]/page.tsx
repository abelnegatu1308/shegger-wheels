import { Suspense } from 'react';
import AdminWorkspace from '@/components/AdminWorkspace';

async function UserContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminWorkspace section="user" recordId={id} />;
}

export default function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="p-8">Loading user…</p>}><UserContent params={params} /></Suspense>;
}
