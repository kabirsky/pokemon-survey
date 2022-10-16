/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com"],
  },
  experimental: {
    images: { allowFutureImage: true },
  },
};

module.exports = nextConfig;
