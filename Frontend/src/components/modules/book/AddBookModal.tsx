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
import AddBookPage from "./AddBookPage";
import { IGetSellerBookListEP } from "@webEndPoints/handlers/bookWEB/IbookWEB";

interface AddBookModalProps {
  open: boolean;
  editData: IGetSellerBookListEP | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBookModal = ({
  open,
  editData,
  onClose,
  onSuccess,
}: AddBookModalProps) => (
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
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        py: 2,
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 20 }}>📖</Typography>
        <Typography
          sx={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            color: "#fff",
          }}
        >
          {editData ? "Edit Book" : "Add New Book"}
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
    <DialogContent sx={{ p: 0, overflowX: "hidden" }}>
      <AddBookPage
        book_id={editData?.book_id}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
      />
    </DialogContent>
  </Dialog>
);

export default AddBookModal;
