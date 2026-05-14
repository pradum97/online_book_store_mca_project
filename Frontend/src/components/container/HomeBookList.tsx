"use client";

import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import BookCard from "./BookCard";
import {
  GetAllBooksEP,
  GetCategoriesEP,
} from "@webEndPoints/handlers/bookWEB/bookWEB";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@redux/hooks/hooks";
import { setLoading } from "@redux/slice/menuSlice";
import React from "react";
import {
  IGetAllBooksEP,
  IGetCategoriesEP,
} from "@webEndPoints/handlers/bookWEB/IbookWEB";
import { RootState } from "@redux/store/store";
import { useQuery } from "@tanstack/react-query";
import CategoryToolbar from "./CategoryToolbar";
import FilterSidebar, { IFilterState } from "./FilterSidebar";

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Best Rating" },
  { value: "bestselling", label: "Best Selling" },
];

const DEFAULT_FILTERS: IFilterState = {
  categories: [],
  authors: [],
  priceRange: [0, 1000],
  minRating: 0,
};

// ─── IBookList (local interface used for filtering/sorting) ───────────────────
interface IBookList {
  book_id: string;
  image: string;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  discount?: number;
  is_in_cart?: boolean;
  stock_id: string;
  category_name: string;
}

const HomeBookList = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const loading = useAppSelector((state: RootState) => state.menu.loading);
  const [bookList, setBookList] = React.useState<IBookList[]>([]);

  // ── URL params ──
  const q = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("c");

  // ── Local filter + sort state ──
  const [filters, setFilters] = useState<IFilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("relevance");

  // ── Categories query ──
  const { data: categoriesList = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await GetCategoriesEP();
      return res?.data ?? [];
    },
  });

  // ── Derive unique authors from bookList for sidebar ──
  const authorList = useMemo(() => {
    const map = new Map<string, number>();
    bookList.forEach((b) => {
      map.set(b.author, (map.get(b.author) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [bookList]);

  // ── Category toolbar handlers ──
  const handleCategorySelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("c", id);
    router.push(`/?${params.toString()}`);
  };

  const handleClearCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("c");
    router.push(`/?${params.toString()}`);
  };

  // ── Fetch books ──
  const fetchBooks = async () => {
    try {
      dispatch(setLoading(true));
      const res = await GetAllBooksEP({
        q,
        category_id: selectedCategory ?? "",
      });
      setBookList(res?.data ?? []);
      return [];
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["books", q, selectedCategory ?? ""],
    queryFn: fetchBooks,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading]);

  const displayedBooks = useMemo(() => {
    let list = [...bookList];

    if (filters.categories.length > 0) {
      list = list.filter((b) =>
        filters.categories.some(
          (cId: string) =>
            categoriesList.find(
              (c: { category_id: string; category_name: string }) =>
                c.category_id === cId,
            )?.category_name === b.category_name,
        ),
      );
    }

    if (filters.authors.length > 0) {
      list = list.filter((b) => filters.authors.includes(b.author));
    }

    list = list.filter(
      (b) =>
        b.price >= filters.priceRange[0] && b.price <= filters.priceRange[1],
    );

    // Rating filter
    if (filters.minRating > 0) {
      list = list.filter((b) => b.rating >= filters.minRating);
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "bestselling":
        list.sort((a, b) => b.reviews - a.reviews);
        break;
      case "newest":
        // keep original order (newest from API)
        break;
      default:
        break;
    }

    return list;
  }, [bookList, filters, sortBy, categoriesList]);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // ── Categories formatted for sidebar ──
  const sidebarCategories = useMemo(() => {
    return categoriesList.map(
      (c: { category_id: string; category_name: string }) => ({
        category_id: c.category_id,
        category_name: c.category_name,
      }),
    );
  }, [categoriesList]);

  return (
    <>
      <Box sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* ── LEFT: Filter Sidebar ── */}
          <FilterSidebar
            categories={sidebarCategories}
            authors={authorList}
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            maxPrice={1000}
          />

          {/* ── RIGHT: Book Grid ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Top bar: count + sort */}
            {!loading && bookList.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2.5,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {/* Left: count */}
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#888",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Showing{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: "#111" }}>
                    {displayedBooks.length}
                  </Box>{" "}
                  of{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: "#111" }}>
                    {bookList.length}
                  </Box>{" "}
                  books
                </Typography>

                {/* Right: Sort by */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#888",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Sort by:
                  </Typography>
                  <Select
                    value={sortBy}
                    onChange={(e: SelectChangeEvent) =>
                      setSortBy(e.target.value)
                    }
                    size="small"
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#aaa",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e65c00",
                      },
                      "& .MuiSelect-select": {
                        py: "6px",
                        pr: "28px !important",
                        pl: 1.5,
                      },
                      borderRadius: "8px",
                      bgcolor: "#fff",
                      minWidth: 170,
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "10px",
                          mt: 0.5,
                          boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
                          border: "1px solid #f0f0f0",
                          fontFamily: "'DM Sans', sans-serif",
                        },
                      },
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <MenuItem
                        key={opt.value}
                        value={opt.value}
                        sx={{
                          fontSize: 13,
                          fontFamily: "'DM Sans', sans-serif",
                          color: "#333",
                          fontWeight: sortBy === opt.value ? 700 : 400,
                          "&.Mui-selected": {
                            bgcolor: "#fff5ee",
                            color: "#e65c00",
                          },
                          "&:hover": { bgcolor: "#fafafa" },
                        }}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>
            )}

            {/* Book list */}
            {loading ? (
              <Box display="flex" justifyContent="center" height={200}>
                <CircularProgress sx={{ color: "#e65c00" }} />
              </Box>
            ) : displayedBooks.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography fontSize={18}>No books found 📚</Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {displayedBooks.map((book, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <BookCard {...book} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default (
  <React.Suspense>
    <HomeBookList />
  </React.Suspense>
);
