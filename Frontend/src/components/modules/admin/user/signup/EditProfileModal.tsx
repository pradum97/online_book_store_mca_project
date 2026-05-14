"use client";

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormProvider, useForm } from "react-hook-form";
import TextFieldRFH from "@lib/TextFieldRFH";
import SelectRFH from "@lib/SelectRFH";
import DatePickerRFH from "@lib/DatePickerRFH";
import ButtonRFH from "@lib/ButtonRFH";
import { toast } from "react-toastify";
import { toSqlDate } from "@/utils/CommonUtils";
import { UpdateMyProfileEP } from "@webEndPoints/handlers/userWEB/userWEB";

export interface IProfileForm {
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: Date | string | null;
  gender: string;
  mobile: string;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  defaultValues: IProfileForm;
  onSuccess?: () => void;
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
        p: 1,
        background: "#fafafa",
        mb: 1,
      }}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </Box>
  );
}

export default function EditProfileModal({
  open,
  onClose,
  defaultValues,
  onSuccess,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const methods = useForm<IProfileForm>({ defaultValues });

  React.useEffect(() => {
    if (open) methods.reset(defaultValues);
  }, [open]);

  const onSubmit = async (data: IProfileForm) => {
    try {
      setIsLoading(true);

      const payload = {
        ...data,
        dob: toSqlDate(data.dob as Date),
      };

      const res = await UpdateMyProfileEP(payload);

      toast[res.action as "success" | "error"](res.title || res.message);

      if (res.action === "success") {
        onSuccess?.();
        onClose();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* ── Header (same as AddBookModal) ── */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 20 }}>👤</Typography>
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            Edit Profile
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            "&:hover": { background: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ p: 0, overflowX: "hidden" }}>
        <FormProvider {...methods}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <SectionCard label="Personal Information">
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="first_name"
                      label="First Name"
                      rules={{ required: "First name required" }}
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="middle_name"
                      label="Middle Name"
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="last_name"
                      label="Last Name"
                      rules={{ required: "Last name required" }}
                      case="TITLE"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePickerRFH
                      name="dob"
                      label="Date of Birth"
                      rules={{ required: "DOB required" }}
                      maxDate={new Date()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <SelectRFH
                      name="gender"
                      label="Gender"
                      rules={{ required: "Gender required" }}
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </SelectRFH>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldRFH
                      name="mobile"
                      label="Mobile Number"
                      rules={{
                        required: "Mobile required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter valid 10 digit number",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </SectionCard>

              <ButtonRFH
                type="submit"
                fullWidth
                loading={isLoading}
                sx={{ mt: "40px" }}
              >
                Update Profile →
              </ButtonRFH>
            </form>
          </Box>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
