import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output bundles the server + its dependencies into .next/standalone
  // Required for Electron packaging
  output: 'standalone',
  // Allow cross-origin images for article thumbnails/favicons
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }],
  },
  // Ensure better-sqlite3 native module is not bundled (loaded from node_modules)
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
