"use client";

import * as React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

interface IProps {
  title?: string;
  size?: number;
  isLabelVisible?: boolean;
}
const PermissionLoader: React.FC<IProps> = ({
  title = "Loading...",
  size = 25,
  isLabelVisible = false,
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 57px)"
      bgcolor="#f5f5f7"
    >
      <Box
        sx={{
          textAlign: "center",
          userSelect: "none",
        }}
      >
        <CircularProgress size={size}></CircularProgress>

        {isLabelVisible && (
          <Typography variant="body2" fontWeight={700} gutterBottom>
            {title}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(PermissionLoader);
