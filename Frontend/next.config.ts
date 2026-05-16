// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";
import type { NextConfig } from "next";
import { IRuntimeCachingRule } from "@interface/global";

const isDev = process.env.NODE_ENV === "development";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  //productionBrowserSourceMaps: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

const runtimeCaching: IRuntimeCachingRule[] = [
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "google-fonts",
      expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
    },
  },
  {
    urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "static-assets",
      expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
    },
  },
];

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  //disable: isDev,
  disable: true,
  buildExcludes: [
    ({ asset }: { asset: string; size: number }) =>
      /middleware-manifest\.json$/.test(asset),
  ],
  runtimeCaching,
});
export default withAnalyzer(pwaConfig(nextConfig));
