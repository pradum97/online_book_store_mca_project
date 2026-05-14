import { ConfirmationDialog } from "@lib/ConfirmationDialog";
import React, { createContext, useContext, useState, ReactNode } from "react";

type ConfirmationType = "APPROVED" | "CONFIRMATION" | "REMARK";

interface InputConfig {
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

interface ShowDialogParams {
  type: ConfirmationType;
  title?: string;
  message?: string;
  input?: InputConfig;
  onConfirm: (inputValue?: string) => void;
}

interface ConfirmationContextValue {
  showDialog: (params: ShowDialogParams) => void;
}

const ConfirmationContext = createContext<ConfirmationContextValue | undefined>(
  undefined
);

export const ConfirmationDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [dialogParams, setDialogParams] = useState<ShowDialogParams | null>(
    null
  );
  const [open, setOpen] = useState(false);

  const showDialog = (params: ShowDialogParams) => {
    setDialogParams(params);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleConfirm = (inputValue?: string) => {
    if (dialogParams) dialogParams.onConfirm(inputValue);
    setOpen(false);
  };

  return (
    <ConfirmationContext.Provider value={{ showDialog }}>
      {children}
      {dialogParams && (
        <ConfirmationDialog
          open={open}
          type={dialogParams.type}
          title={dialogParams.title}
          message={dialogParams.message}
          input={dialogParams.input}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirmationDialog = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      "useConfirmationDialog must be used within a ConfirmationDialogProvider"
    );
  }
  return context;
};
