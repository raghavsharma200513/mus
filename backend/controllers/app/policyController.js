// controllers/policyController.js
const Policy = require("../../models/Policy");

// Get policy by type
exports.getPolicy = async (req, res) => {
  try {
    const { type } = req.params;
    const policy = await Policy.findOne({ type });

    console.log("1");
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPolicies = async (req, res) => {
    console.log("hello");
    
  try {
    const policy = await Policy.find();

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update policy
exports.createOrUpdatePolicy = async (req, res) => {
  try {
    const { type, content } = req.body;

    const policy = await Policy.findOneAndUpdate(
      { type },
      { content },
      { new: true, upsert: true } // Create new if not found
    );

    res.status(200).json({ message: "Policy saved successfully", policy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete policy
exports.deletePolicy = async (req, res) => {
  try {
    const { type } = req.params;

    const policy = await Policy.findOneAndDelete({ type });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
