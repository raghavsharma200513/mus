// models/Newsletter.js
const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Newsletter = mongoose.model("Newsletter", NewsletterSchema);

module.exports = Newsletter;
