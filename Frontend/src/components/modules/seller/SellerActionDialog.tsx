"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

export type DialogAction = "APPROVE" | "REJECT";

export interface SellerActionDialogProps {
  open: boolean;
  action: DialogAction | null;
  sellerName: string;
  sellerNumber: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  state?: string;
  request_number?: string;
  onConfirm: (rejectionMessage?: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const AV_COLORS = [
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#ffedd5", color: "#c2410c" },
  { bg: "#fef3c7", color: "#92400e" },
];

const av = (name: string) => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function SellerActionDialog({
  open,
  action,
  sellerName,
  sellerNumber,
  businessName,
  businessType,
  city,
  state,
  request_number,
  onConfirm,
  onClose,
  isLoading = false,
}: SellerActionDialogProps) {
  const [frozenAction, setFrozenAction] = useState<DialogAction | null>(action);

  useEffect(() => {
    if (open && action !== null) {
      setFrozenAction(action);
    }
  }, [open, action]);

  const isApprove = frozenAction === "APPROVE";
  const avColor = av(sellerName || "A");

  const [rejectionMsg, setRejectionMsg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setRejectionMsg("");
      setError(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!isApprove && !rejectionMsg.trim()) {
      setError(true);
      return;
    }
    onConfirm(isApprove ? undefined : rejectionMsg.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: isApprove
              ? "linear-gradient(90deg,#16a34a,#22c55e)"
              : "linear-gradient(90deg,#dc2626,#ef4444)",
          },
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          pt: 3,
          px: 3,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isApprove ? "#d1fae5" : "#fee2e2",
            color: isApprove ? "#065f46" : "#991b1b",
          }}
        >
          {isApprove ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />
          ) : (
            <CancelOutlinedIcon sx={{ fontSize: 22 }} />
          )}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {isApprove ? "Approve Seller?" : "Reject Application?"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
            {sellerName} · {sellerNumber || request_number}
          </Typography>
        </Box>
      </Box>

      {/* ── Content ── */}
      <DialogContent sx={{ px: 3, pt: 1.5, pb: 0 }}>
        {/* Seller info card */}
        <Box
          sx={{
            p: "10px 14px",
            borderRadius: "10px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              flexShrink: 0,
              background: avColor.bg,
              color: avColor.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {initials(sellerName)}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#111827",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {businessName || sellerName}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: "#6b7280",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {[
                businessType,
                city && state ? `${city}, ${state}` : city || state,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
          </Box>
        </Box>

        {/* Confirmation text */}
        <Typography sx={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
          Are you sure you want to{" "}
          <Box
            component="span"
            sx={{ fontWeight: 700, color: isApprove ? "#065f46" : "#b91c1c" }}
          >
            {isApprove ? "approve" : "reject"}
          </Box>{" "}
          this application? This action cannot be undone.
        </Typography>

        {/* ── Rejection reason — only for REJECT ── */}
        {!isApprove && (
          <Box sx={{ mt: 2 }}>
            {/* Label */}
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                color: "#9ca3af",
                mb: 0.8,
              }}
            >
              Rejection Reason{" "}
              <Box component="span" sx={{ color: "#ef4444" }}>
                *
              </Box>
            </Typography>

            {/* ── FIX 2: Use sx inputProps to set a proper line-height and
                prevent placeholder from wrapping inside fixed-height rows.
                Use minRows so the box expands with content naturally. ── */}
            <TextField
              fullWidth
              placeholder="Enter the reason for rejection..."
              value={rejectionMsg}
              onChange={(e) => {
                setRejectionMsg(e.target.value);
                if (error && e.target.value.trim()) setError(false);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#111827",
                  background: "#fff",
                  padding: "3px 14px",
                  alignItems: "flex-start",
                  "& fieldset": {
                    borderColor: error ? "#ef4444" : "#e5e7eb",
                  },
                  "&:hover fieldset": {
                    borderColor: error ? "#ef4444" : "#d1d5db",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: error ? "#ef4444" : "#f87171",
                    borderWidth: "1.5px",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                    fontSize: 13,
                    lineHeight: 1.6,
                  },
                },
              }}
            />

            {/* Counter + error row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
                px: 0.25,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: error ? "#ef4444" : "transparent",
                  transition: "color 0.15s",
                }}
              >
                {error ? "Please provide a reason before rejecting." : " "}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                {rejectionMsg.length}/500
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontSize: 13,
            fontWeight: 600,
            color: "#6b7280",
            border: "1px solid #e5e7eb",
            borderRadius: "9px",
            px: 2.5,
            "&:hover": { background: "#f9fafb" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          loading={isLoading}
          sx={{
            textTransform: "none",
            fontSize: 13,
            fontWeight: 700,
            borderRadius: "9px",
            px: 3,
            color: "#fff",
            background: isApprove
              ? "linear-gradient(135deg,#16a34a,#22c55e)"
              : "linear-gradient(135deg,#dc2626,#ef4444)",
            boxShadow: isApprove
              ? "0 4px 12px rgba(22,163,74,0.3)"
              : "0 4px 12px rgba(220,38,38,0.3)",
            "&:hover": { opacity: 0.9 },
          }}
        >
          {isApprove ? "Yes, Approve" : "Yes, Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
