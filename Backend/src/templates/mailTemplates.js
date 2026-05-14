exports.otpTemplate = (otp) => {
  return `
  <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:8px;">
    
    <div style="max-width:500px; margin:auto; background:#ffffff; padding:10px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

      <h2 style="text-align:center; color:#333;">
        📚 Book Store Verification
      </h2>

      <p style="font-size:15px; color:#555;">
        Hello,
      </p>

      <p style="font-size:15px; color:#555;">
        Use the following One-Time Password (OTP) to complete your verification.
      </p>

      <div style="text-align:center; margin:25px 0;">
        <span style="font-size:28px; letter-spacing:5px; font-weight:bold; color:#2c3e50; background:#f1f3f5; padding:12px 25px; border-radius:6px;">
          ${otp}
        </span>
      </div>

      <p style="font-size:14px; color:#777;">
        ⏳ This OTP will expire in <strong>5 minutes</strong>.
      </p>

      <p style="font-size:14px; color:#777;">
        If you did not request this OTP, please ignore this email.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:25px 0;" />

      <p style="font-size:12px; color:#999; text-align:center;">
        © ${new Date().getFullYear()} Book Store. All rights reserved.
      </p>

    </div>

  </div>
  `;
};
