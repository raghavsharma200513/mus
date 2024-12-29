// controllers/cartController.js
const Cart = require("../../models/CartModel");
const Menu = require("../../models/MenuItems");

class CartController {
  // Add to Cart
  static async addToCart(req, res) {
    const { menuItemId, quantity, variantName, addOns } = req.body;
    // console.log("variantName", variantName);

    const userId = req.userId;
    // console.log(req.body);

    try {
      // Fetch the menu item to get variant and add-on prices
      const menuItem = await Menu.findById(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      // console.log("menuItem", menuItem);

      // const variant = menuItem.variants.find((v) => {
      //   console.log(1, v);
      //   console.log(2, v._id);
      //   console.log(3, variantName);
      //   console.log(4, v._id == variantName);
      //   console.log(5, v._id === variantName);

      //   v._id == variantName;
      // });
      const variant = menuItem.variants.find(
        (v) => v._id.toString() === variantName
      );

      // console.log("variant", variant);
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      const addOnPrices = addOns.map((addOn) => {
        const foundAddOn = menuItem.addOns.find((a) => a.name === addOn.name);
        if (!foundAddOn) {
          throw new Error(`Add-on ${addOn.name} not found`);
        }
        return { ...addOn, price: foundAddOn.price };
      });

      // Fetch or initialize the cart for the user
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [], totalAmount: 0 });
      }

      // Check if the item with the same variant exists
      const existingItem = cart.items.find(
        (item) =>
          item.menuItem.toString() === menuItemId &&
          item.variant.name === variantName
      );

      if (existingItem) {
        // Update quantity and addOns for the existing item
        existingItem.quantity += quantity;
        addOnPrices.forEach((addOn) => {
          const existingAddOn = existingItem.addOns.find(
            (a) => a.name === addOn.name
          );
          if (existingAddOn) {
            existingAddOn.quantity += addOn.quantity || 1;
          } else {
            existingItem.addOns.push(addOn);
          }
        });
      } else {
        // Add a new item to the cart
        cart.items.push({
          menuItem: menuItemId,
          quantity,
          variant: { name: variant.name, price: variant.price },
          addOns: addOnPrices,
        });
      }

      // Recalculate total amount
      cart.totalAmount = await CartController.calculateCartTotal(cart.items);
      await cart.save();

      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to add to cart", error: error.message });
    }
  }

  // Calculate Cart Total
  static async calculateCartTotal(items) {
    let total = 0;
    for (let item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (menuItem) {
        const variantPrice = item.variant.price;
        const addOnsPrice = item.addOns.reduce(
          (sum, addOn) => sum + addOn.price * addOn.quantity,
          0
        );
        total += (variantPrice + addOnsPrice) * item.quantity;
      }
    }
    return total;
  }

  // Clear Cart
  static async clearCart(req, res) {
    const userId = req.userId;

    try {
      const cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
      }
      res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart", error });
    }
  }

  // Update Quantity
  static async updateQuantity(req, res) {
    const { itemId, quantity } = req.body;
    const userId = req.userId;
    console.log(req.body);

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const item = cart.items.find((item) => item._id.toString() === itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Update quantity
      if (quantity <= 0) {
        cart.items = cart.items.filter(
          (item) => item._id.toString() !== itemId
        );
      } else {
        item.quantity = quantity;
      }

      // Recalculate total amount
      cart.totalAmount = await CartController.calculateCartTotal(cart.items);
      await cart.save();

      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update quantity", error: error.message });
    }
  }

  // Remove Item from Cart
  static async removeItem(req, res) {
    const { itemId } = req.body;
    const userId = req.userId;
    try {
      const cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = cart.items.filter(
          (item) => item._id.toString() !== itemId
        );
        cart.totalAmount = await CartController.calculateCartTotal(cart.items);
        await cart.save();
      }
      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to remove item from cart", error });
    }
  }

  // static async getCart(req, res) {
  //   const userId = req.userId;
  //   // console.log("userId", userId);

  //   try {
  //     let cart = await Cart.findOne({ userId })
  //       .populate("items.menuItem")
  //       .populate({
  //         path: "items.menuItem",
  //         populate: {
  //           path: "category", // Populate the category field inside menuItem
  //           model: "Category",
  //         },
  //       });
  //     console.log("cart", cart);

  //     if (!cart) {
  //       cart = new Cart({ userId, items: [], totalAmount: 0 });
  //       await cart.save();
  //     }
  //     res.status(200).json(cart);
  //   } catch (error) {
  //     console.log("error", error);
  //     res.status(500).json({ message: "Failed to fetch cart", error });
  //   }
  // }

  static async getCart(req, res) {
    const userId = req.userId;
    // console.log("1. Getting cart for userId:", userId);

    try {
      let cart = await Cart.findOne({ userId })
        .populate("items.menuItem")
        .populate({
          path: "items.menuItem",
          populate: {
            path: "category",
            model: "Category",
          },
        });

      // console.log(
      //   "2. Initial cart from database:",
      //   JSON.stringify(cart, null, 2)
      // );

      if (!cart) {
        // console.log("3A. No cart found, creating new cart");
        cart = new Cart({ userId, items: [], totalAmount: 0 });
        await cart.save();
        return res.status(200).json(cart);
      }

      // console.log(
      //   "3B. Found existing cart with items count:",
      //   cart.items.length
      // );

      // Array to store valid items after complete verification
      let validatedItems = [];

      // Validate each item in the cart
      for (let item of cart.items) {
        // console.log("\n4. Validating item:", JSON.stringify(item, null, 2));

        // Skip if menuItem is null
        if (!item.menuItem) {
          // console.log("5A. Skipping item - menuItem is null");
          continue;
        }

        // Fetch fresh menu item data
        const currentMenuItem = await Menu.findById(item.menuItem._id);
        // console.log(
        //   "5B. Current menu item from database:",
        //   JSON.stringify(currentMenuItem, null, 2)
        // );

        if (!currentMenuItem) {
          // console.log(
          //   "5C. Skipping item - menu item no longer exists in database"
          // );
          continue;
        }

        // Validate variant
        const currentVariant = currentMenuItem.variants.find((v) => {
          // console.log(v.name.toString());
          // console.log(item.variant.name);

          return v.name.toString() === item.variant.name;
        });
        // console.log(
        //   "6. Found variant:",
        //   JSON.stringify(currentVariant, null, 2)
        // );

        if (!currentVariant) {
          // console.log("6A. Skipping item - variant no longer exists");
          continue;
        }

        // Validate and update addons
        const validAddons = [];
        let allAddonsValid = true;

        // console.log(
        //   "7. Validating addons:",
        //   JSON.stringify(item.addOns, null, 2)
        // );
        for (let addon of item.addOns) {
          const currentAddon = currentMenuItem.addOns.find(
            (a) => a.name === addon.name
          );
          // console.log(
          //   "7A. Checking addon:",
          //   addon.name,
          //   "Found:",
          //   !!currentAddon
          // );

          if (!currentAddon) {
            // console.log("7B. Invalid addon found:", addon.name);
            allAddonsValid = false;
            break;
          }

          validAddons.push({
            name: currentAddon.name,
            price: currentAddon.price,
            quantity: addon.quantity || 1,
          });
        }

        if (!allAddonsValid) {
          // console.log("7C. Skipping item - not all addons are valid");
          continue;
        }

        // If we reach here, the item is valid - add it with updated prices
        const validatedItem = {
          ...item.toObject(),
          variant: {
            name: currentVariant.name,
            price: currentVariant.price,
          },
          addOns: validAddons,
        };
        // console.log(
        //   "8. Adding validated item:",
        //   JSON.stringify(validatedItem, null, 2)
        // );
        validatedItems.push(validatedItem);
      }

      // console.log(
      //   "9. All validated items:",
      //   JSON.stringify(validatedItems, null, 2)
      // );

      // Update cart with validated items
      cart.items = validatedItems;

      // Recalculate total
      cart.totalAmount = await CartController.calculateCartTotal(
        validatedItems
      );
      // console.log("10. Recalculated total:", cart.totalAmount);

      // Save updated cart
      await cart.save();
      // console.log("11. Saved updated cart");

      res.status(200).json(cart);
    } catch (error) {
      // console.log("ERROR in getCart:", error);
      res.status(500).json({ message: "Failed to fetch cart", error });
    }
  }
}

module.exports = CartController;
