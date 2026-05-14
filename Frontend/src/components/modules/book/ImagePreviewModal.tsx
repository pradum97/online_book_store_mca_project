"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { toast } from "react-toastify";
import { IBookListImage } from "@webEndPoints/handlers/bookWEB/IbookWEB";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { DeleteBookImageEP } from "@webEndPoints/handlers/bookWEB/bookWEB";

interface ImagePreviewModalProps {
  open: boolean;
  images: IBookListImage[];
  bookTitle: string;
  onClose: () => void;
  onImageDeleted: () => void;
}

const ImagePreviewModal = ({
  open,
  images,
  bookTitle,
  onClose,
  onImageDeleted,
}: ImagePreviewModalProps) => {
  const [selected, setSelected] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<IBookListImage | null>(
    null,
  );

  React.useEffect(() => {
    if (open) {
      setSelected(0);
      setDeleteConfirm(null);
    }
  }, [open]);

  const [localImages, setLocalImages] = useState<IBookListImage[]>(images);

  React.useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      setDeletingId(deleteConfirm.image_id);
      const res = await DeleteBookImageEP(deleteConfirm.image_id);
      toast[res?.action as "success"](res.message ?? res?.title);
      const newImages = localImages?.filter(
        (i) => i.image_id !== deleteConfirm.image_id,
      );
      setLocalImages(newImages);
      setSelected((prev) => Math.min(prev, Math.max(newImages.length - 1, 0)));
      setDeleteConfirm(null);
      onImageDeleted();
      if (newImages.length === 0) onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
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
            <ImageIcon sx={{ fontSize: 20, color: "#a5b4fc" }} />
            <Typography
              sx={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: "#fff",
              }}
            >
              {bookTitle} — Images
            </Typography>
            <Box
              sx={{
                ml: 1,
                px: 1.5,
                py: 0.2,
                borderRadius: "20px",
                background: "rgba(165,180,252,0.2)",
                border: "1px solid rgba(165,180,252,0.3)",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#a5b4fc",
                }}
              >
                {localImages.length} image{localImages.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
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

        <DialogContent sx={{ p: 0 }}>
          {localImages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 48 }}>📷</Typography>
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#9ca3af",
                }}
              >
                No images available
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              {/* Main image */}
              <Box
                sx={{
                  width: "100%",
                  height: 340,
                  borderRadius: "14px",
                  overflow: "hidden",
                  background: "#f3f4f6",
                  mb: 2.5,
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={localImages[selected]?.image_url}
                  alt={`Book image ${selected + 1}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transition: "opacity 0.2s",
                  }}
                  onError={(e: any) => {
                    e.target.src =
                      "https://via.placeholder.com/600x340?text=Image+Not+Found";
                  }}
                />
                {/* Counter badge */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    px: 1.5,
                    py: 0.4,
                    borderRadius: "20px",
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {selected + 1} / {localImages.length}
                  </Typography>
                </Box>

                {/* Delete current image btn */}
                <Tooltip title="Delete this image" placement="left">
                  <Box
                    onClick={() => setDeleteConfirm(localImages[selected])}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 34,
                      height: 34,
                      borderRadius: "9px",
                      background: "rgba(225,29,72,0.85)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      "&:hover": { background: "rgba(190,18,60,0.95)" },
                      transition: "all 0.15s",
                    }}
                  >
                    {deletingId === localImages[selected]?.image_id ? (
                      <CircularProgress size={14} sx={{ color: "#fff" }} />
                    ) : (
                      <DeleteIcon sx={{ fontSize: 16, color: "#fff" }} />
                    )}
                  </Box>
                </Tooltip>
              </Box>

              {/* Thumbnails */}
              {localImages.length > 1 && (
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  {localImages.map((img, idx) => (
                    <Box
                      key={img.image_id}
                      onClick={() => setSelected(idx)}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "10px",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: `2.5px solid ${idx === selected ? "#6366f1" : "#e5e7eb"}`,
                        transition: "all 0.15s",
                        "&:hover": {
                          borderColor: "#6366f1",
                          transform: "scale(1.04)",
                        },
                        opacity: deletingId === img.image_id ? 0.4 : 1,
                      }}
                    >
                      <Box
                        component="img"
                        src={img.image_url}
                        alt={`thumb ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e: any) => {
                          e.target.src =
                            "https://via.placeholder.com/80x80?text=?";
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        title="Delete Image?"
        message="This image will be permanently removed. This action cannot be undone."
        loading={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
};

export default ImagePreviewModal;
