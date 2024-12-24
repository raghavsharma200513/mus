// models/Policy.js
const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["privacy_policy", "terms_and_conditions"], // Allowed types
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Policy", policySchema);
