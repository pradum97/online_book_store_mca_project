const rateLimit = require("express-rate-limit");

const createLimiter = (max, messageText) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      const retryAfter =
        Math.ceil(req.rateLimit.resetTime.getTime() - Date.now()) / 1000;

      const seconds = Math.ceil(retryAfter);

      return res.json({
        action: "error",
        data: null,
        title: `Please wait ${seconds} seconds`,
        message: `${messageText}. Try again in ${seconds} seconds.`,
      });
    },
  });

exports.sendOtpLimiter = createLimiter(
  2,
  "You can request only 2 OTP per minute",
);

exports.resendOtpLimiter = createLimiter(
  2,
  "You can resend OTP only 2 times per minute",
);

exports.verifyOtpLimiter = createLimiter(
  5,
  "Too many OTP verification attempts",
);
