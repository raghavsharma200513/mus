const express = require("express");
const router = express.Router();
const {
  createMessage,
  getAllMessages,
} = require("../../controllers/app/messageController");

router.post("/", createMessage);
router.get("/", getAllMessages);

module.exports = router;
