require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});
const app = require("./app");
const db = require("./config/db");

db.warmup();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
