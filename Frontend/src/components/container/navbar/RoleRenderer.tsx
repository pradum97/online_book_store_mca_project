"use client";

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { usePathname, useRouter } from "next/navigation";
import { roleConfig } from "@config/roleConfig";
import DropdownMenu from "./DropdownMenu";
import UserMenu from "./UserMenu";
import { IRole } from "@app/auth/lib/session";
import { GetCategoriesEP } from "@webEndPoints/handlers/bookWEB/bookWEB";
import { useQuery } from "@tanstack/react-query";
import LocalLibraryOutlinedIcon from "@mui/icons-material/LocalLibraryOutlined";
export const STOCK_TYPE = {
  ALL: "ALL",
  LOW: "LOW",
  OUT: "OUT",
} as const;

export const ORDER_STATUS = {
  ALL: "ALL",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type ISTOCK_TYPE = (typeof STOCK_TYPE)[keyof typeof STOCK_TYPE];
export type IORDER_STATUS = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

interface Props {
  role: IRole;
  user: any;
}

export default function RoleRenderer({ role, user }: Props) {
  const config = roleConfig[role];
  if (!config) return null;
  const router = useRouter();
  const pathname = usePathname();

  const { data: categoriesList = [] } = useQuery({
    queryKey: ["GetCategoriesEP"],
    enabled: role === "CUSTOMER" || role === "GUEST",
    queryFn: async () => {
      const res = await GetCategoriesEP();
      return res?.data ?? [];
    },
  });

  const navBtnSx = {
    textTransform: "none",
    color: "#111827",
    fontWeight: 500,
    fontSize: "14px",
    px: 1.5,
    py: 1,
    minHeight: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  };

  const iconSx = { fontSize: 20 };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        "& .MuiButton-startIcon": {
          marginRight: "1px",
        },
        "& .MuiButton-endIcon": {
          marginLeft: "1px",
        },
      }}
    >
      {config.items.map((item) => {
        switch (item) {
          case "dashboard":
            return (
              <Button
                key={item}
                startIcon={<DashboardOutlinedIcon sx={iconSx} />}
                sx={navBtnSx}
                onClick={() =>
                  router.push(
                    role === "ADMIN" ? "/admin/dashboard" : "/seller/dashboard",
                  )
                }
              >
                Dashboard
              </Button>
            );
          case "categories":
            return (
              <DropdownMenu
                key={item}
                label="Categories"
                icon={<MenuIcon sx={iconSx} />}
                items={categoriesList?.map((cat: any) => ({
                  label: cat.category_name,
                  value: cat.category_id,
                }))}
                onItemClick={(item) => {
                  router.push(`/?c=${item.value}`);
                }}
              />
            );

          case "cart":
            return (
              <Tooltip key={item} title="View Cart" arrow>
                <IconButton onClick={() => router.push("/cart")}>
                  <ShoppingCartOutlinedIcon sx={iconSx} />
                </IconButton>
              </Tooltip>
            );
          case "browseBooks":
            return (
              <Button
                key={item}
                startIcon={<MenuBookOutlinedIcon sx={iconSx} />}
                sx={navBtnSx}
                onClick={() => router.push("/books")}
              >
                Browse Books
              </Button>
            );
          case "login":
            return (
              <Button
                key={item}
                variant="outlined"
                onClick={() => router.push("/login")}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 2,
                  py: 1,
                }}
              >
                Login
              </Button>
            );

          case "signup":
            return (
              <Button
                key={item}
                variant="contained"
                onClick={() => router.push("/signup")}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 2,
                  py: 1,
                  background: "linear-gradient(90deg, #6366f1, #7c3aed)",
                }}
              >
                Sign Up
              </Button>
            );

          case "applySeller":
            if (role !== "CUSTOMER" || pathname === "/apply-seller-application")
              return null;
            return (
              <Button
                key={item}
                variant="contained"
                onClick={() => router.push("/apply-seller-application")}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 2,
                  py: 1,
                  background: "linear-gradient(90deg, #6366f1, #7c3aed)",
                }}
              >
                Apply as Seller
              </Button>
            );

          case "dashboard":
            return (
              <Button
                key={item}
                startIcon={<DashboardOutlinedIcon sx={iconSx} />}
                sx={navBtnSx}
              >
                Dashboard
              </Button>
            );

          case "myBooks":
            return (
              <Button
                key={item}
                startIcon={<MenuBookOutlinedIcon sx={iconSx} />}
                sx={navBtnSx}
                onClick={() => router.push("/seller/books")}
              >
                My Books
              </Button>
            );

          case "inventory":
            return (
              <DropdownMenu
                key={item}
                label="Inventory"
                icon={<Inventory2OutlinedIcon sx={iconSx} />}
                items={[
                  { label: "View / Add / Update Stock", value: "ALL" },
                  { label: "Low Stock Alerts", value: "LOW" },
                  { label: "Out of Stock Items", value: "OUT" },
                ]}
                onItemClick={(item) => {
                  router.push(`/seller/stocks?type=${item.value}`);
                }}
              />
            );

          case "orders":
            return (
              <DropdownMenu
                key={item}
                label="Orders"
                icon={<ShoppingBagOutlinedIcon sx={iconSx} />}
                items={[
                  { label: "All Orders", value: ORDER_STATUS.ALL },
                  { label: "Pending Orders", value: ORDER_STATUS.PENDING },
                  { label: "Confirmed Orders", value: ORDER_STATUS.CONFIRMED },
                  { label: "Shipped Orders", value: ORDER_STATUS.SHIPPED },
                  { label: "Delivered Orders", value: ORDER_STATUS.DELIVERED },
                  { label: "Cancelled Orders", value: ORDER_STATUS.CANCELLED },
                ]}
                onItemClick={(item) => {
                  router.push(`/seller/orders?status=${item.value}`);
                }}
              />
            );
          case "returns":
            return (
              <Button
                key={item}
                startIcon={<LocalLibraryOutlinedIcon sx={iconSx} />}
                sx={navBtnSx}
                onClick={() => router.push("/seller/returns")}
              >
                Returns
              </Button>
            );

          case "users":
            return (
              <Button
                key={item}
                startIcon={<PeopleOutlineIcon sx={iconSx} />}
                sx={navBtnSx}
                onClick={() => router.push("/admin/users")}
              >
                Users
              </Button>
            );

          case "sellers":
            return (
              <Button
                key={item}
                startIcon={<StorefrontOutlinedIcon sx={iconSx} />}
                sx={navBtnSx}
                onClick={() => router.push("/admin/sellers")}
              >
                Sellers
              </Button>
            );

          case "userTypes":
            return (
              <Button
                key={item}
                startIcon={<CategoryOutlinedIcon sx={iconSx} />}
                sx={navBtnSx}
              >
                User Types
              </Button>
            );

          case "userMenu":
            return <UserMenu key={item} user={user} role={role} />;

          default:
            return null;
        }
      })}
    </Box>
  );
}
