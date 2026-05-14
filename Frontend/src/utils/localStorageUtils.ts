export function setFilterStorage<T>(pageKey: string, data: T): void {
  try {
    localStorage.setItem(pageKey, JSON.stringify(data));
    console.log("Filter saved:", pageKey, data);
  } catch (err) {
    console.error("Error saving filter:", err);
  }
}

export function getFilterStorage<T>(pageKey: string): T | null {
  try {
    const saved = localStorage.getItem(pageKey);
    if (saved) {
      console.log("Filter loaded:", pageKey, saved);
      return JSON.parse(saved) as T;
    }
    return null;
  } catch (err) {
    console.error("Error reading filter:", err);
    return null;
  }
}

export function clearFilterStorage(pageKey: string): void {
  try {
    localStorage.removeItem(pageKey);
    console.log("Filter cleared:", pageKey);
  } catch (err) {
    console.error("Error clearing filter:", err);
  }
}
