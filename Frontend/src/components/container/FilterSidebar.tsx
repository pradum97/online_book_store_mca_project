"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider,
  Divider,
  Button,
  Collapse,
  IconButton,
  Rating,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IFilterState {
  categories: string[];
  authors: string[];
  priceRange: [number, number];
  minRating: number;
}

interface IFilterSidebarProps {
  categories: { category_id: string; category_name: string; count?: number }[];
  authors: { name: string; count?: number }[];
  filters: IFilterState;
  onChange: (filters: IFilterState) => void;
  onClear: () => void;
  maxPrice?: number;
}

// ─── Default export ───────────────────────────────────────────────────────────
export default function FilterSidebar({
  categories,
  authors,
  filters,
  onChange,
  onClear,
  maxPrice = 1000,
}: IFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    category: false,
    author: true,
    price: true,
    rating: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.authors.length > 0 ||
    filters.minRating > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  // ── Handlers ──
  const handleCategoryToggle = useCallback(
    (id: string) => {
      const updated = filters.categories.includes(id)
        ? filters.categories?.filter((c) => c !== id)
        : [...filters.categories, id];
      onChange({ ...filters, categories: updated });
    },
    [filters, onChange],
  );

  const handleAuthorToggle = useCallback(
    (name: string) => {
      const updated = filters.authors.includes(name)
        ? filters.authors?.filter((a) => a !== name)
        : [...filters.authors, name];
      onChange({ ...filters, authors: updated });
    },
    [filters, onChange],
  );

  const handlePriceChange = useCallback(
    (_: Event, val: number | number[]) => {
      onChange({ ...filters, priceRange: val as [number, number] });
    },
    [filters, onChange],
  );

  const handleRatingChange = useCallback(
    (val: number) => {
      onChange({ ...filters, minRating: filters.minRating === val ? 0 : val });
    },
    [filters, onChange],
  );

  // ── Section header ──
  const SectionHeader = ({
    label,
    sectionKey,
  }: {
    label: string;
    sectionKey: keyof typeof openSections;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        mb: 1,
      }}
      onClick={() => toggleSection(sectionKey)}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 13,
          color: "#111",
          letterSpacing: 0.3,
          fontFamily: "'DM Sans', sans-serif",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <IconButton size="small" sx={{ p: 0, color: "#888" }}>
        {openSections[sectionKey] ? (
          <ExpandLessIcon fontSize="small" />
        ) : (
          <ExpandMoreIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  );

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        bgcolor: "#fff",
        border: "1px solid #ebebeb",
        borderRadius: "16px",
        p: 2.5,
        height: "fit-content",
        position: "sticky",
        top: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <FilterListIcon sx={{ fontSize: 18, color: "#111" }} />
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 16,
              color: "#111",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Filters
          </Typography>
        </Box>
        {hasActiveFilters && (
          <Button
            onClick={onClear}
            size="small"
            sx={{
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "#e65c00",
              fontWeight: 600,
              p: 0,
              minWidth: 0,
              "&:hover": {
                background: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2, borderColor: "#f0f0f0" }} />

      {/* ── Category ── */}
      <Box mb={2}>
        <SectionHeader label="Category" sectionKey="category" />
        <Collapse in={openSections.category}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2 }}>
            {categories.map((cat) => (
              <FormControlLabel
                key={cat.category_id}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.categories.includes(cat.category_id)}
                    onChange={() => handleCategoryToggle(cat.category_id)}
                    sx={{
                      color: "#ccc",
                      "&.Mui-checked": { color: "#e65c00" },
                      p: "4px 8px",
                    }}
                  />
                }
                label={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      pr: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#333",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {cat.category_name}
                    </Typography>
                    {cat.count !== undefined && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#bbb",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {cat.count}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{
                  mx: 0,
                  width: "100%",
                  ".MuiFormControlLabel-label": { width: "100%" },
                }}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ mb: 2, borderColor: "#f0f0f0" }} />

      {/* ── Author ── */}
      <Box mb={2}>
        <SectionHeader label="Author" sectionKey="author" />
        <Collapse in={openSections.author}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2 }}>
            {authors.map((author) => (
              <FormControlLabel
                key={author.name}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.authors.includes(author.name)}
                    onChange={() => handleAuthorToggle(author.name)}
                    sx={{
                      color: "#ccc",
                      "&.Mui-checked": { color: "#e65c00" },
                      p: "4px 8px",
                    }}
                  />
                }
                label={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      pr: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#333",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {author.name}
                    </Typography>
                    {author.count !== undefined && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#bbb",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {author.count}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{
                  mx: 0,
                  width: "100%",
                  ".MuiFormControlLabel-label": { width: "100%" },
                }}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ mb: 2, borderColor: "#f0f0f0" }} />

      {/* ── Price Range ── */}
      <Box mb={2}>
        <SectionHeader label="Price Range" sectionKey="price" />
        <Collapse in={openSections.price}>
          <Typography
            sx={{
              fontSize: 12,
              color: "#888",
              mb: 1.5,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ₹{filters.priceRange[0]} — ₹{filters.priceRange[1]}
          </Typography>
          <Slider
            value={filters.priceRange}
            onChange={handlePriceChange}
            min={0}
            max={maxPrice}
            step={50}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `₹${v}`}
            sx={{
              color: "#e65c00",
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                "&:hover": { boxShadow: "0 0 0 6px rgba(230,92,0,0.15)" },
              },
              "& .MuiSlider-rail": { bgcolor: "#e0e0e0" },
            }}
          />
        </Collapse>
      </Box>

      <Divider sx={{ mb: 2, borderColor: "#f0f0f0" }} />
    </Box>
  );
}
