import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

// Define TypeScript interfaces for the orders and selected order
interface Order {
  _id: string;
  status: string;
  orderTotal: number;
  createdAt: string;
  paymentMethod: string;
  address: {
    fullName: string;
  };
  phone: string;
  items: {
    _id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/orders/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    // navigate("/");
    window.location.href = "/";
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Orders</h1>

      {/* Orders list */}
      <div className="space-y-6">
        {currentOrders.map((order) => (
          <div
            key={order._id}
            className="cursor-pointer border rounded-lg p-5 shadow-md hover:shadow-lg transition-all bg-white"
            onClick={() => handleOrderClick(order)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">Order ID: {order._id}</p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={`capitalize ${
                      order.status === "delivered"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
                <p className="font-semibold">Total: €{order.orderTotal}</p>
              </div>
              <div className="text-right text-gray-500">
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="font-semibold">
                  Payment: {order.paymentMethod.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Logout Button */}
      <div className="mt-10 text-center">
        <button
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <dialog
          className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          open
        >
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-semibold">Order ID:</p>
                <p className="text-gray-700">{selectedOrder._id}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p className="capitalize">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="font-semibold">Customer:</p>
                <p>{selectedOrder.address.fullName}</p>
              </div>
              <div>
                <p className="font-semibold">Contact:</p>
                <p>{selectedOrder.phone}</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Items:</h3>
              {selectedOrder.items.map((item) => (
                <div
                  key={item._id}
                  className="border-b py-2 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: €{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <p className="font-semibold">
                Total: €{selectedOrder.orderTotal}
              </p>
              <button
                className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default OrdersList;
