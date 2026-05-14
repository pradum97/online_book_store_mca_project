"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
  Skeleton,
  Stack,
} from "@mui/material";
import PageContainer from "@container/Pagecontainer";
import {
  GetSellerByIdEP,
  UpdateSellerStatusEP,
} from "@webEndPoints/handlers/sellerWEB/sellerWEB";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SellerActionDialog, { DialogAction } from "./SellerActionDialog";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { toast } from "react-toastify";

type SellerStatus = "PENDING" | "APPROVED" | "REJECTED";

interface SellerDetail {
  seller_id: string;
  status: SellerStatus;
  created_date: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  request_number: string;
  seller_number: string;
}
interface BusinessDetail {
  business_name: string;
  business_type: string;
  gst_number: string;
  pan_number: string;
  business_email: string;
  business_phone: string;
  years_in_business: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_pincode: string;
}
interface BankDetail {
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: string;
}
interface DocEntry {
  uploaded: boolean;
  url?: string;
}
interface Docs {
  aadhaar_front?: DocEntry;
  aadhaar_back?: DocEntry;
  pan_card?: DocEntry;
  gst_certificate?: DocEntry;
  business_registration?: DocEntry;
  cancelled_cheque?: DocEntry;
}

const STATUS_CFG: Record<
  SellerStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PENDING: {
    label: "Pending Review",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  APPROVED: {
    label: "Approved",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    dot: "#10b981",
  },
  REJECTED: {
    label: "Rejected",
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fecaca",
    dot: "#ef4444",
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

const DOC_KEYS: { key: keyof Docs; label: string }[] = [
  { key: "aadhaar_front", label: "Aadhaar Front" },
  { key: "aadhaar_back", label: "Aadhaar Back" },
  // { key: "pan_card", label: "PAN Card" },
  // { key: "gst_certificate", label: "GST Certificate" },
  // { key: "business_registration", label: "Business Reg." },
  // { key: "cancelled_cheque", label: "Cancelled Cheque" },
];

function InfoField({
  label,
  value,
  mono,
  copyable,
  accent,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  copyable?: boolean;
  accent?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          color: "#9ca3af",
          mb: 0.4,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: accent || "#1f2937",
            fontFamily: mono ? "'Courier New',monospace" : "inherit",
            letterSpacing: mono ? "0.4px" : "normal",
          }}
        >
          {value || "—"}
        </Typography>
        {copyable && value && (
          <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
            <IconButton
              size="small"
              onClick={copy}
              sx={{
                p: "2px",
                color: copied ? "#10b981" : "#d1d5db",
                "&:hover": { color: "#6b7280" },
              }}
            >
              <ContentCopyIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

function Section({
  title,
  icon,
  accentColor,
  accentBg,
  badge,
  children,
  spacing,
  minHeight,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  spacing?: number;
  minHeight?: string;
}) {
  return (
    <Box
      sx={{
        mb: 1,
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: accentBg,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "7px",
              background: "#fff",
              border: `1px solid ${accentColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentColor,
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: "0.6px",
              textTransform: "uppercase",
            }}
          >
            {title}
          </Typography>
        </Box>
        {badge}
      </Box>
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Grid
          container
          spacing={spacing ?? 1}
          sx={{ minHeight: minHeight ?? "auto" }}
        >
          {children}
        </Grid>
      </Box>
    </Box>
  );
}

function DocBadge({
  label,
  uploaded,
  url,
}: {
  label: string;
  uploaded: boolean;
  url?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",

        p: "10px 14px",
        borderRadius: "10px",
        border: `1px solid ${uploaded ? "#a7f3d0" : "#fecaca"}`,
        background: uploaded ? "#f0fdf4" : "#fff5f5",
        transition: "all 0.15s",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        justifyContent: "space-between",
      }}
    >
      <Stack direction={"row"} sx={{ gap: 1.2 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: uploaded ? "#d1fae5" : "#fee2e2",
            color: uploaded ? "#065f46" : "#b91c1c",
          }}
        >
          {uploaded ? (
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
          )}
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: uploaded ? "#065f46" : "#b91c1c",
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              color: uploaded ? "#6ee7b7" : "#fca5a5",
              fontWeight: 600,
            }}
          >
            {uploaded ? "Verified & Uploaded" : "Not Uploaded"}
          </Typography>
        </Box>
      </Stack>
      {uploaded && url && (
        <Tooltip title="View Document" arrow>
          <IconButton
            size="small"
            onClick={() => window.open(url, "_blank")}
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
      )}
    </Box>
  );
}

function FieldSkeleton() {
  return (
    <Box>
      <Skeleton width={60} height={12} sx={{ mb: 0.5 }} />
      <Skeleton width={140} height={18} />
    </Box>
  );
}

export default function SellerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.sellerId as string;

  console.log("SellerStatus-", params);

  const [localStatus, setLocalStatus] = useState<SellerStatus | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    action: DialogAction | null;
  }>({ open: false, action: null });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["GetSellerByIdEP", id],
    queryFn: async () => {
      const res = await GetSellerByIdEP(id);
      return res?.data ?? null;
    },
    enabled: !!id,
  });

  const seller: SellerDetail | null = data?.seller ?? null;
  const business: BusinessDetail | null = data?.business ?? null;
  const bank: BankDetail | null = data?.bank ?? null;
  const docs: Docs = data?.docs ?? {};

  const status: SellerStatus = localStatus ?? seller?.status ?? "PENDING";
  const cfg = STATUS_CFG[status];

  const fullName = seller ? `${seller.first_name} ${seller.last_name}` : "";
  const avColor = av(fullName || "A");
  const docCount = DOC_KEYS.filter(({ key }) => docs[key]?.uploaded).length;
  const totalDocs = DOC_KEYS.length;

  const openConfirm = (action: DialogAction) =>
    setConfirm({ open: true, action });
  const closeConfirm = () => setConfirm({ open: false, action: null });

  const handleConfirm = async (rejectionMessage?: string) => {
    if (!confirm.action) return;

    try {
      setIsConfirming(true);

      const payload = {
        seller_id: id,
        action: confirm.action,
        message: confirm.action === "REJECT" ? rejectionMessage : "",
      };

      const res = await UpdateSellerStatusEP(id, payload);

      toast[res?.action as "success" | "error"](
        (res?.message ?? res?.title) || "Status updated successfully",
      );

      if (res?.action === "success") {
        setLocalStatus(confirm.action === "APPROVE" ? "APPROVED" : "REJECTED");
      }

      console.log("Status Updated:", res);
    } catch (err) {
      console.error("Error updating status", err);
      setLocalStatus(null);
    } finally {
      setIsConfirming(false);
      closeConfirm();
    }
  };

  if (isLoading) {
    return (
      <PageContainer
        title="Loading…"
        subtitle="Fetching seller details"
        icon={<PeopleAltOutlinedIcon />}
      >
        <Box
          sx={{
            mb: 2.5,
            p: "20px 24px",
            borderRadius: "14px",
            border: "1px solid #e0e7ff",
            background: "#f5f3ff",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Skeleton
            variant="rounded"
            width={64}
            height={64}
            sx={{ borderRadius: "16px", flexShrink: 0 }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={200} height={24} />
            <Skeleton width={300} height={16} sx={{ mt: 1 }} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {[1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  mb: 2,
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  p: 2.5,
                }}
              >
                <Skeleton width={160} height={14} sx={{ mb: 2 }} />
                <Grid container spacing={2.5}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <Grid key={j} size={{ xs: 12, sm: 6 }}>
                      <FieldSkeleton />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
          <Box sx={{ width: 360 }}>
            {[1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  mb: 2,
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  p: 2.5,
                }}
              >
                <Skeleton width={120} height={14} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[1, 2, 3, 4].map((j) => (
                    <Grid key={j} size={{ xs: 12, sm: 6 }}>
                      <FieldSkeleton />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        </Box>
      </PageContainer>
    );
  }

  if (isError || !seller) {
    return (
      <PageContainer
        title="Error"
        subtitle="Could not load seller details"
        icon={<PeopleAltOutlinedIcon />}
      >
        <Box sx={{ p: 4, textAlign: "center", color: "#6b7280" }}>
          <Typography sx={{ fontSize: 14 }}>
            Failed to load seller data. Please try again.
          </Typography>
          <Button
            onClick={() => router.back()}
            sx={{ mt: 2, textTransform: "none" }}
          >
            Go Back
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer
        title={fullName}
        subtitle={`${seller.seller_number ?? seller.request_number} · Applied ${new Date(seller.created_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
        icon={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Back to Sellers">
              <IconButton
                size="small"
                onClick={() => router.back()}
                sx={{
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  p: "5px",
                  "&:hover": { background: "#f9fafb", color: "#111827" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <PeopleAltOutlinedIcon />
          </Box>
        }
        actions={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Status pill */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.7,
                px: 1.5,
                py: 0.7,
                borderRadius: "8px",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: cfg.dot,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: cfg.color }}
              >
                {cfg.label}
              </Typography>
            </Box>

            {status !== "APPROVED" && (
              <Button
                size="small"
                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
                onClick={() => openConfirm("APPROVE")}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: "9px",
                  px: 2.5,
                  py: 0.7,
                  color: "#fff",
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
                  boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                  "&:hover": { opacity: 0.9 },
                }}
              >
                Approve
              </Button>
            )}
            {status !== "REJECTED" && (
              <Button
                size="small"
                startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />}
                onClick={() => openConfirm("REJECT")}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: "9px",
                  px: 2.5,
                  py: 0.7,
                  color: "#fff",
                  background: "linear-gradient(135deg,#dc2626,#ef4444)",
                  boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
                  "&:hover": { opacity: 0.9 },
                }}
              >
                Reject
              </Button>
            )}
          </Box>
        }
      >
        {/* ── Identity Hero ── */}
        <Box
          sx={{
            mb: 1,
            p: "10px 10px",
            borderRadius: "14px",
            border: "1px solid #e0e7ff",
            background: "linear-gradient(135deg,#f5f3ff,#eef2ff)",
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "16px",
              background: avColor.bg,
              border: `2px solid ${avColor.color}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: avColor.color,
              flexShrink: 0,
            }}
          >
            {initials(fullName)}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {fullName}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 0.5,
                flexWrap: "wrap",
              }}
            >
              {[
                seller.email,
                `+91 ${seller.mobile}`,
                `${seller.city}, ${seller.state}`,
              ].map((t, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <Box
                      sx={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "#d1d5db",
                      }}
                    />
                  )}
                  <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                    {t}
                  </Typography>
                </React.Fragment>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[
              {
                val: `${docCount}/${totalDocs}`,
                lbl: "Docs",
                color: "#7c3aed",
              },
              {
                val: business?.years_in_business?.split("–")[0]
                  ? `${business.years_in_business.split("–")[0]}+`
                  : "—",
                lbl: "Years",
                color: "#0369a1",
              },
            ].map(({ val, lbl, color }) => (
              <Box
                key={lbl}
                sx={{
                  px: 1.5,
                  py: 0.8,
                  borderRadius: "10px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  textAlign: "center",
                  minWidth: 56,
                }}
              >
                <Typography
                  sx={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}
                >
                  {val}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#9ca3af",
                    mt: 0.3,
                    fontWeight: 600,
                  }}
                >
                  {lbl}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Two-column layout ── */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
          {/* LEFT */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Personal */}
            <Section
              title="Personal Information"
              accentColor="#7c3aed"
              accentBg="#f5f3ff"
              icon={<PersonOutlineIcon sx={{ fontSize: 14 }} />}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="First Name" value={seller.first_name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Last Name" value={seller.last_name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Email" value={seller.email} copyable />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Mobile"
                  value={`+91 ${seller.mobile}`}
                  copyable
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Date of Birth"
                  value={
                    seller.dob
                      ? new Date(seller.dob).toLocaleDateString("en-IN")
                      : ""
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Gender" value={seller.gender} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoField
                  label="Residential Address"
                  value={`${seller.address}, ${seller.city}, ${seller.state} – ${seller.pincode}`}
                />
              </Grid>
            </Section>

            {/* Business */}
            {business && (
              <Section
                title="Business Details"
                accentColor="#0369a1"
                accentBg="#f0f9ff"
                icon={<BusinessOutlinedIcon sx={{ fontSize: 14 }} />}
                badge={
                  business.business_type ? (
                    <Box
                      sx={{
                        px: 1.2,
                        py: 0.4,
                        borderRadius: "6px",
                        background: "#dbeafe",
                        border: "1px solid #93c5fd",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8" }}
                      >
                        {business.business_type}
                      </Typography>
                    </Box>
                  ) : undefined
                }
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Business Name"
                    value={business.business_name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Years in Business"
                    value={business.years_in_business}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="GST Number"
                    value={business.gst_number}
                    mono
                    copyable
                    accent="#0369a1"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="PAN Number"
                    value={business.pan_number}
                    mono
                    copyable
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Business Email"
                    value={business.business_email}
                    copyable
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Business Phone"
                    value={business.business_phone}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField
                    label="Business Address"
                    value={`${business.business_address}, ${business.business_city}, ${business.business_state} – ${business.business_pincode}`}
                  />
                </Grid>
              </Section>
            )}
          </Box>

          {/* RIGHT */}
          <Box sx={{ width: 360, flexShrink: 0 }}>
            {/* Bank */}
            {bank && (
              <Section
                title="Bank Details"
                accentColor="#065f46"
                accentBg="#f0fdf4"
                icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 14 }} />}
              >
                <Grid size={{ xs: 12 }}>
                  <InfoField
                    label="Account Holder"
                    value={bank.account_holder}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Bank Name" value={bank.bank_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Account Type" value={bank.account_type} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField
                    label="Account Number"
                    value={bank.account_number}
                    mono
                    copyable
                    accent="#065f46"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField
                    label="IFSC Code"
                    value={bank.ifsc_code}
                    mono
                    copyable
                  />
                </Grid>
              </Section>
            )}

            <Section
              title="KYC Documents"
              accentColor="#92400e"
              accentBg="#fffbeb"
              icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />}
              minHeight={"174px"}
              badge={
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.4,
                    borderRadius: "6px",
                    background: docCount === totalDocs ? "#d1fae5" : "#fef3c7",
                    border: `1px solid ${docCount === totalDocs ? "#a7f3d0" : "#fde68a"}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: docCount === totalDocs ? "#065f46" : "#92400e",
                    }}
                  >
                    {docCount}/{totalDocs} Uploaded
                  </Typography>
                </Box>
              }
            >
              {DOC_KEYS.map(({ key, label }) => (
                <Grid key={key} size={{ xs: 12 }}>
                  <DocBadge
                    label={label}
                    uploaded={docs[key]?.uploaded ?? false}
                    url={docs[key]?.url}
                  />
                </Grid>
              ))}
            </Section>
          </Box>
        </Box>
      </PageContainer>

      <SellerActionDialog
        open={confirm.open}
        action={confirm.action}
        sellerName={fullName}
        sellerNumber={seller.seller_number}
        businessName={business?.business_name}
        businessType={business?.business_type}
        city={seller.city}
        state={seller.state}
        onConfirm={handleConfirm}
        onClose={closeConfirm}
        request_number={seller?.request_number}
        isLoading={isConfirming}
      />
    </>
  );
}
