const express = require("express");
const router = express.Router();

const controller = require("./orders.controller");
const auth = require("../../middlewares/authMiddleware");

router.post("/orders", auth, controller.createOrder);

router.get("/orders/my-orders", auth, controller.getMyOrdersWithItems);

router.get("/orders", auth, controller.getOrders);

router.get("/orders/:value", auth, controller.getOrder);

router.get("/orders/:order_id/items", auth, controller.getOrderItems);

router.get(
  "/orders/:order_id/status-history",
  auth,
  controller.getOrderStatusHistory,
);

router.patch(
  "/orders/:order_item_id/status",
  auth,
  controller.updateOrderItemStatus,
);

router.post(
  "/orders/:orderId/items/:itemId/return",
  auth,
  controller.createReturnRequest,
);

router.get(
  "/orders/:orderId/items/:itemId/return",
  auth,
  controller.getItemReturnStatus,
);

router.patch(
  "/orders/:orderId/items/:orderItemId/cancel",
  auth,
  controller.cancelOrderItem,
);

module.exports = router;
