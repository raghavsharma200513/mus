const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    numberOfGuests: {
      type: Number,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reservation", reservationSchema);
