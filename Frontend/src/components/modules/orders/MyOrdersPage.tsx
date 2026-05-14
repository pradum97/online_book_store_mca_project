"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  Collapse,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  LinearProgress,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import HistoryIcon from "@mui/icons-material/History";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ReplayIcon from "@mui/icons-material/Replay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@container/Pagecontainer";
import {
  GetMyOrdersWithItemsEP,
  GetOrderStatusHistoryEP,
  CancelOrderItemEP,
  CreateReturnRequestEP,
  type CreateReturnPayload,
} from "@webEndPoints/handlers/customerOrderWEB/customerOrderWEB";

interface OrderItem {
  order_item_id: string;
  order_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  quantity: number;
  mrp: string;
  selling_price: string;
  subtotal: string;
  item_status: string;
}

interface Order {
  order_id: string;
  order_number: string;
  order_status: string;
  total_amount: string;
  created_date: string;
  full_name: string;
  mobile: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  items: OrderItem[];
}

interface StatusLog {
  order_status_log_id: string;
  order_item_id: string;
  status: string;
  status_label: string;
  remark: string;
  changed_date: string;
  is_completed: boolean;
  is_current: boolean;
}

const RETURN_REASONS = [
  { value: "DAMAGED_PRODUCT", label: "Product Damaged", icon: "📦" },
  { value: "WRONG_ITEM", label: "Wrong Item Received", icon: "🔄" },
  { value: "NOT_AS_DESCRIBED", label: "Not as Described", icon: "📋" },
  { value: "MISSING_PARTS", label: "Missing Parts / Pages", icon: "🔍" },
  { value: "POOR_QUALITY", label: "Poor Quality", icon: "⭐" },
  { value: "CHANGED_MIND", label: "Changed My Mind", icon: "💭" },
  { value: "OTHER", label: "Other", icon: "✏️" },
];

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    progress: number;
    gradient: string;
  }
> = {
  PAYMENT_PENDING: {
    label: "Order Placed",
    color: "#92400e",
    bg: "#fef3c7",
    border: "#f59e0b",
    dot: "#f59e0b",
    progress: 10,
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "#1e40af",
    bg: "#dbeafe",
    border: "#3b82f6",
    dot: "#3b82f6",
    progress: 30,
    gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
  },
  SHIPPED: {
    label: "Shipped",
    color: "#5b21b6",
    bg: "#ede9fe",
    border: "#8b5cf6",
    dot: "#8b5cf6",
    progress: 55,
    gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "#0e7490",
    bg: "#cffafe",
    border: "#06b6d4",
    dot: "#06b6d4",
    progress: 75,
    gradient: "linear-gradient(135deg, #22d3ee, #06b6d4)",
  },
  DELIVERED: {
    label: "Delivered",
    color: "#14532d",
    bg: "#dcfce7",
    border: "#22c55e",
    dot: "#22c55e",
    progress: 100,
    gradient: "linear-gradient(135deg, #4ade80, #22c55e)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#ef4444",
    dot: "#ef4444",
    progress: 0,
    gradient: "linear-gradient(135deg, #f87171, #ef4444)",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    color: "#92400e",
    bg: "#fef3c7",
    border: "#f59e0b",
    dot: "#f59e0b",
    progress: 0,
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
  },
  RETURN_APPROVED: {
    label: "Return Approved",
    color: "#1e40af",
    bg: "#dbeafe",
    border: "#3b82f6",
    dot: "#3b82f6",
    progress: 0,
    gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
  },
  RETURN_PICKED_UP: {
    label: "Item Picked Up",
    color: "#5b21b6",
    bg: "#ede9fe",
    border: "#8b5cf6",
    dot: "#8b5cf6",
    progress: 0,
    gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
  },
  REFUNDED: {
    label: "Refunded",
    color: "#14532d",
    bg: "#dcfce7",
    border: "#22c55e",
    dot: "#22c55e",
    progress: 0,
    gradient: "linear-gradient(135deg, #4ade80, #22c55e)",
  },
  PICKED_UP: {
    label: "Item Picked Up",
    color: "#5b21b6",
    bg: "#ede9fe",
    border: "#8b5cf6",
    dot: "#8b5cf6",
    progress: 0,
    gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
  },
  APPROVED: {
    label: "Approved",
    color: "#1e40af",
    bg: "#dbeafe",
    border: "#3b82f6",
    dot: "#3b82f6",
    progress: 0,
    gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
  },
  REJECTED: {
    label: "Rejected",
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#ef4444",
    dot: "#ef4444",
    progress: 0,
    gradient: "linear-gradient(135deg, #f87171, #ef4444)",
  },
};

const getStatusCfg = (status: string) =>
  STATUS_CONFIG[status] ?? {
    label: status,
    color: "#374151",
    bg: "#f3f4f6",
    border: "#9ca3af",
    dot: "#9ca3af",
    progress: 0,
    gradient: "linear-gradient(135deg, #9ca3af, #6b7280)",
  };

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function OrderStatsBar({ orders }: { orders: Order[] }) {
  const total = orders.length;
  const delivered = orders.filter((o) => o.order_status === "DELIVERED").length;
  const active = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.order_status),
  ).length;
  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const totalBooks = orders.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
    0,
  );

  const stats = [
    {
      icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />,
      label: "Total Orders",
      value: total,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadow: "rgba(102,126,234,0.4)",
    },
    {
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />,
      label: "Active",
      value: active,
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
      shadow: "rgba(14,165,233,0.4)",
    },
    {
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />,
      label: "Delivered",
      value: delivered,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      shadow: "rgba(16,185,129,0.4)",
    },
    {
      icon: <MenuBookIcon sx={{ fontSize: 20 }} />,
      label: "Books Bought",
      value: totalBooks,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      shadow: "rgba(245,158,11,0.4)",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 20 }} />,
      label: "Total Spent",
      value: `₹${totalSpent.toLocaleString("en-IN")}`,
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      shadow: "rgba(236,72,153,0.4)",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 2,
        mb: 3.5,
        "@media (max-width: 900px)": { gridTemplateColumns: "repeat(3, 1fr)" },
        "@media (max-width: 600px)": { gridTemplateColumns: "repeat(2, 1fr)" },
      }}
    >
      {stats.map((stat) => (
        <Box
          key={stat.label}
          sx={{
            p: 2.5,
            borderRadius: "16px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            transition: "all 0.25s ease",
            "&:hover": {
              boxShadow: `0 8px 30px ${stat.shadow}`,
              transform: "translateY(-3px)",
              borderColor: "transparent",
            },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: stat.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: `0 4px 12px ${stat.shadow}`,
              mb: 0.5,
            }}
          >
            {stat.icon}
          </Box>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 800,
              color: "#0f172a",
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1,
            }}
          >
            {stat.value}
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              color: "#94a3b8",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            {stat.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Cancel Modal ────────────────────────────────────────────────────────────
function CancelModal({
  open,
  item,
  orderId,
  onClose,
}: {
  open: boolean;
  item: OrderItem | null;
  orderId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutate: cancelItem, isPending } = useMutation({
    mutationFn: () => CancelOrderItemEP(orderId, item!.order_item_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetMyOrdersWithItems"] });
      queryClient.invalidateQueries({ queryKey: ["StatusHistory", orderId] });
      onClose();
    },
  });
  if (!item) return null;
  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 4,
          pb: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          background: "linear-gradient(160deg, #fff1f2 0%, #fecdd3 100%)",
          borderBottom: "1px solid #fecaca",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f87171, #dc2626)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(220,38,38,0.3)",
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 30, color: "#fff" }} />
        </Box>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "#0f172a",
            fontFamily: "'Playfair Display', serif",
            textAlign: "center",
          }}
        >
          Cancel this item?
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: "#64748b",
            textAlign: "center",
            lineHeight: 1.7,
            fontFamily: "'Lato', sans-serif",
          }}
        >
          This action cannot be undone. Refund will be processed within{" "}
          <strong>5–7 business days</strong>.
        </Typography>
      </Box>
      <DialogContent sx={{ px: 3, py: 2.5, background: "#fff" }}>
        <Box
          sx={{
            border: "1.5px solid #e2e8f0",
            borderRadius: "14px",
            p: 2.5,
            background: "#f8fafc",
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              width: 5,
              borderRadius: "4px",
              background: getStatusCfg(item.item_status).gradient,
              alignSelf: "stretch",
              minHeight: 44,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "'Playfair Display', serif",
                lineHeight: 1.3,
              }}
            >
              {item.book_title}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#64748b",
                fontStyle: "italic",
                mt: 0.4,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              by {item.book_author}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#64748b",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                Qty:{" "}
                <strong style={{ color: "#0f172a" }}>{item.quantity}</strong>
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#0f172a",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                ₹{parseFloat(item.subtotal).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
          gap: 1.5,
          background: "#fff",
          flexDirection: "row",
          "& > *": { flex: 1, m: "0 !important" },
        }}
      >
        <Button
          onClick={onClose}
          disabled={isPending}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            py: 1.3,
            borderColor: "#e2e8f0",
            color: "#475569",
            "&:hover": { borderColor: "#94a3b8", background: "#f8fafc" },
          }}
        >
          Keep Order
        </Button>
        <Button
          onClick={() => cancelItem()}
          disabled={isPending}
          variant="contained"
          startIcon={
            isPending ? (
              <CircularProgress size={14} sx={{ color: "#fff" }} />
            ) : (
              <CancelOutlinedIcon sx={{ fontSize: "16px !important" }} />
            )
          }
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            py: 1.3,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            boxShadow: "0 4px 16px rgba(220,38,38,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              boxShadow: "0 6px 20px rgba(220,38,38,0.45)",
            },
            "&:disabled": {
              background: "#fca5a5",
              color: "#fff",
              boxShadow: "none",
            },
          }}
        >
          {isPending ? "Cancelling..." : "Yes, Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Return Modal ────────────────────────────────────────────────────────────
function ReturnModal({
  open,
  item,
  orderId,
  onClose,
}: {
  open: boolean;
  item: OrderItem | null;
  orderId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [subReason, setSubReason] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: submitReturn, isPending } = useMutation({
    mutationFn: () =>
      CreateReturnRequestEP(orderId, item!.order_item_id, {
        return_reason: selectedReason as CreateReturnPayload["return_reason"],
        return_sub_reason: subReason || undefined,
        description: description || undefined,
      }),
    onSuccess: () => {
      setStep(2);
      queryClient.invalidateQueries({ queryKey: ["GetMyOrdersWithItems"] });
    },
  });

  const handleClose = () => {
    if (isPending) return;
    setStep(0);
    setSelectedReason("");
    setSubReason("");
    setDescription("");
    onClose();
  };

  if (!item) return null;
  const reasonLabel =
    RETURN_REASONS.find((r) => r.value === selectedReason)?.label ?? "";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          maxWidth: 460,
          width: "100%",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 3.5,
          pb: 2.5,
          background: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)",
          borderBottom: "1px solid #fde68a",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(245,158,11,0.35)",
            }}
          >
            <ReplayIcon sx={{ fontSize: 24, color: "#fff" }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0f172a",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Return Request
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#92400e",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 600,
              }}
            >
              Refund in 5–7 business days after pickup
            </Typography>
          </Box>
        </Box>
        {step < 2 && (
          <Box sx={{ mt: 2.5 }}>
            <Stepper
              activeStep={step}
              sx={{
                "& .MuiStepLabel-label": {
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 11.5,
                  fontWeight: 600,
                },
                "& .MuiStepIcon-root.Mui-active": { color: "#f59e0b" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#10b981" },
              }}
            >
              <Step>
                <StepLabel>Select Reason</StepLabel>
              </Step>
              <Step>
                <StepLabel>Add Details</StepLabel>
              </Step>
            </Stepper>
          </Box>
        )}
      </Box>

      {step < 2 && (
        <Box
          sx={{
            mx: 3,
            mt: 1.5,
            p: 1.5,
            borderRadius: "12px",
            background: "#f8fafc",
            border: "1.5px solid #e2e8f0",
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 5,
              borderRadius: "3px",
              background: "linear-gradient(to bottom, #f59e0b, #f59e0b88)",
              alignSelf: "stretch",
              minHeight: 32,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13.5,
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "'Playfair Display', serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.book_title}
            </Typography>
            <Typography
              sx={{
                fontSize: 11.5,
                color: "#64748b",
                fontFamily: "'Lato', sans-serif",
                fontStyle: "italic",
              }}
            >
              by {item.book_author} · Qty {item.quantity}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0f172a",
              fontFamily: "'Lato', sans-serif",
              flexShrink: 0,
            }}
          >
            ₹{parseFloat(item.subtotal).toLocaleString("en-IN")}
          </Typography>
        </Box>
      )}

      {step === 0 && (
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              color: "#475569",
              fontFamily: "'Lato', sans-serif",
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Why are you returning this item?
          </Typography>
          <RadioGroup
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            {RETURN_REASONS.map((r) => (
              <FormControlLabel
                key={r.value}
                value={r.value}
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: "#d97706",
                      "&.Mui-checked": { color: "#d97706" },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span style={{ fontSize: 16 }}>{r.icon}</span>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: selectedReason === r.value ? 700 : 500,
                        color:
                          selectedReason === r.value ? "#0f172a" : "#374151",
                      }}
                    >
                      {r.label}
                    </Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  px: 1.5,
                  borderRadius: "10px",
                  border: "1.5px solid",
                  borderColor:
                    selectedReason === r.value ? "#fde68a" : "transparent",
                  background:
                    selectedReason === r.value ? "#fffbeb" : "transparent",
                  mb: 0.8,
                  transition: "all 0.15s",
                  "&:hover": { background: "#fffbeb", borderColor: "#fde68a" },
                }}
              />
            ))}
          </RadioGroup>
        </DialogContent>
      )}

      {step === 1 && (
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              background: "#fffbeb",
              border: "1.5px solid #fde68a",
              mb: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                color: "#92400e",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Selected Reason
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: "#0f172a",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                mt: 0.3,
              }}
            >
              {RETURN_REASONS.find((r) => r.value === selectedReason)?.icon}{" "}
              {reasonLabel}
            </Typography>
          </Box>
          <TextField
            label="More specific reason (optional)"
            value={subReason}
            onChange={(e) => setSubReason(e.target.value)}
            fullWidth
            placeholder="e.g. Cover torn, Pages missing..."
            size="small"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                fontFamily: "'Lato', sans-serif",
                fontSize: 13,
              },
              "& label": { fontFamily: "'Lato', sans-serif", fontSize: 13 },
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Additional description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Describe the issue in detail..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                fontFamily: "'Lato', sans-serif",
                fontSize: 13,
              },
              "& label": { fontFamily: "'Lato', sans-serif", fontSize: 13 },
            }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
      )}

      {step === 2 && (
        <DialogContent sx={{ px: 3, py: 5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: "#0f172a",
                fontFamily: "'Playfair Display', serif",
                textAlign: "center",
              }}
            >
              Return Requested!
            </Typography>
            <Typography
              sx={{
                fontSize: 13.5,
                color: "#64748b",
                fontFamily: "'Lato', sans-serif",
                textAlign: "center",
                lineHeight: 1.7,
                maxWidth: 300,
              }}
            >
              Your request has been submitted. Our team will review and get back
              within <strong>24–48 hours</strong>.
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                width: "100%",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#15803d",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                }}
              >
                ₹{parseFloat(item.subtotal).toLocaleString("en-IN")} will be
                refunded in 5–7 business days after pickup
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      )}

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
          gap: 1.5,
          background: "#fff",
          "& > *": { flex: 1, m: "0 !important" },
        }}
      >
        {step === 0 && (
          <>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                py: 1.3,
                borderColor: "#e2e8f0",
                color: "#475569",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setStep(1)}
              disabled={!selectedReason}
              variant="contained"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                py: 1.3,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                "&:disabled": { background: "#fde68a", color: "#92400e66" },
              }}
            >
              Next →
            </Button>
          </>
        )}
        {step === 1 && (
          <>
            <Button
              onClick={() => setStep(0)}
              variant="outlined"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                py: 1.3,
                borderColor: "#e2e8f0",
                color: "#475569",
              }}
            >
              ← Back
            </Button>
            <Button
              onClick={() => submitReturn()}
              disabled={isPending}
              variant="contained"
              startIcon={
                isPending ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  <ReplayIcon sx={{ fontSize: "16px !important" }} />
                )
              }
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                py: 1.3,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                "&:disabled": { background: "#fde68a", color: "#92400e66" },
              }}
            >
              {isPending ? "Submitting..." : "Submit Return"}
            </Button>
          </>
        )}
        {step === 2 && (
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              py: 1.3,
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 4px 16px rgba(34,197,94,0.35)",
            }}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Status Timeline ─────────────────────────────────────────────────────────
function StatusTimeline({
  orderId,
  itemId,
}: {
  orderId: string;
  itemId: string;
}) {
  const { data: history, isLoading } = useQuery<StatusLog[]>({
    queryKey: ["StatusHistory", orderId],
    queryFn: async () => {
      const res = await GetOrderStatusHistoryEP(orderId);
      return res?.data ?? [];
    },
  });
  const itemLogs = history?.filter((h) => h.order_item_id === itemId) ?? [];

  if (isLoading)
    return (
      <Box
        sx={{
          pl: 1,
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="45%" height={14} />
              <Skeleton width="30%" height={11} sx={{ mt: 0.4 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );

  if (!itemLogs.length)
    return (
      <Typography
        sx={{
          fontSize: 12.5,
          color: "#94a3b8",
          fontFamily: "'Lato', sans-serif",
          pl: 1,
          py: 1,
          fontStyle: "italic",
        }}
      >
        No status history yet
      </Typography>
    );

  return (
    <Box sx={{ pl: 1, py: 1.5 }}>
      {itemLogs.map((log, idx) => {
        const isLast = idx === itemLogs.length - 1;
        const cfg = getStatusCfg(log.status);
        return (
          <Box
            key={log.order_status_log_id}
            sx={{ display: "flex", gap: 2, position: "relative" }}
          >
            {!isLast && (
              <Box
                sx={{
                  position: "absolute",
                  left: 9,
                  top: 22,
                  width: 2,
                  height: "calc(100% - 4px)",
                  background: log.is_completed
                    ? `linear-gradient(to bottom, ${cfg.dot}88, #e2e8f0)`
                    : "#e2e8f0",
                  borderRadius: "2px",
                }}
              />
            )}
            <Box sx={{ flexShrink: 0, mt: "2px" }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: log.is_current
                    ? cfg.gradient
                    : log.is_completed
                      ? cfg.dot + "66"
                      : "#e2e8f0",
                  border: log.is_current ? `none` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: log.is_current
                    ? `0 0 0 4px ${cfg.dot}20, 0 2px 8px ${cfg.dot}44`
                    : "none",
                }}
              />
            </Box>
            <Box sx={{ pb: isLast ? 0 : 3 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: log.is_current ? 700 : 500,
                  color: log.is_current ? cfg.color : "#475569",
                  fontFamily: "'Lato', sans-serif",
                  lineHeight: 1.4,
                }}
              >
                {log.status_label}
              </Typography>
              {log.remark && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748b",
                    fontFamily: "'Lato', sans-serif",
                    mt: 0.2,
                  }}
                >
                  {log.remark}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#94a3b8",
                  fontFamily: "'Lato', sans-serif",
                  mt: 0.3,
                }}
              >
                {formatDate(log.changed_date)} · {formatTime(log.changed_date)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

const RETURN_STATUSES = [
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "RETURN_PICKED_UP",
  "REFUNDED",
];

// ─── Order Item Card ──────────────────────────────────────────────────────────
function OrderItemCard({
  item,
  orderId,
  onCancelClick,
  onReturnClick,
}: {
  item: OrderItem;
  orderId: string;
  onCancelClick: (item: OrderItem) => void;
  onReturnClick: (item: OrderItem) => void;
}) {
  const [timelineOpen, setTimelineOpen] = useState(false);
  const cfg = getStatusCfg(item.item_status ?? "PAYMENT_PENDING");
  const isCancelled = item.item_status === "CANCELLED";
  const isDelivered = item.item_status === "DELIVERED";
  const canCancel = ![
    "DELIVERED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURN_APPROVED",
    "RETURN_PICKED_UP",
    "PICKED_UP",
    "REFUNDED",
    "APPROVED",
    "REJECTED",
    ...RETURN_STATUSES,
  ].includes(item.item_status);

  const discount = parseFloat(item.mrp) - parseFloat(item.selling_price);
  const discountPct =
    discount > 0 ? Math.round((discount / parseFloat(item.mrp)) * 100) : 0;

  const avatarColors = [
    {
      bg: "linear-gradient(135deg, #a78bfa, #7c3aed)",
      shadow: "rgba(124,58,237,0.3)",
    },
    {
      bg: "linear-gradient(135deg, #60a5fa, #2563eb)",
      shadow: "rgba(37,99,235,0.3)",
    },
    {
      bg: "linear-gradient(135deg, #34d399, #059669)",
      shadow: "rgba(5,150,105,0.3)",
    },
    {
      bg: "linear-gradient(135deg, #fbbf24, #d97706)",
      shadow: "rgba(217,119,6,0.3)",
    },
    {
      bg: "linear-gradient(135deg, #f87171, #dc2626)",
      shadow: "rgba(220,38,38,0.3)",
    },
    {
      bg: "linear-gradient(135deg, #f472b6, #be185d)",
      shadow: "rgba(190,24,93,0.3)",
    },
    {
      bg: "linear-gradient(135deg, #22d3ee, #0891b2)",
      shadow: "rgba(8,145,178,0.3)",
    },
  ];
  const avatarColor =
    avatarColors[item.book_title.charCodeAt(0) % avatarColors.length];
  const initials = item.book_title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Box
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        background: isCancelled ? "#fafafa" : "#ffffff",
        border: `1.5px solid ${isCancelled ? "#fecaca" : "#e2e8f0"}`,
        boxShadow: isCancelled ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
        "&:hover": {
          boxShadow: isCancelled ? "none" : "0 8px 32px rgba(0,0,0,0.1)",
          borderColor: isCancelled ? "#fecaca" : "#cbd5e1",
          transform: isCancelled ? "none" : "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "stretch" }}>
        {/* Left accent bar */}
        <Box
          sx={{
            width: 5,
            background: cfg.gradient,
            flexShrink: 0,
          }}
        />

        <Box sx={{ flex: 1, px: 2.5, py: 2.5 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            {/* Avatar */}
            <Avatar
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                background: isCancelled ? "#e2e8f0" : avatarColor.bg,
                boxShadow: isCancelled
                  ? "none"
                  : `0 4px 16px ${avatarColor.shadow}`,
                color: "#fff",
                fontFamily: "'Playfair Display', serif",
                fontSize: 17,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>

            {/* Book Details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: isCancelled ? "#94a3b8" : "#0f172a",
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.3,
                  textDecoration: isCancelled ? "line-through" : "none",
                }}
              >
                {item.book_title}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#64748b",
                  fontFamily: "'Lato', sans-serif",
                  mt: 0.3,
                  fontStyle: "italic",
                }}
              >
                by {item.book_author}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mt: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: isCancelled ? "#94a3b8" : "#0f172a",
                    fontFamily: "'Lato', sans-serif",
                  }}
                >
                  ₹{parseFloat(item.subtotal).toLocaleString("en-IN")}
                </Typography>
                {parseFloat(item.mrp) !== parseFloat(item.selling_price) && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#cbd5e1",
                      fontFamily: "'Lato', sans-serif",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹
                    {(parseFloat(item.mrp) * item.quantity).toLocaleString(
                      "en-IN",
                    )}
                  </Typography>
                )}
                {discountPct > 0 && !isCancelled && (
                  <Chip
                    label={`${discountPct}% off`}
                    size="small"
                    sx={{
                      fontSize: 10,
                      height: 20,
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                      color: "#065f46",
                      border: "1px solid #6ee7b7",
                      px: 0.3,
                    }}
                  />
                )}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    ml: "auto",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Qty
                  </Typography>
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.3,
                      borderRadius: "8px",
                      background: "#f1f5f9",
                      border: "1.5px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#334155",
                        fontFamily: "'Lato', sans-serif",
                      }}
                    >
                      {item.quantity}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right: Status + Actions */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1.2,
                flexShrink: 0,
              }}
            >
              <Chip
                label={cfg.label}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 26,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  background: cfg.bg,
                  color: cfg.color,
                  border: `1.5px solid ${cfg.border}`,
                  borderRadius: "8px",
                  letterSpacing: "0.2px",
                  boxShadow: `0 2px 8px ${cfg.dot}33`,
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 0.8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {isDelivered && (
                  <Box
                    onClick={() => onReturnClick(item)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      color: "#92400e",
                      borderRadius: "8px",
                      px: 1.2,
                      py: 0.6,
                      border: "1.5px solid #fde68a",
                      background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 11,
                      transition: "all 0.15s",
                      "&:hover": {
                        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                        boxShadow: "0 4px 12px rgba(245,158,11,0.25)",
                      },
                    }}
                  >
                    <ReplayIcon sx={{ fontSize: 12 }} />
                    Return
                  </Box>
                )}
                {canCancel && (
                  <Box
                    onClick={() => onCancelClick(item)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      color: "#991b1b",
                      borderRadius: "8px",
                      px: 1.2,
                      py: 0.6,
                      border: "1.5px solid #fecaca",
                      background: "linear-gradient(135deg, #fff1f2, #fee2e2)",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 11,
                      transition: "all 0.15s",
                      "&:hover": {
                        background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                        boxShadow: "0 4px 12px rgba(220,38,38,0.25)",
                      },
                    }}
                  >
                    <CancelOutlinedIcon sx={{ fontSize: 12 }} />
                    Cancel
                  </Box>
                )}
                {!isCancelled && (
                  <Box
                    onClick={() => setTimelineOpen((p) => !p)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      color: "#5b21b6",
                      borderRadius: "8px",
                      px: 1.2,
                      py: 0.6,
                      border: "1.5px solid #ddd6fe",
                      background: timelineOpen
                        ? "linear-gradient(135deg, #ede9fe, #ddd6fe)"
                        : "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 11,
                      transition: "all 0.15s",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                        boxShadow: "0 4px 12px rgba(139,92,246,0.25)",
                      },
                    }}
                  >
                    <HistoryIcon sx={{ fontSize: 12 }} />
                    Track
                    {timelineOpen ? (
                      <KeyboardArrowUpIcon sx={{ fontSize: 13 }} />
                    ) : (
                      <KeyboardArrowDownIcon sx={{ fontSize: 13 }} />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Timeline */}
      <Collapse in={timelineOpen}>
        <Box
          sx={{
            mx: 2.5,
            mb: 2.5,
            borderRadius: "14px",
            background: "linear-gradient(160deg, #f8f7ff 0%, #f5f3ff 100%)",
            border: "1.5px solid #ddd6fe",
            px: 2.5,
            py: 2,
            boxShadow: "inset 0 2px 8px rgba(139,92,246,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <HistoryIcon sx={{ fontSize: 14, color: "#7c3aed" }} />
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                color: "#7c3aed",
                fontFamily: "'Lato', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
              }}
            >
              Shipment Timeline
            </Typography>
          </Box>
          <StatusTimeline orderId={orderId} itemId={item.order_item_id} />
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [itemsOpen, setItemsOpen] = useState(true);
  const [cancelItem, setCancelItem] = useState<OrderItem | null>(null);
  const [returnItem, setReturnItem] = useState<OrderItem | null>(null);
  const cfg = getStatusCfg(order.order_status);
  const isCancelled = order.order_status === "CANCELLED";
  const progress = cfg.progress ?? 0;

  const statusIcon =
    order.order_status === "DELIVERED" ? (
      <CheckCircleOutlineIcon sx={{ fontSize: 13, color: cfg.color }} />
    ) : order.order_status === "CANCELLED" ? (
      <CancelOutlinedIcon sx={{ fontSize: 13, color: cfg.color }} />
    ) : (
      <LocalShippingOutlinedIcon sx={{ fontSize: 13, color: cfg.color }} />
    );

  return (
    <>
      <Box
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          background: "#ffffff",
          border: "1.5px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          transition: "all 0.25s ease",
          "&:hover": {
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            borderColor: "#cbd5e1",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Order Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)",
            borderBottom: "1.5px solid #e2e8f0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Left: Order info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      p: 0.8,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                      display: "flex",
                    }}
                  >
                    <ReceiptLongIcon sx={{ fontSize: 14, color: "#4338ca" }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#0f172a",
                      fontFamily: "'Lato', sans-serif",
                      letterSpacing: "0.2px",
                    }}
                  >
                    {order.order_number}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    background: cfg.bg,
                    border: `1.5px solid ${cfg.border}`,
                    borderRadius: "20px",
                    px: 1.3,
                    py: 0.4,
                    boxShadow: `0 2px 8px ${cfg.dot}33`,
                  }}
                >
                  {statusIcon}
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      color: cfg.color,
                    }}
                  >
                    {cfg.label}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748b",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  📅 {formatDate(order.created_date)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748b",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  📍 {order.city}, {order.state}
                </Typography>
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.4,
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#475569",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    📦 {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>

              {/* Progress bar */}
              {!isCancelled && progress > 0 && (
                <Box sx={{ mt: 2, maxWidth: 320 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.7,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "#94a3b8",
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Order Progress
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: cfg.color,
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 800,
                      }}
                    >
                      {progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 6,
                      borderRadius: 4,
                      background: "#e2e8f0",
                      "& .MuiLinearProgress-bar": {
                        background: cfg.gradient,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Right: Amount + Toggle */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#0f172a",
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  ₹{parseFloat(order.total_amount).toLocaleString("en-IN")}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 600,
                    mt: 0.2,
                  }}
                >
                  Total Amount
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setItemsOpen((p) => !p)}
                sx={{
                  color: "#475569",
                  background: "#fff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "12px",
                  width: 38,
                  height: 38,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  "&:hover": {
                    background: "#f8fafc",
                    borderColor: "#94a3b8",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {itemsOpen ? (
                  <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Order Items */}
        <Collapse in={itemsOpen}>
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              background: "#fafbfc",
            }}
          >
            {order.items.map((item) => (
              <OrderItemCard
                key={item.order_item_id}
                item={item}
                orderId={order.order_id}
                onCancelClick={(i) => setCancelItem(i)}
                onReturnClick={(i) => setReturnItem(i)}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      <CancelModal
        open={!!cancelItem}
        item={cancelItem}
        orderId={order.order_id}
        onClose={() => setCancelItem(null)}
      />
      <ReturnModal
        open={!!returnItem}
        item={returnItem}
        orderId={order.order_id}
        onClose={() => setReturnItem(null)}
      />
    </>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({
  searchText,
  onSearchChange,
  filterStatus,
  onStatusChange,
  hasActiveFilter,
  onClear,
}: {
  searchText: string;
  onSearchChange: (v: string) => void;
  filterStatus: string;
  onStatusChange: (v: string) => void;
  fromDate: string;
  onFromDateChange: (v: string) => void;
  toDate: string;
  onToDateChange: (v: string) => void;
  onClear: () => void;
  hasActiveFilter: boolean;
}) {
  const statuses = [
    { value: "ALL", label: "All Orders" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: "12px 18px",
          background: "#fff",
          border: "1.5px solid #e2e8f0",
          borderRadius: "14px",
          mb: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          "&:focus-within": {
            borderColor: "#6366f1",
            boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
          },
          transition: "all 0.2s",
        }}
      >
        <SearchIcon sx={{ color: "#94a3b8", fontSize: 20, flexShrink: 0 }} />
        <input
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by order no., book title or author…"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#0f172a",
            background: "transparent",
            minWidth: 0,
          }}
        />
        {searchText && (
          <Box
            onClick={() => onSearchChange("")}
            sx={{
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              "&:hover": { color: "#475569" },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
      </Box>

      {/* Status filter chips */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <FilterListIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
        {statuses.map((s) => {
          const cfg = s.value !== "ALL" ? getStatusCfg(s.value) : null;
          const isActive = filterStatus === s.value;
          return (
            <Box
              key={s.value}
              onClick={() => onStatusChange(s.value)}
              sx={{
                px: 1.8,
                py: 0.7,
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Lato', sans-serif",
                fontWeight: isActive ? 800 : 600,
                border: "1.5px solid",
                borderColor: isActive ? (cfg?.border ?? "#6366f1") : "#e2e8f0",
                background: isActive
                  ? (cfg?.bg ?? "linear-gradient(135deg, #e0e7ff, #c7d2fe)")
                  : "#fff",
                color: isActive ? (cfg?.color ?? "#4338ca") : "#64748b",
                boxShadow: isActive
                  ? `0 2px 10px ${cfg?.dot ?? "#6366f1"}33`
                  : "none",
                transition: "all 0.15s",
                "&:hover": {
                  borderColor: cfg?.border ?? "#6366f1",
                  background: cfg?.bg ?? "#f0f4ff",
                  boxShadow: `0 2px 10px ${cfg?.dot ?? "#6366f1"}22`,
                },
              }}
            >
              {s.label}
            </Box>
          );
        })}
        {hasActiveFilter && (
          <Box
            onClick={onClear}
            sx={{
              px: 1.5,
              py: 0.7,
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              border: "1.5px solid #fecaca",
              background: "linear-gradient(135deg, #fff1f2, #fee2e2)",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              transition: "all 0.15s",
              "&:hover": {
                background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 12 }} /> Clear
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const hasActiveFilter =
    searchText.trim() !== "" ||
    filterStatus !== "ALL" ||
    fromDate !== "" ||
    toDate !== "";

  const handleClearFilters = () => {
    setSearchText("");
    setFilterStatus("ALL");
    setFromDate("");
    setToDate("");
  };

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["GetMyOrdersWithItems"],
    queryFn: async () => {
      const res = await GetMyOrdersWithItemsEP();
      return res?.data ?? [];
    },
  });

  const filteredOrders = (orders ?? []).filter((order) => {
    if (filterStatus !== "ALL" && order.order_status !== filterStatus)
      return false;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchesOrder = order.order_number.toLowerCase().includes(q);
      const matchesBook = order.items.some(
        (item) =>
          item.book_title.toLowerCase().includes(q) ||
          item.book_author.toLowerCase().includes(q),
      );
      if (!matchesOrder && !matchesBook) return false;
    }
    if (fromDate && new Date(order.created_date) < new Date(fromDate))
      return false;
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (new Date(order.created_date) > to) return false;
    }
    return true;
  });

  return (
    <Box sx={{ background: "#f8fafc", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Lato:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 4,
            pb: 3.5,
            borderBottom: "2px solid #e2e8f0",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.8 }}
            >
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                  display: "flex",
                }}
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: 24, color: "#fff" }} />
              </Box>
              <Typography
                sx={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#0f172a",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "-0.8px",
                }}
              >
                My Orders
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 14,
                color: "#64748b",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 500,
                pl: 0.5,
              }}
            >
              Track, manage and return your book purchases
            </Typography>
          </Box>
          {orders && orders.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                px: 2,
                py: 1,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                border: "1.5px solid #86efac",
                boxShadow: "0 2px 10px rgba(34,197,94,0.15)",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 800,
                  color: "#15803d",
                }}
              >
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </Typography>
            </Box>
          )}
        </Box>

        {/* Stats */}
        {orders && orders.length > 0 && <OrderStatsBar orders={orders} />}

        {/* Loading */}
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    background:
                      "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderBottom: "1.5px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Skeleton width={240} height={20} />
                    <Skeleton width={180} height={14} sx={{ mt: 0.6 }} />
                  </Box>
                  <Skeleton
                    width={90}
                    height={32}
                    sx={{ borderRadius: "10px" }}
                  />
                </Box>
                <Box
                  sx={{
                    p: 2.5,
                    background: "#fafbfc",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {[1, 2].map((j) => (
                    <Box
                      key={j}
                      sx={{
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "16px",
                        p: 2.5,
                        display: "flex",
                        gap: 2,
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        width={52}
                        height={52}
                        sx={{ borderRadius: "14px" }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="55%" height={18} />
                        <Skeleton width="35%" height={13} sx={{ mt: 0.6 }} />
                        <Skeleton width="70%" height={13} sx={{ mt: 0.8 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        ) : !orders?.length ? (
          /* Empty state */
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 12,
              gap: 3,
              background: "linear-gradient(160deg, #fff 0%, #f8fafc 100%)",
              borderRadius: "24px",
              border: "2px dashed #e2e8f0",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                fontSize: 72,
                lineHeight: 1,
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
              }}
            >
              📦
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0f172a",
                  fontFamily: "'Playfair Display', serif",
                  mb: 1,
                }}
              >
                No Orders Yet
              </Typography>
              <Typography
                sx={{
                  fontSize: 14.5,
                  color: "#64748b",
                  fontFamily: "'Lato', sans-serif",
                  maxWidth: 300,
                  lineHeight: 1.7,
                  mx: "auto",
                }}
              >
                You haven't placed any orders yet. Discover your next great
                read!
              </Typography>
            </Box>
            <Button
              href="/books"
              variant="contained"
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                px: 3.5,
                py: 1.3,
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
                },
              }}
            >
              Browse Books →
            </Button>
          </Box>
        ) : (
          <>
            {/* Filter bar */}
            <FilterBar
              searchText={searchText}
              onSearchChange={setSearchText}
              filterStatus={filterStatus}
              onStatusChange={setFilterStatus}
              fromDate={fromDate}
              onFromDateChange={setFromDate}
              toDate={toDate}
              onToDateChange={setToDate}
              onClear={handleClearFilters}
              hasActiveFilter={hasActiveFilter}
            />

            {filteredOrders.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2.5,
                  background: "linear-gradient(160deg, #fff 0%, #f8fafc 100%)",
                  borderRadius: "20px",
                  border: "2px dashed #e2e8f0",
                  py: 10,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                }}
              >
                <Box sx={{ fontSize: 56, lineHeight: 1 }}>🔍</Box>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#0f172a",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  No Matching Orders
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#64748b",
                    fontFamily: "'Lato', sans-serif",
                    textAlign: "center",
                    maxWidth: 280,
                    lineHeight: 1.7,
                  }}
                >
                  Try adjusting your filters to find what you're looking for.
                </Typography>
                <Box
                  onClick={handleClearFilters}
                  sx={{
                    px: 2.5,
                    py: 1.1,
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    color: "#475569",
                    fontSize: 13.5,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "all 0.15s",
                    "&:hover": {
                      background: "#f8fafc",
                      borderColor: "#94a3b8",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  Clear all filters
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {filteredOrders.map((order) => (
                  <OrderCard key={order.order_id} order={order} />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
