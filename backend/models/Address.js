// models/Address.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  // coordinates: {
  //   latitude: { type: Number, required: true },
  //   longitude: { type: Number, required: true },
  // },
});

module.exports = mongoose.model("Address", addressSchema);
