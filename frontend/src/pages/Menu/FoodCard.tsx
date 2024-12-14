import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { assets } from "@/assets/assets";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface FoodItem {
  _id: string;
  image?: string;
  name: string;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  type?: string;
  variants?: { name: string; price: string }[];
  addOns?: { name: string; price: string }[];
}

interface CategoryType {
  _id: string;
  name: string;
  image?: string;
}

interface MyComponentProps {
  data: FoodItem;
  category: CategoryType;
}

const FoodCard: React.FC<MyComponentProps> = ({ data, category }) => {
  const imageUrl = data.image
    ? `${import.meta.env.VITE_BACKEND_URL}${data.image}`
    : category.image
    ? `${import.meta.env.VITE_BACKEND_URL}${category.image}`
    : assets.menu5;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [crowd, setCrowd] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showGoToCart, setShowGoToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [ingredientsCount, setIngredientsCount] = useState<number[]>(
    data?.addOns?.map(() => 1) || []
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [dispatch]);

  const handleIncrement = (index: number) => {
    setIngredientsCount((prev) =>
      prev.map((count, i) => (i === index ? count + 1 : count))
    );
  };

  const handleDecrement = (index: number) => {
    setIngredientsCount((prev) =>
      prev.map((count, i) => (i === index && count > 0 ? count - 1 : count))
    );
  };

  const handleAddToCart = async () => {
    if (!selectedStyle) {
      alert("Please select a style/variant");
      return;
    }
    // let a = "a";
    // console.log(a.toString().replace(".", ","));

    setIsLoading(true);

    const addOns = data.addOns
      ?.map((item, index) => ({
        name: item.name,
        quantity: ingredientsCount[index],
      }))
      .filter((item) => item.quantity > 0);

    const payload = {
      menuItemId: data._id,
      quantity: crowd,
      variantName: selectedStyle,
      addOns: addOns || [],
      message: message,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setShowGoToCart(true);

      setTimeout(() => {
        setShowGoToCart(false);
      }, 5000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCartNavigation = () => {
    setModalOpen(false);
    navigate("/cart");
  };

  return (
    <div className="bg-[#2E0A16] text-white rounded-t-[60px] rounded-b-lg shadow-lg w-80 mb-36 sm:w-96">
      <div className="relative w-full h-[200px] flex justify-center px-">
        <img
          src={imageUrl}
          alt={data.name}
          className="w-[280px] h-[280px] rounded-full object-cover absolute top-[-130px] border-8 border-white"
        />
      </div>
      <div className="p-4 pb-8 text-center flex flex-col items-center">
        <h3 className="font-bold text-[22px] mb-2">{data.name}</h3>
        <p className="text-sm text-gray-300 mb-4 font-normal px-10">
          {data.description}
        </p>

        <div
          onClick={
            isLoggedIn ? () => setModalOpen(true) : () => navigate("/login")
          }
          className="cursor-pointer flex bg-[#C9A07B] justify-center items-center gap-2 rounded-md w-[35%] py-3"
        >
          <span className="text-[16px] font-normal">
            €
            {data.discountedPrice === data.actualPrice
              ? data.actualPrice.toString().replace(".", ",")
              : data.discountedPrice.toString().replace(".", ",")}
          </span>

          {data.discountedPrice !== data.actualPrice && (
            <span className="text-[#E4CFBD] line-through text-[11px] font-normal">
              €{data.actualPrice.toString().replace(".", ",")}
            </span>
          )}
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-4 md:p-7 w-full">
          <div className="flex justify-between items-start mb-16 md:mb-20">
            <div className="w-4" />
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <h2 className="text-[#2e0a16] text-2xl md:text-3xl font-bold text-center">
                Choose ingredients
              </h2>
              <img
                src={assets.galBottom}
                alt="divider"
                className="w-32 md:w-52"
              />
            </div>
            <button
              className="w-4 md:w-5 h-4 md:h-5"
              onClick={() => setModalOpen(false)}
              disabled={isLoading}
            >
              <img
                src={assets.crossIcon}
                alt="close"
                className="w-full h-full"
              />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="bg-[#2E0A16] text-white rounded-t-[60px] rounded-b-lg shadow-lg w-full lg:w-96">
              <div className="relative w-full h-[200px] flex justify-center">
                <img
                  src={imageUrl}
                  alt={data.name}
                  className="w-[200px] md:w-[280px] h-[200px] md:h-[280px] rounded-full object-cover absolute top-[-100px] md:top-[-130px] border-8 border-white"
                />
              </div>
              <div className="p-4 pb-8 text-center flex flex-col items-center mt-8 md:mt-0">
                <h3 className="font-bold text-xl md:text-[22px] mb-2">
                  {data.name}
                </h3>
                <p className="text-sm text-gray-300 mb-4 font-normal px-4 md:px-10">
                  {data.description}
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 bg-[#F9F9F9] rounded flex flex-col w-full lg:w-[600px] gap-5 md:gap-7">
              <div className="flex flex-col gap-2">
                <label className="text-[#2E0A16] font-bold text-lg">
                  Choose Style
                </label>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  {data?.variants?.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="radio"
                        name="style"
                        id={`style-${index}`}
                        className="w-5 h-5 accent-[#2E0A16] cursor-pointer"
                        onChange={() => setSelectedStyle(item.name)}
                      />
                      <label
                        htmlFor={`style-${index}`}
                        className="text-[#2E0A16] text-base md:text-lg cursor-pointer"
                      >
                        {item.name} - €{item.price.toString().replace(".", ",")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[#2E0A16] font-bold text-lg flex flex-col gap-2">
                <label className="block">AddOns</label>
                <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                  {data?.addOns?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center rounded-md p-2 bg-white shadow-sm w-full md:w-[250px]"
                    >
                      <p className="font-medium text-[#2E0A16]">
                        {item.name} - €{item.price.toString().replace(".", ",")}
                      </p>
                      <div className="flex items-center gap-3 md:gap-4">
                        <button
                          className="bg-[#EA6A12] text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex justify-center items-center text-xl shadow-md hover:bg-[#d1590c] transition"
                          aria-label="Decrease"
                          onClick={() => handleDecrement(index)}
                        >
                          -
                        </button>
                        <p className="text-base font-semibold text-[#2E0A16] min-w-[20px] text-center">
                          {ingredientsCount[index]}
                        </p>
                        <button
                          className="bg-[#EA6A12] text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex justify-center items-center text-xl shadow-md hover:bg-[#d1590c] transition"
                          aria-label="Increase"
                          onClick={() => handleIncrement(index)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[#2E0A16] text-lg flex flex-col gap-2">
                <label className="block">Your message</label>
                <textarea
                  placeholder="Here you can enter a comment on the article."
                  className="w-full p-3 border rounded-md resize-none"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center rounded-md p-2 bg-white shadow-sm">
                <p className="font-medium text-[#2E0A16]">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    className="bg-[#EA6A12] text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex justify-center items-center text-xl shadow-md hover:bg-[#d1590c] transition"
                    aria-label="Decrease"
                    onClick={() =>
                      setCrowd((prev) => (prev > 0 ? prev - 1 : 0))
                    }
                  >
                    -
                  </button>
                  <p className="text-base font-semibold text-[#2E0A16] min-w-[20px] text-center">
                    {crowd}
                  </p>
                  <button
                    className="bg-[#EA6A12] text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex justify-center items-center text-xl shadow-md hover:bg-[#d1590c] transition"
                    aria-label="Increase"
                    onClick={() => setCrowd((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-orange-50 rounded flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-orange-500 font-bold">
                  €
                  {(
                    ((Number(
                      data?.variants?.find((v) => v.name === selectedStyle)
                        ?.price
                    ) || 0) +
                      (data?.addOns?.reduce(
                        (total, item, index) =>
                          total + Number(item.price) * ingredientsCount[index],
                        0
                      ) || 0)) *
                    crowd
                  )
                    .toFixed(2)
                    .toString()
                    .replace(".", ",")}
                </span>
              </div>

              <div className="flex justify-center items-center">
                <button
                  onClick={
                    showGoToCart ? handleCartNavigation : handleAddToCart
                  }
                  disabled={isLoading}
                  className={`w-full md:w-auto px-8 md:px-11 py-3 text-white rounded-sm transition ${
                    showGoToCart
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-[#2E0A16] hover:bg-[#4a1126]"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isLoading
                    ? "Adding to Cart..."
                    : showGoToCart
                    ? "Go to Cart"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FoodCard;
