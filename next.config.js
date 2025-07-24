/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure API routes using the correct Next.js config structure
  serverRuntimeConfig: {
    // Will only be available on the server side
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    maxUploadSize: '10mb',
  },
}

module.exports = nextConfig
