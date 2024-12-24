import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import notificationSound from "../../assets/mixkit-arabian-mystery-harp-notification-2489.wav";

// TypeScript interfaces for type safety
interface AddOn {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  variants: { name: string }[];
  addOns: AddOn[];
}

interface OrderAddress {
  fullName: string;
}

interface Order {
  _id: string;
  address: OrderAddress;
  email: string;
  items: OrderItem[];
  orderTotal: number;
  paymentMethod: string;
}

const CANCELLATION_REASONS = [
  { id: "out-of-stock", label: "Out of stock" },
  {
    id: "delivery-location",
    label: "Unable to deliver to the provided location",
  },
  {
    id: "restaurant-closed",
    label: "Restaurant closed (holiday, maintenance, etc.)",
  },
  { id: "incorrect-details", label: "Incorrect order details" },
  { id: "customer-request", label: "Customer requested cancellation" },
  { id: "delay", label: "Delay in preparation or delivery" },
  { id: "other", label: "Other" },
];

const PendingOrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  // Refs for tracking orders and audio
  const previousOrdersRef = useRef<Order[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 20 * 1000);

    return () => {
      clearInterval(intervalId);
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    const isNewOrder =
      orders.length > previousOrdersRef.current.length ||
      (orders.length > 0 &&
        orders[0]._id !== previousOrdersRef.current[0]?._id);

    if (isNewOrder) {
      playNotificationSound();
    }

    previousOrdersRef.current = orders;
  }, [orders]);

  const playNotificationSound = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
    }

    const playSound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    };

    playSound();
    soundIntervalRef.current = setInterval(playSound, 3000);
  };

  const stopNotificationSound = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.post<Order[]>(
        import.meta.env.VITE_BACKEND_URL + "/api/orders/pendingOrders",
        { status: "pending" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching orders");
        setLoading(false);
      }
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    reason?: string
  ) => {
    try {
      const response = await axios.put(
        import.meta.env.VITE_BACKEND_URL + "/api/orders/updateStatus",
        {
          orderId,
          status,
          cancellationReason: reason,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(
          response.data.message || "Failed to update order status"
        );
      }

      stopNotificationSound();
      await fetchOrders();
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || "An error occurred while updating the order status"
        );
      }
    }
  };

  const handleAccept = async (orderId: string) => {
    await updateOrderStatus(orderId, "accepted");
  };

  const handleCancelClick = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder) return;

    const finalReason =
      cancelReason === "other"
        ? customReason
        : CANCELLATION_REASONS.find((r) => r.id === cancelReason)?.label || "";

    await updateOrderStatus(selectedOrder, "cancelled", finalReason);
    setShowCancelModal(false);
    setSelectedOrder(null);
    setCancelReason("");
    setCustomReason("");
  };

  // Cancel Modal Component
  const CancelModal = () => {
    if (!showCancelModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Cancel Order</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Cancellation
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a reason</option>
              {CANCELLATION_REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {cancelReason === "other" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Reason
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter custom reason..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Close
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={
                !cancelReason || (cancelReason === "other" && !customReason)
              }
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left font-semibold">Order ID</th>
            <th className="p-4 text-left font-semibold">Customer</th>
            <th className="p-4 text-left font-semibold">Items</th>
            <th className="p-4 text-left font-semibold">Total</th>
            <th className="p-4 text-left font-semibold">Payment</th>
            <th className="p-4 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t border-gray-200">
              <td className="p-4">{order._id}</td>
              <td className="p-4">
                <div>{order.address?.fullName}</div>
                <div className="text-sm text-gray-500">{order.email}</div>
              </td>
              <td className="p-4">
                {order.items.map((item) => (
                  <div key={item._id}>
                    <b>
                      {item.quantity}x {item.name} ({item.variants[0].name})
                    </b>
                    {item.addOns.length > 0 && (
                      <div className="ml-2">
                        Add-ons:
                        {item.addOns.map((addOn) => (
                          <div key={addOn._id}>
                            - {addOn.quantity}x {addOn.name} ($
                            {addOn.price.toString().replace(".", ",")})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </td>
              <td className="p-4">
                ${order.orderTotal.toFixed(2).toString().replace(".", ",")}
              </td>
              <td className="p-4">
                <span className="capitalize">{order.paymentMethod}</span>
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleAccept(order._id)}
                    className="flex items-center px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleCancelClick(order._id)}
                    className="flex items-center px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
                    disabled={loading}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CancelModal />
    </div>
  );
};

export default PendingOrdersTable;
