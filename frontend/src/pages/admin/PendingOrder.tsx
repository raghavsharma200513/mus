import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

// Import a sound file (you'll need to add this to your project)
// Note: Replace with your actual path to the notification sound
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

const PendingOrdersTable: React.FC = () => {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  console.log("orders", orders);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking orders and audio
  const previousOrdersRef = useRef<Order[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch orders initially and set up auto-refresh
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(notificationSound);

    fetchOrders();

    // Set up interval for auto-refresh every minute
    const intervalId = setInterval(fetchOrders, 20 * 1000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
      // Stop any ongoing sound
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Compare orders and play sound if new orders arrive
  useEffect(() => {
    // Check if there are new orders
    const isNewOrder =
      orders.length > previousOrdersRef.current.length ||
      (orders.length > 0 &&
        orders[0]._id !== previousOrdersRef.current[0]?._id);

    if (isNewOrder) {
      playNotificationSound();
    }

    // Update previous orders
    previousOrdersRef.current = orders;
  }, [orders]);

  // Play notification sound when new orders arrive
  const playNotificationSound = () => {
    // Stop any existing interval
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
    }

    // Play sound repeatedly until action is taken
    const playSound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    };

    // Initial play
    playSound();

    // Set up interval to repeat sound
    soundIntervalRef.current = setInterval(playSound, 3000);
  };

  // Stop notification sound when order is acted upon
  const stopNotificationSound = () => {
    // Stop sound interval
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }

    // Pause audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Fetch pending orders
  const fetchOrders = async () => {
    try {
      const { data } = await axios.post<Order[]>(
        import.meta.env.VITE_BACKEND_URL + "/api/orders/pendingOrders",
        {
          status: "pending",
        },
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

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await axios.put(
        import.meta.env.VITE_BACKEND_URL + "/api/orders/updateStatus",
        {
          orderId,
          status,
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

      // Stop notification sound when order is acted upon
      stopNotificationSound();

      // Refresh orders after status update
      await fetchOrders();
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || "An error occurred while updating the order status"
        );
      }
    }
  };

  // Handle order acceptance
  const handleAccept = async (orderId: string) => {
    await updateOrderStatus(orderId, "accepted");
  };

  // Handle order cancellation
  const handleCancel = async (orderId: string) => {
    await updateOrderStatus(orderId, "cancelled");
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading orders...
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Render orders table
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
                    {/* <span>{index}.</span><br /> */}
                    <b>
                      {item.quantity}x {item.name} ({item.variants[0].name})
                    </b>
                    {item.addOns.length > 0 && (
                      <div className="ml-2">
                        Add-ons:
                        {item.addOns.map((addOn) => (
                          <div key={addOn._id}>
                            - {addOn.quantity}x {addOn.name} (${addOn.price})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </td>
              <td className="p-4">${order.orderTotal.toFixed(2)}</td>
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
                    onClick={() => handleCancel(order._id)}
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
    </div>
  );
};

export default PendingOrdersTable;
