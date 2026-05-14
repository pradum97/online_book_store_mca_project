"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";
import { IGetSellerBookListEP } from "@webEndPoints/handlers/bookWEB/IbookWEB";
import { UploadBookImagesEP } from "@webEndPoints/handlers/bookWEB/bookWEB";

interface ImageUploadModalProps {
  open: boolean;
  book: IGetSellerBookListEP | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ImageUploadModal = ({
  open,
  book,
  onClose,
  onSuccess,
}: ImageUploadModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
      setPreviews([]);
      setDragOver(false);
    }
  }, [open]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) {
      toast.error("Only image files are allowed");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
    valid.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!book || selectedFiles.length === 0) return;

    try {
      setUploading(true);

      const res = await UploadBookImagesEP(book.book_id, selectedFiles);

      console.log("UploadBookImagesEP-", res);

      toast.success(res.message);

      if (res?.action === "success") {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 100);
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
        },
      }}
    >
      {/* Header */}
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
          <AddPhotoAlternateIcon sx={{ fontSize: 20, color: "#a5b4fc" }} />
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "#fff",
            }}
          >
            Upload Images
          </Typography>
          {book && (
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
                {book.title}
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          disabled={uploading}
          size="small"
          sx={{
            color: "#a5b4fc",
            "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Drop Zone */}
        <Box
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          sx={{
            border: `2px dashed ${dragOver ? "#6366f1" : "#c7d2fe"}`,
            borderRadius: "14px",
            background: dragOver ? "#eef2ff" : "#f5f3ff",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            "&:hover": { borderColor: "#6366f1", background: "#eef2ff" },
            mb: 2.5,
            mt: 1,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => addFiles(e.target.files)}
          />
          <CloudUploadIcon
            sx={{ fontSize: 40, color: "#6366f1", mb: 1, opacity: 0.7 }}
          />
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              color: "#4338ca",
              mb: 0.5,
            }}
          >
            Click to browse or drag & drop
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            PNG, JPG, JPEG, WEBP — multiple files allowed
          </Typography>
        </Box>

        {previews.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 12,
                  color: "#374151",
                }}
              >
                {previews.length} file{previews.length > 1 ? "s" : ""} selected
              </Typography>
              <Box
                component="button"
                onClick={() => {
                  setSelectedFiles([]);
                  setPreviews([]);
                }}
                disabled={uploading}
                sx={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#ef4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  "&:hover": { color: "#be123c" },
                }}
              >
                Clear all
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {previews.map((src, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    width: 80,
                    height: 80,
                    borderRadius: "10px",
                    overflow: "visible",
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "10px",
                      objectFit: "cover",
                      border: "2px solid #e0e7ff",
                    }}
                  />
                  {/* Remove button */}
                  {!uploading && (
                    <Box
                      onClick={() => removeFile(idx)}
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#ef4444",
                        border: "2px solid #fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 2,
                        "&:hover": { background: "#be123c" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 11, color: "#fff" }} />
                    </Box>
                  )}
                  {/* File name */}
                  <Typography
                    sx={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 9,
                      color: "#6b7280",
                      textAlign: "center",
                      mt: 0.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 80,
                    }}
                  >
                    {selectedFiles[idx]?.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box
          component="button"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          sx={{
            width: "100%",
            py: 1.3,
            borderRadius: "10px",
            background:
              selectedFiles.length === 0 || uploading
                ? "#e0e7ff"
                : "linear-gradient(135deg, #6366f1, #4f46e5)",
            border: "none",
            color: selectedFiles.length === 0 || uploading ? "#a5b4fc" : "#fff",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 14,
            cursor:
              selectedFiles.length === 0 || uploading
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            boxShadow:
              selectedFiles.length > 0 && !uploading
                ? "0 4px 14px rgba(99,102,241,0.35)"
                : "none",
            transition: "all 0.2s",
            "&:hover:not(:disabled)": {
              background: "linear-gradient(135deg, #4f46e5, #3730a3)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {uploading ? (
            <>
              <CircularProgress size={15} sx={{ color: "#a5b4fc" }} /> Uploading{" "}
              {selectedFiles.length} image{selectedFiles.length > 1 ? "s" : ""}
              ...
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 17 }} /> Upload{" "}
              {selectedFiles.length > 0
                ? `${selectedFiles.length} Image${selectedFiles.length > 1 ? "s" : ""}`
                : "Images"}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
