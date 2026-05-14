"use client";

import * as React from "react";
import SignupBox from "@modules/admin/user/signup/SignupBox";
import {
  Box,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation";
import useSession from "@app/auth/session/useSession";
import { useAuth } from "@hooks/authentication/useAuth";
import ButtonRFH from "@lib/ButtonRFH";

const Page = () => {
  const { logout, isLoading } = useSession();
  const { isAuthValid } = useAuth();

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isAuthValid) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 55px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="error" mb={2}>
            You are already logged in!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Please logout before creating a new account.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <ButtonRFH
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </ButtonRFH>
            <ButtonRFH
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
            >
              Go Home
            </ButtonRFH>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SignupBox />
    </Box>
  );
};

export default Page;
