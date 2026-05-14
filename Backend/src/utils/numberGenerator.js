const pool = require("../config/db");

const STATE_CODE_MAP = {
  JHARKHAND: "JH",
  DELHI: "DL",
  BIHAR: "BR",
  UTTAR_PRADESH: "UP",
};

const getNextSequence = async (client, type, stateCode, year) => {
  const result = await client.query(
    `
    SELECT COUNT(*) + 1 as seq
    FROM tbl_sellers
    WHERE
      ${
        type === "REQ"
          ? "request_number IS NOT NULL"
          : "seller_number IS NOT NULL"
      }
      AND EXTRACT(YEAR FROM created_date) = $1
      AND state = $2
    `,
    [year, stateCode],
  );

  return String(result.rows[0].seq).padStart(5, "0");
};

const generateRequestNumber = async (client, state) => {
  const year = new Date().getFullYear();
  const stateCode = STATE_CODE_MAP[state?.toUpperCase()] || "XX";

  const seq = await getNextSequence(client, "REQ", state, year);

  return `REQ-${stateCode}-${year}-${seq}`;
};

const generateSellerNumber = async (client, state) => {
  const year = new Date().getFullYear();
  const stateCode = STATE_CODE_MAP[state?.toUpperCase()] || "XX";

  const seq = await getNextSequence(client, "SEL", state, year);

  return `SEL-${stateCode}-${year}-${seq}`;
};

module.exports = {
  generateRequestNumber,
  generateSellerNumber,
};
