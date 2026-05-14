"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import { SxProps, Theme } from "@mui/material/styles";

interface ActionContainerProps {
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
  className?: string;
}

const defaultSx: SxProps<Theme> = {
  borderRadius: "5px",
  px: 1.5,
  py: 0.75,
  flexWrap: "nowrap",
  gap: 0.8,
  alignItems: "flex-end",
  backgroundColor: "#bcc9f782",
  borderColor: "rgb(177 207 237)",
  borderWidth: ".66px",
  borderStyle: "solid",
  width: "100%",
  pt: 0.5,
  display: "flex",
  flexDirection: "row",
  position: "sticky",
  top: 0,
  zIndex: 10,
  boxShadow: 1,
};

const ActionContainer: React.FC<ActionContainerProps> = React.memo(
  ({ sx, children, className }) => {
    return (
      <Paper
        variant="outlined"
        className={className}
        sx={{ ...defaultSx, ...sx }}
      >
        {children}
      </Paper>
    );
  },
);

ActionContainer.displayName = "ActionContainer";
export default ActionContainer;
