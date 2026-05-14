"use client";

import { Box, Typography, CircularProgress, Dialog } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog = ({
  open,
  title,
  message,
  loading,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={loading ? undefined : onCancel}
    maxWidth="xs"
    fullWidth
    slotProps={{
      backdrop: {
        sx: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.45)" },
      },
    }}
    PaperProps={{
      sx: {
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
      },
    }}
  >
    <Box sx={{ p: 3.5, textAlign: "center" }}>
      {/* Warning Icon */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
          border: "2px solid #fecdd3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 30, color: "#e11d48" }} />
      </Box>

      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 17,
          color: "#111827",
          mb: 0.8,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          color: "#6b7280",
          lineHeight: 1.6,
          mb: 3,
        }}
      >
        {message}
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        {/* Cancel */}
        <Box
          component="button"
          onClick={onCancel}
          disabled={loading}
          sx={{
            flex: 1,
            py: 1.1,
            borderRadius: "10px",
            background: "#f9fafb",
            border: "1.5px solid #e5e7eb",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#374151",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            "&:hover:not(:disabled)": {
              background: "#f3f4f6",
              borderColor: "#d1d5db",
            },
          }}
        >
          Cancel
        </Box>

        {/* Confirm Delete */}
        <Box
          component="button"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            flex: 1,
            py: 1.1,
            borderRadius: "10px",
            background: loading
              ? "#fca5a5"
              : "linear-gradient(135deg, #e11d48, #be123c)",
            border: "none",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.8,
            boxShadow: "0 4px 14px rgba(225,29,72,0.3)",
            transition: "all 0.15s",
            "&:hover:not(:disabled)": {
              background: "linear-gradient(135deg, #be123c, #9f1239)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={14} sx={{ color: "#fff" }} />
          ) : (
            <DeleteForeverIcon sx={{ fontSize: 16 }} />
          )}
          {loading ? "Deleting..." : "Yes, Delete"}
        </Box>
      </Box>
    </Box>
  </Dialog>
);

export default DeleteConfirmDialog;
