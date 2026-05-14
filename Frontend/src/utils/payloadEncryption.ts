import crypto from "crypto";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_PAYLOAD_SECRET || "my_super_secret_key_123!";

const getKey = () =>
  crypto.createHash("sha256").update(String(SECRET_KEY)).digest().slice(0, 32);

// Encrypt function
export const encryptPayload = (data: object | string) => {
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const text = typeof data === "string" ? data : JSON.stringify(data);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const encryptedData = iv.toString("base64") + ":" + encrypted;
  return encodeURIComponent(encryptedData);
};

// Decrypt function
export const decryptPayload = (encryptedData: string) => {
  const decoded = decodeURIComponent(encryptedData);
  const [ivEncoded, encryptedText] = decoded.split(":");
  if (!ivEncoded || !encryptedText) throw new Error("Invalid payload");

  const iv = Buffer.from(ivEncoded, "base64");
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
};
