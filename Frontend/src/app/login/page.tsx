//@ts-nocheck
//@ts-ignore
"use client";

import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import TextFieldRFH from "@lib/TextFieldRFH";
import ForgotPasswordModal from "@/components/CommonModal/ForgotPasswordModal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useSession from "@app/auth/session/useSession";
import { useAuth } from "@hooks/authentication/useAuth";

interface IDefaultValue {
  email: string;
  password: string;
}

export const roleDefaultRoute: Record<string, string> = {
  CUSTOMER: "/",
  SELLER: "/seller/dashboard",
  ADMIN: "/admin/dashboard",
};

// const defaultValues: IDefaultValue = {
//   email: "pradum",
//   password: "Pradum@123",
// };

// const defaultValues: IDefaultValue = {
//   email: "admin",
//   password: "Admin@123",
// };

const defaultValues: IDefaultValue = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthValid } = useAuth();

  const { login } = useSession();
  const [forgotOpen, setForgotOpen] = useState(false);

  const methods = useForm({
    defaultValues: defaultValues,
  });

  const { reset, watch, handleSubmit } = methods;

  const [componentProps, setComponentProps] = React.useState({
    button_text: "Login →",
    isLogin: false,
    isLoginButtonDisabled: false,
  });

  const onSubmit = React.useCallback(async () => {
    await handleSubmit(
      async (params: IDefaultValue) => {
        try {
          setComponentProps((prev) => ({ ...prev, isLogin: true }));
          const res = await login({
            username_or_email: params.email,
            password: params.password,
          });

          if (res && res?.action === "success") {
            if (res?.isLoggedIn === true) {
              const role = res?.data?.user_type_code;
              const redirectPath = roleDefaultRoute[role] || "/";

              setComponentProps((prev) => ({
                ...prev,
                button_text: res?.title + " Redirecting...",
                isLoginButtonDisabled: true,
              }));
              setTimeout(() => {
                router.replace(redirectPath);
              }, 50);
            }
          } else {
            setComponentProps((prev) => ({
              ...prev,
              button_text: "Login →",
              isLoginButtonDisabled: false,
            }));
          }
        } catch {
          toast.error("Something went wrong. Please try again.");
        } finally {
          setComponentProps((prev) => ({ ...prev, isLogin: false }));
        }
      },
      (errors: FieldErrors<IDefaultValue>) => {
        const firstKey = Object.keys(errors)[0] as keyof IDefaultValue;
        const message = errors[firstKey]?.message;
        if (message) {
          toast.error(message as string);
        }
      },
    )();
  }, []);

  return (
    <FormProvider {...methods}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes slowZoom {
          from { transform: scale(1.04); }
          to   { transform: scale(1.12); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatBook {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          fontFamily: "'DM Sans', sans-serif",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            width: "60%",
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.5) saturate(0.55)",
              animation: "slowZoom 18s ease-in-out infinite alternate",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {[
            {
              h: "88px",
              w: "16px",
              top: "12%",
              left: "5%",
              delay: "0s",
              dur: "7s",
              bg: "#8B4513",
            },
            {
              h: "64px",
              w: "12px",
              top: "23%",
              left: "9%",
              delay: "1.5s",
              dur: "5.5s",
              bg: "#2d5016",
            },
            {
              h: "100px",
              w: "18px",
              top: "55%",
              left: "4%",
              delay: "3s",
              dur: "6.5s",
              bg: "#1a237e",
            },
            {
              h: "72px",
              w: "14px",
              top: "73%",
              left: "8%",
              delay: "0.8s",
              dur: "8s",
              bg: "#b71c1c",
            },
          ].map((s, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: s.w,
                height: s.h,
                top: s.top,
                left: s.left,
                borderRadius: "2px 4px 4px 2px",
                background: `linear-gradient(180deg, ${s.bg}cc, ${s.bg}88)`,
                opacity: 0.45,
                boxShadow:
                  "inset -3px 0 6px rgba(0,0,0,0.4), 2px 2px 8px rgba(0,0,0,0.5)",
                animation: `floatBook ${s.dur} ease-in-out infinite`,
                animationDelay: s.delay,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: "4px",
                  top: "8px",
                  bottom: "8px",
                  width: "2px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "1px",
                },
              }}
            />
          ))}

          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              animation: "fadeUp 0.9s ease both",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: { md: "30px", lg: "44px" },
                fontWeight: 700,
                lineHeight: 1.12,
                color: "#fff",
                mb: 2,
                textAlign: "center",
              }}
            >
              Discover Your Next Favorite Book
              <br />
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 300,
                lineHeight: 1.75,
                mb: 4,
                fontFamily: "'DM Sans', sans-serif",
                textAlign: "center",
              }}
            >
              Explore thousands of books, track your reading journey, and unlock
              new worlds with every page.
            </Typography>
          </Box>
        </Box>

        {/* ── RIGHT 40% ── */}
        <Box
          sx={{
            width: { xs: "100%", md: "40%" },
            minHeight: { xs: "100vh", md: "auto" },
            background: "#ffffff",
            borderLeft: { md: "1px solid #e8e8e8" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 3, sm: 5, md: 5, lg: 7 },
            py: { xs: 6, md: 8 },
            animation: "slideInRight 0.7s cubic-bezier(.16,1,.3,1) both",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              mb: 5,
              justifyContent: "center",
            }}
          >
            <svg width="32" height="24" viewBox="0 0 36 28" fill="none">
              <path
                d="M18 6C14 3, 5 3, 1 6 L1 26 C5 23, 14 23, 18 26 C22 23, 31 23, 35 26 L35 6 C31 3, 22 3, 18 6Z"
                fill="none"
                stroke="#111"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <line
                x1="18"
                y1="6"
                x2="18"
                y2="26"
                stroke="#111"
                strokeWidth="1.5"
              />
              <line
                x1="5"
                y1="10"
                x2="15"
                y2="10"
                stroke="#999"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="5"
                y1="14"
                x2="15"
                y2="14"
                stroke="#999"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="21"
                y1="10"
                x2="31"
                y2="10"
                stroke="#999"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="21"
                y1="14"
                x2="31"
                y2="14"
                stroke="#999"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
            <Typography
              sx={{
                fontFamily: "'Libre Baskerville', serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#1a1a1a",
              }}
            >
              Book Store
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: { xs: 22, md: 24, lg: 28 },
              fontWeight: 700,
              color: "#111",
              mb: 0.75,
              textAlign: "center",
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: "#999",
              fontWeight: 300,
              mb: 4,
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "center",
            }}
          ></Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              "& .MuiInputBase-root": {
                padding: "6px 3px !important",
              },
            }}
          >
            <TextFieldRFH name="email" label="Username or Email" />
            <TextFieldRFH
              name="password"
              label="Password"
              type="password"
              rules={{ required: "Password is required" }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mt: 1.5,
              mb: 0.5,
            }}
          >
            <Typography
              onClick={() => setForgotOpen(true)}
              sx={{
                fontSize: 13,
                color: "#656363",
                cursor: "pointer",
                transition: "color 0.2s",
                "&:hover": { color: "#222" },
              }}
            >
              Forgot password?
            </Typography>
          </Box>

          <Button
            onClick={onSubmit}
            fullWidth
            sx={{
              mt: 3,
              py: 1.6,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.3px",
              background: "#111",
              color: "#fff",
              boxShadow: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "#333",
                transform: "translateY(-1px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              },
              "&:active": { transform: "translateY(0)" },
              "& .MuiCircularProgress-root": {
                color: "#fff",
              },
            }}
            loading={componentProps?.isLogin}
            disabled={componentProps?.isLoginButtonDisabled ?? false}
          >
            {componentProps?.button_text ?? "Login →"}
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", my: 3, gap: 1.5 }}>
            <Box sx={{ flex: 1, height: "1px", background: "#ebebeb" }} />
            <Typography
              sx={{
                color: "#bbb",
                fontSize: 11,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              or
            </Typography>
            <Box sx={{ flex: 1, height: "1px", background: "#ebebeb" }} />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push("/signup")}
            sx={{
              py: 1.5,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              border: "1px solid #ddd",
              color: "#333",
              background: "#fff",
              boxShadow: "none",
              transition: "all 0.2s",
              "&:hover": {
                background: "#f5f5f5",
                border: "1px solid #bbb",
                transform: "translateY(-1px)",
                boxShadow: "none",
              },
            }}
          >
            Create an Account
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => router.push("/")}
            sx={{
              mt: 1.5,
              py: 1.2,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: "#666",
              transition: "all 0.2s",
              "&:hover": {
                background: "#f7f7f7",
                color: "#111",
              },
            }}
          >
            ← Go to Home
          </Button>
        </Box>
      </Box>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </FormProvider>
  );
}
