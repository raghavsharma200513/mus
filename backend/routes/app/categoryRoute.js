const express = require("express");
const categoryController = require("../../controllers/app/categoryController");
const router = express.Router();
const upload = require("../../middlewares/imageUpload");

router.post("/", upload, categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", upload, categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
