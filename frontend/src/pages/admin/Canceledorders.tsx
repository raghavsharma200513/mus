import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import axios from "axios";

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

interface Order {
  _id: string;
  address: { fullName: string };
  email: string;
  items: OrderItem[];
  orderTotal: number;
  paymentMethod: string;
}

const AcceptedOrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders initially and set up auto-refresh
  useEffect(() => {
    fetchOrders();

    // Set up interval for auto-refresh every minute
    const intervalId = setInterval(fetchOrders, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.post<Order[]>(
        import.meta.env.VITE_BACKEND_URL + "/api/orders/pendingOrders",
        {
          status: "cancelled",
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching orders");
        setLoading(false);
      }
    }
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
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="ml-2">
                        Add-ons:
                        {item.addOns.map((addOn) => (
                          <div key={addOn._id}>
                            - {addOn.quantity}x {addOn.name} (${addOn.price.toString().replace(".", ",")})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </td>
              <td className="p-4">${order.orderTotal.toFixed(2).toString().replace(".", ",")}</td>
              <td className="p-4">
                <span className="capitalize">{order.paymentMethod}</span>
              </td>
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <button className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    cancelled
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

export default AcceptedOrdersTable;
