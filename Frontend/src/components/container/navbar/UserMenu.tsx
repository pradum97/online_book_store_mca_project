"use client";

import { Avatar, Box, Menu, MenuItem, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import { IRole, ISessionData } from "@app/auth/lib/session";
import useSession from "@app/auth/session/useSession";
import { useRouter } from "next/navigation";
import ProfileModal from "@container/ProfileModal.tsx";
import EditProfileModal from "@modules/admin/user/signup/EditProfileModal";
import MyAddressesModal from "@modules/admin/user/MyAddressesModal";

interface Props {
  user: ISessionData;
  role: IRole;
}

export default function UserMenu({ user, role }: Props) {
  const { logout, session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const router = useRouter();
  const open = Boolean(anchorEl);

  const getInitials = () => {
    getMenuItems;
    const f = session?.first_name?.[0] ?? "";
    const l = session?.last_name?.[0] ?? "";
    return (f + l).toUpperCase() || "U";
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getMenuItems = () => {
    if (role === "CUSTOMER")
      return [
        "My Orders",
        "My Addresses",
        "Apply as Seller",
        "Profile",
        "Edit Profile",
        "Logout",
      ];
    if (role === "SELLER") {
      return ["Seller Status", "Profile", "Edit Profile", "Logout"];
    }

    return ["Profile", "Edit Profile", "Logout"];
  };

  const handleMenuClick = (item: string) => {
    if (item === "Logout") handleLogout();
    if (item === "Profile") setProfileOpen(true);
    if (item === "Edit Profile") setEditOpen(true);
    if (item === "My Addresses") setAddressOpen(true);

    if (item === "Apply as Seller" || item === "Seller Status") {
      router.push("/apply-seller-application");
    }

    if (item === "My Orders") {
      router.push("/my-order");
    }

    setAnchorEl(null);
  };

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          gap: 1,
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
          {getInitials()}
        </Avatar>
        <Typography
          sx={{
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 14,
          }}
        >
          {user?.username || "User"}
        </Typography>
        <KeyboardArrowDownIcon fontSize="small" />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { borderRadius: 2, mt: 1, minWidth: 180, boxShadow: 3 },
        }}
      >
        {getMenuItems().map((item) => (
          <MenuItem key={item} onClick={() => handleMenuClick(item)}>
            {item}
          </MenuItem>
        ))}
      </Menu>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        defaultValues={{
          first_name: session?.first_name || "",
          middle_name: session?.middle_name || "",
          last_name: session?.last_name || "",
          dob: session?.dob || null,
          gender: session?.gender || "",
          mobile: session?.mobile || "",
        }}
        onSuccess={() => {
          handleLogout();
        }}
      />

      <MyAddressesModal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
      />
    </>
  );
}
