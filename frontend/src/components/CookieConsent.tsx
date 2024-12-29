import { useState, useEffect } from "react";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem("cookieConsent");
    if (!cookieChoice) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="flex justify-center items-center">
      <div className="fixed bottom-4 sm:right-4 z-50 bg-white rounded-lg shadow-lg p-6 max-w-sm border border-gray-200 mx-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Cookie Settings</h2>
          <p className="text-gray-600 text-sm">
            We use cookies to enhance your browsing experience and analyze our
            traffic. Please choose whether you would like to accept cookies.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2E0A16] rounded hover:bg-[#2E0A16] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
