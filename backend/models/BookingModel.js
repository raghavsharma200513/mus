// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
