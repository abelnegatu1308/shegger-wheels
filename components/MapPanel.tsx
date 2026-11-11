'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type LocationMap from '@/components/LocationMap';

const ClientMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-slate-200" aria-label="Loading map" />,
});

type Props = ComponentProps<typeof LocationMap>;

export default function MapPanel(props: Props) {
  return <ClientMap {...props} />;
}
