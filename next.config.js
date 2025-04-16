// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['zflzgrkxqjpshcwjcwoq.supabase.co'],
    },
    // TypeScript specific settings
    typescript: {
      ignoreBuildErrors: false, // Set to true if you want to bypass build errors
    },
    // Other Next.js settings
    reactStrictMode: true,
    swcMinify: true,
  }
  
  module.exports = nextConfig