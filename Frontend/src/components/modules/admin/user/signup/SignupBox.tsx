"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  MenuItem,
  IconButton,
  CircularProgress,
  SxProps,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { FormProvider, useForm } from "react-hook-form";
import TextFieldRFH from "@lib/TextFieldRFH";
import SelectRFH from "@lib/SelectRFH";
import DatePickerRFH from "@lib/DatePickerRFH";
import { useRouter } from "next/navigation";
import ButtonRFH from "@lib/ButtonRFH";
import {
  IGenerateOTPEP,
  IReSendOTPEP,
  IVerifyOTPEP,
} from "@webEndPoints/handlers/otpWEB/IotpWEB";
import {
  GenerateOTPEP,
  ReSendOTPEP,
  VerifyOTPEP,
} from "@webEndPoints/handlers/otpWEB/otpWEB";
import { toast } from "react-toastify";
import { toSqlDate } from "@/utils/CommonUtils";
import {
  CheckUserAvailabilityEP,
  SignupEP,
} from "@webEndPoints/handlers/authWEB/authWEB";

const buttonSx: SxProps = {
  borderRadius: "12x",
  textTransform: "none",
  fontWeight: 700,
  fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: "0.3px",
  background: "linear-gradient(90deg, #4f51c7 0%, #8b5cf6 50%, #a78bfa 100%)",
  backgroundSize: "200% 100%",
  color: "#fff",
  boxShadow: "0 8px 32px rgba(69, 71, 181, 0.45)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundPosition: "100% 0",
    boxShadow: "0 12px 40px rgba(74, 76, 185, 0.6)",
    transform: "translateY(-1px)",
  },
  "&:active": { transform: "translateY(0px)" },
  "&.Mui-disabled": {
    background: "rgba(99,102,241,0.4)",
    color: "rgba(255,255,255,0.6)",
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        color: "blue",
        mt: 0.5,
        mb: 0.5,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </Typography>
  );
}

function SectionCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        p: { xs: 1, md: 1 },
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
        position: "relative",
        mb: 1.5,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "16px",
          right: "16px",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)",
          borderRadius: "999px",
        },
      }}
    >
      <SectionLabel>{label}</SectionLabel>
      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        {children}
      </Grid>
    </Box>
  );
}

type View = "form" | "otp" | "success";

export interface ISignupForm {
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: Date | string | null;
  gender: string;
  mobile: string;
  email: string;
  password: string;
  confirm_password: string;
}

const defaultValues: ISignupForm = {
  username: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  dob: null,
  gender: "",
  mobile: "",
  email: "",
  password: "",
  confirm_password: "",
};

export const OTP_RESEND_DURATION = 10;

// const defaultValues: ISignupForm = {
//   username: "pradum123",
//   first_name: "Pradum",
//   middle_name: "Kumar",
//   last_name: "Patel",
//   dob: new Date("1998-01-01"),
//   gender: "MALE",
//   mobile: "9876543210",
//   email: "pardumraj97@gmail.com",
//   password: "Pradum@123",
//   confirm_password: "Pradum@123",
// };

export default function SignupPage() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [view, setView] = useState<View>("form");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [componentProps, setComponentProps] = React.useState({
    isOtpGenerating: false,
    isOtpVerying: false,
    otp_details_id: 0,
    reference_no: "",
  });
  const [timer, setTimer] = useState(OTP_RESEND_DURATION);
  const [canResend, setCanResend] = useState(false);

  const methods = useForm({
    defaultValues: defaultValues,
  });

  const { getValues, reset, handleSubmit, watch, setValue, setError } = methods;

  React.useEffect(() => {
    if (view === "otp") {
      startTimer();
    }
  }, [view]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setTimer(OTP_RESEND_DURATION);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const goToLogin = () => {
    router.push("/login");
  };

  const onSubmit = (data: ISignupForm) => {
    sendOtp(data);
  };

  const validateUserAvailability = async (
    param: ISignupForm,
  ): Promise<boolean> => {
    try {
      const { email, username } = param;

      const res = await CheckUserAvailabilityEP({
        email,
        username,
      });

      if (res?.action !== "success") {
        toast.error(res?.message || "Validation failed");
        return false;
      }

      const { email_exists, username_exists } = res?.data || {};

      if (email_exists) {
        setError("email", {
          type: "manual",
          message: "Email already registered",
        });
      }

      if (username_exists) {
        setError("username", {
          type: "manual",
          message: "Username already taken",
        });
      }

      if (email_exists || username_exists) {
        let message = "";

        if (email_exists && username_exists) {
          message = "Email and Username both are already taken";
        } else if (email_exists) {
          message = "Email is already registered";
        } else if (username_exists) {
          message = "Username is already taken";
        }

        toast.error(message);
        return false;
      }
      return true;
    } catch {
      toast.error("Validation failed. Try again.");
      return false;
    }
  };

  const sendOtp = async (param: ISignupForm) => {
    try {
      const { email } = param;
      setComponentProps((prev) => ({ ...prev, isOtpGenerating: true }));

      const isValid = await validateUserAvailability(param);

      if (!isValid) {
        return;
      }

      const objRes: IGenerateOTPEP = {
        send_to: email,
        source: "SIGNUP",
        otp_type: "EMAIL",
      };

      const res = await GenerateOTPEP(objRes);

      const action = res?.action;
      const data = res?.data;

      if (action === "success") {
        setComponentProps((prev) => ({
          ...prev,
          otp_details_id: data?.otp_details_id,
          reference_no: data?.reference_no,
        }));
        setView("otp");
        console.log("GenerateOTPEP--", res);
      }
      toast[action as "success"](res?.title);
      console.log("GenerateOTPEP-", res);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setComponentProps((prev) => ({ ...prev, isOtpGenerating: false }));
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setComponentProps((prev) => ({ ...prev, isOtpGenerating: true }));

      const objRes: IReSendOTPEP = {
        reference_no: componentProps?.reference_no,
      };

      const res = await ReSendOTPEP(objRes);
      const action = res?.action;
      const data = res?.data;

      if (action === "success") {
        toast.success("OTP resent successfully");

        setComponentProps((prev) => ({
          ...prev,
          otp_details_id: data?.otp_details_id,
          reference_no: data?.reference_no,
        }));

        startTimer();
      }
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setComponentProps((prev) => ({ ...prev, isOtpGenerating: false }));
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    try {
      setComponentProps((prev) => ({ ...prev, isOtpVerying: true }));

      const payload: IVerifyOTPEP = {
        reference_no: componentProps.reference_no,
        otp: enteredOtp,
      };

      const res = await VerifyOTPEP(payload);

      const action = res?.action;
      const data = res?.data;

      if (action === "success") {
        toast.success(res?.title || "OTP Verified");
        await createUser();
      } else {
        setOtpError(res?.message || "Invalid OTP");
        toast.error(res?.title || "OTP verification failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setComponentProps((prev) => ({ ...prev, isOtpVerying: false }));
    }
  };

  const createUser = async () => {
    const vValue = getValues();
    const req: ISignupForm = {
      ...vValue,
      dob: toSqlDate(vValue?.dob as Date),
    };
    const res = await SignupEP(req);

    const action = res?.action;

    if (action === "success") {
      setView("success");
    }
    toast[action as "success"](res?.title);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
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

  const handleBack = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setView("form");
  };

  const email = methods.getValues("email");

  return (
    <FormProvider {...methods}>
      <Box>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 680,
            borderRadius: "24px",
            p: { xs: 1, md: 3 },
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {view === "form" && (
            <>
              <Box textAlign="center" mb={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                    fontSize: "24px",
                    boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                  }}
                >
                  📚
                </Box>
                <Typography
                  color="primary"
                  sx={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: { xs: 15, md: 21 },
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  Create your account
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.2px",
                  }}
                >
                  Join us to start your reading journey
                </Typography>
              </Box>

              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {/* Personal Information */}
                <SectionCard label="Personal Information">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextFieldRFH
                      name="first_name"
                      label="First Name"
                      rules={{ required: "First name required" }}
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextFieldRFH
                      name="middle_name"
                      label="Middle Name"
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextFieldRFH
                      name="last_name"
                      label="Last Name"
                      rules={{ required: "Last name required" }}
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePickerRFH
                      name="dob"
                      label="Date of Birth"
                      rules={{ required: "DOB required" }}
                      maxDate={new Date()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <SelectRFH
                      name="gender"
                      label="Gender"
                      rules={{ required: "Gender required" }}
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </SelectRFH>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextFieldRFH
                      name="mobile"
                      label="Mobile Number"
                      rules={{
                        required: "Mobile required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter valid 10 digit number",
                        },
                      }}
                    />
                  </Grid>
                </SectionCard>

                {/* Account Details */}
                <SectionCard label="Account Details">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldRFH
                      name="email"
                      label="Email Address"
                      rules={{
                        required: "Email required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldRFH
                      name="username"
                      label="Username"
                      rules={{ required: "Username required" }}
                    />
                  </Grid>
                </SectionCard>

                {/* Security */}
                <SectionCard label="Security">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldRFH
                      name="password"
                      label="Password"
                      type="password"
                      rules={{ required: "Password required" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldRFH
                      name="confirm_password"
                      label="Confirm Password"
                      type="password"
                      rules={{
                        required: "Confirm password required",
                        validate: (val: string) =>
                          val !== methods.getValues("password")
                            ? "Passwords do not match"
                            : true,
                      }}
                    />
                  </Grid>
                </SectionCard>

                {/* Submit */}
                <ButtonRFH
                  type="submit"
                  fullWidth
                  disabled={componentProps.isOtpGenerating}
                  sx={{
                    mt: 2,
                    ...buttonSx,
                  }}
                >
                  {componentProps.isOtpGenerating ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : (
                    "Send OTP →"
                  )}
                </ButtonRFH>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    my: 2.5,
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <Typography sx={{ fontSize: 12 }}>or</Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                </Box>

                <Typography
                  textAlign="center"
                  fontSize={14}
                  sx={{ color: "black", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Already have an account?{" "}
                  <span
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "color 0.2s",
                    }}
                    onClick={goToLogin}
                  >
                    Sign in
                  </span>
                </Typography>
              </form>
            </>
          )}

          {/* ════════════════════════════════════
              VIEW 2 — OTP VERIFICATION
          ════════════════════════════════════ */}
          {view === "otp" && (
            <Box>
              {/* Back button */}
              <IconButton
                onClick={handleBack}
                size="small"
                sx={{
                  color: "rgba(0,0,0,0.4)",
                  mb: 1,
                  "&:hover": { color: "#111", background: "rgba(0,0,0,0.06)" },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>

              {/* Header */}
              <Box textAlign="center" mb={3}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                    fontSize: "24px",
                    boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                  }}
                >
                  📬
                </Box>
                <Typography
                  color="primary"
                  sx={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: { xs: 15, md: 21 },
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  Verify your email
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(0,0,0,0.45)",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  We sent a 6-digit OTP to{" "}
                  <Box
                    component="span"
                    sx={{ color: "#6366f1", fontWeight: 600 }}
                  >
                    {email || "your email"}
                  </Box>
                </Typography>
              </Box>

              {/* OTP boxes */}
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1, sm: 1.5 },
                  justifyContent: "center",
                  mb: 1,
                }}
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
                      width: { xs: 44, sm: 54 },
                      height: { xs: 52, sm: 62 },
                      textAlign: "center",
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#111",
                      background: digit ? "rgba(99,102,241,0.08)" : "#f5f5f8",
                      border: digit
                        ? "1.5px solid #6366f1"
                        : "1.5px solid #e0e0e8",
                      borderRadius: "12px",
                      outline: "none",
                      transition: "border-color 0.2s, background 0.2s",
                      caretColor: "#6366f1",
                      "&:focus": {
                        borderColor: "#6366f1",
                        background: "rgba(99,102,241,0.06)",
                        boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
                      },
                    }}
                  />
                ))}
              </Box>

              {/* OTP error */}
              {/* {otpError && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#f87171",
                    textAlign: "center",
                    mb: 1,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {otpError}
                </Typography>
              )} */}

              {/* Resend */}
              <Typography
                sx={{
                  fontSize: 13,
                  color: "rgba(0,0,0,0.5)",
                  textAlign: "center",
                  mb: 3,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Didn't receive it?{" "}
                {canResend ? (
                  <Box
                    component="span"
                    onClick={
                      !componentProps.isOtpGenerating
                        ? handleResendOtp
                        : undefined
                    }
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      color: componentProps.isOtpGenerating
                        ? "#999"
                        : "#6366f1",
                      fontWeight: 600,
                      cursor: componentProps.isOtpGenerating
                        ? "not-allowed"
                        : "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        textDecoration: componentProps.isOtpGenerating
                          ? "none"
                          : "underline",
                      },
                    }}
                  >
                    {componentProps.isOtpGenerating ? (
                      <span style={{ fontWeight: 600, color: "#6366f1" }}>
                        Sending...
                      </span>
                    ) : (
                      "Resend OTP"
                    )}
                  </Box>
                ) : (
                  <Box
                    component="span"
                    sx={{
                      color: "#999",
                      fontWeight: 500,
                    }}
                  >
                    Resend in{" "}
                    <span style={{ fontWeight: 600, color: "#6366f1" }}>
                      {timer}s
                    </span>
                  </Box>
                )}
              </Typography>

              {/* Verify button */}
              <ButtonRFH
                fullWidth
                onClick={handleVerifyOtp}
                disabled={componentProps.isOtpVerying}
                loading={componentProps.isOtpVerying}
                sx={{
                  ...buttonSx,
                }}
              >
                Verify OTP →
              </ButtonRFH>

              {/* Back link */}
              <Typography
                textAlign="center"
                fontSize={13}
                sx={{
                  mt: 2.5,
                  color: "rgba(0,0,0,0.35)",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
                onClick={handleBack}
              >
                ← Back to signup form
              </Typography>
            </Box>
          )}

          {/* ════════════════════════════════════
              VIEW 3 — SUCCESS
          ════════════════════════════════════ */}
          {view === "success" && (
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 4, md: 6 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "#4ade80" }} />

              <Typography
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: { xs: 18, md: 24 },
                  color: "#111",
                  lineHeight: 1.2,
                }}
              >
                Account Created!
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: "rgba(0,0,0,0.45)",
                  fontFamily: "'DM Sans', sans-serif",
                  maxWidth: 320,
                }}
              >
                Welcome aboard! Your reading journey begins now.
              </Typography>

              {/* Go to Login */}
              <ButtonRFH
                fullWidth
                onClick={goToLogin}
                sx={{
                  mt: 2,
                  maxWidth: 340,
                  ...buttonSx,
                }}
              >
                Go to Login →
              </ButtonRFH>
            </Box>
          )}
        </Paper>
      </Box>
    </FormProvider>
  );
}
