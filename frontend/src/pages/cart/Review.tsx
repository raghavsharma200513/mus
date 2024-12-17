import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/Modal";
import { assets } from "@/assets/assets";
import LanguageContext from "@/context/LanguageContext";

interface Variant {
  name: string;
  price: number;
}

interface AddOn {
  quantity: number;
  _id: string;
  name: string;
  price: number;
}
interface category {
  image: string;
}
interface link {
  rel: string;
}

interface MenuItem {
  _id: string;
  name: string;
  image: string;
  actualPrice: number;
  discountedPrice: number;
  category: category;
  addOns: Array<{
    _id: string;
    name: string;
    price: number;
  }>;
  variants: Array<{
    _id: string;
    name: string;
    price: number;
  }>;
}

interface CartItem {
  variant: Variant;
  quantity: number;
  _id: string;
  menuItem: MenuItem;
  addOns: AddOn[];
}

interface CartData {
  totalAmount: number;
  _id: string;
  userId: string;
  items: CartItem[];
}

interface CouponData {
  isActive: boolean;
  validFrom: string;
  validTo: string;
  minimumOrderValue: number;
  discountPercentage: number;
  upperLimit: number;
}
interface Address {
  _id: string; // or number, depending on your backend
  country: string;
  zipCode: string;
  addressLine1: string;
  phone: string;
  fullName: string;
  state: string;
  city: string;
}

const Review: React.FC = () => {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "online" | "pod" | null
  >("online");
  const [processingOrder, setProcessingOrder] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const cartId = queryParams.get("cid");
    const coupon = queryParams.get("cpn");

    if (cartId) fetchCart(cartId);
    if (coupon) setCouponCode(coupon);
    fetchAddresses();
  }, [location.search]);

  const fetchCart = async (cartId: unknown) => {
    try {
      console.log(cartId);

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCartData(data);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/address`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data[0]);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const calculateTotal = () => {
    if (!cartData) return { subtotal: 0, total: 0 };
    const subtotal = cartData.totalAmount;
    const total = subtotal - discount;
    return { subtotal, total: total > 0 ? total : 0 };
  };

  const applyCoupon = async () => {
    setDiscount(0);

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/discount/${couponCode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(data);

      // Check if the data is a coupon type
      if (data.type === "coupon") {
        // Check coupon status and redemption
        if (data.giftCard.status !== "issued" || data.giftCard.isRedeemed) {
          setCouponError("This coupon is not valid or has already been used");
          return;
        }

        // Additional checks for coupon validity
        const currentDate = new Date();
        const couponCreatedAt = new Date(data.giftCard.createdAt);

        // Assuming coupon is valid for 30 days from creation
        const couponExpirationDate = new Date(couponCreatedAt);
        couponExpirationDate.setDate(couponCreatedAt.getDate() + 365 * 10);

        if (currentDate > couponExpirationDate) {
          setCouponError("This coupon has expired");
          return;
        }

        // Apply the coupon amount as a direct discount
        const finalDiscount = data.giftCard.amount;
        setDiscount(finalDiscount);
        setCouponError("");
        return;
      }

      // Existing coupon logic for other types of discounts
      const couponData = data as CouponData;
      const currentDate = new Date();
      const validFrom = new Date(couponData.validFrom);
      const validTo = new Date(couponData.validTo);
      const { subtotal } = calculateTotal();

      if (!couponData.isActive) {
        setCouponError("This coupon is not active");
        return;
      }

      if (currentDate < validFrom || currentDate > validTo) {
        setCouponError("This coupon has expired or is not yet valid");
        return;
      }

      if (subtotal < couponData.minimumOrderValue) {
        setCouponError(
          `Minimum order value of ${couponData.minimumOrderValue}€ required`
        );
        return;
      }

      const calculatedDiscount =
        (subtotal * couponData.discountPercentage) / 100;
      const finalDiscount = Math.min(calculatedDiscount, couponData.upperLimit);
      setDiscount(finalDiscount);
      setCouponError("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Now we know it's an Axios error and can safely access response
        setCouponError(error.response?.data?.message || "Invalid coupon code");
      } else if (error instanceof Error) {
        // For standard Error types
        setCouponError("Invalid coupon code");
      } else {
        // Fallback for unknown error types
        setCouponError("An unexpected error occurred");
      }
      console.error("Error applying coupon:", error);
    }
  };

  const confirmDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteModalOpen(true);
    setDropdownOpen(null);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/address/delete/${addressToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDeleteModalOpen(false);
      setAddressToDelete(null);
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartData?.items?.length === 0) {
      alert("You don't have any item in the cart");
      return;
    }
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setProcessingOrder(true);

    try {
      const orderData = {
        addressId: selectedAddress._id,
        cartId: cartData?._id,
        couponCode,
        paymentMethod,
      };
      console.log("orderData", orderData);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/create`,
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (paymentMethod === "cod" || paymentMethod === "pod") {
        navigate(`/order-confirmation?oid=${data.order._id}`);
      } else {
        const approvalUrl = data.links.find(
          (link: link) => link.rel === "approval_url"
        );

        if (approvalUrl) {
          window.location.href = approvalUrl.href;
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setProcessingOrder(false);
    }
  };

  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const paymentId = urlParams.get("paymentId");
    // const payerId = urlParams.get("PayerID");
    // if (paymentId && payerId) {
    //   executePayment(paymentId, payerId);
    // }
  }, []);

  // const executePayment = async (
  //   paymentId: string,
  //   payerId: string,
  // ) => {
  //   try {
  //     const { data } = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/orders/verify`,
  //       {
  //         paymentId,
  //         payerId,
  //         orderId,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );
  //     console.log("Payment Successful:", data);
  //   } catch (error) {
  //     console.error("Error verifying payment:", error);
  //   }
  // };

  const { subtotal, total } = calculateTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-6">
            {language == "en" ? "Order Review" : "Bestellübersicht"}
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
            <h3 className="text-lg font-medium mb-4">
              {language == "en" ? "Order Items" : "Artikel"}
            </h3>
            <div className="space-y-4">
              {cartData?.items.map((item: CartItem) => {
                const imageUrl = item.menuItem.image
                  ? `${import.meta.env.VITE_BACKEND_URL}${item.menuItem.image}`
                  : item.menuItem.category.image
                  ? `${import.meta.env.VITE_BACKEND_URL}${
                      item.menuItem.category.image
                    }`
                  : assets.menu5;
                return (
                  <div key={item._id} className="flex gap-4 border-b pb-4">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.menuItem.name}</h4>
                      <p className="text-sm text-gray-600">
                        Size: {item.variant.name} (
                        {item.variant.price.toString().replace(".", ",")}€)
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      {item.addOns.length > 0 && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">Add-ons:</p>
                          <ul className="text-sm text-gray-600">
                            {item.addOns.map((addon) => (
                              <li key={addon._id}>
                                {addon.name} (
                                {addon.price.toString().replace(".", ",")}€ ×{" "}
                                {addon.quantity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {
                          // First calculate price for single item with add-ons
                          (
                            (item.variant.price +
                              item.addOns.reduce(
                                (sum, addon) =>
                                  sum + addon.price * addon.quantity,
                                0
                              )) *
                            // Then multiply by item quantity
                            item.quantity
                          )
                            .toFixed(2)
                            .toString()
                            .replace(".", ",")
                        }
                        €
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
            <h3 className="text-lg font-medium mb-4">
              {" "}
              {language == "en" ? "Delivery Address" : "Lieferadresse"}
            </h3>
            {selectedAddress ? (
              <div className="mb-4">
                <p>{selectedAddress.fullName}</p>
                <p>{selectedAddress.phone}</p>
                <p>{selectedAddress.addressLine1}</p>
                <p>
                  {selectedAddress.city}, {selectedAddress.state} -{" "}
                  {selectedAddress.zipCode}
                </p>
                <p>{selectedAddress.country}</p>
              </div>
            ) : (
              <p className="text-[#de2f2f]">
                {language == "en"
                  ? "No address selected"
                  : "Keine Adresse hinzugefügt"}
              </p>
            )}

            <div className="space-y-2">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer ${
                    address._id === selectedAddress?._id
                      ? "border-[#de2f2f]"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedAddress(address)}
                >
                  <div>
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {address.addressLine1}, {address.city}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(
                          dropdownOpen === address._id ? null : address._id
                        );
                      }}
                    >
                      &#x22EE;
                    </button>
                    {dropdownOpen === address._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border shadow rounded-lg">
                        {/* <button
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() =>
                            navigate(`/edit-address/${address._id}`)
                          }
                        >
                          Edit
                        </button> */}
                        <button
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                          onClick={() => confirmDeleteAddress(address._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full mt-4 bg-[#2E0A16] text-white py-2 rounded-lg font-semibold hover:bg-[#4a1627] transition-colors"
            onClick={() => navigate("/add-address")}
          >
            {language == "en" ? "Add New Address" : "Neue Adresse Hinzufügen"}
          </button>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-6">
              {language == "en" ? "Payment Summary" : "Zahlungsübersicht"}
            </h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder={
                  language == "en"
                    ? "Enter coupon code"
                    : "Gutscheincode eingeben"
                }
                // placeholder=""
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                className="w-full mt-2 bg-[#2E0A16] text-white py-2 rounded-lg font-semibold hover:bg-[#4a1627]"
                onClick={applyCoupon}
              >
                {language == "en" ? "Apply Coupon" : "Gutschein Einlösen"}
              </button>
              {couponError && (
                <p className="mt-2 text-red-500 text-sm">{couponError}</p>
              )}
            </div>
            <div className="space-y-4 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language == "en" ? "Subtotal" : "Zwischensumme"}
                </span>
                <span>{subtotal.toFixed(2).toString().replace(".", ",")}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language == "en" ? "Discount" : "Rabatt"}
                </span>
                <span className="text-[#C9A07B]">
                  -{discount.toFixed(2).toString().replace(".", ",")}€
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language == "en" ? "Delivery Fee" : "Liefergebühr"}
                </span>
                <span className="text-[#C9A07B]">
                  {language == "en" ? "Free" : "Gratis"}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-4">
              <span className="text-lg font-semibold">
                {language == "en" ? "Total" : "Gesamtbetrag"}
              </span>
              <span className="text-lg font-semibold">
                {total.toFixed(2).toString().replace(".", ",")}€
              </span>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">
                {language == "en" ? "Payment Method" : "Zahlungsart Auswählen"}
              </h4>
              <div className="space-y-2">
                <div
                  className={`p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-[#2E0A16]"
                      : "border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <p className="font-medium">
                    {language == "en" ? "Cash on Delivery" : "Nachnahme"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language == "en"
                      ? "Pay when you receive"
                      : "Barzahlung bei Lieferung"}
                  </p>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "pod"
                      ? "border-[#2E0A16]"
                      : "border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("pod")}
                >
                  <p className="font-medium">
                    {language == "en"
                      ? "Pay at the Counter"
                      : "Zahlung im Restaurant"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language == "en" ? "Store Pickup" : "Selbstabholung"}
                  </p>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "online"
                      ? "border-[#2E0A16]"
                      : "border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("online")}
                >
                  <p className="font-medium">
                    {language == "en" ? "Pay Online" : "Online Bezahlen"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language == "en"
                      ? "Secure payment gateway"
                      : "Sicheres Zahlungssystem"}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-6 bg-[#2E0A16] text-white py-3 rounded-lg font-semibold hover:bg-[#4a1627] disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handlePlaceOrder}
              disabled={processingOrder}
            >
              {processingOrder
                ? language == "en"
                  ? "Placing order..."
                  : "Bestellung aufgeben..."
                : language == "en"
                ? "Place Order"
                : "Jetzt Bestellen"}
            </button>
          </div>
        </div>
      </div>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-4">Delete Address</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this address? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-[#2E0A16] text-white rounded hover:bg-red-700"
              onClick={handleDeleteAddress}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Review;
