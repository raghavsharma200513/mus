const express = require("express");
const router = express.Router();
const galleryController = require("../../controllers/app/galleryController");
const upload = require("../../middlewares/imageUpload");

router.post("/", upload, galleryController.createCategory);
router.get("/", galleryController.getAllGalleryEntries); // Removed upload
router.put("/:id", upload, galleryController.updateGalleryEntry);
router.delete("/:id", galleryController.deleteGalleryEntry); // Removed upload

module.exports = router;
