const express = require("express");
const router = express.Router();

const controller = require("./seller.orders.controller");
const auth = require("../../middlewares/authMiddleware");

router.get("/orders", auth, controller.getSellerOrders);

router.get("/orders/returns", auth, controller.getAllReturns);
router.get("/orders/returns/stats", auth, controller.getReturnStats);
router.patch("/orders/returns/:returnId/action", auth, controller.actionReturn);

router.get("/orders/:orderId", auth, controller.getSellerOrderById);

router.get("/orders/:orderId/items", auth, controller.getSellerOrderItems);

router.patch(
  "/orders/item/:order_item_id/status",
  auth,
  controller.updateOrderItemStatus,
);

module.exports = router;
