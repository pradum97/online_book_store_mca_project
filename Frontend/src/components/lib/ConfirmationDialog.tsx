"use client";
import React, { useState, useEffect } from "react";
import * as ReactDOMClient from "react-dom/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";

interface InputConfig {
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

interface ConfirmationDialogProps {
  open: boolean;
  type: "APPROVED" | "CONFIRMATION" | "REMARK";
  title?: string;
  message?: string;
  input?: InputConfig;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  type,
  title,
  message,
  input,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [root, setRoot] = useState<ReactDOMClient.Root | null>(null);

  useEffect(() => {
    setInputValue("");
  }, [open]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const modalRoot = document.getElementById("modal-root") || document.body;
      setContainer(modalRoot);

      if (modalRoot && !root) {
        setRoot(ReactDOMClient.createRoot(modalRoot));
      }
    }
  }, [root]);

  useEffect(() => {
    if (root && container) {
      if (open) {
        root.render(
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title || type}</DialogTitle>
            <DialogContent>
              {message && <Typography>{message}</Typography>}
              {input && (
                <TextField
                  label={input.label || "Input"}
                  placeholder={input.placeholder}
                  multiline={input.multiline || false}
                  rows={input.rows || 1}
                  fullWidth
                  margin="normal"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                onClick={() => onConfirm(inputValue)}
                variant="contained"
                color={type === "APPROVED" ? "success" : "primary"}
                disabled={input ? inputValue.trim() === "" : false}
              >
                {type === "APPROVED" ? "Approve" : "Confirm"}
              </Button>
            </DialogActions>
          </Dialog>,
        );
      } else {
        root.unmount();
      }
    }
  }, [
    open,
    root,
    container,
    inputValue,
    onClose,
    onConfirm,
    title,
    type,
    message,
    input,
  ]);

  return null;
};
