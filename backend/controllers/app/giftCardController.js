const GiftCard = require("../../models/GiftCard");
const User = require("../../models/User");
const paypal = require("paypal-rest-sdk"); // Assuming PayPal is used for payments
const crypto = require("crypto");
const sendEmail = require("../../config/mailer");

paypal.configure({
  mode: "sandbox", // Use "live" for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.YOUR_CLIENT_SECRET,
});

// Helper function to generate unique gift card code
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = crypto.randomBytes(6).toString("hex"); // Random 12-character hexadecimal code
    const existingGiftCard = await GiftCard.findOne({ code });
    if (!existingGiftCard) isUnique = true;
  }

  return code;
};

// Create Gift Card Order
exports.createGiftCardOrder = async (req, res) => {
  const { recipientEmail, amount, message } = req.body;
  // const userId = req.userId;
  // console.log("req.body", req.body);

  try {
    if (!recipientEmail || !amount) {
      return res.status(400).json({
        message: "recipientEmail and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Create a gift card with initial draft status
    const code = await generateUniqueCode();
    const giftCard = new GiftCard({
      // user: userId,
      amount,
      recipientEmail,
      message,
      code,
      isRedeemed: false,
      status: "draft",
      paymentMethod: "paypal",
      paymentStatus: "pending",
    });
    // console.log("giftCard", giftCard);

    // Create PayPal order
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.DOMAIN}gift-card-confirmation?gid=${giftCard._id}`,
        cancel_url: `${process.env.DOMAIN}gift-card-review?gid=${giftCard._id}`,
      },
      transactions: [
        {
          amount: {
            currency: "EUR",
            total: amount.toString(), // Convert to string as PayPal expects string
          },
          description: `Gift Card Purchase - ${code}`,
        },
      ],
    };

    // Create PayPal payment and save gift card
    try {
      const payment = await new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, (error, payment) => {
          if (error) reject(error);
          else resolve(payment);
        });
      });

      giftCard.paymentId = payment.id;
      await giftCard.save();

      // Find and return the approval URL
      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      );

      res.json({
        id: payment.id,
        giftCardId: giftCard._id,
        approvalUrl: approvalUrl?.href,
        links: payment.links,
      });
    } catch (paypalError) {
      console.error("PayPal payment creation failed:", paypalError);
      return res.status(500).json({
        message: "Payment creation failed",
        error: paypalError.message,
      });
    }
  } catch (error) {
    console.error("Error creating gift card order:", error);
    res.status(500).json({
      message: "Failed to create gift card order",
      error: error.message,
    });
  }
};

// Verify Gift Card Payment
exports.verifyGiftCardPayment = async (req, res) => {
  const { giftCardId, payerId, paymentId } = req.body;
  // console.log("req.body", req.body);

  try {
    const giftCard = await GiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({ message: "Gift card not found" });
    }

    // if (giftCard.status !== "draft") {
    //   return res.status(400).json({
    //     message: "Gift card is not in draft status",
    //   });
    // }

    const execute_payment_json = {
      payer_id: payerId,
    };

    // Verify payment with PayPal
    try {
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async (error, payment) => {
          if (error) {
            return res
              .status(400)
              .json({ message: "Payment verification failed", error });
          } else {
            // Update gift card status
            giftCard.isRedeemed = false; // Not redeemed yet
            giftCard.paymentStatus = payment.state;
            giftCard.amount = payment.transactions[0].amount.total;
            giftCard.currency = payment.transactions[0].amount.currency;
            giftCard.payerId = payerId;
            giftCard.paymentId = paymentId;
            giftCard.status = "issued";
            await giftCard.save();
            console.log("giftCard", giftCard);

            await sendEmail(
              giftCard.recipientEmail,
              "Gift Card Pucrchased!",
              `Your Gift Card Pucrchased has been successfully Confirmed. We look forward to serving you!
              Code: ${giftCard.code}
              Amount: ${giftCard.amount} ${giftCard.currency}
              Status: ${giftCard.status}
              PaymentId: ${giftCard.paymentId}
              `
            );

            res.status(200).json({
              message: "Payment verified and gift card issued",
              giftCard,
            });
          }
        }
      );
    } catch (paypalError) {
      console.error("PayPal payment verification failed:", paypalError);
      giftCard.paymentStatus = "failed";
      await giftCard.save();

      return res.status(400).json({
        message: "Payment verification failed",
        error: paypalError.message,
      });
    }
  } catch (error) {
    console.error("Error verifying gift card payment:", error);
    res.status(500).json({
      message: "Failed to verify gift card payment",
      error: error.message,
    });
  }
};

// Redeem a Gift Card
exports.redeemGiftCard = async (req, res) => {
  const { code } = req.params;

  try {
    const giftCard = await GiftCard.findOne({ code });

    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    if (giftCard.isRedeemed) {
      return res.status(400).json({ error: "Gift card already redeemed" });
    }

    giftCard.isRedeemed = true;
    giftCard.status = "redeemed";
    await giftCard.save();

    res
      .status(200)
      .json({ message: "Gift card redeemed successfully", giftCard });
  } catch (error) {
    console.error("Error redeeming gift card:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Gift Card Details
exports.getGiftCard = async (req, res) => {
  const { id } = req.params;

  try {
    const giftCard = await GiftCard.findById(id);

    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    res.status(200).json(giftCard);
  } catch (error) {
    console.error("Error fetching gift card:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
