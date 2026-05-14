const { pool } = require("../../../config/db");
const { error } = require("../../../utils/response");

exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(
        u.full_name ILIKE $${idx} OR
        u.email     ILIKE $${idx} OR
        u.mobile    ILIKE $${idx}
      )`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const summaryResult = await pool.query(`
      SELECT
        COUNT(*)                                           AS total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')         AS active,
        COUNT(*) FILTER (WHERE status = 'SUSPENDED')       AS suspended
      FROM tbl_users
      WHERE user_type_code NOT IN ('ADMIN')
    `);

    const dataResult = await pool.query(
      `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.mobile,
        u.user_type_code,
       case when u.status = 'SUSPENDED' then true else false end as is_suspended,
        u.created_date
      FROM tbl_users u
      ${where ? `WHERE u.user_type_code NOT IN ('ADMIN') AND ${conditions.join(" AND ")}` : "WHERE u.user_type_code NOT IN ('ADMIN')"}
      ORDER BY u.created_date DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...params, parseInt(limit), offset],
    );

    const summary = summaryResult.rows[0];

    return res.json({
      action: "success",
      data: {
        users: dataResult.rows,
        summary: {
          total: parseInt(summary.total),
          active: parseInt(summary.active),
          suspended: parseInt(summary.suspended),
        },
      },
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};
