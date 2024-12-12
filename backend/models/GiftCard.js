// models/GiftCard.js
const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    discountPercentage: Number,
    recipientEmail: { type: String, required: true },
    message: String,
    isRedeemed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GiftCard", giftCardSchema);
