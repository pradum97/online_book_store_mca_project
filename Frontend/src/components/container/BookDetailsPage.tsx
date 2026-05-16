"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Grid,
  Skeleton,
  IconButton,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BookCard from "./BookCard";
import ButtonRFH from "@lib/ButtonRFH";
import PageContainer from "@container/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { GetBookByIdEP } from "@webEndPoints/handlers/bookWEB/bookWEB";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@hooks/authentication/useAuth";
import { AddToCartEP } from "@webEndPoints/handlers/cartWEB/cartWEB";
import { toast } from "react-toastify";
import React from "react";

interface BookImage {
  image_id: string;
  image_url: string;
}

interface BookDetail {
  book_id: string;
  stock_id: string;
  is_in_cart: boolean;
  title: string;
  author: string;
  description: string;
  created_date: string;
  category_name: string;
  seller_name: string;
  images: BookImage[];
  originalPrice: number;
  price: number;
}

export default function BookDetailsPage() {
  const { isAuthValid } = useAuth();
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id as string;
  const [inCart, setInCart] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: book, isLoading } = useQuery<BookDetail>({
    queryKey: ["GetBookByIdEP", bookId],
    queryFn: async () => {
      const res = await GetBookByIdEP(bookId);
      return res?.data;
    },
    enabled: !!bookId,
  });

  const stock_id = book?.stock_id ?? "";

  const images = book?.images ?? [];
  const activeImage = images[activeImageIndex]?.image_url ?? "";

  React.useEffect(() => {
    if (book?.is_in_cart !== undefined) {
      setInCart(book.is_in_cart);
    }
  }, [book]);

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const addToCart = async () => {
    try {
      setLoading(true);

      const res: any = await AddToCartEP({
        book_id: bookId,
        stock_id,
        quantity: 1,
      });

      if (res?.action === "success") {
        setInCart(true);
        return { success: true, message: res?.message };
      } else {
        return { success: false, message: res?.message };
      }
    } catch (err) {
      return { success: false, message: "Failed to add to cart" };
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthValid) {
      router.push("/login");
      return;
    }

    if (inCart) {
      router.push("/cart");
      return;
    }

    const res = await addToCart();

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthValid) {
      router.push("/login");
      return;
    }

    let res = { success: true, message: "" };

    if (!inCart) {
      res = await addToCart();

      if (!res.success) {
        toast.error(res.message);
        return;
      }
    }

    router.push("/cart");
  };
  return (
    <PageContainer title="Book Details">
      <Box p={3}>
        {/* TOP SECTION */}
        <Grid container spacing={5}>
          {/* IMAGE GALLERY */}
          <Grid size={{ xs: 12, md: 4 }}>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                sx={{ borderRadius: "20px", height: 380 }}
              />
            ) : (
              <Box>
                {/* Main Image with Prev/Next arrows */}
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "#f3f4f6",
                    height: 380,
                  }}
                >
                  {activeImage && (
                    <img
                      src={activeImage}
                      alt={book?.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "opacity 0.25s ease",
                      }}
                    />
                  )}

                  {/* Arrows — only show if more than 1 image */}
                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrev}
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(4px)",
                          width: 32,
                          height: 32,
                          "&:hover": { background: "#fff" },
                        }}
                      >
                        <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                      </IconButton>

                      <IconButton
                        onClick={handleNext}
                        sx={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(4px)",
                          width: 32,
                          height: 32,
                          "&:hover": { background: "#fff" },
                        }}
                      >
                        <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                      </IconButton>

                      {/* Image counter badge */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 10,
                          right: 12,
                          background: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          fontSize: 11,
                          fontFamily: "'DM Sans', sans-serif",
                          px: 1,
                          py: 0.3,
                          borderRadius: "20px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {activeImageIndex + 1} / {images.length}
                      </Box>
                    </>
                  )}
                </Box>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    {images.map((img, i) => (
                      <Box
                        key={img.image_id}
                        onClick={() => setActiveImageIndex(i)}
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "10px",
                          overflow: "hidden",
                          cursor: "pointer",
                          border:
                            i === activeImageIndex
                              ? "2px solid #6366f1"
                              : "2px solid transparent",
                          opacity: i === activeImageIndex ? 1 : 0.55,
                          transition: "all 0.15s ease",
                          flexShrink: 0,
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <img
                          src={img.image_url}
                          alt={`thumb-${i}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Grid>

          {/* BOOK DETAILS */}
          <Grid size={{ xs: 12, md: 8 }}>
            {isLoading ? (
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Skeleton width={100} height={28} />
                <Skeleton width="70%" height={48} />
                <Skeleton width={140} />
                <Skeleton width={160} />
                <Skeleton width="90%" height={80} />
              </Box>
            ) : (
              <>
                {/* CATEGORY */}
                <Chip
                  label={book?.category_name}
                  size="small"
                  sx={{
                    background: "#eef2ff",
                    color: "#4338ca",
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />

                {/* TITLE */}
                <Typography
                  sx={{
                    fontSize: 34,
                    fontWeight: 800,
                    mt: 1,
                    lineHeight: 1.2,
                    fontFamily: "'Playfair Display', serif",
                    color: "#1e1b4b",
                  }}
                >
                  {book?.title}
                </Typography>

                {/* AUTHOR */}
                <Typography
                  color="text.secondary"
                  mt={0.5}
                  sx={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  by{" "}
                  <span style={{ fontWeight: 600, color: "#374151" }}>
                    {book?.author}
                  </span>
                </Typography>

                {/* SELLER */}
                <Typography
                  mt={0.3}
                  sx={{
                    fontSize: 12.5,
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Sold by:{" "}
                  <span style={{ color: "#6366f1", fontWeight: 600 }}>
                    {book?.seller_name}
                  </span>
                </Typography>

                {/* RATING — static since API doesn't return it */}
                {/* <Box display="flex" alignItems="center" gap={1.2} mt={1.5}>
                  {[...Array(5)].map((_, i) =>
                    i < 4 ? (
                      <StarIcon
                        key={i}
                        sx={{ fontSize: 20, color: "#f59e0b" }}
                      />
                    ) : (
                      <StarBorderIcon
                        key={i}
                        sx={{ fontSize: 20, color: "#e5e7eb" }}
                      />
                    ),
                  )}
                  <Typography
                    fontWeight={500}
                    sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                  >
                    4.0
                  </Typography>
                </Box> */}

                <Divider sx={{ my: 2 }} />

                {/* PRICE — static since API doesn't return it */}
                <Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                      sx={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#4f46e5",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {book?.price}
                    </Typography>

                    {/* <Typography
                      sx={{
                        textDecoration: "line-through",
                        color: "#9ca3af",
                        fontSize: 18,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {book?.originalPrice}
                    </Typography> */}

                    {/* <Chip
                      label="Save 40%"
                      sx={{
                        background: "#f59e0b",
                        color: "#000",
                        fontWeight: 600,
                        height: 26,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    /> */}
                  </Box>

                  <Typography
                    fontSize={13}
                    color="text.secondary"
                    sx={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Inclusive of all taxes
                  </Typography>
                </Box>

                {/* STOCK */}
                <Chip
                  label="In Stock"
                  sx={{
                    mt: 2,
                    background: "#16a34a",
                    color: "#fff",
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />

                {/* BUTTONS */}
                <Box display="flex" gap={2} mt={3}>
                  <ButtonRFH
                    fullWidth
                    startIcon={<ShoppingCartOutlinedIcon />}
                    onClick={handleAddToCart}
                    disabled={loading}
                    loading={loading}
                    sx={{
                      color: inCart ? "#dcfce7" : "#eef2ff",
                      background: inCart ? "#16a34a" : "#4f46e5",
                      "&:hover": {
                        background: inCart ? "#0a7130" : "#2119a9",
                      },
                    }}
                  >
                    {inCart ? "Go to Cart" : "Add to Cart"}
                  </ButtonRFH>
                  <ButtonRFH
                    fullWidth
                    startIcon={<BoltIcon />}
                    onClick={handleBuyNow}
                    disabled={loading}
                    loading={loading}
                    sx={{
                      background: "#4f46e5",
                      color: "#fff",
                      "&:hover": {
                        background: "#4338ca",
                      },
                    }}
                  >
                    Buy Now
                  </ButtonRFH>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* INFO */}
                <Box display="grid" gap={1}>
                  <Typography sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <b>Category:</b> {book?.category_name}
                  </Typography>
                  <Typography sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <b>Language:</b> English
                  </Typography>
                  <Typography sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <b>Published:</b>{" "}
                    {book?.created_date
                      ? new Date(book.created_date).getFullYear()
                      : "—"}
                  </Typography>

                  {book?.description && (
                    <Box mt={2}>
                      <Typography
                        fontWeight={700}
                        mb={1}
                        sx={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        About This Book
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          lineHeight: 1.8,
                          fontSize: 14,
                        }}
                      >
                        {book.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Grid>
        </Grid>

        {/* RELATED BOOKS */}
        {/* <Box mt={6}>
          <Typography
            fontWeight={700}
            fontSize={20}
            mb={2}
            sx={{ fontFamily: "'Playfair Display', serif", color: "#1e1b4b" }}
          >
            You May Also Like
          </Typography>

          <Grid container spacing={3}>
            {relatedBooks.map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <BookCard
                  image="https://images.unsplash.com/photo-1544947950-fa07a98d237f"
                  title="Atomic Habits"
                  author="James Clear"
                  price={399}
                  originalPrice={599}
                  rating={4}
                  reviews={5678}
                  discount={33} 
                  book_id={""} 
                  stock_id={""}                />
              </Grid>
            ))}
          </Grid>
        </Box> */}
      </Box>
    </PageContainer>
  );
}
