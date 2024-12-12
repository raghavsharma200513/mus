// routes/discountRoutes.js
const express = require("express");
const DiscountController = require("../../controllers/app/discountController");

const router = express.Router();

// Create a new coupon
router.post("/create", DiscountController.createCoupon);

router.put("/edit/:id", DiscountController.editCoupon);

// Get coupons by ID
router.get("/:id", DiscountController.getCouponsById);

// Get all coupons
router.get("/", DiscountController.getCoupons);

// Apply a coupon
router.post("/apply", DiscountController.applyCoupon);

module.exports = router;
