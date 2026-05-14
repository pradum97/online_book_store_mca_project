import { Box, Typography, CircularProgress } from "@mui/material";

export default function PermissionLoading() {
  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress size={25} />
      <Typography variant="h6" fontWeight={500} fontSize={"14px"}>
        Checking permissions...
      </Typography>
    </Box>
  );
}
