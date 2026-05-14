"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  CircularProgress,
  Fade,
  SxProps,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import TextFieldRFH from "@lib/TextFieldRFH";
import { toast } from "react-toastify";
import ButtonRFH from "@lib/ButtonRFH";

import {
  SendOtpEP,
  ResendOtpEP,
  VerifyOtpEP,
  ResetPasswordEP,
} from "@webEndPoints/handlers/authWEB/authWEB";

const STEPS = ["Verify Identity", "Enter OTP", "Reset Password"];

const buttonSx: SxProps = {
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
  mt: 0.5,
  "&:hover": { background: "#333", color: "white" },
  "&.Mui-disabled": { background: "#e0e0e0", color: "#aaa" },
};

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}
interface IDefaultValue {
  email: string;
  confirm_password: string;
  new_password: string;
}
const defValue: IDefaultValue = {
  email: "",
  confirm_password: "",
  new_password: "",
};

export default function ForgotPasswordModal({
  open,
  onClose,
}: ForgotPasswordModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [referenceNo, setReferenceNo] = useState("");
  const [resetToken, setResetToken] = useState("");

  const methods = useForm<IDefaultValue>({ defaultValues: defValue });
  const { reset, watch, handleSubmit } = methods;
  const email = watch("email");
  const password = watch("new_password");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setActiveStep(0);
      reset({ ...defValue });
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setDone(false);
      setReferenceNo("");
      setResetToken("");
    }, 300);
  };

  const handleFormSubmit = async () => {
    await handleSubmit(
      async () => {
        if (activeStep === 0) await handleSendOtp();
        if (activeStep === 1) await handleVerifyOtp();
        if (activeStep === 2) await handleResetPassword();
      },
      (errors: FieldErrors<IDefaultValue>) => {
        const firstKey = Object.keys(errors)[0] as keyof IDefaultValue;
        const message = errors[firstKey]?.message;
        if (message) toast.error(message as string);
      },
    )();
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res: any = await SendOtpEP({
        send_to: email,
        source: "FORGOT_PASSWORD",
        otp_type: "EMAIL",
      });
      const data = res?.data ?? res;
      if (res?.action === "success") {
        setReferenceNo(data?.reference_no);
        toast.success("OTP sent successfully");
        setActiveStep(1);
      } else {
        toast.error(data?.message ?? "Failed to send OTP");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOtp = async () => {
    const filled = otp.join("");
    if (filled.length < 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }
    setOtpError("");
    setLoading(true);
    try {
      const res: any = await VerifyOtpEP({
        reference_no: referenceNo,
        otp: filled,
      });
      const data = res?.data ?? res;
      if (res?.action === "success") {
        const token = data?.reset_token;
        if (!token) {
          toast.error("Verification succeeded but no reset token received.");
          return;
        }
        setResetToken(token);
        toast.success("OTP verified successfully");
        setActiveStep(2);
      } else {
        toast.error(data?.message ?? "Invalid OTP. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setLoading(true);
    try {
      const res: any = await ResendOtpEP({ reference_no: referenceNo });
      const data = res?.data ?? res;
      if (res?.action === "success") {
        setReferenceNo(data?.reference_no);
        toast.success("OTP resent successfully");
      } else {
        toast.error(data?.message ?? "Failed to resend OTP");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken) {
      toast.error("Session expired. Please start again.");
      handleClose();
      return;
    }
    setLoading(true);
    try {
      const res: any = await ResetPasswordEP({
        reset_token: resetToken,
        new_password: password,
      });
      const data = res?.data ?? res;
      if (res?.action === "success") {
        setDone(true);
      } else {
        toast.error(data?.message ?? "Failed to reset password");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      background: "#f7f7f7",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14,
      "& fieldset": { borderColor: "#e2e2e2" },
      "&:hover fieldset": { borderColor: "#aaa" },
      "&.Mui-focused fieldset": {
        borderColor: "#333",
        boxShadow: "0 0 0 3px rgba(0,0,0,0.06)",
      },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      color: "#999",
      "&.Mui-focused": { color: "#333" },
    },
  };

  return (
    <FormProvider {...methods}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: "18px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.14)",
            border: "1px solid #ececec",
            overflow: "hidden",
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      >
        <Box
          sx={{
            px: 3.5,
            pt: 3.5,
            pb: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 18,
                color: "#111",
                lineHeight: 1.2,
              }}
            >
              Forgot Password
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#aaa",
                fontFamily: "'DM Sans', sans-serif",
                mt: 0.4,
              }}
            >
              {activeStep === 0 && "We'll send an OTP to verify your identity"}
              {activeStep === 1 && `OTP sent to ${email}`}
              {activeStep === 2 && "Set your new password below"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: "#bbb",
              mt: -0.5,
              "&:hover": { color: "#333", background: "#f5f5f5" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3.5, pt: 2.5, pb: 3.5 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 3,
              "& .MuiStepLabel-label": {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px !important",
                color: "#bbb",
                mt: "4px !important",
                "&.Mui-active": { color: "#111", fontWeight: 600 },
                "&.Mui-completed": { color: "#888" },
              },
              "& .MuiStepIcon-root": {
                color: "#e0e0e0",
                fontSize: 22,
                "&.Mui-active": { color: "#111" },
                "&.Mui-completed": { color: "#555" },
              },
              "& .MuiStepConnector-line": { borderColor: "#e8e8e8" },
              "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
                borderColor: "#333",
              },
              "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
                borderColor: "#555",
              },
            }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {done ? (
            <Box
              sx={{
                textAlign: "center",
                py: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 52, color: "#4caf50" }} />
              <Typography
                sx={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                Password Reset!
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#999",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Password updated. All existing sessions have been logged out for
                security.
              </Typography>
              <ButtonRFH
                fullWidth
                onClick={handleClose}
                sx={buttonSx}
                variant="contained"
              >
                Back to Login
              </ButtonRFH>
            </Box>
          ) : (
            <>
              {activeStep === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextFieldRFH
                    fullWidth
                    label="Username or Email"
                    name="email"
                    rules={{
                      required: "Email or username is required",
                      minLength: {
                        value: 4,
                        message: "Minimum 4 characters required",
                      },
                      validate: (value: string) => {
                        if (
                          value.includes("@") &&
                          !/^\S+@\S+\.\S+$/.test(value)
                        )
                          return "Enter a valid email address";
                        return true;
                      },
                    }}
                    startAdornment={
                      <EmailOutlinedIcon sx={{ fontSize: 18, color: "#bbb" }} />
                    }
                    sx={inputSx}
                  />
                  <ButtonRFH
                    variant="outlined"
                    disabled={loading}
                    onClick={handleFormSubmit}
                    sx={buttonSx}
                  >
                    {loading ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : (
                      "Send OTP"
                    )}
                  </ButtonRFH>
                </Box>
              )}

              {activeStep === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, i) => (
                      <Box
                        key={i}
                        component="input"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        ref={(el: HTMLInputElement | null) => {
                          otpRefs.current[i] = el;
                        }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOtpChange(i, e.target.value)
                        }
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          handleOtpKeyDown(i, e)
                        }
                        sx={{
                          width: { xs: 40, sm: 46 },
                          height: { xs: 48, sm: 54 },
                          textAlign: "center",
                          fontSize: 22,
                          fontWeight: 700,
                          fontFamily: "'DM Sans', sans-serif",
                          color: "#111",
                          background: digit ? "#f0f0f0" : "#f7f7f7",
                          border: digit
                            ? "1.5px solid #333"
                            : "1.5px solid #e2e2e2",
                          borderRadius: "10px",
                          outline: "none",
                          transition: "border-color 0.2s, background 0.2s",
                          caretColor: "#111",
                          "&:focus": {
                            borderColor: "#111",
                            background: "#fff",
                            boxShadow: "0 0 0 3px rgba(0,0,0,0.06)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                  {otpError && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#d32f2f",
                        textAlign: "center",
                        fontFamily: "'DM Sans', sans-serif",
                        mt: -0.5,
                      }}
                    >
                      {otpError}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#aaa",
                      textAlign: "center",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Didn't receive it?{" "}
                    <Box
                      component="span"
                      onClick={handleResendOtp}
                      sx={{
                        color: "#555",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                        "&:hover": { color: "#111" },
                        pointerEvents: loading ? "none" : "auto",
                        opacity: loading ? 0.5 : 1,
                      }}
                    >
                      Resend OTP
                    </Box>
                  </Typography>
                  <ButtonRFH
                    onClick={handleFormSubmit}
                    fullWidth
                    disabled={loading}
                    variant="outlined"
                    sx={buttonSx}
                  >
                    {loading ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : (
                      "Verify OTP"
                    )}
                  </ButtonRFH>
                </Box>
              )}

              {activeStep === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextFieldRFH
                    fullWidth
                    label="New Password"
                    name="new_password"
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters required",
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                        message:
                          "Must include uppercase, lowercase, number & special character",
                      },
                    }}
                    type={showPassword ? "text" : "password"}
                    startAdornment={
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ fontSize: 18, color: "#bbb" }}
                        />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: "#bbb" }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={inputSx}
                  />
                  <TextFieldRFH
                    fullWidth
                    label="Confirm Password"
                    name="confirm_password"
                    rules={{
                      required: "Confirm password is required",
                      validate: (value: string) =>
                        value === methods.getValues("new_password") ||
                        "Passwords do not match",
                    }}
                    type={showConfirm ? "text" : "password"}
                    startAdornment={
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ fontSize: 18, color: "#bbb" }}
                        />
                      </InputAdornment>
                    }
                    endAdornment={
                      <IconButton
                        size="small"
                        onClick={() => setShowConfirm(!showConfirm)}
                        edge="end"
                        sx={{ color: "#bbb" }}
                      >
                        {showConfirm ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    }
                    sx={inputSx}
                  />
                  <ButtonRFH
                    onClick={handleFormSubmit}
                    disabled={loading}
                    variant="outlined"
                    sx={buttonSx}
                  >
                    {loading ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : (
                      "Reset Password"
                    )}
                  </ButtonRFH>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
