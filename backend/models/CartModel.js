// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      },
      variant: {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
      addOns: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, default: 1 },
        },
      ],
      quantity: { type: Number, default: 1 },
    },
  ],
  totalAmount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Cart", cartSchema);
