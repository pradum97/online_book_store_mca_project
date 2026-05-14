"use client";

import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MyAddressesPage from "./MyAddressesPage";

interface MyAddressesModalProps {
  open: boolean;
  onClose: () => void;
}

const MyAddressesModal = ({ open, onClose }: MyAddressesModalProps) => (
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
        maxHeight: "90vh",
      },
    }}
  >
    {/* ── Header ── */}
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 2,
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <HomeOutlinedIcon sx={{ fontSize: 20, color: "#a5b4fc" }} />
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            color: "#fff",
          }}
        >
          My Addresses
        </Typography>
      </Box>

      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          color: "#a5b4fc",
          "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    {/* ── Body ── */}
    <DialogContent
      sx={{
        p: 0,
        overflowX: "hidden",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-track": { background: "#f5f3ff" },
        "&::-webkit-scrollbar-thumb": {
          background: "#c4b5fd",
          borderRadius: 3,
        },
      }}
    >
      <MyAddressesPage onSuccess={onClose} />
    </DialogContent>
  </Dialog>
);

export default MyAddressesModal;
