const express = require("express");
const router = express.Router();

const controller = require("./stock.controller");
const auth = require("../../../middlewares/authMiddleware");

router.use(auth);

router.post("/stock", controller.createStock);

router.patch("/stock/:stock_id", controller.updateStock);

router.get("/stock", controller.getSellerStock);

router.get("/stock/history", controller.getStockHistory);

router.delete("/stock/:stock_id", controller.deleteStock);

module.exports = router;
