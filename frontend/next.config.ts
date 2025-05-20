/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static01.nyt.com',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
