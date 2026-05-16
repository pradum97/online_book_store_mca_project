"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import PageContainer from "@container/PageContainer";
import { IGetAllUsersEP } from "@webEndPoints/handlers/userWEB/IuserWEB";
import {
  GetAllUsersEP,
  UpdateUserStatusEP,
} from "@webEndPoints/handlers/userWEB/userWEB";
import { agGridTheme } from "@appearance/agGridThemes";
import PersonIcon from "@mui/icons-material/Person";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED";

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

const IconChevron = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconCheckMark = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const STATUS_CONFIG: Record<
  UserStatus,
  { bg: string; color: string; dot: string; label: string }
> = {
  ACTIVE: { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", label: "Active" },
  SUSPENDED: {
    bg: "#fff7ed",
    color: "#c2410c",
    dot: "#f97316",
    label: "Suspended",
  },
  BLOCKED: {
    bg: "#fff1f2",
    color: "#be123c",
    dot: "#f43f5e",
    label: "Blocked",
  },
};

const ALL_STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "BLOCKED"];

interface ActionCellRendererProps extends ICellRendererParams<IGetAllUsersEP> {
  onStatusChange: (user_id: string, newStatus: UserStatus) => void;
  loadingUserId: string | null;
}

const ActionCellRenderer = (params: ActionCellRendererProps) => {
  const { data, onStatusChange, loadingUserId } = params;
  if (!data) return null;

  const { user_id, status } = data;
  const isLoading = loadingUserId === user_id;

  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const btnRef = useRef<HTMLDivElement>(null);

  const cfg = STATUS_CONFIG[status as UserStatus];

  const handleOpen = (e: any) => {
    e.stopPropagation();

    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setAnchor(rect);
      setOpen((v) => !v);
    }
  };

  React.useEffect(() => {
    if (!open) return;

    const handler = () => setOpen(false);
    document.addEventListener("click", handler);

    return () => document.removeEventListener("click", handler);
  }, [open]);

  if (isLoading) {
    return <CircularProgress size={16} sx={{ color: "#6366f1", ml: "30px" }} />;
  }

  const options = ALL_STATUSES?.filter((s) => s !== status);

  return (
    <>
      <Box
        ref={btnRef}
        onClick={handleOpen}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.8,
          px: 1.4,
          py: 0.5,
          borderRadius: "20px",
          background: cfg.bg,
          border: `1.5px solid ${cfg.dot}60`,
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: cfg.dot,
          }}
        />
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: cfg.color }}>
          {cfg.label}
        </Typography>
        <IconChevron />
      </Box>

      {/* 🔥 PORTAL DROPDOWN */}
      {open &&
        anchor &&
        createPortal(
          <Box
            sx={{
              position: "fixed",
              top: anchor.bottom + 4,
              left: anchor.left,
              zIndex: 999999,
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              minWidth: 180,
            }}
          >
            {options.map((s) => {
              const c = STATUS_CONFIG[s];

              return (
                <Box
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(user_id, s);
                    setOpen(false);
                  }}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { background: `${c.dot}20` },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.color,
                    }}
                  >
                    {c.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>,
          document.body,
        )}
    </>
  );
};
const GenderCellRenderer = (params: ICellRendererParams<IGetAllUsersEP>) => {
  const map: Record<string, string> = {
    MALE: "👨 Male",
    FEMALE: "👩 Female",
    OTHER: "🧑 Other",
  };
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography
        sx={{
          fontSize: 12,
          color: "#374151",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {map[params.data!.gender] ?? params.data!.gender}
      </Typography>
    </Box>
  );
};

const DateCellRenderer = (params: ICellRendererParams<IGetAllUsersEP>) => {
  if (!params.value) return null;
  const d = new Date(params.value);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: "#374151",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </Typography>
      <Typography
        sx={{
          fontSize: 10,
          color: "#9ca3af",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </Typography>
    </Box>
  );
};

const DOBCellRenderer = (params: ICellRendererParams<IGetAllUsersEP>) => {
  if (!params.value) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography
        sx={{
          fontSize: 12,
          color: "#374151",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {new Date(params.value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </Typography>
    </Box>
  );
};

const IsActiveCellRenderer = (params: ICellRendererParams<IGetAllUsersEP>) => {
  const active = params.data!.is_active;
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.6,
          px: 1.2,
          py: 0.4,
          borderRadius: "20px",
          background: active ? "#eff6ff" : "#fff7ed",
          border: `1px solid ${active ? "#bfdbfe" : "#fed7aa"}`,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: active ? "#1d4ed8" : "#c2410c",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {active ? "✓ Yes" : "✗ No"}
        </Typography>
      </Box>
    </Box>
  );
};

export default function UserList() {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const {
    data: usersResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["GetUsersListEP"],
    queryFn: async () => {
      const res = await GetAllUsersEP();
      return res ?? {};
    },
  });

  const users: IGetAllUsersEP[] = usersResponse?.data ?? [];

  const queryClient = useQueryClient();

  const handleStatusChange = useCallback(
    async (user_id: string, newStatus: UserStatus) => {
      try {
        setLoadingUserId(user_id);

        const res = await UpdateUserStatusEP(user_id, newStatus);

        const apiRes = res;

        console.log("apiRes--", apiRes);

        if (apiRes?.action !== "success") {
          toast.error(apiRes?.message || "Status update failed");
          return;
        }

        toast.success(apiRes?.message || "Status updated");

        queryClient.invalidateQueries({ queryKey: ["GetUsersListEP"] });
      } catch (err: any) {
        toast.error(err?.message || "Something went wrong");
      } finally {
        setLoadingUserId(null);
      }
    },
    [queryClient],
  );

  const columnDefs = useMemo<ColDef<IGetAllUsersEP>[]>(
    () => [
      {
        headerName: "#",
        width: 50,
        sortable: false,
        filter: false,
        pinned: "left",
        valueGetter: (params) => Number(params?.node?.rowIndex ?? 0) + 1,
      },
      {
        headerName: "Username",
        field: "username",
        width: 150,
        pinned: "left",
      },
      {
        headerName: "Full Name",
        field: "first_name",
        minWidth: 220,
        pinned: "left",
        flex: 1,
      },
      {
        headerName: "Email",
        field: "email",
        minWidth: 220,
        flex: 1,
      },
      {
        headerName: "Mobile",
        field: "mobile",
        width: 100,
      },
      {
        headerName: "Gender",
        field: "gender",
        width: 80,
        cellRenderer: GenderCellRenderer,
      },
      {
        headerName: "Date of Birth",
        field: "dob",
        width: 100,
        cellRenderer: DOBCellRenderer,
      },
      {
        headerName: "Is Active",
        field: "is_active",
        width: 80,
        cellRenderer: IsActiveCellRenderer,
      },
      {
        headerName: "Joined On",
        field: "created_date",
        minWidth: 160,
        cellRenderer: DateCellRenderer,
        sort: "desc",
        resizable: false,
      },
      {
        headerName: "Action",
        field: "status",
        width: 160,
        sortable: false,

        pinned: "right",
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onStatusChange: handleStatusChange,
          loadingUserId,
        },
      },
    ],
    [handleStatusChange, loadingUserId],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
      suppressMovable: false,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    [],
  );

  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const totalUsers = users.length;
  const activeUsers = users?.filter((u) => u.status === "ACTIVE").length;
  const suspendedUsers = users?.filter((u) => u.status === "SUSPENDED").length;
  const blockedUsers = users?.filter((u) => u.status === "BLOCKED").length;

  return (
    <PageContainer
      title="User List"
      subtitle="Manage user status — Active, Suspended or Blocked"
      icon={<PersonIcon sx={{ color: "#6366f1" }} />}
      actions={
        <Box>
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
                "&:hover": { background: "#f5f3ff", borderColor: "#6366f1" },
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
      }
    >
      {/* <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <StatCard
          label="Total Users"
          value={totalUsers}
          color="#6366f1"
          emoji="👥"
        />
        <StatCard
          label="Active"
          value={activeUsers}
          color="#10b981"
          emoji="✅"
        />
        <StatCard
          label="Suspended"
          value={suspendedUsers}
          color="#f59e0b"
          emoji="⏸️"
        />
        <StatCard
          label="Blocked"
          value={blockedUsers}
          color="#ef4444"
          emoji="🚫"
        />
      </Box> */}

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
              Failed to load users
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
          <div style={gridStyle} className="ag-theme-alpine">
            <AgGridReact<IGetAllUsersEP>
              rowData={users}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              loading={isLoading || isFetching}
              overlayLoadingTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#6366f1;font-size:14px;">⏳ Loading users...</span>`}
              overlayNoRowsTemplate={`<span style="font-family:'Nunito',sans-serif;font-weight:700;color:#9ca3af;font-size:14px;">😕 No users found</span>`}
              animateRows={true}
              suppressCellFocus={false}
              getRowId={(params) => params.data.user_id}
              gridOptions={{ theme: agGridTheme }}
              suppressClickEdit={true}
            />
          </div>
        )}
      </Box>
    </PageContainer>
  );
}
