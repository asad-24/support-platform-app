import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.API_PROXY_TARGET?.replace(/\/+$/, "") ||
      "http://127.0.0.1:8000";

    return {
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
