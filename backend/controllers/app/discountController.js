// controllers/discountController.js
const Discount = require("../../models/DiscountModal");
const GiftCard = require("../../models/GiftCard");

class DiscountController {
  // Create a new coupon
  static async createCoupon(req, res) {
    const {
      code,
      discountPercentage,
      upperLimit,
      minimumOrderValue,
      validFrom,
      validTo,
      isActive,
    } = req.body;

    try {
      const newCoupon = new Discount({
        code,
        discountPercentage,
        upperLimit,
        minimumOrderValue,
        validFrom,
        validTo,
        isActive,
      });

      await newCoupon.save();
      res
        .status(201)
        .json({ message: "Coupon created successfully", coupon: newCoupon });
    } catch (error) {
      res.status(500).json({ message: "Failed to create coupon", error });
    }
  }

  static async editCoupon(req, res) {
    const {
      code,
      discountPercentage,
      upperLimit,
      minimumOrderValue,
      validFrom,
      validTo,
      isActive,
    } = req.body;
    const discountId = req.params.id;
    try {
      const coupon = await Discount.findByIdAndUpdate(
        discountId,
        {
          code,
          discountPercentage,
          upperLimit,
          minimumOrderValue,
          validFrom,
          validTo,
          isActive,
        },
        { new: true }
      );

      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.status(200).json({ message: "Coupon updated successfully", coupon });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update coupon", error: error.message });
    }
  }

  // Get all coupons
  static async getCoupons(req, res) {
    try {
      const coupons = await Discount.find();
      res.status(200).json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons", error });
    }
  }

  static async getCouponsById(req, res) {
    const id = req.params.id;

    console.log(id);

    try {
      // First, try to find a coupon
      const coupon = await Discount.findOne({ code: id.toUpperCase() });
      console.log("coupon", coupon);

      if (coupon) {
        return res.status(200).json(coupon);
      }

      // If no coupon found, try to find a gift card
      const giftCard = await GiftCard.findOne({ code: id });

      console.log("giftCard", giftCard);
      if (giftCard) {
        if (giftCard.isRedeemed) {
          return res
            .status(400)
            .json({ message: "code has already been used" });
        }
        return res.status(200).json({ giftCard, type: "coupon" });
      }

      // If neither found, return 404
      return res.status(404).json({
        message: "Neither coupon nor gift card found with the provided ID",
      });
    } catch (error) {
      console.error("Error fetching coupon/gift card:", error);
      return res.status(500).json({
        message: "Failed to fetch coupon/gift card",
        error,
      });
    }
  }

  // Apply a coupon
  static async applyCoupon(req, res) {
    const { code, cartValue } = req.body;

    try {
      const coupon = await Discount.findOne({ code, isActive: true });

      if (!coupon) {
        return res.status(404).json({ message: "Invalid or inactive coupon" });
      }

      const currentDate = new Date();
      if (currentDate < coupon.validFrom || currentDate > coupon.validTo) {
        return res
          .status(400)
          .json({ message: "Coupon is not valid at this time" });
      }

      if (cartValue < coupon.minimumOrderValue) {
        return res.status(400).json({
          message: `Minimum order value is ₹${coupon.minimumOrderValue}`,
        });
      }

      const discount = Math.min(
        (cartValue * coupon.discountPercentage) / 100,
        coupon.upperLimit
      );
      res
        .status(200)
        .json({ message: "Coupon applied successfully", discount });
    } catch (error) {
      res.status(500).json({ message: "Failed to apply coupon", error });
    }
  }
}

module.exports = DiscountController;
