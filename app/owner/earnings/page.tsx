import { Suspense } from 'react';
import OwnerEarningsDashboard from '@/components/OwnerEarningsDashboard';

export default function OwnerEarningsPage() {
  return <Suspense fallback={<main className="p-10 text-center">Loading owner report…</main>}><OwnerEarningsDashboard /></Suspense>;
}
