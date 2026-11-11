import { Suspense } from 'react';
import { connection } from 'next/server';
import CarDetailClient from './car-detail-client';

// Signals to Next.js that this page has intentional runtime (URL) data access,
// which allows generateMetadata() in layout.tsx to use `await params` without
// blocking the route from being prefetched. The marker renders nothing but opts
// this segment out of static prerendering, matching the metadata's behaviour.
async function DynamicMarker() {
  await connection();
  return null;
}

export default function CarDetailPage() {
  return (
    <>
      <Suspense>
        <DynamicMarker />
      </Suspense>
      <CarDetailClient />
    </>
  );
}
