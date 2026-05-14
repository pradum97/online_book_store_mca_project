import * as React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CallToActionOutlinedIcon from "@mui/icons-material/CallToActionOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import type { Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system";

interface Props {
  title: string | React.ReactNode;
  subtitle?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  showDivider?: boolean;
  ChildIsGrid?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyContainer?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  emptyMode?: "EMPTY" | "SUCCESS";
  titleSx?: SxProps<Theme>;
  childSx?: SxProps<Theme>;
  subtitleSx?: SxProps<Theme>;
  toolbarSx?: SxProps<Theme>;
}

const ContainerSet1: React.FC<Props> = ({
  title,
  subtitle,
  children,
  toolbar,
  sx,
  showDivider = true,
  ChildIsGrid = false,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No data found",
  emptyMode = "EMPTY",
  titleSx,
  childSx,
  subtitleSx,
  toolbarSx,
}) => {
  return (
    <Box
      about="ContainerSet1"
      sx={{
        boxShadow: "0px 0px 30px 0px rgb(82 63 105 / 5%)",
        border: 0,
        borderRadius: "0.42rem",
        background: "#ffffff",
        minHeight: isEmpty ? 180 : isLoading ? 100 : 20,
        padding: { xs: ".5rem 0.4rem", md: ".5rem 1rem" },
        height: ChildIsGrid ? `calc(100% - 12px)` : "100%",
        width: "100%",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: toolbar !== undefined ? "auto" : "100%",
            alignSelf:
              subtitle === undefined && toolbar !== undefined
                ? "center"
                : "center",
          }}
        >
          <Typography
            component="h3"
            sx={{
              fontWeight: 500,
              fontSize: "1.275rem",
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                color: "#20a6bb",
                mb:
                  subtitle === undefined && toolbar === undefined
                    ? 0.5
                    : undefined,
                ...titleSx,
              }}
            >
              {title}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontWeight: 500,
                my: 0.1,
                fontSize: "0.79rem",
                color: "rgb(0 0 0 / 51%)",
                ...subtitleSx,
              }}
            >
              {subtitle}
            </Typography>
          </Typography>
        </Box>
        <Box
          sx={{
            pb: subtitle === undefined && toolbar === undefined ? 0 : 0.5,
            ...toolbarSx,
          }}
        >
          {toolbar}
        </Box>
      </Box>
      {showDivider ? <Divider /> : null}

      <Box
        sx={{
          pt: 1,
          position: isLoading || isEmpty ? "relative" : "unset",
          height: "100%",
          display: isLoading || isEmpty ? "flex" : "unset",
          width: "100%",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              minWidth: 64,
              minHeight: 64,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              width: "100%",
              background: "#ffffff",
              zIndex: 2,
              alignSelf: "center",
              top: 0,
              height: "calc(100% - 45px)",
            }}
          >
            <CircularProgress />
          </Box>
        ) : isEmpty ? (
          <Box
            sx={{
              minWidth: 64,
              minHeight: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              width: "100%",
              background: "#ffffff",
              zIndex: 2,
              alignSelf: "center",
              top: 0,
              height: "calc(100% - 45px)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {emptyMode === "SUCCESS" ? (
                <ThumbUpIcon sx={{ fontSize: "4rem", color: "#e3e4e4" }} />
              ) : (
                <CallToActionOutlinedIcon
                  sx={{ fontSize: "4rem", color: "#e3e4e4" }}
                />
              )}

              <Typography
                variant="body2"
                component="div"
                color="text.secondary"
              >
                {emptyMessage}
              </Typography>
            </Box>
          </Box>
        ) : null}

        <Box
          sx={{
            visibility: isLoading || isEmpty ? "hidden" : undefined,
            ...childSx,
            paddingTop: "10px",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(ContainerSet1);
