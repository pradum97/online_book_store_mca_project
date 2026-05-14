export const getRandomHex = (size: number): string => {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const array = new Uint8Array(size);
    window.crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomBytes } = require("crypto");
    return randomBytes(size).toString("hex");
  }
};
