// controllers/bannerController.js
const Banner = require("../../models/Banner");

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const bannerData = {
      imageUrl: req.file ? `/images/${req.file.filename}` : null,
      title: req.body.title,
      description: req.body.description,
      isEnabled: req.body.isEnabled || false,
    };

    // If this banner is being set as enabled, disable all other banners
    if (bannerData.isEnabled) {
      await Banner.updateMany({ isEnabled: true }, { isEnabled: false });
    }

    const banner = new Banner(bannerData);
    await banner.save();

    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBannersEnabled = async (req, res) => {
  try {
    const banners = await Banner.findOne({ isEnabled: true });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a banner
exports.updateBanner = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      ...(req.file && { imageUrl: `/images/${req.file.filename}` }),
      isEnabled: req.body.isEnabled || false,
    };

    // If this banner is being set as enabled, disable all other banners
    if (updateData.isEnabled) {
      await Banner.updateMany(
        { isEnabled: true, _id: { $ne: req.params.id } },
        { isEnabled: false }
      );
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!banner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
