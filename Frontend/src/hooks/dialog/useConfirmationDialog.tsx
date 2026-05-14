"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

type DialogType = "APPROVED" | "CONFIRMATION" | "REMARK";

interface InputConfig {
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

interface DialogConfig {
  type?: DialogType;
  title?: string;
  message?: string;
  input?: InputConfig;
  onConfirm?: (inputValue?: string) => void;
}

export function useConfirmationDialog() {
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<ReactDOMClient.Root | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const container = document.createElement("div");
    container.id = "confirmation-dialog-container";
    document.body.appendChild(container);
    containerRef.current = container;

    rootRef.current = ReactDOMClient.createRoot(container);

    return () => {
      if (containerRef.current) {
        document.body.removeChild(containerRef.current);
        containerRef.current = null;
      }
      rootRef.current = null;
    };
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config?.onConfirm) {
      config.onConfirm(config.input ? inputValue : undefined);
    }
    setOpen(false);
  }, [config, inputValue]);

  const showDialog = useCallback((dialogConfig: DialogConfig) => {
    setConfig(dialogConfig);
    setInputValue("");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    if (open && config) {
      rootRef.current.render(
        <Dialog
          open
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          aria-labelledby="confirmation-dialog-title"
        >
          <DialogTitle
            id="confirmation-dialog-title"
            sx={{
              padding: "5px 8px",
              fontSize: "18px",
            }}
          >
            {config.title || config.type || "Dialog"}
          </DialogTitle>

          <DialogContent dividers>
            {/* Always show message if exists */}
            {config.message && (
              <Typography
                variant="body1"
                sx={{ mb: config.input ? 2 : 0 }}
                data-testid="dialog-message"
              >
                {config.message}
              </Typography>
            )}

            {/* Show input only if input config is passed */}
            {config.input && (
              <TextField
                label={config.input.label || "Input"}
                placeholder={
                  config.input.placeholder || "Type your remark here..."
                }
                multiline={config.input.multiline || true}
                rows={config.input.rows || 3}
                fullWidth
                margin="normal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
                data-testid="dialog-input"
              />
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color={config.type === "APPROVED" ? "success" : "primary"}
              disabled={config.input ? inputValue.trim() === "" : false}
            >
              {config.type === "APPROVED" ? "Approve" : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>
      );
    } else {
      rootRef.current.render(null);
    }
  }, [open, config, inputValue, handleClose, handleConfirm]);

  return { showDialog };
}
