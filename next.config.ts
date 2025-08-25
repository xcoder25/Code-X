
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  typescript: {
    // Set this to true if you want to ignore build errors.
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
