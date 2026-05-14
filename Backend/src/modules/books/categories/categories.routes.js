const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/authMiddleware");
const controller = require("../categories/categories.controller");

router.get("/categories", controller.getCategories);

router.get("/categories/:id", controller.getCategoryById);

router.post("/categories", auth, controller.createCategory);

router.patch("/categories/:id", auth, controller.updateCategory);

router.delete("/categories/:id", auth, controller.deleteCategory);

module.exports = router;
