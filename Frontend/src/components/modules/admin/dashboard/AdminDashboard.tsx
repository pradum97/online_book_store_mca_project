"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Tab,
  Tabs,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "react-toastify";
import {
  GetAllSellersEP,
  UpdateSellerStatusEP,
  DeleteSellerEP,
} from "@webEndPoints/handlers/sellerWEB/sellerWEB";
import { GetAllUsersEP } from "@webEndPoints/handlers/adminWEB/adminWEB";
import { agGridTheme } from "@appearance/agGridThemes";
import { UpdateUserStatusEP } from "@webEndPoints/handlers/userWEB/userWEB";

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  gradient: string;
  shadow: string;
  change?: string;
}

const StatCard = ({
  label,
  value,
  icon,
  gradient,
  shadow,
  change,
}: StatCardProps) => (
  <Box
    sx={{
      background: gradient,
      borderRadius: "20px",
      p: 3,
      flex: 1,
      minWidth: 180,
      boxShadow: shadow,
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.25s, box-shadow 0.25s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: shadow.replace("0.18", "0.32"),
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.12)",
      },
    }}
  >
    <Typography sx={{ fontSize: 32, lineHeight: 1 }}>{icon}</Typography>
    <Typography
      sx={{
        fontSize: 32,
        fontWeight: 900,
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        mt: 1,
        letterSpacing: -1,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
      }}
    >
      {label}
    </Typography>
    {change && (
      <Typography
        sx={{ fontSize: 11, color: "rgba(255,255,255,0.7)", mt: 0.5 }}
      >
        {change}
      </Typography>
    )}
  </Box>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  PENDING: { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
  APPROVED: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  ACTIVE: { bg: "#dbeafe", color: "#1e40af", label: "Active" },
  SUSPENDED: { bg: "#fce7f3", color: "#9d174d", label: "Suspended" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] ?? {
    bg: "#f3f4f6",
    color: "#374151",
    label: status,
  };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.5,
        py: 0.4,
        borderRadius: "20px",
        background: cfg.bg,
        border: `1.5px solid ${cfg.color}30`,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: cfg.color,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {cfg.label}
      </Typography>
    </Box>
  );
};

// ─── Rejection Dialog ─────────────────────────────────────────────────────────

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (msg: string) => void;
  loading: boolean;
  sellerName: string;
}

const RejectDialog = ({
  open,
  onClose,
  onConfirm,
  loading,
  sellerName,
}: RejectDialogProps) => {
  const [msg, setMsg] = useState("");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 800,
          fontSize: 18,
          color: "#be123c",
        }}
      >
        ❌ Reject Seller
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#6b7280",
            mb: 2,
          }}
        >
          Please provide a reason for rejecting <b>{sellerName}</b>.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Rejection reason..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: "10px",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(msg)}
          disabled={!msg.trim() || loading}
          variant="contained"
          sx={{
            borderRadius: "10px",
            background: "#be123c",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "none",
            "&:hover": { background: "#9f1239" },
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            "Reject"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const {
    data: sellersResp,
    isLoading: sellersLoading,
    refetch: refetchSellers,
    isFetching: sellersFetching,
  } = useQuery({
    queryKey: ["AdminAllSellers"],
    queryFn: async () => {
      const res = await GetAllSellersEP();
      return (
        res?.data ?? {
          sellers: [],
          summary: { total: 0, pending: 0, approved: 0, rejected: 0 },
        }
      );
    },
  });

  const {
    data: usersResp,
    isLoading: usersLoading,
    refetch: refetchUsers,
    isFetching: usersFetching,
  } = useQuery({
    queryKey: ["AdminAllUsers"],
    queryFn: async () => {
      const res = await GetAllUsersEP();
      return (
        res?.data ?? {
          users: [],
          summary: { total: 0, active: 0, suspended: 0 },
        }
      );
    },
  });

  const sellers: any[] = sellersResp?.sellers ?? [];
  const summary = sellersResp?.summary ?? {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const users: any[] = usersResp?.users ?? [];
  const userSummary = usersResp?.summary ?? {
    total: 0,
    active: 0,
    suspended: 0,
  };

  // ── Seller Actions ────────────────────────────────────────────────────────

  const handleApprove = useCallback(
    async (seller: any) => {
      try {
        setActionLoading(seller.seller_id);
        const res = await UpdateSellerStatusEP(seller.seller_id, {
          action: "APPROVE",
          seller_id: seller.seller_id,
        });
        toast.success(res?.message ?? "Seller approved");
        queryClient.invalidateQueries({ queryKey: ["AdminAllSellers"] });
      } catch (e: any) {
        toast.error(e?.message || "Failed");
      } finally {
        setActionLoading(null);
      }
    },
    [queryClient],
  );

  const handleRejectConfirm = useCallback(
    async (msg: string) => {
      if (!rejectTarget) return;
      try {
        setActionLoading(rejectTarget.seller_id);
        const res = await UpdateSellerStatusEP(rejectTarget.seller_id, {
          action: "REJECT",
          message: msg,
          seller_id: rejectTarget.seller_id,
        });
        toast.success(res?.message ?? "Seller rejected");
        queryClient.invalidateQueries({ queryKey: ["AdminAllSellers"] });
        setRejectTarget(null);
      } catch (e: any) {
        toast.error(e?.message || "Failed");
      } finally {
        setActionLoading(null);
      }
    },
    [rejectTarget, queryClient],
  );

  const handleDeleteSeller = useCallback(
    async (seller: any) => {
      if (!window.confirm(`Deactivate "${seller.full_name}"?`)) return;
      try {
        setActionLoading(seller.seller_id);
        const res = await DeleteSellerEP(seller.seller_id);
        toast.success(res?.message ?? "Seller deactivated");
        queryClient.invalidateQueries({ queryKey: ["AdminAllSellers"] });
      } catch (e: any) {
        toast.error(e?.message || "Failed");
      } finally {
        setActionLoading(null);
      }
    },
    [queryClient],
  );

  // ── User Actions ──────────────────────────────────────────────────────────

  const handleUserAction = useCallback(
    async (user: any, action: "suspend" | "unsuspend") => {
      try {
        setActionLoading(user.user_id);
        if (action === "suspend") {
          const res = await UpdateUserStatusEP(user.user_id, "SUSPENDED");
          toast.success(res?.message ?? "User suspended");
        } else {
          const res = await UpdateUserStatusEP(user.user_id, "ACTIVE");
          toast.success(res?.message ?? "User unsuspended");
        }
        queryClient.invalidateQueries({ queryKey: ["AdminAllUsers"] });
      } catch (e: any) {
        toast.error(e?.message || "Failed");
      } finally {
        setActionLoading(null);
      }
    },
    [queryClient],
  );

  // ── Seller Column Defs ─────────────────────────────────────────────────────

  const sellerColDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "#",
        width: 50,
        valueGetter: (p) => (p?.node?.rowIndex ?? 0) + 1,
        pinned: "left",
        sortable: false,
      },
      {
        headerName: "Seller",
        field: "full_name",
        minWidth: 180,
        flex: 1,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams) => {
          if (!p.data) return null;
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: "100%",
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "#6366f1",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {p.data.first_name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {p.data.full_name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  {p.data.email}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        headerName: "Business",
        field: "business_name",
        width: 160,
        flex: 1,
        cellStyle: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: "#374151",
        },
      },
      {
        headerName: "Request #",
        field: "request_number",
        width: 140,
        flex: 1,
        cellStyle: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "#6b7280",
        },
      },
      {
        headerName: "GST",
        field: "gst_number",
        width: 140,
        flex: 1,
        cellStyle: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "#6b7280",
        },
      },
      {
        headerName: "Status",
        field: "status",
        width: 120,
        flex: 1,
        cellRenderer: (p: ICellRendererParams) => {
          if (!p.data) return null;
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <StatusBadge status={p.data.status} />
            </Box>
          );
        },
      },
      {
        headerName: "Actions",
        width: 200,
        flex: 1,
        resizable: false,
        sortable: false,
        pinned: "right",
        cellRenderer: (p: ICellRendererParams) => {
          const { data } = p;
          if (!data) return null;
          const isLoading = actionLoading === data.seller_id;
          if (isLoading)
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  pl: 1,
                }}
              >
                <CircularProgress size={16} sx={{ color: "#6366f1" }} />
              </Box>
            );
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                gap: 0.8,
              }}
            >
              {data.status === "PENDING" && (
                <>
                  <Tooltip title="Approve">
                    <Box
                      component="button"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleApprove(data);
                      }}
                      sx={{
                        px: 1.2,
                        py: 0.4,
                        borderRadius: "8px",
                        border: "1.5px solid #bbf7d0",
                        background: "#f0fdf4",
                        color: "#15803d",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        "&:hover": { background: "#dcfce7" },
                      }}
                    >
                      ✓ Approve
                    </Box>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <Box
                      component="button"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setRejectTarget(data);
                      }}
                      sx={{
                        px: 1.2,
                        py: 0.4,
                        borderRadius: "8px",
                        border: "1.5px solid #fecdd3",
                        background: "#fff1f2",
                        color: "#be123c",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        "&:hover": { background: "#ffe4e6" },
                      }}
                    >
                      ✗ Reject
                    </Box>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Deactivate">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSeller(data);
                  }}
                  sx={{
                    borderRadius: "8px",
                    background: "#f9fafb",
                    border: "1.5px solid #e5e7eb",
                    color: "#6b7280",
                    "&:hover": {
                      background: "#fee2e2",
                      borderColor: "#fecdd3",
                      color: "#be123c",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 13 }}>🗑</Typography>
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [actionLoading, handleApprove, handleDeleteSeller],
  );

  // ── User Column Defs ───────────────────────────────────────────────────────

  const userColDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "#",
        width: 50,
        valueGetter: (p) => (p?.node?.rowIndex ?? 0) + 1,
        pinned: "left",
        sortable: false,
      },
      {
        headerName: "User",
        field: "full_name",
        minWidth: 200,
        flex: 1,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams) => {
          if (!p.data) return null;
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: "100%",
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "#0ea5e9",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {p.data.full_name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {p.data.full_name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  {p.data.email}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        headerName: "Mobile",
        field: "mobile",
        width: 140,
        flex: 1,
        cellStyle: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: "#374151",
        },
      },
      {
        headerName: "Type",
        field: "user_type_code",
        width: 120,
        flex: 1,
        cellRenderer: (p: ICellRendererParams) => {
          if (!p.data) return null;
          const isSeller = p.data.user_type_code === "SELLER";
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  px: 1.5,
                  py: 0.4,
                  borderRadius: "20px",
                  background: isSeller ? "#f5f3ff" : "#f0f9ff",
                  border: `1.5px solid ${isSeller ? "#c4b5fd60" : "#bae6fd60"}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    color: isSeller ? "#6d28d9" : "#0369a1",
                  }}
                >
                  {isSeller ? "🏪 Seller" : "👤 User"}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        width: 120,
        flex: 1,
        cellRenderer: (p: ICellRendererParams) => {
          if (!p.data) return null;
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <StatusBadge
                status={p.data.is_suspended ? "SUSPENDED" : "ACTIVE"}
              />
            </Box>
          );
        },
      },
      {
        headerName: "Joined",
        field: "created_date",
        width: 120,
        flex: 1,
        cellRenderer: (p: ICellRendererParams) => {
          if (!p.data) return null;
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: "#6b7280",
                }}
              >
                {new Date(p.data.created_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Typography>
            </Box>
          );
        },
      },
      {
        headerName: "Actions",
        width: 160,
        sortable: false,
        pinned: "right",
        resizable: false,
        cellRenderer: (p: ICellRendererParams) => {
          const { data } = p;
          if (!data) return null;
          const isLoading = actionLoading === data.user_id;
          if (isLoading)
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  pl: 1,
                }}
              >
                <CircularProgress size={16} sx={{ color: "#6366f1" }} />
              </Box>
            );
          const isSuspended = data.is_suspended;
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                gap: 0.8,
              }}
            >
              <Box
                component="button"
                onClick={(e: any) => {
                  e.stopPropagation();
                  handleUserAction(data, isSuspended ? "unsuspend" : "suspend");
                }}
                sx={{
                  px: 1.4,
                  py: 0.4,
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: `1.5px solid ${isSuspended ? "#bbf7d0" : "#fecdd3"}`,
                  background: isSuspended ? "#f0fdf4" : "#fff1f2",
                  color: isSuspended ? "#15803d" : "#be123c",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  "&:hover": { opacity: 0.8 },
                }}
              >
                {isSuspended ? "✓ Unsuspend" : "⊘ Suspend"}
              </Box>
            </Box>
          );
        },
      },
    ],
    [actionLoading, handleUserAction],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    [],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf8ff 100%)",
        p: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 28,
              fontWeight: 900,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: -1,
            }}
          >
            Admin Dashboard 🛡️
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#6b7280",
              mt: 0.5,
            }}
          >
            Manage users & sellers in real-time
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton
            onClick={() => {
              refetchSellers();
              refetchUsers();
            }}
            disabled={sellersFetching || usersFetching}
            sx={{
              borderRadius: "12px",
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#6366f1",
              p: 1,
              animation:
                sellersFetching || usersFetching
                  ? "spin 1s linear infinite"
                  : "none",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            <Typography sx={{ fontSize: 16 }}>↻</Typography>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <StatCard
          label="Total Sellers"
          value={summary.total}
          icon="🏪"
          gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
          shadow="0 8px 32px rgba(99,102,241,0.35)"
        />
        <StatCard
          label="Pending Review"
          value={summary.pending}
          icon="⏳"
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          shadow="0 8px 32px rgba(245,158,11,0.35)"
        />
        <StatCard
          label="Approved"
          value={summary.approved}
          icon="✅"
          gradient="linear-gradient(135deg, #10b981, #059669)"
          shadow="0 8px 32px rgba(16,185,129,0.35)"
        />
        <StatCard
          label="Rejected"
          value={summary.rejected}
          icon="❌"
          gradient="linear-gradient(135deg, #ef4444, #dc2626)"
          shadow="0 8px 32px rgba(239,68,68,0.35)"
        />
        <StatCard
          label="Total Users"
          value={userSummary.total}
          icon="👥"
          gradient="linear-gradient(135deg, #0ea5e9, #0284c7)"
          shadow="0 8px 32px rgba(14,165,233,0.35)"
        />
        <StatCard
          label="Suspended"
          value={userSummary.suspended}
          icon="⊘"
          gradient="linear-gradient(135deg, #ec4899, #db2777)"
          shadow="0 8px 32px rgba(236,72,153,0.35)"
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": {
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "none",
            },
            "& .MuiTabs-indicator": {
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              height: 3,
              borderRadius: 2,
            },
          }}
        >
          <Tab label={`🏪 Seller Applications (${summary.total})`} />
          <Tab label={`👥 User Management (${userSummary.total})`} />
        </Tabs>
      </Box>

      {/* Grid */}
      <Box
        sx={{
          borderRadius: "18px",
          overflow: "hidden",
          height: "calc(100vh - 380px)",
          minHeight: 400,
          boxShadow: "0 4px 24px rgba(99,102,241,0.10)",
        }}
      >
        <div
          style={{ height: "100%", width: "100%" }}
          className="ag-theme-alpine"
        >
          {tab === 0 ? (
            <AgGridReact
              rowData={sellers}
              columnDefs={sellerColDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={20}
              loading={sellersLoading || sellersFetching}
              animateRows={true}
              suppressCellFocus={false}
              getRowId={(p) => p.data.seller_id}
              gridOptions={{ theme: agGridTheme }}
              rowHeight={54}
              overlayLoadingTemplate={`<span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#6366f1;">⏳ Loading sellers...</span>`}
              overlayNoRowsTemplate={`<span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#9ca3af;">🏪 No sellers found</span>`}
            />
          ) : (
            <AgGridReact
              rowData={users}
              columnDefs={userColDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={20}
              loading={usersLoading || usersFetching}
              animateRows={true}
              suppressCellFocus={false}
              getRowId={(p) => p.data.user_id}
              gridOptions={{ theme: agGridTheme }}
              rowHeight={54}
              overlayLoadingTemplate={`<span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#0ea5e9;">⏳ Loading users...</span>`}
              overlayNoRowsTemplate={`<span style="font-family:'DM Sans',sans-serif;font-weight:700;color:#9ca3af;">👥 No users found</span>`}
            />
          )}
        </div>
      </Box>

      <RejectDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        loading={actionLoading === rejectTarget?.seller_id}
        sellerName={rejectTarget?.full_name ?? ""}
      />
    </Box>
  );
}
