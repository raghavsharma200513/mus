// controllers/newsletterController.js
const Newsletter = require("../../models/Newsletter");
const sendEmail = require("../../config/mailer");

// Subscribe to newsletter
const subscribe = async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  console.log(email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const existingEmail = await Newsletter.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already subscribed" });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error, please try again later" });
  }
};

// Send email to all subscribers
const sendToAllSubscribers = async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: "Subject and message are required" });
  }

  try {
    const subscribers = await Newsletter.find({});
    if (subscribers.length === 0) {
      return res
        .status(400)
        .json({ error: "No subscribers to send emails to" });
    }

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      await sendEmail(subscriber.email, subject, message);
    }

    res
      .status(200)
      .json({ message: "Emails sent successfully to all subscribers" });
  } catch (error) {
    res.status(500).json({ error: "Server error, please try again later" });
  }
};

const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({});
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ error: "Server error, please try again later" });
  }
};

module.exports = { subscribe, sendToAllSubscribers, getAllSubscribers };
