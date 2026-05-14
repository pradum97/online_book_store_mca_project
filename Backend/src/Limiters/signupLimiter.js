const rateLimit = require("express-rate-limit");

const signupLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
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
      title: `Too Many Signup Attempts. Please try again after ${retryAfter} seconds.`,
      message: `Too many signup attempts. Please try again after ${retryAfter} seconds.`,
    });
  },
});

module.exports = signupLimiter;
