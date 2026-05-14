import React from "react";
import { Box, IconButton, Modal, Typography, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalWrapper = ({
  open,
  onClose,
  title,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  icon: string;
  children: React.ReactNode;
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: "90vw", md: 560 },
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "20px",
          background: "white",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          p: { xs: 1.5, md: 2 },
          outline: "none",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(139,92,246,0.3)",
            borderRadius: "4px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ fontSize: "20px" }}>{icon}</Box>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700,
                fontSize: { xs: 15, md: 18 },
                color: "primary.main",
              }}
            >
              {title}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              p: "5px",
              "&:hover": {
                color: "#fff",
                background: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <CloseIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2.5, borderColor: "rgba(255,255,255,0.07)" }} />
        {children}
      </Box>
    </Modal>
  );
};

export default React.memo(ModalWrapper);
