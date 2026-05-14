import { Box, Typography } from "@mui/material";

export default function AccessDenied() {
  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography variant="h5" fontWeight={600}>
        Access Denied 🚫
      </Typography>

      <Typography color="text.secondary">
        You are not allowed to access this page.
      </Typography>
    </Box>
  );
}
