// routes/addressRoutes.js
const express = require("express");
const AddressController = require("../../controllers/app/addressController");
const isAuth = require("../../middlewares/is-auth");

const router = express.Router();

router.post("/add", isAuth, AddressController.addAddress);

router.get("/:id", isAuth, AddressController.getAddressesById);

router.get("/", isAuth, AddressController.getAddresses);

router.put("/edit/:addressId", isAuth, AddressController.editAddress);

router.delete("/delete/:addressId", isAuth, AddressController.deleteAddress);

router.put("/set-default", isAuth, AddressController.setDefaultAddress);

module.exports = router;
