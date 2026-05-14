"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@container/Pagecontainer";
import { agGridTheme } from "@appearance/agGridThemes";
import {
  GetAllSellersEP,
  UpdateSellerStatusEP,
} from "@webEndPoints/handlers/sellerWEB/sellerWEB";
import { IGetAllSellersEP } from "@webEndPoints/handlers/sellerWEB/IsellerWEB";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SearchIcon from "@mui/icons-material/Search";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SellerActionDialog, { DialogAction } from "./SellerActionDialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type SellerStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_CFG: Record<
  SellerStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  APPROVED: {
    label: "Approved",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  REJECTED: {
    label: "Rejected",
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fecaca",
  },
};

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

function Tab({
  icon,
  label,
  count,
  color,
  bg,
  border,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  bg: string;
  border: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        px: 2,
        py: 0.9,
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.15s",
        border: active ? `1.5px solid ${border}` : "1.5px solid #e5e7eb",
        background: active ? bg : "#fff",
        "&:hover": { border: `1.5px solid ${border}`, background: bg },
        boxShadow: active
          ? `0 2px 8px ${border}66`
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <Box sx={{ color: active ? color : "#9ca3af" }}>{icon}</Box>
      <Box>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: active ? color : "#9ca3af",
            lineHeight: 1,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: active ? color : "#1f2937",
            lineHeight: 1.1,
          }}
        >
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

export default function SellerListPage() {
  const router = useRouter();

  const [rows, setRows] = useState<IGetAllSellersEP[]>([]);
  const [tab, setTab] = useState<SellerStatus | "ALL">("ALL");
  const [isConfirming, setIsConfirming] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{
    open: boolean;
    action: DialogAction | null;
    seller: IGetAllSellersEP | null;
  }>({ open: false, action: null, seller: null });

  const { data: sellers = [], isLoading } = useQuery<IGetAllSellersEP[]>({
    queryKey: ["GetAllSellersEP"],
    queryFn: async () => {
      const res = await GetAllSellersEP();
      return res?.data?.sellers ?? [];
    },
  });

  React.useEffect(() => {
    if (sellers?.length > 0) setRows(sellers);
  }, [sellers]);

  const counts = useMemo(
    () => ({
      ALL: rows?.length ?? 0,
      PENDING: rows?.filter((r) => r.status === "PENDING").length ?? 0,
      APPROVED: rows?.filter((r) => r.status === "APPROVED").length ?? 0,
      REJECTED: rows?.filter((r) => r.status === "REJECTED").length ?? 0,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    let d = tab === "ALL" ? rows : rows?.filter((r) => r.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      d = d?.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          r.business_name?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q),
      );
    }
    return d;
  }, [rows, tab, search]);

  const openConfirm = useCallback(
    (action: DialogAction, seller: IGetAllSellersEP) =>
      setConfirm({ open: true, action, seller }),
    [],
  );

  const closeConfirm = useCallback(
    () => setConfirm({ open: false, action: null, seller: null }),
    [],
  );

  const queryClient = useQueryClient();

  const handleConfirm = useCallback(
    async (rejectionMessage?: string) => {
      if (!confirm.seller || !confirm.action) return;

      try {
        setIsConfirming(true);

        const payload = {
          seller_id: confirm.seller.seller_id,
          action: confirm.action,
          message: confirm.action === "REJECT" ? rejectionMessage : "",
        };

        const res = await UpdateSellerStatusEP(
          confirm.seller.seller_id,
          payload,
        );

        toast[res?.action as "success" | "error"](
          (res?.message ?? res?.title) || "Status updated successfully",
        );

        if (res?.action === "success") {
          const newStatus =
            confirm.action === "APPROVE" ? "APPROVED" : "REJECTED";

          setRows((prev) =>
            prev?.map((r) =>
              r.seller_id === confirm.seller!.seller_id
                ? { ...r, status: newStatus }
                : r,
            ),
          );
        }

        console.log("Status Updated:", res);

        queryClient.invalidateQueries({
          queryKey: ["GetAllSellersEP"],
        });
      } catch (err) {
        console.error("Error updating status", err);
        setRows((prev) =>
          prev?.map((r) =>
            r.seller_id === confirm.seller!.seller_id
              ? { ...r, status: confirm.seller!.status }
              : r,
          ),
        );
      } finally {
        setIsConfirming(false);
        closeConfirm();
      }
    },
    [confirm, closeConfirm, queryClient],
  );

  const Actions = useCallback(
    (p: ICellRendererParams<IGetAllSellersEP>) => (
      <Box
        sx={{ display: "flex", gap: 0.5, alignItems: "center", height: "100%" }}
      >
        <Tooltip title="View Details" arrow>
          <IconButton
            size="small"
            onClick={() => router.push(`/admin/sellers/${p.data?.seller_id}`)}
            sx={{
              color: "#6d28d9",
              border: "1.5px solid #ede9fe",
              borderRadius: "7px",
              p: "4px",
              "&:hover": { background: "#ede9fe" },
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        {p.data?.status !== "APPROVED" && (
          <Tooltip title="Approve" arrow>
            <IconButton
              size="small"
              onClick={() => openConfirm("APPROVE", p.data!)}
              sx={{
                color: "#065f46",
                border: "1.5px solid #a7f3d0",
                borderRadius: "7px",
                p: "4px",
                "&:hover": { background: "#d1fae5" },
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
        {p.data?.status !== "REJECTED" && (
          <Tooltip title="Reject" arrow>
            <IconButton
              size="small"
              onClick={() => openConfirm("REJECT", p.data!)}
              sx={{
                color: "#b91c1c",
                border: "1.5px solid #fecaca",
                borderRadius: "7px",
                p: "4px",
                "&:hover": { background: "#fee2e2" },
              }}
            >
              <CancelOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    [router, openConfirm],
  );

  const cols = useMemo<ColDef<IGetAllSellersEP>[]>(
    () => [
      {
        headerName: "#",
        valueGetter: "node.rowIndex + 1",
        width: 50,
        sortable: false,
        filter: false,
        pinned: "left",
        cellStyle: { color: "#9ca3af", fontSize: 12, fontWeight: 600 },
      },
      {
        headerName: "Seller",
        field: "full_name",
        flex: 1,
        minWidth: 200,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<IGetAllSellersEP>) => {
          const a = av(p.data?.full_name || "A");
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                height: "100%",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: a.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: a.color,
                  flexShrink: 0,
                }}
              >
                {initials(p.data?.full_name || "?")}
              </Box>
              <Box>
                <Box
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.3,
                  }}
                >
                  {p.data?.full_name}
                </Box>
                <Box
                  sx={{
                    fontSize: 11,
                    color: "#7c3aed",
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {p.data?.seller_number}
                </Box>
              </Box>
            </Box>
          );
        },
      },
      {
        headerName: "Business",
        field: "business_name",
        flex: 1,
        minWidth: 180,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<IGetAllSellersEP>) => (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              lineHeight: 1.3,
            }}
          >
            <Box sx={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
              {p.data?.business_name}
            </Box>
            <Box sx={{ fontSize: 11, color: "#6b7280", mt: 0.2 }}>
              {p.data?.business_type}
            </Box>
          </Box>
        ),
      },
      {
        headerName: "Contact",
        field: "email",
        flex: 1,
        minWidth: 200,
        cellRenderer: (p: ICellRendererParams<IGetAllSellersEP>) => (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              lineHeight: 1.3,
            }}
          >
            <Box sx={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>
              {p.data?.email}
            </Box>
            <Box sx={{ fontSize: 11, color: "#9ca3af", mt: 0.2 }}>
              +91 {p.data?.mobile}
            </Box>
          </Box>
        ),
      },
      {
        headerName: "Location",
        field: "city",
        width: 165,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<IGetAllSellersEP>) => (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              fontSize: 12,
              color: "#374151",
              gap: 0.8,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#c4b5fd",
                flexShrink: 0,
              }}
            />
            {p.data?.city}, {p.data?.state}
          </Box>
        ),
      },
      {
        headerName: "Applied On",
        field: "created_date",
        width: 125,
        sortable: true,
        filter: false,
        cellRenderer: (p: ICellRendererParams<IGetAllSellersEP>) => (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            {new Date(p.data?.created_date ?? "").toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Box>
        ),
      },
      {
        headerName: "Status",
        field: "status",
        width: 115,
        sortable: false,
        resizable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<IGetAllSellersEP>) => {
          const s = STATUS_CFG[p.data?.status as SellerStatus];
          if (!s) return null;
          return (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.7,
                  px: 1.2,
                  py: 0.5,
                  borderRadius: "6px",
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.color,
                    lineHeight: 1,
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        headerName: "Actions",
        field: "actions" as any,
        width: 125,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: Actions,
      },
    ],
    [Actions],
  );

  return (
    <>
      <PageContainer
        title="Seller Applications"
        subtitle="Review and manage seller account requests"
        icon={<PeopleAltOutlinedIcon />}
        actions={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", gap: 0.8 }}>
              <Tab
                icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
                label="All"
                count={counts.ALL}
                color="#6d28d9"
                bg="#ede9fe"
                border="#c4b5fd"
                active={tab === "ALL"}
                onClick={() => setTab("ALL")}
              />
              <Tab
                icon={<HourglassEmptyIcon sx={{ fontSize: 18 }} />}
                label="Pending"
                count={counts.PENDING}
                color="#92400e"
                bg="#fffbeb"
                border="#fde68a"
                active={tab === "PENDING"}
                onClick={() => setTab("PENDING")}
              />
              <Tab
                icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                label="Approved"
                count={counts.APPROVED}
                color="#065f46"
                bg="#ecfdf5"
                border="#a7f3d0"
                active={tab === "APPROVED"}
                onClick={() => setTab("APPROVED")}
              />
              <Tab
                icon={<CancelIcon sx={{ fontSize: 18 }} />}
                label="Rejected"
                count={counts.REJECTED}
                color="#991b1b"
                bg="#fef2f2"
                border="#fecaca"
                active={tab === "REJECTED"}
                onClick={() => setTab("REJECTED")}
              />
            </Box>
            <TextField
              size="small"
              placeholder="Search sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 210,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontSize: 13,
                  background: "#fff",
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#c4b5fd" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
                "& input": { color: "#111827" },
              }}
            />
          </Box>
        }
      >
        <Box
          className="ag-theme-alpine"
          sx={{
            width: "100%",
            height: "calc(100vh - 170px)",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <AgGridReact<IGetAllSellersEP>
            rowData={filtered}
            columnDefs={cols}
            rowHeight={48}
            animateRows
            pagination
            paginationPageSize={20}
            suppressCellFocus
            gridOptions={{ theme: agGridTheme }}
            loading={isLoading}
          />
        </Box>
      </PageContainer>

      <SellerActionDialog
        open={confirm.open}
        action={confirm.action}
        sellerName={confirm.seller?.full_name ?? ""}
        sellerNumber={confirm.seller?.seller_number ?? ""}
        businessName={confirm.seller?.business_name}
        businessType={confirm.seller?.business_type}
        city={confirm.seller?.city}
        state={confirm.seller?.state}
        onConfirm={handleConfirm}
        onClose={closeConfirm}
        request_number={confirm.seller?.request_number}
        isLoading={isConfirming}
      />
    </>
  );
}
