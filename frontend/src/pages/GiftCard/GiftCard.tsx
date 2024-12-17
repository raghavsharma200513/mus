import { useState } from "react";
import { assets } from "@/assets/assets";
import LanguageContext from "@/context/LanguageContext";
import { useContext } from "react";
import Modal from "../../components/Modal";
import axios from "axios";

const GiftCard = () => {
  const context = useContext(LanguageContext);
  const [selectedAmount, setSelectedAmount] = useState<number | string>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }

  const { language } = context;

  const handleBuyNow = async () => {
    // Validate amount is a whole number
    const amount =
      typeof selectedAmount === "string"
        ? parseInt(selectedAmount, 10)
        : selectedAmount;

    if (!Number.isInteger(amount) || amount <= 0) {
      alert(
        language === "en"
          ? "Please enter a valid whole number amount in euros"
          : "Bitte geben Sie einen gültigen ganzzahligen Betrag in Euro ein"
      );
      return;
    }

    if (!recipientEmail) {
      alert(
        language === "en"
          ? "Please enter recipient email"
          : "Bitte geben Sie die E-Mail des Empfängers ein"
      );
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/giftcard/create`,
        {
          recipientEmail,
          amount: amount,
          message,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const approvalUrl = data.links.find(
        (link: { rel: string }) => link.rel === "approval_url"
      );

      if (approvalUrl) {
        window.location.href = approvalUrl.href;
      }
    } catch (error) {
      console.error("Error creating gift card:", error);
      alert(
        language === "en"
          ? "Failed to create gift card. Please try again."
          : "Geschenkkarte konnte nicht erstellt werden. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const StandardGiftCardItem = ({ amount }: { amount: number }) => (
    <div className="flex gap-6 flex-col">
      <img src={assets.giftCard} alt="" className="w-[380px]" />
      <div className="flex flex-col items-start gap-4">
        <h3 className="text-[#2E0A16] text-3xl font-bold">
          {language === "en" ? `${amount}€ Gift Card` : `${amount}€ GUTSCHEIN`}
        </h3>
        <button
          onClick={() => {
            setSelectedAmount(amount);
            setIsCustomAmount(false);
            setIsModalOpen(true);
          }}
          className="bg-aliceblue text-[#2e0a16] rounded-md border-2 border-[#2e0a16] px-5 py-2 hover:bg-[#2e0a16] hover:text-white"
        >
          {language === "en" ? "BUY NOW" : "JETZT KAUFEN"}
        </button>
      </div>
    </div>
  );

  return (
    <main className="mb-24">
      <div className="page-title" id="page-title">
        <h1>{language === "en" ? "Gift Card" : "Geschenkkarte"}</h1>
        <h2>HOME / GIFT CARD</h2>
      </div>
      <div className="no-rec min-h-[calc(50vh)] flex-col text-[#554939] text-lg gap-8 font-jost font-medium flex items-center justify-center">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 items-center justify-center my-8 md:my-16">
            <h2 className="text-[#2e0a16] text-3xl md:text-4xl lg:text-5xl font-bold text-center">
              {language === "en"
                ? "Bring a smile today!"
                : "Schenken Sie heute ein Lächeln!"}
            </h2>

            <img
              src={assets.galBottom}
              alt="divider"
              className="w-[10rem] md:w-[15rem] my-4"
            />

            <p className="w-full md:w-[65%] text-center px-4">
              {language === "en"
                ? `With a gift voucher from Museum Restaurant you can make someone
                really happy. Choose a nice package or a fixed credit. The gift
                voucher can be redeemed online at the time of booking or at the
                restaurant.`
                : "Auf der Suche nach dem perfekten Geschenk? Unsere Geschenkkarten vom Museum Restaurant sind ideal für jede Feier."}
            </p>
          </div>
          <div className="flex justify-center items-center gap-10 flex-wrap">
            <div className="flex gap-6 flex-col">
              <img src={assets.giftCard} alt="" className="w-[380px]" />
              <div className="flex flex-col items-start gap-4">
                <h3 className="text-[#2E0A16] text-3xl font-bold">
                  {language === "en" ? "Custom Amount" : "Individueller Betrag"}
                </h3>
                <button
                  onClick={() => {
                    setSelectedAmount("");
                    setIsCustomAmount(true);
                    setIsModalOpen(true);
                  }}
                  className="bg-aliceblue text-[#2e0a16] rounded-md border-2 border-[#2e0a16] px-5 py-2 hover:bg-[#2e0a16] hover:text-white"
                >
                  {language === "en" ? "CHOOSE AMOUNT" : "BETRAG WÄHLEN"}
                </button>
              </div>
            </div>
            <StandardGiftCardItem amount={5} />
            <StandardGiftCardItem amount={10} />
            <StandardGiftCardItem amount={15} />
            <StandardGiftCardItem amount={20} />
            <StandardGiftCardItem amount={25} />

            {/* Custom Amount Option */}
          </div>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg w-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold mb-4">
              {language === "en"
                ? "Gift Card Details"
                : "Geschenkkarten Details"}
            </h2>
            <button
              className="w-4 md:w-5 h-4 md:h-5"
              onClick={() => setIsModalOpen(false)}
              disabled={isProcessing}
            >
              <img
                src={assets.crossIcon}
                alt="close"
                className="w-full h-full"
              />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {isCustomAmount ? (
              <input
                type="text"
                placeholder={
                  language === "en"
                    ? "Enter Custom Amount (€)"
                    : "Individuellen Betrag eingeben (€)"
                }
                className="border p-2 rounded"
                value={selectedAmount}
                onChange={(e) => {
                  // Only allow whole numbers
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setSelectedAmount(value);
                }}
                inputMode="numeric"
              />
            ) : (
              <div className="text-lg font-bold">
                {language === "en"
                  ? `Gift Card Amount: ${selectedAmount}€`
                  : `Geschenkkarten Betrag: ${selectedAmount}€`}
              </div>
            )}
            <input
              type="email"
              placeholder={
                language === "en" ? "Recipient Email" : "Empfänger Email"
              }
              className="border p-2 rounded"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <textarea
              placeholder={
                language === "en"
                  ? "Gift Message (Optional)"
                  : "Geschenknachricht (Optional)"
              }
              className="border p-2 rounded"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={handleBuyNow}
              disabled={isProcessing}
              className="bg-[#2e0a16] text-white py-2 rounded hover:bg-[#4a1024]"
            >
              {isProcessing
                ? language === "en"
                  ? "Processing..."
                  : "Verarbeitung..."
                : language === "en"
                ? "Buy Now"
                : "Jetzt Kaufen"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default GiftCard;
