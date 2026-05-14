"use client";

import React from "react";
import { Box, Divider, Stack, SxProps, Typography } from "@mui/material";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  customDivider?: React.ReactNode;
  sx?: SxProps;
  bodySx?: SxProps;
}

export default function PageContainer({
  title,
  subtitle,
  actions,
  children,
  icon,
  customDivider,
  sx,
  bodySx,
}: PageContainerProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 75px)",
        p: 1,
        boxSizing: "border-box",
        background: "#f0f4f8",
        ...sx,
      }}
    >
      <Box
        sx={{
          width: "100%",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 1, md: 1.5 },
            py: 0.3,
            background: "#ffffff",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Stack direction={"row"}>
            {icon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "10px",
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: { xs: 17, md: 20 },
                  color: "#1e1b4b",
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "#6b7280",
                    mt: 0.2,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>

          {actions && <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>}
        </Box>
        {customDivider ? customDivider : <Divider />}
        <Box sx={{ p: { xs: 1.5, md: 2 }, ...bodySx }}>{children}</Box>
      </Box>
    </Box>
  );
}
