"use client";

import { useState } from "react";
import { Button, Menu, MenuItem, ListItemText } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface IDropdownItem {
  label: string;
  value: string;
}

interface Props {
  label: string;
  items: IDropdownItem[];
  icon?: React.ReactNode;
  onItemClick?: (item: IDropdownItem) => void;
}

export default function DropdownMenu({
  label,
  items,
  icon,
  onItemClick,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (item: IDropdownItem) => {
    setAnchorEl(null);
    onItemClick?.(item);
  };

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={icon}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
        sx={{
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
        }}
      >
        {label}
      </Button>

      {/* DROPDOWN */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "10px",
            minWidth: 200,
            boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
            py: 1,
          },
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.value}
            onClick={() => handleClick(item)}
            sx={{
              fontSize: "14px",
              px: 2,
              py: 1,
              "&:hover": {
                backgroundColor: "#f9fafb",
              },
            }}
          >
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
