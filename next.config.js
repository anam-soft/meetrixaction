/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable body parsing for Stripe webhooks
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
