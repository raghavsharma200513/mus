import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import LanguageContext from "@/context/LanguageContext";
import { useContext } from "react";

const GiftCardConfirmation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [giftCardDetails, setGiftCardDetails] = useState<any>(null);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const location = useLocation();
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }

  const { language } = context;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const giftCardId = queryParams.get("gid");
    const paymentId = queryParams.get("paymentId");
    const payerId = queryParams.get("PayerID");

    const verifyPayment = async () => {
      setPaymentVerifying(true);
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/giftcard/verify`,
          {
            paymentId,
            payerId,
            giftCardId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token ? token : ""}`,
            },
          }
        );
        // After successful payment verification, fetch gift card details
        fetchGiftCardDetails(giftCardId);
      } catch (err) {
        console.error("Payment verification failed:", err);
        setError("Payment verification failed. Please contact support.");
        setLoading(false);
      } finally {
        setPaymentVerifying(false);
      }
    };

    const fetchGiftCardDetails = async (giftCardId: string | null) => {
      try {
        if (!giftCardId) {
          setError("Gift card ID not found");
          setLoading(false);
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/giftcard/${giftCardId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setGiftCardDetails(data);
      } catch (err) {
        setError("Failed to fetch gift card details");
        console.error("Error fetching gift card details:", err);
      } finally {
        setLoading(false);
      }
    };

    // First check if we need to verify payment
    if (paymentId && payerId && giftCardId) {
      verifyPayment();
    } else {
      // If no payment to verify, just fetch gift card details
      fetchGiftCardDetails(giftCardId);
    }
  }, [location]);

  if (loading || paymentVerifying) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-xl">
          {language === "en" ? "Processing..." : "Verarbeitung..."}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <main className="mb-24">
      <div className="page-title" id="page-title">
        <h1>
          {language === "en"
            ? "Gift Card Confirmation"
            : "Geschenkkarten Bestätigung"}
        </h1>
        <h2>HOME / GIFT CARD / CONFIRMATION</h2>
      </div>
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#2E0A16]">
            {language === "en"
              ? "Thank You for Your Purchase!"
              : "Vielen Dank für Ihren Einkauf!"}
          </h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="font-medium">
                {language === "en" ? "Gift Card Code:" : "Geschenkkarten-Code:"}
              </p>
              <p className="text-lg">{giftCardDetails?.code}</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-medium">
                {language === "en" ? "Amount:" : "Betrag:"}
              </p>
              <p className="text-lg">€{giftCardDetails?.amount}</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-medium">
                {language === "en" ? "Recipient Email:" : "Empfänger Email:"}
              </p>
              <p className="text-lg">{giftCardDetails?.recipientEmail}</p>
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              {language === "en"
                ? "A confirmation email has been sent to the recipient with the gift card details."
                : "Eine Bestätigungs-E-Mail wurde an den Empfänger mit den Geschenkkarten-Details gesendet."}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GiftCardConfirmation;
