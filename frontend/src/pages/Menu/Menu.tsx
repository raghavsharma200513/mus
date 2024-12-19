import { useContext, useEffect, useState } from "react";
import FoodCard from "./FoodCard";
import { assets } from "@/assets/assets";
import LanguageContext from "@/context/LanguageContext";
import { Search } from "lucide-react";

// Type definitions remain the same...
export interface CategoryType {
  _id: string;
  name: string;
  image: string;
}

export interface CategoryWithItems extends CategoryType {
  items: FoodItem[];
}

export interface FoodItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  category: string;
  addOns?: { _id: string; name: string; price: string }[];
  variants?: { _id: string; name: string; price: string }[];
}

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  category: string;
  addOns?: { _id: string; name: string; price: number }[];
  variants?: { _id: string; name: string; price: number }[];
}

// Existing asset and position functions remain the same...
const leftDecorAssets = [assets.leaf2, assets.leaf3];
const rightDecorAssets = [assets.capsicum, assets.leaf4, assets.leaf5];

const getRandomAssets = () => {
  const leftAsset =
    leftDecorAssets[Math.floor(Math.random() * leftDecorAssets.length)];
  const rightAsset =
    rightDecorAssets[Math.floor(Math.random() * rightDecorAssets.length)];
  return [leftAsset, rightAsset];
};

const getRandomPositionClasses = (isLeft: boolean) => {
  const positions = [
    "top-[-70px]",
    "top-0",
    "bottom-0",
    "top-[-120px]",
    "top-[-50px]",
    "bottom-[-50px]",
  ];
  return {
    position: positions[Math.floor(Math.random() * positions.length)],
    side: isLeft ? "left-0" : "right-0",
  };
};

const convertMenuItemToFoodItem = (menuItem: MenuItem): FoodItem => {
  return {
    ...menuItem,
    addOns: menuItem.addOns?.map((addon) => ({
      ...addon,
      price: addon.price.toString(),
    })),
    variants: menuItem.variants?.map((variant) => ({
      _id: variant._id,
      name: variant.name,
      price: variant.price.toString(),
    })),
  };
};

function Menu(): JSX.Element {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/api/menu"
        );
        const data = await response.json();
        setMenuItems(data.menuItems || []);
        setCategories([...(data.category || [])]);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    fetchMenuData();
  }, []);

  const getCategoryName = (categoryId: string): string => {
    return categories.find((cat) => cat._id === categoryId)?.name || "";
  };

  // Filter items based on search query
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedMenuItems: CategoryWithItems[] = categories
    .map((category) => ({
      ...category,
      items: filteredMenuItems
        .filter((item) => item.category === category._id)
        .map(convertMenuItemToFoodItem),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <main>
      <div className="page-title">
        <h1>{language == "en" ? "Menu" : "Speisekarte"}</h1>
        <h2>{language == "en" ? "HOME / MENU" : "STARTSEITE / SPEISEKARTE"}</h2>
      </div>

      <div className="content min-h-[calc(80vh)] flex-col text-[#554939] gap-6 text-lg font-jost font-medium flex items-center justify-center">
        {/* Search Bar */}
        <div className="w-full max-w-[85%] md:max-w-[70%] mt-8 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={
                language === "en"
                  ? "Search menu items..."
                  : "In der Speisekarte suchen..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-full border-2 border-[#F8C995] focus:border-[#2E0A16] focus:outline-none bg-white/90 backdrop-blur-sm"
            />
            <Search
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#554939]"
              size={20}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="relative my-6 max-w-[85%] md:max-w-[70%]">
          <div className="flex overflow-x-auto gap-4 thin-scrollbar">
            <button
              className={`min-w-fit px-4 py-2 rounded-full cursor-pointer ${
                selectedCategory === "All"
                  ? "border-2 border-[#2E0A16] bg-[#F8C995]"
                  : "bg-[#F8C995] hover:bg-[#eab76e]"
              }`}
              onClick={() => setSelectedCategory("All")}
            >
              <h3 className="text-[#554539] text-center whitespace-nowrap">
                All
              </h3>
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                className={`min-w-fit px-4 py-2 rounded-full cursor-pointer ${
                  selectedCategory === category._id
                    ? "border-2 border-[#2E0A16] bg-[#F8C995]"
                    : "bg-[#F8C995] hover:bg-[#eab76e]"
                }`}
                onClick={() => setSelectedCategory(category._id)}
              >
                <h3 className="text-[#554539] text-center whitespace-nowrap">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {selectedCategory === "All" ? (
          // Show all filtered items grouped by category
          groupedMenuItems.length > 0 ? (
            groupedMenuItems.map((category) => (
              <section
                key={category._id}
                className="relative flex w-full flex-col items-center justify-center gap-10 mb-16"
              >
                {/* Decorative images and rest of the rendering logic remains the same */}
                {(() => {
                  const [leftAsset, rightAsset] = getRandomAssets();
                  const leftPosition = getRandomPositionClasses(true);
                  const rightPosition = getRandomPositionClasses(false);

                  return (
                    <>
                      <img
                        src={leftAsset}
                        alt=""
                        className={`decor1 absolute ${leftPosition.position} ${leftPosition.side} z-[-1] w-[13vw] max-w-96`}
                      />
                      <img
                        src={rightAsset}
                        alt=""
                        className={`decor1 absolute ${rightPosition.position} ${rightPosition.side} z-[-1] w-[13vw] max-w-96`}
                      />
                    </>
                  );
                })()}

                <div className="flex gap-[10rem] flex-col">
                  <div className="flex gap-6 flex-col items-center justify-center">
                    <h2 className="text-[#2e0a16] text-5xl font-bold">
                      {category.name}
                    </h2>
                    <img
                      src={assets.galBottom}
                      alt="category divider"
                      className="w-[15rem]"
                    />
                  </div>

                  <div className="flex justify-center gap-10 flex-wrap">
                    {category.items.map((item) => (
                      <FoodCard
                        key={item._id}
                        data={item}
                        category={{
                          _id: category._id,
                          name: category.name,
                          image: category.image,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-[#554939]">
                {language === "en"
                  ? "No menu items found"
                  : "Keine Menüpunkte gefunden"}
              </p>
            </div>
          )
        ) : (
          // Show filtered items for selected category
          <section className="relative flex w-full flex-col items-center justify-center gap-10 mb-16">
            {(() => {
              const [leftAsset, rightAsset] = getRandomAssets();
              const leftPosition = getRandomPositionClasses(true);
              const rightPosition = getRandomPositionClasses(false);

              return (
                <>
                  <img
                    src={leftAsset}
                    alt=""
                    className={`decor1 absolute ${leftPosition.position} ${leftPosition.side} z-[-1] w-[13vw] max-w-96`}
                  />
                  <img
                    src={rightAsset}
                    alt=""
                    className={`decor1 absolute ${rightPosition.position} ${rightPosition.side} z-[-1] w-[13vw] max-w-96`}
                  />
                </>
              );
            })()}

            <div className="flex gap-[10rem] flex-col">
              <div className="flex gap-6 flex-col items-center justify-center">
                <h2 className="text-[#2e0a16] text-5xl font-bold">
                  {getCategoryName(selectedCategory)}
                </h2>
                <img
                  src={assets.galBottom}
                  alt="category divider"
                  className="w-[15rem]"
                />
              </div>

              <div className="flex justify-center gap-10 flex-wrap">
                {filteredMenuItems
                  .filter((item) => item.category === selectedCategory)
                  .map((item) => (
                    <FoodCard
                      key={item._id}
                      data={convertMenuItemToFoodItem(item)}
                      category={
                        categories.find((cat) => cat._id === item.category)!
                      }
                    />
                  ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Menu;
