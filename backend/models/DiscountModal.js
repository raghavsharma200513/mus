// models/Discount.js
const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  upperLimit: {
    type: Number,
    required: true,
  }, // Maximum discount amount
  minimumOrderValue: {
    type: Number,
    required: true,
  }, // Minimum cart value
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Discount", discountSchema);
