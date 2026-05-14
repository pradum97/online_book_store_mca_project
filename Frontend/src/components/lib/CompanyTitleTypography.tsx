"use client";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { SITE_TITLE_1, SITE_TITLE_2 } from "@config/appSetting";
import { useRouter } from "next/navigation";
import { useMediaQuery, useTheme } from "@mui/material";

const CompanyTitleTypography = ({
  text1 = SITE_TITLE_1,
  text2 = SITE_TITLE_2,
  fontWeight = 700,
  fontSize = "2rem",
  gradientColor1 = "#006699",
  gradientColor2 = "#993366",
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      maxWidth="350px"
      height="50px"
      onClick={() => {
        if (isDesktop) {
          router.push("/");
        }
      }}
    >
      <Typography
        variant="h5"
        fontWeight={fontWeight}
        fontSize={fontSize}
        sx={{
          color: gradientColor1,
          fontFamily: "sans-serif",
        }}
      >
        {text1}
      </Typography>

      <Typography
        variant="h5"
        fontWeight={fontWeight}
        fontSize={fontSize}
        sx={{
          color: gradientColor2,
          fontFamily: "sans-serif",
        }}
      >
        {text2}
      </Typography>
    </Box>
  );
};

export default React.memo(CompanyTitleTypography);
CompanyTitleTypography.displayName = "CompanyTitleTypography";
