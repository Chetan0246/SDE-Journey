import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Use Webpack for builds (Turbopack has CSS parsing issues with tailwindcss v4)
  turbopack: undefined,
}

export default nextConfig
