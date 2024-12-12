const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    role: {
      type: String,
      default: "customer",
    },
    type: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile_number: {
      unique: false,
      sparse: true,
      type: String,
    },
    account_holder_name: {
      type: String,
    },
    account_number: {
      type: String,
    },
    ifsc_code: {
      type: String,
    },
    bank_name: {
      type: String,
    },
    branch: {
      type: String,
    },
    image: {
      type: String,
    },
    phonePe_no: {
      type: String,
    },
    googlePay_no: {
      type: String,
    },
    paytm_no: {
      type: String,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
    },
    created_at: {
      type: String,
      default: Date.now,
    },
    updated_at: {
      type: String,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", schema);
