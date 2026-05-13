import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "25mb",
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  serverExternalPackages: ["@react-pdf/renderer"],
}

export default nextConfig
