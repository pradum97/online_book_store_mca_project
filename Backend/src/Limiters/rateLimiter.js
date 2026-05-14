const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    action: "error",
    title: "Too Many Requests",
    message: "Rate limit exceeded",
    data: null,
  },
});
