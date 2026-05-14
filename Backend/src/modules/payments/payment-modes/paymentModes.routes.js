const express = require("express");
const router = express.Router();

const controller = require("./paymentModes.controller");
const auth = require("../../../middlewares/authMiddleware");

router.get("/payment-modes", auth, controller.getPaymentModes);

router.post("/payment-modes", auth, controller.createPaymentMode);

router.patch(
  "/payment-modes/:payment_mode_id",
  auth,
  controller.updatePaymentMode,
);

module.exports = router;
