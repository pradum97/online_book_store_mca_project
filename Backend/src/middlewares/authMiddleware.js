const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    let token;
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }
    if (!token) {
      return res.status(401).json({
        action: "error",
        data: null,
        title: "Unauthorized",
        message: "No token provided",
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        action: "error",
        data: null,
        title: "Unauthorized",
        message: "Invalid or expired token",
      });
    }

    const session = await pool.query(
      `SELECT status 
       FROM tbl_sessions 
       WHERE session_id=$1 AND user_id=$2`,
      [decoded.session_id, decoded.user_id],
    );

    if (!session.rows.length) {
      return res.status(401).json({
        action: "error",
        data: null,
        title: "Unauthorized",
        message: "Session not found",
      });
    }

    if (session.rows[0].status !== "ACTIVE") {
      return res.status(401).json({
        action: "error",
        data: null,
        title: "Session Expired",
        message: "Your session is no longer active. Please login again.",
      });
    }

    req.user = decoded;
    req.session_id = decoded.session_id;

    next();
  } catch (err) {
    return res.status(500).json({
      action: "error",
      data: null,
      title: "Authorization Error",
      message: err.message,
    });
  }
};
