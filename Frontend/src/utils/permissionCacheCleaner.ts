export const cleanupPermissionCache = () => {
  try {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("lastPermissions_")) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;

          const parsed = JSON.parse(raw);

          if (!parsed?.savedAt || now - parsed.savedAt > oneDay) {
            localStorage.removeItem(key);
            console.log(`[PermissionCacheCleaner] Removed expired: ${key}`);
          }
        } catch {
          localStorage.removeItem(key);
          console.log(`[PermissionCacheCleaner] Removed corrupted: ${key}`);
        }
      }
    });
  } catch (err) {
    console.error("[PermissionCacheCleaner] Failed:", err);
  }
};
