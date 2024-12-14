import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../components/Modal";

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
  price: number;
  variants: { name: string }[];
  addOns: AddOn[];
}

interface Order {
  _id: string;
  address: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  email: string;
  phone: string;
  items: OrderItem[];
  orderTotal: number;
  subtotal: number;
  paymentMethod: string;
  paymentStatus?: string;
  status: string;
  createdAt: string;
}

const AllOrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 2000);

    return () => clearTimeout(delayDebounceFn); // Cleanup the timeout
  }, [search, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/orders/allOrders?page=${page}&limit=10&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch orders");
        setLoading(false);
      }
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
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
      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search by Order ID"
          className="border px-4 py-2 rounded"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left font-semibold">Order ID</th>
            <th className="p-4 text-left font-semibold">Customer</th>
            <th className="p-4 text-left font-semibold">Items</th>
            <th className="p-4 text-left font-semibold">Total</th>
            <th className="p-4 text-left font-semibold">Payment</th>
            <th className="p-4 text-center font-semibold">Details</th>
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
                            - {addOn.quantity}x {addOn.name} (€{addOn.price.toString().replace(".", ",")})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </td>
              <td className="p-4">€{order.orderTotal.toFixed(2).toString().replace(".", ",")}</td>
              <td className="p-4">
                <span className="capitalize">{order.paymentMethod}</span>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal for Viewing Order Details */}
      {selectedOrder && (
        <Modal
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          // className="max-w-xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Order #{selectedOrder._id.slice(-6)}
              </h2>
              <div className="flex flex-col items-end">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {selectedOrder.status.toUpperCase()}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Customer Details
                </h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.address.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.phone}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Shipping Address
                </h3>
                <p>{selectedOrder.address.addressLine1}</p>
                {selectedOrder.address.addressLine2 && (
                  <p>{selectedOrder.address.addressLine2}</p>
                )}
                <p>
                  {selectedOrder.address.city}, {selectedOrder.address.state}{" "}
                  {selectedOrder.address.zipCode}
                </p>
                <p>{selectedOrder.address.country}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
              {selectedOrder.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center border-b pb-2 mb-2 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">
                      {item.quantity}x {item.name} ({item.variants[0].name})
                    </p>
                    {item.addOns.length > 0 && (
                      <div className="ml-2">
                        Add-ons:
                        {item.addOns.map((addOn) => (
                          <div key={addOn._id}>
                            - {addOn.quantity}x {addOn.name} (€{addOn.price.toString().replace(".", ",")})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold">€{item.price.toString().replace(".", ",")}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Payment Details
                </h3>
                <p>
                  <strong>Method:</strong> {selectedOrder.paymentMethod}
                </p>
                {selectedOrder.paymentStatus && (
                  <p>
                    <strong>Status:</strong> {selectedOrder.paymentStatus}
                  </p>
                )}
              </div>

              <div className="text-right">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Order Summary
                </h3>
                <p>Subtotal: €{selectedOrder.subtotal.toString().replace(".", ",")}</p>
                <p>
                  Total:{" "}
                  <span className="text-xl font-bold text-green-600">
                    €{selectedOrder.orderTotal.toString().replace(".", ",")}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Print Invoice
              </button> */}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AllOrdersTable;
