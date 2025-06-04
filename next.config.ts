
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: ['https://6000-firebase-studio-1748895650397.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev'],
  // The i18n block below was causing the error and has been removed.
  // App Router handles i18n differently (e.g., via middleware and directory structure).
};

export default nextConfig;
