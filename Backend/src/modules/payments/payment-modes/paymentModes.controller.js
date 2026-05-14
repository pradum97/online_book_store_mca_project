const { pool } = require("../../../config/db");
const { success, error } = require("../../../utils/response");

exports.getPaymentModes = async (req, res) => {
  try {
    const modes = await pool.query(`
      SELECT
      payment_mode_id,
      mode_name,
      mode_code,
      is_active
      FROM tbl_payment_modes
      ORDER BY mode_name
    `);

    return success(
      res,
      "Payment Modes",
      "Payment modes fetched successfully",
      modes.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.createPaymentMode = async (req, res) => {
  try {
    const { mode_name, mode_code } = req.body;

    const exists = await pool.query(
      `SELECT 1 FROM tbl_payment_modes WHERE mode_code=$1`,
      [mode_code],
    );

    if (exists.rows.length) {
      return error(res, "Duplicate Mode", "Payment mode already exists");
    }

    const mode = await pool.query(
      `
      INSERT INTO tbl_payment_modes
      (
        mode_name,
        mode_code
      )
      VALUES
      ($1,$2)
      RETURNING *
      `,
      [mode_name, mode_code],
    );

    return success(
      res,
      "Payment Mode Created",
      "Payment mode created successfully",
      mode.rows[0],
    );
  } catch (err) {
    return error(res, "Create Failed", err.message);
  }
};

exports.updatePaymentMode = async (req, res) => {
  try {
    const { payment_mode_id } = req.params;

    const { mode_name, mode_code, is_active } = req.body;

    const mode = await pool.query(
      `
      UPDATE tbl_payment_modes
      SET
        mode_name = COALESCE($1,mode_name),
        mode_code = COALESCE($2,mode_code),
        is_active = COALESCE($3,is_active)
      WHERE payment_mode_id=$4
      RETURNING *
      `,
      [mode_name, mode_code, is_active, payment_mode_id],
    );

    if (!mode.rows.length) {
      return error(res, "Not Found", "Payment mode not found");
    }

    return success(
      res,
      "Payment Mode Updated",
      "Payment mode updated successfully",
      mode.rows[0],
    );
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};
