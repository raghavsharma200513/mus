const MenuItem = require("../../models/MenuItems");
const Category = require("../../models/Category");
const fs = require("fs");
const path = require("path");

// Create a new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const {
      name,
      actualPrice,
      discountedPrice,
      desc,
      category,
      addOns,
      variants,
    } = req.body;
    console.log(req.body);

    if (!name || !actualPrice || !category || !discountedPrice) {
      return res
        .status(400)
        .json({ error: "Name, price and category are required" });
    }

    if (discountedPrice > actualPrice) {
      return res
        .status(400)
        .json({ error: "discounted price is more then actual price." });
    }

    // Parse the JSON strings into objects
    const parsedAddOns = JSON.parse(addOns || "[]");
    const parsedVariants = JSON.parse(variants || "[]");
    // console.log("req.file.filename", req.file.filename);

    const menuItem = new MenuItem({
      name,
      actualPrice,
      discountedPrice,
      desc,
      category,
      addOns: parsedAddOns,
      variants: parsedVariants,
      image: req.file ? `/images/${req.file.filename}` : null,
    });

    await menuItem.save();

    res.status(201).json({
      message: "Menu item created successfully",
      menuItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a menu item
// exports.updateMenuItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       actualPrice,
//       discountedPrice,
//       description,
//       category,
//       addOns,
//       variants,
//     } = req.body;
//     console.log("Full request body:", req.body);
//     console.log("Request files:", req.file);

//     // Find the existing menu item to handle image deletion
//     const existingMenuItem = await MenuItem.findById(id);
//     if (!existingMenuItem) {
//       return res.status(404).json({ error: "Menu item not found" });
//     }

//     // Prepare update object
//     const updateData = {
//       name,
//       actualPrice,
//       discountedPrice,
//       description,
//       category,
//       addOns: JSON.parse(addOns || "[]"),
//       variants: JSON.parse(variants || "[]"),
//     };

//     // Handle image update
//     if (req.file) {
//       // Delete old image if it exists
//       if (existingMenuItem.image) {
//         const oldImagePath = path.join(
//           __dirname,
//           "..",
//           "images",
//           path.basename(existingMenuItem.image)
//         );
//         try {
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath);
//           }
//         } catch (error) {
//           console.error("Error deleting old image:", error);
//         }
//       }

//       // Add new image path
//       updateData.image = `/images/${req.file.filename}`;
//     } else if (req.body.removeImage) {
//       // If removeImage flag is set, delete the existing image
//       if (existingMenuItem.image) {
//         const oldImagePath = path.join(
//           __dirname,
//           "..",
//           "images",
//           path.basename(existingMenuItem.image)
//         );
//         try {
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath);
//           }
//         } catch (error) {
//           console.error("Error deleting old image:", error);
//         }
//       }
//       updateData.image = null;
//     }

//     // Update the menu item
//     const menuItem = await MenuItem.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!menuItem) {
//       return res.status(404).json({ error: "Menu item not found" });
//     }

//     res.json({
//       message: "Menu item updated successfully",
//       menuItem,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      actualPrice,
      discountedPrice,
      description,
      category,
      addOns,
      variants,
    } = req.body;
    console.log("req.body", req.body);
    console.log("helooooooooo");

    // Find the existing menu item
    const existingMenuItem = await MenuItem.findById(id);
    if (!existingMenuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // Prepare update data
    const updateData = {
      name,
      actualPrice,
      discountedPrice,
      description,
      category,
      addOns: addOns ? JSON.parse(addOns) : existingMenuItem.addOns,
      variants: variants ? JSON.parse(variants) : existingMenuItem.variants,
    };

    // Update image if a new file is provided
    if (req.file) {
      updateData.image = `/images/${req.file.filename}`;
    }

    // Update the menu item
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Menu item updated successfully",
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Get all menu items
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    const category = await Category.find();
    res.json({ menuItems, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single menu item by ID
exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id).populate("category", "name");
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByIdAndDelete(id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
