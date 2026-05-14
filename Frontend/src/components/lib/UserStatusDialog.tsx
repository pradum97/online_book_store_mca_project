"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import useSession from "@app/auth/session/useSession";

interface Props {
  open: boolean;
  userStatusCode: string;
  statusName: string;
  message: string;
  onHandleClose: () => void;
}
const statusBgColor: Record<string, string> = {
  ACTIVE: "#e0f7fa",
  INACTIVE: "#f2f2f2",
  SUSPENDED: "#fdecea",
  PENDING: "#fff8e1",
};

export default function UserStatusDialog({
  open,
  userStatusCode,
  statusName,
  message,
  onHandleClose,
}: Props) {
  const bgColor = statusBgColor[userStatusCode] ?? "#f5f5f5";
  const router = useRouter();
  const { logout } = useSession();

  const handleGoToLogin = () => {
    logoutHandle();
    router.push("/login");
    onHandleClose();
  };

  const logoutHandle = React.useCallback(async () => {
    try {
      logout();
    } finally {
      logout();
    }
  }, [logout]);

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: bgColor,
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
          p: 2,
        },
        component: Paper,
      }}
      hideBackdrop={false}
      disableEscapeKeyDown
      onClose={() => {}}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          textAlign: "center",
          pb: 1,
          color:
            userStatusCode === "SUSPENDED"
              ? "red"
              : userStatusCode === "INACTIVE"
                ? "#8D6F64"
                : "#333",
        }}
      >
        {"Account "} {statusName}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" textAlign="center" mb={3}>
          {message as string}
        </Typography>

        <Button
          onClick={handleGoToLogin}
          fullWidth
          variant="contained"
          sx={{
            backgroundColor:
              userStatusCode === "SUSPENDED"
                ? "red"
                : userStatusCode === "INACTIVE"
                  ? "#8D6F64"
                  : "#333",
            borderRadius: 2,
            fontWeight: 600,
            py: 1,
          }}
        >
          Go to LogIn
        </Button>
      </DialogContent>
    </Dialog>
  );
}
