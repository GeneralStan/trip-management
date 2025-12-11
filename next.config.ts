import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // eslint configuration removed - no longer supported in Next.js 16
  // Use package.json scripts or command-line flags instead
    // 1. Add the async rewrites function here
    async rewrites() {
        return [
            {
                // 'source' is the path the browser requests on your Vercel domain
                source: '/api/:path*',
                // 'destination' is the URL Vercel proxies the request to
                destination: 'http://34.28.232.231:5010/:path*',
            },
            // You can add other rewrite rules here if needed
        ];
    }
};


export default nextConfig;
