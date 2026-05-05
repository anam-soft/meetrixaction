/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable body parsing for Stripe webhooks
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Skip type checking and linting during build for faster builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure environment variables are available during build
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
