// models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  name: { type: String, required: true }, // Store item name for history
  price: { type: Number, required: true }, // Store item price at the time of order
  quantity: { type: Number, required: true },
  addOns: [{ name: String, price: Number, quantity: Number }],
  variants: [{ name: String, price: Number }],
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema], // Snapshot of items in cart
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "cancelled",
        "completed",
        "awaiting_payment",
      ],
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    orderTotal: { type: Number, required: true }, // Total at time of order
    address: {
      type: Object,
      required: true,
    },
    paymentId: String,
    cancellationReason: String,
    payerId: String,
    amount: Number,
    paymentStatus: String,
    currency: String,
    paymentMethod: String,
    couponCode: String,
    discount: String,
    subtotal: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
