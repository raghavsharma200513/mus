import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Trash2 } from "lucide-react";

interface AddOn {
  name: string;
  price: string;
}

interface Variant {
  name: string;
  price: string;
}

interface Category {
  _id: string;
  name: string;
}

interface MenuItem {
  _id: string;
  name: string;
  image: File | null | string;
  actualPrice: string;
  discountedPrice?: string;
  desc?: string;
  category: string;
  addOns: AddOn[];
  variants: Variant[];
}

interface MenuData {
  name: string;
  actualPrice: string;
  discountedPrice: string;
  desc: string;
  category: string;
  image: File | null | string;
  addOns: AddOn[];
  variants: Variant[];
}

interface ActionColumnProps {
  item: MenuItem;
}

const MenuItemManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [menuData, setMenuData] = useState<MenuData>({
    name: "",
    actualPrice: "",
    discountedPrice: "",
    desc: "",
    category: "",
    image: null,
    addOns: [],
    variants: [{ name: "", price: "" }],
  });

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actualPrice.toString().includes(searchQuery) ||
      item.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.variants &&
        item.variants.some((variant) =>
          variant.name.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
      (item.addOns &&
        item.addOns.some((addon) =>
          addon.name.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesCategory =
      searchCategory === "all" || item.category === searchCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get<{
        menuItems: MenuItem[];
        category: Category[];
      }>(`${import.meta.env.VITE_BACKEND_URL}/api/menu/`);
      setMenuItems(response.data.menuItems);
      setCategories(response.data.category);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const files = fileInput.files;

      if (files && files[0]) {
        setMenuData((prev) => ({
          ...prev,
          [name]: files[0],
        }));

        // Create preview URL for the new image
        const previewUrl = URL.createObjectURL(files[0]);
        setImagePreview(previewUrl);
      }
    } else {
      setMenuData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddOnChange = (
    index: number,
    field: keyof AddOn,
    value: string
  ) => {
    const newAddOns = [...menuData.addOns];
    newAddOns[index][field] = value;
    setMenuData((prev) => ({ ...prev, addOns: newAddOns }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string
  ) => {
    const newVariants = [...menuData.variants];
    newVariants[index][field] = value;
    setMenuData((prev) => ({ ...prev, variants: newVariants }));
  };

  const removeAddOn = (index: number) => {
    setMenuData((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index),
    }));
  };

  const removeVariant = (index: number) => {
    setMenuData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const addAddOnField = () => {
    setMenuData((prev) => ({
      ...prev,
      addOns: [...prev.addOns, { name: "", price: "" }],
    }));
  };

  const addVariantField = () => {
    setMenuData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", price: "" }],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (menuData.variants.length === 0) {
      alert("Please add at least one variant");
      return;
    }

    // Validation for empty variants
    const hasEmptyVariant = menuData.variants.some(
      (variant) => !variant.name || !variant.price
    );
    if (hasEmptyVariant) {
      alert("All variants must have both name and price");
      return;
    }

    // Validation for empty add-ons
    const hasEmptyAddOn = menuData.addOns.some(
      (addon) => !addon.name || !addon.price
    );
    if (hasEmptyAddOn) {
      alert("All add-ons must have both name and price");
      return;
    }
    const formData = new FormData();

    // Handle image separately
    if (menuData.image instanceof File) {
      formData.append("image", menuData.image);
    }

    // Append other data
    (Object.keys(menuData) as Array<keyof MenuData>).forEach((key) => {
      if (key === "addOns" || key === "variants") {
        formData.append(key, JSON.stringify(menuData[key]));
      } else if (key !== "image") {
        // Skip image as it's handled above
        formData.append(key, menuData[key] as string);
      }
    });

    try {
      const url = editingItem
        ? `${import.meta.env.VITE_BACKEND_URL}/api/menu/${editingItem._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/menu/`;

      const method = editingItem ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error("Failed to save menu item:", error);
    }
  };

  const resetForm = () => {
    setMenuData({
      name: "",
      actualPrice: "",
      discountedPrice: "",
      desc: "",
      category: "",
      image: null,
      addOns: [],
      variants: [{ name: "", price: "" }],
    });
    setEditingItem(null);
    setImagePreview(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setMenuData({
      name: item.name,
      actualPrice: item.actualPrice,
      discountedPrice: item.discountedPrice || "",
      desc: item.desc || "",
      category: item.category,
      image: null, // Reset image to null since we'll use existing image if no new one is uploaded
      addOns: item.addOns.length > 0 ? item.addOns : [],
      variants:
        item.variants.length > 0 ? item.variants : [{ name: "", price: "" }],
    });

    // Set image preview if item has an image
    if (typeof item.image === "string") {
      setImagePreview(`${import.meta.env.VITE_BACKEND_URL}${item.image}`);
    } else {
      setImagePreview(null);
    }
  };
  const handleDelete = async (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/menu/${itemId}`
        );
        fetchMenuItems();
        resetForm();
      } catch (error) {
        console.error("Failed to delete menu item:", error);
      }
    }
  };
  const ImageSection = () => {
    console.log(1, `${import.meta.env.VITE_BACKEND_URL}${editingItem?.image}`);
    console.log(2, imagePreview);

    return (
      <div className="space-y-2">
        <input
          type="file"
          name="image"
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-md"
          accept="image/*"
        />
        {(imagePreview || (editingItem && editingItem.image)) && (
          <div className="relative w-32 h-32">
            <img
              src={
                imagePreview ||
                `${import.meta.env.VITE_BACKEND_URL}${editingItem?.image}`
              }
              alt="Preview"
              className="w-full h-full object-cover rounded-md"
            />
            {/* <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setMenuData((prev) => ({ ...prev, image: null }));
              }}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              <X size={16} />
            </button> */}
          </div>
        )}
      </div>
    );
  };
  const ActionsColumn: React.FC<ActionColumnProps> = ({ item }) => (
    <td className="px-4 py-2 space-x-2">
      <button
        onClick={() => handleEdit(item)}
        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(item._id)}
        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
      >
        <Trash2 size={16} />
      </button>
    </td>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <span className="font-medium">Success!</span> Menu item saved
          successfully.
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingItem ? "Edit Menu Item" : "Add Menu Item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={menuData.name}
            onChange={handleInputChange}
            placeholder="Item Name"
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          <select
            name="category"
            value={menuData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="actualPrice"
              type="number"
              value={menuData.actualPrice}
              onChange={handleInputChange}
              placeholder="Actual Price"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <input
              name="discountedPrice"
              type="number"
              value={menuData.discountedPrice}
              onChange={handleInputChange}
              placeholder="Discounted Price"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* <input
            type="file"
            name="image"
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            accept="image/*"
          /> */}
          <ImageSection />

          <textarea
            name="description" // Change this to "desc"
            value={menuData.desc}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />

          <div className="space-y-2">
            <h3 className="font-semibold">Add-ons</h3>
            {menuData.addOns.map((addon, index) => (
              <div key={index} className="flex gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <input
                    value={addon.name}
                    onChange={(e) =>
                      handleAddOnChange(index, "name", e.target.value)
                    }
                    placeholder="Add-on Name"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    value={addon.price}
                    onChange={(e) =>
                      handleAddOnChange(index, "price", e.target.value)
                    }
                    placeholder="Price"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAddOn(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAddOnField}
              className="text-blue-500 hover:text-blue-600"
            >
              + Add More
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Variants</h3>
            {menuData.variants.map((variant, index) => (
              <div key={index} className="flex gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <input
                    value={variant.name}
                    onChange={(e) =>
                      handleVariantChange(index, "name", e.target.value)
                    }
                    placeholder="Variant Name"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantChange(index, "price", e.target.value)
                    }
                    placeholder="Price"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariantField}
              className="text-blue-500 hover:text-blue-600"
            >
              + Add More
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            {editingItem ? "Update Item" : "Add Item"}
          </button>

          {editingItem && (
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

      {/* <div className="bg-white shadow-md rounded-lg p-6"> */}
      <div className="bg-white shadow-md rounded-lg p-6 h-[calc(100vh-2rem)] sticky top-4 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Menu Items</h2>
        {/* <SearchSection /> */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Index</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenuItems.map((item, index) => (
                <tr key={item._id} className="border-b">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">
                    {categories.find((c) => c._id === item.category)?.name}
                  </td>
                  <td className="px-4 py-2">
                    {item.discountedPrice ? (
                      <span>
                        <span className="line-through text-gray-500">
                          ${item.actualPrice.toString().replace(".", ",")}
                        </span>{" "}
                        ${item.discountedPrice.toString().replace(".", ",")}
                      </span>
                    ) : (
                      `$${item.actualPrice.toString().replace(".", ",")}`
                    )}
                  </td>
                  {/* <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                  </td> */}
                  <ActionsColumn item={item} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuItemManagement;
