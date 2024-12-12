// routes/bookingRoutes.js
const express = require("express");
const { createBooking } = require("../../controllers/app/bookingController");
const router = express.Router();

router.post("/", createBooking);

module.exports = router;
