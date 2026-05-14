import crypto from "crypto";

const SECRET_KEY =
  "2b67fc01ad9be10d8d32f9c9f512d1a1426a2163922bc92798c2092e696ffdf5";

export const getKey = (): Buffer =>
  crypto.createHash("sha256").update(String(SECRET_KEY)).digest().slice(0, 32);

export const encryptValue = (value: unknown): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  let encrypted = cipher.update(JSON.stringify(value), "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${iv.toString("base64")}:${encrypted}`;
};

export const encryptDataAuto = (data: unknown): unknown => {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    const result: unknown[] = [];
    for (let i = 0; i < data.length; i++) {
      result.push(encryptDataAuto(data[i]));
    }
    return result;
  }

  if (typeof data === "object") {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const encryptedKey = encryptValue(key);
      obj[encryptedKey] = encryptDataAuto(value);
    }
    return obj;
  }

  return encryptValue(data);
};

export const generateHMAC = (payload: string): string => {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("base64");
};

export const decryptValue = (encrypted: string): unknown => {
  const [ivEncoded, data] = encrypted.split(":");
  const iv = Buffer.from(ivEncoded, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};

export const decryptDataAuto = (data: unknown): unknown => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(decryptDataAuto);
  if (typeof data === "object") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      obj[decryptValue(k) as string] = decryptDataAuto(v);
    }
    return obj;
  }
  return decryptValue(data as string);
};
