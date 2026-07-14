/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_BUILD_TIME: process.env.APP_BUILD_TIME ?? new Date().toISOString(),
  },
};

module.exports = nextConfig;
