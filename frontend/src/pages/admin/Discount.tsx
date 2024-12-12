import React, { useState, useEffect } from "react";

// Define interfaces for type safety
interface CouponData {
  code: string;
  discountPercentage: string;
  upperLimit: string;
  minimumOrderValue: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

interface Coupon extends CouponData {
  _id: string;
}

const DiscountCouponManagement: React.FC = () => {
  const [couponData, setCouponData] = useState<CouponData>({
    code: "",
    discountPercentage: "",
    upperLimit: "",
    minimumOrderValue: "",
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/discount/"
      );
      const data: Coupon[] = await response.json();
      console.log("data", data);

      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCouponData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = editingCoupon
        ? `${import.meta.env.VITE_BACKEND_URL}/api/discount/edit/${
            editingCoupon._id
          }`
        : import.meta.env.VITE_BACKEND_URL + "/api/discount/create";

      const method = editingCoupon ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      });

      if (response.ok) {
        fetchCoupons();
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save coupon:", error);
    }
  };

  const resetForm = () => {
    setCouponData({
      code: "",
      discountPercentage: "",
      upperLimit: "",
      minimumOrderValue: "",
      validFrom: "",
      validTo: "",
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      upperLimit: coupon.upperLimit,
      minimumOrderValue: coupon.minimumOrderValue,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
      isActive: coupon.isActive,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingCoupon ? "Edit Coupon" : "Create Coupon"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="code"
            value={couponData.code}
            onChange={handleInputChange}
            placeholder="Coupon Code"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            name="discountPercentage"
            type="number"
            value={couponData.discountPercentage}
            onChange={handleInputChange}
            placeholder="Discount Percentage"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            name="upperLimit"
            type="number"
            value={couponData.upperLimit}
            onChange={handleInputChange}
            placeholder="Maximum Discount Amount"
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            name="minimumOrderValue"
            type="number"
            value={couponData.minimumOrderValue}
            onChange={handleInputChange}
            placeholder="Minimum Order Value"
            className="w-full px-3 py-2 border rounded-md"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Valid From</label>
              <input
                name="validFrom"
                type="date"
                value={couponData.validFrom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2">Valid To</label>
              <input
                name="validTo"
                type="date"
                value={couponData.validTo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={couponData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
            <label>Is Active</label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            {editingCoupon ? "Update Coupon" : "Create Coupon"}
          </button>
          {editingCoupon && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full mt-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Existing Coupons</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Discount %</th>
                <th className="px-4 py-2 text-left">Valid Period</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b">
                  <td className="px-4 py-2">{coupon.code}</td>
                  <td className="px-4 py-2">{coupon.discountPercentage}%</td>
                  <td className="px-4 py-2">
                    {new Date(coupon.validFrom).toLocaleDateString()} -
                    {new Date(coupon.validTo).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiscountCouponManagement;
