const nodemailer = require("nodemailer");
const pool = require("../config/db");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendEmail = async (
  to,
  subject,
  html,
  referenceId = null,
  source = "general",
) => {
  try {
    const info = await transporter.sendMail({
      from: `"BookStore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    await pool.query(
      `INSERT INTO tbl_email_logs
   (mail_type,sender_email,recipient_email,subject,body,status,sent_at,reference_id,source)
   VALUES($1,$2,$3,$4,$5,$6,NOW(),$7,$8)`,
      [
        "OTP",
        process.env.EMAIL_USER,
        to,
        subject,
        html,
        "SUCCESS",
        referenceId,
        source,
      ],
    );

    return true;
  } catch (err) {
    await pool.query(
      `INSERT INTO tbl_email_logs
   (mail_type,sender_email,recipient_email,subject,status,error_message)
   VALUES($1,$2,$3,$4,$5,$6)`,
      ["OTP", process.env.EMAIL_USER, to, subject, "FAILED", err.message],
    );

    return false;
  }
};
