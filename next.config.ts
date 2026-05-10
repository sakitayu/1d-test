import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles detected" warning when this repo
  // is checked out under a parent that happens to have its own lockfile.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
