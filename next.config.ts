import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // "heic to jpg" is the far bigger search term — the page moved there permanently
      { source: "/heif-to-jpg", destination: "/heic-to-jpg", permanent: true },
    ];
  },
};

export default nextConfig;
