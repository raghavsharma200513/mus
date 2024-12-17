import { useState, useEffect, useContext } from "react";
import { assets } from "@/assets/assets";
import { useNavigate } from "react-router-dom";
import LanguageContext from "@/context/LanguageContext";

interface AddOn {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Variant {
  name: string;
  price: number;
}
interface category {
  image: string;
}

interface Item {
  name: string;
  price: number;
  image: string;
  category: category;
}

interface CartItem {
  _id: string;
  menuItem: Item;
  variant: Variant;
  quantity: number;
  addOns: AddOn[];
}

interface CartData {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<CartData | null>(null);
  console.log("cartData", cartData);
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;
  // const imageUrl = data.image
  //   ? `${import.meta.env.VITE_BACKEND_URL}${data.image}`
  //   : assets.menu5;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/cart/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch cart data");
      const data = await response.json();
      setCartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!cartData || newQuantity < 0) return;
    setUpdating(itemId);

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/cart/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ itemId, quantity: newQuantity }),
        }
      );

      if (!response.ok) throw new Error("Failed to update quantity");
      await fetchCartData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update quantity"
      );
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!cartData) return;
    setUpdating(itemId);

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/cart/remove",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ itemId }),
        }
      );

      if (!response.ok) throw new Error("Failed to remove item");
      await fetchCartData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    if (!cartData) return { subtotal: 0, discount: 0, total: 0 };

    const subtotal = cartData.totalAmount;
    const discount = 0;

    // if (appliedCoupon) {
    //   discount = Math.min(
    //     (subtotal * appliedCoupon.discountPercentage) / 100,
    //     appliedCoupon.upperLimit
    //   );
    // }

    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculateTotal();

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!cartData)
    return <div className="text-center py-10">No items in cart</div>;

  return (
    <main className="mb-24 px-4 md:px-8 lg:px-0">
      <div className="page-title mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold">
          {language == "en" ? "Cart" : "Warenkorb"}
        </h1>
        <h2 className="text-sm md:text-base text-gray-500">
          HOME / CART
          {/* {language == "en" ? "Items" : "Artikel"} */}
        </h2>
      </div>

      <div className="flex flex-col mx-auto max-w-7xl">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 md:mb-10">
          {language == "en" ? "Cart" : "In Ihrem Warenkorb"}{" "}
          <span className="text-lg md:text-xl lg:text-2xl text-[#C9A07B]">
            ({cartData.items.length} {language == "en" ? "Items" : "Artikel"})
          </span>
        </h2>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="flex-1 space-y-6">
            {cartData.items.map((item) => {
              // console.log("item", item);

              const imageUrl = item.menuItem.image
                ? `${import.meta.env.VITE_BACKEND_URL}${item.menuItem.image}`
                : item.menuItem.category.image
                ? `${import.meta.env.VITE_BACKEND_URL}${
                    item.menuItem.category.image
                  }`
                : assets.menu5;
              // console.log("imageUrl", imageUrl);

              return (
                <div
                  key={item._id}
                  className="flex flex-col md:flex-row gap-4 border-b pb-6"
                >
                  <img
                    src={imageUrl}
                    alt={`Menu Item ${item.menuItem.name}`}
                    className="w-full md:w-32 lg:w-40 h-32 lg:h-40 object-cover rounded-lg"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-sm md:text-base text-gray-500 mb-2">
                        Variant:{" "}
                        <span className="text-black">{item.variant.name}</span>
                      </p>
                      <div className="space-y-1">
                        {item.addOns.map((addOn) => (
                          <p key={addOn._id} className="text-sm text-gray-600">
                            {addOn.name} (×{addOn.quantity}) -{" "}
                            {addOn.price.toString().replace(".", ",")}€
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center mt-4 gap-4">
                      <div className="inline-flex items-center border rounded-full px-4 py-2">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-lg"
                          disabled={updating === item._id}
                        >
                          -
                        </button>
                        <span className="mx-4 font-semibold">
                          {updating === item._id ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-lg"
                          disabled={updating === item._id}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-red-500 text-sm md:text-base font-medium"
                        onClick={() => removeItem(item._id)}
                        disabled={updating === item._id}
                      >
                        {updating === item._id
                          ? language == "en"
                            ? "Removing..."
                            : "Entfernen..."
                          : language == "en"
                          ? "Remove"
                          : "Entfernen"}
                      </button>
                      <span className="ml-auto text-lg font-bold">
                        {
                          // First calculate price for single item with add-ons
                          (
                            (item.variant.price +
                              item.addOns.reduce(
                                (sum, addon) =>
                                  sum + addon.price * addon.quantity,
                                0
                              )) *
                            // Then multiply by item quantity
                            item.quantity
                          )
                            .toFixed(2)
                            .toString()
                            .replace(".", ",")
                        }
                        €
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full lg:w-[465px] bg-white rounded-lg p-6 md:p-8 border-2 border-[#E5E5E5]">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              {language == "en" ? "Order Summary" : "Warenkorbübersicht"}
            </h2>

            <div className="space-y-4 border-b border-dashed pb-4">
              <div className="flex justify-between text-[#554539]">
                <span>{language == "en" ? "Price" : "Zwischensumme"}</span>
                <span className="font-semibold">
                  {subtotal.toFixed(2).toString().replace(".", ",")}€
                </span>
              </div>
              <div className="flex justify-between text-[#554539]">
                <span>{language == "en" ? "Discount" : "Rabatt"}</span>
                <span className="font-semibold text-green-600">
                  -{discount.toFixed(2).toString().replace(".", ",")}€
                </span>
              </div>
              <div className="flex justify-between text-[#554539]">
                <span>{language == "en" ? "Shipping" : "Liefergebühr"}</span>
                <span className="font-semibold text-[#C9A07B]">
                  {language == "en" ? "Free" : "Gratis"}
                </span>
              </div>
            </div>

            {/* <div className="mt-6">
              <label
                htmlFor="coupon"
                className="block text-lg font-medium mb-2"
              >
                Have a Coupon?
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border rounded-lg text-sm"
                  disabled={applyingCoupon}
                />
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon}
                  className="bg-aliceblue text-[#2e0a16] rounded-lg border-2 border-[#2e0a16] px-5 py-2 hover:bg-[#2e0a16] hover:text-white whitespace-nowrap text-sm font-medium"
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-sm mt-2">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="text-green-600 text-sm mt-2">
                  Coupon {appliedCoupon.code} applied successfully!
                </p>
              )}
            </div> */}

            <div className="border-t mt-6 pt-4 flex justify-between items-center">
              <span className="text-lg md:text-xl font-bold text-[#2E0A16]">
                {language == "en" ? "Total" : "Gesamtbetrag"}
              </span>
              <span className="text-lg md:text-xl font-bold">
                {total.toFixed(2).toString().replace(".", ",")}€
              </span>
            </div>

            <button
              onClick={() => navigate(`/review?cid=${cartData._id}&cpn=`)}
              className="w-full bg-[#2E0A16] text-white py-3 rounded-lg mt-6 font-semibold text-sm md:text-base hover:bg-[#4a1627] transition-colors"
            >
              {language == "en" ? "Proceed to Checkout" : "Zur Kasse gehen"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
