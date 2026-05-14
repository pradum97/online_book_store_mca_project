"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Grid } from "@mui/material";
import TextFieldRFH from "@lib/TextFieldRFH";
import ButtonRFH from "@lib/ButtonRFH";
import {
  GetMyAddressesEP,
  AddAddressEP,
  UpdateAddressEP,
  SetDefaultAddressEP,
  DeleteAddressEP,
} from "@webEndPoints/handlers/userWEB/userWEB";
import {
  IAddressPayload,
  IGetMyAddressesEP,
} from "@webEndPoints/handlers/userWEB/IuserWEB";
import PageContainer from "@container/Pagecontainer";

type PanelMode = "list" | "add" | "edit";

export interface AddressFormValues {
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
}

const defaultAddressVal: AddressFormValues = {
  full_name: "",
  mobile: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  is_default: false,
};

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
  extra,
}: {
  label: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1.5px solid #e5e7eb",
        borderRadius: "14px",
        p: 1,
        background: "#fafafa",
        mb: 1,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <SectionLabel>{label}</SectionLabel>
        {extra}
      </Box>
      {children}
    </Box>
  );
}

function AddressCard({
  address,
  onEdit,
  onSetDefault,
  onDelete,
  settingDefaultId,
  deletingId,
}: {
  address: IGetMyAddressesEP;
  onEdit: (a: IGetMyAddressesEP) => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  settingDefaultId: string | null;
  deletingId: string | null;
}) {
  const isSettingDefault = settingDefaultId === address.address_id;
  const isDeleting = deletingId === address.address_id;

  return (
    <Box
      sx={{
        border: address.is_default
          ? "2px solid #6366f1"
          : "1.5px solid #e5e7eb",
        borderRadius: "14px",
        p: 2,
        background: address.is_default ? "#f5f3ff" : "#ffffff",
        position: "relative",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: address.is_default ? "#6366f1" : "#c4b5fd",
          boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
        },
      }}
    >
      {/* Default Badge */}
      {address.is_default && (
        <Chip
          icon={
            <StarIcon
              sx={{ fontSize: "12px !important", color: "#6d28d9 !important" }}
            />
          }
          label="Default"
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            height: 22,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            background: "#ede9fe",
            color: "#6d28d9",
            border: "1px solid #c4b5fd",
            "& .MuiChip-label": { px: 0.8 },
          }}
        />
      )}

      {/* Name & Mobile */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.8 }}>
        <PersonOutlineIcon sx={{ fontSize: 14, color: "#6366f1" }} />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "'Nunito', sans-serif",
            color: "#1f2937",
          }}
        >
          {address.full_name}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
        <PhoneOutlinedIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
        <Typography
          sx={{
            fontSize: 12,
            fontFamily: "'Nunito', sans-serif",
            color: "#6b7280",
          }}
        >
          {address.mobile}
        </Typography>
      </Box>

      <Divider sx={{ mb: 1, borderColor: "#f3f4f6" }} />

      {/* Address Lines */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
        <LocationOnOutlinedIcon
          sx={{ fontSize: 14, color: "#9ca3af", mt: "1px", flexShrink: 0 }}
        />
        <Typography
          sx={{
            fontSize: 12,
            fontFamily: "'Nunito', sans-serif",
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
          {address.address_line1}
          {address.address_line2 ? `, ${address.address_line2}` : ""}
          <br />
          {address.city}, {address.state} — {address.postal_code}
          <br />
          {address.country}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mt: 1.5,
          pt: 1,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        {/* Make Default */}
        {!address.is_default && (
          <Tooltip title="Set as default">
            <Box
              component="button"
              type="button"
              disabled={!!settingDefaultId}
              onClick={() => onSetDefault(address.address_id)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.2,
                py: 0.5,
                borderRadius: "8px",
                background: "#fefce8",
                border: "1px solid #fde68a",
                color: "#92400e",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { background: "#fef9c3" },
                "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
              }}
            >
              {isSettingDefault ? (
                <CircularProgress size={10} sx={{ color: "#92400e" }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: 13 }} />
              )}
              Make Default
            </Box>
          </Tooltip>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Edit */}
        <Tooltip title="Edit address">
          <IconButton
            size="small"
            onClick={() => onEdit(address)}
            sx={{
              width: 28,
              height: 28,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#2563eb",
              "&:hover": { background: "#dbeafe" },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>

        {/* Delete */}
        <Tooltip title="Delete address">
          <IconButton
            size="small"
            disabled={!!deletingId}
            onClick={() => onDelete(address.address_id)}
            sx={{
              width: 28,
              height: 28,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              "&:hover": { background: "#fee2e2" },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            {isDeleting ? (
              <CircularProgress size={10} sx={{ color: "#dc2626" }} />
            ) : (
              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function AddNewAddressCard({ onClick }: { onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: "1.5px dashed #c4b5fd",
        borderRadius: "14px",
        height: "100%",
        p: 2,
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.8,
        minHeight: 140,
        cursor: "pointer",
        transition: "all 0.18s ease",
        "&:hover": {
          background: "#f5f3ff",
          borderColor: "#818cf8",
          "& .add-icon": { transform: "scale(1.15)" },
        },
      }}
    >
      <AddCircleOutlineIcon
        className="add-icon"
        sx={{
          fontSize: 32,
          color: "#818cf8",
          transition: "transform 0.18s ease",
        }}
      />
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          color: "#6d28d9",
          letterSpacing: "0.3px",
        }}
      >
        Add New Address
      </Typography>
    </Box>
  );
}

function AddressFormPanel({
  mode,
  editingAddress,
  onBack,
  onSaved,
}: {
  mode: "add" | "edit";
  editingAddress: IGetMyAddressesEP | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const methods = useForm<AddressFormValues>({
    defaultValues:
      mode === "edit" && editingAddress
        ? {
            full_name: editingAddress.full_name,
            mobile: editingAddress.mobile,
            address_line1: editingAddress.address_line1,
            address_line2: editingAddress.address_line2 || "",
            city: editingAddress.city,
            state: editingAddress.state,
            country: editingAddress.country,
            postal_code: editingAddress.postal_code,
            is_default: editingAddress.is_default,
          }
        : defaultAddressVal,
  });

  const onSubmit = async (data: AddressFormValues) => {
    try {
      setIsLoading(true);
      const payload: IAddressPayload = {
        ...data,
        address_line2: data.address_line2 || undefined,
      };

      const res =
        mode === "edit" && editingAddress
          ? await UpdateAddressEP(editingAddress.address_id, payload)
          : await AddAddressEP(payload);

      if (res?.action === "success") {
        toast.success(res.message ?? res?.title);
        onSaved();
      } else {
        toast.error(res?.message ?? "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        animation: "slideInRight 0.25s ease",
        "@keyframes slideInRight": {
          from: { opacity: 0, transform: "translateX(18px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      }}
    >
      {/* Back Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          pb: 1,
          borderBottom: "1.5px solid #e5e7eb",
        }}
      >
        <IconButton
          size="small"
          onClick={onBack}
          sx={{
            width: 30,
            height: 30,
            background: "#f5f3ff",
            border: "1.5px solid #c4b5fd",
            color: "#6d28d9",
            "&:hover": { background: "#ede9fe" },
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 13 }} />
        </IconButton>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "'Nunito', sans-serif",
            color: "#374151",
          }}
        >
          {mode === "edit" ? "Edit Address" : "Add New Address"}
        </Typography>
      </Box>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <SectionCard label="Contact Info">
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldRFH
                  name="full_name"
                  label="Full Name"
                  rules={{ required: "Full name is required" }}
                  case="TITLE"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldRFH
                  name="mobile"
                  label="Mobile Number"
                  rules={{ required: "Mobile number is required" }}
                  type="tel"
                />
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard label="Address Details">
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <TextFieldRFH
                  name="address_line1"
                  label="Address Line 1"
                  rules={{ required: "Address Line 1 is required" }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextFieldRFH
                  name="address_line2"
                  label="Address Line 2 (optional)"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldRFH
                  name="city"
                  label="City"
                  rules={{ required: "City is required" }}
                  case="TITLE"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldRFH
                  name="state"
                  label="State"
                  rules={{ required: "State is required" }}
                  case="TITLE"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldRFH
                  name="country"
                  label="Country"
                  rules={{ required: "Country is required" }}
                  case="TITLE"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldRFH
                  name="postal_code"
                  label="Postal Code / PIN"
                  rules={{ required: "Postal code is required" }}
                />
              </Grid>
            </Grid>
          </SectionCard>

          <ButtonRFH type="submit" fullWidth loading={isLoading}>
            {mode === "edit" ? "Update Address →" : "Save Address →"}
          </ButtonRFH>
        </form>
      </FormProvider>
    </Box>
  );
}

interface MyAddressesPageProps {
  onSuccess?: () => void;
}

export default function MyAddressesPage({ onSuccess }: MyAddressesPageProps) {
  const queryClient = useQueryClient();

  const [panelMode, setPanelMode] = useState<PanelMode>("list");
  const [editingAddress, setEditingAddress] =
    useState<IGetMyAddressesEP | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: addressList,
    isLoading,
    isError,
  } = useQuery<IGetMyAddressesEP[]>({
    queryKey: ["GetMyAddressesEP"],
    queryFn: async () => {
      const res = await GetMyAddressesEP();
      return res?.data ?? [];
    },
  });

  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      const res = await SetDefaultAddressEP(id);
      if (res?.action === "success") {
        toast.success(res.message ?? "Default address updated");
        queryClient.invalidateQueries({ queryKey: ["GetMyAddressesEP"] });
      } else {
        toast.error(res?.message ?? "Failed to update default");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await DeleteAddressEP(id);
      if (res?.action === "success") {
        toast.success(res.message ?? "Address deleted");
        queryClient.invalidateQueries({ queryKey: ["GetMyAddressesEP"] });
      } else {
        toast.error(res?.message ?? "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (address: IGetMyAddressesEP) => {
    setEditingAddress(address);
    setPanelMode("edit");
  };

  const handleFormSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["GetMyAddressesEP"] });
    setPanelMode("list");
    setEditingAddress(null);
  };

  const handleBack = () => {
    setPanelMode("list");
    setEditingAddress(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress size={36} />
        <Typography
          sx={{
            mt: 1.5,
            fontSize: 13,
            color: "#6b7280",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Loading addresses...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: "1.5px solid #fecaca",
          borderRadius: "14px",
          background: "#fef2f2",
          m: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            color: "#dc2626",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Failed to load addresses. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {panelMode !== "list" && (
        <AddressFormPanel
          mode={panelMode}
          editingAddress={editingAddress}
          onBack={handleBack}
          onSaved={handleFormSaved}
        />
      )}

      {panelMode === "list" && (
        <Box
          sx={{
            animation: "fadeIn 0.2s ease",
            "@keyframes fadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          {/* Address Grid */}
          <Grid container spacing={1.5}>
            {/* Add New Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <AddNewAddressCard onClick={() => setPanelMode("add")} />
            </Grid>

            {/* Existing Address Cards */}
            {(addressList ?? []).map((address) => (
              <Grid size={{ xs: 12, sm: 6 }} key={address.address_id}>
                <AddressCard
                  address={address}
                  onEdit={handleEdit}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                  settingDefaultId={settingDefaultId}
                  deletingId={deletingId}
                />
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {(!addressList || addressList.length === 0) && (
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                px: 3,
                mt: 1,
                border: "1.5px dashed #e5e7eb",
                borderRadius: "14px",
                background: "#fafafa",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#9ca3af",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                No addresses saved yet. Click the card above to add one!
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
