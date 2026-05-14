import * as React from "react";
import { Backdrop, Box, CircularProgress, SxProps, Theme } from "@mui/material";
import LoadingAnimation from "./LoadingAnimation";

interface IProps {
  text?: string;
  sx?: SxProps<Theme> | undefined;
  color?: string;
  backgroundColor?: string;
}

const CustomBackdrop = ({ text, color = "#fff", backgroundColor }: IProps) => {
  return (
    <Backdrop
      sx={(theme) => ({
        color: color,
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: backgroundColor,
      })}
      open={true}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CircularProgress sx={{ alignSelf: "center" }} color="inherit" />

        <LoadingAnimation text={text}></LoadingAnimation>
      </Box>
    </Backdrop>
  );
};
export default React.memo(CustomBackdrop);
CustomBackdrop.displayName = "CustomBackdrop";
