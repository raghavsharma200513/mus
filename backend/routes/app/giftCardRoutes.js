const express = require("express");
const router = express.Router();
const giftCardController = require("../../controllers/app/giftCardController");

// Routes for gift cards
router.post("/create", giftCardController.createGiftCardOrder); // Create a new gift card
router.post("/verify", giftCardController.verifyGiftCardPayment); // Create a new gift card
router.patch("/redeem/:code", giftCardController.redeemGiftCard); // Redeem a gift card by code
router.get("/:id", giftCardController.getGiftCard); // Get details of a gift card

module.exports = router;
