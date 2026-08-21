import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Use Webpack for builds (Turbopack has CSS parsing issues with tailwindcss v4)
  turbopack: undefined,
  allowedDevOrigins: ["172.17.16.59", "localhost"],
}

export default nextConfig
