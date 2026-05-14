import React, { ReactNode } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { SxProps, Theme } from "@mui/material/styles";

interface CustomDialogTitleProps {
  title?: ReactNode;
  onClose?: () => void;
  sx?: SxProps<Theme>;
  iconSx?: SxProps<Theme>;
  children?: React.ReactNode;
}

const CustomDialogTitle: React.FC<CustomDialogTitleProps> = ({
  title,
  onClose,
  sx = {},
  iconSx = {},
  children,
  ...otherProps
}) => {
  return (
    <DialogTitle
      sx={{
        color: "white",
        backgroundColor: "primary.main",
        textAlign: "center",
        fontSize: "14px",
        textTransform: "uppercase",
        position: "relative",
        ...sx,
        padding: { xs: "4px 10px", md: "1px 10px" },
      }}
      {...otherProps}
    >
      {title ?? children}
      {onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            padding: 0,
            right: 8,
            color: "white",
            ...iconSx,
            top: { xs: 6, md: 3 },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </DialogTitle>
  );
};

export default React.memo(CustomDialogTitle);
CustomDialogTitle.displayName = "CustomDialogTitle";
