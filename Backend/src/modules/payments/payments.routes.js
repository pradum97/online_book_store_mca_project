const express = require("express");
const router = express.Router();

const controller = require("./payments.controller");
const auth = require("../../middlewares/authMiddleware");

router.post("/payments/initiate", auth, controller.initiatePayment);

router.post("/payments/verify", auth, controller.verifyPayment);

router.post("/payments/retry", auth, controller.retryPayment);

router.get("/payments/:paymentId", auth, controller.getPayment);

router.get("/payments/order/:orderId", auth, controller.getPaymentsByOrder);

module.exports = router;
