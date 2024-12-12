const Message = require("../../models/Message");

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    // console.log(req.body);
    if (!name || !email || !phone || !message) {
      res.status(500).json({ message: "Some of the fields are missing" });
    }

    const newMessage = await Message.create({ name, email, phone, message });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
