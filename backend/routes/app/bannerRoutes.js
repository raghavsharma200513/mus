// routes/bannerRoutes.js
const express = require("express");
const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  getBannersEnabled,
} = require("../../controllers/app/bannerController");
const upload = require("../../middlewares/imageUpload");

const router = express.Router();

router.post("/", upload, createBanner); // Create a new banner
router.get("/", getBanners); // Get all banners
router.get("/enable", getBannersEnabled); // Get all banners
router.get("/:id", getBannerById); // Get a specific banner by ID
router.put("/:id", upload, updateBanner); // Update a banner
router.delete("/:id", deleteBanner); // Delete a banner

module.exports = router;
