const express = require("express");
const router = express.Router();

const controller = require("./books.controller");
const optionalAuth = require("../../middlewares/optionalAuth");
const auth = require("../../middlewares/authMiddleware");

router.get("/books", optionalAuth, controller.getAllBooks);
router.get("/books/autocomplete", controller.autocompleteBooks);

router.post("/books", auth, controller.createBook);
router.patch("/books/:id", auth, controller.updateBook);
router.delete("/books/:id", auth, controller.deleteBook);
router.get("/seller-books", auth, controller.getSellerBooks);
router.get("/books/:id", optionalAuth, controller.getBookById);
router.get("/uoms", controller.getUoms);
router.get("/books/:id/edit-data", controller.getBookEditData);
router.get("/books/:book_id/uoms", auth, controller.getBookUOMs);

module.exports = router;
