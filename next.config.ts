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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.myscopemate.ai" }],
        destination: "https://myscopemate.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
