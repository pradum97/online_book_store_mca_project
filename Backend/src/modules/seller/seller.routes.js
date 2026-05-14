const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/authMiddleware");
const controller = require("./seller.controller");
const { ImagePdfUpload } = require("../../middlewares/upload.middleware");

router.post(
  "/apply-seller",
  auth,
  ImagePdfUpload.fields([
    { name: "aadhaar_front" },
    { name: "aadhaar_back" },
    { name: "pan_card" },
    { name: "gst_certificate" },
    { name: "cancelled_cheque" },
    { name: "business_registration" },
  ]),
  controller.upsertSeller,
);

router.get("/request-status", auth, controller.getSellerRequestStatus);

router.get("/sellers", auth, controller.getAllSellers);
router.get("/sellers/:id", auth, controller.getSellerById);
router.post("/sellers/:id/status", auth, controller.updateSellerStatus);
router.delete("/sellers/:id", auth, controller.deleteSeller);

router.get(
  "/sellers/dashboard/stats",
  auth,
  controller.getSellerDashboardStats,
);

module.exports = router;
