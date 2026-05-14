const express = require("express");
const router = express.Router();

const authenticate = require("../../../middlewares/authMiddleware");
const controller = require("../dashboard/dashboard.controller");

router.get("/users", authenticate, controller.getAllUsers);

module.exports = router;
