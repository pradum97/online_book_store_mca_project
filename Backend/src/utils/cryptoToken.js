const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const secret = process.env.TOKEN_SECRET;

const key = crypto.createHash("sha256").update(secret).digest();
const iv = Buffer.alloc(16, 0);

/* ENCRYPT TOKEN */
exports.encryptToken = (token) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

/* DECRYPT TOKEN */
exports.decryptToken = (encryptedToken) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedToken, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
