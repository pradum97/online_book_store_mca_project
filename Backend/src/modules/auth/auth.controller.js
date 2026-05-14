const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../config/db");
const { success, error } = require("../../utils/response");
const { hashToken } = require("../../utils/tokenSecurity");
const { v4: uuidv4 } = require("uuid");
const { encryptToken, decryptToken } = require("../../utils/cryptoToken");
const { hashPassword } = require("../../utils/encryption.util");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/jwt");

exports.signup = async (req, res) => {
  const body = req.body;
  try {
    const {
      user_id,
      username,
      first_name,
      middle_name,
      last_name,
      dob,
      gender,
      mobile,
      email,
      password,
    } = body;

    const usernameCheck = await pool.query(
      "SELECT 1 FROM tbl_users WHERE username = $1 LIMIT 1",
      [username],
    );

    if (usernameCheck.rowCount > 0) {
      return res.json({
        action: "error",
        data: null,
        title: "Username Exists",
        message: "Username already taken",
      });
    }

    const emailCheck = await pool.query(
      "SELECT 1 FROM tbl_users WHERE email = $1 LIMIT 1",
      [email],
    );

    if (emailCheck.rowCount > 0) {
      return res.json({
        action: "error",
        data: null,
        title: "Email Exists",
        message: "Email already registered",
      });
    }

    const HashedPass = await hashPassword(password ?? "");

    const payload = {
      user_id,
      username,
      first_name,
      middle_name,
      last_name,
      dob,
      gender,
      mobile,
      email,
      password: HashedPass,
    };

    const result = await pool.query("CALL auth_signup_prc($1,$2,$3,$4)", [
      JSON.stringify(payload),
      req.user?.user_id || null,
      req.session_id || null,
      null,
    ]);

    const response = result.rows?.[0]?.result || null;
    res.json(response);
  } catch (err) {
    res.json({
      action: "error",
      data: null,
      title: "Signup Error",
      message: err.message,
    });
  }
};

exports.checkUserAvailability = async (req, res) => {
  try {
    let { username, email } = req.body;

    username = username?.trim().toLowerCase() || null;
    email = email?.trim().toLowerCase() || null;

    if (!username && !email) {
      return res.json({
        action: "error",
        data: null,
        title: "Validation Error",
        message: "Username or Email is required",
      });
    }

    const result = await pool.query(
      `
      SELECT 
        CASE 
          WHEN $1::text IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM tbl_users WHERE LOWER(username) = $1)
          ELSE false 
        END AS username_exists,

        CASE 
          WHEN $2::text IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM tbl_users WHERE LOWER(email) = $2)
          ELSE false 
        END AS email_exists
      `,
      [username, email],
    );

    const { username_exists, email_exists } = result.rows[0];

    return res.json({
      action: "success",
      data: {
        username_exists,
        email_exists,
      },
      title: "Check Completed",
      message:
        username_exists || email_exists
          ? "Some fields are already taken"
          : "Username and Email are available",
    });
  } catch (err) {
    return res.json({
      action: "error",
      data: null,
      title: "Check Failed",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
      return error(
        res,
        "Login Failed",
        "Username or email and password are required",
      );
    }

    const passwordValue = password.trim();

    if (!passwordValue.length) {
      return error(res, "Login Failed", "Password cannot be empty");
    }

    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const loginValue = username_or_email.trim().toLowerCase();

    const user = await pool.query(
      `SELECT user_id, 
      username, email, 
      password,
      user_type_code,
      first_name,
      middle_name,
      last_name,
      dob,
      gender,
      mobile,
      status,
      is_active,
      created_date,
      full_name
   FROM tbl_users
   WHERE LOWER(email)=$1 OR LOWER(username)=$1`,
      [loginValue],
    );

    if (!user.rows.length) {
      return error(
        res,
        "Invalid username/email or password",
        "Invalid credentials",
      );
    }

    const userData = user.rows[0];

    if (userData.status !== "ACTIVE") {
      if (userData.status === "SUSPENDED") {
        return error(
          res,
          "Account Suspended",
          "Your account is temporarily suspended. Please contact administrator",
        );
      }

      if (userData.status === "BLOCKED") {
        return error(
          res,
          "Account Blocked",
          "Your account has been blocked due to policy violation",
        );
      }

      return error(
        res,
        "Your account is not allowed to login",
        "Your account is not allowed to login",
      );
    }

    const match = await bcrypt.compare(passwordValue, userData.password);

    if (!match) {
      return error(
        res,
        "Invalid username/email or password",
        "Invalid credentials",
      );
    }

    const session_id = uuidv4();

    const accessToken = generateAccessToken({
      user_id: userData.user_id,
      session_id,
    });

    const refreshToken = generateRefreshToken({
      user_id: userData.user_id,
      session_id,
    });

    const encryptedRefresh = encryptToken(refreshToken);

    await pool.query(
      `INSERT INTO tbl_sessions
       (session_id,user_id,status,ip_address,user_agent)
       VALUES($1,$2,'ACTIVE',$3,$4)`,
      [session_id, userData.user_id, ip, userAgent],
    );

    await pool.query(
      `INSERT INTO tbl_refresh_tokens(session_id,token_hash)
       VALUES($1,$2)`,
      [session_id, encryptedRefresh],
    );
    delete userData?.password;

    return success(res, "Login Successful", "User logged in successfully", {
      ...userData,
      token: accessToken,
      session_id: session_id,
    });
  } catch (err) {
    return error(res, "Login Error", err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const { session_id } = req.user;

    await pool.query(
      `UPDATE tbl_sessions
   SET status='LOGGED_OUT'
   WHERE session_id=$1 AND user_id=$2`,
      [session_id, req.user.user_id],
    );

    await pool.query(`DELETE FROM tbl_refresh_tokens WHERE session_id=$1`, [
      session_id,
    ]);

    return success(res, "Logout Successful", "User logged out successfully");
  } catch (err) {
    return error(res, "Logout Failed", err.message);
  }
};

exports.me = async (req, res) => {
  try {
    const { user_id } = req.user;

    const minimal = req.query.minimal === "true";

    const selectFields = minimal
      ? `user_id, username, user_type_code`
      : `user_id,
         username, 
         email, 
         user_type_code,
         first_name,
         middle_name,
         last_name,
         dob,
         gender,
         mobile,
         status,
         is_active,
         created_date,
         full_name`;

    const user = await pool.query(
      `SELECT ${selectFields} FROM tbl_users WHERE user_id=$1`,
      [user_id],
    );

    if (!user.rows.length) {
      return error(res, "User Not Found", "User account no longer exists");
    }
    return success(
      res,
      "User Profile",
      "User fetched successfully",
      user.rows[0],
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.sessions = async (req, res) => {
  try {
    const { user_id } = req.user;

    const sessions = await pool.query(
      `SELECT
   session_id,
   status,
   ip_address,
   user_agent,
   created_date
   FROM tbl_sessions
   WHERE user_id=$1 AND status = 'ACTIVE'
   ORDER BY created_date DESC`,
      [user_id],
    );

    return success(
      res,
      "Sessions List",
      "User sessions fetched successfully",
      sessions.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(
      `UPDATE tbl_sessions
   SET status='LOGGED_OUT'
   WHERE session_id=$1 AND user_id=$2`,
      [sessionId, req.user.user_id],
    );

    if (!result.rowCount) {
      return error(res, "Session Not Found", "Session does not exist");
    }

    await pool.query(`DELETE FROM tbl_refresh_tokens WHERE session_id=$1`, [
      sessionId,
    ]);

    return success(res, "Session Removed", "Session deleted successfully");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return error(res, "Refresh Failed", "Session id missing");
    }

    const session = await pool.query(
      `SELECT user_id,status
       FROM tbl_sessions
       WHERE session_id=$1`,
      [session_id],
    );

    if (!session.rows.length) {
      return error(res, "Refresh Failed", "Session not found");
    }

    if (session.rows[0].status !== "ACTIVE") {
      return error(res, "Refresh Failed", "Session expired");
    }

    const token = await pool.query(
      `SELECT token_hash,expires_at,is_used
       FROM tbl_refresh_tokens
       WHERE session_id=$1
       ORDER BY created_date DESC
       LIMIT 1`,
      [session_id],
    );

    if (!token.rows.length) {
      return error(res, "Refresh Failed", "Refresh token not found");
    }

    const tokenRes = token.rows[0];

    const refreshToken = decryptToken(tokenRes.token_hash);

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      await pool.query(
        `UPDATE tbl_sessions
         SET status='EXPIRED'
         WHERE session_id=$1 `,
        [session_id],
      );

      return error(
        res,
        "Session Expired",
        "Refresh token expired. Please login again.",
      );
    }

    if (tokenRes.is_used) {
      await pool.query(
        `UPDATE tbl_sessions
         SET status='EXPIRED'
         WHERE session_id=$1`,
        [session_id],
      );

      await pool.query(
        `DELETE FROM tbl_refresh_tokens
         WHERE session_id=$1`,
        [session_id],
      );

      return error(
        res,
        "Security Alert",
        "Refresh token already used. Session revoked.",
      );
    }

    await pool.query(
      `UPDATE tbl_refresh_tokens
       SET is_used=true
       WHERE session_id=$1 AND is_used=false`,
      [session_id],
    );

    const newAccessToken = generateAccessToken({
      user_id: session.rows[0].user_id,
      session_id,
    });

    const newRefreshToken = generateRefreshToken({
      user_id: session.rows[0].user_id,
      session_id,
    });

    const encryptedRefresh = encryptToken(newRefreshToken);

    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO tbl_refresh_tokens
       (session_id,token_hash,expires_at,is_used)
       VALUES($1,$2,$3,false)`,
      [session_id, encryptedRefresh, expiry],
    );

    return success(res, "Token Refreshed", "New access token generated", {
      access_token: newAccessToken,
    });
  } catch (err) {
    return error(res, "Refresh Failed", err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;

    console.log("AUTH CONTROLLLER-", process.env.RESET_TOKEN_SECRET);

    if (!reset_token || !new_password) {
      return error(
        res,
        "Validation Error",
        "reset_token and new_password are required",
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(reset_token, process.env.RESET_TOKEN_SECRET);
    } catch (err) {
      return error(
        res,
        "Invalid Token",
        "Reset token is expired or invalid. Please start again.",
      );
    }

    if (decoded.purpose !== "RESET_PASSWORD") {
      return error(res, "Invalid Token", "Token purpose mismatch");
    }

    const { reference_no } = decoded;

    const otpRow = await pool.query(
      `SELECT 
      o.send_to,
      o.is_verified AS is_used,
      u.user_id
   FROM tbl_otp_details o
   LEFT JOIN tbl_users u
     ON LOWER(u.email) = LOWER(o.send_to)
   WHERE o.reference_no = $1
   LIMIT 1`,
      [reference_no],
    );

    if (!otpRow.rows.length) {
      return error(res, "Invalid Token", "OTP reference not found");
    }

    const { user_id, is_used } = otpRow.rows[0];

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;
    if (!strongPassword.test(new_password)) {
      return error(
        res,
        "Weak Password",
        "Password must include uppercase, lowercase, number & special character",
      );
    }

    const hashedPassword = await hashPassword(new_password);

    const updateResult = await pool.query(
      `UPDATE tbl_users
       SET password = $1
       WHERE user_id = $2`,
      [hashedPassword, user_id],
    );

    if (!updateResult.rowCount) {
      return error(res, "Update Failed", "User not found");
    }

    await pool.query(
      `UPDATE tbl_otp_details
       SET is_verified = true
       WHERE reference_no = $1`,
      [reference_no],
    );

    await pool.query(
      `UPDATE tbl_sessions
       SET status = 'LOGGED_OUT'
       WHERE user_id = $1 AND status = 'ACTIVE'`,
      [user_id],
    );

    await pool.query(
      `DELETE FROM tbl_refresh_tokens
       WHERE session_id IN (
         SELECT session_id FROM tbl_sessions WHERE user_id = $1
       )`,
      [user_id],
    );

    return success(
      res,
      "Password Reset",
      "Password changed successfully. Please login again.",
    );
  } catch (err) {
    return error(res, "Reset Failed", err.message);
  }
};

exports.generateBcryptPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.json({
        action: "error",
        data: null,
        title: "Validation Error",
        message: "Password is required",
      });
    }

    const hashedPassword = await hashPassword(password);

    return res.json({
      action: "success",
      data: {
        password,
        bcrypt_password: hashedPassword,
      },
      title: "Password Generated",
      message: "Bcrypt password generated successfully",
    });
  } catch (err) {
    return res.json({
      action: "error",
      data: null,
      title: "Generation Failed",
      message: err.message,
    });
  }
};
