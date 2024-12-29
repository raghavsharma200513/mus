// controllers/orderController.js
const Order = require("../../models/OrderModel");
const User = require("../../models/User");
const Cart = require("../../models/CartModel");
const GiftCard = require("../../models/GiftCard");
const Coupon = require("../../models/DiscountModal");
const Address = require("../../models/Address");
const paypal = require("paypal-rest-sdk");
const puppeteer = require("puppeteer");
const sendEmail = require("../../config/mailer");

paypal.configure({
  mode: process.env.PAYPAL_MODE, // Change to 'live' for production. 'sandbox'
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.YOUR_CLIENT_SECRET,
});

const formatItemsWithVariantsAndAddOns = (items) => {
  return items
    .map(
      (item, index) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;" colspan="3">
            <strong>${index + 1}. ${item.name}</strong>
          </td>
        </tr>
        ${
          item.variants.length > 0
            ? `<tr>
               <td style="padding: 10px; border: 1px solid #ddd; color: #555;">
                 Variant:
               </td>
               <td colspan="2" style="padding: 10px; border: 1px solid #ddd;">
                 ${item.variants
                   .map((variant) => `${variant.name} (₹${variant.price})`)
                   .join(", ")}
               </td>
             </tr>`
            : ""
        }
        ${
          item.addOns.length > 0
            ? `<tr>
               <td style="padding: 10px; border: 1px solid #ddd; color: #555;">
                 Add-Ons:
               </td>
               <td colspan="2" style="padding: 10px; border: 1px solid #ddd;">
                 ${item.addOns
                   .map(
                     (addOn) =>
                       `${addOn.name} (Qty: ${addOn.quantity}, ₹${addOn.price})`
                   )
                   .join(", ")}
               </td>
             </tr>`
            : ""
        }
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Quantity</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${
            item.quantity
          }</td>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price}</td>
        </tr>`
    )
    .join("");
};

const generateOrderEmailTemplate = (order, paymentDetails = null) => {
  const isOnlinePayment = !!paymentDetails;

  const paymentInfo = isOnlinePayment
    ? `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment ID:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${paymentDetails.id}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Status:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${paymentDetails.state}</td>
      </tr>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="text-align: center; color: #d35400;">Museum Restaurant</h2>
      <p><strong>Dear Museum Restaurant Team,</strong></p>
      <p>You have received a new order${
        isOnlinePayment ? " with successful online payment" : ""
      } from your website. Below are the order details:</p>
      
      <h4>Customer Details:</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${
            order.address.fullName
          }</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${order.phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${order.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Delivery Address:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">
            ${order.address.fullName},<br>
            ${order.address.addressLine1},<br>
            ${order.address.city}, ${order.address.state}, ${
    order.address.zipCode
  },<br>
            ${order.address.country}
          </td>
        </tr>
      </table>

      <h4>Order Details:</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Number:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${order._id}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Date & Time:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
            order.createdAt
          ).toLocaleString("en-US")}</td>
        </tr>
        ${paymentInfo}
      </table>

      <h4>Items Ordered:</h4>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
        </tr>
        ${formatItemsWithVariantsAndAddOns(order.items)}
      </table>

      <h4>Payment Summary:</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${
            order.orderTotal
          }</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
            order.paymentMethod
          }</td>
        </tr>
      </table>

      <h4>Special Instructions (if any):</h4>
      <p style="padding: 10px; border: 1px solid #ddd;">${
        order.specialInstructions || "None"
      }</p>

      <p>Please ensure this order is prepared and delivered/picked up promptly. If you have any questions or need to contact the customer, they can be reached at ${
        order.phone
      }.</p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${
          process.env.DOMAIN
        }adminnavbar" style="background-color: #d35400; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Pending Orders</a>
      </div>

      <p>Thank you,</p>
      <p><a href="${
        process.env.DOMAIN
      }">www.museum-restaurant-hechingen.de</a></p>
    </div>
  `;
};

async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();
  return pdfBuffer;
}

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
      subtotal: totalAmount.toFixed(2),
      discount: discountAmount.toFixed(2),
      total: +totalAmount.toFixed(2) - +discountAmount.toFixed(2),
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
    // console.log("couponCode", couponCode);

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
      console.log({ subtotal, discount, total, discountType });

      // 3. Prepare order items
      const orderItems = cart.items.map((item) => ({
        menuItem: item.menuItem._id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.variant.price,
        variants: [item.variant],
        addOns: item.addOns,
      }));

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
        // console.log("cod");

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
        // console.log("order", order);

        const formatItemsWithVariantsAndAddOns = (items) =>
          items
            .map(
              (item, index) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;" colspan="3">
                    <strong>${index + 1}. ${item.name}</strong>
                  </td>
                </tr>
                ${
                  item.variants.length > 0
                    ? `<tr>
                         <td style="padding: 10px; border: 1px solid #ddd; color: #555;">
                           Variant:
                         </td>
                         <td colspan="2" style="padding: 10px; border: 1px solid #ddd;">
                           ${item.variants
                             .map(
                               (variant) =>
                                 `${variant.name} (₹${variant.price})`
                             )
                             .join(", ")}
                         </td>
                       </tr>`
                    : ""
                }
                ${
                  item.addOns.length > 0
                    ? `<tr>
                         <td style="padding: 10px; border: 1px solid #ddd; color: #555;">
                           Add-Ons:
                         </td>
                         <td colspan="2" style="padding: 10px; border: 1px solid #ddd;">
                           ${item.addOns
                             .map(
                               (addOn) =>
                                 `${addOn.name} (Qty: ${addOn.quantity}, ₹${addOn.price})`
                             )
                             .join(", ")}
                         </td>
                       </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Quantity</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    item.quantity
                  }</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">₹${
                    item.price
                  }</td>
                </tr>`
            )
            .join("");

        const emailContent = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="text-align: center; color: #d35400;">Museum Restaurant</h2>
          <p><strong>Dear Museum Restaurant Team,</strong></p>
          <p>You have received a new order from your website. Below are the order details:</p>
          <h4>Customer Details:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                order.address.fullName
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                order.phone
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                order.email
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Delivery Address:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                ${order.address.fullName},<br>
                ${order.address.addressLine1},<br>
                ${order.address.city}, ${order.address.state}, ${
          order.address.zipCode
        },<br>
                ${order.address.country}
              </td>
            </tr>
          </table>
          <h4>Order Details:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Number:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                order._id
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Date & Time:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
                order.createdAt
              ).toLocaleString("en-US")}</td>
            </tr>
          </table>
          <h4>Items Ordered:</h4>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <tr>
              <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
            </tr>
            ${formatItemsWithVariantsAndAddOns(order.items)}
          </table>
          <h4>Payment Summary:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${
                order.orderTotal
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
                order.paymentMethod
              }</td>
            </tr>
          </table>
          <h4>Special Instructions (if any):</h4>
          <p style="padding: 10px; border: 1px solid #ddd;">${
            order.specialInstructions || "None"
          }</p>
          <p>
            Please ensure this order is prepared and delivered/picked up promptly. If you have any questions or need to contact the customer, they can be reached at ${
              order.phone
            }.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${
              process.env.DOMAIN
            }adminnavbar" style="background-color: #d35400; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Pending Orders</a>
          </div>
          <p>Thank you,</p>
          <p><a href="${
            process.env.DOMAIN
          }">www.museum-restaurant-hechingen.de</a></p>
        </div>
        `;

        const pdfBuffer = await generatePDF(emailContent);

        await sendEmail(
          "mandeepsingh227@yahoo.com",
          // "prakhargaba@gmail.com",
          `New Order Received from ${order.address.fullName}`,
          "",
          emailContent,
          [{ filename: "OrderDetails.pdf", content: pdfBuffer }]
        );
        // console.log("mail", mail);

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
                total: total.toString(),
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
    // console.log(req.body);

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
            if (giftCard) {
              // return res.status(404).json({ error: "Gift card not found" });
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
            }

            // console.log(7);
            // Clear cart
            const cart = await Cart.findOne({ userId: order.userId });
            if (cart) {
              cart.items = [];
              cart.totalAmount = 0;
              await cart.save();
            }

            const formatItemsWithVariantsAndAddOns = (items) =>
              items
                .map(
                  (item, index) => `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #ddd;" colspan="3">
                        <strong>${index + 1}. ${item.name}</strong>
                      </td>
                    </tr>
                    ${
                      item.variants.length > 0
                        ? `<tr>
                             <td style="padding: 10px; border: 1px solid #ddd; color: #555;">
                               Variant:
                             </td>
                             <td colspan="2" style="padding: 10px; border: 1px solid #ddd;">
                               ${item.variants
                                 .map(
                                   (variant) =>
                                     `${variant.name} (₹${variant.price})`
                                 )
                                 .join(", ")}
                             </td>
                           </tr>`
                        : ""
                    }
                    ${
                      item.addOns.length > 0
                        ? `<tr>
                             <td style="padding: 10px; border: 1px solid #ddd; color: #555;">
                               Add-Ons:
                             </td>
                             <td colspan="2" style="padding: 10px; border: 1px solid #ddd;">
                               ${item.addOns
                                 .map(
                                   (addOn) =>
                                     `${addOn.name} (Qty: ${addOn.quantity}, ₹${addOn.price})`
                                 )
                                 .join(", ")}
                             </td>
                           </tr>`
                        : ""
                    }
                    <tr>
                      <td style="padding: 10px; border: 1px solid #ddd;">Quantity</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${
                        item.quantity
                      }</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">₹${
                        item.price
                      }</td>
                    </tr>`
                )
                .join("");

            const emailContent = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
              <h2 style="text-align: center; color: #d35400;">Museum Restaurant</h2>
              <p><strong>Dear Museum Restaurant Team,</strong></p>
              <p>You have received a new order from your website. Below are the order details:</p>
              <h4>Customer Details:</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    order.address.fullName
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    order.phone
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    order.email
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Delivery Address:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">
                    ${order.address.fullName},<br>
                    ${order.address.addressLine1},<br>
                    ${order.address.city}, ${order.address.state}, ${
              order.address.zipCode
            },<br>
                    ${order.address.country}
                  </td>
                </tr>
              </table>
              <h4>Order Details:</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Number:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    order._id
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Date & Time:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
                    order.createdAt
                  ).toLocaleString("en-US")}</td>
                </tr>
              </table>
              <h4>Items Ordered:</h4>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                <tr>
                  <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Quantity</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
                </tr>
                ${formatItemsWithVariantsAndAddOns(order.items)}
              </table>
              <h4>Payment Summary:</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${
                    order.orderTotal
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
                    order.paymentMethod
                  }</td>
                </tr>
              </table>
              <h4>Special Instructions (if any):</h4>
              <p style="padding: 10px; border: 1px solid #ddd;">${
                order.specialInstructions || "None"
              }</p>
              <p>
                Please ensure this order is prepared and delivered/picked up promptly. If you have any questions or need to contact the customer, they can be reached at ${
                  order.phone
                }.
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${
                  process.env.DOMAIN
                }adminnavbar" style="background-color: #d35400; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Pending Orders</a>
              </div>
              <p>Thank you,</p>
              <p><a href="${
                process.env.DOMAIN
              }">www.museum-restaurant-hechingen.de</a></p>
            </div>
            `;

            const pdfBuffer = await generatePDF(emailContent);

            await sendEmail(
              "mandeepsingh227@yahoo.com",
              // "prakhargaba@gmail.com",
              `New Order Received from ${order.address.fullName}`,
              "",
              emailContent,
              [{ filename: "OrderDetails.pdf", content: pdfBuffer }]
            );
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
    // console.log("status", status);

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
    const { orderId, status, cancellationReason } = req.body;
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
      order.cancellationReason = cancellationReason;
      await order.save();
      const formatItems = (items) =>
        items
          .map(
            (item) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <strong>${item.name}</strong> (${item.quantity}x)
                ${
                  item.variants.length > 0
                    ? `<br>Variant: ${item.variants[0].name}`
                    : ""
                }
                ${
                  item.addOns.length > 0
                    ? `<br>Add-ons: ${item.addOns
                        .map((addOn) => addOn.name)
                        .join(", ")}`
                    : ""
                }
              </td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${
                item.price
              }</td>
            </tr>`
          )
          .join("");

      const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="text-align: center; color: #d35400;">Museum Restaurant</h2>
        <hr />
        <p><strong>Sehr geehrte/r ${order.address.fullName},</strong></p>
        <p>Vielen Dank, dass Sie sich für Museum Restaurant entschieden haben! Wir freuen uns, Ihre Bestellung zu bestätigen.</p>
        <h4>Details Ihrer Bestellung:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td><strong>Bestellnummer:</strong></td>
            <td>${order._id}</td>
          </tr>
          <tr>
            <td><strong>Bestelldatum und -uhrzeit:</strong></td>
            <td>${new Date(order.createdAt).toLocaleString("de-DE")}</td>
          </tr>
          <tr>
            <td><strong>Name:</strong></td>
            <td>${order.address.fullName}</td>
          </tr>
          <tr>
            <td><strong>Telefonnummer:</strong></td>
            <td>${order.phone}</td>
          </tr>
          <tr>
            <td><strong>E-Mail:</strong></td>
            <td>${order.email}</td>
          </tr>
          <tr>
            <td><strong>Lieferadresse:</strong></td>
            <td>${order.address.addressLine1}, ${order.address.city}, ${
        order.address.state
      }, ${order.address.zipCode}, ${order.address.country}</td>
          </tr>
          <tr>
            <td><strong>Zahlungsart:</strong></td>
            <td>${order.paymentMethod}</td>
          </tr>
        </table>
        <h4>Artikel:</h4>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          ${formatItems(order.items)}
        </table>
        <h4>Zahlungsübersicht:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td><strong>Zwischensumme:</strong></td>
            <td style="text-align: right;">₹${order.subtotal}</td>
          </tr>
          <tr>
            <td><strong>Rabatt:</strong></td>
            <td style="text-align: right;">₹${order.discount}</td>
          </tr>
          <tr>
            <td><strong>Liefergebühr:</strong></td>
            <td style="text-align: right;">₹${order.deliveryFee || 0}</td>
          </tr>
          <tr>
            <td><strong>Gesamtbetrag:</strong></td>
            <td style="text-align: right; font-size: 1.2em; font-weight: bold;">₹${
              order.orderTotal
            }</td>
          </tr>
        </table>
        <p>Wir freuen uns darauf, Ihnen ein genussvolles Erlebnis voller Aromen Indiens zu bieten.</p>
        <p>Für Fragen kontaktieren Sie uns unter <a href="mailto:mandeepsingh227@yahoo.com">mandeepsingh227@yahoo.com</a> oder +49747113015.</p>
        <hr />
        <p><strong>Dear ${order.address.fullName},</strong></p>
        <p>Thank you for choosing Museum Restaurant! We are delighted to confirm your order.</p>
        <h4>Order Details:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td><strong>Order ID:</strong></td>
            <td>${order._id}</td>
          </tr>
          <tr>
            <td><strong>Order Date & Time:</strong></td>
            <td>${new Date(order.createdAt).toLocaleString("en-US")}</td>
          </tr>
          <tr>
            <td><strong>Name:</strong></td>
            <td>${order.address.fullName}</td>
          </tr>
          <tr>
            <td><strong>Phone Number:</strong></td>
            <td>${order.phone}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${order.email}</td>
          </tr>
          <tr>
            <td><strong>Delivery Address:</strong></td>
            <td>${order.address.addressLine1}, ${order.address.city}, ${
        order.address.state
      }, ${order.address.zipCode}, ${order.address.country}</td>
          </tr>
          <tr>
            <td><strong>Payment Method:</strong></td>
            <td>${order.paymentMethod}</td>
          </tr>
        </table>
        <h4>Order Items:</h4>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          ${formatItems(order.items)}
        </table>
        <h4>Payment Summary:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td style="text-align: right;">₹${order.subtotal}</td>
          </tr>
          <tr>
            <td><strong>Discount:</strong></td>
            <td style="text-align: right;">₹${order.discount}</td>
          </tr>
          <tr>
            <td><strong>Delivery Fee:</strong></td>
            <td style="text-align: right;">₹${order.deliveryFee || 0}</td>
          </tr>
          <tr>
            <td><strong>Total:</strong></td>
            <td style="text-align: right; font-size: 1.2em; font-weight: bold;">₹${
              order.orderTotal
            }</td>
          </tr>
        </table>
        <p>We look forward to serving you a delightful dining experience filled with the flavors of India.</p>
        <p>If you have any questions, contact us at <a href="mailto:mandeepsingh227@yahoo.com">mandeepsingh227@yahoo.com</a> or +49747113015.</p>
        <hr />
      </div>`;

      const cancelEmail = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="text-align: center; color: #d35400;">Museum Restaurant</h2>
        
        <!-- German Section -->
        <p><strong>Sehr geehrte/r ${order.address.fullName},</strong></p>
        <p>
          Wir bedauern, Ihnen mitteilen zu müssen, dass Ihre kürzlich bei uns aufgegebene Bestellung (Bestellnummer: <strong>${order._id}</strong>) aus folgendem Grund storniert wurde:
        </p>
        <p style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">${order.cancellationReason}</p>
        <p>
          Wir entschuldigen uns aufrichtig für etwaige Unannehmlichkeiten. Falls Sie bereits belastet wurden, wird eine Rückerstattung innerhalb von 30 Minuten auf Ihre ursprüngliche Zahlungsmethode erfolgen.
        </p>
        <p>
          Falls Sie weitere Fragen haben oder eine neue Bestellung aufgeben möchten, kontaktieren Sie uns bitte unter:
          <strong>+49 7471 13016</strong> oder <strong>mandeepsingh227@yahoo.com</strong>
        </p>
        <p>Vielen Dank für Ihr Verständnis, und wir freuen uns darauf, Sie in Zukunft bedienen zu dürfen.</p>
        <p>Mit freundlichen Grüßen,</p>
        <p>Museum Restaurant</p>
        <p>
          Folgen Sie uns auf unseren sozialen Medien:<br>
          • <a href="https://www.facebook.com/profile.php?id=61554941725773" style="color: #d35400;">Facebook</a><br>
          • <a href="https://www.instagram.com/museum.hechingen/" style="color: #d35400;">Instagram</a>
        </p>
      
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      
        <!-- English Section -->
        <p><strong>Dear ${order.address.fullName},</strong></p>
        <p>
          We regret to inform you that your recent order with us (Order # <strong>${order._id}</strong>) has been cancelled due to the following reason:
        </p>
        <p style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">${order.cancellationReason}</p>
        <p>
          We sincerely apologize for any inconvenience this may have caused. If you have already been charged, a refund will be processed to your original payment method within 30 minutes.
        </p>
        <p>
          If you have any questions or wish to place a new order, please contact us at:
          <strong>+49 7471 13016</strong> or <strong>mandeepsingh227@yahoo.com</strong>
        </p>
        <p>Thank you for your understanding, and we look forward to serving you in the future.</p>
        <p>Warm regards,</p>
        <p>Museum Restaurant</p>
        <p>
          Follow us on social media:<br>
          • <a href="https://www.facebook.com/profile.php?id=61554941725773" style="color: #d35400;">Facebook</a><br>
          • <a href="https://www.instagram.com/museum.hechingen/" style="color: #d35400;">Instagram</a>
        </p>
      </div>
      `;

      if (status === "accepted") {
        await sendEmail(
          order.address.email,
          "Ihre Bestellung ist bestätigt / Your Order is Confirmed",
          "",
          emailContent
        );
      }
      if (status === "cancelled") {
        await sendEmail(
          order.address.email,
          "Orderd Cancelled!",
          ``,
          cancelEmail
        );
      }

      res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
      console.log(error);

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
