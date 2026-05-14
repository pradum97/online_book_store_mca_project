declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAOptions {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: {
      urlPattern: RegExp;
      handler: "CacheFirst" | "NetworkFirst" | "StaleWhileRevalidate";
      options?: {
        cacheName?: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
      };
    }[];
    buildExcludes?: ((file: { asset: string; size: number }) => boolean)[];
    buildExcludes?: string[];
    fallbacks?: Record<string, string>;
  }

  function withPWA(options: PWAOptions): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}
