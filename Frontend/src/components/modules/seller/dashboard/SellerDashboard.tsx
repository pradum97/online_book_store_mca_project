"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { GetSellerBookListEP } from "@webEndPoints/handlers/bookWEB/bookWEB";
import { GetSellerRequestStatusEP } from "@webEndPoints/handlers/sellerWEB/sellerWEB";
import { GetSellerDashboardStatsEP } from "@webEndPoints/handlers/sellerWEB/sellerWEB";

interface Book {
  book_id: string;
  title: string;
  author: string;
  category_name: string;
  category_id: number;
  images: { image_id: string; image_url: string }[];
}

interface DashboardStats {
  totalBooks: number;
  totalCategories: number;
  totalImages: number;
  booksThisMonth: number;
  categoryBreakdown: { name: string; count: number }[];
  booksByMonth: { month: string; count: number }[];
  topCategories: { category: string; books: number; images: number }[];
}

const AnimCounter = ({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) => (
  <Typography
    sx={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 36,
      fontWeight: 900,
      color: "#fff",
      letterSpacing: -1.5,
      lineHeight: 1,
    }}
  >
    {prefix}
    {value?.toLocaleString()}
    {suffix}
  </Typography>
);

const StatCard = ({
  label,
  value,
  icon,
  gradient,
  shadow,
  sub,
}: {
  label: string;
  value: number;
  icon: string;
  gradient: string;
  shadow: string;
  sub?: string;
}) => (
  <Box
    sx={{
      background: gradient,
      borderRadius: "22px",
      p: 3,
      flex: 1,
      minWidth: 160,
      boxShadow: shadow,
      position: "relative",
      overflow: "hidden",
      transition:
        "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s",
      "&:hover": { transform: "translateY(-6px) scale(1.02)" },
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: -30,
        left: -10,
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
      },
    }}
  >
    <Typography sx={{ fontSize: 28, lineHeight: 1, mb: 1 }}>{icon}</Typography>
    <AnimCounter value={value} />
    <Typography
      sx={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
        fontWeight: 700,
        mt: 0.5,
      }}
    >
      {label}
    </Typography>
    {sub && (
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.65)",
          mt: 0.5,
        }}
      >
        {sub}
      </Typography>
    )}
  </Box>
);

const ChartCard = ({
  title,
  children,
  extra,
}: {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) => (
  <Box
    sx={{
      background: "#fff",
      borderRadius: "20px",
      p: 3,
      boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
      border: "1px solid rgba(99,102,241,0.08)",
      transition: "box-shadow 0.25s",
      "&:hover": { boxShadow: "0 8px 32px rgba(99,102,241,0.14)" },
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2.5,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 800,
          color: "#111827",
        }}
      >
        {title}
      </Typography>
      {extra}
    </Box>
    {children}
  </Box>
);

const PIE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#ec4899",
  "#8b5cf6",
];
const CHART_COLORS = { area: "#6366f1", bar: "#10b981", bar2: "#f59e0b" };

const RecentBookItem = ({ book, index }: { book: Book; index: number }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 1.5,
      borderRadius: "12px",
      background: index % 2 === 0 ? "#f9fafb" : "#fff",
      transition: "background 0.2s",
      "&:hover": { background: "#f0f4ff" },
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "10px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {book.images?.[0] ? (
        <Box
          component="img"
          src={book.images[0].image_url}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Typography sx={{ fontSize: 18 }}>📚</Typography>
      )}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: "#111827",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {book.title}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "#6b7280",
        }}
      >
        {book.author}
      </Typography>
    </Box>
    <Box
      sx={{
        px: 1.2,
        py: 0.3,
        borderRadius: "20px",
        background: "#f5f3ff",
        border: "1.5px solid #c4b5fd40",
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          fontWeight: 800,
          color: "#6d28d9",
        }}
      >
        {book.category_name}
      </Typography>
    </Box>
  </Box>
);

const CategoryBar = ({
  name,
  count,
  total,
  color,
}: {
  name: string;
  count: number;
  total: number;
  color: string;
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: "#374151",
        }}
      >
        {name}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 800,
          color,
        }}
      >
        {count} books
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={total > 0 ? (count / total) * 100 : 0}
      sx={{
        height: 8,
        borderRadius: 8,
        background: "#f3f4f6",
        "& .MuiLinearProgress-bar": { background: color, borderRadius: 8 },
      }}
    />
  </Box>
);

const StatusBanner = ({
  status,
  sellerNumber,
  requestNumber,
  message,
}: any) => {
  const configs: Record<
    string,
    { bg: string; border: string; icon: string; color: string }
  > = {
    APPROVED: {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      icon: "🎉",
      color: "#15803d",
    },
    PENDING: { bg: "#fffbeb", border: "#fde68a", icon: "⏳", color: "#92400e" },
    REJECTED: {
      bg: "#fff1f2",
      border: "#fecdd3",
      icon: "❌",
      color: "#be123c",
    },
  };
  const cfg = configs[status] ?? configs.PENDING;
  return (
    <Box
      sx={{
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: "16px",
        p: 2.5,
        mb: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: 28 }}>{cfg.icon}</Typography>
      <Box>
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: cfg.color,
          }}
        >
          {status === "APPROVED"
            ? `Seller #${sellerNumber}`
            : `Request #${requestNumber}`}{" "}
          — {status}
        </Typography>
        {message && (
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: cfg.color,
              opacity: 0.8,
              mt: 0.3,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <Box
        sx={{
          background: "#fff",
          borderRadius: "12px",
          p: 1.5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: "#374151",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        {payload.map((p: any, i: number) => (
          <Typography
            key={i}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: p.color,
              fontWeight: 700,
            }}
          >
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: booksResp,
    isLoading: booksLoading,
    isFetching: booksFetching,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["SellerDashboardBooks"],
    queryFn: async () => {
      const res = await GetSellerBookListEP();
      return res?.data ?? [];
    },
  });

  const { data: statusResp, isLoading: statusLoading } = useQuery({
    queryKey: ["SellerRequestStatus"],
    queryFn: async () => {
      const res = await GetSellerRequestStatusEP();
      return res?.data ?? null;
    },
  });

  const {
    data: statsResp,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["SellerDashboardStats"],
    queryFn: async () => {
      const res = await GetSellerDashboardStatsEP();
      return res?.data as DashboardStats | null;
    },
  });

  const books: Book[] = booksResp ?? [];

  // ── Derived Data (fallback if no stats endpoint yet) ─────────────────────

  const derivedStats = useMemo(() => {
    if (statsResp) return statsResp;

    const categoryMap = new Map<string, number>();
    books.forEach((b) => {
      categoryMap.set(
        b.category_name,
        (categoryMap.get(b.category_name) ?? 0) + 1,
      );
    });
    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([name, count]) => ({ name, count }),
    );

    return {
      totalBooks: books.length,
      totalCategories: categoryMap.size,
      totalImages: books.reduce((sum, b) => sum + (b.images?.length ?? 0), 0),
      booksThisMonth: books.length, // fallback
      categoryBreakdown,
      booksByMonth: [],
      topCategories: categoryBreakdown.map(({ name, count }) => ({
        category: name,
        books: count,
        images: 0,
      })),
    } as DashboardStats;
  }, [books, statsResp]);

  const recentBooks = useMemo(() => [...books].slice(0, 8), [books]);
  const totalBooks = derivedStats.totalBooks;

  const handleRefresh = () => {
    refetchBooks();
    refetchStats();
  };

  const isLoading = booksLoading || statusLoading || statsLoading;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f8faff 0%, #f3f4f6 100%)",
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: -0.8,
              background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Seller Dashboard 🏪
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#9ca3af",
              mt: 0.3,
            }}
          >
            Real-time overview of your store performance
          </Typography>
        </Box>
        <Tooltip title="Refresh all data">
          <IconButton
            onClick={handleRefresh}
            disabled={booksFetching}
            sx={{
              borderRadius: "12px",
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#6366f1",
              px: 2,
              py: 1,
              gap: 0.8,
              animation: booksFetching ? "spin 1s linear infinite" : "none",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
              "&:hover": { background: "#f5f3ff", borderColor: "#6366f1" },
            }}
          >
            <Typography sx={{ fontSize: 14 }}>↻</Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#6366f1",
              }}
            >
              Refresh
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Status Banner */}
      {statusResp && !statusLoading && (
        <StatusBanner
          status={statusResp.status}
          sellerNumber={statusResp.seller_number}
          requestNumber={statusResp.request_number}
          message={statusResp.message}
        />
      )}

      {/* Stat Cards */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <StatCard
              label="Total Books"
              value={derivedStats.totalBooks}
              icon="📚"
              gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
              shadow="0 8px 32px rgba(99,102,241,0.32)"
              sub={`${derivedStats.booksThisMonth} added this month`}
            />
            <StatCard
              label="Categories"
              value={derivedStats.totalCategories}
              icon="🏷️"
              gradient="linear-gradient(135deg, #10b981, #059669)"
              shadow="0 8px 32px rgba(16,185,129,0.32)"
            />
            <StatCard
              label="Total Images"
              value={derivedStats.totalImages}
              icon="🖼️"
              gradient="linear-gradient(135deg, #f59e0b, #d97706)"
              shadow="0 8px 32px rgba(245,158,11,0.32)"
              sub="Across all books"
            />
            <StatCard
              label="Avg Images/Book"
              value={
                totalBooks > 0
                  ? Math.round(derivedStats.totalImages / totalBooks)
                  : 0
              }
              icon="📊"
              gradient="linear-gradient(135deg, #0ea5e9, #0284c7)"
              shadow="0 8px 32px rgba(14,165,233,0.32)"
            />
          </Box>

          {/* Charts Row 1 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2.5,
              mb: 2.5,
            }}
          >
            {/* Category Pie Chart */}
            <ChartCard title="📊 Books by Category">
              {derivedStats.categoryBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={derivedStats.categoryBreakdown}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                    >
                      {derivedStats.categoryBreakdown?.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RTooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    height: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#9ca3af",
                      fontSize: 13,
                    }}
                  >
                    No data yet
                  </Typography>
                </Box>
              )}
            </ChartCard>

            {/* Books by Month Area Chart */}
            <ChartCard title="📈 Books Added Over Time">
              {derivedStats.booksByMonth?.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={derivedStats?.booksByMonth}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorBooks"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        fill: "#9ca3af",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        fill: "#9ca3af",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Books"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#colorBooks)"
                      dot={{ fill: "#6366f1", r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    height: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 28 }}>📭</Typography>
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#9ca3af",
                      fontSize: 13,
                    }}
                  >
                    Monthly data available via API
                  </Typography>
                </Box>
              )}
            </ChartCard>
          </Box>

          {/* Charts Row 2 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
              gap: 2.5,
            }}
          >
            {/* Category Bar Chart */}
            <ChartCard title="🏷️ Category Performance">
              {derivedStats.topCategories?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={derivedStats.topCategories}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="category"
                        tick={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          fill: "#9ca3af",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          fill: "#9ca3af",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RTooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(v) => (
                          <span
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {v}
                          </span>
                        )}
                      />
                      <Bar
                        dataKey="books"
                        name="Books"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="images"
                        name="Images"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Progress breakdown */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #f3f4f6" }}>
                    {derivedStats.categoryBreakdown
                      .slice(0, 4)
                      .map((c, idx) => (
                        <CategoryBar
                          key={c.name}
                          name={c.name}
                          count={c.count}
                          total={totalBooks}
                          color={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#9ca3af",
                      fontSize: 13,
                    }}
                  >
                    No data yet
                  </Typography>
                </Box>
              )}
            </ChartCard>

            {/* Recent Books */}
            <ChartCard title="🆕 Recent Books">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  maxHeight: 360,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#e5e7eb",
                    borderRadius: 4,
                  },
                }}
              >
                {recentBooks.length > 0 ? (
                  recentBooks.map((b, i) => (
                    <RecentBookItem key={b.book_id} book={b} index={i} />
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 32 }}>📚</Typography>
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: "#9ca3af",
                        mt: 1,
                      }}
                    >
                      No books yet. Add your first book!
                    </Typography>
                  </Box>
                )}
              </Box>
            </ChartCard>
          </Box>
        </>
      )}
    </Box>
  );
}
