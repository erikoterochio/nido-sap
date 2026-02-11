/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
