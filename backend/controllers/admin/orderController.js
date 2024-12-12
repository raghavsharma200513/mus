// controllers/orderController.js
const Order = require("../../models/OrderModel");
const Cart = require("../../models/CartModel");

class OrderController {
  static async getAllOrders(req, res) {
    try {
      const orders = await Order.find().populate("userId");
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders", error });
    }
  }

  static async updateOrderStatus(req, res) {
    const { orderId, status } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.status = status;
      await order.save();

      res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status", error });
    }
  }

  static async cancelOrder(req, res) {
    const { orderId } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the logged-in user is the owner of the order
      if (order.userId.toString() !== req.userId) {
        return res
          .status(403)
          .json({ message: "Unauthorized to cancel this order" });
      }

      order.status = "Canceled";
      await order.save();

      res.status(200).json({ message: "Order canceled successfully", order });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel order", error });
    }
  }
}

module.exports = OrderController;
