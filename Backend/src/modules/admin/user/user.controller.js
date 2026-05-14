const pool = require("../../../config/db");
const { success, error } = require("../../../utils/response");

exports.getUsers = async (req, res) => {
  try {
    const users = await pool.query(
      `SELECT 
        user_id,
        username,
        first_name,
        middle_name,
        last_name,
        gender,
        dob,
        email,
        mobile,
        status,
        is_active,
        created_date,
        full_name
       FROM tbl_users
       ORDER BY created_date DESC`,
    );

    return success(res, "Users List", "Users fetched successfully", users.rows);
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query(
      `SELECT 
        user_id,
        username,
        first_name,
        middle_name,
        last_name,
        dob,
        gender,
        mobile,
        email,
        status,
        is_active,
        created_date
       FROM tbl_users
       WHERE user_id=$1`,
      [id],
    );

    if (!user.rows.length) {
      return error(res, "User Not Found", "User does not exist");
    }

    return success(
      res,
      "User Details",
      "User fetched successfully",
      user.rows[0],
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { first_name, middle_name, last_name, mobile, dob, gender } =
      req.body;

    const update = await pool.query(
      `UPDATE tbl_users
       SET first_name = COALESCE($1,first_name),
           middle_name = COALESCE($2,middle_name),
           last_name = COALESCE($3,last_name),
           mobile = COALESCE($4,mobile),
           dob = COALESCE($5,dob),
           gender = COALESCE($6,gender),
           updated_date = NOW()
       WHERE user_id=$7`,
      [first_name, middle_name, last_name, mobile, dob, gender, id],
    );

    if (!update.rowCount) {
      return error(res, "Update Failed", "User not found");
    }

    return success(
      res,
      "User Updated",
      "User information updated successfully",
    );
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["ACTIVE", "SUSPENDED", "BLOCKED"];

    if (!allowedStatus.includes(status)) {
      return error(
        res,
        "Invalid Status",
        "Status must be ACTIVE, SUSPENDED or BLOCKED",
      );
    }

    const result = await pool.query(
      `UPDATE tbl_users
   SET status=$1::varchar,
       is_active = CASE
                    WHEN $1::varchar='ACTIVE' THEN true
                    ELSE false
                  END,
       updated_date = NOW()
   WHERE user_id=$2::uuid`,
      [status, id],
    );

    if (!result.rowCount) {
      return error(res, "Update Failed", "User not found");
    }

    if (status !== "ACTIVE") {
      await pool.query(
        `UPDATE tbl_sessions
         SET status='EXPIRED'
         WHERE user_id=$1`,
        [id],
      );
    }

    return success(
      res,
      "User Status Updated",
      "User status updated successfully",
    );
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.getUserStatus = async (req, res) => {
  const user_id = req.user?.user_id;

  try {
    const query = `
      SELECT status 
      FROM tbl_users
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [user_id]);
    const userStatus = result?.rows[0]?.status;

    let status_name = "";
    let message = "";

    switch (userStatus) {
      case "ACTIVE":
        status_name = "Active";
        message = "Your account is active";
        break;

      case "SUSPENDED":
        status_name = "Suspended";
        message =
          "Your account is temporarily suspended. Please contact administrator";
        break;

      case "BLOCKED":
        status_name = "Blocked";
        message = "Your account has been blocked due to policy violation";
        break;

      default:
        status_name = "Unknown";
        message = "Invalid account status";
        break;
    }

    return res.json({
      action: "success",
      data: {
        user_status_code: userStatus ?? "",
        status_name,
        message,
      },
      title: "User Status",
      message: "User status fetched successfully",
    });
  } catch (error) {
    return res.json({
      action: "error",
      data: {},
      title: "Error",
      message: error.message || "Unknown error",
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { first_name, middle_name, last_name, mobile, dob, gender } =
      req.body;

    const update = await pool.query(
      `UPDATE tbl_users
       SET first_name = COALESCE($1, first_name),
           middle_name = COALESCE($2, middle_name),
           last_name = COALESCE($3, last_name),
           mobile = COALESCE($4, mobile),
           dob = COALESCE($5, dob),
           gender = COALESCE($6, gender),
           updated_date = NOW()
       WHERE user_id = $7`,
      [first_name, middle_name, last_name, mobile, dob, gender, user_id],
    );

    return success(
      res,
      "Profile Updated",
      "Your profile has been updated successfully",
    );
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.getMyAddresses = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const result = await pool.query(
      `SELECT *
       FROM tbl_user_addresses
       WHERE user_id = $1
       ORDER BY created_date DESC`,
      [user_id],
    );

    return success(
      res,
      "Address List",
      "Addresses fetched successfully",
      result.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const {
      full_name,
      mobile,
      address_line1,
      address_line2,
      city,
      state,
      country,
      postal_code,
      is_default,
    } = req.body;

    if (is_default) {
      await pool.query(
        `UPDATE tbl_user_addresses
         SET is_default = false
         WHERE user_id = $1`,
        [user_id],
      );
    }

    const result = await pool.query(
      `INSERT INTO tbl_user_addresses (
        user_id, full_name, mobile, address_line1, address_line2,
        city, state, country, postal_code, is_default
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        user_id,
        full_name,
        mobile,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
        is_default || false,
      ],
    );

    return success(
      res,
      "Address Added",
      "Address added successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Insert Failed", err.message);
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const {
      full_name,
      mobile,
      address_line1,
      address_line2,
      city,
      state,
      country,
      postal_code,
      is_default,
    } = req.body;

    if (is_default) {
      await pool.query(
        `UPDATE tbl_user_addresses
         SET is_default = false
         WHERE user_id = $1`,
        [user_id],
      );
    }

    const result = await pool.query(
      `UPDATE tbl_user_addresses
       SET full_name = COALESCE($1, full_name),
           mobile = COALESCE($2, mobile),
           address_line1 = COALESCE($3, address_line1),
           address_line2 = COALESCE($4, address_line2),
           city = COALESCE($5, city),
           state = COALESCE($6, state),
           country = COALESCE($7, country),
           postal_code = COALESCE($8, postal_code),
           is_default = COALESCE($9, is_default)
       WHERE address_id = $10 AND user_id = $11
       RETURNING *`,
      [
        full_name,
        mobile,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
        is_default,
        id,
        user_id,
      ],
    );

    if (!result.rowCount) {
      return error(res, "Update Failed", "Address not found");
    }

    return success(
      res,
      "Address Updated",
      "Address updated successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    await pool.query(
      `UPDATE tbl_user_addresses
       SET is_default = false
       WHERE user_id = $1`,
      [user_id],
    );

    const result = await pool.query(
      `UPDATE tbl_user_addresses
       SET is_default = true
       WHERE address_id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id],
    );

    if (!result.rowCount) {
      return error(res, "Update Failed", "Address not found");
    }

    return success(
      res,
      "Default Updated",
      "Default address updated successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM tbl_user_addresses
       WHERE address_id = $1 AND user_id = $2`,
      [id, user_id],
    );

    if (!result.rowCount) {
      return error(res, "Delete Failed", "Address not found");
    }

    return success(res, "Address Deleted", "Address deleted successfully");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};
