"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Box,
  Typography,
  SxProps,
} from "@mui/material";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  rightToolBar?: React.ReactNode;
  children?: React.ReactNode;
  titleContainerSx?: SxProps;
  toolBarContainerSx?: SxProps;
  mainContainerSx?: SxProps;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  avatar,
  rightToolBar,
  titleContainerSx,
  children,
  toolBarContainerSx,
  mainContainerSx = {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
  },
}) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      overflow: "hidden",
      backgroundColor: "background.paper",
      height: "100%",

      "& .MuiCardHeader-root": {
        backgroundColor: "inherit",
        alignItems: "center",
        padding: "5px",
      },

      "& .MuiCardHeader-content": {
        minWidth: 0,
      },

      "& .MuiCardHeader-avatar": {
        alignSelf: "center",
        marginTop: 0,
        marginRight: { xs: 1, sm: 2 },
        display: { xs: "none", sm: "flex" },
      },

      "& .MuiCardContent-root": {
        backgroundColor: "inherit",
        padding: "5px",
      },

      "& .MuiDivider-root": {
        backgroundColor: "divider",
      },
    }}
    about="SectionCard"
  >
    <CardHeader
      avatar={avatar}
      sx={{
        alignItems: "stretch",
      }}
      title={
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "stretch",
            width: "100%",
            gap: 1,
            ...mainContainerSx,
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              ...titleContainerSx,
            }}
          >
            <Typography fontWeight={800}>{title}</Typography>

            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {rightToolBar && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                mt: { xs: 1, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                ...toolBarContainerSx,
              }}
            >
              {rightToolBar}
            </Box>
          )}
        </Box>
      }
    />

    <Divider />
    <CardContent>{children}</CardContent>
  </Card>
);

export default SectionCard;
