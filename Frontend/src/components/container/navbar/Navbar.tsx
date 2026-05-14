"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import SearchBar from "./SearchBar";
import RoleRenderer from "./RoleRenderer";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@hooks/authentication/useAuth";
import React from "react";
import { IRole } from "@app/auth/lib/session";

export default function Navbar() {
  const router = useRouter();

  const { isAuthValid, sessionUser, isAuthLoading } = useAuth();

  console.log("useRouter--", isAuthValid, "--", sessionUser);

  const role: IRole | null = React.useMemo(() => {
    if (isAuthLoading) return null;
    if (!isAuthValid) return "GUEST";
    return sessionUser?.user_type_code || "GUEST";
  }, [isAuthValid, sessionUser, isAuthLoading]) as IRole;

  const pathname = usePathname();

  const shouldHideSearch = React.useMemo(() => {
    if (isAuthLoading) return true;

    const hiddenRoutes = ["/checkout", "/cart"];

    return (
      hiddenRoutes.includes(pathname) || role === "ADMIN" || role === "SELLER"
    );
  }, [pathname, role, isAuthLoading]);

  return (
    <Box
      sx={{
        width: "100%",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* 🔹 Top Strip */}
      {/* <Box
        sx={{
          background: "linear-gradient(90deg, #6366f1, #7c3aed)",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          px: 4,
          py: 1,
          fontSize: 14,
        }}
      >
        <Typography>Welcome to our Online Bookstore! 📚</Typography>
        <Typography>New Arrivals</Typography>
      </Box> */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 4,
          py: 1.5,
          backgroundColor: "#fff",
          gap: 3,
        }}
      >
        {/* Logo */}
        <Typography
          onClick={() => router.push("/")}
          sx={{
            fontWeight: 700,
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          📘 BookStore
        </Typography>
        <Box sx={{ flex: 1 }}>
          {!shouldHideSearch && <SearchBar role={role} />}
        </Box>

        {isAuthLoading ? (
          <Box sx={{ mr: 8 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <RoleRenderer role={role} user={sessionUser} />
        )}
      </Box>
    </Box>
  );
}
