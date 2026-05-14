const pool = require("../../../config/db");
const { success, error } = require("../../../utils/response");

exports.getWebPages = async (req, res) => {
  try {
    const pages = await pool.query(`
      SELECT
        page_id,
        page_name,
        page_code,
        page_url,
        icon_name,
        description,
        is_active,
        created_date
      FROM tbl_web_pages
      ORDER BY created_date DESC
    `);

    return success(
      res,
      "Pages List",
      "Web pages fetched successfully",
      pages.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.createWebPage = async (req, res) => {
  try {
    const { page_name, page_code, page_url, icon_name, description } = req.body;

    if (!page_name || !page_code || !page_url) {
      return error(
        res,
        "Validation Failed",
        "page_name, page_code and page_url are required",
      );
    }

    const exists = await pool.query(
      `SELECT 1
       FROM tbl_web_pages
       WHERE LOWER(page_code)=LOWER($1)`,
      [page_code],
    );

    if (exists.rows.length) {
      return error(res, "Duplicate Page", "Page already exists");
    }

    const result = await pool.query(
      `INSERT INTO tbl_web_pages
      (
        page_name,
        page_code,
        page_url,
        icon_name,
        description,
        created_by,
        created_session_id
      )
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING page_id,page_name,page_code,page_url`,
      [
        page_name,
        page_code,
        page_url,
        icon_name,
        description,
        req.user.user_id,
        req.user.session_id,
      ],
    );

    return success(
      res,
      "Page Created",
      "Web page created successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Creation Failed", err.message);
  }
};

exports.getPagePermissions = async (req, res) => {
  try {
    const permissions = await pool.query(`
      SELECT
        pp.page_permission_id,
        wp.page_name,
        wp.page_code,
        ut.type_name,
        pp.permission_scope,
        pp.is_view,
        pp.is_add,
        pp.is_update,
        pp.is_delete,
        pp.is_download,
        pp.is_active
      FROM tbl_page_permissions pp
      JOIN tbl_web_pages wp
        ON wp.page_id = pp.page_id
      LEFT JOIN tbl_user_types ut
        ON ut.user_type_id = pp.user_type_id
      ORDER BY wp.page_name
    `);

    return success(
      res,
      "Permissions List",
      "Permissions fetched successfully",
      permissions.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.createPagePermission = async (req, res) => {
  try {
    const {
      page_id,
      user_type_id,
      user_id,
      permission_scope,
      is_view,
      is_add,
      is_update,
      is_delete,
      is_download,
    } = req.body;

    const exists = await pool.query(
      `SELECT 1
       FROM tbl_page_permissions
       WHERE page_id=$1
       AND user_type_id=$2`,
      [page_id, user_type_id],
    );

    if (exists.rows.length) {
      return error(res, "Duplicate Permission", "Permission already exists");
    }

    const result = await pool.query(
      `INSERT INTO tbl_page_permissions
      (
        page_id,
        user_type_id,
        user_id,
        permission_scope,
        is_view,
        is_add,
        is_update,
        is_delete,
        is_download,
        created_by,
        created_session_id
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING page_permission_id`,
      [
        page_id,
        user_type_id,
        user_id,
        permission_scope,
        is_view,
        is_add,
        is_update,
        is_delete,
        is_download,
        req.user.user_id,
        req.user.session_id,
      ],
    );

    return success(
      res,
      "Permission Created",
      "Page permission created successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Creation Failed", err.message);
  }
};

exports.updatePagePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const { is_view, is_add, is_update, is_delete, is_download, is_active } =
      req.body;

    const result = await pool.query(
      `UPDATE tbl_page_permissions
       SET
        is_view = COALESCE($1,is_view),
        is_add = COALESCE($2,is_add),
        is_update = COALESCE($3,is_update),
        is_delete = COALESCE($4,is_delete),
        is_download = COALESCE($5,is_download),
        is_active = COALESCE($6,is_active),
        updated_by=$7,
        updated_session_id=$8,
        updated_date=NOW()
       WHERE page_permission_id=$9`,
      [
        is_view,
        is_add,
        is_update,
        is_delete,
        is_download,
        is_active,
        req.user.user_id,
        req.user.session_id,
        id,
      ],
    );

    if (!result.rowCount) {
      return error(res, "Update Failed", "Permission not found");
    }

    return success(
      res,
      "Permission Updated",
      "Permission updated successfully",
    );
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.deletePagePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tbl_page_permissions
       WHERE page_permission_id=$1`,
      [id],
    );

    if (!result.rowCount) {
      return error(res, "Delete Failed", "Permission not found");
    }

    return success(
      res,
      "Permission Deleted",
      "Permission deleted successfully",
    );
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};
