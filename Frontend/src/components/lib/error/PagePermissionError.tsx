"use client";

import * as React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import { useRouter } from "next/navigation";

interface PagePermissionErrorProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  maxWidth?: number | string;
}

const PagePermissionError: React.FC<PagePermissionErrorProps> = ({
  title = "Access Denied",
  description = "You do not have permission to view this page.",
  showBackButton = true,
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="92vh"
      px={2}
      bgcolor="#f5f5f7"
      sx={{
        animation: "fadeIn 0.4s ease forwards",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          userSelect: "none",
        }}
      >
        <Box
          mb={3}
          sx={{
            width: 80,
            height: 80,
            margin: "0 auto",
            borderRadius: "50%",
            bgcolor: "#e1bee7",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DoNotDisturbAltIcon color="error" sx={{ fontSize: 56 }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={700}
          color="red"
          gutterBottom
          sx={{ letterSpacing: "0.04em" }}
          mt={5}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={5}
          sx={{ mx: "auto", lineHeight: 1.5 }}
        >
          {description}
        </Typography>
        {showBackButton && (
          <Stack
            direction={"row"}
            spacing={2}
            sx={{
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="error"
              size="medium"
              onClick={handleBack}
              sx={{
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(156, 39, 176, 0.4)",
                textTransform: "none",
                borderRadius: 3,
              }}
            >
              Go Back
            </Button>

            <Button
              variant="contained"
              color="success"
              size="medium"
              onClick={() => window.location.reload()}
              sx={{
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(156, 39, 176, 0.4)",
                textTransform: "none",
                borderRadius: 3,
              }}
            >
              Reload
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(PagePermissionError);
