const Gallery = require("../../models/Gallery");

const Category = require("../../models/Category");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { number } = req.body;
    console.log("hellooooooooooo");

    if (!number) {
      return res.status(400).json({ error: "Number is required" });
    }

    const gallery = new Gallery({
      number,
      image: req.file ? `/images/${req.file.filename}` : null,
    });
    await gallery.save();
    res.status(201).json({ message: "Category created successfully", gallery });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // Create a new gallery entry
// exports.createGalleryEntry = async (req, res) => {
//   try {
//     const { number } = req.body;
//     console.log("number", number);
//     console.log("req.file.filename", req.file.filename);

//     // Validate input
//     if (!number) {
//       return res.status(400).json({ error: "Number is required" });
//     }

//     // Check if number already exists
//     const existingEntry = await Gallery.findOne({ number });
//     if (existingEntry) {
//       return res
//         .status(409)
//         .json({ error: "Entry with this number already exists" });
//     }

//     const newEntry = await Gallery.create({
//       number,
//       image: req.file ? `/images/${req.file.filename}` : null,
//     });

//     res.status(201).json(newEntry);
//   } catch (error) {
//     console.error("Error creating gallery entry:", error);
//     res.status(500).json({
//       error: "Failed to create gallery entry",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// Get all gallery entries sorted by number
exports.getAllGalleryEntries = async (req, res) => {
  try {
    const entries = await Gallery.find().sort({ number: "asc" }).select("-__v"); // Exclude version key

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching gallery entries:", error);
    res.status(500).json({
      error: "Failed to fetch gallery entries",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update a gallery entry
exports.updateGalleryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { number } = req.body;

    // Validate input
    if (!number) {
      return res.status(400).json({ error: "Number is required" });
    }

    // Check if new number conflicts with existing entry
    const existingEntry = await Gallery.findOne({
      number,
      _id: { $ne: id },
    });
    if (existingEntry) {
      return res
        .status(409)
        .json({ error: "Entry with this number already exists" });
    }

    const updatedEntry = await Gallery.findByIdAndUpdate(
      id,
      {
        photo: req.file ? `/images/${req.file.filename}` : undefined,
        number,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Gallery entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating gallery entry:", error);
    res.status(500).json({
      error: "Failed to update gallery entry",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete a gallery entry
exports.deleteGalleryEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await Gallery.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ error: "Gallery entry not found" });
    }

    res.status(200).json({ message: "Gallery entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery entry:", error);
    res.status(500).json({
      error: "Failed to delete gallery entry",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
