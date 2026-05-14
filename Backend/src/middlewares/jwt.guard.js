const jwt = require("jsonwebtoken");
const { error } = require("../utils/response");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return error(res, "Unauthorized", "Access token missing");

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return error(res, "Unauthorized", "Invalid token");
  }
};
