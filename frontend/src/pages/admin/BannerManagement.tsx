import React, { useState, useEffect } from "react";
import axios from "axios";

// Define interface for Banner Entry
interface BannerEntry {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isEnabled: boolean;
}

// Define interface for Banner Data
interface BannerData {
  title: string;
  description: string;
  image: File | null;
  isEnabled: boolean;
}

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<BannerEntry[]>([]);
  const [editingBanner, setEditingBanner] = useState<BannerEntry | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [bannerData, setBannerData] = useState<BannerData>({
    title: "",
    description: "",
    image: null,
    isEnabled: false,
  });
  console.log(import.meta.env.VITE_BACKEND_URL + previewImage);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get<{ data: BannerEntry[] }>(
        import.meta.env.VITE_BACKEND_URL + "/api/banner"
      );
      setBanners(response.data.data);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setBannerData((prev) => ({
        ...prev,
        isEnabled: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setBannerData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    setBannerData((prev) => ({
      ...prev,
      image: file,
    }));

    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", bannerData.title);
    formData.append("description", bannerData.description);
    formData.append("isEnabled", String(bannerData.isEnabled));

    if (bannerData.image) {
      formData.append("image", bannerData.image);
    }

    try {
      const url = editingBanner
        ? import.meta.env.VITE_BACKEND_URL + `/api/banner/${editingBanner._id}`
        : import.meta.env.VITE_BACKEND_URL + "/api/banner";

      const method = editingBanner ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchBanners();
      resetForm();
    } catch (error) {
      console.error("Failed to save banner:", error);
    }
  };

  const resetForm = () => {
    setBannerData({
      title: "",
      description: "",
      image: null,
      isEnabled: false,
    });
    setEditingBanner(null);
    setPreviewImage(null);
  };

  const handleEdit = (banner: BannerEntry) => {
    setEditingBanner(banner);
    setBannerData({
      title: banner.title,
      description: banner.description || "",
      image: null,
      isEnabled: banner.isEnabled,
    });
    // Set preview to existing image if available
    setPreviewImage(
      banner.imageUrl
        ? import.meta.env.VITE_BACKEND_URL + banner.imageUrl
        : null
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      await axios.delete(
        import.meta.env.VITE_BACKEND_URL + `/api/banner/${id}`
      );
      fetchBanners();
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingBanner ? "Edit Banner" : "Add Banner"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={bannerData.title}
            onChange={handleInputChange}
            placeholder="Banner Title"
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          <textarea
            name="description"
            value={bannerData.description}
            onChange={handleInputChange}
            placeholder="Banner Description"
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isEnabled"
              checked={bannerData.isEnabled}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label>Enable Banner</label>
          </div>

          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded-md"
            accept="image/*"
          />

          {previewImage && (
            <div className="mt-4">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            {editingBanner ? "Update Banner" : "Add Banner"}
          </button>

          {editingBanner && (
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
        <h2 className="text-2xl font-semibold mb-4">Banners</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Enabled</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner._id} className="border-b">
                  <td className="px-4 py-2">{banner.title}</td>
                  <td className="px-4 py-2">
                    {banner.imageUrl && (
                      <img
                        src={import.meta.env.VITE_BACKEND_URL + banner.imageUrl}
                        alt={`Banner ${banner.title}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {banner.isEnabled ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                    >
                      Delete
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

export default BannerManagement;
