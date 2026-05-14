"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@hooks/authentication/useAuth";
import React from "react";
import { AddToCartEP } from "@webEndPoints/handlers/cartWEB/cartWEB";

interface Props {
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

export default function BookCard({
  image,
  title,
  author,
  price,
  originalPrice,
  rating,
  reviews,
  discount = 0,
  is_in_cart = false,
  book_id,
  stock_id,
  category_name,
}: Props) {
  const router = useRouter();
  const { isAuthValid, sessionUser } = useAuth();

  const [inCart, setInCart] = React.useState(false);
  const [isLoading, setISLoading] = React.useState(false);

  React.useEffect(() => {
    setInCart(is_in_cart);
  }, [is_in_cart]);

  const role = React.useMemo(() => {
    return sessionUser.user_type_code ?? "GUEST";
  }, [sessionUser.user_type_code]);

  const handleView = () => {
    router.push(`/books/${book_id}`);
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

    try {
      setISLoading(true);
      const res: any = await AddToCartEP({
        book_id,
        stock_id,
        quantity: 1,
      });

      toast[res?.action as "success"](res?.message);

      if (res?.action === "success") {
        setInCart(true);
      }
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setISLoading(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0px 6px 20px rgba(0,0,0,0.06)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0px 12px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={handleView}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* <IconButton
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "#fff",
            "&:hover": { background: "#fff" },
            boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <FavoriteBorderOutlinedIcon fontSize="small" />
        </IconButton> */}

        {category_name && (
          <Box
            sx={{
              position: "absolute",
              top: discount > 0 ? 40 : 10,
              right: 10,
              background: "#4f46e5",
              color: "#fff",
              px: 1.5,
              py: 0.4,
              borderRadius: "999px",
              fontSize: 11,
              fontWeight: 600,
              maxWidth: "80%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {category_name}
          </Box>
        )}

        {/* 🔥 Discount */}
        {discount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#f59e0b",
              color: "#000",
              px: 1.2,
              py: 0.5,
              borderRadius: "8px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {discount}% OFF
          </Box>
        )}

        {/* hover trigger */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            "&:hover .overlay": {
              opacity: 1,
            },
          }}
        />
      </Box>

      <CardContent>
        <Tooltip title={title} arrow>
          <Typography
            noWrap
            fontWeight={600}
            fontSize={16}
            sx={{ cursor: "pointer" }}
            onClick={handleView}
          >
            {title}
          </Typography>
        </Tooltip>

        <Typography color="text.secondary" fontSize={14} mb={1}>
          {author}
        </Typography>

        {/* ⭐ Rating */}
        {/* <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              sx={{
                fontSize: 18,
                color: i < rating ? "#f59e0b" : "#e5e7eb",
              }}
            />
          ))}
          <Typography fontSize={13} color="text.secondary">
            ({reviews})
          </Typography>
        </Box> */}

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography color="#4f46e5" fontWeight={700} fontSize={18}>
              ₹{price}
            </Typography>

            {price !== originalPrice && (
              <Typography
                sx={{
                  textDecoration: "line-through",
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                ₹{originalPrice}
              </Typography>
            )}
          </Box>

          {(role === "CUSTOMER" || role === "GUEST") && (
            <React.Fragment>
              {inCart ? (
                <Tooltip title="View Cart">
                  <IconButton
                    onClick={() => {
                      if (!isAuthValid) {
                        router.push("/login");
                      } else {
                        router.push("/cart");
                      }
                    }}
                    sx={{
                      background: "#dcfce7",
                      color: "#16a34a",
                      "&:hover": { background: "#bbf7d0" },
                    }}
                  >
                    <ShoppingCartCheckoutIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Add to Cart">
                  <IconButton
                    onClick={handleAddToCart}
                    sx={{
                      background: "#eef2ff",
                      color: "#4f46e5",
                      "&:hover": { background: "#e0e7ff" },
                    }}
                    disabled={isLoading}
                  >
                    <AddShoppingCartIcon />
                  </IconButton>
                </Tooltip>
              )}
            </React.Fragment>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
