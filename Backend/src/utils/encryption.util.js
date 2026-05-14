import bcrypt from "bcryptjs";

const saltRounds = 10;

export async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
  }
}
