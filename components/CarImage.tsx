'use client';

import { useState } from 'react';
import Image from 'next/image';

type Props = {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export default function CarImage({ src, alt, sizes, priority = false, className = '' }: Props) {
  const [failedSource, setFailedSource] = useState('');
  const source = src && failedSource !== src ? src : '/car-placeholder.svg';

  return (
    <Image
      src={source}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setFailedSource(src ?? '')}
      className={className}
    />
  );
}
