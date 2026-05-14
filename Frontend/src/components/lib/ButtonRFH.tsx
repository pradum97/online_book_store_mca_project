import * as React from "react";
import { Button, ButtonProps } from "@mui/material";

interface ButtonRFHProps extends ButtonProps {
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "inherit";
}

const ButtonRFH: React.FC<ButtonRFHProps> = React.memo(
  ({
    children,
    loading = false,
    startIcon,
    endIcon,
    disabled,
    color = "primary",
    ...props
  }) => {
    return (
      <Button
        loading={loading}
        color={color}
        variant="contained"
        disabled={disabled || loading}
        startIcon={startIcon}
        endIcon={endIcon}
        {...props}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          px: 2,
          py: 0.8,
          borderRadius: "8px",
          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          color: "#fff",
          boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
          "&:hover": {
            boxShadow: "0 6px 24px rgba(99,102,241,0.5)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s",
          height: { xs: "30px !important", sm: "26px !important" },
          ...props.sx,
        }}
      >
        {children}
      </Button>
    );
  },
);
export default React.memo(ButtonRFH);
ButtonRFH.displayName = "ButtonRFH";
