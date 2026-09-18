// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minifier to avoid binary loading issues on Windows
  swcMinify: false,
  reactStrictMode: true,
  // You can add other custom Next.js configuration here
};

module.exports = nextConfig;
