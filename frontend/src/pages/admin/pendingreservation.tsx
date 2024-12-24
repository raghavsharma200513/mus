import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

interface Reservation {
  _id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  numberOfGuests: number;
  status: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalReservations: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ReservationResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    reservations: Reservation[];
  };
}

const CANCELLATION_REASONS = [
  { id: "fully-booked", label: "Fully booked" },
  { id: "outside-hours", label: "Outside operating hours" },
  { id: "incorrect-details", label: "Incorrect reservation details" },
  { id: "date-unavailable", label: "Specific date/time unavailable" },
  {
    id: "restaurant-closed",
    label: "Restaurant closed (holiday, maintenance, etc.)",
  },
  { id: "large-party", label: "Large party size cannot be accommodated" },
  { id: "other", label: "Other" },
];

const ReservationTable = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(
    null
  );
  const [cancelReason, setCancelReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalReservations: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch reservations with pagination
  const fetchReservations = async (page: number = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.post<ReservationResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/api/reservation/get`,
        {
          status: "pending",
        },
        {
          params: {
            page,
            limit: 10,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setReservations(data.data.reservations);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || "An error occurred while fetching reservations"
        );
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    fetchReservations(newPage);
  };

  const handleAccept = async (reservationId: string) => {
    await updateReservationStatus(reservationId, "accepted");
  };

  const handleCancelClick = (reservationId: string) => {
    setSelectedReservation(reservationId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedReservation) return;

    const finalReason =
      cancelReason === "other"
        ? customReason
        : CANCELLATION_REASONS.find((r) => r.id === cancelReason)?.label || "";

    await updateReservationStatus(
      selectedReservation,
      "cancelled",
      finalReason
    );
    setShowCancelModal(false);
    setSelectedReservation(null);
    setCancelReason("");
    setCustomReason("");
  };

  // Update reservation status
  const updateReservationStatus = async (
    reservationId: string,
    status: string,
    reason?: string
  ) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reservation/${reservationId}`,
        {
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
          response.data.message || "Failed to update reservation status"
        );
      }

      await fetchReservations(pagination.currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message ||
            "An error occurred while updating the reservation status"
        );
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Cancel Modal Component
  const CancelModal = () => {
    if (!showCancelModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Cancel Reservation</h2>
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

  // Pagination Controls Component
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalReservations
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium">{pagination.totalReservations}</span>{" "}
            results
          </p>
        </div>
        <div>
          <nav
            className="inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                  pagination.currentPage === index + 1
                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                    : "border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading reservations...
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
            <th className="p-4 text-left font-semibold">Guest Name</th>
            <th className="p-4 text-left font-semibold">Contact</th>
            <th className="p-4 text-left font-semibold">Date</th>
            <th className="p-4 text-left font-semibold">Time</th>
            <th className="p-4 text-left font-semibold">Guests</th>
            <th className="p-4 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation._id} className="border-t border-gray-200">
              <td className="p-4">{reservation.name}</td>
              <td className="p-4">
                <div>{reservation.phone}</div>
                <div className="text-sm text-gray-500">{reservation.email}</div>
              </td>
              <td className="p-4">{formatDate(reservation.date)}</td>
              <td className="p-4">{reservation.time}</td>
              <td className="p-4">{reservation.numberOfGuests}</td>
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleAccept(reservation._id)}
                    className="flex items-center px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleCancelClick(reservation._id)}
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
      <PaginationControls />
      <CancelModal />
    </div>
  );
};

export default ReservationTable;
