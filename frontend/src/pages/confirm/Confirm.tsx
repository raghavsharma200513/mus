import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import LanguageContext from "@/context/LanguageContext";

interface OrderAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  variants: Array<{
    _id: string;
    name: string;
    price: number;
  }>;
  addOns: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number | string;
  }>;
}

interface OrderDetails {
  _id: string;
  status: string;
  items: OrderItem[];
  address: OrderAddress;
  orderTotal: number;
  subtotal: number;
  discount: string;
  couponCode: string;
  paymentMethod: string;
  createdAt: string;
}

const OrderConfirmation: React.FC = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  // console.log("orderDetails", orderDetails);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const location = useLocation();
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("oid");
    const paymentId = queryParams.get("paymentId");
    const payerId = queryParams.get("PayerID");

    const verifyPayment = async () => {
      setPaymentVerifying(true);
      try {
        await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/api/orders/verify",
          {
            paymentId,
            payerId,
            orderId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // After successful payment verification, fetch order details
        fetchOrderDetails(orderId);
      } catch (err) {
        console.error("Payment verification failed:", err);
        setError("Payment verification failed. Please contact support.");
        setLoading(false);
      } finally {
        setPaymentVerifying(false);
      }
    };

    const fetchOrderDetails = async (orderId: string | null) => {
      try {
        if (!orderId) {
          setError("Order ID not found");
          setLoading(false);
          return;
        }

        const { data } = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/api/orders/by-id",
          { orderId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOrderDetails(data);
      } catch (err) {
        setError("Failed to fetch order details");
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    // First check if we need to verify payment
    if (paymentId && payerId && orderId) {
      verifyPayment();
    } else {
      // If no payment to verify, just fetch order details
      fetchOrderDetails(orderId);
    }
  }, [location]);

  if (loading || paymentVerifying) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          {paymentVerifying
            ? "Verifying payment..."
            : "Loading order details..."}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">No order details found</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2E0A16] mb-2">
            {language == "en"
              ? "Order Confirmed!"
              : "Vielen Dank für Ihre Bestellung!"}
          </h1>
          <p className="text-gray-600">
            {language == "en"
              ? "Thank you for your order. We'll send updates about your order to your email."
              : "Wir haben Ihre Bestellung erhalten und bearbeiten diese gerade. Sie erhalten Updates zu Ihrer Bestellung per E-Mail."}
          </p>
        </div>

        <div className="space-y-6">
          {/* Rest of your existing JSX remains exactly the same */}
          {/* Order Status and Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">
              {language == "en"
                ? "Order Details"
                : "Informationen zur Bestellung"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  {language == "en" ? "Order ID" : "Bestellnummer"}
                </p>
                <p className="font-medium">{orderDetails._id}</p>
              </div>
              <div>
                <p className="text-gray-600">
                  {language == "en" ? "Order Date" : "Bestelleingang"}
                </p>
                <p className="font-medium">
                  {formatDate(orderDetails.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  {language == "en" ? "Status" : "Status"}
                </p>
                <p className="font-medium capitalize">{orderDetails.status}</p>
              </div>
              <div>
                <p className="text-gray-600">
                  {language == "en" ? "Payment Method" : "Zahlungsart"}
                </p>
                <p className="font-medium">
                  {orderDetails.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : orderDetails.paymentMethod === "pod"
                    ? "Pay on Counter"
                    : "Online Payment"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">
              {language == "en" ? " Order Items" : "Artikel"}
            </h2>
            <div className="space-y-4">
              {orderDetails.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.variants[0].name} × {item.quantity}
                    </p>
                    {item.addOns.length > 0 && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">Add-ons:</p>
                        <ul className="text-sm text-gray-600">
                          {item.addOns.map((addon) => (
                            <li className="ml-2" key={addon._id}>
                              {addon.name} ({addon.price}€) X {addon.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <p className="font-medium">
                    {(
                      (item.variants[0].price +
                        item.addOns.reduce(
                          (sum, addOns) => sum + addOns.price,
                          0
                        )) *
                      item.quantity
                    ).toFixed(2)}
                    €
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">
              {language == "en" ? "Delivery Address" : "Lieferadresse"}
            </h2>
            <div>
              <p className="font-medium">{orderDetails.address.fullName}</p>
              <p>{orderDetails.address.phone}</p>
              <p>{orderDetails.address.addressLine1}</p>
              {orderDetails.address.addressLine2 && (
                <p>{orderDetails.address.addressLine2}</p>
              )}
              <p>
                {orderDetails.address.city}, {orderDetails.address.state} -{" "}
                {orderDetails.address.zipCode}
              </p>
              <p>{orderDetails.address.country}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {language == "en" ? " Payment Summary" : "Zahlungsübersicht"}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language == "en" ? "Subtotal" : "Zwischensumme"}
                </span>
                <span>{orderDetails.subtotal}€</span>
              </div>
              {Number(orderDetails.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language == "en" ? "Discount" : "Rabatt"}
                  </span>
                  <span className="text-[#C9A07B]">
                    -{orderDetails.discount}€
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {language == "en" ? "Delivery Fee" : "Liefergebühr"}
                </span>
                <span className="text-[#C9A07B]">
                  {language == "en" ? "Free" : "Gratis"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>{language == "en" ? "Total" : "Gesamtbetrag"}</span>
                <span>{orderDetails.orderTotal}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
