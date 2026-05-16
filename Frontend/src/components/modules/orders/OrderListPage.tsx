"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { CellStyle, ColDef, ICellRendererParams } from "ag-grid-community";
import PageContainer from "@container/PageContainer";
import { agGridTheme } from "@appearance/agGridThemes";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";
import { FormProvider, useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import SelectRFH from "@lib/SelectRFH";
import { IORDER_STATUS, ORDER_STATUS } from "@container/navbar/RoleRenderer";
import {
  UpdateOrderItemStatusEP,
  GetSellerOrdersEP,
  GetSellerOrderItemsEP,
} from "@webEndPoints/handlers/sellerOrderWEB/sellerOrderWEB";
import { GetPaymentsByOrderEP } from "@webEndPoints/handlers/paymentWEB/paymentWEB";
import { DownloadReceiptEP } from "@webEndPoints/handlers/receiptWEB/receiptWEB";

export interface IOrderRow {
  order_id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  created_date: string;
  total_items: string;
  seller_total: string;
}

export interface IOrderItem {
  order_item_id: string;
  book_title: string;
  book_author: string;
  quantity: number;
  selling_price: string;
  subtotal: string;
  total_amount: string;
  item_status: string;
  created_at: string;
}

export interface IPayment {
  payment_id: string;
  amount: string;
  payment_status: string;
  mode_name: string;
}

const ORDER_STATUS_LABEL_MAP: Record<string, string> = {
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_FAILED: "Payment Failed",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  RETURN_REQUESTED: "Return Requested",
  RETURN_APPROVED: "Return Approved",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
  PLACED: "Placed",
  PICKED_UP: "Picked Up",
};

const PAYMENT_STATUS_LABEL_MAP: Record<string, string> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  VERIFICATION_PENDING: "Verification Pending",
};

export const ORDER_STATUS_OPTIONS = [
  { label: "All Orders", value: ORDER_STATUS.ALL },
  { label: "Payment Pending", value: ORDER_STATUS.PENDING },
  { label: "Confirmed", value: ORDER_STATUS.CONFIRMED },
  { label: "Shipped", value: ORDER_STATUS.SHIPPED },
  { label: "Delivered", value: ORDER_STATUS.DELIVERED },
  { label: "Cancelled", value: ORDER_STATUS.CANCELLED },
];

export const PAYMENT_STATUS_FILTER_OPTIONS = [
  { label: "All Payments", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
  { label: "Verification Pending", value: "VERIFICATION_PENDING" },
];

export const ITEM_STATUS_OPTIONS = [
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "PICKED_UP",
  "REFUNDED",
];

const IconRefresh = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

function getOrderStatusColors(status: string): {
  bg: string;
  border: string;
  color: string;
} {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" };
    case "SHIPPED":
      return { bg: "#fefce8", border: "#fde68a", color: "#92400e" };
    case "OUT_FOR_DELIVERY":
      return { bg: "#fff7ed", border: "#fed7aa", color: "#ea580c" };
    case "DELIVERED":
    case "COMPLETED":
      return { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d" };
    case "CANCELLED":
    case "PAYMENT_FAILED":
      return { bg: "#fff1f2", border: "#fecdd3", color: "#be123c" };
    case "PLACED":
      return { bg: "#faf5ff", border: "#e9d5ff", color: "#7c3aed" };
    case "PACKED":
      return { bg: "#f0f9ff", border: "#bae6fd", color: "#0369a1" };
    case "RETURN_REQUESTED":
    case "RETURNED":
      return { bg: "#fff7ed", border: "#fed7aa", color: "#b45309" };
    case "REFUNDED":
      return { bg: "#f0fdf4", border: "#86efac", color: "#166534" };
    case "PROCESSING":
      return { bg: "#f5f3ff", border: "#ddd6fe", color: "#6d28d9" };
    case "RETURN_APPROVED":
      return { bg: "#fff7ed", border: "#fdba74", color: "#ea580c" };
    case "PAYMENT_PENDING":
    default:
      return { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" };
  }
}

function getPaymentStatusColors(status: string): {
  bg: string;
  border: string;
  color: string;
} {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d" };
    case "FAILED":
      return { bg: "#fff1f2", border: "#fecdd3", color: "#be123c" };
    case "VERIFICATION_PENDING":
      return { bg: "#fefce8", border: "#fde68a", color: "#92400e" };
    case "PENDING":
    default:
      return { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" };
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        color: "#6366f1",
        mb: 1.2,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {children}
    </Typography>
  );
}

function SectionCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1.5px solid #e5e7eb",
        borderRadius: "14px",
        p: 2,
        background: "#fafafa",
        mb: 1.5,
      }}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </Box>
  );
}

const OrderStatusBadge = ({ status }: { status: string }) => {
  const colors = getOrderStatusColors(status);
  const label = ORDER_STATUS_LABEL_MAP[status?.toUpperCase()] ?? status;
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1.4,
        py: 0.4,
        borderRadius: "20px",
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 11,
          fontWeight: 800,
          color: colors.color,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const colors = getPaymentStatusColors(status);
  const label = PAYMENT_STATUS_LABEL_MAP[status?.toUpperCase()] ?? status;
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1.4,
        py: 0.4,
        borderRadius: "20px",
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 11,
          fontWeight: 800,
          color: colors.color,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

function PaymentDetailModal({
  open,
  onClose,
  orderData,
}: {
  open: boolean;
  onClose: () => void;
  orderData: IOrderRow | null;
}) {
  const {
    data: paymentsResponse,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["GetPaymentsByOrderEP", orderData?.order_id],
    queryFn: async () => {
      const res = await GetPaymentsByOrderEP({ orderId: orderData!.order_id });
      return res ?? [];
    },
    enabled: open && !!orderData?.order_id,
  });

  const payments: IPayment[] = paymentsResponse ?? [];

  console.log("res-payments-", payments);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "24px",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 20 }}>💳</Typography>
          <Box>
            <Typography
              sx={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: "#fff",
              }}
            >
              Payment Details
            </Typography>
            {orderData && (
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 11,
                  color: "#6ee7b7",
                  fontWeight: 600,
                }}
              >
                {orderData.order_number}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Refresh payments">
            <IconButton
              onClick={() => refetch()}
              disabled={isFetching}
              size="small"
              sx={{
                color: "#6ee7b7",
                "&:hover": {
                  color: "#fff",
                  background: "rgba(255,255,255,0.1)",
                },
                animation: isFetching ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#6ee7b7",
              "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          {isLoading || isFetching ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#059669",
                  fontSize: 14,
                }}
              >
                ⏳ Loading payments...
              </Typography>
            </Box>
          ) : payments.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                💳 No payment records found
              </Typography>
            </Box>
          ) : (
            <SectionCard label="Payment Records">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {payments.map((payment) => {
                  const colors = getPaymentStatusColors(payment.payment_status);
                  return (
                    <Box
                      key={payment.payment_id}
                      sx={{
                        p: "12px 14px",
                        borderRadius: "12px",
                        border: "1.5px solid #e5e7eb",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 10,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            fontWeight: 700,
                          }}
                        >
                          Payment ID
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 700,
                            fontSize: 11,
                            color: "#6b7280",
                            mt: 0.2,
                          }}
                        >
                          {payment.payment_id.slice(0, 18)}...
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 10,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            fontWeight: 700,
                          }}
                        >
                          Mode
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#374151",
                          }}
                        >
                          {payment.mode_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 10,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            fontWeight: 700,
                          }}
                        >
                          Amount
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#15803d",
                          }}
                        >
                          ₹ {Number(payment.amount).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 1.4,
                          py: 0.4,
                          borderRadius: "20px",
                          background: colors.bg,
                          border: `1.5px solid ${colors.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 11,
                            fontWeight: 800,
                            color: colors.color,
                          }}
                        >
                          {PAYMENT_STATUS_LABEL_MAP[payment.payment_status] ??
                            payment.payment_status}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </SectionCard>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function OrderItemsModal({
  open,
  onClose,
  orderData,
}: {
  open: boolean;
  onClose: () => void;
  orderData: IOrderRow | null;
}) {
  const queryClient = useQueryClient();
  const [updatingItemId, setUpdatingItemId] = React.useState<string | null>(
    null,
  );
  const [paymentOpen, setPaymentOpen] = React.useState(false);

  const { data: itemsResponse, isLoading } = useQuery({
    queryKey: ["GetSellerOrderItemsEP", orderData?.order_id],
    queryFn: async () => {
      const res = await GetSellerOrderItemsEP(orderData!.order_id);
      return res?.data ?? [];
    },
    enabled: open && !!orderData?.order_id,
  });

  const items: IOrderItem[] = itemsResponse ?? [];

  const handleUpdateStatus = async (
    order_item_id: string,
    item_status: string,
  ) => {
    try {
      setUpdatingItemId(order_item_id);
      const res = await UpdateOrderItemStatusEP(order_item_id, { item_status });
      toast[res?.action as "success"](res?.message ?? res?.title);
      if (res?.action === "success") {
        queryClient.invalidateQueries({
          queryKey: ["GetSellerOrderItemsEP", orderData?.order_id],
        });
        queryClient.invalidateQueries({ queryKey: ["GetSellerOrdersEP"] });
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!orderData) return;
    try {
      await DownloadReceiptEP({ orderId: orderData.order_id, flag: "SELLER" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to download receipt");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)" },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "#fff",
            boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 20 }}>🛍️</Typography>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#fff",
                }}
              >
                Order Items
              </Typography>
              {orderData && (
                <Typography
                  sx={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 11,
                    color: "#a5b4fc",
                    fontWeight: 600,
                  }}
                >
                  {orderData.order_number}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* View Payment Button */}
            <Tooltip title="View payment details">
              <IconButton
                onClick={() => setPaymentOpen(true)}
                size="small"
                sx={{
                  color: "#6ee7b7",
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  "&:hover": {
                    color: "#fff",
                    background: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                <PaymentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "#a5b4fc",
                "&:hover": {
                  color: "#fff",
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflowX: "hidden" }}>
          {/* Order Summary Banner */}
          {orderData && (
            <Box
              sx={{
                mx: 3,
                mt: 2,
                mb: 0,
                p: "10px 14px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#6b7280",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  Order #
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#15803d",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {orderData.order_number}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#6b7280",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  Total Items
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#15803d",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {orderData.total_items}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#6b7280",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  Seller Total
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#15803d",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  ₹ {Number(orderData.seller_total).toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#6b7280",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  Order Status
                </Typography>
                <Box sx={{ mt: 0.3 }}>
                  <OrderStatusBadge status={orderData.order_status} />
                </Box>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#6b7280",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  Payment Status
                </Typography>
                <Box sx={{ mt: 0.3 }}>
                  <PaymentStatusBadge
                    status={orderData.payment_status ?? "PENDING"}
                  />
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ px: 3, py: 2.5 }}>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    color: "#6366f1",
                    fontSize: 14,
                  }}
                >
                  ⏳ Loading items...
                </Typography>
              </Box>
            ) : items.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    color: "#9ca3af",
                    fontSize: 14,
                  }}
                >
                  📦 No items found
                </Typography>
              </Box>
            ) : (
              <SectionCard label="Order Items">
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {items.map((item) => {
                    const colors = getOrderStatusColors(item.item_status);
                    return (
                      <Box
                        key={item.order_item_id}
                        sx={{
                          p: "12px 14px",
                          borderRadius: "12px",
                          border: "1.5px solid #e5e7eb",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                      >
                        {/* Book Info */}
                        <Box sx={{ flex: 1, minWidth: 180 }}>
                          <Typography
                            sx={{
                              fontFamily: "'Nunito', sans-serif",
                              fontWeight: 800,
                              fontSize: 13,
                              color: "#111827",
                            }}
                          >
                            {item.book_title}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "'Nunito', sans-serif",
                              fontSize: 11,
                              color: "#6b7280",
                              mt: 0.2,
                            }}
                          >
                            by {item.book_author}
                          </Typography>
                        </Box>

                        {/* Qty & Price */}
                        <Box
                          sx={{ display: "flex", gap: 3, alignItems: "center" }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 10,
                                color: "#9ca3af",
                                fontFamily: "'Nunito', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                fontWeight: 700,
                              }}
                            >
                              Qty
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 800,
                                fontSize: 13,
                                color: "#374151",
                              }}
                            >
                              {item.quantity}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 10,
                                color: "#9ca3af",
                                fontFamily: "'Nunito', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                fontWeight: 700,
                              }}
                            >
                              Price
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 800,
                                fontSize: 13,
                                color: "#374151",
                              }}
                            >
                              ₹ {Number(item.selling_price).toFixed(2)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 10,
                                color: "#9ca3af",
                                fontFamily: "'Nunito', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                fontWeight: 700,
                              }}
                            >
                              Subtotal
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 800,
                                fontSize: 13,
                                color: "#15803d",
                              }}
                            >
                              ₹ {Number(item.subtotal).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Status & Update */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              px: 1.4,
                              py: 0.4,
                              borderRadius: "20px",
                              background: colors.bg,
                              border: `1.5px solid ${colors.border}`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'Nunito', sans-serif",
                                fontSize: 11,
                                fontWeight: 800,
                                color: colors.color,
                              }}
                            >
                              {ORDER_STATUS_LABEL_MAP[item.item_status] ??
                                item.item_status}
                            </Typography>
                          </Box>

                          <Box sx={{ minWidth: 140 }}>
                            <select
                              defaultValue=""
                              disabled={updatingItemId === item.order_item_id}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleUpdateStatus(
                                    item.order_item_id,
                                    e.target.value,
                                  );
                                  e.target.value = "";
                                }
                              }}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: "1.5px solid #e5e7eb",
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 700,
                                fontSize: 12,
                                color:
                                  updatingItemId === item.order_item_id
                                    ? "#9ca3af"
                                    : "#374151",
                                background: "#f9fafb",
                                cursor:
                                  updatingItemId === item.order_item_id
                                    ? "not-allowed"
                                    : "pointer",
                                outline: "none",
                              }}
                            >
                              <option value="" disabled>
                                {updatingItemId === item.order_item_id
                                  ? "Updating..."
                                  : "Update Status"}
                              </option>
                              {ITEM_STATUS_OPTIONS?.filter(
                                (s) => s !== item.item_status,
                              ).map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </SectionCard>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Payment Detail Modal (nested) */}
      <PaymentDetailModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        orderData={orderData}
      />
    </>
  );
}

interface OrderNumberCellRendererProps extends ICellRendererParams<IOrderRow> {
  onDownload: (order: IOrderRow) => void;
}

const OrderNumberCellRenderer = (params: OrderNumberCellRendererProps) => {
  if (!params.data) return null;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        cursor: "pointer",
        gap: 0.5,
        "&:hover .dl-icon": { opacity: 1 },
      }}
      onClick={() => params.onDownload(params.data!)}
    >
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          fontWeight: 800,
          color: "#6366f1",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
        }}
      >
        {params.data.order_number}
      </Typography>
      <DownloadIcon
        className="dl-icon"
        sx={{
          fontSize: 13,
          color: "#6366f1",
          opacity: 0.4,
          transition: "opacity 0.15s",
        }}
      />
    </Box>
  );
};

const OrderStatusCellRenderer = (params: ICellRendererParams<IOrderRow>) => {
  if (!params.data) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <OrderStatusBadge status={params.data.order_status} />
    </Box>
  );
};

const PaymentStatusCellRenderer = (params: ICellRendererParams<IOrderRow>) => {
  if (!params.data) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <PaymentStatusBadge status={params.data.payment_status ?? "PENDING"} />
    </Box>
  );
};

const TotalCellRenderer = (params: ICellRendererParams<IOrderRow>) => {
  if (!params.data) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: "#15803d",
        }}
      >
        ₹ {Number(params.data.seller_total).toFixed(2)}
      </Typography>
    </Box>
  );
};

const DateCellRenderer = (params: ICellRendererParams<IOrderRow>) => {
  if (!params.data) return null;
  const date = new Date(params.data.created_date);
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "#374151",
        }}
      >
        {date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </Typography>
    </Box>
  );
};

interface TotalItemsCellRendererProps extends ICellRendererParams<IOrderRow> {
  onView: (order: IOrderRow) => void;
}

const TotalItemsCellRenderer = (params: TotalItemsCellRendererProps) => {
  if (!params.data) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Box
        onClick={() => params.onView(params.data!)}
        sx={{
          px: 1.5,
          py: 0.3,
          borderRadius: "8px",
          background: "#f5f3ff",
          border: "1.5px solid #ddd6fe",
          cursor: "pointer",
          "&:hover": { background: "#ede9fe", borderColor: "#c4b5fd" },
          transition: "all 0.15s",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 12,
            color: "#7c3aed",
          }}
        >
          {params.data.total_items} items
        </Typography>
      </Box>
    </Box>
  );
};

interface ActionCellRendererProps extends ICellRendererParams<IOrderRow> {
  onView: (order: IOrderRow) => void;
  onDownload: (order: IOrderRow) => void;
  onPayment: (order: IOrderRow) => void;
}

const ActionCellRenderer = (params: ActionCellRendererProps) => {
  const { data, onView, onDownload, onPayment } = params;
  if (!data) return null;
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", height: "100%", gap: 0.8 }}
    >
      <Tooltip title="View order items" placement="top">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onView(data);
          }}
          sx={{
            borderRadius: "8px",
            background: "#eff6ff",
            border: "1.5px solid #bfdbfe",
            color: "#1d4ed8",
            "&:hover": { background: "#dbeafe", borderColor: "#93c5fd" },
          }}
        >
          <VisibilityIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Download receipt" placement="top">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(data);
          }}
          sx={{
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            color: "#15803d",
            "&:hover": { background: "#dcfce7", borderColor: "#86efac" },
          }}
        >
          <DownloadIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="View payment details" placement="top">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onPayment(data);
          }}
          sx={{
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1.5px solid #6ee7b7",
            color: "#059669",
            "&:hover": { background: "#d1fae5", borderColor: "#34d399" },
          }}
        >
          <PaymentIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

interface OrderListPageProps {
  status: IORDER_STATUS;
}

export default function OrderListPage({ status }: OrderListPageProps) {
  const [itemsOpen, setItemsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderRow | null>(null);

  const methods = useForm<{ status: IORDER_STATUS; paymentStatus: string }>({
    defaultValues: {
      status: status || ORDER_STATUS.ALL,
      paymentStatus: "ALL",
    },
  });
  const watchStatus = methods.watch("status");
  const watchPaymentStatus = methods.watch("paymentStatus");

  const {
    data: ordersResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["GetSellerOrdersEP"],
    queryFn: async () => {
      const res = await GetSellerOrdersEP();
      return res ?? [];
    },
  });

  const orders: IOrderRow[] = ordersResponse?.data ?? [];

  const handleView = useCallback((order: IOrderRow) => {
    setSelectedOrder(order);
    setItemsOpen(true);
  }, []);

  const handleDownload = useCallback(async (order: IOrderRow) => {
    try {
      await DownloadReceiptEP({ orderId: order.order_id, flag: "SELLER" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to download receipt");
    }
  }, []);

  const handlePayment = useCallback((order: IOrderRow) => {
    setSelectedOrder(order);
    setPaymentOpen(true);
  }, []);

  React.useEffect(() => {
    methods.setValue("status", status);
  }, [status]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (watchStatus && watchStatus !== ORDER_STATUS.ALL) {
      result = result?.filter((o) => {
        const s = o.order_status?.toUpperCase();
        switch (watchStatus) {
          case ORDER_STATUS.PENDING:
            return s === "PAYMENT_PENDING" || s === "PENDING";
          case ORDER_STATUS.CONFIRMED:
            return s === "CONFIRMED";
          case ORDER_STATUS.SHIPPED:
            return s === "SHIPPED";
          case ORDER_STATUS.DELIVERED:
            return s === "DELIVERED";
          case ORDER_STATUS.CANCELLED:
            return s === "CANCELLED";
          default:
            return true;
        }
      });
    }

    if (watchPaymentStatus && watchPaymentStatus !== "ALL") {
      result = result?.filter(
        (o) => o.payment_status?.toUpperCase() === watchPaymentStatus,
      );
    }

    return result;
  }, [orders, watchStatus, watchPaymentStatus]);

  const columnDefs = useMemo<ColDef<IOrderRow>[]>(
    () => [
      {
        headerName: "#",
        width: 55,
        sortable: false,
        filter: false,
        pinned: "left",
        valueGetter: (p) => Number(p?.node?.rowIndex ?? 0) + 1,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#6b7280",
        } as CellStyle,
      },
      {
        headerName: "Order Number",
        field: "order_number",
        width: 240,
        cellRenderer: OrderNumberCellRenderer,
        cellRendererParams: { onDownload: handleDownload },
      },
      {
        headerName: "Order Status",
        field: "order_status",
        width: 180,
        cellRenderer: OrderStatusCellRenderer,
      },
      {
        headerName: "Payment Status",
        field: "payment_status",
        width: 170,
        cellRenderer: PaymentStatusCellRenderer,
      },
      {
        headerName: "Date",
        field: "created_date",
        width: 150,
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "Total Items",
        field: "total_items",
        width: 130,
        cellRenderer: TotalItemsCellRenderer,
        cellRendererParams: { onView: handleView },
      },
      {
        headerName: "Seller Total (₹)",
        field: "seller_total",
        flex: 1,
        width: 160,
        cellRenderer: TotalCellRenderer,
        resizable: false,
      },
      {
        headerName: "Action",
        width: 130,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onView: handleView,
          onDownload: handleDownload,
          onPayment: handlePayment,
        },
      },
    ],
    [handleView, handleDownload, handlePayment],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: false,
      suppressMovable: false,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    [],
  );

  console.log("filteredOrders-", filteredOrders, orders);

  return (
    <>
      <PageContainer
        title="Seller Orders"
        subtitle="View and manage all your incoming orders"
        icon={<ShoppingBagOutlinedIcon sx={{ color: "#6366f1" }} />}
        actions={
          <FormProvider {...methods}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* Payment Status Filter */}
              <Box sx={{ minWidth: 190 }}>
                <SelectRFH name="paymentStatus">
                  {PAYMENT_STATUS_FILTER_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </SelectRFH>
              </Box>

              {/* Order Status Filter */}
              <Box sx={{ minWidth: 200 }}>
                <SelectRFH name="status">
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </SelectRFH>
              </Box>

              <Tooltip title="Refresh list">
                <IconButton
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    background: "#fff",
                    color: "#6366f1",
                    p: 1,
                    "&:hover": {
                      background: "#f5f3ff",
                      borderColor: "#6366f1",
                    },
                    animation: isFetching ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                >
                  <IconRefresh />
                </IconButton>
              </Tooltip>
            </Box>
          </FormProvider>
        }
      >
        <Box
          sx={{
            flex: 1,
            borderRadius: "14px",
            overflow: "hidden",
            height: "calc(100vh - 170px)",
            minHeight: 400,
          }}
        >
          {isError ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: 32 }}>⚠️</Typography>
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  color: "#ef4444",
                }}
              >
                Failed to load orders
              </Typography>
              <Box
                component="button"
                onClick={() => refetch()}
                sx={{
                  mt: 1,
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  "&:hover": { background: "#4f46e5" },
                }}
              >
                Retry
              </Box>
            </Box>
          ) : (
            <div
              style={{ height: "100%", width: "100%" }}
              className="ag-theme-alpine"
            >
              <AgGridReact<IOrderRow>
                rowData={filteredOrders}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                loading={isLoading || isFetching}
                overlayLoadingTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#6366f1;font-size:14px;">⏳ Loading orders...</span>`}
                overlayNoRowsTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#9ca3af;font-size:14px;">🛍️ No orders found</span>`}
                animateRows={true}
                suppressCellFocus={false}
                getRowId={(p) => p.data.order_id}
                gridOptions={{ theme: agGridTheme }}
                suppressClickEdit={true}
              />
            </div>
          )}
        </Box>
      </PageContainer>

      {/* Order Items Modal */}
      <OrderItemsModal
        open={itemsOpen}
        onClose={() => {
          setItemsOpen(false);
          setSelectedOrder(null);
        }}
        orderData={selectedOrder}
      />

      {/* Standalone Payment Modal (from action button) */}
      <PaymentDetailModal
        open={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          setSelectedOrder(null);
        }}
        orderData={selectedOrder}
      />
    </>
  );
}
