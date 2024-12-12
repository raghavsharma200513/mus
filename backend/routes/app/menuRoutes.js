const express = require("express");
const {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} = require("../../controllers/app/menuController");
const upload = require("../../middlewares/imageUpload");

const router = express.Router();

router.post("/", upload, createMenuItem);
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.put("/:id", upload, updateMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;
