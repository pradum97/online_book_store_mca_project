const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(
      (req.rateLimit.resetTime.getTime() - Date.now()) / 1000,
    );
    return res.status(429).json({
      action: "error",
      data: {
        retry_after_seconds: retryAfter,
      },
      title: `Too Many Login Attempts. Please try again after ${retryAfter} seconds.`,
      message: `Too many login attempts. Please try again after ${retryAfter} seconds.`,
    });
  },
});

module.exports = loginLimiter;
