"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { FormProvider, useForm } from "react-hook-form";
import TextFieldRFH from "@lib/TextFieldRFH";
import { useRouter } from "next/navigation";
import PageContainer from "@container/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { GetCartEP } from "@webEndPoints/handlers/cartWEB/cartWEB";
import { CartItem } from "./CartPage";
import { GetMyAddressesEP } from "@webEndPoints/handlers/userWEB/userWEB";
import { InitiatePaymentEP } from "@webEndPoints/handlers/paymentWEB/paymentWEB";
import { CreateOrderEP } from "@webEndPoints/handlers/customerOrderWEB/customerOrderWEB";

interface Address {
  address_id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
  created_date: string;
}

interface PaymentMode {
  payment_mode_id: string;
  mode_name: string;
  mode_code: string;
  is_active: boolean;
}

const MOCK_PAYMENT_MODES: PaymentMode[] = [
  {
    payment_mode_id: "e9ac9ff9-14e6-425f-971c-5477e65e4d57",
    mode_name: "UPI",
    mode_code: "UPI",
    is_active: true,
  },
  {
    payment_mode_id: "6e0612f1-b8bd-4781-b0f4-3625c39390f8",
    mode_name: "Credit Card",
    mode_code: "CREDIT_CARD",
    is_active: true,
  },
  {
    payment_mode_id: "ce70e231-8ce8-472c-a1de-515accf53ca1",
    mode_name: "Debit Card",
    mode_code: "DEBIT_CARD",
    is_active: true,
  },
  {
    payment_mode_id: "67e79497-fc1b-44cc-8178-8cb8656b6c4b",
    mode_name: "Cash on Delivery",
    mode_code: "COD",
    is_active: true,
  },
];

const MODE_ICONS: Record<string, string> = {
  UPI: "📲",
  CREDIT_CARD: "💳",
  DEBIT_CARD: "🏧",
  COD: "💵",
};

const MODE_META: Record<
  string,
  { sub: string; color: string; bg: string; border: string }
> = {
  UPI: {
    sub: "GPay · PhonePe · Paytm",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  CREDIT_CARD: {
    sub: "Visa · Mastercard · RuPay",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  DEBIT_CARD: {
    sub: "Visa · Mastercard · RuPay",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  COD: {
    sub: "Pay at delivery",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
};

type CheckoutStep = "payment" | "confirming" | "success";

function AddressSection({
  addresses,
  selectedAddress,
  onSelect,
}: {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelect: (addr: Address) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string>(
    selectedAddress?.address_id ?? "",
  );

  const handleOpen = () => {
    setTempSelected(selectedAddress?.address_id ?? "");
    setOpen(true);
  };

  const handleConfirm = () => {
    const found = addresses.find((a) => a.address_id === tempSelected);
    if (found) onSelect(found);
    setOpen(false);
  };

  if (!selectedAddress) {
    return (
      <Box
        sx={{
          p: "10px 14px",
          borderRadius: "10px",
          border: "1.5px dashed #d1d5db",
          background: "#fafafa",
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <LocationOnIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
        <Typography
          color="error"
          sx={{
            fontSize: 12.5,
            color: "#9ca3af",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          No address found. Please add one.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          p: "10px 14px",
          borderRadius: "10px",
          border: "1.5px solid #c7d2fe",
          background: "#eef2ff",
          mb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <LocationOnIcon
            sx={{ fontSize: 16, color: "#6366f1", mt: 0.2, flexShrink: 0 }}
          />
          <Box>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#1e1b4b",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.4,
              }}
            >
              {selectedAddress.full_name}{" "}
              <span style={{ fontWeight: 400, color: "#6b7280" }}>
                · {selectedAddress.mobile}
              </span>
            </Typography>
            <Typography
              sx={{
                fontSize: 11.5,
                color: "#4b5563",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.6,
              }}
            >
              {selectedAddress.address_line1}
              {selectedAddress.address_line2
                ? `, ${selectedAddress.address_line2}`
                : ""}
              , {selectedAddress.city}, {selectedAddress.state} –{" "}
              {selectedAddress.postal_code}, {selectedAddress.country}
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={handleOpen}
          size="small"
          startIcon={<EditIcon sx={{ fontSize: "13px !important" }} />}
          sx={{
            textTransform: "none",
            fontSize: 11,
            fontWeight: 600,
            color: "#6366f1",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
            flexShrink: 0,
            px: 1,
            py: 0.4,
            borderRadius: "6px",
            "&:hover": { background: "#e0e7ff" },
          }}
        >
          Change
        </Button>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#1e1b4b",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.5,
            px: 2.5,
          }}
        >
          Select Delivery Address
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <RadioGroup
            value={tempSelected}
            onChange={(e) => setTempSelected(e.target.value)}
          >
            {addresses.map((addr) => (
              <Box
                key={addr.address_id}
                onClick={() => setTempSelected(addr.address_id)}
                sx={{
                  mb: 1.5,
                  p: "12px 14px",
                  borderRadius: "12px",
                  border:
                    tempSelected === addr.address_id
                      ? "2px solid #6366f1"
                      : "1.5px solid #e5e7eb",
                  background:
                    tempSelected === addr.address_id ? "#eef2ff" : "#fafafa",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Radio
                  value={addr.address_id}
                  size="small"
                  sx={{
                    p: 0,
                    mt: 0.2,
                    color: "#d1d5db",
                    "&.Mui-checked": { color: "#6366f1" },
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.3,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1e1b4b",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {addr.full_name}
                    </Typography>
                    {addr.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          background: "#e0e7ff",
                          color: "#6366f1",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#6b7280",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      · {addr.mobile}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#4b5563",
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.6,
                    }}
                  >
                    {addr.address_line1}
                    {addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                    {addr.city}, {addr.state} – {addr.postal_code},{" "}
                    {addr.country}
                  </Typography>
                </Box>
              </Box>
            ))}
          </RadioGroup>

          <Button
            onClick={handleConfirm}
            fullWidth
            disabled={!tempSelected}
            sx={{
              mt: 1,
              py: 1.3,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              "&:hover": { opacity: 0.92 },
              "&:disabled": { opacity: 0.4 },
            }}
          >
            Deliver to this Address
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PaymentFields({ modeCode }: { modeCode: string | null }) {
  if (!modeCode) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 1.5,
          py: 6,
        }}
      >
        <Typography sx={{ fontSize: 32 }}>👈</Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: "#9ca3af",
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
          }}
        >
          Select a payment method to continue
        </Typography>
      </Box>
    );
  }

  if (modeCode === "UPI") {
    return (
      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "#374151",
            fontFamily: "'DM Sans', sans-serif",
            mb: 1.5,
          }}
        >
          Enter UPI Details
        </Typography>
        <TextFieldRFH
          name="upi_id"
          label="UPI ID"
          rules={{
            required: "UPI ID is required",
            pattern: { value: /^[\w.-]+@[\w]+$/, message: "e.g. name@upi" },
          }}
        />
        <Typography
          sx={{
            fontSize: 11,
            color: "#6b7280",
            mt: 0.8,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          e.g. name@paytm · name@gpay · name@phonepe
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: "10px 12px",
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LockIcon sx={{ fontSize: 13, color: "#16a34a" }} />
          <Typography
            sx={{
              fontSize: 11,
              color: "#15803d",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Your UPI transaction is 100% safe & secure
          </Typography>
        </Box>
      </Box>
    );
  }

  if (modeCode === "CREDIT_CARD" || modeCode === "DEBIT_CARD") {
    return (
      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "#374151",
            fontFamily: "'DM Sans', sans-serif",
            mb: 1.5,
          }}
        >
          Enter Card Details
        </Typography>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12 }}>
            <TextFieldRFH
              name="card_number"
              label="Card Number"
              rules={{
                required: "Required",
                pattern: { value: /^\d{16}$/, message: "16 digit number" },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextFieldRFH
              name="card_holder"
              label="Cardholder Name"
              rules={{ required: "Required" }}
              case="TITLE"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextFieldRFH
              name="expiry"
              label="MM/YY"
              rules={{
                required: "Required",
                pattern: {
                  value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                  message: "MM/YY",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextFieldRFH
              name="cvv"
              label="CVV"
              type="password"
              rules={{
                required: "Required",
                pattern: { value: /^\d{3,4}$/, message: "3-4 digits" },
              }}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 1.5,
            p: "8px 12px",
            borderRadius: "8px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          <LockIcon sx={{ fontSize: 12, color: "#16a34a" }} />
          <Typography
            sx={{
              fontSize: 11,
              color: "#15803d",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            256-bit SSL encrypted — your card details are safe
          </Typography>
        </Box>
      </Box>
    );
  }

  if (modeCode === "COD") {
    return (
      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "#374151",
            fontFamily: "'DM Sans', sans-serif",
            mb: 1.5,
          }}
        >
          Cash on Delivery
        </Typography>
        <Box
          sx={{
            p: "16px",
            borderRadius: "12px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
          }}
        >
          <Typography sx={{ fontSize: 22, mb: 1 }}>💵</Typography>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#92400e",
              fontFamily: "'DM Sans', sans-serif",
              mb: 0.5,
            }}
          >
            Pay when your order arrives
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: "#b45309",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.7,
            }}
          >
            Keep exact change ready at delivery. COD is available for all areas.
            A nominal handling fee may apply.
          </Typography>
        </Box>
      </Box>
    );
  }

  return null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<PaymentMode | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [step, setStep] = useState<CheckoutStep>("payment");
  const [orderError, setOrderError] = useState<string | null>(null);

  const methods = useForm({
    defaultValues: {
      upi_id: "",
      card_number: "",
      card_holder: "",
      expiry: "",
      cvv: "",
    },
  });

  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["GetCartEP"],
    queryFn: async () => {
      const res = await GetCartEP();
      return res?.data ?? [];
    },
  });

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ["GetMyAddressesEP"],
    queryFn: async () => {
      const res = await GetMyAddressesEP();
      const list: Address[] = res?.data ?? [];
      const defaultAddr = list.find((a) => a.is_default) ?? list[0] ?? null;
      setSelectedAddress((prev) => (prev ? prev : defaultAddr));
      return list;
    },
  });

  const billing = useMemo(() => {
    const items =
      cartItems?.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        mrp: item.mrp,
        total: (item.quantity * parseFloat(item.mrp)).toFixed(2),
      })) ?? [];

    return {
      items,
      total_items: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + parseFloat(item.total), 0),
    };
  }, [cartItems]);

  const handlePlaceOrder = async (formData: any) => {
    if (!selectedMode) return;
    if (!selectedAddress) {
      setOrderError("Please select a delivery address.");
      return;
    }
    setOrderError(null);
    setStep("confirming");

    try {
      const orderRes = await CreateOrderEP({
        address_id: selectedAddress.address_id,
      });

      if (orderRes?.action === "error" || !orderRes?.data?.order_id) {
        setOrderError(
          orderRes?.message ?? "Failed to create order. Please try again.",
        );
        setStep("payment");
        return;
      }

      const order_id: string = orderRes.data.order_id;

      let payment_fields: Record<string, any> | undefined;
      if (selectedMode.mode_code === "UPI") {
        payment_fields = { upi_id: formData.upi_id };
      } else if (
        selectedMode.mode_code === "CREDIT_CARD" ||
        selectedMode.mode_code === "DEBIT_CARD"
      ) {
        payment_fields = {
          card_number: formData.card_number,
          card_holder: formData.card_holder,
          expiry: formData.expiry,
          cvv: formData.cvv,
        };
      }

      const payRes = await InitiatePaymentEP({
        order_id,
        payment_mode_id: selectedMode.payment_mode_id,
        ...(payment_fields ? { payment_fields } : {}),
      });

      if (payRes?.action === "error") {
        setOrderError(payRes?.message ?? "Payment failed. Please try again.");
        setStep("payment");
        return;
      }

      setStep("success");
    } catch (err: any) {
      setOrderError(err?.message ?? "Something went wrong. Please try again.");
      setStep("payment");
    }
  };

  React.useEffect(() => {
    if (!cartItems) return;

    const isEmpty =
      cartItems.length === 0 || cartItems.every((item) => item.quantity === 0);

    if (isEmpty) {
      router.push("/");
    }
  }, [cartItems, router]);

  if (step === "confirming") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 12,
          gap: 3,
          height: "calc(100vh - 75px)",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CircularProgress size={72} thickness={3} sx={{ color: "#6366f1" }} />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockIcon sx={{ fontSize: 24, color: "#6366f1" }} />
          </Box>
        </Box>
        <Box textAlign="center">
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#1e1b4b",
            }}
          >
            Securing your payment
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: "#6b7280",
              fontFamily: "'DM Sans', sans-serif",
              mt: 0.5,
            }}
          >
            Please do not close or refresh this page
          </Typography>
        </Box>
      </Box>
    );
  }

  if (step === "success") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 75px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "2px solid #6ee7b7",
            borderRadius: 6,
            padding: "10px 50px",
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              border: "2px solid #6ee7b7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 44, color: "#059669" }} />
          </Box>
          <Box textAlign="center">
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: 22,
                color: "#1e1b4b",
              }}
            >
              Order Confirmed!
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#6b7280",
                fontFamily: "'DM Sans', sans-serif",
                mt: 0.5,
              }}
            >
              Thank you for your purchase. Happy reading! 📚
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2.5,
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              background: "#fafafa",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#374151",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Total Items
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1e1b4b",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {billing.total_items}
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1e1b4b",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Total Paid
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#6366f1",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ₹{billing.subtotal.toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => router.push("/")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              px: 4,
              py: 1.2,
              borderRadius: "12px",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              color: "#fff",
            }}
          >
            Continue Shopping →
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <PageContainer
      title="Checkout"
      subtitle="Complete your purchase securely"
      icon={
        <IconButton onClick={() => router.push("/cart")}>
          <ArrowBackIcon />
        </IconButton>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handlePlaceOrder)}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: "7px 14px",
              borderRadius: "8px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              mb: 1.5,
            }}
          >
            <LockIcon sx={{ fontSize: 13, color: "#0369a1" }} />
            <Typography
              sx={{
                fontSize: 11.5,
                color: "#0369a1",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              Secured by 256-bit SSL · PCI DSS Compliant · All transactions
              encrypted
            </Typography>
          </Box>

          {/* Address Section */}
          <AddressSection
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelect={setSelectedAddress}
          />

          {/* Error Banner */}
          {orderError && (
            <Box
              sx={{
                p: "8px 14px",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#dc2626",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ⚠️ {orderError}
              </Typography>
            </Box>
          )}

          {/* Main 3-Column Card */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#ffffff",
              minHeight: 420,
              height: { xs: "auto", md: "calc(100vh - 280px)" },
            }}
          >
            {/* COL 1: Payment Method Selector */}
            <Box
              sx={{
                width: { xs: "100%", md: 210 },
                flexShrink: 0,
                borderRight: { md: "1px solid #e5e7eb" },
                borderBottom: { xs: "1px solid #e5e7eb", md: "none" },
                background: "#fafafa",
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e5e7eb" }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    fontFamily: "'DM Sans', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  Payment Method
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", md: "column" },
                  flexWrap: "wrap",
                }}
              >
                {MOCK_PAYMENT_MODES?.filter((m) => m.is_active).map((mode) => {
                  const isSelected = selectedMode?.mode_code === mode.mode_code;
                  const meta = MODE_META[mode.mode_code];
                  return (
                    <Box
                      key={mode.mode_code}
                      onClick={() => {
                        setSelectedMode(mode);
                        methods.reset();
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        px: 2,
                        py: 1.4,
                        cursor: "pointer",
                        borderLeft: {
                          md: isSelected
                            ? `3px solid ${meta.color}`
                            : "3px solid transparent",
                        },
                        borderBottom: {
                          xs: isSelected
                            ? `2px solid ${meta.color}`
                            : "2px solid transparent",
                          md: "none",
                        },
                        background: isSelected ? meta.bg : "transparent",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          background: isSelected ? meta.bg : "#f3f4f6",
                        },
                        flex: { xs: 1, md: "unset" },
                        justifyContent: { xs: "center", md: "flex-start" },
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}
                      >
                        {MODE_ICONS[mode.mode_code]}
                      </Typography>
                      <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? meta.color : "#374151",
                            fontFamily: "'DM Sans', sans-serif",
                            lineHeight: 1.2,
                          }}
                        >
                          {mode.mode_name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10.5,
                            color: "#9ca3af",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {meta.sub}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* COL 2: Payment Fields */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                p: { xs: 2, md: 2.5 },
                borderRight: { md: "1px solid #e5e7eb" },
                borderBottom: { xs: "1px solid #e5e7eb", md: "none" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <PaymentFields modeCode={selectedMode?.mode_code ?? null} />

              {selectedMode && (
                <Box sx={{ mt: "auto", pt: 3 }}>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={!selectedAddress}
                    sx={{
                      py: 1.4,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif",
                      background:
                        "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 8px 28px rgba(99,102,241,0.5)",
                        transform: "translateY(-1px)",
                      },
                      "&:active": { transform: "translateY(0)" },
                      "&:disabled": { opacity: 0.5 },
                    }}
                  >
                    Place Order · ₹{billing.subtotal.toLocaleString("en-IN")}
                  </Button>
                  {!selectedAddress && (
                    <Typography
                      textAlign="center"
                      sx={{
                        fontSize: 11,
                        color: "#ef4444",
                        mt: 0.8,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Please select a delivery address above
                    </Typography>
                  )}
                  <Typography
                    textAlign="center"
                    sx={{
                      fontSize: 10.5,
                      color: "#9ca3af",
                      mt: 1,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    By placing your order you agree to our Terms & Privacy
                    Policy
                  </Typography>
                </Box>
              )}
            </Box>

            {/* COL 3: Order Summary */}
            <Box
              sx={{
                width: { xs: "100%", md: 260 },
                flexShrink: 0,
                background: "#fafafa",
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e5e7eb" }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6b7280",
                    fontFamily: "'DM Sans', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  Order Summary
                </Typography>
              </Box>

              <Box sx={{ px: 2, py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.8,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: "#6b7280",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Total Items
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {billing.total_items}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1e1b4b",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Total
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#6366f1",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ₹{billing.subtotal.toLocaleString("en-IN")}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 1.5, borderColor: "#e5e7eb" }} />

                {/* Security Badges */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}
                >
                  {[
                    { icon: "🔒", label: "256-bit SSL Encryption" },
                    { icon: "🛡️", label: "PCI DSS Compliant" },
                    { icon: "✅", label: "100% Secure Payment" },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
                    >
                      <Typography sx={{ fontSize: 12 }}>{item.icon}</Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#6b7280",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 1.5, borderColor: "#e5e7eb" }} />

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 0.8,
                    textAlign: "center",
                  }}
                >
                  Accepted Methods
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 0.8,
                    flexWrap: "wrap",
                  }}
                >
                  {["📲 UPI", "💳 Cards", "💵 COD"].map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      size="small"
                      sx={{
                        fontSize: 10.5,
                        height: 20,
                        background: "#f3f4f6",
                        color: "#6b7280",
                        border: "1px solid #e5e7eb",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </PageContainer>
  );
}
