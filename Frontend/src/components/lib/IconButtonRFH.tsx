"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { IconButtonProps } from "@mui/material";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface IconButtonRFHProps extends IconButtonProps {
  children: React.ReactNode;
}

const IconButtonRFH: React.FC<IconButtonRFHProps> = ({
  children,
  ...props
}) => {
  return <StyledIconButton {...props}>{children}</StyledIconButton>;
};

export default React.memo(IconButtonRFH);
IconButtonRFH.displayName = "IconButtonRFH";
