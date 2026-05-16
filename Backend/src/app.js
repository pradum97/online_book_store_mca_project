const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const auth = require("./modules/auth/auth.routes");
const adminUser = require("./modules/admin/user/user.routes");
const userTypesRoutes = require("./modules/admin/user-type/userTypes.routes");
const webRoutes = require("./modules/admin/web/web.routes");
const categoriesRoutes = require("./modules/books/categories/categories.routes");
const booksRoutes = require("./modules/books/books.routes");
const sellerRoutes = require("./modules/seller/seller.routes");
const imagesRoutes = require("./modules/books/image/images.routes");
const stockRoutes = require("./modules/seller/stock/stock.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const ordersRoutes = require("./modules/orders/orders.routes");
const sellerOrdersRoutes = require("./modules/orders/seller.orders.routes");
const paymentModesRoutes = require("./modules/payments/payment-modes/paymentModes.routes");
const paymentRoutes = require("./modules/payments/payments.routes");
const reviewsRoutes = require("./modules/reviews/reviews.routes");
const receiptRoutes = require("./modules/receipt/receipt.routes");
const adminRoutes = require("./modules/admin/dashboard/dashboard.routes");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://6sllqcch-3000.inc1.devtunnels.ms",
      "https://6sllqcch-5055.inc1.devtunnels.ms",
      "https://online-bookstore-frontend-psi.vercel.app",
      "https://online-book-store.up.railway.app",
      "https://mca-online-book-store-psi.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());

// app.use(
//   rateLimit({ windowMs: 900000, max: process.env.RATE_LIMIT_MAX || 100 }),
// );

const commonPath = "/api/v1";
app.use(commonPath + "/auth", auth);
app.use(commonPath + "/admin/user", adminUser);
app.use(commonPath + "/admin/user-type", userTypesRoutes);
app.use(commonPath + "/admin/web", webRoutes);
app.use(commonPath + "/book", categoriesRoutes);
app.use(commonPath + "/book", booksRoutes);
app.use(commonPath + "/seller", sellerRoutes);
app.use(commonPath + "/book", imagesRoutes);
app.use(commonPath + "/book", stockRoutes);
app.use(commonPath + "/cart", cartRoutes);
app.use(commonPath + "/order", ordersRoutes);
app.use(commonPath + "/seller-order", sellerOrdersRoutes);
app.use(commonPath + "/payment", paymentModesRoutes);
app.use(commonPath + "/payment", paymentRoutes);
app.use(commonPath + "/reviews", reviewsRoutes);
app.use(commonPath + "/receipt", receiptRoutes);
app.use(commonPath + "/admin", adminRoutes);
module.exports = app;
