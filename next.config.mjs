/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cmdgos2s1iefxpvd.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase to whatever you need
    },
  },
};
export default nextConfig;
