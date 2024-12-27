const GiftCard = require("../../models/GiftCard");
const User = require("../../models/User");
const paypal = require("paypal-rest-sdk"); // Assuming PayPal is used for payments
const crypto = require("crypto");
const sendEmail = require("../../config/mailer");
const puppeteer = require("puppeteer");

paypal.configure({
  mode: process.env.PAYPAL_MODE, // Use "live" for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.YOUR_CLIENT_SECRET,
});

async function generateImage(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // Capture screenshot as PNG
  const imageBuffer = await page.screenshot({
    // fullPage: true,
    type: "png",
  });

  await browser.close();
  return imageBuffer;
}

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
            giftCard.isRedeemed = false;
            giftCard.paymentStatus = payment.state;
            giftCard.amount = payment.transactions[0].amount.total;
            giftCard.currency = payment.transactions[0].amount.currency;
            giftCard.payerId = payerId;
            giftCard.paymentId = paymentId;
            giftCard.status = "issued";
            await giftCard.save();
            // console.log("giftCard", giftCard);

            const svg = `<svg
      width="380"
      height="166"
      viewBox="0 0 380 166"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="max-width: 100%; height: auto;"
      >
        <path
          d="M380 150.62C374.996 150.62 370.939 146.563 370.939 141.557C370.939 136.551 374.996 132.494 380 132.494V127.025C374.996 127.025 370.939 122.968 370.939 117.964C370.939 112.959 374.996 108.901 380 108.901V103.433C374.996 103.433 370.939 99.3756 370.939 94.3698C370.939 89.3662 374.996 85.3088 380 85.3088V79.8405C374.996 79.8405 370.939 75.7831 370.939 70.7774C370.939 65.7716 374.996 61.7142 380 61.7142V56.2459C374.996 56.2459 370.939 52.1885 370.939 47.1849C370.939 42.1791 374.996 38.1217 380 38.1217V32.6535C374.996 32.6535 370.939 28.5961 370.939 23.5903C370.939 18.5867 374.996 14.5293 380 14.5293V9.0631C374.996 9.0631 370.939 5.0036 370.939 -3.05176e-05H9.06314C9.06314 5.0036 5.00637 9.0631 0 9.0631V14.5293C5.00637 14.5293 9.06314 18.5867 9.06314 23.5903C9.06314 28.5961 5.00637 32.6535 0 32.6535V38.1217C5.00637 38.1217 9.06314 42.1791 9.06314 47.1849C9.06314 52.1885 5.00637 56.2459 0 56.2459V61.7142C5.00637 61.7142 9.06314 65.7716 9.06314 70.7774C9.06314 75.7831 5.00637 79.8405 0 79.8405V85.3088C5.00637 85.3088 9.06314 89.3662 9.06314 94.3698C9.06314 99.3756 5.00637 103.433 0 103.433V108.901C5.00637 108.901 9.06314 112.959 9.06314 117.964C9.06314 122.968 5.00637 127.025 0 127.025V132.494C5.00637 132.494 9.06314 136.551 9.06314 141.557C9.06314 146.563 5.00637 150.62 0 150.62V156.088C5.00637 156.088 9.06314 160.144 9.06314 165.149H370.939C370.939 160.144 374.996 156.088 380 156.088V150.62Z"
          fill="#F8C995"
        />
        <path
          d="M344.422 9.61073H308V154H344.422C350.067 154 354.644 149.425 354.644 143.779V19.8313C354.644 14.1877 350.067 9.61073 344.422 9.61073Z"
          fill="#78303C"
        />
        <path
          d="M329 116.187V118.125C328.443 118.24 327.953 118.44 327.531 118.727C327.109 119.008 326.755 119.352 326.469 119.758C326.177 120.159 325.958 120.604 325.812 121.094C325.667 121.583 325.594 122.094 325.594 122.625C325.594 123.594 325.839 124.471 326.328 125.258C326.818 126.039 327.539 126.661 328.492 127.125C329.445 127.583 330.615 127.812 332 127.812C333.385 127.812 334.555 127.583 335.508 127.125C336.461 126.661 337.182 126.039 337.672 125.258C338.161 124.471 338.406 123.594 338.406 122.625C338.406 122.094 338.333 121.583 338.187 121.094C338.042 120.604 337.826 120.159 337.539 119.758C337.247 119.352 336.891 119.008 336.469 118.727C336.042 118.44 335.552 118.24 335 118.125V116.187C335.818 116.333 336.549 116.599 337.195 116.984C337.841 117.37 338.391 117.849 338.844 118.422C339.292 118.995 339.633 119.638 339.867 120.352C340.102 121.06 340.219 121.818 340.219 122.625C340.219 123.99 339.885 125.203 339.219 126.266C338.552 127.328 337.604 128.164 336.375 128.773C335.146 129.383 333.687 129.687 332 129.687C330.312 129.687 328.854 129.383 327.625 128.773C326.396 128.164 325.448 127.328 324.781 126.266C324.115 125.203 323.781 123.99 323.781 122.625C323.781 121.818 323.898 121.06 324.133 120.352C324.367 119.638 324.711 118.995 325.164 118.422C325.612 117.849 326.159 117.37 326.805 116.984C327.445 116.599 328.177 116.333 329 116.187ZM332 99.5566C333.687 99.5566 335.146 99.8613 336.375 100.471C337.604 101.08 338.552 101.916 339.219 102.979C339.885 104.041 340.219 105.255 340.219 106.619C340.219 107.984 339.885 109.197 339.219 110.26C338.552 111.322 337.604 112.158 336.375 112.768C335.146 113.377 333.687 113.682 332 113.682C330.312 113.682 328.854 113.377 327.625 112.768C326.396 112.158 325.448 111.322 324.781 110.26C324.115 109.197 323.781 107.984 323.781 106.619C323.781 105.255 324.115 104.041 324.781 102.979C325.448 101.916 326.396 101.08 327.625 100.471C328.854 99.8613 330.312 99.5566 332 99.5566ZM332 101.432C330.615 101.432 329.445 101.663 328.492 102.127C327.539 102.585 326.818 103.208 326.328 103.994C325.839 104.775 325.594 105.65 325.594 106.619C325.594 107.588 325.839 108.465 326.328 109.252C326.818 110.033 327.539 110.656 328.492 111.119C329.445 111.577 330.615 111.807 332 111.807C333.385 111.807 334.555 111.577 335.508 111.119C336.461 110.656 337.182 110.033 337.672 109.252C338.161 108.465 338.406 107.588 338.406 106.619C338.406 105.65 338.161 104.775 337.672 103.994C337.182 103.208 336.461 102.585 335.508 102.127C334.555 101.663 333.385 101.432 332 101.432ZM324 85.7988V83.8613H334.594C335.687 83.8613 336.664 84.1191 337.523 84.6348C338.378 85.1452 339.052 85.8665 339.547 86.7988C340.036 87.7311 340.281 88.8249 340.281 90.0801C340.281 91.3353 340.036 92.429 339.547 93.3613C339.052 94.2936 338.378 95.0176 337.523 95.5332C336.664 96.0436 335.687 96.2988 334.594 96.2988H324V94.3613H334.438C335.219 94.3613 335.914 94.1895 336.523 93.8457C337.128 93.502 337.604 93.0124 337.953 92.377C338.297 91.7363 338.469 90.9707 338.469 90.0801C338.469 89.1895 338.297 88.4238 337.953 87.7832C337.604 87.1426 337.128 86.653 336.523 86.3145C335.914 85.9707 335.219 85.7988 334.438 85.7988H324ZM340 79.9922H324V74.5859C324 73.3307 324.227 72.3047 324.68 71.5078C325.128 70.7057 325.734 70.112 326.5 69.7266C327.266 69.3411 328.12 69.1484 329.062 69.1484C330.005 69.1484 330.862 69.3411 331.633 69.7266C332.404 70.1068 333.018 70.6953 333.477 71.4922C333.93 72.2891 334.156 73.3099 334.156 74.5547V78.4297H332.438V74.6172C332.438 73.7578 332.289 73.0677 331.992 72.5469C331.695 72.026 331.294 71.6484 330.789 71.4141C330.279 71.1745 329.703 71.0547 329.062 71.0547C328.422 71.0547 327.849 71.1745 327.344 71.4141C326.839 71.6484 326.443 72.0286 326.156 72.5547C325.865 73.0807 325.719 73.7786 325.719 74.6484V78.0547H340V79.9922ZM332 52.5273C333.687 52.5273 335.146 52.832 336.375 53.4414C337.604 54.0508 338.552 54.8867 339.219 55.9492C339.885 57.0117 340.219 58.2253 340.219 59.5898C340.219 60.9544 339.885 62.168 339.219 63.2305C338.552 64.293 337.604 65.1289 336.375 65.7383C335.146 66.3477 333.687 66.6523 332 66.6523C330.312 66.6523 328.854 66.3477 327.625 65.7383C326.396 65.1289 325.448 64.293 324.781 63.2305C324.115 62.168 323.781 60.9544 323.781 59.5898C323.781 58.2253 324.115 57.0117 324.781 55.9492C325.448 54.8867 326.396 54.0508 327.625 53.4414C328.854 52.832 330.312 52.5273 332 52.5273ZM332 54.4023C330.615 54.4023 329.445 54.6341 328.492 55.0977C327.539 55.556 326.818 56.1784 326.328 56.9648C325.839 57.7461 325.594 58.6211 325.594 59.5898C325.594 60.5586 325.839 61.4362 326.328 62.2227C326.818 63.0039 327.539 63.6263 328.492 64.0898C329.445 64.5482 330.615 64.7773 332 64.7773C333.385 64.7773 334.555 64.5482 335.508 64.0898C336.461 63.6263 337.182 63.0039 337.672 62.2227C338.161 61.4362 338.406 60.5586 338.406 59.5898C338.406 58.6211 338.161 57.7461 337.672 56.9648C337.182 56.1784 336.461 55.556 335.508 55.0977C334.555 54.6341 333.385 54.4023 332 54.4023ZM324 36.582H340V38.457L327.437 47.1758V47.332H340V49.2695H324V47.3945L336.594 38.6445V38.4883H324V36.582Z"
          fill="#E9DAC3"
        />
        <path
          d="M71.5473 10.3792H35.1231C29.4782 10.3792 24.9033 14.9562 24.9033 20.5998V144.548C24.9033 150.194 29.4782 154.768 35.1231 154.768H71.5473V10.3792Z"
          fill="#78303C"
        />
        <path
          d="M56 132.125V137.062H40V131.906C40 130.354 40.3203 129.026 40.9609 127.922C41.5964 126.818 42.5104 125.971 43.7031 125.383C44.8906 124.794 46.3125 124.5 47.9687 124.5C49.6354 124.5 51.0703 124.797 52.2734 125.391C53.4714 125.984 54.3932 126.849 55.0391 127.984C55.6797 129.12 56 130.5 56 132.125ZM54.2812 135.125V132.25C54.2812 130.927 54.026 129.831 53.5156 128.961C53.0052 128.091 52.2786 127.443 51.3359 127.016C50.3932 126.589 49.2708 126.375 47.9687 126.375C46.6771 126.375 45.5651 126.586 44.6328 127.008C43.6953 127.43 42.9766 128.06 42.4766 128.898C41.9714 129.737 41.7187 130.781 41.7187 132.031V135.125H54.2812ZM40 119.312H56V121.25H40V119.312ZM44 106.678C43.2083 106.771 42.5938 107.152 42.1562 107.818C41.7187 108.485 41.5 109.303 41.5 110.271C41.5 110.98 41.6146 111.6 41.8437 112.131C42.0729 112.657 42.388 113.068 42.7891 113.365C43.1901 113.657 43.6458 113.803 44.1562 113.803C44.5833 113.803 44.9505 113.701 45.2578 113.498C45.5599 113.29 45.8125 113.024 46.0156 112.701C46.2135 112.378 46.3776 112.04 46.5078 111.686C46.6328 111.331 46.7344 111.006 46.8125 110.709L47.25 109.084C47.3594 108.667 47.5104 108.204 47.7031 107.693C47.8958 107.178 48.1589 106.686 48.4922 106.217C48.8203 105.743 49.2422 105.352 49.7578 105.045C50.2734 104.738 50.9062 104.584 51.6562 104.584C52.5208 104.584 53.3021 104.811 54 105.264C54.6979 105.712 55.2526 106.368 55.6641 107.232C56.0755 108.092 56.2813 109.136 56.2813 110.365C56.2813 111.511 56.0964 112.503 55.7266 113.342C55.3568 114.175 54.8411 114.831 54.1797 115.311C53.5182 115.785 52.75 116.053 51.875 116.115V114.115C52.4792 114.063 52.9792 113.86 53.375 113.506C53.7656 113.146 54.0573 112.693 54.25 112.146C54.4375 111.594 54.5312 111.001 54.5312 110.365C54.5312 109.626 54.4115 108.962 54.1719 108.373C53.9271 107.785 53.5885 107.318 53.1562 106.975C52.7187 106.631 52.2083 106.459 51.625 106.459C51.0937 106.459 50.6615 106.607 50.3281 106.904C49.9948 107.201 49.724 107.592 49.5156 108.076C49.3073 108.561 49.125 109.084 48.9687 109.646L48.4062 111.615C48.0469 112.865 47.5339 113.855 46.8672 114.584C46.2005 115.313 45.3281 115.678 44.25 115.678C43.3542 115.678 42.5729 115.436 41.9062 114.951C41.2344 114.462 40.7135 113.805 40.3437 112.982C39.9687 112.154 39.7812 111.23 39.7812 110.209C39.7812 109.178 39.9661 108.261 40.3359 107.459C40.7005 106.657 41.2005 106.021 41.8359 105.553C42.4714 105.079 43.1927 104.829 44 104.803V106.678ZM45 88.5234V90.4609C44.4427 90.5755 43.9531 90.776 43.5312 91.0625C43.1094 91.3437 42.7552 91.6875 42.4688 92.0937C42.1771 92.4948 41.9583 92.9401 41.8125 93.4297C41.6667 93.9193 41.5937 94.4297 41.5937 94.9609C41.5937 95.9297 41.8385 96.8073 42.3281 97.5937C42.8177 98.375 43.5391 98.9974 44.4922 99.4609C45.4453 99.9193 46.6146 100.148 48 100.148C49.3854 100.148 50.5547 99.9193 51.5078 99.4609C52.4609 98.9974 53.1823 98.375 53.6719 97.5937C54.1615 96.8073 54.4062 95.9297 54.4062 94.9609C54.4062 94.4297 54.3333 93.9193 54.1875 93.4297C54.0417 92.9401 53.8255 92.4948 53.5391 92.0937C53.2474 91.6875 52.8906 91.3437 52.4687 91.0625C52.0417 90.776 51.5521 90.5755 51 90.4609V88.5234C51.8177 88.6693 52.5495 88.9349 53.1953 89.3203C53.8411 89.7057 54.3906 90.1849 54.8437 90.7578C55.2917 91.3307 55.6328 91.974 55.8672 92.6875C56.1016 93.3958 56.2187 94.1536 56.2187 94.9609C56.2187 96.3255 55.8854 97.5391 55.2188 98.6016C54.5521 99.6641 53.6042 100.5 52.375 101.109C51.1458 101.719 49.6875 102.023 48 102.023C46.3125 102.023 44.8542 101.719 43.625 101.109C42.3958 100.5 41.4479 99.6641 40.7812 98.6016C40.1146 97.5391 39.7812 96.3255 39.7812 94.9609C39.7812 94.1536 39.8984 93.3958 40.1328 92.6875C40.3672 91.974 40.7109 91.3307 41.1641 90.7578C41.612 90.1849 42.1589 89.7057 42.8047 89.3203C43.4453 88.9349 44.1771 88.6693 45 88.5234ZM48 71.8926C49.6875 71.8926 51.1458 72.1973 52.375 72.8066C53.6042 73.416 54.5521 74.252 55.2188 75.3145C55.8854 76.377 56.2187 77.5905 56.2187 78.9551C56.2187 80.3197 55.8854 81.5332 55.2188 82.5957C54.5521 83.6582 53.6042 84.4941 52.375 85.1035C51.1458 85.7129 49.6875 86.0176 48 86.0176C46.3125 86.0176 44.8542 85.7129 43.625 85.1035C42.3958 84.4941 41.4479 83.6582 40.7812 82.5957C40.1146 81.5332 39.7812 80.3197 39.7812 78.9551C39.7812 77.5905 40.1146 76.377 40.7812 75.3145C41.4479 74.252 42.3958 73.416 43.625 72.8066C44.8542 72.1973 46.3125 71.8926 48 71.8926ZM48 73.7676C46.6146 73.7676 45.4453 73.9993 44.4922 74.4629C43.5391 74.9212 42.8177 75.5436 42.3281 76.3301C41.8385 77.1113 41.5937 77.9863 41.5937 78.9551C41.5937 79.9238 41.8385 80.8014 42.3281 81.5879C42.8177 82.3691 43.5391 82.9915 44.4922 83.4551C45.4453 83.9134 46.6146 84.1426 48 84.1426C49.3854 84.1426 50.5547 83.9134 51.5078 83.4551C52.4609 82.9915 53.1823 82.3691 53.6719 81.5879C54.1615 80.8014 54.4062 79.9238 54.4062 78.9551C54.4062 77.9863 54.1615 77.1113 53.6719 76.3301C53.1823 75.5436 52.4609 74.9212 51.5078 74.4629C50.5547 73.9993 49.3854 73.7676 48 73.7676ZM40 58.1348V56.1973H50.5937C51.6875 56.1973 52.6641 56.4551 53.5234 56.9707C54.3776 57.4811 55.0521 58.2025 55.5469 59.1348C56.0365 60.0671 56.2813 61.1608 56.2813 62.416C56.2813 63.6712 56.0365 64.765 55.5469 65.6973C55.0521 66.6296 54.3776 67.3535 53.5234 67.8691C52.6641 68.3796 51.6875 68.6348 50.5937 68.6348H40V66.6973H50.4375C51.2187 66.6973 51.9141 66.5254 52.5234 66.1816C53.1276 65.8379 53.6042 65.3483 53.9531 64.7129C54.2969 64.0723 54.4687 63.3066 54.4687 62.416C54.4687 61.5254 54.2969 60.7598 53.9531 60.1191C53.6042 59.4785 53.1276 58.9889 52.5234 58.6504C51.9141 58.3066 51.2187 58.1348 50.4375 58.1348H40ZM40 39.6406H56V41.5156L43.4375 50.2344V50.3906H56V52.3281H40V50.4531L52.5937 41.7031V41.5469H40V39.6406ZM41.7187 36.6387H40V24.6387H41.7187V29.6699H56V31.6074H41.7187V36.6387Z"
          fill="#E9DAC3"
        />
        <path
          d="M344.975 154.768H35.2197C29.5772 154.768 25 150.194 25 144.548V20.5998C25 14.9562 29.5772 10.3792 35.2197 10.3792H344.975C350.62 10.3792 355.195 14.9562 355.195 20.5998V144.548C355.195 150.194 350.62 154.768 344.975 154.768Z"
          stroke="#78303C"
          stroke-width="2.66667"
          stroke-miterlimit="10"
        />
        <text
          x="90"
          y="40"
          textAnchor="middle"
          fill="#78303C"
          fontSize="20"
          fontWeight="bold"
        >
          MUSEUM RESTAURANT
        </text>
        <text
          x="90"
          y="100"
          textAnchor="middle"
          fill="#78303C"
          fontSize="50"
          fontWeight="bold"
        >
         ${giftCard.amount}€
        </text>
        <text
          x="90"
          y="140"
          textAnchor="middle"
          fill="#78303C"
          fontSize="20"
          fontWeight="bold"
        >
          CODE: ${giftCard.code}
        </text>
      </svg>`;
            const htmlCode = `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <!-- German Content -->
    <div style="margin-bottom: 20px;">
      <h1 style="color: #444;">🎁 Ihre Geschenkkarte vom Museum Restaurant</h1>
      <p>Sehr geehrte/r <span style="font-weight: bold; color: #0056b3;">${giftCard.recipientEmail}</span>,</p>
      <p>
        Vielen Dank für den Kauf einer Geschenkkarte im <strong>Museum Restaurant</strong>! 
        Wir freuen uns, Ihnen die Möglichkeit zu bieten, ein unvergessliches kulinarisches Erlebnis bei uns zu genießen.
      </p>
      <p><strong>Details Ihrer Geschenkkarte:</strong></p>
      <ul>
        <li><strong>Coupon-Code:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.code}</span></li>
        <li><strong>Menge:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.amount} ${giftCard.currency}</span></li>
        <li><strong>Status:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.status}</span> Wochen ab dem Kaufdatum</li>
        <li><strong>Zahlungs-ID:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.paymentId}</span></li>
      </ul>
      <p>
        Wir freuen uns darauf, Sie in unserem Restaurant willkommen zu heißen und Ihnen ein einzigartiges Erlebnis mit den Aromen Indiens zu bieten. 
        Denken Sie auch an unsere Event- und Cateringservices für Ihre besonderen Anlässe!
      </p>
      <p>
        <strong>Bleiben Sie in Verbindung:</strong> Folgen Sie uns auf 
        <a href="https://www.instagram.com/museum.hechingen/" style="font-weight: bold; color: #0056b3; text-decoration: none;">Instagram</a> und 
        <a href="https://www.facebook.com/profile.php?id=61554941725773" style="font-weight: bold; color: #0056b3; text-decoration: none;">Facebook</a>, 
        um über Neuigkeiten, Angebote und exklusive Einblicke informiert zu bleiben.
      </p>
      <p>
        Teilen Sie Ihre Erfahrungen! Wir freuen uns über Ihre Bewertung auf Google: 
        <a href="https://maps.app.goo.gl/TJ4mFndY8oVkWHuG6" style="font-weight: bold; color: #0056b3; text-decoration: none;">Google</a>.
      </p>
      <p>
        Falls Sie Fragen haben, kontaktieren Sie uns gerne unter 
        <span style="font-weight: bold; color: #0056b3;">+49 7471 13016</span> oder per E-Mail unter 
        <a href="mailto:mandeepsingh227@yahoo.com" style="font-weight: bold; color: #0056b3; text-decoration: none;">mandeepsingh227@yahoo.com</a>.
      </p>
    </div>
    <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
    <!-- English Content -->
    <div style="margin-bottom: 20px;">
      <h1 style="color: #444;">🎁 Your Museum Restaurant Gift Card Confirmation</h1>
      <p>Dear <span style="font-weight: bold; color: #0056b3;">${giftCard.recipientEmail}</span>,</p>
      <p>
        Thank you for purchasing a gift card from <strong>Museum Restaurant</strong>! 
        We are thrilled to offer you the opportunity to enjoy a delightful culinary experience with us.
      </p>
      <p><strong>Gift Card Details:</strong></p>
      <ul>
        <li><strong>Coupon Code:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.code}</span></li>
        <li><strong>Amount:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.amount} ${giftCard.currency}</span></li>
        <li><strong>Status:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.status}</span></li>
        <li><strong>Payment ID:</strong> <span style="font-weight: bold; color: #0056b3;">${giftCard.paymentId}</span></li>
      </ul>
      <p>
        We look forward to welcoming you to our restaurant and providing you with a memorable dining experience, 
        showcasing the rich flavors of India. Don’t forget to explore our event and catering services for your special occasions!
      </p>
      <p>
        <strong>Stay Connected:</strong> Follow us on 
        <a href="https://www.instagram.com/museum.hechingen/" style="font-weight: bold; color: #0056b3; text-decoration: none;">Instagram</a> and 
        <a href="https://www.facebook.com/profile.php?id=61554941725773" style="font-weight: bold; color: #0056b3; text-decoration: none;">Facebook</a> for updates, offers, and exclusive insights.
      </p>
      <p>
        Share your experience! We’d love to hear from you. Leave us a review on Google: 
        <a href="https://maps.app.goo.gl/TJ4mFndY8oVkWHuG6" style="font-weight: bold; color: #0056b3; text-decoration: none;">Google</a>.
      </p>
      <p>
        If you have any questions, feel free to reach out to us at 
        <span style="font-weight: bold; color: #0056b3;">+49 7471 13016</span> or email us at 
        <a href="mailto:mandeepsingh227@yahoo.com" style="font-weight: bold; color: #0056b3; text-decoration: none;">mandeepsingh227@yahoo.com</a>.
      </p>
    </div>
    <div style="margin-top: 20px; font-size: 0.9em; color: #666; text-align: center;">
      <p>© 2024 Museum Restaurant. All rights reserved.</p>
    </div>
  </div>
</body>`;

            const pdfBuffer = await generateImage(svg);

            await sendEmail(
              giftCard.recipientEmail,
              "Gift Card Pucrchased!",
              ``,
              htmlCode,
              [{ filename: "GiftCardDetails.png", content: pdfBuffer }]
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
