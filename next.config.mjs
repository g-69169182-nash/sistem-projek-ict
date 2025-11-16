/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: true, // WAJIB untuk Tailwind v4 supaya compile betul di Vercel
  },
};

export default nextConfig;
