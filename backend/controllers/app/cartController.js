// controllers/cartController.js
const Cart = require("../../models/CartModel");
const Menu = require("../../models/MenuItems");

class CartController {
  // Add to Cart
  static async addToCart(req, res) {
    const { menuItemId, quantity, variantName, addOns } = req.body;
    const userId = req.userId;
    console.log(req.body);

    try {
      // Fetch the menu item to get variant and add-on prices
      const menuItem = await Menu.findById(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      const variant = menuItem.variants.find((v) => v.name === variantName);
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

  static async getCart(req, res) {
    const userId = req.userId;
    // console.log("userId", userId);

    try {
      let cart = await Cart.findOne({ userId })
        .populate("items.menuItem")
        .populate({
          path: "items.menuItem",
          populate: {
            path: "category", // Populate the category field inside menuItem
            model: "Category",
          },
        });
      console.log("cart", cart);

      if (!cart) {
        cart = new Cart({ userId, items: [], totalAmount: 0 });
        await cart.save();
      }
      // console.log(6);
      res.status(200).json(cart);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Failed to fetch cart", error });
    }
  }
}

module.exports = CartController;
