const express = require("express");
const router = express.Router();

const controller = require("./cart.controller");
const auth = require("../../middlewares/authMiddleware");

router.use(auth);

router.get("/", controller.getCart);

router.post("/items", controller.addCartItem);

router.patch("/items/:cart_item_id", controller.updateCartItem);

router.delete("/items/:cart_item_id", controller.deleteCartItem);

router.delete("/clear", controller.clearCart);

router.get("/billing", controller.getCartBilling);

module.exports = router;
