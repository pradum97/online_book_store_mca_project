const pool = require("../../../config/db");
const { success, error } = require("../../../utils/response");

exports.getUserTypes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        user_type_id,
        user_type_code,
        type_name,
        description,
        is_active,
        created_date
       FROM tbl_user_types
       ORDER BY created_date DESC`,
    );

    return success(
      res,
      "User Types List",
      "User types fetched successfully",
      result.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.createUserType = async (req, res) => {
  try {
    const { user_type_code, type_name, description } = req.body;

    if (!user_type_code || !type_name) {
      return error(
        res,
        "Validation Failed",
        "user_type_code and type name are required",
      );
    }

    const exists = await pool.query(
      `SELECT 1
       FROM tbl_user_types
       WHERE LOWER(user_type_code)=LOWER($1)
          OR LOWER(type_name)=LOWER($2)`,
      [user_type_code, type_name],
    );

    if (exists.rows.length) {
      return error(
        res,
        "Duplicate Entry",
        "User type with same code or name already exists",
      );
    }

    const result = await pool.query(
      `INSERT INTO tbl_user_types
       (user_type_code,type_name,description,is_active,created_date)
       VALUES($1,$2,$3,true,NOW())
       RETURNING user_type_id,user_type_code,type_name`,
      [user_type_code, type_name, description],
    );

    return success(
      res,
      "User Type Created",
      "User type created successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Creation Failed", err.message);
  }
};

exports.updateUserType = async (req, res) => {
  try {
    const { id } = req.params;

    const { user_type_code, type_name, description, is_active } = req.body;

    const result = await pool.query(
      `UPDATE tbl_user_types
       SET user_type_code = COALESCE($1,user_type_code),
           type_name = COALESCE($2,type_name),
           description = COALESCE($3,description),
           is_active = COALESCE($4,is_active)
       WHERE user_type_id=$5`,
      [user_type_code, type_name, description, is_active, id],
    );

    if (!result.rowCount) {
      return error(res, "Update Failed", "User type not found");
    }

    return success(res, "User Type Updated", "User type updated successfully");
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.deleteUserType = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tbl_user_types
       WHERE user_type_id=$1`,
      [id],
    );

    if (!result.rowCount) {
      return error(res, "Delete Failed", "User type not found");
    }

    return success(res, "User Type Deleted", "User type deleted successfully");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};
