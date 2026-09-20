import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  // Arabic is the default language.
  async redirects() {
    return [{ source: '/', destination: '/ar', permanent: false }];
  },
};

export default nextConfig;
