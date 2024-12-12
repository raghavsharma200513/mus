import React, { useState, useEffect } from "react";
import axios from "axios";

// Define interface for Category
interface Category {
  _id: string;
  name: string;
  image?: string;
}

// Define interface for Category Data
interface CategoryData {
  name: string;
  image: File | null;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData>({
    name: "",
    image: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    setCategoryData((prev) => ({
      ...prev,
      [name]: type === "file" ? (files ? files[0] : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    // Append all fields
    Object.keys(categoryData).forEach((key) => {
      const typedKey = key as keyof CategoryData;
      if (typedKey === "image" && categoryData[typedKey]) {
        formData.append("image", categoryData[typedKey] as File);
      } else {
        formData.append(key, categoryData[typedKey] as string);
      }
    });

    try {
      const url = editingCategory
        ? `${import.meta.env.VITE_BACKEND_URL}/api/category/${
            editingCategory._id
          }`
        : `${import.meta.env.VITE_BACKEND_URL}/api/category/`;

      const method = editingCategory ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const resetForm = () => {
    setCategoryData({
      name: "",
      image: null,
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryData({
      name: category.name,
      image: null, // Reset image input when editing
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingCategory ? "Edit Category" : "Add Category"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={categoryData.name}
            onChange={handleInputChange}
            placeholder="Category Name"
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          <input
            type="file"
            name="image"
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            accept="image/*"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            {editingCategory ? "Update Category" : "Add Category"}
          </button>

          {editingCategory && (
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
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-b">
                  <td className="px-4 py-2">{category.name}</td>
                  <td className="px-4 py-2">
                    {category.image && (
                      <img
                        src={import.meta.env.VITE_BACKEND_URL + category.image}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(category)}
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

export default CategoryManagement;
