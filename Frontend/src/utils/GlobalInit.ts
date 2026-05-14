"use client";
import { useEffect } from "react";

export function GlobalInit() {
  const cleanupPermissionCache = () => {
    const now = Date.now();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("user_") && key.includes("_permissions_")) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "{}");
          if (!parsed?.savedAt || now - parsed.savedAt > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  };

  useEffect(() => {
    cleanupPermissionCache();
    const interval = setInterval(cleanupPermissionCache, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
