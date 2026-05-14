"use client";

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CircleIcon from "@mui/icons-material/Circle";
import { useQuery } from "@tanstack/react-query";
import { GetProfileEP } from "@webEndPoints/handlers/authWEB/authWEB";
import { IGetProfileEP } from "@webEndPoints/handlers/authWEB/IauthWEB";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const {
    data: session,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<IGetProfileEP>({
    queryKey: ["GetProfileEP"],
    queryFn: async () => {
      const res = await GetProfileEP();
      return res?.data ?? {};
    },
  });
  console.log("Session data in ProfileModal:", session);

  const getInitials = () => {
    const f = session?.first_name?.[0] ?? "";
    const l = session?.last_name?.[0] ?? "";
    return (f + l).toUpperCase() || "U";
  };

  const formatDob = (dob?: string) => {
    if (!dob) return "—";
    return new Date(dob).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const rows = [
    {
      icon: <EmailIcon sx={{ fontSize: 15, color: "text.secondary" }} />,
      label: "Email",
      value: session?.email,
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 15, color: "text.secondary" }} />,
      label: "Mobile",
      value: session?.mobile,
    },
    {
      icon: <PersonIcon sx={{ fontSize: 15, color: "text.secondary" }} />,
      label: "Gender",
      value: session?.gender
        ? session.gender.charAt(0) + session.gender.slice(1).toLowerCase()
        : "—",
    },
    {
      icon: (
        <CalendarTodayIcon sx={{ fontSize: 15, color: "text.secondary" }} />
      ),
      label: "Date of birth",
      value: formatDob(session?.dob),
    },
    {
      icon: (
        <CircleIcon
          sx={{
            fontSize: 10,
            color:
              session?.status === "ACTIVE" ? "success.main" : "warning.main",
          }}
        />
      ),
      label: "Status",
      value: session?.status
        ? session.status.charAt(0) + session.status.slice(1).toLowerCase()
        : "—",
      valueColor:
        session?.status === "ACTIVE" ? "success.main" : "warning.main",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <Box
        sx={{
          background: `
      radial-gradient(circle at 50% 30%, rgba(124,58,237,0.6), transparent 60%),
      linear-gradient(135deg, #6d61f6 0%, #7b2ff6 50%, #4b1b9d 100%)
    `,
          px: 3,
          pt: 3,
          pb: 2.5,
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            color: "#B5D4F4",
            "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              fontSize: 22,
              fontWeight: 500,
              bgcolor: "#E6F1FB",
              color: "#0C447C",
              flexShrink: 0,
            }}
          >
            {getInitials()}
          </Avatar>

          <Box>
            <Typography
              sx={{ fontSize: 18, fontWeight: 500, color: "#E6F1FB" }}
            >
              {session?.full_name || session?.username || "User"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#85B7EB", mt: 0.3 }}>
              @{session?.username}
            </Typography>
            <Chip
              label={session?.user_type_code ?? "—"}
              size="small"
              sx={{
                mt: 0.8,
                height: 20,
                fontSize: 11,
                fontWeight: 500,
                bgcolor: "#0C447C",
                color: "#B5D4F4",
              }}
            />
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            mb: 1,
          }}
        >
          {[
            { label: "First name", value: session?.first_name },
            { label: "Last name", value: session?.last_name },
          ].map(({ label, value }) => (
            <Box
              key={label}
              sx={{ bgcolor: "action.hover", borderRadius: 2, p: 1.5 }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  mb: 0.5,
                }}
              >
                {label}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {value || "—"}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Detail rows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
          {rows.map(({ icon, label, value, valueColor }) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "action.hover",
                borderRadius: 2,
                px: 1.5,
                py: 1.2,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
              <Box>
                <Typography
                  sx={{ fontSize: 11, color: "text.secondary", mb: 0.2 }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: valueColor || "text.primary",
                  }}
                >
                  {value || "—"}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
