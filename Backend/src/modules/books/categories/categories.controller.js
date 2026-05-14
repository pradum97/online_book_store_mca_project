const pool = require("../../../config/db");
const { success, error } = require("../../../utils/response");

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        category_id,
        category_code,
        category_name,
        category_description,
        is_active,
        created_date
      FROM tbl_categories
      WHERE is_active = true
      ORDER BY category_name
    `);

    return success(
      res,
      "Categories List",
      "Categories fetched successfully",
      result.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        category_id,
        category_code,
        category_name,
        category_description,
        is_active,
        created_date
       FROM tbl_categories
       WHERE category_id=$1`,
      [id],
    );

    if (!result.rows.length) {
      return error(res, "Category Not Found", "Category does not exist");
    }

    return success(
      res,
      "Category Details",
      "Category fetched successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_code, category_name, category_description } = req.body;

    if (!category_code || !category_name) {
      return error(
        res,
        "Validation Failed",
        "category_code and category_name are required",
      );
    }

    const exists = await pool.query(
      `SELECT 1
       FROM tbl_categories
       WHERE LOWER(category_code)=LOWER($1)
          OR LOWER(category_name)=LOWER($2)`,
      [category_code, category_name],
    );

    if (exists.rows.length) {
      return error(res, "Duplicate Category", "Category already exists");
    }

    const result = await pool.query(
      `INSERT INTO tbl_categories
      (
        category_code,
        category_name,
        category_description,
        created_by,
        created_session_id,
        organization_id,
        installation_id
      )
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING category_id,category_code,category_name`,
      [
        category_code,
        category_name,
        category_description,
        req.user.user_id,
        req.user.session_id,
        req.user.organization_id,
        req.user.installation_id,
      ],
    );

    return success(
      res,
      "Category Created",
      "Category created successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Creation Failed", err.message);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_code, category_name, category_description, is_active } =
      req.body;

    const result = await pool.query(
      `UPDATE tbl_categories
       SET
        category_code = COALESCE($1,category_code),
        category_name = COALESCE($2,category_name),
        category_description = COALESCE($3,category_description),
        is_active = COALESCE($4,is_active),
        updated_by=$5,
        updated_session_id=$6,
        updated_date=NOW()
       WHERE category_id=$7`,
      [
        category_code,
        category_name,
        category_description,
        is_active,
        req.user.user_id,
        req.user.session_id,
        id,
      ],
    );

    if (!result.rowCount) {
      return error(res, "Update Failed", "Category not found");
    }

    return success(res, "Category Updated", "Category updated successfully");
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE tbl_categories
       SET
        is_active=false,
        updated_by=$1,
        updated_session_id=$2,
        updated_date=NOW()
       WHERE category_id=$3`,
      [req.user.user_id, req.user.session_id, id],
    );

    if (!result.rowCount) {
      return error(res, "Delete Failed", "Category not found");
    }

    return success(res, "Category Deleted", "Category deleted successfully");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};
