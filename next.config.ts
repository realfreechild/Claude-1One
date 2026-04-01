import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow cross-origin images for article thumbnails/favicons
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }],
  },
  // Ensure better-sqlite3 native module is handled correctly
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
