const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/authMiddleware");
const controller = require("./web.controller");

router.get("/pages", auth, controller.getWebPages);
router.post("/pages", auth, controller.createWebPage);

router.get("/page-permissions", auth, controller.getPagePermissions);
router.post("/page-permissions", auth, controller.createPagePermission);
router.patch("/page-permissions/:id", auth, controller.updatePagePermission);
router.delete("/page-permissions/:id", auth, controller.deletePagePermission);

module.exports = router;
