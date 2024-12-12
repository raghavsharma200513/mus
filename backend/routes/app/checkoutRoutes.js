// routes/checkoutRoutes.js
const express = require("express");
const { checkout } = require("../../controllers/app/checkoutController");
const router = express.Router();

router.post("/", checkout);

module.exports = router;
