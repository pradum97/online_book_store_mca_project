"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  MenuItem,
  Divider,
  IconButton,
  Chip,
  LinearProgress,
} from "@mui/material";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import TextFieldRFH from "@lib/TextFieldRFH";
import SelectRFH from "@lib/SelectRFH";
import DatePickerRFH from "@lib/DatePickerRFH";
import PageContainer from "@container/Pagecontainer";
import StoreIcon from "@mui/icons-material/Store";
import ButtonRFH from "@lib/ButtonRFH";
import { toast } from "react-toastify";
import {
  ApplySellerEP,
  GetSellerRequestStatusEP,
} from "@webEndPoints/handlers/sellerWEB/sellerWEB";
import { useQuery } from "@tanstack/react-query";
import { roleDefaultRoute } from "@app/login/page";
import useSession from "@app/auth/session/useSession";
import { IRole } from "@app/auth/lib/session";

const IconPerson = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBusiness = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);
const IconDoc = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconBank = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
);
const IconUpload = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconClose = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function Section({
  icon,
  title,
  subtitle,
  accent,
  gradient,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: gradient,
            color: "#fff",
            boxShadow: `0 4px 12px ${accent}40`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              color: "#1a1a2e",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 11,
              color: "#9ca3af",
              mt: 0.2,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            height: "1px",
            background: `linear-gradient(90deg, ${accent}30, transparent)`,
            ml: 1,
          }}
        />
      </Box>

      <Box
        sx={{
          border: `1.5px solid ${accent}20`,
          borderRadius: "14px",
          p: { xs: 1.5, md: 2 },
          background: `linear-gradient(135deg, ${accent}05 0%, #fff 100%)`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            background: gradient,
            borderRadius: "14px 0 0 14px",
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function FileUpload({
  label,
  hint,
  accept = "image/*,.pdf",
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  accept?: string;
  value: File | null;
  onChange: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          color: "#6b7280",
          mb: 0.5,
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {label}
      </Typography>
      {value ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: "10px 14px",
            borderRadius: "10px",
            border: "1.5px solid #bbf7d0",
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
            }}
          >
            {value.type.includes("pdf") ? "📄" : "🖼️"}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "#166534",
                fontFamily: "'Nunito', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value.name}
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                color: "#22c55e",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              ✓ Uploaded • {(value.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onChange(null)}
            sx={{
              color: "#86efac",
              "&:hover": { color: "#16a34a", background: "#dcfce7" },
            }}
          >
            <IconClose />
          </IconButton>
        </Box>
      ) : (
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) onChange(f);
          }}
          onClick={() => ref.current?.click()}
          sx={{
            border: `2px dashed ${drag ? "#f59e0b" : "#e5e7eb"}`,
            borderRadius: "10px",
            p: "14px 12px",
            textAlign: "center",
            cursor: "pointer",
            background: drag ? "rgba(245,158,11,0.05)" : "#fafafa",
            transition: "all 0.2s",
            "&:hover": {
              border: "2px dashed #f59e0b",
              background: "rgba(245,158,11,0.03)",
            },
          }}
        >
          <Box
            sx={{
              color: "#d1d5db",
              mb: 0.6,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <IconUpload />
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
            }}
          >
            Click or drag & drop
          </Typography>
          {hint && (
            <Typography
              sx={{
                fontSize: 10,
                color: "#c4c4c4",
                mt: 0.3,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {hint}
            </Typography>
          )}
        </Box>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </Box>
  );
}

const STEPS = [
  {
    label: "Personal Info",
    icon: <IconPerson />,
    color: "#6366f1",
    done: false,
  },
  {
    label: "Business Details",
    icon: <IconBusiness />,
    color: "#0ea5e9",
    done: false,
  },
  { label: "KYC Documents", icon: <IconDoc />, color: "#f59e0b", done: false },
  { label: "Bank Details", icon: <IconBank />, color: "#10b981", done: false },
];

const STATS = [{ value: "2-3", label: "Days to Approve" }];

interface SellerFormValues {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  dob: Date | null;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  business_name: string;
  business_type: string;
  gst_number: string;
  pan_number: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_pincode: string;
  years_in_business: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  confirm_account_number: string;
  ifsc_code: string;
  account_type: string;
}

const STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Jharkhand",
  "Bihar",
  "Madhya Pradesh",
];

const defaultValues: SellerFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  mobile: "",
  dob: null,
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  business_name: "",
  business_type: "",
  gst_number: "",
  pan_number: "",
  business_email: "",
  business_phone: "",
  business_address: "",
  business_city: "",
  business_state: "",
  business_pincode: "",
  years_in_business: "",
  account_holder: "",
  bank_name: "",
  account_number: "",
  confirm_account_number: "",
  ifsc_code: "",
  account_type: "",
};

// const defaultValues: SellerFormValues = {
//   first_name: "Pradum",
//   last_name: "Kumar",
//   email: "pradum.kumar@example.com",
//   mobile: "9876543210",
//   dob: new Date("1998-05-15"),
//   gender: "MALE",
//   address: "Near Main Road, Hirapur",
//   city: "Dhanbad",
//   state: "Jharkhand",
//   pincode: "826001",

//   business_name: "Pradum Book Store",
//   business_type: "SOLE_PROPRIETOR",
//   gst_number: "20ABCDE1234F1Z5",
//   pan_number: "ABCDE1234F",
//   business_email: "store@pradumbooks.com",
//   business_phone: "9876543210",
//   business_address: "Bank More, Dhanbad",
//   business_city: "Dhanbad",
//   business_state: "Jharkhand",
//   business_pincode: "826001",
//   years_in_business: "1-3",

//   account_holder: "Pradum Kumar",
//   bank_name: "State Bank of India",
//   account_number: "123456789012",
//   confirm_account_number: "123456789012",
//   ifsc_code: "SBIN0001234",
//   account_type: "SAVINGS",
// };

export default function SellerApplyPage() {
  const { session } = useSession();

  const methods = useForm<SellerFormValues>({
    defaultValues: defaultValues,
  });

  const { getValues, handleSubmit, setFocus } = methods;

  const [segmentProp, setSegmentProp] = React.useState({
    isLoading: false,
  });

  const [docs, setDocs] = useState({
    aadhaar_front: null as File | null,
    aadhaar_back: null as File | null,
    pan_card: null as File | null,
    gst_certificate: null as File | null,
    cancelled_cheque: null as File | null,
    business_registration: null as File | null,
  });

  const setDoc = (key: keyof typeof docs) => (f: File | null) =>
    setDocs((d) => ({ ...d, [key]: f }));

  const {
    data: requestStatus,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["GetSellerRequestStatusEP"],
    queryFn: async () => {
      const res = await GetSellerRequestStatusEP();
      return res?.data ?? {};
    },
  });

  const onSubmit = async () => {
    await handleSubmit(
      async () => {
        await saveSeller();
      },

      (errors) => {
        const firstErrorKey = Object.keys(errors)[0] as keyof SellerFormValues;

        if (firstErrorKey) {
          setFocus(firstErrorKey);

          const el = document.querySelector(`[name="${firstErrorKey}"]`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });

          toast.error(errors[firstErrorKey]?.message as string);
        }
      },
    )();
  };

  const saveSeller = async () => {
    try {
      setSegmentProp((prev) => ({ ...prev, isLoading: true }));

      const values = getValues();

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "dob" && value instanceof Date) {
            const formattedDate = value.toISOString().split("T")[0];
            formData.append(key, formattedDate);
          } else {
            formData.append(key, value as any);
          }
        }
      });

      Object.entries(docs).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const res = await ApplySellerEP(formData);

      const action = res?.action;

      if (action === "success") {
        await refetchStatus();
      }

      toast[action as "success"](res?.title);
    } catch {
      toast.error("Something went wrong. Please try again");
    } finally {
      setSegmentProp((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (statusLoading) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          background: "#f1f5f9",
        }}
      >
        {/* HEADER */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: "#1e293b",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Seller Application Status
        </Typography>

        {/* CARD */}
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 500,
            p: 4,
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          {/* LOADER */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <LinearProgress
              sx={{
                width: "100%",
                height: 6,
                borderRadius: 5,
              }}
            />
          </Box>

          {/* MESSAGE */}
          <Typography variant="h6">Loading Status...</Typography>
          <Typography mt={1} color="text.secondary">
            Please wait while we fetch your application status
          </Typography>
        </Paper>
      </Box>
    );
  }

  console.log("requestStatus--", requestStatus);

  if (requestStatus?.status) {
    const status = requestStatus.status;

    const getConfig = () => {
      switch (status) {
        case "PENDING":
          return {
            title: "⏳ Request Submitted",
            message: "Your request is under review.",
            bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            chip: requestStatus?.request_number
              ? `Request No: ${requestStatus.request_number}`
              : null,
          };

        case "APPROVED":
          return {
            title: "🎉 Congratulations!",
            message:
              requestStatus?.message ?? "Your seller account is approved 🚀",
            bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            chip: requestStatus?.seller_number
              ? `Seller No: ${requestStatus.seller_number}`
              : null,
          };

        case "REJECTED":
          return {
            title: "❌ Request Rejected",
            message:
              requestStatus?.message ||
              "Your request was rejected. Please try again.",
            bg: "linear-gradient(135deg, #fef2f2, #fee2e2)",
            chip: requestStatus?.request_number
              ? `Request No: ${requestStatus.request_number}`
              : null,
          };

        default:
          return {};
      }
    };

    const config = getConfig();

    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          background: "#f1f5f9",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: "#1e293b",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Seller Application Status
        </Typography>

        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 500,
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            background: config.bg,
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-4px)",
            },
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
          }}
        >
          <Typography variant="h5">{config.title}</Typography>

          <Typography mt={1}>{config.message}</Typography>

          {config.chip && <Chip label={config.chip} sx={{ mt: 2 }} />}

          <ButtonRFH
            variant="contained"
            sx={{
              mt: 3,
              borderRadius: 2,
              alignSelf: "center",
            }}
            onClick={() => {
              const redirectPath =
                roleDefaultRoute[session?.user_type_code as IRole] || "/";
              window.location.href = redirectPath ?? "/";
            }}
          >
            Go to Home
          </ButtonRFH>
        </Paper>
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          height: "CALC(100vh - 0px)",
          display: "flex",
          overflow: "hidden",
          fontFamily: "'Nunito', sans-serif",
          background: "#f1f5f9",
        }}
      >
        <PageContainer
          title="Seller Application Form"
          subtitle="Complete all 4 sections • Reviewed within 2–3 business days"
          icon={<StoreIcon />}
          sx={{
            maxWidth: 900,
            width: "100%",
            mx: "auto",
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
          bodySx={{
            maxHeight: "calc(100vh - 105px)",
            overflowX: "hidden",
            overflowY: "scroll",
          }}
          customDivider={
            <Box
              sx={{ display: "flex", gap: 0.8, mb: 2.5, mx: "5px", m: "8px" }}
            >
              {[
                { c: "#6366f1" },
                { c: "#0ea5e9" },
                { c: "#f59e0b" },
                { c: "#10b981" },
              ].map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: `${s.c}30`,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      background: s.c,
                      borderRadius: 2,
                    }}
                  />
                </Box>
              ))}
            </Box>
          }
        >
          <FormProvider {...methods}>
            <Box>
              <Section
                icon={<IconPerson />}
                title="Personal Information"
                subtitle="Your basic personal details"
                accent="#6366f1"
                gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
              >
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="first_name"
                      label="First Name"
                      rules={{ required: "Please enter first name." }}
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="last_name"
                      label="Last Name"
                      rules={{ required: "Please enter last name." }}
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="email"
                      label="Email Address"
                      rules={{
                        required: "Please enter email address.",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="mobile"
                      label="Mobile Number"
                      rules={{
                        required: "Please enter mobile number.",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "10 digits required",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePickerRFH
                      name="dob"
                      label="Date of Birth"
                      rules={{ required: "Please select date of birth." }}
                      maxDate={new Date()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <SelectRFH
                      name="gender"
                      label="Gender"
                      rules={{ required: "Please select gender." }}
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </SelectRFH>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextFieldRFH
                      name="address"
                      label="Residential Address"
                      rules={{ required: "Please enter residential address." }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="city"
                      label="City"
                      rules={{ required: "Please enter city." }}
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SelectRFH
                      name="state"
                      label="State"
                      rules={{ required: "Please select state." }}
                    >
                      {STATES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </SelectRFH>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="pincode"
                      label="Pin Code"
                      rules={{
                        required: "Please enter enter pin code.",
                        pattern: { value: /^[0-9]{6}$/, message: "6 digits" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section
                icon={<IconBusiness />}
                title="Business Details"
                subtitle="Your shop or company information"
                accent="#0ea5e9"
                gradient="linear-gradient(135deg, #0ea5e9, #38bdf8)"
              >
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="business_name"
                      label="Business / Shop Name"
                      rules={{ required: "Please enter business name." }}
                      case="TITLE"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <SelectRFH
                      name="business_type"
                      label="Business Type"
                      rules={{ required: "Please select business type." }}
                    >
                      <MenuItem value="SOLE_PROPRIETOR">
                        Sole Proprietorship
                      </MenuItem>
                      <MenuItem value="PARTNERSHIP">Partnership</MenuItem>
                      <MenuItem value="PRIVATE_LTD">Private Limited</MenuItem>
                      <MenuItem value="PUBLIC_LTD">Public Limited</MenuItem>
                      <MenuItem value="LLP">LLP</MenuItem>
                      <MenuItem value="OPC">One Person Company</MenuItem>
                    </SelectRFH>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="gst_number"
                      label="GST Number"
                      rules={{
                        required: "Please enter GST number.",
                        pattern: {
                          value:
                            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                          message: "Please enter a valid GST number.",
                        },
                      }}
                      case="UPPER"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="pan_number"
                      label="PAN Number"
                      rules={{
                        required: "Please enter PAN number.",
                        pattern: {
                          value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                          message: "Please enter a valid PAN number.",
                        },
                      }}
                      case="UPPER"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="business_email"
                      label="Business Email"
                      rules={{
                        required: "Please enter email address.",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Please enter a valid email address.",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="business_phone"
                      label="Business Phone"
                      rules={{
                        required: "Please enter phone number.",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message:
                            "Please enter a valid 10-digit phone number.",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <SelectRFH
                      name="years_in_business"
                      label="Years in Business"
                    >
                      <MenuItem value="0-1">Less than 1 year</MenuItem>
                      <MenuItem value="1-3">1 – 3 years</MenuItem>
                      <MenuItem value="3-5">3 – 5 years</MenuItem>
                      <MenuItem value="5-10">5 – 10 years</MenuItem>
                      <MenuItem value="10+">10+ years</MenuItem>
                    </SelectRFH>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="business_address"
                      label="Business Address"
                      rules={{ required: "Please enter business address." }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="business_city"
                      label="City"
                      rules={{ required: "Please enter city." }}
                      case="TITLE"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SelectRFH
                      name="business_state"
                      label="State"
                      rules={{ required: "Please select state." }}
                    >
                      {STATES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </SelectRFH>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextFieldRFH
                      name="business_pincode"
                      label="Pincode"
                      rules={{
                        required: "Please enter pin code.",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "Please enter a valid 6-digit pin code.",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section
                icon={<IconDoc />}
                title="KYC Documents"
                subtitle="Upload clear scanned copies (JPG, PNG, PDF — max 5MB each)"
                accent="#f59e0b"
                gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
              >
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FileUpload
                      label="Aadhaar Card — Front"
                      hint="JPG, PNG or PDF • Max 5MB"
                      value={docs.aadhaar_front}
                      onChange={setDoc("aadhaar_front")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FileUpload
                      label="Aadhaar Card — Back"
                      hint="JPG, PNG or PDF • Max 5MB"
                      value={docs.aadhaar_back}
                      onChange={setDoc("aadhaar_back")}
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section
                icon={<IconBank />}
                title="Bank Details"
                subtitle="Your account where payments will be settled"
                accent="#10b981"
                gradient="linear-gradient(135deg, #10b981, #34d399)"
              >
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="account_holder"
                      label="Account Holder Name"
                      rules={{ required: "Please enter account holder name." }}
                      case="TITLE"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="bank_name"
                      label="Bank Name"
                      rules={{ required: "Please enter bank name." }}
                      case="TITLE"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="account_number"
                      label="Account Number"
                      rules={{
                        required: "Please enter account number.",
                        minLength: {
                          value: 9,
                          message: "Please enter at least 9 digits.",
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="confirm_account_number"
                      label="Confirm Account Number"
                      rules={{
                        required: "Please confirm account number.",
                        validate: (val: string) =>
                          val !== methods.getValues("account_number")
                            ? "Account numbers do not match."
                            : true,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="ifsc_code"
                      label="IFSC Code"
                      rules={{
                        required: "Please enter IFSC code.",
                        pattern: {
                          value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                          message: "Please enter a valid IFSC code.",
                        },
                      }}
                      case="UPPER"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <SelectRFH
                      name="account_type"
                      label="Account Type"
                      rules={{ required: "Please select account type." }}
                    >
                      <MenuItem value="SAVINGS">Savings</MenuItem>
                      <MenuItem value="CURRENT">Current</MenuItem>
                      <MenuItem value="OD">Overdraft</MenuItem>
                    </SelectRFH>
                  </Grid>
                </Grid>
              </Section>

              <Box
                sx={{
                  p: "12px 16px",
                  borderRadius: "12px",
                  mb: 2,
                  background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  border: "1.5px solid #fde68a",
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ fontSize: 18, flexShrink: 0, mt: 0.2 }}>⚠️</Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#92400e",
                    fontFamily: "'Nunito', sans-serif",
                    lineHeight: 1.7,
                  }}
                >
                  By submitting this form, you confirm that all provided
                  information is accurate and genuine. Providing false
                  information may result in permanent suspension. Your
                  application will be reviewed within{" "}
                  <strong>2–3 business days</strong>.
                </Typography>
              </Box>

              <ButtonRFH
                fullWidth
                sx={{
                  minHeight: "40px",
                }}
                onClick={onSubmit}
                loading={segmentProp.isLoading}
              >
                Submit Seller Application →
              </ButtonRFH>

              <Box sx={{ height: 18 }} />
            </Box>
          </FormProvider>
        </PageContainer>
      </Box>
    </FormProvider>
  );
}
