const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
});
pool.on("error", (err) => {
  console.error("Unexpected DB Pool Error:", err);
});
async function query(text, params = [], retries = 5) {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    if (
      retries > 0 &&
      (err.code === "ETIMEDOUT" ||
        err.code === "ECONNRESET" ||
        err.code === "57P01" ||
        err.code === "ENOTFOUND" ||
        err.code === "EAI_AGAIN")
    ) {
      await new Promise((res) => setTimeout(res, 1000));

      return query(text, params, retries - 1);
    }
    throw err;
  }
}
async function warmup() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
  } catch (err) {
    console.error("Database warmup failed:", err);
  }
}
module.exports = {
  pool,
  query,
  warmup,
};
