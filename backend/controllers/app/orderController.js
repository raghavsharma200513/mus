// controllers/orderController.js
const Order = require("../../models/OrderModel");
const User = require("../../models/User");
const Cart = require("../../models/CartModel");
const GiftCard = require("../../models/GiftCard");
const Coupon = require("../../models/DiscountModal");
const Address = require("../../models/Address");
const paypal = require("paypal-rest-sdk");
const sendEmail = require("../../config/mailer");

paypal.configure({
  mode: "live", // Change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.YOUR_CLIENT_SECRET,
});

class OrderController {
  static async calculateOrderAmount(cart, couponCode = null) {
    let totalAmount = 0;

    // Calculate base amount from items
    for (const item of cart.items) {
      // Base price from variant
      let itemTotal = item.variant.price * item.quantity;

      // Add addons cost
      if (item.addOns && item.addOns.length > 0) {
        const addonsCost = item.addOns.reduce(
          (sum, addon) => sum + addon.price * addon.quantity,
          0
        );
        itemTotal += addonsCost;
      }

      totalAmount += itemTotal;
    }

    // Apply coupon/gift card if provided
    let discountAmount = 0;
    let discountType = null;

    if (couponCode) {
      // console.log("couponCode", couponCode);

      // First, try to find a traditional coupon
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
        minimumOrderValue: { $lte: totalAmount },
      });

      if (coupon) {
        discountAmount = Math.min(
          (totalAmount * coupon.discountPercentage) / 100,
          coupon.upperLimit
        );
        discountType = "coupon";
        // console.log("coupon discount", discountAmount);
      } else {
        // If no discount found, check gift cards
        const giftCard = await GiftCard.findOne({
          code: couponCode,
        });

        if (giftCard && !giftCard.isRedeemed) {
          discountAmount = giftCard.amount;
          discountType = "giftCard";
          // console.log("gift card amount", discountAmount);
        }
      }
    }

    // Ensure discount doesn't exceed total amount
    discountAmount = Math.min(discountAmount, totalAmount);

    const result = {
      subtotal: totalAmount,
      discount: discountAmount,
      total: totalAmount - discountAmount,
      discountType: discountType,
    };

    // console.log("Order Amount Calculation:", result);

    return result;
  }

  static async createOrderFromCart(req, res) {
    const {
      addressId,
      couponCode,
      cartId,
      paymentMethod, // 'cash' or 'online'
    } = req.body;
    const userId = req.userId;
    console.log("couponCode", couponCode);

    try {
      if (!addressId || !cartId || !paymentMethod) {
        return res.status(400).json({
          message: "addressId, cartId or paymentMethod are Required ",
        });
      }
      const cart = await Cart.findById(cartId).populate("items.menuItem");
      const address = await Address.findById(addressId);

      // console.log("cart", cart);
      // console.log("address", address);

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      if (!address) {
        return res.status(400).json({ message: "Invalid address" });
      }

      // 2. Calculate order amount with coupon
      const { subtotal, discount, total, discountType } =
        await OrderController.calculateOrderAmount(cart, couponCode);

      // 3. Prepare order items
      const orderItems = cart.items.map((item) => ({
        menuItem: item.menuItem._id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.variant.price,
        variants: [item.variant],
        addOns: item.addOns,
      }));
      // console.log("orderItems", orderItems);

      // 4. Create order object
      const order = new Order({
        userId: userId,
        items: orderItems,
        phone: address.phone,
        email: address.email,
        address: address,
        orderTotal: total,
        subtotal,
        discount,
        couponCode,
        paymentMethod,
        status:
          paymentMethod === "cod" || paymentMethod === "pod"
            ? "pending"
            : "awaiting_payment",
      });
      // console.log("order", order);

      // 5. Handle based on payment method
      if (paymentMethod === "cod" || paymentMethod === "pod") {
        await order.save();
        console.log("cod");

        // Clear cart
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        if (discountType == "giftCard") {
          const giftCard = await GiftCard.findOne({ code: couponCode });

          if (!giftCard) {
            return res.status(404).json({ error: "Gift card not found" });
          }

          if (giftCard.isRedeemed) {
            return res
              .status(400)
              .json({ error: "Gift card already redeemed" });
          }
          giftCard.isRedeemed = true;
          giftCard.status = "redeemed";
          await giftCard.save();
        }

        return res.status(201).json({
          order,
          message: "Order placed successfully",
        });
      } else {
        // For online payment, create PayPal order
        await order.save();
        const create_payment_json = {
          intent: "sale",
          payer: {
            payment_method: "paypal",
          },
          redirect_urls: {
            return_url:
              process.env.DOMAIN + "order-confirmation?oid=" + order._id,
            cancel_url: process.env.DOMAIN + "review?cid=" + cartId,
          },
          transactions: [
            {
              amount: {
                currency: "EUR",
                total: total,
              },
              description: "Payment description",
            },
          ],
        };
        paypal.payment.create(create_payment_json, (error, payment) => {
          if (error) {
            res.status(500).json({ error });
          } else {
            res.json({ id: payment.id, links: payment.links });
          }
        });
      }
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order", error });
    }
  }

  static async verifyPayment(req, res) {
    const { orderId, payerId, paymentId } = req.body;
    console.log(req.body);

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify payment with PayPal
      const execute_payment_json = {
        payer_id: payerId,
      };

      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async (error, payment) => {
          if (error) {
            order.status = "payment_failed";
            await order.save();
            return res
              .status(400)
              .json({ message: "Payment verification failed" });
          } else {
            // console.log(1);

            order.status = "pending";
            order.paymentId = payment.id;
            order.payerId = payerId;
            order.amount = payment.transactions[0].amount.total;
            order.currency = payment.transactions[0].amount.currency;
            order.paymentStatus = payment.state;
            // console.log(2);
            await order.save();
            // console.log(3);
            const giftCard = await GiftCard.findOne({ code: order.couponCode });

            // console.log(4);
            if (!giftCard) {
              return res.status(404).json({ error: "Gift card not found" });
            }
            // console.log(5);

            // if (giftCard.isRedeemed) {
            //   return res
            //     .status(400)
            //     .json({ error: "Gift card already redeemed" });
            // }
            // console.log(6);
            giftCard.isRedeemed = true;
            giftCard.status = "redeemed";
            await giftCard.save();

            // console.log(7);
            // Clear cart
            const cart = await Cart.findOne({ userId: order.userId });
            if (cart) {
              cart.items = [];
              cart.totalAmount = 0;
              await cart.save();
            }
            // console.log(8);

            return res.status(200).json({
              message: "Payment verified and order confirmed",
              order,
            });
          }
        }
      );
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: "Failed to verify payment", error });
    }
  }

  static async getAllOrdersById(req, res) {
    const userId = req.userId;
    try {
      const orders = await Order.find({ userId }).populate("userId");
      // .populate("address");
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders", error });
    }
  }

  static async getAllPendingOrders(req, res) {
    const userId = req.userId;
    const { status } = req.body;
    console.log("status", status);

    try {
      const user = await User.findOne({ _id: userId, role: "admin" }); // Changed `find` to `findOne`
      if (!user) {
        return res
          .status(403)
          .json({ message: "You are not allowed to do that" }); // Use proper HTTP status code and handle error correctly
      }

      // Fetch orders sorted by `createdAt` in descending order
      const orders = await Order.find({ status })
        .sort({ createdAt: -1 }) // Sort by `createdAt` descending
        .populate("userId");
      // .populate("address");

      res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve orders", error });
    }
  }

  static async getOrderById(req, res) {
    const { orderId } = req.body;
    // console.log("oderId", orderId);

    try {
      const order = await Order.findById(orderId).populate("userId");
      // .populate("address");
      // console.log("order", order);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order", error });
    }
  }

  static async getAllOrders(req, res) {
    const userId = req.userId;
    const { page = 1, limit = 10, search = "" } = req.query;

    try {
      // Input validation
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          message: "Invalid page number. Page must be a positive integer.",
        });
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          message: "Invalid limit. Limit must be between 1 and 100.",
        });
      }

      // Check admin privileges
      const user = await User.findOne({ _id: userId, role: "admin" });
      if (!user) {
        return res.status(403).json({
          message: "Unauthorized. Admin access required.",
        });
      }

      // Build search query
      let query = {};
      if (search.trim()) {
        // If the search looks like an ObjectId, search by _id
        if (/^[0-9a-fA-F]{24}$/.test(search)) {
          query._id = search;
        } else {
          // Otherwise, search in user email or order status
          query.$or = [
            { "userId.email": { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ];
        }
      }

      // Get total count for pagination
      const totalOrders = await Order.countDocuments(query);

      // Get paginated orders
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate({
          path: "userId",
          select: "email name",
        })
        .lean();

      // Send response in the requested format
      res.status(200).json({
        orders,
        totalOrders,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
      });
    } catch (error) {
      console.error("Error in getAllOrders:", error);

      return res.status(500).json({
        message: "Failed to retrieve orders",
        error,
      });
    }
  }

  static async getOrderByEmail(req, res) {
    const { email } = req.body;

    try {
      const orders = await Order.find({ email }).populate("userId");
      if (orders.length === 0) {
        return res
          .status(404)
          .json({ message: "No orders found for this email" });
      }
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders", error });
    }
  }

  static async updateOrderStatus(req, res) {
    const { orderId, status } = req.body;
    const userId = req.userId;

    try {
      const user = await User.find({ _id: userId, role: "admin" });
      if (!user) {
        res
          .status(500)
          .json({ message: "You are not allowed to do that", error });
      }
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.status = status;
      await order.save();
      if (status === "accepted") {
        await sendEmail(
          order.address.email,
          "Orderd Confirmed!",
          `Your order has been successfully Confirmed. We look forward to serving you!`
        );
      }
      if (status === "cancelled") {
        await sendEmail(
          order.address.email,
          "Orderd Cancelled!",
          `Your order has been cancelled. We look forward to serving you!`
        );
      }

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
