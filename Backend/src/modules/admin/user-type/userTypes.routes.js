const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/authMiddleware");
const controller = require("./userTypes.controller");

router.get("/user-types", auth, controller.getUserTypes);

router.post("/user-types", auth, controller.createUserType);

router.patch("/user-types/:id", auth, controller.updateUserType);

router.delete("/user-types/:id", auth, controller.deleteUserType);

module.exports = router;
