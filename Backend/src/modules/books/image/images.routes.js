const express = require("express");
const router = express.Router();
const { upload } = require("../../../middlewares/upload.middleware");
const auth = require("../../../middlewares/authMiddleware");
const controller = require("../image/images.controller");

router.get("/books/:book_id/images", auth, controller.getBookImages);
router.post(
  "/books/:bookId/images",
  auth,
  upload.array("images", 5),
  controller.addBookImages,
);
router.delete("/books/images/:image_id", auth, controller.deleteBookImage);

module.exports = router;
