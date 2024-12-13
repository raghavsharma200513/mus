import { assets } from "@/assets/assets";
import LanguageContext from "@/context/LanguageContext";
import { useContext } from "react";

function GiftCard() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;
  const voucher = (
    <div className="flex gap-6 flex-col ">
      <img src={assets.giftCard} alt="" className="w-[380px]" />
      <div className="flex flex-col items-start gap-4">
        <h3 className="text-[#2E0A16] text-3xl font-bold">
          {language == "en" ? "Gift Voucher" : "GUTSCHEIN"}
        </h3>
        <button
          className={
            "bg-aliceblue text-[#2e0a16] rounded-md border-2 border-[#2e0a16] px-5 py-2 hover:bg-[#2e0a16] hover:text-white"
          }
        >
          {language == "en" ? "ADD TO CART" : "IN DEN WARENKORB"}
        </button>
      </div>
    </div>
  );

  return (
    <main className="mb-24">
      <div className="page-title" id="page-title">
        <h1>{language == "en" ? "Gift Card" : "Geschenkkarte"}</h1>
        <h2>HOME / GIFT CARD</h2>
      </div>
      <div className="no-rec min-h-[calc(50vh)] flex-col text-[#554939] text-lg gap-8 font-jost font-medium flex items-center justify-center">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 items-center justify-center my-8 md:my-16">
            <h2 className="text-[#2e0a16] text-3xl md:text-4xl lg:text-5xl font-bold text-center">
              {language == "en"
                ? "Bring a smile today!"
                : "Schenken Sie heute ein Lächeln!"}
            </h2>

            <img
              src={assets.galBottom}
              alt="divider"
              className="w-[10rem] md:w-[15rem] my-4"
            />

            <p className="w-full md:w-[65%] text-center px-4">
              {language == "en"
                ? `With a gift voucher from Museum Restaurant you can make someone
              really happy. Choose a nice package or a fixed credit. The gift
              voucher can be redeemed online at the time of booking or at the
              restaurant. Is it someones birthday? Or graduation? Then choose
              the perfect moment to send the voucher!`
                : "Auf der Suche nach dem perfekten Geschenk? Unsere Geschenkkarten vom Museum Restaurant sind ideal für jede Feier. Ob für ein besonderes Ereignis oder eine spontane Überraschung – unsere Geschenkkarten sind die perfekte Möglichkeit, die Liebe zu köstlichem Essen zu teilen."}
            </p>
          </div>
          <div className="flex justify-center items-center gap-10 flex-wrap">
            {voucher}
            {voucher}
            {voucher}
            {voucher}
            {voucher}
            {voucher}
          </div>
        </div>
      </div>
    </main>
  );
}
export default GiftCard;
