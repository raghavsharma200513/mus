// routes/cartRoutes.js
const express = require("express");
const CartController = require("../../controllers/app/cartController");
const router = express.Router();
const isAuth = require("../../middlewares/is-auth");

router.post("/add", isAuth, CartController.addToCart);
router.put("/update", isAuth, CartController.updateQuantity);
router.delete("/remove", isAuth, CartController.removeItem);
router.get("/", isAuth, CartController.getCart);
router.patch("/", isAuth, CartController.clearCart);

module.exports = router;
