// routes/newsletterRoutes.js
const express = require("express");
const {
  subscribe,
  sendToAllSubscribers,
  getAllSubscribers,
} = require("../../controllers/app/newsletterController");

const router = express.Router();

// Subscribe to newsletter
router.post("/subscribe", subscribe);

// Send email to all subscribers
router.post("/send-email", sendToAllSubscribers);

router.get("/subscribers", getAllSubscribers);

module.exports = router;
