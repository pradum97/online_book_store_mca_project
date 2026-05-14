import { Stack, Chip, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

const CategoryToolbar = ({
  categories,
  selectedCategory,
  onSelect,
  onClear,
}: any) => {
  return (
    <Box
      sx={{
        mx: "auto",
        mt: 2,
      }}
    >
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="center"
        useFlexGap
        gap={1.2}
      >
        {categories.map((cat: any) => {
          const active = selectedCategory === cat.category_id;

          return (
            <Chip
              key={cat.category_id}
              label={cat.category_name}
              onClick={() => onSelect(cat.category_id)}
              clickable
              deleteIcon={active ? <CloseIcon color="error" /> : undefined}
              onDelete={active ? () => onClear() : undefined}
              sx={{
                height: 36,
                px: 1.2,
                fontWeight: 500,
                minWidth: 0,

                bgcolor: active ? "#fff" : "rgba(255,255,255,0.15)",

                color: active ? "#111" : "#fff",

                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(6px)",

                transition: "all 0.2s ease",

                "&:hover": {
                  bgcolor: active ? "#fff" : "rgba(255,255,255,0.25)",
                },

                boxShadow: active ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
export default React.memo(CategoryToolbar);
