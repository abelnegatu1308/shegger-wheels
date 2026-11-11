import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return [];

  const baseUrl = new URL(siteUrl);
  return ['/', '/cars', '/signin', '/signup'].map((path) => ({
    url: new URL(path, baseUrl).toString(),
    changeFrequency: path === '/' ? 'weekly' : 'daily',
    priority: path === '/' ? 1 : 0.7,
  }));
}
