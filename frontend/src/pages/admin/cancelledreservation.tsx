import { useState, useEffect } from "react";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
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

const ReservationTable = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
          status: "cancelled",
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
    } catch (err: unknown) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                    className="flex items-center px-3 py-1 text-sm text-white bg-red-600  rounded"
                    disabled={true}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    cancelled
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls />
    </div>
  );
};

export default ReservationTable;
