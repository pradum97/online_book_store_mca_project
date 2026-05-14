"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Skeleton,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { useRouter } from "next/navigation";
import PageContainer from "@container/Pagecontainer";
import {
  DeleteCartItemEP,
  GetCartEP,
  UpdateCartItemEP,
} from "@webEndPoints/handlers/cartWEB/cartWEB";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CartItem {
  cart_item_id: string;
  quantity: number;
  book_id: string;
  title: string;
  author: string;
  stock_id: string;
  mrp: string;
  subtotal: string;
  uom_name: string;
  uom_code: string;
}

interface BillingData {
  items: { title: string; quantity: number; mrp: string; total: string }[];
  total_items: number;
  subtotal: number;
}

function BookCover({ title }: { title: string }) {
  const colors = [
    ["#6366f1", "#8b5cf6"],
    ["#0ea5e9", "#38bdf8"],
    ["#10b981", "#34d399"],
    ["#f59e0b", "#fbbf24"],
    ["#ef4444", "#f87171"],
  ];
  const idx = title.charCodeAt(0) % colors.length;
  const [from, to] = colors[idx];
  return (
    <Box
      sx={{
        width: 52,
        height: 68,
        borderRadius: "4px 8px 8px 4px",
        background: `linear-gradient(160deg, ${from}, ${to})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "2px 4px 12px rgba(0,0,0,0.12)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          background: "rgba(0,0,0,0.15)",
          borderRadius: "4px 0 0 4px",
        },
      }}
    >
      <Typography
        sx={{ fontSize: 18, filter: "brightness(0) invert(1)", opacity: 0.8 }}
      >
        📖
      </Typography>
    </Box>
  );
}

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: cartItems,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<CartItem[]>({
    queryKey: ["GetCartEP"],
    queryFn: async () => {
      const res = await GetCartEP();
      return res?.data ?? [];
    },
  });

  const billing = React.useMemo(() => {
    return {
      items:
        cartItems?.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          mrp: item.mrp,
          total: (item.quantity * parseFloat(item.mrp)).toFixed(2),
        })) || [],

      total_items:
        cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,

      subtotal:
        cartItems?.reduce(
          (sum, item) => sum + item.quantity * parseFloat(item.mrp),
          0,
        ) || 0,
    };
  }, [cartItems]);

  const updateMutation = useMutation({
    mutationFn: async ({
      cart_item_id,
      quantity,
    }: {
      cart_item_id: string;
      quantity: number;
    }) => {
      return await UpdateCartItemEP(cart_item_id, { quantity });
    },

    onMutate: async ({ cart_item_id, quantity }) => {
      await queryClient.cancelQueries({
        queryKey: ["GetCartEP"],
      });

      const prevData = queryClient.getQueryData(["GetCartEP"]);

      queryClient.setQueryData(["GetCartEP"], (old: any[]) => {
        return old.map((item) =>
          item.cart_item_id === cart_item_id
            ? {
                ...item,
                quantity,
                subtotal: (quantity * parseFloat(item.mrp)).toFixed(2),
              }
            : item,
        );
      });

      return { prevData };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["GetCartEP"], context?.prevData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["GetCartEP"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (cart_item_id: string) => {
      return await DeleteCartItemEP(cart_item_id);
    },

    onMutate: async (cart_item_id) => {
      await queryClient.cancelQueries({
        queryKey: ["GetCartEP"],
      });
      const prevData = queryClient.getQueryData(["GetCartEP"]);

      queryClient.setQueryData(["GetCartEP"], (old: any[]) => {
        return old.filter((item) => item.cart_item_id !== cart_item_id);
      });

      return { prevData };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["GetCartEP"], context?.prevData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["GetCartEP"],
      });
    },
  });

  const updateQty = (item: CartItem, delta: number) => {
    if (updateMutation.isPending) return;

    const newQty = Math.max(1, item.quantity + delta);

    updateMutation.mutate({
      cart_item_id: item.cart_item_id,
      quantity: newQty,
    });
  };

  const removeItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  const totalAmount = cartItems?.reduce(
    (sum, item) => sum + parseFloat(item.subtotal),
    0,
  );
  const totalQty = cartItems?.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return <Skeleton variant="rectangular" height={200} />;
  }

  if (isError) {
    return <Typography>Error loading cart</Typography>;
  }

  if (cartItems?.length === 0) {
    return (
      <PageContainer title="My Cart" subtitle="Your reading list is empty">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
            height: "calc(100vh - 175px)",
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: "#d1d5db" }} />
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Your cart is empty
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: "#9ca3af",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Add some books to get started
          </Typography>
          <Button
            onClick={() => router.push("/")}
            sx={{
              mt: 1,
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: "10px",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              color: "#fff",
            }}
          >
            Browse Books
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="My Cart"
      subtitle={`${cartItems?.length ?? 0} item${cartItems?.length !== 1 ? "s" : ""} in your cart`}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2.5,
          alignItems: "flex-start",
          height: "calc(100vh - 175px)",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {cartItems?.map((item) => (
              <Box
                key={item.cart_item_id}
                sx={{
                  display: "flex",
                  gap: 2,
                  p: 2,
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 16px rgba(99,102,241,0.08)" },
                  alignItems: "flex-start",
                }}
              >
                <BookCover title={item.title} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 700,
                          fontSize: { xs: 14, md: 16 },
                          color: "#1e1b4b",
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontFamily: "'DM Sans', sans-serif",
                          mt: 0.3,
                        }}
                      >
                        by {item.author}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeItem(item.cart_item_id)}
                      disabled={deleteMutation.isPending}
                      sx={{
                        color: "#ef4444",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        p: "4px",
                        flexShrink: 0,
                        "&:hover": { background: "#fee2e2" },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 1.5,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Chip
                        label={`${item.uom_name} (${item.uom_code})`}
                        size="small"
                        sx={{
                          fontSize: 10,
                          height: 20,
                          background: "#ede9fe",
                          color: "#6d28d9",
                          border: "1px solid #ddd6fe",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#374151",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        ₹{item.mrp} / unit
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "#f9fafb",
                        }}
                      >
                        {updateMutation.isPending ? (
                          <Stack
                            minWidth={"81px"}
                            minHeight={"23.5px"}
                            justifyContent={"center"}
                          >
                            <CircularProgress
                              size={18}
                              sx={{ alignSelf: "center" }}
                            />
                          </Stack>
                        ) : (
                          <React.Fragment>
                            <IconButton
                              size="small"
                              onClick={() => updateQty(item, -1)}
                              loading={updateMutation.isPending}
                              disabled={updateMutation.isPending}
                              sx={{
                                borderRadius: 0,
                                p: "5px",
                                color: "#6b7280",
                                "&:hover": {
                                  background: "#f3f4f6",
                                  color: "#6366f1",
                                },
                              }}
                            >
                              <RemoveIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <Typography
                              sx={{
                                px: 1.5,
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#111827",
                                fontFamily: "'DM Sans', sans-serif",
                                minWidth: 28,
                                textAlign: "center",
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              disabled={updateMutation.isPending}
                              onClick={() => updateQty(item, 1)}
                              loading={updateMutation.isPending}
                              sx={{
                                borderRadius: 0,
                                p: "5px",
                                color: "#6b7280",
                                "&:hover": {
                                  background: "#f3f4f6",
                                  color: "#6366f1",
                                },
                              }}
                            >
                              <AddIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </React.Fragment>
                        )}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#1e1b4b",
                          fontFamily: "'DM Sans', sans-serif",
                          minWidth: 70,
                          textAlign: "right",
                        }}
                      >
                        ₹{parseFloat(item.subtotal).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: 320 },
            flexShrink: 0,
            position: { md: "sticky" },
            top: { md: 24 },
          }}
        >
          <Box
            sx={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Summary Header */}
            <Box
              sx={{
                px: 2.5,
                py: 0.5,
                borderBottom: "1px solid #f3f4f6",
                background: "#fafafa",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#1e1b4b",
                }}
              >
                Order Summary
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2.5,
                py: 2,
              }}
            >
              <Box
                sx={{
                  pr: 1,
                  height: "calc(100vh - 470px)",
                  overflowY: "auto",
                }}
              >
                {billing?.items?.map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1.2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#374151",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#9ca3af",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {item.quantity} × ₹{item.mrp}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      ₹{parseFloat(item.total).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2, borderColor: "#f3f4f6" }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#6b7280",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Total Items
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {totalQty}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1e1b4b",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Total Amount
                </Typography>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#6366f1",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ₹{totalAmount?.toLocaleString("en-IN")}
                </Typography>
              </Box>

              {/* Secure badge */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: "8px 12px",
                  borderRadius: "10px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: 14 }}>🔒</Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#15803d",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Secure & encrypted checkout
                </Typography>
              </Box>

              <Button
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/checkout")}
                sx={{
                  py: 1.4,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  background:
                    "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(99,102,241,0.5)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>

          {/* Trust badges */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2.5,
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            {["🚚 Free Delivery", "↩️ Easy Returns", "✅ 100% Genuine"].map(
              (badge) => (
                <Typography
                  key={badge}
                  sx={{
                    fontSize: 11,
                    color: "#6b7280",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {badge}
                </Typography>
              ),
            )}
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
