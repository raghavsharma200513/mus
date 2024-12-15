const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  actualPrice: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
  },
  description: {
    name: String,
  },
  desc: {
    name: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  addOns: [
    {
      name: String,
      price: Number,
    },
  ],
  variants: [
    {
      name: String,
      price: Number,
    },
  ],
  // boughtTogether: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Menu",
  //   },
  // ],
});

module.exports = mongoose.model("Menu", menuSchema);
