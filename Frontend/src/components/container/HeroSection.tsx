"use client";

import { Box, Typography } from "@mui/material";
import SearchBar from "./navbar/SearchBar";
import useSWR from "swr";
import useSession from "@app/auth/session/useSession";

interface Props {
  bottomToolbar?: React.ReactNode;
}

export default function HeroSection({ bottomToolbar }: Props) {
  const { session } = useSession();

  return (
    <Box
      sx={{
        background: `
      radial-gradient(circle at 50% 30%, rgba(124,58,237,0.6), transparent 60%),
      linear-gradient(135deg, #776cf2 0%, #8944f8 50%, #9155f9 100%)
    `,
        color: "#fff",
        py: 3,
        px: 2,
        textAlign: "center",
      }}
    >
      {/* 🔥 Heading */}
      <Typography
        sx={{
          fontSize: "48px",
          fontWeight: 700,
          mb: 2,
        }}
      >
        Discover Your Next Favorite Book
      </Typography>

      {/* 🔥 Subtitle */}
      <Typography
        sx={{
          fontSize: "18px",
          opacity: 0.9,
          maxWidth: 700,
          mx: "auto",
          mb: 4,
        }}
      >
        Explore thousands of books across all genres. Find bestsellers, new
        releases, and timeless classics.
      </Typography>

      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <SearchBar role={session?.user_type_code} />
      </Box>

      {bottomToolbar && <Box mt={8}>{bottomToolbar}</Box>}
    </Box>
  );
}
