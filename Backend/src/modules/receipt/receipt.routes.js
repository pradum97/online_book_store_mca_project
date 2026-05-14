const express = require("express");
const router = express.Router();

const controller = require("./receipt.controller");

const auth = require("../../middlewares/authMiddleware");

router.get("/:orderId/receipt", auth, controller.getReceipt);

router.get("/:orderId/receipt/download", auth, controller.downloadReceipt);

module.exports = router;
