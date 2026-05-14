export interface IViewModeDefaultValue {
  view_mode: "TABLE" | "GRID";
  status_set_id?: number;
  quick_set_id?: number;
}
export type IRuntimeCachingRule = {
  urlPattern: RegExp;
  handler: "CacheFirst" | "NetworkFirst" | "StaleWhileRevalidate";
  options?: {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
  };
};
