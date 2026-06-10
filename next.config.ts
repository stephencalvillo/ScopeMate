import type { NextConfig } from "next";
import { getClerkProxyUrl } from "./lib/clerk/proxy-url";

const clerkProxyUrl = getClerkProxyUrl();

const nextConfig: NextConfig = {
  ...(clerkProxyUrl && !process.env.NEXT_PUBLIC_CLERK_PROXY_URL
    ? {
        env: {
          NEXT_PUBLIC_CLERK_PROXY_URL: clerkProxyUrl,
        },
      }
    : {}),
  experimental: {
    serverActions: {
      allowedOrigins: [
        "scopebuddy.ai",
        "www.scopebuddy.ai",
        "myscopemate.ai",
        "localhost:3000",
      ],
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.scopebuddy.ai" }],
        destination: "https://scopebuddy.ai/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.myscopemate.ai" }],
        destination: "https://scopebuddy.ai/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "myscopemate.ai" }],
        destination: "https://scopebuddy.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
