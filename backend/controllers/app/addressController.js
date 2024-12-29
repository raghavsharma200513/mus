// controllers/addressController.js
const Address = require("../../models/Address");

class AddressController {
  static async addAddress(req, res) {
    const {
      fullName,
      phone,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      isDefault,
      // coordinates,
    } = req.body;
    const userId = req.userId;

    try {
      // Validate coordinates
      // if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      //   return res.status(400).json({ message: "Coordinates are required" });
      // }

      // If the new address is marked as default, unset other default addresses
      if (isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
      }

      const newAddress = new Address({
        userId,
        fullName,
        phone,
        email,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        isDefault,
        // coordinates,
      });

      await newAddress.save();
      res
        .status(201)
        .json({ message: "Address added successfully", address: newAddress });
    } catch (error) {
      res.status(500).json({ message: "Failed to add address", error });
    }
  }

  static async editAddress(req, res) {
    const { addressId } = req.params;
    const updates = req.body;

    try {
      if (updates.isDefault) {
        await Address.updateMany(
          { userId: updates.userId },
          { isDefault: false }
        );
      }

      // Validate coordinates if they are provided

      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        updates,
        { new: true }
      );
      res.status(200).json({
        message: "Address updated successfully",
        address: updatedAddress,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update address", error });
    }
  }

  // Get all addresses for a user
  static async getAddresses(req, res) {
    const userId = req.userId;
    // console.log("userIddd", userId);

    try {
      const addresses = await Address.find({ userId });
      // console.log("address", addresses);
      res.status(200).json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses", error });
    }
  }

  static async getAddressesById(req, res) {
    const id = req.params.id;
    console.log("assd", id);

    try {
      const addresses = await Address.findById(id);
      if (!addresses) {
        return res.status(404).json({ message: "Address not found" });
      }
      // console.log("address", addresses);
      res.status(200).json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses", error });
    }
  }

  // Delete an address
  static async deleteAddress(req, res) {
    const { addressId } = req.params;

    try {
      await Address.findByIdAndDelete(addressId);
      res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete address", error });
    }
  }

  // Set an address as default
  static async setDefaultAddress(req, res) {
    const { addressId } = req.body;
    const userId = req.userId;

    try {
      await Address.updateMany({ userId }, { isDefault: false });
      const defaultAddress = await Address.findByIdAndUpdate(
        addressId,
        { isDefault: true },
        { new: true }
      );
      res.status(200).json({
        message: "Default address updated successfully",
        address: defaultAddress,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to set default address", error });
    }
  }
}

module.exports = AddressController;
