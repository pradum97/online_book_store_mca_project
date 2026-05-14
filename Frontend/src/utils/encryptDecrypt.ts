import crypto from "crypto";

const SECRET_KEY = "my_super_secret_key_123!";
const IV = crypto.randomBytes(16);

const getKey = () =>
  crypto
    .createHash("sha256")
    .update(String(SECRET_KEY))
    .digest("base64")
    .substring(0, 32);

// Encrypt function
export function encryptParam(text: string): string {
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), IV);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const encryptedData = IV.toString("base64") + ":" + encrypted;
  return encodeURIComponent(encryptedData); // safe for URL
}

// Decrypt function
export function decryptParam(encryptedUrlParam: string): string {
  const decoded = decodeURIComponent(encryptedUrlParam);
  const [ivEncoded, encryptedData] = decoded.split(":");

  const iv = Buffer.from(ivEncoded, "base64");
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);

  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
