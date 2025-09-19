/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Improve error handling during builds
  experimental: {
    serverMinification: false,
  },
  // Ensure proper redirects for auth
  async redirects() {
    return [
      {
        source: '/auth/sign-up',
        destination: '/auth/login',
        permanent: false,
      },
    ]
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

export default nextConfig
