const express = require("express");
const router = express.Router();

const controller = require("./reviews.controller");
const auth = require("../../middlewares/authMiddleware");

router.post("/", auth, controller.createReview);

router.get("/book/:bookId", controller.getBookReviews);

router.delete("/:id", auth, controller.deleteReview);

module.exports = router;
