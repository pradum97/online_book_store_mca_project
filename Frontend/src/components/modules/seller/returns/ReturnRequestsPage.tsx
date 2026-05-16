"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, CellStyle } from "ag-grid-community";
import PageContainer from "@container/PageContainer";
import { agGridTheme } from "@appearance/agGridThemes";
import ReplayIcon from "@mui/icons-material/Replay";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import InventoryIcon from "@mui/icons-material/Inventory";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { FormProvider, useForm } from "react-hook-form";
import SelectRFH from "@lib/SelectRFH";

import {
  AdminGetAllReturnsEP,
  AdminGetReturnStatsEP,
  AdminActionReturnEP,
  type ReturnActionPayload,
} from "@webEndPoints/handlers/sellerOrderWEB/sellerOrderWEB";
import { toast } from "react-toastify";

interface ReturnRow {
  return_id: string;
  order_id: string;
  order_item_id: string;
  return_reason: string;
  return_sub_reason: string;
  description: string;
  return_status: string;
  admin_remark: string;
  refund_amount: string;
  refund_date: string;
  created_date: string;
  actioned_date: string;
  order_number: string;
  book_title: string;
  book_author: string;
  quantity: number;
  subtotal: string;
  mrp: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
}

interface ReturnStats {
  pending: string;
  approved: string;
  rejected: string;
  picked_up: string;
  refunded: string;
  total: string;
  total_refunded: string;
}

const RETURN_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  APPROVED: {
    label: "Approved",
    color: "#1d4ed8",
    bg: "#dbeafe",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  REJECTED: {
    label: "Rejected",
    color: "#b91c1c",
    bg: "#fee2e2",
    border: "#fecaca",
    dot: "#ef4444",
  },
  PICKED_UP: {
    label: "Picked Up",
    color: "#6d28d9",
    bg: "#ede9fe",
    border: "#ddd6fe",
    dot: "#8b5cf6",
  },
  REFUNDED: {
    label: "Refunded",
    color: "#15803d",
    bg: "#dcfce7",
    border: "#bbf7d0",
    dot: "#22c55e",
  },
};

const REASON_LABELS: Record<string, string> = {
  DAMAGED_PRODUCT: "Product Damaged",
  WRONG_ITEM: "Wrong Item",
  NOT_AS_DESCRIBED: "Not as Described",
  MISSING_PARTS: "Missing Parts",
  POOR_QUALITY: "Poor Quality",
  CHANGED_MIND: "Changed Mind",
  OTHER: "Other",
};

const getStatusCfg = (status: string) =>
  RETURN_STATUS_CONFIG[status] ?? {
    label: status,
    color: "#374151",
    bg: "#f3f4f6",
    border: "#e5e7eb",
    dot: "#9ca3af",
  };

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatCurrency = (val: string | number) =>
  `₹${parseFloat(String(val || 0)).toLocaleString("en-IN")}`;

const NEXT_ACTIONS: Record<
  string,
  {
    action: ReturnActionPayload["action"];
    label: string;
    color: string;
    icon: React.ReactNode;
  }[]
> = {
  PENDING: [
    {
      action: "APPROVED",
      label: "Approve",
      color: "#1d4ed8",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />,
    },
    {
      action: "REJECTED",
      label: "Reject",
      color: "#b91c1c",
      icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} />,
    },
  ],
  APPROVED: [
    {
      action: "PICKED_UP",
      label: "Mark Picked Up",
      color: "#6d28d9",
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />,
    },
    {
      action: "REJECTED",
      label: "Reject",
      color: "#b91c1c",
      icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} />,
    },
  ],
  PICKED_UP: [
    {
      action: "REFUNDED",
      label: "Mark Refunded",
      color: "#15803d",
      icon: <CurrencyRupeeIcon sx={{ fontSize: 14 }} />,
    },
  ],
};

interface ActionModalProps {
  open: boolean;
  row: ReturnRow | null;
  onClose: () => void;
}

function ActionModal({ open, row, onClose }: ActionModalProps) {
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState<
    ReturnActionPayload["action"] | ""
  >("");
  const [remark, setRemark] = useState("");

  const { mutate: doAction, isPending } = useMutation({
    mutationFn: () =>
      AdminActionReturnEP(row!.return_id, {
        action: selectedAction as ReturnActionPayload["action"],
        remark: remark || undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["AdminReturns"] });
      queryClient.invalidateQueries({ queryKey: ["AdminReturnStats"] });

      if (res?.action === "success") {
        handleClose();
      }

      toast[res?.action as "success"](res?.title);
    },
  });

  const handleClose = () => {
    setSelectedAction("");
    setRemark("");
    onClose();
  };

  if (!row) return null;

  const actions = NEXT_ACTIONS[row.return_status] ?? [];
  const cfg = getStatusCfg(row.return_status);
  const chosen = actions.find((a) => a.action === selectedAction);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          maxWidth: 480,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ReplayIcon sx={{ fontSize: 22, color: "#4338ca" }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Take Action on Return
            </Typography>
            <Typography
              sx={{
                fontSize: 11.5,
                color: "#64748b",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {row.order_number} · {row.book_title}
            </Typography>
          </Box>
        </Box>

        {/* Return info strip */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
          }}
        >
          {[
            { label: "Customer", value: row.customer_name },
            {
              label: "Reason",
              value: REASON_LABELS[row.return_reason] ?? row.return_reason,
            },
            { label: "Refund Amt", value: formatCurrency(row.refund_amount) },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                background: "#fff",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                p: 1.2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  fontFamily: "'Nunito', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  fontWeight: 700,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "#0f172a",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  mt: 0.2,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* Current status */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <Typography
            sx={{
              fontSize: 12,
              color: "#64748b",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Current status:
          </Typography>
          <Chip
            label={cfg.label}
            size="small"
            sx={{
              fontSize: 11,
              height: 22,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              background: cfg.bg,
              color: cfg.color,
              border: `1.5px solid ${cfg.border}`,
              borderRadius: "6px",
            }}
          />
        </Box>

        {actions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography
              sx={{
                fontSize: 14,
                color: "#94a3b8",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              No further actions available for this return.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Action buttons */}
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#374151",
                fontFamily: "'Nunito', sans-serif",
                mb: 1.2,
                textTransform: "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              Choose Action
            </Typography>
            <Box sx={{ display: "flex", gap: 1.2, mb: 2.5, flexWrap: "wrap" }}>
              {actions.map((a) => (
                <Box
                  key={a.action}
                  onClick={() => setSelectedAction(a.action)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 1.8,
                    py: 1,
                    borderRadius: "10px",
                    border: "2px solid",
                    borderColor:
                      selectedAction === a.action ? a.color : "#e2e8f0",
                    background:
                      selectedAction === a.action ? `${a.color}12` : "#fff",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: a.color,
                      background: `${a.color}08`,
                    },
                  }}
                >
                  <Box sx={{ color: a.color }}>{a.icon}</Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: selectedAction === a.action ? a.color : "#374151",
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    {a.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Description */}
            {row.description && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  background: "#f8faff",
                  border: "1px solid #e2e8f0",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#64748b",
                    fontFamily: "'Nunito', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                  }}
                >
                  Customer Note
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "#374151",
                    fontFamily: "'Nunito', sans-serif",
                    mt: 0.4,
                    lineHeight: 1.6,
                  }}
                >
                  {row.description}
                </Typography>
              </Box>
            )}

            {/* Admin remark */}
            <TextField
              label="Admin Remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
              placeholder="Add a note for internal tracking or customer communication..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 13,
                },
                "& label": { fontFamily: "'Nunito', sans-serif", fontSize: 13 },
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
          gap: 1.2,
          "& > *": { flex: 1, m: "0 !important" },
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isPending}
          variant="outlined"
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            py: 1.1,
            borderColor: "#e2e8f0",
            color: "#374151",
          }}
        >
          Close
        </Button>
        {actions.length > 0 && (
          <Button
            onClick={() => doAction()}
            disabled={!selectedAction || isPending}
            variant="contained"
            startIcon={
              isPending ? (
                <CircularProgress size={13} sx={{ color: "#fff" }} />
              ) : (
                (chosen?.icon ?? null)
              )
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              py: 1.1,
              background: chosen
                ? `linear-gradient(135deg, ${chosen.color}, ${chosen.color}cc)`
                : "linear-gradient(135deg, #6366f1, #4f46e5)",
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
              "&:disabled": {
                background: "#e2e8f0",
                color: "#94a3b8",
                boxShadow: "none",
              },
            }}
          >
            {isPending
              ? "Processing..."
              : selectedAction
                ? `Confirm ${chosen?.label}`
                : "Select an Action"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

interface DetailModalProps {
  open: boolean;
  row: ReturnRow | null;
  onClose: () => void;
}

function DetailModal({ open, row, onClose }: DetailModalProps) {
  if (!row) return null;
  const cfg = getStatusCfg(row.return_status);

  const fields = [
    { label: "Order Number", value: row.order_number },
    { label: "Book", value: `${row.book_title} by ${row.book_author}` },
    { label: "Quantity", value: row.quantity },
    { label: "Subtotal", value: formatCurrency(row.subtotal) },
    { label: "Refund Amount", value: formatCurrency(row.refund_amount) },
    { label: "Customer", value: row.customer_name },
    { label: "Email", value: row.customer_email },
    { label: "Mobile", value: row.customer_mobile },
    {
      label: "Return Reason",
      value: REASON_LABELS[row.return_reason] ?? row.return_reason,
    },
    { label: "Sub Reason", value: row.return_sub_reason || "—" },
    { label: "Description", value: row.description || "—" },
    { label: "Admin Remark", value: row.admin_remark || "—" },
    { label: "Requested On", value: formatDate(row.created_date) },
    {
      label: "Actioned On",
      value: row.actioned_date ? formatDate(row.actioned_date) : "—",
    },
    {
      label: "Refunded On",
      value: row.refund_date ? formatDate(row.refund_date) : "—",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          maxWidth: 500,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: "#0f172a",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Return Details
        </Typography>
        <Chip
          label={cfg.label}
          size="small"
          sx={{
            fontSize: 11,
            height: 22,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            background: cfg.bg,
            color: cfg.color,
            border: `1.5px solid ${cfg.border}`,
            borderRadius: "6px",
          }}
        />
      </Box>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {fields.map((f) => (
            <Box
              key={f.label}
              sx={{
                gridColumn: [
                  "Description",
                  "Admin Remark",
                  "Sub Reason",
                  "Book",
                ].includes(f.label)
                  ? "1 / -1"
                  : "auto",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94a3b8",
                  fontFamily: "'Nunito', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                {f.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#0f172a",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 500,
                  mt: 0.2,
                  wordBreak: "break-word",
                }}
              >
                {f.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            borderColor: "#e2e8f0",
            color: "#374151",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
  border,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  loading: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 130,
        borderRadius: "14px",
        border: `1.5px solid ${border}`,
        background: bg,
        px: 2,
        py: 1.8,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "#64748b",
            fontFamily: "'Nunito', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={40} height={22} />
        ) : (
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color,
              fontFamily: "'Nunito', sans-serif",
              lineHeight: 1.2,
              mt: 0.2,
            }}
          >
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function StatusCell(params: ICellRendererParams<ReturnRow>) {
  if (!params.data) return null;
  const cfg = getStatusCfg(params.data.return_status);
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Chip
        label={cfg.label}
        size="small"
        sx={{
          fontSize: 11,
          height: 22,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          background: cfg.bg,
          color: cfg.color,
          border: `1.5px solid ${cfg.border}`,
          borderRadius: "6px",
        }}
      />
    </Box>
  );
}

function ReasonCell(params: ICellRendererParams<ReturnRow>) {
  if (!params.data) return null;
  const label =
    REASON_LABELS[params.data.return_reason] ?? params.data.return_reason;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Box
        sx={{
          px: 1.2,
          py: 0.3,
          borderRadius: "6px",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography
          sx={{
            fontSize: 11.5,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            color: "#374151",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

interface ActionCellProps extends ICellRendererParams<ReturnRow> {
  onAction: (row: ReturnRow) => void;
  onDetail: (row: ReturnRow) => void;
}

function ActionCell(params: ActionCellProps) {
  const { data, onAction, onDetail } = params;
  if (!data) return null;
  const hasActions = !!NEXT_ACTIONS[data.return_status]?.length;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", height: "100%", gap: 0.8 }}
    >
      {/* View detail */}
      <Tooltip title="View Details" placement="top">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDetail(data);
          }}
          sx={{
            borderRadius: "8px",
            background: "#f8faff",
            border: "1.5px solid #e2e8f0",
            color: "#4338ca",
            "&:hover": { background: "#eff6ff" },
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      {/* Take action */}
      {hasActions && (
        <Tooltip title="Take Action" placement="top">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAction(data);
            }}
            sx={{
              borderRadius: "8px",
              background: "#fefce8",
              border: "1.5px solid #fde68a",
              color: "#92400e",
              "&:hover": { background: "#fffbeb" },
            }}
          >
            <ReplayIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

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

export default function ReturnRequestsPage() {
  const queryClient = useQueryClient();
  const [actionRow, setActionRow] = useState<ReturnRow | null>(null);
  const [detailRow, setDetailRow] = useState<ReturnRow | null>(null);

  const methods = useForm({ defaultValues: { statusFilter: "" } });
  const { watch } = methods;
  const statusFilter = watch("statusFilter");

  const { data: stats, isLoading: statsLoading } = useQuery<ReturnStats>({
    queryKey: ["AdminReturnStats"],
    queryFn: async () => {
      const res = await AdminGetReturnStatsEP();
      return res?.data ?? {};
    },
  });

  const {
    data: returnsRes,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["AdminReturns", statusFilter],
    queryFn: async () => {
      const res = await AdminGetAllReturnsEP(
        statusFilter ? { status: statusFilter } : undefined,
      );
      return res?.data ?? { returns: [], total: 0 };
    },
  });

  const returns: ReturnRow[] = returnsRes?.returns ?? [];

  const onAction = useCallback((row: ReturnRow) => setActionRow(row), []);
  const onDetail = useCallback((row: ReturnRow) => setDetailRow(row), []);

  const columnDefs = useMemo<ColDef<ReturnRow>[]>(
    () => [
      {
        headerName: "#",
        width: 50,
        pinned: "left",
        sortable: false,
        valueGetter: (p) => Number(p?.node?.rowIndex ?? 0) + 1,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "#94a3b8",
          fontWeight: 700,
        } as CellStyle,
      },
      {
        headerName: "Order No.",
        field: "order_number",
        width: 180,
        pinned: "left",
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 12.5,
          color: "#0f172a",
        } as CellStyle,
      },
      {
        headerName: "Book",
        field: "book_title",
        minWidth: 180,
        flex: 1,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#1e293b",
        } as CellStyle,
      },
      {
        headerName: "Customer",
        field: "customer_name",
        width: 160,
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12.5,
          color: "#374151",
        } as CellStyle,
      },
      {
        headerName: "Reason",
        field: "return_reason",
        width: 200,
        cellRenderer: ReasonCell,
      },
      {
        headerName: "Status",
        field: "return_status",
        width: 130,
        cellRenderer: StatusCell,
      },
      {
        headerName: "Refund Amt",
        field: "refund_amount",
        width: 120,
        valueFormatter: (p) => formatCurrency(p.value),
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 13,
          color: "#15803d",
        } as CellStyle,
      },
      {
        headerName: "Requested On",
        field: "created_date",
        width: 130,
        valueFormatter: (p) => formatDate(p.value),
        cellStyle: {
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "#64748b",
        } as CellStyle,
      },
      {
        headerName: "Actions",
        width: 100,
        pinned: "right",
        sortable: false,
        cellRenderer: ActionCell,
        cellRendererParams: { onAction, onDetail },
      },
    ],
    [onAction, onDetail],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: false,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    [],
  );

  const statCards = [
    {
      label: "Total",
      value: stats?.total ?? 0,
      color: "#4338ca",
      bg: "#f0f4ff",
      border: "#c7d2fe",
      icon: <InventoryIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      color: "#92400e",
      bg: "#fef3c7",
      border: "#fde68a",
      icon: <ReplayIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Approved",
      value: stats?.approved ?? 0,
      color: "#1d4ed8",
      bg: "#dbeafe",
      border: "#bfdbfe",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Picked Up",
      value: stats?.picked_up ?? 0,
      color: "#6d28d9",
      bg: "#ede9fe",
      border: "#ddd6fe",
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Refunded",
      value: stats?.refunded ?? 0,
      color: "#15803d",
      bg: "#dcfce7",
      border: "#bbf7d0",
      icon: <CurrencyRupeeIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Rejected",
      value: stats?.rejected ?? 0,
      color: "#b91c1c",
      bg: "#fee2e2",
      border: "#fecaca",
      icon: <CancelOutlinedIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>

      <PageContainer
        title="Return Requests"
        subtitle="Review and manage customer return requests"
        icon={<ReplayIcon sx={{ color: "#4338ca" }} />}
        actions={
          <FormProvider {...methods}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box sx={{ width: 170 }}>
                <SelectRFH
                  name="statusFilter"
                  label=""
                  placeholder="All Statuses"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="PICKED_UP">Picked Up</MenuItem>
                  <MenuItem value="REFUNDED">Refunded</MenuItem>
                </SelectRFH>
              </Box>

              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    color: "#4338ca",
                    p: 0.6,
                    "&:hover": {
                      background: "#f0f4ff",
                      borderColor: "#4338ca",
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
        {/* ── Stats Row ── */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2.5 }}>
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} loading={statsLoading} />
          ))}
        </Box>

        {/* ── AG Grid ── */}
        <Box
          sx={{
            borderRadius: "14px",
            overflow: "hidden",
            height: "calc(100vh - 270px)",
            minHeight: 380,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{ height: "100%", width: "100%" }}
            className="ag-theme-alpine"
          >
            <AgGridReact<ReturnRow>
              rowData={returns}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              loading={isLoading || isFetching}
              overlayLoadingTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#4338ca;font-size:14px;">⏳ Loading returns...</span>`}
              overlayNoRowsTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#94a3b8;font-size:14px;">🎉 No return requests found</span>`}
              animateRows={true}
              getRowId={(p) => p.data.return_id}
              gridOptions={{ theme: agGridTheme }}
              suppressClickEdit={true}
              rowStyle={{ fontFamily: "'Nunito', sans-serif" }}
            />
          </div>
        </Box>
      </PageContainer>

      {/* Action Modal */}
      <ActionModal
        open={!!actionRow}
        row={actionRow}
        onClose={() => setActionRow(null)}
      />

      {/* Detail Modal */}
      <DetailModal
        open={!!detailRow}
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />
    </>
  );
}
