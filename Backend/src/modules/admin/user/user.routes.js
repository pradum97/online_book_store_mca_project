const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/authMiddleware");
const controller = require("./user.controller");

router.get("/users", auth, controller.getUsers);
router.get("/users/:id", auth, controller.getUserById);

router.patch("/users/:id", auth, controller.updateUser);
router.patch("/users/:id/status", auth, controller.updateUserStatus);

router.get("/CheckUserStatus", auth, controller.getUserStatus);
router.put("/profile", auth, controller.updateMyProfile);

router.get("/my-addresses", auth, controller.getMyAddresses);
router.post("/add-address", auth, controller.addAddress);
router.put("/update-address/:id", auth, controller.updateAddress);
router.put("/set-default-address/:id", auth, controller.setDefaultAddress);
router.delete("/delete-address/:id", auth, controller.deleteAddress);

module.exports = router;
