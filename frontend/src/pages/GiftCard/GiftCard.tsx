import { assets } from "@/assets/assets";

function GiftCard() {
  const voucher = (
    <div className="flex gap-6 flex-col ">
      <img src={assets.giftCard} alt="" className="w-[380px]" />
      <div className="flex flex-col items-start gap-4">
        <h3 className="text-[#2E0A16] text-3xl font-bold">Gift voucher</h3>
        <button
          className={
            "bg-aliceblue text-[#2e0a16] rounded-md border-2 border-[#2e0a16] px-5 py-2 hover:bg-[#2e0a16] hover:text-white"
          }
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );

  return (
    <main className="mb-24">
      <div className="page-title" id="page-title">
        <h1>Gift Card</h1>
        <h2>HOME / GIFT CARD</h2>
      </div>
      <div className="no-rec min-h-[calc(50vh)] flex-col text-[#554939] text-lg gap-8 font-jost font-medium flex items-center justify-center">
        <div className="flex flex-col gap-4">
          <div className="flex gap-6 flex-col items-center justify-center my-16">
            <h2 className="text-[#2e0a16] text-5xl font-bold">
              Bring a smile today!
            </h2>
            <img src={assets.galBottom} alt={`divider`} className="w-[15rem]" />
            <p className="w-[65%] text-center">
              With a gift voucher from Museum Restaurant you can make someone
              really happy. Choose a nice package or a fixed credit. The gift
              voucher can be redeemed online at the time of booking or at the
              restaurant. Is it someones birthday? Or graduation? Then choose
              the perfect moment to send the voucher!
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
