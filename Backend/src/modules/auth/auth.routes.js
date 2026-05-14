const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/authMiddleware");
const authController = require("./auth.controller");
const otpController = require("./otp.controller");
const otpLimiter = require("../../Limiters/otpLimiter");
const loginLimiter = require("../../Limiters/loginLimiter");
const signupLimiter = require("../../Limiters/signupLimiter");

// OTP
router.post("/otp/send", otpLimiter.sendOtpLimiter, otpController.generateOtp);
router.post(
  "/otp/resend",
  otpLimiter.resendOtpLimiter,
  otpController.resendOtp,
);
router.post(
  "/otp/verify",
  otpLimiter.verifyOtpLimiter,
  otpController.verifyOtp,
);

// Auth
router.post("/signup", signupLimiter, authController.signup);
router.post("/check-availability", authController.checkUserAvailability);

// Login
router.post("/login", loginLimiter, authController.login);
router.post("/refresh-token", authController.refreshToken);

// Protected
router.post("/logout", auth, authController.logout);
router.get("/me", auth, authController.me);
router.get("/sessions", auth, authController.sessions);
router.delete("/sessions/:sessionId", auth, authController.deleteSession);

router.post("/password/reset", authController.resetPassword);

router.post("/generate-bcrypt-password", authController.generateBcryptPassword);

module.exports = router;
