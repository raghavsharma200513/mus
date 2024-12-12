// routes/orderRoutes.js
const express = require("express");
const OrderController = require("../../controllers/admin/orderController");
const router = express.Router();
const { NotLoggedIn } = require("../../middlewares/Adminauth");

router.get("/all", NotLoggedIn, OrderController.getAllOrders); // Can remain a GET request
router.post("/cancel", NotLoggedIn, OrderController.cancelOrder);

module.exports = router;
