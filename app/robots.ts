import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/bookings', '/checkout', '/owner', '/admin', '/signin', '/signup'],
    },
    ...(siteUrl ? { sitemap: new URL('/sitemap.xml', siteUrl).toString() } : {}),
  };
}
