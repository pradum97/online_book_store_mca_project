"use client";

import { Box, CircularProgress, Grid, Typography, Button } from "@mui/material";
import BookCard from "./BookCard";
import {
  GetAllBooksEP,
  GetCategoriesEP,
} from "@webEndPoints/handlers/bookWEB/bookWEB";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@redux/hooks/hooks";
import { setLoading } from "@redux/slice/menuSlice";
import React from "react";
import { IGetAllBooksEP } from "@webEndPoints/handlers/bookWEB/IbookWEB";
import { RootState } from "@redux/store/store";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "./HeroSection";
import CategoryToolbar from "./CategoryToolbar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

const MAX_BOOKS = 8;

// ─── Why Read section data ────────────────────────────────────────────────────
const WHY_READ = [
  {
    icon: <AutoStoriesOutlinedIcon sx={{ fontSize: 28, color: "#e65c00" }} />,
    title: "10,000+ Books",
    desc: "Explore a massive collection across every genre — fiction, self-help, science, and more.",
  },
  {
    icon: <LocalOfferOutlinedIcon sx={{ fontSize: 28, color: "#e65c00" }} />,
    title: "Best Prices",
    desc: "Get up to 50% off on bestsellers. New deals every week, curated just for you.",
  },
  {
    icon: <StarOutlineIcon sx={{ fontSize: 28, color: "#e65c00" }} />,
    title: "Trusted Reviews",
    desc: "Real ratings from real readers. Find your next favourite with confidence.",
  },
];

export default function TrendingBooks() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const loading = useAppSelector((state: RootState) => state.menu.loading);
  const [bookList, setBookList] = React.useState<IGetAllBooksEP[]>([]);

  const q = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("c");

  const { data: categoriesList = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await GetCategoriesEP();
      return res?.data ?? [];
    },
  });

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

  // ── Slice to max 8 ──
  const trendingBooks = bookList.slice(0, MAX_BOOKS);
  const hasMore = bookList.length > MAX_BOOKS;

  return (
    <>
      {/* 🔥 HERO */}
      <HeroSection
        bottomToolbar={
          <CategoryToolbar
            categories={categoriesList}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
            onClear={handleClearCategory}
          />
        }
      />

      {/* ═══════════════════════════════════════════
          TRENDING BOOKS SECTION
      ═══════════════════════════════════════════ */}
      <Box sx={{ px: { xs: 2, md: 5 }, py: 4 }}>
        {!loading && trendingBooks.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 20, md: 26 },
                  fontWeight: 800,
                  color: "#111",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.2,
                }}
              >
                Trending Books
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#aaa",
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.3,
                }}
              >
                Most loved picks this week
              </Typography>
            </Box>

            {/* Quick link — visible on desktop */}
            <Button
              onClick={() => router.push("/books")}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              sx={{
                display: { xs: "none", sm: "flex" },
                textTransform: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#e65c00",
                "&:hover": { background: "#fff5ee" },
                borderRadius: "8px",
                px: 2,
              }}
            >
              Browse all
            </Button>
          </Box>
        )}

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            height={200}
            alignItems="center"
          >
            <CircularProgress sx={{ color: "#e65c00" }} />
          </Box>
        ) : trendingBooks.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography fontSize={18}>No books found 📚</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2.5}>
              {trendingBooks.map((book, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <BookCard {...book} />
                </Grid>
              ))}
            </Grid>

            {/* ── Browse Books Button ── */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 5,
                gap: 1,
              }}
            >
              {hasMore && (
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#bbb",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Showing 8 of {bookList.length} books
                </Typography>
              )}
              <Button
                onClick={() => router.push("/books")}
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#111",
                  borderColor: "#111",
                  borderRadius: "12px",
                  px: 4,
                  py: 1.2,
                  "&:hover": {
                    background: "#111",
                    color: "#fff",
                    borderColor: "#111",
                  },
                  transition: "all 0.2s",
                }}
              >
                Browse All Books
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* ═══════════════════════════════════════════
          WHY READ WITH US — 3 feature cards
      ═══════════════════════════════════════════ */}
      <Box
        sx={{
          px: { xs: 2, md: 5 },
          py: 6,
          bgcolor: "#fafafa",
          borderTop: "1px solid #f0f0f0",
          borderBottom: "1px solid #f0f0f0",
          mt: 4,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 20, md: 24 },
            fontWeight: 800,
            color: "#111",
            fontFamily: "'DM Sans', sans-serif",
            mb: 4,
            textAlign: "center",
          }}
        >
          Why Shop With Us?
        </Typography>

        <Grid container spacing={3}>
          {WHY_READ.map((item, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Box
                sx={{
                  bgcolor: "#fff",
                  border: "1px solid #ebebeb",
                  borderRadius: "16px",
                  p: 3.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  height: "100%",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 8px 32px rgba(0,0,0,0.07)" },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    bgcolor: "#fff5ee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#111",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#888",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ═══════════════════════════════════════════
          NEWSLETTER / CTA BANNER
      ═══════════════════════════════════════════ */}
      <Box
        sx={{
          mx: { xs: 2, md: 5 },
          my: 5,
          borderRadius: "20px",
          background: `
      radial-gradient(circle at 50% 30%, rgba(124,58,237,0.6), transparent 60%),
      linear-gradient(135deg, #776cf2 0%, #8944f8 50%, #9155f9 100%)
    `,
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 5 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 20, md: 26 },
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.3,
            }}
          >
            Ready to find your next great read?
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
              mt: 0.8,
            }}
          >
            Thousands of titles, unbeatable prices. Start exploring now.
          </Typography>
        </Box>
        <Button
          onClick={() => router.push("/books")}
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            textTransform: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            color: "#fff",
            borderRadius: "12px",
            px: 4,
            py: 1.4,
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": { bgcolor: "#cf5200" },
          }}
        >
          Browse Books
        </Button>
      </Box>
    </>
  );
}
