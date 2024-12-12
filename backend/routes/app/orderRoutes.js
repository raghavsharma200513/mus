// routes/orderRoutes.js
const express = require("express");
const OrderController = require("../../controllers/app/orderController");
const router = express.Router();
const { NotLoggedIn } = require("../../middlewares/Appauth");
const isAuth = require("../../middlewares/is-auth");

router.post("/create", isAuth, OrderController.createOrderFromCart);
router.post("/verify", isAuth, OrderController.verifyPayment);
router.get("/all", isAuth, OrderController.getAllOrdersById);
router.post("/pendingOrders", isAuth, OrderController.getAllPendingOrders);
router.post("/by-id", OrderController.getOrderById);
router.get("/allOrders", isAuth, OrderController.getAllOrders);
router.post("/by-email", OrderController.getOrderByEmail);
router.post("/cancel", NotLoggedIn, OrderController.cancelOrder);
router.put("/updateStatus", isAuth, OrderController.updateOrderStatus);

module.exports = router;
