import { useEffect, useState } from "react";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/api/message",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch messages.");
        }

        const data = await response.json();
        setMessages(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>

      {loading ? (
        <p className="text-center text-lg">Loading messages...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-gray-500">No messages found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left">
                Email
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left">
                Phone
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map(({ _id, name, email, phone, message }) => (
              <tr key={_id}>
                <td className="border border-gray-200 px-4 py-2">{name}</td>
                <td className="border border-gray-200 px-4 py-2">{email}</td>
                <td className="border border-gray-200 px-4 py-2">{phone}</td>
                <td className="border border-gray-200 px-4 py-2">{message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default Messages;
