const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    // Payment related fields
    paymentStatus: {
      type: String,
      // enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["paypal"],
      required: true,
    },
    currency: {
      type: String,
      default: "EUR",
    },
    // PayPal specific fields
    paymentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    payerId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "issued", "redeemed", "expired"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GiftCard", giftCardSchema);
