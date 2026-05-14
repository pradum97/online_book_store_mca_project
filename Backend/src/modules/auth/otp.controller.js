const pool = require("../../config/db");

const { success, error } = require("../../utils/response");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/sendMail");

const { otpTemplate } = require("../../templates/mailTemplates");

exports.generateOtp = async (req, res) => {
  try {
    const { send_to, source, otp_type } = req.body;

    const checkUser = source === "FORGOT_PASSWORD";

    const result = await pool.query(
      `SELECT auth_GenerateOtp_prc(
        $1,$2,$3,$4,$5,$6
      ) AS response`,

      [send_to, source, otp_type, null, req.session_id, checkUser],
    );

    const response = result.rows[0].response;

    if (response.action === "success") {
      const otp = response.data.otp;

      await sendEmail(
        send_to,

        "BookStore OTP Verification",

        otpTemplate(otp),
      );

      delete response.data.otp;
    }

    res.json(response);
  } catch (err) {
    return error(res, "OTP Error", err.message);
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { reference_no } = req.body;

    const result = await pool.query(
      `SELECT auth_ResendOtp_prc(
        $1,$2,$3
      ) AS response`,

      [reference_no, null, req.session_id],
    );

    const response = result.rows[0].response;

    if (response.action === "success") {
      const otp = response.data.otp;

      const send_to = response.data.send_to;

      await sendEmail(
        send_to,

        "BookStore OTP Verification",

        otpTemplate(otp),
      );

      delete response.data.otp;
      delete response.data.send_to;
    }

    res.json(response);
  } catch (err) {
    return error(res, "OTP Resend Error", err.message);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    console.log("OTP CONTROLLLER-", process.env.RESET_TOKEN_SECRET);

    const { reference_no, otp } = req.body;

    const result = await pool.query(
      `SELECT auth_VerifyOtp_prc($1,$2,$3,$4) AS response`,
      [reference_no, otp, null, req.session_id],
    );

    const response = result.rows[0].response;

    if (response.action === "success") {
      const source = response.data?.source;

      if (source === "FORGOT_PASSWORD") {
        const resetToken = jwt.sign(
          {
            reference_no,
            purpose: "RESET_PASSWORD",
          },
          process.env.RESET_TOKEN_SECRET,
          { expiresIn: "5m" },
        );

        response.data.reset_token = resetToken;
      }
    }

    res.json(response);
  } catch (err) {
    return error(res, "OTP Verification Error", err.message);
  }
};
