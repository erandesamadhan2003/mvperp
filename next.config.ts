import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://mvperp.org:82/api/:path*",
      },
    ];
  },
};

export default nextConfig;