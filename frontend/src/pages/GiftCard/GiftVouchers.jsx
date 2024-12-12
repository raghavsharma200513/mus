import React from "react";
import { assets } from "@/assets/assets";

const GiftVouchers = () => {
  const vouchers = [
    { price: "30$", title: "Museum", location: "Potsdamer Platz" },
    { price: "1000$", title: "Museum", location: "Potsdamer Platz" },
    { price: "200$", title: "Museum", location: "Potsdamer Platz" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex flex-wrap justify-center gap-8 p-6">
      {vouchers.map((voucher, index) => (
        <div
          key={index}
          className="flex flex-col items-center bg-white shadow-lg rounded-md w-72 p-4"
        >
          <img src={assets} alt="" className="w-20" />
          <div className="p-4 text-center">
            <h4 className="text-lg font-medium">Gift Voucher</h4>
            <button className="mt-2 px-4 py-2 bg-burgundy text-black rounded hover:bg-burgundy-dark transition">
              Buy Voucher
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GiftVouchers;
