const pool = require("../config/db");
const { error } = require("../utils/response");

module.exports = (pageCode, permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.user_id;

      const result = await pool.query(
        `
        SELECT *
        FROM tbl_page_permissions p
        JOIN tbl_web_pages w
        ON p.page_id = w.page_id
        WHERE w.page_code=$1
        AND p.user_id=$2
        `,
        [pageCode, userId],
      );

      if (!result.rows.length)
        return error(res, "Access Denied", "Permission not granted");

      const row = result.rows[0];

      if (!row[permission])
        return error(res, "Access Denied", "Permission denied");

      next();
    } catch (err) {
      return error(res, "RBAC Error", err.message);
    }
  };
};
