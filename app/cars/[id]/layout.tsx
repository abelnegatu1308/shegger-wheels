import type { Metadata } from 'next';
import { getPublicCars } from '@/lib/storage';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const car = getPublicCars().find((candidate) => candidate.id === id);
  if (!car) return { title: 'Vehicle not found' };

  return {
    title: `${car.make} ${car.model} rental in ${car.neighbourhood}`,
    description: `${car.year} ${car.make} ${car.model} available for demo rental in ${car.neighbourhood}, Addis Ababa. ${car.description.slice(0, 120)}`,
    openGraph: {
      title: `${car.make} ${car.model} · Sheggar Wheels`,
      description: `${car.neighbourhood}, Addis Ababa · ${car.pricePerDay.toLocaleString()} ETB per day.`,
      images: car.photos.slice(0, 1),
    },
  };
}

export default function CarRouteLayout({ children }: Props) {
  return <>{children}</>;
}
