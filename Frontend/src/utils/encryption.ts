import crypto from "crypto";

const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY || "";
if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
  console.warn("WARNING: ENCRYPTION_KEY missing or not 32 bytes (hex).");
}
const KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex");

const IV_LENGTH = 12;

export function encryptForPurpose(plaintext: string, aad?: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);

  if (aad) cipher.setAAD(Buffer.from(aad, "utf8"));

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const out = Buffer.concat([iv, encrypted, authTag]);
  return out.toString("base64");
}

export function decryptForPurpose(payloadBase64: string, aad?: string): string {
  const b = Buffer.from(payloadBase64, "base64");
  if (b.length < IV_LENGTH + 16) throw new Error("Invalid payload");

  const iv = b.subarray(0, IV_LENGTH);
  const authTag = b.subarray(b.length - 16);
  const ciphertext = b.subarray(IV_LENGTH, b.length - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  if (aad) decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
